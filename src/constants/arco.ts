/**
 * ARCO Rights Constants - Doctor.mx
 *
 * Constants for the ARCO (Acceso, Rectificación, Cancelación, Oposición, Restricción)
 * rights management system. Implements LFPDPPP compliance for Mexican
 * data protection law and GDPR Article 18.
 *
 * @module constants/arco
 * @see {@link ../lib/arco/index.ts} - Original source
 */

import type { DataTableScope, ArcoRequestType } from '@/types/arco'

/**
 * Legal SLA for ARCO requests in business days
 * Maximum time allowed by LFPDPPP to respond to requests
 */
export const ARCO_SLA_BUSINESS_DAYS = 20

/**
 * Priority levels for ARCO requests with Spanish display names
 */
export const ARCO_PRIORITIES = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
} as const

/**
 * Type for ARCO priority levels
 */
export type ArcoPriority = keyof typeof ARCO_PRIORITIES

/**
 * ARCO request type descriptions in Spanish
 * Detailed explanations for each ARCO right
 */
export const ARCO_TYPE_DESCRIPTIONS: Record<ArcoRequestType, string> = {
  ACCESS:
    'Derecho de Acceso: Solicito una copia de todos mis datos personales que tiene Doctor.mx',
  RECTIFY:
    'Derecho de Rectificación: Solicito corregir información inexacta o incompleta en mis datos',
  CANCEL:
    'Derecho de Cancelación: Solicito la eliminación de mis datos personales de sus sistemas',
  OPPOSE:
    'Derecho de Oposición: Me opongo al procesamiento de mis datos para los siguientes fines específicos',
  RESTRICT:
    'Derecho de Restricción: Solicito limitar el tratamiento de mis datos personales (GDPR Art. 18)',
} as const

/**
 * ARCO request status values
 * Tracks the lifecycle of an ARCO request
 */
export const ARCO_REQUEST_STATUS = {
  /** Request received, awaiting acknowledgment */
  PENDING: 'pending',
  /** Request acknowledged by the system */
  ACKNOWLEDGED: 'acknowledged',
  /** Request is being processed */
  PROCESSING: 'processing',
  /** Additional information required from user */
  INFO_REQUIRED: 'info_required',
  /** Request completed successfully */
  COMPLETED: 'completed',
  /** Request rejected with justification */
  REJECTED: 'rejected',
  /** Request cancelled by user */
  CANCELLED: 'cancelled',
  /** Request escalated to supervisor */
  ESCALATED: 'escalated',
} as const

/**
 * Type for ARCO request status values
 */
export type ArcoRequestStatus = typeof ARCO_REQUEST_STATUS[keyof typeof ARCO_REQUEST_STATUS]

/**
 * Data scope descriptions for user data exports
 * Explains what data each scope contains
 */
export const DATA_SCOPE_DESCRIPTIONS: Record<DataTableScope, string> = {
  profiles: 'Información personal (nombre, teléfono, foto)',
  appointments: 'Historial de citas y consultas',
  prescriptions: 'Recetas médicas',
  soap_consultations: 'Notas médicas SOAP',
  chat_conversations: 'Conversaciones de chat',
  chat_messages: 'Mensajes individuales',
  payments: 'Historial de pagos',
  follow_up_schedules: 'Programas de seguimiento',
  all: 'Todos mis datos',
} as const

/**
 * SLA warning threshold in business days
 * Triggers warnings when approaching deadline
 */
export const SLA_WARNING_THRESHOLD_DAYS = 15

/**
 * SLA critical threshold in business days
 * Triggers escalation when approaching deadline
 */
export const SLA_CRITICAL_THRESHOLD_DAYS = 18

/**
 * SLA threshold configuration
 */
export const SLA_THRESHOLDS = {
  /** Warning level - 15 business days */
  WARNING: SLA_WARNING_THRESHOLD_DAYS,
  /** Critical level - 18 business days */
  CRITICAL: SLA_CRITICAL_THRESHOLD_DAYS,
  /** Maximum allowed - 20 business days */
  MAXIMUM: ARCO_SLA_BUSINESS_DAYS,
} as const

/**
 * Escalation configuration for overdue requests
 */
export const ESCALATION_CONFIG = {
  /** Days after which to auto-escalate */
  AUTO_ESCALATE_DAYS: 18,
  /** Maximum escalation levels */
  MAX_LEVELS: 3,
  /** Notification recipients for escalations */
  NOTIFY_ROLES: ['admin', 'privacy_officer', 'legal'],
} as const

/**
 * Check if an ARCO request type requires data export
 * @param requestType - Type of ARCO request
 * @returns True if the request requires data export
 */
export function requiresDataExport(requestType: ArcoRequestType): boolean {
  return requestType === 'ACCESS' || requestType === 'CANCEL'
}

/**
 * Check if an ARCO request type allows user input
 * @param requestType - Type of ARCO request
 * @returns True if the request allows user corrections
 */
export function allowsUserCorrections(requestType: ArcoRequestType): boolean {
  return requestType === 'RECTIFY'
}

/**
 * Get the SLA risk level based on remaining days
 * @param remainingDays - Number of business days remaining
 * @returns Risk level: 'normal', 'warning', 'critical', or 'overdue'
 */
export function getSlaRiskLevel(remainingDays: number): 'normal' | 'warning' | 'critical' | 'overdue' {
  if (remainingDays < 0) return 'overdue'
  if (remainingDays <= 2) return 'critical'
  if (remainingDays <= 5) return 'warning'
  return 'normal'
}
