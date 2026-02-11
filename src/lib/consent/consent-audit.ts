/**
 * Consent Audit Integration Module
 *
 * Integrates consent system with unified audit logging from src/types/audit.ts
 * Provides LFPDPPP-compliant audit trail for all consent operations
 *
 * @module consent/consent-audit
 */

import { createClient } from '@/lib/supabase/server'
import type {
  BaseAuditLog,
  AuditCategory,
  AuditEventType,
  AuditActor,
  AuditResource,
  AuditOutcome,
} from '@/types/audit'
import type {
  ConsentType,
  ConsentHistoryEntry,
  ConsentAuditEventType,
  UserConsentRecord,
  ConsentVersion,
} from './types'
import { logger } from '@/lib/observability/logger'

// ================================================
// AUDIT LOGGING FUNCTIONS
// ================================================

/**
 * Create an audit log entry using the unified audit system
 *
 * @param params - Audit log parameters
 * @returns Created audit log entry
 */
export async function createConsentAuditLog(params: {
  event_type: ConsentAuditEventType
  user_id: string
  consent_type?: ConsentType
  consent_record_id?: string
  actor?: {
    user_id: string | null
    role: 'user' | 'admin' | 'system' | 'api'
    user_name?: string | null
  }
  action_result?: 'success' | 'failure' | 'partial'
  error_message?: string | null
  ip_address?: string | null
  user_agent?: string | null
  session_id?: string | null
  request_id?: string | null
  before_state?: Record<string, unknown> | null
  after_state?: Record<string, unknown> | null
}): Promise<void> {
  const supabase = await createClient()

  // Map consent audit event types to unified audit event types
  const eventTypeMap: Record<ConsentAuditEventType, AuditEventType> = {
    consent_granted: AuditEventType.CONSENT_GRANTED,
    consent_withdrawn: AuditEventType.CONSENT_WITHDRAWN,
    consent_expired: AuditEventType.CONSENT_UPDATED,
    consent_revoked: AuditEventType.CONSENT_WITHDRAWN,
    consent_modified: AuditEventType.CONSENT_UPDATED,
    consent_requested: AuditEventType.CONSENT_VIEWED,
    consent_viewed: AuditEventType.CONSENT_VIEWED,
    consent_declined: AuditEventType.CONSENT_WITHDRAWN,
    version_updated: AuditEventType.DATA_UPDATE,
    guardian_consent_added: AuditEventType.CONSENT_GRANTED,
    guardian_consent_removed: AuditEventType.CONSENT_WITHDRAWN,
    bulk_consent_operation: AuditEventType.DATA_UPDATE,
    consent_export: AuditEventType.DATA_ACCESS_EXPORT,
    consent_import: AuditEventType.DATA_IMPORT,
  }

  const eventType = eventTypeMap[params.event_type] || AuditEventType.DATA_UPDATE

  // Build audit log entry
  const auditLog: Omit<BaseAuditLog, 'id' | 'created_at'> = {
    category: 'consent' as AuditCategory,
    event_type: eventType,
    occurred_at: new Date(),
    actor: {
      user_id: params.actor?.user_id || params.user_id,
      role: params.actor?.role || 'user',
      user_name: params.actor?.user_name || null,
      type: params.actor?.role || 'user',
    },
    resource: {
      type: 'consent',
      id: params.consent_record_id || null,
      name: params.consent_type || 'unknown',
    },
    outcome: {
      status: params.action_result || 'success',
      error_message: params.error_message,
    },
    ip_address: params.ip_address,
    user_agent: params.user_agent,
    session_id: params.session_id,
    request_id: params.request_id,
    metadata: {
      consent_type: params.consent_type,
      consent_record_id: params.consent_record_id,
      before_state: params.before_state,
      after_state: params.after_state,
    },
    created_at: new Date(),
  }

  // Insert into audit_logs table (unified audit system)
  const { error } = await supabase.from('audit_logs').insert(auditLog)

  if (error) {
    logger.error('Error inserting audit log', { error: (error as Error).message }, error as Error)
    // Don't throw - audit logging failures shouldn't break the main flow
  }

  // Also insert into consent-specific audit logs for backwards compatibility
  const { error: consentError } = await supabase.from('consent_audit_logs').insert({
    event_type: params.event_type,
    user_id: params.user_id,
    consent_type: params.consent_type || null,
    consent_record_id: params.consent_record_id || null,
    consent_request_id: null,
    action: params.event_type,
    action_result: params.action_result || 'success',
    error_message: params.error_message,
    actor_user_id: params.actor?.user_id || params.user_id,
    actor_role: params.actor?.role || 'user',
    actor_ip_address: params.ip_address,
    actor_user_agent: params.user_agent,
    session_id: params.session_id,
    request_id: params.request_id,
    correlation_id: params.request_id,
    before_state: params.before_state,
    after_state: params.after_state,
    data_changes: params.before_state && params.after_state ? generateDataChanges(params.before_state, params.after_state) : null,
    occurred_at: new Date().toISOString(),
  })

  if (consentError) {
    logger.error('Error inserting consent audit log', { error: (consentError as Error).message }, consentError as Error)
  }
}

