/**
 * Pharmacy Referrals
 * 
 * Referral system: creation, tracking, redemption, and management.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { 
  PharmacyReferral, 
  TrackingResult, 
  RedemptionResult 
} from './types'
import { calculateBaseMedicationPrice } from './utils'
import { calculateAndCreateCommission } from './earnings'
import { sendPharmacyReferralWhatsApp } from './whatsapp'

/**
 * Generate unique referral code
 */
export async function generateReferralCode(
  pharmacyId: string,
  appointmentId: string
): Promise<string> {
  const supabase = createServiceClient()

  const { data: existingCode } = await supabase
    .from('pharmacy_referrals')
    .select('referral_code')
    .eq('pharmacy_id', pharmacyId)
    .eq('appointment_id', appointmentId)
    .in('status', ['pending', 'sent'])
    .single()

  if (existingCode) {
    return existingCode.referral_code
  }

  const code = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  return code
}

/**
 * Create new pharmacy referral
 */
export async function createReferral(
  pharmacyId: string,
  appointmentId: string,
  patientId: string,
  doctorId: string,
  medications: string[],
  prescriptionId?: string
): Promise<PharmacyReferral | null> {
  const supabase = createServiceClient()

  const referralCode = await generateReferralCode(pharmacyId, appointmentId)

  const { data: referral, error } = await supabase
    .from('pharmacy_referrals')
    .insert({
      pharmacy_id: pharmacyId,
      referral_code: referralCode,
      prescription_id: prescriptionId || null,
      appointment_id: appointmentId,
      patient_id: patientId,
      doctor_id: doctorId,
      medications: medications as unknown as Record<string, unknown>[],
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    logger.error('Error creating referral:', { error })
    return null
  }

  return referral as PharmacyReferral
}

/**
 * Track referral by code
 */
export async function trackReferral(
  pharmacyId: string,
  referralCode: string,
  patientId: string
): Promise<TrackingResult> {
  const supabase = createServiceClient()

  const { data: referral, error } = await supabase
    .from('pharmacy_referrals')
    .select('*')
    .eq('pharmacy_id', pharmacyId)
    .eq('referral_code', referralCode)
    .eq('patient_id', patientId)
    .in('status', ['pending', 'sent'])
    .single()

  if (error || !referral) {
    return { success: false, error: 'Referral not found or expired' }
  }

  if (referral.status === 'redeemed') {
    return { success: false, error: 'Referral already redeemed' }
  }

  return { success: true, referral: referral as PharmacyReferral }
}

/**
 * Mark referral as sent and send WhatsApp notification
 */
export async function markReferralSent(
  referralId: string,
  phone: string
): Promise<boolean> {
  const supabase = createServiceClient()

  const { data: referral } = await supabase
    .from('pharmacy_referrals')
    .select('*, pharmacy:pharmacy_sponsors(*)')
    .eq('id', referralId)
    .single()

  if (!referral) {
    return false
  }

  const pharmacy = referral.pharmacy as { name: string; address: string | null } | undefined

  const result = await sendPharmacyReferralWhatsApp(
    phone,
    referral.referral_code,
    referral.medications || [],
    referral.expires_at,
    pharmacy ? { name: pharmacy.name, address: pharmacy.address } as PharmacyReferral['pharmacy'] : undefined
  )

  if (!result.success) {
    return false
  }

  const { error } = await supabase
    .from('pharmacy_referrals')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', referralId)

  return !error
}

/**
 * Redeem referral and create commission
 */
export async function redeemReferral(
  referralCode: string,
  pharmacyId: string,
  confirmedBy: string,
  medicationTotalCents?: number
): Promise<RedemptionResult> {
  const supabase = createServiceClient()

  const { data: referral, error: fetchError } = await supabase
    .from('pharmacy_referrals')
    .select('*, pharmacy:pharmacy_sponsors(*)')
    .eq('referral_code', referralCode)
    .eq('pharmacy_id', pharmacyId)
    .in('status', ['pending', 'sent'])
    .single()

  if (fetchError || !referral) {
    return { success: false, error: 'Referral not found or expired' }
  }

  if (new Date() > new Date(referral.expires_at)) {
    return { success: false, error: 'Referral has expired' }
  }

  const pharmacy = referral.pharmacy as { 
    commission_rate: number; 
    fixed_fee_cents: number 
  }
  
  const medicationTotal = medicationTotalCents || 
    referral.estimated_total_cents || 
    calculateBaseMedicationPrice((referral.medications || []) as string[])

  const { error: updateError } = await supabase
    .from('pharmacy_referrals')
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
      redemption_confirmed_by: confirmedBy,
    })
    .eq('id', referral.id)

  if (updateError) {
    return { success: false, error: 'Failed to update referral status' }
  }

  await calculateAndCreateCommission(
    referral.id,
    pharmacyId,
    referral.pharmacy as PharmacyReferral['pharmacy'] & { 
      commission_rate: number; 
      fixed_fee_cents: number 
    },
    medicationTotal
  )

  return { success: true }
}

/**
 * Get doctor referrals
 */
export async function getDoctorReferrals(doctorId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pharmacy_referrals')
    .select(`
      *,
      pharmacy:pharmacy_sponsors(name, slug, logo_url, phone, city, neighborhood)
    `)
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

/**
 * Get referral by code
 */
export async function getReferralByCode(referralCode: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pharmacy_referrals')
    .select(`
      *,
      pharmacy:pharmacy_sponsors(*),
      prescription:prescriptions(*)
    `)
    .eq('referral_code', referralCode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

/**
 * Update referral status with timestamp
 */
export async function updateReferralStatus(referralId: string, status: string) {
  const supabase = createServiceClient()

  const updates: Record<string, unknown> = { status }

  switch (status) {
    case 'viewed':
      updates.viewed_at = new Date().toISOString()
      break
    case 'contacted':
      updates.contacted_at = new Date().toISOString()
      break
    case 'scheduled':
      updates.scheduled_pickup_at = new Date().toISOString()
      break
    case 'redeemed':
      updates.redeemed_at = new Date().toISOString()
      break
  }

  const { error } = await supabase
    .from('pharmacy_referrals')
    .update(updates)
    .eq('id', referralId)

  if (error) throw error
}

/**
 * Get pharmacy referrals with optional status filter
 */
export async function getPharmacyReferrals(
  pharmacyId: string, 
  status?: string
): Promise<PharmacyReferral[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('pharmacy_referrals')
    .select('*, pharmacy:pharmacy_sponsors(*)')
    .eq('pharmacy_id', pharmacyId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error || !data) return []
  return data as PharmacyReferral[]
}
