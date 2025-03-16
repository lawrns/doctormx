/**
 * URL Utilities
 * 
 * Utilities for creating and managing consistent URL structures
 * according to our SEO strategy.
 */

/**
 * Generates a URL-friendly slug
 * @param text Text to slugify
 * @returns A URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')                 // Split accented characters into base char + diacritic
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')        // Remove symbols
    .replace(/[\s_-]+/g, '-')        // Replace spaces, underscores and hyphens with a single hyphen
    .replace(/^-+|-+$/g, '');        // Remove leading and trailing hyphens
};

// URL structure patterns defined in the SEO plan
export const urlPatterns = {
  doctorProfile: (doctorName: string, specialty: string, city: string) => 
    `/doctores/${slugify(specialty)}/${slugify(city)}/${slugify(doctorName)}`,
  
  specialty: (specialtyName: string) => 
    `/especialidades/${slugify(specialtyName)}`,
  
  condition: (conditionName: string) => 
    `/condiciones/${slugify(conditionName)}`,
  
  article: (category: string, articleName: string) => 
    `/articulos/${slugify(category)}/${slugify(articleName)}`,
    
  citySpecialty: (specialty: string, city: string) => 
    `/doctores/${slugify(specialty)}/${slugify(city)}`,
    
  search: (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    const queryString = searchParams.toString();
    return `/buscar${queryString ? '?' + queryString : ''}`;
  }
};

/**
 * Extracts structured data from a URL path
 * @param path URL path
 * @returns Extracted data or null if pattern doesn't match
 */
export const extractFromUrl = (path: string): Record<string, string> | null => {
  // Doctor profile: /doctores/[specialty]/[city]/[doctor-name]
  const doctorProfileRegex = /^\/doctores\/([^\/]+)\/([^\/]+)\/([^\/]+)\/?$/;
  const doctorMatch = path.match(doctorProfileRegex);
  if (doctorMatch) {
    return {
      type: 'doctorProfile',
      specialty: doctorMatch[1],
      city: doctorMatch[2],
      doctorName: doctorMatch[3]
    };
  }
  
  // Specialty: /especialidades/[specialty-name]
  const specialtyRegex = /^\/especialidades\/([^\/]+)\/?$/;
  const specialtyMatch = path.match(specialtyRegex);
  if (specialtyMatch) {
    return {
      type: 'specialty',
      specialtyName: specialtyMatch[1]
    };
  }
  
  // Condition: /condiciones/[condition-name]
  const conditionRegex = /^\/condiciones\/([^\/]+)\/?$/;
  const conditionMatch = path.match(conditionRegex);
  if (conditionMatch) {
    return {
      type: 'condition',
      conditionName: conditionMatch[1]
    };
  }
  
  // Article: /articulos/[category]/[article-name]
  const articleRegex = /^\/articulos\/([^\/]+)\/([^\/]+)\/?$/;
  const articleMatch = path.match(articleRegex);
  if (articleMatch) {
    return {
      type: 'article',
      category: articleMatch[1],
      articleName: articleMatch[2]
    };
  }
  
  // City-Specialty: /doctores/[specialty]/[city]
  const citySpecialtyRegex = /^\/doctores\/([^\/]+)\/([^\/]+)\/?$/;
  const citySpecialtyMatch = path.match(citySpecialtyRegex);
  if (citySpecialtyMatch) {
    return {
      type: 'citySpecialty',
      specialty: citySpecialtyMatch[1],
      city: citySpecialtyMatch[2]
    };
  }
  
  return null;
};

/**
 * Generates canonical URL for the current path
 * @param path Current path
 * @param baseUrl Base URL of the site
 * @returns Canonical URL
 */
export const getCanonicalUrl = (path: string, baseUrl = 'https://doctor.mx'): string => {
  // Remove trailing slashes
  const cleanPath = path.replace(/\/$/, '');
  
  // If path is already clean, return it
  if (cleanPath === path) {
    return `${baseUrl}${path}`;
  }
  
  // Otherwise return the canonical version
  return `${baseUrl}${cleanPath}`;
};

export default {
  slugify,
  urlPatterns,
  extractFromUrl,
  getCanonicalUrl
};