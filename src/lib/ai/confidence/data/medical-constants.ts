/**
 * Medical Constants for Confidence Scoring
 *
 * Evidence-based medical data for diagnostic confidence calculations.
 * All rates and modifiers are based on epidemiological data.
 */

/**
 * Base rates for common conditions (prevalence per 100,000 or as decimal)
 */
export const BASE_RATES: Record<string, number> = {
  // Infectious diseases
  'influenza': 0.08,
  'common-cold': 0.22,
  'covid-19': 0.03,
  'pneumonia': 0.005,
  'strep-throat': 0.012,
  'bronchitis': 0.035,
  'sinusitis': 0.015,
  'gastroenteritis': 0.018,
  'uti': 0.025,
  
  // Chronic conditions
  'hypertension': 0.45,
  'diabetes-type-2': 0.11,
  'diabetes-type-1': 0.006,
  'asthma': 0.08,
  'copd': 0.06,
  'heart-disease': 0.065,
  
  // Mental health
  'anxiety': 0.18,
  'depression': 0.08,
  'insomnia': 0.10,
  
  // Other common
  'migraine': 0.15,
  'allergic-rhinitis': 0.20,
  'gastroesophageal-reflux': 0.20,
  'back-pain': 0.25,
  'arthritis': 0.23,
};

/**
 * Age-based prevalence modifiers (multipliers for base rates)
 */
export const AGE_PREVALENCE: Record<string, Record<string, number>> = {
  'influenza': { 'child': 1.5, 'adult': 1.0, 'elderly': 1.3, 'very-elderly': 1.8 },
  'pneumonia': { 'child': 0.8, 'adult': 0.6, 'elderly': 2.5, 'very-elderly': 4.0 },
  'hypertension': { 'child': 0.1, 'adult': 1.2, 'elderly': 2.5, 'very-elderly': 3.5 },
  'diabetes-type-2': { 'child': 0.3, 'adult': 1.5, 'elderly': 2.8, 'very-elderly': 3.2 },
  'heart-disease': { 'child': 0.1, 'adult': 1.0, 'elderly': 3.0, 'very-elderly': 4.5 },
  'copd': { 'child': 0.05, 'adult': 0.8, 'elderly': 2.2, 'very-elderly': 3.0 },
  'arthritis': { 'child': 0.2, 'adult': 0.8, 'elderly': 2.5, 'very-elderly': 3.0 },
  'common-cold': { 'child': 2.0, 'adult': 0.9, 'elderly': 0.8, 'very-elderly': 0.7 },
  'migraine': { 'child': 0.4, 'adult': 1.3, 'elderly': 0.7, 'very-elderly': 0.4 },
  'uti': { 'child': 0.3, 'adult': 1.0, 'elderly': 1.8, 'very-elderly': 2.2 },
};

/**
 * Gender-specific condition likelihoods (multipliers)
 */
export const GENDER_LIKELIHOOD: Record<string, { male: number; female: number }> = {
  'heart-disease': { male: 1.4, female: 0.7 },
  'uti': { male: 0.3, female: 3.0 },
  'migraine': { male: 0.6, female: 1.4 },
  'autoimmune': { male: 0.4, female: 2.5 },
  'gout': { male: 2.0, female: 0.3 },
  'depression': { male: 0.7, female: 1.3 },
  'anxiety': { male: 0.6, female: 1.4 },
  'copd': { male: 1.3, female: 0.8 },
  'lung-cancer': { male: 1.2, female: 0.9 },
};

/**
 * Symptom specificity weights (higher = more specific to certain conditions)
 */
export const SYMPTOM_SPECIFICITY: Record<string, number> = {
  'chest-pain': 8,
  'hemoptysis': 9,
  'syncope': 8,
  'seizure': 9,
  'paralysis': 10,
  'severe-headache': 7,
  'stiff-neck': 8,
  'rash': 4,
  'fever': 3,
  'cough': 3,
  'fatigue': 2,
  'nausea': 3,
  'vomiting': 4,
  'diarrhea': 3,
  'shortness-of-breath': 7,
  'wheezing': 7,
  'sore-throat': 4,
  'runny-nose': 2,
  'body-aches': 3,
  'loss-of-taste': 8,
  'loss-of-smell': 8,
};

/**
 * Comorbidity impact on confidence (modifiers for related conditions)
 */
