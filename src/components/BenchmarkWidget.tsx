import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Vertical = 'doctor' | 'nutritionist' | 'dentist' | 'psychologist'

interface VerticalBenchmark {
  avgMonthlyGenerations: number
  activeUsers: number
  formatDistribution: { carousel: number; post: number; story: number }
}

const VERTICAL_LABEL: Record<Vertical, string> = {
  doctor:        'Médicos',
  nutritionist:  'Nutricionistas',
  dentist:       'Dentistas',
  psychologist:  'Psicólogos',
}

const FORMAT_COLOR = {
  carousel: 'bg-primary',
  post:     'bg-blue-400',
  story:    'bg-purple-400',
}

interface Props {
  vertical: Vertical
  userCount: number
}

export default function BenchmarkWidget({ vertical, userCount }: Props) {
  const [data, setData] = useState<VerticalBenchmark | null>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem('cf_benchmarks')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed[vertical]) { setData(parsed[vertical]); return }
      } catch { /* ignore */ }
    }

    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-benchmarks`,
      { headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY } }
    )
      .then(r => r.json())
      .then(json => {
        sessionStorage.setItem('cf_benchmarks', JSON.stringify(json))
        setData(json[vertical])
      })
      .catch(() => { /* silent — non-critical widget */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vertical])

  if (!data || data.activeUsers < 3) return null

  const { avgMonthlyGenerations, formatDistribution: fd } = data
  const userLabel = VERTICAL_LABEL[vertical]

  return (
    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
      <p className="mb-2 font-medium text-foreground/80">
        {userLabel} geram em média{' '}
        <span className="font-bold text-foreground">{avgMonthlyGenerations} posts/mês</span>
        {userCount > 0 && (
          <>
            {' '}·{' '}
            <span className={userCount >= avgMonthlyGenerations ? 'text-primary font-semibold' : ''}>
              você está em {userCount}
            </span>
          </>
        )}
      </p>
      <div className="flex items-center gap-1">
        {(['carousel', 'post', 'story'] as const).map(fmt => {
          const pct = fd[fmt]
          if (pct === 0) return null
          return (
            <div key={fmt} className="flex items-center gap-1" style={{ width: `${pct}%`, minWidth: 'fit-content' }}>
              <div className={`h-1.5 w-full rounded-full ${FORMAT_COLOR[fmt]}`} style={{ minWidth: 8 }} />
              <span className="shrink-0 text-[10px]">{pct}%</span>
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex gap-3">
        {(['carousel', 'post', 'story'] as const).map(fmt => fd[fmt] > 0 && (
          <span key={fmt} className="flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-full ${FORMAT_COLOR[fmt]}`} />
            {fmt === 'carousel' ? 'Carrossel' : fmt === 'post' ? 'Post' : 'Story'} {fd[fmt]}%
          </span>
        ))}
      </div>
    </div>
  )
}
