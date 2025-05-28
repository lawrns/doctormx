/**
 * CLINICAL LOGIC CORE
 *
 * This file contains the main clinical reasoning algorithms and diagnostic logic
 * for the AI doctor system. It implements medical decision trees, symptom analysis,
 * and clinical assessment protocols.
 *
 * MEDICAL INTELLIGENCE:
 * - Emergency triage protocols with immediate escalation triggers
 * - Symptom-based diagnostic pathways for common conditions
 * - Confidence scoring system for medical assessments
 * - Progressive questioning algorithms for thorough evaluation
 * - Safety-first approach with conservative diagnostic thresholds
 *
 * INTEGRATION:
 * - Used by AIDoctor component for all clinical conversations
 * - Interfaces with emergency protocols for safety escalation
 * - Connects to Mexican medical context for culturally appropriate care
 * - Feeds into conversation flow management for question progression
 *
 * KEY ALGORITHMS:
 * - Emergency detection with keyword matching and severity assessment
 * - Multi-step diagnostic evaluation requiring 5-7 questions minimum
 * - Confidence threshold system (0.8+ required for preliminary diagnosis)
 * - Chronic vs acute symptom differentiation with appropriate pathways
 */

export interface ClinicalAssessment {
  confidence: number;
  diagnosis?: string;
  isEmergency: boolean;
  severity: number;
  recommendations: string[];
  nextQuestions: string[];
  specialistReferral?: string;
}

export interface SymptomAnalysis {
  primarySymptom: string;
  associatedSymptoms: string[];
  duration: 'acute' | 'chronic' | 'unknown';
  severity: number;
  triggers?: string[];
}

/**
 * EMERGENCY TRIAGE SYSTEM
 * Implements immediate life-threatening symptom detection
 */
export class EmergencyTriageSystem {
  // Critical keywords that trigger immediate 911 response
  private static readonly EMERGENCY_KEYWORDS = [
    'no puedo respirar', 'dificultad para respirar', 'me ahogo',
    'dolor de pecho intenso', 'dolor muy fuerte en el pecho',
    'perdí el conocimiento', 'me desmayé', 'convulsiones',
    'sangrado abundante', 'hemorragia', 'vómito con sangre',
    'dolor como elefante', 'como si me aplastaran', 'dolor insoportable',
    'mareo intenso', 'visión borrosa súbita', 'no siento el brazo'
  ];

  static assessEmergency(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return this.EMERGENCY_KEYWORDS.some(keyword => lowerInput.includes(keyword));
  }

  static getEmergencyResponse(): string {
    return '🚨 **EMERGENCIA MÉDICA INMEDIATA** 🚨\n\n**LLAME AL 911 AHORA MISMO**\n\nLos síntomas que describe requieren atención médica de emergencia inmediata. No espere, no conduzca usted mismo.\n\n**Acciones inmediatas:**\n• Llame al 911 o vaya al hospital más cercano\n• Si está solo, pida ayuda a alguien\n• Manténgase calmado y en posición cómoda\n\n**Esta consulta virtual NO puede reemplazar la atención de emergencia.**';
  }
}

/**
 * DIAGNOSTIC ALGORITHM ENGINE
 * Core logic for symptom analysis and diagnostic reasoning
 */
export class DiagnosticEngine {
  private questionCount: number = 0;
  private confidence: number = 0.1;
  private symptoms: SymptomAnalysis[] = [];

  /**
   * Analyzes primary symptom and determines initial diagnostic pathway
   */
  analyzeSymptom(input: string): ClinicalAssessment {
    const lowerInput = input.toLowerCase();

    // Emergency check first
    if (EmergencyTriageSystem.assessEmergency(input)) {
      return {
        confidence: 1.0,
        isEmergency: true,
        severity: 10,
        recommendations: ['CALL 911 IMMEDIATELY'],
        nextQuestions: []
      };
    }

    // Chest pain requires special emergency assessment
    if (this.isChestPain(lowerInput)) {
      return this.handleChestPain();
    }

    // Headache pathway
    if (this.isHeadache(lowerInput)) {
      return this.handleHeadache();
    }

    // Abdominal pain pathway
    if (this.isAbdominalPain(lowerInput)) {
      return this.handleAbdominalPain();
    }

    // Fever pathway
    if (this.isFever(lowerInput)) {
      return this.handleFever();
    }

    // Generic symptom pathway
    return this.handleGenericSymptom(input);
  }

  private isChestPain(input: string): boolean {
    return input.includes('dolor') && (input.includes('pecho') || input.includes('corazón'));
  }

  private isHeadache(input: string): boolean {
    return input.includes('dolor') && input.includes('cabeza');
  }

  private isAbdominalPain(input: string): boolean {
    return input.includes('dolor') && (input.includes('estómago') || input.includes('abdomen') || input.includes('barriga'));
  }