export const COMORBIDITY_IMPACT: Record<string, Record<string, number>> = {
  'diabetes': {
    'infection-risk': 1.3,
    'wound-healing': 0.7,
    'cardiovascular': 1.4,
  },
  'hypertension': {
    'cardiovascular': 1.3,
    'kidney-disease': 1.2,
    'stroke-risk': 1.2,
  },
  'asthma': {
    'respiratory-infection': 1.4,
    'pneumonia': 1.3,
    'copd': 1.2,
  },
  'copd': {
    'respiratory-infection': 1.5,
    'pneumonia': 1.6,
    'heart-failure': 1.3,
  },
  'immunocompromised': {
    'infection-risk': 2.0,
    'atypical-presentation': 1.5,
  },
};

/**
 * Risk factor weights for confidence adjustments
 */
export const RISK_FACTOR_WEIGHTS: Record<string, number> = {
  'smoking-current': -0.15,
  'smoking-former': -0.08,
  'obesity': -0.12,
  'underweight': -0.10,
  'sedentary': -0.08,
  'family-history-cardiac': -0.05,
  'family-history-cancer': -0.05,
  'alcohol-heavy': -0.15,
  'occupation-high-risk': -0.10,
  'recent-travel': -0.08,
  'immunocompromised': -0.20,
};

/**
 * Conditions that present differently in pregnancy
 */
export const PREGNANCY_AFFECTED_CONDITIONS: string[] = [
  'uti', 'diabetes', 'hypertension', 'anemia', 'depression',
  'gastroesophageal-reflux', 'migraine'
];

/**
 * Expected duration for acute conditions (in days)
 */
export const EXPECTED_DURATIONS: Record<string, number> = {
  'common-cold': 7,
  'influenza': 5,
  'acute-bronchitis': 14,
  'strep-throat': 3,
  'sinusitis': 10,
  'gastroenteritis': 3,
};

/**
 * Symptom to condition relevance mapping
 */
export const SYMPTOM_CONDITION_RELEVANCE: Record<string, string[]> = {
  'influenza': ['fever', 'cough', 'body-aches', 'fatigue', 'headache', 'chills'],
  'common-cold': ['runny-nose', 'sneezing', 'sore-throat', 'cough', 'congestion'],
  'pneumonia': ['fever', 'cough', 'shortness-of-breath', 'chest-pain', 'fatigue'],
  'covid-19': ['fever', 'cough', 'loss-of-taste', 'loss-of-smell', 'fatigue', 'shortness-of-breath'],
  'strep-throat': ['sore-throat', 'fever', 'swollen-lymph-nodes', 'white-patches'],
  'uti': ['dysuria', 'frequency', 'urgency', 'hematuria', 'lower-abdominal-pain'],
};

/**
 * Respiratory condition keywords
 */
export const RESPIRATORY_CONDITIONS: string[] = [
  'asthma', 'copd', 'pneumonia', 'bronchitis', 'influenza', 'cold'
];

/**
 * Cardiovascular condition keywords
 */
export const CARDIOVASCULAR_CONDITIONS: string[] = [
  'heart', 'cardiac', 'hypertension', 'stroke', 'angina'
];

/**
 * Infection condition keywords
 */
export const INFECTION_CONDITIONS: string[] = [
  'influenza', 'pneumonia', 'uti', 'strep', 'cold', 'gastroenteritis'
];

/**
 * Chronic condition keywords
 */
export const CHRONIC_CONDITIONS: string[] = [
  'diabetes', 'hypertension', 'asthma', 'copd', 'arthritis', 'heart-disease'
];

/**
 * High drug interaction risk conditions
 */
export const HIGH_DRUG_INTERACTION_RISKS: string[] = [
  'diabetes', 'hypertension', 'heart-disease', 'depression', 'anxiety'
];

/**
 * Default base rate for unknown conditions
 */
export const DEFAULT_BASE_RATE = 0.05;

/**
 * Default symptom specificity
 */
export const DEFAULT_SYMPTOM_SPECIFICITY = 3;

/**
 * Confidence calculation constants
 */
export const CONFIDENCE_CALCULATION = {
  SPECIFICITY_MULTIPLIER: 2,
  SYMPTOM_COUNT_MULTIPLIER: 2,
  SYMPTOM_COUNT_CAP: 10,
  BASE_RATE_NORMALIZATION: 0.1,
  BASE_RATE_MULTIPLIER: 10,
  AGE_MODIFIER_MULTIPLIER: 10,
  GENDER_MODIFIER_MULTIPLIER: 8,
  RELIABILITY_MULTIPLIER: 20,
  DEFAULT_RELIABILITY: 0.85,
};
