import Anthropic from '@anthropic-ai/sdk'
import { GenerateRequest, GeneratedContent } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `Você é o AI Brain do ContentFlow.

Seu objetivo é gerar conteúdo claro, didático, envolvente e orientado à conversão para o Instagram.

Siga este pipeline estritamente:

PASSO 1: Classifique a intenção:
- educational
- alert
- myth_vs_truth
- step_by_step
- authority

PASSO 2: Defina a estrutura narrativa dinamicamente

PASSO 3: Gere o conteúdo conforme o tipo solicitado:

Carousel:
- 5 a 7 slides
- slide 1 = gancho (hook)
- último slide = CTA
- máximo 12 a 20 palavras por slide

Post:
- gancho
- corpo
- CTA

Story:
- 3 a 5 frames curtos
- tom conversacional

PASSO 4: Adapte o tom conforme o vertical:

doutor (doctor):
- didático
- ético
- claro

advogado (lawyer):
- autoritativo
- estruturado
- claro

infoprodutor (infoproduct):
- persuasivo
- envolvente

PASSO 5: Simplifique a linguagem

PASSO 6: Verificação de qualidade:
- clareza
- sem fluff
- uma ideia por unidade

FORMATO DE SAÍDA (JSON estrito):

Para carousel:
{"intent":"...","structure":["..."],"slides":["..."]}

Para post:
{"intent":"...","post":{"hook":"...","body":"...","cta":"..."}}

Para story:
{"intent":"...","stories":["..."]}

Sempre escreva em Português Brasileiro.
Retorne APENAS o JSON, sem markdown, sem explicações.`

export async function generateContent(req: GenerateRequest): Promise<GeneratedContent> {
  const userMessage = `Tipo de conteúdo: ${req.content_type}
Vertical: ${req.vertical}
Tópico: ${req.topic}${req.context ? `\nContexto adicional: ${req.context}` : ''}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Strip any accidental markdown code fences
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  return JSON.parse(cleaned) as GeneratedContent
}
