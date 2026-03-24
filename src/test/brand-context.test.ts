import { describe, it, expect } from 'vitest'

// Mirrors brand context + memory building logic in supabase/functions/generate/index.ts

interface Profile {
  brand_name?: string | null
  brand_tone?: string | null
  brand_bio?: string | null
  onboarding_goal?: string | null
  instagram_handle?: string | null
}

interface ContentRow {
  type: string
  input: string
  created_at: string
}

const GOAL_LABELS: Record<string, string> = {
  attract_patients:    'atrair novos pacientes',
  build_authority:     'construir autoridade na especialidade',
  increase_engagement: 'aumentar engajamento e seguidores',
}

const TYPE_PT: Record<string, string> = { carousel: 'carrossel', post: 'post', story: 'story' }

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  return d === 0 ? 'hoje' : d === 1 ? 'ontem' : `${d}d atrás`
}

function buildBrandContext(profile: Profile | null): string {
  if (!profile) return ''
  const toneLabel = profile.brand_tone === 'formal' ? 'formal'
    : profile.brand_tone === 'empatico' ? 'empático' : 'informal'

  let ctx = ''
  if (profile.brand_name || profile.brand_bio || profile.instagram_handle) {
    ctx += '\n\n[PERFIL DE MARCA]'
    if (profile.brand_name)       ctx += `\n- Nome: ${profile.brand_name}`
    ctx +=                              `\n- Tom de voz: ${toneLabel}`
    if (profile.brand_bio)        ctx += `\n- Bio: ${profile.brand_bio}`
    if (profile.instagram_handle) ctx += `\n- Instagram: @${profile.instagram_handle.replace(/^@/, '')}`
  }
  if (profile.onboarding_goal) {
    ctx += `\n\n[OBJETIVO]\nObjetivo principal: ${GOAL_LABELS[profile.onboarding_goal] ?? profile.onboarding_goal}.`
  }
  return ctx
}

function buildMemoryContext(recentContent: ContentRow[]): string {
  if (!recentContent.length) return ''
  let ctx = '\n\n[HISTÓRICO RECENTE: evite repetir temas; se parecido, mude o ângulo ou o gancho]\n'
  ctx += recentContent
    .map(c => `- ${TYPE_PT[c.type] ?? c.type}: "${c.input}" (${daysAgo(c.created_at)})`)
    .join('\n')
  return ctx
}

describe('Brand context building', () => {
  it('returns empty string for null profile', () => {
    expect(buildBrandContext(null)).toBe('')
  })

  it('returns empty string when no identifying fields', () => {
    expect(buildBrandContext({ brand_tone: 'informal' })).toBe('')
  })

  it('includes brand name when present', () => {
    const ctx = buildBrandContext({ brand_name: 'Dra. Ana Lima', brand_tone: 'formal' })
    expect(ctx).toContain('Dra. Ana Lima')
  })

  it('always includes tom de voz when profile section exists', () => {
    const ctx = buildBrandContext({ brand_name: 'Dr. João', brand_tone: 'empatico' })
    expect(ctx).toContain('Tom de voz: empático')
  })

  it('maps formal tone correctly', () => {
    const ctx = buildBrandContext({ brand_name: 'Dr. X', brand_tone: 'formal' })
    expect(ctx).toContain('Tom de voz: formal')
  })

  it('defaults unknown tone to informal', () => {
    const ctx = buildBrandContext({ brand_name: 'Dr. X', brand_tone: null })
    expect(ctx).toContain('Tom de voz: informal')
  })

  it('strips leading @ from instagram handle', () => {
    const ctx = buildBrandContext({ brand_name: 'Dr. X', instagram_handle: '@drx.saude' })
    expect(ctx).toContain('@drx.saude')
    expect(ctx).not.toContain('@@')
  })

  it('works without leading @ in handle', () => {
    const ctx = buildBrandContext({ brand_name: 'Dr. X', instagram_handle: 'drx.saude' })
    expect(ctx).toContain('@drx.saude')
  })

  it('includes goal section when onboarding_goal is set', () => {
    const ctx = buildBrandContext({ brand_name: 'Dr. X', onboarding_goal: 'attract_patients' })
    expect(ctx).toContain('[OBJETIVO]')
    expect(ctx).toContain('atrair novos pacientes')
  })

  it('includes bio when present', () => {
    const ctx = buildBrandContext({ brand_name: 'Dr. X', brand_bio: 'Cardiologista há 10 anos' })
    expect(ctx).toContain('Cardiologista há 10 anos')
  })
})

describe('Memory context building', () => {
  it('returns empty string for empty array', () => {
    expect(buildMemoryContext([])).toBe('')
  })

  it('includes history header', () => {
    const ctx = buildMemoryContext([
      { type: 'post', input: 'Hipertensão', created_at: new Date().toISOString() },
    ])
    expect(ctx).toContain('[HISTÓRICO RECENTE')
  })

  it('translates content types to Portuguese', () => {
    const ctx = buildMemoryContext([
      { type: 'carousel', input: 'Colesterol', created_at: new Date().toISOString() },
    ])
    expect(ctx).toContain('carrossel')
    expect(ctx).not.toContain(': carousel:')
  })

  it('labels today correctly', () => {
    const ctx = buildMemoryContext([
      { type: 'post', input: 'Diabetes', created_at: new Date().toISOString() },
    ])
    expect(ctx).toContain('(hoje)')
  })

  it('formats multiple entries as separate lines', () => {
    const now = new Date().toISOString()
    const ctx = buildMemoryContext([
      { type: 'post', input: 'A', created_at: now },
      { type: 'story', input: 'B', created_at: now },
    ])
    const lines = ctx.trim().split('\n').filter(l => l.startsWith('-'))
    expect(lines).toHaveLength(2)
  })
})
