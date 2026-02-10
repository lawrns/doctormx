/**
 * Spanish Emergency Pattern Detection Tests
 *
 * Tests 50+ Spanish emergency patterns across multiple medical categories
 * Based on patterns defined in docs/emergency-detection.md
 *
 * Coverage:
 * - Cardiac emergencies (infarto, dolor de pecho)
 * - Neurological emergencies (ACV, derrame, convulsiones)
 * - Respiratory emergencies (dificultad respirar, asfixia)
 * - Mental health crises (suicidio, ideación suicida)
 * - Severe bleeding (hemorragia, sangrado)
 * - Allergic reactions (anafilaxia)
 * - Pregnancy emergencies (preeclampsia, sangrado vaginal)
 * - Pediatric emergencies (fiebre en lactantes)
 */

import { describe, it, expect } from 'vitest';
import { evaluateRedFlags, isMentalHealthCrisis } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

describe('Spanish Emergency Pattern Detection', () => {

  // ============================================================================
  // CARDIAC EMERGENCIES - Infarto, Dolor de Pecho
  // ============================================================================
  describe('Cardiac Emergencies (Español)', () => {
    const cardiacPatterns = [
      // Classic myocardial infarction descriptions
      'Tengo dolor de pecho opresivo',
      'Dolor en el pecho que se irradia al brazo izquierdo',
      'Siento una presión fuerte en el pecho',
      'Dolor torácico con sensación de muerte inminente',
      'Me duele el pecho y me siento como si fuera a morir',
      'Angina de pecho',
      'Opresión en el pecho que va hacia la mandíbula',
      'Dolor en el pecho que irradia al cuello',
      'Siento un aplastamiento en el pecho',
      'Dolor de pecho tipo opresión',
      'Tengo dolor torácico intenso',
      'Siento que me mueren del pecho',
      'Dolor en el centro del pecho que no me deja respirar',
      'Presión en el pecho como si me apretaran',
      'Dolor de pecho con sudor frío',
      'Infarto al corazón',
      'Ataque cardíaco',
      'Dolor de pecho que se extiende a la espalda',
    ];

    it(`should detect all ${cardiacPatterns.length} cardiac emergency patterns`, () => {
      cardiacPatterns.forEach((pattern) => {
        const result = evaluateRedFlags({ message: pattern });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
        expect(result.severity).toBe(100);
        expect(result.ruleIds.some(id => id.includes('chest_pain'))).toBe(true);
      });
    });

    it('should detect chest pain with anxiety symptoms', () => {
      const result = detectRedFlagsEnhanced(
        'Tengo dolor de pecho, ansiedad y sudor frío',
        { age: 55, conditions: ['hypertension', 'diabetes'] }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
      expect(result.requiresEmergencyEscalation).toBe(true);
    });
  });

  // ============================================================================
  // NEUROLOGICAL EMERGENCIES - ACV/Derrame Cerebral
  // ============================================================================
  describe('Neurological Emergencies (Español)', () => {
    const strokePatterns = [
      // FAST Protocol - Facial
      'Tengo la cara caída',
      'Mi mamá tiene la mitad de la cara paralizada',
      'Me cae la cara de un lado',
      'Cara torcida hacia un lado',
      'Parálisis facial de repente',
      'No puedo mover un lado de la cara',

      // FAST Protocol - Arms
      'No puedo levantar el brazo derecho',
      'Me débilitó el brazo izquierdo',
      'Brazo débil de un lado',
      'No siento el brazo',
      'Incapacidad para levantar el brazo',
      'Brazo flojo sin fuerza',

      // FAST Protocol - Speech
      'Hablo enredado',
      'No puedo hablar bien',
      'Mis palabras salen mal',
      'Dificultad para hablar',
      'Lengua trabada',
      'No articulo bien las palabras',
      'Habla confusa',

      // General stroke terms
      'Derrame cerebral',
      'Embolia',
      'Accidente cerebrovascular',
      'ACV',
      'Infarto cerebral',
      'Isquemia cerebral',
      'Derrame en el cerebro',
    ];

    it(`should detect all ${strokePatterns.length} stroke patterns`, () => {
      strokePatterns.forEach((pattern) => {
        const result = evaluateRedFlags({ message: pattern });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
        expect(result.severity).toBe(100);
      });
    });

    it('should detect stroke with hypertension context', () => {
      const result = detectRedFlagsEnhanced(
        'No puedo mover el brazo derecho ni hablar bien',
        { conditions: ['hypertension', 'diabetes'] }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
      expect(result.urgencyScore).toBeGreaterThanOrEqual(9);
    });
  });

  // ============================================================================
  // RESPIRATORY EMERGENCIES - Dificultad Respiratoria
  // ============================================================================
  describe('Respiratory Emergencies (Español)', () => {
    const respiratoryPatterns = [
      'No puedo respirar',
      'Me estoy ahogando',
      'Asfixia',
      'Ahogo severo',
      'Falta de aire intensa',
      'No puedo tomar aire',
      'Siento que me asfixio',
      'Dificultad extrema para respirar',
      'Labios azules',
      'Tengo los labios morados',
      'Cara azúl',
      'Cianosis en labios',
      'Cuerpo azulado',
      'Piel azulada',
      'No puedo tomar aire',
      'Ahogo que no me deja respirar',
      'Sofoco sin aire',
      'Broncoespasmo severo',
      'Crisis asmática',
    ];

    it(`should detect all ${respiratoryPatterns.length} respiratory emergency patterns`, () => {
      respiratoryPatterns.forEach((pattern) => {
        const result = evaluateRedFlags({ message: pattern });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should detect respiratory emergency with COPD context', () => {
      const result = detectRedFlagsEnhanced(
        'No puedo respirar bien',
        { conditions: ['copd', 'asthma'] }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });
  });

  // ============================================================================
  // MENTAL HEALTH CRISES - Crisis Psiquiátricas
  // ============================================================================
  describe('Mental Health Crises (Español)', () => {
    const suicidePatterns = [
      'Quiero morir',
      'Quiero suicidarme',
      'Quiero matarme',
      'Pienso en quitarme la vida',
      'No quiero vivir más',
      'Voy a acabar con mi vida',
      'Mejor muerto',
      'No vale la pena vivir',
      'Quiero dejar de existir',
      'Plan suicida',
      'Pensamientos suicidas',
      'Ideación suicida',
      'Autolesionarse',
      'Quiero hacerme daño',
      'Quiero cortarme',
      'Voy a tirarme de un edificio',
      'Voy a tomar pastillas para morir',
      'No encuentro razones para vivir',
      'La vida no tiene sentido',
      'Quiero desaparecer',
      'Estoy harto de vivir',
    ];

    it(`should detect all ${suicidePatterns.length} suicidal ideation patterns`, () => {
      suicidePatterns.forEach((pattern) => {
        const result = evaluateRedFlags({ message: pattern });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
        expect(result.ruleIds).toContain('suicidal_ideation');
      });
    });

    it('should detect mental health crisis with isMentalHealthCrisis', () => {
      suicidePatterns.forEach((pattern) => {
        expect(isMentalHealthCrisis(pattern)).toBe(true);
      });
    });

    it('should include crisis hotline in recommendations', () => {
      const result = evaluateRedFlags({ message: 'Quiero morir' });
      expect(result.recommendations.some(r => r.includes('800 911 2000'))).toBe(true);
      expect(result.recommendations.some(r => r.includes('SAPTEL'))).toBe(true);
    });
  });

  // ============================================================================
  // SEVERE BLEEDING - Hemorragias
  // ============================================================================
  describe('Severe Bleeding (Español)', () => {
    const bleedingPatterns = [
      'Estoy sangrando mucho',
      'Hemorragia que no para',
      'Sangrado profuso',
      'Me estoy desangrando',
      'Sangre sale sin parar',
      'Hemorragia severa',
      'Sangrado incontrolable',
      'Pierdo mucha sangre',
      'Sangrado abundante',
      'Hemorragia activa',
      'Sangra la herida sin cesar',
      'Sangre a chorros',
      'Sangrado intenso',
      'Hemorragia interna',
      'Vomito sangre',
      'Sangre en orina',
      'Sangrado rectal',
      'Hemorragia nasal continua',
    ];

    it(`should detect all ${bleedingPatterns.length} severe bleeding patterns`, () => {
      bleedingPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
      });
    });

    it('should increase urgency with anticoagulant medications', () => {
      const result = detectRedFlagsEnhanced(
        'Tengo sangrado nasal',
        { medications: [{ name: 'Warfarina' }] }
      );
      expect(result.detected).toBe(true);
      expect(result.medicationAlerts.length).toBeGreaterThan(0);
      expect(result.medicationAlerts.some(a => a.includes('anticoagulación'))).toBe(true);
    });
  });

  // ============================================================================
  // ALLERGIC REACTIONS - Anafilaxia
  // ============================================================================
  describe('Severe Allergic Reactions (Español)', () => {
    const allergyPatterns = [
      'Anafilaxia',
      'Reacción alérgica grave',
      'Tengo la garganta cerrada',
      'Me cierro la garganta',
      'Hinchazón de la lengua',
      'Labios hinchados',
      'Cara hinchada',
      'Dificultad para tragar por alergia',
      'Hinchazón en ojos',
      'Edema de glotis',
      'No puedo tragar',
      'Garganta apretada',
      'Hinchazón repentina en cara',
      'Shock anafiláctico',
      'Alergia severa',
      'No puedo respirar por alergia',
    ];

    it(`should detect all ${allergyPatterns.length} anaphylaxis patterns`, () => {
      allergyPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should detect angioedema from ACE inhibitors', () => {
      const result = detectRedFlagsEnhanced(
        'Tengo los labios hinchados',
        { medications: [{ name: 'Enalapril' }] }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('angioedema'))).toBe(true);
    });
  });

  // ============================================================================
  // PREGNANCY EMERGENCIES - Complicaciones Obstétricas
  // ============================================================================
  describe('Pregnancy Emergencies (Español)', () => {
    const pregnancyPatterns = [
      'Estoy embarazada y tengo sangrado vaginal',
      'Sangrado durante el embarazo',
      'Dolor abdominal intenso estando embarazada',
      'Pierdo líquido vaginal',
      'Contracciones antes de tiempo',
      'No siento movimientos del bebé',
      'Dolor de cabeza intenso en el embarazo',
      'Visión borrosa en embarazo',
      'Hinchazón en cara y manos embarazada',
      'Posible preeclampsia',
      'Sangrado uterino',
      'Dolor pélvico severo',
      'Parto pretérmino',
      'Desprendimiento de placenta',
    ];

    it(`should detect all ${pregnancyPatterns.length} pregnancy emergency patterns`, () => {
      pregnancyPatterns.forEach((pattern) => {
        const result = evaluateRedFlags({
          message: pattern,
          intake: { isPregnant: true }
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    it('should detect preeclampsia signs with pregnancy context', () => {
      const result = detectRedFlagsEnhanced(
        'Dolor de cabeza intenso y visión borrosa',
        {
          pregnancyStatus: 'pregnant',
          age: 30
        }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('preeclampsia'))).toBe(true);
    });
  });

  // ============================================================================
  // CONVULSIONES - Convulsiones
  // ============================================================================
  describe('Convulsiones (Español)', () => {
    const seizurePatterns = [
      'Convulsiones',
      'Ataque epiléptico',
      'Espasmos incontrolables',
      'Temblores violentos',
      'Crisis convulsiva',
      'Epiléptico convulsionando',
      'Sacudidas en el cuerpo',
      'Espasmos musculares',
      'Pérdida de conciencia con movimientos',
      'Convulsionando',
      'Ataque de epilepsia',
      'Crisis epiléptica',
      'Espasmo convulsivo',
      'Temblores convulsivos',
    ];

    it(`should detect all ${seizurePatterns.length} seizure patterns`, () => {
      seizurePatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
      });
    });
  });

  // ============================================================================
  // HEADACHES - Cefaleas
  // ============================================================================
  describe('Cefalea Thunderclap (Español)', () => {
    const thunderclapPatterns = [
      'El peor dolor de cabeza de mi vida',
      'Dolor de cabeza explosivo',
      'Cefalea de inicio súbito',
      'Dolor de cabeza que llegó de golpe',
      'Cefalea thunderclap',
      'Dolor de cabeza repentino e intenso',
      'Dolor de cabeza excesivo',
      'Dolor de cabeza que me dobla',
      'Migraña severa de repente',
      'Dolor de cabeza como un martillazo',
    ];

    it(`should detect all ${thunderclapPatterns.length} thunderclap headache patterns`, () => {
      thunderclapPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.flags.some(f => f.message.includes('thunderclap') || f.message.includes('hemorragia'))).toBe(true);
      });
    });
  });

  // ============================================================================
  // PEDIATRIC EMERGENCIES - Emergencias Pediátricas
  // ============================================================================
  describe('Pediatric Emergencies (Español)', () => {
    it('should detect fever in infant under 3 months as emergency', () => {
      const result = detectRedFlagsEnhanced(
        'Mi bebé de 2 meses tiene fiebre',
        {
          age: 2,
          vitalSigns: { temperature: 38.5 }
        }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('lactante'))).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect meningitis signs in children', () => {
      const result = detectRedFlagsEnhanced(
        'Tiene el cuello rígido con fiebre alta',
        { age: 5 }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('meningitis'))).toBe(true);
    });
  });

  // ============================================================================
  // LOSS OF CONSCIOUSNESS - Pérdida de Conciencia
  // ============================================================================
  describe('Pérdida de Conciencia (Español)', () => {
    const consciousnessPatterns = [
      'Me desmayé',
      'Perdí el conocimiento',
      'Me desvanecí',
      'Quedé inconsciente',
      'Me dio un desmayo',
      'Desmayo repentino',
      'Pérdida de conciencia',
      'Sincope',
      'Me caí desmayado',
      'Me falté',
      'Me di un golpe y me desmayé',
      'Desmayé y no recuerdo',
      'Perdí el conocimiento de golpe',
    ];

    it(`should detect all ${consciousnessPatterns.length} consciousness patterns`, () => {
      consciousnessPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });
  });

  // ============================================================================
  // CRITICAL VITAL SIGNS - Signos Vitales Críticos
  // ============================================================================
  describe('Signos Vitales Críticos (Español)', () => {
    it('should detect hypertensive crisis', () => {
      const result = detectRedFlagsEnhanced(
        'Me siento mal',
        { vitalSigns: { bloodPressure: '185/125' } }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('hipertensiva'))).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect hypoxemia', () => {
      const result = detectRedFlagsEnhanced(
        'Me siento mal',
        { vitalSigns: { oxygenSaturation: 88 } }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('Hipoxemia'))).toBe(true);
    });

    it('should detect hyperthermia', () => {
      const result = detectRedFlagsEnhanced(
        'Me siento mal',
        { vitalSigns: { temperature: 40.5 } }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('Hipertermia'))).toBe(true);
    });
  });
});
