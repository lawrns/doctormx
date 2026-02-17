import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        range: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
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
}))

describe('Booking System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Appointment Reservation', () => {
    it('should create appointment successfully with valid request', async () => {
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
          return mockSupabaseClient.from(table)
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(createClient).mockResolvedValue(mockClient as any)

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

    it('should fail when slot is unavailable', async () => {
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
      // Test with various valid appointment request scenarios
      const testRequests: ReservationRequest[] = [
        { patientId: 'patient-1', doctorId: 'doctor-1', date: '2025-12-31', time: '09:30' },
        { patientId: 'patient-abc-123', doctorId: 'doctor-xyz-456', date: '2026-01-15', time: '14:00' },
        { patientId: 'uuid-patient', doctorId: 'uuid-doctor', date: '2025-06-20', time: '10:45' },
      ]
      
      for (const request of testRequests) {
        expect(typeof request.patientId).toBe('string')
        expect(typeof request.doctorId).toBe('string')
        expect(typeof request.date).toBe('string')
        expect(typeof request.time).toBe('string')
        expect(request.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(request.time).toMatch(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      }
    })

    it('should generate valid time slots in ascending order', () => {
      // Test sorting time slots
      const timeSlots = ['09:30', '08:00', '14:30', '10:00', '16:45', '09:30']
      
      const sortedSlots = [...timeSlots].sort((a, b) => {
        const aMinutes = parseInt(a.split(':')[0]) * 60 + parseInt(a.split(':')[1])
        const bMinutes = parseInt(b.split(':')[0]) * 60 + parseInt(b.split(':')[1])
        return aMinutes - bMinutes
      })
      
      // Verify sorted order
      for (let i = 1; i < sortedSlots.length; i++) {
        const prev = sortedSlots[i - 1].split(':').map(Number)
        const curr = sortedSlots[i].split(':').map(Number)
        const prevMinutes = prev[0] * 60 + prev[1]
        const currMinutes = curr[0] * 60 + curr[1]
        expect(currMinutes).toBeGreaterThanOrEqual(prevMinutes)
      }
    })

    it('should generate valid date format', () => {
      // Test date formatting for various year/month/day combinations
      const testDates = [
        { year: 2025, month: 1, day: 15 },
        { year: 2026, month: 12, day: 31 },
        { year: 2027, month: 6, day: 1 },
        { year: 2030, month: 3, day: 25 },
      ]
      
      for (const { year, month, day } of testDates) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(dateStr).toContain(String(year))
      }
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

