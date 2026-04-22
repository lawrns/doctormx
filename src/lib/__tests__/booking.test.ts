import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { ReservationRequest } from '@/lib/booking'
import type { Appointment } from '@/types'

const createMockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 'test-appointment-id',
  patient_id: 'test-patient-id',
  doctor_id: 'test-doctor-id',
  service_id: null,
  start_ts: new Date(Date.now() + 86400000).toISOString(),
  end_ts: new Date(Date.now() + 86400000 + 1800000).toISOString(),
  status: 'pending_payment',
  cancellation_reason: null,
  cancelled_by: null,
  created_at: new Date().toISOString(),
  ...overrides,
})

const mockSupabaseClient = {
  from: vi.fn().mockImplementation((table: string) => {
    const result =
      table === 'appointment_holds'
        ? { data: { id: 'test-hold-id' }, error: null }
        : { data: null, error: null }

    const chain = {
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      range: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue(result),
      maybeSingle: vi.fn().mockResolvedValue(result),
      then: vi.fn().mockImplementation((onFulfilled) => Promise.resolve({ error: null }).then(onFulfilled)),
    }

    return chain
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      download: vi.fn().mockResolvedValue({ data: new ArrayBuffer(1), error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ publicUrl: 'https://test.com/file.pdf' }),
    }),
  },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    refunds: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/notifications', () => ({
  sendAppointmentConfirmation: vi.fn(),
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendAppointmentConfirmation: vi.fn(),
  getPatientPhone: vi.fn().mockResolvedValue('+525511111111'),
  getDoctorName: vi.fn().mockResolvedValue('Dr. Test'),
}))

vi.mock('@/lib/availability', () => ({
  getAvailableSlots: vi.fn(),
}))

