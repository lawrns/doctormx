import { MexicanDoctorPersonalityService, EmotionalState, ConversationContext } from './MexicanDoctorPersonalityService';
import AIService, { AIQueryOptions, AIResponse, StreamingAIResponse, AIAnswerOption } from './AIService';

export interface EnhancedAIQueryOptions extends AIQueryOptions {
  enablePersonality?: boolean;
  culturalContext?: Partial<ConversationContext>;
  showThinking?: boolean;
  thinkingComplexity?: 'simple' | 'medium' | 'complex';
  sessionId?: string;
}

export interface EnhancedStreamingAIResponse extends AIResponse {
  emotionalState?: EmotionalState;
  personalityApplied?: boolean;
  thinkingStages?: string[];
  culturalFactors?: string[];
  answerOptions?: AIAnswerOption[];
  isStreaming: boolean;
  isComplete: boolean;
  suggestedMedications?: string[];
}

export interface EnhancedAIResponse extends AIResponse {
  emotionalState?: EmotionalState;
  personalityApplied?: boolean;
  thinkingStages?: string[];
  culturalFactors?: string[];
  answerOptions?: AIAnswerOption[];
}

export type EnhancedStreamingResponseHandler = (response: EnhancedStreamingAIResponse) => void;

export class EnhancedAIService {
  private personalityService: MexicanDoctorPersonalityService;
  private conversationHistory: Map<string, string[]> = new Map();
  private baseAIService = AIService; // Use composition instead of inheritance

  constructor() {
    this.personalityService = new MexicanDoctorPersonalityService();
  }

  /**
   * Enhanced process query with Mexican doctor personality and thinking indicators
   */
  async processEnhancedQuery(options: EnhancedAIQueryOptions): Promise<EnhancedAIResponse> {
    const startTime = Date.now();
    let emotionalState: EmotionalState | undefined;
    
    try {
      // Step 1: Analyze emotional state if personality is enabled
      if (options.enablePersonality !== false) {
        const history = this.conversationHistory.get(options.sessionId || 'default') || [];
        emotionalState = await this.personalityService.analyzeEmotionalState(
          options.userMessage,
          history
        );
      }

      // Step 2: Show thinking indicators if enabled
      let thinkingStages: string[] = [];
      if (options.showThinking !== false && options.onStreamingResponse) {
        const complexity = options.thinkingComplexity || this.determineComplexity(options.userMessage);
        const thinking = this.personalityService.generateThinkingIndicators(complexity);
        thinkingStages = thinking.stages;

        // Show thinking stages with natural delays
        await this.displayThinkingStages(thinking, options.onStreamingResponse);
      }

      // Step 3: Get base AI response using enhanced instructions
      const enhancedOptions = {
        ...options,
        customInstructions: options.customInstructions ? 
          `${options.customInstructions}\n${this.getDoctorInstructions()}` : 
          this.getDoctorInstructions()
      };
      const baseResponse = await this.baseAIService.processQuery(enhancedOptions);

      // Step 4: Apply personality enhancement if enabled
      let enhancedText = baseResponse.text;
      
      // Skip personality enhancement in development mode for cleaner mock responses
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      
      if (options.enablePersonality !== false && emotionalState && !isDevelopment) {
        enhancedText = this.personalityService.generatePersonalizedResponse(
          baseResponse.text,
          emotionalState,
          options.culturalContext || {}
        );
      }

      // Step 5: Store conversation history
      const sessionId = options.sessionId || 'default';
      const history = this.conversationHistory.get(sessionId) || [];
      history.push(options.userMessage, enhancedText);
      
      // Keep only last 10 exchanges
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      this.conversationHistory.set(sessionId, history);

      const enhancedResponse: EnhancedAIResponse = {
        ...baseResponse,
        text: enhancedText,
        emotionalState: isDevelopment ? undefined : emotionalState,
        personalityApplied: isDevelopment ? false : (options.enablePersonality !== false),
        thinkingStages: thinkingStages.length > 0 ? thinkingStages : undefined,
        culturalFactors: isDevelopment ? undefined : emotionalState?.culturalFactors,
        answerOptions: baseResponse.answerOptions
      };

      console.log(`Enhanced AI processing completed in ${Date.now() - startTime}ms`);
      return enhancedResponse;

    } catch (error) {
      console.error('Error in enhanced AI processing:', error);
      
      // Fallback to base service
      const fallbackResponse = await this.baseAIService.processQuery(options);
      return {
        ...fallbackResponse,
        emotionalState,
        personalityApplied: false,
        thinkingStages: undefined,
        culturalFactors: undefined,
        answerOptions: undefined
      };
    }
  }

