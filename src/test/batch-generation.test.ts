import { describe, it, expect } from 'vitest'

// Mirrors batch validation logic in supabase/functions/generate/index.ts

const VALID_CONTENT_TYPES = ['carousel', 'post', 'story']
const VALID_VERTICALS = ['doctor', 'nutritionist', 'dentist', 'psychologist']
const VALID_GENDERS = ['male', 'female', 'both']

function validateGenerateInput(input: Record<string, unknown>) {
  const { topic, context, content_type, vertical, gender, batch } = input

  if (!topic || typeof topic !== 'string' || (topic as string).trim().length === 0)
    return { error: 'Tópico é obrigatório.' }
  if ((topic as string).length > 500)
    return { error: 'Tópico muito longo (máx. 500 caracteres).' }
  if (context && (typeof context !== 'string' || (context as string).length > 1000))
    return { error: 'Contexto muito longo (máx. 1000 caracteres).' }
  // In batch mode, content_type is not required
  if (!batch && !VALID_CONTENT_TYPES.includes(content_type as string))
    return { error: 'Tipo de conteúdo inválido.' }
  if (!VALID_VERTICALS.includes(vertical as string))
    return { error: 'Vertical inválida.' }
  if (!VALID_GENDERS.includes(gender as string))
    return { error: 'Público inválido.' }

  return { error: null }
}

const VALID_SINGLE = { topic: 'Hipertensão', content_type: 'post', vertical: 'doctor', gender: 'both' }
const VALID_BATCH  = { topic: 'Hipertensão', vertical: 'doctor', gender: 'both', batch: true }

describe('Batch generation validation', () => {
  it('accepts valid batch request without content_type', () => {
    expect(validateGenerateInput(VALID_BATCH).error).toBeNull()
  })

  it('accepts valid single request (backward compat)', () => {
    expect(validateGenerateInput(VALID_SINGLE).error).toBeNull()
  })

  it('rejects single request without content_type', () => {
    const input = { topic: 'Hipertensão', vertical: 'doctor', gender: 'both' }
    expect(validateGenerateInput(input).error).toBe('Tipo de conteúdo inválido.')
  })

  it('batch mode still requires topic', () => {
    expect(validateGenerateInput({ ...VALID_BATCH, topic: '' }).error).toBe('Tópico é obrigatório.')
  })

  it('batch mode still requires valid vertical', () => {
    expect(validateGenerateInput({ ...VALID_BATCH, vertical: 'lawyer' }).error).toBe('Vertical inválida.')
  })

  it('batch mode still requires valid gender', () => {
    expect(validateGenerateInput({ ...VALID_BATCH, gender: 'unknown' }).error).toBe('Público inválido.')
  })

  it('batch ignores an invalid content_type (irrelevant in batch)', () => {
    expect(validateGenerateInput({ ...VALID_BATCH, content_type: 'video' }).error).toBeNull()
  })

  it('batch with all valid verticals', () => {
    for (const v of VALID_VERTICALS) {
      expect(validateGenerateInput({ ...VALID_BATCH, vertical: v }).error).toBeNull()
    }
  })
})

describe('Batch response shape', () => {
  it('identifies batch vs single response by presence of outputs key', () => {
    const batchResponse = { batch: true, outputs: { carousel: {}, post: {}, story: {} }, new_count: 5 }
    const singleResponse = { output: { intent: 'educational' }, new_count: 3 }

    expect('outputs' in batchResponse).toBe(true)
    expect('output' in singleResponse).toBe(true)
    expect('outputs' in singleResponse).toBe(false)
  })

  it('batch response has all three format keys', () => {
    const outputs = { carousel: { slides: [] }, post: { hook: '' }, story: { script: '' } }
    expect(Object.keys(outputs)).toEqual(['carousel', 'post', 'story'])
  })
})
