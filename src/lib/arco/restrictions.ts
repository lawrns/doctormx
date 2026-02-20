/**
 * GDPR Article 18: Right to Restriction of Processing
 *
 * Implements the right to restrict processing of personal data:
 * - User can request restriction when contesting accuracy of data
 * - User can request restriction when objecting to processing
 * - User can request restriction for legal claims
 * - User can request restriction for public interest reasons
 *
 * When processing is restricted:
 * - Data is marked as restricted and cannot be processed
 * - Data can only be stored (not used, shared, or modified)
 * - Data can be processed with user consent or for legal claims
 *
 * @module arco/restrictions
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ArcoRequestRow,
  DataTableScope,
} from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'

// ================================================
// TYPES
// ================================================

/**
 * Restriction reason according to GDPR Article 18
 */
export type RestrictionReason =
  | 'accuracy_contested'      // User contests accuracy of data
  | 'unlawful_processing'     // Processing is unlawful but user opposes deletion
  | 'legal_claims'            // Need for legal claims
  | 'public_interest'         // Public interest verification
  | 'objection_pending'       // Pending verification of objection

/**
 * Restriction status
 */
export type RestrictionStatus = 'active' | 'lifted' | 'expired'

/**
 * Restriction scope - what data is restricted
 */
export interface RestrictionScope {
  table_name: DataTableScope
  record_id?: string
  field_name?: string
}

/**
 * Data restriction record
 */
export interface DataRestriction {
  id: string
  user_id: string
  arco_request_id: string | null
  table_name: DataTableScope
  record_id: string | null
  field_name: string | null
  restriction_reason: RestrictionReason
  restriction_details: string | null
  status: RestrictionStatus
  restricted_until: string | null
  created_at: string
  lifted_at: string | null
  lifted_reason: string | null
  metadata: Record<string, unknown>
}

/**
 * Input for creating a restriction
 */
export interface CreateRestrictionInput {
  user_id: string
  arco_request_id?: string
  table_name: DataTableScope
  record_id?: string
  field_name?: string
  restriction_reason: RestrictionReason
  restriction_details?: string
  restricted_until?: string  // ISO date string, null for permanent
}

/**
 * Check if data is restricted result
 */
export interface DataRestrictionCheck {
  is_restricted: boolean
  restriction?: DataRestriction
  reason?: string
}

// ================================================
// RESTRICTION LABELS
// ================================================

/**
 * Human-readable labels for restriction reasons
 */
export const RESTRICTION_REASON_LABELS: Record<RestrictionReason, string> = {
  accuracy_contested: 'Exactitud de datos impugnada',
  unlawful_processing: 'Tratamiento ilícito - usuario se opone a la eliminación',
  legal_claims: 'Necesidad para reclamaciones legales',
  public_interest: 'Verificación de interés público',
  objection_pending: 'Verificación de oposición pendiente',
}

/**
 * Spanish descriptions for restriction reasons
 */
export const RESTRICTION_REASON_DESCRIPTIONS: Record<RestrictionReason, string> = {
  accuracy_contested: 'El usuario impugna la exactitud de los datos personales',
  unlawful_processing: 'El tratamiento es ilícito pero el usuario se opone a la eliminación',
  legal_claims: 'Los datos son necesarios para la formulación, ejercicio o defensa de reclamaciones',
  public_interest: 'Verificación del interés público en el tratamiento',
  objection_pending: 'Verificación pendiente de si los motivos legítimos prevalecen sobre los del usuario',
}

// ================================================
// CORE FUNCTIONS
// ================================================

/**
 * Create a data restriction
 *
 * @param input - Restriction creation input
 * @returns Created restriction record
 */
