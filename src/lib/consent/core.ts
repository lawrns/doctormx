/**
 * Core Consent Management Module
 *
 * Basic CRUD operations for user consent
 * Operaciones CRUD básicas para consentimiento de usuarios
 *
 * @module consent/core
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ConsentType,
  UserConsentRecord,
  GrantConsentInput,
  WithdrawConsentInput,
  UpdateConsentInput,
  ConsentFilter,
  UserConsentSummary,
  ConsentComplianceReport,
} from './types'
import { ConsentError, ConsentErrorCode } from './types'
import {
  trackConsentGranted,
  trackConsentWithdrawn,
  trackConsentModified,
} from './history'
import {
  logConsentGranted as auditLogConsentGranted,
  logConsentWithdrawn as auditLogConsentWithdrawn,
} from './audit'
import {
  getConsentVersion,
  getLatestConsentVersion,
} from './versioning'
import {
  verifyAgeAndConsentRequirements,
} from './guardian'
import {
  getPendingConsentRequests,
  updateConsentRequestStatus,
} from './requests'
import {
  ESSENTIAL_CONSENTS,
  CONSENT_TYPE_LABELS,
  CONSENT_TYPE_CATEGORIES,
  CONSENT_CATEGORIES,
} from './constants'
import type {
  ConsentCategory,
} from './types'
import {
  calculateExpirationDate,
  getClientIdentifier,
} from './utils'

// ================================================
// ERROR UTILITY
// ================================================

/**
 * Create a consent error
 */
export function createConsentError(
  message: string,
  code: ConsentErrorCode,
  statusCode: number = 400
): ConsentError {
  return new ConsentError(message, code, statusCode)
}

// ================================================
// CORE CONSENT FUNCTIONS
// ================================================

/**
 * Grant consent for a user
 *
 * @param input - Consent granting parameters
 * @returns The created consent record
 * @throws ConsentError if validation fails
 */
export async function grantConsent(
  input: GrantConsentInput
): Promise<UserConsentRecord> {
  const supabase = await createClient()

  // Verify user exists
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id, date_of_birth')
    .eq('id', input.user_id)
    .single()

  if (userError || !user) {
    throw createConsentError(
      'Usuario no encontrado',
      ConsentErrorCode.CONSENT_NOT_FOUND,
      404
    )
  }

  // Get the consent version
  const version = await getConsentVersion(input.consent_version_id)
  if (!version) {
    throw createConsentError(
      'Versión de consentimiento no encontrada',
      ConsentErrorCode.VERSION_NOT_FOUND,
      404
    )
  }

  // Check if consent type matches version
  if (version.consent_type !== input.consent_type) {
    throw createConsentError(
      'Tipo de consentimiento no coincide con la versión',
      ConsentErrorCode.INVALID_VERSION,
      400
    )
  }

  // Verify age and determine if guardian consent is required
  const ageVerification = await verifyAgeAndConsentRequirements(
    input.user_id,
    input.consent_type,
    input.date_of_birth || user.date_of_birth
  )

  // Check if guardian consent is required but not provided
  if (
    ageVerification.requires_guardian &&
    !input.guardian_consent_record_id
  ) {
    throw createConsentError(
      'Se requiere consentimiento del tutor legal',
      ConsentErrorCode.REQUIRES_GUARDIAN_CONSENT,
      400
    )
  }

  // Check if user already has active consent for this type
  const { data: existingConsent } = await supabase
    .from('user_consent_records')
    .select('*')
    .eq('user_id', input.user_id)
    .eq('consent_type', input.consent_type)
    .eq('status', 'granted')
    .maybeSingle()

  let consentRecord: UserConsentRecord

  if (existingConsent) {
    // Update existing consent to new version
    const { data, error } = await supabase
      .from('user_consent_records')
      .update({
        consent_version_id: input.consent_version_id,
        updated_at: new Date().toISOString(),
        metadata: {
          ...existingConsent.metadata,
          ...input.metadata,
          previous_version: existingConsent.consent_version_id,
          updated_at: new Date().toISOString(),
        },
      })
      .eq('id', existingConsent.id)
      .select()
      .single()

    if (error) {
      throw createConsentError(
        `Error al actualizar consentimiento: ${error.message}`,
        ConsentErrorCode.VALIDATION_FAILED,
        500
      )
    }

    consentRecord = data

    // Track the modification in history
    await trackConsentModified(existingConsent.id, input.user_id, {
      old_version: existingConsent.consent_version_id,
      new_version: input.consent_version_id,
    })
  } else {
    // Create new consent record
    const { data, error } = await supabase
      .from('user_consent_records')
      .insert({
        user_id: input.user_id,
        consent_type: input.consent_type,
        consent_version_id: input.consent_version_id,
        status: 'granted',
        granted_at: new Date().toISOString(),
        granted_from: getClientIdentifier(),
        delivery_method: input.delivery_method,
        age_verification: ageVerification.status,
        date_of_birth: input.date_of_birth || user.date_of_birth,
        guardian_consent_record_id: input.guardian_consent_record_id || null,
        expires_at: version.data_retention_period
          ? calculateExpirationDate(version.data_retention_period)
          : null,
        metadata: input.metadata || {},
      })
      .select()
      .single()

    if (error) {
      throw createConsentError(
        `Error al otorgar consentimiento: ${error.message}`,
        ConsentErrorCode.VALIDATION_FAILED,
        500
      )
    }

    consentRecord = data

    // Track the grant in history
    await trackConsentGranted(consentRecord.id, input.user_id)

    // Log to unified audit system with additional context
    await auditLogConsentGranted(consentRecord, {
      user_id: input.user_id,
      role: 'user',
    }, {
      ip_address: (input.metadata as any)?.ip_address,
      user_agent: (input.metadata as any)?.user_agent,
      session_id: (input.metadata as any)?.session_id,
      request_id: (input.metadata as any)?.request_id,
    })
  }

  // Update any pending consent requests
  await updatePendingConsentRequests(input.user_id, input.consent_type)

  return consentRecord
}

