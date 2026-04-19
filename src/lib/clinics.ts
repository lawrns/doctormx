import { createServiceClient } from '@/lib/supabase/server'
import { cache } from '@/lib/cache'

export interface Clinic {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city_id: string | null
  district_id: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  website: string | null
  logo_url: string | null
  rating_avg: number
  rating_count: number
  verified: boolean
  is_active: boolean
  city?: { id: string; name: string; slug: string; state: string } | null
  district?: { id: string; name: string; slug: string } | null
  specialties?: Array<{ id: string; name: string; slug: string }>
}

export interface ClinicDoctor {
  id: string
  room_number: string | null
  schedule: string | null
  is_primary: boolean
  doctor: {
    id: string
    bio: string | null
    price_cents: number
    rating_avg: number
    rating_count: number
    video_enabled: boolean
    years_experience: number | null
    profile: {
      id: string
      full_name: string
      photo_url: string | null
    } | null
    specialties: Array<{ id: string; name: string; slug: string }>
  }
}

// Get clinics with optional filters
export async function getClinics(filters?: {
  specialtySlug?: string
  citySlug?: string
  limit?: number
}): Promise<Clinic[]> {
  const cacheKey = `clinics:${JSON.stringify(filters || {})}`
  const cached = await cache.get<Clinic[]>(cacheKey)
  if (cached) return cached

  const supabase = createServiceClient()

  try {
    let query = supabase
      .from('clinics')
      .select(`
        *,
        city:cities ( id, name, slug, state ),
        district:districts ( id, name, slug ),
        specialties:clinic_specialties (
          specialty:specialties ( id, name, slug )
        )
      `)
      .eq('is_active', true)
      .order('rating_avg', { ascending: false, nullsFirst: false })
      .limit(filters?.limit || 50)

    if (filters?.specialtySlug) {
      query = supabase
        .from('clinics')
        .select(`
          *,
          city:cities ( id, name, slug, state ),
          district:districts ( id, name, slug ),
          specialties:clinic_specialties!inner (
            specialty:specialties!inner ( id, name, slug )
          )
        `)
        .eq('is_active', true)
        .eq('specialties.specialty.slug', filters.specialtySlug)
        .order('rating_avg', { ascending: false, nullsFirst: false })
        .limit(filters?.limit || 50)
    }

    if (filters?.citySlug) {
      const { data: cityData } = await supabase
        .from('cities')
        .select('id')
        .eq('slug', filters.citySlug)
        .single()

      if (cityData) {
        // Re-query filtering by city
        let cityQuery = supabase
          .from('clinics')
          .select(`
            *,
            city:cities ( id, name, slug, state ),
            district:districts ( id, name, slug ),
            specialties:clinic_specialties (
              specialty:specialties ( id, name, slug )
            )
          `)
          .eq('is_active', true)
          .eq('city_id', cityData.id)

        if (filters.specialtySlug) {
          cityQuery = supabase
            .from('clinics')
            .select(`
              *,
              city:cities ( id, name, slug, state ),
              district:districts ( id, name, slug ),
              specialties:clinic_specialties!inner (
                specialty:specialties!inner ( id, name, slug )
              )
            `)
            .eq('is_active', true)
            .eq('city_id', cityData.id)
            .eq('specialties.specialty.slug', filters.specialtySlug)
        }

        cityQuery = cityQuery
          .order('rating_avg', { ascending: false, nullsFirst: false })
          .limit(filters?.limit || 50)

        const { data, error } = await cityQuery
        if (error) return []
        const clinics = transformClinics(data)
        await cache.set(cacheKey, clinics, 300)
        return clinics
      }
    }

    const { data, error } = await query
    if (error) return []

    const clinics = transformClinics(data)
    await cache.set(cacheKey, clinics, 300)
    return clinics
  } catch {
    return []
  }
}

