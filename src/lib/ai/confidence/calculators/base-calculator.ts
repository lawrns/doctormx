/**
 * Base Calculator
 *
 * Base class for all confidence calculators with common utilities.
 */

import type { DiagnosisConfidence, ConfidenceInterval } from '../types';
import {
  MARGIN_OF_ERROR_CONFIG,
} from '../data/confidence-thresholds';

/**
 * Base class for confidence calculators
 */
export abstract class BaseCalculator {
  protected version: string = '1.0.0';

  /**
   * Clamp confidence value to valid range (0-100)
   */
  protected clampConfidence(confidence: number): number {
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Normalize condition name for lookup
   */
  protected normalizeCondition(condition: string): string {
    return condition.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Calculate confidence intervals for a confidence score
   */
  calculateConfidenceIntervals(
    confidence: number,
    sampleSize?: number
  ): ConfidenceInterval {
    const marginOfError = this.calculateMarginOfError(confidence, sampleSize);

    return {
      low: Math.max(0, confidence - marginOfError),
      mid: confidence,
      high: Math.min(100, confidence + marginOfError),
      marginOfError,
    };
  }

  /**
   * Calculate margin of error based on confidence level and sample size
   */
  private calculateMarginOfError(confidence: number, sampleSize?: number): number {
    let marginOfError = MARGIN_OF_ERROR_CONFIG.DEFAULT;

    if (sampleSize && sampleSize > 0) {
      marginOfError = this.calculateStatisticalMargin(confidence, sampleSize);
    }

    marginOfError = this.adjustMarginForConfidenceLevel(marginOfError, confidence);
    return this.boundMargin(marginOfError);
  }

  /**
   * Calculate statistical margin using standard error formula
   */
  private calculateStatisticalMargin(confidence: number, sampleSize: number): number {
    const p = confidence / 100;
    const standardError = Math.sqrt((p * (1 - p)) / sampleSize);
    return MARGIN_OF_ERROR_CONFIG.Z_SCORE * standardError * 100;
  }

  /**
   * Adjust margin based on confidence level
   */
  private adjustMarginForConfidenceLevel(margin: number, confidence: number): number {
    if (confidence > MARGIN_OF_ERROR_CONFIG.HIGH_CONFIDENCE_THRESHOLD || 
        confidence < MARGIN_OF_ERROR_CONFIG.LOW_CONFIDENCE_THRESHOLD) {
      return margin * MARGIN_OF_ERROR_CONFIG.HIGH_CONFIDENCE_REDUCTION;
    }
    
    if (confidence > MARGIN_OF_ERROR_CONFIG.MODERATE_CONFIDENCE_UPPER || 
        confidence < MARGIN_OF_ERROR_CONFIG.MODERATE_CONFIDENCE_LOWER) {
      return margin * MARGIN_OF_ERROR_CONFIG.MODERATE_CONFIDENCE_REDUCTION;
    }
    
    return margin;
  }

  /**
   * Bound margin to min/max values
   */
  private boundMargin(margin: number): number {
    return Math.max(
      MARGIN_OF_ERROR_CONFIG.MINIMUM,
      Math.min(MARGIN_OF_ERROR_CONFIG.MAXIMUM, margin)
    );
  }

  /**
   * Rank diagnoses by confidence score (highest first)
   */
  rankDiagnoses(
    diagnoses: DiagnosisConfidence[]
  ): Array<DiagnosisConfidence & { rank: number; confidenceGap: number }> {
    const sorted = [...diagnoses].sort((a, b) => b.confidence - a.confidence);

    return sorted.map((diagnosis, index) => ({
      ...diagnosis,
      rank: index + 1,
      confidenceGap: index === 0 ? 0 : sorted[0].confidence - diagnosis.confidence,
    }));
  }

  /**
   * Get calculator version
   */
  getVersion(): string {
    return this.version;
  }
}
