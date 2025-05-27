/**
 * Unified Conversation Service
 * Handles both response text and answer options generation in a single, coherent flow
 * Maintains conversation state and prevents duplicate questions
 */

import { ConversationIntelligence } from './ConversationIntelligence';
import { enhancedAIService } from '../../../core/services/ai/EnhancedAIService';
import { AIAnswerOption } from '../types/AITypes';

export interface UnifiedResponse {
  text: string;
  answerOptions: AIAnswerOption[];
  metadata: {
    hasAskedAbout: Set<string>;
    conversationStage: string;
    shouldShowOptions: boolean;
    emotionalState?: any;
    confidence: number;
  };
  // Medical context
  severity?: number;
  isEmergency?: boolean;
  suggestedSpecialty?: string;
  suggestedConditions?: string[];
  suggestedMedications?: string[];
}

export interface ConversationContext {
  sessionId: string;
  userId?: string; // For future authenticated users
  currentMessage: string;
  conversationHistory: Array<{
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
    answerOptions?: AIAnswerOption[];
    selectedOption?: string;
  }>;
  userProfile?: {
    age?: number;
    gender?: string;
    chronicConditions?: string[];
    currentMedications?: string[];
  };
  answeredQuestions: Map<string, string>; // questionType -> answer
}

export class UnifiedConversationService {
  private static instance: UnifiedConversationService;
  private conversationStates: Map<string, ConversationContext> = new Map();
  
  // Question types to track
  private readonly QUESTION_TYPES = {
    SYMPTOM_DURATION: 'symptom_duration',
    SYMPTOM_SEVERITY: 'symptom_severity',
    SYMPTOM_LOCATION: 'symptom_location',
    MEDICATION_TAKEN: 'medication_taken',
    ALLERGIES: 'allergies',
    OTHER_SYMPTOMS: 'other_symptoms',
    FAMILY_AFFECTED: 'family_affected',
    PREVIOUS_EPISODES: 'previous_episodes',
    TRIGGERS: 'triggers',
    MEDICAL_HISTORY: 'medical_history'
  };
  
  static getInstance(): UnifiedConversationService {
    if (!UnifiedConversationService.instance) {
      UnifiedConversationService.instance = new UnifiedConversationService();
    }
    return UnifiedConversationService.instance;
  }
  
  /**
   * Initialize or get conversation context
   */
  getOrCreateContext(sessionId: string, userId?: string): ConversationContext {
    if (!this.conversationStates.has(sessionId)) {
      this.conversationStates.set(sessionId, {
        sessionId,
        userId,
        currentMessage: '',
        conversationHistory: [],
        answeredQuestions: new Map(),
        userProfile: {}
      });
    }
    return this.conversationStates.get(sessionId)!;
  }
  
  /**
   * Process a message and generate unified response
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    selectedOption?: string
  ): Promise<UnifiedResponse> {
    const context = this.getOrCreateContext(sessionId);
    
    // Update context with current message
    context.currentMessage = userMessage;
    context.conversationHistory.push({
      sender: 'user',
      text: userMessage,
      timestamp: new Date(),
      selectedOption
    });
    
    // Track if this answers a previous question
    if (selectedOption) {
      this.trackAnsweredQuestion(context, userMessage);
    }
    
    // Analyze conversation using existing intelligence service
    const analysis = ConversationIntelligence.analyzeUserMessage(
      sessionId,
      userMessage,
      Date.now().toString()
    );
    
    // Generate unified response with contextual options
    const response = await this.generateUnifiedResponse(context, analysis);
    
    // Store bot response in history
    context.conversationHistory.push({
      sender: 'bot',
      text: response.text,
      timestamp: new Date(),
      answerOptions: response.answerOptions
    });
    
    return response;
  }
  
  /**
   * Generate response with integrated answer options
   */
  private async generateUnifiedResponse(
    context: ConversationContext,
    analysis: any
  ): Promise<UnifiedResponse> {
    // Build enhanced prompt that generates both response and options
    const enhancedPrompt = this.buildUnifiedPrompt(context, analysis);
    
    // Call AI service with special instructions
    const aiResponse = await enhancedAIService.processQuery({
      userMessage: enhancedPrompt,
      userHistory: context.conversationHistory.map(m => m.text),
      sessionId: context.sessionId,
      stream: false
    });
    
    // Parse the unified response
    const parsedResponse = this.parseUnifiedResponse(aiResponse.text, context);
    
    return {
      text: parsedResponse.mainText,
      answerOptions: parsedResponse.options,
      metadata: {
        hasAskedAbout: new Set(context.answeredQuestions.keys()),
        conversationStage: analysis.intent,
        shouldShowOptions: parsedResponse.options.length > 0,
        emotionalState: analysis.emotion,
        confidence: 0.8
      },
      severity: aiResponse.severity,
      isEmergency: aiResponse.isEmergency,
      suggestedSpecialty: aiResponse.suggestedSpecialty,
      suggestedConditions: aiResponse.suggestedConditions,
      suggestedMedications: aiResponse.suggestedMedications
    };
  }
  
