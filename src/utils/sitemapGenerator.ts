/**
 * Sitemap generator utility for Doctor.mx
 * Creates XML sitemaps for better search engine crawling and indexing
 */

interface SitemapURL {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface SitemapOptions {
  hostname: string;
  destinationPath: string;
  maxUrlsPerFile?: number;
}

/**
 * Formats a sitemap URL entry according to the sitemap protocol
 */
export function formatSitemapUrl(url: SitemapURL): string {
  let entry = `  <url>\n    <loc>${url.url}</loc>\n`;
  
  if (url.lastmod) {
    entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
  }
  
  if (url.changefreq) {
    entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
  }
  
  if (url.priority !== undefined) {
    entry += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
  }
  
  entry += '  </url>';
  return entry;
}

/**
 * Creates a sitemap XML string from an array of URLs
 */
export function generateSitemapXML(urls: SitemapURL[]): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const footer = '\n</urlset>';
  
  const urlEntries = urls.map(formatSitemapUrl).join('\n');
  
  return header + urlEntries + footer;
}

/**
 * Creates a sitemap index XML string for multiple sitemaps
 */
export function generateSitemapIndex(sitemaps: Array<{url: string; lastmod?: string}>): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const footer = '\n</sitemapindex>';
  
  const sitemapEntries = sitemaps.map(sitemap => {
    let entry = `  <sitemap>\n    <loc>${sitemap.url}</loc>\n`;
    
    if (sitemap.lastmod) {
      entry += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
    }
    
    entry += '  </sitemap>';
    return entry;
  }).join('\n');
  
  return header + sitemapEntries + footer;
}

/**
 * Generates priority value based on URL depth and importance
 */
export function calculateUrlPriority(url: string): number {
  // Homepage gets highest priority
  if (url === '/' || url === '/index.html') {
    return 1.0;
  }
  
  // Main section pages get high priority
  if (url.match(/^\/[^\/]+\/?$/)) {
    return 0.9;
  }
  
  // Doctor profiles get medium-high priority
  if (url.includes('/doctor/')) {
    return 0.8;
  }
  
  // Specialty and location pages get medium priority
  if (url.includes('/especialidad/') || url.includes('/ubicacion/')) {
    return 0.7;
  }
  
  // Condition pages get medium priority
  if (url.includes('/padecimiento/')) {
    return 0.7;
  }
  
  // Search result pages get lower priority
  if (url.includes('/buscar')) {
    return 0.5;
  }
  
  // Default for other pages
  return 0.4;
}

/**
 * Helper to determine change frequency based on content type
 */
export function determineChangeFrequency(url: string): SitemapURL['changefreq'] {
  // Dynamic content that changes frequently
  if (url === '/' || url.includes('/buscar')) {
    return 'daily';
  }
  
  // Doctor profiles may change often (reviews, availability)
  if (url.includes('/doctor/')) {
    return 'weekly';
  }
  
  // Specialty pages update less frequently
  if (url.includes('/especialidad/')) {
    return 'monthly';
  }
  
  // Medical information pages don't change often
  if (url.includes('/padecimiento/')) {
    return 'monthly';
  }
  
  // Location pages
  if (url.includes('/ubicacion/')) {
    return 'monthly';
  }
  
  // Static info pages
  if (url.includes('/acerca-de') || url.includes('/terminos') || url.includes('/privacidad')) {
    return 'yearly';
  }
  
  // Default for other pages
  return 'monthly';
}

/**
 * Creates sitemap data for the main pages of the site
 */
export function generateMainSitemapURLs(baseUrl: string): SitemapURL[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    {
      url: `${baseUrl}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/especialidades`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/padecimientos`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/ubicaciones`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/buscar`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/telemedicina`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/acerca-de`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/terminos`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/privacidad`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/contacto`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/ayuda`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.5
    }
  ];
}

// Function signature for a sitemap generator that can be used by build scripts
export type SitemapGenerator = (
  options: SitemapOptions, 
  getUrls: () => Promise<SitemapURL[]>
) => Promise<void>;

// Export these utility functions to be used by build scripts