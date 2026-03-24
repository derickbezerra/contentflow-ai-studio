import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

type Vertical = 'doctor' | 'nutritionist' | 'dentist' | 'psychologist'
type Goal = 'attract_patients' | 'build_authority' | 'increase_engagement'

interface Props {
  onComplete: (vertical: Vertical) => void
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

export default function OnboardingModal({ onComplete, onShowPricing }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [vertical, setVertical] = useState<Vertical | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [postsPerWeek, setPostsPerWeek] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleFinish() {
    if (!user || !vertical || !goal || !postsPerWeek) return
    setSaving(true)

    await supabase.from('users').update({
      vertical,
      onboarding_goal: goal,
      onboarding_posts_per_week: postsPerWeek,
    }).eq('id', user.id)

    setSaving(false)
    onComplete(vertical)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">

        {/* Progress bar */}
        <div className="flex gap-1.5 p-5 pb-0">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="p-6">

          {/* Step 1 — Especialidade */}
          {step === 1 && (
            <>
              <h2 className="mb-1 text-xl font-bold text-foreground">Qual é sua especialidade?</h2>
              <p className="mb-5 text-sm text-muted-foreground">O conteúdo será gerado com a linguagem certa para a sua área.</p>
              <div className="grid grid-cols-2 gap-3">
                {VERTICALS.map(v => (
                  <button
                    key={v.value}
                    onClick={() => setVertical(v.value)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all ${
                      vertical === v.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                  >
                    <span className="text-2xl">{v.emoji}</span>
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
              <h2 className="mb-1 text-xl font-bold text-foreground">Qual é seu principal objetivo?</h2>
              <p className="mb-5 text-sm text-muted-foreground">Vamos adaptar as sugestões de conteúdo para o seu foco.</p>
              <div className="flex flex-col gap-3">
                {GOALS.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
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
              <h2 className="mb-1 text-xl font-bold text-foreground">Quantos posts por semana?</h2>
              <p className="mb-5 text-sm text-muted-foreground">Isso ajuda o ContentFlow a sugerir temas na frequência certa.</p>
              <div className="grid grid-cols-3 gap-3">
                {VOLUMES.map(v => (
                  <button
                    key={v}
                    onClick={() => setPostsPerWeek(v)}
                    className={`rounded-xl border py-4 text-center transition-all ${
                      postsPerWeek === v
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                  >
                    <span className="block text-2xl font-bold text-foreground">{v}</span>
                    <span className="text-xs text-muted-foreground">{v === 1 ? 'por semana' : 'por semana'}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="ghost" size="xl" className="flex-1" onClick={() => setStep(2)}>Voltar</Button>
                <Button
                  variant="cta" size="xl" className="flex-1"
                  disabled={!postsPerWeek || saving}
                  onClick={handleFinish}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Começar'}
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
