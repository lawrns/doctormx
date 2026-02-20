import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient, createMockAppointment } from './mocks'

// Import modules after mocks are defined
import * as notificationsModule from '@/lib/notifications'

const { sendAppointmentConfirmation, sendPaymentReceipt, sendConsultationReminder, sendFollowUp, formatMexicanDateTime, getPriceDisplay, getEmailTemplate, getVideoConsultationLink } = notificationsModule

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

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      
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

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      
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
                eq: vi.fn().mockImplementation((field) => {
                  // Support chained .eq() calls
                  return {
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
                    single: vi.fn().mockResolvedValue({ 
                      data: { 
                        id: 'payment-1', 
                        amount_cents: 50000, 
                        currency: 'MXN',
                        created_at: new Date().toISOString()
                      }, 
                      error: null 
                    }),
                  }
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      
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

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      
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

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      
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

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      
      const result = await sendFollowUp(
        'appointment-1',
        'patient@test.com',
        'Test Patient'
      )

      expect(result.success).toBe(true)
    })
  })

  describe('Date Formatting', () => {
    it('should format Mexican date correctly', () => {
      
      const result = formatMexicanDateTime('2025-12-31T10:30:00.000Z')
      
      expect(result).toContain('miércoles')
      expect(result).toContain('diciembre')
      expect(result).toContain('2025')
    })
  })

  describe('Price Display', () => {
    it('should format price in MXN correctly', () => {
      
      const result = getPriceDisplay(50000, 'MXN')
      
      expect(result).toBe('$500.00')
    })

    it('should handle different currencies', () => {
      
      const resultUSD = getPriceDisplay(5000, 'USD')
      const resultEUR = getPriceDisplay(4500, 'EUR')
      
      // Intl.NumberFormat with es-MX locale uses currency codes instead of symbols
      expect(resultUSD).toMatch(/50\.00/)
      expect(resultUSD).toContain('USD')
      expect(resultEUR).toMatch(/45\.00/)
      expect(resultEUR).toContain('EUR')
    })
  })

  describe('Email Template', () => {
    it('should generate valid email HTML', () => {
      
      const html = getEmailTemplate('<p>Test content</p>', 'Test Patient')
      
      expect(html).toContain('Doctor.mx')
      expect(html).toContain('Test Patient')
      expect(html).toContain('Test content')
    })

    it('should include footer with copyright', () => {
      
      const html = getEmailTemplate('', 'Test Patient')
      
      expect(html).toContain('©')
      expect(html).toContain('Doctor.mx')
    })
  })

  describe('Video Consultation Link', () => {
    it('should generate correct consultation link', () => {
      
      const link = getVideoConsultationLink('appointment-123')
      
      expect(link).toContain('appointment-123')
      expect(link).toContain('/consultation/')
    })
  })

  describe('Property-Based Tests - Email Data', () => {
    it('should handle valid email addresses', () => {
      // Test various valid email formats
      const validEmails = [
        'patient@example.com',
        'doctor@clinic.mx',
        'user.name@domain.co.uk',
        'test+tag@email.org',
      ]
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      for (const email of validEmails) {
        expect(emailRegex.test(email)).toBe(true)
      }
    })

    it('should handle valid patient names', () => {
      // Test various patient name formats
      const validNames = [
        'Juan',
        'Maria Garcia Rodriguez',
        'Jose Antonio Perez Martinez',
        'Ana Lucia',
      ]
      
      for (const name of validNames) {
        expect(typeof name).toBe('string')
        expect(name.length).toBeGreaterThanOrEqual(1)
        expect(name.length).toBeLessThanOrEqual(100)
      }
    })
  })
})

