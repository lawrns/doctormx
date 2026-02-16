/**
 * Consent Manager - Simplified Interface for Consent Management
 *
 * Provides a simple, user-friendly interface for managing patient consent
 * Integrates with the full consent system and provides convenience methods
 *
 * @module consent/consent-manager
 */

import type { ConsentType } from './types'
import {
  grantConsent,
  withdrawConsent,
  hasUserConsent,
  getUserConsents,
  getUserConsentSummary,
} from './core'
import {
  getLatestConsentVersion,
  checkIfReConsentRequired,
} from './versioning'

// ================================================
// CONSENT MANAGER INTERFACE
// ================================================

/**
 * Consent Manager Configuration
 */
export interface ConsentManagerConfig {
  userId: string
  autoTrack?: boolean
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
}

/**
 * Consent Manager Class
 *
 * Provides a simplified interface for managing user consent
 */
export class ConsentManager {
  private config: ConsentManagerConfig

  constructor(config: ConsentManagerConfig) {
    this.config = {
      ...config,
      autoTrack: config.autoTrack ?? true,
    }
  }

  // ================================================
  // CORE CONSENT METHODS
  // ================================================

  /**
   * Create (grant) consent for a specific type
   *
   * @param consentType - Type of consent to grant
   * @param options - Additional options
   * @returns The created consent record
   */
  async createConsent(
    consentType: ConsentType,
    options?: {
      deliveryMethod?: 'electronic_signature' | 'click_wrap' | 'browse_wrap'
      dateOfBirth?: string
      guardianConsentId?: string
      metadata?: Record<string, unknown>
    }
  ) {
    // Get the latest version for this consent type
    const version = await getLatestConsentVersion(consentType)
    if (!version) {
      throw new Error(`No consent version available for ${consentType}`)
    }

    // Grant the consent
    return grantConsent({
      user_id: this.config.userId,
      consent_type: consentType,
      consent_version_id: version.id,
      delivery_method: options?.deliveryMethod || 'click_wrap',
      date_of_birth: options?.dateOfBirth,
      guardian_consent_record_id: options?.guardianConsentId,
      metadata: {
        ...options?.metadata,
        ip_address: this.config.ipAddress,
        user_agent: this.config.userAgent,
        session_id: this.config.sessionId,
        request_id: this.config.requestId,
      },
    })
  }

  /**
   * Update existing consent (grant new version)
   *
   * @param consentType - Type of consent to update
   * @param options - Additional options
   * @returns The updated consent record
   */
  async updateConsent(
    consentType: ConsentType,
    options?: {
      deliveryMethod?: 'electronic_signature' | 'click_wrap'
      metadata?: Record<string, unknown>
    }
  ) {
    // Check if user already has consent
    const existing = await hasUserConsent(this.config.userId, consentType)
    if (!existing) {
      // If no existing consent, create new
      return this.createConsent(consentType, options)
    }

    // Get the latest version
    const version = await getLatestConsentVersion(consentType)
    if (!version) {
      throw new Error(`No consent version available for ${consentType}`)
    }

    // Grant the new version (will update existing)
    return grantConsent({
      user_id: this.config.userId,
      consent_type: consentType,
      consent_version_id: version.id,
      delivery_method: options?.deliveryMethod || 'click_wrap',
      metadata: {
        ...options?.metadata,
        ip_address: this.config.ipAddress,
        user_agent: this.config.userAgent,
        session_id: this.config.sessionId,
        request_id: this.config.requestId,
      },
    })
  }

  /**
   * Withdraw consent for a specific type
   *
   * @param consentType - Type of consent to withdraw
   * @param reason - Reason for withdrawal
   * @returns The withdrawn consent record
   */
  async withdrawConsent(
    consentType: ConsentType,
    reason: string
  ) {
    // Get user's consent for this type
    const consents = await getUserConsents(this.config.userId, {
      consent_type: consentType,
      status: 'granted',
    })

    if (consents.length === 0) {
      throw new Error(`No active consent found for ${consentType}`)
    }

    // Withdraw the most recent consent
    return withdrawConsent({
      consent_record_id: consents[0].id,
      withdrawal_reason: reason,
      withdrawn_by: 'user',
    })
  }

  /**
   * Check if user has consented to a specific type
   *
   * @param consentType - Type of consent to check
   * @returns True if user has valid consent
   */
  async hasConsented(consentType: ConsentType): Promise<boolean> {
    return hasUserConsent(this.config.userId, consentType)
  }

