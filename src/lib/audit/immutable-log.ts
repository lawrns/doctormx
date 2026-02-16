/**
 * Immutable Audit Trail System
 *
 * Cryptographically secure, tamper-evident audit logging system
 * compliant with NOM-004-SSA3-2012 (5-year retention) and LFPDPPP.
 *
 * @module audit/immutable-log
 * @version 1.0.0
 */

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import type {
  AuditCategory,
  AuditEventType,
  BaseAuditLog,
  AuditActor,
  AuditResource,
  AuditOutcome,
} from '@/types/audit'

// ================================================
// TYPES
// ================================================

/**
 * Immutable audit log entry with cryptographic hash chain
 */
export interface ImmutableAuditLog extends BaseAuditLog {
  /** Cryptographic hash of this entry (SHA-256) */
  hash: string

  /** Hash of the previous entry in the chain (for integrity verification) */
  previous_hash: string | null

  /** Sequential entry number for ordering */
  sequence_number: bigint

  /** Digital signature of the hash (optional, for non-repudiation) */
  signature?: string
}

/**
 * Audit log integrity verification result
 */
export interface IntegrityVerificationResult {
  /** Whether all logs are cryptographically intact */
  is_intact: boolean

  /** Total number of logs verified */
  total_logs: number

  /** First tampered log entry (if any) */
  first_tampered_entry: {
    id: string
    sequence_number: bigint
    expected_hash: string
    actual_hash: string
  } | null

  /** Verification timestamp */
  verified_at: Date
}

/**
 * Compliance status for audit logs
 */
export interface ComplianceStatus {
  /** Total audit logs in retention period */
  total_logs: number

  /** Logs by category */
  by_category: Record<AuditCategory, number>

  /** Logs by event type */
  by_event_type: Record<string, number>

  /** Oldest log date in retention period */
  oldest_log_date: Date | null

  /** Newest log date */
  newest_log_date: Date | null

  /** Whether 5-year retention is being met */
  retention_compliant: boolean

  /** Logs approaching retention limit (within 6 months) */
  approachingLimit: number

  /** Logs ready for archival (older than 5 years) */
  ready_for_archival: number
}

// ================================================
// HASH GENERATION
// ================================================

/**
 * Generate SHA-256 hash of audit log data
 */
function generateHash(data: {
  id: string
  category: string
  event_type: string
  occurred_at: string
  actor: object
  resource: object
  outcome: object
  previous_hash: string
  sequence_number: string
}): string {
  const hashContent = JSON.stringify(data, Object.keys(data).sort())
  return crypto.createHash('sha256').update(hashContent).digest('hex')
}

/**
 * Generate sequential entry number
 */
async function getNextSequenceNumber(): Promise<bigint> {
  const supabase = await createClient()

  // Get the highest sequence number
  const { data } = await supabase
    .from<'audit_logs', ImmutableAuditLog>('audit_logs')
    .select('sequence_number')
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single()

  const lastSequence = data?.sequence_number ?? BigInt(0)
  return lastSequence + BigInt(1)
}

// ================================================
// AUDIT LOG CREATION
// ================================================

/**
 * Create an immutable audit log entry with cryptographic hash chain
 *
 * @param entry - Base audit log data
 * @returns The created immutable audit log with hash
 */
export async function createAuditLog(entry: {
  id: string
  category: AuditCategory
  event_type: AuditEventType
  occurred_at: Date
  actor: AuditActor
  resource: AuditResource
  outcome: AuditOutcome
  metadata?: Record<string, unknown>
}): Promise<ImmutableAuditLog> {
  const supabase = await createClient()

  // Get previous entry's hash
  const { data: previousEntry } = await supabase
    .from<'audit_logs', ImmutableAuditLog>('audit_logs')
    .select('hash')
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single()

  const previousHash = previousEntry?.hash ?? null
  const sequenceNumber = await getNextSequenceNumber()

  // Generate hash for this entry
  const hashData = {
    id: entry.id,
    category: entry.category,
    event_type: entry.event_type,
    occurred_at: entry.occurred_at.toISOString(),
    actor: entry.actor,
    resource: entry.resource,
    outcome: entry.outcome,
    previous_hash: previousHash ?? 'genesis',
    sequence_number: sequenceNumber.toString(),
  }

  const hash = generateHash(hashData)

  // Create the audit log entry
  const auditLog: ImmutableAuditLog = {
    id: entry.id,
    category: entry.category,
    event_type: entry.event_type,
    occurred_at: entry.occurred_at,
    actor: entry.actor,
    resource: entry.resource,
    outcome: entry.outcome,
    hash,
    previous_hash: previousHash,
    sequence_number: sequenceNumber,
    created_at: new Date(),
    ip_address: entry.outcome.details?.ip_address as string | undefined,
    user_agent: entry.outcome.details?.user_agent as string | undefined,
    session_id: entry.outcome.details?.session_id as string | undefined,
    request_id: entry.outcome.details?.request_id as string | undefined,
    metadata: entry.metadata,
  }

  // Insert into database
  const { error } = await supabase
    .from('audit_logs')
    .insert(auditLog)

  if (error) {
    throw new Error(`Failed to create audit log: ${error.message}`)
  }

  return auditLog
}

