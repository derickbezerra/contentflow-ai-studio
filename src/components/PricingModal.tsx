import { useState, useEffect } from 'react'
import { Check, X, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, handleCheckout } from '@/lib/plans'

interface PricingModalProps {
  onClose: () => void
}

export default function PricingModal({ onClose }: PricingModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    const handleFocus = () => setLoadingPlan(null)
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
    >
      <div className="relative w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl bg-background p-6 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Escolha seu plano
          </div>
          <h2 id="pricing-modal-title" className="text-2xl font-semibold text-foreground">Quanto vale ter pacientes novos todo mês?</h2>
          <p className="mt-1 text-sm text-muted-foreground">7 dias grátis incluídos · Cancele quando quiser</p>
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
                onClick={() => handleCheckout(plan.priceIdEnv, plan.name, setLoadingPlan)}
                disabled={loadingPlan === plan.name}
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
