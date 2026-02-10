/**
 * Patient Consent Management System - Core Module
 *
 * Implements comprehensive consent management for LFPDPPP compliance
 * Sistema de Gestión de Consentimiento de Pacientes
 *
 * Key Features:
 * - Dynamic consent (ability to withdraw)
 * - Consent history tracking
 * - Consent versioning
 * - Age-specific consent (minors need guardian)
 * - Consent audit trail
 *
 * @module consent
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ConsentType,
  ConsentStatus,
  ConsentCategory,
  AgeVerificationStatus,
  UserConsentRecord,
  ConsentVersion,
  GuardianConsentRecord,
  ConsentHistoryEntry,
  ConsentRequest,
  GrantConsentInput,
  WithdrawConsentInput,
  CreateConsentVersionInput,
  CreateGuardianConsentInput,
  UpdateConsentInput,
  UserConsentSummary,
  ConsentComplianceReport,
  ConsentError,
  ConsentErrorCode,
  ConsentFilter,
  ConsentSortOption,
  BulkConsentOperation,
  BulkConsentOperationResult,
} from './types'

// Re-export all types
export * from './types'
export * from './history'
export * from './versioning'

// Import sub-modules
import {
  trackConsentGranted,
  trackConsentWithdrawn,
  trackConsentModified,
  getConsentHistory,
  getConsentHistoryForUser,
} from './history'
import {
  createConsentVersion,
  getLatestConsentVersion,
  getConsentVersion,
  compareConsentVersions,
  deprecateConsentVersion,
  getActiveConsentVersions,
  checkIfReConsentRequired,
} from './versioning'

// ================================================
// CONSTANTS
// ================================================

/**
 * Legal age of majority in Mexico
 */
export const LEGAL_AGE_MEXICO = 18

/**
 * Default consent expiration (null = no expiration)
 */
export const DEFAULT_CONSENT_EXPIRATION: string | null = null

/**
 * Essential consents that cannot be withdrawn
 */
export const ESSENTIAL_CONSENTS: ConsentType[] = [
  'medical_treatment',
  'emergency_contact',
]

/**
 * Consent categories
 */
export const CONSENT_CATEGORIES: Record<ConsentCategory, string> = {
  essential: 'Esencial',
  functional: 'Funcional',
  analytical: 'Analítico',
  marketing: 'Marketing',
  legal: 'Legal',
}

/**
 * Consent type display names (Spanish)
 */
export const CONSENT_TYPE_LABELS: Record<ConsentType, string> = {
  medical_treatment: 'Tratamiento Médico',
  data_processing: 'Procesamiento de Datos',
  telemedicine: 'Telemedicina',
  recording: 'Grabación de Consultas',
  ai_analysis: 'Análisis con IA',
  data_sharing: 'Compartir Datos',
  research: 'Investigación',
  marketing: 'Marketing',
  emergency_contact: 'Contacto de Emergencia',
  prescription_forwarding: 'Reenvío de Recetas',
}

/**
 * Consent category assignments
 */
export const CONSENT_TYPE_CATEGORIES: Record<ConsentType, ConsentCategory> = {
  medical_treatment: 'essential',
  data_processing: 'legal',
  telemedicine: 'functional',
  recording: 'functional',
  ai_analysis: 'analytical',
  data_sharing: 'functional',
  research: 'analytical',
  marketing: 'marketing',
  emergency_contact: 'essential',
  prescription_forwarding: 'functional',
}

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
  await trackConsentModified(input.consent_record_id, consent.user_id, input)

  return consent
}

/**
 * Expire a consent record
 *
 * @param consentRecordId - Consent record ID
 * @returns Updated consent record
 */
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

// ================================================
// GUARDIAN CONSENT FUNCTIONS
// ================================================

/**
 * Create guardian consent record
 *
 * @param input - Guardian consent parameters
 * @returns Created guardian consent record
 */
