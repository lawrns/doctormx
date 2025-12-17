// Sistema de Descubrimiento - Se explica solo
// Input: Preferencias del paciente (especialidad, ubicación, precio)
// Proceso: Filtrar catálogo → Ordenar por relevancia
// Output: Lista de doctores que cumplen criterios

import { createClient } from '@/lib/supabase/server'

export type DiscoveryFilters = {
  specialtySlug?: string
  city?: string
  state?: string
  maxPrice?: number
  minRating?: number
}

// Sistema completo: buscar doctores con filtros
export async function discoverDoctors(filters?: DiscoveryFilters) {
  const supabase = await createClient()

  let query = supabase
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
    .eq('status', 'approved') // Solo doctores aprobados en catálogo público

  // Aplicar filtros
  if (filters?.city) {
    query = query.eq('city', filters.city)
  }

  if (filters?.state) {
    query = query.eq('state', filters.state)
  }

  if (filters?.maxPrice) {
    query = query.lte('price_cents', filters.maxPrice)
  }

  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating)
  }

  // Ordenar por rating
  query = query.order('rating', { ascending: false, nullsFirst: false })

  const { data, error } = await query

  if (error) throw error

  // Si hay filtro de especialidad, filtrar en memoria
  // (porque es relación many-to-many)
  if (filters?.specialtySlug && data) {
    return data.filter((doctor: import('@/types').Doctor & { specialties?: { specialty: { slug: string } }[] }) =>
      doctor.specialties?.some(
        (s: { specialty: { slug: string } }) => s.specialty.slug === filters.specialtySlug
      )
    )
  }

  return data || []
}

// Bloque: Obtener especialidades disponibles
export async function getAvailableSpecialties() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('specialties')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error

  return data || []
}

// Bloque: Obtener perfil completo del doctor
export async function getDoctorProfile(doctorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
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
      )
    `)
    .eq('id', doctorId)
    .eq('status', 'approved')
    .single()

  if (error) throw error

  return data
}
