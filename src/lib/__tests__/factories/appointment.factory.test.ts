/**
 * Appointment Factory Tests
 *
 * Verifica que la AppointmentFactory genera datos consistentes y válidos.
 */

import { describe, it, expect } from 'vitest'
import { AppointmentFactory } from './appointment.factory'

describe('AppointmentFactory', () => {
  describe('create', () => {
    it('should create a valid appointment with default values', () => {
      const appointment = AppointmentFactory.create()

      expect(appointment).toHaveProperty('id')
      expect(appointment).toHaveProperty('patient_id')
      expect(appointment).toHaveProperty('doctor_id')
      expect(appointment).toHaveProperty('start_ts')
      expect(appointment).toHaveProperty('end_ts')
      expect(appointment).toHaveProperty('status')
      expect(appointment).toHaveProperty('reason_for_visit')
    })

    it('should generate unique IDs', () => {
      const appointment1 = AppointmentFactory.create()
      const appointment2 = AppointmentFactory.create()

      expect(appointment1.id).not.toBe(appointment2.id)
    })

    it('should generate valid UUIDs', () => {
      const appointment = AppointmentFactory.create()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(appointment.id).toMatch(uuidRegex)
      expect(appointment.patient_id).toMatch(uuidRegex)
      expect(appointment.doctor_id).toMatch(uuidRegex)
    })

    it('should set end_ts 30 minutes after start_ts by default', () => {
      const appointment = AppointmentFactory.create()
      const startDate = new Date(appointment.start_ts)
      const endDate = new Date(appointment.end_ts)
      const diffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)

      expect(diffMinutes).toBe(30)
    })

    it('should apply overrides correctly', () => {
      const customStart = '2024-12-25T10:00:00.000Z'
      const appointment = AppointmentFactory.create({
        status: 'completed',
        reason_for_visit: 'Dolor de cabeza',
        start_ts: customStart,
      })

      expect(appointment.status).toBe('completed')
      expect(appointment.reason_for_visit).toBe('Dolor de cabeza')
      expect(appointment.start_ts).toBe(customStart)
    })
  })

  describe('createPending', () => {
    it('should create an appointment with pending_payment status', () => {
      const appointment = AppointmentFactory.createPending()

      expect(appointment.status).toBe('pending_payment')
    })

    it('should have video_status as pending', () => {
      const appointment = AppointmentFactory.createPending()

      expect(appointment.video_status).toBe('pending')
    })
  })

  describe('createConfirmed', () => {
    it('should create an appointment with confirmed status', () => {
      const appointment = AppointmentFactory.createConfirmed()

      expect(appointment.status).toBe('confirmed')
    })

    it('should have video room URL', () => {
      const appointment = AppointmentFactory.createConfirmed()

      expect(appointment.video_room_url).not.toBeNull()
      expect(appointment.video_room_url).toContain('meet.doctormx.com')
    })

    it('should have video_status as ready', () => {
      const appointment = AppointmentFactory.createConfirmed()

      expect(appointment.video_status).toBe('ready')
    })
  })

  describe('createCompleted', () => {
    it('should create an appointment with completed status', () => {
      const appointment = AppointmentFactory.createCompleted()

      expect(appointment.status).toBe('completed')
    })

    it('should have video timestamps', () => {
      const appointment = AppointmentFactory.createCompleted()

      expect(appointment.video_started_at).not.toBeNull()
      expect(appointment.video_ended_at).not.toBeNull()
    })

    it('should have consultation notes', () => {
      const appointment = AppointmentFactory.createCompleted()

      expect(appointment.consultation_notes).not.toBeNull()
      expect(typeof appointment.consultation_notes).toBe('string')
    })
  })

  describe('createCancelled', () => {
    it('should create an appointment with cancelled status', () => {
      const appointment = AppointmentFactory.createCancelled()

      expect(appointment.status).toBe('cancelled')
    })

    it('should have cancellation reason', () => {
      const appointment = AppointmentFactory.createCancelled()

      expect(appointment.cancellation_reason).not.toBeNull()
      expect(typeof appointment.cancellation_reason).toBe('string')
    })

    it('should have cancelled_by field', () => {
      const appointment = AppointmentFactory.createCancelled()

      expect(appointment.cancelled_by).not.toBeNull()
    })
  })

  describe('createNoShow', () => {
    it('should create an appointment with no_show status', () => {
      const appointment = AppointmentFactory.createNoShow()

      expect(appointment.status).toBe('no_show')
    })

    it('should have video_status as missed', () => {
      const appointment = AppointmentFactory.createNoShow()

      expect(appointment.video_status).toBe('missed')
    })
  })

  describe('createRefunded', () => {
    it('should create an appointment with refunded status', () => {
      const appointment = AppointmentFactory.createRefunded()

      expect(appointment.status).toBe('refunded')
    })
  })

  describe('createList', () => {
    it('should create the specified number of appointments', () => {
      const appointments = AppointmentFactory.createList(5)

      expect(appointments).toHaveLength(5)
    })

    it('should create unique appointments', () => {
      const appointments = AppointmentFactory.createList(10)
      const ids = appointments.map(a => a.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(10)
    })

    it('should apply overrides to all appointments', () => {
      const appointments = AppointmentFactory.createList(3, { status: 'completed' })

      appointments.forEach(appointment => {
        expect(appointment.status).toBe('completed')
      })
    })
  })
})