  /**
   * Check if user needs to update/re-consent
   *
   * @param consentType - Type of consent to check
   * @returns True if re-consent is required
   */
  async needsReConsent(consentType: ConsentType): Promise<boolean> {
    return checkIfReConsentRequired(this.config.userId, consentType)
  }

  // ================================================
  // BULK OPERATIONS
  // ================================================

  /**
   * Grant multiple consents at once
   *
   * @param consentTypes - Array of consent types to grant
   * @param options - Additional options
   * @returns Array of created consent records
   */
  async createMultipleConsents(
    consentTypes: ConsentType[],
    options?: {
      deliveryMethod?: 'electronic_signature' | 'click_wrap'
      metadata?: Record<string, unknown>
    }
  ) {
    const results = []

    for (const consentType of consentTypes) {
      try {
        const consent = await this.createConsent(consentType, options)
        results.push({ consentType, success: true, data: consent })
      } catch (error) {
        results.push({
          consentType,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }

  /**
   * Withdraw multiple consents at once
   *
   * @param consentTypes - Array of consent types to withdraw
   * @param reason - Reason for withdrawal
   * @returns Array of withdrawn consent records
   */
  async withdrawMultipleConsents(
    consentTypes: ConsentType[],
    reason: string
  ) {
    const results = []

    for (const consentType of consentTypes) {
      try {
        const consent = await this.withdrawConsent(consentType, reason)
        results.push({ consentType, success: true, data: consent })
      } catch (error) {
        results.push({
          consentType,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }

  // ================================================
  // QUERY METHODS
  // ================================================

  /**
   * Get all consents for the user
   *
   * @param options - Filter options
   * @returns Array of consent records
   */
  async getAllConsents(options?: {
    includeExpired?: boolean
    includeWithdrawn?: boolean
  }) {
    return getUserConsents(this.config.userId, {
      include_expired: options?.includeExpired,
      include_withdrawn: options?.includeWithdrawn,
    })
  }

  /**
   * Get consent summary for the user
   *
   * @returns User consent summary
   */
  async getSummary() {
    return getUserConsentSummary(this.config.userId)
  }

  /**
   * Get consents that need attention
   *
   * @returns Array of consent types that need update
   */
  async getConsentsNeedingAttention(): Promise<ConsentType[]> {
    const allConsentTypes: ConsentType[] = [
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

    const needingAttention: ConsentType[] = []

    for (const consentType of allConsentTypes) {
      const hasConsent = await this.hasConsented(consentType)
      if (!hasConsent) {
        needingAttention.push(consentType)
        continue
      }

      const needsUpdate = await this.needsReConsent(consentType)
      if (needsUpdate) {
        needingAttention.push(consentType)
      }
    }

    return needingAttention
  }
}

// ================================================
// FACTORY FUNCTION
// ================================================

/**
 * Create a consent manager for a user
 *
 * @param config - Consent manager configuration
 * @returns ConsentManager instance
 */
export function createConsentManager(config: ConsentManagerConfig): ConsentManager {
  return new ConsentManager(config)
}

// ================================================
// CONVENIENCE FUNCTIONS
// ================================================

/**
 * Quick check if user has consent
 *
 * @param userId - User ID
 * @param consentType - Type of consent to check
 * @returns True if user has valid consent
 */
export async function hasConsented(
  userId: string,
  consentType: ConsentType
): Promise<boolean> {
  return hasUserConsent(userId, consentType)
}

/**
 * Quick grant consent
 *
 * @param userId - User ID
 * @param consentType - Type of consent to grant
 * @param options - Additional options
 * @returns The created consent record
 */
export async function grantUserConsent(
  userId: string,
  consentType: ConsentType,
  options?: {
    ipAddress?: string
    userAgent?: string
    sessionId?: string
  }
) {
  const manager = new ConsentManager({
    userId,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    sessionId: options?.sessionId,
  })

  return manager.createConsent(consentType)
}

/**
 * Quick withdraw consent
 *
 * @param userId - User ID
 * @param consentType - Type of consent to withdraw
 * @param reason - Reason for withdrawal
 * @returns The withdrawn consent record
 */
export async function withdrawUserConsent(
  userId: string,
  consentType: ConsentType,
  reason: string
) {
  const manager = new ConsentManager({ userId })
  return manager.withdrawConsent(consentType, reason)
}

