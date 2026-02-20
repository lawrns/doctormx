/**
 * Appointment Factory
 *
 * Factory para generar datos de prueba de citas médicas consistentes y realistas.
 * Soporta diferentes estados de cita: pendiente, confirmada, completada, cancelada.
 *
 * @example
 * ```typescript
 * const appointment = AppointmentFactory.create();
 * const confirmed = AppointmentFactory.createConfirmed();
 * const appointments = AppointmentFactory.createList(5);
 * ```
 */

import type { Appointment, AppointmentStatus, AppointmentDeliveryType } from '@/types'

/**
 * Genera un UUID v4 válido
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Genera un timestamp ISO válido
 */
function generateTimestamp(hoursFromNow: number = 0): string {
  const date = new Date()
  date.setHours(date.getHours() + hoursFromNow)
  return date.toISOString()
}

/**
 * Razones comunes de visita médica
 */
const REASONS_FOR_VISIT = [
  'Dolor de cabeza persistente',
  'Consulta general de control',
  'Dolor abdominal',
  'Revisión anual',
  'Dolor de espalda',
  'Molestias digestivas',
  'Consulta por ansiedad',
  'Revisión de presión arterial',
  'Dolor de garganta',
  'Problemas de piel',
  'Consulta nutricional',
  'Dolor articular',
  'Mareos frecuentes',
  'Problemas de sueño',
  'Consulta de seguimiento',
]

/**
 * Notas médicas de ejemplo
 */
const NOTES = [
  'Paciente estable, sin signos de alarma',
  'Se recomienda reposo por 48 horas',
  'Seguimiento en 1 semana',
  'Resultados de laboratorio normales',
  'Se prescribe tratamiento sintomático',
  'Derivación a especialista considerada',
  'Paciente con mejoría significativa',
  'Requiere estudios adicionales',
]

/**
 * Razones de cancelación
 */
const CANCELLATION_REASONS = [
  'Paciente solicitó cancelación',
  'Doctor no disponible',
  'Problema técnico',
  'Cita duplicada',
  'Paciente no asistió',
  'Reprogramación solicitada',
]

/**
 * Genera una fecha de cita (próximos 30 días)
 */
function generateAppointmentDate(): string {
  const days = Math.floor(Math.random() * 30)
  const hours = 9 + Math.floor(Math.random() * 9) // 9am - 6pm
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hours, 0, 0, 0)
  return date.toISOString()
}

/**
 * Factory para crear citas de prueba
 */
export const AppointmentFactory = {
  /**
   * Crea una cita base con valores por defecto
   */
  create(overrides: Partial<Appointment> = {}): Appointment {
    const startTs = overrides.start_ts || generateAppointmentDate()
    const startDate = new Date(startTs)
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000) // 30 minutos

    return {
      id: generateUUID(),
      patient_id: generateUUID(),
      doctor_id: generateUUID(),
      service_id: null,
      start_ts: startTs,
      end_ts: endDate.toISOString(),
      status: 'confirmed',
      appointment_type: Math.random() > 0.5 ? 'video' : 'in_person',
      video_status: 'pending',
      video_room_url: null,
      video_room_id: null,
      video_started_at: null,
      video_ended_at: null,
      consultation_notes: null,
      cancellation_reason: null,
      cancelled_by: null,
      reason_for_visit: REASONS_FOR_VISIT[Math.floor(Math.random() * REASONS_FOR_VISIT.length)],
      notes: null,
      created_at: generateTimestamp(-Math.floor(Math.random() * 168)),
      updated_at: generateTimestamp(0),
      ...overrides,
    }
  },

  /**
   * Crea una cita pendiente de pago
   */
  createPending(overrides: Partial<Appointment> = {}): Appointment {
    return this.create({
      status: 'pending_payment',
      video_status: 'pending',
      ...overrides,
    })
  },

  /**
   * Crea una cita confirmada
   */
  createConfirmed(overrides: Partial<Appointment> = {}): Appointment {
    return this.create({
      status: 'confirmed',
      video_status: 'ready',
      video_room_url: `https://meet.doctormx.com/room-${generateUUID().slice(0, 8)}`,
      video_room_id: generateUUID(),
      ...overrides,
    })
  },

  /**
   * Crea una cita completada
   */
  createCompleted(overrides: Partial<Appointment> = {}): Appointment {
    const startTs = overrides.start_ts || generateTimestamp(-Math.floor(Math.random() * 168))
    const startDate = new Date(startTs)
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000)

    return this.create({
      status: 'completed',
      start_ts: startTs,
      end_ts: endDate.toISOString(),
      video_status: 'completed',
      video_room_url: `https://meet.doctormx.com/room-${generateUUID().slice(0, 8)}`,
      video_room_id: generateUUID(),
      video_started_at: startDate.toISOString(),
      video_ended_at: endDate.toISOString(),
      consultation_notes: NOTES[Math.floor(Math.random() * NOTES.length)],
      ...overrides,
    })
  },

  /**
   * Crea una cita cancelada
   */
  createCancelled(overrides: Partial<Appointment> = {}): Appointment {
    return this.create({
      status: 'cancelled',
      video_status: 'pending',
      cancellation_reason: CANCELLATION_REASONS[Math.floor(Math.random() * CANCELLATION_REASONS.length)],
      cancelled_by: generateUUID(),
      ...overrides,
    })
  },

  /**
   * Crea una cita con no-show (paciente no asistió)
   */
  createNoShow(overrides: Partial<Appointment> = {}): Appointment {
    return this.create({
      status: 'no_show',
      video_status: 'missed',
      ...overrides,
    })
  },

  /**
   * Crea una cita reembolsada
   */
  createRefunded(overrides: Partial<Appointment> = {}): Appointment {
    return this.create({
      status: 'refunded',
      video_status: 'pending',
      cancellation_reason: 'Cancelación con reembolso',
      ...overrides,
    })
  },

  /**
   * Crea una lista de citas
   */
  createList(count: number, overrides: Partial<Appointment> = {}): Appointment[] {
    return Array.from({ length: count }, () => this.create(overrides))
  },
}

/**
 * Tipo de retorno de la factory para uso en tests
 */
export type AppointmentFactoryType = typeof AppointmentFactory
