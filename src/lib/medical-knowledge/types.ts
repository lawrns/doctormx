/**
 * Medical Knowledge Base Types
 * Provides type definitions for medical knowledge management
 */

export type MedicalGuidelineType = 'nom' | 'imss' | 'issste' | 'who' | 'cdc' | 'uptodate' | 'guideline';

export interface MedicalDocument {
  id: string;
  content: string;
  source: string;
  specialty: string;
  metadata: {
    title?: string;
    author?: string;
    year?: number;
    type?: MedicalGuidelineType;
    url?: string;
    keywords?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface RetrievedContext {
  documents: MedicalDocument[];
  relevance_scores: number[];
  total_results: number;
  query: string;
}

export interface MedicalGuideline {
  title: string;
  content: string;
  specialty: string;
  source: string;
  year: number;
  type: MedicalGuidelineType;
  keywords: string[];
}

// Type for RPC results with similarity score
export interface MedicalDocumentWithSimilarity extends MedicalDocument {
  similarity?: number;
}

// Specialty definition
export interface MedicalSpecialty {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  commonKeywords: string[];
}

// Search options
export interface SearchOptions {
  specialty?: string;
  limit?: number;
  threshold?: number;
}

// Knowledge base statistics
export interface KnowledgeBaseStats {
  total_documents: number;
  documents_by_specialty: Record<string, number>;
  documents_by_source: Record<string, number>;
  last_updated: string;
}
