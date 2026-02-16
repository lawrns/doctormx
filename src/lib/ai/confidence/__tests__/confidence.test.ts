/**
 * Confidence System Tests
 *
 * Tests for the refactored confidence scoring system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Main calculator
  ConfidenceCalculator,
  confidenceCalculator,
  createDiagnosis,
  enhanceWithConfidence,
  
  // Calculators
  SymptomCalculator,
  DemographicCalculator,
  ComorbidityCalculator,
  ConsensusCalculator,
  ConfidenceAnalyzer,
  
  // Validators
  ConfidenceValidator,
  
  // Utils
  getConfidenceLevel,
  getConfidenceColor,
  formatConfidenceRange,
  shouldRecommendDoctor,
  getConfidenceDescription,
  parseAIConfidenceScores,
  
  // Data
  BASE_RATES,
  CONFIDENCE_LEVEL_THRESHOLDS,
} from '../index';

import type {
  DiagnosisConfidence,
  PatientContext,
} from '../index';

describe('Confidence System', () => {
  describe('exports', () => {
    it('should export all main components', () => {
      expect(ConfidenceCalculator).toBeDefined();
      expect(confidenceCalculator).toBeDefined();
      expect(createDiagnosis).toBeDefined();
      expect(enhanceWithConfidence).toBeDefined();
    });

    it('should export all calculators', () => {
      expect(SymptomCalculator).toBeDefined();
      expect(DemographicCalculator).toBeDefined();
      expect(ComorbidityCalculator).toBeDefined();
      expect(ConsensusCalculator).toBeDefined();
      expect(ConfidenceAnalyzer).toBeDefined();
    });

    it('should export validator', () => {
      expect(ConfidenceValidator).toBeDefined();
    });

    it('should export utility functions', () => {
      expect(getConfidenceLevel).toBeDefined();
      expect(getConfidenceColor).toBeDefined();
      expect(formatConfidenceRange).toBeDefined();
      expect(shouldRecommendDoctor).toBeDefined();
      expect(getConfidenceDescription).toBeDefined();
      expect(parseAIConfidenceScores).toBeDefined();
    });

    it('should export data constants', () => {
      expect(BASE_RATES).toBeDefined();
      expect(BASE_RATES.influenza).toBeGreaterThan(0);
      expect(CONFIDENCE_LEVEL_THRESHOLDS).toBeDefined();
    });
  });

  describe('confidence levels', () => {
    it('should correctly classify confidence levels', () => {
      expect(getConfidenceLevel(10)).toBe('very-low');
      expect(getConfidenceLevel(30)).toBe('low');
      expect(getConfidenceLevel(50)).toBe('moderate');
      expect(getConfidenceLevel(75)).toBe('high');
      expect(getConfidenceLevel(90)).toBe('very-high');
    });

    it('should return correct colors for each level', () => {
      const veryLowColors = getConfidenceColor(10);
      expect(veryLowColors.bg).toContain('red');

      const highColors = getConfidenceColor(80);
      expect(highColors.bg).toContain('green');
    });
  });

  describe('symptom calculator', () => {
    let calculator: SymptomCalculator;

    beforeEach(() => {
      calculator = new SymptomCalculator();
    });

    it('should calculate base confidence', () => {
      const diagnoses: DiagnosisConfidence[] = [
        { condition: 'Influenza', confidence: 70 },
      ];
      const symptoms = ['fever', 'cough', 'fatigue'];

      const result = calculator.calculateBaseConfidence(diagnoses, symptoms);
      expect(result).toHaveLength(1);
      expect(result[0].confidence).toBeDefined();
    });

    it('should adjust for symptom duration', () => {
      const adjusted = calculator.adjustForSymptomDuration(70, 3, 'influenza');
      expect(typeof adjusted).toBe('number');
      expect(adjusted).toBeGreaterThanOrEqual(0);
      expect(adjusted).toBeLessThanOrEqual(100);
    });
  });

  describe('demographic calculator', () => {
    let calculator: DemographicCalculator;

    beforeEach(() => {
      calculator = new DemographicCalculator();
    });

    it('should adjust for age', () => {
      const result = calculator.adjustForDemographics(
        70,
        { age: 70, gender: 'male' },
        'heart-disease'
      );
      expect(result.confidence).toBeDefined();
      expect(typeof result.confidence).toBe('number');
    });

    it('should return base rates', () => {
      const rate = calculator.getBaseRate('influenza');
      expect(rate).toBe(BASE_RATES.influenza);
    });
  });

  describe('validator', () => {
    let validator: ConfidenceValidator;

    beforeEach(() => {
      validator = new ConfidenceValidator();
    });

    it('should validate confidence scores', () => {
      const result = validator.validateConfidence(75, 0, 'low');
      expect(result.isValid).toBe(true);
      expect(result.level).toBe('high');
    });

    it('should recommend doctor for low confidence', () => {
      expect(shouldRecommendDoctor(30, 0)).toBe(true);
      expect(shouldRecommendDoctor(80, 0)).toBe(false);
    });
  });

  describe('AI response parser', () => {
    it('should parse explicit confidence scores', () => {
      const text = '1. Influenza - 75% confidence\n2. Common Cold: 60%';
      const diagnoses = parseAIConfidenceScores(text);
      
      expect(diagnoses.length).toBeGreaterThan(0);
      // Should find at least one diagnosis
      const conditions = diagnoses.map(d => d.condition.toLowerCase());
      expect(conditions.some(c => c.includes('influenza') || c.includes('common'))).toBe(true);
    });

    it('should infer confidence from language', () => {
      const text = 'Most likely influenza. Possible common cold.';
      const diagnoses = parseAIConfidenceScores(text);
      
      expect(diagnoses.length).toBeGreaterThan(0);
    });
  });

  describe('main confidence calculator', () => {
    it('should perform full analysis', () => {
      const patientContext: PatientContext = {
        demographics: {
          age: 35,
          gender: 'female',
          bmi: 24.5,
          smokingStatus: 'never',
        },
        symptoms: [
          { symptom: 'fever', severity: 7, duration: 3, isPrimary: true, isProgressing: false },
          { symptom: 'cough', severity: 6, duration: 3, isPrimary: true, isProgressing: true },
        ],
        comorbidities: ['allergic-rhinitis'],
      };

      const diagnoses: DiagnosisConfidence[] = [
        { condition: 'Influenza', confidence: 75 },
        { condition: 'Common Cold', confidence: 60 },
      ];

      const result = confidenceCalculator.analyzeConfidence(diagnoses, patientContext);

      expect(result.primaryDiagnosis).toBeDefined();
      expect(result.differentialDiagnoses).toBeDefined();
      expect(result.confidenceInterval).toBeDefined();
      expect(result.confidenceLevel).toBeDefined();
      expect(result.riskFactors).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBeDefined();
    });

    it('should enhance AI responses', () => {
      const aiResponse = 'Based on symptoms, most likely influenza (75% confidence)';
      const patientContext: PatientContext = {
        demographics: { age: 35, gender: 'female' },
        symptoms: [
          { symptom: 'fever', severity: 7, duration: 3, isPrimary: true, isProgressing: false },
        ],
      };

      const result = enhanceWithConfidence(aiResponse, patientContext);

      expect(result.originalResponse).toBe(aiResponse);
      expect(result.enhancedAt).toBeDefined();
      expect(result.primaryDiagnosis).toBeDefined();
    });
  });

  describe('backward compatibility', () => {
    it('should support legacy imports', async () => {
      // Test that the old import path still works
      const legacy = await import('../../confidence');
      expect(legacy.confidenceCalculator).toBeDefined();
      expect(legacy.ConfidenceCalculator).toBeDefined();
      expect(legacy.getConfidenceLevel).toBeDefined();
    });
  });
});
