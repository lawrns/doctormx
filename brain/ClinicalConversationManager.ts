/**
 * Clinical Conversation Manager
 * Orchestrates structured diagnostic conversations with confidence-based transitions
 */

import { DiagnosticConfidenceService, DiagnosticSession } from './DiagnosticConfidenceService';
import { MedicalResponseTemplates } from './MedicalResponseTemplates';

export interface ClinicalResponse {
  text: string;
  type: 'question' | 'diagnosis' | 'clarification' | 'emergency';
  confidence: number;
  nextQuestion?: string;
  shouldDiagnose: boolean;
  diagnosticSummary?: {
    primaryDiagnosis: string;
    confidence: number;
    differentialDiagnoses: string[];
    supportingEvidence: string[];
    recommendations: string[];
  };
  clinicalReasoning?: string;
}

export interface ConversationState {
  phase: 'greeting' | 'chief_complaint' | 'history_taking' | 'diagnosis' | 'treatment';
  questionCount: number;
  hasChiefComplaint: boolean;
  diagnosticSession?: DiagnosticSession;
}

export class ClinicalConversationManager {
  private static conversations: Map<string, ConversationState> = new Map();

  /**
   * Process user message with clinical approach
   */
  static processMessage(
    sessionId: string,
    userMessage: string,
    conversationHistory: string[] = []
  ): ClinicalResponse {
    const state = this.getOrCreateState(sessionId);
    const message = userMessage.trim();

    // Handle emergency keywords first
    if (this.isEmergency(message)) {
      return this.handleEmergency(message);
    }

    // Route based on conversation phase
    switch (state.phase) {
      case 'greeting':
        return this.handleGreeting(sessionId, message, state);
      
      case 'chief_complaint':
        return this.handleChiefComplaint(sessionId, message, state);
      
      case 'history_taking':
        return this.handleHistoryTaking(sessionId, message, state);
      
      case 'diagnosis':
        return this.handleDiagnosis(sessionId, message, state);
      
      default:
        return this.handleGreeting(sessionId, message, state);
    }
  }

  /**
   * Handle initial greeting and establish chief complaint
   */
  private static handleGreeting(sessionId: string, message: string, state: ConversationState): ClinicalResponse {
    const lowerMessage = message.toLowerCase();

    // Check if user already provided chief complaint
    if (this.containsSymptom(lowerMessage)) {
      state.phase = 'chief_complaint';
      return this.handleChiefComplaint(sessionId, message, state);
    }

    // Standard medical greeting
    state.phase = 'chief_complaint';
    return {
      text: 'Hola, soy el Dr. Simeon. ¿Cuál es el motivo principal de su consulta hoy?',
      type: 'question',
      confidence: 0.1,
      shouldDiagnose: false,
      clinicalReasoning: 'Estableciendo motivo de consulta principal'
    };
  }

  /**
   * Handle chief complaint and initialize diagnostic session
   */
  private static handleChiefComplaint(sessionId: string, message: string, state: ConversationState): ClinicalResponse {
    const chiefComplaint = this.extractChiefComplaint(message);
    
    if (!chiefComplaint) {
      return {
        text: 'Por favor, descríbame específicamente qué síntoma o molestia lo trae hoy.',
        type: 'clarification',
        confidence: 0.1,
        shouldDiagnose: false,
        clinicalReasoning: 'Necesito clarificar el motivo de consulta'
      };
    }

    // Initialize diagnostic session
    const diagnosticSession = DiagnosticConfidenceService.initializeSession(sessionId, chiefComplaint);
    state.diagnosticSession = diagnosticSession;
    state.hasChiefComplaint = true;
    state.phase = 'history_taking';

    // Get first targeted question
    const firstQuestion = diagnosticSession.nextQuestions[0];
    
    return {
      text: `Entiendo que tiene ${chiefComplaint}. ${firstQuestion}`,
      type: 'question',
      confidence: diagnosticSession.currentConfidence,
      nextQuestion: firstQuestion,
      shouldDiagnose: false,
      clinicalReasoning: `Iniciando interrogatorio dirigido para ${chiefComplaint}`
    };
  }

  /**
   * Handle systematic history taking with targeted questions
   */
  private static handleHistoryTaking(sessionId: string, message: string, state: ConversationState): ClinicalResponse {
    if (!state.diagnosticSession) {
      // Fallback - reinitialize
      state.phase = 'chief_complaint';
      return this.handleChiefComplaint(sessionId, message, state);
    }

    // Get the last question asked
    const lastQuestion = state.diagnosticSession.questionsAsked[state.diagnosticSession.questionsAsked.length - 1] || '';
    
    // Process the response
    const result = DiagnosticConfidenceService.processResponse(
      sessionId,
      lastQuestion,
      message
    );

    state.diagnosticSession = result.session;
    state.questionCount++;

    // Check if we should transition to diagnosis
    if (result.shouldDiagnose) {
      state.phase = 'diagnosis';
      return this.generateDiagnosis(sessionId, state);
    }

    // Continue with next question
    if (result.nextQuestion) {
      return {
        text: this.formatClinicalQuestion(result.nextQuestion, result.confidence),
        type: 'question',
        confidence: result.confidence,
        nextQuestion: result.nextQuestion,
        shouldDiagnose: false,
        clinicalReasoning: `Confianza diagnóstica: ${Math.round(result.confidence * 100)}% - Continuando interrogatorio`
      };
    }

    // No more questions - force diagnosis
    state.phase = 'diagnosis';
    return this.generateDiagnosis(sessionId, state);
  }

