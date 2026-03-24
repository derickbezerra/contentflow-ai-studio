import { createClient } from 'npm:@supabase/supabase-js'

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'bezerra@belvy.com.br'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Custos fixos mensais (R$) ─────────────────────────────
const CUSTO_INFRAESTRUTURA = 3.33  // Domínio (R$40/ano ÷ 12); Supabase e Vercel no plano free

// ── Preços por plano (R$) ─────────────────────────────────
const PRECO: Record<string, number> = { starter: 27, growth: 47, pro: 97 }

// ── Custo estimado por geração (R$) ───────────────────────
// Claude Sonnet 4.6: ~$0.018/geração × R$5.80/USD ≈ R$0.10
const CUSTO_POR_GERACAO = 0.10

// ── Taxa Stripe por transação ─────────────────────────────
const STRIPE_PERCENTUAL = 0.0399
const STRIPE_FIXO = 0.39

function fmtCohortLabel(month: string): string {
  const [year, m] = month.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[parseInt(m) - 1]}/${year.slice(2)}`
}

const REASON_LABELS: Record<string, string> = {
  preco: 'Preço alto',
  nao_uso: 'Não usa',
  falta_feature: 'Falta feature',
  outro: 'Outro',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const [{ data: users }, { data: content }, { data: cancelSurveysRaw }] = await Promise.all([
      supabase.from('users').select('id, email, vertical, plan, trial_ends_at, created_at, payment_status, cancel_at_period_end, current_period_end').order('created_at', { ascending: false }),
      supabase.from('content').select('id, user_id, type, created_at').order('created_at', { ascending: true }),
      supabase.from('cancel_surveys').select('id, user_id, reason, comment, created_at').order('created_at', { ascending: false }).limit(50),
    ])

    const now = new Date()
    const byPlan: Record<string, number> = { free: 0, starter: 0, growth: 0, pro: 0 }
    const byVertical: Record<string, number> = {}
    const usersByDay: Record<string, number> = {}
    let inTrial = 0, paying = 0, churned = 0, cancelingCount = 0

    for (const u of users || []) {
      byPlan[u.plan] = (byPlan[u.plan] || 0) + 1
      if (u.vertical) byVertical[u.vertical] = (byVertical[u.vertical] || 0) + 1
      if (u.trial_ends_at && new Date(u.trial_ends_at) > now && u.plan === 'free') inTrial++
      if (['starter', 'growth', 'pro'].includes(u.plan)) paying++
      if (u.payment_status === 'canceled' && u.plan === 'free') churned++
      if (u.cancel_at_period_end) cancelingCount++
      const day = u.created_at.slice(0, 10)
      usersByDay[day] = (usersByDay[day] || 0) + 1
    }

    const byType: Record<string, number> = { carousel: 0, post: 0, story: 0 }
    const contentByDay: Record<string, number> = {}
    const firstGenByUser: Record<string, string> = {}
    for (const c of content || []) {
      byType[c.type] = (byType[c.type] || 0) + 1
      const day = c.created_at.slice(0, 10)
      contentByDay[day] = (contentByDay[day] || 0) + 1
      if (!firstGenByUser[c.user_id]) {
        firstGenByUser[c.user_id] = c.created_at
      }
    }

    const days30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().slice(0, 10)
    })

    // Cumulative user growth
    let cumulative = 0
    for (const [day, count] of Object.entries(usersByDay)) {
      if (day < days30[0]) cumulative += count
    }
    const usersGrowth = days30.map(date => {
      cumulative += usersByDay[date] || 0
      return { date, novos: usersByDay[date] || 0, total: cumulative }
    })

    const contentGrowth = days30.map(date => ({ date, count: contentByDay[date] || 0 }))

    // ── Receita ───────────────────────────────────────────
    const mrr = (byPlan.starter || 0) * 27 + (byPlan.growth || 0) * 47 + (byPlan.pro || 0) * 97

    // ── Custos variáveis ──────────────────────────────────
    const geracoes30d = days30.reduce((sum, date) => sum + (contentByDay[date] || 0), 0)
    const custoAnthropic = Math.round(geracoes30d * CUSTO_POR_GERACAO * 100) / 100

    const custoStripe = Math.round(
      Object.entries(PRECO).reduce((sum, [plan, preco]) => {
        return sum + (byPlan[plan] || 0) * (preco * STRIPE_PERCENTUAL + STRIPE_FIXO)
      }, 0) * 100
    ) / 100

    const custoTotal = Math.round((custoAnthropic + custoStripe + CUSTO_INFRAESTRUTURA) * 100) / 100
    const lucro = Math.round((mrr - custoTotal) * 100) / 100
    const margem = mrr > 0 ? Math.round((lucro / mrr) * 1000) / 10 : 0
    const arpu = paying > 0 ? Math.round((mrr / paying) * 100) / 100 : 0

    // ── Analytics de ativação ─────────────────────────────
    const usersWithContent = Object.keys(firstGenByUser).length
    const totalUsers = users?.length || 0
    const activationRate = totalUsers > 0 ? Math.round((usersWithContent / totalUsers) * 100) : 0

    let totalDaysToFirst = 0
    let daysCount = 0
    for (const u of users || []) {
      if (firstGenByUser[u.id]) {
        const days = (new Date(firstGenByUser[u.id]).getTime() - new Date(u.created_at).getTime()) / 86400000
        totalDaysToFirst += Math.max(0, days)
        daysCount++
      }
    }
    const avgDaysToFirstGeneration = daysCount > 0
      ? Math.round((totalDaysToFirst / daysCount) * 10) / 10
      : null

    const totalContent = content?.length || 0
    const generationsPerActiveUser = usersWithContent > 0
      ? Math.round((totalContent / usersWithContent) * 10) / 10
      : 0

    // ── Cohort dashboard ──────────────────────────────────
    const cohortMap: Record<string, { total: number; paying: number; churned: number; free: number }> = {}
    for (const u of users || []) {
      const month = u.created_at.slice(0, 7)
      if (!cohortMap[month]) cohortMap[month] = { total: 0, paying: 0, churned: 0, free: 0 }
      cohortMap[month].total++
      if (['starter', 'growth', 'pro'].includes(u.plan)) cohortMap[month].paying++
      else if (u.payment_status === 'canceled') cohortMap[month].churned++
      else cohortMap[month].free++
    }
    const cohorts = Object.entries(cohortMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        label: fmtCohortLabel(month),
        ...data,
        retentionRate: data.total > 0 ? Math.round((data.paying / data.total) * 100) : 0,
      }))

    // ── Cancel surveys — cross-referenced with actual Stripe cancellations ────────
    // Only count surveys where Stripe webhook confirmed the cancellation
    const actualCanceledIds = new Set(
      (users || [])
        .filter((u: { cancel_at_period_end: boolean; payment_status: string }) => u.cancel_at_period_end || u.payment_status === 'canceled')
        .map((u: { id: string }) => u.id)
    )
    const confirmedSurveys = (cancelSurveysRaw || []).filter((s: { user_id: string }) => actualCanceledIds.has(s.user_id))

    const byReason: Record<string, number> = { preco: 0, nao_uso: 0, falta_feature: 0, outro: 0 }
    for (const s of confirmedSurveys) {
      byReason[(s as { reason: string }).reason] = (byReason[(s as { reason: string }).reason] || 0) + 1
    }

    // Users who canceled via Stripe directly without filling the survey
    const surveyUserIds = new Set(confirmedSurveys.map((s: { user_id: string }) => s.user_id))
    const withoutSurvey = [...actualCanceledIds].filter(id => !surveyUserIds.has(id)).length

    const cancelSurveys = {
      byReason,
      reasonLabels: REASON_LABELS,
      recent: confirmedSurveys.slice(0, 10).map(s => ({
        reason: s.reason,
        comment: s.comment,
        createdAt: s.created_at,
      })),
      withoutSurvey,
      totalConfirmed: confirmedSurveys.length,
    }

    return new Response(JSON.stringify({
      users: {
        total: totalUsers,
        paying,
        inTrial,
        churned,
        cancelingCount,
        churnRate: (paying + churned) > 0 ? Math.round((churned / (paying + churned)) * 100) : 0,
        conversionRate: totalUsers ? Math.round((paying / totalUsers) * 100) : 0,
        byPlan,
        byVertical,
        growth: usersGrowth,
        recent: (users || []).slice(0, 8).map(u => ({
          email: u.email,
          plan: u.plan,
          vertical: u.vertical,
          joinedAt: u.created_at,
        })),
      },
      content: {
        total: totalContent,
        byType,
        growth: contentGrowth,
        geracoes30d,
      },
      financeiro: {
        mrr,
        arpu,
        custos: {
          anthropic: custoAnthropic,
          stripe: custoStripe,
          infraestrutura: CUSTO_INFRAESTRUTURA,
          total: custoTotal,
        },
        lucro,
        margem,
      },
      activation: {
        activationRate,
        avgDaysToFirstGeneration,
        generationsPerActiveUser,
        activeUsers: usersWithContent,
      },
      cohorts,
      cancelSurveys,
      // legacy
      mrr,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
  }
})
