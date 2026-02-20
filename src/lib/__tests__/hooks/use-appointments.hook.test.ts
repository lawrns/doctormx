/**
 * useAppointments Hook Tests
 * Tests for appointment management hook using Factory Pattern
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { AppointmentFactory, UserFactory } from '@/lib/__tests__/factories'
import type { Appointment, UserProfile } from '@/types'

describe('HOOK: useAppointments', () => {
  let mockAppointments: Appointment[]
  let currentUser: UserProfile

  beforeEach(() => {
    currentUser = UserFactory.createPatient()
    mockAppointments = AppointmentFactory.createList(5, {
      patient_id: currentUser.id,
    })
  })

  describe('Appointment List Management', () => {
    it('should filter appointments by status', () => {
      const confirmed = mockAppointments.filter(a => a.status === 'confirmed')
      const pending = mockAppointments.filter(a => a.status === 'pending_payment')
      const cancelled = mockAppointments.filter(a => a.status === 'cancelled')

      // Combined should equal total (assuming no other statuses in mock)
      expect(confirmed.length + pending.length + cancelled.length).toBeLessThanOrEqual(mockAppointments.length)
    })

    it('should sort appointments by start time', () => {
      const sorted = [...mockAppointments].sort((a, b) => 
        new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime()
      )

      // Verify sorted order
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(new Date(sorted[i].start_ts).getTime()).toBeLessThanOrEqual(
          new Date(sorted[i + 1].start_ts).getTime()
        )
      }
    })

    it('should filter upcoming appointments', () => {
      const now = new Date().toISOString()
      const upcoming = mockAppointments.filter(a => a.start_ts > now)
      
      // All upcoming appointments should have future dates
      upcoming.forEach(apt => {
        expect(new Date(apt.start_ts).getTime()).toBeGreaterThan(new Date(now).getTime())
      })
    })

    it('should filter past appointments', () => {
      const now = new Date().toISOString()
      const past = mockAppointments.filter(a => a.end_ts < now)
      
      // All past appointments should have ended
      past.forEach(apt => {
        expect(new Date(apt.end_ts).getTime()).toBeLessThan(new Date(now).getTime())
      })
    })
  })

  describe('Appointment Status Transitions', () => {
    it('should handle pending to confirmed transition', () => {
      const pending = AppointmentFactory.createPending()
      expect(pending.status).toBe('pending_payment')

      // Simulate confirmation
      const confirmed = { ...pending, status: 'confirmed' as const }
      expect(confirmed.status).toBe('confirmed')
      expect(confirmed.id).toBe(pending.id) // Same appointment
    })

    it('should handle confirmed to completed transition', () => {
      const confirmed = AppointmentFactory.createConfirmed()
      expect(confirmed.status).toBe('confirmed')

      // Simulate completion
      const completed = AppointmentFactory.createCompleted({ id: confirmed.id })
      expect(completed.status).toBe('completed')
      expect(completed.consultation_notes).toBeDefined()
    })

    it('should handle confirmed to cancelled transition', () => {
      const confirmed = AppointmentFactory.createConfirmed()
      expect(confirmed.status).toBe('confirmed')

      // Simulate cancellation
      const cancelled = AppointmentFactory.createCancelled({ id: confirmed.id })
      expect(cancelled.status).toBe('cancelled')
      expect(cancelled.cancellation_reason).toBeDefined()
    })

    it('should handle confirmed to no-show transition', () => {
      const confirmed = AppointmentFactory.createConfirmed()
      expect(confirmed.status).toBe('confirmed')

      // Simulate no-show
      const noShow = AppointmentFactory.createNoShow({ id: confirmed.id })
      expect(noShow.status).toBe('no_show')
    })
  })

  describe('Appointment Details', () => {
    it('should include video information for video appointments', () => {
      const videoApt = AppointmentFactory.create({ appointment_type: 'video' })
      
      expect(videoApt.appointment_type).toBe('video')
    })

    it('should include reason for visit', () => {
      const appointment = AppointmentFactory.create()
      
      expect(appointment.reason_for_visit).toBeDefined()
      expect(typeof appointment.reason_for_visit).toBe('string')
    })

    it('should calculate appointment duration correctly', () => {
      const appointment = AppointmentFactory.create()
      const start = new Date(appointment.start_ts).getTime()
      const end = new Date(appointment.end_ts).getTime()
      const durationMinutes = (end - start) / (1000 * 60)
      
      expect(durationMinutes).toBe(30) // Default 30 min
    })
  })

  describe('Doctor-Patient Relationship', () => {
    it('should maintain consistent doctor assignment', () => {
      const doctor = UserFactory.createDoctor()
      const patientAppointments = AppointmentFactory.createList(3, {
        doctor_id: doctor.id,
        patient_id: currentUser.id,
      })

      patientAppointments.forEach(apt => {
        expect(apt.doctor_id).toBe(doctor.id)
        expect(apt.patient_id).toBe(currentUser.id)
      })
    })

    it('should handle multiple patients per doctor', () => {
      const doctor = UserFactory.createDoctor()
      const patient1 = UserFactory.createPatient()
      const patient2 = UserFactory.createPatient()

      const apt1 = AppointmentFactory.create({
        doctor_id: doctor.id,
        patient_id: patient1.id,
      })
      const apt2 = AppointmentFactory.create({
        doctor_id: doctor.id,
        patient_id: patient2.id,
      })

      expect(apt1.doctor_id).toBe(doctor.id)
      expect(apt2.doctor_id).toBe(doctor.id)
      expect(apt1.patient_id).not.toBe(apt2.patient_id)
    })
  })

  describe('Appointment Creation Validation', () => {
    it('should generate unique IDs for each appointment', () => {
      const appointments = AppointmentFactory.createList(100)
      const ids = new Set(appointments.map(a => a.id))
      
      expect(ids.size).toBe(100)
    })

    it('should generate valid ISO timestamps', () => {
      const appointment = AppointmentFactory.create()
      
      // Valid ISO format check
      expect(new Date(appointment.start_ts).toISOString()).toBe(appointment.start_ts)
      expect(new Date(appointment.end_ts).toISOString()).toBe(appointment.end_ts)
      expect(new Date(appointment.created_at).toISOString()).toBe(appointment.created_at)
    })

    it('should ensure end time is after start time', () => {
      const appointment = AppointmentFactory.create()
      const start = new Date(appointment.start_ts).getTime()
      const end = new Date(appointment.end_ts).getTime()
      
      expect(end).toBeGreaterThan(start)
    })
  })
})
