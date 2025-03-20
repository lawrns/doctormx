/**
 * SEO Files Generator Script
 * 
 * This script generates sitemap.xml and robots.txt files during the build process.
 * Run it as part of the build pipeline to ensure fresh SEO files are created.
 * 
 * Usage: 
 * - As a build script: node scripts/generateSEOFiles.js
 * - Or import and call the functions directly in your build process
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateSitemapXML, SitemapURL, generateSitemapIndex, generateMainSitemapURLs } from '../utils/sitemapGenerator';
import { standardDoctorMxRobots } from '../utils/robotsGenerator';

// Configuration
const DOMAIN = 'https://doctor.mx';
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const SITEMAP_OUTPUT_DIR = path.join(PUBLIC_DIR);

// Ensure output directory exists
const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Write a file, creating directories if needed
const writeFileWithDir = (filePath: string, content: string) => {
  const dir = path.dirname(filePath);
  ensureDirectoryExists(dir);
  fs.writeFileSync(filePath, content);
  console.log(`Generated: ${filePath}`);
};

// Generate the main sitemap.xml
const generateMainSitemap = () => {
  const urls = generateMainSitemapURLs(DOMAIN);
  const sitemapXML = generateSitemapXML(urls);
  writeFileWithDir(path.join(SITEMAP_OUTPUT_DIR, 'sitemap.xml'), sitemapXML);
};

// Helper to get mock data for development
// In a real scenario, you would fetch this from the database
const getMockDoctors = (): SitemapURL[] => {
  // This would normally come from a database query
  const doctorSlugs = [
    'dr-juan-perez-cardiologo',
    'dra-maria-sanchez-pediatra',
    'dr-carlos-rodriguez-traumatologo',
    'dra-ana-martinez-dermatologa',
    'dr-luis-gomez-neurologo'
  ];
  
  const today = new Date().toISOString().split('T')[0];
  
  return doctorSlugs.map(slug => ({
    url: `${DOMAIN}/doctor/${slug}`,
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.8
  }));
};

// Helper to get mock specialties
const getMockSpecialties = (): SitemapURL[] => {
  const specialtySlugs = [
    'cardiologia',
    'pediatria',
    'traumatologia',
    'dermatologia',
    'neurologia',
    'ginecologia',
    'oftalmologia',
    'otorrinolaringologia'
  ];
  
  const today = new Date().toISOString().split('T')[0];
  
  return specialtySlugs.map(slug => ({
    url: `${DOMAIN}/especialidad/${slug}`,
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.7
  }));
};

// Helper to get mock conditions
const getMockConditions = (): SitemapURL[] => {
  const conditionSlugs = [
    'hipertension',
    'diabetes',
    'asma',
    'artritis',
    'migraña'
  ];
  
  const today = new Date().toISOString().split('T')[0];
  
  return conditionSlugs.map(slug => ({
    url: `${DOMAIN}/padecimiento/${slug}`,
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.7
  }));
};

// Helper to get mock locations
const getMockLocations = (): SitemapURL[] => {
  const locationSlugs = [
    'ciudad-de-mexico',
    'guadalajara',
    'monterrey',
    'puebla',
    'queretaro'
  ];
  
  const today = new Date().toISOString().split('T')[0];
  
  return locationSlugs.map(slug => ({
    url: `${DOMAIN}/ubicacion/${slug}`,
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.7
  }));
};

// Generate sitemaps for different content types
const generateContentTypeSitemaps = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Doctors sitemap
  const doctorUrls = getMockDoctors();
  const doctorsSitemapXML = generateSitemapXML(doctorUrls);
  writeFileWithDir(path.join(SITEMAP_OUTPUT_DIR, 'sitemap-doctors.xml'), doctorsSitemapXML);
  
  // Specialties sitemap
  const specialtyUrls = getMockSpecialties();
  const specialtiesSitemapXML = generateSitemapXML(specialtyUrls);
  writeFileWithDir(path.join(SITEMAP_OUTPUT_DIR, 'sitemap-specialties.xml'), specialtiesSitemapXML);
  
  // Conditions sitemap
  const conditionUrls = getMockConditions();
  const conditionsSitemapXML = generateSitemapXML(conditionUrls);
  writeFileWithDir(path.join(SITEMAP_OUTPUT_DIR, 'sitemap-conditions.xml'), conditionsSitemapXML);
  
  // Locations sitemap
  const locationUrls = getMockLocations();
  const locationsSitemapXML = generateSitemapXML(locationUrls);
  writeFileWithDir(path.join(SITEMAP_OUTPUT_DIR, 'sitemap-locations.xml'), locationsSitemapXML);
  
  // Generate sitemap index
  const sitemapIndex = generateSitemapIndex([
    { url: `${DOMAIN}/sitemap.xml`, lastmod: today },
    { url: `${DOMAIN}/sitemap-doctors.xml`, lastmod: today },
    { url: `${DOMAIN}/sitemap-specialties.xml`, lastmod: today },
    { url: `${DOMAIN}/sitemap-conditions.xml`, lastmod: today },
    { url: `${DOMAIN}/sitemap-locations.xml`, lastmod: today }
  ]);
  
  writeFileWithDir(path.join(SITEMAP_OUTPUT_DIR, 'sitemap-index.xml'), sitemapIndex);
};

// Generate robots.txt
const generateRobotsTxt = () => {
  const robotsTxt = standardDoctorMxRobots(DOMAIN, '/sitemap-index.xml');
  writeFileWithDir(path.join(PUBLIC_DIR, 'robots.txt'), robotsTxt);
};

// Main function to run everything
export const generateSEOFiles = () => {
  try {
    // Generate all sitemaps
    generateMainSitemap();
    generateContentTypeSitemaps();
    
    // Generate robots.txt
    generateRobotsTxt();
    
    console.log('SEO files generated successfully');
  } catch (error) {
    console.error('Error generating SEO files:', error);
    process.exit(1);
  }
};

// Run the generator if this file is executed directly
if (require.main === module) {
  generateSEOFiles();
}

// Export for use in build scripts
export default generateSEOFiles;