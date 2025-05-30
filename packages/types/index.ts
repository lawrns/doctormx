/**
 * Shared type definitions for DoctorMX packages
 */

export * from './herb';
export * from './diagnosis';
export * from './protocol';

// Feature flags
export interface FeatureFlags {
  herbDatabase: boolean;
  rootCauseAnalysis: boolean;
  protocolBuilder: boolean;
  constitutionalAnalysis: boolean;
  redFlagDetection: boolean;
  imageAnalysisV2: boolean;
  progressTracking: boolean;
  knowledgeGraph: boolean;
  expertPortal: boolean;
  marketplace: boolean;
  community: boolean;
  multilingual: boolean;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

// Common utility types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}