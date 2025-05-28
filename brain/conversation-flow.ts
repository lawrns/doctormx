/**
 * CONVERSATION FLOW MANAGEMENT
 *
 * This file contains the conversation state management, question progression logic,
 * confidence scoring systems, and response generation algorithms for the AI doctor.
 *
 * MEDICAL INTELLIGENCE:
 * - Progressive questioning algorithms that build diagnostic confidence
 * - Context-aware response generation based on medical protocols
 * - State management for multi-turn clinical conversations
 * - Answer option generation that matches specific medical questions
 * - Conversation branching logic for different medical pathways
 *
 * INTEGRATION:
 * - Manages conversation state across all clinical interactions
 * - Integrates with clinical logic for medical decision making
 * - Connects to emergency protocols for safety escalation
 * - Interfaces with Mexican medical context for cultural appropriateness
 *
 * KEY ALGORITHMS:
 * - Progressive confidence building through structured questioning
 * - Context-sensitive answer option generation
 * - Conversation branching based on symptom type and severity
 * - State persistence for complex multi-step assessments
 */

export interface ConversationState {
  sessionId: string;
  currentStep: number;
  questionCount: number;
  confidence: number;
  primarySymptom?: string;
  symptoms: string[];
  responses: ConversationResponse[];
  context: MedicalContext;
  isEmergency: boolean;
  needsEscalation: boolean;
}

export interface ConversationResponse {
  question: string;
  answer: string;
  answerType: 'button' | 'text' | 'voice';
  timestamp: Date;
  confidence: number;
}

export interface MedicalContext {
  patientType: 'self' | 'family';
  familyMember?: string;
  age?: number;
  gender?: string;
  previousConditions?: string[];
  currentMedications?: string[];
}

export interface QuestionFlow {
  id: string;
  question: string;
  answerOptions: AnswerOption[];
  nextQuestions: Record<string, string>;
  confidenceImpact: number;
  emergencyTriggers?: string[];
}

export interface AnswerOption {
  text: string;
  value: string;
  nextAction: 'continue' | 'escalate' | 'diagnose' | 'refer';
}

/**
 * CONVERSATION STATE MANAGER
 * Manages the state and progression of clinical conversations
 */
export class ConversationStateManager {
  private state: ConversationState;

  constructor(sessionId: string) {
    this.state = {
      sessionId,
      currentStep: 0,
      questionCount: 0,
      confidence: 0.1,
      symptoms: [],
      responses: [],
      context: { patientType: 'self' },
      isEmergency: false,
      needsEscalation: false
    };
  }

  updateState(response: ConversationResponse): void {
    this.state.responses.push(response);
    this.state.questionCount++;
    this.state.confidence = this.calculateProgressiveConfidence();
    this.state.currentStep++;
  }

  private calculateProgressiveConfidence(): number {
    const baseConfidence = 0.1;

    // HIGH PRIORITY: Weight questions by information gain
    const informationGainBonus = this.calculateInformationGain();
    const qualityBonus = this.assessResponseQuality();
    const consistencyPenalty = this.assessResponseConsistency();

    return Math.min(1.0, baseConfidence + informationGainBonus + qualityBonus - consistencyPenalty);
  }

  private calculateInformationGain(): number {
    // Weight questions by their diagnostic value
    const responses = this.state.responses;
    let totalGain = 0;

    responses.forEach(response => {
      // High-value questions get more weight
      if (this.isHighValueQuestion(response.question)) {
        totalGain += 0.15; // High information gain
      } else if (this.isMediumValueQuestion(response.question)) {
        totalGain += 0.10; // Medium information gain
      } else {
        totalGain += 0.05; // Low information gain
      }
    });

    return Math.min(0.6, totalGain);
  }

  private isHighValueQuestion(question: string): boolean {
    const highValueIndicators = [
      'intensidad', 'dolor', 'tiempo', 'duración', 'síntomas',
      'empeora', 'mejora', 'radiación', 'asociado'
    ];
    return highValueIndicators.some(indicator =>
      question.toLowerCase().includes(indicator)
    );
  }

