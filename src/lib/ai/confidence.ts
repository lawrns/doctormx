/**
 * AI Confidence Scoring System for Medical Diagnoses
 * 
 * This module provides a comprehensive confidence scoring system for telemedicine
 * diagnoses, incorporating demographic factors, comorbidities, symptom duration,
 * and evidence-based medical knowledge.
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

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

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

// ============================================================================
// MEDICAL KNOWLEDGE BASE
// ============================================================================

/**
 * Base rates for common conditions (prevalence per 100,000 or as decimal)
 */
const BASE_RATES: Record<string, number> = {
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
const AGE_PREVALENCE: Record<string, Record<string, number>> = {
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
const GENDER_LIKELIHOOD: Record<string, { male: number; female: number }> = {
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
const SYMPTOM_SPECIFICITY: Record<string, number> = {
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
const COMORBIDITY_IMPACT: Record<string, Record<string, number>> = {
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
const RISK_FACTOR_WEIGHTS: Record<string, number> = {
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
 * Duration thresholds for symptom reliability
 */
const DURATION_THRESHOLDS = {
  acute: { max: 7, reliability: 0.9 },
  subacute: { max: 30, reliability: 0.85 },
  chronic: { max: 365, reliability: 0.7 },
  persistent: { max: Infinity, reliability: 0.6 },
};

// ============================================================================
// CONFIDENCE CALCULATOR CLASS
// ============================================================================

/**
 * Calculator for medical diagnosis confidence scores
 * 
 * Implements evidence-based adjustments for demographics, comorbidities,
 * and symptom characteristics to provide reliable confidence estimates.
 */
export class ConfidenceCalculator {
  private version: string = '1.0.0';

  /**
   * Calculate base confidence from symptom-diagnosis matching
   * 
   * @param diagnoses - Array of potential diagnoses with initial confidence
   * @param symptoms - Array of reported symptoms
   * @returns Adjusted diagnoses with updated confidence scores
   * 
   * @example
   * ```typescript
   * const diagnoses = [
   *   { condition: 'Influenza', confidence: 70 },
   *   { condition: 'Common Cold', confidence: 60 }
   * ];
   * const symptoms = ['fever', 'cough', 'body-aches'];
   * const result = calculator.calculateBaseConfidence(diagnoses, symptoms);
   * ```
   */
  calculateBaseConfidence(
    diagnoses: DiagnosisConfidence[],
    symptoms: string[]
  ): DiagnosisConfidence[] {
    return diagnoses.map(diagnosis => {
      let adjustedConfidence = diagnosis.confidence;
      const contributingSymptoms: string[] = [];
      
      // Calculate average specificity of matching symptoms
      const specificities = symptoms
        .map(s => SYMPTOM_SPECIFICITY[s.toLowerCase().replace(/\s+/g, '-')] || 3)
        .filter(s => s > 0);
      
      if (specificities.length > 0) {
        const avgSpecificity = specificities.reduce((a, b) => a + b, 0) / specificities.length;
        
        // More specific symptoms increase confidence
        const specificityBoost = (avgSpecificity - 3) * 2;
        adjustedConfidence += specificityBoost;
        
        // Track contributing symptoms
        symptoms.forEach(symptom => {
          if (this.isSymptomRelevant(symptom, diagnosis.condition)) {
            contributingSymptoms.push(symptom);
          }
        });
      }
      
      // Adjust based on number of symptoms (more symptoms generally = higher confidence up to a point)
      const symptomCountFactor = Math.min(symptoms.length * 2, 10);
      adjustedConfidence += symptomCountFactor;
      
      // Apply base rate prevalence adjustment
      const baseRate = this.getBaseRate(diagnosis.condition);
      const prevalenceAdjustment = (baseRate - 0.1) * 10; // Normalize around 10% prevalence
      adjustedConfidence += prevalenceAdjustment;
      
      return {
        ...diagnosis,
        confidence: this.clampConfidence(adjustedConfidence),
        contributingSymptoms: contributingSymptoms.length > 0 
          ? contributingSymptoms 
          : diagnosis.contributingSymptoms,
      };
    });
  }

  /**
   * Adjust confidence based on patient demographics
   * 
   * @param confidence - Current confidence score
   * @param demographics - Patient demographic information
   * @param condition - Medical condition being evaluated
   * @returns Adjusted confidence score
   */
  adjustForDemographics(
    confidence: number,
    demographics: DemographicFactors,
    condition?: string
  ): number {
    let adjustment = 0;
    const boosters: string[] = [];
    const reducers: string[] = [];

    // Age-based adjustments
    const ageGroup = this.getAgeGroup(demographics.age);
    const ageModifier = this.getAgeModifier(condition || '', ageGroup);
    adjustment += (ageModifier - 1) * 10;
    
    if (ageModifier > 1.2) {
      boosters.push(`Age group ${ageGroup} increases prevalence`);
    } else if (ageModifier < 0.8) {
      reducers.push(`Age group ${ageGroup} decreases prevalence`);
    }

    // Gender-based adjustments
    if (condition) {
      const genderModifier = this.getGenderModifier(condition, demographics.gender);
      adjustment += (genderModifier - 1) * 8;
      
      if (genderModifier > 1.2) {
        boosters.push(`${demographics.gender} gender increases likelihood`);
      }
    }

    // BMI adjustments
    if (demographics.bmi) {
      const bmiAdjustment = this.getBMIAdjustment(demographics.bmi, condition);
      adjustment += bmiAdjustment;
      
      if (bmiAdjustment > 0) {
        boosters.push(`BMI ${demographics.bmi} relevant to condition`);
      } else if (bmiAdjustment < 0) {
        reducers.push(`BMI ${demographics.bmi} reduces diagnostic clarity`);
      }
    }

    // Smoking adjustments
    if (demographics.smokingStatus) {
      const smokingAdjustment = this.getSmokingAdjustment(
        demographics.smokingStatus,
        demographics.packYears || 0,
        condition
      );
      adjustment += smokingAdjustment;
      
      if (smokingAdjustment < 0) {
        reducers.push(`Smoking history complicates presentation`);
      }
    }

    // Pregnancy adjustments
    if (demographics.isPregnant && condition) {
      const pregnancyModifier = this.getPregnancyModifier(condition);
      adjustment += pregnancyModifier;
      if (pregnancyModifier !== 0) {
        reducers.push('Pregnancy may alter symptom presentation');
      }
    }

    return this.clampConfidence(confidence + adjustment);
  }

  /**
   * Adjust confidence based on comorbidities
   * 
   * @param confidence - Current confidence score
   * @param conditions - Patient's comorbid conditions
   * @param targetCondition - The condition being diagnosed
   * @returns Adjusted confidence score
   */
  adjustForComorbidities(
    confidence: number,
    conditions: Comorbidity[],
    targetCondition?: string
  ): number {
    let adjustment = 0;

    conditions.forEach(comorbidity => {
      const impact = COMORBIDITY_IMPACT[comorbidity.condition.toLowerCase()];
      
      if (impact) {
        // Determine which impact category applies
        let category = 'general';
        if (targetCondition) {
          if (this.isRespiratory(targetCondition)) category = 'respiratory-infection';
          else if (this.isCardiovascular(targetCondition)) category = 'cardiovascular';
          else if (this.isInfection(targetCondition)) category = 'infection-risk';
        }

        const modifier = impact[category] || 1.0;
        const severityMultiplier = comorbidity.isControlled ? 0.5 : 1.0;
        
        // Uncontrolled comorbidities decrease confidence due to complex presentation
        if (!comorbidity.isControlled) {
          adjustment -= 5 * modifier * severityMultiplier;
        } else {
          // Controlled comorbidities may slightly increase confidence for related conditions
          adjustment += 2 * (modifier - 1);
        }
      }

      // Drug interactions can reduce confidence
      if (this.hasDrugInteractionRisk(comorbidity.condition)) {
        adjustment -= 3;
      }
    });

    // Multiple comorbidities exponentially increase complexity
    if (conditions.length > 2) {
      adjustment -= (conditions.length - 2) * 3;
    }

    return this.clampConfidence(confidence + adjustment);
  }

  /**
   * Adjust confidence based on symptom duration
   * 
   * @param confidence - Current confidence score
   * @param duration - Duration of symptoms in days
   * @param condition - The condition being evaluated
   * @returns Adjusted confidence score
   */
  adjustForSymptomDuration(
    confidence: number,
    duration: number,
    condition?: string
  ): number {
    let reliability = 0.85; // default

    if (duration <= DURATION_THRESHOLDS.acute.max) {
      reliability = DURATION_THRESHOLDS.acute.reliability;
    } else if (duration <= DURATION_THRESHOLDS.subacute.max) {
      reliability = DURATION_THRESHOLDS.subacute.reliability;
    } else if (duration <= DURATION_THRESHOLDS.chronic.max) {
      reliability = DURATION_THRESHOLDS.chronic.reliability;
    } else {
      reliability = DURATION_THRESHOLDS.persistent.reliability;
    }

    // Expected duration for condition
    const expectedDuration = this.getExpectedDuration(condition);
    if (expectedDuration && duration > expectedDuration * 2) {
      // Symptoms lasting longer than expected reduce confidence
      reliability -= 0.15;
    }

    // Acute presentation of chronic condition is concerning
    if (this.isChronicCondition(condition) && duration < 7) {
      reliability -= 0.1;
    }

    // Apply reliability as modifier to confidence
    const adjustment = (reliability - 0.85) * 20;
    return this.clampConfidence(confidence + adjustment);
  }

  /**
   * Calculate confidence intervals for a confidence score
   * 
   * @param confidence - Point confidence estimate (0-100)
   * @param sampleSize - Optional sample size for calculating margin of error
   * @returns Confidence interval with low, mid, and high estimates
   */
  calculateConfidenceIntervals(
    confidence: number,
    sampleSize?: number
  ): ConfidenceInterval {
    // Calculate margin of error based on confidence level and sample size
    let marginOfError = 15; // Default 15% margin
    
    if (sampleSize && sampleSize > 0) {
      // Use standard error formula: 1.96 * sqrt(p*(1-p)/n)
      const p = confidence / 100;
      const standardError = Math.sqrt((p * (1 - p)) / sampleSize);
      marginOfError = 1.96 * standardError * 100; // Convert to percentage
    }

    // Adjust margin based on confidence level
    // Very high or very low confidence = narrower interval
    if (confidence > 90 || confidence < 10) {
      marginOfError *= 0.7;
    } else if (confidence > 70 || confidence < 30) {
      marginOfError *= 0.85;
    }

    marginOfError = Math.max(marginOfError, 5); // Minimum 5% margin
    marginOfError = Math.min(marginOfError, 25); // Maximum 25% margin

    return {
      low: Math.max(0, confidence - marginOfError),
      mid: confidence,
      high: Math.min(100, confidence + marginOfError),
      marginOfError,
    };
  }

  /**
   * Rank diagnoses by confidence score (highest first)
   * 
   * @param diagnoses - Array of diagnoses with confidence scores
   * @returns Sorted array with rank information
   */
  rankDiagnoses(diagnoses: DiagnosisConfidence[]): Array<DiagnosisConfidence & { rank: number; confidenceGap: number }> {
    const sorted = [...diagnoses].sort((a, b) => b.confidence - a.confidence);
    
    return sorted.map((diagnosis, index) => ({
      ...diagnosis,
      rank: index + 1,
      confidenceGap: index === 0 ? 0 : sorted[0].confidence - diagnosis.confidence,
    }));
  }

  /**
   * Perform complete confidence analysis
   * 
   * @param diagnoses - Initial diagnoses from AI
   * @param patientContext - Patient context information
   * @returns Complete confidence analysis result
   */
  analyzeConfidence(
    diagnoses: DiagnosisConfidence[],
    patientContext: PatientContext
  ): ConfidenceResult {
    const timestamp = new Date().toISOString();
    const riskFactors: string[] = [];
    const boosters: string[] = [];
    const reducers: string[] = [];

    // Calculate base confidence
    let adjustedDiagnoses = this.calculateBaseConfidence(
      diagnoses,
      patientContext.symptoms.map(s => s.symptom)
    );

    // Apply demographic adjustments
    adjustedDiagnoses = adjustedDiagnoses.map(d => {
      const adjustedConfidence = this.adjustForDemographics(
        d.confidence,
        patientContext.demographics,
        d.condition
      );
      return { ...d, confidence: adjustedConfidence };
    });

    // Apply comorbidity adjustments
    if (patientContext.comorbidities) {
      const comorbidities: Comorbidity[] = patientContext.comorbidities.map(c => ({
        condition: c,
        severity: 'moderate',
        isControlled: true,
      }));
      
      adjustedDiagnoses = adjustedDiagnoses.map(d => {
        const adjustedConfidence = this.adjustForComorbidities(
          d.confidence,
          comorbidities,
          d.condition
        );
        return { ...d, confidence: adjustedConfidence };
      });
    }

    // Apply symptom duration adjustments
    const avgDuration = patientContext.symptoms.reduce((sum, s) => sum + s.duration, 0) 
      / patientContext.symptoms.length;
    
    adjustedDiagnoses = adjustedDiagnoses.map(d => {
      const adjustedConfidence = this.adjustForSymptomDuration(
        d.confidence,
        avgDuration,
        d.condition
      );
      return { ...d, confidence: adjustedConfidence };
    });

    // Rank diagnoses
    const ranked = this.rankDiagnoses(adjustedDiagnoses);
    
    // Identify risk factors
    if (patientContext.demographics.age > 65) {
      riskFactors.push('Advanced age');
    }
    if (patientContext.demographics.smokingStatus === 'current') {
      riskFactors.push('Active smoking');
    }
    if (patientContext.demographics.bmi && patientContext.demographics.bmi > 30) {
      riskFactors.push('Obesity');
    }

    // Build result
    const primary = ranked[0];
    const interval = this.calculateConfidenceIntervals(primary.confidence);
    const confidenceLevel = getConfidenceLevel(primary.confidence);

    return {
      primaryDiagnosis: primary,
      differentialDiagnoses: ranked.slice(1),
      confidenceInterval: interval,
      confidenceLevel,
      recommendDoctor: shouldRecommendDoctor(primary.confidence, riskFactors.length),
      riskFactors,
      confidenceBoosters: boosters,
      confidenceReducers: reducers,
      timestamp,
      version: this.version,
    };
  }

  // Helper methods
  private getAgeGroup(age: number): string {
    if (age < 18) return 'child';
    if (age < 65) return 'adult';
    if (age < 80) return 'elderly';
    return 'very-elderly';
  }

  private getAgeModifier(condition: string, ageGroup: string): number {
    const modifiers = AGE_PREVALENCE[condition.toLowerCase().replace(/\s+/g, '-')];
    return modifiers?.[ageGroup] || 1.0;
  }

  private getGenderModifier(condition: string, gender: string): number {
    const modifiers = GENDER_LIKELIHOOD[condition.toLowerCase().replace(/\s+/g, '-')];
    if (!modifiers) return 1.0;
    return gender === 'male' ? modifiers.male : modifiers.female;
  }

  private getBMIAdjustment(bmi: number, condition?: string): number {
    let adjustment = 0;
    
    if (bmi > 30) {
      adjustment = -5;
      if (this.isCardiovascular(condition)) adjustment -= 3;
      if (this.isRespiratory(condition)) adjustment -= 3;
    } else if (bmi < 18.5) {
      adjustment = -4;
      if (this.isInfection(condition)) adjustment -= 3;
    }
    
    return adjustment;
  }

  private getSmokingAdjustment(
    status: string,
    packYears: number,
    condition?: string
  ): number {
    let adjustment = 0;
    
    if (status === 'current') {
      adjustment = -8;
      if (this.isRespiratory(condition)) adjustment -= 7;
      if (this.isCardiovascular(condition)) adjustment -= 5;
      if (packYears > 20) adjustment -= 5;
    } else if (status === 'former') {
      adjustment = -4;
      if (packYears > 20) adjustment -= 3;
    }
    
    return adjustment;
  }

  private getPregnancyModifier(condition?: string): number {
    if (!condition) return 0;
    
    // Conditions that present differently in pregnancy
    const pregnancyAffected = [
      'uti', 'diabetes', 'hypertension', 'anemia', 'depression',
      'gastroesophageal-reflux', 'migraine'
    ];
    
    if (pregnancyAffected.includes(condition.toLowerCase())) {
      return -5;
    }
    
    return 0;
  }

  private getBaseRate(condition: string): number {
    const normalized = condition.toLowerCase().replace(/\s+/g, '-');
    return BASE_RATES[normalized] || 0.05; // Default 5% if unknown
  }

  private getExpectedDuration(condition?: string): number | undefined {
    if (!condition) return undefined;
    
    const durations: Record<string, number> = {
      'common-cold': 7,
      'influenza': 5,
      'acute-bronchitis': 14,
      'strep-throat': 3,
      'sinusitis': 10,
      'gastroenteritis': 3,
    };
    
    return durations[condition.toLowerCase().replace(/\s+/g, '-')];
  }

  private isSymptomRelevant(symptom: string, condition: string): boolean {
    // Simplified relevance check - in production, use a proper symptom-condition mapping
    const relevantSymptoms: Record<string, string[]> = {
      'influenza': ['fever', 'cough', 'body-aches', 'fatigue', 'headache', 'chills'],
      'common-cold': ['runny-nose', 'sneezing', 'sore-throat', 'cough', 'congestion'],
      'pneumonia': ['fever', 'cough', 'shortness-of-breath', 'chest-pain', 'fatigue'],
      'covid-19': ['fever', 'cough', 'loss-of-taste', 'loss-of-smell', 'fatigue', 'shortness-of-breath'],
      'strep-throat': ['sore-throat', 'fever', 'swollen-lymph-nodes', 'white-patches'],
      'uti': ['dysuria', 'frequency', 'urgency', 'hematuria', 'lower-abdominal-pain'],
    };
    
    const normalizedCondition = condition.toLowerCase().replace(/\s+/g, '-');
    const symptoms = relevantSymptoms[normalizedCondition] || [];
    return symptoms.includes(symptom.toLowerCase().replace(/\s+/g, '-'));
  }

  private isRespiratory(condition?: string): boolean {
    if (!condition) return false;
    const respiratory = ['asthma', 'copd', 'pneumonia', 'bronchitis', 'influenza', 'cold'];
    return respiratory.some(r => condition.toLowerCase().includes(r));
  }

  private isCardiovascular(condition?: string): boolean {
    if (!condition) return false;
    const cardio = ['heart', 'cardiac', 'hypertension', 'stroke', 'angina'];
    return cardio.some(c => condition.toLowerCase().includes(c));
  }

  private isInfection(condition?: string): boolean {
    if (!condition) return false;
    const infections = ['influenza', 'pneumonia', 'uti', 'strep', 'cold', 'gastroenteritis'];
    return infections.some(i => condition.toLowerCase().includes(i));
  }

  private isChronicCondition(condition?: string): boolean {
    if (!condition) return false;
    const chronic = ['diabetes', 'hypertension', 'asthma', 'copd', 'arthritis', 'heart-disease'];
    return chronic.some(c => condition.toLowerCase().includes(c));
  }

  private hasDrugInteractionRisk(condition: string): boolean {
    const highRisk = ['diabetes', 'hypertension', 'heart-disease', 'depression', 'anxiety'];
    return highRisk.some(c => condition.toLowerCase().includes(c));
  }

  private clampConfidence(confidence: number): number {
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Get the current version of the confidence calculator
   */
  getVersion(): string {
    return this.version;
  }
}

// ============================================================================
// CONFIDENCE DISPLAY UTILITIES
// ============================================================================

/**
 * Get confidence level category from score
 * 
 * @param score - Confidence score (0-100)
 * @returns Confidence level category
 * 
 * @example
 * ```typescript
 * getConfidenceLevel(75); // 'high'
 * getConfidenceLevel(45); // 'moderate'
 * ```
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score < 20) return 'very-low';
  if (score < 40) return 'low';
  if (score < 65) return 'moderate';
  if (score < 85) return 'high';
  return 'very-high';
}

/**
 * Get Tailwind color classes for confidence display
 * 
 * @param score - Confidence score (0-100)
 * @returns Object with color classes for various UI elements
 * 
 * @example
 * ```typescript
 * const colors = getConfidenceColor(75);
 * // Returns: { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-500', ... }
 * ```
 */
export function getConfidenceColor(score: number): {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  badge: string;
  progress: string;
} {
  const level = getConfidenceLevel(score);
  
  const colors: Record<ConfidenceLevel, ReturnType<typeof getConfidenceColor>> = {
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
  
  return colors[level];
}

/**
 * Format confidence interval as human-readable string
 * 
 * @param interval - Confidence interval object
 * @returns Formatted string like "65% - 80% (expected: 72%)"
 * 
 * @example
 * ```typescript
 * const interval = { low: 65, mid: 72, high: 80, marginOfError: 8 };
 * formatConfidenceRange(interval); // "65% - 80% (expected: 72%)"
 * ```
 */
export function formatConfidenceRange(interval: ConfidenceInterval): string {
  return `${Math.round(interval.low)}% - ${Math.round(interval.high)}% (expected: ${Math.round(interval.mid)}%)`;
}

/**
 * Format confidence interval as a simple range
 * 
 * @param interval - Confidence interval object
 * @returns Simple formatted string like "65% - 80%"
 */
export function formatConfidenceRangeSimple(interval: ConfidenceInterval): string {
  return `${Math.round(interval.low)}% - ${Math.round(interval.high)}%`;
}

/**
 * Determine if a human doctor should be recommended based on confidence and risk factors
 * 
 * @param score - Confidence score (0-100)
 * @param riskFactorCount - Number of identified risk factors
 * @param severity - Optional severity indicator
 * @returns Whether doctor consultation is recommended
 * 
 * @example
 * ```typescript
 * shouldRecommendDoctor(45, 2); // true (low confidence + risk factors)
 * shouldRecommendDoctor(85, 0); // false (high confidence, no risk factors)
 * ```
 */
export function shouldRecommendDoctor(
  score: number,
  riskFactorCount: number = 0,
  severity: 'low' | 'moderate' | 'high' | 'critical' = 'low'
): boolean {
  // Critical severity always requires doctor
  if (severity === 'critical') return true;
  
  // High severity with moderate or lower confidence
  if (severity === 'high' && score < 75) return true;
  
  // Low confidence thresholds
  if (score < 40) return true;
  
  // Moderate confidence with risk factors
  if (score < 60 && riskFactorCount > 0) return true;
  
  // Multiple risk factors reduce confidence threshold
  if (riskFactorCount >= 3) return true;
  
  return false;
}

/**
 * Get human-readable description for confidence level
 * 
 * @param level - Confidence level
 * @returns Human-readable description
 */
export function getConfidenceDescription(level: ConfidenceLevel): string {
  const descriptions: Record<ConfidenceLevel, string> = {
    'very-low': 'The AI has very low confidence in this diagnosis. Strongly recommend human medical review.',
    'low': 'The AI has low confidence. Consider additional symptoms or tests. Human review recommended.',
    'moderate': 'The AI has moderate confidence. The diagnosis is plausible but not certain.',
    'high': 'The AI has high confidence in this diagnosis based on available information.',
    'very-high': 'The AI has very high confidence. The diagnosis is strongly supported by the evidence.',
  };
  
  return descriptions[level];
}

/**
 * Get recommendation action based on confidence
 * 
 * @param score - Confidence score
 * @returns Recommended next action
 */
export function getConfidenceRecommendation(score: number): string {
  if (score < 20) return 'Urgent: Consult a doctor immediately. AI confidence is insufficient for any assessment.';
  if (score < 40) return 'Strongly recommended: Schedule a doctor appointment for proper evaluation.';
  if (score < 65) return 'Recommended: Consider consulting a doctor, especially if symptoms worsen.';
  if (score < 85) return 'Optional: Monitor symptoms. Doctor consultation recommended if concerned.';
  return 'AI analysis is reliable. Follow recommended care. Consult doctor if symptoms change.';
}

// ============================================================================
// AI CLIENT INTEGRATION
// ============================================================================

/**
 * Parse AI text response to extract confidence scores
 * 
 * @param aiResponse - Raw text response from AI
 * @returns Extracted diagnoses with confidence scores
 * 
 * @example
 * ```typescript
 * const response = `
 *   1. Influenza - 75% confidence
 *   2. Common Cold - 60% confidence
 *   3. COVID-19 - 45% confidence
 * `;
 * const diagnoses = parseAIConfidenceScores(response);
 * ```
 */
export function parseAIConfidenceScores(aiResponse: string): DiagnosisConfidence[] {
  const diagnoses: DiagnosisConfidence[] = [];
  
  // Pattern to match confidence indicators
  const patterns = [
    // "Condition - 75% confidence" or "Condition: 75%"
    /([^\n-:]+)[-:]\s*(\d+(?:\.\d+)?)\s*%/gi,
    // "75% confident in Condition"
    /(\d+(?:\.\d+)?)\s*%\s*(?:confident|confidence|probability)\s*(?:in|of|for)?\s*:?\s*([^\n]+)/gi,
    // "Confidence: 75% for Condition"
    /confidence\s*:?\s*(\d+(?:\.\d+)?)\s*%\s*(?:for|in)?\s*:?\s*([^\n]+)/gi,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(aiResponse)) !== null) {
      let condition: string;
      let confidenceStr: string;
      
      // Determine which capture group is which based on pattern
      if (pattern.source.includes('confident')) {
        confidenceStr = match[1];
        condition = match[2];
      } else {
        condition = match[1];
        confidenceStr = match[2];
      }
      
      const confidence = parseFloat(confidenceStr);
      
      if (condition && !isNaN(confidence) && confidence >= 0 && confidence <= 100) {
        // Clean up condition name
        const cleanCondition = condition
          .trim()
          .replace(/^(?:diagnosis|assessment|likely)\s*:?\s*/i, '')
          .replace(/\s+/g, ' ');
        
        // Avoid duplicates
        if (!diagnoses.find(d => d.condition.toLowerCase() === cleanCondition.toLowerCase())) {
          diagnoses.push({
            condition: cleanCondition,
            confidence: Math.round(confidence),
          });
        }
      }
    }
  }
  
  // If no explicit confidence found, try to infer from language
  if (diagnoses.length === 0) {
    const inferred = inferConfidenceFromLanguage(aiResponse);
    diagnoses.push(...inferred);
  }
  
  return diagnoses.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Infer confidence from language patterns when explicit scores aren't provided
 */
function inferConfidenceFromLanguage(text: string): DiagnosisConfidence[] {
  const diagnoses: DiagnosisConfidence[] = [];
  
  // High confidence indicators
  const highConfidencePatterns = [
    /(?:most\s+likely|highly\s+likely|strongly\s+suggest|consistent\s+with)\s*:?\s*([^\n.]+)/gi,
  ];
  
  // Moderate confidence indicators
  const moderateConfidencePatterns = [
    /(?:possible|may\s+be|could\s+be|suggestive\s+of)\s*:?\s*([^\n.]+)/gi,
  ];
  
  // Low confidence indicators
  const lowConfidencePatterns = [
    /(?:less\s+likely|unlikely|cannot\s+rule\s+out|differential\s+includes?)\s*:?\s*([^\n.]+)/gi,
  ];
  
  const extractConditions = (patterns: RegExp[], confidence: number) => {
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const condition = match[1].trim();
        if (condition.length > 3 && condition.length < 100) {
          diagnoses.push({ condition, confidence });
        }
      }
    });
  };
  
  extractConditions(highConfidencePatterns, 75);
  extractConditions(moderateConfidencePatterns, 55);
  extractConditions(lowConfidencePatterns, 35);
  
  return diagnoses;
}

/**
 * Enhance AI response with confidence scoring
 * 
 * @param aiResponse - Raw AI response (text or structured)
 * @param patientContext - Patient context for confidence calculation
 * @returns Enhanced response with confidence analysis
 * 
 * @example
 * ```typescript
 * const aiResponse = {
 *   text: "Based on symptoms, likely influenza...",
 *   diagnoses: [{ condition: "Influenza", confidence: 70 }]
 * };
 * 
 * const patientContext = {
 *   demographics: { age: 35, gender: 'female' },
 *   symptoms: [{ symptom: 'fever', severity: 7, duration: 3, isPrimary: true, isProgressing: false }]
 * };
 * 
 * const enhanced = enhanceWithConfidence(aiResponse, patientContext);
 * ```
 */
export function enhanceWithConfidence(
  aiResponse: string | { text: string; diagnoses?: DiagnosisConfidence[] },
  patientContext: PatientContext
): ConfidenceResult & { originalResponse: string; enhancedAt: string } {
  const timestamp = new Date().toISOString();
  
  // Parse response
  let diagnoses: DiagnosisConfidence[];
  let originalText: string;
  
  if (typeof aiResponse === 'string') {
    originalText = aiResponse;
    diagnoses = parseAIConfidenceScores(aiResponse);
    
    // If no diagnoses parsed, create a generic one
    if (diagnoses.length === 0) {
      diagnoses = [{ condition: 'Assessment Required', confidence: 50 }];
    }
  } else {
    originalText = aiResponse.text;
    diagnoses = aiResponse.diagnoses || parseAIConfidenceScores(aiResponse.text);
  }
  
  // Perform full confidence analysis
  const result = confidenceCalculator.analyzeConfidence(diagnoses, patientContext);
  
  return {
    ...result,
    originalResponse: originalText,
    enhancedAt: timestamp,
  };
}

/**
 * Create a structured diagnosis from AI text
 * 
 * @param text - AI diagnosis text
 * @param confidence - Confidence score
 * @returns Structured diagnosis object
 */
export function createDiagnosis(
  text: string,
  confidence: number
): DiagnosisConfidence {
  return {
    condition: text.trim(),
    confidence: Math.round(confidence),
    reasoning: undefined,
  };
}

/**
 * Merge multiple AI responses with confidence weighting
 * 
 * @param responses - Array of AI responses with confidence scores
 * @returns Merged and weighted diagnoses
 */
export function mergeAIResponses(
  responses: Array<{ diagnoses: DiagnosisConfidence[]; source: string; weight: number }>
): DiagnosisConfidence[] {
  const merged = new Map<string, { totalWeight: number; weightedConfidence: number; sources: string[] }>();
  
  responses.forEach(response => {
    response.diagnoses.forEach(diagnosis => {
      const existing = merged.get(diagnosis.condition);
      const weightedConf = diagnosis.confidence * response.weight;
      
      if (existing) {
        existing.totalWeight += response.weight;
        existing.weightedConfidence += weightedConf;
        existing.sources.push(response.source);
      } else {
        merged.set(diagnosis.condition, {
          totalWeight: response.weight,
          weightedConfidence: weightedConf,
          sources: [response.source],
        });
      }
    });
  });
  
  return Array.from(merged.entries())
    .map(([condition, data]) => ({
      condition,
      confidence: Math.round(data.weightedConfidence / data.totalWeight),
      reasoning: `Aggregated from ${data.sources.length} source(s): ${data.sources.join(', ')}`,
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Singleton instance of the ConfidenceCalculator
 * 
 * Use this for standard confidence calculations throughout the application.
 * For custom configurations, create a new ConfidenceCalculator instance.
 * 
 * @example
 * ```typescript
 * import { confidenceCalculator } from '@/lib/ai/confidence';
 * 
 * const result = confidenceCalculator.calculateBaseConfidence(diagnoses, symptoms);
 * ```
 */
export const confidenceCalculator = new ConfidenceCalculator();

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Complete confidence scoring workflow
 */
export function exampleUsage(): void {
  // 1. Define patient context
  const patientContext: PatientContext = {
    demographics: {
      age: 35,
      gender: 'female',
      bmi: 24.5,
      smokingStatus: 'never',
      region: 'North America',
      isPregnant: false,
    },
    symptoms: [
      { symptom: 'fever', severity: 7, duration: 3, isPrimary: true, isProgressing: false, specificity: 3 },
      { symptom: 'cough', severity: 6, duration: 3, isPrimary: true, isProgressing: true, specificity: 3 },
      { symptom: 'fatigue', severity: 8, duration: 4, isPrimary: false, isProgressing: false, specificity: 2 },
      { symptom: 'body-aches', severity: 6, duration: 2, isPrimary: false, isProgressing: false, specificity: 4 },
    ],
    comorbidities: ['allergic-rhinitis'],
    medications: ['loratadine'],
    allergies: ['penicillin'],
  };

  // 2. Initial AI diagnoses
  const aiDiagnoses: DiagnosisConfidence[] = [
    { condition: 'Influenza', confidence: 75, reasoning: 'Fever, cough, fatigue match influenza presentation' },
    { condition: 'Common Cold', confidence: 60, reasoning: 'Upper respiratory symptoms present' },
    { condition: 'COVID-19', confidence: 45, reasoning: 'Similar presentation, testing recommended' },
  ];

  // 3. Perform full confidence analysis
  const result = confidenceCalculator.analyzeConfidence(aiDiagnoses, patientContext);

  // 4. Display results
  console.log('Primary Diagnosis:', result.primaryDiagnosis.condition);
  console.log('Confidence:', formatConfidenceRange(result.confidenceInterval));
  console.log('Confidence Level:', result.confidenceLevel);
  console.log('Recommend Doctor:', result.recommendDoctor);
  console.log('Risk Factors:', result.riskFactors);

  // 5. Get UI colors
  const colors = getConfidenceColor(result.primaryDiagnosis.confidence);
  console.log('UI Colors:', colors);

  // 6. Enhance raw AI response
  const rawAIResponse = "Based on symptoms, most likely influenza (75% confidence). Common cold is also possible.";
  const enhanced = enhanceWithConfidence(rawAIResponse, patientContext);
  console.log('Enhanced Response:', enhanced);
}

// Default export
export default confidenceCalculator;
