import fs from 'fs';
import path from 'path';
import { urlPatterns } from '../lib/urlUtils';

/**
 * Doctor Sitemap Generator
 * 
 * This script generates a specialized sitemap for doctor profiles.
 * In a real implementation, this would fetch data from a database.
 */

// Base URL for the website
const SITE_URL = 'https://doctor.mx';

// Mock database query function 
// In a real app, this would be an actual database query
async function fetchDoctors() {
  // This is mock data for illustration
  // In a real app, this would come from your database
  return [
    {
      id: '1',
      name: 'Dr. Juan Pérez',
      specialty: 'Cardiología',
      city: 'Ciudad de México',
      updated: '2023-12-15'
    },
    {
      id: '2',
      name: 'Dra. Ana García',
      specialty: 'Pediatría',
      city: 'Guadalajara',
      updated: '2023-12-10'
    },
    {
      id: '3',
      name: 'Dr. Carlos Rodríguez',
      specialty: 'Neurología',
      city: 'Monterrey',
      updated: '2023-12-05'
    },
    // Add more mock doctors here
  ];
}

// Generate XML for a doctor URL
function generateDoctorUrlXml(doctor: any) {
  const url = SITE_URL + urlPatterns.doctorProfile(doctor.name, doctor.specialty, doctor.city);
  const lastmod = doctor.updated || new Date().toISOString().split('T')[0];
  
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}

// Generate the complete doctor sitemap
async function generateDoctorSitemap() {
  try {
    // Fetch doctors from the database
    const doctors = await fetchDoctors();
    
    // Generate XML content
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${doctors.map(generateDoctorUrlXml).join('\n')}
</urlset>`;
    
    // Ensure sitemaps directory exists
    const sitemapsDir = path.resolve(process.cwd(), 'public', 'sitemaps');
    if (!fs.existsSync(sitemapsDir)) {
      fs.mkdirSync(sitemapsDir, { recursive: true });
    }
    
    // Write to file
    const outputPath = path.resolve(sitemapsDir, 'doctors-sitemap.xml');
    fs.writeFileSync(outputPath, sitemapContent);
    
    console.log(`Doctor sitemap generated at ${outputPath}`);
    
    // Update sitemap index
    updateSitemapIndex();
  } catch (error) {
    console.error('Error generating doctor sitemap:', error);
  }
}

// Update the sitemap index file to include all specialized sitemaps
function updateSitemapIndex() {
  const sitemaps = [
    { name: 'sitemap.xml', lastmod: new Date().toISOString().split('T')[0] },
    { name: 'sitemaps/doctors-sitemap.xml', lastmod: new Date().toISOString().split('T')[0] }
    // Add more specialized sitemaps here as they're created
  ];
  
  const indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${SITE_URL}/${sitemap.name}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  
  const outputPath = path.resolve(process.cwd(), 'public', 'sitemap-index.xml');
  fs.writeFileSync(outputPath, indexContent);
  
  console.log(`Sitemap index updated at ${outputPath}`);
}

// Run the generator
generateDoctorSitemap();

// Export for use in build scripts
export default generateDoctorSitemap;