import { describe, it, expect } from 'vitest'
import { PLAN_LIMITS, type Plan } from '@/hooks/usePlan'

// Pure logic extracted from usePlan — tests the plan/trial state computation
// without needing Supabase or React context.

function computePlanState({
  plan,
  generationCount,
  trialEndsAt,
  paymentStatus,
}: {
  plan: Plan
  generationCount: number
  trialEndsAt: Date | null
  paymentStatus: string
}) {
  const now = new Date()
  const isPaid = plan !== 'free'
  const isPaymentFailed = isPaid && paymentStatus === 'past_due'
  const isInTrial = !isPaid && trialEndsAt != null && now < trialEndsAt
  const isTrialExpired = !isPaid && (trialEndsAt == null || now >= trialEndsAt)
  const isBlocked = isTrialExpired || isPaymentFailed
  const effectivePlan: Plan = isInTrial ? 'free' : plan
  const planLimit = PLAN_LIMITS[effectivePlan]
  return {
    canGenerate: !isBlocked && generationCount < planLimit,
    isInTrial,
    isBlocked,
    blockReason: isPaymentFailed ? 'payment_failed' : isTrialExpired ? 'trial_expired' : null,
    planLimit,
  }
}

const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
const past = new Date(Date.now() - 24 * 60 * 60 * 1000)

describe('Plan limits', () => {
  it('free plan has limit of 5', () => {
    expect(PLAN_LIMITS.free).toBe(5)
  })

  it('starter plan has limit of 10', () => {
    expect(PLAN_LIMITS.starter).toBe(10)
  })

  it('growth plan has limit of 30', () => {
    expect(PLAN_LIMITS.growth).toBe(30)
  })

  it('pro plan has limit of 100', () => {
    expect(PLAN_LIMITS.pro).toBe(100)
  })
})

describe('Trial state', () => {
  it('active trial user can generate up to free limit', () => {
    const state = computePlanState({ plan: 'free', generationCount: 3, trialEndsAt: future, paymentStatus: 'active' })
    expect(state.isInTrial).toBe(true)
    expect(state.canGenerate).toBe(true)
    expect(state.planLimit).toBe(5)
  })

  it('active trial user at limit cannot generate', () => {
    const state = computePlanState({ plan: 'free', generationCount: 5, trialEndsAt: future, paymentStatus: 'active' })
    expect(state.canGenerate).toBe(false)
  })

  it('expired trial blocks generation', () => {
    const state = computePlanState({ plan: 'free', generationCount: 0, trialEndsAt: past, paymentStatus: 'active' })
    expect(state.isBlocked).toBe(true)
    expect(state.blockReason).toBe('trial_expired')
    expect(state.canGenerate).toBe(false)
  })

  it('free user with no trial date is blocked', () => {
    const state = computePlanState({ plan: 'free', generationCount: 0, trialEndsAt: null, paymentStatus: 'active' })
    expect(state.isBlocked).toBe(true)
    expect(state.blockReason).toBe('trial_expired')
  })
})

describe('Paid plan state', () => {
  it('active paid user can generate within limit', () => {
    const state = computePlanState({ plan: 'starter', generationCount: 5, trialEndsAt: null, paymentStatus: 'active' })
    expect(state.canGenerate).toBe(true)
    expect(state.isBlocked).toBe(false)
  })

  it('paid user at limit cannot generate', () => {
    const state = computePlanState({ plan: 'starter', generationCount: 10, trialEndsAt: null, paymentStatus: 'active' })
    expect(state.canGenerate).toBe(false)
  })

  it('past_due payment blocks generation', () => {
    const state = computePlanState({ plan: 'growth', generationCount: 0, trialEndsAt: null, paymentStatus: 'past_due' })
    expect(state.isBlocked).toBe(true)
    expect(state.blockReason).toBe('payment_failed')
    expect(state.canGenerate).toBe(false)
  })

  it('pro user has 100 generation limit', () => {
    const state = computePlanState({ plan: 'pro', generationCount: 99, trialEndsAt: null, paymentStatus: 'active' })
    expect(state.canGenerate).toBe(true)
    expect(state.planLimit).toBe(100)
  })
})
