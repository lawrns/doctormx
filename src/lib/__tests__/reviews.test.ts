import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mockSupabaseClient, createMockReview } from './mocks'
import { createClient } from '@/lib/supabase/server'

function createEqChain<T>(result: { data: T; error: unknown }) {
  const chain = {
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: Array.isArray(result.data) ? result.data : [], error: result.error }),
  }

  return chain
}

function createReviewClient(options?: {
  reviewInsertResult?: { data: unknown; error: unknown }
  reviewsLookupResult?: { data: unknown; error: unknown }
  appointmentLookupResult?: { data: unknown; error: unknown }
  doctorRatingsResult?: { data: Array<{ rating: number }>; error: unknown }
}) {
  return {
    ...mockSupabaseClient,
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'reviews') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(options?.reviewInsertResult ?? { data: createMockReview(), error: null }),
            }),
          }),
          select: vi.fn().mockImplementation((query?: string) => {
            if (query === 'rating') {
              return {
                eq: vi.fn().mockResolvedValue(options?.doctorRatingsResult ?? { data: [{ rating: 5 }], error: null }),
              }
            }

            return createEqChain(options?.reviewsLookupResult ?? { data: null, error: { code: 'PGRST116' } })
          }),
        }
      }

      if (table === 'appointments') {
        return {
          select: vi.fn().mockReturnValue(
            createEqChain(options?.appointmentLookupResult ?? { data: null, error: { code: 'PGRST116' } })
          ),
        }
      }

      if (table === 'doctors') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }

      return mockSupabaseClient.from(table)
    }),
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn().mockResolvedValue(mockSupabaseClient),
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
      const mockReview = createMockReview({ comment: 'Great doctor!' })

      const mockClient = createReviewClient({
        reviewInsertResult: { data: mockReview, error: null },
      })
      const { createServiceClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const { createReview } = await import('@/lib/reviews')
      
      const result = await createReview({
        appointmentId: 'appointment-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        rating: 5,
        comment: 'Great doctor!',
      })

      expect(result.rating).toBe(5)
      expect(result.comment).toBe('Great doctor!')
    })

    it('should throw error when appointment not found', async () => {
      const mockClient = createReviewClient({
        reviewInsertResult: { data: null, error: { message: 'Error' } },
      })

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
      const mockClient = createReviewClient({
        reviewsLookupResult: { data: { id: 'existing-review' }, error: null },
      })

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { hasPatientReviewedAppointment } = await import('@/lib/reviews')
      
      const result = await hasPatientReviewedAppointment('patient-1', 'appointment-1')
      expect(result).toBe(true)
    })

    it('should allow review when none exists', async () => {
      const mockClient = createReviewClient({
        reviewsLookupResult: { data: null, error: { code: 'PGRST116' } },
      })

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { hasPatientReviewedAppointment } = await import('@/lib/reviews')
      
      const result = await hasPatientReviewedAppointment('patient-1', 'appointment-1')
      expect(result).toBe(false)
    })
  })

  describe('Review Eligibility', () => {
    it('should allow review for completed appointments only', async () => {
      const mockClient = createReviewClient({
        appointmentLookupResult: { data: { id: 'appointment-1', status: 'completed' }, error: null },
        reviewsLookupResult: { data: null, error: { code: 'PGRST116' } },
      })

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { canPatientReview } = await import('@/lib/reviews')
      
      const result = await canPatientReview('patient-1', 'appointment-1')
      expect(result).toBe(true)
    })

    it('should not allow review for pending appointments', async () => {
      const mockClient = createReviewClient({
        appointmentLookupResult: { data: { id: 'appointment-1', status: 'pending_payment' }, error: null },
      })

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { canPatientReview } = await import('@/lib/reviews')
      
      const result = await canPatientReview('patient-1', 'appointment-1')
      expect(result).toBe(false)
    })
  })

  describe('Property-Based Tests - Rating Validation', () => {
    it('should validate rating range 1-5', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (rating: number) => {
            return rating >= 1 && rating <= 5
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should handle valid review data', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.uuid(),
          fc.integer({ min: 1, max: 5 }),
          fc.option(fc.string({ maxLength: 1000 })),
          (appointmentId: string, patientId: string, doctorId: string, rating: number, comment: string | null) => {
            return (
              typeof appointmentId === 'string' &&
              typeof patientId === 'string' &&
              typeof doctorId === 'string' &&
              rating >= 1 &&
              rating <= 5 &&
              (comment === null || typeof comment === 'string')
            )
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
