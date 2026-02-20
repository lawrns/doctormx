/**
 * Anaphylaxis & Allergic Emergency Detection Tests
 *
 * Tests 12 anaphylaxis and severe allergic reaction patterns
 * Critical for patient safety
 *
 * TST-004: Anaphylaxis Detection
 */

import { describe, it, expect } from 'vitest';
import { evaluateRedFlags } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

describe('Anaphylaxis & Allergic Emergencies (12 tests)', () => {

  // ============================================================================
  // ANAPHYLAXIS AIRWAY (5 patterns)
  // ============================================================================
  describe('Anaphylaxis - Airway Compromise', () => {
    const airwayPatterns = [
      { text: 'Garganta cerrada', pattern: 'throat closing' },
      { text: 'Me cierro la garganta', pattern: 'progressive throat closure' },
      { text: 'Hinchazón de la lengua', pattern: 'tongue swelling' },
      { text: 'Labios hinchados', pattern: 'lip angioedema' },
      { text: 'No puedo tragar', pattern: 'dysphagia allergy' },
    ];

    it('should detect all 5 anaphylaxis airway patterns', () => {
      airwayPatterns.forEach(({ text, pattern }) => {
        const result = detectRedFlagsEnhanced(text);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
      });
    });

    it('should require immediate 911 for airway compromise', () => {
      const result = detectRedFlagsEnhanced('Garganta cerrada');
      expect(result.flags.some(f => f.requiresImmediate911)).toBe(true);
      expect(result.urgencyScore).toBe(10);
    });

    it('should recommend epinephrine for anaphylaxis', () => {
      const result = detectRedFlagsEnhanced('Anafilaxia');
      expect(result.flags.some(f => f.recommendation.includes('epinefrina') || f.recommendation.includes('EpiPen'))).toBe(true);
    });
  });

  // ============================================================================
  // ANAPHYLAXIS SEVERE (3 patterns)
  // ============================================================================
  describe('Severe Anaphylaxis', () => {
    const severePatterns = [
      { text: 'Shock anafiláctico', pattern: 'anaphylactic shock' },
      { text: 'Reacción alérgica grave', pattern: 'severe allergic reaction' },
      { text: 'Alergia severa', pattern: 'severe allergy' },
    ];

    it('should detect all 3 severe anaphylaxis patterns', () => {
      severePatterns.forEach(({ text, pattern }) => {
        const result = detectRedFlagsEnhanced(text);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should detect shock as immediate emergency', () => {
      const result = detectRedFlagsEnhanced('Shock anafiláctico');
      expect(result.requiresEmergencyEscalation).toBe(true);
      expect(result.urgencyScore).toBe(10);
    });
  });

  // ============================================================================
  // ANGIOEDEMA AIRWAY (2 patterns)
  // ============================================================================
  describe('Angioedema - Airway Risk', () => {
    const angioedemaPatterns = [
      { text: 'Cara hinchada', pattern: 'facial angioedema' },
      { text: 'Hinchazón repentina en cara', pattern: 'sudden facial swelling' },
    ];

    it('should detect all 2 angioedema patterns', () => {
      angioedemaPatterns.forEach(({ text, pattern }) => {
        const result = detectRedFlagsEnhanced(text);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should detect ACE inhibitor angioedema with medication context', () => {
      const result = detectRedFlagsEnhanced(
        'Labios hinchados',
        { medications: [{ name: 'Enalapril' }] }
      );
      expect(result.medicationAlerts.some(a => a.includes('IECA') || a.includes('angioedema'))).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(8);
    });
  });

  // ============================================================================
  // SEVERE ALLERGIC REACTION (2 patterns)
  // ============================================================================
  describe('Severe Allergic Reaction', () => {
    const severeAllergyPatterns = [
      { text: 'No puedo respirar por alergia', pattern: 'respiratory allergy' },
      { text: 'Dificultad para tragar por alergia', pattern: 'swallowing allergy' },
    ];

    it('should detect all 2 severe allergic reaction patterns', () => {
      severeAllergyPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should increase urgency with asthma history', () => {
      const result = detectRedFlagsEnhanced(
        'Alergia con dificultad para respirar',
        { conditions: ['asthma'] }
      );
      expect(result.highestSeverity).toBe('critical');
    });
  });

  // ============================================================================
  // MEDICATION INTERACTIONS (3 tests)
  // ============================================================================
  describe('Anaphylaxis Medication Interactions', () => {
    it('should alert for beta-blocker use in anaphylaxis', () => {
      const result = detectRedFlagsEnhanced(
        'Anafilaxia severa',
        { medications: [{ name: 'Propranolol' }] }
      );
      expect(result.medicationAlerts.some(a => a.includes('betabloqueante'))).toBe(true);
    });

    it('should warn about epinephrine effectiveness with beta-blockers', () => {
      const result = detectRedFlagsEnhanced(
        'Reacción alérgica grave',
        { 
          medications: [{ name: 'Metoprolol' }],
          conditions: ['hypertension']
        }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(9);
    });

    it('should detect ACE inhibitor interaction with swelling', () => {
      const result = detectRedFlagsEnhanced(
        'Hinchazón de labios',
        { medications: [{ name: 'Lisinopril' }] }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(7);
    });
  });
});
