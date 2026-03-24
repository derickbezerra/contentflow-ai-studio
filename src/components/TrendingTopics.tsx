import { useEffect, useState, ReactNode } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Topic {
  title: string
  subtitle: string
}

interface Props {
  vertical: string
  onSelect: (topic: string) => void
  headerRight?: ReactNode
}

export default function TrendingTopics({ vertical, onSelect, headerRight }: Props) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setTopics([])

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-trending-topics?vertical=${vertical}`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        )
        const data = await res.json()
        if (data.topics) setTopics(data.topics)
        else setError(true)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    })
  }, [vertical])

  if (error) return null

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Sugestão de temas para hoje</span>
          {loading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground/40" />}
        </div>
        {headerRight}
      </div>

      {/* Topics */}
      {loading ? (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-7 animate-pulse rounded-full bg-muted"
              style={{ width: `${72 + (i % 3) * 28}px` }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {topics.map((t, i) => (
            <button
              key={i}
              onClick={() => onSelect(t.title)}
              title={t.subtitle}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95"
            >
              {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
