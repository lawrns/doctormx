/**
 * ARCO Rights System Type Definitions
 *
 * Implements LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)
 * Derechos ARCO: Acceso, Rectificación, Cancelación, Oposición
 */

// ================================================
// ENUM TYPES
// ================================================

/**
 * ARCO request types - Los Derechos ARCO
 * Includes GDPR Article 18: Right to Restriction of Processing (RESTRICT)
 */
export type ArcoRequestType = 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE' | 'RESTRICT'

/**
 * Human-readable labels for ARCO request types
 */
export const ARCO_REQUEST_TYPE_LABELS: Record<ArcoRequestType, string> = {
  ACCESS: 'Acceso',
  RECTIFY: 'Rectificación',
  CANCEL: 'Cancelación',
  OPPOSE: 'Oposición',
  RESTRICT: 'Restricción de Tratamiento',
}

/**
 * ARCO request status
 */
export type ArcoRequestStatus =
  | 'pending'
  | 'acknowledged'
  | 'processing'
  | 'info_required'
  | 'escalated'
  | 'completed'
  | 'denied'
  | 'cancelled'

/**
 * Human-readable labels for ARCO request statuses
 */
export const ARCO_STATUS_LABELS: Record<ArcoRequestStatus, string> = {
  pending: 'Pendiente',
  acknowledged: 'Reconocido',
  processing: 'Procesando',
  info_required: 'Información Requerida',
  escalated: 'Escalado',
  completed: 'Completado',
  denied: 'Denegado',
  cancelled: 'Cancelado',
}

/**
 * Escalation levels for ARCO requests
 */
export type EscalationLevel = 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4'

/**
 * Escalation level configuration
 */
export const ESCALATION_LEVELS: Record<
  EscalationLevel,
  { label: string; business_days: number; description: string }
> = {
  tier_1: {
    label: 'Nivel 1 - Soporte',
    business_days: 5,
    description: 'Atención por equipo de soporte al cliente',
  },
  tier_2: {
    label: 'Nivel 2 - Oficial de Privacidad',
    business_days: 10,
    description: 'Revisión por el Oficial de Protección de Datos',
  },
  tier_3: {
    label: 'Nivel 3 - Legal',
    business_days: 15,
    description: 'Revisión por el departamento legal',
  },
  tier_4: {
    label: 'Nivel 4 - Legal Externo',
    business_days: 20,
    description: 'Revisión por counsel legal externo',
  },
}

/**
 * Priority levels for ARCO requests
 */
export type ArcoPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * Communication channels
 */
export type CommunicationChannel = 'email' | 'phone' | 'portal' | 'mail' | 'sms'

/**
 * Communication direction
 */
export type CommunicationDirection = 'incoming' | 'outgoing'

/**
 * Data scope options - tables that can be affected by ARCO requests
 */
export type DataTableScope =
  | 'profiles'
  | 'appointments'
  | 'prescriptions'
  | 'soap_consultations'
  | 'chat_conversations'
  | 'chat_messages'
  | 'payments'
  | 'follow_up_schedules'
  | 'all'

/**
 * Data deletion types
 */
export type DeletionType = 'hard_delete' | 'anonymize' | 'soft_delete'

// ================================================
// DATABASE ROW TYPES
// ================================================

/**
 * ARCO Request database row
 */
export interface ArcoRequestRow {
  id: string
  user_id: string
  request_type: ArcoRequestType
  status: ArcoRequestStatus
  title: string
  description: string
  data_scope: DataTableScope[]
  specific_records: string[] | null
  justification: string | null
  submitted_via: string
  ip_address: string | null
  user_agent: string | null
  assigned_to: string | null
  escalation_level: EscalationLevel
  priority: ArcoPriority
  created_at: string
  acknowledged_at: string | null
  due_date: string
  completed_at: string | null
  response: string | null
  denial_reason: string | null
  denial_legal_basis: string | null
  updated_at: string
  last_reminder_at: string | null
  metadata: Record<string, unknown>
}

/**
 * ARCO Request History row
 */
