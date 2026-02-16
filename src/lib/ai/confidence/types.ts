/**
 * AI Confidence Scoring Types
 *
 * Type definitions for the medical diagnosis confidence scoring system.
 */

/**
 * Represents a diagnosis with an associated confidence score
 */
export interface DiagnosisConfidence {
  /** Medical condition name */
  condition: string;
  /** Confidence score from 0-100 */
  confidence: number;
  /** ICD-10 code if available */
  icd10Code?: string;
  /** Reasoning for the diagnosis */
  reasoning?: string;
  /** Contributing symptoms */
  contributingSymptoms?: string[];
  /** Contraindications or conflicting factors */
  contraindications?: string[];
}

/**
 * Probability range with low, mid (expected), and high estimates
 */
export interface ConfidenceInterval {
  /** Lower bound of confidence (conservative estimate) */
  low: number;
  /** Expected/most likely confidence value */
  mid: number;
  /** Upper bound of confidence (optimistic estimate) */
  high: number;
  /** Margin of error */
  marginOfError: number;
}

/**
 * Patient demographic information for confidence adjustments
 */
export interface DemographicFactors {
  /** Patient age in years */
  age: number;
  /** Patient gender */
  gender: 'male' | 'female' | 'other';
  /** Patient BMI */
  bmi?: number;
  /** Smoking status */
  smokingStatus?: 'never' | 'former' | 'current';
  /** Pack years if former/current smoker */
  packYears?: number;
  /** Geographic region for epidemiological factors */
  region?: string;
  /** Pregnancy status (if applicable) */
  isPregnant?: boolean;
  /** Occupation for exposure risk */
  occupation?: string;
}

/**
 * Symptom severity and weighting information
 */
export interface SymptomSeverity {
  /** Symptom name */
  symptom: string;
  /** Severity scale 1-10 */
  severity: number;
  /** Duration in days */
  duration: number;
  /** Whether symptom is primary complaint */
  isPrimary: boolean;
  /** Whether symptom is progressing */
  isProgressing: boolean;
  /** Specificity of symptom (1-10, higher = more specific) */
  specificity?: number;
}

/**
 * Complete confidence analysis result
 */
export interface ConfidenceResult {
  /** Primary diagnosis with highest confidence */
  primaryDiagnosis: DiagnosisConfidence;
  /** Alternative differential diagnoses */
  differentialDiagnoses: DiagnosisConfidence[];
  /** Confidence interval for primary diagnosis */
  confidenceInterval: ConfidenceInterval;
  /** Overall confidence level category */
  confidenceLevel: ConfidenceLevel;
  /** Whether human doctor review is recommended */
  recommendDoctor: boolean;
  /** Risk factors identified */
  riskFactors: string[];
  /** Factors that increased confidence */
  confidenceBoosters: string[];
  /** Factors that decreased confidence */
  confidenceReducers: string[];
  /** Timestamp of analysis */
  timestamp: string;
  /** Model version or algorithm version */
  version: string;
}

/**
 * Confidence level categories
 */
export type ConfidenceLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';

/**
 * Patient context for enhancing AI responses
 */
export interface PatientContext {
  demographics: DemographicFactors;
  symptoms: SymptomSeverity[];
  comorbidities?: string[];
  medications?: string[];
  allergies?: string[];
  vitalSigns?: VitalSigns;
}

/**
 * Vital signs for additional context
 */
export interface VitalSigns {
  temperature?: number;
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

/**
 * Comorbidity with severity indicator
 */
export interface Comorbidity {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedDate?: string;
  isControlled: boolean;
}

/**
 * Color theme for confidence level UI display
 */
export interface ConfidenceColorTheme {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  badge: string;
  progress: string;
}

/**
 * Duration threshold configuration
 */
export interface DurationThreshold {
  max: number;
  reliability: number;
}

/**
 * Duration thresholds category
 */
export type DurationCategory = 'acute' | 'subacute' | 'chronic' | 'persistent';

/**
 * Age group classification
 */
export type AgeGroup = 'child' | 'adult' | 'elderly' | 'very-elderly';

/**
 * Severity level for recommendation decisions
 */
export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

/**
 * Gender type
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Smoking status type
 */
export type SmokingStatus = 'never' | 'former' | 'current';

/**
 * AI response source for merging
 */
export interface AIResponseSource {
  diagnoses: DiagnosisConfidence[];
  source: string;
  weight: number;
}

/**
 * Enhanced confidence result with original response
 */
export interface EnhancedConfidenceResult extends ConfidenceResult {
  originalResponse: string;
  enhancedAt: string;
}
