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

const COUNCIL_RULES: Record<string, { name: string; rules: string }> = {
  doctor: {
    name: 'CFM',
    rules: `CFM (Conselho Federal de Medicina) — Resolução CFM 1974/2011 + Código de Ética Médica:
PROIBIDO:
- Comparação antes/depois explícita ou implícita de resultados clínicos
- Garantias de resultado clínico ("você vai conseguir X", "elimine Y em Z semanas", "tratamento definitivo")
- Superlativos de auto-promoção ("melhor médico/a", "único tratamento", "mais avançado do Brasil")
- Depoimentos de pacientes identificados ou não
- Preço como argumento de venda ou urgência financeira
- Linguagem que crie expectativa irreal, induza medo para converter ou pressione consulta por urgência falsa
- Diagnóstico aplicado ao leitor sem avaliação presencial
- Promessas de cura ou resolução definitiva`,
  },
  dentist: {
    name: 'CFO',
    rules: `CFO (Conselho Federal de Odontologia) — Código de Ética Odontológica:
PROIBIDO:
- Fotos ou comparações antes/depois de sorriso, dentes ou procedimentos
- Garantia de resultado estético ("vai ficar perfeito", "sorriso dos sonhos garantido", "resultado incrível")
- Comparação com outros profissionais ou clínicas
- Divulgação de preços como apelo de marketing ou urgência
- Linguagem sensacionalista ou que prometa resultado específico
- Uso de termos como "painless", "sem dor garantido" sem ressalvas
- Promoções com prazo limitado para procedimentos`,
  },
  psychologist: {
    name: 'CFP',
    rules: `CFP (Conselho Federal de Psicologia) — Resolução CFP 11/2012:
PROIBIDO:
- Divulgar casos clínicos mesmo sem identificar o paciente
- Garantir resultado terapêutico ("você vai se curar", "resolva sua ansiedade em X sessões")
- Usar técnicas psicológicas como gatilho de venda (ex: "método exclusivo que cura...")
- Sensacionalismo sobre transtornos ou sofrimento psíquico
- Linguagem que romantize ou banalize sofrimento psíquico
- Diagnóstico de transtorno aplicado ao leitor ("se você faz X, tem ansiedade")
- Prometer resultados quantificáveis em terapia`,
  },
  nutritionist: {
    name: 'CFN',
    rules: `CFN (Conselho Federal de Nutricionistas) — Código de Ética do Nutricionista:
PROIBIDO:
- Prometer emagrecimento em quantidade ou tempo específico ("perca X kg em Y semanas")
- Dietas milagrosas ou restritivas sem base científica
- Classificar alimentos como "proibidos" ou "milagrosos" de forma absoluta
- Fotos ou comparações antes/depois de corpo
- Garantias de resultado ("vai emagrecer", "elimina gordura abdominal garantido")
- Uso de termos como "detox", "alimento que queima gordura" sem base científica comprovada`,
  },
}

const SYSTEM_PROMPT = `Você é um especialista em ética e compliance para profissionais de saúde brasileiros, com conhecimento aprofundado nos códigos de ética do CFM, CFO, CFP e CFN.

Sua tarefa é analisar um post de redes sociais e retornar uma análise de compliance DETALHADA e HONESTA.

IMPORTANTE: Seja rigoroso. Identifique TODOS os problemas, mesmo os sutis. Um profissional pode ser punido por violações que parecem pequenas.

Para cada problema encontrado, você DEVE fornecer:
1. O trecho exato do post que viola a norma
2. Qual artigo/resolução específica é violada
3. Uma sugestão de reescrita que mantém a intenção mas está em conformidade

FORMATO DE SAÍDA OBRIGATÓRIO (JSON puro, sem markdown):
{
  "approved": boolean,
  "council": "CFM" | "CFO" | "CFP" | "CFN",
  "summary": "resumo de 1-2 frases sobre o status geral do post",
  "issues": [
    {
      "severity": "critical" | "warning",
      "excerpt": "trecho exato do post que viola",
      "rule": "norma violada (ex: CFM Res. 1974/2011, Art. X — proibição de garantias de resultado)",
      "explanation": "por que isso é problemático",
      "rewrite": "versão corrigida do trecho"
    }
  ],
  "approved_aspects": ["aspecto positivo 1", "aspecto positivo 2"]
}`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const { text, vertical, imageDescription, imageData, imageMediaType } = await req.json()

    if (!text || !vertical) {
      return new Response(JSON.stringify({ error: 'text and vertical are required' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const councilInfo = COUNCIL_RULES[vertical]
    if (!councilInfo) {
      return new Response(JSON.stringify({ error: 'Invalid vertical' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    if (imageData && imageData.length > 700000) {
      return new Response(JSON.stringify({ error: 'Imagem muito grande. Máximo 500KB.' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const textContent = `Analise o seguinte post de ${councilInfo.name} para conformidade ética:

NORMAS APLICÁVEIS:
${councilInfo.rules}

POST PARA ANÁLISE:
"""
${text}
"""
${imageDescription ? `\nDESCRIÇÃO DA IMAGEM ANEXADA:\n${imageDescription}\n` : ''}
${imageData ? '\nA imagem do post está anexada acima. Analise também os elementos visuais (texto sobreposto, comparações visuais antes/depois, etc.) em relação às normas.\n' : ''}
Retorne a análise no formato JSON especificado. Seja preciso, cite trechos exatos e forneça reescritas úteis.`

    // Build message content — include image if provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageContent: any[] = []
    if (imageData) {
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageMediaType ?? 'image/jpeg',
          data: imageData,
        },
      })
    }
    messageContent.push({ type: 'text', text: textContent })

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: messageContent }],
      }),
    })

    if (!anthropicResponse.ok) {
      const err = await anthropicResponse.text()
      console.error('Anthropic error:', err)
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const anthropicData = await anthropicResponse.json()
    const rawContent = anthropicData.content?.[0]?.text ?? ''

    let analysis
    try {
      analysis = JSON.parse(rawContent)
    } catch {
      // Try to extract JSON from markdown code block if present
      const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) {
        analysis = JSON.parse(match[1])
      } else {
        throw new Error('Failed to parse analysis JSON')
      }
    }

    // Log to compliance_analyses table
    await supabase.from('compliance_analyses').insert({
      user_id: user.id,
      vertical,
      post_text: text,
      image_description: imageDescription ?? null,
      result: analysis,
    })

    return new Response(JSON.stringify(analysis), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('analyze-compliance error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
