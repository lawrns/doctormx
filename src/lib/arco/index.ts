/**
 * ARCO Rights System - Core Module
 *
 * Implements LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)
 * compliance for Mexican data protection law.
 *
 * Derechos ARCO:
 * - Acceso (Access): Users can request access to their personal data
 * - Rectificación (Rectification): Users can correct inaccurate data
 * - Cancelación (Cancellation): Users can request deletion of their data
 * - Oposición (Opposition): Users can oppose data processing for specific purposes
 *
 * @module arco
 */

import { createClient } from '@/lib/supabase/server'
import type {
  ArcoRequestType,
  ArcoRequestStatus,
  CreateArcoRequestInput,
  UpdateArcoRequestInput,
  ArcoRequestRow,
  ArcoRequestWithDetails,
  ArcoRequestFilter,
  ArcoRequestSort,
  PaginatedResponse,
  DataExportPackage,
  UpdatePrivacyPreferencesInput,
  PrivacyPreferencesRow,
  DataTableScope,
} from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'

// Re-export all types and utilities
export * from '@/types/arco'

// Re-export sub-modules
export { createArcoRequest, getArcoRequest, getUserArcoRequests } from './requests'
export { trackSlaCompliance, checkSlaCompliance, getSlaMetrics } from './sla-tracker'
export {
  shouldEscalate,
  escalateRequest,
  getEscalationLevel,
  updateEscalationLevel,
} from './escalation'
export { getUserDataExport, exportUserDataToJson, exportUserDataToPdf } from './data-export'

// ================================================
// CONSTANTS
// ================================================

/**
 * Legal SLA for ARCO requests: 20 business days
 * This is the maximum time allowed by LFPDPPP to respond
 */
export const ARCO_SLA_BUSINESS_DAYS = 20

/**
 * Priority levels for ARCO requests
 */
export const ARCO_PRIORITIES = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
} as const

/**
 * Data scope descriptions
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
 * ARCO request type descriptions (Spanish)
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
} as const

// ================================================
// CORE FUNCTIONS
// ================================================

/**
 * Validate if a user can submit a specific type of ARCO request
 *
 * @param userId - User ID making the request
 * @param requestType - Type of ARCO request
 * @returns True if request can be submitted
 */
export async function canSubmitArcoRequest(
  userId: string,
  requestType: ArcoRequestType
): Promise<boolean> {
  const supabase = await createClient()

  // Check for duplicate pending requests of the same type
  const { data: existingRequests } = await supabase
    .from('arco_requests')
    .select('id, status')
    .eq('user_id', userId)
    .eq('request_type', requestType)
    .in('status', ['pending', 'acknowledged', 'processing', 'info_required'])

  // Don't allow duplicate pending requests
  if (existingRequests && existingRequests.length > 0) {
    return false
  }

  return true
}

/**
 * Get the appropriate template for an ARCO request based on type
 *
 * @param requestType - Type of ARCO request
 * @returns Template object with title and description
 */
export function getArcoRequestTemplate(requestType: ArcoRequestType): {
  title: string
  description: string
  defaultDataScope: DataTableScope[]
} {
  switch (requestType) {
    case 'ACCESS':
      return {
        title: 'Solicitud de Acceso a Datos Personales',
        description: ARCO_TYPE_DESCRIPTIONS.ACCESS,
        defaultDataScope: ['all'],
      }

    case 'RECTIFY':
      return {
        title: 'Solicitud de Rectificación de Datos Personales',
        description: ARCO_TYPE_DESCRIPTIONS.RECTIFY,
        defaultDataScope: ['profiles'],
      }

    case 'CANCEL':
      return {
        title: 'Solicitud de Cancelación de Datos Personales (Derecho al Olvido)',
        description: ARCO_TYPE_DESCRIPTIONS.CANCEL,
        defaultDataScope: ['all'],
      }

    case 'OPPOSE':
      return {
        title: 'Solicitud de Oposición al Tratamiento de Datos',
        description: ARCO_TYPE_DESCRIPTIONS.OPPOSE,
        defaultDataScope: ['all'],
      }

    default:
      return {
        title: 'Solicitud de Derechos ARCO',
        description: 'Ejercicio de derechos ARCO',
        defaultDataScope: ['all'],
      }
  }
}

/**
 * Get user's privacy preferences
 *
 * @param userId - User ID
 * @returns Privacy preferences or null if not set
 */
