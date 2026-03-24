import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Você é o AI Brain do ContentFlow, especializado em criar conteúdo de alta performance para o Instagram de profissionais de saúde.

Seu objetivo: gerar conteúdo claro, envolvente, humano e orientado à conversão — que gere salvamentos, comentários e novos pacientes.

PASSO 1 — Classifique a intenção:
educational | myth_vs_truth | alert | step_by_step | authority | before_after | tip_list | q_and_a

PASSO 2 — Escolha a melhor estrutura narrativa para a intenção classificada. Varie sempre — não repita o mesmo padrão.

PASSO 3 — Gere o conteúdo conforme o tipo:

CAROUSEL (5 a 10 slides — escolha a quantidade ideal para o tema):
- Use 5 ou 6 para temas simples e diretos. Use 7 a 10 apenas se o conteúdo realmente exigir mais profundidade. Nunca adicione slides só para atingir o máximo.
- Slide 1 (hook): título que para o scroll. Varie o formato de gancho:
  • Pergunta provocativa ("Você sabia que...?")
  • Afirmação contraintuitiva ("O que você aprendeu sobre X está errado")
  • Lista numérica ("5 sinais de que...")
  • Alerta ("Pare de fazer isso agora")
- Slides do meio: conteúdo educativo, prático ou revelador. title (máx 6 palavras), body (máx 15 palavras — exceto para vertical psychologist: máx 20 palavras). Cada slide deve ter uma ideia completa e independente.
- Último slide OBRIGATÓRIO: CTA humano e direto para seguir, salvar ou entrar em contato. Varie: "Me salva pra não esquecer", "Manda esse post pra alguém que precisa", "Fala comigo pelo direct"
- caption: 2-3 frases conversacionais que complementam (não repetem) o carrossel, + máx 5 hashtags relevantes

POST:
- hook: punchline de até 10 palavras que para o scroll
- body: até 80 palavras, tom de conversa direta, use "você", seja próximo e humano
- cta: 1 frase pessoal ("me conta aqui embaixo", "salva esse post", "manda pra quem precisa ver")

STORY (roteiro teleprompter):
- Máx 60 palavras, direto ao ponto
- Primeira frase cria identificação imediata
- Estrutura: dor → virada → solução → CTA
- Tom: conversa próxima, como uma mensagem de voz para um amigo
- Use [pausa] 2-3 vezes nos momentos de maior impacto
- CTA final com urgência ou exclusividade

PASSO 4 — Personalize profundamente para o público-alvo informado. Isso NÃO é só tom — é escolha de exemplos, dores, gatilhos e CTAs:

FEMININO:
- Cite situações reais do cotidiano feminino: correria entre trabalho e família, culpa por não se cuidar, pressão estética, mudanças hormonais (TPM, menopausa, gravidez), cuidar dos outros antes de si mesma
- Use linguagem acolhedora e validadora: "você não está sozinha", "seu corpo merece atenção", "tudo bem pedir ajuda"
- Exemplos clínicos com recorte feminino: "paciente de 34 anos, mãe de dois filhos", "mulher que priorizou a família e esqueceu a própria saúde"
- CTA com convite à reflexão ou comunidade: "me conta aqui", "salva pra lembrar de você mesma", "manda pra uma amiga que precisa ver isso"

MASCULINO:
- Cite situações reais do cotidiano masculino: ignorar sintomas por achar que vai passar, resistência a consultas, pressão de performance (trabalho, esporte, vida sexual), ideia de que cuidar da saúde é frescura
- Use linguagem direta, objetiva e prática: dados, listas, "faça isso", evite rodeios
- Exemplos clínicos com recorte masculino: "homem de 40 anos que nunca fez check-up", "atleta que forçou além do limite"
- CTA com resultado concreto: "agenda sua consulta", "começa hoje", "manda pra um amigo que precisa ouvir isso"

AMBOS:
- Linguagem neutra, exemplos universais, evite mencionar gênero explicitamente
- Foque na condição ou hábito em si, não em quem é mais afetado

