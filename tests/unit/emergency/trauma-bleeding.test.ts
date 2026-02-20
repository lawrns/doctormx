/**
 * Trauma & Bleeding Emergency Detection Tests
 *
 * Tests 15 trauma and severe bleeding emergency patterns
 * Critical for patient safety
 *
 * TST-004: Trauma & Bleeding Detection
 */

import { describe, it, expect } from 'vitest';
import { evaluateRedFlags } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

describe('Trauma & Bleeding Emergencies (15 tests)', () => {

  // ============================================================================
  // HEAD INJURY SEVERE (4 patterns)
  // ============================================================================
  describe('Severe Head Injury', () => {
    const headInjuryPatterns = [
      { text: 'Me desmayé después de golpearme la cabeza', pattern: 'LOC with trauma' },
      { text: 'Perdí el conocimiento tras caída y golpe en cráneo', pattern: 'TBI with amnesia' },
      { text: 'Golpe fuerte en la cabeza con desmayo', pattern: 'concussion with LOC' },
      { text: 'Me caí y golpeé fuerte la cabeza, no recuerdo nada', pattern: 'TBI with memory loss' },
    ];

    it('should detect all 4 severe head injury patterns', () => {
      headInjuryPatterns.forEach(({ text, pattern }) => {
        const result = detectRedFlagsEnhanced(text);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should increase urgency with anticoagulant use', () => {
      const result = detectRedFlagsEnhanced(
        'Me golpeé la cabeza en una caída',
        { medications: [{ name: 'Warfarina' }] }
      );
      expect(result.detected).toBe(true);
      expect(result.medicationAlerts.some(a => a.includes('anticoagulación'))).toBe(true);
    });

    it('should require emergency escalation for loss of consciousness', () => {
      const result = detectRedFlagsEnhanced('Me desmayé después del golpe');
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // SEVERE BLEEDING UNCONTROLLED (4 patterns)
  // ============================================================================
  describe('Severe Uncontrolled Bleeding', () => {
    const bleedingPatterns = [
      { text: 'Sangrado que no para', pattern: 'uncontrolled bleed' },
      { text: 'Hemorragia abundante', pattern: 'massive hemorrhage' },
      { text: 'Me estoy desangrando', pattern: 'active severe bleeding' },
      { text: 'Sangre a chorros', pattern: 'arterial bleeding' },
    ];

    it('should detect all 4 severe uncontrolled bleeding patterns', () => {
      bleedingPatterns.forEach(({ text, pattern }) => {
        const result = detectRedFlagsEnhanced(text);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should increase urgency for anticoagulated patients', () => {
      const result = detectRedFlagsEnhanced(
        'Sangrado que no para',
        { medications: [{ name: 'Acenocumarol' }] }
      );
      expect(result.urgencyScore).toBeGreaterThanOrEqual(8);
    });

    it('should require immediate escalation for severe bleeding', () => {
      const result = detectRedFlagsEnhanced('Hemorragia abundante');
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // INTERNAL BLEEDING SIGNS (3 patterns)
  // ============================================================================
  describe('Internal Bleeding Signs', () => {
    const internalBleedingPatterns = [
      { text: 'Vomito sangre', pattern: 'hematemesis' },
      { text: 'Sangre en orina', pattern: 'hematuria' },
      { text: 'Sangrado rectal', pattern: 'GI bleed' },
    ];

    it('should detect all 3 internal bleeding signs', () => {
      internalBleedingPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({ message: text });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should detect hematemesis as immediate emergency', () => {
      const result = detectRedFlagsEnhanced('Vomito sangre');
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // TRAUMATIC AMPUTATION (2 patterns)
  // ============================================================================
  describe('Traumatic Amputation', () => {
    const amputationPatterns = [
      { text: 'Perdí el dedo en el trabajo', pattern: 'digit amputation' },
      { text: 'Corte completo de la mano', pattern: 'limb amputation' },
    ];

    it('should detect traumatic amputation with bleeding context', () => {
      amputationPatterns.forEach(({ text, pattern }) => {
        const result = detectRedFlagsEnhanced(`${text} y sangra mucho`);
        expect(result.detected).toBe(true);
      });
    });

    it('should assign maximum urgency to amputations with severe bleeding', () => {
      const result = detectRedFlagsEnhanced('Pierna cortada y sangra mucho');
      expect(result.urgencyScore).toBe(10);
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // CRUSH INJURY MASSIVE (2 patterns)
  // ============================================================================
  describe('Massive Crush Injury', () => {
    it('should detect crush injury with compartment syndrome signs', () => {
      const result = detectRedFlagsEnhanced(
        'Pierna atrapada mucho tiempo, hinchada y sin sensación'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect crush injury with kidney failure risk', () => {
      const result = detectRedFlagsEnhanced(
        'Brazo aplastado y hinchado',
        { conditions: ['chronic_kidney_disease'] }
      );
      expect(result.conditionContext.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // MEDICATION ALERTS FOR BLEEDING (3 tests)
  // ============================================================================
  describe('Medication Interactions with Bleeding', () => {
    it('should alert for warfarin + bleeding', () => {
      const result = detectRedFlagsEnhanced(
        'Sangrado abundante',
        { medications: [{ name: 'Warfarina' }] }
      );
      expect(result.medicationAlerts.some(a => a.includes('anticoagulación'))).toBe(true);
    });

    it('should alert for clopidogrel + head trauma', () => {
      const result = detectRedFlagsEnhanced(
        'Me golpeé la cabeza',
        { medications: [{ name: 'Clopidogrel' }] }
      );
      expect(result.detected).toBe(true);
    });

    it('should increase urgency for anticoagulant + any bleeding', () => {
      const result = detectRedFlagsEnhanced(
        'Sangrado nasal',
        { medications: [{ name: 'Aspirina' }] }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(6);
    });
  });
});
