import { useState, useEffect } from 'react'
import { Check, Loader2, Zap, Lock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

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

interface BillingWallProps {
  reason: 'trial_expired' | 'payment_failed'
}

export default function BillingWall({ reason }: BillingWallProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  useEffect(() => {
    const handleFocus = () => { setLoadingPlan(null); setLoadingPortal(false) }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function handleSubscribe(priceIdEnv: string, planName: string) {
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

  async function handleManagePayment() {
    setLoadingPortal(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão inválida')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      })

      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Erro ao abrir portal')

      window.location.href = data.url
    } catch (err: unknown) {
      toast.error('Erro ao abrir portal de pagamento. Tente novamente.')
      console.error(err)
      setLoadingPortal(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-7 w-7 text-primary" />
            </div>
          </div>
          {reason === 'trial_expired' ? (
            <>
              <h1 className="text-2xl font-semibold text-foreground">Seus 7 dias gratuitos acabaram</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha um plano e continue gerando conteúdo por menos de R$1,60 por post
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-foreground">Problema com seu pagamento</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Atualize sua forma de pagamento para continuar usando o ContentFlow
              </p>
            </>
          )}
        </div>

        {reason === 'payment_failed' ? (
          /* Payment failed: show manage payment button */
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="cta"
              size="xl"
              className="w-full max-w-sm"
              onClick={handleManagePayment}
              disabled={loadingPortal}
            >
              {loadingPortal ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Aguarde...</>
              ) : (
                <><CreditCard className="h-5 w-5" /> Atualizar forma de pagamento</>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Você será redirecionado ao portal seguro do Stripe
            </p>
          </div>
        ) : (
          /* Trial expired: show plan cards */
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border-2 p-4 ${
                    plan.highlight ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                      Mais popular
                    </div>
                  )}
                  <p className={`mb-1 text-xs font-semibold ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
                    {plan.name.toUpperCase()}
                  </p>
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">{plan.limit}</p>
                  <ul className="mb-4 space-y-1.5">
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
                    onClick={() => handleSubscribe(plan.priceIdEnv, plan.name)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.name ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguarde...</>
                    ) : (
                      <><Zap className="h-3.5 w-3.5" /> Assinar {plan.name}</>
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Cancele quando quiser · Pagamento seguro via Stripe
            </p>
          </>
        )}
      </div>
    </div>
  )
}
