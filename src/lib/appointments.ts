// Sistema de citas - Simple y claro
import { createClient } from '@/lib/supabase/server'
import { getOccupiedSlots, getDoctorAvailability, generateTimeSlots } from './availability'
import { markAppointmentCompleted } from './followup'

// Helper: Obtener slots disponibles para una fecha específica
export async function getAvailableSlots(doctorId: string, date: string) {
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay()

  // Obtener disponibilidad del doctor para ese día
  const availability = await getDoctorAvailability(doctorId)
  const dayAvailability = availability.filter((a: { day_of_week: number; start_time: string; end_time: string }) => a.day_of_week === dayOfWeek)

  if (dayAvailability.length === 0) {
    return []
  }

  // Generar todos los slots posibles
  const allSlots = dayAvailability.flatMap((slot: { start_time: string; end_time: string }) =>
    generateTimeSlots(slot.start_time, slot.end_time)
  )

  // Obtener slots ocupados
  const occupied = await getOccupiedSlots(doctorId, date)
  const occupiedTimes = occupied.map((o: { start: string }) => o.start)

  // Filtrar slots disponibles
  return allSlots.filter((slot: string) => !occupiedTimes.includes(slot))
}

// Helper: Crear cita
export async function createAppointment(data: {
  patientId: string
  doctorId: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  durationMinutes?: number
}) {
  const supabase = await createClient()

  const { durationMinutes = 30 } = data

  // Construir timestamps
  const startTs = new Date(`${data.date}T${data.time}:00`)
  const endTs = new Date(startTs.getTime() + durationMinutes * 60000)

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: data.patientId,
      doctor_id: data.doctorId,
      start_ts: startTs.toISOString(),
      end_ts: endTs.toISOString(),
      status: 'pending_payment',
    })
    .select()
    .single()

  if (error) throw error

  return appointment
}

// Helper: Obtener citas del paciente
export async function getPatientAppointments(patientId: string) {
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
    .eq('patient_id', patientId)
    .order('start_ts', { ascending: false })

  if (error) throw error

  return data || []
}

// Helper: Obtener citas del doctor
export async function getDoctorAppointments(doctorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:profiles!appointments_patient_id_fkey (
        full_name,
        photo_url,
        phone
      )
    `)
    .eq('doctor_id', doctorId)
    .order('start_ts', { ascending: true })

  if (error) throw error

  return data || []
}

// Helper: Confirmar pago y actualizar cita
export async function confirmAppointmentPayment(appointmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function completeAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) throw error

  await markAppointmentCompleted(appointmentId)

  return data
}

