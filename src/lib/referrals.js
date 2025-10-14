// Referral & Credits System
import { supabase } from './supabase'

export const REFERRAL_BONUS_MXN = 50

/**
 * Generate unique referral code for user
 */
export async function generateReferralCode(userId) {
  const code = `REF${userId.slice(0, 8).toUpperCase()}`

  const { error } = await supabase
    .from('user_referrals')
    .upsert({
      user_id: userId,
      referral_code: code,
      credits_mxn: 0
    })

  if (error) throw error
  return code
}

/**
 * Apply referral code and credit both users
 */
export async function applyReferralCode(newUserId, referralCode) {
  // Find referrer
  const { data: referrer, error: findError } = await supabase
    .from('user_referrals')
    .select('user_id, credits_mxn')
    .eq('referral_code', referralCode)
    .single()

  if (findError || !referrer) {
    throw new Error('Código de referido inválido')
  }

  // Credit referrer
  await supabase
    .from('user_referrals')
    .update({
      credits_mxn: referrer.credits_mxn + REFERRAL_BONUS_MXN
    })
    .eq('user_id', referrer.user_id)

  // Credit new user
  await supabase
    .from('user_referrals')
    .upsert({
      user_id: newUserId,
      credits_mxn: REFERRAL_BONUS_MXN,
      referred_by: referrer.user_id
    })

  // Track referral
  await supabase
    .from('referral_events')
    .insert({
      referrer_id: referrer.user_id,
      referee_id: newUserId,
      bonus_mxn: REFERRAL_BONUS_MXN,
      status: 'completed'
    })

  return { success: true, bonus: REFERRAL_BONUS_MXN }
}

/**
 * Get user's referral stats
 */
export async function getReferralStats(userId) {
  const { data, error } = await supabase
    .from('user_referrals')
    .select('referral_code, credits_mxn')
    .eq('user_id', userId)
    .single()

  if (error) return { code: null, credits: 0, referrals: 0 }

  const { count } = await supabase
    .from('referral_events')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .eq('status', 'completed')

  return {
    code: data.referral_code,
    credits: data.credits_mxn || 0,
    referrals: count || 0
  }
}

/**
 * Use credits toward consultation
 */
export async function useCredits(userId, amountMxn) {
  const { data: user } = await supabase
    .from('user_referrals')
    .select('credits_mxn')
    .eq('user_id', userId)
    .single()

  if (!user || user.credits_mxn < amountMxn) {
    throw new Error('Créditos insuficientes')
  }

  await supabase
    .from('user_referrals')
    .update({
      credits_mxn: user.credits_mxn - amountMxn
    })
    .eq('user_id', userId)

  return { remaining: user.credits_mxn - amountMxn }
}

/**
 * Generate WhatsApp share link
 */
export function generateWhatsAppShareLink(referralCode) {
  const message = encodeURIComponent(
    `¡Prueba doctor.mx! Consulta médica por WhatsApp en minutos. Usa mi código ${referralCode} y ambos recibimos $50 MXN de crédito. https://doctor.mx/r/${referralCode}`
  )
  return `https://wa.me/?text=${message}`
}
