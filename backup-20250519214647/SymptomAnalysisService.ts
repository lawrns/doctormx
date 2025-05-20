// Comprehensive symptom analysis service with medical knowledge
import { supabase } from '../lib/supabase';

export interface SymptomData {
  id: string;
  name: string;
  description?: string;
  bodyRegion: string;
  severityLevel: number;
  possibleConditions: PossibleCondition[];
  associatedSymptoms?: string[];
  redFlags?: RedFlag[];
  followUpQuestions?: FollowUpQuestion[];
  medicalSpecialties: string[];
}

export interface PossibleCondition {
  id: string;
  name: string;
  description: string;
  probability: 'baja' | 'media' | 'alta';
  icd10Code?: string; // Standard medical coding
  medicalTerms?: string[];
  moreInfoUrl?: string;
}

export interface RedFlag {
  description: string;
  urgencyLevel: 'soon' | 'urgent' | 'emergency';
  action: string;
}

export interface FollowUpQuestion {
  id: string;
  questionText: string;
  questionType: 'boolean' | 'multiple_choice' | 'scale' | 'text';
  options?: string[];
  conditionalLogic?: any;
  medicalPurpose?: string;
}

export interface AnalysisResult {
  patientInfo?: {
    age?: number;
    gender?: string;
    hasChronicConditions?: boolean;
  };
  primarySymptom: {
    id: string;
    name: string;
    bodyRegion: string;
    duration?: string;
    severity?: 'low' | 'moderate' | 'high';
    pattern?: 'constant' | 'intermittent' | 'progressive' | 'cyclic';
  };
  associatedSymptoms?: string[];
  possibleConditions: PossibleCondition[];
  redFlagsDetected: RedFlag[];
  severityAssessment: 'low' | 'moderate' | 'high';
  urgencyAssessment: 'routine' | 'soon' | 'urgent' | 'emergency';
  recommendedSpecialties: string[];
  recommendedTests?: string[];
  selfCareRecommendations: string[];
  differentialFactors?: string[];
}

