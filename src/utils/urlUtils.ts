/**
 * URL optimization utilities for SEO
 */

/**
 * Converts a string to a URL slug
 * Removes special characters, converts to lowercase, and replaces spaces with hyphens
 */
export const toUrlSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize to decomposed form for handling accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents/diacritics
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Creates an optimized doctor URL 
 */
export const getOptimizedDoctorUrl = (doctor: any): string => {
  if (!doctor || !doctor.name || !doctor.specialty || !doctor.id) {
    return '';
  }
  
  const nameSlug = toUrlSlug(doctor.name);
  const specialtySlug = toUrlSlug(doctor.specialty);
  const locationSlug = doctor.location ? toUrlSlug(doctor.location) : '';
  
  let url = `/doctor/${nameSlug}-${specialtySlug}`;
  
  if (locationSlug) {
    url += `-${locationSlug}`;
  }
  
  url += `-${doctor.id}`;
  
  return url;
};

/**
 * Creates an optimized specialty URL
 */
export const getOptimizedSpecialtyUrl = (specialty: string, location?: string): string => {
  if (!specialty) {
    return '';
  }
  
  const specialtySlug = toUrlSlug(specialty);
  let url = `/especialidad/${specialtySlug}`;
  
  if (location) {
    url += `/${toUrlSlug(location)}`;
  }
  
  return url;
};

/**
 * Creates an optimized location URL
 */
export const getOptimizedLocationUrl = (location: string): string => {
  if (!location) {
    return '';
  }
  
  return `/ubicacion/${toUrlSlug(location)}`;
};

/**
 * Extracts doctor ID from an optimized URL
 */
export const extractDoctorIdFromUrl = (url: string): string | null => {
  const regex = /-([a-zA-Z0-9]+)$/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
};

/**
 * Generates canonical URL for pagination
 */
export const getCanonicalUrlForPagination = (baseUrl: string, page: number): string => {
  // If we're on page 1, the canonical URL is just the base URL without pagination
  if (page === 1) {
    return baseUrl;
  }
  
  // If baseUrl already has query parameters
  if (baseUrl.includes('?')) {
    return `${baseUrl}&page=${page}`;
  }
  
  // If baseUrl has no query parameters
  return `${baseUrl}?page=${page}`;
};

/**
 * Generates alternate URL for hreflang tags
 */
export const getAlternateUrls = (baseUrl: string, locales: string[] = ['es-mx']): Array<{locale: string, url: string}> => {
  return locales.map(locale => ({
    locale,
    url: `https://doctor.mx${baseUrl}`
  }));
};
