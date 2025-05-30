/**
 * Herb and medicinal plant type definitions for DoctorMX
 */

export interface Herb {
  id: string;
  latinName: string;
  commonNames: string[];
  activeCompounds: string[];
  traditionalUses: string[];
  evidenceGrade: 'A' | 'B' | 'C' | 'D'; // A = Strong evidence, D = Limited
  contraindications: string[];
  preparation: HerbPreparation;
  sourcing: HerbSourcing;
  synergies: string[]; // Herb IDs that work well together
  createdAt: Date;
  updatedAt: Date;
}

export interface HerbPreparation {
  forms: ('tea' | 'tincture' | 'capsule' | 'powder' | 'oil' | 'fresh')[];
  dosage: {
    form: string;
    amount: string;
    frequency: string;
    duration?: string;
    notes?: string;
  }[];
  instructions: string;
}

export interface HerbSourcing {
  nativeRegion: string[];
  availability: 'common' | 'seasonal' | 'rare';
  sustainabilityRating: 'low' | 'medium' | 'high';
  certifications: string[];
  suppliers?: string[];
}

export interface HerbSearchFilters {
  query?: string;
  uses?: string[];
  evidenceGrade?: ('A' | 'B' | 'C' | 'D')[];
  preparation?: string[];
  region?: string[];
  availability?: ('common' | 'seasonal' | 'rare')[];
}

export interface HerbSearchResult {
  herbs: Herb[];
  total: number;
  page: number;
  pageSize: number;
  filters: HerbSearchFilters;
}