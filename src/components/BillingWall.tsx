import { useState, useEffect } from 'react'
import { Check, Loader2, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, handleCheckout } from '@/lib/plans'

interface BillingWallProps {
  reason: 'trial_expired' | 'payment_failed'
}

export default function BillingWall({ reason }: BillingWallProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    const handleFocus = () => { setLoadingPlan(null) }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

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
                Escolha um plano e continue gerando conteúdo a partir de R$47/mês
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-foreground">Pagamento em atraso</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enviamos um e-mail com o link de pagamento. Verifique sua caixa de entrada.
              </p>
            </>
          )}
        </div>

        {reason === 'payment_failed' ? (
          /* Payment failed: instruct user to check email for Asaas payment link */
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="cta"
              size="xl"
              className="w-full max-w-sm"
              onClick={() => window.location.reload()}
            >
              Já paguei — verificar acesso
            </Button>
            <a
              href="/contato"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Falar com suporte →
            </a>
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
                    onClick={() => handleCheckout(plan.planKey, plan.name, setLoadingPlan)}
                    disabled={loadingPlan === plan.name}
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
              Cancele quando quiser · Pagamento seguro
            </p>
          </>
        )}
      </div>
    </div>
  )
}
