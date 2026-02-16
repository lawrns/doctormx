/**
 * Symptom Calculator
 *
 * Calculates confidence adjustments based on symptoms, their specificity,
 * duration, and relationship to conditions.
 */

import type { DiagnosisConfidence, SymptomSeverity } from '../types';
import { BaseCalculator } from './base-calculator';
import {
  SYMPTOM_SPECIFICITY,
  SYMPTOM_CONDITION_RELEVANCE,
  EXPECTED_DURATIONS,
  DEFAULT_SYMPTOM_SPECIFICITY,
  CONFIDENCE_CALCULATION,
  DURATION_THRESHOLDS,
  CHRONIC_CONDITIONS,
} from '../data';

/**
 * Calculator for symptom-based confidence adjustments
 */
export class SymptomCalculator extends BaseCalculator {
  /**
   * Calculate base confidence from symptom-diagnosis matching
   */
  calculateBaseConfidence(
    diagnoses: DiagnosisConfidence[],
    symptoms: string[]
  ): DiagnosisConfidence[] {
    return diagnoses.map(diagnosis => 
      this.calculateDiagnosisConfidence(diagnosis, symptoms)
    );
  }

  /**
   * Calculate confidence for a single diagnosis
   */
  private calculateDiagnosisConfidence(
    diagnosis: DiagnosisConfidence,
    symptoms: string[]
  ): DiagnosisConfidence {
    let adjustedConfidence = diagnosis.confidence;
    const contributingSymptoms: string[] = [];

    const avgSpecificity = this.calculateAverageSpecificity(symptoms);
    
    if (avgSpecificity > 0) {
      adjustedConfidence += this.calculateSpecificityBoost(avgSpecificity);
      contributingSymptoms.push(...this.findContributingSymptoms(symptoms, diagnosis.condition));
    }

    adjustedConfidence += this.calculateSymptomCountFactor(symptoms.length);

    return {
      ...diagnosis,
      confidence: this.clampConfidence(adjustedConfidence),
      contributingSymptoms: contributingSymptoms.length > 0 
        ? contributingSymptoms 
        : diagnosis.contributingSymptoms,
    };
  }

  /**
   * Calculate average specificity of symptoms
   */
  private calculateAverageSpecificity(symptoms: string[]): number {
    const specificities = symptoms
      .map(s => SYMPTOM_SPECIFICITY[this.normalizeCondition(s)] ?? DEFAULT_SYMPTOM_SPECIFICITY)
      .filter(s => s > 0);

    return specificities.length > 0 
      ? specificities.reduce((a, b) => a + b, 0) / specificities.length 
      : 0;
  }

  /**
   * Calculate specificity boost based on average specificity
   */
  private calculateSpecificityBoost(avgSpecificity: number): number {
    return (avgSpecificity - DEFAULT_SYMPTOM_SPECIFICITY) * 
      CONFIDENCE_CALCULATION.SPECIFICITY_MULTIPLIER;
  }

  /**
   * Find symptoms relevant to a condition
   */
  private findContributingSymptoms(symptoms: string[], condition: string): string[] {
    return symptoms.filter(symptom => this.isSymptomRelevant(symptom, condition));
  }

  /**
   * Check if a symptom is relevant to a condition
   */
  private isSymptomRelevant(symptom: string, condition: string): boolean {
    const normalizedCondition = this.normalizeCondition(condition);
    const relevantSymptoms = SYMPTOM_CONDITION_RELEVANCE[normalizedCondition] ?? [];
    return relevantSymptoms.includes(this.normalizeCondition(symptom));
  }

  /**
   * Calculate adjustment factor based on symptom count
   */
  private calculateSymptomCountFactor(count: number): number {
    return Math.min(
      count * CONFIDENCE_CALCULATION.SYMPTOM_COUNT_MULTIPLIER,
      CONFIDENCE_CALCULATION.SYMPTOM_COUNT_CAP
    );
  }

  /**
   * Adjust confidence based on symptom duration
   */
  adjustForSymptomDuration(
    confidence: number,
    duration: number,
    condition?: string
  ): number {
    const reliability = this.calculateDurationReliability(duration, condition);
    const adjustment = (reliability - CONFIDENCE_CALCULATION.DEFAULT_RELIABILITY) * 
      CONFIDENCE_CALCULATION.RELIABILITY_MULTIPLIER;
    
    return this.clampConfidence(confidence + adjustment);
  }

  /**
   * Calculate reliability based on symptom duration
   */
  private calculateDurationReliability(duration: number, condition?: string): number {
    let reliability = this.getBaseReliability(duration);

    reliability = this.adjustForExpectedDuration(reliability, duration, condition);
    reliability = this.adjustForChronicPresentation(reliability, duration, condition);

    return reliability;
  }

  /**
   * Get base reliability from duration thresholds
   */
  private getBaseReliability(duration: number): number {
    if (duration <= DURATION_THRESHOLDS.acute.max) {
      return DURATION_THRESHOLDS.acute.reliability;
    }
    if (duration <= DURATION_THRESHOLDS.subacute.max) {
      return DURATION_THRESHOLDS.subacute.reliability;
    }
    if (duration <= DURATION_THRESHOLDS.chronic.max) {
      return DURATION_THRESHOLDS.chronic.reliability;
    }
    return DURATION_THRESHOLDS.persistent.reliability;
  }

  /**
   * Adjust reliability based on expected duration for condition
   */
  private adjustForExpectedDuration(
    reliability: number,
    duration: number,
    condition?: string
  ): number {
    const expectedDuration = this.getExpectedDuration(condition);
    
    if (expectedDuration && duration > expectedDuration * 2) {
      return reliability - 0.15;
    }
    
    return reliability;
  }

  /**
   * Adjust reliability for acute presentation of chronic condition
   */
  private adjustForChronicPresentation(
    reliability: number,
    duration: number,
    condition?: string
  ): number {
    if (this.isChronicCondition(condition) && duration < 7) {
      return reliability - 0.1;
    }
    
    return reliability;
  }

  /**
   * Get expected duration for a condition
   */
  private getExpectedDuration(condition?: string): number | undefined {
    if (!condition) return undefined;
    return EXPECTED_DURATIONS[this.normalizeCondition(condition)];
  }

  /**
   * Check if condition is chronic
   */
  private isChronicCondition(condition?: string): boolean {
    if (!condition) return false;
    return CHRONIC_CONDITIONS.some(c => condition.toLowerCase().includes(c));
  }

  /**
   * Calculate average duration from symptoms
   */
  calculateAverageDuration(symptoms: SymptomSeverity[]): number {
    if (symptoms.length === 0) return 0;
    return symptoms.reduce((sum, s) => sum + s.duration, 0) / symptoms.length;
  }
}
