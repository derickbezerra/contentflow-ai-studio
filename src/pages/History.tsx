import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, FileText, LayoutGrid, Mic, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

type ContentType = 'carousel' | 'post' | 'story'
type FilterType = ContentType | 'all'

interface HistoryItem {
  id: string
  type: ContentType
  input: string
  output_json: Record<string, unknown>
  created_at: string
}

const PAGE_SIZE = 20

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  carousel: <LayoutGrid className="h-3.5 w-3.5" />,
  post:     <FileText className="h-3.5 w-3.5" />,
  story:    <Mic className="h-3.5 w-3.5" />,
}

const TYPE_LABELS: Record<ContentType, string> = {
  carousel: 'Carrossel',
  post:     'Post',
  story:    'Story',
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'carousel', label: 'Carrossel' },
  { value: 'post',     label: 'Post' },
  { value: 'story',    label: 'Story' },
]

function getPreview(item: HistoryItem): string {
  const o = item.output_json
  if (item.type === 'carousel') {
    const slides = o.slides as { title?: string }[] | undefined
    return slides?.[0]?.title ?? item.input
  }
  if (item.type === 'post') return (o.hook as string) ?? item.input
  if (item.type === 'story') return (o.script as string)?.slice(0, 80) ?? item.input
  return item.input
}

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)

  const fetchPage = useCallback(async () => {
    if (!user) return
    setLoading(true)

    let query = supabase
      .from('content')
      .select('id, type, input, output_json, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (filter !== 'all') query = query.eq('type', filter)

    const { data, count } = await query
    setItems((data as HistoryItem[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [user, page, filter])

  useEffect(() => { fetchPage() }, [fetchPage])

  // Reset to page 0 when filter changes
  useEffect(() => { setPage(0) }, [filter])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" onClick={() => navigate('/app')}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
            {!loading && <p className="mt-0.5 text-sm text-muted-foreground">{total} {total === 1 ? 'conteúdo gerado' : 'conteúdos gerados'}</p>}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                filter === f.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              {filter === 'all' ? 'Nenhum conteúdo gerado ainda.' : `Nenhum ${TYPE_LABELS[filter as ContentType]?.toLowerCase()} gerado ainda.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <div key={item.id} className="rounded-2xl border border-border bg-card px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.input}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{getPreview(item)}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {TYPE_ICONS[item.type]} {TYPE_LABELS[item.type]}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground/60">
                  {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="ghost" size="sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              variant="ghost" size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