/**
 * Withdraw consent for a user
 *
 * @param input - Consent withdrawal parameters
 * @returns The updated consent record
 * @throws ConsentError if validation fails
 */
export async function withdrawConsent(
  input: WithdrawConsentInput
): Promise<UserConsentRecord> {
  const supabase = await createClient()

  // Get the consent record
  const { data: consent, error: consentError } = await supabase
    .from('user_consent_records')
    .select('*')
    .eq('id', input.consent_record_id)
    .single()

  if (consentError || !consent) {
    throw createConsentError(
      'Registro de consentimiento no encontrado',
      ConsentErrorCode.CONSENT_NOT_FOUND,
      404
    )
  }

  // Check if already withdrawn
  if (consent.status === 'withdrawn') {
    throw createConsentError(
      'El consentimiento ya ha sido retirado',
      ConsentErrorCode.CONSENT_WITHDRAWN,
      400
    )
  }

  // Check if consent can be withdrawn (essential consents cannot)
  if (ESSENTIAL_CONSENTS.includes(consent.consent_type)) {
    throw createConsentError(
      'No se puede retirar el consentimiento esencial',
      ConsentErrorCode.CANNOT_WITHDRAW_ESSENTIAL,
      403
    )
  }

  // Update consent record
  const { data, error } = await supabase
    .from('user_consent_records')
    .update({
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
      withdrawn_by: input.withdrawn_by || 'user',
      withdrawal_reason: input.withdrawal_reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.consent_record_id)
    .select()
    .single()

  if (error) {
    throw createConsentError(
      `Error al retirar consentimiento: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  // Track the withdrawal in history
  await trackConsentWithdrawn(input.consent_record_id, consent.user_id, {
    reason: input.withdrawal_reason,
    withdrawn_by: input.withdrawn_by || 'user',
  })

  // Log to unified audit system with additional context
  await auditLogConsentWithdrawn(data, input.withdrawal_reason || 'Usuario retiró consentimiento', {
    user_id: consent.user_id,
    role: (input.withdrawn_by === 'guardian' ? 'admin' : input.withdrawn_by) || 'user',
  }, {
    ip_address: (input as any)?.ip_address,
    user_agent: (input as any)?.user_agent,
    session_id: (input as any)?.session_id,
    request_id: (input as any)?.request_id,
  })

  return data
}

/**
 * Check if user has granted consent for a specific type
 *
 * @param userId - User ID
 * @param consentType - Type of consent to check
 * @param versionId - Optional specific version to check
 * @returns True if user has granted valid consent
 */
export async function hasUserConsent(
  userId: string,
  consentType: ConsentType,
  versionId?: string
): Promise<boolean> {
  const supabase = await createClient()

  let query = supabase
    .from('user_consent_records')
    .select('*')
    .eq('user_id', userId)
    .eq('consent_type', consentType)
    .eq('status', 'granted')

  if (versionId) {
    query = query.eq('consent_version_id', versionId)
  }

  const { data: consents } = await query.maybeSingle()

  if (!consents) {
    return false
  }

  // Check if consent has expired
  if (consents.expires_at && new Date(consents.expires_at) < new Date()) {
    // Mark as expired
    await expireConsent(consents.id)
    return false
  }

  return true
}

/**
 * Get all consents for a user
 *
 * @param userId - User ID
 * @param filter - Optional filter options
 * @returns Array of consent records
 */
export async function getUserConsents(
  userId: string,
  filter?: ConsentFilter
): Promise<UserConsentRecord[]> {
  const supabase = await createClient()

  let query = supabase
    .from('user_consent_records')
    .select('*')
    .eq('user_id', userId)

  if (filter) {
    if (filter.consent_type) {
      query = query.eq('consent_type', filter.consent_type)
    }
    if (filter.status) {
      query = query.eq('status', filter.status)
    }
    if (filter.version_id) {
      query = query.eq('consent_version_id', filter.version_id)
    }
    if (!filter.include_expired) {
      query = query.or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
    }
    if (!filter.include_withdrawn) {
      query = query.neq('status', 'withdrawn')
    }
  }

  const { data, error } = await query.order('granted_at', { ascending: false })

  if (error) {
    throw createConsentError(
      `Error al obtener consentimientos: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  return data || []
}

/**
 * Get consent summary for a user
 *
 * @param userId - User ID
 * @returns User consent summary
 */
export async function getUserConsentSummary(
  userId: string
): Promise<UserConsentSummary> {
  const consents = await getUserConsents(userId, {
    include_expired: true,
    include_withdrawn: true,
  })

  const summary: UserConsentSummary = {
    user_id: userId,
    total_consents: consents.length,
    active_consents: 0,
    withdrawn_consents: 0,
    expired_consents: 0,
    pending_consents: 0,
    consents_by_type: {} as Record<ConsentType, number>,
    consents_by_category: {} as Record<ConsentCategory, number>,
    requires_attention: false,
    last_updated: new Date().toISOString(),
  }

  // Initialize counters
  for (const type of Object.keys(CONSENT_TYPE_LABELS) as ConsentType[]) {
    summary.consents_by_type[type] = 0
  }
  for (const category of Object.keys(CONSENT_CATEGORIES) as ConsentCategory[]) {
    summary.consents_by_category[category] = 0
  }

  // Count consents
  for (const consent of consents) {
    // Status counts
    if (consent.status === 'granted') {
      if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
        summary.expired_consents++
      } else {
        summary.active_consents++
      }
    } else if (consent.status === 'withdrawn') {
      summary.withdrawn_consents++
    }

    // Type counts
    summary.consents_by_type[consent.consent_type]++

    // Category counts
    const category = CONSENT_TYPE_CATEGORIES[consent.consent_type]
    summary.consents_by_category[category]++
  }

  // Check for pending consent requests
  const pendingRequests = await getPendingConsentRequests(userId)
  summary.pending_consents = pendingRequests.length
  summary.requires_attention =
    summary.pending_consents > 0 ||
    summary.expired_consents > 0 ||
    summary.active_consents < Object.keys(CONSENT_TYPE_LABELS).length

  return summary
}

/**
 * Update consent record
 *
 * @param input - Update parameters
 * @returns Updated consent record
 */
export async function updateConsent(
  input: UpdateConsentInput
): Promise<UserConsentRecord> {
  const supabase = await createClient()

  const { data: consent, error } = await supabase
    .from('user_consent_records')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.consent_record_id)
    .select()
    .single()

  if (error) {
    throw createConsentError(
      `Error al actualizar consentimiento: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  // Track modification in history
  await trackConsentModified(input.consent_record_id, consent.user_id, input as unknown as Record<string, unknown>)

  return consent
}

/**
 * Expire a consent record
 *
 * @param consentRecordId - Consent record ID
 * @returns Updated consent record
 */
/**
 * Get active consents for a user
 *
 * @param userId - User ID
 * @returns Array of active (granted, non-expired) consent records
 */
export async function getActiveConsents(
  userId: string
): Promise<UserConsentRecord[]> {
  return getUserConsents(userId, {
    status: 'granted',
    include_expired: false,
    include_withdrawn: false,
  })
}

export async function expireConsent(
  consentRecordId: string
): Promise<UserConsentRecord> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_consent_records')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('id', consentRecordId)
    .select()
    .single()

  if (error) {
    throw createConsentError(
      `Error al expirar consentimiento: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  // Track expiration in history
  await trackConsentModified(consentRecordId, data.user_id, {
    status: 'expired',
  })

  return data
}

/**
 * Generate compliance report
 *
 * @param startDate - Report start date
 * @param endDate - Report end date
 * @returns Compliance report
 */
export async function generateComplianceReport(
  startDate: Date,
  endDate: Date
): Promise<ConsentComplianceReport> {
  const supabase = await createClient()

  // Get all consent records within date range
  const { data: consents } = await supabase
    .from('user_consent_records')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get all users
  const { data: users } = await supabase.from('profiles').select('id')

  // Get all consent versions
  const { data: versions } = await supabase
    .from('consent_versions')
    .select('*')
    .is('deprecated_date', null)

  // Get guardian consents
  const { data: guardianConsents } = await supabase
    .from('guardian_consent_records')
    .select('*')

  // Get audit logs
  const { data: auditLogs } = await supabase
    .from('consent_audit_logs')
    .select('*')
    .gte('occurred_at', startDate.toISOString())
    .lte('occurred_at', endDate.toISOString())

  // Build report
  const report: ConsentComplianceReport = {
    report_period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    user_statistics: {
      total_users: users?.length || 0,
      users_with_all_consents: 0,
      users_with_partial_consents: 0,
      users_with_expired_consents: 0,
      users_with_withdrawn_consents: 0,
    },
    consent_type_breakdown: [],
    version_statistics: {
      active_versions: versions?.length || 0,
      deprecated_versions: 0,
      pending_migrations: 0,
    },
    guardian_statistics: {
      total_guardian_consents: guardianConsents?.length || 0,
      active_guardian_consents: guardianConsents?.filter((g) => g.status === 'active').length || 0,
      expired_guardian_consents: guardianConsents?.filter((g) => g.status === 'expired').length || 0,
    },
    audit_summary: {
      total_events: auditLogs?.length || 0,
      events_by_type: {},
      most_common_actions: [],
    },
    generated_at: new Date().toISOString(),
  }

  // Calculate detailed statistics
  // (This is a simplified version - full implementation would do more detailed analysis)

  return report
}

// ================================================
// INTERNAL HELPERS
// ================================================

/**
 * Update pending consent requests after granting consent
 *
 * @param userId - User ID
 * @param consentType - Granted consent type
 */
async function updatePendingConsentRequests(
  userId: string,
  consentType: ConsentType
): Promise<void> {
  const pendingRequests = await getPendingConsentRequests(userId)

  for (const request of pendingRequests) {
    if (request.requested_for.includes(consentType)) {
      // Check if all requested consents are now granted
      const remainingNeeded = request.requested_for.filter(
        async (type) => !(await hasUserConsent(userId, type))
      )

      if (remainingNeeded.length === 0) {
        // All consents granted
        await updateConsentRequestStatus(request.id, 'granted')
      } else {
        // Some consents still pending
        await updateConsentRequestStatus(request.id, 'viewed')
      }
    }
  }
}
