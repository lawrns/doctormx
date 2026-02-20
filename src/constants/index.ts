/**
 * Single Source of Truth (SSOT) - Constants Barrel Export
 * Doctor.mx Platform Constants
 *
 * This module provides a centralized export of all constants used
 * throughout the Doctor.mx platform. Import from here to ensure
 * consistency and enable IDE autocomplete.
 *
 * @example
 * ```typescript
 * // Import specific constants
 * import { PRICING, TIME, AI } from '@/constants'
 *
 * // Import with namespace
 * import * as Constants from '@/constants'
 * const price = Constants.PRICING.STARTER_PRICE_MXN
 * ```
 *
 * @module constants
 * @version 1.0.0
 */

// ============================================================================
// CORE CONSTANTS (from src/lib/constants/)
// ============================================================================

/**
 * AI-related constants
 * - Temperature settings, max tokens, feature flags
 * - Provider configuration and costs
 * - Emergency symptom patterns
 * - Fever and pain thresholds
 */
export { AI } from '@/lib/constants/ai'
export type { AIKey } from '@/lib/constants/ai'

/**
 * HTTP status codes
 * Standard HTTP response status codes for API consistency
 */
export { HTTP_STATUS } from '@/lib/constants/http'
export type { HttpStatusKey } from '@/lib/constants/http'

/**
 * System limits and sizes
 * - File size limits
 * - Text length limits
 * - Rate limiting and pagination
 * - Performance thresholds
 */
export { LIMITS } from '@/lib/constants/limits'
export type { LimitsKey } from '@/lib/constants/limits'

/**
 * Pricing constants
 * - Subscription tier prices
 * - Individual feature prices
 * - Bundle quantities and savings
 */
export { PRICING } from '@/lib/constants/pricing'
export type { PricingKey } from '@/lib/constants/pricing'

/**
 * Time-related constants
 * - Video call durations
 * - Time unit conversions
 * - Cache TTL values
 * - Rate limiting windows
 */
export { TIME } from '@/lib/constants/time'
export type { TimeKey } from '@/lib/constants/time'

/**
 * Medical terminology constants
 * - Spanish medical terms with explanations
 * - UI text in Spanish
 * - Symptom categories
 * - Prescription instructions
 * - Triage levels
 */
export {
  MEDICAL_TERMS,
  SPANISH_UI,
  SYMPTOM_CATEGORIES,
  PRESCRIPTION_INSTRUCTIONS,
  TRIAGE_LEVELS,
  getMedicalTerm,
  getPatientExplanation,
  toSpanish,
} from '@/lib/constants/medical-terminology'

/**
 * Numeric constants
 * - Percentages and conversion factors
 * - Time conversion multipliers
 * - File size conversions
 * - Rate limiting defaults
 */
export { NUMERIC } from '@/lib/constants/numeric'
export type { NumericKey } from '@/lib/constants/numeric'

// ============================================================================
// APPOINTMENT CONSTANTS
// ============================================================================

/**
 * Appointment configuration
 * - Default durations and intervals
 * - Advance booking limits
 * - Medical specialties
 */
export {
  APPOINTMENT_CONFIG,
  SPECIALTIES,
} from './appointments'
export type {
  SpecialtySlug,
  SpecialtyName,
} from './appointments'

// ============================================================================
// PAYMENT CONSTANTS
// ============================================================================

/**
 * Payment configuration
 * - Currency and price limits
 * - Utility functions for price conversion
 */
export {
  PAYMENT_CONFIG,
  centsToDecimal,
  decimalToCents,
  formatPrice,
} from './payments'
export type { CurrencyCode } from './payments'

// ============================================================================
// VIDEO CONSTANTS
// ============================================================================

/**
 * Video consultation configuration
 * - Provider settings (Jitsi/Daily)
 * - Quality presets
 * - Session limits
 */
export {
  VIDEO_CONFIG,
  VIDEO_QUALITY,
  VIDEO_LIMITS,
} from './video'
export type { VideoProvider } from './video'

// ============================================================================
// STATUS CONSTANTS
// ============================================================================

/**
 * Status values for all entities
 * - Appointment statuses
 * - Doctor verification statuses
 * - Payment statuses
 * - User account statuses
 */