// Medical knowledge database - In a real app, this would come from a medical API or database
// This is a simplified version for demonstration purposes
const SYMPTOM_KNOWLEDGE_BASE: Record<string, SymptomData> = {
  headache: {
    id: 'headache',
    name: 'Dolor de cabeza',
    description: 'Dolor o molestia en cualquier parte de la cabeza',
    bodyRegion: 'head',
    severityLevel: 3,
    possibleConditions: [
      {
        id: 'migraine',
        name: 'Migraña',
        description: 'Dolor de cabeza intenso, generalmente unilateral, pulsátil, que puede estar acompañado de náuseas, vómitos y sensibilidad a la luz y sonido.',
        probability: 'alta',
        icd10Code: 'G43',
        medicalTerms: ['Hemicránea', 'Migraña sin aura', 'Migraña con aura'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/migraine-headache/symptoms-causes/syc-20360201'
      },
      {
        id: 'tension_headache',
        name: 'Cefalea tensional',
        description: 'Dolor de cabeza bilateral, no pulsátil, descrito como una presión o tensión alrededor de la cabeza. Suele estar relacionado con el estrés y la tensión muscular.',
        probability: 'alta',
        icd10Code: 'G44.2',
        medicalTerms: ['Cefalea por tensión', 'Cefalea de tipo tensional'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/tension-headache/symptoms-causes/syc-20353977'
      },
      {
        id: 'sinusitis',
        name: 'Sinusitis',
        description: 'Inflamación de los senos paranasales que puede causar dolor facial, congestión nasal y secreción nasal.',
        probability: 'media',
        icd10Code: 'J01',
        medicalTerms: ['Rinosinusitis aguda', 'Sinusitis aguda', 'Sinusitis crónica'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/sinusitis/symptoms-causes/syc-20377580'
      }
    ],
    associatedSymptoms: [
      'nausea', 'vomiting', 'light_sensitivity', 'sound_sensitivity', 'vision_changes', 
      'neck_pain', 'dizziness', 'fever', 'nasal_congestion'
    ],
    redFlags: [
      {
        description: 'Inicio súbito e intenso ("el peor dolor de cabeza de mi vida")',
        urgencyLevel: 'emergency',
        action: 'Buscar atención médica de emergencia inmediatamente - podría ser indicativo de un sangrado cerebral'
      },
      {
        description: 'Dolor de cabeza con fiebre alta, rigidez de cuello, confusión o alteración del estado mental',
        urgencyLevel: 'emergency',
        action: 'Buscar atención médica de emergencia inmediatamente - podría ser indicativo de meningitis'
      },
      {
        description: 'Dolor de cabeza que empeora progresivamente durante días y no responde a medicamentos',
        urgencyLevel: 'urgent',
        action: 'Consultar a un médico en las próximas 24-48 horas'
      }
    ],
    followUpQuestions: [
      {
        id: 'headache_location',
        questionText: '¿Dónde se localiza principalmente el dolor?',
        questionType: 'multiple_choice',
        options: ['Un lado de la cabeza', 'Ambos lados', 'Frontal', 'En la parte posterior', 'Alrededor de los ojos/senos paranasales', 'Toda la cabeza'],
        medicalPurpose: 'Diferenciar entre migraña (unilateral) y cefalea tensional (bilateral)'
      },
      {
        id: 'headache_character',
        questionText: '¿Cómo describiría la sensación del dolor?',
        questionType: 'multiple_choice',
        options: ['Pulsátil/Palpitante', 'Opresivo/Presión', 'Punzante', 'Como una banda apretada', 'Sordo/Continuo'],
        medicalPurpose: 'Caracterizar el tipo de dolor para clasificación diagnóstica'
      }
    ],
    medicalSpecialties: ['Neurología', 'Medicina General']
  },
  chest_pain: {
    id: 'chest_pain',
    name: 'Dolor de pecho',
    description: 'Dolor, presión o molestia en cualquier parte del pecho',
    bodyRegion: 'chest',
    severityLevel: 8,
    possibleConditions: [
      {
        id: 'angina',
        name: 'Angina de pecho',
        description: 'Dolor o molestia en el pecho que ocurre cuando una parte del corazón no recibe suficiente sangre oxigenada.',
        probability: 'media',
        icd10Code: 'I20',
        medicalTerms: ['Angina estable', 'Angina inestable', 'Síndrome coronario agudo'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/angina/symptoms-causes/syc-20369373'
      },
      {
        id: 'myocardial_infarction',
        name: 'Infarto de miocardio',
        description: 'Obstrucción del flujo sanguíneo al músculo cardíaco, causando daño o muerte del tejido.',
        probability: 'baja',
        icd10Code: 'I21',
        medicalTerms: ['Ataque cardíaco', 'IAM', 'Infarto agudo de miocardio'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/heart-attack/symptoms-causes/syc-20373106'
      },
      {
        id: 'costochondritis',
        name: 'Costocondritis',
        description: 'Inflamación del cartílago que une las costillas al esternón.',
        probability: 'media',
        icd10Code: 'M94.0',
        medicalTerms: ['Síndrome de Tietze', 'Condritis costal'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/costochondritis/symptoms-causes/syc-20371175'
      },
      {
        id: 'gerd',
        name: 'Enfermedad por reflujo gastroesofágico',
        description: 'Condición en la que el ácido del estómago fluye de regreso al esófago, causando irritación.',
        probability: 'alta',
        icd10Code: 'K21',
        medicalTerms: ['ERGE', 'Reflujo ácido', 'Pirosis'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/gerd/symptoms-causes/syc-20361940'
      }
    ],
    associatedSymptoms: [
      'shortness_of_breath', 'sweating', 'nausea', 'arm_pain', 'jaw_pain', 
      'back_pain', 'dizziness', 'fatigue', 'heartburn', 'palpitations'
    ],
    redFlags: [
      {
        description: 'Dolor de pecho intenso acompañado de dificultad para respirar, sudoración o presión/opresión en el pecho',
        urgencyLevel: 'emergency',
        action: 'Llamar a emergencias (911) inmediatamente - podría ser un ataque cardíaco'
      },
      {
        description: 'Dolor de pecho repentino e intenso que se irradia a la espalda',
        urgencyLevel: 'emergency',
        action: 'Buscar atención médica de emergencia inmediatamente - podría ser una disección aórtica'
      }
    ],
    followUpQuestions: [
      {
        id: 'chest_pain_radiation',
        questionText: '¿El dolor se irradia o extiende a otras partes del cuerpo?',
        questionType: 'multiple_choice',
        options: ['No', 'Al brazo izquierdo', 'Al cuello o mandíbula', 'A la espalda', 'A ambos brazos'],
        medicalPurpose: 'Evaluar posible origen cardíaco (irradiación típica a brazo izquierdo y mandíbula)'
      },
      {
        id: 'chest_pain_triggers',
        questionText: '¿Qué desencadena o empeora el dolor?',
        questionType: 'multiple_choice',
        options: ['Esfuerzo físico', 'Estrés emocional', 'Comer', 'Respirar profundo', 'Cambiar de posición', 'Ocurre en reposo'],
        medicalPurpose: 'Diferenciar entre dolor de origen cardíaco (esfuerzo) vs musculoesquelético (movimiento) o digestivo (comidas)'
      }
    ],
    medicalSpecialties: ['Cardiología', 'Medicina General', 'Gastroenterología', 'Medicina Interna']
  },
  abdominal_pain: {
    id: 'abdominal_pain',
    name: 'Dolor abdominal',
    description: 'Dolor o molestia en cualquier parte del abdomen',
    bodyRegion: 'abdomen',
    severityLevel: 5,
    possibleConditions: [
      {
        id: 'gastritis',
        name: 'Gastritis',
        description: 'Inflamación del revestimiento del estómago que puede causar dolor abdominal, náuseas, vómitos o sensación de llenura.',
        probability: 'alta',
        icd10Code: 'K29',
        medicalTerms: ['Gastritis aguda', 'Gastritis crónica', 'Gastropatía erosiva'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/gastritis/symptoms-causes/syc-20355807'
      },
      {
        id: 'ibs',
        name: 'Síndrome del intestino irritable',
        description: 'Trastorno intestinal crónico que causa dolor abdominal, distensión y cambios en los hábitos intestinales.',
        probability: 'media',
        icd10Code: 'K58',
        medicalTerms: ['SII', 'Colon irritable', 'Síndrome de colon irritable'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/irritable-bowel-syndrome/symptoms-causes/syc-20360016'
      },
      {
        id: 'appendicitis',
        name: 'Apendicitis',
        description: 'Inflamación del apéndice que puede causar dolor intenso, especialmente en el lado inferior derecho del abdomen.',
        probability: 'baja',
        icd10Code: 'K35',
        medicalTerms: ['Apendicitis aguda', 'Emergencia quirúrgica abdominal'],
        moreInfoUrl: 'https://www.mayoclinic.org/es-es/diseases-conditions/appendicitis/symptoms-causes/syc-20369543'
      }
    ],
    associatedSymptoms: [
      'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating', 
      'fever', 'loss_of_appetite', 'weight_loss'
    ],
    redFlags: [
      {
        description: 'Dolor abdominal intenso y repentino, como un cuchillo, especialmente si se acompaña de fiebre',
        urgencyLevel: 'emergency',
        action: 'Buscar atención médica de emergencia inmediatamente - podría ser apendicitis u otra emergencia abdominal'
      },
      {
        description: 'Dolor abdominal severo acompañado de vómitos con sangre o heces negras/con sangre',
        urgencyLevel: 'emergency',
        action: 'Buscar atención médica de emergencia inmediatamente - podría ser una hemorragia digestiva'
      }
    ],
    followUpQuestions: [
      {
        id: 'abdominal_pain_location',
        questionText: '¿En qué parte del abdomen siente el dolor principalmente?',
        questionType: 'multiple_choice',
        options: ['Superior central (epigastrio)', 'Superior derecho', 'Superior izquierdo', 'Central (periumbilical)', 'Inferior derecho', 'Inferior izquierdo', 'Inferior central (suprapúbico)', 'Difuso (todo el abdomen)'],
        medicalPurpose: 'Localizar el dolor para identificar posibles órganos afectados'
      },
      {
        id: 'abdominal_pain_relation_to_meals',
        questionText: '¿Cómo se relaciona el dolor con las comidas?',
        questionType: 'multiple_choice',
        options: ['Empeora después de comer', 'Mejora después de comer', 'Empeora con el estómago vacío', 'No tiene relación con las comidas'],
        medicalPurpose: 'Diferenciar entre posibles causas digestivas (úlcera, gastritis, reflujo, etc.)'
      }
    ],
    medicalSpecialties: ['Gastroenterología', 'Medicina General', 'Cirugía General']
  }
};

class SymptomAnalysisService {
  /**
   * Get comprehensive information about a symptom
   */
  async getSymptomData(symptomId: string): Promise<SymptomData | null> {
    try {
      // In a real app, this would fetch from a database or API
      // For now, we'll use our local knowledge base
      return SYMPTOM_KNOWLEDGE_BASE[symptomId] || null;
    } catch (error) {
      console.error('Error fetching symptom data:', error);
      return null;
    }
  }

  /**
   * Analyze symptoms based on questionnaire responses
   */
  async analyzeSymptoms(
    primarySymptomId: string, 
    answers: Record<string, any>,
    patientInfo?: { age?: number; gender?: string }
  ): Promise<AnalysisResult> {
    try {
      // Get symptom data from knowledge base
      const symptomData = await this.getSymptomData(primarySymptomId);
      
      if (!symptomData) {
        throw new Error('Symptom not found in knowledge base');
      }
      
      // Extract relevant information from answers
      const duration = answers.duration || 'unknown';
      const severity = this.determineSeverity(answers);
      const pattern = this.determinePattern(answers);
      
      // Detect red flags
      const redFlagsDetected = this.detectRedFlags(symptomData, answers);
      
      // Determine urgency based on severity and red flags
      const urgency = this.determineUrgency(severity, redFlagsDetected);
      
      // Adjust condition probabilities based on answers
      const adjustedConditions = this.adjustConditionProbabilities(
        symptomData.possibleConditions,
        answers,
        patientInfo
      );
      
      // Select appropriate medical specialties
      const recommendedSpecialties = this.determineSpecialties(
        symptomData.medicalSpecialties,
        adjustedConditions,
        urgency
      );
      
      // Determine recommended tests
      const recommendedTests = this.determineRecommendedTests(
        primarySymptomId,
        adjustedConditions,
        severity
      );
      
      // Generate self-care recommendations
      const selfCareRecommendations = this.generateSelfCareRecommendations(
        primarySymptomId,
        answers,
        severity
      );
      
      // Create the analysis result
      const result: AnalysisResult = {
        patientInfo: patientInfo ? {
          age: patientInfo.age,
          gender: patientInfo.gender,
          hasChronicConditions: answers.has_chronic_conditions === 'true'
        } : undefined,
        primarySymptom: {
          id: primarySymptomId,
          name: symptomData.name,
          bodyRegion: symptomData.bodyRegion,
          duration,
          severity,
          pattern
        },
        associatedSymptoms: this.extractAssociatedSymptoms(answers),
        possibleConditions: adjustedConditions,
        redFlagsDetected,
        severityAssessment: severity,
        urgencyAssessment: urgency,
        recommendedSpecialties,
        recommendedTests,
        selfCareRecommendations,
        differentialFactors: this.generateDifferentialFactors(answers, symptomData)
      };
      
      // In a real app, save the analysis to the database
      // await this.saveAnalysisToDatabase(result);
      
      return result;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      
      // Return a basic fallback analysis
      return this.generateFallbackAnalysis(primarySymptomId);
    }
  }

  /**
   * Save symptom check results to the database
   */
  async saveSymptomCheck(checkData: {
    user_id?: string;
    symptom_id: string;
    severity_level: 'low' | 'moderate' | 'high';
    urgency_level: 'routine' | 'soon' | 'urgent' | 'emergency';
    answers: Record<string, any>;
    analysis_result: any;
  }) {
    try {
      // In a real app, this would save to the database
      console.log('Saving symptom check:', checkData);
      
      // For demonstration, we'll just mock a successful save
      return {
        id: `symptom_check_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...checkData
      };
    } catch (error) {
      console.error('Error saving symptom check:', error);
      throw error;
    }
  }

  /**
   * Helper method to determine severity level from answers
   */
  private determineSeverity(answers: Record<string, any>): 'low' | 'moderate' | 'high' {
    // Look for pain or severity scale answers
    const severityKeys = ['pain_level', 'severity', 'intensity'];
    let severityValue = 0;
    
    for (const key of severityKeys) {
      if (answers[key]) {
        const value = typeof answers[key] === 'string' 
          ? parseInt(answers[key].replace(/[^0-9]/g, ''), 10) 
          : answers[key];
          
        if (!isNaN(value)) {
          severityValue = value;
          break;
        }
      }
    }
    
    // If no explicit severity, check duration and impact
    if (severityValue === 0) {
      // Check if the symptom affects daily activities
      const affectsActivities = answers.affects_daily_activities === 'true' || 
                               answers.limits_activities === 'true' ||
                               answers.affects_sleep === 'true';
                               
      // Check duration
      const isLongDuration = answers.duration && (
        answers.duration.includes('semana') || 
        answers.duration.includes('mes') || 
        answers.duration.includes('año')
      );
      
      if (affectsActivities && isLongDuration) {
        return 'high';
      } else if (affectsActivities || isLongDuration) {
        return 'moderate';
      }
      
      return 'low';
    }
    
    // Map numeric severity to categories
    if (severityValue >= 7) return 'high';
    if (severityValue >= 4) return 'moderate';
    return 'low';
  }

  /**
   * Helper method to determine symptom pattern
   */
  private determinePattern(answers: Record<string, any>): 'constant' | 'intermittent' | 'progressive' | 'cyclic' | undefined {
    const patternKey = 'pattern';
    
    if (!answers[patternKey]) return undefined;
    
    const patternValue = answers[patternKey].toLowerCase();
    
    if (patternValue.includes('constante')) return 'constant';
    if (patternValue.includes('intermitente') || patternValue.includes('va y viene')) return 'intermittent';
    if (patternValue.includes('progresivo') || patternValue.includes('empeora')) return 'progressive';
    if (patternValue.includes('cíclico') || patternValue.includes('regular')) return 'cyclic';
    
    return undefined;
  }

  /**
   * Helper method to detect red flags from symptom data and answers
   */
  private detectRedFlags(symptomData: SymptomData, answers: Record<string, any>): RedFlag[] {
    if (!symptomData.redFlags) return [];
    
    const detectedFlags: RedFlag[] = [];
    
    // Simple keyword matching for demonstration
    // In a real app, this would use more sophisticated analysis
    for (const flag of symptomData.redFlags) {
      const flagDescription = flag.description.toLowerCase();
      const answerValues = Object.values(answers).map(v => 
        typeof v === 'string' ? v.toLowerCase() : ''
      );
      
      // Look for key terms in answers
      const matchesFlag = answerValues.some(value => {
        if (!value) return false;
        
        // Check for red flag indicators
        if (flagDescription.includes('súbito') && value.includes('repentino')) return true;
        if (flagDescription.includes('fiebre') && value.includes('fiebre')) return true;
        if (flagDescription.includes('intenso') && 
            (value.includes('intenso') || value.includes('severo'))) return true;
        if (flagDescription.includes('peor dolor') && 
            value.includes('peor dolor')) return true;
        
        return false;
      });
      
      if (matchesFlag) {
        detectedFlags.push(flag);
      }
    }
    
    return detectedFlags;
  }

  /**
   * Helper method to determine urgency based on severity and red flags
   */
  private determineUrgency(
    severity: 'low' | 'moderate' | 'high',
    redFlags: RedFlag[]
  ): 'routine' | 'soon' | 'urgent' | 'emergency' {
    // Check for emergency red flags first
    if (redFlags.some(flag => flag.urgencyLevel === 'emergency')) {
      return 'emergency';
    }
    
    // Check for urgent red flags
    if (redFlags.some(flag => flag.urgencyLevel === 'urgent')) {
      return 'urgent';
    }
    
    // Base on severity if no red flags detected
    if (severity === 'high') return 'urgent';
    if (severity === 'moderate') return 'soon';
    return 'routine';
  }

  /**
   * Helper method to adjust condition probabilities based on answers
   */
  private adjustConditionProbabilities(
    conditions: PossibleCondition[],
    answers: Record<string, any>,
    patientInfo?: { age?: number; gender?: string }
  ): PossibleCondition[] {
    // In a real app, this would use a more sophisticated algorithm
    // For demonstration, we'll do some simple adjustments
    
    return conditions.map(condition => {
      let probability = condition.probability;
      
      // Example adjustments based on common clinical reasoning
      if (condition.name === 'Migraña' && 
          answers.headache_location === 'Un lado de la cabeza' &&
          answers.associated_symptoms?.includes('light_sensitivity')) {
        probability = 'alta';
      }
      
      if (condition.name === 'Cefalea tensional' && 
          answers.headache_character === 'Como una banda apretada' &&
          !answers.associated_symptoms?.includes('nausea')) {
        probability = 'alta';
      }
      
      if (condition.name === 'Angina de pecho' && 
          answers.chest_pain_triggers === 'Esfuerzo físico' &&
          answers.chest_pain_radiation === 'Al brazo izquierdo') {
        probability = 'alta';
      }
      
      if (condition.name === 'Gastritis' && 
          answers.abdominal_pain_location === 'Superior central (epigastrio)' &&
          answers.abdominal_pain_relation_to_meals === 'Empeora después de comer') {
        probability = 'alta';
      }
      
      return { ...condition, probability };
    });
  }

  /**
   * Helper method to determine appropriate medical specialties
   */
  private determineSpecialties(
    baseSpecialties: string[],
    conditions: PossibleCondition[],
    urgency: 'routine' | 'soon' | 'urgent' | 'emergency'
  ): string[] {
    // Start with base specialties
    const specialties = [...baseSpecialties];
    
    // Add emergency medicine for urgent cases
    if (urgency === 'emergency' || urgency === 'urgent') {
      if (!specialties.includes('Medicina de Emergencia')) {
        specialties.unshift('Medicina de Emergencia');
      }
    }
    
    // Ensure at least one specialty is recommended
    if (specialties.length === 0) {
      specialties.push('Medicina General');
    }
    
    return specialties;
  }

  /**
   * Helper method to determine recommended medical tests
   */
  private determineRecommendedTests(
    symptomId: string,
    conditions: PossibleCondition[],
    severity: 'low' | 'moderate' | 'high'
  ): string[] {
    // Basic recommended tests by symptom
    const basicTests: Record<string, string[]> = {
      headache: [
        'Examen físico general',
        'Evaluación neurológica',
        'Medición de presión arterial'
      ],
      chest_pain: [
        'Electrocardiograma (ECG)',
        'Medición de presión arterial',
        'Auscultación cardíaca y pulmonar'
      ],
      abdominal_pain: [
        'Examen físico abdominal',
        'Análisis de sangre básico',
        'Examen de orina'
      ]
    };
    
    // Add more specific tests based on severity
    const additionalTests: Record<string, Record<string, string[]>> = {
      headache: {
        high: ['Tomografía computarizada cerebral', 'Resonancia magnética cerebral'],
        moderate: ['Análisis de sangre completo']
      },
      chest_pain: {
        high: ['Análisis de enzimas cardíacas', 'Radiografía de tórax', 'Ecocardiograma'],
        moderate: ['Radiografía de tórax', 'Prueba de esfuerzo']
      },
      abdominal_pain: {
        high: ['Ecografía abdominal', 'Tomografía computarizada abdominal'],
        moderate: ['Ecografía abdominal']
      }
    };
    
    // Combine basic and severity-specific tests
    let recommendedTests = basicTests[symptomId] || ['Examen físico general'];
    
    if (additionalTests[symptomId]) {
      if (severity === 'high' && additionalTests[symptomId].high) {
        recommendedTests = [...recommendedTests, ...additionalTests[symptomId].high];
      } else if (severity === 'moderate' && additionalTests[symptomId].moderate) {
        recommendedTests = [...recommendedTests, ...additionalTests[symptomId].moderate];
      }
    }
    
    return recommendedTests;
  }

  /**
   * Helper method to generate self-care recommendations
   */
  private generateSelfCareRecommendations(
    symptomId: string,
    answers: Record<string, any>,
    severity: 'low' | 'moderate' | 'high'
  ): string[] {
    // Basic recommendations by symptom
    const basicRecommendations: Record<string, string[]> = {
      headache: [
        'Descansar en un ambiente tranquilo y oscuro',
        'Mantenerse hidratado',
        'Aplicar compresas frías o calientes en la cabeza',
        'Evitar estímulos como luces brillantes o ruidos fuertes'
      ],
      chest_pain: [
        'Mantener un registro de cuándo ocurre el dolor y qué lo desencadena',
        'Evitar actividades que empeoren el dolor',
        'Consultar a un médico antes de tomar cualquier medicamento para el dolor'
      ],
      abdominal_pain: [
        'Mantener una hidratación adecuada',
        'Comer comidas pequeñas y ligeras',
        'Evitar alimentos grasosos, picantes o que le causen malestar',
        'Aplicar calor suave en el abdomen puede aliviar algunos tipos de dolor'
      ]
    };
    
    // Add general recommendations
    const generalRecommendations = [
      'Descansar adecuadamente',
      'Evitar el estrés excesivo',
      'No automedicarse sin consultar a un profesional'
    ];
    
    // Combine recommendations
    let recommendations = [
      ...(basicRecommendations[symptomId] || []),
      ...generalRecommendations
    ];
    
    // Add severity-specific recommendations
    if (severity === 'high') {
      recommendations.unshift(
        'Es importante buscar atención médica pronto para evaluar estos síntomas'
      );
    }
    
    return recommendations;
  }

  /**
   * Helper method to extract associated symptoms from answers
   */
  private extractAssociatedSymptoms(answers: Record<string, any>): string[] {
    const associatedKey = 'associated_symptoms';
    
    if (!answers[associatedKey]) return [];
    
    if (Array.isArray(answers[associatedKey])) {
      return answers[associatedKey];
    }
    
    if (typeof answers[associatedKey] === 'string') {
      // Split comma-separated values
      return answers[associatedKey]
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    
    return [];
  }

  /**
   * Helper method to generate differential diagnostic factors
   */
  private generateDifferentialFactors(
    answers: Record<string, any>,
    symptomData: SymptomData
  ): string[] {
    // In a real app, this would use sophisticated clinical reasoning
    // For demonstration, we'll generate some plausible factors
    
    const factors: string[] = [];
    
    // Add some generic factors based on the symptom
    if (symptomData.id === 'headache') {
      if (answers.headache_character === 'Pulsátil/Palpitante') {
        factors.push('El dolor pulsátil es característico de migraña');
      } else if (answers.headache_character === 'Como una banda apretada') {
        factors.push('La sensación de presión o banda alrededor de la cabeza es típica de cefalea tensional');
      }
      
      if (answers.associated_symptoms?.includes('nausea') || 
          answers.associated_symptoms?.includes('light_sensitivity')) {
        factors.push('Náuseas y sensibilidad a la luz son comunes en migrañas');
      }
    }
    
    if (symptomData.id === 'chest_pain') {
      if (answers.chest_pain_triggers === 'Esfuerzo físico' && 
          answers.chest_pain_radiation?.includes('brazo')) {
        factors.push('El dolor que se desencadena con esfuerzo y se irradia al brazo sugiere origen cardíaco');
      }
      
      if (answers.chest_pain_triggers === 'Respirar profundo' || 
          answers.chest_pain_triggers === 'Cambiar de posición') {
        factors.push('El dolor que empeora con la respiración o cambios de posición sugiere origen musculoesquelético o pleural');
      }
      
      if (answers.chest_pain_triggers === 'Comer') {
        factors.push('El dolor relacionado con las comidas sugiere origen digestivo');
      }
    }
    
    return factors;
  }

  /**
   * Generate a fallback analysis when detailed analysis fails
   */
  private generateFallbackAnalysis(symptomId: string): AnalysisResult {
    return {
      primarySymptom: {
        id: symptomId,
        name: SYMPTOM_KNOWLEDGE_BASE[symptomId]?.name || 'Síntoma',
        bodyRegion: SYMPTOM_KNOWLEDGE_BASE[symptomId]?.bodyRegion || 'general',
        severity: 'moderate'
      },
      possibleConditions: [
        {
          id: 'general_condition',
          name: 'Condición requeriendo evaluación',
          description: 'Sus síntomas requieren evaluación profesional para determinar la causa exacta.',
          probability: 'media'
        }
      ],
      redFlagsDetected: [],
      severityAssessment: 'moderate',
      urgencyAssessment: 'soon',
      recommendedSpecialties: ['Medicina General'],
      selfCareRecommendations: [
        'Consulte a un médico para una evaluación completa',
        'Mantenga un registro de sus síntomas para compartir con el profesional',
        'No se automedique sin supervisión médica'
      ]
    };
  }
}

// Create singleton instance
const symptomAnalysisService = new SymptomAnalysisService();
export default symptomAnalysisService;