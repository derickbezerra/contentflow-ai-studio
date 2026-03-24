import Stripe from 'npm:stripe'
import { createClient } from 'npm:@supabase/supabase-js'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Map Stripe price IDs to plan names
function getPlanFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    [Deno.env.get('STRIPE_STARTER_PRICE_ID') ?? '']: 'starter',
    [Deno.env.get('STRIPE_GROWTH_PRICE_ID') ?? '']: 'growth',
    [Deno.env.get('STRIPE_PRO_PRICE_ID') ?? '']: 'pro',
  }
  return map[priceId] ?? 'starter'
}

Deno.serve(async (req) => {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
    } catch (err) {
      return new Response(`Webhook Error: ${err}`, { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Idempotency — Stripe can retry webhooks; ignore already-processed events
    const { error: dupErr } = await supabase
      .from('processed_stripe_events')
      .insert({ id: event.id })
    if (dupErr?.code === '23505') {
      // Duplicate key → event already handled
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 })
    }

    // Payment completed → activate correct plan
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.CheckoutSession
      const userId = session.metadata?.user_id
      const subscriptionId = session.subscription as string

      if (userId && subscriptionId) {
        // Fetch subscription to get price ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id ?? ''
        const plan = getPlanFromPriceId(priceId)

        const nextMonth = new Date()
        nextMonth.setDate(1)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        nextMonth.setHours(0, 0, 0, 0)

        await supabase.from('users').update({
          plan,
          stripe_subscription_id: subscriptionId,
          payment_status: 'active',
          generation_count: 0,
          generation_reset_at: nextMonth.toISOString(),
          cancel_at_period_end: false,
        }).eq('id', userId)
      }
    }

    // Subscription updated or canceled
    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const isDeleted = event.type === 'customer.subscription.deleted'
      const isActive = subscription.status === 'active' || subscription.status === 'trialing'
      const isPastDue = subscription.status === 'past_due' || subscription.status === 'unpaid'
      const priceId = subscription.items.data[0]?.price.id ?? ''
      const cancelAtPeriodEnd = subscription.cancel_at_period_end
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

      const { data: profile } = await supabase
        .from('users')
        .select('id, email, plan, cancel_at_period_end, cancel_email_sent_at')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        if (isDeleted) {
          // Period ended — remove access
          await supabase.from('users').update({
            plan: 'free',
            stripe_subscription_id: null,
            payment_status: 'canceled',
            cancel_at_period_end: false,
            current_period_end: null,
          }).eq('id', profile.id)
        } else {
          const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, growth: 2, pro: 3 }
          const newPlan = isActive ? getPlanFromPriceId(priceId) : isPastDue ? getPlanFromPriceId(priceId) : 'free'
          const isUpgrade = (PLAN_RANK[newPlan] ?? 0) > (PLAN_RANK[profile.plan] ?? 0)
          await supabase.from('users').update({
            plan: newPlan,
            stripe_subscription_id: isActive || isPastDue ? subscription.id : null,
            payment_status: isActive ? 'active' : isPastDue ? 'past_due' : 'canceled',
            cancel_at_period_end: cancelAtPeriodEnd,
            current_period_end: currentPeriodEnd,
            ...(isUpgrade ? { generation_count: 0 } : {}),
          }).eq('id', profile.id)

          // Send cancel confirmation when cancel_at_period_end just became true
          const justCanceled = cancelAtPeriodEnd && !profile.cancel_at_period_end && !profile.cancel_email_sent_at
          if (justCanceled && profile.email) {
            const accessUntil = new Date(subscription.current_period_end * 1000)
              .toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
            const siteUrl = Deno.env.get('SITE_URL') ?? 'https://flowcontent.com.br'
            const resendKey = Deno.env.get('RESEND_API_KEY')
            if (resendKey) {
              const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e23">
                <div style="background:#3d6b52;padding:24px 32px;border-radius:12px 12px 0 0">
                  <p style="color:#fff;font-size:18px;font-weight:600;margin:0">Cancelamento confirmado</p>
                </div>
                <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
                  <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Seu plano foi cancelado com sucesso. Você continua com acesso completo ao ContentFlow até <strong>${accessUntil}</strong>.</p>
                  <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Após essa data, sua conta será convertida para o plano gratuito.</p>
                  <p style="font-size:15px;line-height:1.7;margin:0 0 4px">Se mudar de ideia, você pode reativar a qualquer momento:</p>
                  <a href="${siteUrl}/app" style="display:inline-block;background:#3d6b52;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;margin-top:20px">Reativar assinatura</a>
                  <p style="font-size:12px;color:#94a3b8;margin:32px 0 0">ContentFlow &bull; <a href="${siteUrl}/contato" style="color:#94a3b8">Fale conosco</a></p>
                </div>
              </div>`
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
      }
    }

    // Payment failed → mark as past_due but keep plan (Stripe will retry)
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: profile } = await supabase
        .from('users')
        .select('id, email')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        await supabase.from('users').update({
          payment_status: 'past_due',
        }).eq('id', profile.id)

        // Send payment failure email
        const resendKey = Deno.env.get('RESEND_API_KEY')
        if (resendKey && profile.email) {
          const portalUrl = `${Deno.env.get('SITE_URL') ?? 'https://flowcontent.com.br'}/app`
          const html = `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e23">
              <div style="background:#3d6b52;padding:24px 32px;border-radius:12px 12px 0 0">
                <p style="color:#fff;font-size:18px;font-weight:600;margin:0">Problema com seu pagamento</p>
              </div>
              <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
                <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Olá! Tentamos cobrar sua assinatura do ContentFlow, mas o pagamento não foi processado.</p>
                <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Seu acesso está mantido por enquanto. Faremos novas tentativas automaticamente nos próximos dias.</p>
                <p style="font-size:15px;line-height:1.6;margin:0 0 24px">Para evitar interrupção no serviço, atualize seu método de pagamento:</p>
                <a href="${portalUrl}" style="display:inline-block;background:#3d6b52;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">Atualizar forma de pagamento</a>
                <p style="font-size:13px;color:#64748b;margin:24px 0 0">Se precisar de ajuda, responda este e-mail ou acesse <a href="https://flowcontent.com.br/contato" style="color:#3d6b52">flowcontent.com.br/contato</a>.</p>
              </div>
            </div>
          `
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'ContentFlow <contato@flowcontent.com.br>',
              to: [profile.email],
              subject: 'Problema com seu pagamento — ContentFlow',
              html,
            }),
          }).catch(e => console.error('resend payment_failed email error:', e))
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
})
