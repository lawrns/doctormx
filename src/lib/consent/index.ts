/**
 * Patient Consent Management System
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

// ================================================
// TYPE EXPORTS
// ================================================

export * from './types'

// ================================================
// CORE CONSENT EXPORTS
// ================================================

export {
  // Core functions
  grantConsent,
  withdrawConsent,
  hasUserConsent,
  getUserConsents,
  getActiveConsents,
  getUserConsentSummary,
  updateConsent,
  expireConsent,
  generateComplianceReport,
  // Error utility
  createConsentError,
} from './core'

// ================================================
// GUARDIAN CONSENT EXPORTS
// ================================================

export {
  // Guardian consent functions
  createGuardianConsent,
  getActiveGuardianConsent,
  hasValidGuardianConsent,
  revokeGuardianConsent,
  updateGuardianConsentLimitations,
  // Age verification
  verifyAgeAndConsentRequirements,
  requiresGuardianConsent,
  getGuardianConsentsForUser,
} from './guardian'

// ================================================
// CONSENT REQUESTS EXPORTS
// ================================================

export {
  // Request management
  createConsentRequest,
  getPendingConsentRequests,
  getConsentRequestsForUser,
  getConsentRequest,
  updateConsentRequestStatus,
  markConsentRequestDelivered,
  markConsentRequestViewed,
  declineConsentRequest,
  sendConsentRequestReminder,
  expireOldConsentRequests,
  getConsentRequestStatistics,
} from './requests'

// ================================================
// HISTORY EXPORTS
// ================================================

export {
  // History tracking
  trackConsentGranted,
  trackConsentWithdrawn,
  trackConsentModified,
  trackConsentExpired,
  getConsentHistory,
  getConsentHistoryForUser,
  getConsentHistoryForUsers,
  // Audit logs (from history module)
  createAuditLog,
  getAuditLogsForUser,
  getAllAuditLogs,
  getAuditLogStatistics,
  getAuditLogsByCorrelationId,
  createCorrelationId,
  trackBatchConsentOperations,
  getConsentChangeTimeline,
  exportConsentHistory,
} from './history'

// ================================================
// VERSIONING EXPORTS
// ================================================

export {
  // Version management
  createConsentVersion,
  getLatestConsentVersion,
  getConsentVersion,
  getConsentVersionByNumber,
  getActiveConsentVersions,
  getAllConsentVersions,
  deprecateConsentVersion,
  compareConsentVersions,
  checkIfReConsentRequired,
  getConsentTypesRequiringReConsent,
  incrementConsentVersion,
  getConsentVersionHistory,
  publishConsentVersion,
  getScheduledConsentVersions,
  // Utilities
  compareVersionNumbers,
  formatVersionComparisonSummary,
  calculateConsentExpiration,
  isConsentVersionActive,
  getNextVersionNumber,
} from './versioning'

// ================================================
// AUDIT EXPORTS
// ================================================

export {
  // Audit logging
  createConsentAuditLog,
  logConsentGranted,
  logConsentWithdrawn,
  logConsentModified,
  logConsentVersionUpdated,
  logGuardianConsentAdded,
  logConsentViewed,
  logBulkConsentOperation,
  // Query and export
  getConsentAuditLogsForUser,
  exportConsentAuditLogs,
} from './audit'

// ================================================
// UTILITIES EXPORTS
// ================================================

export {
  // Age and date utilities
  calculateAge,
  calculateExpirationDate,
  isAdult,
  hasConsentExpired,
  // Client and identifier utilities  
  getClientIdentifier,
  generateConsentId,
  // Consent type utilities
  isEssentialConsent,
  getConsentCategory,
  getConsentDisplayName,
  formatConsentStatus,
} from './utils'

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

// ================================================
// CONSENT MANAGER EXPORTS (Legacy)
// ================================================

export * from './consent-manager'
