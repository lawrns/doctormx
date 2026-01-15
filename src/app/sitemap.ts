import { MetadataRoute } from 'next'
import { getDirectorySpecialties, getDirectoryCities } from '@/lib/domains/directory'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  
  // Static pages
  entries.push(
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/doctors`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  )
  
  try {
    // Get specialties and cities for programmatic pages
    const [specialties, cities] = await Promise.all([
      getDirectorySpecialties(),
      getDirectoryCities(),
    ])
    
    // Specialty hub pages
    for (const specialty of specialties) {
      const slug = encodeURIComponent(specialty.specialty.toLowerCase().replace(/\s+/g, '-'))
      entries.push({
        url: `${BASE_URL}/doctor/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
    
    // City × Specialty pages (top combinations)
    const topCities = cities.slice(0, 30)
    const topSpecialties = specialties.slice(0, 15)
    
    for (const specialty of topSpecialties) {
      const specialtySlug = encodeURIComponent(specialty.specialty.toLowerCase().replace(/\s+/g, '-'))
      
      for (const city of topCities) {
        const citySlug = encodeURIComponent(city.city.toLowerCase().replace(/\s+/g, '-'))
        
        entries.push({
          url: `${BASE_URL}/doctor/${specialtySlug}/${citySlug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
    
  } catch (error) {
    console.error('[Sitemap] Error generating dynamic entries:', error)
  }
  
  return entries
}
