// Sistema de búsqueda de doctores - Claridad y simplicidad
import { createClient } from '@/lib/supabase/server'
import { cache } from '@/lib/cache'

// Proceso simple: obtener doctores aprobados
export async function getApprovedDoctors() {
  const cached = await cache.getDoctorList()
  if (cached.length > 0) return cached

  const doctors = await fetchApprovedDoctors()
  await cache.setDoctorList(doctors)
  return doctors
}

async function fetchApprovedDoctors() {
  const supabase = await createClient()
  
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles (
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
  
  return doctors || []
}

// Filtro simple por especialidad
export async function getDoctorsBySpecialty(specialtySlug: string) {
  const cacheKey = `doctors:specialty:${specialtySlug}`
  const cached = await cache.get(cacheKey)
  if (cached) return cached

  const doctors = await fetchDoctorsBySpecialty(specialtySlug)
  await cache.set(cacheKey, doctors, 300)
  return doctors
}

async function fetchDoctorsBySpecialty(specialtySlug: string) {
  const supabase = await createClient()
  
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles (
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
  
  return doctors || []
}

// Obtener todas las especialidades
export async function getSpecialties() {
  const supabase = await createClient()
  
  const { data: specialties, error } = await supabase
    .from('specialties')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  
  return specialties || []
}

// Obtener doctor por ID con toda su info
export async function getDoctorById(id: string) {
  const cached = await cache.getDoctorProfile(id)
  if (cached) return cached

  const doctor = await fetchDoctorById(id)
  if (doctor) {
    await cache.setDoctorProfile(id, doctor)
  }
  return doctor
}

async function fetchDoctorById(id: string) {
  const supabase = await createClient()
  
  const { data: doctor, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles (
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
  
  return doctor
}
