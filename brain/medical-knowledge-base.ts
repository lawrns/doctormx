/**
 * MEDICAL KNOWLEDGE BASE
 * 
 * This file contains the core medical knowledge, condition databases, symptom mappings,
 * treatment recommendations, and clinical guidelines for the AI doctor system.
 * 
 * MEDICAL INTELLIGENCE:
 * - Comprehensive symptom-to-condition mapping database
 * - Evidence-based treatment recommendations and clinical guidelines
 * - Differential diagnosis algorithms for common conditions
 * - Medication recommendations with safety considerations
 * - Specialist referral criteria and timing guidelines
 * 
 * INTEGRATION:
 * - Provides medical knowledge for diagnostic engine
 * - Supports clinical reasoning with evidence-based data
 * - Integrates with Mexican medical practices and terminology
 * - Feeds treatment recommendations to conversation flow
 * 
 * KEY ALGORITHMS:
 * - Symptom clustering for differential diagnosis
 * - Severity-based treatment escalation protocols
 * - Age and demographic-specific medical considerations
 * - Drug interaction and contraindication checking
 */

export interface MedicalCondition {
  name: string;
  spanishName: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  commonCauses: string[];
  treatments: Treatment[];
  specialistReferral?: string;
  redFlags: string[];
  differentialDiagnosis: string[];
}

export interface Treatment {
  type: 'medication' | 'lifestyle' | 'procedure' | 'referral';
  description: string;
  spanishDescription: string;
  urgency: 'immediate' | 'urgent' | 'routine';
  contraindications?: string[];
}

export interface SymptomMapping {
  symptom: string;
  spanishTerms: string[];
  associatedConditions: string[];
  emergencyFlags: string[];
  commonQuestions: string[];
}

/**
 * CONDITION DATABASE
 * Comprehensive medical conditions with symptoms and treatments
 */
export class ConditionDatabase {
  
  static readonly CONDITIONS: Record<string, MedicalCondition> = {
    
    // HEADACHE CONDITIONS
    migraine: {
      name: 'Migraine',
      spanishName: 'Migraña',
      symptoms: [
        'pulsating headache', 'nausea', 'light sensitivity', 'sound sensitivity',
        'visual aura', 'unilateral pain', 'moderate to severe intensity'
      ],
      severity: 'moderate',
      commonCauses: [
        'stress', 'hormonal changes', 'certain foods', 'sleep changes',
        'weather changes', 'bright lights', 'strong smells'
      ],
      treatments: [
        {
          type: 'medication',
          description: 'NSAIDs (ibuprofen, naproxen) or specific migraine medications',
          spanishDescription: 'Antiinflamatorios (ibuprofeno, naproxeno) o medicamentos específicos para migraña',
          urgency: 'routine'
        },
        {
          type: 'lifestyle',
          description: 'Avoid triggers, regular sleep, stress management',
          spanishDescription: 'Evitar factores desencadenantes, sueño regular, manejo del estrés',
          urgency: 'routine'
        }
      ],
      specialistReferral: 'Neurólogo',
      redFlags: [
        'sudden severe headache', 'headache with fever', 'headache with vision changes',
        'headache after head injury', 'progressively worsening headache'
      ],
      differentialDiagnosis: ['tension headache', 'cluster headache', 'sinusitis']
    },

    tensionHeadache: {
      name: 'Tension Headache',
      spanishName: 'Cefalea Tensional',
      symptoms: [
        'band-like pressure', 'bilateral pain', 'mild to moderate intensity',
        'no nausea', 'no light sensitivity', 'muscle tension'
      ],
      severity: 'mild',
      commonCauses: ['stress', 'muscle tension', 'poor posture', 'eye strain', 'dehydration'],
      treatments: [
        {
          type: 'medication',
          description: 'Over-the-counter pain relievers (acetaminophen, ibuprofen)',
          spanishDescription: 'Analgésicos de venta libre (paracetamol, ibuprofeno)',
          urgency: 'routine'
        },
        {
          type: 'lifestyle',
          description: 'Stress reduction, regular exercise, proper posture',
          spanishDescription: 'Reducción del estrés, ejercicio regular, postura correcta',
          urgency: 'routine'
        }
      ],
      redFlags: ['sudden onset', 'severe intensity', 'associated neurological symptoms'],
      differentialDiagnosis: ['migraine', 'cervical headache', 'medication overuse headache']
    },

    // GASTROINTESTINAL CONDITIONS
    gastritis: {
      name: 'Gastritis',
      spanishName: 'Gastritis',
      symptoms: [
        'upper abdominal pain', 'burning sensation', 'nausea', 'bloating',
        'loss of appetite', 'pain worsens with eating'
      ],
      severity: 'moderate',
      commonCauses: [
        'H. pylori infection', 'NSAIDs', 'alcohol', 'stress', 'spicy foods'
      ],
      treatments: [
        {
          type: 'medication',
          description: 'Proton pump inhibitors, antacids, H2 blockers',
          spanishDescription: 'Inhibidores de bomba de protones, antiácidos, bloqueadores H2',
          urgency: 'routine'
        },
        {
          type: 'lifestyle',
          description: 'Avoid irritating foods, smaller meals, reduce stress',
          spanishDescription: 'Evitar alimentos irritantes, comidas pequeñas, reducir estrés',
          urgency: 'routine'
        }
      ],
      specialistReferral: 'Gastroenterólogo',
      redFlags: [
        'severe abdominal pain', 'vomiting blood', 'black stools',
        'unexplained weight loss', 'persistent vomiting'
      ],
      differentialDiagnosis: ['peptic ulcer', 'GERD', 'gallbladder disease']
    },

    // RESPIRATORY CONDITIONS
    upperRespiratoryInfection: {
      name: 'Upper Respiratory Infection',
      spanishName: 'Infección Respiratoria Alta',
      symptoms: [
        'runny nose', 'nasal congestion', 'sore throat', 'cough',
        'low-grade fever', 'fatigue', 'headache'
      ],
      severity: 'mild',
      commonCauses: ['viral infection', 'bacterial infection', 'allergens'],
      treatments: [
        {
          type: 'medication',
          description: 'Symptomatic treatment, decongestants, pain relievers',
          spanishDescription: 'Tratamiento sintomático, descongestionantes, analgésicos',
          urgency: 'routine'
        },
        {
          type: 'lifestyle',
          description: 'Rest, fluids, humidifier, saltwater gargles',
          spanishDescription: 'Descanso, líquidos, humidificador, gárgaras con agua salada',
          urgency: 'routine'
        }
      ],
      redFlags: [
        'high fever', 'difficulty breathing', 'severe throat pain',
        'symptoms worsen after improvement', 'persistent fever >3 days'
      ],
      differentialDiagnosis: ['strep throat', 'sinusitis', 'allergic rhinitis']
    }
  };