export async function createDataRestriction(
  input: CreateRestrictionInput
): Promise<DataRestriction> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('data_restrictions')
    .insert({
      user_id: input.user_id,
      arco_request_id: input.arco_request_id || null,
      table_name: input.table_name,
      record_id: input.record_id || null,
      field_name: input.field_name || null,
      restriction_reason: input.restriction_reason,
      restriction_details: input.restriction_details || null,
      restricted_until: input.restricted_until || null,
      status: 'active',
      metadata: {
        created_via: input.arco_request_id ? 'arco_request' : 'direct',
        created_at: new Date().toISOString(),
      },
    })
    .select()
    .single()

  if (error) {
    throw new ArcoError(
      `Error creating data restriction: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return data
}

/**
 * Check if data is restricted
 *
 * @param userId - User ID
 * @param tableName - Table name
 * @param recordId - Optional record ID
 * @param fieldName - Optional field name
 * @returns Restriction check result
 */
export async function isDataRestricted(
  userId: string,
  tableName: DataTableScope,
  recordId?: string,
  fieldName?: string
): Promise<DataRestrictionCheck> {
  const supabase = await createClient()

  let query = supabase
    .from('data_restrictions')
    .select('*')
    .eq('user_id', userId)
    .eq('table_name', tableName)
    .eq('status', 'active')

  if (recordId) {
    query = query.or(`record_id.eq.${recordId},record_id.is.null`)
  }

  if (fieldName) {
    query = query.or(`field_name.eq.${fieldName},field_name.is.null`)
  }

  // Check for expired restrictions
  const { data: restrictions } = await query

  if (!restrictions || restrictions.length === 0) {
    return { is_restricted: false }
  }

  // Filter out expired restrictions
  const now = new Date().toISOString()
  const activeRestrictions = restrictions.filter(
    (r: DataRestriction) => !r.restricted_until || r.restricted_until > now
  )

  if (activeRestrictions.length === 0) {
    return { is_restricted: false }
  }

  // Return the most specific restriction
  const restriction = activeRestrictions[0]

  return {
    is_restricted: true,
    restriction,
    reason: RESTRICTION_REASON_LABELS[restriction.restriction_reason as RestrictionReason],
  }
}

/**
 * Lift a data restriction
 *
 * @param restrictionId - Restriction ID to lift
 * @param reason - Reason for lifting
 * @param liftedBy - User ID lifting the restriction
 * @returns Updated restriction
 */
export async function liftDataRestriction(
  restrictionId: string,
  reason: string,
  liftedBy: string
): Promise<DataRestriction> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('data_restrictions')
    .update({
      status: 'lifted',
      lifted_at: new Date().toISOString(),
      lifted_reason: reason,
      metadata: {
        lifted_by: liftedBy,
        lifted_at: new Date().toISOString(),
      },
    })
    .eq('id', restrictionId)
    .select()
    .single()

  if (error) {
    throw new ArcoError(
      `Error lifting data restriction: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return data
}

/**
 * Get all active restrictions for a user
 *
 * @param userId - User ID
 * @returns Array of active restrictions
 */
export async function getUserActiveRestrictions(
  userId: string
): Promise<DataRestriction[]> {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('data_restrictions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`restricted_until.is.null,restricted_until.gt.${now}`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ArcoError(
      `Error fetching restrictions: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return data || []
}

/**
 * Apply restrictions from an ARCO request
 *
 * @param arcoRequest - The ARCO RESTRICT request
 * @returns Array of created restrictions
 */
export async function applyRestrictionsFromRequest(
  arcoRequest: ArcoRequestRow
): Promise<DataRestriction[]> {
  const restrictions: DataRestriction[] = []

  // Create a restriction for each scope item
  for (const scope of arcoRequest.data_scope) {
    const restriction = await createDataRestriction({
      user_id: arcoRequest.user_id,
      arco_request_id: arcoRequest.id,
      table_name: scope,
      restriction_reason: 'accuracy_contested', // Default, can be customized
      restriction_details: arcoRequest.description,
    })

    restrictions.push(restriction)
  }

  return restrictions
}

/**
 * Get restriction statistics for admin dashboard
 *
 * @returns Restriction statistics
 */
export async function getRestrictionStats(): Promise<{
  total_active: number
  by_reason: Record<RestrictionReason, number>
  by_table: Record<string, number>
  expiring_soon: number
}> {
  const supabase = await createClient()

  const { data: activeRestrictions } = await supabase
    .from('data_restrictions')
    .select('*')
    .eq('status', 'active')

  const restrictions = activeRestrictions || []
  const now = new Date()
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const byReason: Record<string, number> = {}
  const byTable: Record<string, number> = {}
  let expiringSoon = 0

  for (const r of restrictions) {
    // Count by reason
    byReason[r.restriction_reason] = (byReason[r.restriction_reason] || 0) + 1

    // Count by table
    byTable[r.table_name] = (byTable[r.table_name] || 0) + 1

    // Check if expiring soon
    if (r.restricted_until && new Date(r.restricted_until) <= soon) {
      expiringSoon++
    }
  }

  return {
    total_active: restrictions.length,
    by_reason: byReason as Record<RestrictionReason, number>,
    by_table: byTable,
    expiring_soon: expiringSoon,
  }
}

/**
 * Validate if a processing operation is allowed
 *
 * @param userId - User ID
 * @param operation - Processing operation type
 * @param tableName - Table being processed
 * @returns Validation result
 */
export async function validateProcessingOperation(
  userId: string,
  operation: 'read' | 'write' | 'delete' | 'share' | 'analyze',
  tableName: DataTableScope
): Promise<{
  allowed: boolean
  reason?: string
  restriction?: DataRestriction
}> {
  const check = await isDataRestricted(userId, tableName)

  if (!check.is_restricted) {
    return { allowed: true }
  }

  // Certain operations are always allowed even with restrictions
  const allowedOperations: string[] = ['read'] // Storage is allowed

  if (allowedOperations.includes(operation)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `Operation '${operation}' is restricted: ${check.reason}`,
    restriction: check.restriction,
  }
}

/**
 * Format restriction for display
 *
 * @param restriction - Data restriction
 * @returns Formatted restriction info
 */
export function formatRestriction(restriction: DataRestriction): {
  title: string
  description: string
  status_label: string
  expires_text: string
} {
  const reasonLabel = RESTRICTION_REASON_LABELS[restriction.restriction_reason]
  const tableLabel = restriction.table_name

  const title = `Restricción: ${reasonLabel}`

  let description = `Los datos en "${tableLabel}" están restringidos`
  if (restriction.field_name) {
    description += ` (campo: ${restriction.field_name})`
  }
  if (restriction.record_id) {
    description += ` (registro específico)`
  }

  const statusLabels: Record<RestrictionStatus, string> = {
    active: 'Activa',
    lifted: 'Levantada',
    expired: 'Expirada',
  }

  let expiresText = 'Permanente'
  if (restriction.restricted_until) {
    const until = new Date(restriction.restricted_until)
    const now = new Date()
    if (until > now) {
      const days = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      expiresText = `Expira en ${days} días (${until.toLocaleDateString('es-MX')})`
    } else {
      expiresText = 'Expirada'
    }
  }

  return {
    title,
    description,
    status_label: statusLabels[restriction.status],
    expires_text: expiresText,
  }
}
