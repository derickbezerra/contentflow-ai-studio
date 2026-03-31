import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') ?? 'https://api-sandbox.asaas.com/v3'
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('asaas_subscription_id')
      .eq('id', user.id)
      .single()

    if (!profile?.asaas_subscription_id) {
      return new Response(JSON.stringify({ error: 'Nenhuma assinatura ativa encontrada.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Delete (cancel) the subscription on Asaas
    const res = await fetch(`${ASAAS_API_URL}/subscriptions/${profile.asaas_subscription_id}`, {
      method: 'DELETE',
      headers: { 'access_token': ASAAS_API_KEY },
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Asaas cancel error:', err)
      return new Response(JSON.stringify({ error: 'Erro ao cancelar assinatura na Asaas.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Immediately update local state — webhook will also fire SUBSCRIPTION_INACTIVATED
    await supabase.from('users').update({
      plan: 'free',
      asaas_subscription_id: null,
      payment_status: 'canceled',
      cancel_at_period_end: false,
      current_period_end: null,
    }).eq('id', user.id)

    return new Response(JSON.stringify({ canceled: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('cancel-asaas-subscription error:', error)
    return new Response(JSON.stringify({ error: 'Falha ao cancelar assinatura.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
