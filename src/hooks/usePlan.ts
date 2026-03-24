import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export type Plan = 'free' | 'starter' | 'growth' | 'pro'

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 5,
  starter: 10,
  growth: 30,
  pro: 100,
}

export const FREE_LIMIT = PLAN_LIMITS.free

export interface PlanInfo {
  plan: Plan
  effectivePlan: Plan       // trial users get starter limits
  generationCount: number
  planLimit: number
  canGenerate: boolean
  isInTrial: boolean
  trialEndsAt: Date | null
  isBlocked: boolean        // trial expired or payment failed
  blockReason: 'trial_expired' | 'payment_failed' | null
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: Date | null
}

export function usePlan() {
  const { user } = useAuth()
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPlan = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('users')
      .select('plan, generation_count, generation_reset_at, trial_ends_at, payment_status, cancel_at_period_end, current_period_end')
      .eq('id', user.id)
      .single()

    if (data) {
      let count = data.generation_count ?? 0

      // Reset monthly counter if past reset date
      const resetAt = data.generation_reset_at ? new Date(data.generation_reset_at) : null
      if (resetAt && new Date() > resetAt) {
        const nextMonth = new Date()
        nextMonth.setDate(1)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        nextMonth.setHours(0, 0, 0, 0)
        await supabase.from('users').update({
          generation_count: 0,
          generation_reset_at: nextMonth.toISOString(),
        }).eq('id', user.id)
        count = 0
      }

      const plan: Plan = (data.plan as Plan) ?? 'free'
      const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null
      const paymentStatus = (data.payment_status as string) ?? 'active'
      const now = new Date()

      const isPaid = plan !== 'free'
      const isPaymentFailed = isPaid && paymentStatus === 'past_due'
      const isInTrial = !isPaid && trialEndsAt != null && now < trialEndsAt
      const isTrialExpired = !isPaid && (trialEndsAt == null || now >= trialEndsAt)
      const isBlocked = isTrialExpired || isPaymentFailed

      const blockReason: PlanInfo['blockReason'] = isPaymentFailed
        ? 'payment_failed'
        : isTrialExpired
          ? 'trial_expired'
          : null

      // During trial, user gets 5 generations (trial limit)
      const effectivePlan: Plan = isInTrial ? 'free' : plan
      const planLimit = PLAN_LIMITS[effectivePlan]

      setPlanInfo({
        plan,
        effectivePlan,
        generationCount: count,
        planLimit,
        canGenerate: !isBlocked && count < planLimit,
        isInTrial,
        trialEndsAt,
        isBlocked,
        blockReason,
        cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
      })
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  async function incrementGeneration() {
    if (!user || !planInfo || planInfo.isBlocked) return
    const { data } = await supabase.rpc('increment_generation_count', { user_id: user.id })
    const newCount = typeof data === 'number' ? data : planInfo.generationCount + 1
    setPlanInfo(prev =>
      prev ? { ...prev, generationCount: newCount, canGenerate: newCount < prev.planLimit } : prev
    )
  }

  return { planInfo, setPlanInfo, loading, refetch: fetchPlan }
}
