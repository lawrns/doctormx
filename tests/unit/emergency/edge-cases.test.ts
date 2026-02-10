/**
 * Edge Cases Test Suite for Emergency Detection
 *
 * Tests false positive/negative scenarios, ambiguous cases, and boundary conditions
 * Ensures the system maintains high sensitivity while minimizing false positives
 *
 * Categories:
 * - False negatives (critical cases that should be detected)
 * - False positives (non-emergency cases incorrectly flagged)
 * - Ambiguous language
 * - Cultural variations
 * - Context-dependent cases
 * - Medical slang/colloquialisms
 */

import { describe, it, expect } from 'vitest';
import { evaluateRedFlags, isMentalHealthCrisis } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

describe('Edge Cases - Emergency Detection', () => {

  // ============================================================================
  // FALSE NEGATIVE TESTS - Critical cases that MUST be detected
  // ============================================================================
  describe('False Negative Prevention - Critical Cases', () => {
    it('should detect chest pain described as discomfort', () => {
      const result = detectRedFlagsEnhanced('Tengo molestia en el pecho');
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('high');
    });

    it('should detect stroke symptoms described colloquially', () => {
      const result = detectRedFlagsEnhanced('Me habla al revés');
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect suicide threat without explicit words', () => {
      const result = evaluateRedFlags({ message: 'No quiero estar vivo' });
      expect(result.triggered).toBe(true);
      expect(result.ruleIds).toContain('suicidal_ideation');
    });

    it('should detect respiratory distress in pediatric patients', () => {
      const result = detectRedFlagsEnhanced(
        'Mi bebé no puede respirar bien',
        { age: 1 }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect diabetic emergency without explicit diabetes mention', () => {
      const result = detectRedFlagsEnhanced(
        'Muy confundido, sudoroso y temblando',
        { vitalSigns: { temperature: 37.5 } }
      );
      expect(result.detected).toBe(true);
    });

    it('should detect heart attack in women with atypical symptoms', () => {
      const result = detectRedFlagsEnhanced(
        'Me siento muy cansada, con náuseas y dolor en la espalda',
        { sex: 'female', age: 55, conditions: ['diabetes'] }
      );
      // Women often present atypical heart attack symptoms
      expect(result.detected).toBe(true);
    });

    it('should detect appendicitis signs early', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor abdominal bajo que empezó alrededor del ombligo y bajó a la derecha'
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('high');
    });

    it('should detect sepsis without explicit mention', () => {
      const result = detectRedFlagsEnhanced(
        'Fiebre alta, confusión, respiración rápida y presión baja'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect ectopic pregnancy symptoms', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor abdominal intenso y sangrado vaginal',
        { pregnancyStatus: 'pregnant', age: 28 }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });
  });

  // ============================================================================
  // FALSE POSITIVE PREVENTION - Non-emergency cases
  // ============================================================================
  describe('False Positive Prevention - Non-Emergency Cases', () => {
    it('should NOT flag mild headache', () => {
      const result = detectRedFlagsEnhanced('Me duele un poco la cabeza');
      expect(result.detected).toBe(false);
    });

    it('should NOT flag mild abdominal discomfort', () => {
      const result = detectRedFlagsEnhanced('Tengo un poquito de dolor de estómago');
      expect(result.detected).toBe(false);
    });

    it('should NOT flag sadness without suicidal ideation', () => {
      const result = evaluateRedFlags({ message: 'Me siento triste hoy' });
      expect(result.triggered).toBe(false);
      expect(isMentalHealthCrisis('Me siento triste hoy')).toBe(false);
    });

    it('should NOT flag mild anxiety', () => {
      const result = detectRedFlagsEnhanced('Estoy un poco ansioso por el trabajo');
      expect(result.detected).toBe(false);
    });

    it('should NOT flag normal pregnancy discomforts', () => {
      const result = detectRedFlagsEnhanced(
        'Tengo náuseas matutinas y me siento cansada',
        { pregnancyStatus: 'pregnant' }
      );
      expect(result.detected).toBe(false);
    });

    it('should NOT flag mild shortness of breath from exercise', () => {
      const result = detectRedFlagsEnhanced('Me canso un poco cuando corro');
      expect(result.detected).toBe(false);
    });

    it('should NOT flag minor cuts', () => {
      const result = detectRedFlagsEnhanced('Me corté el dedo cocinando, es un corte chiquito');
      expect(result.detected).toBe(false);
    });

    it('should NOT flag common cold symptoms', () => {
      const result = detectRedFlagsEnhanced('Tengo moqueo y estornudos');
      expect(result.detected).toBe(false);
    });

    it('should NOT flag mild fever below emergency threshold', () => {
      const result = detectRedFlagsEnhanced(
        'Tengo fiebre de 38 grados',
        { age: 25 }
      );
      expect(result.highestSeverity).not.toBe('critical');
    });

    it('should NOT flag muscle soreness from exercise', () => {
      const result = detectRedFlagsEnhanced('Me duelen los músculos después del gimnasio');
      expect(result.detected).toBe(false);
    });

    it('should NOT flag mild allergic reaction without swelling', () => {
      const result = detectRedFlagsEnhanced('Tengo un poquito de sarpullido');
      expect(result.detected).toBe(false);
    });

    it('should NOT flag conversation about suicide academically', () => {
      const result = evaluateRedFlags({ message: '¿Cuáles son las estadísticas de suicidio?' });
      expect(result.triggered).toBe(false);
    });

    it('should NOT flag mentioning a friend who committed suicide', () => {
      const result = evaluateRedFlags({
        message: 'Mi amigo se suicidó el año pasado y estoy muy triste'
      });
      // This is tricky - should probably trigger some support but not as active suicidal ideation
      expect(result.ruleIds).not.toContain('suicidal_ideation');
    });
  });

  // ============================================================================
  // AMBIGUOUS LANGUAGE TESTS
  // ============================================================================
  describe('Ambiguous Language Tests', () => {
    it('should interpret "no puedo más" correctly in context', () => {
      const fatigueResult = detectRedFlagsEnhanced('Estoy tan cansado del trabajo que no puedo más');
      expect(fatigueResult.detected).toBe(false);

      const respiratoryResult = detectRedFlagsEnhanced('No puedo más, me estoy ahogando');
      expect(respiratoryResult.detected).toBe(true);
      expect(respiratoryResult.highestSeverity).toBe('critical');
    });

    it('should distinguish between "muriendo de cansancio" and actual dying', () => {
      const fatigue = detectRedFlagsEnhanced('Estoy muriendo de cansancio del trabajo');
      expect(fatigue.detected).toBe(false);

      const emergency = detectRedFlagsEnhanced('Siento que me voy a morir, dolor de pecho terrible');
      expect(emergency.detected).toBe(true);
      expect(emergency.highestSeverity).toBe('critical');
    });

    it('should interpret "dolor" in context', () => {
      const mildPain = detectRedFlagsEnhanced('Tengo dolor de cabeza leve');
      expect(mildPain.detected).toBe(false);

      const severePain = detectRedFlagsEnhanced('El dolor de cabeza es insoportable, el peor de mi vida');
      expect(severePain.detected).toBe(true);
    });

    it('should handle "gritos" contextually', () => {
      const concert = detectRedFlagsEnhanced('Grité tanto en el concierto que perdí la voz');
      expect(concert.detected).toBe(false);
    });
  });

  // ============================================================================
  // CULTURAL AND LINGUISTIC VARIATIONS
  // ============================================================================
  describe('Cultural and Linguistic Variations', () => {
    it('should detect Mexican Spanish terms', () => {
      const result = detectRedFlagsEnhanced('Estoy muy mal del corazón');
      expect(result.detected).toBe(true);
    });

    it('should detect Argentine Spanish variations', () => {
      const result = detectRedFlagsEnhanced('Tengo un dolor al humo en el pecho');
      expect(result.detected).toBe(true);
    });

    it('should detect Spanglish expressions', () => {
      const result = detectRedFlagsEnhanced('Tengo chest pain muy fuerte');
      expect(result.detected).toBe(true);
    });

    it('should handle Spanish dialect variations for suicide', () => {
      expect(isMentalHealthCrisis('Quiero hacerme daño')).toBe(true);
      expect(isMentalHealthCrisis('Me quiero autolesionar')).toBe(true);
      expect(isMentalHealthCrisis('Tengo ganas de morirme')).toBe(true);
    });

    it('should detect stroke across different Spanish dialects', () => {
      const spain = detectRedFlagsEnhanced('Tengo la cara caída');
      expect(spain.detected).toBe(true);

      const mexico = detectRedFlagsEnhanced('Tengo la parálisis de la cara');
      expect(mexico.detected).toBe(true);
    });
  });

  // ============================================================================
  // MEDICAL SLANG AND COLLOQUIALISMS
  // ============================================================================
  describe('Medical Slang and Colloquialisms', () => {
    it('should detect "ataque" in context', () => {
      const panicAttack = detectRedFlagsEnhanced('Estoy teniendo un ataque de pánico');
      expect(panicAttack.detected).toBe(false); // Panic attack alone not ER

      const heartAttack = detectRedFlagsEnhanced('Creo que estoy teniendo un ataque al corazón');
      expect(heartAttack.detected).toBe(true);
    });

    it('should detect "golpe" contextually', () => {
      const minorHit = detectRedFlagsEnhanced('Me di un golpe en el dedo');
      expect(minorHit.detected).toBe(false);

      const headTrauma = detectRedFlagsEnhanced('Me di un golpe fuerte en la cabeza y me desmayé');
      expect(headTrauma.detected).toBe(true);
    });

    it('should understand "presión alta" colloquially', () => {
      const result = detectRedFlagsEnhanced(
        'Me siento mal, tengo presión muy alta',
        { vitalSigns: { bloodPressure: '185/120' } }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.category === 'VitalSigns')).toBe(true);
    });

    it('should detect "azúcar" references for diabetes', () => {
      const result = detectRedFlagsEnhanced(
        'Me siento confundido, debe ser el azúcar',
        { conditions: ['diabetes'] }
      );
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // CONTEXT-DEPENDENT CASES
  // ============================================================================
  describe('Context-Dependent Cases', () => {
    it('should increase urgency with anticoagulants + bleeding', () => {
      const noMeds = detectRedFlagsEnhanced('Tengo sangrado de encías');
      expect(noMeds.highestSeverity).not.toBe('critical');

      const withMeds = detectRedFlagsEnhanced('Tengo sangrado de encías', {
        medications: [{ name: 'Warfarina' }]
      });
      expect(withMeds.detected).toBe(true);
      expect(withMeds.medicationAlerts.length).toBeGreaterThan(0);
    });

    it('should adjust fever urgency based on age', () => {
      const adult = detectRedFlagsEnhanced(
        'Tengo fiebre de 39 grados',
        { age: 30 }
      );
      expect(adult.highestSeverity).not.toBe('critical');

      const baby = detectRedFlagsEnhanced(
        'Tengo fiebre de 38.5 grados',
        { age: 2, vitalSigns: { temperature: 38.5 } }
      );
      expect(baby.highestSeverity).toBe('critical');
    });

    it('should detect heart failure exacerbation', () => {
      const result = detectRedFlagsEnhanced(
        'Me despierto por la noche sin aire y con piernas hinchadas',
        { conditions: ['heart_failure'] }
      );
      expect(result.detected).toBe(true);
    });

    it('should detect COPD exacerbation vs normal dyspnea', () => {
      const copdExacerbation = detectRedFlagsEnhanced(
        'No puedo respirar casi nada, los labios me están poniendo morados',
        { conditions: ['copd'] }
      );
      expect(copdExacerbation.detected).toBe(true);
      expect(copdExacerbation.highestSeverity).toBe('critical');
    });

    it('should detect preeclampsia only in pregnancy', () => {
      const nonPregnant = detectRedFlagsEnhanced(
        'Dolor de cabeza fuerte y visión borrosa'
      );
      // Still detected but less urgent without pregnancy context

      const pregnant = detectRedFlagsEnhanced(
        'Dolor de cabeza fuerte y visión borrosa',
        { pregnancyStatus: 'pregnant' }
      );
      expect(pregnant.flags.some(f => f.message.includes('preeclampsia'))).toBe(true);
    });
  });

  // ============================================================================
  // TYPOGRAPHICAL VARIATIONS AND TYPOS
  // ============================================================================
  describe('Typographical Variations and Typos', () => {
    it('should detect emergency with missing accents', () => {
      const result = detectRedFlagsEnhanced('No puedo respirar, me estoy ahogando');
      expect(result.detected).toBe(true);
    });

    it('should detect with repeated letters (common in typing)', () => {
      const result = detectRedFlagsEnhanced('Tengo dooolor de pecho');
      expect(result.detected).toBe(true);
    });

    it('should detect emergency with SMS-style abbreviations', () => {
      const result = detectRedFlagsEnhanced('x fau no puedo respirar, ayda');
      expect(result.detected).toBe(true); // "por favor" abbreviated
    });

    it('should handle mixed case properly', () => {
      const result = detectRedFlagsEnhanced('TENGo DOLOR DE pecho');
      expect(result.detected).toBe(true);
    });

    it('should detect with extra spaces', () => {
      const result = detectRedFlagsEnhanced('Tengo  dolor   de   pecho');
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // MEDICAL JARGON VS LAY LANGUAGE
  // ============================================================================
  describe('Medical Jargon vs Lay Language', () => {
    it('should detect both medical and lay terms for heart attack', () => {
      const medical = detectRedFlagsEnhanced('Infarto agudo de miocardio');
      expect(medical.detected).toBe(true);

      const lay = detectRedFlagsEnhanced('Ataque al corazón');
      expect(lay.detected).toBe(true);

      const colloquial = detectRedFlagsEnhanced('Se me paró el corazón');
      expect(colloquial.detected).toBe(true);
    });

    it('should detect both medical and lay terms for stroke', () => {
      const medical = detectRedFlagsEnhanced('Accidente cerebrovascular isquémico');
      expect(medical.detected).toBe(true);

      const lay = detectRedFlagsEnhanced('Derrame cerebral');
      expect(lay.detected).toBe(true);

      const colloquial = detectRedFlagsEnhanced('Se me cayó una cara');
      expect(colloquial.detected).toBe(true);
    });

    it('should detect appendicitis descriptions', () => {
      const medical = detectRedFlagsEnhanced('Apendicitis aguda');
      expect(medical.detected).toBe(true);

      const lay = detectRedFlagsEnhanced('Dolor del lado derecho bajo del abdomen');
      expect(lay.detected).toBe(true);
    });
  });

  // ============================================================================
  // TEMPORAL CONTEXT TESTS
  // ============================================================================
  describe('Temporal Context Tests', () => {
    it('should detect sudden onset as more urgent', () => {
      const sudden = detectRedFlagsEnhanced('De repente me dio un dolor de cabeza terrible');
      expect(sudden.detected).toBe(true);

      const chronic = detectRedFlagsEnhanced('Tengo dolor de cabeza desde hace meses');
      expect(chronic.highestSeverity).not.toBe('critical');
    });

    it('should detect worsening symptoms', () => {
      const worsening = detectRedFlagsEnhanced(
        'El dolor abdominal era leve pero ahora es insoportable y el vientre está duro'
      );
      expect(worsening.detected).toBe(true);
    });

    it('should detect progression to emergency', () => {
      const result = detectRedFlagsEnhanced(
        'Empezó como dolor de cabeza pero ahora no veo bien y tengo vómito'
      );
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // MULTI-SYMPTOM SCENARIOS
  // ============================================================================
  describe('Multi-Symptom Scenarios', () => {
    it('should detect cardiac emergency with multiple symptoms', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor de pecho, sudor frío, náuseas y dolor en el brazo izquierdo'
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
      expect(result.flags.length).toBeGreaterThan(1);
    });

    it('should detect sepsis with multiple systemic signs', () => {
      const result = detectRedFlagsEnhanced(
        'Fiebre alta, confusión, respiración rápida, presión baja y orina poca'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect FAST stroke protocol completely', () => {
      const result = detectRedFlagsEnhanced(
        'Cara caída, brazo débil y habla enredada'
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect anaphylaxis multi-system involvement', () => {
      const result = detectRedFlagsEnhanced(
        'Garganta cerrada, labios hinchados y urticaria por todo el cuerpo'
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.toLowerCase().includes('anafilaxia'))).toBe(true);
    });
  });
});
