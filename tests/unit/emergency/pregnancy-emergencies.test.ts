/**
 * Pregnancy Emergency Detection Tests
 *
 * Tests 12 obstetric emergency patterns
 * Critical for maternal and fetal safety
 *
 * TST-004: Pregnancy Emergency Detection
 */

import { describe, it, expect } from 'vitest';
import { evaluateRedFlags } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

describe('Pregnancy Emergencies (12 tests)', () => {

  // ============================================================================
  // PREGNANCY BLEEDING 3RD TRIMESTER (3 patterns)
  // ============================================================================
  describe('Third Trimester Bleeding', () => {
    const thirdTrimesterPatterns = [
      { text: 'Embarazada y sangrando', pattern: 'bleeding pregnant' },
      { text: 'Sangrado durante el embarazo', pattern: 'bleeding during pregnancy' },
      { text: 'Sangrado vaginal estando embarazada', pattern: 'vaginal bleeding pregnant' },
    ];

    it('should detect all 3 third trimester bleeding patterns', () => {
      thirdTrimesterPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({
          message: text,
          intake: { isPregnant: true }
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should detect with pregnancy context', () => {
      const result = detectRedFlagsEnhanced(
        'Tengo sangrado',
        { pregnancyStatus: 'pregnant' }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });
  });

  // ============================================================================
  // PREGNANCY BLEEDING HEAVY (2 patterns)
  // ============================================================================
  describe('Heavy Pregnancy Bleeding', () => {
    const heavyBleedingPatterns = [
      { text: 'Sangrado uterino', pattern: 'uterine bleeding' },
      { text: 'Sangrado mucho estando embarazada', pattern: 'heavy bleed pregnancy' },
    ];

    it('should detect all 2 heavy pregnancy bleeding patterns', () => {
      heavyBleedingPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({
          message: text,
          intake: { isPregnant: true }
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should require emergency escalation for heavy bleeding', () => {
      const result = detectRedFlagsEnhanced(
        'Sangrado mucho',
        { pregnancyStatus: 'pregnant' }
      );
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // PRE-ECLAMPSIA SEVERE (3 patterns)
  // ============================================================================
  describe('Severe Pre-eclampsia', () => {
    const preeclampsiaPatterns = [
      { text: 'Dolor de cabeza intenso estando embarazada', pattern: 'headache pregnant' },
      { text: 'Visión borrosa en embarazo', pattern: 'blurred vision pregnancy' },
      { text: 'Hinchazón en cara y manos embarazada', pattern: 'edema pregnancy' },
    ];

    it('should detect all 3 severe pre-eclampsia patterns', () => {
      preeclampsiaPatterns.forEach(({ text, pattern }) => {
        const result = detectRedFlagsEnhanced(text, { pregnancyStatus: 'pregnant' });
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should detect preeclampsia with vital signs', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor de cabeza intenso',
        { 
          pregnancyStatus: 'pregnant',
          vitalSigns: { bloodPressure: '165/115' }
        }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.category === 'VitalSigns' || f.message.includes('hipertensiva'))).toBe(true);
    });
  });

  // ============================================================================
  // PLACENTAL ABRUPTION (2 patterns)
  // ============================================================================
  describe('Placental Abruption', () => {
    const abruptionPatterns = [
      { text: 'Desprendimiento de placenta', pattern: 'placental abruption' },
      { text: 'Dolor abdominal intenso estando embarazada', pattern: 'abdominal pain pregnant' },
    ];

    it('should detect all 2 placental abruption patterns', () => {
      abruptionPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({
          message: text,
          intake: { isPregnant: true }
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should require immediate escalation for suspected abruption', () => {
      const result = detectRedFlagsEnhanced(
        'Desprendimiento de placenta',
        { pregnancyStatus: 'pregnant' }
      );
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // ECTOPIC PREGNANCY (2 patterns)
  // ============================================================================
  describe('Ectopic Pregnancy', () => {
    const ectopicPatterns = [
      { text: 'Embarazo ectópico', pattern: 'ectopic pregnancy' },
      { text: 'Dolor abdominal intenso estando embarazada', pattern: 'abdominal pain pregnancy' },
    ];

    it('should detect all 2 ectopic pregnancy patterns', () => {
      ectopicPatterns.forEach(({ text, pattern }) => {
        const result = evaluateRedFlags({
          message: text,
          intake: { isPregnant: true }
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });
  });

  // ============================================================================
  // PREGNANCY COMPLICATIONS GENERAL (3 patterns)
  // ============================================================================
  describe('General Pregnancy Complications', () => {
    it('should detect decreased fetal movement', () => {
      const result = evaluateRedFlags({
        message: 'No siento movimientos del bebé',
        intake: { isPregnant: true }
      });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });

    it('should detect fluid leakage', () => {
      const result = evaluateRedFlags({
        message: 'Pierdo líquido',
        intake: { isPregnant: true }
      });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });

    it('should detect preterm labor signs', () => {
      const result = evaluateRedFlags({
        message: 'Contracciones antes de tiempo',
        intake: { isPregnant: true }
      });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });
  });

  // ============================================================================
  // CONDITION-SPECIFIC RISKS (3 tests)
  // ============================================================================
  describe('Pregnancy Risk Factors', () => {
    it('should increase urgency with hypertension history', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor de cabeza intenso',
        { 
          pregnancyStatus: 'pregnant',
          conditions: ['chronic_hypertension']
        }
      );
      expect(result.urgencyScore).toBeGreaterThanOrEqual(8);
    });

    it('should flag high-risk with diabetes and pregnancy', () => {
      const result = detectRedFlagsEnhanced(
        'No siento movimientos del bebé',
        { 
          pregnancyStatus: 'pregnant',
          conditions: ['diabetes']
        }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(8);
    });

    it('should detect preeclampsia with edema and hypertension', () => {
      const result = detectRedFlagsEnhanced(
        'Hinchazón en cara y manos',
        { 
          pregnancyStatus: 'pregnant',
          vitalSigns: { bloodPressure: '160/110' }
        }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });
  });
});
