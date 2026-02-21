/**
 * Consent Versioning Module
 *
 * Manages consent version control and comparison
 * Ensures proper versioning for LFPDPPP compliance
 *
 * @module consent/versioning
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ConsentVersion,
  CreateConsentVersionInput,
  VersionComparison,
  ConsentChange,
} from './types'
import { logConsentVersionUpdated } from './consent-audit'
import { logger } from '@/lib/logger'

// ================================================
// CONSENT VERSION FUNCTIONS
// ================================================

/**
 * Create a new consent version
 *
 * @param input - Consent version creation parameters
 * @param createdBy - User ID of creator
 * @returns Created consent version
 */
export async function createConsentVersion(
  input: CreateConsentVersionInput,
  createdBy: string
): Promise<ConsentVersion> {
  const supabase = await createClient()

  // Validate version format (semantic versioning)
  if (!isValidSemanticVersion(input.version)) {
    throw new Error('Formato de versión inválido. Use versionamiento semántico (ej: 1.0.0)')
  }

  // Get the previous version for audit logging
  const previousVersion = await getLatestConsentVersion(input.consent_type)

  // Check if version already exists for this consent type
  const { data: existing } = await supabase
    .from('consent_versions')
    .select('id')
    .eq('consent_type', input.consent_type)
    .eq('version', input.version)
    .maybeSingle()

  if (existing) {
    throw new Error('Ya existe una versión con este número para este tipo de consentimiento')
  }

  const { data, error } = await supabase
    .from('consent_versions')
    .insert({
      consent_type: input.consent_type,
      version: input.version,
      title: input.title,
      description: input.description,
      legal_text: input.legal_text,
      privacy_policy_reference: input.privacy_policy_reference || '',
      terms_of_service_reference: input.terms_of_service_reference || '',
      effective_date: input.effective_date,
      deprecated_date: null,
      required_for_new_users: input.required_for_new_users ?? true,
      requires_re_consent: input.requires_re_consent ?? false,
      category: input.category,
      data_retention_period: input.data_retention_period || null,
      third_party_sharing: input.third_party_sharing || null,
      age_restriction: input.age_restriction || null,
      created_by: createdBy,
      metadata: {},
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error al crear versión de consentimiento: ${error.message}`)
  }

  // Log the version update to audit system
  await logConsentVersionUpdated(previousVersion, data, {
    user_id: createdBy,
    role: 'admin',
  })

  // If this is a new version, deprecate old versions if re-consent is required
  if (input.requires_re_consent) {
    await deprecateOldConsentVersions(input.consent_type, data.id, input.effective_date)
  }

  return data
}

/**
 * Get the latest active consent version for a type
 *
 * @param consentType - Type of consent
 * @returns Latest consent version or null
 */
export async function getLatestConsentVersion(
  consentType: string
): Promise<ConsentVersion | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_versions')
    .select('*')
    .eq('consent_type', consentType)
    .is('deprecated_date', null)
    .lte('effective_date', new Date().toISOString())
    .order('effective_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error({ err: error }, 'Error getting latest consent version')
    return null
  }

  return data
}

/**
 * Get a specific consent version by ID
 *
 * @param versionId - Version ID
 * @returns Consent version or null
 */
export async function getConsentVersion(
  versionId: string
): Promise<ConsentVersion | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_versions')
    .select('*')
    .eq('id', versionId)
    .maybeSingle()

  if (error) {
    logger.error({ err: error }, 'Error getting consent version')
    return null
  }

  return data
}

/**
 * Get consent version by version number and type
 *
 * @param consentType - Type of consent
 * @param version - Version number
 * @returns Consent version or null
 */
export async function getConsentVersionByNumber(
  consentType: string,
  version: string
): Promise<ConsentVersion | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_versions')
    .select('*')
    .eq('consent_type', consentType)
    .eq('version', version)
    .maybeSingle()

  if (error) {
    logger.error({ err: error }, 'Error getting consent version by number')
    return null
  }

  return data
}

/**
 * Get all active consent versions
 *
 * @param consentType - Optional filter by consent type
 * @returns Array of active consent versions
 */
export async function getActiveConsentVersions(
  consentType?: string
): Promise<ConsentVersion[]> {
  const supabase = await createClient()

  let query = supabase
    .from('consent_versions')
    .select('*')
    .is('deprecated_date', null)
    .lte('effective_date', new Date().toISOString())
    .order('consent_type')
    .order('effective_date', { ascending: false })

  if (consentType) {
    query = query.eq('consent_type', consentType)
  }

  const { data, error } = await query

  if (error) {
    logger.error({ err: error }, 'Error getting active consent versions')
    return []
  }

  return data || []
}

/**
 * Get all consent versions (including deprecated)
 *
 * @param consentType - Optional filter by consent type
 * @returns Array of all consent versions
 */
export async function getAllConsentVersions(
  consentType?: string
): Promise<ConsentVersion[]> {
  const supabase = await createClient()

  let query = supabase
    .from('consent_versions')
    .select('*')
    .order('consent_type')
    .order('created_at', { ascending: false })

  if (consentType) {
    query = query.eq('consent_type', consentType)
  }

  const { data, error } = await query

  if (error) {
    logger.error({ err: error }, 'Error getting all consent versions')
    return []
  }

  return data || []
}

/**
 * Deprecate a consent version
 *
 * @param versionId - Version ID to deprecate
 * @param deprecatedDate - Date of deprecation
 * @returns Updated consent version
 */
export async function deprecateConsentVersion(
  versionId: string,
  deprecatedDate: string = new Date().toISOString()
): Promise<ConsentVersion> {
  const supabase = await createClient()

  // Get the version before deprecation for audit logging
  const versionBefore = await getConsentVersion(versionId)

  const { data, error } = await supabase
    .from('consent_versions')
    .update({
      deprecated_date: deprecatedDate,
      required_for_new_users: false,
    })
    .eq('id', versionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al deprecar versión de consentimiento: ${error.message}`)
  }

  // Log the deprecation to audit system
  if (versionBefore) {
    await logConsentVersionUpdated(versionBefore, data, {
      user_id: data.created_by,
      role: 'admin',
    })
  }

  return data
}

