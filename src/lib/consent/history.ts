/**
 * Consent History Tracking Module
 *
 * Tracks all changes to consent records for audit purposes
 * Implements comprehensive audit trail for LFPDPPP compliance
 *
 * @module consent/history
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ConsentHistoryEntry,
  ConsentAuditLog,
  ConsentAuditEventType,
  ConsentType,
} from './types'
import {
  logConsentGranted,
  logConsentWithdrawn,
  logConsentModified,
  logConsentViewed,
  createConsentAuditLog,
} from './audit'
import { logger } from '@/lib/observability/logger'

// ================================================
// CONSENT HISTORY FUNCTIONS
// ================================================

/**
 * Track consent granted event
 *
 * @param consentRecordId - Consent record ID
 * @param userId - User ID who granted consent
 * @param metadata - Additional metadata
 * @returns Created history entry
 */
export async function trackConsentGranted(
  consentRecordId: string,
  userId: string,
  metadata?: Record<string, unknown>
): Promise<ConsentHistoryEntry> {
  const supabase = await createClient()

  // Get the consent record to log properly
  const { data: consentRecord } = await supabase
    .from('user_consent_records')
    .select('*')
    .eq('id', consentRecordId)
    .single()

  const { data, error } = await supabase
    .from('consent_history')
    .insert({
      consent_record_id: consentRecordId,
      user_id: userId,
      action: 'granted',
      old_status: null,
      new_status: 'granted',
      old_consent_version_id: null,
      new_consent_version_id: consentRecordId, // Will be updated by trigger
      changed_by: userId,
      changed_by_role: 'user',
      change_reason: 'Usuario otorgó consentimiento',
      ip_address: null,
      user_agent: null,
      session_id: null,
      previous_state: null,
      new_state: { ...metadata, granted_at: new Date().toISOString() },
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    logger.error('Error recording consent granted', { error: (error as Error).message }, error as Error)
    throw error
  }

  // Use the unified audit system
  if (consentRecord) {
    await logConsentGranted(consentRecord, {
      user_id: userId,
      role: 'user',
    })
  }

  return data
}

/**
 * Track consent withdrawn event
 *
 * @param consentRecordId - Consent record ID
 * @param userId - User ID who withdrew consent
 * @param metadata - Additional metadata including reason
 * @returns Created history entry
 */
export async function trackConsentWithdrawn(
  consentRecordId: string,
  userId: string,
  metadata?: {
    reason?: string
    withdrawn_by?: 'user' | 'guardian' | 'admin'
  }
): Promise<ConsentHistoryEntry> {
  const supabase = await createClient()

  // Get current state before withdrawal
  const { data: currentConsent } = await supabase
    .from('user_consent_records')
    .select('*')
    .eq('id', consentRecordId)
    .single()

  const { data, error } = await supabase
    .from('consent_history')
    .insert({
      consent_record_id: consentRecordId,
      user_id: userId,
      action: 'withdrawn',
      old_status: currentConsent?.status ?? 'granted',
      new_status: 'withdrawn',
      old_consent_version_id: currentConsent?.consent_version_id || null,
      new_consent_version_id: currentConsent?.consent_version_id,
      changed_by: userId,
      changed_by_role: metadata?.withdrawn_by ?? 'user',
      change_reason: metadata?.reason ?? 'Usuario retiró consentimiento',
      ip_address: null,
      user_agent: null,
      session_id: null,
      previous_state: currentConsent,
      new_state: {
        withdrawn_at: new Date().toISOString(),
        reason: metadata?.reason,
      },
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    logger.error('Error recording consent withdrawn', { error: (error as Error).message }, error as Error)
    throw error
  }

  // Use the unified audit system
  if (currentConsent) {
    await logConsentWithdrawn(
      currentConsent,
      metadata?.reason ?? 'Usuario retiró consentimiento',
      {
        user_id: userId,
        role: (metadata?.withdrawn_by === 'guardian' ? 'admin' : metadata?.withdrawn_by) ?? 'user',
      }
    )
  }

  return data
}

/**
 * Track consent modified event
 *
 * @param consentRecordId - Consent record ID
 * @param userId - User ID who modified consent
 * @param metadata - Additional metadata
 * @returns Created history entry
 */
export async function trackConsentModified(
  consentRecordId: string,
  userId: string,
  metadata?: Record<string, unknown>
): Promise<ConsentHistoryEntry> {
  const supabase = await createClient()

  // Get current state before modification
  const { data: currentConsent } = await supabase
    .from('user_consent_records')
    .select('*')
    .eq('id', consentRecordId)
    .single()

  // Generate changes array for audit logging
  const changes: Array<{
    field: string
    old_value: unknown
    new_value: unknown
  }> = []

  if (metadata && currentConsent) {
    for (const [key, value] of Object.entries(metadata)) {
      if (key in currentConsent && currentConsent[key as keyof typeof currentConsent] !== value) {
        changes.push({
          field: key,
          old_value: currentConsent[key as keyof typeof currentConsent],
          new_value: value,
        })
      }
    }
  }

  const { data, error } = await supabase
    .from('consent_history')
    .insert({
      consent_record_id: consentRecordId,
      user_id: userId,
      action: 'modified',
      old_status: currentConsent?.status || null,
      new_status: (metadata?.status as ConsentHistoryEntry['new_status'] || currentConsent?.status) ?? 'granted',
      old_consent_version_id: currentConsent?.consent_version_id || null,
      new_consent_version_id: (metadata?.new_version as string) || currentConsent?.consent_version_id || null,
      changed_by: userId,
      changed_by_role: 'user',
      change_reason: metadata?.reason as string ?? 'Consentimiento modificado',
      ip_address: null,
      user_agent: null,
      session_id: null,
      previous_state: currentConsent,
      new_state: metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    logger.error('Error recording consent modified', { error: (error as Error).message }, error as Error)
    throw error
  }

  // Use the unified audit system
  if (currentConsent && changes.length > 0) {
    await logConsentModified(currentConsent, changes, {
      user_id: userId,
      role: 'user',
    })
  }

  return data
}

/**
 * Track consent expired event
 *
 * @param consentRecordId - Consent record ID
 * @param userId - User ID
 * @returns Created history entry
 */
export async function trackConsentExpired(
  consentRecordId: string,
  userId: string
): Promise<ConsentHistoryEntry> {
  const supabase = await createClient()

  // Get current state before expiration
  const { data: currentConsent } = await supabase
    .from('user_consent_records')
    .select('*')
    .eq('id', consentRecordId)
    .single()

  const { data, error } = await supabase
    .from('consent_history')
    .insert({
      consent_record_id: consentRecordId,
      user_id: userId,
      action: 'expired',
      old_status: currentConsent?.status ?? 'granted',
      new_status: 'expired',
      old_consent_version_id: currentConsent?.consent_version_id || null,
      new_consent_version_id: currentConsent?.consent_version_id,
      changed_by: 'system',
      changed_by_role: 'system',
      change_reason: 'Consentimiento expirado',
      ip_address: null,
      user_agent: null,
      session_id: null,
      previous_state: currentConsent,
      new_state: {
        expired_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    logger.error('Error recording consent expired', { error: (error as Error).message }, error as Error)
    throw error
  }

  // Use the unified audit system for consent expiration
  if (currentConsent) {
    await createConsentAuditLog({
      event_type: 'consent_expired',
      user_id: userId,
      consent_type: currentConsent.consent_type,
      consent_record_id: consentRecordId,
      actor: {
        user_id: null,
        role: 'system',
      },
      action_result: 'success',
      before_state: {
        status: currentConsent.status,
        expires_at: currentConsent.expires_at,
      },
      after_state: {
        status: 'expired',
        expired_at: new Date().toISOString(),
      },
    })
  }

  return data
}

/**
 * Get consent history for a specific consent record
 *
 * @param consentRecordId - Consent record ID
 * @returns Array of history entries
 */
export async function getConsentHistory(
  consentRecordId: string
): Promise<ConsentHistoryEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_history')
    .select('*')
    .eq('consent_record_id', consentRecordId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error getting consent history', { error: (error as Error).message }, error as Error)
    return []
  }

  return data || []
}

/**
 * Get all consent history for a user
 *
 * @param userId - User ID
 * @param options - Optional filters
 * @returns Array of history entries
 */
export async function getConsentHistoryForUser(
  userId: string,
  options?: {
    consentType?: string
    action?: ConsentHistoryEntry['action']
    startDate?: Date
    endDate?: Date
    limit?: number
  }
): Promise<ConsentHistoryEntry[]> {
  const supabase = await createClient()

  let query = supabase
    .from('consent_history')
    .select('*')
    .eq('user_id', userId)

  if (options?.startDate) {
    query = query.gte('created_at', options.startDate.toISOString())
  }

  if (options?.endDate) {
    query = query.lte('created_at', options.endDate.toISOString())
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    logger.error('Error getting consent history for user', { error: (error as Error).message }, error as Error)
    return []
  }

  let results = data || []

  // Filter by action if specified (client-side filter for simplicity)
  if (options?.action) {
    results = results.filter((entry) => entry.action === options.action)
  }

  return results
}

/**
 * Get consent history for multiple users (admin function)
 *
 * @param userIds - Array of user IDs
 * @param options - Optional filters
 * @returns Array of history entries
 */
export async function getConsentHistoryForUsers(
  userIds: string[],
  options?: {
    consentType?: string
    action?: ConsentHistoryEntry['action']
    startDate?: Date
    endDate?: Date
  }
): Promise<ConsentHistoryEntry[]> {
  const supabase = await createClient()

  let query = supabase
    .from('consent_history')
    .select('*')
    .in('user_id', userIds)

  if (options?.startDate) {
    query = query.gte('created_at', options.startDate.toISOString())
  }

  if (options?.endDate) {
    query = query.lte('created_at', options.endDate.toISOString())
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    logger.error('Error getting consent history by type', { error: (error as Error).message }, error as Error)
    return []
  }

  let results = data || []

  // Filter by action if specified
  if (options?.action) {
    results = results.filter((entry) => entry.action === options.action)
  }

  return results
}

// ================================================
// AUDIT LOG FUNCTIONS
// ================================================

/**
 * Create an audit log entry
 *
 * @param logData - Audit log data
 * @returns Created audit log entry
 */
export async function createAuditLog(
  logData: Omit<ConsentAuditLog, 'id' | 'created_at'>
): Promise<ConsentAuditLog> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_audit_logs')
    .insert({
      ...logData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    logger.error('Error creating audit log entry', { error: (error as Error).message }, error as Error)
    throw error
  }

  return data
}

/**
 * Get audit logs for a user
 *
 * @param userId - User ID
 * @param options - Optional filters
 * @returns Array of audit log entries
 */
export async function getAuditLogsForUser(
  userId: string,
  options?: {
    eventType?: ConsentAuditEventType
    startDate?: Date
    endDate?: Date
    limit?: number
  }
): Promise<ConsentAuditLog[]> {
  const supabase = await createClient()

  let query = supabase
    .from('consent_audit_logs')
    .select('*')
    .eq('user_id', userId)

  if (options?.eventType) {
    query = query.eq('event_type', options.eventType)
  }

  if (options?.startDate) {
    query = query.gte('occurred_at', options.startDate.toISOString())
  }

  if (options?.endDate) {
    query = query.lte('occurred_at', options.endDate.toISOString())
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query.order('occurred_at', { ascending: false })

  if (error) {
    logger.error('Error getting audit logs for user', { error: (error as Error).message }, error as Error)
    return []
  }

  return data || []
}

/**
 * Get all audit logs (admin function)
 *
 * @param options - Optional filters
 * @returns Array of audit log entries
 */
export async function getAllAuditLogs(options?: {
  eventType?: ConsentAuditEventType
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}): Promise<ConsentAuditLog[]> {
  const supabase = await createClient()

  let query = supabase.from('consent_audit_logs').select('*')

  if (options?.eventType) {
    query = query.eq('event_type', options.eventType)
  }

  if (options?.startDate) {
    query = query.gte('occurred_at', options.startDate.toISOString())
  }

  if (options?.endDate) {
    query = query.lte('occurred_at', options.endDate.toISOString())
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, (options.offset ?? 0) + (options.limit || 100))
  }

  const { data, error } = await query.order('occurred_at', { ascending: false })

  if (error) {
    logger.error('Error getting all audit logs', { error: (error as Error).message }, error as Error)
    return []
  }

  return data || []
}

/**
 * Get audit log statistics
 *
 * @param startDate - Start date for statistics
 * @param endDate - End date for statistics
 * @returns Audit log statistics
 */
export async function getAuditLogStatistics(
  startDate: Date,
  endDate: Date
): Promise<{
  total_events: number
  events_by_type: Record<string, number>
  events_by_date: Record<string, number>
  most_active_users: Array<{ user_id: string; event_count: number }>
}> {
  const logs = await getAllAuditLogs({ startDate, endDate })

  const eventsByType: Record<string, number> = {}
  const eventsByDate: Record<string, number> = {}
  const userEventCounts: Record<string, number> = {}

  for (const log of logs) {
    // Count by type
    eventsByType[log.event_type] = (eventsByType[log.event_type] ?? 0) + 1

    // Count by date
    const date = new Date(log.occurred_at).toISOString().split('T')[0]
    eventsByDate[date] = (eventsByDate[date] ?? 0) + 1

    // Count by user
    userEventCounts[log.user_id] = (userEventCounts[log.user_id] ?? 0) + 1
  }

  // Get most active users
  const mostActiveUsers = Object.entries(userEventCounts)
    .map(([user_id, event_count]) => ({ user_id, event_count }))
    .sort((a, b) => b.event_count - a.event_count)
    .slice(0, 10)

  return {
    total_events: logs.length,
    events_by_type: eventsByType,
    events_by_date: eventsByDate,
    most_active_users: mostActiveUsers,
  }
}

/**
 * Search audit logs by correlation ID
 *
 * @param correlationId - Correlation ID to search for
 * @returns Array of related audit log entries
 */
export async function getAuditLogsByCorrelationId(
  correlationId: string
): Promise<ConsentAuditLog[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_audit_logs')
    .select('*')
    .eq('correlation_id', correlationId)
    .order('occurred_at', { ascending: true })

  if (error) {
    logger.error('Error getting audit logs by correlation ID', { error: (error as Error).message }, error as Error)
    return []
  }

  return data || []
}

/**
 * Create a correlation ID for tracking related events
 *
 * @returns New correlation ID
 */
export function createCorrelationId(): string {
  return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Track a batch of related consent operations with correlation
 *
 * @param userId - User ID
 * @param eventType - Type of event
 * @param operations - Array of operations to track
 * @returns Correlation ID for the batch
 */
export async function trackBatchConsentOperations(
  userId: string,
  eventType: ConsentAuditEventType,
  operations: Array<{
    action: string
    consent_record_id?: string
    consent_type?: string
    before_state?: Record<string, unknown> | null
    after_state?: Record<string, unknown>
  }>
): Promise<string> {
  const correlationId = createCorrelationId()

  for (const operation of operations) {
    await createAuditLog({
      event_type: eventType,
      user_id: userId,
      consent_type: (operation.consent_type ?? 'data_processing') as ConsentType,
      consent_record_id: operation.consent_record_id || null,
      consent_request_id: null,
      action: operation.action,
      action_result: 'success',
      error_message: null,
      actor_user_id: userId,
      actor_role: 'user',
      actor_ip_address: null,
      actor_user_agent: null,
      session_id: null,
      request_id: null,
      correlation_id: correlationId,
      before_state: operation.before_state || null,
      after_state: operation.after_state || null,
      data_changes: operation.before_state && operation.after_state ? {
        // Generate diff
      } : null,
      occurred_at: new Date().toISOString(),
    })
  }

  return correlationId
}

/**
 * Get consent change timeline for a user
 *
 * @param userId - User ID
 * @param consentType - Optional consent type filter
 * @returns Timeline of consent changes
 */
export async function getConsentChangeTimeline(
  userId: string,
  consentType?: string
): Promise<Array<{
  date: string
  action: string
  consent_type: string
  details: string
}>> {
  const history = await getConsentHistoryForUser(userId, { consentType })

  return history.map((entry) => ({
    date: entry.created_at,
    action: entry.action,
    consent_type: entry.new_consent_version_id, // Will be resolved to actual type
    details: entry.change_reason || `${entry.action} - ${entry.old_status} → ${entry.new_status}`,
  }))
}

/**
 * Export consent history for a user (for compliance requests)
 *
 * @param userId - User ID
 * @param format - Export format ('json' or 'csv')
 * @returns Exported data
 */
export async function exportConsentHistory(
  userId: string,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const history = await getConsentHistoryForUser(userId)

  if (format === 'json') {
    return JSON.stringify(history, null, 2)
  }

  // CSV export
  const headers = [
    'Fecha',
    'Acción',
    'Estado Anterior',
    'Estado Nuevo',
    'Versión Anterior',
    'Versión Nueva',
    'Razón',
    'Cambiado Por',
  ]

  const rows = history.map((entry) => [
    entry.created_at,
    entry.action,
    entry.old_status ?? 'N/A',
    entry.new_status,
    entry.old_consent_version_id ?? 'N/A',
    entry.new_consent_version_id,
    entry.change_reason ?? 'N/A',
    entry.changed_by,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

