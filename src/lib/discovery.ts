// Sistema de Descubrimiento - Se explica solo
// Input: Preferencias del paciente (especialidad, ubicación, precio)
// Proceso: Filtrar catálogo → Ordenar por relevancia
// Output: Lista de doctores que cumplen criterios

import { createServiceClient } from '@/lib/supabase/server'
import { cache } from '@/lib/cache'
import { logger } from '@/lib/observability/logger'

export type DiscoveryFilters = {
  specialtySlug?: string
  city?: string
  state?: string
  maxPrice?: number
  minRating?: number
  searchQuery?: string
  sortBy?: 'rating' | 'price' | 'experience'
  sortOrder?: 'asc' | 'desc'
  appointmentType?: 'all' | 'video' | 'in_person'
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
  video_enabled: boolean | null
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
  } | null
  doctor_subscriptions: Array<{
    id: string
    status: string
    current_period_end: string
  }> | null
}

// Type for transformed doctor data returned to clients
export type Doctor = {
  id: string
  status: string
  bio: string | null
  languages: string[] | null
  years_experience: number | null
  city: string | null
  state: string | null
  country: string
  price_cents: number
  currency: string
  rating_avg: number
  rating_count: number
  profile: {
    id: string
    full_name: string
    photo_url: string | null
  } | null
  specialties: Array<{
    id: string
    name: string | null | undefined
    slug: string | null | undefined
  }>
}

// Sistema completo: buscar doctores con filtros
export async function discoverDoctors(filters?: DiscoveryFilters): Promise<Doctor[]> {
  const cacheKey = `discover:${JSON.stringify(filters || {})}`
  const cached = await cache.get<Doctor[]>(cacheKey)
  if (cached) return cached

  const doctors = await fetchDoctors(filters)
  await cache.set(cacheKey, doctors, 300)
  return doctors
}

async function fetchDoctors(filters?: DiscoveryFilters): Promise<Doctor[]> {
  const supabase = createServiceClient()

  try {
    const { data: doctors, error } = await supabase
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
        video_enabled,
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
        doctor_subscriptions (
          id,
          status,
          current_period_end
        )
      `)
      .eq('status', 'approved')
      .order('rating_avg', { ascending: false, nullsFirst: false })
      .limit(50)

    if (error) {
      logger.error('Discovery error', { error: error.message, code: error.code })
      return []
    }

    let filtered = (doctors || []) as unknown as RawDoctor[]

    filtered = filtered.filter(doctor => {
      const hasActiveSubscription = doctor.doctor_subscriptions?.some(
        (sub: { status: string; current_period_end: string }) =>
          sub.status === 'active' && new Date(sub.current_period_end) > new Date()
      )
      return doctor.status === 'approved' && hasActiveSubscription
    })

    // Apply filters
    if (filters?.specialtySlug) {
      filtered = filtered.filter(doctor =>
        doctor.doctor_specialties?.some(
          ds => ds.specialties?.slug === filters.specialtySlug
        )
      )
    }

    if (filters?.city) {
      filtered = filtered.filter(doctor => doctor.city === filters.city)
    }

    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter(doctor => doctor.price_cents <= filters.maxPrice!)
    }

    if (filters?.minRating !== undefined) {
      filtered = filtered.filter(doctor => (doctor.rating_avg || 0) >= filters.minRating!)
    }

    // Filter by search query (name search)
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase().trim()
      filtered = filtered.filter(doctor =>
        doctor.profiles?.full_name?.toLowerCase().includes(query)
      )
    }

    // Filter by appointment type (video/in_person)
    if (filters?.appointmentType && filters.appointmentType !== 'all') {
      filtered = filtered.filter(doctor => {
        if (filters.appointmentType === 'video') {
          return doctor.video_enabled === true
        }
        if (filters.appointmentType === 'in_person') {
          return true // Show all doctors for in_person filter (everyone can do in-person)
        }
        return true
      })
    }

    // Sort results
    if (filters?.sortBy) {
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1
      filtered = filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            return ((a.rating_avg || 0) - (b.rating_avg || 0)) * sortOrder
          case 'price':
            return (a.price_cents - b.price_cents) * sortOrder
          case 'experience':
            return ((a.years_experience || 0) - (b.years_experience || 0)) * sortOrder
          default:
            return 0
        }
      })
    }

    // Transform data
    return filtered.map(doctor => ({
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
  } catch (error) {
    logger.error('Discovery fetch error', { error: error instanceof Error ? error.message : 'unknown' })
    return []
  }
}

// Bloque: Obtener especialidades disponibles
export async function getAvailableSpecialties() {
  const supabase = createServiceClient()

  try {
    // Get specialties from the specialties table
    const { data: specialties, error } = await supabase
      .from('specialties')
      .select('*')
      .order('name', { ascending: true })

    if (!error && specialties && specialties.length > 0) {
      return specialties
    }

    // Fallback: return empty array
    return []
  } catch (error) {
    logger.error('Error fetching specialties', { error: error instanceof Error ? error.message : 'unknown' })
    return []
  }
}

// Bloque: Obtener perfil completo del doctor
export async function getDoctorProfile(doctorId: string) {
  const cached = await cache.getDoctorProfile(doctorId)
  if (cached) return cached

  const profile = await fetchDoctorProfile(doctorId)
  if (profile) {
    await cache.setDoctorProfile(doctorId, profile)
  }
  return profile
}

async function fetchDoctorProfile(doctorId: string) {
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
      rating_avg: typedDoctor.rating_avg || 0,
      rating_count: typedDoctor.rating_count || 0,
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