/**
 * Deprecate all old versions of a consent type except the specified one
 *
 * @param consentType - Type of consent
 * @param keepVersionId - Version ID to keep active
 * @param deprecatedDate - Date of deprecation
 */
async function deprecateOldConsentVersions(
  consentType: string,
  keepVersionId: string,
  deprecatedDate: string
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('consent_versions')
    .update({
      deprecated_date: deprecatedDate,
      required_for_new_users: false,
    })
    .eq('consent_type', consentType)
    .neq('id', keepVersionId)
    .is('deprecated_date', null)
}

/**
 * Compare two consent versions
 *
 * @param oldVersionId - Old version ID
 * @param newVersionId - New version ID
 * @returns Version comparison result
 */
export async function compareConsentVersions(
  oldVersionId: string,
  newVersionId: string
): Promise<VersionComparison> {
  const oldVersion = await getConsentVersion(oldVersionId)
  const newVersion = await getConsentVersion(newVersionId)

  if (!oldVersion || !newVersion) {
    throw new Error('Una o ambas versiones no existen')
  }

  const oldVersionParts = oldVersion.version.split('.').map(Number)
  const newVersionParts = newVersion.version.split('.').map(Number)

  const hasMajorChanges = newVersionParts[0] > oldVersionParts[0]
  const hasMinorChanges = !hasMajorChanges && newVersionParts[1] > oldVersionParts[1]

  const changes: ConsentChange[] = []

  // Compare title
  if (oldVersion.title !== newVersion.title) {
    changes.push({
      field: 'title',
      old_value: oldVersion.title,
      new_value: newVersion.title,
      change_type: 'modification',
      significance: hasMajorChanges ? 'major' : 'minor',
    })
  }

  // Compare description
  if (oldVersion.description !== newVersion.description) {
    changes.push({
      field: 'description',
      old_value: oldVersion.description,
      new_value: newVersion.description,
      change_type: 'modification',
      significance: hasMajorChanges ? 'major' : 'minor',
    })
  }

  // Compare legal text
  if (oldVersion.legal_text !== newVersion.legal_text) {
    changes.push({
      field: 'legal_text',
      old_value: oldVersion.legal_text,
      new_value: newVersion.legal_text,
      change_type: 'modification',
      significance: 'major',
    })
  }

  // Compare data retention period
  if (oldVersion.data_retention_period !== newVersion.data_retention_period) {
    changes.push({
      field: 'data_retention_period',
      old_value: oldVersion.data_retention_period,
      new_value: newVersion.data_retention_period,
      change_type: oldVersion.data_retention_period
        ? 'modification'
        : 'addition',
      significance: 'major',
    })
  }

  // Compare third party sharing
  const oldSharing = JSON.stringify(oldVersion.third_party_sharing?.sort())
  const newSharing = JSON.stringify(newVersion.third_party_sharing?.sort())
  if (oldSharing !== newSharing) {
    changes.push({
      field: 'third_party_sharing',
      old_value: oldSharing,
      new_value: newSharing,
      change_type: 'modification',
      significance: 'major',
    })
  }

  return {
    current_version: oldVersion.version,
    new_version: newVersion.version,
    has_major_changes: hasMajorChanges,
    has_minor_changes: hasMinorChanges,
    changes,
    requires_re_consent: newVersion.requires_re_consent || hasMajorChanges,
  }
}