  /**
   * Generate final diagnosis with clinical reasoning
   */
  private static generateDiagnosis(sessionId: string, state: ConversationState): ClinicalResponse {
    const summary = DiagnosticConfidenceService.getDiagnosticSummary(sessionId);
    
    const diagnosisText = this.formatDiagnosisResponse(summary);
    
    return {
      text: diagnosisText,
      type: 'diagnosis',
      confidence: summary.confidence,
      shouldDiagnose: true,
      diagnosticSummary: summary,
      clinicalReasoning: `Diagnóstico basado en ${Math.round(summary.confidence * 100)}% de confianza`
    };
  }

  /**
   * Handle emergency situations
   */
  private static handleEmergency(message: string): ClinicalResponse {
    return {
      text: '🚨 **EMERGENCIA MÉDICA** 🚨\n\nPor favor, acuda inmediatamente al servicio de urgencias más cercano o llame al 911. Los síntomas que describe requieren atención médica inmediata.',
      type: 'emergency',
      confidence: 1.0,
      shouldDiagnose: true,
      clinicalReasoning: 'Síntomas de alarma detectados - requiere atención inmediata'
    };
  }

  /**
   * Check if message contains emergency keywords
   */
  private static isEmergency(message: string): boolean {
    const emergencyKeywords = [
      'no puedo respirar',
      'dolor de pecho intenso',
      'perdí el conocimiento',
      'sangrado abundante',
      'convulsiones',
      'dolor súbito muy fuerte',
      'no siento un lado del cuerpo',
      'visión doble súbita'
    ];

    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Check if message contains medical symptoms
   */
  private static containsSymptom(message: string): boolean {
    const symptomKeywords = [
      'dolor', 'duele', 'molestia', 'fiebre', 'temperatura', 'tos', 'náusea',
      'vómito', 'diarrea', 'estreñimiento', 'mareo', 'cansancio', 'debilidad',
      'palpitaciones', 'falta de aire', 'ardor', 'picazón', 'hinchazón'
    ];

    return symptomKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Extract chief complaint from user message
   */
  private static extractChiefComplaint(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Common complaint patterns
    const patterns = [
      /tengo (.*?)(?:\.|$)/,
      /me duele (.*?)(?:\.|$)/,
      /siento (.*?)(?:\.|$)/,
      /dolor (?:de|en) (.*?)(?:\.|$)/,
      /(.*?) me duele/,
      /estoy (.*?)(?:\.|$)/
    ];

    for (const pattern of patterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback - return the whole message if it contains symptoms
    if (this.containsSymptom(lowerMessage)) {
      return message.trim();
    }

    return null;
  }

  /**
   * Format clinical question with appropriate medical tone
   */
  private static formatClinicalQuestion(question: string, confidence: number): string {
    const confidencePercent = Math.round(confidence * 100);
    
    // Add clinical context based on confidence level
    if (confidence < 0.3) {
      return `${question}\n\n*Necesito más información para orientar el diagnóstico.*`;
    } else if (confidence < 0.6) {
      return `${question}\n\n*Estoy evaluando algunas posibilidades diagnósticas.*`;
    } else if (confidence < 0.8) {
      return `${question}\n\n*Tengo una idea más clara, pero necesito confirmar algunos detalles.*`;
    } else {
      return `${question}\n\n*Solo necesito confirmar mi impresión diagnóstica.*`;
    }
  }

  /**
   * Format diagnosis response with clinical structure
   */
  private static formatDiagnosisResponse(summary: any): string {
    const confidencePercent = Math.round(summary.confidence * 100);
    
    let response = `**IMPRESIÓN DIAGNÓSTICA** (Confianza: ${confidencePercent}%)\n\n`;
    response += `**Diagnóstico principal:** ${summary.primaryDiagnosis}\n\n`;
    
    if (summary.differentialDiagnoses.length > 0) {
      response += `**Diagnósticos diferenciales:**\n`;
      summary.differentialDiagnoses.forEach((dx: string) => {
        response += `• ${dx}\n`;
      });
      response += '\n';
    }
    
    if (summary.supportingEvidence.length > 0) {
      response += `**Evidencia clínica:**\n`;
      summary.supportingEvidence.forEach((evidence: string) => {
        response += `• ${evidence}\n`;
      });
      response += '\n';
    }
    
    response += `**RECOMENDACIONES:**\n`;
    summary.recommendations.forEach((rec: string) => {
      response += `• ${rec}\n`;
    });
    
    if (summary.confidence < 0.7) {
      response += '\n⚠️ *Recomiendo consulta médica presencial para confirmación diagnóstica.*';
    }
    
    return response;
  }

  /**
   * Handle diagnosis phase
   */
  private static handleDiagnosis(sessionId: string, message: string, state: ConversationState): ClinicalResponse {
    // User might be asking follow-up questions about diagnosis
    return {
      text: '¿Tiene alguna pregunta específica sobre el diagnóstico o las recomendaciones que le he dado?',
      type: 'clarification',
      confidence: 0.9,
      shouldDiagnose: false,
      clinicalReasoning: 'Respondiendo preguntas post-diagnóstico'
    };
  }

  /**
   * Get or create conversation state
   */
  private static getOrCreateState(sessionId: string): ConversationState {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        phase: 'greeting',
        questionCount: 0,
        hasChiefComplaint: false
      });
    }
    return this.conversations.get(sessionId)!;
  }

  /**
   * Get conversation state
   */
  static getState(sessionId: string): ConversationState | undefined {
    return this.conversations.get(sessionId);
  }

  /**
   * Clear conversation
   */
  static clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
    DiagnosticConfidenceService.clearSession(sessionId);
  }
}
