// Referrals Domain Module
// Input: Referral request from doctor, patient context
// Process: Match specialist, notify, track acceptance
// Output: Completed referral with outcome tracking

import { createServiceClient } from '@/lib/supabase/server'
import type { DirectoryDoctor } from '../directory'

export const REFERRALS_CONFIG = {
  // Time limits
  REFERRAL_EXPIRY_DAYS: 30,
  RESPONSE_WINDOW_HOURS: 48,
  // Revenue share
  REFERRAL_FEE_PERCENTAGE: 10, // 10% of first consultation
  MIN_REFERRAL_FEE_CENTS: 5000, // 50 MXN minimum
  MAX_REFERRAL_FEE_CENTS: 50000, // 500 MXN maximum
} as const

export type ReferralStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'expired'
  | 'cancelled'

export type ReferralUrgency = 'routine' | 'urgent' | 'emergency'

export interface DoctorReferral {
  id: string
  referring_doctor_id: string
  receiving_doctor_id?: string
  patient_id: string
  specialty_needed: string
  urgency: ReferralUrgency
  status: ReferralStatus
  reason: string
  clinical_notes?: string
  attachments?: string[]
  response_notes?: string
  declined_reason?: string
  responded_at?: string
  completed_at?: string
  outcome_notes?: string
  outcome_rating?: number
  referral_fee_cents?: number
  fee_paid?: boolean
  created_at: string
  expires_at: string
}

export interface CreateReferralInput {
  referring_doctor_id: string
  patient_id: string
  specialty_needed: string
  urgency?: ReferralUrgency
  reason: string
  clinical_notes?: string
  receiving_doctor_id?: string
}

export interface ReferralSearchParams {
  specialty: string
  city?: string
  urgency?: ReferralUrgency
  exclude_doctor_ids?: string[]
}

/**
 * Create a new referral
 */
export async function createReferral(input: CreateReferralInput): Promise<{ id: string }> {
  const supabase = await createServiceClient()
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFERRALS_CONFIG.REFERRAL_EXPIRY_DAYS)
  
  const { data, error } = await supabase
    .from('doctor_referrals')
    .insert({
      referring_doctor_id: input.referring_doctor_id,
      receiving_doctor_id: input.receiving_doctor_id,
      patient_id: input.patient_id,
      specialty_needed: input.specialty_needed,
      urgency: input.urgency || 'routine',
      reason: input.reason,
      clinical_notes: input.clinical_notes,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()
  
  if (error) {
    throw new Error(`Failed to create referral: ${error.message}`)
  }
  
  return { id: data.id }
}

/**
 * Accept a referral
 */
export async function acceptReferral(
  referralId: string,
  doctorId: string,
  notes?: string
): Promise<void> {
  const supabase = await createServiceClient()
  
  const { error } = await supabase
    .from('doctor_referrals')
    .update({
      status: 'accepted',
      receiving_doctor_id: doctorId,
      responded_at: new Date().toISOString(),
      response_notes: notes,
    })
    .eq('id', referralId)
    .eq('status', 'pending')
  
  if (error) {
    throw new Error(`Failed to accept referral: ${error.message}`)
  }
}

/**
 * Decline a referral
 */
export async function declineReferral(
  referralId: string,
  doctorId: string,
  reason?: string
): Promise<void> {
  const supabase = await createServiceClient()
  
  const { error } = await supabase
    .from('doctor_referrals')
    .update({
      status: 'declined',
      responded_at: new Date().toISOString(),
      declined_reason: reason,
    })
    .eq('id', referralId)
    .eq('receiving_doctor_id', doctorId)
    .eq('status', 'pending')
  
  if (error) {
    throw new Error(`Failed to decline referral: ${error.message}`)
  }
}

/**
 * Complete a referral
 */
export async function completeReferral(
  referralId: string,
  outcomeNotes?: string,
  rating?: number
): Promise<void> {
  const supabase = await createServiceClient()
  
  // Calculate referral fee
  const baseFee = 50000 // Assume 500 MXN consultation
  const feePercent = REFERRALS_CONFIG.REFERRAL_FEE_PERCENTAGE / 100
  let feeCents = Math.round(baseFee * feePercent)
  feeCents = Math.max(feeCents, REFERRALS_CONFIG.MIN_REFERRAL_FEE_CENTS)
  feeCents = Math.min(feeCents, REFERRALS_CONFIG.MAX_REFERRAL_FEE_CENTS)
  
  const { error } = await supabase
    .from('doctor_referrals')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      outcome_notes: outcomeNotes,
      outcome_rating: rating,
      referral_fee_cents: feeCents,
    })
    .eq('id', referralId)
    .eq('status', 'accepted')
  
  if (error) {
    throw new Error(`Failed to complete referral: ${error.message}`)
  }
}

/**
 * Find specialists for a referral
 */
export async function findSpecialistsForReferral(
  params: ReferralSearchParams
): Promise<DirectoryDoctor[]> {
  const supabase = await createServiceClient()
  
  let query = supabase
    .from('doctores')
    .select('*')
    .eq('license_status', 'verified')
    .contains('specialties', [params.specialty])
    .order('rating_avg', { ascending: false })
    .limit(10)
  
  if (params.city) {
    query = query.eq('city', params.city)
  }
  
  if (params.exclude_doctor_ids?.length) {
    query = query.not('user_id', 'in', `(${params.exclude_doctor_ids.join(',')})`)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to find specialists: ${error.message}`)
  }
  
  return data as unknown as DirectoryDoctor[]
}

/**
 * Get referral network stats for a doctor
 */
export async function getReferralStats(doctorId: string): Promise<{
  referrals_sent: number
  referrals_received: number
  referrals_completed: number
  total_fees_earned: number
}> {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .from('referral_network_stats')
    .select('*')
    .eq('doctor_id', doctorId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get stats: ${error.message}`)
  }
  
  return {
    referrals_sent: data?.referrals_sent || 0,
    referrals_received: data?.referrals_received || 0,
    referrals_completed: data?.referrals_completed || 0,
    total_fees_earned: data?.total_referral_fees_earned_cents || 0,
  }
}

