/**
 * English Emergency Pattern Detection Tests
 *
 * Tests 50+ English emergency patterns across multiple medical categories
 * Based on patterns defined in docs/emergency-detection.md
 *
 * Coverage:
 * - Cardiac emergencies (heart attack, chest pain)
 * - Neurological emergencies (stroke, ACV, seizures)
 * - Respiratory emergencies (difficulty breathing, choking)
 * - Mental health crises (suicide, self-harm)
 * - Severe bleeding (hemorrhage)
 * - Allergic reactions (anaphylaxis)
 * - Pregnancy emergencies
 * - Pediatric emergencies
 */

import { describe, it, expect } from 'vitest';
import { isMentalHealthCrisis } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

describe('English Emergency Pattern Detection', () => {

  // ============================================================================
  // CARDIAC EMERGENCIES - Heart Attack, Chest Pain
  // ============================================================================
  describe('Cardiac Emergencies (English)', () => {
    const cardiacPatterns = [
      // Classic myocardial infarction descriptions
      'I have crushing chest pain',
      'Chest pain radiating to left arm',
      'Feeling like im going to die',
      'Squeezing sensation in chest',
      'Heavy pressure on my chest',
      'Chest tightness',
      'Heart attack',
      'Myocardial infarction',
      'Chest pain that goes to jaw',
      'Pressure in center of chest',
      'Chest discomfort',
      'Pain spreading to back',
      'Angina pain',
      'Chest pain with shortness of breath',
      'Cardiac arrest',
      'Severe chest pressure',
      'Chest pain like elephant sitting',
      'Radiating chest pain',
      'Left arm pain and chest pain',
      'Tightness in chest',
    ];

    it(`should detect all ${cardiacPatterns.length} cardiac emergency patterns`, () => {
      cardiacPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
        expect(result.flags.some(f => f.category === 'Cardiac')).toBe(true);
      });
    });

    it('should detect cardiac emergency with diabetes context', () => {
      const result = detectRedFlagsEnhanced(
        'I have chest pain and fatigue',
        { conditions: ['diabetes', 'hypertension'] }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
      expect(result.conditionContext.some(c => c.includes('diabetes'))).toBe(true);
    });
  });

  // ============================================================================
  // NEUROLOGICAL EMERGENCIES - Stroke
  // ============================================================================
  describe('Neurological Emergencies (English)', () => {
    const strokePatterns = [
      // FAST Protocol - Facial
      'Face drooping',
      'Facial paralysis',
      'Face drooping on one side',
      'One side of face is numb',
      'Cant move one side of face',
      'Facial droop',
      'Paralyzed face',
      'Crooked face',

      // FAST Protocol - Arms
      'Arm weakness',
      'Cant raise my arm',
      'Left arm is weak',
      'Right arm feels heavy',
      'Cant lift arm',
      'Arm numbness',
      'One arm drags',
      'Weakness in extremity',

      // FAST Protocol - Speech
      'Slurred speech',
      'Cant speak properly',
      'Trouble speaking',
      'Speech difficulty',
      'Cant find words',
      'Words are jumbled',
      'Speech is garbled',
      'Hard to talk',

      // General stroke terms
      'Stroke',
      'CVA',
      'Cerebrovascular accident',
      'Brain attack',
      'Ischemic stroke',
      'Hemorrhagic stroke',
      'Mini stroke',
      'TIA',
    ];

    it(`should detect all ${strokePatterns.length} stroke patterns`, () => {
      strokePatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
        expect(result.flags.some(f => f.category === 'Neurological')).toBe(true);
      });
    });

    it('should detect stroke with anticoagulant context', () => {
      const result = detectRedFlagsEnhanced(
        'Cant move my right arm',
        { medications: [{ name: 'Warfarin' }] }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(9);
    });
  });

  // ============================================================================
  // RESPIRATORY EMERGENCIES - Difficulty Breathing
  // ============================================================================
  describe('Respiratory Emergencies (English)', () => {
    const respiratoryPatterns = [
      'Cant breathe',
      'Cant breath',
      'Difficulty breathing',
      'Trouble breathing',
      'Shortness of breath',
      'SOB',
      'Dyspnea',
      'Choking',
      'Gasping for air',
      'Cant catch my breath',
      'Wheezing severely',
      'Blue lips',
      'Cyanosis',
      'Face turning blue',
      'Lips are blue',
      'Air hunger',
      'Cant get air',
      'Suffocating',
      'Chest tightness cant breathe',
      'Respiratory distress',
      'Struggling to breathe',
      'Severe asthma attack',
      'Bronchospasm',
    ];

    it(`should detect all ${respiratoryPatterns.length} respiratory emergency patterns`, () => {
      respiratoryPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should detect respiratory emergency with asthma context', () => {
      const result = detectRedFlagsEnhanced(
        'Cant breathe well',
        { conditions: ['asthma', 'copd'] }
      );
      expect(result.detected).toBe(true);
      expect(result.highestSeverity).toBe('critical');
      expect(result.conditionContext.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // MENTAL HEALTH CRISES - Psychiatric Emergencies
  // ============================================================================
  describe('Mental Health Crises (English)', () => {
    const suicidePatterns = [
      'I want to die',
      'Want to die',
      'I want to kill myself',
      'Kill myself',
      'Suicidal thoughts',
      'Want to end my life',
      'End my life',
      'Planning suicide',
      'Suicide plan',
      'I dont want to live',
      'Better off dead',
      'No point living',
      'Want to disappear',
      'Self harm',
      'Want to hurt myself',
      'Cut myself',
      'End it all',
      'Not worth living',
      'Want to commit suicide',
      'Going to kill myself',
    ];

    it(`should detect all ${suicidePatterns.length} suicidal ideation patterns`, () => {
      suicidePatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
        expect(result.flags.some(f => f.category === 'Psychiatric')).toBe(true);
      });
    });

    it('should detect mental health crisis with depression context', () => {
      const result = detectRedFlagsEnhanced(
        'I want to end it all',
        { conditions: ['depression', 'bipolar_disorder'] }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBe(10);
    });
  });

  // ============================================================================
  // SEVERE BLEEDING - Hemorrhage
  // ============================================================================
  describe('Severe Bleeding (English)', () => {
    const bleedingPatterns = [
      'Severe bleeding',
      'Heavy bleeding',
      'Bleeding wont stop',
      'Uncontrolled bleeding',
      'Gushing blood',
      'Losing blood fast',
      'Hemorrhage',
      'Profuse bleeding',
      'Bleeding heavily',
      'Cant stop bleeding',
      'Blood everywhere',
      'Major blood loss',
      'Arterial bleeding',
      'Vomiting blood',
      'Coughing up blood',
      'Blood in urine',
      'Rectal bleeding',
      'Nosebleed wont stop',
      'Excessive bleeding',
      'Life threatening bleeding',
    ];

    it(`should detect all ${bleedingPatterns.length} severe bleeding patterns`, () => {
      bleedingPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
        expect(result.flags.some(f => f.category === 'Trauma')).toBe(true);
      });
    });

    it('should increase urgency with blood thinners', () => {
      const result = detectRedFlagsEnhanced(
        'Nosebleed that wont stop',
        { medications: [{ name: 'Coumadin' }, { name: 'Aspirin' }] }
      );
      expect(result.detected).toBe(true);
      expect(result.medicationAlerts.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // ALLERGIC REACTIONS - Anaphylaxis
  // ============================================================================
  describe('Severe Allergic Reactions (English)', () => {
    const allergyPatterns = [
      'Anaphylaxis',
      'Anaphylactic shock',
      'Throat closing',
      'Throat swelling shut',
      'Tongue swollen',
      'Swollen lips',
      'Face swelling',
      'Cant swallow from allergy',
      'Swollen eyes',
      'Allergic reaction severe',
      'Airway closing',
      'Difficulty swallowing',
      'Lips swollen',
      'Sudden face swelling',
      'Severe allergy',
      'Cant breathe due to allergy',
      'EpiPen needed',
      'Hives with swelling',
      'Swelling all over',
    ];

    it(`should detect all ${allergyPatterns.length} anaphylaxis patterns`, () => {
      allergyPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
        expect(result.flags.some(f => f.category === 'Allergic')).toBe(true);
      });
    });

    it('should detect severe allergic reaction with asthma history', () => {
      const result = detectRedFlagsEnhanced(
        'Throat is closing up',
        { conditions: ['asthma', 'anaphylaxis_history'] }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBe(10);
    });
  });

  // ============================================================================
  // PREGNANCY EMERGENCIES - Obstetric Complications
  // ============================================================================
  describe('Pregnancy Emergencies (English)', () => {
    const pregnancyPatterns = [
      'Pregnant and bleeding',
      'Vaginal bleeding during pregnancy',
      'Severe abdominal pain pregnant',
      'Water broke',
      'Leaking fluid pregnant',
      'Contractions too early',
      'Preterm labor',
      'Decreased fetal movement',
      'Baby not moving',
      'Severe headache pregnant',
      'Blurred vision pregnancy',
      'Swollen face and hands pregnant',
      'Preeclampsia',
      'Eclampsia',
      'Placental abruption',
      'Placenta previa bleeding',
      'Pregnancy complications',
      'Miscarriage bleeding',
    ];

    it(`should detect all ${pregnancyPatterns.length} pregnancy emergency patterns`, () => {
      pregnancyPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern, {
          pregnancyStatus: 'pregnant'
        });
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should detect preeclampsia signs', () => {
      const result = detectRedFlagsEnhanced(
        'Severe headache with blurred vision',
        { pregnancyStatus: 'pregnant' }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('preeclampsia'))).toBe(true);
    });
  });

  // ============================================================================
  // SEIZURES - Convulsions
  // ============================================================================
  describe('Seizures (English)', () => {
    const seizurePatterns = [
      'Seizure',
      'Convulsion',
      'Having a seizure',
      'Epileptic seizure',
      'Uncontrollable shaking',
      'Violent shaking',
      'Full body convulsion',
      'Tonic clonic seizure',
      'Grand mal seizure',
      'Body shaking uncontrollably',
      'Muscle spasms',
      'Fit and seizure',
      'Convulsing',
      'Seizing',
      'Epilepsy attack',
      'Status epilepticus',
    ];

    it(`should detect all ${seizurePatterns.length} seizure patterns`, () => {
      seizurePatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
      });
    });

    it('should detect seizure with epilepsy history', () => {
      const result = detectRedFlagsEnhanced(
        'Having convulsions',
        { conditions: ['epilepsy'] }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(9);
    });
  });

  // ============================================================================
  // HEADACHES - Thunderclap
  // ============================================================================
  describe('Thunderclap Headache (English)', () => {
    const thunderclapPatterns = [
      'Worst headache of my life',
      'Thunderclap headache',
      'Sudden severe headache',
      'Explosive headache',
      'Headache came on suddenly',
      'Splitting headache',
      'Came out of nowhere headache',
      'Severe headache instant',
      'Worst head pain ever',
      'Thunder headache',
    ];

    it(`should detect all ${thunderclapPatterns.length} thunderclap headache patterns`, () => {
      thunderclapPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
      });
    });

    it('should increase urgency with hypertension', () => {
      const result = detectRedFlagsEnhanced(
        'Worst headache of my life',
        { conditions: ['hypertension'] }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBe(10);
    });
  });

  // ============================================================================
  // LOSS OF CONSCIOUSNESS - Fainting
  // ============================================================================
  describe('Loss of Consciousness (English)', () => {
    const consciousnessPatterns = [
      'Passed out',
      'Fainted',
      'Lost consciousness',
      'Unconscious',
      'Blackout',
      'Fainting',
      'Collapsed',
      'Passed out and fell',
      'Syncopy',
      'Fell down unconscious',
      'Knocked out',
      'Lose consciousness',
      'Fainting spell',
      'Dropped unconscious',
      'Passed out suddenly',
      'Went unconscious',
    ];

    it(`should detect all ${consciousnessPatterns.length} consciousness patterns`, () => {
      consciousnessPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
        expect(result.requiresEmergencyEscalation).toBe(true);
      });
    });
  });

  // ============================================================================
  // ABDOMINAL EMERGENCIES - Acute Abdomen
  // ============================================================================
  describe('Abdominal Emergencies (English)', () => {
    const abdominalPatterns = [
      'Rigid abdomen',
      'Hard stomach',
      'Board like abdomen',
      'Guarding abdomen',
      'Severe abdominal pain',
      'Acute abdominal pain',
      'Stomach rigid',
      'Belly hard as rock',
      'Rebound tenderness',
      'Abdominal guarding',
      'Severe belly pain',
    ];

    it(`should detect all ${abdominalPatterns.length} acute abdomen patterns`, () => {
      abdominalPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });
  });

  // ============================================================================
  // ALTERED MENTAL STATUS - Confusion
  // ============================================================================
  describe('Altered Mental Status (English)', () => {
    const amsPatterns = [
      'Confused',
      'Disoriented',
      'Doesnt recognize anyone',
      'Altered mental status',
      'Memory loss',
      'Sudden confusion',
      'Delirium',
      'Doesnt know where he is',
      'Cant think clearly',
      'Mental status change',
      'Confusion sudden onset',
      'Doesnt know name',
    ];

    it(`should detect all ${amsPatterns.length} altered mental status patterns`, () => {
      amsPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should detect diabetic emergency with confusion', () => {
      const result = detectRedFlagsEnhanced(
        'Confused and sweaty',
        { conditions: ['diabetes'] }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.category === 'Endocrine' || f.category === 'ConditionSpecific')).toBe(true);
    });
  });

  // ============================================================================
  // CRITICAL VITAL SIGNS
  // ============================================================================
  describe('Critical Vital Signs (English)', () => {
    it('should detect hypertensive crisis', () => {
      const result = detectRedFlagsEnhanced(
        'Not feeling well',
        { vitalSigns: { bloodPressure: '190/130' } }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('hipertensiva') || f.category === 'VitalSigns')).toBe(true);
      expect(result.highestSeverity).toBe('critical');
    });

    it('should detect severe hypoxemia', () => {
      const result = detectRedFlagsEnhanced(
        'Not feeling well',
        { vitalSigns: { oxygenSaturation: 87 } }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.category === 'VitalSigns')).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(9);
    });

    it('should detect extreme tachycardia', () => {
      const result = detectRedFlagsEnhanced(
        'Not feeling well',
        { vitalSigns: { heartRate: 135 } }
      );
      expect(result.detected).toBe(true);
      expect(result.flags.some(f => f.message.includes('Taquicardia'))).toBe(true);
    });
  });

  // ============================================================================
  // VISION EMERGENCIES
  // ============================================================================
  describe('Vision Emergencies (English)', () => {
    const visionPatterns = [
      'Sudden vision loss',
      'Sudden blindness',
      'Cant see',
      'Vision went black',
      'Lost vision suddenly',
      'Sudden blurry vision',
      'Vision gone',
      'Blindness onset',
      'Cant see out of one eye',
      'Sudden vision darkness',
    ];

    it(`should detect all ${visionPatterns.length} vision emergency patterns`, () => {
      visionPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.highestSeverity).toBe('critical');
      });
    });

    it('should increase urgency with diabetes and hypertension', () => {
      const result = detectRedFlagsEnhanced(
        'Sudden vision loss in one eye',
        { conditions: ['diabetes', 'hypertension'] }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(7);
    });
  });

  // ============================================================================
  // DVT - Deep Vein Thrombosis
  // ============================================================================
  describe('Deep Vein Thrombosis (English)', () => {
    const dvtPatterns = [
      'Leg is swollen and painful',
      'Swollen calf with pain',
      'My leg is swollen and red',
      'Red hot leg',
      'Thrombosis in deep vein',
      'Chest pain when breathing',
      'Coughing blood',
      'Sudden difficulty breathing',
      'Leg pain and swelling',
      'Deep vein thrombosis',
    ];

    it(`should detect all ${dvtPatterns.length} DVT patterns`, () => {
      dvtPatterns.forEach((pattern) => {
        const result = detectRedFlagsEnhanced(pattern);
        expect(result.detected).toBe(true);
        expect(result.flags.some(f => f.category === 'Vascular')).toBe(true);
      });
    });

    it('should increase DVT urgency with pregnancy or oral contraceptives', () => {
      const result = detectRedFlagsEnhanced(
        'Leg is swollen and painful',
        {
          pregnancyStatus: 'pregnant',
          medications: [{ name: 'birth control pills' }]
        }
      );
      expect(result.detected).toBe(true);
      expect(result.urgencyScore).toBeGreaterThanOrEqual(7);
    });
  });
});
