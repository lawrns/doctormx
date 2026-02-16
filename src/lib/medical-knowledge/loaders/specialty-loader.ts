/**
 * Specialty Loader
 * Functions for loading and querying medical specialties
 */

import { MedicalSpecialty } from '../types';
import {
  MEDICAL_SPECIALTIES,
  SPECIALTY_MAP,
  getSpecialty as getSpecialtyData,
  getSpecialtiesByKeyword as getSpecialtiesByKeywordData
} from '../data/specialties';

// Simple in-memory cache
const specialtyCache = new Map<string, MedicalSpecialty[]>();

/**
 * Get all medical specialties
 */
export function getAllSpecialties(): MedicalSpecialty[] {
  return MEDICAL_SPECIALTIES;
}

/**
 * Get a specialty by ID or name
 */
export function getSpecialty(identifier: string): MedicalSpecialty | undefined {
  return getSpecialtyData(identifier);
}

/**
 * Get specialties by keyword
 */
export function getSpecialtiesByKeyword(keyword: string): MedicalSpecialty[] {
  const cacheKey = `keyword:${keyword.toLowerCase()}`;
  
  if (specialtyCache.has(cacheKey)) {
    return specialtyCache.get(cacheKey)!;
  }
  
  const specialties = getSpecialtiesByKeywordData(keyword);
  specialtyCache.set(cacheKey, specialties);
  return specialties;
}

/**
 * Get specialty IDs for use in forms/selects
 */
export function getSpecialtyOptions(): Array<{ value: string; label: string }> {
  return MEDICAL_SPECIALTIES.map(s => ({
    value: s.id,
    label: s.name
  }));
}

/**
 * Get specialty names for a given list of IDs
 */
export function getSpecialtyNames(ids: string[]): string[] {
  return ids
    .map(id => SPECIALTY_MAP[id]?.name)
    .filter((name): name is string => !!name);
}

/**
 * Check if a specialty exists
 */
export function specialtyExists(identifier: string): boolean {
  return getSpecialty(identifier) !== undefined;
}

/**
 * Search specialties by name or description
 */
export function searchSpecialties(query: string): MedicalSpecialty[] {
  const normalizedQuery = query.toLowerCase();
  
  return MEDICAL_SPECIALTIES.filter(s => 
    s.name.toLowerCase().includes(normalizedQuery) ||
    s.description?.toLowerCase().includes(normalizedQuery) ||
    s.nameEn?.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Get related specialties based on common keywords
 */
export function getRelatedSpecialties(specialtyId: string): MedicalSpecialty[] {
  const specialty = SPECIALTY_MAP[specialtyId];
  if (!specialty) return [];
  
  return MEDICAL_SPECIALTIES.filter(s => {
    if (s.id === specialtyId) return false;
    
    // Check for common keywords
    return s.commonKeywords.some(keyword =>
      specialty.commonKeywords.includes(keyword)
    );
  });
}

/**
 * Get specialty statistics
 */
export function getSpecialtyStats(): {
  total: number;
  withDescription: number;
  withEnglishName: number;
  averageKeywordsPerSpecialty: number;
} {
  const total = MEDICAL_SPECIALTIES.length;
  const withDescription = MEDICAL_SPECIALTIES.filter(s => s.description).length;
  const withEnglishName = MEDICAL_SPECIALTIES.filter(s => s.nameEn).length;
  const totalKeywords = MEDICAL_SPECIALTIES.reduce(
    (sum, s) => sum + s.commonKeywords.length, 
    0
  );
  
  return {
    total,
    withDescription,
    withEnglishName,
    averageKeywordsPerSpecialty: Math.round((totalKeywords / total) * 10) / 10
  };
}

/**
 * Clear the specialty cache
 */
export function clearSpecialtyCache(): void {
  specialtyCache.clear();
}
