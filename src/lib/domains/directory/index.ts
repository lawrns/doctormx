// Directory Domain Module
// Input: Doctor data, search queries, claim requests
// Process: Profile management, search, SEO page generation
// Output: Doctor profiles, search results, SEO pages

import { createServiceClient } from '@/lib/supabase/server'

export const DIRECTORY_CONFIG = {
  // Search settings
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SEARCH_DEBOUNCE_MS: 300,
  // Profile settings
  UNCLAIMED_PROFILE_VISIBILITY_DAYS: 180,
  VERIFICATION_EXPIRY_DAYS: 365,
  // SEO settings
  CITIES_TO_INDEX: 150,
  SPECIALTIES_COUNT: 50,
} as const

export type ProfileClaimStatus =
  | 'unclaimed'
  | 'claim_pending'
  | 'verification_required'
  | 'claimed'
  | 'rejected'

export interface DirectoryDoctor {
  id: string
  user_id?: string
  full_name: string
  specialty: string
  city: string
  state: string
  cedula_profesional?: string
  conacem_verified: boolean
  claim_status: ProfileClaimStatus
  profile_completeness: number
  last_active_at?: string
  created_at: string
}

export interface UnclaimedProfile {
  id: string
  full_name: string
  cedula_profesional?: string
  specialty?: string
  city?: string
  state?: string
  data_source: string
  claim_status: ProfileClaimStatus
  slug?: string
  page_views: number
  created_at: string
}

export interface DirectorySearchParams {
  query?: string
  specialty?: string
  city?: string
  state?: string
  min_rating?: number
  accepts_insurance?: boolean
  video_enabled?: boolean
  page?: number
  limit?: number
  sort_by?: 'rating' | 'reviews' | 'price' | 'distance'
}

export interface DirectorySearchResult {
  doctores: DirectoryDoctor[]
  total: number
  page: number
  pages: number
  filters_applied: Partial<DirectorySearchParams>
}

/**
 * Search the doctor directory (both claimed and unclaimed profiles)
 */
export async function searchDirectory(
  params: DirectorySearchParams
): Promise<DirectorySearchResult> {
  const supabase = await createServiceClient()
  
  const page = params.page || 1
  const limit = Math.min(params.limit || DIRECTORY_CONFIG.DEFAULT_PAGE_SIZE, DIRECTORY_CONFIG.MAX_PAGE_SIZE)
  const offset = (page - 1) * limit
  
  // Build query for verified doctores
  let query = supabase
    .from('doctores')
    .select('*', { count: 'exact' })
    .eq('license_status', 'verified')
  
  if (params.query) {
    query = query.ilike('full_name', `%${params.query}%`)
  }
  if (params.specialty) {
    query = query.contains('specialties', [params.specialty])
  }
  if (params.city) {
    query = query.eq('city', params.city)
  }
  if (params.state) {
    query = query.eq('state', params.state)
  }
  if (params.min_rating) {
    query = query.gte('rating_avg', params.min_rating)
  }
  
  // Sort
  if (params.sort_by === 'rating') {
    query = query.order('rating_avg', { ascending: false })
  } else if (params.sort_by === 'reviews') {
    query = query.order('total_reviews', { ascending: false })
  } else {
    query = query.order('rating_avg', { ascending: false })
  }
  
  query = query.range(offset, offset + limit - 1)
  
  const { data, error, count } = await query
  
  if (error) {
    throw new Error(`Search failed: ${error.message}`)
  }
  
  return {
    doctores: (data || []) as unknown as DirectoryDoctor[],
    total: count ?? 0,
    page,
    pages: Math.ceil((count ?? 0) / limit),
    filters_applied: params,
  }
}

/**
 * Get unclaimed profiles for directory pages
 */
export async function getUnclaimedProfiles(
  params: { specialty?: string; city?: string; limit?: number }
): Promise<UnclaimedProfile[]> {
  const supabase = await createServiceClient()
  
  let query = supabase
    .from('unclaimed_doctor_profiles')
    .select('*')
    .eq('claim_status', 'unclaimed')
    .order('page_views', { ascending: false })
    .limit(params.limit || 20)
  
  if (params.specialty) {
    query = query.eq('specialty', params.specialty)
  }
  if (params.city) {
    query = query.eq('city', params.city)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to get unclaimed profiles: ${error.message}`)
  }
  
  return data as UnclaimedProfile[]
}

/**
 * Get profile by slug (for SEO pages)
 */
export async function getProfileBySlug(slug: string): Promise<UnclaimedProfile | null> {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .from('unclaimed_doctor_profiles')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to get profile: ${error.message}`)
  }
  
  return data as UnclaimedProfile
}

/**
 * Get all cities with doctor presence (for SEO)
 */
export async function getDirectoryCities(): Promise<{ city: string; state: string; count: number }[]> {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .rpc('get_directory_cities')
  
  if (error) {
    // Fallback if RPC doesn't exist
    const { data: fallback } = await supabase
      .from('doctores')
      .select('city, state')
      .eq('license_status', 'verified')
      .not('city', 'is', null)
    
    // Group by city
    const cityMap = new Map<string, { city: string; state: string; count: number }>()
    for (const doc of fallback || []) {
      const key = `${doc.city}-${doc.state}`
      const existing = cityMap.get(key)
      if (existing) {
        existing.count++
      } else {
        cityMap.set(key, { city: doc.city, state: doc.state, count: 1 })
      }
    }
    
    return Array.from(cityMap.values()).sort((a, b) => b.count - a.count)
  }
  
  return data
}

/**
 * Get all specialties with doctor count (for SEO)
 */
export async function getDirectorySpecialties(): Promise<{ specialty: string; count: number }[]> {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .from('specialties')
    .select('name, slug')
    .order('name')
  
  if (error) {
    throw new Error(`Failed to get specialties: ${error.message}`)
  }
  
  return (data || []).map(s => ({ specialty: s.name, count: 0 }))
}