PASSO 5 — Tom por vertical:
- doctor: didático, ético, claro — traduz medicina complexa em linguagem acessível
- nutritionist: acolhedor, prático, motivador — transforma nutrição em hábitos alcançáveis
- dentist: tranquilizador, claro — desmistifica procedimentos e promove confiança
- psychologist: empático, reflexivo, acolhedor — humaniza saúde mental, reduz estigma, convida à reflexão sem julgamento. Evite termos clínicos pesados. Use linguagem que normalize buscar ajuda.

PASSO 6 — Quando o Perfil de marca e/ou Histórico recente forem fornecidos na mensagem do usuário:
- Nome: use de forma natural quando adiciona personalidade (ex: "Aqui é a [Nome]", "[Nome] explica"). Não force em todo slide.
- Tom de voz: aplique rigorosamente em vocabulário, ritmo e proximidade com o leitor.
- Bio: use para escolher exemplos clínicos e situações coerentes com a trajetória do profissional.
- Instagram: inclua "@handle" em CTAs quando soa natural (ex: "me chama no direct", "me segue lá"). Nunca force.
- Histórico recente: se o tópico atual for parecido com algum do histórico, mude o ângulo, a estrutura ou o gancho. Se for diferente, ignore o histórico. O objetivo é variedade — não repetição de abordagem.

PASSO 7 — Revise: linguagem simples, sem jargão, sem termos muito técnicos.
REGRA ABSOLUTA: NUNCA use o caractere "—" (travessão) em nenhuma parte do conteúdo. Substitua por ponto, vírgula ou reescreva a frase.

FORMATO DE SAÍDA OBRIGATÓRIO (JSON puro, sem markdown, sem texto antes ou depois):

Para carousel:
{"intent":"...","slides":[{"title":"...","body":"..."}],"caption":"..."}

Para post:
{"intent":"...","hook":"...","body":"...","cta":"..."}

Para story:
{"intent":"...","script":"..."}