  /**
   * Enhanced streaming query that wraps the base streaming with personality features
   */
  async processEnhancedStreamingQuery(
    options: EnhancedAIQueryOptions,
    streamHandler: EnhancedStreamingResponseHandler
  ): Promise<void> {
    let emotionalState: EmotionalState | undefined;
    let thinkingStages: string[] = [];

    try {
      // Analyze emotional state if personality is enabled
      if (options.enablePersonality !== false) {
        const history = this.conversationHistory.get(options.sessionId || 'default') || [];
        emotionalState = await this.personalityService.analyzeEmotionalState(
          options.userMessage,
          history
        );
      }

      // Show thinking indicators if enabled
      if (options.showThinking !== false) {
        const complexity = options.thinkingComplexity || this.determineComplexity(options.userMessage);
        const thinking = this.personalityService.generateThinkingIndicators(complexity);
        thinkingStages = thinking.stages;

        // Show thinking stages
        for (let i = 0; i < thinking.stages.length; i++) {
          streamHandler({
            text: thinking.stages[i],
            severity: 10,
            isStreaming: true,
            isComplete: false,
            emotionalState,
            personalityApplied: false,
            thinkingStages,
            culturalFactors: emotionalState?.culturalFactors,
            answerOptions: undefined // Not available during thinking stages
          });
          
          await new Promise(resolve => setTimeout(resolve, thinking.duration / thinking.stages.length));
        }
      }

      // Create wrapper for base streaming handler with timeout protection
      const baseStreamHandler = (baseResponse: StreamingAIResponse) => {
        try {
          let enhancedText = baseResponse.text;
          
          // Skip personality enhancement in development mode for cleaner mock responses
          const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
          
          // Apply personality enhancement to streaming text only in production
          if (options.enablePersonality !== false && emotionalState && baseResponse.text && !isDevelopment) {
            enhancedText = this.personalityService.generatePersonalizedResponse(
              baseResponse.text,
              emotionalState,
              options.culturalContext || {}
            );
          }

          const enhancedStreamResponse: EnhancedStreamingAIResponse = {
            ...baseResponse,
            text: enhancedText,
            emotionalState: isDevelopment ? undefined : emotionalState,
            personalityApplied: isDevelopment ? false : (options.enablePersonality !== false),
            thinkingStages: thinkingStages.length > 0 ? thinkingStages : undefined,
            culturalFactors: isDevelopment ? undefined : emotionalState?.culturalFactors,
            answerOptions: baseResponse.answerOptions,
            isStreaming: baseResponse.isStreaming,
            isComplete: baseResponse.isComplete,
            suggestedMedications: baseResponse.suggestedMedications
          };

          streamHandler(enhancedStreamResponse);

          // Store conversation history when complete
          if (baseResponse.isComplete) {
            const sessionId = options.sessionId || 'default';
            const history = this.conversationHistory.get(sessionId) || [];
            history.push(options.userMessage, enhancedText);
            
            if (history.length > 20) {
              history.splice(0, history.length - 20);
            }
            this.conversationHistory.set(sessionId, history);
          }
        } catch (handlerError) {
          console.error('Error in enhanced stream handler:', handlerError);
          
          // Send clean error response if handler fails - no personality mixing
          streamHandler({
            text: 'Lo siento, hubo un error al procesar la respuesta. Por favor, intenta nuevamente.',
            severity: 10,
            isStreaming: false,
            isComplete: true,
            emotionalState: undefined,
            personalityApplied: false,
            thinkingStages: undefined,
            culturalFactors: undefined,
            answerOptions: undefined
          });
        }
      };

      // Set up timeout protection
      const timeoutId = setTimeout(() => {
        console.error('AI service timeout - sending fallback response');
        streamHandler({
          text: 'Lo siento, la respuesta está tardando más de lo esperado. Por favor, intenta nuevamente.',
          severity: 10,
          isStreaming: false,
          isComplete: true,
          emotionalState: undefined,
          personalityApplied: false,
          thinkingStages: undefined,
          culturalFactors: undefined,
          answerOptions: undefined
        });
      }, 30000); // 30 second timeout

      // Call base AI service with enhanced options
      const enhancedOptions = {
        ...options,
        stream: true,
        onStreamingResponse: baseStreamHandler,
        customInstructions: options.customInstructions || this.getDoctorInstructions()
      };

      try {
        await this.baseAIService.processQuery(enhancedOptions);
        clearTimeout(timeoutId);
      } catch (serviceError) {
        clearTimeout(timeoutId);
        console.error('Error in base AI service:', serviceError);
        
        // Send fallback response
        streamHandler({
          text: 'Lo siento, no pude procesar tu consulta en este momento. Por favor, verifica tu conexión e intenta nuevamente.',
          severity: 10,
          isStreaming: false,
          isComplete: true,
          emotionalState: undefined,
          personalityApplied: false,
          thinkingStages: undefined,
          culturalFactors: undefined,
          answerOptions: undefined
        });
      }

    } catch (error) {
      console.error('Error in enhanced streaming query:', error);
      
      // Final fallback response
      streamHandler({
        text: 'Lo siento, hubo un error inesperado. Por favor, recarga la página e intenta nuevamente.',
        severity: 10,
        isStreaming: false,
        isComplete: true,
        emotionalState: undefined,
        personalityApplied: false,
        thinkingStages: undefined,
        culturalFactors: undefined,
        answerOptions: undefined
      });
    }
  }

