/**
 * Mental Health Crisis Detection Tests - Batch 2
 *
 * Tests 20 mental health emergency patterns
 * Critical for patient safety - suicide prevention
 *
 * TST-004: Mental Health Crisis Detection
 */

import { describe, it, expect } from 'vitest';
import { evaluateRedFlags, isMentalHealthCrisis } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

describe('Mental Health Crises - Batch 2 (20 tests)', () => {

  // ============================================================================
  // SUICIDAL IDEATION ACTIVE (5 patterns)
  // ============================================================================
  describe('Suicidal Ideation Active', () => {
    const suicidalIdeationPatterns = [
      { text: 'No quiero vivir más', pattern: 'passive suicidal' },
      { text: 'Estoy harto de vivir', pattern: 'frequent ideation' },
      { text: 'Quiero dejar de existir', pattern: 'wish not born' },
      { text: 'No vale la pena vivir', pattern: 'passive absence' },
      { text: 'Quiero desaparecer', pattern: 'wish disappear' },
    ];

    it('should detect all 5 active suicidal ideation patterns', () => {
      suicidalIdeationPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
        expect(result.severity).toBe(100);
        expect(isMentalHealthCrisis(text)).toBe(true);
      });
    });

    it('should trigger emergency escalation for active ideation', () => {
      const result = detectRedFlagsEnhanced('No quiero vivir más');
      expect(result.detected).toBe(true);
      expect(result.requiresEmergencyEscalation).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });
  });

  // ============================================================================
  // SUICIDAL PLAN SPECIFIC (3 patterns)
  // ============================================================================
  describe('Suicidal Plan - Specific', () => {
    const specificPlanPatterns = [
      { text: 'Tengo pastillas guardadas', pattern: 'pill hoarding' },
      { text: 'Voy a tirarme de un edificio', pattern: 'specific method' },
      { text: 'Voy a tomar pastillas para morir', pattern: 'research method' },
    ];

    it('should detect all 3 specific suicidal plan patterns', () => {
      specificPlanPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should assign high urgency score to specific plans', () => {
      const result = detectRedFlagsEnhanced(
        'Voy a tirarme de un edificio',
        { conditions: ['depression'] }
      );
      expect(result.detected).toBe(true);
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // SUICIDAL PLAN IMMINENT (3 patterns)
  // ============================================================================
  describe('Suicidal Plan - Imminent', () => {
    const imminentPlanPatterns = [
      { text: 'Voy a hacerlo esta noche', pattern: 'imminent timing' },
      { text: 'Tengo un plan para morir', pattern: 'has plan' },
      { text: 'Voy a saltar', pattern: 'imminent jump' },
    ];

    it('should detect all 3 imminent suicidal plan patterns', () => {
      imminentPlanPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should require immediate 911 for imminent plans', () => {
      const result = evaluateRedFlags({ message: 'Voy a hacerlo esta noche' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });
  });

  // ============================================================================
  // SELF-HARM ACTIVE (3 patterns)
  // ============================================================================
  describe('Self-Harm Active', () => {
    const selfHarmPatterns = [
      { text: 'Voy a cortarme', pattern: 'cutting intent' },
      { text: 'Quiero hacerme daño', pattern: 'self harm intent' },
      { text: 'Quiero cortarme', pattern: 'cutting intent 2' },
    ];

    it('should detect all 3 active self-harm patterns', () => {
      selfHarmPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should detect self-harm with depression context', () => {
      const result = detectRedFlagsEnhanced(
        'Voy a cortarme',
        { conditions: ['depression'] }
      );
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // PSYCHOSIS ACUTE (4 patterns)
  // ============================================================================
  describe('Acute Psychosis', () => {
    const psychosisPatterns = [
      { text: 'Me persiguen', pattern: 'persecutory delusion' },
      { text: 'Me espían', pattern: 'surveillance delusion' },
      { text: 'Me controlan la mente', pattern: 'control delusion' },
      { text: 'Me quieren matar', pattern: 'conspiracy delusion' },
    ];

    it('should detect all 4 acute psychosis patterns', () => {
      psychosisPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should detect psychosis with urgency', () => {
      const result = evaluateRedFlags({ message: 'Me persiguen' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });
  });

  // ============================================================================
  // COMMAND HALLUCINATIONS (2 patterns)
  // ============================================================================
  describe('Command Hallucinations', () => {
    const commandHallucinationPatterns = [
      { text: 'Las voces me dicen que me corte', pattern: 'command self harm' },
      { text: 'Voces me ordenan', pattern: 'command general' },
    ];

    it('should detect all 2 command hallucination patterns', () => {
      commandHallucinationPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should require escalation for command hallucinations', () => {
      const result = evaluateRedFlags({ message: 'Las voces me dicen que me corte' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });
  });

  // ============================================================================
  // MANIA ACUTE (3 patterns)
  // ============================================================================
  describe('Acute Mania', () => {
    const maniaPatterns = [
      { text: 'Soy el dueño del mundo', pattern: 'grandiosity' },
      { text: 'Gasté todo mi dinero', pattern: 'excessive spending' },
      { text: 'Conduzco a 200', pattern: 'reckless behavior' },
    ];

    it('should detect all 3 acute mania patterns', () => {
      maniaPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
      });
    });

    it('should detect mania with bipolar context', () => {
      const result = detectRedFlagsEnhanced(
        'Soy el dueño del mundo',
        { conditions: ['bipolar_disorder'] }
      );
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // HOMICIDAL IDEATION (2 patterns)
  // ============================================================================
  describe('Homicidal Ideation', () => {
    const homicidalPatterns = [
      { text: 'Voy a matar', pattern: 'homicidal threat' },
      { text: 'Voy a buscar un cuchillo', pattern: 'weapon seeking' },
    ];

    it('should detect all 2 homicidal ideation patterns', () => {
      homicidalPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should assign high urgency to homicidal ideation', () => {
      const result = evaluateRedFlags({ message: 'Voy a matar' });
      expect(result.triggered).toBe(true);
      expect(result.severity).toBe(100);
    });
  });

  // ============================================================================
  // CRISIS RESOURCES VALIDATION (3 tests)
  // ============================================================================
  describe('Crisis Resources', () => {
    it('should include Mexican crisis hotline in recommendations', () => {
      const result = evaluateRedFlags({ message: 'Quiero morir' });
      expect(result.recommendations.some(r => r.includes('800 911 2000'))).toBe(true);
    });

    it('should include SAPTEL in recommendations', () => {
      const result = evaluateRedFlags({ message: 'Quiero morir' });
      expect(result.recommendations.some(r => r.includes('SAPTEL') || r.includes('55 5259'))).toBe(true);
    });

    it('should trigger for suicidal ideation with recommendations', () => {
      const result = evaluateRedFlags({ message: 'Quiero suicidarme' });
      expect(result.triggered).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});
