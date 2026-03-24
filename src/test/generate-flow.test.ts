import { describe, it, expect } from 'vitest'

// Tests for the generate endpoint's input validation logic
// (mirrors supabase/functions/generate/index.ts validation rules)

const VALID_CONTENT_TYPES = ['carousel', 'post', 'story']
const VALID_VERTICALS = ['doctor', 'nutritionist', 'dentist', 'psychologist']
const VALID_GENDERS = ['male', 'female', 'both']

function validateGenerateInput(input: Record<string, unknown>) {
  const { topic, context, content_type, vertical, gender } = input

  if (!topic || typeof topic !== 'string' || (topic as string).trim().length === 0)
    return { error: 'Tópico é obrigatório.' }
  if ((topic as string).length > 500)
    return { error: 'Tópico muito longo (máx. 500 caracteres).' }
  if (context && (typeof context !== 'string' || (context as string).length > 1000))
    return { error: 'Contexto muito longo (máx. 1000 caracteres).' }
  if (!VALID_CONTENT_TYPES.includes(content_type as string))
    return { error: 'Tipo de conteúdo inválido.' }
  if (!VALID_VERTICALS.includes(vertical as string))
    return { error: 'Vertical inválida.' }
  if (!VALID_GENDERS.includes(gender as string))
    return { error: 'Público inválido.' }

  return { error: null }
}

const VALID = { topic: 'Hipertensão', content_type: 'post', vertical: 'doctor', gender: 'both' }

describe('Generate input validation', () => {
  it('accepts valid input', () => {
    expect(validateGenerateInput(VALID).error).toBeNull()
  })

  it('rejects empty topic', () => {
    expect(validateGenerateInput({ ...VALID, topic: '' }).error).toBe('Tópico é obrigatório.')
  })

  it('rejects whitespace-only topic', () => {
    expect(validateGenerateInput({ ...VALID, topic: '   ' }).error).toBe('Tópico é obrigatório.')
  })

  it('rejects topic over 500 chars', () => {
    expect(validateGenerateInput({ ...VALID, topic: 'a'.repeat(501) }).error).toMatch('Tópico muito longo')
  })

  it('rejects context over 1000 chars', () => {
    expect(validateGenerateInput({ ...VALID, context: 'x'.repeat(1001) }).error).toMatch('Contexto muito longo')
  })

  it('accepts context exactly at limit', () => {
    expect(validateGenerateInput({ ...VALID, context: 'x'.repeat(1000) }).error).toBeNull()
  })

  it('rejects invalid content_type', () => {
    expect(validateGenerateInput({ ...VALID, content_type: 'video' }).error).toBe('Tipo de conteúdo inválido.')
  })

  it('rejects invalid vertical', () => {
    expect(validateGenerateInput({ ...VALID, vertical: 'lawyer' }).error).toBe('Vertical inválida.')
  })

  it('rejects invalid gender', () => {
    expect(validateGenerateInput({ ...VALID, gender: 'unknown' }).error).toBe('Público inválido.')
  })

  it('accepts all valid content types', () => {
    for (const ct of VALID_CONTENT_TYPES) {
      expect(validateGenerateInput({ ...VALID, content_type: ct }).error).toBeNull()
    }
  })

  it('accepts all valid verticals', () => {
    for (const v of VALID_VERTICALS) {
      expect(validateGenerateInput({ ...VALID, vertical: v }).error).toBeNull()
    }
  })
})
