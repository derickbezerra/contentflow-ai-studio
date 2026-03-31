import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const PLANS = [
  {
    name: 'Starter',
    planKey: 'starter',
    price: 'R$47',
    priceValue: 47,
    limit: '10 conteúdos/mês',
    highlight: false,
    features: ['10 conteúdos por mês', 'Carrossel, Post e Story', 'Medicina, Nutrição, Odontologia e Psicologia'],
  },
  {
    name: 'Growth',
    planKey: 'growth',
    price: 'R$97',
    priceValue: 97,
    limit: '30 conteúdos/mês',
    highlight: true,
    features: ['30 conteúdos por mês', 'Carrossel, Post e Story', 'Medicina, Nutrição, Odontologia e Psicologia', 'Perfil de marca personalizado', 'Histórico de conteúdo'],
  },
  {
    name: 'Pro',
    planKey: 'pro',
    price: 'R$127',
    priceValue: 127,
    limit: '50 conteúdos/mês',
    highlight: false,
    features: ['50 conteúdos por mês', 'Carrossel, Post e Story', 'Medicina, Nutrição, Odontologia e Psicologia', 'Analisador de Compliance (CFM/CFO/CFP/CFN)', 'Perfil de marca personalizado', 'Histórico de conteúdo'],
  },
]

// Global checkout opener — registered by App.tsx, called by any component
let _openCheckout: ((planKey: string) => void) | null = null

export function registerCheckoutOpener(fn: (planKey: string) => void) {
  _openCheckout = fn
}

export function handleCheckout(
  planKey: string,
  _planName: string,
  setLoadingPlan?: (name: string | null) => void,
) {
  if (_openCheckout) {
    _openCheckout(planKey)
  } else {
    toast.error('Checkout não disponível. Recarregue a página.')
  }
  // Clear loading state immediately — modal handles its own loading
  setLoadingPlan?.(null)
}

export async function cancelSubscription(setLoading: (v: boolean) => void) {
  setLoading(true)
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Sessão inválida')

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-asaas-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao cancelar assinatura')

    toast.success('Assinatura cancelada com sucesso.')
    // Reload to reflect new plan state
    setTimeout(() => window.location.reload(), 1500)
  } catch (err: unknown) {
    toast.error('Erro ao cancelar. Tente novamente.')
    console.error(err)
    setLoading(false)
  }
}

// Legacy export kept for compatibility — no longer used for redirect
export async function handlePortal(setLoading: (v: boolean) => void) {
  await cancelSubscription(setLoading)
}
