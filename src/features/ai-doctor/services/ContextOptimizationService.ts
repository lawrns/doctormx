/**
 * Service to optimize context window and response length for better performance
 */

export interface ContextWindow {
  messages: string[];
  metadata: {
    totalMessages: number;
    windowSize: number;
    stage: 'discovery' | 'diagnosis' | 'treatment';
  };
}

export class ContextOptimizationService {
  private static readonly DISCOVERY_MESSAGE_THRESHOLD = 10;
  private static readonly MAX_CONTEXT_MESSAGES = 6; // 3 exchanges
  private static readonly CRITICAL_KEYWORDS = [
    'dolor', 'sangre', 'emergencia', 'grave', 'urgente',
    'no puedo', 'dificultad', 'pérdida', 'desmayo'
  ];

  /**
   * Determines the current conversation stage
   */
  static getConversationStage(messageCount: number): 'discovery' | 'diagnosis' | 'treatment' {
    if (messageCount < this.DISCOVERY_MESSAGE_THRESHOLD) {
      return 'discovery';
    } else if (messageCount < 20) {
      return 'diagnosis';
    }
    return 'treatment';
  }

  /**
   * Optimizes context window to prevent token overflow
   */
  static optimizeContextWindow(messages: Array<{ text: string; sender: 'user' | 'bot' }>): ContextWindow {
    const totalMessages = messages.length;
    const stage = this.getConversationStage(totalMessages);
    
    // In discovery phase, use minimal context
    let windowSize = stage === 'discovery' ? 4 : this.MAX_CONTEXT_MESSAGES;
    
    // Always include critical messages
    const criticalMessages = this.extractCriticalMessages(messages);
    
    // Get recent messages
    const recentMessages = messages.slice(-windowSize);
    
    // Combine critical and recent, avoiding duplicates
    const contextMessages = this.mergeContextMessages(criticalMessages, recentMessages);
    
    return {
      messages: contextMessages.map(m => m.text),
      metadata: {
        totalMessages,
        windowSize: contextMessages.length,
        stage
      }
    };
  }

  /**
   * Extract messages containing critical medical information
   */
  private static extractCriticalMessages(
    messages: Array<{ text: string; sender: 'user' | 'bot' }>
  ): Array<{ text: string; sender: 'user' | 'bot' }> {
    return messages.filter(msg => {
      const lowerText = msg.text.toLowerCase();
      return this.CRITICAL_KEYWORDS.some(keyword => lowerText.includes(keyword));
    }).slice(-2); // Keep only last 2 critical messages
  }

  /**
   * Merge critical and recent messages without duplicates
   */
  private static mergeContextMessages(
    critical: Array<{ text: string; sender: 'user' | 'bot' }>,
    recent: Array<{ text: string; sender: 'user' | 'bot' }>
  ): Array<{ text: string; sender: 'user' | 'bot' }> {
    const merged = [...recent];
    
    // Add critical messages if not already in recent
    critical.forEach(criticalMsg => {
      if (!merged.some(m => m.text === criticalMsg.text)) {
        merged.unshift(criticalMsg);
      }
    });
    
    // Limit total size
    return merged.slice(-this.MAX_CONTEXT_MESSAGES);
  }

  /**
   * Get response length instructions based on conversation stage
   */
  static getResponseLengthInstructions(stage: 'discovery' | 'diagnosis' | 'treatment'): string {
    switch (stage) {
      case 'discovery':
        return `CRITICAL: Keep responses VERY brief (under 50 words). 
                Ask ONE specific question at a time. 
                No explanations or elaborations.
                Example: "¿Dónde sientes el dolor?" or "¿Desde cuándo tienes estos síntomas?"`;
      
      case 'diagnosis':
        return `Keep responses concise (under 75 words).
                Focus on key symptoms and recommendations.
                Avoid lengthy explanations.`;
      
      case 'treatment':
        return `Provide essential information only (under 100 words).
                List treatments/medications clearly.
                Skip unnecessary details.`;
    }
  }

  /**
   * Determine if animations should be shown
   */
  static shouldShowAnimations(messageCount: number, messageType: string): boolean {
    // No animations in discovery phase
    if (messageCount < this.DISCOVERY_MESSAGE_THRESHOLD) {
      return false;
    }
    
    // Only show for medical analysis
    return messageType === 'medical_concern' || messageType === 'emergency';
  }

  /**
   * Get simplified system instructions for concise responses
   */
  static getSystemInstructions(stage: 'discovery' | 'diagnosis' | 'treatment'): string {
    const lengthInstructions = this.getResponseLengthInstructions(stage);
    
    return `
${lengthInstructions}

RESPONSE RULES:
1. NO greetings or pleasantries after the first message
2. NO repetitive phrases like "estoy aquí para ayudarte"
3. NO explanations of what you're doing
4. Get straight to the point
5. Use bullet points for multiple items
6. End with a specific question or action

DISCOVERY PHASE EXAMPLE:
User: "Me duele la cabeza"
You: "¿Dónde exactamente? ¿Es pulsante o constante?"

NOT: "Lamento escuchar que te duele la cabeza. Como tu médico, estoy aquí para ayudarte. Necesito hacerte algunas preguntas para entender mejor tu situación..."
    `.trim();
  }

  /**
   * Clean message for context (remove unnecessary formatting)
   */
  static cleanMessageForContext(message: string): string {
    return message
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/\s{2,}/g, ' ')    // Remove excessive spaces
      .trim();
  }
}