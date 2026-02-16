/**
 * Confidence Validator
 *
 * Validates confidence scores and determines recommendations based on
 * confidence levels and risk factors.
 */

import type { 
  ConfidenceLevel, 
  ConfidenceInterval, 
  DiagnosisConfidence,
  SeverityLevel,
} from '../types';
import {
  getConfidenceLevel,
  getConfidenceColor,
  formatConfidenceRange,
  formatConfidenceRangeSimple,
  getConfidenceDescription,
  getConfidenceRecommendation,
  shouldRecommendDoctor,
} from '../utils/confidence-display';
import {
  RECOMMENDATION_THRESHOLDS,
} from '../data';

/**
 * Validation result for a confidence score
 */
export interface ValidationResult {
  isValid: boolean;
  level: ConfidenceLevel;
  requiresReview: boolean;
  recommendation: string;
  errors: string[];
  warnings: string[];
}

/**
 * Risk assessment result
 */
export interface RiskAssessment {
  hasHighRiskFactors: boolean;
  riskFactorCount: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
}

/**
 * Validator for confidence scores and recommendations
 */
export class ConfidenceValidator {
  /**
   * Validate a confidence score
   */
  validateConfidence(
    confidence: number,
    riskFactorCount: number = 0,
    severity: SeverityLevel = 'low'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (confidence < 0 || confidence > 100) {
      errors.push('Confidence score must be between 0 and 100');
    }

    // Warnings for low confidence
    if (confidence < RECOMMENDATION_THRESHOLDS.LOW_CONFIDENCE) {
      warnings.push('Very low confidence score');
    }

    const level = getConfidenceLevel(confidence);
    const requiresReview = shouldRecommendDoctor(confidence, riskFactorCount, severity);
    const recommendation = getConfidenceRecommendation(confidence);

    return {
      isValid: errors.length === 0,
      level,
      requiresReview,
      recommendation,
      errors,
      warnings,
    };
  }

  /**
   * Validate a complete confidence result
   */
  validateResult(result: {
    primaryDiagnosis: DiagnosisConfidence;
    differentialDiagnoses?: DiagnosisConfidence[];
    confidenceInterval?: ConfidenceInterval;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate primary diagnosis
    if (!result.primaryDiagnosis) {
      errors.push('Primary diagnosis is required');
    } else {
      if (result.primaryDiagnosis.confidence < 0 || result.primaryDiagnosis.confidence > 100) {
        errors.push('Primary diagnosis confidence must be between 0 and 100');
      }
    }

    // Validate confidence interval
    if (result.confidenceInterval) {
      const intervalErrors = this.validateConfidenceInterval(result.confidenceInterval);
      errors.push(...intervalErrors);
    }

    // Check for significant confidence gaps
    if (result.differentialDiagnoses && result.differentialDiagnoses.length > 0) {
      const gapWarning = this.checkConfidenceGap(
        result.primaryDiagnosis,
        result.differentialDiagnoses[0]
      );
      if (gapWarning) warnings.push(gapWarning);
    }

    const level = result.primaryDiagnosis 
      ? getConfidenceLevel(result.primaryDiagnosis.confidence)
      : 'very-low';

    return {
      isValid: errors.length === 0,
      level,
      requiresReview: errors.length > 0 || warnings.length > 0,
      recommendation: getConfidenceRecommendation(result.primaryDiagnosis?.confidence ?? 0),
      errors,
      warnings,
    };
  }

  /**
   * Validate confidence interval
   */
  private validateConfidenceInterval(interval: ConfidenceInterval): string[] {
    const errors: string[] = [];

    if (interval.low < 0 || interval.low > 100) {
      errors.push('Confidence interval low must be between 0 and 100');
    }
    if (interval.mid < 0 || interval.mid > 100) {
      errors.push('Confidence interval mid must be between 0 and 100');
    }
    if (interval.high < 0 || interval.high > 100) {
      errors.push('Confidence interval high must be between 0 and 100');
    }
    if (interval.low > interval.mid) {
      errors.push('Confidence interval low cannot be greater than mid');
    }
    if (interval.mid > interval.high) {
      errors.push('Confidence interval mid cannot be greater than high');
    }

    return errors;
  }

  /**
   * Check for concerning confidence gap between diagnoses
   */
  private checkConfidenceGap(
    primary: DiagnosisConfidence,
    secondary: DiagnosisConfidence
  ): string | undefined {
    const gap = primary.confidence - secondary.confidence;
    
    if (gap < 10) {
      return 'Small confidence gap between primary and secondary diagnoses';
    }
    if (gap < 5) {
      return 'Very small confidence gap - consider additional evaluation';
    }
    
    return undefined;
  }

  /**
   * Assess risk level based on confidence and factors
   */
  assessRisk(
    confidence: number,
    riskFactors: string[],
    severity: SeverityLevel = 'low'
  ): RiskAssessment {
    const riskFactorCount = riskFactors.length;
    
    // Determine risk level
    let riskLevel: RiskAssessment['riskLevel'] = 'low';
    
    if (severity === 'critical') {
      riskLevel = 'critical';
    } else if (severity === 'high' || riskFactorCount >= 3) {
      riskLevel = 'high';
    } else if (severity === 'moderate' || riskFactorCount >= 1 || confidence < 60) {
      riskLevel = 'moderate';
    }

    const recommendations = this.generateRiskRecommendations(
      riskLevel,
      confidence,
      riskFactors
    );

    return {
      hasHighRiskFactors: riskFactorCount > 0,
      riskFactorCount,
      riskLevel,
      recommendations,
    };
  }

  /**
   * Generate recommendations based on risk level
   */
  private generateRiskRecommendations(
    riskLevel: RiskAssessment['riskLevel'],
    confidence: number,
    riskFactors: string[]
  ): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('Immediate medical attention required');
        break;
      case 'high':
        recommendations.push('Schedule appointment with healthcare provider soon');
        break;
      case 'moderate':
        recommendations.push('Monitor symptoms and consider medical consultation');
        break;
      case 'low':
        if (confidence > 85) {
          recommendations.push('Follow recommended self-care guidelines');
        }
        break;
    }

    if (riskFactors.length > 0) {
      recommendations.push(`Note identified risk factors: ${riskFactors.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Check if a diagnosis meets minimum confidence threshold
   */
  meetsThreshold(
    diagnosis: DiagnosisConfidence,
    threshold: number = RECOMMENDATION_THRESHOLDS.MODERATE_CONFIDENCE
  ): boolean {
    return diagnosis.confidence >= threshold;
  }

  /**
   * Get all diagnoses that meet a minimum threshold
   */
  filterByThreshold(
    diagnoses: DiagnosisConfidence[],
    threshold: number = RECOMMENDATION_THRESHOLDS.MODERATE_CONFIDENCE
  ): DiagnosisConfidence[] {
    return diagnoses.filter(d => this.meetsThreshold(d, threshold));
  }

  // Re-export utility functions for convenience
  getConfidenceLevel = getConfidenceLevel;
  getConfidenceColor = getConfidenceColor;
  formatConfidenceRange = formatConfidenceRange;
  formatConfidenceRangeSimple = formatConfidenceRangeSimple;
  getConfidenceDescription = getConfidenceDescription;
  getConfidenceRecommendation = getConfidenceRecommendation;
  shouldRecommendDoctor = shouldRecommendDoctor;
}