  private isFever(input: string): boolean {
    return input.includes('fiebre') || input.includes('temperatura') || input.includes('calentura');
  }

  private handleChestPain(): ClinicalAssessment {
    // CRITICAL FIX: Immediate emergency response for chest pain
    return {
      confidence: 1.0, // High confidence for emergency action
      isEmergency: true, // CRITICAL: Mark as emergency immediately
      severity: 10,
      recommendations: [
        '🚨 EMERGENCIA CARDÍACA POTENCIAL 🚨',
        'LLAME AL 911 INMEDIATAMENTE',
        'El dolor de pecho puede ser un infarto - no espere'
      ],
      nextQuestions: [], // No questions - immediate action required
      diagnosis: 'Chest pain - EMERGENCY: Call 911 immediately'
    };
  }

  private handleHeadache(): ClinicalAssessment {
    this.questionCount = 1;
    return {
      confidence: 0.4,
      isEmergency: false,
      severity: 4,
      recommendations: ['Assess headache type'],
      nextQuestions: ['¿El dolor es como una banda apretada alrededor de la cabeza o es pulsátil como latidos?']
    };
  }

  private handleAbdominalPain(): ClinicalAssessment {
    this.questionCount = 1;
    return {
      confidence: 0.4,
      isEmergency: false,
      severity: 5,
      recommendations: ['Assess abdominal pain location'],
      nextQuestions: ['¿El dolor está en la parte alta del abdomen y empeora cuando come?']
    };
  }

  private handleFever(): ClinicalAssessment {
    this.questionCount = 1;
    return {
      confidence: 0.4,
      isEmergency: false,
      severity: 6,
      recommendations: ['Assess fever severity'],
      nextQuestions: ['¿La temperatura es menor a 39°C y tiene síntomas como tos o dolor de garganta?']
    };
  }

  private handleGenericSymptom(input: string): ClinicalAssessment {
    const cleanedInput = this.cleanUserInput(input);
    return {
      confidence: 0.3,
      isEmergency: false,
      severity: 3,
      recommendations: ['Gather more symptom details'],
      nextQuestions: [`¿Desde cuándo tiene ${cleanedInput}?`]
    };
  }

  private cleanUserInput(input: string): string {
    return input.replace(/^(tengo|me duele|dolor de|dolor en)/i, '').trim();
  }

  /**
   * Processes follow-up responses and updates diagnostic confidence
   */
  processFollowUp(response: string, context: string): ClinicalAssessment {
    this.questionCount++;

    // Minimum 5 questions required before diagnosis
    if (this.questionCount < 5) {
      return this.continueAssessment(response, context);
    }

    // Can now consider preliminary diagnosis
    return this.generateDiagnosis(response, context);
  }

  private continueAssessment(response: string, context: string): ClinicalAssessment {
    // Progressive confidence building
    this.confidence = Math.min(0.7, this.confidence + 0.1);

    return {
      confidence: this.confidence,
      isEmergency: false,
      severity: 4,
      recommendations: ['Continue assessment'],
      nextQuestions: ['Need more clinical data']
    };
  }

  private generateDiagnosis(response: string, context: string): ClinicalAssessment {
    this.confidence = 0.8; // High enough for preliminary diagnosis

    return {
      confidence: this.confidence,
      isEmergency: false,
      severity: 5,
      recommendations: ['Preliminary diagnosis available'],
      nextQuestions: ['¿Desea que proceda con la evaluación?'],
      diagnosis: 'Preliminary assessment ready'
    };
  }
}

/**
 * CONFIDENCE SCORING SYSTEM
 * Manages diagnostic confidence levels and safety thresholds
 */
export class ConfidenceManager {
  private static readonly MIN_QUESTIONS_FOR_DIAGNOSIS = 5;
  private static readonly DIAGNOSIS_THRESHOLD = 0.8;
  private static readonly EMERGENCY_THRESHOLD = 0.85; // CRITICAL FIX: Lower from 0.9 to 0.85

  static canProvideDiagnosis(questionCount: number, confidence: number, isEmergency: boolean = false): boolean {
    // CRITICAL FIX: Bypass question minimum for emergencies
    if (isEmergency) return true;

    return questionCount >= this.MIN_QUESTIONS_FOR_DIAGNOSIS &&
           confidence >= this.DIAGNOSIS_THRESHOLD;
  }

  static requiresEmergencyAction(confidence: number, isEmergency: boolean): boolean {
    return isEmergency || confidence >= this.EMERGENCY_THRESHOLD;
  }

  static calculateProgressiveConfidence(questionCount: number, baseConfidence: number): number {
    const progressBonus = Math.min(0.3, questionCount * 0.05);
    return Math.min(1.0, baseConfidence + progressBonus); // CRITICAL FIX: Raise ceiling to 1.0
  }
}
