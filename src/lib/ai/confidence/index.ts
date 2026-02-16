/**
 * AI Confidence Scoring System
 *
 * Comprehensive confidence scoring system for medical diagnoses, incorporating
 * demographic factors, comorbidities, symptom duration, and evidence-based
 * medical knowledge.
 *
 * @example
 * ```typescript
 * import { confidenceCalculator, enhanceWithConfidence } from '@/lib/ai/confidence';
 *
 * // Calculate confidence for a diagnosis
 * const result = confidenceCalculator.calculateBaseConfidence(
 *   [{ condition: 'Influenza', confidence: 75 }],
 *   ['fever', 'cough', 'fatigue']
 * );
 *
 * // Enhance AI response with confidence scoring
 * const enhancedResponse = enhanceWithConfidence(aiResponse, patientContext);
 * ```
 */

// Types
export type {
  DiagnosisConfidence,
  ConfidenceInterval,
  DemographicFactors,
  SymptomSeverity,
  ConfidenceResult,
  ConfidenceLevel,
  PatientContext,
  VitalSigns,
  Comorbidity,
  ConfidenceColorTheme,
  DurationThreshold,
  DurationCategory,
  AgeGroup,
  SeverityLevel,
  Gender,
  SmokingStatus,
  AIResponseSource,
  EnhancedConfidenceResult,
} from './types';

export type {
  ValidationResult,
  RiskAssessment,
} from './validators';

export type {
  DemographicAdjustmentResult,
  ComorbidityAdjustmentResult,
} from './calculators';

// Main calculator
export {
  ConfidenceCalculator,
  confidenceCalculator,
  createDiagnosis,
  mergeAIResponses,
  enhanceWithConfidence,
} from './confidence-calculator';

export { ConfidenceAnalyzer } from './confidence-analyzer';

// Calculators
export {
  BaseCalculator,
  SymptomCalculator,
  DemographicCalculator,
  ComorbidityCalculator,
  ConsensusCalculator,
} from './calculators';

// Validators
export { ConfidenceValidator } from './validators';

// Utils
export {
  getConfidenceLevel,
  getConfidenceColor,
  formatConfidenceRange,
  formatConfidenceRangeSimple,
  shouldRecommendDoctor,
  getConfidenceDescription,
  getConfidenceRecommendation,
  formatConfidencePercent,
  getConfidenceProgressWidth,
  isActionableConfidence,
  getConfidenceTrend,
  parseAIConfidenceScores,
  hasExplicitConfidence,
  getExtractionQuality,
} from './utils';

// Data exports
export {
  BASE_RATES,
  AGE_PREVALENCE,
  GENDER_LIKELIHOOD,
  SYMPTOM_SPECIFICITY,
  COMORBIDITY_IMPACT,
  RISK_FACTOR_WEIGHTS,
  PREGNANCY_AFFECTED_CONDITIONS,
  EXPECTED_DURATIONS,
  SYMPTOM_CONDITION_RELEVANCE,
  RESPIRATORY_CONDITIONS,
  CARDIOVASCULAR_CONDITIONS,
  INFECTION_CONDITIONS,
  CHRONIC_CONDITIONS,
  HIGH_DRUG_INTERACTION_RISKS,
  DEFAULT_BASE_RATE,
  DEFAULT_SYMPTOM_SPECIFICITY,
  CONFIDENCE_CALCULATION,
  CONFIDENCE_LEVEL_THRESHOLDS,
  DURATION_THRESHOLDS,
  RECOMMENDATION_THRESHOLDS,
  MARGIN_OF_ERROR_CONFIG,
  BMI_THRESHOLDS,
  AGE_THRESHOLDS,
  SMOKING_ADJUSTMENTS,
  BMI_ADJUSTMENTS,
  COMORBIDITY_ADJUSTMENTS,
  CONFIDENCE_COLOR_THEMES,
  CONFIDENCE_DESCRIPTIONS,
  CONFIDENCE_RECOMMENDATIONS,
  INFERRED_CONFIDENCE_SCORES,
  PREGNANCY_MODIFIER,
} from './data';

// Re-export confidenceCalculator as default
import { confidenceCalculator as _confidenceCalculator } from './confidence-calculator';
export default _confidenceCalculator;
