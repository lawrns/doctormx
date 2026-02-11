/**
 * Patient Consent Management System - Type Definitions
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
 */

// ================================================
// ENUM TYPES
// ================================================

/**
 * Types of consent in the system
 */
export type ConsentType =
  | 'medical_treatment' // Consent for medical treatment
  | 'data_processing' // Consent for processing personal data
  | 'telemedicine' // Consent for telemedicine services
  | 'recording' // Consent for recording consultations
  | 'ai_analysis' // Consent for AI consultation analysis
  | 'data_sharing' // Consent for sharing with third parties
  | 'research' // Consent for research purposes
  | 'marketing' // Consent for marketing communications
  | 'emergency_contact' // Consent to contact emergency services
  | 'prescription_forwarding' // Consent to forward prescriptions to pharmacies

/**
 * Consent status
 */
export type ConsentStatus = 'granted' | 'withdrawn' | 'expired' | 'revoked'

/**
 * Consent delivery methods
 */
export type ConsentDeliveryMethod =
  | 'electronic_signature'
  | 'click_wrap'
  | 'browse_wrap'
  | 'paper_form'
  | 'verbal'
  | 'implied'

/**
 * Consent category for grouping
 */
export type ConsentCategory =
  | 'essential' // Required for service delivery
  | 'functional' // Required for specific functionality
  | 'analytical' // For analytics and improvement
  | 'marketing' // For marketing purposes
  | 'legal' // Required by law

/**
 * Age verification status
 */
export type AgeVerificationStatus = 'verified_adult' | 'verified_minor' | 'unverified' | 'guardian_required'

/**
 * Guardian relationship type
 */
export type GuardianRelationship =
  | 'parent'
  | 'legal_guardian'
  | 'foster_parent'
  | 'grandparent'
  | 'other'

// ================================================
// CONSENT VERSIONING
// ================================================

/**
 * Consent version information
 */
export interface ConsentVersion {
  id: string
  version: string // Semantic version (e.g., "1.0.0")
  consent_type: ConsentType
  title: string
  description: string
  legal_text: string
  privacy_policy_reference: string
  terms_of_service_reference: string
  effective_date: string
  deprecated_date: string | null
  required_for_new_users: boolean
  requires_re_consent: boolean // If true, existing users must re-consent
  category: ConsentCategory
  data_retention_period: string | null // e.g., "5 years", "until withdrawal"
  third_party_sharing: string[] | null
  age_restriction: {
    min_age?: number
    requires_guardian?: boolean
    guardian_consent_required?: boolean
  }
  created_at: string
  created_by: string
  metadata: Record<string, unknown>
}

/**
 * Version comparison result
 */
export interface VersionComparison {
  current_version: string
  new_version: string
  has_major_changes: boolean
  has_minor_changes: boolean
  changes: ConsentChange[]
  requires_re_consent: boolean
}

/**
 * Changes between consent versions
 */
export interface ConsentChange {
  field: string
  old_value: string | null
  new_value: string | null
  change_type: 'addition' | 'modification' | 'removal'
  significance: 'major' | 'minor'
}

// ================================================
// CONSENT RECORDS
// ================================================

/**
 * User consent record - tracks a user's consent for a specific type
 */
export interface UserConsentRecord {
  id: string
  user_id: string
  consent_type: ConsentType
  consent_version_id: string
  status: ConsentStatus

  // Consent details
  granted_at: string
  granted_from: string // IP address, device ID, etc.
  delivery_method: ConsentDeliveryMethod

  // Age verification
  age_verification: AgeVerificationStatus
  date_of_birth: string | null

  // Guardian information (for minors)
  guardian_consent_record_id: string | null
  guardian_relationship: GuardianRelationship | null
  guardian_name: string | null
  guardian_contact: string | null

  // Withdrawal/revocation
  withdrawn_at: string | null
  withdrawn_by: string | null // 'user' | 'guardian' | 'admin'
  withdrawal_reason: string | null

  // Expiration
  expires_at: string | null

  // Audit
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
}

/**
 * Guardian consent record - for minors or incapacitated adults
 */
export interface GuardianConsentRecord {
  id: string
  user_id: string // The minor/incapacitated person
  guardian_user_id: string | null // If guardian has their own account
  guardian_name: string
  guardian_relationship: GuardianRelationship
  guardian_contact: string
  guardian_identification: string | null // Official ID verification

  // Verification
  verification_method: string // 'in_person', 'video_call', 'document_upload'
  verified_by: string | null // Staff member who verified
  verified_at: string | null
  verification_documents: string[] // URLs to uploaded documents

  // Consent scope
  consent_scope: ConsentType[] // What consents the guardian can grant
  limitations: string[] | null // Any limitations on guardian's authority

  // Status
  status: 'active' | 'inactive' | 'revoked' | 'expired'
  effective_date: string
  expiration_date: string | null

  // Audit
  created_at: string
  updated_at: string
  created_by: string
  metadata: Record<string, unknown>
}

