/**
 * Main Confidence Calculator
 *
 * Entry point for confidence scoring system. Delegates to specialized
 * analyzers and calculators for different aspects of diagnosis confidence.
 */

import { logger } from '../../observability/logger';
import type {
  DiagnosisConfidence,
  PatientContext,
} from './types';
import {
  SymptomCalculator,
  DemographicCalculator,
  ComorbidityCalculator,
  ConsensusCalculator,
} from './calculators';
import { ConfidenceAnalyzer } from './confidence-analyzer';
import { ConfidenceValidator } from './validators';
import {
  getConfidenceLevel,
  parseAIConfidenceScores,
} from './utils';
import type { EnhancedConfidenceResult } from './types';

/**
 * Main confidence calculator
 */
export class ConfidenceCalculator {
  private version: string = '2.0.0';
  private symptomCalc: SymptomCalculator;
  private demographicCalc: DemographicCalculator;
  private comorbidityCalc: ComorbidityCalculator;
  private consensusCalc: ConsensusCalculator;
  private analyzer: ConfidenceAnalyzer;
  private validator: ConfidenceValidator;

  constructor() {
    this.symptomCalc = new SymptomCalculator();
    this.demographicCalc = new DemographicCalculator();
    this.comorbidityCalc = new ComorbidityCalculator();
    this.consensusCalc = new ConsensusCalculator();
    this.analyzer = new ConfidenceAnalyzer(this.version);
    this.validator = new ConfidenceValidator();
  }

  /**
   * Calculate base confidence from symptom-diagnosis matching
   */
  calculateBaseConfidence(
    diagnoses: DiagnosisConfidence[],
    symptoms: string[]
  ): DiagnosisConfidence[] {
    return this.analyzer.analyze(
      diagnoses,
      { demographics: { age: 30, gender: 'other' }, symptoms: symptoms.map(s => ({ 
        symptom: s, severity: 5, duration: 1, isPrimary: true, isProgressing: false 
      })) }
    ).differentialDiagnoses.concat([this.analyzer.analyze(
      diagnoses,
      { demographics: { age: 30, gender: 'other' }, symptoms: symptoms.map(s => ({ 
        symptom: s, severity: 5, duration: 1, isPrimary: true, isProgressing: false 
      })) }
    ).primaryDiagnosis]);
  }

  /**
   * Adjust confidence based on patient demographics
   */
  adjustForDemographics(
    confidence: number,
    demographics: PatientContext['demographics'],
    condition?: string
  ): number {
    const result = this.demographicCalc.adjustForDemographics(
      confidence,
      demographics,
      condition
    );
    return result.confidence;
  }

  /**
   * Adjust confidence based on comorbidities
   */
  adjustForComorbidities(
    confidence: number,
    conditions: { condition: string; severity: 'mild' | 'moderate' | 'severe'; isControlled: boolean }[],
    targetCondition?: string
  ): number {
    const result = this.comorbidityCalc.adjustForComorbidities(
      confidence,
      conditions,
      targetCondition
    );
    return result.confidence;
  }

  /**
   * Adjust confidence based on symptom duration
   */
  adjustForSymptomDuration(
    confidence: number,
    duration: number,
    condition?: string
  ): number {
    return this.symptomCalc.adjustForSymptomDuration(confidence, duration, condition);
  }

  /**
   * Perform complete confidence analysis
   */
  analyzeConfidence(
    diagnoses: DiagnosisConfidence[],
    patientContext: PatientContext
  ) {
    return this.analyzer.analyze(diagnoses, patientContext);
  }

  /**
   * Rank diagnoses by confidence score
   */
  rankDiagnoses(diagnoses: DiagnosisConfidence[]) {
    return this.symptomCalc.rankDiagnoses(diagnoses);
  }

  /**
   * Calculate confidence intervals
   */
  calculateConfidenceIntervals(confidence: number, sampleSize?: number) {
    return this.symptomCalc.calculateConfidenceIntervals(confidence, sampleSize);
  }

  /**
   * Get the current version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Validate a confidence result
   */
  validate(result: Parameters<ConfidenceValidator['validateResult']>[0]) {
    return this.validator.validateResult(result);
  }

  /**
   * Get base rate for a condition
   */
  getBaseRate(condition: string): number {
    return this.demographicCalc.getBaseRate(condition);
  }
}

/**
 * Singleton instance
 */
export const confidenceCalculator = new ConfidenceCalculator();

/**
 * Create a diagnosis from text
 */
export function createDiagnosis(text: string, confidence: number): DiagnosisConfidence {
  return {
    condition: text.trim(),
    confidence: Math.round(confidence),
  };
}

/**
 * Merge multiple AI responses
 */
export function mergeAIResponses(
  responses: Array<{ diagnoses: DiagnosisConfidence[]; source: string; weight: number }>
): DiagnosisConfidence[] {
  const calculator = new ConsensusCalculator();
  return calculator.mergeResponses(responses);
}

/**
 * Enhance AI response with confidence scoring
 */
export function enhanceWithConfidence(
  aiResponse: string | { text: string; diagnoses?: DiagnosisConfidence[] },
  patientContext: PatientContext
): EnhancedConfidenceResult {
  const timestamp = new Date().toISOString();
  let diagnoses: DiagnosisConfidence[];
  let originalText: string;

  if (typeof aiResponse === 'string') {
    originalText = aiResponse;
    diagnoses = parseAIConfidenceScores(aiResponse);
    if (diagnoses.length === 0) {
      diagnoses = [{ condition: 'Assessment Required', confidence: 50 }];
    }
  } else {
    originalText = aiResponse.text;
    diagnoses = aiResponse.diagnoses || parseAIConfidenceScores(aiResponse.text);
  }

  const result = confidenceCalculator.analyzeConfidence(diagnoses, patientContext);

  return {
    ...result,
    originalResponse: originalText,
    enhancedAt: timestamp,
  };
}

// Re-export utility functions
export {
  getConfidenceLevel,
  parseAIConfidenceScores,
};