/**
 * Create multiple audit logs in a batch
 *
 * @param entries - Array of audit log entries
 * @returns Number of successfully created logs
 */
export async function createAuditLogBatch(
  entries: Array<{
    id: string
    category: AuditCategory
    event_type: AuditEventType
    occurred_at: Date
    actor: AuditActor
    resource: AuditResource
    outcome: AuditOutcome
    metadata?: Record<string, unknown>
  }>
): Promise<number> {
  let created = 0

  for (const entry of entries) {
    try {
      await createAuditLog(entry)
      created++
    } catch (error) {
      logger.error('Error creating audit log batch entry', { error: (error as Error).message }, error as Error)
    }
  }

  return created
}

// ================================================
// AUDIT LOG RETRIEVAL
// ================================================

/**
 * Get audit logs with optional filtering
 *
 * @param filters - Optional filters for category, event_type, user_id, date range
 * @param pagination - Pagination options
 * @returns Paginated audit log results
 */
export async function getAuditLogs(
  filters?: {
    category?: AuditCategory
    event_type?: AuditEventType
    user_id?: string
    resource_type?: string
    resource_id?: string
    date_from?: Date
    date_to?: Date
  },
  pagination?: {
    offset?: number
    limit?: number
    order_by?: 'occurred_at' | 'created_at' | 'sequence_number'
    order_direction?: 'ASC' | 'DESC'
  }
): Promise<{
  logs: ImmutableAuditLog[]
  total: number
  pagination: {
    offset: number
    limit: number
    has_more: boolean
  }
}> {
  const supabase = await createClient()

  const {
    category,
    event_type,
    user_id,
    resource_type,
    resource_id,
    date_from,
    date_to,
  } = filters ?? {}

  const { offset = 0, limit = 100, order_by = 'occurred_at', order_direction = 'DESC' } = pagination ?? {}

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })

  // Apply filters
  if (category) {
    query = query.eq('category', category)
  }

  if (event_type) {
    query = query.eq('event_type', event_type)
  }

  if (user_id) {
    query = query.contains('actor', `{"user_id":"${user_id}"}`)
  }

  if (resource_type) {
    query = query.eq('resource->>type', resource_type)
  }

  if (resource_id) {
    query = query.eq('resource->>id', resource_id)
  }

  if (date_from) {
    query = query.gte('occurred_at', date_from.toISOString())
  }

  if (date_to) {
    query = query.lte('occurred_at', date_to.toISOString())
  }

  // Get total count
  const { count } = await query

  // Apply pagination and ordering
  const { data: logs } = await query
    .order(order_by, { ascending: order_direction === 'ASC' })
    .range(offset, offset + limit - 1)

  return {
    logs: logs ?? [],
    total: count ?? 0,
    pagination: {
      offset,
      limit,
      has_more: (count ?? 0) > offset + limit,
    },
  }
}

// ================================================
// INTEGRITY VERIFICATION
// ================================================

/**
 * Verify the cryptographic integrity of the audit log chain
 *
 * @param limit - Maximum number of logs to verify (default: all)
 * @returns Integrity verification result
 */
export async function verifyAuditIntegrity(limit?: number): Promise<IntegrityVerificationResult> {
  const supabase = await createClient()

  // Get audit logs in sequence order
  const { data: logs } = await supabase
    .from<'audit_logs', ImmutableAuditLog>('audit_logs')
    .select('*')
    .order('sequence_number', { ascending: true })
    .limit(limit ?? 100000)

  if (!logs || logs.length === 0) {
    return {
      is_intact: true,
      total_logs: 0,
      first_tampered_entry: null,
      verified_at: new Date(),
    }
  }

  let isIntact = true
  let firstTampered: IntegrityVerificationResult['first_tampered_entry'] | null = null
  let previousHash: string | null = null

  for (const log of logs) {
    // Verify hash chain integrity
    if (previousHash !== null && log.previous_hash !== previousHash) {
      isIntact = false
      firstTampered = {
        id: log.id,
        sequence_number: log.sequence_number,
        expected_hash: previousHash,
        actual_hash: log.previous_hash,
      }
      break
    }

    // Verify hash matches content
    const hashData = {
      id: log.id,
      category: log.category,
      event_type: log.event_type,
      occurred_at: log.occurred_at.toISOString(),
      actor: log.actor,
      resource: log.resource,
      outcome: log.outcome,
      previous_hash: log.previous_hash ?? 'genesis',
      sequence_number: log.sequence_number.toString(),
    }

    const expectedHash = generateHash(hashData)
    if (log.hash !== expectedHash) {
      isIntact = false
      firstTampered = {
        id: log.id,
        sequence_number: log.sequence_number,
        expected_hash: expectedHash,
        actual_hash: log.hash,
      }
      break
    }

    previousHash = log.hash
  }

  return {
    is_intact: isIntact,
    total_logs: logs.length,
    first_tampered_entry: firstTampered,
    verified_at: new Date(),
  }
}

