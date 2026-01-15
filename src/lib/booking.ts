// Sistema de Reserva de Citas - Se explica solo
// Input: Paciente, Doctor, Fecha/Hora
// Proceso: Validar disponibilidad → Bloquear slot → Crear cita
// Output: Cita creada (pending_payment)

import { createClient } from '@/lib/supabase/server'
import { getAvailableSlots } from './availability'
import { APPOINTMENT_CONFIG, STATUS } from '@/config/constants'
import { sendAppointmentConfirmation } from './notifications'
import { sendAppointmentConfirmation as sendWhatsAppConfirmation, getPatientPhone } from './whatsapp-notifications'

export type ReservationRequest = {
  patientId: string
  doctorId: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
}

export type ReservationResult = {
  success: boolean
  appointment?: import('@/types').Appointment
  error?: string
}

// Sistema completo: validar + reservar + crear
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
    console.error('Failed to send confirmation email:', err)
  })

  // Enviar WhatsApp de confirmación (no bloquea el flujo principal)
  sendWhatsAppNotification(request.patientId, appointment.id).catch((err) => {
    console.error('Failed to send WhatsApp confirmation:', err)
  })

  return {
    success: true,
    appointment,
  }
}

// Bloque: Validar disponibilidad del slot
async function validateSlotAvailability(
  doctorId: string,
  date: string,
  time: string
): Promise<boolean> {
  const availableSlots = await getAvailableSlots(doctorId, date)
  return availableSlots.includes(time)
}

// Bloque: Crear registro de cita
async function createAppointmentRecord(request: ReservationRequest) {
  const supabase = await createClient()

  const startTs = new Date(`${request.date}T${request.time}:00`)
  const endTs = new Date(startTs.getTime() + APPOINTMENT_CONFIG.DURATION_MINUTES * 60000)

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

// Bloque: Obtener detalles de cita para booking
export async function getAppointmentForBooking(appointmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        *,
        profile:profiles (full_name, photo_url)
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (error) throw error

  return data
}

async function sendConfirmationEmail(patientId: string, appointmentId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', patientId)
    .single()

  if (!profile?.email) {
    console.warn('No email found for patient:', patientId)
    return
  }

  await sendAppointmentConfirmation(
    appointmentId,
    profile.email,
    profile.full_name || 'Paciente'
  )
}

async function sendWhatsAppNotification(patientId: string, appointmentId: string) {
  const supabase = await createClient()

  const phone = await getPatientPhone(patientId)
  if (!phone) {
    console.warn('No phone found for patient:', patientId)
    return
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        profile:profiles (full_name)
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return
  }

  const doctorName = appointment.doctor?.profile?.full_name || 'tu médico'
  const startTs = new Date(appointment.start_ts)
  const dateStr = startTs.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = startTs.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', patientId)
    .single()

  await sendWhatsAppConfirmation(
    phone,
    profile?.full_name || 'Paciente',
    doctorName,
    'Medicina General',
    dateStr,
    timeStr,
    appointment.price_cents || 0,
    appointment.currency || 'MXN',
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/checkout/${appointmentId}`
  )
}
