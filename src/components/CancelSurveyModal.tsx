import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

type Reason = 'preco' | 'nao_uso' | 'falta_feature' | 'outro'

const REASONS: { value: Reason; label: string }[] = [
  { value: 'preco',         label: 'Preço muito alto' },
  { value: 'nao_uso',       label: 'Não estou usando' },
  { value: 'falta_feature', label: 'Falta uma funcionalidade' },
  { value: 'outro',         label: 'Outro motivo' },
]

interface Props {
  onConfirm: () => void
  onClose: () => void
}

export default function CancelSurveyModal({ onConfirm, onClose }: Props) {
  const { user } = useAuth()
  const [reason, setReason] = useState<Reason | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!reason) {
      toast.error('Selecione um motivo para continuar.')
      return
    }
    setLoading(true)
    if (user) {
      await supabase.from('cancel_surveys').insert({
        user_id: user.id,
        reason,
        comment: comment.trim() || null,
      })
    }
    setLoading(false)
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-bold text-foreground">Antes de cancelar…</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          O que levou você a cancelar? Sua resposta nos ajuda a melhorar o produto.
        </p>

        <div className="space-y-2">
          {REASONS.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                reason === r.value
                  ? 'border-primary bg-primary/5 font-medium text-foreground ring-1 ring-primary/30'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Comentário adicional (opcional)"
          rows={3}
          maxLength={500}
          className="mt-3 w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Ficar no plano
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!reason || loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancelar plano'}
          </Button>
        </div>
      </div>
    </div>
  )
}
