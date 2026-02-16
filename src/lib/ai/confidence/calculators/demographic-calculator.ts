/**
 * Demographic Calculator
 *
 * Calculates confidence adjustments based on patient demographics
 * including age, gender, BMI, and smoking status.
 */

import type { DemographicFactors } from '../types';
import { BaseCalculator } from './base-calculator';
import {
  BASE_RATES,
  AGE_PREVALENCE,
  GENDER_LIKELIHOOD,
  PREGNANCY_AFFECTED_CONDITIONS,
  DEFAULT_BASE_RATE,
  CONFIDENCE_CALCULATION,
  AGE_THRESHOLDS,
  BMI_THRESHOLDS,
  BMI_ADJUSTMENTS,
  SMOKING_ADJUSTMENTS,
  RESPIRATORY_CONDITIONS,
  CARDIOVASCULAR_CONDITIONS,
  INFECTION_CONDITIONS,
  PREGNANCY_MODIFIER,
} from '../data';

/**
 * Result of demographic adjustment
 */
export interface DemographicAdjustmentResult {
  confidence: number;
  boosters: string[];
  reducers: string[];
}

/**
 * Calculator for demographic-based confidence adjustments
 */
export class DemographicCalculator extends BaseCalculator {
  /**
   * Adjust confidence based on patient demographics
   */
  adjustForDemographics(
    confidence: number,
    demographics: DemographicFactors,
    condition?: string
  ): DemographicAdjustmentResult {
    let adjustment = 0;
    const boosters: string[] = [];
    const reducers: string[] = [];

    // Age-based adjustments
    const ageResult = this.calculateAgeAdjustment(demographics.age, condition);
    adjustment += ageResult.adjustment;
    if (ageResult.message) {
      (ageResult.adjustment > 0 ? boosters : reducers).push(ageResult.message);
    }

    // Gender-based adjustments
    if (condition) {
      const genderAdjustment = this.calculateGenderAdjustment(condition, demographics.gender);
      adjustment += genderAdjustment.adjustment;
      if (genderAdjustment.message) {
        boosters.push(genderAdjustment.message);
      }
    }

    // BMI adjustments
    if (demographics.bmi) {
      const bmiAdjustment = this.calculateBMIAdjustment(demographics.bmi, condition);
      adjustment += bmiAdjustment.adjustment;
      if (bmiAdjustment.message) {
        (bmiAdjustment.adjustment > 0 ? boosters : reducers).push(bmiAdjustment.message);
      }
    }

    // Smoking adjustments
    if (demographics.smokingStatus) {
      const smokingAdjustment = this.calculateSmokingAdjustment(
        demographics.smokingStatus,
        demographics.packYears || 0,
        condition
      );
      adjustment += smokingAdjustment.adjustment;
      if (smokingAdjustment.message) {
        reducers.push(smokingAdjustment.message);
      }
    }

    // Pregnancy adjustments
    if (demographics.isPregnant && condition) {
      const pregnancyAdjustment = this.calculatePregnancyAdjustment(condition);
      adjustment += pregnancyAdjustment.adjustment;
      if (pregnancyAdjustment.message) {
        reducers.push(pregnancyAdjustment.message);
      }
    }

    return {
      confidence: this.clampConfidence(confidence + adjustment),
      boosters,
      reducers,
    };
  }

  /**
   * Calculate age-based adjustment
   */
  private calculateAgeAdjustment(age: number, condition?: string): { 
    adjustment: number; 
    message?: string;
  } {
    const ageGroup = this.getAgeGroup(age);
    const ageModifier = this.getAgeModifier(condition || '', ageGroup);
    const adjustment = (ageModifier - 1) * CONFIDENCE_CALCULATION.AGE_MODIFIER_MULTIPLIER;
    
    let message: string | undefined;
    if (ageModifier > 1.2) {
      message = `Age group ${ageGroup} increases prevalence`;
    } else if (ageModifier < 0.8) {
      message = `Age group ${ageGroup} decreases prevalence`;
    }

    return { adjustment, message };
  }

