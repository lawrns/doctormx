/**
 * Confidence Analyzer
 *
 * Performs comprehensive confidence analysis combining all factors.
 */

import { logger } from '../../observability/logger';
import type {
  DiagnosisConfidence,
  ConfidenceResult,
  PatientContext,
  Comorbidity,
  ConfidenceLevel,
} from './types';
import {
  SymptomCalculator,
  DemographicCalculator,
  ComorbidityCalculator,
} from './calculators';
import {
  getConfidenceLevel,
  shouldRecommendDoctor,
} from './utils';
import {
  BASE_RATES,
  DEFAULT_BASE_RATE,
  CONFIDENCE_CALCULATION,
} from './data';

/**
 * Adjustment tracking for analysis
 */
interface AdjustmentTracking {
  boosters: string[];
  reducers: string[];
  riskFactors: string[];
}

/**
 * Analyzes confidence across all dimensions
 */
export class ConfidenceAnalyzer {
  private symptomCalc: SymptomCalculator;
  private demographicCalc: DemographicCalculator;
  private comorbidityCalc: ComorbidityCalculator;
  private version: string;

  constructor(version: string) {
    this.symptomCalc = new SymptomCalculator();
    this.demographicCalc = new DemographicCalculator();
    this.comorbidityCalc = new ComorbidityCalculator();
    this.version = version;
  }

  /**
   * Perform complete confidence analysis
   */
  analyze(
    diagnoses: DiagnosisConfidence[],
    patientContext: PatientContext
  ): ConfidenceResult {
    const timestamp = new Date().toISOString();
    const tracking: AdjustmentTracking = {
      riskFactors: [],
      boosters: [],
      reducers: [],
    };

    let adjustedDiagnoses = this.calculateBaseConfidence(
      diagnoses,
      patientContext.symptoms.map(s => s.symptom)
    );

    adjustedDiagnoses = this.applyDemographicAdjustments(
      adjustedDiagnoses,
      patientContext.demographics,
      tracking
    );

    adjustedDiagnoses = this.applyComorbidityAdjustments(
      adjustedDiagnoses,
      patientContext.comorbidities,
      tracking
    );

    adjustedDiagnoses = this.applyDurationAdjustments(
      adjustedDiagnoses,
      patientContext.symptoms
    );

    const ranked = this.symptomCalc.rankDiagnoses(adjustedDiagnoses);
    this.identifyRiskFactors(patientContext.demographics, tracking.riskFactors);

    return this.buildResult(
      ranked,
      tracking,
      timestamp
    );
  }

  /**
   * Calculate base confidence from symptoms
   */
  private calculateBaseConfidence(
    diagnoses: DiagnosisConfidence[],
    symptoms: string[]
  ): DiagnosisConfidence[] {
    let adjusted = this.symptomCalc.calculateBaseConfidence(diagnoses, symptoms);

    return adjusted.map(diagnosis => ({
      ...diagnosis,
      confidence: this.applyBaseRateAdjustment(
        diagnosis.confidence,
        diagnosis.condition
      ),
    }));
  }

  /**
   * Apply base rate prevalence adjustment
   */
  private applyBaseRateAdjustment(confidence: number, condition: string): number {
    const normalized = condition.toLowerCase().replace(/\s+/g, '-');
    const baseRate = BASE_RATES[normalized] ?? DEFAULT_BASE_RATE;
    const adjustment = (baseRate - CONFIDENCE_CALCULATION.BASE_RATE_NORMALIZATION) *
      CONFIDENCE_CALCULATION.BASE_RATE_MULTIPLIER;

    return Math.max(0, Math.min(100, confidence + adjustment));
  }

  /**
   * Apply demographic adjustments
   */
  private applyDemographicAdjustments(
    diagnoses: DiagnosisConfidence[],
    demographics: PatientContext['demographics'],
    tracking: AdjustmentTracking
  ): DiagnosisConfidence[] {
    return diagnoses.map(d => {
      const result = this.demographicCalc.adjustForDemographics(
        d.confidence,
        demographics,
        d.condition
      );
      tracking.boosters.push(...result.boosters);
      tracking.reducers.push(...result.reducers);
      return { ...d, confidence: result.confidence };
    });
  }

  /**
   * Apply comorbidity adjustments
   */
  private applyComorbidityAdjustments(
    diagnoses: DiagnosisConfidence[],
    comorbidities: string[] | undefined,
    tracking: AdjustmentTracking
  ): DiagnosisConfidence[] {
    if (!comorbidities) return diagnoses;

    const comorbidityList = this.comorbidityCalc.stringArrayToComorbidities(comorbidities);

    return diagnoses.map(d => {
      const result = this.comorbidityCalc.adjustForComorbidities(
        d.confidence,
        comorbidityList,
        d.condition
      );
      tracking.riskFactors.push(...result.riskFactors);
      return { ...d, confidence: result.confidence };
    });
  }

  /**
   * Apply duration adjustments
   */
  private applyDurationAdjustments(
    diagnoses: DiagnosisConfidence[],
    symptoms: PatientContext['symptoms']
  ): DiagnosisConfidence[] {
    const avgDuration = this.symptomCalc.calculateAverageDuration(symptoms);

    return diagnoses.map(d => {
      const adjustedConfidence = this.symptomCalc.adjustForSymptomDuration(
        d.confidence,
        avgDuration,
        d.condition
      );
      return { ...d, confidence: adjustedConfidence };
    });
  }

  /**
   * Identify risk factors from demographics
   */
  private identifyRiskFactors(
    demographics: PatientContext['demographics'],
    riskFactors: string[]
  ): void {
    if (demographics.age > 65) riskFactors.push('Advanced age');
    if (demographics.smokingStatus === 'current') riskFactors.push('Active smoking');
    if (demographics.bmi && demographics.bmi > 30) riskFactors.push('Obesity');
  }

  /**
   * Build final confidence result
   */
  private buildResult(
    ranked: Array<DiagnosisConfidence & { rank: number; confidenceGap: number }>,
    tracking: AdjustmentTracking,
    timestamp: string
  ): ConfidenceResult {
    const primary = ranked[0];
    const interval = this.symptomCalc.calculateConfidenceIntervals(primary.confidence);
    const confidenceLevel = getConfidenceLevel(primary.confidence);

    return {
      primaryDiagnosis: primary,
      differentialDiagnoses: ranked.slice(1),
      confidenceInterval: interval,
      confidenceLevel,
      recommendDoctor: shouldRecommendDoctor(primary.confidence, tracking.riskFactors.length),
      riskFactors: tracking.riskFactors,
      confidenceBoosters: Array.from(new Set(tracking.boosters)),
      confidenceReducers: Array.from(new Set(tracking.reducers)),
      timestamp,
      version: this.version,
    };
  }
}