export {
  APPOINTMENT_STATUS,
  DOCTOR_STATUS,
  PAYMENT_STATUS,
  USER_STATUS,
  STATUS,
} from './status'
export type {
  AppointmentStatus,
  DoctorStatus,
  PaymentStatus,
  UserStatus,
} from './status'

// ============================================================================
// DATABASE CONSTANTS
// ============================================================================

/**
 * Database table names
 * - All Supabase table names
 * - Helper functions for table categorization
 */
export {
  TABLES,
  USER_DATA_TABLES,
  ARCO_TABLES,
  isUserDataTable,
  isArcoTable,
} from './database'
export type { TableName } from './database'

// ============================================================================
// CONSENT CONSTANTS
// ============================================================================

/**
 * Patient consent constants
 * - Legal age definitions
 * - Essential consents
 * - Consent categories and labels
 * - Helper functions
 */
export {
  LEGAL_AGE_MEXICO,
  DEFAULT_CONSENT_EXPIRATION,
  ESSENTIAL_CONSENTS,
  CONSENT_CATEGORIES,
  CONSENT_TYPE_LABELS,
  CONSENT_TYPE_CATEGORIES,
  CONSENT_STATUS,
  AGE_VERIFICATION_STATUS,
  isEssentialConsent,
  getConsentCategory,
  getConsentLabel,
} from './consent'

// ============================================================================
// ARCO CONSTANTS
// ============================================================================

/**
 * ARCO rights constants (LFPDPPP compliance)
 * - SLA definitions
 * - Request types and statuses
 * - Escalation configuration
 * - Helper functions
 */
export {
  ARCO_SLA_BUSINESS_DAYS,
  ARCO_PRIORITIES,
  ARCO_TYPE_DESCRIPTIONS,
  ARCO_REQUEST_STATUS,
  DATA_SCOPE_DESCRIPTIONS,
  SLA_WARNING_THRESHOLD_DAYS,
  SLA_CRITICAL_THRESHOLD_DAYS,
  SLA_THRESHOLDS,
  ESCALATION_CONFIG,
  requiresDataExport,
  allowsUserCorrections,
  getSlaRiskLevel,
} from './arco'
export type {
  ArcoPriority,
  ArcoRequestStatus,
} from './arco'

// ============================================================================
// ERROR CONSTANTS
// ============================================================================

/**
 * Error codes and messages
 * - Standardized error codes by category
 * - Patient-friendly (Spanish) messages
 * - Developer-friendly (English) messages
 * - Helper functions
 */
export {
  ERROR_CODES,
  ERROR_CATEGORIES,
  PATIENT_ERROR_MESSAGES,
  DEVELOPER_ERROR_MESSAGES,
  EMERGENCY_ERROR_CODES,
  isEmergencyErrorCode,
  getErrorCategory,
} from './errors'
export type { ErrorCode } from './errors'

// ============================================================================
// CACHE & RATE LIMIT CONSTANTS (re-exported from lib)
// ============================================================================

/**
 * Cache TTL constants
 * Time-to-live values for different cache categories
 */
export {
  TTL_MINIMAL,
  TTL_SHORT,
  TTL_MEDIUM,
  TTL_LONG,
  TTL_EXTENDED,
  TTL_DOCTOR_PROFILE,
  TTL_DOCTOR_LIST,
  TTL_SPECIALTIES_LIST,
  TTL_APPOINTMENT_AVAILABILITY,
  TTL_PREMIUM_STATUS,
  TTL_USER_SESSION,
  TTL_RATE_LIMIT,
  TTL_CACHE_TAG,
  TTL_AI_RESPONSE,
  TTL_TRIAGE_RESULT,
  TTL_PRESCRIPTION,
  TTL_REVIEW,
  TTL_ANALYTICS,
  TTL_SEARCH_RESULTS,
  TTL_LOCATION_DATA,
  TTL_MAP,
  getTtl,
  getTtlDescription,
  ttlToMs,
  ttlToMinutes,
  ttlToHours,
  minutesToTtl,
  hoursToTtl,
  daysToTtl,
} from '@/lib/cache/ttl'
export type { TtlKey } from '@/lib/cache/ttl'

/**
 * Rate limit configuration
 * Tiers and limits for different endpoint categories
 */
export {
  RATE_LIMIT_TIERS,
  getRateLimitTier,
  getRateLimitTierId,
} from '@/lib/rate-limit/config'
export type { RateLimitTier } from '@/lib/rate-limit/config'
