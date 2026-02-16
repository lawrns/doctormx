/**
 * Patient Consent Constants - Doctor.mx
 *
 * Constants for the patient consent management system.
 * Implements LFPDPPP (Ley Federal de Protección de Datos) compliance.
 *
 * @module constants/consent
 * @see {@link ../lib/consent/index.ts} - Original source
 */

import type { ConsentType, ConsentCategory } from '@/lib/consent/types'

/**
 * Legal age of majority in Mexico
 * Used to determine when guardian consent is required
 */
export const LEGAL_AGE_MEXICO = 18

/**
 * Default consent expiration
 * null indicates no expiration date
 */
export const DEFAULT_CONSENT_EXPIRATION: string | null = null

/**
 * Essential consents that cannot be withdrawn
 * These are required for the platform to function
 */
export const ESSENTIAL_CONSENTS: readonly ConsentType[] = [
  'medical_treatment',
  'emergency_contact',
]

/**
 * Consent categories with Spanish display names
 * Organizes consent types into functional groups
 */
export const CONSENT_CATEGORIES: Record<ConsentCategory, string> = {
  essential: 'Esencial',
  functional: 'Funcional',
  analytical: 'Analítico',
  marketing: 'Marketing',
  legal: 'Legal',
} as const

/**
 * Consent type display names in Spanish
 * User-friendly labels for each consent type
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
} as const

/**
 * Consent category assignments
 * Maps each consent type to its category
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
} as const

/**
 * Consent status values
 */
export const CONSENT_STATUS = {
  /** Consent granted and active */
  GRANTED: 'granted',
  /** Consent withdrawn by user */
  WITHDRAWN: 'withdrawn',
  /** Consent expired (time-based) */
  EXPIRED: 'expired',
  /** Consent pending approval */
  PENDING: 'pending',
  /** Consent revoked by system */
  REVOKED: 'revoked',
} as const

/**
 * Age verification status values
 */
export const AGE_VERIFICATION_STATUS = {
  /** Age verified - user is adult */
  VERIFIED_ADULT: 'verified_adult',
  /** Age verified - user is minor */
  VERIFIED_MINOR: 'verified_minor',
  /** Age not verified */
  UNVERIFIED: 'unverified',
} as const

/**
 * Check if a consent type is essential (cannot be withdrawn)
 * @param consentType - Type of consent to check
 * @returns True if the consent is essential
 */
export function isEssentialConsent(consentType: ConsentType): boolean {
  return ESSENTIAL_CONSENTS.includes(consentType)
}

/**
 * Get the category for a consent type
 * @param consentType - Type of consent
 * @returns The category of the consent
 */
export function getConsentCategory(consentType: ConsentType): ConsentCategory {
  return CONSENT_TYPE_CATEGORIES[consentType]
}

/**
 * Get the display label for a consent type
 * @param consentType - Type of consent
 * @returns Spanish display label
 */
export function getConsentLabel(consentType: ConsentType): string {
  return CONSENT_TYPE_LABELS[consentType]
}
