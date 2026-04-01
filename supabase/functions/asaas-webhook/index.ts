import { createClient } from 'npm:@supabase/supabase-js'

const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN')!
const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') ?? 'https://api-sandbox.asaas.com/v3'
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  // XOR todos os bytes — não retorna cedo (timing-safe)
  let diff = 0
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i]
  }
  return diff === 0
}

function isValidAsaasId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 100
}

async function asaasGet(path: string) {
  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    headers: { 'access_token': ASAAS_API_KEY },
  })
  if (!res.ok) throw new Error(`Asaas GET ${path} → ${res.status}`)
  return res.json()
}

// Map subscription description to plan key
function getPlanFromDescription(description: string): string {
  const d = description.toLowerCase()
  if (d.includes('pro')) return 'pro'
  if (d.includes('growth')) return 'growth'
  if (d.includes('starter')) return 'starter'
  return 'starter'
}

Deno.serve(async (req) => {
  try {
    // Validate Asaas webhook token (timing-safe comparison)
    const token = req.headers.get('asaas-access-token') ?? ''
    const isValid = await timingSafeEqual(token, ASAAS_WEBHOOK_TOKEN)
    if (!isValid) {
      console.warn('Webhook unauthorized attempt — invalid token')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const event = await req.json()

    // Validate minimum event structure
    if (!event || typeof event.event !== 'string') {
      console.warn('Webhook: invalid event structure received')
      return new Response(JSON.stringify({ error: 'Invalid event structure' }), { status: 400 })
    }

    const paymentId = event.payment?.id ?? null
    const subscriptionId = event.subscription?.id ?? (typeof event.subscription === 'string' ? event.subscription : null)
    const stableId = paymentId ?? subscriptionId

    const eventId = stableId
      ? `${event.event}_${stableId}`
      : null

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Idempotency — only deduplicate events with a stable ID
    if (eventId) {
      const { error: dupErr } = await supabase
        .from('processed_asaas_events')
        .insert({ id: eventId })
      if (dupErr?.code === '23505') {
        return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 })
      }
    }

    // -----------------------------------------------------------------------
    // PAYMENT_CONFIRMED / PAYMENT_RECEIVED — activate plan
    // -----------------------------------------------------------------------
    if (event.event === 'PAYMENT_CONFIRMED' || event.event === 'PAYMENT_RECEIVED') {
      const payment = event.payment
      if (!isValidAsaasId(payment?.subscription)) {
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }

      // Fetch subscription details to get customer + description
      const subscription = await asaasGet(`/subscriptions/${payment.subscription}`)
      if (!isValidAsaasId(subscription?.customer)) {
        console.warn('Webhook PAYMENT_CONFIRMED: invalid customer ID in subscription response')
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }
      const customerId: string = subscription.customer

      const { data: profile } = await supabase
        .from('users')
        .select('id, plan')
        .eq('asaas_customer_id', customerId)
        .single()

      if (profile) {
        const plan = getPlanFromDescription(subscription.description ?? '')
        const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, growth: 2, pro: 3 }

        const nextMonth = new Date()
        nextMonth.setDate(1)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        nextMonth.setHours(0, 0, 0, 0)

        const isUpgrade = (PLAN_RANK[plan] ?? 0) > (PLAN_RANK[profile.plan] ?? 0)

        await supabase.from('users').update({
          plan,
          asaas_subscription_id: subscription.id,
          payment_status: 'active',
          cancel_at_period_end: false,
          ...(isUpgrade ? { generation_count: 0, generation_reset_at: nextMonth.toISOString() } : {}),
        }).eq('id', profile.id)
      }
    }

    // -----------------------------------------------------------------------
    // PAYMENT_OVERDUE — mark as past_due + send email
    // -----------------------------------------------------------------------
    if (event.event === 'PAYMENT_OVERDUE') {
      const payment = event.payment
      if (!isValidAsaasId(payment?.subscription)) {
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }

      const subscription = await asaasGet(`/subscriptions/${payment.subscription}`)
      if (!isValidAsaasId(subscription?.customer)) {
        console.warn('Webhook PAYMENT_OVERDUE: invalid customer ID in subscription response')
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }
      const customerId: string = subscription.customer

      const { data: profile } = await supabase
        .from('users')
        .select('id, email')
        .eq('asaas_customer_id', customerId)
        .single()

      if (profile) {
        await supabase.from('users').update({
          payment_status: 'past_due',
        }).eq('id', profile.id)

        const resendKey = Deno.env.get('RESEND_API_KEY')
        const siteUrl = Deno.env.get('SITE_URL') ?? 'https://flowcontent.com.br'
        if (resendKey && profile.email) {
          const html = `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e23">
              <div style="background:#3d6b52;padding:24px 32px;border-radius:12px 12px 0 0">
                <p style="color:#fff;font-size:18px;font-weight:600;margin:0">Problema com seu pagamento</p>
              </div>
              <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
                <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Olá! Sua cobrança do ContentFlow está em atraso.</p>
                <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Para evitar a suspensão do serviço, efetue o pagamento pelo link que foi enviado para o seu e-mail pela Asaas.</p>
                <a href="${siteUrl}/app" style="display:inline-block;background:#3d6b52;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">Acessar ContentFlow</a>
                <p style="font-size:12px;color:#94a3b8;margin:32px 0 0">ContentFlow &bull; <a href="${siteUrl}/contato" style="color:#94a3b8">Fale conosco</a></p>
              </div>
            </div>
          `
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'ContentFlow <contato@flowcontent.com.br>',
              to: [profile.email],
              subject: 'Pagamento em atraso — ContentFlow',
              html,
            }),
          }).catch(e => console.error('overdue email error:', e))
        }
      }
    }

    // -----------------------------------------------------------------------
    // SUBSCRIPTION_INACTIVATED — cancel plan
    // -----------------------------------------------------------------------
    if (event.event === 'SUBSCRIPTION_INACTIVATED') {
      const rawSubscriptionId = event.subscription?.id ?? event.subscription
      if (!isValidAsaasId(rawSubscriptionId)) {
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }
      const subscriptionId: string = rawSubscriptionId

      const subscription = await asaasGet(`/subscriptions/${subscriptionId}`)
      if (!isValidAsaasId(subscription?.customer)) {
        console.warn('Webhook SUBSCRIPTION_INACTIVATED: invalid customer ID in subscription response')
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }
      const customerId: string = subscription.customer

      const { data: profile } = await supabase
        .from('users')
        .select('id, email, cancel_at_period_end, cancel_email_sent_at')
        .eq('asaas_customer_id', customerId)
        .single()

      if (profile) {
        await supabase.from('users').update({
          plan: 'free',
          asaas_subscription_id: null,
          payment_status: 'canceled',
          cancel_at_period_end: false,
          current_period_end: null,
        }).eq('id', profile.id)

        // Send cancel confirmation email if not sent yet
        const resendKey = Deno.env.get('RESEND_API_KEY')
        const siteUrl = Deno.env.get('SITE_URL') ?? 'https://flowcontent.com.br'
        if (resendKey && profile.email && !profile.cancel_email_sent_at) {
          const html = `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e23">
              <div style="background:#3d6b52;padding:24px 32px;border-radius:12px 12px 0 0">
                <p style="color:#fff;font-size:18px;font-weight:600;margin:0">Cancelamento confirmado</p>
              </div>
              <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
                <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Seu plano foi cancelado com sucesso. Sua conta foi convertida para o plano gratuito.</p>
                <p style="font-size:15px;line-height:1.7;margin:0 0 4px">Se mudar de ideia, você pode reativar a qualquer momento:</p>
                <a href="${siteUrl}/app" style="display:inline-block;background:#3d6b52;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;margin-top:20px">Reativar assinatura</a>
                <p style="font-size:12px;color:#94a3b8;margin:32px 0 0">ContentFlow &bull; <a href="${siteUrl}/contato" style="color:#94a3b8">Fale conosco</a></p>
              </div>
            </div>
          `
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'ContentFlow <contato@flowcontent.com.br>',
              to: [profile.email],
              subject: 'Cancelamento confirmado — ContentFlow',
              html,
            }),
          }).catch(e => console.error('cancel email error:', e))
          await supabase.from('users').update({ cancel_email_sent_at: new Date().toISOString() }).eq('id', profile.id)
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error('asaas-webhook error:', error)
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), { status: 500 })
  }
})