/**
 * Check if user needs to re-consent due to version changes
 *
 * @param userId - User ID
 * @param consentType - Type of consent
 * @returns True if re-consent is required
 */
export async function checkIfReConsentRequired(
  userId: string,
  consentType: string
): Promise<boolean> {
  // Get user's current consent
  const supabase = await createClient()
  const { data: userConsent } = await supabase
    .from('user_consent_records')
    .select('*')
    .eq('user_id', userId)
    .eq('consent_type', consentType)
    .eq('status', 'granted')
    .maybeSingle()

  if (!userConsent) {
    // No consent exists - need to grant
    return true
  }

  // Get latest version
  const latestVersion = await getLatestConsentVersion(consentType)
  if (!latestVersion) {
    return false
  }

  // Get user's current version
  const currentVersion = await getConsentVersion(userConsent.consent_version_id)
  if (!currentVersion) {
    return true
  }

  // If versions don't match, check if re-consent is required
  if (currentVersion.id !== latestVersion.id) {
    const comparison = await compareConsentVersions(
      currentVersion.id,
      latestVersion.id
    )
    return comparison.requires_re_consent || latestVersion.requires_re_consent
  }

  // Check if current consent has expired
  if (userConsent.expires_at && new Date(userConsent.expires_at) < new Date()) {
    return true
  }

  return false
}

/**
 * Get all consent types that require re-consent for a user
 *
 * @param userId - User ID
 * @returns Array of consent types requiring re-consent
 */
export async function getConsentTypesRequiringReConsent(
  userId: string
): Promise<string[]> {
  const consentTypes = [
    'medical_treatment',
    'data_processing',
    'telemedicine',
    'recording',
    'ai_analysis',
    'data_sharing',
    'research',
    'marketing',
    'emergency_contact',
    'prescription_forwarding',
  ]

  const requiringReConsent: string[] = []

  for (const type of consentTypes) {
    const needsReConsent = await checkIfReConsentRequired(userId, type)
    if (needsReConsent) {
      requiringReConsent.push(type)
    }
  }

  return requiringReConsent
}

/**
 * Increment consent version (semantic versioning)
 *
 * @param consentType - Type of consent
 * @param incrementType - Type of increment ('major', 'minor', 'patch')
 * @param createdBy - User ID of creator
 * @returns New consent version with incremented number
 */
