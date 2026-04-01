import Stripe from 'npm:stripe'
import { createClient } from 'npm:@supabase/supabase-js'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id, payment_status')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    // If user already has an active subscription, redirect to billing portal instead
    if (profile?.stripe_subscription_id && profile?.payment_status === 'active') {
      const appUrl = req.headers.get('origin') || Deno.env.get('APP_URL') || 'https://contentflow.vercel.app'
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/app`,
      })
      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { priceId } = await req.json()

    // Validate priceId against known valid prices
    const validPriceIds = [
      Deno.env.get('STRIPE_STARTER_PRICE_ID'),
      Deno.env.get('STRIPE_GROWTH_PRICE_ID'),
      Deno.env.get('STRIPE_PRO_PRICE_ID'),
    ].filter(Boolean)
    if (!priceId || !validPriceIds.includes(priceId)) {
      return new Response(JSON.stringify({ error: 'Plano inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const appUrl = req.headers.get('origin') || Deno.env.get('APP_URL') || 'https://contentflow.vercel.app'

    // Map priceId → plan value for conversion tracking
    const planValueMap: Record<string, number> = {
      [Deno.env.get('STRIPE_STARTER_PRICE_ID') ?? '']: 47,
      [Deno.env.get('STRIPE_GROWTH_PRICE_ID')  ?? '']: 97,
      [Deno.env.get('STRIPE_PRO_PRICE_ID')     ?? '']: 127,
    }
    const planValue = planValueMap[priceId] ?? 0

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/app?checkout=success&value=${planValue}`,
      cancel_url: `${appUrl}/app?checkout=cancel`,
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('create-checkout error:', error)
    return new Response(JSON.stringify({ error: 'Falha ao criar sessão de pagamento.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