/**
 * Log consent granted event
 *
 * @param consentRecord - The consent record that was granted
 * @param actor - Information about who granted the consent
 * @param metadata - Additional metadata
 */
export async function logConsentGranted(
  consentRecord: UserConsentRecord,
  actor: {
    user_id: string | null
    role: 'user' | 'admin' | 'system' | 'api'
    user_name?: string | null
  },
  metadata?: {
    ip_address?: string
    user_agent?: string
    session_id?: string
    request_id?: string
  }
): Promise<void> {
  await createConsentAuditLog({
    event_type: 'consent_granted',
    user_id: consentRecord.user_id,
    consent_type: consentRecord.consent_type,
    consent_record_id: consentRecord.id,
    actor,
    action_result: 'success',
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
    session_id: metadata?.session_id,
    request_id: metadata?.request_id,
    after_state: {
      status: 'granted',
      consent_type: consentRecord.consent_type,
      consent_version_id: consentRecord.consent_version_id,
      granted_at: consentRecord.granted_at,
      delivery_method: consentRecord.delivery_method,
    },
  })
}

/**
 * Log consent withdrawn event
 *
 * @param consentRecord - The consent record that was withdrawn
 * @param reason - Reason for withdrawal
 * @param actor - Information about who withdrew the consent
 * @param metadata - Additional metadata
 */
export async function logConsentWithdrawn(
  consentRecord: UserConsentRecord,
  reason: string,
  actor: {
    user_id: string | null
    role: 'user' | 'admin' | 'system' | 'api'
    user_name?: string | null
  },
  metadata?: {
    ip_address?: string
    user_agent?: string
    session_id?: string
    request_id?: string
  }
): Promise<void> {
  await createConsentAuditLog({
    event_type: 'consent_withdrawn',
    user_id: consentRecord.user_id,
    consent_type: consentRecord.consent_type,
    consent_record_id: consentRecord.id,
    actor,
    action_result: 'success',
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
    session_id: metadata?.session_id,
    request_id: metadata?.request_id,
    before_state: {
      status: consentRecord.status,
      granted_at: consentRecord.granted_at,
    },
    after_state: {
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
      reason,
    },
  })
}

/**
 * Log consent modified event
 *
 * @param consentRecord - The consent record that was modified
 * @param changes - Description of changes
 * @param actor - Information about who modified the consent
 * @param metadata - Additional metadata
 */
export async function logConsentModified(
  consentRecord: UserConsentRecord,
  changes: {
    field: string
    old_value: unknown
    new_value: unknown
  }[],
  actor: {
    user_id: string | null
    role: 'user' | 'admin' | 'system' | 'api'
    user_name?: string | null
  },
  metadata?: {
    ip_address?: string
    user_agent?: string
    session_id?: string
    request_id?: string
  }
): Promise<void> {
  const beforeState: Record<string, unknown> = {}
  const afterState: Record<string, unknown> = {}

  for (const change of changes) {
    beforeState[change.field] = change.old_value
    afterState[change.field] = change.new_value
  }

  await createConsentAuditLog({
    event_type: 'consent_modified',
    user_id: consentRecord.user_id,
    consent_type: consentRecord.consent_type,
    consent_record_id: consentRecord.id,
    actor,
    action_result: 'success',
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
    session_id: metadata?.session_id,
    request_id: metadata?.request_id,
    before_state: beforeState,
    after_state: afterState,
  })
}

/**
 * Log consent version update event
 *
 * @param oldVersion - Old consent version
 * @param newVersion - New consent version
 * @param actor - Information about who updated the version
 * @param metadata - Additional metadata
 */
export async function logConsentVersionUpdated(
  oldVersion: ConsentVersion | null,
  newVersion: ConsentVersion,
  actor: {
    user_id: string | null
    role: 'user' | 'admin' | 'system' | 'api'
    user_name?: string | null
  },
  metadata?: {
    ip_address?: string
    user_agent?: string
    session_id?: string
    request_id?: string
  }
): Promise<void> {
  await createConsentAuditLog({
    event_type: 'version_updated',
    user_id: actor.user_id || newVersion.created_by,
    consent_type: newVersion.consent_type,
    actor,
    action_result: 'success',
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
    session_id: metadata?.session_id,
    request_id: metadata?.request_id,
    before_state: oldVersion ? {
      version: oldVersion.version,
      title: oldVersion.title,
      effective_date: oldVersion.effective_date,
    } : null,
    after_state: {
      version: newVersion.version,
      title: newVersion.title,
      effective_date: newVersion.effective_date,
    },
  })
}

/**
 * Log guardian consent added event
 *
 * @param userId - User ID (minor)
 * @param guardianName - Guardian's name
 * @param consentTypes - Types of consent guardian can grant
 * @param actor - Information about who added the guardian consent
 * @param metadata - Additional metadata
 */
