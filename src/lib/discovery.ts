// Sistema de Descubrimiento - Se explica solo
// Input: Preferencias del paciente (especialidad, ubicación, precio)
// Proceso: Filtrar catálogo → Ordenar por relevancia
// Output: Lista de doctores que cumplen criterios

import { createServiceClient } from '@/lib/supabase/server'
import { cache } from '@/lib/cache'
import { logger } from '@/lib/observability/logger'
import { getSponsoredDoctors } from '@/lib/sponsored'

export type DiscoveryFilters = {
  specialtySlug?: string
  city?: string
  citySlug?: string
  state?: string
  districtId?: string
  insuranceSlug?: string
  maxPrice?: number
  minRating?: number
  searchQuery?: string
  sortBy?: 'relevance' | 'rating' | 'price' | 'price_asc' | 'price_desc' | 'experience'
  sortOrder?: 'asc' | 'desc'
  appointmentType?: 'all' | 'video' | 'in_person'
  onlineOnly?: boolean
  minExperience?: number
  gender?: string
  language?: string
  limit?: number
  offset?: number
}

export interface PaginatedDoctorResult {
  data: PublicDoctorSummary[]
  total: number
  offset: number
  limit: number
}

export interface PublicDoctorSummary {
  id: string
  status: string
  bio: string | null
  languages: string[]
  years_experience: number | null
  city: string | null
  state: string | null
  country: string
  price_cents: number
  currency: string
  rating_avg: number
  rating_count: number
  license_number: string | null
  video_enabled: boolean
  office_address: string | null
  offers_video: boolean
  offers_in_person: boolean
  verification: DoctorVerificationSummary | null
  profile: {
    id: string
    full_name: string
    photo_url: string | null
  } | null
  specialties: Array<{
    id: string
    name: string | undefined
    slug: string | undefined
  }>
  sponsored_position?: number
}

export interface PaginatedDoctorResult {
  data: PublicDoctorSummary[]
  total: number
  offset: number
  limit: number
}

// Type for the raw doctor data from Supabase
type RawDoctor = {
  id: string
  bio: string | null
  price_cents: number
  rating_avg: number | null
  rating_count: number | null
  city: string | null
  state: string | null
  years_experience: number | null
  languages: string[] | null
  status: string
  license_number: string | null
  video_enabled: boolean | null
  office_address: string | null
  offers_video: boolean | null
  offers_in_person: boolean | null
  doctor_specialties: Array<{
    specialty_id: string
    specialties: {
      id: string
      name: string
      slug: string
    } | null
  }> | null
  profiles: {
    id: string
    full_name: string
    photo_url: string | null
    phone?: string | null
  } | null
  doctor_subscriptions: Array<{
    id: string
    status: string
    current_period_end: string
  }> | null
  doctor_verifications?: Array<{
    cedula: string | null
    sep_verified: boolean | null
    verified_at: string | null
    verification_data: Record<string, unknown> | null
  }> | null
}

export interface DoctorVerificationSummary {
  cedula: string | null
  sep_verified: boolean
  verified_at: string | null
  institution: string | null
}

export interface PublicDoctorProfile extends PublicDoctorSummary {
  profile: {
    id: string
    full_name: string
    photo_url: string | null
    phone: string | null
  } | null
}

function summarizeVerification(
  verifications?: RawDoctor['doctor_verifications']
): DoctorVerificationSummary | null {
  if (!verifications || verifications.length === 0) {
    return null
  }

  const verifiedRow =
    verifications.find((row) => row.sep_verified) || verifications[0]

  const verificationData = verifiedRow.verification_data || {}
  const institutionValue =
    typeof verificationData.institution === 'string' && verificationData.institution.trim()
      ? verificationData.institution.trim()
      : null

  return {
    cedula: verifiedRow.cedula,
    sep_verified: Boolean(verifiedRow.sep_verified),
    verified_at: verifiedRow.verified_at,
    institution: institutionValue,
  }
}