  /**
   * Get age group classification
   */
  private getAgeGroup(age: number): string {
    if (age < AGE_THRESHOLDS.CHILD) return 'child';
    if (age < AGE_THRESHOLDS.ADULT) return 'adult';
    if (age < AGE_THRESHOLDS.ELDERLY) return 'elderly';
    return 'very-elderly';
  }

  /**
   * Get age modifier for a condition
   */
  private getAgeModifier(condition: string, ageGroup: string): number {
    const modifiers = AGE_PREVALENCE[this.normalizeCondition(condition)];
    return modifiers?.[ageGroup] ?? 1.0;
  }

  /**
   * Calculate gender-based adjustment
   */
  private calculateGenderAdjustment(
    condition: string,
    gender: string
  ): { adjustment: number; message?: string } {
    const modifiers = GENDER_LIKELIHOOD[this.normalizeCondition(condition)];
    if (!modifiers) return { adjustment: 0 };

    const genderModifier = gender === 'male' ? modifiers.male : modifiers.female;
    const adjustment = (genderModifier - 1) * CONFIDENCE_CALCULATION.GENDER_MODIFIER_MULTIPLIER;
    
    const message = genderModifier > 1.2 
      ? `${gender} gender increases likelihood` 
      : undefined;

    return { adjustment, message };
  }

  /**
   * Calculate BMI-based adjustment
   */
  private calculateBMIAdjustment(
    bmi: number,
    condition?: string
  ): { adjustment: number; message?: string } {
    let adjustment = 0;
    let message: string | undefined;

    if (bmi > BMI_THRESHOLDS.OBESE) {
      adjustment = BMI_ADJUSTMENTS.OBESE;
      if (this.isCardiovascular(condition)) adjustment += BMI_ADJUSTMENTS.OBESE_CARDIOVASCULAR;
      if (this.isRespiratory(condition)) adjustment += BMI_ADJUSTMENTS.OBESE_RESPIRATORY;
      message = `BMI ${bmi} reduces diagnostic clarity`;
    } else if (bmi < BMI_THRESHOLDS.UNDERWEIGHT) {
      adjustment = BMI_ADJUSTMENTS.UNDERWEIGHT;
      if (this.isInfection(condition)) adjustment += BMI_ADJUSTMENTS.UNDERWEIGHT_INFECTION;
      message = `BMI ${bmi} relevant to condition`;
    }

    return { adjustment, message };
  }

  /**
   * Calculate smoking-based adjustment
   */
  private calculateSmokingAdjustment(
    status: string,
    packYears: number,
    condition?: string
  ): { adjustment: number; message?: string } {
    let adjustment = 0;

    if (status === 'current') {
      adjustment = SMOKING_ADJUSTMENTS.CURRENT;
      if (this.isRespiratory(condition)) adjustment += SMOKING_ADJUSTMENTS.CURRENT_RESPIRATORY;
      if (this.isCardiovascular(condition)) adjustment += SMOKING_ADJUSTMENTS.CURRENT_CARDIOVASCULAR;
      if (packYears > 20) adjustment += SMOKING_ADJUSTMENTS.CURRENT_HIGH_PACK_YEARS;
    } else if (status === 'former') {
      adjustment = SMOKING_ADJUSTMENTS.FORMER;
      if (packYears > 20) adjustment += SMOKING_ADJUSTMENTS.FORMER_HIGH_PACK_YEARS;
    }

    const message = adjustment < 0 ? 'Smoking history complicates presentation' : undefined;

    return { adjustment, message };
  }

  /**
   * Calculate pregnancy-based adjustment
   */
  private calculatePregnancyAdjustment(condition?: string): { 
    adjustment: number; 
    message?: string;
  } {
    if (!condition) return { adjustment: 0 };

    const normalizedCondition = this.normalizeCondition(condition);
    if (PREGNANCY_AFFECTED_CONDITIONS.includes(normalizedCondition)) {
      return {
        adjustment: PREGNANCY_MODIFIER,
        message: 'Pregnancy may alter symptom presentation',
      };
    }

    return { adjustment: 0 };
  }

  /**
   * Get base rate for a condition
   */
  getBaseRate(condition: string): number {
    return BASE_RATES[this.normalizeCondition(condition)] ?? DEFAULT_BASE_RATE;
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
}
