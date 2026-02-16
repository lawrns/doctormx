// Sistema de Disponibilidad - Se explica solo
// Input: Doctor ID, Fecha
// Proceso: Consultar horarios → Generar slots → Filtrar ocupados
// Output: Lista de horarios disponibles

import { createClient } from '@/lib/supabase/server'
import { APPOINTMENT_CONFIG } from '@/config/constants'
import { cache } from '@/lib/cache'

export type DoctorAvailability = {
  id: string
  doctor_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

// Bloque: Obtener disponibilidad configurada del doctor
export async function getDoctorAvailability(doctorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('day_of_week', { ascending: true })

  if (error) throw error

  return data || []
}

// Bloque: Guardar disponibilidad del doctor
export async function setDoctorAvailability(
  doctorId: string,
  availability: Omit<DoctorAvailability, 'id' | 'doctor_id'>[]
) {
  const supabase = await createClient()

  // Eliminar disponibilidad existente
  await supabase.from('availability_rules').delete().eq('doctor_id', doctorId)

  // Insertar nueva disponibilidad
  const records = availability.map((a) => ({
    ...a,
    doctor_id: doctorId,
  }))

  const { error } = await supabase.from('availability_rules').insert(records)

  if (error) throw error

  return true
}

// Helper: Generar slots de tiempo entre dos horas
export function generateTimeSlots(startTime: string, endTime: string) {
  const slots = []
  const intervalMinutes = APPOINTMENT_CONFIG.SLOT_INTERVAL_MINUTES

  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  while (currentMinutes + APPOINTMENT_CONFIG.DURATION_MINUTES <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const mins = currentMinutes % 60
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`)
    currentMinutes += intervalMinutes
  }

  return slots
}

// Helper: Obtener slots disponibles para una fecha específica
export async function getAvailableSlots(doctorId: string, date: string) {
  const cached = await cache.getAppointmentAvailability(doctorId, date)
  if (cached && cached.length > 0) return cached

  const slots = await fetchAvailableSlots(doctorId, date)
  await cache.setAppointmentAvailability(doctorId, date, slots)
  return slots
}

async function fetchAvailableSlots(doctorId: string, date: string) {
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay()

  const availability = await getDoctorAvailability(doctorId)
  const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek)

  if (dayAvailability.length === 0) {
    return []
  }

  const allSlots = dayAvailability.flatMap(slot =>
    generateTimeSlots(slot.start_time, slot.end_time)
  )

  const occupied = await getOccupiedSlots(doctorId, date)

  return allSlots.filter(slot => !occupied.some(o => o.start === slot))
}

// Helper: Obtener slots ocupados para una fecha
export async function getOccupiedSlots(doctorId: string, date: string) {
  const supabase = await createClient()

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Slots ocupados: citas confirmadas O pendientes de pago
  // (Stripe maneja el timeout, no nosotros)
  const { data, error } = await supabase
    .from('appointments')
    .select('start_ts, end_ts')
    .eq('doctor_id', doctorId)
    .gte('start_ts', startOfDay.toISOString())
    .lte('start_ts', endOfDay.toISOString())
    .in('status', ['pending_payment', 'confirmed'])

  if (error) throw error

  return (data || []).map(apt => ({
    start: apt.start_ts.substring(11, 16), // Extract HH:MM
    end: apt.end_ts.substring(11, 16),
  }))
}

