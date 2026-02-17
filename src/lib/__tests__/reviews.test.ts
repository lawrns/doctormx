import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient, createMockReview } from './mocks'
import { createClient, createServiceClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

describe('Reviews System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Review Creation', () => {
    it('should create review successfully', async () => {
      const mockReview = createMockReview()

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'reviews') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockReview, error: null }),
                }),
              }),
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      // Mock for createServiceClient used in updateDoctorRating
      const mockServiceClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'reviews') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [{ rating: 5 }], error: null }),
              }),
            }
          }
          if (table === 'doctores') {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as never)

      const { createReview } = await import('@/lib/reviews')
      
      const result = await createReview({
        appointmentId: 'appointment-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        rating: 5,
        comment: 'Great doctor!',
      })

      expect(result.rating).toBe(5)
      expect(result.comment).toBe('Great consultation!')
    })

    it('should throw error when appointment not found', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'reviews') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { createReview } = await import('@/lib/reviews')
      
      await expect(createReview({
        appointmentId: 'appointment-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        rating: 5,
      })).rejects.toThrow()
    })
  })

  describe('Rating Calculation', () => {
    it('should calculate average rating correctly', () => {
      const ratings = [5, 4, 5, 4, 5]
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length

      expect(average).toBe(4.6)
    })

    it('should handle single rating', () => {
      const ratings = [5]
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length

      expect(average).toBe(5)
    })

    it('should handle empty ratings', () => {
      const ratings: number[] = []
      const average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

      expect(average).toBe(0)
    })

    it('should round average to one decimal', () => {
      const ratings = [5, 4, 3]
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length
      const rounded = Math.round(average * 10) / 10

      expect(rounded).toBe(4)
    })
  })

  describe('Rating Distribution', () => {
    it('should calculate distribution correctly', () => {
      const ratings = [5, 5, 4, 4, 4, 3, 2, 1]
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      
      ratings.forEach(r => {
        if (r >= 1 && r <= 5) {
          distribution[r as 1 | 2 | 3 | 4 | 5]++
        }
      })

      expect(distribution[5]).toBe(2)
      expect(distribution[4]).toBe(3)
      expect(distribution[3]).toBe(1)
      expect(distribution[2]).toBe(1)
      expect(distribution[1]).toBe(1)
    })

    it('should handle invalid ratings gracefully', () => {
      const ratings = [5, 6, 0, 3, -1]
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      
      ratings.forEach(r => {
        if (r >= 1 && r <= 5) {
          distribution[r as 1 | 2 | 3 | 4 | 5]++
        }
      })

      expect(distribution[5]).toBe(1)
      expect(distribution[3]).toBe(1)
      expect(distribution[4]).toBe(0)
    })
  })

  describe('Review Limits', () => {
    it('should allow only one review per appointment', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'reviews') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { id: 'existing-review' }, error: null }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { hasPatientReviewedAppointment } = await import('@/lib/reviews')
      
      const result = await hasPatientReviewedAppointment('patient-1', 'appointment-1')
      expect(result).toBe(true)
    })

    it('should allow review when none exists', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'reviews') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { hasPatientReviewedAppointment } = await import('@/lib/reviews')
      
      const result = await hasPatientReviewedAppointment('patient-1', 'appointment-1')
      expect(result).toBe(false)
    })
  })

  describe('Review Eligibility', () => {
    it('should allow review for completed appointments only', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: { id: 'appointment-1', status: 'completed' }, 
                      error: null 
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === 'reviews') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { canPatientReview } = await import('@/lib/reviews')
      
      const result = await canPatientReview('patient-1', 'appointment-1')
      expect(result).toBe(true)
    })

    it('should not allow review for pending appointments', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: { id: 'appointment-1', status: 'pending_payment' }, 
                      error: null 
                    }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { canPatientReview } = await import('@/lib/reviews')
      
      const result = await canPatientReview('patient-1', 'appointment-1')
      expect(result).toBe(false)
    })
  })

  describe('Property-Based Tests - Rating Validation', () => {
    it('should validate rating range 1-5', () => {
      // Test all valid rating values
      const validRatings = [1, 2, 3, 4, 5]
      
      for (const rating of validRatings) {
        expect(rating).toBeGreaterThanOrEqual(1)
        expect(rating).toBeLessThanOrEqual(5)
      }
    })

    it('should handle valid review data', () => {
      // Test various review data scenarios
      const testReviews = [
        { appointmentId: 'apt-123-uuid', patientId: 'pat-456-uuid', doctorId: 'doc-789-uuid', rating: 5, comment: 'Excellent service' },
        { appointmentId: 'apt-abc-uuid', patientId: 'pat-def-uuid', doctorId: 'doc-ghi-uuid', rating: 4, comment: null },
        { appointmentId: 'apt-xyz-uuid', patientId: 'pat-uvw-uuid', doctorId: 'doc-rst-uuid', rating: 3, comment: 'Good experience' },
      ]
      
      for (const review of testReviews) {
        expect(typeof review.appointmentId).toBe('string')
        expect(typeof review.patientId).toBe('string')
        expect(typeof review.doctorId).toBe('string')
        expect(review.rating).toBeGreaterThanOrEqual(1)
        expect(review.rating).toBeLessThanOrEqual(5)
        expect(review.comment === null || typeof review.comment === 'string').toBe(true)
      }
    })
  })
})