export interface ArcoRequestHistoryRow {
  id: string
  request_id: string
  old_status: ArcoRequestStatus | null
  new_status: ArcoRequestStatus
  changed_by: string
  change_reason: string | null
  notes: string | null
  created_at: string
  metadata: Record<string, unknown>
}

/**
 * ARCO Attachment row
 */
export interface ArcoAttachmentRow {
  id: string
  request_id: string
  filename: string
  file_url: string
  file_size_bytes: number | null
  mime_type: string | null
  file_hash: string | null
  uploaded_by: string | null
  upload_purpose: string | null
  created_at: string
}

/**
 * ARCO Communication row
 */
export interface ArcoCommunicationRow {
  id: string
  request_id: string
  direction: CommunicationDirection
  channel: CommunicationChannel
  subject: string | null
  content: string
  sent_by: string | null
  recipient_contact: string | null
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  attachments: string[] | null
  created_at: string
}

/**
 * Data Amendment row
 */
export interface DataAmendmentRow {
  id: string
  arco_request_id: string | null
  table_name: string
  record_id: string
  field_name: string
  old_value: string | null
  new_value: string | null
  amendment_reason: string | null
  requested_by: string
  approved_by: string | null
  approved_at: string | null
  created_at: string
  applied_at: string | null
  metadata: Record<string, unknown>
}

/**
 * Data Deletion row
 */
export interface DataDeletionRow {
  id: string
  arco_request_id: string | null
  table_name: string
  record_id: string | null
  deletion_type: DeletionType
  reason: string
  legal_basis: string | null
  retention_period: string | null
  data_snapshot: Record<string, unknown> | null
  requested_by: string
  executed_by: string | null
  executed_at: string | null
  created_at: string
}

/**
 * Privacy Preferences row
 */
export interface PrivacyPreferencesRow {
  id: string
  user_id: string
  marketing_emails: boolean
  marketing_sms: boolean
  marketing_push: boolean
  analytics_consent: boolean
  personalization_consent: boolean
  research_consent: boolean
  share_with_insurance: boolean
  share_with_pharmacies: boolean
  share_with_labs: boolean
  ai_training_consent: boolean
  voice_recording_consent: boolean
  updated_at: string
  consent_version: string
  last_consent_update: string
}

// ================================================
// INPUT/REQUEST TYPES
// ================================================

/**
 * Input for creating a new ARCO request
 */
export interface CreateArcoRequestInput {
  request_type: ArcoRequestType
  title: string
  description: string
  data_scope: DataTableScope[]
  specific_records?: string[]
  justification?: string
  submitted_via?: string
  ip_address?: string
  user_agent?: string
}

/**
 * Input for updating an ARCO request (admin only)
 */
export interface UpdateArcoRequestInput {
  status?: ArcoRequestStatus
  assigned_to?: string
  escalation_level?: EscalationLevel
  priority?: ArcoPriority
  response?: string
  denial_reason?: string
  denial_legal_basis?: string
}

/**
 * Input for uploading an attachment
 */
export interface UploadAttachmentInput {
  request_id: string
  filename: string
  file_url: string
  file_size_bytes?: number
  mime_type?: string
  upload_purpose?: string
}

/**
 * Input for creating a communication record
 */
export interface CreateCommunicationInput {
  request_id: string
  direction: CommunicationDirection
  channel: CommunicationChannel
  subject?: string
  content: string
  recipient_contact?: string
  attachments?: string[]
}

/**
 * Input for updating privacy preferences
 */
export interface UpdatePrivacyPreferencesInput {
  marketing_emails?: boolean
  marketing_sms?: boolean
  marketing_push?: boolean
  analytics_consent?: boolean
  personalization_consent?: boolean
  research_consent?: boolean
  share_with_insurance?: boolean
  share_with_pharmacies?: boolean
  share_with_labs?: boolean
  ai_training_consent?: boolean
  voice_recording_consent?: boolean
}

// ================================================
// RESPONSE TYPES
// ================================================

/**
 * ARCO Request with extended information
 */
