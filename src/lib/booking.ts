/**
 * Sistema de Reserva de Citas - Se explica solo
 * Input: Paciente, Doctor, Fecha/Hora
 * Proceso: Validar disponibilidad → Bloquear slot → Crear cita
 * Output: Cita creada (pending_payment)
 * 
 * @module lib/booking
 * @example
 * ```typescript
 * import { reserveAppointmentSlot, getAppointmentForBooking } from '@/lib/booking';
 * 
 * // Reserve a slot
 * const result = await reserveAppointmentSlot({
 *   patientId: 'pat-123',
 *   doctorId: 'doc-456',
 *   date: '2026-02-20',
 *   time: '14:30'
 * });
 * 
 * if (result.success) {
 *   console.log('Appointment created:', result.appointment);
 * }
 * ```
 */

import { createClient } from '@/lib/supabase/server'
import { getAvailableSlots } from './availability'
import { APPOINTMENT_CONFIG, STATUS } from '@/config/constants'
import { TIME } from '@/lib/constants/time'
import { sendAppointmentConfirmation } from './notifications'
import { sendAppointmentConfirmation as sendWhatsAppConfirmation, getPatientPhone } from './whatsapp-notifications'
import { logger } from '@/lib/observability/logger'

/**
 * Request parameters for reserving an appointment slot
 */
export type ReservationRequest = {
  /** Patient's unique identifier */
  patientId: string
  /** Doctor's unique identifier */
  doctorId: string
  /** Appointment date in YYYY-MM-DD format */
  date: string
  /** Appointment time in HH:MM format */
  time: string
}

/**
 * Result of a reservation attempt
 */
export type ReservationResult = {
  /** Whether the reservation was successful */
  success: boolean
  /** The created appointment object (if successful) */
  appointment?: import('@/types').Appointment
  /** Error message (if unsuccessful) */
  error?: string
}

/**
 * Reserves an appointment slot for a patient with a doctor
 * Validates availability, creates the appointment record, and sends notifications
 * @param request - Reservation request parameters
 * @param request.patientId - Patient's unique identifier
 * @param request.doctorId - Doctor's unique identifier
 * @param request.date - Appointment date (YYYY-MM-DD)
 * @param request.time - Appointment time (HH:MM)
 * @returns Promise with reservation result
 * @throws {Error} If database operation fails
 * @example
 * const result = await reserveAppointmentSlot({
 *   patientId: 'pat-123',
 *   doctorId: 'doc-456',
 *   date: '2026-02-20',
 *   time: '14:30'
 * });
 * 
 * if (result.success) {
 *   console.log('Appointment ID:', result.appointment?.id);
 * } else {
 *   console.error('Reservation failed:', result.error);
 * }
 */
export async function reserveAppointmentSlot(
  request: ReservationRequest
): Promise<ReservationResult> {
  // Paso 1: Validar que el slot está disponible
  const isAvailable = await validateSlotAvailability(
    request.doctorId,
    request.date,
    request.time
  )

  if (!isAvailable) {
    return {
      success: false,
      error: 'El horario ya no está disponible',
    }
  }

  // Paso 2: Crear la cita (esto bloquea el slot)
  const appointment = await createAppointmentRecord(request)

  // Enviar email de confirmación (no bloquea el flujo principal)
  sendConfirmationEmail(request.patientId, appointment.id).catch((err) => {
    logger.error('Failed to send confirmation email', { error: err })
  })

  // Enviar WhatsApp de confirmación (no bloquea el flujo principal)
  sendWhatsAppNotification(request.patientId, appointment.id).catch((err) => {
    logger.error('Failed to send WhatsApp confirmation', { error: err })
  })

  return {
    success: true,
    appointment,
  }
}

/**
 * Validates if a time slot is available for a doctor
 * @param doctorId - Doctor's unique identifier
 * @param date - Date to check (YYYY-MM-DD)
 * @param time - Time to check (HH:MM)
 * @returns Promise resolving to boolean indicating availability
 * @example
 * const isAvailable = await validateSlotAvailability('doc-123', '2026-02-20', '14:30');
 * if (isAvailable) {
 *   // Proceed with booking
 * }
 */
