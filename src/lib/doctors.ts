// Sistema de búsqueda de doctores - Claridad y simplicidad
import { createClient } from '@/lib/supabase/server'
import { cache } from '@/lib/cache'
import type { DoctorProfile } from '@/lib/discovery'

// Proceso simple: obtener doctores aprobados
export async function getApprovedDoctors() {
  const cached = await cache.getDoctorList()
  if (cached.length > 0) return cached

  const doctores = await fetchApprovedDoctors()
  await cache.setDoctorList(doctores)
  return doctores
}

async function fetchApprovedDoctors() {
  const supabase = await createClient()
  
  const { data: doctores, error } = await supabase
    .from('doctores')
    .select(`
      *,
      profile:profiles.doctores_id_fkey (
        id,
        full_name,
        photo_url
      ),
      specialties:doctor_specialties (
        specialty:specialties (
          id,
          name,
          slug
        )
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return doctores || []
}

// Filtro simple por especialidad
export async function getDoctorsBySpecialty(specialtySlug: string) {
  const cached = await cache.getDoctorsBySpecialty(specialtySlug)
  if (cached.length > 0) return cached

  const doctores = await fetchDoctorsBySpecialty(specialtySlug)
  await cache.setDoctorsBySpecialty(specialtySlug, doctores)
  return doctores
}

async function fetchDoctorsBySpecialty(specialtySlug: string) {
  const supabase = await createClient()
  
  const { data: doctores, error } = await supabase
    .from('doctores')
    .select(`
      *,
      profile:profiles.doctores_id_fkey (
        id,
        full_name,
        photo_url
      ),
      specialties:doctor_specialties!inner (
        specialty:specialties!inner (
          id,
          name,
          slug
        )
      )
    `)
    .eq('status', 'approved')
    .eq('specialties.specialty.slug', specialtySlug)
    .order('rating', { ascending: false, nullsFirst: false })
  
  if (error) throw error
  
  return doctores || []
}

// Obtener todas las especialidades
export async function getSpecialties() {
  const cached = await cache.getSpecialtiesList()
  if (cached.length > 0) return cached

  const supabase = await createClient()

  const { data: specialties, error } = await supabase
    .from('specialties')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error

  const result = specialties || []
  await cache.setSpecialtiesList(result)
  return result
}

// Obtener doctor por ID con toda su info
export async function getDoctorById(id: string): Promise<DoctorProfile | null> {
  const cached = await cache.getDoctorProfile(id)
  if (cached) return cached

  const doctor = await fetchDoctorById(id)
  if (doctor) {
    const doctorProfile = transformToDoctorProfile(doctor)
    await cache.setDoctorProfile(id, doctorProfile)
    return doctorProfile
  }
  return null
}

// Transform raw doctor data to DoctorProfile type
function transformToDoctorProfile(doctor: Record<string, unknown>): DoctorProfile {
  const profile = doctor.profile as Record<string, unknown> | null
  const specialties = doctor.specialties as Array<{ specialty?: { id: string; name: string; slug: string } | null }> | null

  return {
    id: doctor.id as string,
    status: doctor.status as string,
    bio: doctor.bio as string | null,
    languages: (doctor.languages as string[] | null) || ['es'],
    years_experience: doctor.years_experience as number | null,
    city: doctor.city as string | null,
    state: doctor.state as string | null,
    country: 'MX',
    price_cents: doctor.price_cents as number,
    currency: 'MXN',
    rating_avg: (doctor.rating_avg as number | null) ?? 0,
    rating_count: (doctor.rating_count as number | null) ?? 0,
    profile: profile ? {
      id: profile.id as string,
      full_name: profile.full_name as string,
      photo_url: profile.photo_url as string | null,
      phone: profile.phone as string | null,
    } : null,
    specialties: specialties?.map(s => ({
      id: s.specialty?.id ?? '',
      name: s.specialty?.name,
      slug: s.specialty?.slug,
    })) || [],
  }
}

async function fetchDoctorById(id: string): Promise<Record<string, unknown> | null> {
  const supabase = await createClient()
  
  const { data: doctor, error } = await supabase
    .from('doctores')
    .select(`
      *,
      profile:profiles.doctores_id_fkey (
        id,
        full_name,
        photo_url,
        phone
      ),
      specialties:doctor_specialties (
        specialty:specialties (
          id,
          name,
          slug
        )
      ),
      doctor_subscriptions (
        id,
        status,
        current_period_end,
        plan_name,
        plan_price_cents
      )
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()
  
  if (error) throw error
  
  return doctor as unknown as Record<string, unknown> | null
}

