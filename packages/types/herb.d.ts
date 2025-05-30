export interface Herb {
  id: string;
  latinName: string;
  commonNames: string[];
  activeCompounds: string[];
  traditionalUses: string[];
  evidenceGrade: 'A' | 'B' | 'C' | 'D';
  contraindications: string[];
  preparation: {
    tea: string;
    tincture?: string;
    powder?: string;
    fresh?: string;
  };
  sourcing: {
    suppliers: string[];
    quality: string;
    seasonal: boolean;
    cost: string;
  };
  synergies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HerbSearchQuery {
  query: string;
  evidenceGrade?: string[];
  traditionalUse?: string;
  limit?: number;
}

export interface HerbSearchResult {
  herbs: Herb[];
  total: number;
}