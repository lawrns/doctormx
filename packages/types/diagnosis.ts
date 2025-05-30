/**
 * Diagnosis and medical analysis type definitions for DoctorMX
 */

export interface SymptomReport {
  id: string;
  sessionId: string;
  symptoms: SymptomData[];
  imagesUrl?: string[];
  analysis?: ImageAnalysis;
  createdAt: Date;
}

export interface SymptomData {
  code?: string; // ICD-10 or custom code
  name: string;
  severity: number; // 1-10 scale
  duration: string;
  location?: string;
  description: string;
}

export interface ImageAnalysis {
  findings: string;
  confidence: number; // 0-1
  severity: number; // 1-10
  emergencyFlags: string[];
}

export interface RootCause {
  condition: string;
  evidence: string[];
  confidence: number; // 0-1
  category: 'infectious' | 'inflammatory' | 'metabolic' | 'psychological' | 'environmental' | 'unknown';
  icdCode?: string;
}

export interface Diagnosis {
  id: string;
  symptomReportId: string;
  rootCauses: RootCause[];
  overallConfidence: number;
  redFlags: RedFlag[];
  recommendations: DiagnosticRecommendation[];
  createdAt: Date;
}

export interface RedFlag {
  type: 'emergency' | 'urgent' | 'warning';
  description: string;
  action: string;
  severity: number; // 1-10
}

export interface DiagnosticRecommendation {
  type: 'herb' | 'lifestyle' | 'referral' | 'test';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  herbIds?: string[]; // References to herb database
  specialtyReferral?: string;
}

export interface ConstitutionalProfile {
  id: string;
  userId: string;
  method: 'ayurveda' | 'metabolic' | 'tcm';
  profile: Record<string, number>; // e.g., { vata: 0.6, pitta: 0.3, kapha: 0.1 }
  questionnaire: ConstitutionalAnswer[];
  createdAt: Date;
}

export interface ConstitutionalAnswer {
  questionId: string;
  question: string;
  answer: string;
  weight: number;
}