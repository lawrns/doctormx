/**
 * ARCO Data Export - Amendments
 *
 * Handles data amendments for RECTIFY requests
 */

import { createClient } from '@/lib/supabase/server'
import { ArcoError, ArcoErrorCode } from '@/types/arco'

/**
 * Amendment record type
 */
export interface AmendmentRecord {
  id: string
  arco_request_id: string | null
  table_name: string
  record_id: string
  field_name: string
  old_value: string | null
  new_value: string | null
  amendment_reason: string | null
  requested_by: string
  approved_by: string | null
  approved_at: string | null
  created_at: string
  applied_at: string | null
}

/**
 * Record a data amendment for RECTIFY requests
 *
 * @param requestId - ARCO request ID
 * @param tableName - Table name
 * @param recordId - Record ID
 * @param fieldName - Field being amended
 * @param oldValue - Current value
 * @param newValue - New value
 * @param reason - Amendment reason
 * @param requestedBy - User requesting amendment
 */
export async function recordDataAmendment(
  requestId: string,
  tableName: string,
  recordId: string,
  fieldName: string,
  oldValue: string | null,
  newValue: string | null,
  reason: string,
  requestedBy: string
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('data_amendments').insert({
    arco_request_id: requestId,
    table_name: tableName,
    record_id: recordId,
    field_name: fieldName,
    old_value: oldValue,
    new_value: newValue,
    amendment_reason: reason,
    requested_by: requestedBy,
  })
}

/**
 * Get amendment details
 *
 * @param amendmentId - Amendment ID
 * @returns Amendment record
 * @throws ArcoError if not found
 */
async function getAmendment(amendmentId: string): Promise<AmendmentRecord> {
  const supabase = await createClient()

  const { data: amendment } = await supabase
    .from('data_amendments')
    .select('*')
    .eq('id', amendmentId)
    .single()

  if (!amendment) {
    throw new ArcoError('Amendment not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  return amendment as AmendmentRecord
}

/**
 * Apply amendment to database record
 *
 * @param amendment - Amendment record
 */
async function applyAmendmentToRecord(amendment: AmendmentRecord): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from(amendment.table_name)
    .update({
      [amendment.field_name]: amendment.new_value,
      updated_at: new Date().toISOString(),
    })
    .eq('id', amendment.record_id)

  if (error) {
    throw new ArcoError(
      `Error applying amendment: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }
}

/**
 * Mark amendment as approved
 *
 * @param amendmentId - Amendment ID
 * @param approvedBy - Admin user ID
 */
async function markAmendmentApproved(
  amendmentId: string,
  approvedBy: string
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('data_amendments')
    .update({
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      applied_at: new Date().toISOString(),
    })
    .eq('id', amendmentId)
}

/**
 * Apply a data amendment (after approval)
 *
 * @param amendmentId - Amendment ID
 * @param approvedBy - Admin user ID approving the amendment
 */
export async function applyDataAmendment(
  amendmentId: string,
  approvedBy: string
): Promise<void> {
  const amendment = await getAmendment(amendmentId)
  await applyAmendmentToRecord(amendment)
  await markAmendmentApproved(amendmentId, approvedBy)
}

/**
 * Get amendments for a request
 *
 * @param requestId - ARCO request ID
 * @returns List of amendments
 */
export async function getRequestAmendments(
  requestId: string
): Promise<AmendmentRecord[]> {
  const supabase = await createClient()

  const { data: amendments } = await supabase
    .from('data_amendments')
    .select('*')
    .eq('arco_request_id', requestId)
    .order('created_at', { ascending: false })

  return (amendments || []) as AmendmentRecord[]
}

/**
 * Check if all amendments are applied for a request
 *
 * @param requestId - ARCO request ID
 * @returns True if all amendments applied
 */
export async function areAllAmendmentsApplied(requestId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: pendingAmendments } = await supabase
    .from('data_amendments')
    .select('id')
    .eq('arco_request_id', requestId)
    .is('applied_at', null)

  return !pendingAmendments || pendingAmendments.length === 0
}

/**
 * Get pending amendments count
 *
 * @param requestId - ARCO request ID
 * @returns Count of pending amendments
 */
export async function getPendingAmendmentsCount(requestId: string): Promise<number> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('data_amendments')
    .select('*', { count: 'exact', head: true })
    .eq('arco_request_id', requestId)
    .is('applied_at', null)

  return count ?? 0
}
