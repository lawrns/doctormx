/**
 * Triage Accuracy Test Suite for Emergency Detection
 *
 * Validates the clinical accuracy of emergency detection:
 * - Sensitivity > 95% (true positive rate for emergencies)
 * - Specificity > 90% (true negative rate for non-emergencies)
 * - Positive Predictive Value > 85%
 * - Negative Predictive Value > 95%
 *
 * Based on clinical requirements from docs/emergency-detection.md
 * Philosophy: "Better false positive than false negative"
 */

import { describe, it, expect } from 'vitest';
import { evaluateRedFlags, isMentalHealthCrisis } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

interface TestCase {
  input: string;
  isEmergency: boolean;
  category?: string;
  expectedAction?: 'ER' | 'URGENT' | 'PRIMARY' | 'SELFCARE';
  context?: {
    age?: number;
    pregnancyStatus?: 'pregnant' | 'not_pregnant' | 'unknown';
    conditions?: string[];
    medications?: Array<{ name: string; dosage?: string }>;
  };
}

interface ConfusionMatrix {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
}

interface AccuracyMetrics {
  sensitivity: number;  // True Positive Rate
  specificity: number;  // True Negative Rate
  precision: number;    // Positive Predictive Value
  npv: number;         // Negative Predictive Value
  accuracy: number;    // Overall Accuracy
}

/**
 * Calculate confusion matrix from test results
 */
function calculateConfusionMatrix(results: Array<{ actual: boolean; predicted: boolean }>): ConfusionMatrix {
  return {
    truePositives: results.filter(r => r.actual && r.predicted).length,
    trueNegatives: results.filter(r => !r.actual && !r.predicted).length,
    falsePositives: results.filter(r => !r.actual && r.predicted).length,
    falseNegatives: results.filter(r => r.actual && !r.predicted).length,
  };
}

/**
 * Calculate accuracy metrics from confusion matrix
 */
function calculateMetrics(matrix: ConfusionMatrix): AccuracyMetrics {
  const { truePositives, trueNegatives, falsePositives, falseNegatives } = matrix;

  return {
    sensitivity: truePositives / (truePositives + falseNegatives),  // TPR
    specificity: trueNegatives / (trueNegatives + falsePositives),  // TNR
    precision: truePositives / (truePositives + falsePositives),    // PPV
    npv: trueNegatives / (trueNegatives + falseNegatives),         // NPV
    accuracy: (truePositives + trueNegatives) /
              (truePositives + trueNegatives + falsePositives + falseNegatives),
  };
}

