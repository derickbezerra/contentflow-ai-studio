import { createClient } from 'npm:@supabase/supabase-js'

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const ALLOWED_ORIGINS = [
    'https://flowcontent.com.br',
    'https://www.flowcontent.com.br',
    'https://contentflow-ai-studio.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
  ]
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') ?? 'https://api-sandbox.asaas.com/v3'
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!

const PLAN_PRICES: Record<string, number> = {
  starter: 47,
  growth: 97,
  pro: 127,
}

async function asaas(path: string, method = 'GET', body?: unknown) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${ASAAS_API_URL}${path}`, {
      signal: controller.signal,
      method,
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Asaas ${method} ${path} → ${res.status}: ${err}`)
    }
    return res.json()
  } finally {
    clearTimeout(timer)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) })

  try {
    // Auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const { planKey, name, cpfCnpj, phone, billingType } = await req.json()

    // Validate plan
    const priceValue = PLAN_PRICES[planKey]
    if (!priceValue) {
      return new Response(JSON.stringify({ error: 'Plano inválido.' }), {
        status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Validate billing type
    if (!['PIX', 'BOLETO'].includes(billingType)) {
      return new Response(JSON.stringify({ error: 'Forma de pagamento inválida.' }), {
        status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Get or create Asaas customer
    const { data: profile } = await supabase
      .from('users')
      .select('asaas_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.asaas_customer_id

    if (!customerId) {
      const customer = await asaas('/customers', 'POST', {
        name: name || user.email,
        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
        email: user.email,
        phone: phone?.replace(/\D/g, '') || undefined,
        notificationDisabled: false,
      })
      customerId = customer.id
      await supabase.from('users').update({ asaas_customer_id: customerId }).eq('id', user.id)
    }

    // Next billing date = today + 7 days (trial period)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    // Create subscription
    const subscription = await asaas('/subscriptions', 'POST', {
      customer: customerId,
      billingType,
      value: priceValue,
      nextDueDate: dueDateStr,
      cycle: 'MONTHLY',
      description: `ContentFlow ${planKey.charAt(0).toUpperCase() + planKey.slice(1)}`,
    })

    // For PIX: get the first payment's QR code
    let pixData: { encodedImage: string; payload: string; expirationDate: string } | null = null
    let boletoUrl: string | null = null
    let paymentId: string | null = null

    if (billingType === 'PIX') {
      // List payments for this subscription to get the first one
      const paymentsRes = await asaas(`/payments?subscription=${subscription.id}&limit=1`)
      const payment = paymentsRes.data?.[0]
      if (payment?.id) {
        paymentId = payment.id
        const qr = await asaas(`/payments/${payment.id}/pixQrCode`)
        pixData = {
          encodedImage: qr.encodedImage,
          payload: qr.payload,
          expirationDate: qr.expirationDate,
        }
      }
    }

    if (billingType === 'BOLETO') {
      const paymentsRes = await asaas(`/payments?subscription=${subscription.id}&limit=1`)
      const payment = paymentsRes.data?.[0]
      if (payment?.id) {
        paymentId = payment.id
        boletoUrl = payment.bankSlipUrl ?? null
      }
    }

    // Store subscription ID immediately (plan will be activated by webhook)
    await supabase.from('users').update({
      asaas_subscription_id: subscription.id,
    }).eq('id', user.id)

    return new Response(JSON.stringify({
      subscriptionId: subscription.id,
      paymentId,
      billingType,
      ...(pixData ? { pixData } : {}),
      ...(boletoUrl ? { boletoUrl } : {}),
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('create-asaas-checkout error:', error)
    return new Response(JSON.stringify({ error: 'Falha ao criar cobrança. Tente novamente.' }), {
      status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
