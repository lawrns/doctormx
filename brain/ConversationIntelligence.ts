/**
 * Advanced conversation intelligence for multi-turn dialogues
 * Tracks context, topics, and provides intelligent follow-ups
 */

export interface ConversationState {
  sessionId: string;
  startTime: Date;
  topics: Topic[];
  currentTopic: string | null;
  userProfile: UserProfile;
  conversationFlow: ConversationNode[];
  insights: ConversationInsights;
}

export interface Topic {
  name: string;
  firstMentioned: Date;
  mentions: number;
  resolved: boolean;
  severity?: number;
  relatedTopics: string[];
}

export interface UserProfile {
  communicationStyle: 'formal' | 'casual' | 'anxious' | 'direct';
  primaryConcerns: string[];
  emotionalTendency: 'stable' | 'anxious' | 'depressed' | 'varied';
  responsePreference: 'detailed' | 'brief' | 'visual';
  culturalMarkers: string[];
}

export interface ConversationNode {
  messageId: string;
  timestamp: Date;
  userIntent: string;
  botResponse: string;
  topicTransition: boolean;
  satisfaction: 'positive' | 'neutral' | 'negative' | 'unknown';
}

export interface ConversationInsights {
  dominantEmotion: string;
  conversationQuality: number; // 0-10
  userEngagement: number; // 0-10
  topicCoverage: number; // 0-10
  recommendedActions: string[];
}

export class ConversationIntelligence {
  private static conversations: Map<string, ConversationState> = new Map();
  
