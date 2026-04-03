export const PLANS = [
  {
    name: 'Starter',
    planKey: 'starter',
    price: 'R$47',
    limit: '10 conteúdos/mês',
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID as string,
    highlight: false,
    features: [
      'Carrossel, Post e Story',
      'Medicina, Nutrição, Odontologia e Psicologia',
      'Validação ética (CFM/CFO/CFP/CFN)',
    ],
  },
  {
    name: 'Growth',
    planKey: 'growth',
    price: 'R$97',
    limit: '30 conteúdos/mês',
    priceId: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID as string,
    highlight: true,
    features: [
      'Carrossel, Post e Story',
      'Medicina, Nutrição, Odontologia e Psicologia',
      'Perfil de marca personalizado',
      'Histórico de conteúdo',
      'Validação ética (CFM/CFO/CFP/CFN)',
    ],
  },
  {
    name: 'Pro',
    planKey: 'pro',
    price: 'R$127',
    limit: '50 conteúdos/mês',
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID as string,
    highlight: false,
    features: [
      'Carrossel, Post e Story',
      'Medicina, Nutrição, Odontologia e Psicologia',
      'Perfil de marca personalizado',
      'Histórico de conteúdo',
      'Análise de Compliance (50 créditos/mês)',
      'Validação ética (CFM/CFO/CFP/CFN)',
    ],
  },
]

export async function handleCheckout(priceId: string, planName: string, setLoadingPlan?: (p: string | null) => void) {
  setLoadingPlan?.(planName)
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/login'
      return
    }
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ priceId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('Checkout error:', data)
      setLoadingPlan?.(null)
    }
  } catch (err) {
    console.error('Checkout error:', err)
    setLoadingPlan?.(null)
  }
}

export async function handlePortal() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  } catch (err) {
    console.error('Portal error:', err)
  }
}

export const cancelSubscription = handlePortal