async function validateSlotAvailability(
  doctorId: string,
  date: string,
  time: string
): Promise<boolean> {
  const availableSlots = await getAvailableSlots(doctorId, date)
  return availableSlots.includes(time)
}

/**
 * Creates an appointment record in the database
 * @param request - Reservation request with patient, doctor, date, and time
 * @returns Promise resolving to the created appointment
 * @throws {Error} If database insertion fails
 * @example
 * const appointment = await createAppointmentRecord({
 *   patientId: 'pat-123',
 *   doctorId: 'doc-456',
 *   date: '2026-02-20',
 *   time: '14:30'
 * });
 */
async function createAppointmentRecord(request: ReservationRequest) {
  const supabase = await createClient()

  const startTs = new Date(`${request.date}T${request.time}:00`)
  const endTs = new Date(startTs.getTime() + APPOINTMENT_CONFIG.DURATION_MINUTES * TIME.MINUTE_IN_MS)

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: request.patientId,
      doctor_id: request.doctorId,
      start_ts: startTs.toISOString(),
      end_ts: endTs.toISOString(),
      status: STATUS.APPOINTMENT.PENDING_PAYMENT, // Pago inmediato, sin hold
    })
    .select()
    .single()

  if (error) throw error

  return data
}

/**
 * Retrieves appointment details for the booking/checkout page
 * Includes doctor profile information
 * @param appointmentId - The appointment ID to fetch
 * @returns Promise resolving to appointment with doctor details
 * @throws {Error} If appointment not found or database error occurs
 * @example
 * const appointment = await getAppointmentForBooking('apt-123');
 * console.log(appointment.doctor.profile.full_name);
 */
export async function getAppointmentForBooking(appointmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor.doctores (
        *,
        profile:profiles (full_name, photo_url)
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (error) throw error

  return data
}

/**
 * Sends email confirmation for an appointment
 * @param patientId - Patient's unique identifier
 * @param appointmentId - Appointment ID for the confirmation
 * @returns Promise that resolves when email is sent
 * @example
 * await sendConfirmationEmail('pat-123', 'apt-456');
 */
async function sendConfirmationEmail(patientId: string, appointmentId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', patientId)
    .single()

  if (!profile?.email) {
    logger.warn('No email found for patient', { patientId })
    return
  }

  await sendAppointmentConfirmation(
    appointmentId,
    profile.email,
    profile.full_name ?? 'Paciente'
  )
}

/**
 * Sends WhatsApp confirmation for an appointment
 * @param patientId - Patient's unique identifier
 * @param appointmentId - Appointment ID for the confirmation
 * @returns Promise that resolves when WhatsApp message is sent
 * @example
 * await sendWhatsAppNotification('pat-123', 'apt-456');
 */
async function sendWhatsAppNotification(patientId: string, appointmentId: string) {
  const supabase = await createClient()

  const phone = await getPatientPhone(patientId)
  if (!phone) {
    logger.warn('No phone found for patient', { patientId })
    return
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor.doctores (
        profile:profiles (full_name)
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return
  }

  const apt = appointment as unknown as {
    doctor?: {
      profile?: {
        full_name: string | null
      } | null
    } | null
    start_ts: string
    price_cents: number | null
    currency: string | null
  }
  const doctorName = apt.doctor?.profile?.full_name ?? 'tu médico'
  const startTs = new Date(apt.start_ts)
  const dateStr = startTs.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = startTs.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', patientId)
    .single()

  await sendWhatsAppConfirmation(
    phone,
    profile?.full_name ?? 'Paciente',
    doctorName,
    'Medicina General',
    dateStr,
    timeStr,
    apt.price_cents ?? 0,
    apt.currency ?? 'MXN',
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://doctory.mx'}/checkout/${appointmentId}`
  )
}
