import { createServiceClient } from '@/lib/supabase/server'

export interface Disease {
  id: string
  name: string
  slug: string
  description: string | null
  symptoms: string[] | null
  causes: string | null
  treatments: string | null
  prevention: string | null
  popular: boolean
  search_count: number
  created_at: string
}

export interface DiseaseWithSpecialties extends Disease {
  specialties: { id: string; name: string; slug: string }[]
}

export async function getDiseases(popularOnly = false): Promise<Disease[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('diseases')
    .select('*')
    .order('name', { ascending: true })

  if (popularOnly) {
    query = query.eq('popular', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching diseases:', error)
    return []
  }

  return data as Disease[]
}

export async function getDiseaseBySlug(slug: string): Promise<DiseaseWithSpecialties | null> {
  const supabase = createServiceClient()

  const { data: disease, error: diseaseError } = await supabase
    .from('diseases')
    .select('*')
    .eq('slug', slug)
    .single()

  if (diseaseError || !disease) {
    console.error('Error fetching disease:', diseaseError)
    return null
  }

  // Fetch related specialties
  const { data: specialtyLinks, error: linkError } = await supabase
    .from('specialty_diseases')
    .select('specialty_id, specialties(id, name, slug)')
    .eq('disease_id', disease.id)

  if (linkError) {
    console.error('Error fetching disease specialties:', linkError)
    return { ...disease, specialties: [] } as DiseaseWithSpecialties
  }

  const specialties = (specialtyLinks || [])
    .map((link: any) => link.specialties)
    .filter(Boolean)

  return { ...disease, specialties } as DiseaseWithSpecialties
}

export async function searchDiseases(query: string): Promise<Disease[]> {
  if (!query || query.trim().length < 2) return []

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('diseases')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('search_count', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error searching diseases:', error)
    return []
  }

  return data as Disease[]
}

export async function getDiseasesBySpecialty(specialtySlug: string): Promise<Disease[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('specialty_diseases')
    .select('diseases(*)')
    .eq('specialties.slug', specialtySlug)

  if (error) {
    console.error('Error fetching diseases by specialty:', error)
    return []
  }

  // This requires a join - let's do it differently
  const { data: specialty } = await supabase
    .from('specialties')
    .select('id')
    .eq('slug', specialtySlug)
    .single()

  if (!specialty) return []

  const { data: links } = await supabase
    .from('specialty_diseases')
    .select('disease_id')
    .eq('specialty_id', specialty.id)

  if (!links || links.length === 0) return []

  const diseaseIds = links.map((l: { disease_id: string }) => l.disease_id)

  const { data: diseases } = await supabase
    .from('diseases')
    .select('*')
    .in('id', diseaseIds)
    .order('name', { ascending: true })

  return (diseases || []) as Disease[]
}
