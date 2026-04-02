import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { SPECIALTY_TOPICS } from '@/components/QuickStartTopics'

type Vertical = 'doctor' | 'nutritionist' | 'dentist' | 'psychologist'
type Goal = 'attract_patients' | 'build_authority' | 'increase_engagement'

interface Props {
  onComplete: (vertical: Vertical, suggestedTopic?: string) => void
  onShowPricing: (vertical: Vertical) => void
}

const VERTICALS: { value: Vertical; label: string; emoji: string }[] = [
  { value: 'doctor',        label: 'Médico(a)',        emoji: '🩺' },
  { value: 'nutritionist',  label: 'Nutricionista',    emoji: '🥗' },
  { value: 'dentist',       label: 'Dentista',         emoji: '🦷' },
  { value: 'psychologist',  label: 'Psicólogo(a)',     emoji: '🧠' },
]

const GOALS: { value: Goal; label: string; description: string }[] = [
  { value: 'attract_patients',      label: 'Atrair pacientes',       description: 'Gerar consultas e novos clientes' },
  { value: 'build_authority',       label: 'Construir autoridade',   description: 'Ser referência na minha especialidade' },
  { value: 'increase_engagement',   label: 'Aumentar engajamento',   description: 'Crescer seguidores e interações' },
]

const VOLUMES = [1, 2, 3, 4, 5, 7]

export default function OnboardingModal({ onComplete, onShowPricing: _onShowPricing }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [vertical, setVertical] = useState<Vertical | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [postsPerWeek, setPostsPerWeek] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // ESC key closes (acts as skip)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && vertical) onComplete(vertical)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [vertical, onComplete])

  async function handleFinish() {
    if (!user || !vertical || !goal || !postsPerWeek) return
    setSaving(true)

    // Persist to localStorage immediately so the user is never blocked again
    // even if the DB call fails (stale constraint or transient error).
    localStorage.setItem('cf_onboarding_done', 'true')
    localStorage.setItem('cf_vertical', vertical)

    const { error } = await supabase.from('users').update({
      vertical,
      onboarding_goal: goal,
      onboarding_posts_per_week: postsPerWeek,
    }).eq('id', user.id)

    setSaving(false)

    if (error) {
      // Log for debugging but do NOT block the user — localStorage already guards
      // against showing onboarding again on next visit.
      console.error('[Onboarding] Failed to save preferences to DB:', error)
    }

    const topics = SPECIALTY_TOPICS[vertical]
    const suggestedTopic = topics?.[0]
    onComplete(vertical, suggestedTopic)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">

        {/* Progress bar */}
        <div
          className="flex gap-1.5 p-5 pb-0"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Passo ${step} de 3`}
        >
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="p-6">

          {/* Step 1 — Especialidade */}
          {step === 1 && (
            <>
              <h2 id="onboarding-title" className="mb-1 text-xl font-bold text-foreground">Qual é sua especialidade?</h2>
              <p className="mb-5 text-sm text-muted-foreground">O conteúdo será gerado com a linguagem certa para a sua área.</p>
              <div className="grid grid-cols-2 gap-3">
                {VERTICALS.map(v => (
                  <button
                    key={v.value}
                    onClick={() => setVertical(v.value)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                      vertical === v.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">{v.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{v.label}</span>
                  </button>
                ))}
              </div>
              <Button
                variant="cta" size="xl" className="mt-5 w-full"
                disabled={!vertical}
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </>
          )}

          {/* Step 2 — Objetivo */}
          {step === 2 && (
            <>
              <h2 id="onboarding-title" className="mb-1 text-xl font-bold text-foreground">Qual é seu principal objetivo?</h2>
              <p className="mb-5 text-sm text-muted-foreground">Vamos adaptar as sugestões de conteúdo para o seu foco.</p>
              <div className="flex flex-col gap-3">
                {GOALS.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer ${
                      goal === g.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                  >
                    <span className="text-sm font-semibold text-foreground">{g.label}</span>
                    <span className="text-xs text-muted-foreground">{g.description}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="ghost" size="xl" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
                <Button variant="cta" size="xl" className="flex-1" disabled={!goal} onClick={() => setStep(3)}>Continuar</Button>
              </div>
            </>
          )}

          {/* Step 3 — Volume */}
          {step === 3 && (
            <>
              <h2 id="onboarding-title" className="mb-1 text-xl font-bold text-foreground">Quantos posts por semana?</h2>
              <p className="mb-5 text-sm text-muted-foreground">Isso ajuda o ContentFlow a sugerir temas na frequência certa.</p>
              <div className="grid grid-cols-3 gap-3">
                {VOLUMES.map(v => (
                  <button
                    key={v}
                    onClick={() => setPostsPerWeek(v)}
                    className={`rounded-xl border py-4 text-center transition-all cursor-pointer ${
                      postsPerWeek === v
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                  >
                    <span className="block text-2xl font-bold text-foreground">{v}</span>
                    <span className="text-xs text-muted-foreground">{v === 1 ? 'post/semana' : 'posts/semana'}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-center">
                <p className="text-sm font-medium text-foreground">
                  🎉 7 dias grátis incluídos
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Até 5 conteúdos durante o período de teste · Sem cartão de crédito
                </p>
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="ghost" size="xl" className="flex-1" onClick={() => setStep(2)}>Voltar</Button>
                <Button
                  variant="cta" size="xl" className="flex-1"
                  disabled={!postsPerWeek || saving}
                  onClick={handleFinish}
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : 'Criar meu primeiro conteúdo'}
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
