import { describe, it, expect } from 'vitest'

// Tests for Stripe webhook plan mapping logic
// Mirrors supabase/functions/stripe-webhook/index.ts

const PRICE_MAP: Record<string, string> = {
  'price_starter_test': 'starter',
  'price_growth_test': 'growth',
  'price_pro_test': 'pro',
}

function getPlanFromPriceId(priceId: string): string {
  return PRICE_MAP[priceId] ?? 'starter'
}

function resolveUserStatus(subscription: {
  status: string
  cancel_at_period_end: boolean
  items: { price_id: string }[]
}) {
  const isActive = subscription.status === 'active' || subscription.status === 'trialing'
  const isPastDue = subscription.status === 'past_due' || subscription.status === 'unpaid'
  const priceId = subscription.items[0]?.price_id ?? ''

  return {
    plan: isActive ? getPlanFromPriceId(priceId) : isPastDue ? getPlanFromPriceId(priceId) : 'free',
    paymentStatus: isActive ? 'active' : isPastDue ? 'past_due' : 'canceled',
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  }
}

describe('Stripe plan mapping', () => {
  it('maps starter price to starter plan', () => {
    expect(getPlanFromPriceId('price_starter_test')).toBe('starter')
  })

  it('maps growth price to growth plan', () => {
    expect(getPlanFromPriceId('price_growth_test')).toBe('growth')
  })

  it('maps pro price to pro plan', () => {
    expect(getPlanFromPriceId('price_pro_test')).toBe('pro')
  })

  it('falls back to starter for unknown price', () => {
    expect(getPlanFromPriceId('price_unknown')).toBe('starter')
  })
})

describe('Stripe subscription status resolution', () => {
  it('active subscription → active status + correct plan', () => {
    const result = resolveUserStatus({
      status: 'active',
      cancel_at_period_end: false,
      items: [{ price_id: 'price_growth_test' }],
    })
    expect(result.plan).toBe('growth')
    expect(result.paymentStatus).toBe('active')
  })

  it('trialing subscription → active status', () => {
    const result = resolveUserStatus({
      status: 'trialing',
      cancel_at_period_end: false,
      items: [{ price_id: 'price_starter_test' }],
    })
    expect(result.paymentStatus).toBe('active')
    expect(result.plan).toBe('starter')
  })

  it('past_due subscription → past_due status, keeps plan', () => {
    const result = resolveUserStatus({
      status: 'past_due',
      cancel_at_period_end: false,
      items: [{ price_id: 'price_pro_test' }],
    })
    expect(result.plan).toBe('pro')
    expect(result.paymentStatus).toBe('past_due')
  })

  it('unpaid subscription → past_due status', () => {
    const result = resolveUserStatus({
      status: 'unpaid',
      cancel_at_period_end: false,
      items: [{ price_id: 'price_starter_test' }],
    })
    expect(result.paymentStatus).toBe('past_due')
  })

  it('canceled subscription → free plan + canceled status', () => {
    const result = resolveUserStatus({
      status: 'canceled',
      cancel_at_period_end: false,
      items: [{ price_id: 'price_pro_test' }],
    })
    expect(result.plan).toBe('free')
    expect(result.paymentStatus).toBe('canceled')
  })

  it('cancel_at_period_end flag is passed through', () => {
    const result = resolveUserStatus({
      status: 'active',
      cancel_at_period_end: true,
      items: [{ price_id: 'price_growth_test' }],
    })
    expect(result.cancelAtPeriodEnd).toBe(true)
  })
})
