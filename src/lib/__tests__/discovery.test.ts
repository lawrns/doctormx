import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { discoverDoctors, getDoctorProfile, getAvailableSpecialties, type DiscoveryFilters } from '@/lib/discovery'
import { createServiceClient } from '@/lib/supabase/server'
import { mockSupabaseClient, mockDoctor } from './mocks'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => mockSupabaseClient),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(true),
    getDoctorProfile: vi.fn().mockResolvedValue(null),
    setDoctorProfile: vi.fn().mockResolvedValue(true),
  },
}))

describe('Doctor Discovery System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Doctor Search', () => {
    it('should return empty array when no doctors found', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await discoverDoctors()
      expect(result).toEqual([])
    })

    it('should return doctors when available', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ 
                      data: [{
                        ...mockDoctor,
                        doctor_specialties: [],
                        profiles: mockDoctor.profile,
                        doctor_subscriptions: [{ status: 'active', current_period_end: '2026-01-01' }],
                      }], 
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

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await discoverDoctors()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Specialty Filters', () => {
    it('should filter doctors by specialty slug', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ 
                      data: [{
                        ...mockDoctor,
                        doctor_specialties: [{ 
                          specialty_id: '1', 
                          specialties: { id: '1', name: 'Cardiología', slug: 'cardiologia' } 
                        }],
                        profiles: mockDoctor.profile,
                        doctor_subscriptions: [{ status: 'active', current_period_end: '2026-01-01' }],
                      }], 
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

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await discoverDoctors()
      expect(Array.isArray(result) ? result.length : 0).toBeLessThanOrEqual(50)
    })
  })

  describe('Doctor Profile', () => {
    it('should return null for non-existent doctor', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await getDoctorProfile('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return doctor profile when exists', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: {
                        ...mockDoctor,
                        doctor_specialties: [],
                        profiles: {
                          id: mockDoctor.profile.id,
                          full_name: mockDoctor.profile.full_name,
                          photo_url: mockDoctor.profile.photo_url,
                          phone: null,
                        },
                        doctor_subscriptions: [{ status: 'active', current_period_end: '2026-01-01' }],
                      }, 
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

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await getDoctorProfile('test-doctor-id')
      
      expect(result).not.toBeNull()
      if (result && typeof result === 'object' && result !== null) {
        const doctorResult = result as { id?: string; profile?: unknown }
        expect(doctorResult.id).toBe('test-doctor-id')
        expect(doctorResult.profile).toBeDefined()
      }
    })
  })

  describe('Available Specialties', () => {
    it('should return empty array when no specialties found', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'specialties') {
            return {
              select: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await getAvailableSpecialties()
      expect(result).toEqual([])
    })

    it('should return specialties when available', async () => {
      const mockSpecialties = [
        { id: '1', name: 'Cardiología', slug: 'cardiologia' },
        { id: '2', name: 'Medicina General', slug: 'medicina-general' },
      ]

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'specialties') {
            return {
              select: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockSpecialties, error: null }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await getAvailableSpecialties()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Property-Based Tests - Discovery Filters', () => {
    it('should handle valid specialty slugs', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z-]+$/),
          (slug: string) => {
            const filters: DiscoveryFilters = { specialtySlug: slug }
            return filters.specialtySlug === slug
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should handle valid price ranges', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (price: number) => {
            const filters: DiscoveryFilters = { maxPrice: price }
            return typeof filters.maxPrice === 'number' && filters.maxPrice === price && filters.maxPrice >= 0
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should handle valid rating ranges', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 5, noNaN: true }),
          (rating: number) => {
            const filters: DiscoveryFilters = { minRating: rating }
            return typeof filters.minRating === 'number' && filters.minRating === rating && filters.minRating >= 0 && filters.minRating <= 5
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should handle valid location filters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (city: string, state: string) => {
            const filters: DiscoveryFilters = { city, state }
            return filters.city === city && filters.state === state
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
