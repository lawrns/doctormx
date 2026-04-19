import { createServiceClient } from '@/lib/supabase/server'

export interface Treatment {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  popular: boolean
  search_count: number
  created_at: string
}

export interface TreatmentWithSpecialties extends Treatment {
  specialties: { id: string; name: string; slug: string }[]
}

export async function getTreatments(popularOnly = false): Promise<Treatment[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('treatments')
    .select('*')
    .order('name', { ascending: true })

  if (popularOnly) {
    query = query.eq('popular', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching treatments:', error)
    return []
  }

  return data as Treatment[]
}

export async function getTreatmentBySlug(slug: string): Promise<TreatmentWithSpecialties | null> {
  const supabase = createServiceClient()

  const { data: treatment, error: treatmentError } = await supabase
    .from('treatments')
    .select('*')
    .eq('slug', slug)
    .single()

  if (treatmentError || !treatment) {
    console.error('Error fetching treatment:', treatmentError)
    return null
  }

  // Fetch related specialties
  const { data: links, error: linkError } = await supabase
    .from('treatment_specialties')
    .select('specialty_id, specialties(id, name, slug)')
    .eq('treatment_id', treatment.id)

  if (linkError) {
    console.error('Error fetching treatment specialties:', linkError)
    return { ...treatment, specialties: [] } as TreatmentWithSpecialties
  }

  const specialties = (links || [])
    .map((link: any) => link.specialties)
    .filter(Boolean)

  return { ...treatment, specialties } as TreatmentWithSpecialties
}

export async function searchTreatments(query: string): Promise<Treatment[]> {
  if (!query || query.trim().length < 2) return []

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('search_count', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error searching treatments:', error)
    return []
  }

  return data as Treatment[]
}

export async function getTreatmentsBySpecialty(specialtySlug: string): Promise<Treatment[]> {
  const supabase = createServiceClient()

  const { data: specialty } = await supabase
    .from('specialties')
    .select('id')
    .eq('slug', specialtySlug)
    .single()

  if (!specialty) return []

  const { data: links } = await supabase
    .from('treatment_specialties')
    .select('treatment_id')
    .eq('specialty_id', specialty.id)

  if (!links || links.length === 0) return []

  const treatmentIds = links.map((l: { treatment_id: string }) => l.treatment_id)

  const { data: treatments } = await supabase
    .from('treatments')
    .select('*')
    .in('id', treatmentIds)
    .order('name', { ascending: true })

  return (treatments || []) as Treatment[]
}

export async function getTreatmentCategories(): Promise<string[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('treatments')
    .select('category')
    .not('category', 'is', null)

  if (error || !data) return []

  const categories = [...new Set(data.map((d: { category: string | null }) => d.category).filter((c): c is string => Boolean(c)))]
  return categories.sort()
}