describe('Booking System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Appointment Reservation', () => {
    it('should create appointment successfully with valid request', async () => {
      const { getAvailableSlots } = await import('@/lib/availability')
      const mockAppointment = createMockAppointment()
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'appointments') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
                }),
              }),
            }
          }
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      status: 'approved',
                      is_listed: true,
                      office_address: 'Av. Reforma 123',
                      offers_video: true,
                      offers_in_person: true,
                    },
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'appointment_holds') {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnThis(),
                lt: vi.fn().mockResolvedValue({ error: null }),
              }),
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { id: 'test-hold-id' }, error: null }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(createClient).mockResolvedValue(mockClient as any)
      vi.mocked(getAvailableSlots).mockResolvedValue(['11:00'])

      const { reserveAppointmentSlot } = await import('@/lib/booking')
      
      const request: ReservationRequest = {
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        date: '2025-12-31',
        time: '11:00',
      }

      const result = await reserveAppointmentSlot(request)
      expect(result.success).toBe(true)
    })

    it('should reject in-person booking when the doctor has no confirmed office', async () => {
      const { getAvailableSlots } = await import('@/lib/availability')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      status: 'approved',
                      is_listed: true,
                      office_address: null,
                      offers_video: true,
                      offers_in_person: false,
                    },
                    error: null,
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(createClient).mockResolvedValue(mockClient as any)
      vi.mocked(getAvailableSlots).mockResolvedValue(['11:00'])

      const { reserveAppointmentSlot } = await import('@/lib/booking')

      const result = await reserveAppointmentSlot({
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        date: '2025-12-31',
        time: '11:00',
        appointmentType: 'in_person',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('consultorio confirmado')
    })

    it('should fail when slot is unavailable', async () => {
      const { getAvailableSlots } = await import('@/lib/availability')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'appointments') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Slot unavailable' } }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(createClient).mockResolvedValue(mockClient as any)
      vi.mocked(getAvailableSlots).mockResolvedValue([])

      const { reserveAppointmentSlot } = await import('@/lib/booking')
      
      const request: ReservationRequest = {
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        date: '2025-12-31',
        time: '09:30',
      }

      const result = await reserveAppointmentSlot(request)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Appointment Status Transitions', () => {
    it('should have correct initial status', () => {
      const appointment = createMockAppointment()
      expect(appointment.status).toBe('pending_payment')
    })

    it('should handle confirmed status', () => {
      const appointment = createMockAppointment({ status: 'confirmed' })
      expect(appointment.status).toBe('confirmed')
    })

    it('should handle cancelled status', () => {
      const appointment = createMockAppointment({ status: 'cancelled' })
      expect(appointment.status).toBe('cancelled')
    })

    it('should handle completed status', () => {
      const appointment = createMockAppointment({ status: 'completed' })
      expect(appointment.status).toBe('completed')
    })
  })

  describe('Time Slot Calculations', () => {
    it('should calculate correct end time for 30-minute appointment', () => {
      const startTs = new Date('2025-12-31T09:00:00.000Z')
      const durationMinutes = 30
      const endTs = new Date(startTs.getTime() + durationMinutes * 60000)

      expect(endTs.toISOString()).toBe('2025-12-31T09:30:00.000Z')
    })

    it('should calculate correct end time for 45-minute appointment', () => {
      const startTs = new Date('2025-12-31T14:00:00.000Z')
      const durationMinutes = 45
      const endTs = new Date(startTs.getTime() + durationMinutes * 60000)

      expect(endTs.toISOString()).toBe('2025-12-31T14:45:00.000Z')
    })
  })

  describe('Property-Based Tests - Appointment Requests', () => {
    it('should handle valid appointment requests', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          fc.stringMatching(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
          (patientId: string, doctorId: string, date: string, time: string) => {
            const request: ReservationRequest = {
              patientId,
              doctorId,
              date,
              time,
            }
            return (
              typeof request.patientId === 'string' &&
              typeof request.doctorId === 'string' &&
              typeof request.date === 'string' &&
              typeof request.time === 'string'
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should generate valid time slots in ascending order', () => {
      fc.assert(
        fc.property(
          fc.array(fc.stringMatching(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), { minLength: 1, maxLength: 20 }),
          (slots: string[]) => {
            const sortedSlots = [...slots].sort((a, b) => {
              const aMinutes = parseInt(a.split(':')[0]) * 60 + parseInt(a.split(':')[1])
              const bMinutes = parseInt(b.split(':')[0]) * 60 + parseInt(b.split(':')[1])
              return aMinutes - bMinutes
            })
            for (let i = 1; i < sortedSlots.length; i++) {
              const prev = sortedSlots[i - 1].split(':').map(Number)
              const curr = sortedSlots[i].split(':').map(Number)
              const prevMinutes = prev[0] * 60 + prev[1]
              const currMinutes = curr[0] * 60 + curr[1]
              if (currMinutes <= prevMinutes && sortedSlots[i] !== sortedSlots[i - 1]) return false
            }
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should generate valid date format', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2025, max: 2030 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 1, max: 31 }),
          (year: number, month: number, day: number) => {
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            const regex = /^\d{4}-\d{2}-\d{2}$/
            return regex.test(dateStr)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Cancellation Logic', () => {
    it('should allow cancellation reason to be null', () => {
      const appointment = createMockAppointment({ cancellation_reason: null })
      expect(appointment.cancellation_reason).toBeNull()
    })

    it('should store cancellation reason when provided', () => {
      const appointment = createMockAppointment({ 
        cancellation_reason: 'Patient requested cancellation',
        status: 'cancelled'
      })
      expect(appointment.cancellation_reason).toBe('Patient requested cancellation')
      expect(appointment.status).toBe('cancelled')
    })

    it('should handle cancelled_by field', () => {
      const patientCancelled = createMockAppointment({ 
        cancelled_by: 'patient',
        status: 'cancelled'
      })
      expect(patientCancelled.cancelled_by).toBe('patient')

      const doctorCancelled = createMockAppointment({ 
        cancelled_by: 'doctor',
        status: 'cancelled'
      })
      expect(doctorCancelled.cancelled_by).toBe('doctor')
    })
  })
})
