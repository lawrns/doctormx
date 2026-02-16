/**
 * Guardian Consent Module
 *
 * Manages consent for minors and incapacitated adults
 * Gestiona el consentimiento para menores y adultos incapacitados
 *
 * @module consent/guardian
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ConsentType,
  GuardianConsentRecord,
  CreateGuardianConsentInput,
  AgeVerificationStatus,
} from './types'
import { ConsentError, ConsentErrorCode } from './types'
import { LEGAL_AGE_MEXICO } from './constants'
import { calculateAge } from './utils'
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

/**
 * Revoke guardian consent
 *
 * @param guardianConsentId - Guardian consent record ID
 * @param revokedBy - User ID of person revoking
 * @param reason - Reason for revocation
 * @returns Updated guardian consent record
 */
export async function revokeGuardianConsent(
  guardianConsentId: string,
  revokedBy: string,
  reason: string
): Promise<GuardianConsentRecord> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('guardian_consent_records')
    .update({
      status: 'revoked',
      updated_at: new Date().toISOString(),
    })
    .eq('id', guardianConsentId)
    .select()
    .single()

  if (error) {
    throw createConsentError(
      `Error al revocar consentimiento de tutor: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  return data
}

/**
 * Update guardian consent limitations
 *
 * @param guardianConsentId - Guardian consent record ID
 * @param limitations - New limitations
 * @returns Updated guardian consent record
 */
export async function updateGuardianConsentLimitations(
  guardianConsentId: string,
  limitations: string[]
): Promise<GuardianConsentRecord> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('guardian_consent_records')
    .update({
      limitations,
      updated_at: new Date().toISOString(),
    })
    .eq('id', guardianConsentId)
    .select()
    .single()

  if (error) {
    throw createConsentError(
      `Error al actualizar limitaciones del tutor: ${error.message}`,
      ConsentErrorCode.VALIDATION_FAILED,
      500
    )
  }

  return data
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
 * Check if user requires guardian consent
 *
 * @param dateOfBirth - Date of birth string
 * @param consentType - Type of consent
 * @returns True if guardian consent is required
 */
export async function requiresGuardianConsent(
  dateOfBirth: string,
  consentType: ConsentType
): Promise<boolean> {
  const age = calculateAge(new Date(dateOfBirth))
  
  // Get consent version to check age restrictions
  const version = await getLatestConsentVersion(consentType)
  
  let minAge = LEGAL_AGE_MEXICO
  if (version?.age_restriction) {
    minAge = version.age_restriction.min_age || LEGAL_AGE_MEXICO
  }
  
  return age < minAge
}

/**
 * Get all guardian consents for a user
 *
 * @param userId - User ID
 * @returns Array of guardian consent records
 */
export async function getGuardianConsentsForUser(
  userId: string
): Promise<GuardianConsentRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('guardian_consent_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}
