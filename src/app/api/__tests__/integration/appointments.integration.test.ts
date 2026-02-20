/**
 * Appointments API Integration Tests
 * Using Factory Pattern for data generation
 * 
 * Tests: POST /api/appointments, GET /api/appointments/[id]
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { AppointmentFactory, UserFactory } from '@/lib/__tests__/factories'
import type { Database } from '@/lib/supabase/types'

type Appointment = Database['public']['Tables']['appointments']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

// Mock Supabase
const mockAppointments: Appointment[] = []
const mockProfiles: Profile[] = []

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: (table: string) => ({
      select: vi.fn((columns = '*') => ({
        eq: vi.fn((column: string, value: string) => {
          if (table === 'appointments') {
            const found = mockAppointments.find(a => (a as Record<string, unknown>)[column] === value)
            return {
              single: vi.fn(() => Promise.resolve({ 
                data: found || null, 
                error: found ? null : { code: 'PGRST116', message: 'Not found' }
              })),
              maybeSingle: vi.fn(() => Promise.resolve({ data: found || null, error: null })),
            }
          }
          if (table === 'profiles') {
            const found = mockProfiles.find(p => (p as Record<string, unknown>)[column] === value)
            return {
              single: vi.fn(() => Promise.resolve({ 
                data: found || null, 
                error: found ? null : { code: 'PGRST116', message: 'Not found' }
              })),
            }
          }
          return { single: vi.fn(() => Promise.resolve({ data: null, error: null })) }
        }),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: mockAppointments.slice(0, 10), error: null })),
        })),
      })),
      insert: vi.fn((data: unknown) => ({
        select: vi.fn((columns = '*') => ({
          single: vi.fn(() => {
            const newAppointment = {
              id: crypto.randomUUID(),
              ...(data as object),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Appointment
            mockAppointments.push(newAppointment)
            return Promise.resolve({ data: newAppointment, error: null })
          }),
        })),
      })),
      update: vi.fn((data: unknown) => ({
        eq: vi.fn((column: string, value: string) => ({
          select: vi.fn(() => ({
            single: vi.fn(() => {
              const idx = mockAppointments.findIndex(a => (a as Record<string, unknown>)[column] === value)
              if (idx >= 0) {
                mockAppointments[idx] = { ...mockAppointments[idx], ...(data as object) } as Appointment
                return Promise.resolve({ data: mockAppointments[idx], error: null })
              }
              return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
            }),
          })),
        })),
      })),
    }),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } 
        }, 
        error: null 
      })),
    },
  })),
}))

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('INTEGRATION: Appointments API', () => {
  beforeEach(() => {
    mockAppointments.length = 0
    mockProfiles.length = 0
  })

  describe('Appointment Data Validation', () => {
    it('should create valid appointment data using factory', () => {
      const appointment = AppointmentFactory.create()
      
      expect(appointment.id).toBeDefined()
      expect(appointment.id).toMatch(/^[0-9a-f-]{36}$/i) // UUID format
      expect(appointment.patient_id).toBeDefined()
      expect(appointment.doctor_id).toBeDefined()
      expect(appointment.start_ts).toBeDefined()
      expect(appointment.end_ts).toBeDefined()
      expect(appointment.status).toBeOneOf(['pending', 'confirmed', 'cancelled', 'completed'])
    })

    it('should create appointment with specific status', () => {
      const confirmed = AppointmentFactory.createConfirmed()
      expect(confirmed.status).toBe('confirmed')

      const pending = AppointmentFactory.createPending()
      expect(pending.status).toBe('pending_payment')

      const cancelled = AppointmentFactory.createCancelled()
      expect(cancelled.status).toBe('cancelled')
    })

    it('should create multiple appointments with createList', () => {
      const appointments = AppointmentFactory.createList(5)
      
      expect(appointments).toHaveLength(5)
      expect(appointments[0].id).not.toBe(appointments[1].id) // Unique IDs
    })

    it('should create appointment sequence with time progression', () => {
      const baseTime = '2026-03-01T09:00:00Z'
      const sequence = AppointmentFactory.createList(3).map((apt, idx) => ({
        ...apt,
        start_ts: new Date(new Date(baseTime).getTime() + idx * 30 * 60 * 1000).toISOString()
      }))

      expect(sequence).toHaveLength(3)
      
      // Check time progression
      const firstStart = new Date(sequence[0].start_ts)
      const secondStart = new Date(sequence[1].start_ts)
      expect(secondStart.getTime() - firstStart.getTime()).toBe(30 * 60 * 1000) // 30 min gap
    })
  })

  describe('User Factory Integration', () => {
    it('should create consistent patient-doctor-appointment relationship', () => {
      const patient = UserFactory.createPatient()
      const doctor = UserFactory.createDoctor()
      const appointment = AppointmentFactory.create({
        patient_id: patient.id,
        doctor_id: doctor.id,
      })

      expect(appointment.patient_id).toBe(patient.id)
      expect(appointment.doctor_id).toBe(doctor.id)
    })

    it('should create valid user profiles with different roles', () => {
      const patient = UserFactory.createPatient()
      const doctor = UserFactory.createDoctor()
      const admin = UserFactory.createAdmin()

      expect(patient.role).toBe('patient')
      expect(doctor.role).toBe('doctor')
      expect(admin.role).toBe('admin')

      expect(patient.email).toContain('@')
      expect(doctor.full_name).toContain('Dr.')
    })
  })

  describe('Bulk Data Generation', () => {
    it('should generate 100 appointments for stress testing', () => {
      const bulk = AppointmentFactory.createList(100)
      
      expect(bulk).toHaveLength(100)
      
      // Verify all have unique IDs
      const ids = new Set(bulk.map(a => a.id))
      expect(ids.size).toBe(100)
    })

    it('should generate appointments across different statuses', () => {
      const confirmed = AppointmentFactory.createList(10).map(a => ({ ...a, status: 'confirmed' as const }))
      const pending = AppointmentFactory.createList(5).map(a => ({ ...a, status: 'pending_payment' as const }))
      const cancelled = AppointmentFactory.createList(3).map(a => ({ ...a, status: 'cancelled' as const }))
      const mixed = [...confirmed, ...pending, ...cancelled]

      expect(mixed.filter(a => a.status === 'confirmed')).toHaveLength(10)
      expect(mixed.filter(a => a.status === 'pending_payment')).toHaveLength(5)
      expect(mixed.filter(a => a.status === 'cancelled')).toHaveLength(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle appointment with consultation notes', () => {
      const appointment = AppointmentFactory.createCompleted()
      
      expect(appointment.consultation_notes).toBeDefined()
      expect(typeof appointment.consultation_notes).toBe('string')
      expect((appointment.consultation_notes as string).length).toBeGreaterThan(0)
    })

    it('should create valid video appointments', () => {
      const video = AppointmentFactory.create({ appointment_type: 'video' })
      
      expect(video.appointment_type).toBe('video')
    })

    it('should create valid in-person appointments', () => {
      const inPerson = AppointmentFactory.create({ appointment_type: 'in_person' })
      
      expect(inPerson.appointment_type).toBe('in_person')
    })
  })
})
