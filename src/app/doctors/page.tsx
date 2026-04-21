import type { Metadata } from 'next'
import { discoverDoctors, getAvailableSpecialties } from '@/lib/discovery'
import { createClient } from '@/lib/supabase/server'
import { DoctorsDirectoryClient } from './DoctorsDirectoryClient'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; search?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const title = params.specialty
    ? `${params.specialty.charAt(0).toUpperCase() + params.specialty.slice(1).replace(/-/g, ' ')} - Doctores | Doctor.mx`
    : params.search
      ? `Busqueda: ${params.search} | Doctores | Doctor.mx`
      : 'Doctores y Especialistas en Mexico | Doctor.mx'
  const description = params.specialty
    ? `Encuentra doctores especializados en ${params.specialty.replace(/-/g, ' ')} en Mexico. Agenda citas en linea con medicos certificados.`
    : 'Directorio de doctores y especialistas en Mexico. Busca por especialidad, nombre o ubicacion. Agenda citas en linea.'
  return {
    title,
    description,
    keywords: params.specialty
      ? `${params.specialty}, doctores ${params.specialty}, especialistas Mexico`
      : 'doctores Mexico, especialistas medicos, citas en linea, medicos certificados',
    alternates: { canonical: 'https://doctor.mx/doctors' },
    openGraph: { title, description, url: 'https://doctor.mx/doctors' },
  }
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    specialty?: string
    search?: string
    sortBy?: 'rating' | 'price' | 'experience'
    sortOrder?: 'asc' | 'desc'
    appointmentType?: 'all' | 'video' | 'in_person'
  }>
}) {
  const params = await searchParams

  // Check if user is authenticated (kept for future use)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [doctors, specialties] = await Promise.all([
    discoverDoctors({
      specialtySlug: params.specialty,
      searchQuery: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      appointmentType: params.appointmentType as any,
    }),
    getAvailableSpecialties(),
  ])

  return (
    <DoctorsDirectoryClient
      doctors={doctors as any[]}
      specialties={specialties as any[]}
      params={{
        specialty: params.specialty,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        appointmentType: params.appointmentType,
      }}
    />
  )
}
