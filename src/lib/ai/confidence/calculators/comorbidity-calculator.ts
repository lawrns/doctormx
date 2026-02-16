/**
 * Comorbidity Calculator
 *
 * Calculates confidence adjustments based on patient comorbidities
 * and their interactions with target conditions.
 */

import type { Comorbidity } from '../types';
import { BaseCalculator } from './base-calculator';
import {
  COMORBIDITY_IMPACT,
  COMORBIDITY_ADJUSTMENTS,
  HIGH_DRUG_INTERACTION_RISKS,
  RESPIRATORY_CONDITIONS,
  CARDIOVASCULAR_CONDITIONS,
  INFECTION_CONDITIONS,
} from '../data';

/**
 * Result of comorbidity adjustment
 */
export interface ComorbidityAdjustmentResult {
  confidence: number;
  riskFactors: string[];
}

/**
 * Calculator for comorbidity-based confidence adjustments
 */
export class ComorbidityCalculator extends BaseCalculator {
  /**
   * Adjust confidence based on comorbidities
   */
  adjustForComorbidities(
    confidence: number,
    conditions: Comorbidity[],
    targetCondition?: string
  ): ComorbidityAdjustmentResult {
    let adjustment = 0;
    const riskFactors: string[] = [];

    conditions.forEach(comorbidity => {
      const comorbidityResult = this.calculateComorbidityImpact(
        comorbidity,
        targetCondition
      );
      adjustment += comorbidityResult.adjustment;
      if (comorbidityResult.riskFactor) {
        riskFactors.push(comorbidityResult.riskFactor);
      }
    });

    // Multiple comorbidities exponentially increase complexity
    if (conditions.length > COMORBIDITY_ADJUSTMENTS.COMPLEXITY_THRESHOLD) {
      adjustment -= (conditions.length - COMORBIDITY_ADJUSTMENTS.COMPLEXITY_THRESHOLD) * 
        COMORBIDITY_ADJUSTMENTS.COMPLEXITY_FACTOR;
    }

    return {
      confidence: this.clampConfidence(confidence + adjustment),
      riskFactors,
    };
  }

  /**
   * Calculate impact of a single comorbidity
   */
  private calculateComorbidityImpact(
    comorbidity: Comorbidity,
    targetCondition?: string
  ): { adjustment: number; riskFactor?: string } {
    let adjustment = 0;
    let riskFactor: string | undefined;

    const impact = COMORBIDITY_IMPACT[comorbidity.condition.toLowerCase()];

    if (impact) {
      const category = this.determineImpactCategory(targetCondition);
      const modifier = impact[category] ?? 1.0;
      const severityMultiplier = comorbidity.isControlled ? 0.5 : 1.0;

      if (!comorbidity.isControlled) {
        adjustment -= COMORBIDITY_ADJUSTMENTS.UNCONTROLLED_MULTIPLIER * 
          modifier * severityMultiplier;
        riskFactor = `Uncontrolled ${comorbidity.condition}`;
      } else {
        adjustment += COMORBIDITY_ADJUSTMENTS.CONTROLLED_MULTIPLIER * (modifier - 1);
      }
    }

    // Drug interactions can reduce confidence
    if (this.hasDrugInteractionRisk(comorbidity.condition)) {
      adjustment -= COMORBIDITY_ADJUSTMENTS.DRUG_INTERACTION_PENALTY;
    }

    return { adjustment, riskFactor };
  }

  /**
   * Determine impact category based on target condition
   */
  private determineImpactCategory(targetCondition?: string): string {
    if (!targetCondition) return 'general';
    if (this.isRespiratory(targetCondition)) return 'respiratory-infection';
    if (this.isCardiovascular(targetCondition)) return 'cardiovascular';
    if (this.isInfection(targetCondition)) return 'infection-risk';
    return 'general';
  }

  /**
   * Check if condition has drug interaction risk
   */
  private hasDrugInteractionRisk(condition: string): boolean {
    return HIGH_DRUG_INTERACTION_RISKS.some(c => 
      condition.toLowerCase().includes(c)
    );
  }

  /**
   * Check if condition is respiratory
   */
  private isRespiratory(condition?: string): boolean {
    if (!condition) return false;
    return RESPIRATORY_CONDITIONS.some(r => condition.toLowerCase().includes(r));
  }

  /**
   * Check if condition is cardiovascular
   */
  private isCardiovascular(condition?: string): boolean {
    if (!condition) return false;
    return CARDIOVASCULAR_CONDITIONS.some(c => condition.toLowerCase().includes(c));
  }

  /**
   * Check if condition is infection
   */
  private isInfection(condition?: string): boolean {
    if (!condition) return false;
    return INFECTION_CONDITIONS.some(i => condition.toLowerCase().includes(i));
  }

  /**
   * Convert string array to Comorbidity array
   */
  stringArrayToComorbidities(conditions: string[]): Comorbidity[] {
    return conditions.map(c => ({
      condition: c,
      severity: 'moderate' as const,
      isControlled: true,
    }));
  }
}
