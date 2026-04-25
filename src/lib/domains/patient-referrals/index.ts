// Patient Referral Loop
// Distinct from src/lib/domains/referrals (which is clinical doctor→doctor handoffs).
// This handles viral patient→friend referrals: code issuance, redemption, rewards.

import { createServiceClient } from '@/lib/supabase/server'

export const PATIENT_REFERRAL_CONFIG = {
  SIGNUP_BONUS_FREE_CONSULTS: 1,
  REFERRER_REWARD_FREE_CONSULTS: 1,
  REFERRER_REWARD_CREDIT_CENTS: 10000, // $100 MXN
  REFEREE_REWARD_FREE_CONSULTS: 1,
  MONTHLY_REWARD_CAP: 10,
} as const

export type PatientReferralStatus =
  | 'pending'
  | 'redeemed'
  | 'rewarded'
  | 'revoked'

export interface PatientReferralRow {
  id: string
  referrer_id: string
  referee_id: string
  code_used: string
  status: PatientReferralStatus
  rewards_granted_at: string | null
  created_at: string
}

export interface ReferralSummary {
  code: string
  shareUrl: string
  totalRedeemed: number
  totalRewarded: number
  creditsCents: number
  freeConsultsRemaining: number
}

function baseShareUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://doctor.mx'
  return url.replace(/\/$/, '')
}

export function buildShareUrl(code: string): string {
  return `${baseShareUrl()}/auth/register?ref=${encodeURIComponent(code)}`
}

/**
 * Get a user's referral code + stats. Creates the code if missing (trigger should
 * handle this, but we defend in depth for users created before the migration).
 */
export async function getReferralSummaryForUser(
  userId: string
): Promise<ReferralSummary | null> {
  const supabase = createServiceClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'referral_code, referral_credits_cents, free_ai_consults_remaining'
    )
    .eq('id', userId)
    .single()

  if (error || !profile) return null

  let code = profile.referral_code as string | null
  if (!code) {
    const { data: issued } = await supabase.rpc('generate_referral_code')
    code = issued as string | null
    if (code) {
      await supabase.from('profiles').update({ referral_code: code }).eq('id', userId)
    }
  }

  if (!code) return null

  const { count: totalRedeemed } = await supabase
    .from('patient_referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .in('status', ['redeemed', 'rewarded'])

  const { count: totalRewarded } = await supabase
    .from('patient_referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .eq('status', 'rewarded')

  return {
    code,
    shareUrl: buildShareUrl(code),
    totalRedeemed: totalRedeemed || 0,
    totalRewarded: totalRewarded || 0,
    creditsCents: profile.referral_credits_cents || 0,
    freeConsultsRemaining: profile.free_ai_consults_remaining || 0,
  }
}

/**
 * Called when a new user completes signup. If they provided a referral code,
 * creates a patient_referrals row, grants the signup bonus, and (if the referrer
 * is under the monthly cap) grants rewards to both parties.
 *
 * NOTE: No auth guard is applied here because this function runs during signup
 * flow, before the user has a session. Input validation is handled by the
 * caller and the DB unique constraint on (referee_id).
 */
export async function redeemReferralAtSignup(params: {
  newUserId: string
  referralCode: string | null | undefined
}): Promise<{
  applied: boolean
  reason?: 'no_code' | 'invalid_code' | 'self_referral' | 'already_redeemed' | 'monthly_cap_exceeded'
  refereeBonusApplied?: boolean
}> {
  const { newUserId, referralCode } = params
  const trimmed = referralCode?.trim().toUpperCase()

  const supabase = createServiceClient()

  // Always grant signup bonus regardless of code
  await grantSignupBonus(newUserId)

  if (!trimmed) {
    return { applied: false, reason: 'no_code', refereeBonusApplied: true }
  }

  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', trimmed)
    .maybeSingle()

  if (!referrer) {
    return { applied: false, reason: 'invalid_code', refereeBonusApplied: true }
  }

  if (referrer.id === newUserId) {
    return { applied: false, reason: 'self_referral', refereeBonusApplied: true }
  }

  // Mark referee as referred_by (idempotent)
  await supabase
    .from('profiles')
    .update({ referred_by_code: trimmed })
    .eq('id', newUserId)
    .is('referred_by_code', null)

  // Check idempotency: one referee row per account, enforced by DB unique constraint.
  const { data: existing } = await supabase
    .from('patient_referrals')
    .select('id, status')
    .eq('referee_id', newUserId)
    .maybeSingle()

  if (existing) {
    return { applied: false, reason: 'already_redeemed', refereeBonusApplied: true }
  }

  // Atomic redeem: count + insert in a single serialized RPC call
  // to prevent TOCTOU race at the monthly cap boundary.
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    'atomic_redeem_referral',
    {
      p_referrer_id: referrer.id,
      p_referee_id: newUserId,
      p_referral_code: trimmed,
    }
  )

  if (rpcError) {
    return { applied: false, reason: 'invalid_code', refereeBonusApplied: true }
  }

  const result = rpcResult as {
    success: boolean
    reason?: string
    cap_exceeded?: boolean
  }

  if (!result.success) {
    if (result.reason === 'already_redeemed') {
      return { applied: false, reason: 'already_redeemed', refereeBonusApplied: true }
    }
    if (result.reason === 'self_referral') {
      return { applied: false, reason: 'self_referral', refereeBonusApplied: true }
    }
    return { applied: false, reason: 'invalid_code', refereeBonusApplied: true }
  }

  if (result.cap_exceeded) {
    return {
      applied: true,
      reason: 'monthly_cap_exceeded',
      refereeBonusApplied: true,
    }
  }

  // Grant rewards
  await grantReferrerReward(referrer.id)
  await grantRefereeReward(newUserId)

  return { applied: true, refereeBonusApplied: true }
}

