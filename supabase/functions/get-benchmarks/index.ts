import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VERTICALS = ['doctor', 'nutritionist', 'dentist', 'psychologist'] as const
type Vertical = typeof VERTICALS[number]

interface VerticalBenchmark {
  avgMonthlyGenerations: number
  activeUsers: number
  formatDistribution: { carousel: number; post: number; story: number }
}

// Module-level cache (persists across requests within the same isolate)
let cache: { data: Record<Vertical, VerticalBenchmark>; expiresAt: number } | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Serve from cache if fresh
  if (cache && Date.now() < cache.expiresAt) {
    return new Response(JSON.stringify(cache.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch content from last 30 days + user verticals in parallel
    const [{ data: contentRows }, { data: userRows }] = await Promise.all([
      supabaseAdmin
        .from('content')
        .select('user_id, type')
        .gte('created_at', thirtyDaysAgo),
      supabaseAdmin
        .from('users')
        .select('id, vertical')
        .in('vertical', VERTICALS as unknown as string[]),
    ])

    // Build user → vertical lookup
    const verticalMap = Object.fromEntries(
      (userRows ?? []).map((u: { id: string; vertical: string }) => [u.id, u.vertical])
    )

    const result = {} as Record<Vertical, VerticalBenchmark>

    for (const v of VERTICALS) {
      const rows = (contentRows ?? []).filter(
        (r: { user_id: string; type: string }) => verticalMap[r.user_id] === v
      )
      const activeUsers = new Set(rows.map((r: { user_id: string }) => r.user_id)).size
      const total = rows.length

      const counts = { carousel: 0, post: 0, story: 0 }
      for (const r of rows) {
        if (r.type === 'carousel' || r.type === 'post' || r.type === 'story') {
          counts[r.type as keyof typeof counts]++
        }
      }

      result[v] = {
        avgMonthlyGenerations: activeUsers > 0 ? Math.round(total / activeUsers) : 0,
        activeUsers,
        formatDistribution: {
          carousel: total > 0 ? Math.round((counts.carousel / total) * 100) : 0,
          post:     total > 0 ? Math.round((counts.post     / total) * 100) : 0,
          story:    total > 0 ? Math.round((counts.story    / total) * 100) : 0,
        },
      }
    }

    cache = { data: result, expiresAt: Date.now() + CACHE_TTL_MS }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('get-benchmarks error:', error)
    return new Response(JSON.stringify({ error: 'Falha ao carregar benchmarks.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
