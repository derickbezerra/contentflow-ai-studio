import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const ALLOWED_ORIGINS = [
    'https://flowcontent.com.br',
    'https://www.flowcontent.com.br',
    'https://contentflow-ai-studio.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
  ]
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

const SYSTEM_PROMPT = `Você é o AI Brain do ContentFlow, especializado em criar conteúdo de alta performance para o Instagram de profissionais de saúde.

REGRAS DE COMPLIANCE — LEIA ANTES DE ESCREVER QUALQUER PALAVRA:
O conteúdo gerado NUNCA deve ter warnings nem issues. Se durante a escrita você perceber que um trecho criaria um alerta, REESCREVA-O antes de incluir. Os campos "issues" e "warnings" no JSON final DEVEM ser sempre arrays vazios.

Padrões PROIBIDOS para TODOS os profissionais de saúde:
- Nunca use linguagem que crie medo para converter ("sua saúde não pode esperar", "não deixe para tarde demais", "o risco é maior do que você imagina")
- Nunca prometa ou sugira resultado clínico específico, mesmo de forma implícita
- Nunca use comparações antes/depois, superlativos de auto-promoção ou depoimentos de pacientes
- Nunca induza urgência baseada em risco de saúde como gatilho de venda ou conversão
- Em vez de urgência pelo medo, use motivação positiva: curiosidade, empoderamento, cuidado preventivo como escolha consciente

Reescritas obrigatórias antes de incluir no output:
✗ "A saúde do seu filho não pode esperar" → ✓ "Cuidar da saúde do seu filho é um ato de amor preventivo"
✗ "Cuide antes que o coração avise" → ✓ "Cardiopatia tem prevenção — e começa agora"
✗ "Não deixe para depois" → ✓ "O check-up de rotina é o seu aliado mais subestimado"
✗ "O risco é maior do que você imagina" → ✓ "Entender os fatores de risco muda completamente a abordagem"


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
- caption: 2-3 frases conversacionais que complementam (não repetem) o carrossel. Inclua no final até 5 hashtags relevantes diretamente no texto, sem nenhum rótulo, prefixo ou label antes delas (ex: nunca escreva "hashtags:", "Até 5 hashtags:" ou similar — apenas as hashtags)

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
- Público-alvo [PÚBLICO-ALVO]: se fornecido, adapte ângulo, exemplos e gatilhos do conteúdo:
  • Intenção primária domina o enquadramento. Intenção secundária reforça com elementos complementares.
  • Estético: transformação visual, autoconfiança, resultados de aparência, antes/depois
  • Dor/Sintoma: linguagem de alívio, urgência moderada, "você não precisa viver assim"
  • Preventivo: "cuide agora para não se arrepender depois", risco como motivação, check-up como hábito
  • Crônico: empatia profunda, gestão contínua, qualidade de vida no dia a dia
  • Premium: sofisticação, exclusividade, excelência e personalização do cuidado
  • Geral: linguagem acessível, exemplos amplos, sem recorte específico
  • Faixa 18-25: linguagem jovem e direta, referências contemporâneas, tom de descoberta
  • Faixa 25-35: praticidade, equilíbrio carreira/família, conteúdo rápido e direto
  • Faixa 35-50: prevenção e qualidade de vida, "invista na sua saúde agora"
  • Faixa 50+: autonomia, conforto, clareza sem jargão, ênfase em bem-estar e independência

PASSO 7 — Revise: linguagem simples, sem jargão, sem termos muito técnicos.
REGRA ABSOLUTA: NUNCA use o caractere "—" (travessão) em nenhuma parte do conteúdo. Substitua por ponto, vírgula ou reescreva a frase.

PASSO 8 — Valide TODO o conteúdo gerado contra as normas éticas do conselho profissional da vertical informada. Isso inclui TODOS os formatos:
- Carousel: valide cada slide (title + body) E a caption
- Post: valide o hook, o body E o cta
- Story: valide o script inteiro
Nenhuma parte do output está isenta de compliance — um hook proibido invalida o post inteiro, assim como uma caption proibida invalida o carrossel.

CFM (doctor) — Resolução CFM 1974/2011 + Código de Ética Médica:
PROIBIDO: comparação antes/depois explícita ou implícita, garantias de resultado clínico ("você vai conseguir X", "elimine Y em Z semanas"), superlativos de auto-promoção ("melhor médico/a", "único tratamento"), depoimentos de pacientes, preço como argumento de venda, linguagem que crie expectativa irreal ou induza medo para converter.

CFO (dentist) — Código de Ética Odontológica:
PROIBIDO: fotos ou comparações antes/depois de sorriso/tratamento, garantia de resultado estético ("vai ficar perfeito", "sorriso dos sonhos garantido"), comparação com outros profissionais ou clínicas, divulgação de preços como apelo de marketing, linguagem sensacionalista ou que prometa resultado específico.

CFP (psychologist) — Resolução CFP 11/2012:
PROIBIDO: divulgar casos clínicos mesmo sem identificar o paciente, garantir resultado terapêutico ("você vai se curar", "resolva sua ansiedade em X sessões"), usar técnicas psicológicas como gatilho de venda, sensacionalismo sobre transtornos, linguagem que romantize ou banalize sofrimento psíquico, diagnóstico de transtorno aplicado ao leitor.

CFN (nutritionist) — Código de Ética do Nutricionista:
PROIBIDO: prometer emagrecimento em quantidade ou tempo específico ("perca X kg em Y semanas"), dietas milagrosas ou restritivas sem base científica, classificar alimentos como "proibidos" ou "milagrosos" de forma absoluta, fotos ou comparações antes/depois de corpo, garantias de resultado.

Com base na vertical da mensagem do usuário, preencha o campo "compliance":
- "approved": true se nenhuma regra for violada; false se houver violação clara
- "council": sigla do conselho correspondente à vertical ("CFM", "CFO", "CFP", "CFN")
- "issues": array de strings descrevendo violações encontradas (DEVE ser [] — se encontrou algo, você falhou na geração)
- "warnings": array de strings com alertas de risco (DEVE ser [] — se encontrou algo, você falhou na geração e deve ter reescrito antes)

IMPORTANTE: se ao validar você encontrar qualquer issue ou warning, significa que o conteúdo que você gerou violou as REGRAS DE COMPLIANCE do início deste prompt. O resultado esperado é sempre approved:true, issues:[], warnings:[]. Linguagem educativa, preventiva e motivacional positiva é permitida e desejada — o que é proibido é usar medo ou urgência como gatilho de conversão.

FORMATO DE SAÍDA OBRIGATÓRIO (JSON puro, sem markdown, sem texto antes ou depois):

Para carousel:
{"intent":"...","slides":[{"title":"...","body":"..."}],"caption":"...","compliance":{"approved":true,"council":"CFM","issues":[],"warnings":[]}}

Para post:
{"intent":"...","hook":"...","body":"...","cta":"...","compliance":{"approved":true,"council":"CFM","issues":[],"warnings":[]}}

Para story:
{"intent":"...","script":"...","compliance":{"approved":true,"council":"CFM","issues":[],"warnings":[]}}

Sempre em Português Brasileiro. Retorne APENAS o JSON.`

