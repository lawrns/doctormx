/**
 * Consent Utilities Module
 *
 * Utility functions for consent management
 * Funciones de utilidad para gestión de consentimientos
 *
 * @module consent/utils
 */

import type { ConsentType, ConsentCategory } from './types'
import {
  ESSENTIAL_CONSENTS,
  CONSENT_TYPE_LABELS,
  CONSENT_TYPE_CATEGORIES,
  LEGAL_AGE_MEXICO,
} from './constants'

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

/**
 * Calculate expiration date from retention period
 *
 * @param retentionPeriod - Retention period string (e.g., "5 years", "90 days")
 * @returns ISO date string or null
 */
export function calculateExpirationDate(retentionPeriod: string): string | null {
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
export function getClientIdentifier(): string {
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
 * Validate if a user is an adult based on date of birth
 *
 * @param dateOfBirth - Date of birth string
 * @param legalAge - Legal age threshold (default: LEGAL_AGE_MEXICO)
 * @returns True if user is an adult
 */
export function isAdult(dateOfBirth: string, legalAge: number = LEGAL_AGE_MEXICO): boolean {
  const age = calculateAge(new Date(dateOfBirth))
  return age >= legalAge
}

/**
 * Format consent status for display
 *
 * @param status - Consent status
 * @param language - Language code (default: 'es')
 * @returns Formatted status string
 */
export function formatConsentStatus(
  status: 'granted' | 'withdrawn' | 'expired' | 'revoked',
  language: string = 'es'
): string {
  const statusMap: Record<string, string> = {
    granted: 'Otorgado',
    withdrawn: 'Retirado',
    expired: 'Expirado',
    revoked: 'Revocado',
  }
  return statusMap[status] || status
}

/**
 * Check if consent has expired
 *
 * @param expiresAt - Expiration date string or null
 * @returns True if consent has expired
 */
export function hasConsentExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

/**
 * Generate a unique consent record identifier
 *
 * @returns Unique identifier string
 */
export function generateConsentId(): string {
  return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