// ================================================
// CONSENT HISTORY
// ================================================

/**
 * Consent history entry - tracks all changes to consent records
 */
export interface ConsentHistoryEntry {
  id: string
  consent_record_id: string
  user_id: string

  // Change details
  action: 'granted' | 'withdrawn' | 'modified' | 'expired' | 'revoked'
  old_status: ConsentStatus | null
  new_status: ConsentStatus

  // Version tracking
  old_consent_version_id: string | null
  new_consent_version_id: string

  // Context
  changed_by: string // User ID or system
  changed_by_role: 'user' | 'guardian' | 'admin' | 'system'
  change_reason: string | null

  // Technical details
  ip_address: string | null
  user_agent: string | null
  session_id: string | null

  // Snapshot
  previous_state: Record<string, unknown> | null
  new_state: Record<string, unknown>

  created_at: string
}

// ================================================
// CONSENT REQUESTS
// ================================================

/**
 * Pending consent request - when user needs to provide consent
 */
export interface ConsentRequest {
  id: string
  user_id: string
  consent_type: ConsentType
  required_version_id: string

  // Request details
  request_reason: 'new_consent' | 'version_update' | 're_consent_required' | 'age_verification'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  requested_for: ConsentType[]

  // Delivery
  delivery_method: 'in_app' | 'email' | 'sms' | 'push_notification'
  sent_at: string | null
  reminder_count: number
  last_reminder_at: string | null

  // Status
  status: 'pending' | 'delivered' | 'viewed' | 'granted' | 'declined' | 'expired'
  responded_at: string | null
  response: Record<string, unknown> | null

  // Expiration
  expires_at: string

  // Audit
  created_at: string
  created_by: string
  metadata: Record<string, unknown>
}

// ================================================
// CONSENT TEMPLATES
// ================================================

/**
 * Consent template - reusable consent text with placeholders
 */
export interface ConsentTemplate {
  id: string
  consent_type: ConsentType
  template_key: string // Unique key for the template

  // Content
  title_template: string // May contain placeholders like {{patient_name}}
  description_template: string
  legal_text_template: string

  // Placeholders defined in templates
  required_placeholders: string[] // e.g., ['patient_name', 'date', 'provider']

  // Localization
  language: string
  region: string | null // e.g., 'MX' for Mexico-specific text

  // Metadata
  is_active: boolean
  effective_date: string
  deprecated_date: string | null

  // Audit
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
}

// ================================================
// CONSENT AUDIT
// ================================================

/**
 * Consent audit log entry - comprehensive audit trail
 */
export interface ConsentAuditLog {
  id: string
  event_type: ConsentAuditEventType
  user_id: string

  // Event details
  consent_type: ConsentType
  consent_record_id: string | null
  consent_request_id: string | null

  // Action details
  action: string
  action_result: 'success' | 'failure' | 'partial'
  error_message: string | null

  // Actor information
  actor_user_id: string | null
  actor_role: string
  actor_ip_address: string | null
  actor_user_agent: string | null

  // Context
  session_id: string | null
  request_id: string | null
  correlation_id: string | null

  // Data snapshot
  before_state: Record<string, unknown> | null
  after_state: Record<string, unknown> | null
  data_changes: Record<string, { old: unknown; new: unknown }> | null

  // Timestamps
  occurred_at: string
  created_at: string
}

/**
 * Types of audit events
 */
export type ConsentAuditEventType =
  | 'consent_granted'
  | 'consent_withdrawn'
  | 'consent_expired'
  | 'consent_revoked'
  | 'consent_modified'
  | 'consent_requested'
  | 'consent_viewed'
  | 'consent_declined'
  | 'version_updated'
  | 'guardian_consent_added'
  | 'guardian_consent_removed'
  | 'bulk_consent_operation'
  | 'consent_export'
  | 'consent_import'

// ================================================
// INPUT TYPES
// ================================================

/**
 * Input for granting consent
 */
export interface GrantConsentInput {
  user_id: string
  consent_type: ConsentType
  consent_version_id: string
  delivery_method: ConsentDeliveryMethod
  date_of_birth?: string
  guardian_consent_record_id?: string
  metadata?: Record<string, unknown>
}

/**
 * Input for withdrawing consent
 */
export interface WithdrawConsentInput {
  consent_record_id: string
  withdrawal_reason: string
  withdrawn_by?: 'user' | 'guardian' | 'admin'
}

/**
 * Input for creating a consent version
 */
export interface CreateConsentVersionInput {
  consent_type: ConsentType
  version: string
  title: string
  description: string
  legal_text: string
  category: ConsentCategory
  effective_date: string
  privacy_policy_reference?: string
  terms_of_service_reference?: string
  required_for_new_users?: boolean
  requires_re_consent?: boolean
  data_retention_period?: string
  third_party_sharing?: string[]
  age_restriction?: {
    min_age?: number
    requires_guardian?: boolean
    guardian_consent_required?: boolean
  }
}

