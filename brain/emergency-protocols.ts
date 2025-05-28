/**
 * EMERGENCY PROTOCOLS CORE
 *
 * This file contains all emergency detection, triage, and escalation protocols
 * for the AI doctor system. It implements life-saving safety measures and
 * immediate response algorithms for critical medical situations.
 *
 * MEDICAL INTELLIGENCE:
 * - Comprehensive emergency keyword detection system
 * - Multi-level triage protocols with escalation triggers
 * - Chest pain emergency assessment algorithms
 * - Critical symptom combination detection
 * - Immediate 911 escalation protocols
 *
 * INTEGRATION:
 * - Primary safety layer for all clinical conversations
 * - Overrides normal diagnostic flow for emergencies
 * - Integrates with clinical logic for severity assessment
 * - Connects to Mexican emergency services context
 *
 * KEY ALGORITHMS:
 * - Pattern matching for emergency symptom descriptions
 * - Progressive chest pain assessment with automatic escalation
 * - Severity scoring for immediate vs urgent vs routine care
 * - Cultural context for Mexican emergency response systems
 */

export interface EmergencyAssessment {
  isEmergency: boolean;
  severity: 'IMMEDIATE' | 'URGENT' | 'ROUTINE';
  action: 'CALL_911' | 'GO_TO_ER' | 'URGENT_CARE' | 'CONTINUE_ASSESSMENT';
  message: string;
  escalationTriggers: string[];
}

export interface ChestPainProtocol {
  timeframe: string;
  intensity: number;
  radiation: boolean;
  associatedSymptoms: string[];
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * EMERGENCY KEYWORD DETECTION SYSTEM
 * Comprehensive pattern matching for life-threatening symptoms
 */
export class EmergencyDetection {

  // IMMEDIATE 911 KEYWORDS - Life-threatening symptoms
  private static readonly IMMEDIATE_EMERGENCY_KEYWORDS = [
    // Respiratory emergencies
    'no puedo respirar', 'dificultad para respirar', 'me ahogo',
    'no me llega el aire', 'me falta el aire completamente',
    'respiración muy rápida', 'jadeo', 'silbido al respirar',

    // Cardiac emergencies
    'dolor de pecho intenso', 'dolor muy fuerte en el pecho',
    'dolor como elefante', 'como si me aplastaran el pecho',
    'dolor insoportable en el pecho', 'presión fuerte en el pecho',
    'opresión torácica', 'latidos muy fuertes', 'dolor que se extiende',
    'dolor al brazo izquierdo', 'dolor a la mandíbula', 'sudoración profusa',

    // Neurological emergencies - STROKE FAST signs
    'perdí el conocimiento', 'me desmayé', 'convulsiones',
    'no siento el brazo', 'no puedo mover el brazo',
    'visión borrosa súbita', 'no puedo hablar bien',
    'mareo intenso con vómito', 'dolor de cabeza explosivo',
    'cara desviada', 'hablo raro', 'no puedo sonreír',
    'hormigueo', 'entumecimiento', 'debilidad súbita',
    'confusión súbita', 'pérdida de equilibrio',

    // Anaphylaxis - CRITICAL ADDITION
    'hinchado', 'ronchas', 'comezón en garganta',
    'lengua hinchada', 'labios hinchados', 'urticaria generalizada',
    'dificultad para tragar', 'sensación de muerte inminente',

    // Bleeding emergencies
    'sangrado abundante', 'hemorragia', 'vómito con sangre',
    'sangre en el vómito', 'sangrado que no para',
    'heces negras', 'sangre en las heces',

    // Pediatric red flags - CRITICAL ADDITION
    'no moja pañal', 'fontanela hundida', 'llanto inconsolable',
    'fiebre en bebé menor de 3 meses', 'convulsiones en niño',
    'dificultad para despertar', 'rigidez de cuello en niño',

    // Severe pain descriptors
    'dolor insoportable', 'peor dolor de mi vida',
    'dolor que me hace gritar', 'dolor nivel 10'
  ];

  // URGENT KEYWORDS - Require immediate medical attention but not 911
  private static readonly URGENT_KEYWORDS = [
    'dolor de pecho moderado', 'presión en el pecho',
    'dificultad leve para respirar', 'falta de aire al caminar',
    'mareo persistente', 'vómito persistente',
    'fiebre muy alta', 'temperatura mayor a 39°C',
    'dolor abdominal severo', 'dolor que empeora rápidamente'
  ];

