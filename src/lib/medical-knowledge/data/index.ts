/**
 * Medical Knowledge Data Exports
 * Barrel file for all medical data (raw data only, no loader functions)
 */

// Types
export type { 
  MedicalSpecialty,
  MedicalGuideline,
  MedicalGuidelineType 
} from '../types';

// Raw data only - use loaders for data access functions
export {
  MEDICAL_SPECIALTIES,
  SPECIALTY_MAP
} from './specialties';

// Guidelines - raw data only
export {
  // Specialty-specific arrays
  GENERAL_GUIDELINES,
  CARDIOLOGY_GUIDELINES,
  ENDOCRINOLOGY_GUIDELINES,
  PULMONOLOGY_GUIDELINES,
  GASTROENTEROLOGY_GUIDELINES,
  NEUROLOGY_GUIDELINES,
  DERMATOLOGY_GUIDELINES,
  INFECTOLOGY_GUIDELINES,
  PSYCHIATRY_GUIDELINES,
  RHEUMATOLOGY_GUIDELINES,
  NEPHROLOGY_GUIDELINES,
  UROLOGY_GUIDELINES,
  OPHTHALMOLOGY_GUIDELINES,
  ENT_GUIDELINES,
  GERIATRICS_GUIDELINES,
  GYNECOLOGY_GUIDELINES,
  PEDIATRICS_GUIDELINES,
  EMERGENCY_GUIDELINES,
  PREVENTIVE_GUIDELINES,
  PAIN_GUIDELINES,
  TRAUMATOLOGY_GUIDELINES,
  // Combined exports
  ALL_GUIDELINES,
  GUIDELINES_BY_SPECIALTY
} from './guidelines';
