/**
 * ARCO Data Export - Anonymization
 *
 * Handles data anonymization for CANCEL requests
 * Implements secure anonymization techniques for data privacy
 */

import { createClient } from '@/lib/supabase/server'
import { ArcoError, ArcoErrorCode } from '@/types/arco'

/**
 * Generate anonymous identifier for a user
 *
 * @param userId - Original user ID
 * @returns Anonymous identifier string
 */
export function generateAnonymousId(userId: string): string {
  return `anon_${userId.slice(0, 8)}_${Date.now().toString(36)}`
}

/**
 * Generate anonymous email address
 *
 * @param userId - User ID
 * @returns Anonymous email
 */
export function generateAnonymousEmail(userId: string): string {
  return `${userId.slice(0, 8)}@anonymized.patient`
}

/**
 * Generate anonymous name
 *
 * @param userId - User ID
 * @returns Anonymous name
 */
export function generateAnonymousName(userId: string): string {
  return `Usuario ${userId.slice(0, 8)}`
}

/**
 * Anonymize a profile record
 *
 * @param userId - User ID to anonymize
 * @returns Object with anonymized values
 */
export function createAnonymizedProfile(userId: string): {
  full_name: string
  email: string
  phone: null
  photo_url: null
} {
  return {
    full_name: generateAnonymousName(userId),
    email: generateAnonymousEmail(userId),
    phone: null,
    photo_url: null,
  }
}

/**
 * Anonymize user profile in database
 *
 * @param userId - User ID to anonymize
 * @returns True if successful
 * @throws ArcoError if operation fails
 */
export async function anonymizeUserProfile(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const anonymizedData = createAnonymizedProfile(userId)

  const { error } = await supabase
    .from('profiles')
    .update({
      ...anonymizedData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    throw new ArcoError(
      `Error anonymizing profile: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return true
}

/**
 * Anonymize appointments by removing sensitive details
 *
 * @param userId - User ID
 * @returns Number of records anonymized
 */
export async function anonymizeAppointments(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', userId)

  if (!appointments || appointments.length === 0) {
    return 0
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      reason_for_visit: '[ANONIMIZADO]',
      notes: '[ANONIMIZADO]',
      updated_at: new Date().toISOString(),
    })
    .eq('patient_id', userId)

  if (error) {
    throw new ArcoError(
      `Error anonymizing appointments: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return appointments.length
}

/**
 * Anonymize chat history
 *
 * @param userId - User ID
 * @returns Number of conversations anonymized
 */
export async function anonymizeChatHistory(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data: conversations } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('patient_id', userId)

  if (!conversations || conversations.length === 0) {
    return 0
  }

  // Anonymize messages
  const { error: messagesError } = await supabase
    .from('chat_messages')
    .update({
      content: '[ANONIMIZADO]',
      updated_at: new Date().toISOString(),
    })
    .in(
      'conversation_id',
      conversations.map((c) => c.id)
    )

  if (messagesError) {
    throw new ArcoError(
      `Error anonymizing chat messages: ${messagesError.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  // Anonymize conversation titles
  const { error: convError } = await supabase
    .from('chat_conversations')
    .update({
      title: 'Conversación Anonimizada',
      updated_at: new Date().toISOString(),
    })
    .eq('patient_id', userId)

  if (convError) {
    throw new ArcoError(
      `Error anonymizing conversations: ${convError.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return conversations.length
}

/**
 * Delete privacy preferences for user
 *
 * @param userId - User ID
 * @returns True if deleted or not found
 */
export async function deletePrivacyPreferences(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('privacy_preferences')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw new ArcoError(
      `Error deleting privacy preferences: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return true
}

/**
 * Anonymization result type
 */
export interface AnonymizationResult {
  profile_anonymized: boolean
  appointments_anonymized: number
  chat_history_anonymized: number
  privacy_preferences_deleted: boolean
  timestamp: string
}

/**
 * Perform complete user data anonymization
 * This is used for CANCEL requests where full deletion is not possible
 *
 * @param userId - User ID to anonymize
 * @returns Anonymization result
 * @throws ArcoError if any operation fails
 */
export async function anonymizeUserData(userId: string): Promise<AnonymizationResult> {
  const results: AnonymizationResult = {
    profile_anonymized: false,
    appointments_anonymized: 0,
    chat_history_anonymized: 0,
    privacy_preferences_deleted: false,
    timestamp: new Date().toISOString(),
  }

  // Anonymize profile
  results.profile_anonymized = await anonymizeUserProfile(userId)

  // Anonymize appointments
  results.appointments_anonymized = await anonymizeAppointments(userId)

  // Anonymize chat history
  results.chat_history_anonymized = await anonymizeChatHistory(userId)

  // Delete privacy preferences
  results.privacy_preferences_deleted = await deletePrivacyPreferences(userId)

  return results
}

/**
 * Check if data has been anonymized
 *
 * @param userId - User ID
 * @returns True if profile appears anonymized
 */
export async function isDataAnonymized(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  if (!profile) {
    return false
  }

  return profile.email?.includes('@anonymized.patient') || false
}

/**
 * Validate anonymization requirements
 *
 * @param userId - User ID
 * @returns Validation result
 */
export async function validateAnonymizationRequirements(userId: string): Promise<{
  can_anonymize: boolean
  reasons: string[]
}> {
  const supabase = await createClient()
  const reasons: string[] = []

  // Check if user has active appointments
  const { data: activeAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', userId)
    .in('status', ['scheduled', 'confirmed', 'in_progress'])

  if (activeAppointments && activeAppointments.length > 0) {
    reasons.push(`User has ${activeAppointments.length} active appointments`)
  }

  // Check if user has pending payments
  const { data: pendingPayments } = await supabase
    .from('payments')
    .select('id')
    .eq('appointment.appointments.patient_id', userId)
    .eq('status', 'pending')

  if (pendingPayments && pendingPayments.length > 0) {
    reasons.push(`User has ${pendingPayments.length} pending payments`)
  }

  return {
    can_anonymize: reasons.length === 0,
    reasons,
  }
}
