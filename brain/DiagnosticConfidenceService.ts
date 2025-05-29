/**
 * Diagnostic Confidence Service
 * Tracks diagnostic confidence and manages transition to diagnosis
 */

export interface DiagnosticEvidence {
  symptom: string;
  severity: number; // 1-10
  duration: string;
  location?: string;
  quality?: string; // sharp, dull, burning, etc.
  timing?: string; // constant, intermittent, etc.
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
  confidence: number; // 0-1
}

export interface DiagnosticHypothesis {
  condition: string;
  probability: number; // 0-1
  supportingEvidence: DiagnosticEvidence[];
  contradictingEvidence: DiagnosticEvidence[];
  requiredQuestions: string[];
  ruleOutQuestions: string[];
}

export interface DiagnosticSession {
  sessionId: string;
  chiefComplaint: string;
  evidence: DiagnosticEvidence[];
  hypotheses: DiagnosticHypothesis[];
  currentConfidence: number;
  questionsAsked: string[];
  phase: 'initial' | 'gathering' | 'clarifying' | 'diagnosing' | 'complete';
  nextQuestions: string[];
}

export class DiagnosticConfidenceService {
  private static sessions: Map<string, DiagnosticSession> = new Map();
  private static readonly CONFIDENCE_THRESHOLD = 0.82; // 82% confidence for diagnosis
  private static readonly MAX_QUESTIONS = 8; // Maximum questions before forcing diagnosis

  /**
   * Initialize diagnostic session
   */
  static initializeSession(sessionId: string, chiefComplaint: string): DiagnosticSession {
    const session: DiagnosticSession = {
      sessionId,
      chiefComplaint: chiefComplaint.toLowerCase(),
      evidence: [],
      hypotheses: this.generateInitialHypotheses(chiefComplaint),
      currentConfidence: 0.1,
      questionsAsked: [],
      phase: 'initial',
      nextQuestions: []
    };

    this.sessions.set(sessionId, session);
    this.updateNextQuestions(session);
    return session;
  }

  /**
   * Process user response and update diagnostic confidence
   */
  static processResponse(
    sessionId: string,
    question: string,
    answer: string
  ): {
    session: DiagnosticSession;
    shouldDiagnose: boolean;
    nextQuestion: string | null;
    confidence: number;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Diagnostic session not found');
    }

    // Extract evidence from answer
    const evidence = this.extractEvidence(question, answer, session.chiefComplaint);
    if (evidence) {
      session.evidence.push(evidence);
    }

    // Update hypotheses based on new evidence
    this.updateHypotheses(session, evidence);

    // Calculate new confidence
    session.currentConfidence = this.calculateConfidence(session);

    // Track question
    session.questionsAsked.push(question);

    // Determine if we should diagnose
    const shouldDiagnose = this.shouldTransitionToDiagnosis(session);

    if (shouldDiagnose) {
      session.phase = 'diagnosing';
    } else {
      session.phase = 'gathering';
      this.updateNextQuestions(session);
    }

    const nextQuestion = session.nextQuestions[0] || null;

