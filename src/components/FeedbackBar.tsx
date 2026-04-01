import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  contentKey: string // unique key (topic + type) for localStorage dedup
}

export default function FeedbackBar({ contentKey }: Props) {
  const storageKey = `cf_rating_${contentKey}`
  const [rating, setRating] = useState<'up' | 'down' | null>(
    () => (localStorage.getItem(storageKey) as 'up' | 'down' | null)
  )

  function vote(v: 'up' | 'down') {
    if (rating === v) return
    setRating(v)
    localStorage.setItem(storageKey, v)
    toast.success(
      v === 'up' ? 'Ótimo! Seu feedback ajuda a melhorar os conteúdos.' : 'Entendido. Vamos melhorar!',
      { duration: 2500 }
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 pt-1">
      <span className="text-xs text-muted-foreground/50">Este conteúdo foi útil?</span>
      <div className="flex gap-1.5">
        <button
          onClick={() => vote('up')}
          aria-label="Gostei"
          aria-pressed={rating === 'up'}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-150 hover:scale-110 active:scale-95 ${
            rating === 'up'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground/50 hover:border-primary/40 hover:text-primary'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => vote('down')}
          aria-label="Não gostei"
          aria-pressed={rating === 'down'}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-150 hover:scale-110 active:scale-95 ${
            rating === 'down'
              ? 'border-destructive bg-destructive/10 text-destructive'
              : 'border-border bg-card text-muted-foreground/50 hover:border-destructive/40 hover:text-destructive'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