  /**
   * Display thinking stages with natural timing
   */
  private async displayThinkingStages(
    thinking: { stages: string[]; duration: number },
    streamHandler: (response: StreamingAIResponse) => void
  ): Promise<void> {
    const stageDelay = thinking.duration / thinking.stages.length;

    for (let i = 0; i < thinking.stages.length; i++) {
      const stage = thinking.stages[i];
      
      streamHandler({
        text: stage,
        severity: 10,
        isStreaming: true,
        isComplete: false
      });

      // Natural delay between thinking stages
      await new Promise(resolve => setTimeout(resolve, stageDelay));
    }

    // Brief pause before actual response
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Determine thinking complexity based on message content
   */
  private determineComplexity(message: string): 'simple' | 'medium' | 'complex' {
    const complexityIndicators = {
      simple: ['hola', 'gracias', 'bien', 'mal', 'si', 'no'],
      medium: ['dolor', 'fiebre', 'síntoma', 'medicina', 'doctor'],
      complex: [
        'diagnóstico', 'tratamiento', 'enfermedad', 'crónico', 'especialista',
        'análisis', 'estudio', 'múltiples síntomas', 'complicación'
      ]
    };

    const lowerMessage = message.toLowerCase();
    
    // Check for complex indicators first
    if (complexityIndicators.complex.some(indicator => lowerMessage.includes(indicator))) {
      return 'complex';
    }
    
    // Then medium
    if (complexityIndicators.medium.some(indicator => lowerMessage.includes(indicator))) {
      return 'medium';
    }
    
    // Default to simple for basic interactions
    return 'simple';
  }

  /**
   * Generate culturally appropriate greeting
   */
  generatePersonalizedGreeting(culturalFactors?: string[]): string {
    return this.personalityService.generateMexicanMedicalGreeting();
  }

  /**
   * Generate follow-up questions based on conversation context
   */
  generateContextualFollowUp(topic: string, emotionalState?: EmotionalState): string[] {
    if (!emotionalState) {
      emotionalState = {
        primary: 'anxiety',
        intensity: 0.5,
        confidence: 0.5,
        culturalFactors: [],
        recommendedTone: 'professional'
      };
    }
    
    return this.personalityService.generateMexicanFollowUpQuestions(topic, emotionalState);
  }

  /**
   * Clear conversation history for a session
   */
  clearConversationHistory(sessionId: string = 'default'): void {
    this.conversationHistory.delete(sessionId);
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId: string = 'default'): string[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  // Delegate other methods to the base AI service
  async analyzeImage(imageUrl: string, symptoms?: string): Promise<AIResponse> {
    return this.baseAIService.analyzeImage(imageUrl, symptoms);
  }

  async findNearbyProviders(specialty: string, location: { latitude: number; longitude: number }): Promise<any[]> {
    return this.baseAIService.findNearbyProviders(specialty, location);
  }

  async getMedicationRecommendations(condition: string, userProfile: any): Promise<any[]> {
    return this.baseAIService.getMedicationRecommendations(condition, userProfile);
  }

  async getPharmacyRecommendations(medications: string[], location: { latitude: number; longitude: number }): Promise<any[]> {
    // Generate Mexican pharmacy recommendations based on location and medications
    const samplePharmacies = [
      {
        id: 'fda-1',
        name: 'Farmacia del Ahorro - Sucursal Centro',
        address: 'Av. Reforma 123, Centro, CDMX',
        latitude: location.latitude + 0.01,
        longitude: location.longitude + 0.01,
        distance: Math.random() * 2000 + 500, // 500m to 2.5km
        isSponsored: true,
        available_medications: medications.slice(0, Math.floor(Math.random() * medications.length) + 1),
        phone: '55-1234-5678',
        hours: '24 horas',
        insurance_accepted: ['IMSS', 'ISSSTE', 'Seguro Popular']
      },
      {
        id: 'similares-1',
        name: 'Farmacias Similares - Dr. Simi',
        address: 'Calle Madero 456, Centro, CDMX',
        latitude: location.latitude - 0.008,
        longitude: location.longitude + 0.012,
        distance: Math.random() * 1500 + 300,
        isSponsored: false,
        available_medications: medications,
        phone: '55-8765-4321',
        hours: '8:00 AM - 10:00 PM',
        insurance_accepted: ['IMSS', 'ISSSTE']
      },
      {
        id: 'guadalajara-1',
        name: 'Farmacias Guadalajara',
        address: 'Av. Insurgentes 789, Roma Norte, CDMX',
        latitude: location.latitude + 0.015,
        longitude: location.longitude - 0.005,
        distance: Math.random() * 3000 + 800,
        isSponsored: false,
        available_medications: medications.slice(0, 2),
        phone: '55-2468-1357',
        hours: '7:00 AM - 11:00 PM',
        insurance_accepted: ['IMSS', 'ISSSTE', 'Seguro Popular', 'Privado']
      }
    ];

    // Sort by distance
    return samplePharmacies.sort((a, b) => a.distance - b.distance);
  }

  async scheduleAppointment(doctorId: string, date: string, time: string, type: string): Promise<any> {
    return this.baseAIService.scheduleAppointment(doctorId, date, time, type);
  }

  /**
   * Enhanced instructions that include Mexican medical personality
   */
  getDoctorInstructions(): string {
    return `
Eres el Dr. Simeon, un médico mexicano profesional y empático. 

IMPORTANTE - ESTILO DE CONVERSACIÓN:
- Para saludos simples (hola, buenos días, etc): Responde brevemente con un saludo cordial y pregunta cómo puedes ayudar
- NO repitas frases sobre "cuidarte como familia" en cada respuesta
- Mantén las respuestas naturales y conversacionales
- Solo menciona aspectos familiares cuando sea médicamente relevante

COMUNICACIÓN MÉDICA:
- Sé claro y directo en tus respuestas
- Usa lenguaje sencillo y accesible
- Para consultas médicas: proporciona información útil y específica
- Para emergencias: actúa con urgencia apropiada

LÍMITES PROFESIONALES:
- No diagnostiques sin evaluación presencial
- Recomienda atención médica cuando sea necesario
- Mantén la ética médica

Responde de manera natural, como un médico real en una conversación.
    `.trim();
  }
}

// Create and export a singleton instance
export const enhancedAIService = new EnhancedAIService(); 