import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export type Plan = 'free' | 'starter' | 'growth' | 'pro'

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 5,
  starter: 10,
  growth: 30,
  pro: 50,
}

export const FREE_LIMIT = PLAN_LIMITS.free

export interface PlanInfo {
  plan: Plan
  effectivePlan: Plan
  generationCount: number
  planLimit: number
  canGenerate: boolean
  isInTrial: boolean
  trialEndsAt: Date | null
  isBlocked: boolean
  blockReason: 'trial_expired' | 'payment_failed' | null
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: Date | null
}

// ── Session cache — survives SPA navigation without Supabase round-trip ────
const CACHE_KEY = 'cf_plan_cache'

function readCache(): PlanInfo | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return {
      ...p,
      trialEndsAt: p.trialEndsAt ? new Date(p.trialEndsAt) : null,
      currentPeriodEnd: p.currentPeriodEnd ? new Date(p.currentPeriodEnd) : null,
    }
  } catch { return null }
}

function writeCache(info: PlanInfo) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(info)) } catch { /* ignore */ }
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function usePlan() {
  const { user } = useAuth()
  // Initialize from cache → no flash when navigating back
  const initial = readCache()
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(initial)
  const [loading, setLoading] = useState(!initial)

  const fetchPlan = useCallback(async (silent = false) => {
    if (!user) return
    if (!silent) setLoading(true)

    const { data, error } = await supabase
      .from('users')
      .select('plan, generation_count, trial_ends_at, payment_status, cancel_at_period_end, current_period_end')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[usePlan] Failed to fetch plan:', error.message)
      setLoading(false)
      return
    }

    if (data) {
      const count = data.generation_count ?? 0

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
        : isTrialExpired ? 'trial_expired' : null

      const effectivePlan: Plan = isInTrial ? 'free' : plan
      const planLimit = PLAN_LIMITS[effectivePlan]

      const info: PlanInfo = {
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
      }

      setPlanInfo(info)
      writeCache(info)
    }

    setLoading(false)
  }, [user])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  async function incrementGeneration() {
    if (!user || !planInfo || planInfo.isBlocked) return
    const { data } = await supabase.rpc('increment_generation_count', { user_id: user.id })
    const newCount = typeof data === 'number' ? data : planInfo.generationCount + 1
    setPlanInfo(prev => {
      if (!prev) return prev
      const updated = { ...prev, generationCount: newCount, canGenerate: newCount < prev.planLimit }
      writeCache(updated)
      return updated
    })
  }

  return { planInfo, setPlanInfo, loading, refetch: fetchPlan, incrementGeneration }
}