// Sistema completo: buscar doctores con filtros
export async function discoverDoctors(filters?: DiscoveryFilters): Promise<PublicDoctorSummary[]> {
  // Use SEO cache for hot specialty x city searches
  if (filters?.specialtySlug && filters?.city) {
    const filtersHash = JSON.stringify({
      ...filters,
      specialtySlug: undefined,
      city: undefined,
    })
    const seoCached = await cache.getSEOSearchResults(filters.specialtySlug, filters.city, filtersHash)
    if (seoCached) return seoCached as PublicDoctorSummary[]
  }

  const cacheKey = `discover:${JSON.stringify(filters || {})}`
  const cached = (await cache.get(cacheKey)) as PublicDoctorSummary[] | null
  if (cached) return cached

  const result = await fetchDoctors(filters)
  const doctors = result.data
  await cache.set(cacheKey, doctors, 300)

  // Populate SEO cache for hot searches
  if (filters?.specialtySlug && filters?.city) {
    const filtersHash = JSON.stringify({
      ...filters,
      specialtySlug: undefined,
      city: undefined,
    })
    await cache.setSEOSearchResults(filters.specialtySlug, filters.city, filtersHash, doctors)
  }

  return doctors
}

// Paginated version with total count
export async function discoverDoctorsPaginated(filters?: DiscoveryFilters): Promise<PaginatedDoctorResult> {
  return fetchDoctors(filters)
}