  static getConditionBySymptoms(symptoms: string[]): MedicalCondition[] {
    const matches: MedicalCondition[] = [];
    
    Object.values(this.CONDITIONS).forEach(condition => {
      const matchCount = symptoms.filter(symptom => 
        condition.symptoms.some(condSymptom => 
          condSymptom.toLowerCase().includes(symptom.toLowerCase())
        )
      ).length;
      
      if (matchCount >= 2) { // Require at least 2 matching symptoms
        matches.push(condition);
      }
    });
    
    return matches.sort((a, b) => {
      // Sort by severity (emergency first, then severe, etc.)
      const severityOrder = { emergency: 4, severe: 3, moderate: 2, mild: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
}

/**
 * SYMPTOM MAPPING SYSTEM
 * Maps Spanish symptoms to medical conditions
 */
export class SymptomMapper {
  
  static readonly SYMPTOM_MAPPINGS: Record<string, SymptomMapping> = {
    
    headache: {
      symptom: 'headache',
      spanishTerms: [
        'dolor de cabeza', 'cefalea', 'jaqueca', 'migraña',
        'dolor en la cabeza', 'me duele la cabeza'
      ],
      associatedConditions: ['migraine', 'tensionHeadache', 'sinusitis'],
      emergencyFlags: [
        'sudden severe onset', 'with fever', 'with vision changes',
        'after head trauma', 'worst headache of life'
      ],
      commonQuestions: [
        '¿El dolor es pulsátil o como una banda apretada?',
        '¿Se acompaña de náuseas o vómito?',
        '¿Tiene sensibilidad a la luz?',
        '¿Desde cuándo tiene el dolor?'
      ]
    },

    chestPain: {
      symptom: 'chest pain',
      spanishTerms: [
        'dolor de pecho', 'dolor en el pecho', 'presión en el pecho',
        'opresión torácica', 'dolor del corazón'
      ],
      associatedConditions: ['myocardialInfarction', 'angina', 'costochondritis'],
      emergencyFlags: [
        'severe intensity', 'radiation to arm', 'with sweating',
        'with shortness of breath', 'crushing sensation'
      ],
      commonQuestions: [
        '¿Cuánto tiempo lleva con este dolor?',
        '¿El dolor se extiende a otras partes?',
        '¿Tiene dificultad para respirar?',
        '¿Qué tan intenso es del 1 al 10?'
      ]
    },

    abdominalPain: {
      symptom: 'abdominal pain',
      spanishTerms: [
        'dolor de estómago', 'dolor abdominal', 'dolor de barriga',
        'dolor en el abdomen', 'me duele el estómago'
      ],
      associatedConditions: ['gastritis', 'appendicitis', 'gallbladder'],
      emergencyFlags: [
        'severe intensity', 'with vomiting', 'with fever',
        'rigid abdomen', 'rebound tenderness'
      ],
      commonQuestions: [
        '¿Dónde exactamente le duele?',
        '¿El dolor empeora al comer?',
        '¿Tiene náuseas o vómito?',
        '¿Cuándo comenzó el dolor?'
      ]
    },

    fever: {
      symptom: 'fever',
      spanishTerms: [
        'fiebre', 'calentura', 'temperatura alta',
        'tengo temperatura', 'me siento caliente'
      ],
      associatedConditions: ['infection', 'flu', 'pneumonia'],
      emergencyFlags: [
        'very high fever >39°C', 'with severe headache',
        'with difficulty breathing', 'with rash', 'with confusion'
      ],
      commonQuestions: [
        '¿Qué temperatura tiene?',
        '¿Desde cuándo tiene fiebre?',
        '¿Tiene otros síntomas?',
        '¿Ha tomado algún medicamento?'
      ]
    }
  };

  static findSymptomMapping(input: string): SymptomMapping | null {
    const lowerInput = input.toLowerCase();
    
    for (const mapping of Object.values(this.SYMPTOM_MAPPINGS)) {
      if (mapping.spanishTerms.some(term => lowerInput.includes(term))) {
        return mapping;
      }
    }
    
    return null;
  }

  static getRelevantQuestions(symptom: string): string[] {
    const mapping = this.findSymptomMapping(symptom);
    return mapping?.commonQuestions || [];
  }
}

/**
 * TREATMENT RECOMMENDATION ENGINE
 * Provides evidence-based treatment suggestions
 */
export class TreatmentEngine {
  
  static getRecommendations(
    condition: string, 
    severity: string, 
    patientAge?: number
  ): Treatment[] {
    const medicalCondition = ConditionDatabase.CONDITIONS[condition];
    if (!medicalCondition) return [];

    let treatments = medicalCondition.treatments;

    // Filter by severity and age if needed
    if (severity === 'severe') {
      treatments = treatments.filter(t => t.urgency !== 'routine');
    }

    // Age-specific considerations
    if (patientAge && patientAge < 18) {
      treatments = treatments.filter(t => 
        !t.contraindications?.includes('pediatric')
      );
    }

    return treatments;
  }

  static requiresSpecialistReferral(
    condition: string, 
    severity: string,
    duration: string
  ): boolean {
    const medicalCondition = ConditionDatabase.CONDITIONS[condition];
    
    return !!(
      medicalCondition?.specialistReferral && (
        severity === 'severe' || 
        duration === 'chronic' ||
        severity === 'emergency'
      )
    );
  }
}

/**
 * MEXICAN MEDICAL TERMINOLOGY
 * Localized medical terms and cultural context
 */
export class MexicanMedicalTerms {
  
  static readonly COMMON_TERMS = {
    // Pain descriptors
    'dolor': 'pain',
    'molestia': 'discomfort',
    'ardor': 'burning',
    'punzada': 'stabbing pain',
    'latido': 'throbbing',
    
    // Body parts
    'pecho': 'chest',
    'estómago': 'stomach',
    'barriga': 'belly',
    'cabeza': 'head',
    'garganta': 'throat',
    
    // Symptoms
    'calentura': 'fever',
    'mareo': 'dizziness',
    'náuseas': 'nausea',
    'vómito': 'vomiting',
    'tos': 'cough'
  };

  static readonly CULTURAL_CONSIDERATIONS = {
    familyInvolvement: 'Mexican families often make health decisions collectively',
    traditionalRemedies: 'Many patients use traditional remedies alongside modern medicine',
    religiousBeliefs: 'Religious beliefs may influence treatment acceptance',
    languageBarriers: 'Some patients may prefer Spanish medical terminology'
  };

  static translateSymptom(spanishTerm: string): string {
    return this.COMMON_TERMS[spanishTerm.toLowerCase()] || spanishTerm;
  }
}
