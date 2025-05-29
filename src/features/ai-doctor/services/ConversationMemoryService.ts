import { Message } from '../../../contexts/ConversationContext';

export interface ConversationSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  messages: Message[];
  context: {
    familyMember?: string;
    mainSymptoms: string[];
    suggestedConditions: string[];
    currentSeverity: number;
    culturalFactors: string[];
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  summary: {
    keyTopics: string[];
    emergencyFlags: boolean[];
    followUpNeeded: boolean;
    lastDiagnosis?: string;
  };
}

export interface ContextualMemory {
  medicalTerms: Set<string>;
  symptomPatterns: Map<string, number>;
  userPreferences: {
    preferredLanguage: 'es' | 'en';
    communicationStyle: 'formal' | 'casual';
    familyOriented: boolean;
  };
  conversationFlow: {
    commonTransitions: Map<string, string[]>;
    topicClusters: Map<string, string[]>;
  };
}

class ConversationMemoryService {
  private static instance: ConversationMemoryService;
  private sessions = new Map<string, ConversationSession>();
  private contextualMemory: ContextualMemory;
  private maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
  private maxSessions = 100; // Limit memory usage

  constructor() {
    this.contextualMemory = {
      medicalTerms: new Set(),
      symptomPatterns: new Map(),
      userPreferences: {
        preferredLanguage: 'es',
        communicationStyle: 'casual',
        familyOriented: true
      },
      conversationFlow: {
        commonTransitions: new Map(),
        topicClusters: new Map()
      }
    };

    this.initializeMedicalTerms();
    this.startCleanupTimer();
  }

  static getInstance(): ConversationMemoryService {
    if (!ConversationMemoryService.instance) {
      ConversationMemoryService.instance = new ConversationMemoryService();
    }
    return ConversationMemoryService.instance;
  }

  updateSession(sessionId: string, message: Message, context?: Partial<ConversationSession['context']>): void {
    const now = new Date();
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        startTime: now,
        lastActivity: now,
        messages: [],
        context: {
          mainSymptoms: [],
          suggestedConditions: [],
          currentSeverity: 5,
          culturalFactors: [],
          ...context
        },
        summary: {
          keyTopics: [],
          emergencyFlags: [],
          followUpNeeded: false
        }
      };
    }

    session.lastActivity = now;
    session.messages.push(message);

    if (session.messages.length > 50) {
      session.messages = session.messages.slice(-50);
    }

    this.updateSessionContext(session, message);
    this.sessions.set(sessionId, session);
    this.learnFromMessage(message);
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getRelevantContext(sessionId: string, currentMessage: string): {
    recentMessages: Message[];
    relatedSymptoms: string[];
    conversationPattern: string;
    culturalContext: string[];
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        recentMessages: [],
        relatedSymptoms: [],
        conversationPattern: 'initial',
        culturalContext: []
      };
    }

    const recentMessages = session.messages.slice(-10);
    const relatedSymptoms = this.extractRelatedSymptoms(currentMessage, session);
    const conversationPattern = this.determineConversationPattern(session);

    return {
      recentMessages,
      relatedSymptoms,
      conversationPattern,
      culturalContext: session.context.culturalFactors
    };
  }

  private updateSessionContext(session: ConversationSession, message: Message): void {
    if (message.sender === 'user') {
      const symptoms = this.extractSymptoms(message.text);
      session.context.mainSymptoms = [...new Set([...session.context.mainSymptoms, ...symptoms])];
    }

    const topics = this.extractKeyTopics(message.text);
    session.summary.keyTopics = [...new Set([...session.summary.keyTopics, ...topics])].slice(-10);
  }

  private extractSymptoms(text: string): string[] {
    const symptoms: string[] = [];
    const lowerText = text.toLowerCase();

    const symptomPatterns = [
      /dolor de (cabeza|espalda|estómago|garganta|pecho)/,
      /tengo (fiebre|tos|náuseas|mareos|vómitos)/,
      /(cansancio|fatiga|debilidad)/
    ];

    for (const pattern of symptomPatterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        symptoms.push(matches[0]);
      }
    }

    return symptoms;
  }

  private extractKeyTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    const topicPatterns = [
      { pattern: /medicamento|medicina|pastilla|tratamiento/, topic: 'medicamentos' },
      { pattern: /doctor|médico|especialista/, topic: 'consulta_médica' },
      { pattern: /familia|hijo|hija|esposo|esposa|padre|madre/, topic: 'familia' },
      { pattern: /emergencia|urgente|grave|hospital/, topic: 'emergencia' }
    ];

    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(lowerText)) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private extractRelatedSymptoms(currentMessage: string, session: ConversationSession): string[] {
    return [];
  }

  private determineConversationPattern(session: ConversationSession): string {
    const messageCount = session.messages.length;
    if (messageCount <= 2) return 'initial';
    return 'general_inquiry';
  }

  private learnFromMessage(message: Message): void {
    // Simple learning implementation
  }

  private initializeMedicalTerms(): void {
    const commonTerms = [
      'diabetes', 'hipertensión', 'gripe', 'tos', 'fiebre', 'dolor',
      'paracetamol', 'ibuprofeno', 'aspirina', 'antibiótico',
      'doctor', 'médico', 'hospital', 'clínica', 'farmacia'
    ];

    commonTerms.forEach(term => this.contextualMemory.medicalTerms.add(term));
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupOldSessions();
    }, 60 * 60 * 1000);
  }

  cleanupOldSessions(): void {
    const now = Date.now();
    const sessionsToDelete: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity.getTime() > this.maxSessionAge) {
        sessionsToDelete.push(sessionId);
      }
    }

    sessionsToDelete.forEach(id => this.sessions.delete(id));
  }
}

export const conversationMemoryService = ConversationMemoryService.getInstance();