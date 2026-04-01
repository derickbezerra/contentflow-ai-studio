import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Loader2, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import TopBar from '@/components/TopBar'

type ContentType = 'carousel' | 'post' | 'story'

interface ContentEntry {
  id: string
  type: ContentType
  input: string
  status: 'gerado' | 'publicado'
  created_at: string
}

interface PlannedEntry {
  id: string
  topic: string
  content_type: ContentType
  scheduled_date: string
}

const TYPE_COLORS: Record<ContentType, string> = {
  carousel: 'bg-primary/10 text-primary',
  post: 'bg-secondary text-secondary-foreground',
  story: 'bg-muted text-muted-foreground',
}

const TYPE_LABELS: Record<ContentType, string> = {
  carousel: 'Carrossel',
  post: 'Post',
  story: 'Story',
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'carousel', label: 'Carrossel' },
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
]

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function weekStart(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  r.setDate(r.getDate() - r.getDay())
  return r
}

// ── Add Plan Modal ────────────────────────────────────────

interface AddPlanModalProps {
  date: string
  onSave: (plan: { topic: string; content_type: ContentType; scheduled_date: string }) => Promise<void>
  onClose: () => void
}

function AddPlanModal({ date, onSave, onClose }: AddPlanModalProps) {
  const [topic, setTopic] = useState('')
  const [type, setType] = useState<ContentType>('carousel')
  const [dateVal, setDateVal] = useState(date)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!topic.trim()) { toast.error('Digite o tema do post.'); return }
    setSaving(true)
    await onSave({ topic: topic.trim(), content_type: type, scheduled_date: dateVal })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
        <h3 className="mb-4 text-sm font-bold text-foreground">Planejar post</h3>
        <div className="space-y-3">
          <input
            autoFocus
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            placeholder="Tema do post (ex: diabetes tipo 2)"
            maxLength={200}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            {CONTENT_TYPES.map(ct => (
              <button
                key={ct.value}
                type="button"
                onClick={() => setType(ct.value)}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                  type === ct.value
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={dateVal}
            onChange={e => setDateVal(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="cta" className="flex-1" onClick={handleSave} disabled={saving || !topic.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Week View ─────────────────────────────────────────────

interface WeekViewProps {
  days: Date[]
  today: string
  getEntries: (d: string) => { content: ContentEntry[]; planned: PlannedEntry[] }
  onAddPlan: (d: string) => void
  onDeletePlan: (id: string) => void
  onTogglePublished: (id: string, status: string) => void
  onGenerateFromPlan: (plan: PlannedEntry) => void
}

function EntryCard({
  entry,
  onTogglePublished,
  onDeletePlan,
  onGenerateFromPlan,
  compact = false,
}: {
  entry: { kind: 'content'; data: ContentEntry } | { kind: 'plan'; data: PlannedEntry }
  onTogglePublished: (id: string, status: string) => void
  onDeletePlan: (id: string) => void
  onGenerateFromPlan: (p: PlannedEntry) => void
  compact?: boolean
}) {
  if (entry.kind === 'plan') {
    const p = entry.data
    return (
      <div className="group rounded-lg border border-dashed border-muted-foreground/30 bg-background p-2">
        <div className="flex items-start justify-between gap-1">
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[p.content_type]}`}>
            {TYPE_LABELS[p.content_type]}
          </span>
          <button
            onClick={() => onDeletePlan(p.id)}
            className="shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        <p className={`mt-1 text-muted-foreground ${compact ? 'line-clamp-2 text-[11px]' : 'text-xs'}`}>{p.topic}</p>
        <button
          onClick={() => onGenerateFromPlan(p)}
          className="mt-1.5 text-[10px] font-semibold text-primary hover:underline"
        >
          Gerar agora →
        </button>
      </div>
    )
  }

  const c = entry.data
  return (
    <div className={`rounded-lg border p-2 ${c.status === 'publicado' ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30'}`}>
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[c.type]}`}>
        {TYPE_LABELS[c.type]}
      </span>
      <p className={`mt-1 text-foreground ${compact ? 'line-clamp-2 text-[11px]' : 'text-xs'}`}>{c.input}</p>
      <button
        onClick={() => onTogglePublished(c.id, c.status)}
        className={`mt-1.5 flex items-center gap-1 text-[10px] font-semibold transition-colors ${
          c.status === 'publicado' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
        }`}
      >
        <Check className="h-3 w-3" />
        {c.status === 'publicado' ? 'Publicado' : 'Marcar publicado'}
      </button>
    </div>
  )
}

function WeekView({ days, today, getEntries, onAddPlan, onDeletePlan, onTogglePublished, onGenerateFromPlan }: WeekViewProps) {
  return (
    <>
      {/* Desktop: 7 columns */}
      <div className="hidden overflow-x-auto md:block">
        <div className="grid min-w-[700px] grid-cols-7 gap-2">
          {days.map(day => {
            const dateStr = toIso(day)
            const isToday = dateStr === today
            const { content, planned } = getEntries(dateStr)

            return (
              <div
                key={dateStr}
                className={`rounded-2xl border p-3 ${isToday ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {DAY_NAMES[day.getDay()]}
                    </p>
                    <p className={`text-xl font-bold leading-tight ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  <button
                    onClick={() => onAddPlan(dateStr)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {planned.map(p => (
                    <EntryCard
                      key={p.id}
                      entry={{ kind: 'plan', data: p }}
                      onTogglePublished={onTogglePublished}
                      onDeletePlan={onDeletePlan}
                      onGenerateFromPlan={onGenerateFromPlan}
                      compact
                    />
                  ))}
                  {content.map(c => (
                    <EntryCard
                      key={c.id}
                      entry={{ kind: 'content', data: c }}
                      onTogglePublished={onTogglePublished}
                      onDeletePlan={onDeletePlan}
                      onGenerateFromPlan={onGenerateFromPlan}
                      compact
                    />
                  ))}
                  {planned.length === 0 && content.length === 0 && (
                    <p className="py-2 text-center text-[10px] text-muted-foreground/30">·</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: vertical list */}
      <div className="space-y-3 md:hidden">
        {days.map(day => {
          const dateStr = toIso(day)
          const isToday = dateStr === today
          const { content, planned } = getEntries(dateStr)
          const hasEntries = content.length > 0 || planned.length > 0

          return (
            <div
              key={dateStr}
              className={`rounded-2xl border p-4 ${isToday ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {DAY_NAMES[day.getDay()]} {day.getDate()}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Hoje</span>
                  )}
                </div>
                <button
                  onClick={() => onAddPlan(dateStr)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {!hasEntries ? (
                <p className="text-xs text-muted-foreground/40">Nenhum post planejado</p>
              ) : (
                <div className="space-y-2">
                  {planned.map(p => (
                    <EntryCard
                      key={p.id}
                      entry={{ kind: 'plan', data: p }}
                      onTogglePublished={onTogglePublished}
                      onDeletePlan={onDeletePlan}
                      onGenerateFromPlan={onGenerateFromPlan}
                    />
                  ))}
                  {content.map(c => (
                    <EntryCard
                      key={c.id}
                      entry={{ kind: 'content', data: c }}
                      onTogglePublished={onTogglePublished}
                      onDeletePlan={onDeletePlan}
                      onGenerateFromPlan={onGenerateFromPlan}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Month View ────────────────────────────────────────────

interface MonthViewProps {
  weeks: Date[][]
  currentMonth: number
  today: string
  getDayCount: (d: string) => number
  onDayClick: (d: string) => void
}

function MonthView({ weeks, currentMonth, today, getDayCount, onDayClick }: MonthViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border last:border-0">
          {week.map(day => {
            const dateStr = toIso(day)
            const isToday = dateStr === today
            const isCurrentMonth = day.getMonth() === currentMonth
            const count = getDayCount(dateStr)

            return (
              <button
                key={dateStr}
                onClick={() => onDayClick(dateStr)}
                className={`flex min-h-[72px] flex-col items-start gap-1 border-r border-border px-2 py-2 text-left last:border-0 transition-colors hover:bg-muted/50 ${
                  isToday ? 'bg-primary/5' : ''
                } ${!isCurrentMonth ? 'opacity-35' : ''}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {day.getDate()}
                </span>
                {count > 0 && (
                  <div className="flex flex-wrap items-center gap-0.5">
                    {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    ))}
                    {count > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{count - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Calendar Page ─────────────────────────────────────────

export default function Calendar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState<'week' | 'month'>('week')
  const [referenceDate, setReferenceDate] = useState(new Date())
  const [contentEntries, setContentEntries] = useState<ContentEntry[]>([])
  const [plannedEntries, setPlannedEntries] = useState<PlannedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [addPlanFor, setAddPlanFor] = useState<string | null>(null)

  const { rangeStart, rangeEnd, weekDays, monthData } = useMemo(() => {
    if (view === 'week') {
      const start = weekStart(referenceDate)
      const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
      return {
        rangeStart: toIso(start),
        rangeEnd: toIso(addDays(start, 6)),
        weekDays: days,
        monthData: null,
      }
    }

    const year = referenceDate.getFullYear()
    const month = referenceDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const gridStart = weekStart(firstDay)
    const gridEnd = addDays(lastDay, 6 - lastDay.getDay())

    const allDays: Date[] = []
    let d = new Date(gridStart)
    while (toIso(d) <= toIso(gridEnd)) {
      allDays.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }

    const weeks: Date[][] = []
    for (let i = 0; i < allDays.length; i += 7) weeks.push(allDays.slice(i, i + 7))

    return {
      rangeStart: toIso(gridStart),
      rangeEnd: toIso(gridEnd),
      weekDays: null,
      monthData: { weeks, currentMonth: month },
    }
  }, [view, referenceDate])

  const fetchEntries = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [{ data: content }, { data: planned }] = await Promise.all([
      supabase
        .from('content')
        .select('id, type, input, status, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${rangeStart}T00:00:00`)
        .lte('created_at', `${rangeEnd}T23:59:59`),
      supabase
        .from('planned_posts')
        .select('id, topic, content_type, scheduled_date')
        .eq('user_id', user.id)
        .gte('scheduled_date', rangeStart)
        .lte('scheduled_date', rangeEnd),
    ])

    setContentEntries((content as ContentEntry[]) ?? [])
    setPlannedEntries(planned ?? [])
    setLoading(false)
  }, [user, rangeStart, rangeEnd])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  function prevPeriod() {
    setReferenceDate(d => {
      const r = new Date(d)
      if (view === 'week') r.setDate(r.getDate() - 7)
      else r.setMonth(r.getMonth() - 1)
      return r
    })
  }

  function nextPeriod() {
    setReferenceDate(d => {
      const r = new Date(d)
      if (view === 'week') r.setDate(r.getDate() + 7)
      else r.setMonth(r.getMonth() + 1)
      return r
    })
  }

  function getEntriesForDate(dateStr: string) {
    return {
      content: contentEntries.filter(e => e.created_at.slice(0, 10) === dateStr),
      planned: plannedEntries.filter(e => e.scheduled_date === dateStr),
    }
  }

  function getDayCount(dateStr: string): number {
    const { content, planned } = getEntriesForDate(dateStr)
    return content.length + planned.length
  }

  async function handleAddPlan(plan: { topic: string; content_type: ContentType; scheduled_date: string }) {
    if (!user) return
    const { error } = await supabase.from('planned_posts').insert({ user_id: user.id, ...plan })
    if (error) {
      toast.error('Erro ao salvar.')
    } else {
      setAddPlanFor(null)
      await fetchEntries()
      toast.success('Post planejado!')
    }
  }

  async function handleDeletePlan(id: string) {
    const { error } = await supabase.from('planned_posts').delete().eq('id', id)
    if (error) toast.error('Erro ao remover.')
    else setPlannedEntries(prev => prev.filter(p => p.id !== id))
  }

  async function handleTogglePublished(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'publicado' ? 'gerado' : 'publicado'
    const { error } = await supabase.from('content').update({ status: newStatus }).eq('id', id)
    if (error) toast.error('Erro ao atualizar status.')
    else setContentEntries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus as 'gerado' | 'publicado' } : e))
  }

  function handleGenerateFromPlan(plan: PlannedEntry) {
    navigate('/app', { state: { topic: plan.topic, contentType: plan.content_type } })
  }

  const periodLabel = useMemo(() => {
    if (view === 'week' && weekDays) {
      const s = weekDays[0]
      const e = weekDays[6]
      const sm = MONTH_NAMES[s.getMonth()].slice(0, 3)
      const em = MONTH_NAMES[e.getMonth()].slice(0, 3)
      const year = e.getFullYear()
      return s.getMonth() === e.getMonth()
        ? `${s.getDate()}–${e.getDate()} ${sm} ${year}`
        : `${s.getDate()} ${sm} – ${e.getDate()} ${em} ${year}`
    }
    return `${MONTH_NAMES[referenceDate.getMonth()]} ${referenceDate.getFullYear()}`
  }, [view, weekDays, referenceDate])

  const today = todayIso()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <main className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">Calendário editorial</h1>
          <div className="flex rounded-xl border border-border bg-muted p-1">
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  view === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-5 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={prevPeriod}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">{periodLabel}</span>
          <Button variant="ghost" size="sm" onClick={nextPeriod}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : view === 'week' && weekDays ? (
          <WeekView
            days={weekDays}
            today={today}
            getEntries={getEntriesForDate}
            onAddPlan={setAddPlanFor}
            onDeletePlan={handleDeletePlan}
            onTogglePublished={handleTogglePublished}
            onGenerateFromPlan={handleGenerateFromPlan}
          />
        ) : (
          monthData && (
            <MonthView
              weeks={monthData.weeks}
              currentMonth={monthData.currentMonth}
              today={today}
              getDayCount={getDayCount}
              onDayClick={d => {
                setReferenceDate(new Date(d + 'T12:00:00'))
                setView('week')
              }}
            />
          )
        )}
      </div>
      </main>

      {addPlanFor && (
        <AddPlanModal
          date={addPlanFor}
          onSave={handleAddPlan}
          onClose={() => setAddPlanFor(null)}
        />
      )}
    </div>
  )
}
