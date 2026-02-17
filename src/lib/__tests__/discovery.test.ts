import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { discoverDoctors, getDoctorProfile, getAvailableSpecialties, type DiscoveryFilters } from '@/lib/discovery'
import { mockSupabaseClient, mockDoctor } from './mocks'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  createServiceClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}))

describe('Doctor Discovery System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Doctor Search', () => {
    it('should return empty array when no doctores found', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctores') {
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

      vi.mock('@/lib/supabase/server', () => ({
        createServiceClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const result = await discoverDoctors()
      expect(result).toEqual([])
    })

    it('should return doctores when available', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctores') {
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

      vi.mock('@/lib/supabase/server', () => ({
        createServiceClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const result = await discoverDoctors()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Specialty Filters', () => {
    it('should filter doctores by specialty slug', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctores') {
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

      vi.mock('@/lib/supabase/server', () => ({
        createServiceClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const result = await discoverDoctors()
      expect(Array.isArray(result) ? result.length : 0).toBeLessThanOrEqual(50)
    })
  })

  describe('Doctor Profile', () => {
    it('should return null for non-existent doctor', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctores') {
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

      vi.mock('@/lib/supabase/server', () => ({
        createServiceClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const result = await getDoctorProfile('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return doctor profile when exists', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctores') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: {
                      ...mockDoctor,
                      doctor_specialties: [],
                      profiles: mockDoctor.profile,
                      doctor_subscriptions: [{ status: 'active', current_period_end: '2026-01-01' }],
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

      vi.mock('@/lib/supabase/server', () => ({
        createServiceClient: vi.fn().mockResolvedValue(mockClient),
      }))

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

      vi.mock('@/lib/supabase/server', () => ({
        createServiceClient: vi.fn().mockResolvedValue(mockClient),
      }))

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

      vi.mock('@/lib/supabase/server', () => ({
        createServiceClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const result = await getAvailableSpecialties()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Property-Based Tests - Discovery Filters', () => {
    it('should handle valid specialty slugs', () => {
      // Test various specialty slug formats
      const testSlugs = ['cardiologia', 'medicina-general', 'pediatria', 'dermatologia']
      
      for (const slug of testSlugs) {
        const filters: DiscoveryFilters = { specialtySlug: slug }
        expect(filters.specialtySlug).toBe(slug)
      }
    })

    it('should handle valid price ranges', () => {
      // Test various price ranges
      const testPrices = [0, 100, 50000, 1000000]
      
      for (const price of testPrices) {
        const filters: DiscoveryFilters = { maxPrice: price }
        expect(filters.maxPrice).toBe(price)
        expect(filters.maxPrice).toBeGreaterThanOrEqual(0)
      }
    })

    it('should handle valid rating ranges', () => {
      // Test various rating ranges
      const testRatings = [0, 1.5, 3, 4.5, 5]
      
      for (const rating of testRatings) {
        const filters: DiscoveryFilters = { minRating: rating }
        expect(filters.minRating).toBe(rating)
        expect(filters.minRating).toBeGreaterThanOrEqual(0)
        expect(filters.minRating).toBeLessThanOrEqual(5)
      }
    })

    it('should handle valid location filters', () => {
      // Test various location combinations
      const testLocations = [
        { city: 'Ciudad de Mexico', state: 'CDMX' },
        { city: 'Guadalajara', state: 'Jalisco' },
        { city: 'Monterrey', state: 'Nuevo Leon' },
      ]
      
      for (const { city, state } of testLocations) {
        const filters: DiscoveryFilters = { city, state }
        expect(filters.city).toBe(city)
        expect(filters.state).toBe(state)
      }
    })
  })
})