/**
 * Input for creating guardian consent
 */
export interface CreateGuardianConsentInput {
  user_id: string
  guardian_user_id?: string
  guardian_name: string
  guardian_relationship: GuardianRelationship
  guardian_contact: string
  guardian_identification?: string
  verification_method: string
  consent_scope: ConsentType[]
  limitations?: string[]
  effective_date?: string
  expiration_date?: string
}

/**
 * Input for updating consent (status changes)
 */
export interface UpdateConsentInput {
  consent_record_id: string
  status?: ConsentStatus
  expires_at?: string
  metadata?: Record<string, unknown>
}

// ================================================
// RESPONSE TYPES
// ================================================

/**
 * User consent summary - for dashboard display
 */
export interface UserConsentSummary {
  user_id: string
  total_consents: number
  active_consents: number
  withdrawn_consents: number
  expired_consents: number
  pending_consents: number
  consents_by_type: Record<ConsentType, number>
  consents_by_category: Record<ConsentCategory, number>
  requires_attention: boolean
  last_updated: string
}

/**
 * Consent compliance report
 */
export interface ConsentComplianceReport {
  report_period: {
    start: string
    end: string
  }
  user_statistics: {
    total_users: number
    users_with_all_consents: number
    users_with_partial_consents: number
    users_with_expired_consents: number
    users_with_withdrawn_consents: number
  }
  consent_type_breakdown: Array<{
    consent_type: ConsentType
    total_granted: number
    total_withdrawn: number
    total_expired: number
    current_version: string
    compliance_rate: number
  }>
  version_statistics: {
    active_versions: number
    deprecated_versions: number
    pending_migrations: number
  }
  guardian_statistics: {
    total_guardian_consents: number
    active_guardian_consents: number
    expired_guardian_consents: number
  }
  audit_summary: {
    total_events: number
    events_by_type: Record<string, number>
    most_common_actions: Array<{ action: string; count: number }>
  }
  generated_at: string
}

/**
 * Consent comparison result for display
 */
export interface ConsentComparisonDisplay {
  consent_type: ConsentType
  current_version: {
    version: string
    title: string
    granted_at: string
  }
  latest_version: {
    version: string
    title: string
    effective_date: string
  }
  changes: Array<{
    section: string
    description: string
    significance: 'major' | 'minor'
  }>
  requires_action: boolean
  action_deadline: string | null
}

// ================================================
// ERROR TYPES
// ================================================

/**
 * Custom error for consent-related operations
 */
export class ConsentError extends Error {
  constructor(
    message: string,
    public code: ConsentErrorCode,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ConsentError'
  }
}

/**
 * Error codes for consent operations
 */
export enum ConsentErrorCode {
  CONSENT_NOT_FOUND = 'CONSENT_NOT_FOUND',
  CONSENT_ALREADY_GRANTED = 'CONSENT_ALREADY_GRANTED',
  CONSENT_EXPIRED = 'CONSENT_EXPIRED',
  CONSENT_WITHDRAWN = 'CONSENT_WITHDRAWN',
  VERSION_NOT_FOUND = 'VERSION_NOT_FOUND',
  INVALID_VERSION = 'INVALID_VERSION',
  REQUIRES_GUARDIAN_CONSENT = 'REQUIRES_GUARDIAN_CONSENT',
  AGE_VERIFICATION_REQUIRED = 'AGE_VERIFICATION_REQUIRED',
  GUARDIAN_NOT_FOUND = 'GUARDIAN_NOT_FOUND',
  GUARDIAN_CONSENT_EXPIRED = 'GUARDIAN_CONSENT_EXPIRED',
  CANNOT_WITHDRAW_ESSENTIAL = 'CANNOT_WITHDRAW_ESSENTIAL',
  CANNOT_MODIFY_WITHDRAWN = 'CANNOT_MODIFY_WITHDRAWN',
  INVALID_CONSENT_TYPE = 'INVALID_CONSENT_TYPE',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * Consent filter options
 */
export interface ConsentFilter {
  user_id?: string
  consent_type?: ConsentType
  status?: ConsentStatus
  category?: ConsentCategory
  date_from?: string
  date_to?: string
  include_expired?: boolean
  include_withdrawn?: boolean
  version_id?: string
}

/**
 * Consent sort options
 */
export type ConsentSortOption =
  | 'granted_at'
  | 'consent_type'
  | 'status'
  | 'expires_at'
  | 'updated_at'

/**
 * Bulk consent operation
 */
export interface BulkConsentOperation {
  operation: 'grant' | 'withdraw' | 'expire' | 'update_version'
  user_ids: string[]
  consent_types: ConsentType[]
  reason: string
  performed_by: string
  scheduled_for?: string
}

/**
 * Bulk operation result
 */
export interface BulkConsentOperationResult {
  operation_id: string
  total_users: number
  successful: number
  failed: number
  skipped: number
  errors: Array<{ user_id: string; error: string }>
  completed_at: string
}

