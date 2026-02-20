/**
 * Pharmacy Earnings
 * 
 * Commission calculations and payout processing.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { 
  PharmacySponsor, 
  DoctorEarnings, 
  PharmacyEarnings, 
  PharmacyStats,
  PayoutResult 
} from './types'
import { calculateBaseMedicationPrice } from './utils'

/**
 * Calculate commission and create commission record for a referral
 */
export async function calculateAndCreateCommission(
  referralId: string,
  pharmacyId: string,
  pharmacy: PharmacySponsor,
  medicationTotalCents: number
): Promise<void> {
  const supabase = createServiceClient()
  
  const commissionAmount = Math.round(medicationTotalCents * (pharmacy.commission_rate / 100))
  const totalPayout = commissionAmount + pharmacy.fixed_fee_cents

  const { error } = await supabase
    .from('pharmacy_commissions')
    .insert({
      referral_id: referralId,
      pharmacy_id: pharmacyId,
      medication_total_cents: medicationTotalCents,
      commission_rate: pharmacy.commission_rate,
      commission_amount_cents: commissionAmount,
      fixed_fee_cents: pharmacy.fixed_fee_cents,
      total_payout_cents: totalPayout,
      status: 'pending',
    })

  if (error) {
    logger.error('Error creating commission:', { error })
  }
}

/**
 * Process pharmacy payout for a period
 */
export async function processPharmacyPayout(
  pharmacyId: string,
  periodStart: string,
  periodEnd: string
): Promise<PayoutResult> {
  const supabase = createServiceClient()

  const startDate = new Date(periodStart)
  const endDate = new Date(periodEnd)

  const { data: commissions, error: commissionsError } = await supabase
    .from('pharmacy_commissions')
    .select('*')
    .eq('pharmacy_id', pharmacyId)
    .eq('status', 'pending')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (commissionsError) {
    return { success: false, error: 'Failed to fetch commissions' }
  }

  if (!commissions || commissions.length === 0) {
    return { success: false, error: 'No pending commissions for this period' }
  }

  const totalReferrals = commissions.length
  const redeemedCount = totalReferrals
  const totalCommission = commissions.reduce((sum, c) => sum + c.commission_amount_cents, 0)
  const totalFixedFees = commissions.reduce((sum, c) => sum + c.fixed_fee_cents, 0)
  const totalPayout = totalCommission + totalFixedFees

  const { data: payout, error: payoutError } = await supabase
    .from('pharmacy_payouts')
    .insert({
      pharmacy_id: pharmacyId,
      period_start: periodStart,
      period_end: periodEnd,
      total_referrals: totalReferrals,
      redeemed_referrals: redeemedCount,
      total_commission_cents: totalCommission,
      total_fixed_fees_cents: totalFixedFees,
      total_payout_cents: totalPayout,
      status: 'processing',
    })
    .select()
    .single()

  if (payoutError) {
    return { success: false, error: 'Failed to create payout' }
  }

  const { error: updateError } = await supabase
    .from('pharmacy_commissions')
    .update({ status: 'approved', payout_id: payout.id })
    .eq('pharmacy_id', pharmacyId)
    .eq('status', 'pending')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (updateError) {
    logger.error('Error updating commissions:', { error: updateError })
  }

  return { success: true, payoutId: payout.id }
}

/**
 * Get doctor earnings summary
 */
export async function getDoctorEarnings(doctorId: string): Promise<DoctorEarnings> {
  const supabase = createServiceClient()

  const { data: commissions, error: commissionsError } = await supabase
    .from('pharmacy_commissions')
    .select('*')
    .eq('doctor_id', doctorId)

  if (commissionsError) throw commissionsError

  const { data: referrals, error: referralsError } = await supabase
    .from('pharmacy_referrals')
    .select('status')
    .eq('doctor_id', doctorId)

  if (referralsError) throw referralsError

  const totalReferrals = referrals?.length ?? 0
  const redeemedReferrals = referrals?.filter((r) => r.status === 'redeemed').length ?? 0
  const pendingReferrals = referrals?.filter(
    (r) => r.status !== 'redeemed' && r.status !== 'cancelled' && r.status !== 'expired'
  ).length ?? 0

  const totalReferralFees = commissions?.reduce((sum, c) => sum + (c.referral_fee_cents ?? 0), 0) || 0
  const totalCommissions = commissions?.reduce((sum, c) => sum + (c.commission_amount_cents ?? 0), 0) || 0
  const platformFees = commissions?.reduce((sum, c) => sum + (c.platform_fee_cents ?? 0), 0) || 0
  const netEarnings = commissions?.reduce((sum, c) => sum + (c.net_doctor_earnings_cents ?? 0), 0) || 0

  return {
    totalReferrals,
    redeemedReferrals,
    pendingReferrals,
    totalReferralFees,
    totalCommissions,
    platformFees,
    netEarnings,
  }
}

/**
 * Get pharmacy earnings summary
 */
export async function getPharmacyEarnings(pharmacyId: string): Promise<PharmacyEarnings> {
  const supabase = createServiceClient()

  const { data: commissions, error: commissionsError } = await supabase
    .from('pharmacy_commissions')
    .select('*')
    .eq('pharmacy_id', pharmacyId)

  if (commissionsError) throw commissionsError

  const { data: referrals, error: referralsError } = await supabase
    .from('pharmacy_referrals')
    .select('status')
    .eq('pharmacy_id', pharmacyId)

  if (referralsError) throw referralsError

  const totalPayouts = commissions?.reduce((sum, c) => sum + (c.total_payout_cents ?? 0), 0) || 0
  const pendingPayouts = commissions
    ?.filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + (c.total_payout_cents ?? 0), 0) || 0
  const paidPayouts = commissions
    ?.filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + (c.total_payout_cents ?? 0), 0) || 0

  return {
    totalReferrals: referrals?.length ?? 0,
    redeemedReferrals: referrals?.filter((r) => r.status === 'redeemed').length ?? 0,
    totalPayouts,
    pendingPayouts,
    paidPayouts,
  }
}

/**
 * Get pharmacy statistics
 */
export async function getPharmacyStats(pharmacyId: string): Promise<PharmacyStats> {
  const supabase = createServiceClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: referrals } = await supabase
    .from('pharmacy_referrals')
    .select('status, created_at')
    .eq('pharmacy_id', pharmacyId)

  const { data: commissions } = await supabase
    .from('pharmacy_commissions')
    .select('total_payout_cents, created_at')
    .eq('pharmacy_id', pharmacyId)
    .eq('status', 'approved')

  const totalReferrals = referrals?.length ?? 0
  const redeemedReferrals = referrals?.filter((r) => r.status === 'redeemed').length ?? 0
  const pendingReferrals = referrals?.filter((r) => r.status === 'sent').length ?? 0

  const totalRevenue = commissions?.reduce((sum, c) => sum + c.total_payout_cents, 0) || 0
  const thisMonthRevenue = commissions
    ?.filter((c) => c.created_at >= startOfMonth)
    .reduce((sum, c) => sum + c.total_payout_cents, 0) || 0

  return {
    totalReferrals,
    redeemedReferrals,
    pendingReferrals,
    totalRevenue,
    thisMonthRevenue,
  }
}
