/**
 * Medical Guidelines Loader
 * Functions for loading and querying medical guidelines
 */

import { MedicalGuideline, SearchOptions } from '../types';
import {
  ALL_GUIDELINES,
  GUIDELINES_BY_SPECIALTY
} from '../data/guidelines';

// Simple in-memory cache
const guidelineCache = new Map<string, MedicalGuideline[]>();

/**
 * Get all medical guidelines
 */
export function getAllGuidelines(): MedicalGuideline[] {
  return ALL_GUIDELINES;
}

/**
 * Get guidelines by specialty
 */
export function getGuidelinesBySpecialty(specialty: string): MedicalGuideline[] {
  const cacheKey = `specialty:${specialty}`;
  
  if (guidelineCache.has(cacheKey)) {
    return guidelineCache.get(cacheKey)!;
  }
  
  const guidelines = GUIDELINES_BY_SPECIALTY[specialty] || [];
  guidelineCache.set(cacheKey, guidelines);
  return guidelines;
}

/**
 * Search guidelines by keyword
 */
export function searchGuidelines(
  keyword: string,
  options?: SearchOptions
): MedicalGuideline[] {
  const normalizedKeyword = keyword.toLowerCase();
  const limit = options?.limit || 10;
  
  let results = ALL_GUIDELINES.filter(guideline => {
    // Search in title
    if (guideline.title.toLowerCase().includes(normalizedKeyword)) {
      return true;
    }
    
    // Search in content
    if (guideline.content.toLowerCase().includes(normalizedKeyword)) {
      return true;
    }
    
    // Search in keywords
    if (guideline.keywords.some(k => k.toLowerCase().includes(normalizedKeyword))) {
      return true;
    }
    
    return false;
  });
  
  // Filter by specialty if specified
  if (options?.specialty) {
    results = results.filter(g => 
      g.specialty.toLowerCase() === options.specialty!.toLowerCase()
    );
  }
  
  return results.slice(0, limit);
}

/**
 * Get guidelines by source (IMSS, CENETEC, etc.)
 */
export function getGuidelinesBySource(source: string): MedicalGuideline[] {
  return ALL_GUIDELINES.filter(g => 
    g.source.toLowerCase() === source.toLowerCase()
  );
}

/**
 * Get guidelines by type (NOM, IMSS, WHO, etc.)
 */
export function getGuidelinesByType(type: string): MedicalGuideline[] {
  return ALL_GUIDELINES.filter(g => 
    g.type.toLowerCase() === type.toLowerCase()
  );
}

/**
 * Get guidelines by year
 */
export function getGuidelinesByYear(year: number): MedicalGuideline[] {
  return ALL_GUIDELINES.filter(g => g.year === year);
}

/**
 * Get the most recent guidelines
 */
export function getRecentGuidelines(limit: number = 5): MedicalGuideline[] {
  return [...ALL_GUIDELINES]
    .sort((a, b) => b.year - a.year)
    .slice(0, limit);
}

/**
 * Get guidelines statistics
 */
export function getGuidelinesStats(): {
  total: number;
  bySpecialty: Record<string, number>;
  bySource: Record<string, number>;
  byType: Record<string, number>;
  byYear: Record<number, number>;
} {
  const bySpecialty: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byYear: Record<number, number> = {};
  
  ALL_GUIDELINES.forEach(g => {
    bySpecialty[g.specialty] = (bySpecialty[g.specialty] ?? 0) + 1;
    bySource[g.source] = (bySource[g.source] ?? 0) + 1;
    byType[g.type] = (byType[g.type] ?? 0) + 1;
    byYear[g.year] = (byYear[g.year] ?? 0) + 1;
  });
  
  return {
    total: ALL_GUIDELINES.length,
    bySpecialty,
    bySource,
    byType,
    byYear
  };
}

/**
 * Clear the guideline cache
 */
export function clearGuidelineCache(): void {
  guidelineCache.clear();
}