export async function logGuardianConsentAdded(
  userId: string,
  guardianName: string,
  consentTypes: ConsentType[],
  actor: {
    user_id: string | null
    role: 'user' | 'admin' | 'system' | 'api'
    user_name?: string | null
  },
  metadata?: {
    ip_address?: string
    user_agent?: string
    session_id?: string
    request_id?: string
  }
): Promise<void> {
  await createConsentAuditLog({
    event_type: 'guardian_consent_added',
    user_id: userId,
    actor,
    action_result: 'success',
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
    session_id: metadata?.session_id,
    request_id: metadata?.request_id,
    after_state: {
      guardian_name: guardianName,
      consent_types: consentTypes,
      added_at: new Date().toISOString(),
    },
  })
}

/**
 * Log consent viewed event
 *
 * @param userId - User ID
 * @param consentType - Type of consent viewed
 * @param actor - Information about who viewed the consent
 * @param metadata - Additional metadata
 */
export async function logConsentViewed(
  userId: string,
  consentType: ConsentType,
  actor: {
    user_id: string | null
    role: 'user' | 'admin' | 'system' | 'api'
    user_name?: string | null
  },
  metadata?: {
    ip_address?: string
    user_agent?: string
    session_id?: string
    request_id?: string
  }
): Promise<void> {
  await createConsentAuditLog({
    event_type: 'consent_viewed',
    user_id: userId,
    consent_type: consentType,
    actor,
    action_result: 'success',
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
    session_id: metadata?.session_id,
    request_id: metadata?.request_id,
    after_state: {
      viewed_at: new Date().toISOString(),
    },
  })
}

/**
 * Log bulk consent operation
 *
 * @param operation - Type of bulk operation
 * @param userIds - Array of user IDs affected
 * @param consentTypes - Array of consent types affected
 * @param actor - Information about who performed the operation
 * @param metadata - Additional metadata
 */
export async function logBulkConsentOperation(
  operation: 'grant' | 'withdraw' | 'expire' | 'update_version',
  userIds: string[],
  consentTypes: ConsentType[],
  actor: {
    user_id: string | null
    role: 'user' | 'admin' | 'system' | 'api'
    user_name?: string | null
  },
  results: {
    successful: number
    failed: number
    errors: Array<{ user_id: string; error: string }>
  },
  metadata?: {
    ip_address?: string
    user_agent?: string
    session_id?: string
    request_id?: string
  }
): Promise<void> {
  await createConsentAuditLog({
    event_type: 'bulk_consent_operation',
    user_id: actor.user_id || 'system',
    actor,
    action_result: results.failed > 0 ? 'partial' : 'success',
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
    session_id: metadata?.session_id,
    request_id: metadata?.request_id,
    after_state: {
      operation,
      total_users: userIds.length,
      consent_types: consentTypes,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors,
      performed_at: new Date().toISOString(),
    },
  })
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Generate data changes object for audit logging
 *
 * @param beforeState - State before change
 * @param afterState - State after change
 * @returns Data changes object
 */
function generateDataChanges(
  beforeState: Record<string, unknown>,
  afterState: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {}

  // Get all unique keys from both states
  const allKeys = new Set([...Object.keys(beforeState), ...Object.keys(afterState)])

  for (const key of allKeys) {
    const oldValue = beforeState[key]
    const newValue = afterState[key]

    // Only include fields that actually changed
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = {
        old: oldValue,
        new: newValue,
      }
    }
  }

  return changes
}

/**
 * Get consent audit logs for a user using the unified audit system
 *
 * @param userId - User ID
 * @param options - Query options
 * @returns Array of audit log entries
 */
export async function getConsentAuditLogsForUser(
  userId: string,
  options?: {
    consent_type?: ConsentType
    date_from?: Date
    date_to?: Date
    limit?: number
  }
): Promise<BaseAuditLog[]> {
  const supabase = await createClient()

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('category', 'consent')
    .eq('user_id', userId)

  if (options?.date_from) {
    query = query.gte('occurred_at', options.date_from.toISOString())
  }

  if (options?.date_to) {
    query = query.lte('occurred_at', options.date_to.toISOString())
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query.order('occurred_at', { ascending: false })

  if (error) {
    logger.error('Error querying consent audit logs', { error: (error as Error).message }, error as Error)
    return []
  }

  // Filter by consent type if specified
  let logs = data || []
  if (options?.consent_type) {
    logs = logs.filter((log) =>
      log.metadata?.consent_type === options.consent_type
    )
  }

  return logs
}

/**
 * Export consent audit logs for compliance reporting
 *
 * @param userId - User ID
 * @param format - Export format
 * @param options - Query options
 * @returns Exported data
 */
export async function exportConsentAuditLogs(
  userId: string,
  format: 'json' | 'csv' = 'json',
  options?: {
    consent_type?: ConsentType
    date_from?: Date
    date_to?: Date
  }
): Promise<string> {
  const logs = await getConsentAuditLogsForUser(userId, options)

  if (format === 'json') {
    return JSON.stringify(logs, null, 2)
  }

  // CSV export
  const headers = [
    'Fecha',
    'Evento',
    'Tipo de Consentimiento',
    'Resultado',
    'Actor',
    'Dirección IP',
  ]

  const rows = logs.map((log) => [
    log.occurred_at,
    log.event_type,
    log.metadata?.consent_type || 'N/A',
    log.outcome.status,
    log.actor.type,
    log.ip_address || 'N/A',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