Sempre em Português Brasileiro. Retorne APENAS o JSON.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // Rate limiting
    const { data: rateLimitOk } = await supabaseAdmin.rpc('check_and_set_rate_limit', {
      user_id: user.id,
      min_interval_seconds: 10,
    })
    if (!rateLimitOk) {
      return new Response(JSON.stringify({ error: 'Muitas requisições. Aguarde alguns segundos e tente novamente.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Plan/trial enforcement
    const { data: quota, error: quotaError } = await supabaseAdmin.rpc('try_increment_generation', { p_user_id: user.id })
    if (quotaError) throw new Error(`quota_rpc: ${quotaError.message}`)
    if (!quota?.allowed) {
      const messages: Record<string, string> = {
        trial_expired: 'Seu período de teste encerrou. Assine um plano para continuar.',
        payment_failed: 'Há um problema com seu pagamento. Acesse o portal de assinatura.',
        limit_reached: 'Limite de gerações atingido para este mês.',
        user_not_found: 'Usuário não encontrado.',
      }
      return new Response(JSON.stringify({ error: messages[quota?.reason] ?? 'Não autorizado.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (Number(req.headers.get('content-length')) > 5000) {
      return new Response(JSON.stringify({ error: 'Payload muito grande.' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { topic, context, content_type, vertical, gender, batch } = await req.json()

    const VALID_CONTENT_TYPES = ['carousel', 'post', 'story']
    const VALID_VERTICALS = ['doctor', 'nutritionist', 'dentist', 'psychologist']
    const VALID_GENDERS = ['male', 'female', 'both']

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Tópico é obrigatório.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (topic.length > 500) {
      return new Response(JSON.stringify({ error: 'Tópico muito longo (máx. 500 caracteres).' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (context && (typeof context !== 'string' || context.length > 1000)) {
      return new Response(JSON.stringify({ error: 'Contexto muito longo (máx. 1000 caracteres).' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!batch && !VALID_CONTENT_TYPES.includes(content_type)) {
      return new Response(JSON.stringify({ error: 'Tipo de conteúdo inválido.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!VALID_VERTICALS.includes(vertical)) {
      return new Response(JSON.stringify({ error: 'Vertical inválida.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!VALID_GENDERS.includes(gender)) {
      return new Response(JSON.stringify({ error: 'Público inválido.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    // Fetch brand profile + últimas 5 gerações em paralelo
    const [{ data: profile }, { data: recentContent }] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('brand_name, brand_tone, brand_bio, onboarding_goal, onboarding_posts_per_week, instagram_handle')
        .eq('id', user.id)
        .single(),
      supabaseAdmin
        .from('content')
        .select('type, input, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const genderLabel = gender === 'male' ? 'Masculino' : gender === 'female' ? 'Feminino' : 'Ambos'
    const toneLabel = profile?.brand_tone === 'formal' ? 'formal' : profile?.brand_tone === 'empatico' ? 'empático' : 'informal'

    const GOAL_LABELS: Record<string, string> = {
      attract_patients:     'atrair novos pacientes',
      build_authority:      'construir autoridade na especialidade',
      increase_engagement:  'aumentar engajamento e seguidores',
    }

    // ── Brand context ─────────────────────────────────────
    let brandContext = ''
    if (profile?.brand_name || profile?.brand_bio || profile?.instagram_handle) {
      brandContext += '\n\n[PERFIL DE MARCA]'
      if (profile?.brand_name)       brandContext += `\n- Nome: ${profile.brand_name}`
      brandContext +=                                `\n- Tom de voz: ${toneLabel}`
      if (profile?.brand_bio)        brandContext += `\n- Bio: ${profile.brand_bio}`
      if (profile?.instagram_handle) brandContext += `\n- Instagram: @${profile.instagram_handle.replace(/^@/, '')}`
    }

    if (profile?.onboarding_goal) {
      brandContext += `\n\n[OBJETIVO]\nObjetivo principal: ${GOAL_LABELS[profile.onboarding_goal] ?? profile.onboarding_goal}.`
    }

    // ── Memória de marca: histórico recente ───────────────
    let memoryContext = ''
    if (recentContent && recentContent.length > 0) {
      const TYPE_PT: Record<string, string> = { carousel: 'carrossel', post: 'post', story: 'story' }
      const daysAgo = (iso: string) => {
        const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
        return d === 0 ? 'hoje' : d === 1 ? 'ontem' : `${d}d atrás`
      }
      memoryContext = '\n\n[HISTÓRICO RECENTE: evite repetir temas; se parecido, mude o ângulo ou o gancho]\n'
      memoryContext += recentContent
        .map(c => `- ${TYPE_PT[c.type] ?? c.type}: "${c.input}" (${daysAgo(c.created_at)})`)
        .join('\n')
    }

    function extractJSON(text: string): string {
      const start = text.indexOf('{')
      if (start === -1) throw new Error('No JSON found')
      let depth = 0, inString = false, escape = false
      for (let i = start; i < text.length; i++) {
        const c = text[i]
        if (escape) { escape = false; continue }
        if (c === '\\' && inString) { escape = true; continue }
        if (c === '"') { inString = !inString; continue }
        if (inString) continue
        if (c === '{') depth++
        if (c === '}') { depth--; if (depth === 0) return text.slice(start, i + 1) }
      }
      throw new Error('Unbalanced JSON')
    }

    async function callClaude(ct: string): Promise<{ output: Record<string, unknown>; model: string; usage: { input_tokens: number; output_tokens: number } }> {
      const userMessage = `Tipo: ${ct}\nVertical: ${vertical}\nPúblico-alvo: ${genderLabel}\nTópico: ${topic}${context ? `\nContexto: ${context}` : ''}${brandContext}${memoryContext}`
      const MAX_RETRIES = 3
      let attempt = 0
      let model = 'claude-sonnet-4-6'
      while (true) {
        try {
          const message = await anthropic.messages.create({
            model,
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
          })
          const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
          return { output: JSON.parse(extractJSON(rawText)), model, usage: message.usage }
        } catch (err: unknown) {
          const status = (err as { status?: number })?.status
          if (status === 529 && model === 'claude-sonnet-4-6') {
            model = 'claude-haiku-4-5-20251001'
            continue
          }
          if (status === 429 && attempt < MAX_RETRIES - 1) {
            attempt++
            await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt))
            continue
          }
          throw err
        }
      }
    }

    // ── Batch or single generation ─────────────────────────
    let responsePayload: Record<string, unknown>

    if (batch) {
      const [carousel, post, story] = await Promise.all([
        callClaude('carousel'),
        callClaude('post'),
        callClaude('story'),
      ])

      // Log token usage for all 3 (fire-and-forget)
      const totalInput  = carousel.usage.input_tokens  + post.usage.input_tokens  + story.usage.input_tokens
      const totalOutput = carousel.usage.output_tokens + post.usage.output_tokens + story.usage.output_tokens
      supabaseAdmin.from('token_usage').insert({
        user_id: user.id,
        model: carousel.model,
        input_tokens: totalInput,
        output_tokens: totalOutput,
      }).catch(e => console.error('token_usage log error:', e))

      responsePayload = {
        batch: true,
        outputs: {
          carousel: carousel.output,
          post: post.output,
          story: story.output,
        },
        new_count: quota.new_count,
      }
    } else {
      const { output, model, usage } = await callClaude(content_type)

      // Log token usage for cost tracking (fire-and-forget)
      supabaseAdmin.from('token_usage').insert({
        user_id: user.id,
        model,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
      }).then(async () => {
      // Check daily cost against threshold
      const threshold = parseFloat(Deno.env.get('ANTHROPIC_DAILY_COST_THRESHOLD') ?? '5')
      const today = new Date().toISOString().slice(0, 10)
      const { data: rows } = await supabaseAdmin
        .from('token_usage')
        .select('model, input_tokens, output_tokens')
        .gte('created_at', today)
      const costUSD = (rows ?? []).reduce((sum: number, r: { model: string; input_tokens: number; output_tokens: number }) => {
        const haiku = r.model.includes('haiku')
        return sum + r.input_tokens * (haiku ? 0.25 : 3) / 1_000_000
                   + r.output_tokens * (haiku ? 1.25 : 15) / 1_000_000
      }, 0)
      if (costUSD >= threshold) {
        const { count } = await supabaseAdmin
          .from('cost_alerts_log')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today)
        if ((count ?? 0) === 0) {
          const resendKey = Deno.env.get('RESEND_API_KEY')
          const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'bezerra@belvy.com.br'
          if (resendKey) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'ContentFlow <contato@flowcontent.com.br>',
                to: [adminEmail],
                subject: `[ALERTA] Custo Anthropic: $${costUSD.toFixed(2)} hoje`,
                html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e23"><div style="background:#b45309;padding:24px 32px;border-radius:12px 12px 0 0"><p style="color:#fff;font-size:18px;font-weight:600;margin:0">Alerta de custo Anthropic</p></div><div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px"><p style="font-size:15px;margin:0 0 12px">O custo acumulado de hoje atingiu <strong>$${costUSD.toFixed(2)}</strong>, ultrapassando o limite de <strong>$${threshold.toFixed(2)}</strong>.</p><p style="font-size:14px;color:#64748b;margin:0">Verifique o painel admin para identificar possível abuso ou bug de loop.</p></div></div>`,
              }),
            }).catch(e => console.error('cost alert email error:', e))
            await supabaseAdmin.from('cost_alerts_log').insert({ threshold_usd: threshold, daily_cost_usd: costUSD })
          }
        }
      }
      }).catch(e => console.error('token_usage log error:', e))

      responsePayload = { output, new_count: quota.new_count }
    }

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('generate error:', error)
    return new Response(JSON.stringify({ error: 'Falha ao gerar conteúdo. Tente novamente.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
