import { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

// I18N-007: Updated sitemap with locale URLs for SEO
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://doctor.mx'
  
  // Define all page paths (without locale prefix)
  const pagePaths = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/specialties', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/doctores', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/ai-consulta', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/para-doctores', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/help', priority: 0.6, changeFrequency: 'monthly' as const },
  ]
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  const now = new Date()
  
  // Generate entries for all locales
  pagePaths.forEach(({ path, priority, changeFrequency }) => {
    routing.locales.forEach((locale) => {
      // Build URL based on locale
      // For Spanish (default), no prefix. For English, add /en prefix
      const urlPath = locale === 'es' 
        ? path 
        : `/en${path}`
      
      // Build alternate URLs for hreflang
      const alternates: Record<string, string> = {}
      routing.locales.forEach((altLocale) => {
        const altPath = altLocale === 'es' 
          ? `${baseUrl}${path}`
          : `${baseUrl}/en${path}`
        alternates[altLocale] = altPath
      })
      
      sitemapEntries.push({
        url: `${baseUrl}${urlPath}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: alternates,
        },
      })
    })
  })
  
  return sitemapEntries
}