  /**
   * Build a unified prompt that instructs AI to generate both response and options
   */
  private buildUnifiedPrompt(context: ConversationContext, analysis: any): string {
    const answeredQuestions = Array.from(context.answeredQuestions.entries())
      .map(([type, answer]) => `- ${this.getQuestionLabel(type)}: ${answer}`)
      .join('\n');
    
    const unansweredQuestions = this.getUnansweredQuestions(context);
    
    return `${context.currentMessage}

CONTEXTO DE LA CONVERSACIÓN:
${answeredQuestions || 'No hay preguntas respondidas aún'}

ANÁLISIS:
- Intención: ${analysis.intent}
- Emoción detectada: ${analysis.emotion}
- Temas: ${analysis.topics.join(', ') || 'General'}
- Urgencia: ${analysis.urgency}/10

INSTRUCCIONES ESPECIALES:
1. Responde de manera empática y profesional como Dr. Simeon
2. NO repitas preguntas sobre: ${Array.from(context.answeredQuestions.keys()).join(', ')}
3. Si necesitas más información, pregunta sobre: ${unansweredQuestions.join(', ')}
4. Al final de tu respuesta, incluye EXACTAMENTE en este formato:

[OPCIONES]
- Opción 1 relevante al contexto
- Opción 2 relevante al contexto
- Opción 3 relevante al contexto
- Prefiero escribir mi respuesta
[/OPCIONES]

IMPORTANTE: Las opciones deben ser contextualmente relevantes y NO repetir información ya proporcionada.`;
  }
  
  /**
   * Parse unified response to extract main text and options
   */
  private parseUnifiedResponse(
    aiText: string,
    context: ConversationContext
  ): {
    mainText: string;
    options: AIAnswerOption[];
  } {
    // Look for options section
    const optionsMatch = aiText.match(/\[OPCIONES\]([\s\S]*?)\[\/OPCIONES\]/);
    
    if (optionsMatch) {
      const mainText = aiText.replace(optionsMatch[0], '').trim();
      const optionsText = optionsMatch[1];
      
      // Parse options
      const options = optionsText
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map((line, index) => {
          const text = line.replace('-', '').trim();
          return {
            id: `opt_${Date.now()}_${index}`,
            text,
            value: text,
            category: this.categorizeOption(text, context)
          } as AIAnswerOption;
        });
      
      return { mainText, options };
    }
    
    // Fallback if AI doesn't follow format
    return {
      mainText: aiText,
      options: this.generateFallbackOptions(context)
    };
  }
  
  /**
   * Track what questions have been answered
   */
  private trackAnsweredQuestion(context: ConversationContext, answer: string): void {
    const lastBotMessage = [...context.conversationHistory]
      .reverse()
      .find(m => m.sender === 'bot');
    
    if (!lastBotMessage) return;
    
    const text = lastBotMessage.text.toLowerCase();
    
    // Detect question type and store answer
    if (text.includes('cuándo') || text.includes('cuánto tiempo')) {
      context.answeredQuestions.set(this.QUESTION_TYPES.SYMPTOM_DURATION, answer);
    } else if (text.includes('qué tan fuerte') || text.includes('intensidad')) {
      context.answeredQuestions.set(this.QUESTION_TYPES.SYMPTOM_SEVERITY, answer);
    } else if (text.includes('dónde') || text.includes('qué parte')) {
      context.answeredQuestions.set(this.QUESTION_TYPES.SYMPTOM_LOCATION, answer);
    } else if (text.includes('medicamento') || text.includes('tomado algo')) {
      context.answeredQuestions.set(this.QUESTION_TYPES.MEDICATION_TAKEN, answer);
    } else if (text.includes('alergia')) {
      context.answeredQuestions.set(this.QUESTION_TYPES.ALLERGIES, answer);
    } else if (text.includes('familia') || text.includes('alguien más')) {
      context.answeredQuestions.set(this.QUESTION_TYPES.FAMILY_AFFECTED, answer);
    }
  }
  
