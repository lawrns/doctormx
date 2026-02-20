/**
 * ARCO Data Export - Portability Format
 *
 * Handles machine-readable data portability exports
 * Compliant with GDPR Article 20, CCPA, and LFPDPPP
 */

import { createClient } from '@/lib/supabase/server'
import type { PortabilityDataExport } from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'

/**
 * Get user profile for portability format
 */
async function getPortabilityUserProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new ArcoError('User not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  return profile
}

/**
 * Get appointments for portability format
 */
async function getPortabilityAppointments(userId: string) {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      start_ts,
      end_ts,
      status,
      doctors!inner (
        profile:profiles!inner (full_name)
      )
    `)
    .eq('patient_id', userId)
    .order('start_ts', { ascending: false })

  return appointments || []
}

/**
 * Get medical records for portability format
 */
async function getPortabilityMedicalRecords(userId: string) {
  const supabase = await createClient()

  const { data: consultations } = await supabase
    .from('soap_consultations')
    .select('id, created_at, chief_complaint, diagnosis, treatment_plan')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return consultations || []
}

/**
 * Get prescriptions for portability format
 */
async function getPortabilityPrescriptions(userId: string) {
  const supabase = await createClient()

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('id, created_at, medications, instructions')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return prescriptions || []
}

/**
 * Get payments for portability format
 */
async function getPortabilityPayments(userId: string) {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('id, created_at, amount_cents, currency, status')
    .eq('appointment.appointments.patient_id', userId)
    .order('created_at', { ascending: false })

  return payments || []
}

/**
 * Type for appointment with doctor info
 */
interface AppointmentWithDoctor {
  id: string
  start_ts: string
  end_ts: string | null
  status: string
  doctors?: {
    profile?: { full_name: string | null } | null
  } | null
}

/**
 * Type for consultation record
 */
interface ConsultationRecord {
  id: string
  created_at: string
  chief_complaint: string | null
  diagnosis: string | null
  treatment_plan: string | null
}

/**
 * Type for prescription record
 */
interface PrescriptionRecord {
  id: string
  created_at: string
  medications: string | null
  instructions: string | null
}

/**
 * Type for payment record
 */
interface PaymentRecord {
  id: string
  created_at: string
  amount_cents: number | null
  currency: string
  status: string
}

/**
 * Format appointments for portability
 */
function formatPortabilityAppointments(
  appointments: AppointmentWithDoctor[]
): PortabilityDataExport['data_categories']['appointments'] {
  return appointments.map((apt) => ({
    id: apt.id,
    start_time: apt.start_ts,
    end_time: apt.end_ts,
    status: apt.status,
    doctor_name: apt.doctors?.profile?.full_name || null,
    specialty: null, // Would need to join with doctors table
  }))
}

/**
 * Format consultations for portability
 */
function formatPortabilityConsultations(
  consultations: ConsultationRecord[]
): PortabilityDataExport['data_categories']['medical_records'] {
  return consultations.map((consult) => ({
    id: consult.id,
    type: 'SOAP',
    date: consult.created_at,
    chief_complaint: consult.chief_complaint,
    diagnosis: consult.diagnosis,
    treatment: consult.treatment_plan,
  }))
}

/**
 * Format prescriptions for portability
 */
function formatPortabilityPrescriptions(
  prescriptions: PrescriptionRecord[]
): PortabilityDataExport['data_categories']['prescriptions'] {
  return prescriptions.map((rx) => ({
    id: rx.id,
    date: rx.created_at,
    medications: rx.medications,
    instructions: rx.instructions,
  }))
}

/**
 * Format payments for portability
 */
function formatPortabilityPayments(
  payments: PaymentRecord[]
): PortabilityDataExport['data_categories']['payments'] {
  return payments.map((payment) => ({
    id: payment.id,
    date: payment.created_at,
    amount: (payment.amount_cents ?? 0) / 100,
    currency: payment.currency,
    status: payment.status,
  }))
}

/**
 * Calculate total records
 */
function calculateTotalRecords(
  appointments: unknown[],
  consultations: unknown[],
  prescriptions: unknown[],
  payments: unknown[]
): number {
  return appointments.length + consultations.length + prescriptions.length + payments.length
}

/**
 * Get app URL for metadata
 */
function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://doctormx.com'
}

/**
 * Export user data in machine-readable portability format
 * This follows data portability best practices (GDPR Article 20, CCPA)
 *
 * @param userId - User ID
 * @returns Machine-readable portability data
 */
export async function exportUserDataForPortability(
  userId: string
): Promise<PortabilityDataExport> {
  const profile = await getPortabilityUserProfile(userId)
  const appointments = await getPortabilityAppointments(userId)
  const consultations = await getPortabilityMedicalRecords(userId)
  const prescriptions = await getPortabilityPrescriptions(userId)
  const payments = await getPortabilityPayments(userId)

  const formattedAppointments = formatPortabilityAppointments((appointments || []) as unknown as AppointmentWithDoctor[])
  const formattedConsultations = formatPortabilityConsultations((consultations || []) as unknown as ConsultationRecord[])
  const formattedPrescriptions = formatPortabilityPrescriptions((prescriptions || []) as unknown as PrescriptionRecord[])
  const formattedPayments = formatPortabilityPayments((payments || []) as unknown as PaymentRecord[])

  const totalRecords = calculateTotalRecords(
    appointments,
    consultations,
    prescriptions,
    payments
  )

  return {
    format_version: '1.0',
    export_date: new Date().toISOString(),
    exporting_service: {
      name: 'Doctor.mx',
      contact_email: 'privacidad@doctormx.com',
      privacy_policy_url: `${getAppUrl()}/privacy`,
    },
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      account_created: profile.created_at,
      account_modified: profile.updated_at,
    },
    data_categories: {
      appointments: formattedAppointments,
      medical_records: formattedConsultations,
      prescriptions: formattedPrescriptions,
      payments: formattedPayments,
    },
    metadata: {
      total_records: totalRecords,
      data_types: ['appointments', 'medical_records', 'prescriptions', 'payments'],
      retention_policy_url: `${getAppUrl()}/privacy`,
    },
  }
}

/**
 * Export user data as portability JSON (machine-readable)
 * This can be easily imported by other healthcare services
 *
 * @param userId - User ID
 * @returns JSON string in portability format
 */
export async function exportPortabilityJson(userId: string): Promise<string> {
  const portabilityData = await exportUserDataForPortability(userId)
  return JSON.stringify(portabilityData, null, 2)
}

/**
 * Create a portability attachment for an ARCO request
 *
 * @param requestId - ARCO request ID
 * @param userId - User ID
 * @returns Created attachment record
 */
export async function createPortabilityAttachment(
  requestId: string,
  userId: string
): Promise<{
  filename: string
  content: string
  mime_type: string
}> {
  const content = await exportPortabilityJson(userId)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `portabilidad_datos_${userId}_${timestamp}.json`

  return {
    filename,
    content,
    mime_type: 'application/json',
  }
}
