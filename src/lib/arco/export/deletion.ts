/**
 * ARCO Data Export - Deletion
 *
 * Handles data deletion planning and execution for CANCEL requests
 */

import { createClient } from '@/lib/supabase/server'
import type { DataTableScope } from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'

/**
 * Deletion plan result type
 */
export interface DeletionPlan {
  tables: Array<{
    table: string
    record_count: number
    can_delete: boolean
    retention_reason?: string
  }>
  immediate_deletions: string[]
  delayed_deletions: string[]
  requires_anonymization: string[]
}

/**
 * Tables to check for deletion
 */
const TABLES_TO_CHECK = [
  'profiles',
  'appointments',
  'prescriptions',
  'soap_consultations',
  'chat_conversations',
  'chat_messages',
  'payments',
]

/**
 * Table retention policies
 */
const RETENTION_POLICIES: Record<string, { can_delete: boolean; reason?: string }> = {
  profiles: {
    can_delete: false,
    reason: 'Requerido para relaciones de base de datos. Se anonimizará.',
  },
  appointments: {
    can_delete: false,
    reason: 'Retención legal de 5 años (NOM-004-SSA3-2012)',
  },
  prescriptions: {
    can_delete: false,
    reason: 'Retención legal de 5 años (NOM-004-SSA3-2012)',
  },
  soap_consultations: {
    can_delete: false,
    reason: 'Retención legal de 5 años (NOM-004-SSA3-2012)',
  },
  chat_conversations: {
    can_delete: false,
    reason: 'Retención recomendada de 2 años',
  },
  chat_messages: {
    can_delete: false,
    reason: 'Retención recomendada de 2 años',
  },
  payments: {
    can_delete: false,
    reason: 'Retención fiscal de 5 años (SAT)',
  },
}

/**
 * Get record count for a table
 *
 * @param table - Table name
 * @param userId - User ID
 * @returns Record count
 */
async function getRecordCount(table: string, userId: string): Promise<number> {
  if (table === 'profiles') return 1

  const supabase = await createClient()

  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', userId)

  return count ?? 0
}

/**
 * Analyze table for deletion
 *
 * @param table - Table name
 * @param userId - User ID
 * @returns Table analysis result
 */
async function analyzeTable(
  table: string,
  userId: string
): Promise<{
  table: string
  record_count: number
  can_delete: boolean
  retention_reason?: string
}> {
  const policy = RETENTION_POLICIES[table]
  const recordCount = await getRecordCount(table, userId)

  return {
    table,
    record_count: recordCount,
    can_delete: policy?.can_delete ?? true,
    retention_reason: policy?.reason,
  }
}

/**
 * Plan data deletion for CANCEL requests
 *
 * @param requestId - ARCO request ID
 * @param userId - User ID
 * @returns Deletion plan
 */
export async function planDataDeletion(
  requestId: string,
  userId: string
): Promise<DeletionPlan> {
  const supabase = await createClient()

  // Get request details
  const { data: request } = await supabase
    .from('arco_requests')
    .select('data_scope')
    .eq('id', requestId)
    .eq('user_id', userId)
    .single()

  if (!request) {
    throw new ArcoError('Request not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  const scope = request.data_scope as DataTableScope[]
  const includeAll = scope.includes('all')

  const tablesToCheck = includeAll ? TABLES_TO_CHECK : scope

  const analysis: DeletionPlan['tables'] = []
  const immediateDeletions: string[] = []
  const delayedDeletions: string[] = []
  const requiresAnonymization: string[] = []

  for (const table of tablesToCheck) {
    const result = await analyzeTable(table, userId)
    analysis.push(result)

    if (result.can_delete) {
      immediateDeletions.push(table)
    } else if (table === 'profiles') {
      requiresAnonymization.push(table)
    } else {
      delayedDeletions.push(table)
    }
  }

  return {
    tables: analysis,
    immediate_deletions: immediateDeletions,
    delayed_deletions: delayedDeletions,
    requires_anonymization: requiresAnonymization,
  }
}

/**
 * Log a deletion operation
 *
 * @param requestId - ARCO request ID
 * @param table - Table name
 * @param deletionType - Type of deletion
 * @param reason - Reason for deletion
 * @param userId - User requesting deletion
 * @param executedBy - User executing deletion
 */
async function logDeletion(
  requestId: string,
  table: string,
  deletionType: 'hard_delete' | 'anonymize',
  reason: string,
  userId: string,
  executedBy: string
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('data_deletions').insert({
    arco_request_id: requestId,
    table_name: table,
    deletion_type: deletionType,
    reason,
    requested_by: userId,
    executed_by: executedBy,
    executed_at: new Date().toISOString(),
  })
}

/**
 * Anonymize user profile
 *
 * @param userId - User ID
 * @param requestId - ARCO request ID
 * @param executedBy - User executing deletion
 */
async function anonymizeProfile(
  userId: string,
  requestId: string,
  executedBy: string
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('profiles')
    .update({
      full_name: `Usuario ${userId.slice(0, 8)}`,
      email: `${userId}@anonymized.patient`,
      phone: null,
      photo_url: null,
    })
    .eq('id', userId)

  await logDeletion(
    requestId,
    'profiles',
    'anonymize',
    'Solicitud de cancelación ARCO - Anonimización de perfil',
    userId,
    executedBy
  )
}

/**
 * Execute data deletion (after approval and retention period)
 *
 * @param requestId - ARCO request ID
 * @param userId - User ID
 * @param executedBy - Admin user ID
 */
export async function executeDataDeletion(
  requestId: string,
  userId: string,
  executedBy: string
): Promise<void> {
  // Get deletion plan
  const plan = await planDataDeletion(requestId, userId)

  // Log each immediate deletion
  for (const table of plan.immediate_deletions) {
    await logDeletion(
      requestId,
      table,
      'hard_delete',
      'Solicitud de cancelación ARCO',
      userId,
      executedBy
    )
  }

  // Anonymize profile if needed
  if (plan.requires_anonymization.includes('profiles')) {
    await anonymizeProfile(userId, requestId, executedBy)
  }
}

/**
 * Get deletion status for a request
 *
 * @param requestId - ARCO request ID
 * @returns Deletion status
 */
export async function getDeletionStatus(requestId: string): Promise<{
  total_deletions: number
  completed_deletions: number
  pending_deletions: number
  tables_affected: string[]
}> {
  const supabase = await createClient()

  const { data: deletions } = await supabase
    .from('data_deletions')
    .select('*')
    .eq('arco_request_id', requestId)

  const tables = deletions?.map((d) => d.table_name) || []

  return {
    total_deletions: deletions?.length ?? 0,
    completed_deletions: deletions?.filter((d) => d.executed_at).length ?? 0,
    pending_deletions: deletions?.filter((d) => !d.executed_at).length ?? 0,
    tables_affected: [...new Set(tables)],
  }
}
