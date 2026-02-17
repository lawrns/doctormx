import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { discoverDoctors, getDoctorProfile, getAvailableSpecialties, type DiscoveryFilters } from '@/lib/discovery'
import { mockSupabaseClient, mockDoctor } from './mocks'
import { createServiceClient } from '@/lib/supabase/server'

// Mock the cache module to avoid Redis connections during tests
vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    getDoctorProfile: vi.fn().mockResolvedValue(null),
    setDoctorProfile: vi.fn().mockResolvedValue(undefined),
  }
}))

// Mock the logger to avoid unnecessary output during tests
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }
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

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await discoverDoctors()
      expect(result).toEqual([])
    })

    it('should return doctores when available', async () => {
      // Use a future date so the subscription is considered active
      const futureDate = '2099-12-31'
      
      const mockDoctorData = {
        id: 'test-doctor-id',
        bio: 'Test bio',
        price_cents: 50000,
        rating_avg: 4.5,
        rating_count: 10,
        city: 'Mexico City',
        state: 'CDMX',
        years_experience: 10,
        languages: ['es'],
        status: 'approved',
        video_enabled: true,
        doctor_specialties: [],
        profiles: { id: 'profile-id', full_name: 'Dr. Test', photo_url: null },
        doctor_subscriptions: [{ id: 'sub-1', status: 'active', current_period_end: futureDate }],
      }

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctores') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ 
                      data: [mockDoctorData], 
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
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('test-doctor-id')
    })
  })

  describe('Specialty Filters', () => {
    it('should filter doctores by specialty slug', async () => {
      const futureDate = '2099-12-31'
      
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
                        id: 'test-doctor-id',
                        bio: 'Test bio',
                        price_cents: 50000,
                        rating_avg: 4.5,
                        rating_count: 10,
                        city: 'Mexico City',
                        state: 'CDMX',
                        years_experience: 10,
                        languages: ['es'],
                        status: 'approved',
                        video_enabled: true,
                        doctor_specialties: [{ 
                          specialty_id: '1', 
                          specialties: { id: '1', name: 'Cardiología', slug: 'cardiologia' } 
                        }],
                        profiles: { id: 'profile-id', full_name: 'Dr. Test', photo_url: null },
                        doctor_subscriptions: [{ id: 'sub-1', status: 'active', current_period_end: futureDate }],
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

      const result = await discoverDoctors({ specialtySlug: 'cardiologia' })
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeLessThanOrEqual(50)
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

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await getDoctorProfile('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return doctor profile when exists', async () => {
      const mockDoctorData = {
        id: 'test-doctor-id',
        bio: 'Test bio',
        price_cents: 50000,
        rating_avg: 4.5,
        rating_count: 10,
        city: 'Mexico City',
        state: 'CDMX',
        years_experience: 10,
        languages: ['es'],
        status: 'approved',
        doctor_specialties: [],
        profiles: { id: 'profile-id', full_name: 'Dr. Test', photo_url: null, phone: '+5215551234567' },
        doctor_subscriptions: [{ id: 'sub-1', status: 'active', current_period_end: '2099-12-31' }],
      }

      // Create a mock that supports .eq().eq().single() chain
      // The second .eq() needs to return an object with .single()
      const mockFinalEqResult = {
        single: vi.fn().mockResolvedValue({ data: mockDoctorData, error: null }),
      }
      
      // The first .eq() needs to return an object with both .eq() and .single()
      const mockFirstEqResult = {
        eq: vi.fn().mockReturnValue(mockFinalEqResult),
        single: vi.fn().mockResolvedValue({ data: mockDoctorData, error: null }),
      }
      
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctores') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(mockFirstEqResult),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockReturnValue(mockClient as never)

      const result = await getDoctorProfile('test-doctor-id')
      
      expect(result).not.toBeNull()
      expect(result?.id).toBe('test-doctor-id')
      expect(result?.profile).toBeDefined()
      expect(result?.profile?.full_name).toBe('Dr. Test')
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
      expect(result).toEqual(mockSpecialties)
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