    return {
      session,
      shouldDiagnose,
      nextQuestion,
      confidence: session.currentConfidence
    };
  }

  /**
   * Generate initial diagnostic hypotheses based on chief complaint
   */
  private static generateInitialHypotheses(chiefComplaint: string): DiagnosticHypothesis[] {
    const complaint = chiefComplaint.toLowerCase();
    const hypotheses: DiagnosticHypothesis[] = [];

    // Headache differential diagnosis
    if (complaint.includes('dolor de cabeza') || complaint.includes('cabeza')) {
      hypotheses.push(
        {
          condition: 'Cefalea tensional',
          probability: 0.6,
          supportingEvidence: [],
          contradictingEvidence: [],
          requiredQuestions: [
            '¿El dolor es como una banda apretada alrededor de la cabeza?',
            '¿Empeora con el estrés o la tensión?',
            '¿Dura varias horas?'
          ],
          ruleOutQuestions: [
            '¿Tienes náuseas o vómitos?',
            '¿Te molesta la luz o el ruido?',
            '¿El dolor es pulsátil?'
          ]
        },
        {
          condition: 'Migraña',
          probability: 0.3,
          supportingEvidence: [],
          contradictingEvidence: [],
          requiredQuestions: [
            '¿El dolor es pulsátil o como latidos?',
            '¿Te molesta la luz o el ruido?',
            '¿Tienes náuseas?'
          ],
          ruleOutQuestions: [
            '¿El dolor es constante y opresivo?',
            '¿Puedes hacer actividades normales?'
          ]
        }
      );
    }

    // Abdominal pain differential
    if (complaint.includes('dolor') && (complaint.includes('estómago') || complaint.includes('abdomen') || complaint.includes('barriga'))) {
      hypotheses.push(
        {
          condition: 'Gastritis',
          probability: 0.5,
          supportingEvidence: [],
          contradictingEvidence: [],
          requiredQuestions: [
            '¿El dolor está en la parte alta del abdomen?',
            '¿Empeora cuando comes?',
            '¿Tienes acidez o ardor?'
          ],
          ruleOutQuestions: [
            '¿El dolor se mueve hacia la espalda?',
            '¿Tienes fiebre?',
            '¿El dolor es muy intenso y súbito?'
          ]
        },
        {
          condition: 'Apendicitis',
          probability: 0.2,
          supportingEvidence: [],
          contradictingEvidence: [],
          requiredQuestions: [
            '¿El dolor comenzó alrededor del ombligo y se movió hacia abajo y a la derecha?',
            '¿Tienes fiebre?',
            '¿Empeora al caminar o toser?'
          ],
          ruleOutQuestions: [
            '¿El dolor mejora con antiácidos?',
            '¿Puedes comer normalmente?'
          ]
        }
      );
    }

    // Fever differential
    if (complaint.includes('fiebre') || complaint.includes('temperatura') || complaint.includes('calentura')) {
      hypotheses.push(
        {
          condition: 'Infección viral',
          probability: 0.7,
          supportingEvidence: [],
          contradictingEvidence: [],
          requiredQuestions: [
            '¿Tienes síntomas como tos, dolor de garganta o congestión?',
            '¿La fiebre es menor a 39°C?',
            '¿Comenzó gradualmente?'
          ],
          ruleOutQuestions: [
            '¿Tienes dolor al orinar?',
            '¿Tienes dolor abdominal intenso?',
            '¿Tienes dificultad para respirar?'
          ]
        }
      );
    }

    return hypotheses;
  }

  /**
   * Extract diagnostic evidence from user response
   */
  private static extractEvidence(question: string, answer: string, chiefComplaint: string): DiagnosticEvidence | null {
    const lowerAnswer = answer.toLowerCase();
    const lowerQuestion = question.toLowerCase();

    // Severity extraction
    let severity = 5; // default
    if (lowerAnswer.includes('muy fuerte') || lowerAnswer.includes('insoportable')) severity = 9;
    else if (lowerAnswer.includes('fuerte') || lowerAnswer.includes('intenso')) severity = 7;
    else if (lowerAnswer.includes('moderado') || lowerAnswer.includes('regular')) severity = 5;
    else if (lowerAnswer.includes('leve') || lowerAnswer.includes('poco')) severity = 3;

    // Duration extraction
    let duration = 'unknown';
    if (lowerAnswer.includes('hora')) duration = 'hours';
    else if (lowerAnswer.includes('día')) duration = 'days';
    else if (lowerAnswer.includes('semana')) duration = 'weeks';
    else if (lowerAnswer.includes('mes')) duration = 'months';

    // Location extraction for pain
    let location = '';
    if (lowerQuestion.includes('dónde') || lowerQuestion.includes('parte')) {
      if (lowerAnswer.includes('cabeza')) location = 'head';
      else if (lowerAnswer.includes('frente')) location = 'forehead';
      else if (lowerAnswer.includes('sien')) location = 'temple';
      else if (lowerAnswer.includes('nuca')) location = 'neck';
      else if (lowerAnswer.includes('abdomen') || lowerAnswer.includes('estómago')) location = 'abdomen';
    }

    // Quality extraction
    let quality = '';
    if (lowerAnswer.includes('pulsátil') || lowerAnswer.includes('latido')) quality = 'pulsating';
    else if (lowerAnswer.includes('opresivo') || lowerAnswer.includes('banda')) quality = 'pressing';
    else if (lowerAnswer.includes('punzante') || lowerAnswer.includes('agudo')) quality = 'sharp';
    else if (lowerAnswer.includes('ardor') || lowerAnswer.includes('quema')) quality = 'burning';

    // Confidence based on answer specificity
    let confidence = 0.5;
    if (lowerAnswer.includes('sí') || lowerAnswer.includes('no')) confidence = 0.8;
    else if (lowerAnswer.length > 20) confidence = 0.7;
    else if (lowerAnswer.includes('no sé') || lowerAnswer.includes('tal vez')) confidence = 0.3;

    return {
      symptom: chiefComplaint,
      severity,
      duration,
      location: location || undefined,
      quality: quality || undefined,
      confidence
    };
  }

  /**
   * Update diagnostic hypotheses based on new evidence
   */
  private static updateHypotheses(session: DiagnosticSession, evidence: DiagnosticEvidence | null): void {
    if (!evidence) return;

    session.hypotheses.forEach(hypothesis => {
      // Check if evidence supports or contradicts hypothesis
      const lastQuestion = session.questionsAsked[session.questionsAsked.length - 1]?.toLowerCase();
      const lastAnswer = evidence ? 'yes' : 'no'; // Simplified for now

      // Update probability based on evidence
      if (hypothesis.requiredQuestions.some(q => lastQuestion?.includes(q.toLowerCase().substring(0, 10)))) {
        if (lastAnswer === 'yes') {
          hypothesis.probability = Math.min(0.95, hypothesis.probability + 0.2);
          hypothesis.supportingEvidence.push(evidence);
        } else {
          hypothesis.probability = Math.max(0.05, hypothesis.probability - 0.15);
          hypothesis.contradictingEvidence.push(evidence);
        }
      }

      if (hypothesis.ruleOutQuestions.some(q => lastQuestion?.includes(q.toLowerCase().substring(0, 10)))) {
        if (lastAnswer === 'yes') {
          hypothesis.probability = Math.max(0.05, hypothesis.probability - 0.25);
          hypothesis.contradictingEvidence.push(evidence);
        } else {
          hypothesis.probability = Math.min(0.95, hypothesis.probability + 0.1);
          hypothesis.supportingEvidence.push(evidence);
        }
      }
    });

    // Normalize probabilities
    const totalProb = session.hypotheses.reduce((sum, h) => sum + h.probability, 0);
    if (totalProb > 0) {
      session.hypotheses.forEach(h => h.probability = h.probability / totalProb);
    }
  }

  /**
   * Calculate overall diagnostic confidence
   */
  private static calculateConfidence(session: DiagnosticSession): number {
    if (session.hypotheses.length === 0) return 0.1;

    // Find highest probability hypothesis
    const topHypothesis = session.hypotheses.reduce((max, h) =>
      h.probability > max.probability ? h : max
    );

    // Confidence is based on:
    // 1. Highest hypothesis probability
    // 2. Evidence quality
    // 3. Number of questions answered

    const evidenceQuality = session.evidence.reduce((sum, e) => sum + e.confidence, 0) / Math.max(1, session.evidence.length);
    const questionProgress = Math.min(1, session.questionsAsked.length / 5); // Optimal around 5 questions

    return (topHypothesis.probability * 0.6) + (evidenceQuality * 0.3) + (questionProgress * 0.1);
  }

  /**
   * Determine if we should transition to diagnosis
   */
  private static shouldTransitionToDiagnosis(session: DiagnosticSession): boolean {
    return session.currentConfidence >= this.CONFIDENCE_THRESHOLD ||
           session.questionsAsked.length >= this.MAX_QUESTIONS;
  }

  /**
   * Update next questions based on current hypotheses
   */
  private static updateNextQuestions(session: DiagnosticSession): void {
    session.nextQuestions = [];

    // Get questions from top hypotheses that haven't been asked
    const topHypotheses = session.hypotheses
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 2);

    topHypotheses.forEach(hypothesis => {
      const unaskedQuestions = hypothesis.requiredQuestions.filter(q =>
        !session.questionsAsked.some(asked => asked.toLowerCase().includes(q.toLowerCase().substring(0, 10)))
      );

      session.nextQuestions.push(...unaskedQuestions.slice(0, 1));
    });

    // Add rule-out questions for top hypothesis
    if (session.nextQuestions.length < 2 && topHypotheses.length > 0) {
      const ruleOutQuestions = topHypotheses[0].ruleOutQuestions.filter(q =>
        !session.questionsAsked.some(asked => asked.toLowerCase().includes(q.toLowerCase().substring(0, 10)))
      );

      session.nextQuestions.push(...ruleOutQuestions.slice(0, 1));
    }

    // Remove duplicates and limit
    session.nextQuestions = [...new Set(session.nextQuestions)].slice(0, 2);
  }

  /**
   * Get diagnostic summary for final diagnosis
   */
  static getDiagnosticSummary(sessionId: string): {
    primaryDiagnosis: string;
    confidence: number;
    differentialDiagnoses: string[];
    supportingEvidence: string[];
    recommendations: string[];
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Diagnostic session not found');
    }

    const topHypothesis = session.hypotheses.reduce((max, h) =>
      h.probability > max.probability ? h : max
    );

    const differentials = session.hypotheses
      .filter(h => h !== topHypothesis && h.probability > 0.1)
      .map(h => h.condition)
      .slice(0, 2);

    const supportingEvidence = topHypothesis.supportingEvidence
      .map(e => `${e.symptom} (${e.severity}/10 severity)`)
      .slice(0, 3);

    return {
      primaryDiagnosis: topHypothesis.condition,
      confidence: session.currentConfidence,
      differentialDiagnoses: differentials,
      supportingEvidence,
      recommendations: this.generateRecommendations(topHypothesis.condition, session.currentConfidence)
    };
  }

  /**
   * Generate recommendations based on diagnosis
   */
  private static generateRecommendations(diagnosis: string, confidence: number): string[] {
    const recommendations: string[] = [];

    if (confidence < 0.7) {
      recommendations.push('Se recomienda consulta médica presencial para evaluación completa');
    }

    // Diagnosis-specific recommendations
    switch (diagnosis.toLowerCase()) {
      case 'cefalea tensional':
        recommendations.push('Aplicar técnicas de relajación y manejo del estrés');
        recommendations.push('Paracetamol 500mg cada 6-8 horas si es necesario');
        break;
      case 'migraña':
        recommendations.push('Descansar en habitación oscura y silenciosa');
        recommendations.push('Evitar desencadenantes conocidos');
        break;
      case 'gastritis':
        recommendations.push('Dieta blanda y evitar irritantes');
        recommendations.push('Omeprazol 20mg antes del desayuno');
        break;
      default:
        recommendations.push('Seguir indicaciones médicas generales');
    }

    return recommendations;
  }

  /**
   * Get current session
   */
  static getSession(sessionId: string): DiagnosticSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Clear session
   */
  static clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