async function fetchDoctors(filters?: DiscoveryFilters): Promise<PaginatedDoctorResult> {
  const supabase = createServiceClient()
  const limit = filters?.limit ?? 100
  const offset = filters?.offset ?? 0

  try {
    const doctorSelect = `
      id,
      bio,
      price_cents,
      rating_avg,
      rating_count,
      city,
      state,
      years_experience,
      languages,
      status,
      license_number,
      video_enabled,
      office_address,
      offers_video,
      offers_in_person,
      doctor_specialties (
        specialty_id,
        specialty:specialties (
          id,
          name,
          slug
        )
      ),
      profiles!doctors_id_fkey (
        id,
        full_name,
        photo_url
      ),
      doctor_verifications (
        cedula,
        sep_verified,
        verified_at,
        verification_data
      ),
      doctor_subscriptions (
        id,
        status,
        current_period_end
      )
    `

    let query = supabase
      .from('doctors')
      .select(doctorSelect, { count: 'exact' })
      .eq('status', 'approved')

    // Try is_listed filter, fallback gracefully
    const withListedResult = await supabase
      .from('doctors')
      .select(doctorSelect, { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('is_listed', true)

    if (withListedResult.error?.code === '42703' && withListedResult.error.message.includes('is_listed')) {
      logger.warn('Discovery is_listed filter skipped because migration is not applied')
      query = supabase
        .from('doctors')
        .select(doctorSelect, { count: 'exact' })
        .eq('status', 'approved')
    } else {
      query = supabase
        .from('doctors')
        .select(doctorSelect, { count: 'exact' })
        .eq('status', 'approved')
        .eq('is_listed', true)
    }

    // Server-side filters pushed to database
    if (filters?.city) {
      query = query.eq('city', filters.city)
    }

    if (filters?.onlineOnly || filters?.appointmentType === 'video') {
      query = query.eq('video_enabled', true)
    }

    if (filters?.minExperience) {
      query = query.gte('years_experience', filters.minExperience)
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price_cents', filters.maxPrice)
    }

    if (filters?.minRating !== undefined) {
      query = query.gte('rating_avg', filters.minRating || 0)
    }

    // Apply ordering
    if (filters?.sortBy) {
      const ascending = filters.sortOrder === 'asc'
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('rating_avg', { ascending, nullsFirst: false })
          break
        case 'price':
        case 'price_asc':
          query = query.order('price_cents', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price_cents', { ascending: false })
          break
        case 'experience':
          query = query.order('years_experience', { ascending, nullsFirst: false })
          break
        default:
          query = query.order('rating_avg', { ascending: false, nullsFirst: false })
      }
    } else {
      query = query.order('rating_avg', { ascending: false, nullsFirst: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: doctors, error, count } = await query

    if (error) {
      logger.error('Discovery error', { error: error.message, code: error.code })
      return { data: [], total: 0, offset, limit }
    }

    let filtered = (doctors || []) as unknown as RawDoctor[]
    const totalCount = count || filtered.length

    // Post-DB filtering for active subscriptions (join filter not easily expressed in Supabase JS)
    filtered = filtered.filter(doctor => {
      const hasActiveSubscription = doctor.doctor_subscriptions?.some(
        (sub: { status: string; current_period_end: string }) =>
          sub.status === 'active' && new Date(sub.current_period_end) > new Date()
      )
      return doctor.status === 'approved' && hasActiveSubscription
    })

    // Post-DB filters that require joins or special lookups
    // Specialty filter via join (keep client-side for nested relation)
    if (filters?.specialtySlug) {
      filtered = filtered.filter(doctor =>
        doctor.doctor_specialties?.some(
          ds => ds.specialties?.slug === filters.specialtySlug
        )
      )
    }

    // Insurance filter (cross-table lookup)
    if (filters?.insuranceSlug) {
      const insuranceDoctorIds = await getDoctorIdsByInsurance(filters.insuranceSlug)
      if (insuranceDoctorIds.length > 0) {
        filtered = filtered.filter(doctor => insuranceDoctorIds.includes(doctor.id))
      } else {
        filtered = []
      }
    }

    // City slug filter (resolved from cities table)
    if (filters?.citySlug) {
      const cityDoctors = await getDoctorIdsByCitySlug(filters.citySlug)
      if (cityDoctors.length > 0) {
        filtered = filtered.filter(doctor => cityDoctors.includes(doctor.id))
      } else {
        filtered = []
      }
    }

    // Search query (full-text name search)
    if (filters?.searchQuery) {
      const queryStr = filters.searchQuery.toLowerCase().trim()
      filtered = filtered.filter(doctor =>
        doctor.profiles?.full_name?.toLowerCase().includes(queryStr)
      )
    }

    // Gender filter (profiles join)
    if (filters?.gender) {
      filtered = filtered.filter(doctor => 
        (doctor as RawDoctor & { profiles?: { gender?: string } }).profiles?.gender === filters.gender
      )
    }

    // Language filter
    if (filters?.language) {
      filtered = filtered.filter(doctor =>
        (doctor.languages || []).some(lang => lang.toLowerCase() === filters.language?.toLowerCase())
      )
    }

    // Transform data
    const result = filtered.map(doctor => ({
      id: doctor.id,
      status: doctor.status,
      bio: doctor.bio,
      languages: doctor.languages || ['es'],
      years_experience: doctor.years_experience,
      city: doctor.city,
      state: doctor.state,
      country: 'MX',
      price_cents: doctor.price_cents,
      currency: 'MXN',
      rating_avg: doctor.rating_avg || 0,
      rating_count: doctor.rating_count || 0,
      license_number: doctor.license_number,
      video_enabled: doctor.video_enabled ?? doctor.offers_video ?? false,
      office_address: doctor.office_address || null,
      offers_video: doctor.offers_video ?? doctor.video_enabled ?? false,
      offers_in_person: doctor.offers_in_person ?? Boolean(doctor.office_address),
      verification: summarizeVerification(doctor.doctor_verifications),
      profile: doctor.profiles ? {
        id: doctor.profiles.id,
        full_name: doctor.profiles.full_name,
        photo_url: doctor.profiles.photo_url,
      } : null,
      specialties: doctor.doctor_specialties?.map(ds => ({
        id: ds.specialty_id,
        name: ds.specialties?.name,
        slug: ds.specialties?.slug,
      })) || [],
    }))

    return { data: result, total: totalCount, offset, limit }
  } catch (error) {
    logger.warn('Discovery fetch fallback triggered', { error: error instanceof Error ? error.message : 'unknown' })
    return { data: [], total: 0, offset: 0, limit }
  }
}

// Bloque: Obtener especialidades disponibles
export async function getAvailableSpecialties(): Promise<Array<{
  id: string
  slug: string
  name: string
}>> {
  const supabase = createServiceClient()

  try {
    // Get specialties from the specialties table
    const { data: specialties, error } = await supabase
      .from('specialties')
      .select('*')
      .order('name', { ascending: true })

    if (!error && specialties && specialties.length > 0) {
      return specialties as Array<{ id: string; slug: string; name: string }>
    }

    // Fallback: return empty array
    return []
  } catch (error) {
    logger.error('Error fetching specialties', { error: error instanceof Error ? error.message : 'unknown' })
    return []
  }
}

// Bloque: Obtener perfil completo del doctor
export async function getDoctorProfile(doctorId: string): Promise<PublicDoctorProfile | null> {
  const cached = (await cache.getDoctorProfile(doctorId)) as PublicDoctorProfile | null
  if (cached) return cached

  const profile = await fetchDoctorProfile(doctorId)
  if (profile) {
    await cache.setDoctorProfile(doctorId, profile)
  }
  return profile
}

async function fetchDoctorProfile(doctorId: string): Promise<PublicDoctorProfile | null> {
  const supabase = createServiceClient()

  try {
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        id,
        bio,
        price_cents,
        rating_avg,
        rating_count,
        city,
        state,
        years_experience,
        languages,
        status,
        license_number,
        video_enabled,
        office_address,
        offers_video,
        offers_in_person,
        doctor_specialties (
          specialty_id,
          specialty:specialties (
            id,
            name,
            slug
          )
        ),
        profiles!doctors_id_fkey (
          id,
          full_name,
          photo_url,
          phone
        ),
        doctor_verifications (
          cedula,
          sep_verified,
          verified_at,
          verification_data
        ),
        doctor_subscriptions (
          id,
          status,
          current_period_end
        )
      `)
      .eq('id', doctorId)
      .eq('status', 'approved')
      .single()

    if (error) {
      logger.error('Doctor profile error', { error: error.message, code: error.code, doctorId })
      return null
    }

    if (!doctor) return null

    // Cast to expected type
    const typedDoctor = doctor as unknown as RawDoctor & {
      profiles: {
        id: string
        full_name: string
        photo_url: string | null
        phone: string | null
      } | null
    }

    // Transform to expected format
    return {
      id: typedDoctor.id,
      status: typedDoctor.status,
      bio: typedDoctor.bio,
      languages: typedDoctor.languages || ['es'],
      years_experience: typedDoctor.years_experience,
      city: typedDoctor.city,
      state: typedDoctor.state,
      country: 'MX',
      price_cents: typedDoctor.price_cents,
      currency: 'MXN',
      license_number: typedDoctor.license_number,
      video_enabled: typedDoctor.video_enabled ?? typedDoctor.offers_video ?? false,
      office_address: typedDoctor.office_address || null,
      offers_video: typedDoctor.offers_video ?? typedDoctor.video_enabled ?? false,
      offers_in_person: typedDoctor.offers_in_person ?? Boolean(typedDoctor.office_address),
      rating_avg: typedDoctor.rating_avg || 0,
      rating_count: typedDoctor.rating_count || 0,
      verification: summarizeVerification(typedDoctor.doctor_verifications),
      profile: typedDoctor.profiles ? {
        id: typedDoctor.profiles.id,
        full_name: typedDoctor.profiles.full_name,
        photo_url: typedDoctor.profiles.photo_url,
        phone: typedDoctor.profiles.phone,
      } : null,
      specialties: typedDoctor.doctor_specialties?.map(ds => ({
        id: ds.specialty_id,
        name: ds.specialties?.name,
        slug: ds.specialties?.slug,
      })) || [],
    }
  } catch (error) {
    logger.error('Doctor profile fetch error', { error: error instanceof Error ? error.message : 'unknown', doctorId })
    return null
  }
}

async function getDoctorIdsByInsurance(insuranceSlug: string): Promise<string[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('doctor_insurances')
    .select('doctor_id, insurances!inner(slug)')
    .eq('insurances.slug', insuranceSlug)
  return (data || []).map((d: { doctor_id: string }) => d.doctor_id)
}

async function getDoctorIdsByCitySlug(citySlug: string): Promise<string[]> {
  const supabase = createServiceClient()
  const { data: city } = await supabase.from('cities').select('name').eq('slug', citySlug).single()
  if (!city) return []
  const { data } = await supabase.from('doctors').select('id').eq('city', city.name).eq('status', 'approved')
  return (data || []).map((d: { id: string }) => d.id)
}
