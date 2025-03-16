import fs from 'fs';
import path from 'path';

/**
 * Sitemap Generator
 * 
 * This script generates a sitemap.xml file for the Doctor.mx website.
 * It includes static routes and can pull dynamic routes from a database.
 */

// Base URL for the website
const SITE_URL = 'https://doctor.mx';

// Define static routes
const staticRoutes = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/buscar', changefreq: 'daily', priority: 0.9 },
  { url: '/especialidades', changefreq: 'weekly', priority: 0.8 },
  { url: '/telemedicina', changefreq: 'weekly', priority: 0.8 },
  { url: '/sintomas', changefreq: 'weekly', priority: 0.8 },
  { url: '/alternativa', changefreq: 'monthly', priority: 0.7 },
  { url: '/connect', changefreq: 'monthly', priority: 0.7 },
  { url: '/acerca', changefreq: 'monthly', priority: 0.6 },
  { url: '/contacto', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacidad', changefreq: 'yearly', priority: 0.5 },
  { url: '/terminos', changefreq: 'yearly', priority: 0.5 },
  { url: '/ayuda', changefreq: 'monthly', priority: 0.6 }
];

// In a real application, you would fetch these from the database
// For example, doctor profiles, specialties, etc.
async function fetchDynamicRoutes() {
  // Placeholder for database fetching
  // In a real application, fetch from your database
  
  const doctorRoutes = [
    // Mocked doctor routes for illustration
    { url: '/doctor/1', changefreq: 'weekly', priority: 0.7 },
    { url: '/doctor/2', changefreq: 'weekly', priority: 0.7 },
    { url: '/doctor/3', changefreq: 'weekly', priority: 0.7 }
  ];
  
  const specialtyRoutes = [
    // Mocked specialty routes for illustration
    { url: '/especialidades/cardiologia', changefreq: 'weekly', priority: 0.7 },
    { url: '/especialidades/dermatologia', changefreq: 'weekly', priority: 0.7 },
    { url: '/especialidades/pediatria', changefreq: 'weekly', priority: 0.7 }
  ];

  return [...doctorRoutes, ...specialtyRoutes];
}

// Generate XML for a URL
function generateUrlXml(route: { url: string, changefreq: string, priority: number }) {
  const url = route.url.startsWith('http') ? route.url : `${SITE_URL}${route.url}`;
  return `  <url>
    <loc>${url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
}

// Generate the complete sitemap
async function generateSitemap() {
  try {
    // Get dynamic routes
    const dynamicRoutes = await fetchDynamicRoutes();
    
    // Combine all routes
    const allRoutes = [...staticRoutes, ...dynamicRoutes];
    
    // Generate XML content
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(generateUrlXml).join('\n')}
</urlset>`;
    
    // Write to file
    const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemapContent);
    
    console.log(`Sitemap generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Run the generator
generateSitemap();

// Export for use in build scripts
export default generateSitemap;