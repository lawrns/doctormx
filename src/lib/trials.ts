// Free trial management for doctor subscriptions
// Doctors get 14 days free, no credit card required

import { createClient } from '@/lib/supabase/server'

export const TRIAL_DURATION_DAYS = 14

export interface TrialStatus {
  isInTrial: boolean
  trialEndsAt: string | null
  daysRemaining: number | null
  hasUsedTrial: boolean
}

export async function startDoctorTrial(doctorId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('doctor_trials')
    .select('id')
    .eq('doctor_id', doctorId)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Ya tienes un periodo de prueba registrado.' }
  }

  const startsAt = new Date()
  const endsAt = new Date(startsAt.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from('doctor_trials')
    .insert({
      doctor_id: doctorId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getTrialStatus(doctorId: string): Promise<TrialStatus> {
  const supabase = await createClient()

  const { data: trial } = await supabase
    .from('doctor_trials')
    .select('*')
    .eq('doctor_id', doctorId)
    .maybeSingle()

  if (!trial) {
    return { isInTrial: false, trialEndsAt: null, daysRemaining: null, hasUsedTrial: false }
  }

  const now = new Date()
  const endsAt = new Date(trial.ends_at)
  const timeRemaining = endsAt.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)))

  if (timeRemaining <= 0) {
    return { isInTrial: false, trialEndsAt: trial.ends_at, daysRemaining: 0, hasUsedTrial: true }
  }

  return {
    isInTrial: true,
    trialEndsAt: trial.ends_at,
    daysRemaining,
    hasUsedTrial: false,
  }
}

export async function checkTrialExpired(doctorId: string): Promise<boolean> {
  const status = await getTrialStatus(doctorId)
  if (!status.hasUsedTrial && !status.isInTrial) return false
  return !status.isInTrial && status.hasUsedTrial
}
