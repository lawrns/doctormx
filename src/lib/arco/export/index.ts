/**
 * ARCO Data Export Module
 *
 * Handles data export for ACCESS requests (Derecho de Acceso)
 * Provides user data in multiple formats: JSON, PDF, Text
 * Also handles data portability, anonymization, amendments, and deletion
 *
 * @module arco/export
 */

// ================================================
// CORE EXPORTS
// ================================================

export {
  getUserDataExport,
  estimateExportSize,
  sanitizeProfile,
} from './core'

// ================================================
// JSON EXPORTS
// ================================================

export {
  exportUserDataToJson,
  exportTableToJson,
  exportTablesToJson,
  parseJsonExport,
  isValidExportFormat,
  getExportStats,
} from './json'

// ================================================
// TEXT EXPORTS
// ================================================

export { exportUserDataToText } from './text'

// ================================================
// PDF EXPORTS
// ================================================

export { exportUserDataToPdf } from './pdf'

// ================================================
// PORTABILITY EXPORTS
// ================================================

export {
  exportUserDataForPortability,
  exportPortabilityJson,
  createPortabilityAttachment,
} from './portability'

// ================================================
// ANONYMIZATION EXPORTS
// ================================================

export {
  generateAnonymousId,
  generateAnonymousEmail,
  generateAnonymousName,
  createAnonymizedProfile,
  anonymizeUserProfile,
  anonymizeAppointments,
  anonymizeChatHistory,
  deletePrivacyPreferences,
  anonymizeUserData,
  isDataAnonymized,
  validateAnonymizationRequirements,
  type AnonymizationResult,
} from './anonymization'

// ================================================
// ATTACHMENTS EXPORTS
// ================================================

export {
  createDataExportAttachment,
  createMultiFormatAttachments,
  type ExportFormat,
  type AttachmentResult,
} from './attachments'

// ================================================
// DELETION EXPORTS
// ================================================

export {
  planDataDeletion,
  executeDataDeletion,
  getDeletionStatus,
  type DeletionPlan,
} from './deletion'

// ================================================
// AMENDMENTS EXPORTS
// ================================================

export {
  recordDataAmendment,
  applyDataAmendment,
  getRequestAmendments,
  areAllAmendmentsApplied,
  getPendingAmendmentsCount,
  type AmendmentRecord,
} from './amendments'