  private isMediumValueQuestion(question: string): boolean {
    const mediumValueIndicators = [
      'cuándo', 'dónde', 'cómo', 'frecuencia', 'episodios'
    ];
    return mediumValueIndicators.some(indicator =>
      question.toLowerCase().includes(indicator)
    );
  }

  private assessResponseQuality(): number {
    // Assess the quality of responses for confidence calculation
    const recentResponses = this.state.responses.slice(-3);
    const specificAnswers = recentResponses.filter(r =>
      r.answerType === 'button' && r.answer !== 'Prefiero escribir mi respuesta'
    );

    return specificAnswers.length * 0.05; // Bonus for specific answers
  }

  private assessResponseConsistency(): number {
    // HIGH PRIORITY: Penalize contradictory answers
    const responses = this.state.responses;
    let inconsistencyPenalty = 0;

    // Check for contradictions in pain intensity
    const painResponses = responses.filter(r =>
      r.question.toLowerCase().includes('intensidad') ||
      r.question.toLowerCase().includes('dolor')
    );

    if (painResponses.length >= 2) {
      const hasContradiction = this.detectPainContradiction(painResponses);
      if (hasContradiction) {
        inconsistencyPenalty += 0.2;
      }
    }

    return inconsistencyPenalty;
  }

  private detectPainContradiction(painResponses: ConversationResponse[]): boolean {
    // Simple contradiction detection for pain intensity
    const severePain = painResponses.some(r =>
      r.answer.toLowerCase().includes('intenso') ||
      r.answer.toLowerCase().includes('severo')
    );
    const mildPain = painResponses.some(r =>
      r.answer.toLowerCase().includes('leve') ||
      r.answer.toLowerCase().includes('poco')
    );

    return severePain && mildPain; // Contradiction detected
  }

  canProvideDiagnosis(): boolean {
    return this.state.questionCount >= 5 && this.state.confidence >= 0.8;
  }

  getState(): ConversationState {
    return { ...this.state };
  }
}

/**
 * QUESTION PROGRESSION ENGINE
 * Manages the logical flow of medical questions
 */
export class QuestionProgressionEngine {

