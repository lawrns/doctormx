import { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages
  entries.push(
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/doctors`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/specialties`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/enfermedades`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tratamientos-servicios`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/clinicas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/preguntas-respuestas`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/consulta-online`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/app-pacientes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/for-doctors`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/doctores-online`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  )

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return entries
  }

  try {
    const supabase = createServiceClient()

    const [specialtiesResult, citiesResult, diseasesResult, insurancesResult] = await Promise.all([
      supabase.from('specialties').select('slug, name').order('name'),
      supabase.from('cities').select('slug, name, is_major').eq('is_active', true).order('population', { ascending: false }).limit(50),
      supabase.from('diseases').select('slug').eq('is_active', true).limit(500),
      supabase.from('insurances').select('slug').eq('is_active', true),
    ])

    const specialties = specialtiesResult.data || []
    const cities = citiesResult.data || []
    const diseases = diseasesResult.data || []
    const insurances = insurancesResult.data || []

    // Specialty pages: /doctor/[specialty]
    for (const specialty of specialties) {
      entries.push({
        url: `${BASE_URL}/doctor/${specialty.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })
    }

    // Online specialty pages: /doctores-online/[specialty]
    for (const specialty of specialties) {
      entries.push({
        url: `${BASE_URL}/doctores-online/${specialty.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    }

    // Specialty + City pages: /doctor/[specialty]/[city]
    for (const specialty of specialties) {
      for (const city of cities) {
        entries.push({
          url: `${BASE_URL}/doctor/${specialty.slug}/${city.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      }
    }

    // Specialty + City + Insurance pages
    for (const specialty of specialties.slice(0, 10)) {
      for (const city of cities.slice(0, 15)) {
        for (const insurance of insurances) {
          entries.push({
            url: `${BASE_URL}/doctor/${specialty.slug}/${city.slug}/${insurance.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          })
        }
      }
    }

    // Disease pages: /enfermedades/[slug]
    for (const disease of diseases) {
      entries.push({
        url: `${BASE_URL}/enfermedades/${disease.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
    }

    // Try to add treatments
    try {
      const { data: treatments } = await supabase.from('treatments').select('slug').limit(500)
      if (treatments) {
        for (const treatment of treatments) {
          entries.push({
            url: `${BASE_URL}/tratamientos-servicios/${treatment.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          })
        }
      }
    } catch {
      // treatments table may not exist yet
    }

    // Try to add clinics
    try {
      const { data: clinics } = await supabase.from('clinics').select('slug').eq('is_active', true).limit(500)
      if (clinics) {
        for (const clinic of clinics) {
          entries.push({
            url: `${BASE_URL}/clinica/${clinic.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          })
        }
      }
    } catch {
      // clinics table may not exist yet
    }

    // Try to add blog posts
    try {
      const { data: posts } = await supabase.from('blog_posts').select('slug').eq('status', 'published').limit(500)
      if (posts) {
        for (const post of posts) {
          entries.push({
            url: `${BASE_URL}/blog/${post.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
          })
        }
      }
    } catch {
      // blog_posts table may not exist yet
    }

    // Try to add expert questions
    try {
      const { data: questions } = await supabase.from('expert_questions').select('id').in('status', ['answered', 'approved']).limit(200)
      if (questions) {
        for (const q of questions) {
          entries.push({
            url: `${BASE_URL}/preguntas-respuestas/${q.id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
          })
        }
      }
    } catch {
      // expert_questions table may not exist yet
    }

    // Individual doctor profiles
    const { data: doctors } = await supabase
      .from('doctors')
      .select('id, profiles!doctors_id_fkey(full_name)')
      .eq('status', 'approved')
      .limit(1000)

    if (doctors) {
      for (const doctor of doctors) {
        const profile = Array.isArray(doctor.profiles) ? doctor.profiles[0] : doctor.profiles
        const nameSlug = (profile as unknown as { full_name?: string })?.full_name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'doctor'
        entries.push({
          url: `${BASE_URL}/doctors/${doctor.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })
      }
    }

  } catch (error) {
    console.error('[Sitemap] Error generating dynamic entries:', error)
  }

  return entries
}
