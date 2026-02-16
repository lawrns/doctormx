/**
 * Consent Client-Safe Exports
 *
 * Types and constants that can be safely used in client components.
 * These don't depend on any server-side modules.
 *
 * @module consent/client
 */

// ================================================
// TYPE EXPORTS
// ================================================

export type {
  ConsentType,
  ConsentStatus,
  ConsentDeliveryMethod,
  ConsentCategory,
  AgeVerificationStatus,
  GuardianRelationship,
  ConsentVersion,
  UserConsentRecord,
  GuardianConsentRecord,
  ConsentHistoryEntry,
  ConsentRequest,
  ConsentTemplate,
  ConsentAuditEventType,
  ConsentAuditLog,
  VersionComparison,
  UserConsentSummary,
  ConsentFilter,
} from './types'

// ================================================
// CONSTANTS EXPORTS
// ================================================

export {
  LEGAL_AGE_MEXICO,
  DEFAULT_CONSENT_EXPIRATION,
  ESSENTIAL_CONSENTS,
  CONSENT_CATEGORIES,
  CONSENT_TYPE_LABELS,
  CONSENT_TYPE_CATEGORIES,
} from './constants'
