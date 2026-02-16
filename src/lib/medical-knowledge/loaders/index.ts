/**
 * Medical Knowledge Loaders
 * Barrel file for all loader functions
 */

// Types
export type { 
  SearchOptions,
  MedicalGuideline,
  MedicalSpecialty 
} from '../types';

// Guideline Loaders
export {
  getAllGuidelines,
  getGuidelinesBySpecialty,
  searchGuidelines,
  getGuidelinesBySource,
  getGuidelinesByType,
  getGuidelinesByYear,
  getRecentGuidelines,
  getGuidelinesStats,
  clearGuidelineCache
} from './guideline-loader';

// Specialty Loaders
export {
  getAllSpecialties,
  getSpecialty,
  getSpecialtiesByKeyword,
  getSpecialtyOptions,
  getSpecialtyNames,
  specialtyExists,
  searchSpecialties,
  getRelatedSpecialties,
  getSpecialtyStats,
  clearSpecialtyCache
} from './specialty-loader';
