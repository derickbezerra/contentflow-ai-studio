import { describe, it, expect } from 'vitest'

// Mirrors the extractJSON function in supabase/functions/generate/index.ts
// Keep in sync if the original changes.
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

describe('extractJSON — content generation output', () => {
  it('parses clean JSON', () => {
    const raw = '{"intent":"educational","hook":"Título","body":"Corpo","cta":"CTA"}'
    const result = JSON.parse(extractJSON(raw))
    expect(result.intent).toBe('educational')
    expect(result.hook).toBe('Título')
  })

  it('extracts JSON embedded in markdown prose', () => {
    const raw = 'Aqui está o resultado:\n```json\n{"intent":"tip_list","script":"Texto aqui"}\n```'
    const result = JSON.parse(extractJSON(raw))
    expect(result.intent).toBe('tip_list')
  })

  it('extracts JSON when there is trailing text', () => {
    const raw = '{"intent":"alert","script":"Frase"} Algum texto extra.'
    const result = JSON.parse(extractJSON(raw))
    expect(result.intent).toBe('alert')
  })

  it('handles nested objects in slides', () => {
    const raw = '{"intent":"educational","slides":[{"title":"Slide 1","body":"Corpo"}],"caption":"#hashtag"}'
    const result = JSON.parse(extractJSON(raw))
    expect(result.slides).toHaveLength(1)
    expect(result.slides[0].title).toBe('Slide 1')
  })

  it('handles escaped characters in strings', () => {
    const raw = '{"intent":"myth_vs_truth","hook":"O que \\"especialistas\\" dizem","body":"Conteúdo","cta":"Salva"}'
    const result = JSON.parse(extractJSON(raw))
    expect(result.hook).toBe('O que "especialistas" dizem')
  })

  it('throws when no JSON present', () => {
    expect(() => extractJSON('Texto sem JSON aqui')).toThrow('No JSON found')
  })

  it('throws on unbalanced JSON', () => {
    expect(() => extractJSON('{"intent":"educational","hook":"Incompleto"')).toThrow('Unbalanced JSON')
  })
})
