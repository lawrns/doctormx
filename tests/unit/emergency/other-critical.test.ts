/**
 * Other Critical Emergency Detection Tests
 *
 * Tests 57 additional critical emergency patterns
 * Covers diabetic emergencies, sepsis, burns, fractures, environmental emergencies
 *
 * TST-004: Other Critical Emergency Detection
 */

import { describe, it, expect } from 'vitest';
import { evaluateRedFlags } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

describe('Other Critical Emergencies (57 tests)', () => {

  // ============================================================================
  // DIABETIC EMERGENCIES - DKA (5 patterns)
  // ============================================================================
  describe('Diabetic Ketoacidosis (DKA)', () => {
    it('should detect DKA with fruity breath', () => {
      const result = detectRedFlagsEnhanced(
        'Diabetes tipo 1 con aliento huele raro',
        { conditions: ['diabetes'] }
      );
      expect(result.detected).toBe(true);
    });

    it('should detect DKA with polyuria', () => {
      const result = detectRedFlagsEnhanced(
        'Orino mucho con diabetes',
        { conditions: ['diabetes'] }
      );
      expect(result.detected).toBe(true);
    });

    it('should detect DKA with confusion', () => {
      const result = detectRedFlagsEnhanced(
        'Confusión con diabetes tipo 1',
        { conditions: ['diabetes'] }
      );
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect DKA with vomiting', () => {
      const result = detectRedFlagsEnhanced(
        'Vómitos con diabetes',
        { conditions: ['diabetes'] }
      );
      expect(result.detected).toBe(true);
    });

    it('should assign high urgency to DKA', () => {
      const result = detectRedFlagsEnhanced(
        'Diabético con respiración profunda',
        { conditions: ['type_1_diabetes'] }
      );
      expect(result.urgencyScore).toBeGreaterThanOrEqual(7);
    });
  });

  // ============================================================================
  // DIABETIC EMERGENCIES - SEVERE HYPOGLYCEMIA (4 patterns)
  // ============================================================================
  describe('Severe Hypoglycemia', () => {
    it('should detect severe hypoglycemia with confusion', () => {
      const result = detectRedFlagsEnhanced(
        'Azúcar baja con confusión',
        { conditions: ['diabetes'] }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect hypoglycemia with sweating', () => {
      const result = detectRedFlagsEnhanced(
        'Sudoración con azúcar baja',
        { conditions: ['diabetes'] }
      );
      expect(result.detected).toBe(true);
    });

    it('should detect hypoglycemia with tremor', () => {
      const result = detectRedFlagsEnhanced(
        'Temblor con glucosa baja',
        { conditions: ['diabetes'] }
      );
      expect(result.detected).toBe(true);
    });

    it('should require immediate escalation for severe hypoglycemia', () => {
      const result = detectRedFlagsEnhanced(
        'Azúcar baja desmayado',
        { conditions: ['diabetes'] }
      );
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // RENAL FAILURE ACUTE (3 patterns)
  // ============================================================================
  describe('Acute Renal Failure', () => {
    it('should detect decreased urine output', () => {
      const result = detectRedFlagsEnhanced(
        'Orino muy poco',
        { conditions: ['chronic_kidney_disease'] }
      );
      expect(result.detected).toBe(true);
    });

    it('should detect anuria', () => {
      const result = detectRedFlagsEnhanced(
        'No orino',
        { conditions: ['chronic_kidney_disease'] }
      );
      expect(result.urgencyScore).toBeGreaterThanOrEqual(7);
    });

    it('should detect edema with kidney disease', () => {
      const result = detectRedFlagsEnhanced(
        'Hinchazón con insuficiencia renal',
        { conditions: ['chronic_kidney_disease'] }
      );
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // SEPSIS (5 patterns)
  // ============================================================================
  describe('Sepsis', () => {
    it('should detect sepsis with fever and confusion', () => {
      const result = detectRedFlagsEnhanced(
        'Fiebre alta con confusión'
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect severe infection signs', () => {
      const result = detectRedFlagsEnhanced(
        'Infección con escalofríos'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect herida infectada', () => {
      const result = detectRedFlagsEnhanced(
        'Herida tiene pus'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect celulitis', () => {
      const result = detectRedFlagsEnhanced(
        'Celulitis'
      );
      expect(result.detected).toBe(true);
    });

    it('should increase urgency with immunocompromised status', () => {
      const result = detectRedFlagsEnhanced(
        'Fiebre alta',
        { conditions: ['immunocompromised'] }
      );
      expect(result.urgencyScore).toBeGreaterThanOrEqual(8);
    });
  });

  // ============================================================================
  // HEAT STROKE (3 patterns)
  // ============================================================================
  describe('Heat Stroke', () => {
    it('should detect heat stroke with high temperature', () => {
      const result = detectRedFlagsEnhanced(
        'Temperatura muy alta',
        { vitalSigns: { temperature: 41 } }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect hyperthermia', () => {
      const result = detectRedFlagsEnhanced(
        'Hipertermia',
        { vitalSigns: { temperature: 40.5 } }
      );
      expect(result.flags.some(f => f.message.includes('Hipertermia'))).toBe(true);
    });

    it('should require emergency escalation for heat stroke', () => {
      const result = detectRedFlagsEnhanced(
        'Fiebre 41',
        { vitalSigns: { temperature: 41 } }
      );
      expect(result.highestSeverity).toBe('critical');
    });
  });

  // ============================================================================
  // HYPOTHERMIA SEVERE (3 patterns)
  // ============================================================================
  describe('Severe Hypothermia', () => {
    it('should detect severe hypothermia signs', () => {
      const result = detectRedFlagsEnhanced(
        'Persona inconsciente fría'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect hypothermia with confusion', () => {
      const result = detectRedFlagsEnhanced(
        'Confusión con temperatura baja'
      );
      expect(result.detected).toBe(true);
    });

    it('should flag hypothermia as high severity', () => {
      const result = detectRedFlagsEnhanced(
        'Inconsciente y frío'
      );
      expect(result.highestSeverity).toBe('critical');
    });
  });

  // ============================================================================
  // ELECTRICAL BURNS (3 patterns)
  // ============================================================================
  describe('Electrical Burns', () => {
    it('should detect electrocution', () => {
      const result = evaluateRedFlags({ message: 'Susto eléctrico' });
      expect(result.triggered).toBe(true);
    });

    it('should detect high voltage injury', () => {
      const result = evaluateRedFlags({ message: 'Alto voltaje' });
      expect(result.triggered).toBe(true);
    });

    it('should assign maximum urgency to electrical injuries', () => {
      const result = detectRedFlagsEnhanced('Electrocución');
      expect(result.urgencyScore).toBeGreaterThanOrEqual(8);
    });
  });

  // ============================================================================
  // CHEMICAL BURNS (3 patterns)
  // ============================================================================
  describe('Chemical Burns', () => {
    it('should detect chemical exposure', () => {
      const result = evaluateRedFlags({ message: 'Químicos en ojos' });
      expect(result.triggered).toBe(true);
    });

    it('should detect acid burn', () => {
      const result = evaluateRedFlags({ message: 'Ácido en la piel' });
      expect(result.triggered).toBe(true);
    });

    it('should require emergency escalation for ocular chemical burns', () => {
      const result = detectRedFlagsEnhanced('Químicos en ojos');
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // EYE INJURIES (4 patterns)
  // ============================================================================
  describe('Eye Injuries', () => {
    it('should detect sudden vision loss', () => {
      const result = detectRedFlagsEnhanced('Perdida de vision subita');
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('high');
    });

    it('should detect sudden blindness', () => {
      const result = detectRedFlagsEnhanced('Ceguera repentina');
      expect(result.detected).toBe(true);
    });

    it('should detect eye pain emergency', () => {
      const result = detectRedFlagsEnhanced('Dolor de ojo severo');
      expect(result.detected).toBe(true);
    });

    it('should increase urgency with glaucoma signs', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor de ojo con halos',
        { conditions: ['glaucoma'] }
      );
      expect(result.urgencyScore).toBeGreaterThanOrEqual(7);
    });
  });

  // ============================================================================
  // OPEN FRACTURES (3 patterns)
  // ============================================================================
  describe('Open Fractures', () => {
    it('should detect fracture with wound', () => {
      const result = evaluateRedFlags({ message: 'Fractura expuesta' });
      expect(result.triggered).toBe(true);
    });

    it('should detect compound fracture', () => {
      const result = evaluateRedFlags({ message: 'Hueso saliendo' });
      expect(result.triggered).toBe(true);
    });

    it('should assign high urgency to open fractures', () => {
      const result = detectRedFlagsEnhanced('Hueso expuesto con sangrado');
      expect(result.urgencyScore).toBeGreaterThanOrEqual(8);
    });
  });

  // ============================================================================
  // SPINAL CORD INJURY (3 patterns)
  // ============================================================================
  describe('Spinal Cord Injury', () => {
    it('should detect paralysis after trauma', () => {
      const result = detectRedFlagsEnhanced(
        'No puedo mover piernas después de caída'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect neck injury with neurological signs', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor de cuello con hormigueo en brazos'
      );
      expect(result.detected).toBe(true);
    });

    it('should require emergency escalation for spinal injuries', () => {
      const result = detectRedFlagsEnhanced('Parálisis después de accidente');
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // THYROID STORM (2 patterns)
  // ============================================================================
  describe('Thyroid Storm', () => {
    it('should detect thyroid storm', () => {
      const result = evaluateRedFlags({ message: 'Tormenta tiroidea' });
      expect(result.triggered).toBe(true);
    });

    it('should detect severe hyperthyroidism', () => {
      const result = detectRedFlagsEnhanced(
        'Hipertiroidismo con fiebre alta'
      );
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // SEROTONIN SYNDROME (2 patterns)
  // ============================================================================
  describe('Serotonin Syndrome', () => {
    it('should detect serotonin syndrome signs', () => {
      const result = detectRedFlagsEnhanced(
        'Agitación y temblor con antidepresivos'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect with SSRI medication context', () => {
      const result = detectRedFlagsEnhanced(
        'Temblor y sudoración',
        { medications: [{ name: 'Sertralina' }] }
      );
      expect(result.urgencyScore).toBeGreaterThanOrEqual(6);
    });
  });

  // ============================================================================
  // CARBON MONOXIDE POISONING (2 patterns)
  // ============================================================================
  describe('Carbon Monoxide Poisoning', () => {
    it('should detect CO poisoning symptoms', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor de cabeza con calefactor encendido'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect familial CO exposure', () => {
      const result = detectRedFlagsEnhanced(
        'Todos con dolor de cabeza en casa'
      );
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // PULMONARY EDEMA (2 patterns)
  // ============================================================================
  describe('Pulmonary Edema', () => {
    it('should detect pulmonary edema', () => {
      const result = evaluateRedFlags({ message: 'Edema pulmonar' });
      expect(result.triggered).toBe(true);
    });

    it('should detect flash pulmonary edema', () => {
      const result = evaluateRedFlags({ message: 'Tos con espuma rosada' });
      expect(result.triggered).toBe(true);
    });
  });

  // ============================================================================
  // PNEUMOTHORAX (2 patterns)
  // ============================================================================
  describe('Pneumothorax', () => {
    it('should detect pneumothorax', () => {
      const result = evaluateRedFlags({ message: 'Neumotórax' });
      expect(result.triggered).toBe(true);
    });

    it('should detect collapsed lung signs', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor súbito en el pecho con dificultad para respirar'
      );
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // CARDIAC EMERGENCIES (3 patterns)
  // ============================================================================
  describe('Cardiac Emergencies', () => {
    it('should detect cardiac tamponade', () => {
      const result = evaluateRedFlags({ message: 'Taponamiento cardiaco' });
      expect(result.triggered).toBe(true);
    });

    it('should detect aortic dissection', () => {
      const result = evaluateRedFlags({ message: 'Disección aórtica' });
      expect(result.triggered).toBe(true);
    });

    it('should detect pulmonary embolism', () => {
      const result = evaluateRedFlags({ message: 'Embolia pulmonar' });
      expect(result.triggered).toBe(true);
    });
  });

  // ============================================================================
  // ABDOMINAL EMERGENCIES (3 patterns)
  // ============================================================================
  describe('Abdominal Emergencies', () => {
    it('should detect appendicitis', () => {
      const result = evaluateRedFlags({ message: 'Apendicitis' });
      expect(result.triggered).toBe(true);
    });

    it('should detect peritonitis', () => {
      const result = evaluateRedFlags({ message: 'Peritonitis' });
      expect(result.triggered).toBe(true);
    });

    it('should detect acute abdomen', () => {
      const result = evaluateRedFlags({ message: 'Abdomen agudo' });
      expect(result.triggered).toBe(true);
    });
  });

  // ============================================================================
  // NEUROLOGICAL EMERGENCIES (3 patterns)
  // ============================================================================
  describe('Neurological Emergencies', () => {
    it('should detect Guillain-Barre', () => {
      const result = evaluateRedFlags({ message: 'Síndrome de Guillain-Barré' });
      expect(result.triggered).toBe(true);
    });

    it('should detect meningitis', () => {
      const result = evaluateRedFlags({ message: 'Meningitis' });
      expect(result.triggered).toBe(true);
    });

    it('should detect encephalitis', () => {
      const result = evaluateRedFlags({ message: 'Encefalitis' });
      expect(result.triggered).toBe(true);
    });
  });

  // ============================================================================
  // UROLOGICAL EMERGENCIES (3 patterns)
  // ============================================================================
  describe('Urological Emergencies', () => {
    it('should detect testicular torsion', () => {
      const result = evaluateRedFlags({ message: 'Torsión testicular' });
      expect(result.triggered).toBe(true);
    });

    it('should detect acute urinary retention', () => {
      const result = detectRedFlagsEnhanced('No puedo orinar');
      expect(result.detected).toBe(true);
    });

    it('should detect kidney stones', () => {
      const result = evaluateRedFlags({ message: 'Cálculo renal' });
      expect(result.triggered).toBe(true);
    });
  });

  // ============================================================================
  // VASCULAR EMERGENCIES (2 patterns)
  // ============================================================================
  describe('Vascular Emergencies', () => {
    it('should detect DVT', () => {
      const result = evaluateRedFlags({ message: 'Trombosis venosa profunda' });
      expect(result.triggered).toBe(true);
    });

    it('should detect deep vein thrombosis signs', () => {
      const result = detectRedFlagsEnhanced('Pierna hinchada y roja');
      expect(result.detected).toBe(true);
    });
  });

  // ============================================================================
  // ENVIRONMENTAL EMERGENCIES (2 patterns)
  // ============================================================================
  describe('Environmental Emergencies', () => {
    it('should detect near-drowning', () => {
      const result = evaluateRedFlags({ message: 'Casi me ahogo' });
      expect(result.triggered).toBe(true);
    });

    it('should detect altitude sickness severe', () => {
      const result = evaluateRedFlags({ message: 'Edema pulmonar de altura' });
      expect(result.triggered).toBe(true);
    });
  });
});