  /**
   * Initialize or get conversation state
   */
  static getConversation(sessionId: string): ConversationState {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        sessionId,
        startTime: new Date(),
        topics: [],
        currentTopic: null,
        userProfile: {
          communicationStyle: 'formal',
          primaryConcerns: [],
          emotionalTendency: 'stable',
          responsePreference: 'detailed',
          culturalMarkers: []
        },
        conversationFlow: [],
        insights: {
          dominantEmotion: 'neutral',
          conversationQuality: 5,
          userEngagement: 5,
          topicCoverage: 0,
          recommendedActions: []
        }
      });
    }
    
    return this.conversations.get(sessionId)!;
  }
  
  /**
   * Analyze user message and update conversation state
   */
  static analyzeUserMessage(
    sessionId: string,
    message: string,
    messageId: string
  ): {
    intent: string;
    topics: string[];
    emotion: string;
    urgency: number;
    continuity: 'new' | 'continuation' | 'clarification' | 'tangent';
  } {
    const conversation = this.getConversation(sessionId);
    
    // Extract intent
    const intent = this.extractIntent(message, conversation);
    
    // Extract topics
    const topics = this.extractTopics(message);
    
    // Detect emotion
    const emotion = this.detectEmotion(message);
    
    // Calculate urgency
    const urgency = this.calculateUrgency(message, emotion);
    
    // Determine continuity
    const continuity = this.determineContinuity(message, conversation);
    
    // Update conversation state
    this.updateTopics(conversation, topics);
    this.updateUserProfile(conversation, message, emotion);
    
    return { intent, topics, emotion, urgency, continuity };
  }
  
  /**
   * Extract user intent from message
   */
  private static extractIntent(message: string, conversation: ConversationState): string {
    const lowerMessage = message.toLowerCase();
    
    // Question patterns
    if (lowerMessage.includes('?') || lowerMessage.startsWith('qué') || 
        lowerMessage.startsWith('cómo') || lowerMessage.startsWith('cuándo')) {
      return 'question';
    }
    
    // Symptom reporting
    if (lowerMessage.includes('duele') || lowerMessage.includes('siento') || 
        lowerMessage.includes('tengo')) {
      return 'symptom_report';
    }
    
    // Help seeking
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('necesito') || 
        lowerMessage.includes('emergencia')) {
      return 'help_request';
    }
    
    // Clarification
    if (lowerMessage.includes('no entiendo') || lowerMessage.includes('qué significa') || 
        lowerMessage.includes('explica')) {
      return 'clarification';
    }
    
    // Confirmation/Agreement
    if (lowerMessage.match(/^(sí|si|ok|está bien|de acuerdo|claro)$/)) {
      return 'confirmation';
    }
    
    // Based on conversation flow
    if (conversation.conversationFlow.length > 0) {
      const lastNode = conversation.conversationFlow[conversation.conversationFlow.length - 1];
      if (lastNode.botResponse.includes('?')) {
        return 'answer_to_question';
      }
    }
    
    return 'general_statement';
  }
  
  /**
   * Extract medical and conversational topics
   */
  private static extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Medical topics
    const medicalKeywords = {
      'dolor': ['dolor', 'duele', 'molestia', 'punzada'],
      'fiebre': ['fiebre', 'temperatura', 'calentura'],
      'respiratorio': ['tos', 'gripe', 'respirar', 'pulmones'],
      'digestivo': ['estómago', 'náusea', 'vómito', 'diarrea'],
      'mental': ['ansiedad', 'depresión', 'nervios', 'estrés'],
      'cardiovascular': ['corazón', 'presión', 'pecho', 'palpitaciones']
    };
    
    for (const [topic, keywords] of Object.entries(medicalKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    }
    
    // Life context topics
    if (lowerMessage.includes('trabajo') || lowerMessage.includes('empleo')) {
      topics.push('trabajo');
    }
    if (lowerMessage.includes('familia') || lowerMessage.includes('hijos')) {
      topics.push('familia');
    }
    if (lowerMessage.includes('dormir') || lowerMessage.includes('sueño')) {
      topics.push('sueño');
    }
    
    return [...new Set(topics)];
  }
  
  /**
   * Detect emotion in message
   */
  private static detectEmotion(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Fear/Anxiety markers
    if (lowerMessage.includes('miedo') || lowerMessage.includes('asustado') || 
        lowerMessage.includes('preocupado') || lowerMessage.includes('nervioso')) {
      return 'anxious';
    }
    
    // Sadness markers
    if (lowerMessage.includes('triste') || lowerMessage.includes('llorar') || 
        lowerMessage.includes('deprimido')) {
      return 'sad';
    }
    
    // Anger/Frustration markers
    if (lowerMessage.includes('enojado') || lowerMessage.includes('harto') || 
        lowerMessage.includes('cansado de')) {
      return 'frustrated';
    }
    
    // Pain/Discomfort
    if (lowerMessage.includes('dolor') || lowerMessage.includes('duele mucho')) {
      return 'distressed';
    }
    
    // Positive markers
    if (lowerMessage.includes('mejor') || lowerMessage.includes('gracias') || 
        lowerMessage.includes('bien')) {
      return 'positive';
    }
    
    return 'neutral';
  }
  
  /**
   * Calculate message urgency
   */
  private static calculateUrgency(message: string, emotion: string): number {
    let urgency = 5; // Base urgency
    const lowerMessage = message.toLowerCase();
    
    // High urgency keywords
    const highUrgencyKeywords = ['emergencia', 'urgente', 'ahora', 'inmediato', 
                                 'no puedo', 'muy fuerte', 'insoportable'];
    highUrgencyKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) urgency += 2;
    });
    
    // Emotional urgency
    if (emotion === 'anxious' || emotion === 'distressed') urgency += 1;
    
    // Symptom severity markers
    if (lowerMessage.includes('mucho') || lowerMessage.includes('demasiado')) urgency += 1;
    
    // Time markers
    if (lowerMessage.includes('días') || lowerMessage.includes('semanas')) urgency -= 1;
    
    return Math.max(0, Math.min(10, urgency));
  }
  
  /**
   * Determine conversation continuity
   */
  private static determineContinuity(
    message: string,
    conversation: ConversationState
  ): 'new' | 'continuation' | 'clarification' | 'tangent' {
    if (conversation.conversationFlow.length === 0) return 'new';
    
    const lastTopics = conversation.topics.slice(-3).map(t => t.name);
    const currentTopics = this.extractTopics(message);
    
    // Check if continuing same topic
    const topicOverlap = currentTopics.some(topic => lastTopics.includes(topic));
    if (topicOverlap) return 'continuation';
    
    // Check if clarifying
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('qué significa') || lowerMessage.includes('no entiendo')) {
      return 'clarification';
    }
    
    // Check if answering a question
    const lastBotMessage = conversation.conversationFlow[conversation.conversationFlow.length - 1]?.botResponse;
    if (lastBotMessage && lastBotMessage.includes('?')) {
      return 'continuation';
    }
    
    // Otherwise it's a tangent
    return 'tangent';
  }
  
  /**
   * Update topics in conversation
   */
  private static updateTopics(conversation: ConversationState, newTopics: string[]): void {
    newTopics.forEach(topicName => {
      const existingTopic = conversation.topics.find(t => t.name === topicName);
      
      if (existingTopic) {
        existingTopic.mentions++;
      } else {
        conversation.topics.push({
          name: topicName,
          firstMentioned: new Date(),
          mentions: 1,
          resolved: false,
          relatedTopics: []
        });
      }
    });
    
    // Update current topic
    if (newTopics.length > 0) {
      conversation.currentTopic = newTopics[0];
    }
  }
  
  /**
   * Update user profile based on communication patterns
   */
  private static updateUserProfile(
    conversation: ConversationState,
    message: string,
    emotion: string
  ): void {
    const profile = conversation.userProfile;
    
    // Update communication style
    if (message.length < 20) {
      profile.communicationStyle = 'direct';
    } else if (message.includes('por favor') || message.includes('gracias')) {
      profile.communicationStyle = 'formal';
    } else if (emotion === 'anxious') {
      profile.communicationStyle = 'anxious';
    }
    
    // Update emotional tendency
    const emotions = conversation.conversationFlow
      .map(node => this.detectEmotion(node.userIntent))
      .slice(-5);
    
    if (emotions.filter(e => e === 'anxious').length >= 3) {
      profile.emotionalTendency = 'anxious';
    } else if (emotions.filter(e => e === 'sad').length >= 3) {
      profile.emotionalTendency = 'depressed';
    }
    
    // Update response preference
    if (message.includes('explica') || message.includes('más información')) {
      profile.responsePreference = 'detailed';
    } else if (message.split(' ').length < 10) {
      profile.responsePreference = 'brief';
    }
  }
  
  /**
   * Generate intelligent follow-up based on conversation state
   */
  static generateSmartFollowUp(
    sessionId: string,
    lastBotResponse: string
  ): {
    questions: string[];
    suggestions: string[];
    topicTransitions: string[];
  } {
    const conversation = this.getConversation(sessionId);
    const questions: string[] = [];
    const suggestions: string[] = [];
    const topicTransitions: string[] = [];
    
    // Generate follow-up questions based on unresolved topics
    const unresolvedTopics = conversation.topics.filter(t => !t.resolved);
    unresolvedTopics.forEach(topic => {
      if (topic.mentions === 1) {
        questions.push(this.generateTopicQuestion(topic.name));
      }
    });
    
    // Generate suggestions based on user profile
    if (conversation.userProfile.emotionalTendency === 'anxious') {
      suggestions.push('¿Te gustaría aprender técnicas de relajación?');
    }
    
    // Generate topic transitions for natural flow
    if (conversation.currentTopic) {
      const relatedTopics = this.getRelatedTopics(conversation.currentTopic);
      relatedTopics.forEach(topic => {
        if (!conversation.topics.find(t => t.name === topic)) {
          topicTransitions.push(`También es importante considerar ${topic}`);
        }
      });
    }
    
    return { questions, suggestions, topicTransitions };
  }
  
  /**
   * Generate topic-specific question
   */
  private static generateTopicQuestion(topic: string): string {
    const questionMap: Record<string, string> = {
      'dolor': '¿Puedes describir más específicamente dónde sientes el dolor?',
      'fiebre': '¿Has medido tu temperatura? ¿Cuánto marca?',
      'mental': '¿Desde cuándo te has sentido así?',
      'sueño': '¿Cuántas horas duermes normalmente?',
      'familia': '¿Cómo está afectando esto a tu vida familiar?',
      'trabajo': '¿Tu trabajo podría estar relacionado con estos síntomas?'
    };
    
    return questionMap[topic] || `¿Puedes contarme más sobre ${topic}?`;
  }
  
  /**
   * Get related topics for natural transitions
   */
  private static getRelatedTopics(topic: string): string[] {
    const relations: Record<string, string[]> = {
      'dolor': ['sueño', 'estrés', 'postura'],
      'fiebre': ['respiratorio', 'digestivo', 'infección'],
      'mental': ['sueño', 'trabajo', 'familia'],
      'digestivo': ['alimentación', 'estrés', 'medicamentos'],
      'respiratorio': ['alergias', 'ambiente', 'ejercicio']
    };
    
    return relations[topic] || [];
  }
  
  /**
   * Get conversation quality metrics
   */
  static getConversationMetrics(sessionId: string): ConversationInsights {
    const conversation = this.getConversation(sessionId);
    
    // Calculate quality based on resolution rate
    const resolvedTopics = conversation.topics.filter(t => t.resolved).length;
    const totalTopics = conversation.topics.length;
    const resolutionRate = totalTopics > 0 ? resolvedTopics / totalTopics : 0;
    
    // Calculate engagement based on message patterns
    const avgMessageLength = conversation.conversationFlow.reduce((sum, node) => 
      sum + node.userIntent.length, 0) / Math.max(1, conversation.conversationFlow.length);
    
    const engagement = Math.min(10, avgMessageLength / 10);
    
    // Update insights
    conversation.insights = {
      dominantEmotion: this.calculateDominantEmotion(conversation),
      conversationQuality: Math.round(resolutionRate * 10),
      userEngagement: Math.round(engagement),
      topicCoverage: Math.min(10, conversation.topics.length * 2),
      recommendedActions: this.generateRecommendedActions(conversation)
    };
    
    return conversation.insights;
  }
  
  /**
   * Calculate dominant emotion in conversation
   */
  private static calculateDominantEmotion(conversation: ConversationState): string {
    const emotions = conversation.conversationFlow
      .map(node => this.detectEmotion(node.userIntent));
    
    const emotionCounts: Record<string, number> = {};
    emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral';
  }
  
  /**
   * Generate recommended actions based on conversation
   */
  private static generateRecommendedActions(conversation: ConversationState): string[] {
    const actions: string[] = [];
    
    // Based on unresolved topics
    const unresolvedCount = conversation.topics.filter(t => !t.resolved).length;
    if (unresolvedCount > 2) {
      actions.push('Priorizar y resolver temas pendientes');
    }
    
    // Based on emotional state
    if (conversation.userProfile.emotionalTendency === 'anxious') {
      actions.push('Ofrecer recursos de manejo de ansiedad');
    }
    
    // Based on conversation length
    if (conversation.conversationFlow.length > 20) {
      actions.push('Resumir puntos clave y próximos pasos');
    }
    
    return actions;
  }
}