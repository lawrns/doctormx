/**
 * Shared Audit Log Types
 *
 * Standardized audit log types and interfaces used across all systems:
 * - Digital Signatures
 * - ARCO Rights
 * - Consent Management
 * - Security Events
 *
 * This ensures consistency and enables unified audit reporting.
 */

// ================================================
// AUDIT EVENT TYPES (Unified)
// ================================================

/**
 * Unified audit event categories
 */
export enum AuditCategory {
  /** Authentication and authorization events */
  AUTH = 'auth',

  /** Data access and retrieval */
  DATA_ACCESS = 'data_access',

  /** Data creation and modification */
  DATA_MODIFICATION = 'data_modification',

  /** Data deletion and export */
  DATA_DELETION = 'data_deletion',

  /** Digital signature operations */
  SIGNATURE = 'signature',

  /** Certificate operations */
  CERTIFICATE = 'certificate',

  /** Consent management */
  CONSENT = 'consent',

  /** ARCO rights requests */
  ARCO = 'arco',

  /** Privacy and security events */
  SECURITY = 'security',

  /** System and configuration changes */
  SYSTEM = 'system',

  /** Compliance checks */
  COMPLIANCE = 'compliance',
}

/**
 * Detailed audit event types
 */
export enum AuditEventType {
  // Authentication events
  AUTH_LOGIN = 'auth.login',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_LOGIN_FAILED = 'auth.login_failed',
  AUTH_PASSWORD_CHANGE = 'auth.password_change',
  AUTH_PASSWORD_RESET = 'auth.password_reset',
  AUTH_SESSION_CREATED = 'auth.session_created',
  AUTH_SESSION_DESTROYED = 'auth.session_destroyed',

  // Data access events
  DATA_ACCESS_VIEW = 'data_access.view',
  DATA_ACCESS_EXPORT = 'data_access.export',
  DATA_ACCESS_DOWNLOAD = 'data_access.download',
  DATA_ACCESS_SEARCH = 'data_access.search',

  // Data modification events
  DATA_CREATE = 'data.create',
  DATA_UPDATE = 'data.update',
  DATA_AMEND = 'data.amend',
  DATA_IMPORT = 'data.import',

  // Data deletion events
  DATA_DELETE = 'data.delete',
  DATA_DELETE_HARD = 'data.delete_hard',
  DATA_DELETE_SOFT = 'data.delete_soft',
  DATA_ANONYMIZE = 'data.anonymize',

  // Signature events
  SIGNATURE_CREATE = 'signature.create',
  SIGNATURE_VERIFY = 'signature.verify',
  SIGNATURE_VALIDATE = 'signature.validate',
  SIGNATURE_REVOKED = 'signature.revoked',

  // Certificate events
  CERTIFICATE_UPLOAD = 'certificate.upload',
  CERTIFICATE_VALIDATE = 'certificate.validate',
  CERTIFICATE_EXPIRE = 'certificate.expire',
  CERTIFICATE_REVOKE = 'certificate.revoke',

  // Consent events
  CONSENT_GRANTED = 'consent.granted',
  CONSENT_WITHDRAWN = 'consent.withdrawn',
  CONSENT_UPDATED = 'consent.updated',
  CONSENT_VIEWED = 'consent.viewed',

  // ARCO events
  ARCO_REQUEST_CREATED = 'arco.request_created',
  ARCO_REQUEST_ACKNOWLEDGED = 'arco.request_acknowledged',
  ARCO_REQUEST_PROCESSING = 'arco.request_processing',
  ARCO_REQUEST_COMPLETED = 'arco.request_completed',
  ARCO_REQUEST_DENIED = 'arco.request_denied',
  ARCO_REQUEST_ESCALATED = 'arco.request_escalated',

  // Security events
  SECURITY_SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  SECURITY_MALICIOUS_ATTEMPT = 'security.malicious_attempt',
  SECURITY_RATE_LIMIT_EXCEEDED = 'security.rate_limit_exceeded',
  SECURITY_UNAUTHORIZED_ACCESS = 'security.unauthorized_access',
  SECURITY_PRIVILEGE_ESCALATION = 'security.privilege_escalation',

  // Compliance events
  COMPLIANCE_CHECK = 'compliance.check',
  COMPLIANCE_PASS = 'compliance.pass',
  COMPLIANCE_FAIL = 'compliance.fail',
  COMPLIANCE_WARNING = 'compliance.warning',

  // System events
  SYSTEM_CONFIG_CHANGE = 'system.config_change',
  SYSTEM_ERROR = 'system.error',
  SYSTEM_WARNING = 'system.warning',
  SYSTEM_BACKUP = 'system.backup',
  SYSTEM_MAINTENANCE = 'system.maintenance',
}

// ================================================
// SHARED AUDIT INTERFACES
// ================================================

/**
 * Base audit log entry - used by all systems
 */
export interface BaseAuditLog {
  /** Unique identifier */
  id: string

  /** Event category */
  category: AuditCategory

  /** Event type */
  event_type: AuditEventType

  /** When the event occurred */
  occurred_at: Date

  /** Who triggered the event */
  actor: AuditActor

  /** What was affected */
  resource: AuditResource

  /** Event outcome */
  outcome: AuditOutcome

  /** IP address of actor */
  ip_address?: string

  /** User agent of actor */
  user_agent?: string

  /** Session ID */
  session_id?: string

  /** Request ID for tracing */
  request_id?: string

  /** Additional event-specific data */
  metadata?: Record<string, unknown>

  /** Created at timestamp */
  created_at: Date
}

/**
 * Actor information - who performed the action
 */
export interface AuditActor {
  /** User ID (null for system) */
  user_id: string | null

  /** User role */
  role: string | null

  /** User name (for display) */
  user_name: string | null

