import { createClient } from 'npm:@supabase/supabase-js'

Deno.serve(async () => {
  const timestamp = new Date().toISOString()
  const headers = { 'Content-Type': 'application/json' }

  // ── 1. Init Supabase client ───────────────────────────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ── 2. Check database connectivity ────────────────────────────────────────
  let dbCheck: { status: 'ok' | 'error'; latency_ms: number; error?: string }
  const dbStart = Date.now()
  try {
    const { error: dbError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
    if (dbError) throw new Error(dbError.message)
    dbCheck = { status: 'ok', latency_ms: Date.now() - dbStart }
  } catch (err) {
    dbCheck = { status: 'error', latency_ms: Date.now() - dbStart, error: String(err) }
  }

  // ── 3. Check env var keys ─────────────────────────────────────────────────
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ? 'configured' as const : 'missing' as const
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ? 'configured' as const : 'missing' as const
  const resendKey = Deno.env.get('RESEND_API_KEY') ? 'configured' as const : 'missing' as const

  // ── 4. Daily cost from token_usage ────────────────────────────────────────
  const threshold = parseFloat(Deno.env.get('ANTHROPIC_DAILY_COST_THRESHOLD') ?? '5')
  const today = new Date().toISOString().slice(0, 10)
  let dailyCost = { used: 0, threshold, percent: 0 }

  try {
    const { data: rows } = await supabase
      .from('token_usage')
      .select('model, input_tokens, output_tokens')
      .gte('created_at', today)

    const used = (rows ?? []).reduce((sum: number, r: { model: string; input_tokens: number; output_tokens: number }) => {
      const haiku = r.model.includes('haiku')
      return sum + r.input_tokens * (haiku ? 0.25 : 3) / 1_000_000
                 + r.output_tokens * (haiku ? 1.25 : 15) / 1_000_000
    }, 0)

    const rounded = Math.round(used * 100) / 100
    dailyCost = { used: rounded, threshold, percent: Math.round((rounded / threshold) * 100) }
  } catch {
    // If token_usage query fails, leave defaults
  }

  // ── 5. Active subscribers count ───────────────────────────────────────────
  let activeSubscribers = 0
  try {
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .neq('plan', 'free')
    activeSubscribers = count ?? 0
  } catch {
    // Non-critical, leave 0
  }

  // ── 6. Determine overall status ───────────────────────────────────────────
  let status: 'healthy' | 'degraded' | 'unhealthy'

  if (dbCheck.status === 'error' || anthropicKey === 'missing') {
    status = 'unhealthy'
  } else if (dailyCost.percent >= 80 || stripeKey === 'missing' || resendKey === 'missing') {
    status = 'degraded'
  } else {
    status = 'healthy'
  }

  // ── 7. Build response ─────────────────────────────────────────────────────
  const body = {
    status,
    timestamp,
    checks: {
      database: dbCheck.error
        ? { status: dbCheck.status, latency_ms: dbCheck.latency_ms, error: dbCheck.error }
        : { status: dbCheck.status, latency_ms: dbCheck.latency_ms },
      anthropic_key: anthropicKey,
      stripe_key: stripeKey,
      resend_key: resendKey,
      daily_cost: dailyCost,
      active_subscribers: activeSubscribers,
    },
  }

  const httpStatus = status === 'unhealthy' ? 503 : 200
  return new Response(JSON.stringify(body), { status: httpStatus, headers })
})