function transformClinics(data: any[]): Clinic[] {
  return (data || []).map((clinic: any) => ({
    id: clinic.id,
    name: clinic.name,
    slug: clinic.slug,
    description: clinic.description,
    address: clinic.address,
    city_id: clinic.city_id,
    district_id: clinic.district_id,
    latitude: clinic.latitude,
    longitude: clinic.longitude,
    phone: clinic.phone,
    website: clinic.website,
    logo_url: clinic.logo_url,
    rating_avg: clinic.rating_avg || 0,
    rating_count: clinic.rating_count || 0,
    verified: clinic.verified || false,
    is_active: clinic.is_active,
    city: clinic.city || null,
    district: clinic.district || null,
    specialties: (clinic.specialties || []).map((cs: any) => ({
      id: cs.specialty?.id || cs.specialties?.id,
      name: cs.specialty?.name || cs.specialties?.name,
      slug: cs.specialty?.slug || cs.specialties?.slug,
    })),
  }))
}

// Get a single clinic by slug
export async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  const cacheKey = `clinic:${slug}`
  const cached = await cache.get<Clinic>(cacheKey)
  if (cached) return cached

  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        city:cities ( id, name, slug, state ),
        district:districts ( id, name, slug ),
        specialties:clinic_specialties (
          specialty:specialties ( id, name, slug )
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    const clinic = transformClinics([data])[0]
    if (clinic) {
      await cache.set(cacheKey, clinic, 300)
    }
    return clinic || null
  } catch {
    return null
  }
}

// Get doctors associated with a clinic
export async function getClinicDoctors(clinicId: string): Promise<ClinicDoctor[]> {
  const cacheKey = `clinic-doctors:${clinicId}`
  const cached = await cache.get<ClinicDoctor[]>(cacheKey)
  if (cached) return cached

  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .from('doctor_clinics')
      .select(`
        id,
        room_number,
        schedule,
        is_primary,
        doctor:doctors (
          id,
          bio,
          price_cents,
          rating_avg,
          rating_count,
          video_enabled,
          years_experience,
          profile:profiles!doctors_id_fkey (
            id,
            full_name,
            photo_url
          ),
          specialties:doctor_specialties (
            specialty:specialties ( id, name, slug )
          )
        )
      `)
      .eq('clinic_id', clinicId)
      .order('is_primary', { ascending: false })

    if (error) return []

    const doctors = (data || []).map((dc: any) => ({
      id: dc.id,
      room_number: dc.room_number,
      schedule: dc.schedule,
      is_primary: dc.is_primary,
      doctor: {
        id: dc.doctor?.id,
        bio: dc.doctor?.bio,
        price_cents: dc.doctor?.price_cents || 0,
        rating_avg: dc.doctor?.rating_avg || 0,
        rating_count: dc.doctor?.rating_count || 0,
        video_enabled: dc.doctor?.video_enabled || false,
        years_experience: dc.doctor?.years_experience,
        profile: dc.doctor?.profile || null,
        specialties: (dc.doctor?.specialties || []).map((ds: any) => ({
          id: ds.specialty?.id || ds.specialties?.id,
          name: ds.specialty?.name || ds.specialties?.name,
          slug: ds.specialty?.slug || ds.specialties?.slug,
        })),
      },
    }))

    await cache.set(cacheKey, doctors, 300)
    return doctors
  } catch {
    return []
  }
}

// Get clinics for a specific doctor
export async function getDoctorClinics(doctorId: string): Promise<Array<Clinic & { room_number: string | null; schedule: string | null; is_primary: boolean }>> {
  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .from('doctor_clinics')
      .select(`
        room_number,
        schedule,
        is_primary,
        clinic:clinics (
          *,
          city:cities ( id, name, slug, state ),
          district:districts ( id, name, slug ),
          specialties:clinic_specialties (
            specialty:specialties ( id, name, slug )
          )
        )
      `)
      .eq('doctor_id', doctorId)
      .order('is_primary', { ascending: false })

    if (error) return []

    return (data || []).map((dc: any) => ({
      ...transformClinics([dc.clinic])[0],
      room_number: dc.room_number,
      schedule: dc.schedule,
      is_primary: dc.is_primary,
    }))
  } catch {
    return []
  }
}

// Search clinics by name or address
export async function searchClinics(query: string, limit = 10): Promise<Clinic[]> {
  if (!query || query.trim().length < 2) return []

  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        city:cities ( id, name, slug, state ),
        district:districts ( id, name, slug ),
        specialties:clinic_specialties (
          specialty:specialties ( id, name, slug )
        )
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
      .order('rating_avg', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) return []
    return transformClinics(data)
  } catch {
    return []
  }
}