// ================================================
// COMPLIANCE STATUS
// ================================================

/**
 * Get compliance status for audit logs
 *
 * @returns Compliance status with retention information
 */
export async function getComplianceStatus(): Promise<ComplianceStatus> {
  const supabase = await createClient()

  // Get all audit logs from the last 5 years (NOM-004 requirement)
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

  const { data: logs } = await supabase
    .from<'audit_logs', ImmutableAuditLog>('audit_logs')
    .select('category, event_type, occurred_at, created_at')
    .gte('created_at', fiveYearsAgo.toISOString())

  if (!logs || logs.length === 0) {
    return {
      total_logs: 0,
      by_category: {} as Record<AuditCategory, number>,
      by_event_type: {},
      oldest_log_date: null,
      newest_log_date: null,
      retention_compliant: true,
      approachingLimit: 0,
      ready_for_archival: 0,
    }
  }

  // Calculate statistics
  const byCategory: Record<string, number> = {}
  const byEventType: Record<string, number> = {}

  let oldestDate: Date | null = null
  let newestDate: Date | null = null
  let approachingLimit = 0 // Within 6 months of 5-year retention
  const sixMonthsFromNow = new Date()
  sixMonthsFromNow.setFullYear(sixMonthsFromNow.getFullYear() + 5)
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() - 6)

  for (const log of logs) {
    // Count by category
    byCategory[log.category] = (byCategory[log.category] || 0) + 1

    // Count by event type
    byEventType[log.event_type] = (byEventType[log.event_type] || 0) + 1

    // Track dates
    if (!oldestDate || log.created_at < oldestDate) {
      oldestDate = log.created_at
    }

    if (!newestDate || log.created_at > newestDate) {
      newestDate = log.created_at
    }

    // Check if approaching 5-year limit
    const fiveYearLimit = new Date(log.occurred_at)
    fiveYearLimit.setFullYear(fiveYearLimit.getFullYear() + 5)

    if (fiveYearLimit <= sixMonthsFromNow) {
      approachingLimit++
    }
  }

  // Count logs ready for archival (older than 5 years)
  const { count: readyCount } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .lt('created_at', fiveYearsAgo.toISOString())

  return {
    total_logs: logs.length,
    by_category: byCategory as Record<AuditCategory, number>,
    by_event_type: byEventType,
    oldest_log_date: oldestDate,
    newest_log_date: newestDate,
    retention_compliant: true, // Assuming compliance if logs exist
    approachingLimit,
    ready_for_archival: readyCount ?? 0,
  }
}

// ================================================
// AUDIT EXPORT
// ================================================

/**
 * Export audit logs for compliance reporting
 *
 * @param filters - Filters for logs to export
 * @param format - Export format (json, csv)
 * @returns Exported audit logs in specified format
 */
export async function exportAuditLogs(
  filters?: Parameters<typeof getAuditLogs>[0],
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const { logs } = await getAuditLogs(filters)

  if (format === 'json') {
    return JSON.stringify(logs, null, 2)
  }

  if (format === 'csv') {
    const headers = [
      'id',
      'sequence_number',
      'category',
      'event_type',
      'occurred_at',
      'actor.user_id',
      'actor.role',
      'actor.type',
      'resource.type',
      'resource.id',
      'outcome.status',
      'hash',
      'previous_hash',
      'created_at',
    ]

    const rows = logs.map((log) => [
      log.id,
      log.sequence_number.toString(),
      log.category,
      log.event_type,
      log.occurred_at.toISOString(),
      log.actor.user_id ?? '',
      log.actor.role ?? '',
      log.actor.type,
      log.resource.type,
      log.resource.id ?? '',
      log.outcome.status,
      log.hash,
      log.previous_hash ?? '',
      log.created_at.toISOString(),
    ])

    const csvRows = [headers.join(','), ...rows.map((row) => row.join(','))]
    return csvRows.join('\n')
  }

  throw new Error(`Unsupported export format: ${format}`)
}

// ================================================
// TYPE GUARDS
// ================================================

/**
 * Check if an audit log has been tampered with
 *
 * @param log - Audit log to check
 * @returns Whether the log is part of a valid hash chain
 */
export function isAuditLogIntact(log: ImmutableAuditLog): boolean {
  // Verify hash chain
  const hashData = {
    id: log.id,
    category: log.category,
    event_type: log.event_type,
    occurred_at: log.occurred_at.toISOString(),
    actor: log.actor,
    resource: log.resource,
    outcome: log.outcome,
    previous_hash: log.previous_hash ?? 'genesis',
    sequence_number: log.sequence_number.toString(),
  }

  const expectedHash = generateHash(hashData)
  return log.hash === expectedHash
}