export async function incrementConsentVersion(
  consentType: string,
  incrementType: 'major' | 'minor' | 'patch',
  createdBy: string
): Promise<ConsentVersion> {
  // Get latest version
  const latestVersion = await getLatestConsentVersion(consentType)

  if (!latestVersion) {
    // No version exists, create 1.0.0
    return createConsentVersion(
      {
        consent_type: consentType as any,
        version: '1.0.0',
        title: `Consentimiento de ${consentType}`,
        description: 'Descripción del consentimiento',
        legal_text: 'Texto legal del consentimiento',
        category: 'functional',
        effective_date: new Date().toISOString(),
        required_for_new_users: true,
        requires_re_consent: false,
      },
      createdBy
    )
  }

  // Parse current version
  const versionParts = latestVersion.version.split('.').map(Number)

  // Increment based on type
  switch (incrementType) {
    case 'major':
      versionParts[0]++
      versionParts[1] = 0
      versionParts[2] = 0
      break
    case 'minor':
      versionParts[1]++
      versionParts[2] = 0
      break
    case 'patch':
      versionParts[2]++
      break
  }

  const newVersion = versionParts.join('.')

  // Create new version with same content but new version number
  return createConsentVersion(
    {
      consent_type: consentType as any,
      version: newVersion,
      title: latestVersion.title,
      description: latestVersion.description,
      legal_text: latestVersion.legal_text,
      privacy_policy_reference: latestVersion.privacy_policy_reference,
      terms_of_service_reference: latestVersion.terms_of_service_reference,
      category: latestVersion.category as any,
      effective_date: new Date().toISOString(),
      required_for_new_users: true,
      requires_re_consent: incrementType === 'major',
      data_retention_period: latestVersion.data_retention_period || undefined,
      third_party_sharing: latestVersion.third_party_sharing || undefined,
      age_restriction: latestVersion.age_restriction || undefined,
    },
    createdBy
  )
}

/**
 * Get version history for a consent type
 *
 * @param consentType - Type of consent
 * @returns Array of versions ordered by creation date
 */
export async function getConsentVersionHistory(
  consentType: string
): Promise<ConsentVersion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_versions')
    .select('*')
    .eq('consent_type', consentType)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error({ err: error }, 'Error getting consent version history')
    return []
  }

  return data || []
}

/**
 * Publish a consent version (make it active)
 *
 * @param versionId - Version ID to publish
 * @returns Updated consent version
 */
