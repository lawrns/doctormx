/**
 * ARCO Data Export - Core Functions
 *
 * Handles data collection and packaging for ACCESS requests (Derecho de Acceso)
 */

import { createClient } from '@/lib/supabase/server'
import type {
  DataExportPackage,
  DataTableScope,
} from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'

/**
 * Sensitive fields to remove from profile exports
 */
const SENSITIVE_PROFILE_FIELDS = ['password', 'reset_password_token', 'confirmation_token']

/**
 * Sanitize profile data for export (remove sensitive internal fields)
 *
 * @param profile - Raw profile data
 * @returns Sanitized profile
 */
export function sanitizeProfile(profile: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...profile }

  for (const field of SENSITIVE_PROFILE_FIELDS) {
    delete sanitized[field]
  }

  return sanitized
}

/**
 * Get user profile with error handling
 *
 * @param userId - User ID
 * @returns User profile
 * @throws ArcoError if user not found
 */
async function fetchUserProfile(userId: string): Promise<Record<string, unknown>> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new ArcoError('User not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  return sanitizeProfile(profile)
}

/**
 * Get privacy preferences for user
 *
 * @param userId - User ID
 * @returns Privacy preferences or null
 */
async function fetchPrivacyPreferences(userId: string) {
  const supabase = await createClient()

  const { data: privacyPrefs } = await supabase
    .from('privacy_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return privacyPrefs
}

/**
 * Fetch appointments for user
 *
 * @param userId - User ID
 * @returns List of appointments
 */
async function fetchAppointments(userId: string): Promise<Array<Record<string, unknown>>> {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor.doctors!appointments_doctor_id_fkey (
        id,
        status,
        bio,
        license_number
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return (appointments || []).map((apt: any) => ({
    ...apt,
    doctor: apt.doctor ? {
      id: apt.doctor.id,
      license_number: apt.doctor.license_number,
    } : undefined,
  }))
}

/**
 * Fetch SOAP consultations for user
 *
 * @param userId - User ID
 * @returns List of consultations
 */
async function fetchConsultations(userId: string): Promise<Array<Record<string, unknown>>> {
  const supabase = await createClient()

  const { data: consultations } = await supabase
    .from('soap_consultations')
    .select('*')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return consultations || []
}

/**
 * Fetch prescriptions for user
 *
 * @param userId - User ID
 * @returns List of prescriptions
 */
async function fetchPrescriptions(userId: string): Promise<Array<Record<string, unknown>>> {
  const supabase = await createClient()

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return prescriptions || []
}

/**
 * Fetch payments for user
 *
 * @param userId - User ID
 * @returns List of payments
 */
async function fetchPayments(userId: string): Promise<Array<Record<string, unknown>>> {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      appointment:appointments!payments_appointment_id_fkey (
        id,
        start_ts
      )
    `)
    .eq('appointment.appointments.patient_id', userId)
    .order('created_at', { ascending: false })

  return payments || []
}

/**
 * Fetch chat history for user
 *
 * @param userId - User ID
 * @returns List of chat conversations with messages
 */
async function fetchChatHistory(userId: string): Promise<Array<Record<string, unknown>>> {
  const supabase = await createClient()

  const { data: conversations } = await supabase
    .from('chat_conversations')
    .select(`
      *,
      messages:chat_messages(*)
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return conversations || []
}

/**
 * Calculate total records in export package
 *
 * @param dataPackage - Export package
 * @returns Total record count
 */
function calculateTotalRecords(dataPackage: DataExportPackage): number {
  return (
    dataPackage.appointments.length +
    dataPackage.consultations.length +
    dataPackage.prescriptions.length +
    dataPackage.payments.length +
    dataPackage.chat_history.length +
    1 // Profile
  )
}

/**
 * Get complete user data export for ACCESS requests
 *
 * @param userId - User ID
 * @param scope - Data tables to include
 * @returns Complete data package
 */
export async function getUserDataExport(
  userId: string,
  scope: DataTableScope[] = ['all']
): Promise<DataExportPackage> {
  const includeAll = scope.includes('all')

  // Get user profile
  const profile = await fetchUserProfile(userId)

  // Get privacy preferences
  const privacyPrefs = await fetchPrivacyPreferences(userId)

  // Initialize export package
  const exportPackage: DataExportPackage = {
    user_profile: profile,
    appointments: [],
    consultations: [],
    prescriptions: [],
    payments: [],
    chat_history: [],
    privacy_preferences: privacyPrefs,
    export_metadata: {
      exported_at: new Date().toISOString(),
      export_format: 'json',
      total_records: 0,
      data_scope: scope,
    },
  }

  // Get appointments
  if (includeAll || scope.includes('appointments')) {
    exportPackage.appointments = await fetchAppointments(userId)
  }

  // Get SOAP consultations
  if (includeAll || scope.includes('soap_consultations')) {
    exportPackage.consultations = await fetchConsultations(userId)
  }

  // Get prescriptions
  if (includeAll || scope.includes('prescriptions')) {
    exportPackage.prescriptions = await fetchPrescriptions(userId)
  }

  // Get payments
  if (includeAll || scope.includes('payments')) {
    exportPackage.payments = await fetchPayments(userId)
  }

  // Get chat history
  if (includeAll || scope.includes('chat_conversations') || scope.includes('chat_messages')) {
    exportPackage.chat_history = await fetchChatHistory(userId)
  }

  // Calculate total records
  exportPackage.export_metadata.total_records = calculateTotalRecords(exportPackage)

  return exportPackage
}

/**
 * Calculate data export size estimate
 *
 * @param userId - User ID
 * @param scope - Data tables to include
 * @returns Estimated size in bytes
 */
export async function estimateExportSize(
  userId: string,
  scope: DataTableScope[] = ['all']
): Promise<number> {
  const dataPackage = await getUserDataExport(userId, scope)
  const jsonString = JSON.stringify(dataPackage)
  return Buffer.byteLength(jsonString, 'utf8')
}