  static assessEmergencyLevel(input: string, context?: { age?: number; isPregnant?: boolean }): EmergencyAssessment {
    const lowerInput = input.toLowerCase();

    // CRITICAL: Pregnancy & Pediatric Emergency Guardrails
    if (context?.isPregnant && (lowerInput.includes('dolor abdominal') || lowerInput.includes('sangrado'))) {
      return {
        isEmergency: true,
        severity: 'IMMEDIATE',
        action: 'CALL_911',
        message: '🚨 EMERGENCIA OBSTÉTRICA 🚨\n\nDolor abdominal o sangrado en embarazo requiere atención inmediata.\n\n**LLAME AL 911 AHORA**',
        escalationTriggers: ['pregnancy_abdominal_pain_bleeding']
      };
    }

    if (context?.age && context.age < 0.25 && lowerInput.includes('fiebre')) { // < 3 months
      return {
        isEmergency: true,
        severity: 'IMMEDIATE',
        action: 'CALL_911',
        message: '🚨 EMERGENCIA PEDIÁTRICA 🚨\n\nFiebre en bebé menor de 3 meses es emergencia médica.\n\n**LLAME AL 911 AHORA**',
        escalationTriggers: ['infant_fever_under_3_months']
      };
    }

    // Check for immediate emergencies first
    const immediateMatch = this.IMMEDIATE_EMERGENCY_KEYWORDS.find(keyword =>
      lowerInput.includes(keyword)
    );

    if (immediateMatch) {
      return {
        isEmergency: true,
        severity: 'IMMEDIATE',
        action: 'CALL_911',
        message: this.getImmediateEmergencyMessage(),
        escalationTriggers: [immediateMatch]
      };
    }

    // Check for urgent situations
    const urgentMatch = this.URGENT_KEYWORDS.find(keyword =>
      lowerInput.includes(keyword)
    );

    if (urgentMatch) {
      return {
        isEmergency: true,
        severity: 'URGENT',
        action: 'GO_TO_ER',
        message: this.getUrgentCareMessage(),
        escalationTriggers: [urgentMatch]
      };
    }

    return {
      isEmergency: false,
      severity: 'ROUTINE',
      action: 'CONTINUE_ASSESSMENT',
      message: '',
      escalationTriggers: []
    };
  }

  private static getImmediateEmergencyMessage(): string {
    return `🚨 **EMERGENCIA MÉDICA INMEDIATA** 🚨

**LLAME AL 911 AHORA MISMO**

Los síntomas que describe requieren atención médica de emergencia inmediata. No espere, no conduzca usted mismo.

**Acciones inmediatas:**
• Llame al 911 o vaya al hospital más cercano
• Si está solo, pida ayuda a alguien
• Manténgase calmado y en posición cómoda
• No tome medicamentos sin supervisión médica

**Números de emergencia en México:**
• Emergencias generales: 911
• Cruz Roja: 065
• Bomberos: 911

**Esta consulta virtual NO puede reemplazar la atención de emergencia.**`;
  }

  private static getUrgentCareMessage(): string {
    return `⚠️ **ATENCIÓN MÉDICA URGENTE REQUERIDA** ⚠️

Sus síntomas requieren evaluación médica inmediata en un servicio de urgencias.

**Recomendaciones:**
• Acuda al hospital más cercano en las próximas 2 horas
• No espere a que los síntomas empeoren
• Lleve identificación y lista de medicamentos
• Si los síntomas empeoran, llame al 911

**Si desarrolla alguno de estos síntomas, llame al 911:**
• Dificultad severa para respirar
• Dolor de pecho intenso
• Pérdida de conocimiento
• Sangrado abundante`;
  }
}

/**
 * CHEST PAIN EMERGENCY PROTOCOL
 * Specialized assessment for cardiac emergencies
 */
export class ChestPainProtocol {

  static assessChestPain(timeframe: string, intensity: number, symptoms: string[]): EmergencyAssessment {
    const riskFactors = this.calculateRiskFactors(timeframe, intensity, symptoms);

    if (riskFactors.riskLevel === 'HIGH') {
      return {
        isEmergency: true,
        severity: 'IMMEDIATE',
        action: 'CALL_911',
        message: this.getHighRiskChestPainMessage(),
        escalationTriggers: riskFactors.triggers
      };
    }

    if (riskFactors.riskLevel === 'MODERATE') {
      return {
        isEmergency: true,
        severity: 'URGENT',
        action: 'GO_TO_ER',
        message: this.getModerateRiskChestPainMessage(),
        escalationTriggers: riskFactors.triggers
      };
    }

    return {
      isEmergency: false,
      severity: 'ROUTINE',
      action: 'CONTINUE_ASSESSMENT',
      message: 'Continue chest pain assessment',
      escalationTriggers: []
    };
  }