const PRIMARY_MODEL = Deno.env.get('ANTHROPIC_PRIMARY_MODEL') ?? 'claude-sonnet-4-6'
const FALLBACK_MODEL = Deno.env.get('ANTHROPIC_FALLBACK_MODEL') ?? 'claude-haiku-4-5-20251001'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  // Verify JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
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
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
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
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
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
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    if (Number(req.headers.get('content-length')) > 5000) {
      return new Response(JSON.stringify({ error: 'Payload muito grande.' }), {
        status: 413,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const { topic, context, content_type, vertical, gender, batch, patient_intent, patient_intents, age_ranges, medical_specialty, stream: streamMode } = await req.json()

    const VALID_CONTENT_TYPES = ['carousel', 'post', 'story']
    const VALID_VERTICALS = ['doctor', 'nutritionist', 'dentist', 'psychologist']
    const VALID_GENDERS = ['male', 'female', 'both']

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Tópico é obrigatório.' }), {
        status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }
    if (topic.length > 500) {
      return new Response(JSON.stringify({ error: 'Tópico muito longo (máx. 500 caracteres).' }), {
        status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }
    if (context && (typeof context !== 'string' || context.length > 1000)) {
      return new Response(JSON.stringify({ error: 'Contexto muito longo (máx. 1000 caracteres).' }), {
        status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }
    if (!batch && !VALID_CONTENT_TYPES.includes(content_type)) {
      return new Response(JSON.stringify({ error: 'Tipo de conteúdo inválido.' }), {
        status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }
    if (!VALID_VERTICALS.includes(vertical)) {
      return new Response(JSON.stringify({ error: 'Vertical inválida.' }), {
        status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }
    if (!VALID_GENDERS.includes(gender)) {
      return new Response(JSON.stringify({ error: 'Público inválido.' }), {
        status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // [A7] Verificação de custo diário PRÉ-requisição
    // RISCO RESIDUAL: usa SELECT simples (sem FOR UPDATE) em tabela append-only.
    // Requisições simultâneas podem passar pelo check ao mesmo tempo antes de qualquer
    // insert ser registrado — o bloqueio é best-effort, não atômico. Para eliminar
    // completamente a race condition seria necessário uma função RPC com locking explícito.
    let forceHaiku = false
    {
      const threshold = parseFloat(Deno.env.get('ANTHROPIC_DAILY_COST_THRESHOLD') ?? '5')
      const today = new Date().toISOString().slice(0, 10)
      const { data: rows } = await supabaseAdmin
        .from('token_usage')
        .select('model, input_tokens, output_tokens')
        .gte('created_at', today)
      const dailyCostUSD = (rows ?? []).reduce((sum: number, r: { model: string; input_tokens: number; output_tokens: number }) => {
        const haiku = r.model.includes('haiku')
        return sum + r.input_tokens * (haiku ? 0.25 : 3) / 1_000_000
                   + r.output_tokens * (haiku ? 1.25 : 15) / 1_000_000
      }, 0)
      if (dailyCostUSD >= threshold * 2) {
        // Emergency stop: cost exceeded 2x threshold
        return new Response(JSON.stringify({ error: 'Serviço temporariamente indisponível. Tente novamente mais tarde.' }), {
          status: 503,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        })
      }
      if (dailyCostUSD >= threshold) {
        console.warn('Daily cost threshold reached, switching to Haiku-only mode')
        forceHaiku = true
      }
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    // Fetch brand profile + últimas 5 gerações em paralelo
    const [{ data: profile }, { data: recentContent }] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('brand_name, brand_tone, brand_bio, onboarding_goal, onboarding_posts_per_week, instagram_handle, patient_intent_primary, patient_intent_secondary, age_range')
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
    if (vertical === 'doctor' && medical_specialty && typeof medical_specialty === 'string') {
      brandContext += `\n\n[SUBESPECIALIDADE MÉDICA]\nEste médico é especialista em **${medical_specialty}**. Todo o conteúdo deve ser direcionado especificamente para esta especialidade: use exemplos clínicos, terminologia, situações do dia a dia e gatilhos emocionais típicos de pacientes de **${medical_specialty}**. Não use exemplos genéricos de medicina — seja específico para esta área.`
    }
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

    const INTENT_LABELS: Record<string, string> = {
      estetico:   'estético (aparência e autoestima)',
      dor:        'com dor (alívio e tratamento)',
      preventivo: 'preventivo (prevenção e check-up)',
      cronico:    'crônico (condições contínuas)',
      premium:    'premium (público de alta renda)',
    }

    const resolvedIntents: string[] = patient_intents?.length
      ? patient_intents
      : patient_intent
        ? [patient_intent]
        : [profile?.patient_intent_primary, profile?.patient_intent_secondary].filter(Boolean) as string[]
    const resolvedAgeRanges = (age_ranges?.length ? age_ranges : profile?.age_range) as string[] | undefined

    if (resolvedIntents.length || resolvedAgeRanges?.length) {
      brandContext += '\n\n[PÚBLICO-ALVO]'
      const PRIORITY_LABELS = ['principal', 'secundária', 'terciária']
      resolvedIntents.forEach((intent, idx) => {
        brandContext += `\n- Intenção ${PRIORITY_LABELS[idx] ?? idx + 1}ª: ${INTENT_LABELS[intent] ?? intent}`
      })
      if (resolvedAgeRanges && resolvedAgeRanges.length > 0) {
        brandContext += `\n- Faixa etária do paciente: ${resolvedAgeRanges.join(', ')} anos`
      }
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

    async function sendAnthropicAuthAlert(errorStatus: number) {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const { count } = await supabaseAdmin
          .from('cost_alerts_log')
          .select('*', { count: 'exact', head: true })
          .eq('alert_type', 'anthropic_auth_error')
          .gte('created_at', today)
        if ((count ?? 0) > 0) return // Already sent today

        const resendKey = Deno.env.get('RESEND_API_KEY')
        const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'bezerra@belvy.com.br'
        if (!resendKey) return

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'ContentFlow <contato@flowcontent.com.br>',
            to: [adminEmail],
            subject: '[URGENTE] ContentFlow: Erro de autenticação Anthropic',
            html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e23"><div style="background:#dc2626;padding:24px 32px;border-radius:12px 12px 0 0"><p style="color:#fff;font-size:18px;font-weight:600;margin:0">Erro de autenticação Anthropic</p></div><div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px"><p style="font-size:15px;margin:0 0 12px">A API da Anthropic retornou erro <strong>${errorStatus}</strong>. Verifique a API key e o billing em <a href="https://console.anthropic.com">console.anthropic.com</a>.</p><p style="font-size:14px;color:#64748b;margin:0">As gerações estão bloqueadas até que o problema seja resolvido.</p></div></div>`,
          }),
        }).catch(e => console.error('auth alert email error:', e))

        await supabaseAdmin.from('cost_alerts_log').insert({
          alert_type: 'anthropic_auth_error',
          threshold_usd: 0,
          daily_cost_usd: 0,
        })
      } catch (e) {
        console.error('sendAnthropicAuthAlert error:', e)
      }
    }

    async function callClaude(ct: string): Promise<{ output: Record<string, unknown>; model: string; usage: { input_tokens: number; output_tokens: number } }> {
      const userMessage = `Tipo: ${ct}\nVertical: ${vertical}\nPúblico-alvo: ${genderLabel}\nTópico: ${topic}${context ? `\nContexto: ${context}` : ''}${brandContext}${memoryContext}`
      const MAX_RETRIES = 3
      const TIMEOUT_MS = 30_000
      let attempt = 0
      let model = forceHaiku ? FALLBACK_MODEL : PRIMARY_MODEL
      while (true) {
        const abortController = new AbortController()
        const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_MS)
        try {
          const message = await anthropic.messages.create({
            model,
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
            signal: abortController.signal,
          })
          clearTimeout(timeoutId)
          const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
          return { output: JSON.parse(extractJSON(rawText)), model, usage: message.usage }
        } catch (err: unknown) {
          clearTimeout(timeoutId)
          const status = (err as { status?: number })?.status
          const isAbort = err instanceof DOMException && err.name === 'AbortError'
          if ((status === 529 || isAbort) && model === PRIMARY_MODEL) {
            console.warn(`Sonnet ${isAbort ? 'timeout' : '529'}, falling back to Haiku`)
            model = FALLBACK_MODEL
            continue
          }
          if (status === 429 && attempt < MAX_RETRIES - 1) {
            attempt++
            await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt))
            continue
          }
          if (status === 401 || status === 402) {
            sendAnthropicAuthAlert(status).catch(e => console.error('auth alert fire-and-forget error:', e))
          }
          throw err
        }
      }
    }

    // ── Streaming single generation ────────────────────────
    if (!batch && streamMode) {
      const enc = new TextEncoder()
      const send = (controller: ReadableStreamDefaultController, data: object) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))

      const readable = new ReadableStream({
        async start(controller) {
          try {
            let fullText = ''
            const streamMsg = `Tipo: ${content_type}\nVertical: ${vertical}\nPúblico-alvo: ${genderLabel}\nTópico: ${topic}${context ? `\nContexto: ${context}` : ''}${brandContext}${memoryContext}`

            const STREAM_TIMEOUT_MS = 30_000

            async function streamFromModel(model: string): Promise<{ fullText: string; model: string }> {
              const abortController = new AbortController()
              const timeout = setTimeout(() => abortController.abort(), STREAM_TIMEOUT_MS)

              try {
                const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
                    'anthropic-version': '2023-06-01',
                  },
                  body: JSON.stringify({
                    model,
                    max_tokens: 2048,
                    stream: true,
                    system: SYSTEM_PROMPT,
                    messages: [{ role: 'user', content: streamMsg }],
                  }),
                  signal: abortController.signal,
                })

                if (anthropicRes.status === 529) {
                  throw Object.assign(new Error('Overloaded'), { status: 529 })
                }
                if (!anthropicRes.ok) {
                  if (anthropicRes.status === 401 || anthropicRes.status === 402) {
                    sendAnthropicAuthAlert(anthropicRes.status).catch(e => console.error('auth alert fire-and-forget error:', e))
                  }
                  const errText = await anthropicRes.text()
                  throw Object.assign(new Error(`Anthropic ${anthropicRes.status}: ${errText}`), { status: anthropicRes.status })
                }

                let text = ''
                const reader = anthropicRes.body!.getReader()
                const dec = new TextDecoder()
                let lineBuf = ''

                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break
                  lineBuf += dec.decode(value, { stream: true })
                  const lines = lineBuf.split('\n')
                  lineBuf = lines.pop() ?? ''
                  for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    const raw = line.slice(6).trim()
                    if (raw === '[DONE]') continue
                    try {
                      const parsed = JSON.parse(raw)
                      if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                        text += parsed.delta.text
                        send(controller, { t: parsed.delta.text })
                      }
                    } catch { /* skip malformed SSE line */ }
                  }
                }

                return { fullText: text, model }
              } finally {
                clearTimeout(timeout)
              }
            }

            let streamModel = forceHaiku ? FALLBACK_MODEL : PRIMARY_MODEL
            try {
              const result = await streamFromModel(streamModel)
              fullText = result.fullText
              streamModel = result.model
            } catch (err: unknown) {
              const status = (err as { status?: number })?.status
              const isAbort = err instanceof DOMException && err.name === 'AbortError'
              if ((status === 529 || isAbort) && streamModel === PRIMARY_MODEL) {
                console.warn(`Sonnet ${isAbort ? 'timeout' : '529'} (stream), falling back to Haiku`)
                streamModel = FALLBACK_MODEL
                const result = await streamFromModel(streamModel)
                fullText = result.fullText
                streamModel = result.model
              } else {
                throw err
              }
            }

            const output = JSON.parse(extractJSON(fullText))
            const modelUsed = streamModel.includes('haiku') ? 'haiku' : 'sonnet'
            send(controller, { done: true, output, model_used: modelUsed, new_count: quota.new_count })

            // Log estimated token usage for streaming (approximate)
            const estimatedInputTokens = Math.ceil((SYSTEM_PROMPT.length + streamMsg.length) / 4)
            const estimatedOutputTokens = Math.ceil(fullText.length / 4)
            supabaseAdmin.from('token_usage').insert({
              user_id: user.id,
              model: streamModel,
              input_tokens: estimatedInputTokens,
              output_tokens: estimatedOutputTokens,
            }).catch(e => console.error('token_usage log error (stream):', e))
          } catch (e) {
            console.error('Stream error:', e)
            send(controller, { error: 'Erro ao gerar conteúdo. Tente novamente.' })
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no',
        },
      })
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

      const batchModels = new Set([carousel.model, post.model, story.model])
      const modelUsed = batchModels.has(FALLBACK_MODEL) ? 'haiku' : 'sonnet'

      responsePayload = {
        batch: true,
        outputs: {
          carousel: carousel.output,
          post: post.output,
          story: story.output,
        },
        model_used: modelUsed,
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

      responsePayload = {
        output,
        model_used: model.includes('haiku') ? 'haiku' : 'sonnet',
        new_count: quota.new_count,
      }
    }

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('generate error:', error)
    return new Response(JSON.stringify({ error: 'Falha ao gerar conteúdo. Tente novamente.' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