  static readonly QUESTION_FLOWS: Record<string, QuestionFlow[]> = {

    // HEADACHE PROGRESSION
    headache: [
      {
        id: 'headache_type',
        question: '¿El dolor es como una banda apretada alrededor de la cabeza o es pulsátil como latidos?',
        answerOptions: [
          { text: 'Banda apretada', value: 'tension_headache', nextAction: 'continue' },
          { text: 'Pulsátil/latidos', value: 'migraine_headache', nextAction: 'continue' },
          { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' }
        ],
        nextQuestions: {
          'tension_headache': 'headache_stress',
          'migraine_headache': 'headache_associated'
        },
        confidenceImpact: 0.2
      },
      {
        id: 'headache_associated',
        question: '¿Se acompaña de náuseas o sensibilidad a la luz?',
        answerOptions: [
          { text: 'Sí, con náuseas', value: 'with_nausea', nextAction: 'continue' },
          { text: 'Sí, sensibilidad a la luz', value: 'light_sensitivity', nextAction: 'continue' },
          { text: 'Ambos síntomas', value: 'both_symptoms', nextAction: 'continue' },
          { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' }
        ],
        nextQuestions: {
          'with_nausea': 'headache_duration',
          'light_sensitivity': 'headache_duration',
          'both_symptoms': 'headache_duration'
        },
        confidenceImpact: 0.2
      },
      {
        id: 'headache_duration',
        question: '¿Desde cuándo tiene estos síntomas?',
        answerOptions: [
          { text: 'Menos de 24 horas', value: 'recent_onset', nextAction: 'continue' },
          { text: '1-3 días', value: 'few_days', nextAction: 'continue' },
          { text: 'Más de una semana', value: 'chronic', nextAction: 'continue' },
          { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' }
        ],
        nextQuestions: {
          'recent_onset': 'headache_recurrence',
          'few_days': 'headache_recurrence',
          'chronic': 'headache_progression'
        },
        confidenceImpact: 0.2
      }
    ],

    // CHEST PAIN PROGRESSION (Emergency Protocol)
    chestPain: [
      {
        id: 'chest_pain_time',
        question: '¿Cuánto tiempo lleva con este dolor?',
        answerOptions: [
          { text: 'Menos de 30 minutos', value: 'chest_pain_recent', nextAction: 'continue' },
          { text: 'Entre 30 minutos y 2 horas', value: 'chest_pain_moderate', nextAction: 'continue' },
          { text: 'Más de 2 horas', value: 'chest_pain_prolonged', nextAction: 'escalate' },
          { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' }
        ],
        nextQuestions: {
          'chest_pain_recent': 'chest_pain_intensity',
          'chest_pain_moderate': 'chest_pain_intensity',
          'chest_pain_prolonged': 'chest_pain_radiation'
        },
        confidenceImpact: 0.1,
        emergencyTriggers: ['chest_pain_prolonged']
      },
      {
        id: 'chest_pain_intensity',
        question: 'En una escala del 1 al 10, ¿qué tan intenso es el dolor?',
        answerOptions: [
          { text: 'Leve (1-3)', value: 'chest_pain_mild', nextAction: 'continue' },
          { text: 'Moderado (4-6)', value: 'chest_pain_moderate_intensity', nextAction: 'continue' },
          { text: 'Severo (7-8)', value: 'chest_pain_severe', nextAction: 'escalate' },
          { text: 'Extremo (9-10)', value: 'chest_pain_extreme', nextAction: 'escalate' }
        ],
        nextQuestions: {
          'chest_pain_mild': 'chest_pain_associated',
          'chest_pain_moderate_intensity': 'chest_pain_associated'
        },
        confidenceImpact: 0.2,
        emergencyTriggers: ['chest_pain_severe', 'chest_pain_extreme']
      }
    ],

    // ABDOMINAL PAIN PROGRESSION
    abdominalPain: [
      {
        id: 'abdominal_location',
        question: '¿El dolor está en la parte alta del abdomen y empeora cuando come?',
        answerOptions: [
          { text: 'Parte alta del abdomen', value: 'upper_abdomen', nextAction: 'continue' },
          { text: 'Parte baja del abdomen', value: 'lower_abdomen', nextAction: 'continue' },
          { text: 'Empeora al comer', value: 'worse_eating', nextAction: 'continue' },
          { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' }
        ],
        nextQuestions: {
          'upper_abdomen': 'abdominal_associated',
          'lower_abdomen': 'abdominal_associated',
          'worse_eating': 'abdominal_associated'
        },
        confidenceImpact: 0.2
      }
    ]
  };

  static getNextQuestion(
    symptomType: string,
    currentQuestionId: string,
    answer: string
  ): QuestionFlow | null {
    const flow = this.QUESTION_FLOWS[symptomType];
    if (!flow) return null;

    const currentQuestion = flow.find(q => q.id === currentQuestionId);
    if (!currentQuestion) return null;

    const nextQuestionId = currentQuestion.nextQuestions[answer];
    if (!nextQuestionId) return null;

    return flow.find(q => q.id === nextQuestionId) || null;
  }

  static shouldEscalate(questionFlow: QuestionFlow, answer: string): boolean {
    return questionFlow.emergencyTriggers?.includes(answer) || false;
  }
}

/**
 * RESPONSE GENERATION ENGINE
 * Generates contextually appropriate medical responses
 */
export class ResponseGenerator {

  static generateResponse(
    state: ConversationState,
    questionFlow: QuestionFlow,
    answer: string
  ): string {

    // Emergency responses
    if (QuestionProgressionEngine.shouldEscalate(questionFlow, answer)) {
      return this.generateEmergencyResponse(answer);
    }

    // Progressive diagnostic responses
    if (state.questionCount >= 5 && state.confidence >= 0.8) {
      return this.generateDiagnosticResponse(state);
    }

    // Continue assessment responses
    return this.generateContinueResponse(state, answer);
  }

  private static generateEmergencyResponse(trigger: string): string {
    const emergencyResponses = {
      'chest_pain_severe': '🚨 **EMERGENCIA MÉDICA CONFIRMADA** 🚨\n\n**LLAME AL 911 INMEDIATAMENTE**\n\nDolor de pecho severo (7-10) requiere atención de emergencia inmediata.',
      'chest_pain_extreme': '🚨 **EMERGENCIA MÉDICA CONFIRMADA** 🚨\n\n**LLAME AL 911 INMEDIATAMENTE**\n\nDolor de pecho extremo requiere atención de emergencia inmediata.',
      'chest_pain_prolonged': '⚠️ **DOLOR PROLONGADO REQUIERE EVALUACIÓN** ⚠️\n\nDolor de pecho por más de 2 horas requiere atención médica inmediata.'
    };

    return emergencyResponses[trigger] || 'Situación requiere atención médica inmediata.';
  }

  private static generateDiagnosticResponse(state: ConversationState): string {
    const symptomType = state.primarySymptom;

    if (symptomType === 'headache') {
      return this.generateHeadacheDiagnosis(state);
    }

    return 'Basado en la información recopilada, puedo ofrecer una evaluación preliminar.';
  }

  private static generateHeadacheDiagnosis(state: ConversationState): string {
    const responses = state.responses;
    const hasPulsating = responses.some(r => r.answer.includes('pulsátil'));
    const hasNausea = responses.some(r => r.answer.includes('náusea'));
    const isChronic = responses.some(r => r.answer.includes('semana'));

    if (hasPulsating && hasNausea) {
      if (isChronic) {
        return '**EVALUACIÓN CLÍNICA PRELIMINAR**\n\n**Diagnóstico probable**: Migraña crónica\n\n**Recomendaciones**:\n• Consulte con un neurólogo\n• Evite factores desencadenantes\n• Considere medicamentos preventivos';
      } else {
        return '**EVALUACIÓN CLÍNICA PRELIMINAR**\n\n**Diagnóstico probable**: Migraña\n\n**Recomendaciones**:\n• Analgésicos específicos para migraña\n• Evite factores desencadenantes\n• Si persiste, consulte neurólogo';
      }
    }

    return 'Basado en los síntomas, se requiere más evaluación para un diagnóstico preciso.';
  }

  private static generateContinueResponse(state: ConversationState, answer: string): string {
    const templates = [
      'Información registrada. Necesito más detalles para una evaluación completa.',
      'Entendido. Continuemos con la evaluación médica.',
      'Datos importantes registrados. Sigamos con más preguntas.'
    ];

    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }
}

/**
 * ANSWER OPTION GENERATOR
 * Creates contextually appropriate answer buttons
 */
export class AnswerOptionGenerator {

  static generateOptions(questionType: string, context: MedicalContext): AnswerOption[] {
    const optionSets = {
      headache_type: [
        { text: 'Banda apretada', value: 'tension_headache', nextAction: 'continue' as const },
        { text: 'Pulsátil/latidos', value: 'migraine_headache', nextAction: 'continue' as const },
        { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' as const }
      ],

      pain_intensity: [
        { text: 'Leve (1-3)', value: 'mild_pain', nextAction: 'continue' as const },
        { text: 'Moderado (4-6)', value: 'moderate_pain', nextAction: 'continue' as const },
        { text: 'Intenso (7-10)', value: 'severe_pain', nextAction: 'escalate' as const },
        { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' as const }
      ],

      duration: [
        { text: 'Hoy', value: 'today', nextAction: 'continue' as const },
        { text: 'Hace unos días', value: 'few_days', nextAction: 'continue' as const },
        { text: 'Hace una semana o más', value: 'week_plus', nextAction: 'continue' as const },
        { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' as const }
      ],

      yes_no: [
        { text: 'Sí', value: 'yes', nextAction: 'continue' as const },
        { text: 'No', value: 'no', nextAction: 'continue' as const },
        { text: 'Prefiero escribir mi respuesta', value: 'free_text', nextAction: 'continue' as const }
      ]
    };

    return optionSets[questionType] || optionSets.yes_no;
  }

  static adaptForContext(options: AnswerOption[], context: MedicalContext): AnswerOption[] {
    // Adapt options based on patient context (age, family member, etc.)
    if (context.patientType === 'family') {
      return options.map(option => ({
        ...option,
        text: option.text.replace(/^(Sí|No)/, match =>
          match === 'Sí' ? 'Sí, la persona' : 'No, la persona no'
        )
      }));
    }

    return options;
  }
}