export async function publishConsentVersion(
  versionId: string
): Promise<ConsentVersion> {
  const version = await getConsentVersion(versionId)

  if (!version) {
    throw new Error('Versión de consentimiento no encontrada')
  }

  // Update effective date to now if it's in the future
  const effectiveDate =
    new Date(version.effective_date) > new Date()
      ? new Date().toISOString()
      : version.effective_date

  // Deprecate other versions if this one requires re-consent
  if (version.requires_re_consent) {
    await deprecateOldConsentVersions(version.consent_type, versionId, effectiveDate)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('consent_versions')
    .update({
      effective_date: effectiveDate,
      deprecated_date: null, // Undeprecate if previously deprecated
    })
    .eq('id', versionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al publicar versión de consentimiento: ${error.message}`)
  }

  return data
}

/**
 * Get upcoming consent versions (scheduled for future)
 *
 * @returns Array of scheduled consent versions
 */
export async function getScheduledConsentVersions(): Promise<ConsentVersion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_versions')
    .select('*')
    .gt('effective_date', new Date().toISOString())
    .is('deprecated_date', null)
    .order('effective_date', { ascending: true })

  if (error) {
    logger.error({ err: error }, 'Error getting scheduled consent versions')
    return []
  }

  return data || []
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Validate semantic version format
 *
 * @param version - Version string to validate
 * @returns True if valid semantic version
 */
function isValidSemanticVersion(version: string): boolean {
  const semanticVersionRegex = /^\d+\.\d+\.\d+$/
  return semanticVersionRegex.test(version)
}

/**
 * Compare two version numbers
 *
 * @param version1 - First version number
 * @param version2 - Second version number
 * @returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
export function compareVersionNumbers(
  version1: string,
  version2: string
): number {
  const parts1 = version1.split('.').map(Number)
  const parts2 = version2.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if (parts1[i] < parts2[i]) return -1
    if (parts1[i] > parts2[i]) return 1
  }

  return 0
}

/**
 * Get a summary of changes between versions for display
 *
 * @param comparison - Version comparison result
 * @returns Formatted summary of changes
 */
export function formatVersionComparisonSummary(
  comparison: VersionComparison
): string {
  const lines: string[] = []

  lines.push(`Cambios de versión ${comparison.current_version} → ${comparison.new_version}:`)

  if (comparison.has_major_changes) {
    lines.push('⚠️ Cambios mayores - Requiere nuevo consentimiento')
  } else if (comparison.has_minor_changes) {
    lines.push('ℹ️ Cambios menores')
  }

  if (comparison.changes.length === 0) {
    lines.push('No hay cambios significativos')
  } else {
    for (const change of comparison.changes) {
      const emoji = change.significance === 'major' ? '🔴' : '🟡'
      const action = change.change_type === 'addition' ? 'Agregado' :
                    change.change_type === 'removal' ? 'Eliminado' :
                    'Modificado'
      lines.push(`${emoji} ${action}: ${change.field}`)
    }
  }

  return lines.join('\n')
}

/**
 * Calculate when consent version will expire based on retention policy
 *
 * @param version - Consent version
 * @param grantedDate - Date when consent was granted
 * @returns Expiration date or null if no expiration
 */
export function calculateConsentExpiration(
  version: ConsentVersion,
  grantedDate: Date = new Date()
): Date | null {
  if (!version.data_retention_period) {
    return null
  }

  const match = version.data_retention_period.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i)

  if (!match) {
    return null
  }

  const value = parseInt(match[1])
  const unit = match[2].toLowerCase()

  const expirationDate = new Date(grantedDate)

  switch (unit) {
    case 'day':
    case 'days':
      expirationDate.setDate(grantedDate.getDate() + value)
      break
    case 'week':
    case 'weeks':
      expirationDate.setDate(grantedDate.getDate() + value * 7)
      break
    case 'month':
    case 'months':
      expirationDate.setMonth(grantedDate.getMonth() + value)
      break
    case 'year':
    case 'years':
      expirationDate.setFullYear(grantedDate.getFullYear() + value)
      break
  }

  return expirationDate
}

/**
 * Check if a consent version is currently active
 *
 * @param version - Consent version
 * @returns True if version is active
 */
export function isConsentVersionActive(version: ConsentVersion): boolean {
  const now = new Date()
  const effectiveDate = new Date(version.effective_date)
  const deprecatedDate = version.deprecated_date ? new Date(version.deprecated_date) : null

  return (
    effectiveDate <= now &&
    (!deprecatedDate || deprecatedDate > now)
  )
}

/**
 * Get the next version number for a consent type
 *
 * @param consentType - Type of consent
 * @param incrementType - Type of increment
 * @returns Next version number
 */
export async function getNextVersionNumber(
  consentType: string,
  incrementType: 'major' | 'minor' | 'patch' = 'patch'
): Promise<string> {
  const latestVersion = await getLatestConsentVersion(consentType)

  if (!latestVersion) {
    return '1.0.0'
  }

  const versionParts = latestVersion.version.split('.').map(Number)

  switch (incrementType) {
    case 'major':
      versionParts[0]++
      versionParts[1] = 0
      versionParts[2] = 0
      break
    case 'minor':
      versionParts[1]++
      versionParts[2] = 0
      break
    case 'patch':
      versionParts[2]++
      break
  }

  return versionParts.join('.')
}
