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

const TONES: { value: Tone; label: string; description: string }[] = [
  { value: 'formal',    label: 'Formal',    description: 'Linguagem técnica e profissional' },
  { value: 'informal',  label: 'Informal',  description: 'Próximo, direto e descomplicado' },
  { value: 'empatico',  label: 'Empático',  description: 'Acolhedor, humano e validador' },
]


export default function BrandProfile() {
  const { user } = useAuth()
  const { planInfo } = usePlan()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    brand_name: '',
    brand_tone: 'informal' as Tone,
    brand_bio: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showCancelSurvey, setShowCancelSurvey] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('users')
      .select('brand_name, brand_tone, brand_bio')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            brand_name: data.brand_name ?? '',
            brand_tone: (data.brand_tone as Tone) ?? 'informal',
            brand_bio: data.brand_bio ?? '',
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
