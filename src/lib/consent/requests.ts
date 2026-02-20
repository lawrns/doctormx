/**
 * Consent Requests Module
 *
 * Manages pending consent requests for users
 * Gestiona solicitudes de consentimiento pendientes para usuarios
 *
 * @module consent/requests
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ConsentType,
  ConsentRequest,
} from './types'
import { ConsentError, ConsentErrorCode } from './types'
import { getLatestConsentVersion } from './versioning'

// ================================================
// ERROR UTILITY
// ================================================

/**
 * Create a consent error
 */
function createConsentError(
  message: string,
  code: ConsentErrorCode,
  statusCode: number = 400
): ConsentError {
  return new ConsentError(message, code, statusCode)
}

// ================================================
// CONSENT REQUEST FUNCTIONS
// ================================================

/**
 * Create consent request for user
 *
 * @param userId - User ID
 * @param consentTypes - Array of consent types to request
 * @param reason - Reason for request
 * @returns Created consent request
 */
export async function createConsentRequest(
  userId: string,
  consentTypes: ConsentType[],
  reason: 'new_consent' | 'version_update' | 're_consent_required' | 'age_verification'
): Promise<ConsentRequest> {
  const supabase = await createClient()

  // Get latest versions for requested consent types
  const versionIds: string[] = []
  for (const type of consentTypes) {
    const version = await getLatestConsentVersion(type)
    if (version) {
      versionIds.push(version.id)
    }
  }

  const { data, error } = await supabase
    .from('consent_requests')
    .insert({
      user_id: userId,
      consent_type: consentTypes[0], // Primary consent type
      required_version_id: versionIds[0],
      request_reason: reason,
      priority: reason === 'age_verification' ? 'urgent' : 'normal',
      requested_for: consentTypes,
      delivery_method: 'in_app',
      status: 'pending',
      reminder_count: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_by: userId,
      metadata: { all_required_versions: versionIds },
    })
    .select()
    .single()

  if (error) {
    throw createConsentError(
      `Error al crear solicitud de consentimiento: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  return data
}

/**
 * Get pending consent requests for user
 *
 * @param userId - User ID
 * @returns Array of pending consent requests
 */
export async function getPendingConsentRequests(
  userId: string
): Promise<ConsentRequest[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_requests')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'delivered', 'viewed'])
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  // Filter out expired requests
  const now = new Date()
  return (data || []).filter((req) => !req.expires_at || new Date(req.expires_at) > now)
}

/**
 * Get all consent requests for a user (including completed)
 *
 * @param userId - User ID
 * @returns Array of consent requests
 */
export async function getConsentRequestsForUser(
  userId: string
): Promise<ConsentRequest[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

/**
 * Get a specific consent request
 *
 * @param requestId - Request ID
 * @returns Consent request or null
 */
export async function getConsentRequest(
  requestId: string
): Promise<ConsentRequest | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle()

  if (error) {
    return null
  }

  return data
}

/**
 * Update consent request status
 *
 * @param requestId - Request ID
 * @param status - New status
 * @param response - Optional response data
 */
export async function updateConsentRequestStatus(
  requestId: string,
  status: ConsentRequest['status'],
  response?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('consent_requests')
    .update({
      status,
      response: response || null,
      responded_at: status === 'granted' || status === 'declined' ? new Date().toISOString() : null,
    })
    .eq('id', requestId)
}

/**
 * Mark consent request as delivered
 *
 * @param requestId - Request ID
 */
export async function markConsentRequestDelivered(
  requestId: string
): Promise<void> {
  await updateConsentRequestStatus(requestId, 'delivered')
}

/**
 * Mark consent request as viewed
 *
 * @param requestId - Request ID
 */
export async function markConsentRequestViewed(
  requestId: string
): Promise<void> {
  await updateConsentRequestStatus(requestId, 'viewed')
}

/**
 * Decline consent request
 *
 * @param requestId - Request ID
 * @param reason - Reason for decline
 */
export async function declineConsentRequest(
  requestId: string,
  reason?: string
): Promise<void> {
  await updateConsentRequestStatus(requestId, 'declined', { reason })
}

/**
 * Send reminder for consent request
 *
 * @param requestId - Request ID
 * @returns Updated consent request
 */
export async function sendConsentRequestReminder(
  requestId: string
): Promise<ConsentRequest> {
  const supabase = await createClient()

  const { data: request } = await supabase
    .from('consent_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!request) {
    throw createConsentError(
      'Solicitud de consentimiento no encontrada',
      ConsentErrorCode.CONSENT_NOT_FOUND,
      404
    )
  }

  const { data, error } = await supabase
    .from('consent_requests')
    .update({
      reminder_count: (request.reminder_count ?? 0) + 1,
      last_reminder_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    throw createConsentError(
      `Error al enviar recordatorio: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  return data
}

/**
 * Expire old consent requests
 *
 * @returns Number of expired requests
 */
export async function expireOldConsentRequests(): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_requests')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .lt('expires_at', new Date().toISOString())
    .in('status', ['pending', 'delivered', 'viewed'])
    .select()

  if (error) {
    return 0
  }

  return data?.length ?? 0
}

/**
 * Get consent request statistics
 *
 * @param userId - User ID
 * @returns Statistics object
 */
export async function getConsentRequestStatistics(
  userId: string
): Promise<{
  total: number
  pending: number
  granted: number
  declined: number
  expired: number
}> {
  const requests = await getConsentRequestsForUser(userId)

  return {
    total: requests.length,
    pending: requests.filter((r) => ['pending', 'delivered', 'viewed'].includes(r.status)).length,
    granted: requests.filter((r) => r.status === 'granted').length,
    declined: requests.filter((r) => r.status === 'declined').length,
    expired: requests.filter((r) => r.status === 'expired').length,
  }
}
