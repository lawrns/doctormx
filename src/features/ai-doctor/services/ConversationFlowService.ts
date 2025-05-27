/**
 * Service to detect conversation flow patterns and provide appropriate response types
 */

export type ConversationType = 'greeting' | 'farewell' | 'simple_question' | 'medical_concern' | 'emergency' | 'general';
export type ResponseComplexity = 'minimal' | 'simple' | 'moderate' | 'detailed';

interface ConversationPattern {
  pattern: RegExp;
  type: ConversationType;
  complexity: ResponseComplexity;
}

export class ConversationFlowService {
  private static patterns: ConversationPattern[] = [
    // Greetings - should have minimal responses
    { 
      pattern: /^(hola|hi|hey|buenos días|buenas tardes|buenas noches|qué tal|saludos)$/i,
      type: 'greeting',
      complexity: 'minimal'
    },
    { 
      pattern: /^(hola doctor|hola dr|hola doc)$/i,
      type: 'greeting',
      complexity: 'minimal'
    },
    
    // Farewells
    {
      pattern: /^(adiós|bye|hasta luego|gracias|nos vemos|chao)$/i,
      type: 'farewell',
      complexity: 'minimal'
    },
    
    // Simple questions that don't need medical analysis
    {
      pattern: /^(cómo estás|cómo está|qué haces|quién eres|cuál es tu nombre)$/i,
      type: 'simple_question',
      complexity: 'simple'
    },
    
    // Medical keywords that need proper analysis
    {
      pattern: /\b(dolor|duele|síntoma|enfermo|mal|medicina|medicamento|fiebre|tos|mareado|náusea)\b/i,
      type: 'medical_concern',
      complexity: 'detailed'
    },
    
    // Emergency keywords
    {
      pattern: /\b(emergencia|urgente|grave|sangre|no puedo respirar|pecho|corazón)\b/i,
      type: 'emergency',
      complexity: 'detailed'
    }
  ];

  /**
   * Analyzes the message to determine conversation type and appropriate response complexity
   */
  static analyzeMessage(message: string): { type: ConversationType; complexity: ResponseComplexity } {
    const trimmedMessage = message.trim().toLowerCase();
    
    // Check patterns in order of priority
    for (const pattern of this.patterns) {
      if (pattern.pattern.test(trimmedMessage)) {
        return { type: pattern.type, complexity: pattern.complexity };
      }
    }
    
    // Default to general conversation with moderate complexity
    return { type: 'general', complexity: 'moderate' };
  }

  /**
   * Determines if the message needs thinking animation
   */
  static needsThinkingAnimation(message: string): boolean {
    const analysis = this.analyzeMessage(message);
    
    // Only show thinking for medical concerns or complex questions
    return analysis.type === 'medical_concern' || 
           analysis.type === 'emergency' ||
           (analysis.type === 'general' && message.length > 50);
  }

  /**
   * Gets appropriate greeting response based on time of day
   */
  static getGreetingResponse(): string {
    const hour = new Date().getHours();
    const greetings = [
      { start: 0, end: 12, text: '¡Buenos días! ¿En qué puedo ayudarte?' },
      { start: 12, end: 19, text: '¡Buenas tardes! ¿Cómo te puedo ayudar?' },
      { start: 19, end: 24, text: '¡Buenas noches! ¿En qué te puedo asistir?' }
    ];
    
    const greeting = greetings.find(g => hour >= g.start && hour < g.end);
    return greeting?.text || '¡Hola! ¿Cómo puedo ayudarte?';
  }

  /**
   * Generates appropriate response based on conversation type
   */
  static generateSimpleResponse(type: ConversationType, message: string): string | null {
    switch (type) {
      case 'greeting':
        return this.getGreetingResponse();
        
      case 'farewell':
        return '¡Cuídate mucho! Estoy aquí cuando me necesites. 🌟';
        
      case 'simple_question':
        if (message.includes('cómo estás')) {
          return '¡Muy bien, gracias por preguntar! Estoy aquí para ayudarte con cualquier consulta médica. ¿Tienes alguna molestia?';
        }
        if (message.includes('quién eres')) {
          return 'Soy Dr. Simeon, tu asistente médico virtual. Estoy aquí para ayudarte con consultas de salud 24/7. 🩺';
        }
        return null;
        
      default:
        return null;
    }
  }

  /**
   * Determines if we should skip the full AI processing
   */
  static shouldSkipAIProcessing(message: string): boolean {
    const analysis = this.analyzeMessage(message);
    return analysis.type === 'greeting' || 
           analysis.type === 'farewell' || 
           (analysis.type === 'simple_question' && this.generateSimpleResponse(analysis.type, message) !== null);
  }

  /**
   * Gets conversation context hints for the AI
   */
  static getContextHints(messages: Array<{ text: string; sender: 'user' | 'bot' }>): string {
    if (messages.length <= 2) {
      return 'This is the beginning of the conversation. Keep responses brief and welcoming.';
    }
    
    const lastUserMessages = messages
      .filter(m => m.sender === 'user')
      .slice(-3)
      .map(m => m.text);
    
    const hasGreeting = lastUserMessages.some(m => 
      this.analyzeMessage(m).type === 'greeting'
    );
    
    if (hasGreeting && messages.length < 6) {
      return 'User just greeted. Keep the response conversational and brief. Ask how you can help.';
    }
    
    const hasMedicalConcern = lastUserMessages.some(m => 
      this.analyzeMessage(m).type === 'medical_concern'
    );
    
    if (hasMedicalConcern) {
      return 'User has a medical concern. Provide helpful, empathetic response with appropriate detail.';
    }
    
    return 'Continue the conversation naturally, matching the user\'s tone and complexity.';
  }
}