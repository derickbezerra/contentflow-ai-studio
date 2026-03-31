import { useState, useEffect, useCallback } from 'react'
import { X, Loader2, Copy, Check, QrCode, FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { PLANS } from '@/lib/plans'
import { toast } from 'sonner'

interface AsaasCheckoutModalProps {
  planKey: string | null
  onClose: () => void
  onSuccess: () => void
}

type Step = 'form' | 'pix' | 'boleto'

interface PixData {
  encodedImage: string
  payload: string
  expirationDate: string
}

function formatCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function AsaasCheckoutModal({ planKey, onClose, onSuccess }: AsaasCheckoutModalProps) {
  const plan = PLANS.find(p => p.planKey === planKey)

  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedBoleto, setCopiedBoleto] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [billingType, setBillingType] = useState<'PIX' | 'BOLETO'>('PIX')

  // Payment result
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  // Pre-fill name from auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setName(user.user_metadata.full_name)
    })
  }, [])

  // Poll for payment confirmation (PIX only)
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId) return false
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const { data: profile } = await supabase
      .from('users')
      .select('payment_status, plan')
      .eq('id', session.user.id)
      .single()

    return profile?.payment_status === 'active'
  }, [paymentId])

  useEffect(() => {
    if (step !== 'pix' || !paymentId) return
    let active = true
    setPolling(true)

    const interval = setInterval(async () => {
      if (!active) return
      const paid = await checkPaymentStatus()
      if (paid) {
        clearInterval(interval)
        setPolling(false)
        if (active) onSuccess()
      }
    }, 4000)

    return () => {
      active = false
      clearInterval(interval)
      setPolling(false)
    }
  }, [step, paymentId, checkPaymentStatus, onSuccess])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!plan) return

    const rawCpf = cpf.replace(/\D/g, '')
    if (rawCpf.length !== 11 && rawCpf.length !== 14) {
      toast.error('CPF/CNPJ inválido.')
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão inválida')

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-asaas-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          planKey: plan.planKey,
          name: name.trim(),
          cpfCnpj: rawCpf,
          phone: phone.replace(/\D/g, ''),
          billingType,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar cobrança')

      setPaymentId(data.paymentId)

      if (billingType === 'PIX' && data.pixData) {
        setPixData(data.pixData)
        setStep('pix')
      } else if (billingType === 'BOLETO' && data.boletoUrl) {
        setBoletoUrl(data.boletoUrl)
        setStep('boleto')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar cobrança. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function copyPix() {
    if (!pixData?.payload) return
    navigator.clipboard.writeText(pixData.payload)
    setCopiedPix(true)
    setTimeout(() => setCopiedPix(false), 3000)
  }

  function copyBoleto() {
    if (!boletoUrl) return
    navigator.clipboard.writeText(boletoUrl)
    setCopiedBoleto(true)
    setTimeout(() => setCopiedBoleto(false), 3000)
  }

  if (!plan) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5 pr-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Plano {plan.name}
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            {plan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Primeiros 7 dias grátis · Cancele quando quiser
          </p>
        </div>

        {/* STEP: FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cf-name" className="text-sm">Nome completo</Label>
              <Input
                id="cf-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. João Silva"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-cpf" className="text-sm">CPF ou CNPJ</Label>
              <Input
                id="cf-cpf"
                value={cpf}
                onChange={e => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                required
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground">Obrigatório para emissão da cobrança</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-phone" className="text-sm">Telefone <span className="text-muted-foreground">(opcional)</span></Label>
              <Input
                id="cf-phone"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                inputMode="tel"
              />
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label className="text-sm">Forma de pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillingType('PIX')}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-colors ${
                    billingType === 'PIX'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  PIX
                </button>
                <button
                  type="button"
                  onClick={() => setBillingType('BOLETO')}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-colors ${
                    billingType === 'BOLETO'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Boleto
                </button>
              </div>
            </div>

            <Button type="submit" variant="cta" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Gerando cobrança...</>
              ) : (
                `Continuar com ${billingType === 'PIX' ? 'PIX' : 'Boleto'}`
              )}
            </Button>
          </form>
        )}

        {/* STEP: PIX */}
        {step === 'pix' && pixData && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Pague com PIX</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Escaneie o QR Code ou copie a chave PIX
              </p>
            </div>

            {/* QR Code image */}
            <div className="rounded-xl border border-border bg-white p-3">
              <img
                src={`data:image/png;base64,${pixData.encodedImage}`}
                alt="QR Code PIX"
                className="h-48 w-48"
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={copyPix}
            >
              {copiedPix ? (
                <><Check className="h-4 w-4 text-green-600" /> Copiado!</>
              ) : (
                <><Copy className="h-4 w-4" /> Copiar código PIX</>
              )}
            </Button>

            {/* Polling indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {polling ? (
                <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Aguardando confirmação do pagamento...</>
              ) : (
                'Após pagar, seu plano será ativado automaticamente.'
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              O acesso é liberado automaticamente assim que o pagamento for confirmado.
            </p>
          </div>
        )}

        {/* STEP: BOLETO */}
        {step === 'boleto' && boletoUrl && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Boleto gerado!</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                O acesso será liberado após a compensação (até 3 dias úteis)
              </p>
            </div>

            <Button
              variant="cta"
              className="w-full"
              onClick={() => window.open(boletoUrl!, '_blank')}
            >
              <FileText className="h-4 w-4" /> Abrir boleto
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={copyBoleto}
            >
              {copiedBoleto ? (
                <><Check className="h-4 w-4 text-green-600" /> Copiado!</>
              ) : (
                <><Copy className="h-4 w-4" /> Copiar link do boleto</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Enviamos o boleto também para o seu e-mail.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