  /** Actor type */
  type: 'user' | 'admin' | 'system' | 'api' | 'webhook'
}

/**
 * Resource information - what was affected
 */
export interface AuditResource {
  /** Resource type (table, entity, etc.) */
  type: string

  /** Resource ID */
  id: string | null

  /** Resource name/description */
  name: string | null

  /** Parent resource (if applicable) */
  parent?: {
    type: string
    id: string | null
  }
}

/**
 * Event outcome
 */
export interface AuditOutcome {
  /** Success or failure */
  status: 'success' | 'failure' | 'partial'

  /** HTTP status code (if applicable) */
  status_code?: number

  /** Error message (if failed) */
  error_message?: string

  /** Error code (if applicable) */
  error_code?: string

  /** Additional details */
  details?: Record<string, unknown>
}

// ================================================
// AUDIT LOG QUERY OPTIONS
// ================================================

/**
 * Audit log query filters
 */
export interface AuditLogQuery {
  /** Filter by category */
  category?: AuditCategory

  /** Filter by event type */
  event_type?: AuditEventType

  /** Filter by user */
  user_id?: string

  /** Filter by resource type */
  resource_type?: string

  /** Filter by resource ID */
  resource_id?: string

  /** Filter by date range */
  date_from?: Date
  date_to?: Date

  /** Filter by outcome status */
  outcome_status?: 'success' | 'failure' | 'partial'

  /** Pagination */
  offset?: number
  limit?: number

  /** Sort order */
  order_by?: 'occurred_at' | 'created_at'
  order_direction?: 'ASC' | 'DESC'
}

/**
 * Paginated audit log results
 */
export interface AuditLogResults {
  /** Total matching records */
  total: number

  /** Audit log entries */
  logs: BaseAuditLog[]

  /** Pagination info */
  pagination: {
    offset: number
    limit: number
    has_more: boolean
  }
}

// ================================================
// AUDIT LOG EXPORT FORMATS
// ================================================

/**
 * Audit log export format
 */
export enum AuditExportFormat {
  /** JSON format */
  JSON = 'json',

  /** CSV format */
  CSV = 'csv',

  /** Human-readable text */
  TEXT = 'text',

  /** PDF report */
  PDF = 'pdf',
}

/**
 * Audit log export options
 */
export interface AuditExportOptions {
  /** Export format */
  format: AuditExportFormat

  /** Date range */
  date_from: Date
  date_to: Date

  /** Categories to include (all if empty) */
  categories?: AuditCategory[]

  /** Include metadata */
  include_metadata?: boolean

  /** Include IP addresses (PII) */
  include_ips?: boolean

  /** Include user agents */
  include_user_agents?: boolean
}

// ================================================
// AUDIT STATISTICS
// ================================================

/**
 * Audit statistics summary
 */
export interface AuditStatistics {
  /** Total audit logs */
  total_logs: number

  /** Logs by category */
  by_category: Record<AuditCategory, number>

  /** Logs by event type */
  by_event_type: Record<string, number>

  /** Success vs failure */
  by_outcome: {
    success: number
    failure: number
    partial: number
  }

  /** Logs by date (last 30 days) */
  by_date: Record<string, number>

  /** Top actors */
  top_actors: Array<{
    user_id: string
    user_name: string
    event_count: number
  }>

  /** Top resources */
  top_resources: Array<{
    resource_type: string
    event_count: number
  }>
}

// ================================================
// COMPLIANCE MAPPING
// ================================================

/**
 * Maps audit events to compliance requirements
 */
export const COMPLIANCE_MAPPING: Record<string, {
  frameworks: string[]
  requirement?: string
  retention_days: number
}> = {
  // LFPDPPP (Mexican data protection law)
  [AuditEventType.ARCO_REQUEST_CREATED]: {
    frameworks: ['LFPDPPP'],
    requirement: 'ARCO - Derecho de Acceso',
    retention_days: 5 * 365, // 5 years
  },
  [AuditEventType.DATA_ACCESS_EXPORT]: {
    frameworks: ['LFPDPPP', 'GDPR'],
    requirement: 'Data Portability',
    retention_days: 5 * 365,
  },
  [AuditEventType.DATA_DELETE]: {
    frameworks: ['LFPDPPP', 'GDPR'],
    requirement: 'Right to Erasure',
    retention_days: 5 * 365,
  },

  // NOM-004 (Mexican medical records standard)
  [AuditEventType.SIGNATURE_CREATE]: {
    frameworks: ['NOM-004'],
    requirement: 'Firma Electrónica',
    retention_days: 5 * 365,
  },
  [AuditEventType.DATA_AMEND]: {
    frameworks: ['NOM-004', 'LFPDPPP'],
    requirement: 'Rectificación de Datos',
    retention_days: 5 * 365,
  },

  // Security events
  [AuditEventType.SECURITY_SUSPICIOUS_ACTIVITY]: {
    frameworks: ['LFPDPPP', 'GDPR', 'PCI-DSS'],
    requirement: 'Security Monitoring',
    retention_days: 365, // 1 year
  },
  [AuditEventType.SECURITY_MALICIOUS_ATTEMPT]: {
    frameworks: ['LFPDPPP', 'GDPR', 'PCI-DSS'],
    requirement: 'Incident Response',
    retention_days: 365,
  },

  // Default retention for other events
  _default: {
    frameworks: ['LFPDPPP'],
    retention_days: 2 * 365, // 2 years default
  },
}

/**
 * Get retention period for an audit event
 */
export function getRetentionPeriod(eventType: AuditEventType): number {
  return COMPLIANCE_MAPPING[eventType]?.retention_days ?? COMPLIANCE_MAPPING._default.retention_days
}

// ================================================
// EXPORTS
// ================================================
// All types are already exported above
