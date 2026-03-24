import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const CACHE_TTL_HOURS = 24

const SPECIALTY_PROMPTS: Record<string, string> = {
  medicina: `Você é um especialista em marketing médico no Brasil. Gere 6 temas em alta para médicos criarem posts no Instagram.
Foque em: clínica geral, cardiologia, pediatria, saúde preventiva, doenças crônicas e campanhas de saúde pública brasileiras.
Considere a sazonalidade brasileira (mês/ano atual), campanhas do Ministério da Saúde e datas comemorativas da medicina.`,

  nutricao: `Você é um especialista em marketing de nutrição no Brasil. Gere 6 temas em alta para nutricionistas criarem posts no Instagram.
Foque em: alimentação saudável, dietas, mitos alimentares, saúde intestinal, nutrição esportiva e emagrecimento com saúde.
Considere tendências alimentares no Brasil, sazonalidade de alimentos e datas comemorativas da nutrição.`,

  odontologia: `Você é um especialista em marketing odontológico no Brasil. Gere 6 temas em alta para dentistas criarem posts no Instagram.
Foque em: saúde bucal, estética dental, ortodontia, clareamento, prevenção de cáries e doenças periodontais.
Considere campanhas do CFO, sazonalidade e datas comemorativas da odontologia brasileira.`,

  psicologia: `Você é um especialista em marketing para psicólogos no Brasil. Gere 6 temas em alta para psicólogos criarem posts no Instagram.
Foque em: saúde mental, ansiedade, depressão, autoconhecimento, relacionamentos, burnout e bem-estar emocional.
Considere o contexto socioemocional brasileiro atual, datas como Janeiro Branco, Setembro Amarelo e outros marcos de saúde mental.`,
}

export interface TrendingTopic {
  title: string
  subtitle: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const url = new URL(req.url)
    const vertical = url.searchParams.get('vertical') ?? 'doctor'

    const specialtyMap: Record<string, string> = {
      doctor: 'medicina',
      nutritionist: 'nutricao',
      dentist: 'odontologia',
      psychologist: 'psicologia',
    }
    const specialty = specialtyMap[vertical] ?? 'medicina'

    // Rate limiting — max 1 request per 30 seconds per user (topics are cached, so this is generous)
    const { data: rateLimitOk } = await supabase.rpc('check_and_set_rate_limit', {
      user_id: user.id,
      min_interval_seconds: 30,
    })
    if (!rateLimitOk) {
      return new Response(JSON.stringify({ error: 'Muitas requisições.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    // Check cache
    const { data: cached } = await supabase
      .from('trending_topics')
      .select('topics, generated_at')
      .eq('specialty', specialty)
      .single()

    const now = new Date()
    const isStale = !cached || (now.getTime() - new Date(cached.generated_at).getTime()) > CACHE_TTL_HOURS * 60 * 60 * 1000

    if (!isStale && cached) {
      return new Response(JSON.stringify({ topics: cached.topics, cached: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    // Generate fresh topics
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const currentDate = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    const systemPrompt = SPECIALTY_PROMPTS[specialty]

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}

Data atual: ${currentDate}

Retorne APENAS um JSON array com 6 objetos no formato:
[
  { "title": "Título curto (máx 35 chars)", "subtitle": "Descrição curta (máx 55 chars)" },
  ...
]

Sem texto adicional, apenas o JSON.`,
        },
      ],
    })

    const raw = (message.content[0] as { text: string }).text.trim()
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid JSON from Anthropic')

    const topics: TrendingTopic[] = JSON.parse(jsonMatch[0])

    // Upsert cache
    await supabase.from('trending_topics').upsert({
      specialty,
      topics,
      generated_at: now.toISOString(),
    }, { onConflict: 'specialty' })

    return new Response(JSON.stringify({ topics, cached: false }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