  private static calculateRiskFactors(timeframe: string, intensity: number, symptoms: string[]) {
    const triggers: string[] = [];
    let riskLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';

    // High-risk criteria
    if (intensity >= 7) {
      triggers.push('Severe pain intensity (7-10/10)');
      riskLevel = 'HIGH';
    }

    if (symptoms.includes('radiation_arm') || symptoms.includes('radiation_jaw')) {
      triggers.push('Pain radiation to arm/jaw (classic heart attack symptoms)');
      riskLevel = 'HIGH';
    }

    if (symptoms.includes('breathing_difficulty') || symptoms.includes('sweating')) {
      triggers.push('Associated breathing difficulty or sweating');
      riskLevel = 'HIGH';
    }

    // Moderate-risk criteria
    if (timeframe === 'prolonged' && riskLevel !== 'HIGH') {
      triggers.push('Prolonged chest pain (>2 hours)');
      riskLevel = 'MODERATE';
    }

    if (intensity >= 4 && intensity < 7 && riskLevel !== 'HIGH') {
      triggers.push('Moderate pain intensity');
      riskLevel = 'MODERATE';
    }

    return { riskLevel, triggers };
  }

  private static getHighRiskChestPainMessage(): string {
    return `🚨 **EMERGENCIA CARDÍACA CONFIRMADA** 🚨

**LLAME AL 911 INMEDIATAMENTE**

Los síntomas que presenta son consistentes con un posible infarto al miocardio u otra emergencia cardíaca.

**ACCIONES INMEDIATAS:**
• Llame al 911 AHORA
• NO conduzca usted mismo
• Siéntese o recuéstese cómodamente
• Si tiene aspirina y no es alérgico, mastique 1 tableta
• Afloje ropa ajustada
• Manténgase calmado

**NO ESPERE - CADA MINUTO CUENTA**`;
  }

  private static getModerateRiskChestPainMessage(): string {
    return `⚠️ **DOLOR DE PECHO - EVALUACIÓN URGENTE** ⚠️

Su dolor de pecho requiere evaluación médica inmediata para descartar problemas cardíacos.

**Vaya al hospital MÁS CERCANO ahora:**
• No espere a que empeore
• Lleve identificación y lista de medicamentos
• Informe que tiene dolor de pecho

**Llame al 911 si desarrolla:**
• Dolor más intenso
• Dificultad para respirar
• Sudoración profusa
• Náuseas o vómito
• Dolor que se extiende al brazo o mandíbula`;
  }
}

/**
 * MEXICAN EMERGENCY SERVICES CONTEXT
 * Localized emergency response information
 */
export class MexicanEmergencyServices {

  static readonly EMERGENCY_NUMBERS = {
    general: '911',
    redCross: '065',
    fire: '911',
    police: '911'
  };

  static readonly COMMON_HOSPITALS = [
    'Hospital General',
    'IMSS',
    'ISSSTE',
    'Cruz Roja',
    'Hospital Privado más cercano'
  ];

  static getLocalizedEmergencyMessage(): string {
    return `**NÚMEROS DE EMERGENCIA EN MÉXICO:**
• Emergencias generales: 911
• Cruz Roja Mexicana: 065
• Bomberos: 911
• Policía: 911

**HOSPITALES COMUNES:**
• Hospital General de su localidad
• Clínica IMSS más cercana
• Hospital ISSSTE
• Cruz Roja Mexicana
• Hospital privado más cercano

**IMPORTANTE:** En México, el 911 es gratuito desde cualquier teléfono.`;
  }
}

/**
 * ESCALATION TRIGGER SYSTEM
 * Manages when to escalate from assessment to emergency action
 */
export class EscalationManager {

  static shouldEscalateToEmergency(
    symptoms: string[],
    duration: string,
    severity: number,
    associatedSymptoms: string[]
  ): boolean {

    // Immediate escalation triggers
    const immediateEscalation = [
      severity >= 8,
      associatedSymptoms.includes('breathing_difficulty'),
      associatedSymptoms.includes('chest_pain'),
      associatedSymptoms.includes('loss_of_consciousness'),
      duration === 'sudden_onset' && severity >= 6
    ];

    return immediateEscalation.some(trigger => trigger);
  }

  static getEscalationReason(
    symptoms: string[],
    severity: number,
    associatedSymptoms: string[]
  ): string {
    if (severity >= 8) return 'Severe pain intensity requires immediate attention';
    if (associatedSymptoms.includes('breathing_difficulty')) return 'Breathing difficulty is a medical emergency';
    if (associatedSymptoms.includes('chest_pain')) return 'Chest pain requires emergency cardiac evaluation';

    return 'Multiple risk factors present requiring immediate medical attention';
  }
}