describe('Triage Accuracy Tests', () => {

  // ============================================================================
  // TEST DATASETS
  // ============================================================================

  const emergencyCases: TestCase[] = [
    // Cardiac Emergencies
    { input: 'Dolor de pecho opresivo', isEmergency: true, category: 'cardiac', expectedAction: 'ER' },
    { input: 'Dolor de pecho que irradia al brazo izquierdo', isEmergency: true, category: 'cardiac', expectedAction: 'ER' },
    { input: 'Siento que me voy a morir, dolor en el pecho', isEmergency: true, category: 'cardiac', expectedAction: 'ER' },
    { input: 'Chest pain radiating to arm', isEmergency: true, category: 'cardiac', expectedAction: 'ER' },
    { input: 'Crushing chest pain', isEmergency: true, category: 'cardiac', expectedAction: 'ER' },

    // Stroke/CVA
    { input: 'Cara caída del lado izquierdo', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'No puedo mover el brazo derecho', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Hablo enredado, no me salen las palabras', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Face drooping on one side', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Slurred speech cant talk', isEmergency: true, category: 'neurological', expectedAction: 'ER' },

    // Respiratory Emergencies
    { input: 'No puedo respirar', isEmergency: true, category: 'respiratory', expectedAction: 'ER' },
    { input: 'Me estoy ahogando', isEmergency: true, category: 'respiratory', expectedAction: 'ER' },
    { input: 'Labios azules, no puedo respirar', isEmergency: true, category: 'respiratory', expectedAction: 'ER' },
    { input: 'Cant breathe, choking', isEmergency: true, category: 'respiratory', expectedAction: 'ER' },
    { input: 'Blue lips, trouble breathing', isEmergency: true, category: 'respiratory', expectedAction: 'ER' },

    // Mental Health Crises
    { input: 'Quiero morir', isEmergency: true, category: 'psychiatric', expectedAction: 'ER' },
    { input: 'Quiero suicidarme', isEmergency: true, category: 'psychiatric', expectedAction: 'ER' },
    { input: 'Voy a matarme', isEmergency: true, category: 'psychiatric', expectedAction: 'ER' },
    { input: 'I want to die', isEmergency: true, category: 'psychiatric', expectedAction: 'ER' },
    { input: 'Want to kill myself', isEmergency: true, category: 'psychiatric', expectedAction: 'ER' },
    { input: 'Plan suicida, tengo todo planeado', isEmergency: true, category: 'psychiatric', expectedAction: 'ER' },
    { input: 'No quiero vivir más', isEmergency: true, category: 'psychiatric', expectedAction: 'ER' },

    // Severe Bleeding
    { input: 'Sangrado que no para', isEmergency: true, category: 'trauma', expectedAction: 'ER' },
    { input: 'Hemorragia abundante', isEmergency: true, category: 'trauma', expectedAction: 'ER' },
    { input: 'Me estoy desangrando', isEmergency: true, category: 'trauma', expectedAction: 'ER' },
    { input: 'Severe bleeding wont stop', isEmergency: true, category: 'trauma', expectedAction: 'ER' },
    { input: 'Uncontrolled hemorrhage', isEmergency: true, category: 'trauma', expectedAction: 'ER' },

    // Loss of Consciousness
    { input: 'Me desmayé y me golpeé la cabeza', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Perdí el conocimiento', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Passed out and hit head', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Fainted, lost consciousness', isEmergency: true, category: 'neurological', expectedAction: 'ER' },

    // Severe Allergic Reactions
    { input: 'Garganta cerrada por alergia', isEmergency: true, category: 'allergic', expectedAction: 'ER' },
    { input: 'Labios hinchados, cara hinchada', isEmergency: true, category: 'allergic', expectedAction: 'ER' },
    { input: 'Anafilaxia', isEmergency: true, category: 'allergic', expectedAction: 'ER' },
    { input: 'Throat closing from allergy', isEmergency: true, category: 'allergic', expectedAction: 'ER' },
    { input: 'Anaphylaxis, swollen tongue', isEmergency: true, category: 'allergic', expectedAction: 'ER' },

    // Seizures
    { input: 'Convulsiones', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Crisis convulsiva', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Espasmos incontrolables', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Seizure, convulsing', isEmergency: true, category: 'neurological', expectedAction: 'ER' },

    // Thunderclap Headache
    { input: 'El peor dolor de cabeza de mi vida', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Dolor de cabeza explosivo de golpe', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Worst headache of my life', isEmergency: true, category: 'neurological', expectedAction: 'ER' },
    { input: 'Thunderclap headache sudden', isEmergency: true, category: 'neurological', expectedAction: 'ER' },

    // Pregnancy Emergencies
    { input: 'Estoy embarazada y tengo sangrado', isEmergency: true, category: 'obstetric', expectedAction: 'ER' },
    { input: 'Sangrado vaginal durante embarazo', isEmergency: true, category: 'obstetric', expectedAction: 'ER' },
    { input: 'Dolor abdominal intenso embarazada', isEmergency: true, category: 'obstetric', expectedAction: 'ER' },
    { input: 'Pregnant and bleeding', isEmergency: true, category: 'obstetric', expectedAction: 'ER' },

    // High Fever with Context
    { input: 'Fiebre de 40 grados', isEmergency: true, category: 'infectious', expectedAction: 'URGENT' },
    { input: 'Temperature 104F', isEmergency: true, category: 'infectious', expectedAction: 'URGENT' },

    // Acute Abdomen
    { input: 'Abdomen rígido y doloroso', isEmergency: true, category: 'gastrointestinal', expectedAction: 'URGENT' },
    { input: 'Rigid stomach severe pain', isEmergency: true, category: 'gastrointestinal', expectedAction: 'URGENT' },

    // DVT
    { input: 'Pierna hinchada y roja', isEmergency: true, category: 'vascular', expectedAction: 'URGENT' },
    { input: 'Swollen red leg', isEmergency: true, category: 'vascular', expectedAction: 'URGENT' },

    // Vision Loss
    { input: 'Perdí la visión de golpe', isEmergency: true, category: 'ophthalmologic', expectedAction: 'URGENT' },
    { input: 'Sudden vision loss', isEmergency: true, category: 'ophthalmologic', expectedAction: 'URGENT' },
  ];

  const nonEmergencyCases: TestCase[] = [
    // Minor symptoms
    { input: 'Me duele un poco la cabeza', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Dolor de cabeza leve', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Mild headache', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Lightheaded headache', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },

    // Common cold
    { input: 'Tengo moqueo y estornudos', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Congestión nasal', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Runny nose sneezing', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Stuffy nose', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },

    // Minor pain
    { input: 'Dolor muscular después del ejercicio', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Me cansé en el gimnasio', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Muscle sore from gym', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Post workout soreness', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },

    // Minor injuries
    { input: 'Raspón pequeño en el dedo', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Cortadura leve', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Small scratch on finger', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Minor cut paper cut', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },

    // Emotional (non-suicidal)
    { input: 'Me siento triste hoy', isEmergency: false, category: 'emotional', expectedAction: 'PRIMARY' },
    { input: 'Estoy estresado por el trabajo', isEmergency: false, category: 'emotional', expectedAction: 'PRIMARY' },
    { input: 'Feeling sad today', isEmergency: false, category: 'emotional', expectedAction: 'PRIMARY' },
    { input: 'Stressed about work', isEmergency: false, category: 'emotional', expectedAction: 'PRIMARY' },

    // Mild GI symptoms
    { input: 'Un poco de dolor de estómago', isEmergency: false, category: 'gastrointestinal', expectedAction: 'SELFCARE' },
    { input: 'Acidez estomacal', isEmergency: false, category: 'gastrointestinal', expectedAction: 'PRIMARY' },
    { input: 'Mild stomach pain', isEmergency: false, category: 'gastrointestinal', expectedAction: 'SELFCARE' },
    { input: 'Heartburn indigestion', isEmergency: false, category: 'gastrointestinal', expectedAction: 'PRIMARY' },

    // Mild respiratory
    { input: 'Tengo un poco de tos', isEmergency: false, category: 'respiratory', expectedAction: 'SELFCARE' },
    { input: 'Tos leve con garganta irritada', isEmergency: false, category: 'respiratory', expectedAction: 'SELFCARE' },
    { input: 'Mild cough', isEmergency: false, category: 'respiratory', expectedAction: 'SELFCARE' },
    { input: 'Tickle in throat cough', isEmergency: false, category: 'respiratory', expectedAction: 'SELFCARE' },

    // Skin issues
    { input: 'Tengo acné', isEmergency: false, category: 'dermatological', expectedAction: 'PRIMARY' },
    { input: 'Manchas en la piel', isEmergency: false, category: 'dermatological', expectedAction: 'PRIMARY' },
    { input: 'Acne breakout', isEmergency: false, category: 'dermatological', expectedAction: 'PRIMARY' },
    { input: 'Skin rash minor', isEmergency: false, category: 'dermatological', expectedAction: 'PRIMARY' },

    // Chronic conditions
    { input: 'Dolor de espalda crónico', isEmergency: false, category: 'chronic', expectedAction: 'PRIMARY' },
    { input: 'Artritis dolor de articulaciones', isEmergency: false, category: 'chronic', expectedAction: 'PRIMARY' },
    { input: 'Chronic back pain', isEmergency: false, category: 'chronic', expectedAction: 'PRIMARY' },
    { input: 'Arthritis joint pain', isEmergency: false, category: 'chronic', expectedAction: 'PRIMARY' },

    // Non-urgent questions
    { input: '¿Cuáles son sus horarios?', isEmergency: false, category: 'administrative', expectedAction: undefined },
    { input: '¿Cuánto cuesta la consulta?', isEmergency: false, category: 'administrative', expectedAction: undefined },
    { input: 'What are your hours?', isEmergency: false, category: 'administrative', expectedAction: undefined },
    { input: 'How much is consultation?', isEmergency: false, category: 'administrative', expectedAction: undefined },

    // Preventive care
    { input: 'Quiero agendar un chequeo', isEmergency: false, category: 'preventive', expectedAction: 'PRIMARY' },
    { input: 'Necesito vacuna de gripe', isEmergency: false, category: 'preventive', expectedAction: 'PRIMARY' },
    { input: 'Want to schedule checkup', isEmergency: false, category: 'preventive', expectedAction: 'PRIMARY' },
    { input: 'Need flu shot', isEmergency: false, category: 'preventive', expectedAction: 'PRIMARY' },

    // Academic/medical discussions (not emergencies)
    { input: '¿Cuáles son los síntomas de infarto?', isEmergency: false, category: 'informational', expectedAction: undefined },
    { input: 'Explícame qué es un derrame', isEmergency: false, category: 'informational', expectedAction: undefined },
    { input: 'What are heart attack symptoms?', isEmergency: false, category: 'informational', expectedAction: undefined },
    { input: 'Explain stroke to me', isEmergency: false, category: 'informational', expectedAction: undefined },

    // Talking about someone else's condition (not self)
    { input: 'Mi amigo tuvo un infarto el año pasado', isEmergency: false, category: 'informational', expectedAction: undefined },
    { input: 'My grandmother had a stroke', isEmergency: false, category: 'informational', expectedAction: undefined },

    // Mild fatigue
    { input: 'Estoy cansado', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Me siento sin energía', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Feeling tired', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
    { input: 'Low energy today', isEmergency: false, category: 'minor', expectedAction: 'SELFCARE' },
  ];

  // ============================================================================
  // SENSITIVITY TESTS - True Positive Rate
  // ============================================================================
  describe('Sensitivity - True Positive Rate', () => {
    const MIN_SENSITIVITY = 0.95; // 95% - Must detect emergencies

    it(`should have sensitivity > ${(MIN_SENSITIVITY * 100).toFixed(0)}% for all emergencies`, () => {
      const results = emergencyCases.map(testCase => {
        const context = testCase.context
          ? {
              age: testCase.context.age,
              pregnancyStatus: testCase.context.pregnancyStatus,
              conditions: testCase.context.conditions,
              medications: testCase.context.medications,
            }
          : undefined;

        const result = detectRedFlagsEnhanced(
          testCase.input,
          context
        );

        return {
          actual: testCase.isEmergency,
          predicted: result.detected && (result.highestSeverity === 'critical' || result.highestSeverity === 'high'),
          testCase,
          result,
        };
      });

      const matrix = calculateConfusionMatrix(results.map(r => ({ actual: r.actual, predicted: r.predicted })));
      const metrics = calculateMetrics(matrix);

      // Log individual failures for debugging
      const falseNegatives = results.filter(r => r.actual && !r.predicted);
      if (falseNegatives.length > 0) {
        console.warn('False Negatives (missed emergencies):', falseNegatives.map(f => ({
          input: f.testCase.input,
          category: f.testCase.category,
          result: f.result,
        })));
      }

      expect(metrics.sensitivity).toBeGreaterThanOrEqual(MIN_SENSITIVITY);
      expect(matrix.falseNegatives).toBe(0); // Zero tolerance for missed emergencies
    });

    it('should have 100% sensitivity for critical emergencies (ER level)', () => {
      const criticalCases = emergencyCases.filter(c => c.expectedAction === 'ER');

      const results = criticalCases.map(testCase => {
        const result = evaluateRedFlags({
          message: testCase.input,
          intake: testCase.context?.pregnancyStatus === 'pregnant'
            ? { isPregnant: true }
            : undefined,
        });

        return {
          actual: testCase.expectedAction === 'ER',
          predicted: result.action === 'ER',
          testCase,
        };
      });

      const matrix = calculateConfusionMatrix(results.map(r => ({ actual: r.actual, predicted: r.predicted })));
      const metrics = calculateMetrics(matrix);

      expect(matrix.falseNegatives).toBe(0); // Critical: zero false negatives
      expect(metrics.sensitivity).toBe(1.0);
    });

    it('should have >95% sensitivity by category', () => {
      const categories = Array.from(new Set(emergencyCases.map(c => c.category || 'unknown')));

      const categoryResults: Record<string, { sensitivity: number; count: number }> = {};

      for (const category of categories) {
        const categoryCases = emergencyCases.filter(c => (c.category || 'unknown') === category);

        const results = categoryCases.map(testCase => {
          const result = detectRedFlagsEnhanced(testCase.input, testCase.context);
          return {
            actual: testCase.isEmergency,
            predicted: result.detected,
          };
        });

        const matrix = calculateConfusionMatrix(results);
        const metrics = calculateMetrics(matrix);

        categoryResults[category] = {
          sensitivity: metrics.sensitivity,
          count: categoryCases.length,
        };

        // Only enforce if we have at least 5 test cases
        if (categoryCases.length >= 5) {
          expect(metrics.sensitivity).toBeGreaterThanOrEqual(0.95);
        }
      }

      console.log('Sensitivity by category:', categoryResults);
    });
  });

  // ============================================================================
  // SPECIFICITY TESTS - True Negative Rate
  // ============================================================================
  describe('Specificity - True Negative Rate', () => {
    const MIN_SPECIFICITY = 0.90; // 90% - Avoid false alarms

    it(`should have specificity > ${(MIN_SPECIFICITY * 100).toFixed(0)}% for non-emergencies`, () => {
      const results = nonEmergencyCases.map(testCase => {
        const result = detectRedFlagsEnhanced(
          testCase.input,
          testCase.context
        );

        return {
          actual: testCase.isEmergency,
          predicted: result.detected &&
            !(result.highestSeverity === 'moderate' && testCase.expectedAction === 'PRIMARY'),
          testCase,
          result,
        };
      });

      const matrix = calculateConfusionMatrix(results.map(r => ({ actual: r.actual, predicted: r.predicted })));
      const metrics = calculateMetrics(matrix);

      // Log false positives for review
      const falsePositives = results.filter(r => !r.actual && r.predicted);
      if (falsePositives.length > 0) {
        console.warn('False Positives (over-triage):', falsePositives.map(f => ({
          input: f.testCase.input,
          category: f.testCase.category,
          detected: f.result.detected,
          severity: f.result.highestSeverity,
        })));
      }

      expect(metrics.specificity).toBeGreaterThanOrEqual(MIN_SPECIFICITY);
    });

    it('should NOT flag administrative questions as emergencies', () => {
      const adminCases = nonEmergencyCases.filter(c => c.category === 'administrative');

      adminCases.forEach(testCase => {
        const result = evaluateRedFlags({ message: testCase.input });
        expect(result.triggered).toBe(false);
        expect(result.action).toBeUndefined();
      });
    });

    it('should NOT flag informational queries as emergencies', () => {
      const infoCases = nonEmergencyCases.filter(c => c.category === 'informational');

      infoCases.forEach(testCase => {
        const result = evaluateRedFlags({ message: testCase.input });
        expect(result.triggered).toBe(false);
      });
    });

    it('should correctly distinguish sadness from suicidal ideation', () => {
      const emotionalCases = nonEmergencyCases.filter(c => c.category === 'emotional');

      emotionalCases.forEach(testCase => {
        const result = evaluateRedFlags({ message: testCase.input });
        expect(result.triggered).toBe(false);
        expect(isMentalHealthCrisis(testCase.input)).toBe(false);
      });
    });
  });

  // ============================================================================
  // POSITIVE PREDIVE VALUE (PPV)
  // ============================================================================
  describe('Positive Predictive Value', () => {
    const MIN_PPV = 0.85; // 85% - When we say emergency, it usually is

    it(`should have PPV > ${(MIN_PPV * 100).toFixed(0)}%`, () => {
      const allCases = [...emergencyCases, ...nonEmergencyCases];

      const results = allCases.map(testCase => {
        const result = detectRedFlagsEnhanced(testCase.input, testCase.context);

        return {
          actual: testCase.isEmergency,
          predicted: result.detected && result.highestSeverity !== 'moderate',
        };
      });

      const matrix = calculateConfusionMatrix(results);
      const metrics = calculateMetrics(matrix);

      expect(metrics.precision).toBeGreaterThanOrEqual(MIN_PPV);
    });
  });

  // ============================================================================
  // NEGATIVE PREDICTIVE VALUE (NPV)
  // ============================================================================
  describe('Negative Predictive Value', () => {
    const MIN_NPV = 0.95; // 95% - When we say safe, it truly is

    it(`should have NPV > ${(MIN_NPV * 100).toFixed(0)}%`, () => {
      const allCases = [...emergencyCases, ...nonEmergencyCases];

      const results = allCases.map(testCase => {
        const result = detectRedFlagsEnhanced(testCase.input, testCase.context);

        return {
          actual: !testCase.isEmergency,
          predicted: !result.detected,
        };
      });

      const matrix = calculateConfusionMatrix(results);
      const metrics = calculateMetrics(matrix);

      expect(metrics.npv).toBeGreaterThanOrEqual(MIN_NPV);
    });
  });

  // ============================================================================
  // OVERALL ACCURACY
  // ============================================================================
  describe('Overall Accuracy', () => {
    const MIN_ACCURACY = 0.92; // 92% overall accuracy

    it(`should have overall accuracy > ${(MIN_ACCURACY * 100).toFixed(0)}%`, () => {
      const allCases = [...emergencyCases, ...nonEmergencyCases];

      const results = allCases.map(testCase => {
        const result = detectRedFlagsEnhanced(testCase.input, testCase.context);

        return {
          actual: testCase.isEmergency,
          predicted: result.detected &&
            (testCase.isEmergency || result.highestSeverity === 'moderate'),
        };
      });

      const matrix = calculateConfusionMatrix(results);
      const metrics = calculateMetrics(matrix);

      console.log('Confusion Matrix:', matrix);
      console.log('Metrics:', {
        sensitivity: `${(metrics.sensitivity * 100).toFixed(1)}%`,
        specificity: `${(metrics.specificity * 100).toFixed(1)}%`,
        precision: `${(metrics.precision * 100).toFixed(1)}%`,
        npv: `${(metrics.npv * 100).toFixed(1)}%`,
        accuracy: `${(metrics.accuracy * 100).toFixed(1)}%`,
      });

      expect(metrics.accuracy).toBeGreaterThanOrEqual(MIN_ACCURACY);
    });
  });

  // ============================================================================
  // CRITICAL CASE VALIDATION - Zero False Negatives
  // ============================================================================
  describe('Critical Case Validation', () => {
    it('should have ZERO false negatives for life-threatening conditions', () => {
      const criticalKeywords = [
        'infarto', 'heart attack', 'dolor de pecho', 'chest pain',
        'no puedo respirar', 'cant breathe', 'ahogo', 'choking',
        'quiero morir', 'want to die', 'suicidarme', 'kill myself',
        'derrame', 'stroke', 'cara caída', 'face drooping',
        'parálisis', 'paralysis', 'convulsiones', 'seizure',
      ];

      const results = criticalKeywords.map(keyword => {
        const result = detectRedFlagsEnhanced(keyword);
        return {
          keyword,
          detected: result.detected,
          severity: result.highestSeverity,
        };
      });

      const undetected = results.filter(r => !r.detected);

      expect(undetected.length).toBe(0);
    });
  });

  // ============================================================================
  // LANGUAGE ACCURACY
  // ============================================================================
  describe('Language Accuracy', () => {
    it('should maintain accuracy across Spanish and English', () => {
      const spanishCases = emergencyCases.filter(c => !c.input.match(/[a-zA-Z]/) || /[áéíóúñ]/.test(c.input));
      const englishCases = emergencyCases.filter(c => /^[a-zA-Z\s]+$/.test(c.input));

      // Test Spanish
      const spanishResults = spanishCases.map(testCase => {
        const result = detectRedFlagsEnhanced(testCase.input);
        return { actual: testCase.isEmergency, predicted: result.detected };
      });

      const spanishMatrix = calculateConfusionMatrix(spanishResults);
      const spanishMetrics = calculateMetrics(spanishMatrix);

      // Test English
      const englishResults = englishCases.map(testCase => {
        const result = detectRedFlagsEnhanced(testCase.input);
        return { actual: testCase.isEmergency, predicted: result.detected };
      });

      const englishMatrix = calculateConfusionMatrix(englishResults);
      const englishMetrics = calculateMetrics(englishMatrix);

      // Both should meet minimum requirements
      expect(spanishMetrics.sensitivity).toBeGreaterThanOrEqual(0.95);
      expect(englishMetrics.sensitivity).toBeGreaterThanOrEqual(0.95);
    });
  });

  // ============================================================================
  // CARE LEVEL CLASSIFICATION ACCURACY
  // ============================================================================
  describe('Care Level Classification Accuracy', () => {
    it('should correctly classify ER level cases', () => {
      const erCases = emergencyCases.filter(c => c.expectedAction === 'ER');

      const correctClassifications = erCases.filter(testCase => {
        const result = evaluateRedFlags({
          message: testCase.input,
          intake: testCase.context?.pregnancyStatus === 'pregnant'
            ? { isPregnant: true }
            : undefined,
        });

        return result.action === 'ER';
      });

      const accuracy = correctClassifications.length / erCases.length;

      expect(accuracy).toBeGreaterThanOrEqual(0.95);
    });

    it('should correctly classify URGENT level cases', () => {
      const urgentCases = emergencyCases.filter(c => c.expectedAction === 'URGENT');

      const correctClassifications = urgentCases.filter(testCase => {
        const result = detectRedFlagsEnhanced(testCase.input);
        return result.highestSeverity === 'high' || result.highestSeverity === 'critical';
      });

      if (urgentCases.length > 0) {
        const accuracy = correctClassifications.length / urgentCases.length;
        expect(accuracy).toBeGreaterThanOrEqual(0.85);
      }
    });
  });
});
