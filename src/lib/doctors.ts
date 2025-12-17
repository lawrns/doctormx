// Sistema de búsqueda de doctores - Claridad y simplicidad
import { createClient } from '@/lib/supabase/server'

// Proceso simple: obtener doctores aprobados
export async function getApprovedDoctors() {
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
      )
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()
  
  if (error) throw error
  
  return doctor
}
