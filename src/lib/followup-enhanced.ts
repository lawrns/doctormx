// Enhanced Follow-up System with Retry Logic, Error Monitoring, and Opt-out Support
// Built to complement and enhance the existing followup.ts module

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

// Retry configuration with exponential backoff
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMinutes: 5,
  maxDelayMinutes: 1440, // 24 hours
  backoffMultiplier: 2,
} as const

export type FollowUpEventType =
  | 'created'
  | 'scheduled'
  | 'sent'
  | 'failed'
  | 'retrying'
  | 'responded'
  | 'cancelled'
  | 'opted_out'

export interface FollowUpAuditLog {
  id: string
  followup_id: string
  event_type: FollowUpEventType
  previous_status: string | null
  new_status: string | null
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
  created_by: string | null
}

export interface OptOutRecord {
  id: string
  patient_id: string
  opt_out_type: 'all' | 'followups' | 'reminders' | 'promotional'
  reason: string | null
  opted_out_at: string
  opted_out_via: 'whatsapp' | 'sms' | 'email' | 'web' | 'support'
}

export interface FollowUpRetryResult {
  success: boolean
  shouldRetry: boolean
  nextRetryAt?: Date
  attempt: number
  maxAttempts: number
  error?: string
}

/**
 * Check if a patient has opted out of follow-ups
 */
export async function hasPatientOptedOut(
  patientId: string,
  followUpType: 'followups' | 'reminders' = 'followups'
): Promise<boolean> {
  const supabase = await createServiceClient()

  // Check profile-level opt-out
  const { data: profile } = await supabase
    .from('profiles')
    .select('whatsapp_opt_out, notification_preferences')
    .eq('id', patientId)
    .single()

  if (profile?.whatsapp_opt_out) {
    return true
  }

  // Check notification preferences
  const prefs = profile?.notification_preferences as Record<string, boolean> | null
  if (prefs && !prefs[followUpType]) {
    return true
  }

  // Check explicit opt-out records
  const { data: optOuts } = await supabase
    .from('followup_opt_outs')
    .select('opt_out_type')
    .eq('patient_id', patientId)
    .or(`opt_out_type.all,eq.${followUpType}`)

  return (optOuts?.length || 0) > 0
}

/**
 * Record a patient opt-out request
 */
export async function recordOptOut(
  patientId: string,
  optOutType: OptOutRecord['opt_out_type'],
  optedOutVia: OptOutRecord['opted_out_via'],
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient()

  try {
    const { error } = await supabase
      .from('followup_opt_outs')
      .insert({
        patient_id: patientId,
        opt_out_type: optOutType,
        opted_out_via: optedOutVia,
        reason: reason || null,
      })

    if (error) {
      logger.error('Failed to record opt-out', { patientId, optOutType, error: error.message })
      return { success: false, error: error.message }
    }

    // Cancel any pending follow-ups for this patient
    if (optOutType === 'all' || optOutType === 'followups') {
      await supabase
        .from('followups')
        .update({ status: 'cancelled' })
        .eq('patient_id', patientId)
        .eq('status', 'pending')

      logger.info('Cancelled pending follow-ups due to opt-out', { patientId, optOutType })
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Exception recording opt-out', { patientId, optOutType, error: message })
    return { success: false, error: message }
  }
}

/**
 * Calculate next retry time with exponential backoff
 */
export function calculateNextRetry(attempt: number): Date {
  const delayMinutes = Math.min(
    RETRY_CONFIG.baseDelayMinutes * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
    RETRY_CONFIG.maxDelayMinutes
  )
  return new Date(Date.now() + delayMinutes * 60 * 1000)
}

/**
 * Handle follow-up send result with retry logic
 */
export async function handleFollowUpResult(
  followUpId: string,
  result: { success: boolean; error?: string; messageSid?: string },
  currentAttempt: number = 1
): Promise<FollowUpRetryResult> {
  const supabase = await createServiceClient()

  if (result.success) {
    // Mark as sent
    await supabase
      .from('followups')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        retry_count: 0,
        next_retry_at: null,
        error_message: null,
        metadata: {
          message_sid: result.messageSid,
          sent_at: new Date().toISOString(),
        },
      })
      .eq('id', followUpId)

    return {
      success: true,
      shouldRetry: false,
      attempt: currentAttempt,
      maxAttempts: RETRY_CONFIG.maxRetries,
    }
  }

  // Handle failure - determine if we should retry
  const shouldRetry = currentAttempt < RETRY_CONFIG.maxRetries
  const nextRetryAt = shouldRetry ? calculateNextRetry(currentAttempt) : undefined

  await supabase
    .from('followups')
    .update({
      retry_count: currentAttempt,
      last_retry_at: new Date().toISOString(),
      next_retry_at: nextRetryAt?.toISOString() || null,
      error_message: result.error || 'Unknown error',
      status: shouldRetry ? 'pending' : 'failed',
      metadata: {
        last_attempt_at: new Date().toISOString(),
        attempt: currentAttempt,
      },
    })
    .eq('id', followUpId)

  // Log the failure
  logger.error('Follow-up send failed', {
    followUpId,
    attempt: currentAttempt,
    maxRetries: RETRY_CONFIG.maxRetries,
    willRetry: shouldRetry,
    nextRetryAt: nextRetryAt?.toISOString(),
    error: result.error,
  })

  return {
    success: false,
    shouldRetry,
    nextRetryAt,
    attempt: currentAttempt,
    maxAttempts: RETRY_CONFIG.maxRetries,
    error: result.error,
  }
}

