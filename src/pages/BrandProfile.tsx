import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePlan } from '@/hooks/usePlan'
import { toast } from 'sonner'
import CancelSurveyModal from '@/components/CancelSurveyModal'

type Tone = 'formal' | 'informal' | 'empatico'
type PatientIntent = 'estetico' | 'dor_sintoma' | 'preventivo' | 'cronico' | 'premium' | 'geral'

const TONES: { value: Tone; label: string; description: string }[] = [
  { value: 'formal',    label: 'Formal',    description: 'Linguagem técnica e profissional' },
  { value: 'informal',  label: 'Informal',  description: 'Próximo, direto e descomplicado' },
  { value: 'empatico',  label: 'Empático',  description: 'Acolhedor, humano e validador' },
]

const PATIENT_INTENTS: { value: PatientIntent; label: string; desc: string }[] = [
  { value: 'estetico',    label: 'Estético',      desc: 'Aparência e autoestima' },
  { value: 'dor_sintoma', label: 'Dor / Sintoma',  desc: 'Alívio e tratamento' },
  { value: 'preventivo',  label: 'Preventivo',     desc: 'Prevenção e check-up' },
  { value: 'cronico',     label: 'Crônico',        desc: 'Condições contínuas' },
  { value: 'premium',     label: 'Premium',        desc: 'Alta renda, exclusividade' },
  { value: 'geral',       label: 'Geral',          desc: 'Público amplo e variado' },
]

const AGE_RANGES = [
  { value: '18-25', label: '18–25' },
  { value: '25-35', label: '25–35' },
  { value: '35-50', label: '35–50' },
  { value: '50+',   label: '50+' },
]

export default function BrandProfile() {
  const { user } = useAuth()
  const { planInfo } = usePlan()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    brand_name: '',
    brand_tone: 'informal' as Tone,
    brand_bio: '',
    patient_intent_primary: '' as PatientIntent | '',
    patient_intent_secondary: '' as PatientIntent | '',
    age_range: [] as string[],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showCancelSurvey, setShowCancelSurvey] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('users')
      .select('brand_name, brand_tone, brand_bio, patient_intent_primary, patient_intent_secondary, age_range')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            brand_name: data.brand_name ?? '',
            brand_tone: (data.brand_tone as Tone) ?? 'informal',
            brand_bio: data.brand_bio ?? '',
            patient_intent_primary: (data.patient_intent_primary as PatientIntent) ?? '',
            patient_intent_secondary: (data.patient_intent_secondary as PatientIntent) ?? '',
            age_range: data.age_range ?? [],
          })
        }
        setLoading(false)
      })
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)

    const { error } = await supabase
      .from('users')
      .update({
        brand_name: form.brand_name.trim() || null,
        brand_tone: form.brand_tone,
        brand_bio: form.brand_bio.trim() || null,
        patient_intent_primary: form.patient_intent_primary || null,
        patient_intent_secondary: form.patient_intent_secondary || null,
        age_range: form.age_range.length > 0 ? form.age_range : null,
      })
      .eq('id', user.id)

    setSaving(false)
    if (error) {
      toast.error('Erro ao salvar. Tente novamente.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  function handleIntentClick(value: PatientIntent) {
    setForm(p => {
      if (p.patient_intent_primary === value) {
        // Deselect primary: promote secondary to primary
        return { ...p, patient_intent_primary: p.patient_intent_secondary as PatientIntent | '', patient_intent_secondary: '' }
      }
      if (p.patient_intent_secondary === value) {
        return { ...p, patient_intent_secondary: '' }
      }
      if (!p.patient_intent_primary) {
        return { ...p, patient_intent_primary: value }
      }
      return { ...p, patient_intent_secondary: value }
    })
  }

  async function handleManagePlan() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      )
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error('Não foi possível abrir o portal de assinatura.')
    } catch {
      toast.error('Erro ao acessar portal de assinatura.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" onClick={() => navigate('/app')}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <h1 className="mb-1 text-2xl font-bold text-foreground">Perfil de marca</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          O ContentFlow usa essas informações para personalizar o conteúdo com seu nome, tom e contexto.
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Seu nome ou nome da clínica
            </label>
            <input
              value={form.brand_name}
              onChange={e => setForm(p => ({ ...p, brand_name: e.target.value }))}
              maxLength={100}
              placeholder="Ex: Dra. Ana Costa / Clínica Vitallis"
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Tom de voz */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Tom de voz</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {TONES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, brand_tone: t.value }))}
                  className={`rounded-xl border px-4 py-3 text-left transition-all ${
                    form.brand_tone === t.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Bio resumida
            </label>
            <textarea
              value={form.brand_bio}
              onChange={e => setForm(p => ({ ...p, brand_bio: e.target.value }))}
              maxLength={300}
              rows={4}
              placeholder="Ex: Nutricionista especializada em emagrecimento sustentável, atendo adultos e adolescentes em São Paulo."
              className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{form.brand_bio.length}/300</p>
          </div>

          {/* Intenção do paciente */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Intenção do paciente
            </label>
            <p className="mb-3 text-xs text-muted-foreground">
              Clique para marcar a intenção primária <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">1</span> e secundária <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/30 text-[9px] font-bold text-primary">2</span>.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PATIENT_INTENTS.map(intent => {
                const isPrimary = form.patient_intent_primary === intent.value
                const isSecondary = form.patient_intent_secondary === intent.value
                return (
                  <button
                    key={intent.value}
                    type="button"
                    onClick={() => handleIntentClick(intent.value)}
                    className={`relative rounded-xl border px-4 py-3 text-left transition-all ${
                      isPrimary
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : isSecondary
                        ? 'border-primary/40 bg-primary/[0.02] ring-1 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    {isPrimary && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">1</span>
                    )}
                    {isSecondary && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/30 text-[10px] font-bold text-primary">2</span>
                    )}
                    <p className="text-sm font-semibold text-foreground">{intent.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{intent.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Faixa etária */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Faixa etária do paciente
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AGE_RANGES.map(r => {
                const selected = form.age_range.includes(r.value)
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(p => ({
                      ...p,
                      age_range: selected
                        ? p.age_range.filter(v => v !== r.value)
                        : [...p.age_range, r.value],
                    }))}
                    className={`rounded-xl border py-3 text-center text-sm font-semibold transition-all ${
                      selected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30 text-primary'
                        : 'border-border bg-card hover:border-primary/30 text-foreground'
                    }`}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          <Button type="submit" variant="cta" size="xl" className="w-full" disabled={saving}>
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
            ) : saved ? (
              <><CheckCircle className="h-4 w-4" /> Salvo!</>
            ) : (
              'Salvar perfil'
            )}
          </Button>
        </form>

        {planInfo?.plan !== 'free' && !planInfo?.cancelAtPeriodEnd && (
          <div className="mt-10 border-t border-border pt-8">
            <h2 className="mb-1 text-sm font-semibold text-foreground">Assinatura</h2>
            <p className="mb-4 text-xs text-muted-foreground capitalize">
              Plano {planInfo?.plan} · Acesse o portal para gerenciar pagamento ou cancelar.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowCancelSurvey(true)}
            >
              Cancelar plano
            </Button>
          </div>
        )}
      </div>

      {showCancelSurvey && (
        <CancelSurveyModal
          onConfirm={() => { setShowCancelSurvey(false); handleManagePlan() }}
          onClose={() => setShowCancelSurvey(false)}
        />
      )}
    </div>
  )
}