// Called server-side with validated input from redeemReferralAtSignup.
// No auth guard needed — the caller has already validated the new user's identity
// and this is an internal helper with a trusted userId.
async function grantSignupBonus(userId: string): Promise<void> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('free_ai_consults_remaining')
    .eq('id', userId)
    .single()

  if (!data) {
    return
  }

  await supabase
    .from('profiles')
    .update({
      free_ai_consults_remaining:
        (data.free_ai_consults_remaining || 0) +
        PATIENT_REFERRAL_CONFIG.SIGNUP_BONUS_FREE_CONSULTS,
    })
    .eq('id', userId)
}

// Called server-side with validated input from redeemReferralAtSignup.
// No auth guard needed — the referrer has been verified via referral_code lookup
// and this is an internal helper with a trusted userId.
async function grantReferrerReward(userId: string): Promise<void> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('free_ai_consults_remaining, referral_credits_cents')
    .eq('id', userId)
    .single()
  if (!data) return

  await supabase
    .from('profiles')
    .update({
      free_ai_consults_remaining:
        (data.free_ai_consults_remaining || 0) +
        PATIENT_REFERRAL_CONFIG.REFERRER_REWARD_FREE_CONSULTS,
      referral_credits_cents:
        (data.referral_credits_cents || 0) +
        PATIENT_REFERRAL_CONFIG.REFERRER_REWARD_CREDIT_CENTS,
    })
    .eq('id', userId)
}

async function grantRefereeReward(userId: string): Promise<void> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('free_ai_consults_remaining')
    .eq('id', userId)
    .single()
  if (!data) return

  await supabase
    .from('profiles')
    .update({
      free_ai_consults_remaining:
        (data.free_ai_consults_remaining || 0) +
        PATIENT_REFERRAL_CONFIG.REFEREE_REWARD_FREE_CONSULTS,
    })
    .eq('id', userId)
}

/**
 * Validate a referral code without redeeming. Used for pre-signup preview.
 */
export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; referrerName?: string }> {
  const trimmed = code.trim().toUpperCase()
  if (!/^[A-Z2-9]{6}$/.test(trimmed)) return { valid: false }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('referral_code', trimmed)
    .maybeSingle()

  if (!data) return { valid: false }
  const firstName = (data.full_name || '').split(' ')[0] || undefined
  return { valid: true, referrerName: firstName }
}