export async function getUserPrivacyPreferences(
  userId: string
): Promise<PrivacyPreferencesRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('privacy_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found - return default preferences
      return {
        id: '',
        user_id: userId,
        marketing_emails: true,
        marketing_sms: false,
        marketing_push: false,
        analytics_consent: true,
        personalization_consent: true,
        research_consent: false,
        share_with_insurance: false,
        share_with_pharmacies: false,
        share_with_labs: false,
        ai_training_consent: false,
        voice_recording_consent: false,
        updated_at: new Date().toISOString(),
        consent_version: '1.0',
        last_consent_update: new Date().toISOString(),
      }
    }
    throw new ArcoError(
      `Error fetching privacy preferences: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return data
}

/**
 * Update user's privacy preferences
 *
 * @param userId - User ID
 * @param updates - Preferences to update
 * @returns Updated privacy preferences
 */
export async function updateUserPrivacyPreferences(
  userId: string,
  updates: UpdatePrivacyPreferencesInput
): Promise<PrivacyPreferencesRow> {
  const supabase = await createClient()

  // Check if preferences exist
  const existing = await getUserPrivacyPreferences(userId)

  if (existing && existing.id) {
    // Update existing
    const { data, error } = await supabase
      .from('privacy_preferences')
      .update({
        ...updates,
        last_consent_update: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new ArcoError(
        `Error updating privacy preferences: ${error.message}`,
        ArcoErrorCode.INVALID_REQUEST_TYPE,
        500
      )
    }

    return data
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('privacy_preferences')
      .insert({
        user_id: userId,
        ...updates,
        consent_version: '1.0',
        last_consent_update: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new ArcoError(
        `Error creating privacy preferences: ${error.message}`,
        ArcoErrorCode.INVALID_REQUEST_TYPE,
        500
      )
    }

    return data
  }
}

/**
 * Check if user has consented to specific processing
 *
 * @param userId - User ID
 * @param consentType - Type of consent to check
 * @returns True if user has consented
 */
export async function hasUserConsent(
  userId: string,
  consentType: keyof Omit<UpdatePrivacyPreferencesInput, 'marketing_' | 'share_with_'>
): Promise<boolean> {
  const prefs = await getUserPrivacyPreferences(userId)
  return prefs ? prefs[consentType] ?? false : false
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Calculate business days between two dates
 * Excludes weekends and Mexican holidays
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of business days
 */
export function calculateBusinessDays(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let businessDays = 0
  let current = new Date(start)

  // Mexican holidays (simplified - should use a proper holiday calendar)
  const holidays = [
    '01-01', // New Year's Day
    '02-05', // Constitution Day
    '03-21', // Benito Juárez's Birthday
    '05-01', // Labor Day
    '09-16', // Independence Day
    '11-20', // Revolution Day
    '12-25', // Christmas Day
  ]

  while (current <= end) {
    const dayOfWeek = current.getDay()
    const dateString = current.toISOString().slice(5, 10)

    // Count if it's a weekday (not Saturday=6 or Sunday=0)
    // and not a holiday
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateString)) {
      businessDays++
    }

    current.setDate(current.getDate() + 1)
  }

  return businessDays
}

/**
 * Add business days to a date
 *
 * @param startDate - Starting date
 * @param businessDays - Number of business days to add
 * @returns Resulting date
 */
export function addBusinessDays(
  startDate: Date | string,
  businessDays: number
): Date {
  const result = new Date(startDate)
  let daysAdded = 0
  let remainingDays = businessDays

  // Mexican holidays
  const holidays = [
    '01-01', '02-05', '03-21', '05-01', '09-16', '11-20', '12-25',
  ]

  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    const dateString = result.toISOString().slice(5, 10)

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateString)) {
      remainingDays--
    }
    daysAdded++
  }

  return result
}

/**
 * Check if a request is overdue based on SLA
 *
 * @param request - ARCO request
 * @returns True if request is overdue
 */
export function isRequestOverdue(request: ArcoRequestRow): boolean {
  if (
    request.status === 'completed' ||
    request.status === 'denied' ||
    request.status === 'cancelled'
  ) {
    return false
  }

  return new Date(request.due_date) < new Date()
}

/**
 * Get the status badge color for UI display
 *
 * @param status - ARCO request status
 * @returns CSS color class
 */
export function getStatusColor(status: ArcoRequestStatus): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    acknowledged: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    info_required: 'bg-orange-100 text-orange-800',
    escalated: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  return colors[status] || colors.pending
}

/**
 * Get the priority badge color for UI display
 *
 * @param priority - ARCO request priority
 * @returns CSS color class
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  return colors[priority] || colors.normal
}

/**
 * Format ARCO request type for display
 *
 * @param requestType - ARCO request type
 * @returns Formatted type name
 */
export function formatRequestType(requestType: ArcoRequestType): string {
  const types = {
    ACCESS: 'Acceso',
    RECTIFY: 'Rectificación',
    CANCEL: 'Cancelación',
    OPPOSE: 'Oposición',
  }

  return types[requestType] || requestType
}

/**
 * Get ARCO request description in Spanish
 *
 * @param requestType - ARCO request type
 * @returns Spanish description
 */
export function getRequestDescription(requestType: ArcoRequestType): string {
  return ARCO_TYPE_DESCRIPTIONS[requestType] || ''
}

/**
 * Validate data scope for ARCO requests
 *
 * @param dataScope - Array of data tables to include
 * @returns True if valid
 */
export function isValidDataScope(dataScope: DataTableScope[]): boolean {
  if (!Array.isArray(dataScope) || dataScope.length === 0) {
    return false
  }

  const validScopes: DataTableScope[] = [
    'profiles',
    'appointments',
    'prescriptions',
    'soap_consultations',
    'chat_conversations',
    'chat_messages',
    'payments',
    'follow_up_schedules',
    'all',
  ]

  return dataScope.every((scope) => validScopes.includes(scope))
}

// ================================================
// INITIALIZATION
// ================================================

/**
 * Initialize privacy preferences for a new user
 * Called automatically when a user registers
 *
 * @param userId - New user ID
 */
export async function initializeUserPrivacyPreferences(
  userId: string
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('privacy_preferences').insert({
    user_id: userId,
    consent_version: '1.0',
    last_consent_update: new Date().toISOString(),
  })
}