export interface ArcoRequestWithDetails extends ArcoRequestRow {
  user_name?: string
  user_email?: string
  user_phone?: string
  assigned_to_name?: string
  business_days_elapsed?: number
  business_days_remaining?: number
  is_overdue?: boolean
  days_until_due?: number
  history?: ArcoRequestHistoryRow[]
  attachments?: ArcoAttachmentRow[]
  communications?: ArcoCommunicationRow[]
}

/**
 * Data export package (for ACCESS requests)
 */
export interface DataExportPackage {
  user_profile: Record<string, unknown>
  appointments: Array<Record<string, unknown>>
  consultations: Array<Record<string, unknown>>
  prescriptions: Array<Record<string, unknown>>
  payments: Array<Record<string, unknown>>
  chat_history: Array<Record<string, unknown>>
  privacy_preferences: PrivacyPreferencesRow | null
  export_metadata: {
    exported_at: string
    export_format: string
    total_records: number
    data_scope: DataTableScope[]
  }
}

/**
 * Portability data format - standardized machine-readable format
 * for easy data transfer between services (GDPR Article 20, CCPA, LFPDPPP)
 */
export interface PortabilityDataExport {
  format_version: string
  export_date: string
  exporting_service: {
    name: string
    contact_email: string
    privacy_policy_url: string
  }
  user: {
    id: string
    email: string | null
    full_name: string | null
    phone: string | null
    account_created: string
    account_modified: string
  }
  data_categories: {
    appointments: Array<{
      id: string
      start_time: string
      end_time: string | null
      status: string
      doctor_name: string | null
      specialty: string | null
    }>
    medical_records: Array<{
      id: string
      type: string
      date: string
      chief_complaint: string | null
      diagnosis: string | null
      treatment: string | null
    }>
    prescriptions: Array<{
      id: string
      date: string
      medications: string | null
      instructions: string | null
    }>
    payments: Array<{
      id: string
      date: string
      amount: number
      currency: string
      status: string
    }>
  }
  metadata: {
    total_records: number
    data_types: string[]
    retention_policy_url: string
  }
}

/**
 * SLA compliance metrics
 */
export interface SlaComplianceMetrics {
  period_start: string
  period_end: string
  total_requests: number
  completed_requests: number
  overdue_requests: number
  completion_rate: number
  sla_compliance_rate: number
  average_response_time_days: number
  by_type: Record<ArcoRequestType, {
    total: number
    completed: number
    overdue: number
    avg_completion_time: number
  }>
}

/**
 * Escalation criteria
 */
export interface EscalationCriteria {
  current_level: EscalationLevel
  business_days_elapsed: number
  is_overdue: boolean
  requires_escalation: boolean
  next_level?: EscalationLevel
  reason: string
}

// ================================================
// ERROR TYPES
// ================================================

/**
 * Custom error for ARCO-related errors
 */
export class ArcoError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ArcoError'
  }
}

/**
 * Error codes for ARCO operations
 */
export enum ArcoErrorCode {
  REQUEST_NOT_FOUND = 'REQUEST_NOT_FOUND',
  INVALID_REQUEST_TYPE = 'INVALID_REQUEST_TYPE',
  INVALID_STATUS = 'INVALID_STATUS',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SLA_EXCEEDED = 'SLA_EXCEEDED',
  MISSING_REQUIRED_INFO = 'MISSING_REQUIRED_INFO',
  CANNOT_DELETE_REQUIRED_DATA = 'CANNOT_DELETE_REQUIRED_DATA',
  LEGAL_HOLD = 'LEGAL_HOLD',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
  INVALID_DATA_SCOPE = 'INVALID_DATA_SCOPE',
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * Filter options for querying ARCO requests
 */
export interface ArcoRequestFilter {
  user_id?: string
  request_type?: ArcoRequestType
  status?: ArcoRequestStatus
  escalation_level?: EscalationLevel
  priority?: ArcoPriority
  assigned_to?: string
  date_from?: string
  date_to?: string
  include_overdue?: boolean
  include_pending?: boolean
}

/**
 * Sort options for ARCO requests
 */
export type ArcoRequestSort =
  | 'created_at'
  | 'due_date'
  | 'status'
  | 'priority'
  | 'request_type'

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number
  per_page: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}
