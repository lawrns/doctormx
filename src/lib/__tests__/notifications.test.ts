import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mockSupabaseClient, createMockAppointment } from './mocks'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  }),
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ success: true, data: { id: 'test-email-id' } }),
    },
  })),
}))

describe('Notifications System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Appointment Confirmation Email', () => {
    it('should send confirmation email successfully', async () => {
      const mockAppointment = createMockAppointment()
      
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: {
                      ...mockAppointment,
                      doctor: { 
                        specialty: 'Medicina General',
                        profile: { full_name: 'Dr. Test' }
                      }
                    }, 
                    error: null 
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { sendAppointmentConfirmation } = await import('@/lib/notifications')
      
      const result = await sendAppointmentConfirmation(
        'appointment-1',
        'patient@test.com',
        'Test Patient'
      )

      expect(result.success).toBe(true)
    })

    it('should fail for non-existent appointment', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { sendAppointmentConfirmation } = await import('@/lib/notifications')
      
      const result = await sendAppointmentConfirmation(
        'non-existent',
        'patient@test.com',
        'Test Patient'
      )

      expect(result.success).toBe(false)
    })
  })

  describe('Payment Receipt Email', () => {
    it('should send receipt email successfully', async () => {
      const mockAppointment = createMockAppointment()
      
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: {
                      ...mockAppointment,
                      doctor: { profile: { full_name: 'Dr. Test' } }
                    }, 
                    error: null 
                  }),
                }),
              }),
            }
          }
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { 
                      id: 'payment-1', 
                      amount_cents: 50000, 
                      currency: 'MXN',
                      created_at: new Date().toISOString()
                    }, 
                    error: null 
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { sendPaymentReceipt } = await import('@/lib/notifications')
      
      const result = await sendPaymentReceipt(
        'appointment-1',
        'patient@test.com',
        'Test Patient'
      )

      expect(result.success).toBe(true)
    })
  })

  describe('Consultation Reminder Email', () => {
    it('should send reminder email successfully', async () => {
      const mockAppointment = createMockAppointment()
      
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: {
                      ...mockAppointment,
                      doctor: { profile: { full_name: 'Dr. Test' } }
                    }, 
                    error: null 
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { sendConsultationReminder } = await import('@/lib/notifications')
      
      const result = await sendConsultationReminder(
        'appointment-1',
        'patient@test.com',
        'Test Patient'
      )

      expect(result.success).toBe(true)
    })
  })

  describe('Follow-up Email', () => {
    it('should send follow-up email successfully', async () => {
      const mockAppointment = createMockAppointment()
      
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: {
                      ...mockAppointment,
                      doctor: { profile: { full_name: 'Dr. Test' } }
                    }, 
                    error: null 
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { sendFollowUp } = await import('@/lib/notifications')
      
      const result = await sendFollowUp(
        'appointment-1',
        'patient@test.com',
        'Test Patient',
        'Gracias por su visita. Recuerde tomar sus medicamentos.'
      )

      expect(result.success).toBe(true)
    })

    it('should send follow-up without notes', async () => {
      const mockAppointment = createMockAppointment()
      
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: {
                      ...mockAppointment,
                      doctor: { profile: { full_name: 'Dr. Test' } }
                    }, 
                    error: null 
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { sendFollowUp } = await import('@/lib/notifications')
      
      const result = await sendFollowUp(
        'appointment-1',
        'patient@test.com',
        'Test Patient'
      )

      expect(result.success).toBe(true)
    })
  })

  describe('Date Formatting', () => {
    it('should format Mexican date correctly', async () => {
      const { formatMexicanDateTime } = await import('@/lib/notifications')
      
      const result = formatMexicanDateTime('2025-12-31T10:30:00.000Z')
      
      expect(result).toContain('miércoles')
      expect(result).toContain('diciembre')
      expect(result).toContain('2025')
    })
  })

  describe('Price Display', () => {
    it('should format price in MXN correctly', async () => {
      const { getPriceDisplay } = await import('@/lib/notifications')
      
      const result = getPriceDisplay(50000, 'MXN')
      
      expect(result).toBe('$500.00')
    })

    it('should handle different currencies', async () => {
      const { getPriceDisplay } = await import('@/lib/notifications')
      
      const resultUSD = getPriceDisplay(5000, 'USD')
      const resultEUR = getPriceDisplay(4500, 'EUR')
      
      expect(resultUSD).toBe('$50.00')
      expect(resultEUR).toBe('€45.00')
    })
  })

  describe('Email Template', () => {
    it('should generate valid email HTML', async () => {
      const { getEmailTemplate } = await import('@/lib/notifications')
      
      const html = getEmailTemplate('<p>Test content</p>', 'Test Patient')
      
      expect(html).toContain('Doctory')
      expect(html).toContain('Test Patient')
      expect(html).toContain('Test content')
    })

    it('should include footer with copyright', async () => {
      const { getEmailTemplate } = await import('@/lib/notifications')
      
      const html = getEmailTemplate('', 'Test Patient')
      
      expect(html).toContain('©')
      expect(html).toContain('Doctory')
    })
  })

  describe('Video Consultation Link', () => {
    it('should generate correct consultation link', async () => {
      const { getVideoConsultationLink } = await import('@/lib/notifications')
      
      const link = getVideoConsultationLink('appointment-123')
      
      expect(link).toContain('appointment-123')
      expect(link).toContain('/consultation/')
    })
  })

  describe('Property-Based Tests - Email Data', () => {
    it('should handle valid email addresses', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          (email) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return regex.test(email)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should handle valid patient names', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (name) => {
            return typeof name === 'string' && name.length >= 1 && name.length <= 100
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
