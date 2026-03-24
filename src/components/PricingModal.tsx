import { useState, useEffect } from 'react'
import { Check, X, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface PricingModalProps {
  onClose: () => void
}

const PLANS = [
  {
    name: 'Starter',
    price: 'R$27',
    limit: '10 conteúdos/mês',
    priceIdEnv: 'VITE_STRIPE_STARTER_PRICE_ID',
    highlight: false,
    features: ['10 conteúdos por mês', 'Carrossel, Post e Story', 'Medicina, Nutrição, Odonto e Psico'],
  },
  {
    name: 'Growth',
    price: 'R$47',
    limit: '30 conteúdos/mês',
    priceIdEnv: 'VITE_STRIPE_GROWTH_PRICE_ID',
    highlight: true,
    features: ['30 conteúdos por mês', 'Carrossel, Post e Story', 'Medicina, Nutrição, Odonto e Psico', 'Perfil de marca personalizado', 'Histórico de conteúdo'],
  },
  {
    name: 'Pro',
    price: 'R$97',
    limit: '100 conteúdos/mês',
    priceIdEnv: 'VITE_STRIPE_PRO_PRICE_ID',
    highlight: false,
    features: ['100 conteúdos por mês', 'Carrossel, Post e Story', 'Medicina, Nutrição, Odonto e Psico', 'Perfil de marca personalizado', 'Histórico de conteúdo', 'Suporte prioritário'],
  },
]

export default function PricingModal({ onClose }: PricingModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    const handleFocus = () => setLoadingPlan(null)
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function handleUpgrade(priceIdEnv: string, planName: string) {
    setLoadingPlan(planName)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão inválida')

      const priceId = (import.meta.env as Record<string, string>)[priceIdEnv]
      if (!priceId) throw new Error('Plano não configurado')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Erro ao iniciar checkout')

      window.location.href = data.url
    } catch (err: unknown) {
      toast.error('Erro ao iniciar checkout. Tente novamente.')
      console.error(err)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-background p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Escolha seu plano
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Quanto vale 1 paciente novo por mês?</h2>
          <p className="mt-1 text-sm text-muted-foreground">7 dias grátis incluídos · Cancele quando quiser · Pagamento seguro</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.name} className="flex flex-col">
              <div className="mb-2 flex h-6 items-center justify-center">
                {plan.highlight && (
                  <span className="whitespace-nowrap rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Mais popular
                  </span>
                )}
              </div>
              <div
                className={`relative flex flex-1 flex-col rounded-xl border-2 p-4 ${
                  plan.highlight
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
              <p className={`mb-1 text-xs font-semibold ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
                {plan.name.toUpperCase()}
              </p>
              <div className="mb-1">
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground">/mês</span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{plan.limit}</p>
              <ul className="mb-4 flex-1 space-y-1.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
                    <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? 'cta' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => handleUpgrade(plan.priceIdEnv, plan.name)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.name ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguarde...</>
                ) : (
                  `Assinar ${plan.name}`
                )}
              </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