export async function createGuardianConsent(
  input: CreateGuardianConsentInput
): Promise<GuardianConsentRecord> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('guardian_consent_records')
    .insert({
      user_id: input.user_id,
      guardian_user_id: input.guardian_user_id || null,
      guardian_name: input.guardian_name,
      guardian_relationship: input.guardian_relationship,
      guardian_contact: input.guardian_contact,
      guardian_identification: input.guardian_identification || null,
      verification_method: input.verification_method,
      consent_scope: input.consent_scope,
      limitations: input.limitations || null,
      status: 'active',
      effective_date: input.effective_date || new Date().toISOString(),
      expiration_date: input.expiration_date || null,
      created_by: input.user_id, // Should be admin/staff in production
      metadata: {},
    })
    .select()
    .single()

  if (error) {
    throw createConsentError(
      `Error al crear consentimiento de tutor: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  return data
}

/**
 * Get active guardian consent for a user
 *
 * @param userId - User ID (minor)
 * @returns Guardian consent record or null
 */
export async function getActiveGuardianConsent(
  userId: string
): Promise<GuardianConsentRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('guardian_consent_records')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .maybeSingle()

  if (error) {
    return null
  }

  // Check if expired
  if (data && data.expiration_date && new Date(data.expiration_date) < new Date()) {
    // Mark as expired
    await supabase
      .from('guardian_consent_records')
      .update({ status: 'expired' })
      .eq('id', data.id)
    return null
  }

  return data
}

/**
 * Verify if guardian consent is valid for a specific consent type
 *
 * @param userId - User ID
 * @param consentType - Type of consent
 * @returns True if valid guardian consent exists
 */
export async function hasValidGuardianConsent(
  userId: string,
  consentType: ConsentType
): Promise<boolean> {
  const guardianConsent = await getActiveGuardianConsent(userId)

  if (!guardianConsent) {
    return false
  }

  // Check if the guardian can grant this type of consent
  return guardianConsent.consent_scope.includes(consentType)
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

// ================================================
// AGE VERIFICATION FUNCTIONS
// ================================================

/**
 * Verify age and determine consent requirements
 *
 * @param userId - User ID
 * @param consentType - Type of consent
 * @param dateOfBirth - Date of birth (optional)
 * @returns Age verification result
 */
export async function verifyAgeAndConsentRequirements(
  userId: string,
  consentType: ConsentType,
  dateOfBirth?: string | null
): Promise<{
  status: AgeVerificationStatus
  requires_guardian: boolean
  age: number | null
  legal_age: number
}> {
  // Get consent version to check age restrictions
  const version = await getLatestConsentVersion(consentType)

  let minAge = LEGAL_AGE_MEXICO
  let requiresGuardian = false

  if (version?.age_restriction) {
    minAge = version.age_restriction.min_age || LEGAL_AGE_MEXICO
    requiresGuardian = version.age_restriction.requires_guardian || false
  }

  // If no DOB provided, check if user has one
  let dob = dateOfBirth
  if (!dob) {
    const supabase = await createClient()
    const { data: user } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('id', userId)
      .single()

    dob = user?.date_of_birth
  }

  if (!dob) {
    return {
      status: 'unverified',
      requires_guardian: true,
      age: null,
      legal_age: minAge,
    }
  }

  const age = calculateAge(new Date(dob))
  const isAdult = age >= minAge

  return {
    status: isAdult ? 'verified_adult' : 'verified_minor',
    requires_guardian: !isAdult || requiresGuardian,
    age,
    legal_age: minAge,
  }
}

/**
 * Calculate age from date of birth
 *
 * @param dateOfBirth - Date of birth
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--
  }

  return age
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Calculate expiration date from retention period
 *
 * @param retentionPeriod - Retention period string (e.g., "5 years", "90 days")
 * @returns ISO date string or null
 */
function calculateExpirationDate(retentionPeriod: string): string | null {
  const match = retentionPeriod.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i)

  if (!match) {
    return null
  }

  const value = parseInt(match[1])
  const unit = match[2].toLowerCase()

  const now = new Date()
  let expirationDate = new Date(now)

  switch (unit) {
    case 'day':
    case 'days':
      expirationDate.setDate(now.getDate() + value)
      break
    case 'week':
    case 'weeks':
      expirationDate.setDate(now.getDate() + value * 7)
      break
    case 'month':
    case 'months':
      expirationDate.setMonth(now.getMonth() + value)
      break
    case 'year':
    case 'years':
      expirationDate.setFullYear(now.getFullYear() + value)
      break
  }

  return expirationDate.toISOString()
}

/**
 * Get client identifier for consent tracking
 *
 * @returns Client identifier string
 */
function getClientIdentifier(): string {
  // In a real implementation, this would get IP, device ID, etc.
  // For now, return a placeholder
  return 'web:' + Date.now()
}

/**
 * Check if consent type is essential
 *
 * @param consentType - Type of consent
 * @returns True if essential
 */
export function isEssentialConsent(consentType: ConsentType): boolean {
  return ESSENTIAL_CONSENTS.includes(consentType)
}

/**
 * Get consent category for a type
 *
 * @param consentType - Type of consent
 * @returns Consent category
 */
export function getConsentCategory(consentType: ConsentType): ConsentCategory {
  return CONSENT_TYPE_CATEGORIES[consentType]
}

/**
 * Get consent display name
 *
 * @param consentType - Type of consent
 * @param language - Language code (default: 'es')
 * @returns Display name
 */
export function getConsentDisplayName(
  consentType: ConsentType,
  language: string = 'es'
): string {
  return CONSENT_TYPE_LABELS[consentType] || consentType
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