  /**
   * Get questions that haven't been asked yet
   */
  private getUnansweredQuestions(context: ConversationContext): string[] {
    const unanswered: string[] = [];
    
    for (const [type, label] of Object.entries(this.QUESTION_TYPES)) {
      if (!context.answeredQuestions.has(label)) {
        unanswered.push(this.getQuestionLabel(label));
      }
    }
    
    return unanswered.slice(0, 3); // Return top 3 unanswered questions
  }
  
  /**
   * Get human-readable label for question type
   */
  private getQuestionLabel(type: string): string {
    const labels: Record<string, string> = {
      symptom_duration: 'Duración de síntomas',
      symptom_severity: 'Severidad del dolor/molestia',
      symptom_location: 'Ubicación del síntoma',
      medication_taken: 'Medicamentos tomados',
      allergies: 'Alergias conocidas',
      other_symptoms: 'Otros síntomas',
      family_affected: 'Familiares afectados',
      previous_episodes: 'Episodios previos',
      triggers: 'Desencadenantes',
      medical_history: 'Historia médica'
    };
    
    return labels[type] || type;
  }
  
  /**
   * Categorize an option for tracking
   */
  private categorizeOption(optionText: string, context: ConversationContext): string {
    const text = optionText.toLowerCase();
    
    if (text.includes('escribir') || text.includes('mi respuesta')) {
      return 'free_text';
    } else if (text.includes('urgente') || text.includes('emergencia')) {
      return 'urgency';
    } else if (text.includes('dolor') || text.includes('molestia')) {
      return 'symptom';
    } else if (text.includes('medicina') || text.includes('medicamento')) {
      return 'medication';
    }
    
    return 'general';
  }
  
  /**
   * Generate fallback options if AI doesn't provide them
   */
  private generateFallbackOptions(context: ConversationContext): AIAnswerOption[] {
    const unanswered = this.getUnansweredQuestions(context);
    
    if (unanswered.length === 0) {
      // All questions answered, provide action options
      return [
        {
          id: 'see_doctor',
          text: 'Quiero ver a un doctor',
          value: 'ver doctor',
          category: 'action'
        },
        {
          id: 'get_prescription',
          text: 'Necesito una receta',
          value: 'receta',
          category: 'action'
        },
        {
          id: 'more_info',
          text: 'Tengo más preguntas',
          value: 'más preguntas',
          category: 'general'
        },
        {
          id: 'free_text',
          text: 'Prefiero escribir mi respuesta',
          value: 'free_text',
          category: 'free_text'
        }
      ];
    }
    
    // Generate options based on unanswered questions
    const options: AIAnswerOption[] = [];
    
    if (!context.answeredQuestions.has(this.QUESTION_TYPES.SYMPTOM_DURATION)) {
      options.push(
        {
          id: 'duration_today',
          text: 'Comenzó hoy',
          value: 'hoy',
          category: 'duration'
        },
        {
          id: 'duration_days',
          text: 'Hace unos días',
          value: 'días',
          category: 'duration'
        }
      );
    }
    
    if (!context.answeredQuestions.has(this.QUESTION_TYPES.SYMPTOM_SEVERITY)) {
      options.push({
        id: 'severity_mild',
        text: 'Es leve/tolerable',
        value: 'leve',
        category: 'severity'
      });
    }
    
    // Always include free text option
    options.push({
      id: 'free_text',
      text: 'Prefiero escribir mi respuesta',
      value: 'free_text',
      category: 'free_text'
    });
    
    return options.slice(0, 4); // Max 4 options
  }
  
  /**
   * Clear conversation for a session
   */
  clearSession(sessionId: string): void {
    this.conversationStates.delete(sessionId);
  }
  
  /**
   * Get conversation summary for handoff or storage
   */
  getConversationSummary(sessionId: string): any {
    const context = this.conversationStates.get(sessionId);
    if (!context) return null;
    
    return {
      sessionId,
      userId: context.userId,
      startTime: context.conversationHistory[0]?.timestamp,
      endTime: context.conversationHistory[context.conversationHistory.length - 1]?.timestamp,
      messageCount: context.conversationHistory.length,
      answeredQuestions: Object.fromEntries(context.answeredQuestions),
      userProfile: context.userProfile,
      // For future: this would be stored in database
    };
  }
}

export const unifiedConversationService = UnifiedConversationService.getInstance();