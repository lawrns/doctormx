/**
 * Confidence Thresholds Configuration
 *
 * Thresholds and thresholds for confidence scoring, recommendations,
 * and display configurations.
 */

import type { DurationThreshold, ConfidenceColorTheme, ConfidenceLevel } from '../types';

/**
 * Confidence score thresholds for level classification
 */
export const CONFIDENCE_LEVEL_THRESHOLDS = {
  VERY_LOW: 20,
  LOW: 40,
  MODERATE: 65,
  HIGH: 85,
};

/**
 * Duration thresholds for symptom reliability
 */
export const DURATION_THRESHOLDS: Record<string, DurationThreshold> = {
  acute: { max: 7, reliability: 0.9 },
  subacute: { max: 30, reliability: 0.85 },
  chronic: { max: 365, reliability: 0.7 },
  persistent: { max: Infinity, reliability: 0.6 },
};

/**
 * Doctor recommendation thresholds
 */
export const RECOMMENDATION_THRESHOLDS = {
  LOW_CONFIDENCE: 40,
  MODERATE_CONFIDENCE: 60,
  HIGH_CONFIDENCE: 75,
  RISK_FACTOR_LIMIT: 3,
};

/**
 * Confidence interval margin configuration
 */
export const MARGIN_OF_ERROR_CONFIG = {
  DEFAULT: 15,
  MINIMUM: 5,
  MAXIMUM: 25,
  HIGH_CONFIDENCE_REDUCTION: 0.7,
  MODERATE_CONFIDENCE_REDUCTION: 0.85,
  HIGH_CONFIDENCE_THRESHOLD: 90,
  LOW_CONFIDENCE_THRESHOLD: 10,
  MODERATE_CONFIDENCE_UPPER: 70,
  MODERATE_CONFIDENCE_LOWER: 30,
  Z_SCORE: 1.96,
};

/**
 * BMI thresholds
 */
export const BMI_THRESHOLDS = {
  UNDERWEIGHT: 18.5,
  OVERWEIGHT: 25,
  OBESE: 30,
};

/**
 * Age group thresholds
 */
export const AGE_THRESHOLDS = {
  CHILD: 18,
  ADULT: 65,
  ELDERLY: 80,
};

/**
 * Smoking adjustment values
 */
export const SMOKING_ADJUSTMENTS = {
  CURRENT: -8,
  CURRENT_RESPIRATORY: -7,
  CURRENT_CARDIOVASCULAR: -5,
  CURRENT_HIGH_PACK_YEARS: -5,
  FORMER: -4,
  FORMER_HIGH_PACK_YEARS: -3,
};

/**
 * BMI adjustment values
 */
export const BMI_ADJUSTMENTS = {
  OBESE: -5,
  OBESE_CARDIOVASCULAR: -3,
  OBESE_RESPIRATORY: -3,
  UNDERWEIGHT: -4,
  UNDERWEIGHT_INFECTION: -3,
};

/**
 * Comorbidity adjustment values
 */
export const COMORBIDITY_ADJUSTMENTS = {
  UNCONTROLLED_MULTIPLIER: 5,
  CONTROLLED_MULTIPLIER: 2,
  COMPLEXITY_FACTOR: 3,
  COMPLEXITY_THRESHOLD: 2,
  DRUG_INTERACTION_PENALTY: 3,
};

/**
 * Color themes for each confidence level
 */
export const CONFIDENCE_COLOR_THEMES: Record<ConfidenceLevel, ConfidenceColorTheme> = {
  'very-low': {
    bg: 'bg-red-500',
    bgLight: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
    progress: 'bg-red-500',
  },
  'low': {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-500',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    progress: 'bg-orange-500',
  },
  'moderate': {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    progress: 'bg-yellow-500',
  },
  'high': {
    bg: 'bg-green-500',
    bgLight: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200',
    progress: 'bg-green-500',
  },
  'very-high': {
    bg: 'bg-emerald-600',
    bgLight: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    progress: 'bg-emerald-600',
  },
};

/**
 * Human-readable descriptions for confidence levels
 */
export const CONFIDENCE_DESCRIPTIONS: Record<ConfidenceLevel, string> = {
  'very-low': 'The AI has very low confidence in this diagnosis. Strongly recommend human medical review.',
  'low': 'The AI has low confidence. Consider additional symptoms or tests. Human review recommended.',
  'moderate': 'The AI has moderate confidence. The diagnosis is plausible but not certain.',
  'high': 'The AI has high confidence in this diagnosis based on available information.',
  'very-high': 'The AI has very high confidence. The diagnosis is strongly supported by the evidence.',
};

/**
 * Recommendations based on confidence score
 */
export const CONFIDENCE_RECOMMENDATIONS: Array<{ threshold: number; message: string }> = [
  { threshold: 0, message: 'Urgent: Consult a doctor immediately. AI confidence is insufficient for any assessment.' },
  { threshold: 20, message: 'Strongly recommended: Schedule a doctor appointment for proper evaluation.' },
  { threshold: 40, message: 'Recommended: Consider consulting a doctor, especially if symptoms worsen.' },
  { threshold: 65, message: 'Optional: Monitor symptoms. Doctor consultation recommended if concerned.' },
  { threshold: 85, message: 'AI analysis is reliable. Follow recommended care. Consult doctor if symptoms change.' },
];

/**
 * Confidence score ranges for inferred confidence from language patterns
 */
export const INFERRED_CONFIDENCE_SCORES = {
  HIGH: 75,
  MODERATE: 55,
  LOW: 35,
};

/**
 * Regex patterns for parsing confidence from AI responses
 */
export const CONFIDENCE_PARSING_PATTERNS = {
  CONDITION_CONFIDENCE: /([^\n-:]+)[-:]\s*(\d+(?:\.\d+)?)\s*%/gi,
  CONFIDENT_IN_CONDITION: /(\d+(?:\.\d+)?)\s*%\s*(?:confident|confidence|probability)\s*(?:in|of|for)?\s*:?\s*([^\n]+)/gi,
  CONFIDENCE_FOR: /confidence\s*:?\s*(\d+(?:\.\d+)?)\s*%(?:for|in)?\s*:?\s*([^\n]+)/gi,
};

/**
 * High confidence language patterns
 */
export const HIGH_CONFIDENCE_PATTERNS: RegExp[] = [
  /(?:most\s+likely|highly\s+likely|strongly\s+suggest|consistent\s+with)\s*:?\s*([^\n.]+)/gi,
];

/**
 * Moderate confidence language patterns
 */
export const MODERATE_CONFIDENCE_PATTERNS: RegExp[] = [
  /(?:possible|may\s+be|could\s+be|suggestive\s+of)\s*:?\s*([^\n.]+)/gi,
];

/**
 * Low confidence language patterns
 */
export const LOW_CONFIDENCE_PATTERNS: RegExp[] = [
  /(?:less\s+likely|unlikely|cannot\s+rule\s+out|differential\s+includes?)\s*:?\s*([^\n.]+)/gi,
];

/**
 * Pregnancy modifier value
 */
export const PREGNANCY_MODIFIER = -5;
