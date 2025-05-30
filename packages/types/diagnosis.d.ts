export interface SymptomReport {
  id: string;
  sessionId: string;
  symptoms: SymptomData[];
  imagesUrl?: string;
  analysis?: ImageAnalysis;
  createdAt: Date;
}

export interface SymptomData {
  code: string; // ICD-10 or SNOMED CT code
  name: string;
  severity: number; // 1-5 scale
  duration: string; // "hours", "days", "weeks", "months"
  location?: string;
  quality?: string; // "sharp", "dull", "burning", etc.
}

export interface ImageAnalysis {
  findings: string;
  confidence: number;
  detectedConditions: string[];
  emergencyFlags: string[];
}

export interface RootCause {
  condition: string;
  icd10Code?: string;
  evidence: string[];
  confidence: number; // 0-1
  urgency: number; // 1-10
  description: string;
}

export interface Diagnosis {
  id: string;
  symptomReportId: string;
  rootCauses: RootCause[];
  confidence: number;
  redFlags: string[];
  recommendedTests: string[];
  emergency: boolean;
  createdAt: Date;
}