/**
 * Get follow-ups that are ready for retry
 */
export async function getRetryableFollowUps(): Promise<Array<{ id: string; retry_count: number; type: string }>> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('followups')
    .select('id, retry_count, type')
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())
    .not('next_retry_at', 'is', null)
    .order('next_retry_at', { ascending: true })
    .limit(50)

  if (error) {
    logger.error('Failed to fetch retryable follow-ups', { error: error.message })
    return []
  }

  return (data || []) as Array<{ id: string; retry_count: number; type: string }>
}

/**
 * Get follow-up audit logs for a specific follow-up
 */
export async function getFollowUpAuditLogs(
  followUpId: string
): Promise<FollowUpAuditLog[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('followup_audit')
    .select('*')
    .eq('followup_id', followUpId)
    .order('created_at', { ascending: true })

  if (error) {
    logger.error('Failed to fetch audit logs', { followUpId, error: error.message })
    return []
  }

  return (data || []) as FollowUpAuditLog[]
}

/**
 * Get follow-up statistics for monitoring
 */
export async function getFollowUpStats(days: number = 30): Promise<{
  total: number
  sent: number
  failed: number
  pending: number
  retryRate: number
  avgRetries: number
  optOuts: number
}> {
  const supabase = await createServiceClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [
    { count: total },
    { count: sent },
    { count: failed },
    { count: pending },
    { count: optOuts },
  ] = await Promise.all([
    supabase.from('followups').select('id', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
    supabase.from('followups').select('id', { count: 'exact', head: true }).eq('status', 'sent').gte('created_at', startDate.toISOString()),
    supabase.from('followups').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', startDate.toISOString()),
    supabase.from('followups').select('id', { count: 'exact', head: true }).eq('status', 'pending').gte('created_at', startDate.toISOString()),
    supabase.from('followup_opt_outs').select('id', { count: 'exact', head: true }).gte('opted_out_at', startDate.toISOString()),
  ])

  // Calculate average retries
  const { data: followupsWithRetries } = await supabase
    .from('followups')
    .select('retry_count')
    .gt('retry_count', 0)
    .gte('created_at', startDate.toISOString())

  const avgRetries =
    followupsWithRetries && followupsWithRetries.length > 0
      ? followupsWithRetries.reduce((sum, f) => sum + (f.retry_count || 0), 0) / followupsWithRetries.length
      : 0

  const retryRate = total && total > 0 ? ((followupsWithRetries?.length || 0) / total) * 100 : 0

  return {
    total: total || 0,
    sent: sent || 0,
    failed: failed || 0,
    pending: pending || 0,
    retryRate,
    avgRetries,
    optOuts: optOuts || 0,
  }
}

/**
 * Send alert for critical follow-up failures
 */
export async function alertFollowUpFailure(
  followUpId: string,
  doctorId: string,
  failureCount: number
): Promise<void> {
  const supabase = await createServiceClient()

  // Create notification for the doctor
  await supabase.from('notifications').insert({
    user_id: doctorId,
    type: 'follow_up_failure',
    title: 'Recordatorio de seguimiento falló',
    message: `Un recordatorio de seguimiento ha fallado ${failureCount} veces. Por favor contacta a soporte.`,
    link: '/doctor/followups',
    metadata: {
      followup_id: followUpId,
      failure_count: failureCount,
      alert_type: 'followup_failure',
    },
  })

  logger.warn('Follow-up failure alert sent', { followUpId, doctorId, failureCount })
}

/**
 * Process a follow-up with full retry and opt-out handling
 * This wraps the existing send functions with enhanced logic
 */
export async function processFollowUpWithRetry(
  followUpId: string,
  sendFn: () => Promise<{ success: boolean; error?: string; messageSid?: string }>
): Promise<FollowUpRetryResult> {
  const supabase = await createServiceClient()

  // Get follow-up details
  const { data: followUp } = await supabase
    .from('followups')
    .select('id, patient_id, doctor_id, type, retry_count, status')
    .eq('id', followUpId)
    .single()

  if (!followUp) {
    return {
      success: false,
      shouldRetry: false,
      attempt: 0,
      maxAttempts: RETRY_CONFIG.maxRetries,
      error: 'Follow-up not found',
    }
  }

  // Check if patient has opted out
  const hasOptedOut = await hasPatientOptedOut(followUp.patient_id, 'followups')
  if (hasOptedOut) {
    await supabase
      .from('followups')
      .update({ status: 'cancelled' })
      .eq('id', followUpId)

    logger.info('Follow-up cancelled due to opt-out', { followUpId, patientId: followUp.patient_id })

    return {
      success: false,
      shouldRetry: false,
      attempt: followUp.retry_count || 0,
      maxAttempts: RETRY_CONFIG.maxRetries,
      error: 'Patient opted out',
    }
  }

  // Calculate current attempt
  const currentAttempt = (followUp.retry_count || 0) + 1

  // Attempt to send
  const result = await sendFn()

  // Handle result with retry logic
  const retryResult = await handleFollowUpResult(followUpId, result, currentAttempt)

  // Alert on critical failures (after all retries exhausted)
  if (!retryResult.success && !retryResult.shouldRetry && followUp.doctor_id) {
    await alertFollowUpFailure(followUpId, followUp.doctor_id, currentAttempt)
  }

  return retryResult
}

