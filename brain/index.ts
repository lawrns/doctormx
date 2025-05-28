/**
 * DOCTORMX AI BRAIN - CORE INTELLIGENCE INDEX
 * 
 * This file serves as the main entry point for all AI doctor intelligence modules.
 * It exports and integrates the core medical reasoning, emergency protocols,
 * knowledge base, conversation flow, and Mexican cultural context.
 * 
 * INTEGRATION ARCHITECTURE:
 * - Unified interface for all medical intelligence components
 * - Centralized configuration and initialization
 * - Cross-module communication and data sharing
 * - Performance monitoring and error handling
 */

// Core Intelligence Modules
export * from './clinical-logic';
export * from './emergency-protocols';
export * from './medical-knowledge-base';
export * from './conversation-flow';
export * from './mexican-medical-context';

// Re-export key classes for easy access
export {
  EmergencyTriageSystem,
  DiagnosticEngine,
  ConfidenceManager
} from './clinical-logic';

export {
  EmergencyDetection,
  ChestPainProtocol,
  MexicanEmergencyServices,
  EscalationManager
} from './emergency-protocols';

export {
  ConditionDatabase,
  SymptomMapper,
  TreatmentEngine,
  MexicanMedicalTerms
} from './medical-knowledge-base';

export {
  ConversationStateManager,
  QuestionProgressionEngine,
  ResponseGenerator,
  AnswerOptionGenerator
} from './conversation-flow';

export {
  MexicanFamilyContext,
  MexicanMedicalTerminology,
  TraditionalMexicanRemedies,
  MexicanHealthcareSystem,
  MexicanHealthBeliefs
} from './mexican-medical-context';

/**
 * UNIFIED AI DOCTOR BRAIN
 * Main orchestrator class that coordinates all intelligence modules
 */
export class DoctorMXBrain {
  private conversationManager: ConversationStateManager;
  private diagnosticEngine: DiagnosticEngine;
  
  constructor(sessionId: string) {
    this.conversationManager = new ConversationStateManager(sessionId);
    this.diagnosticEngine = new DiagnosticEngine();
  }

  /**
   * Main processing method that coordinates all intelligence modules
   */
  async processInput(
    input: string,
    context: {
      familyMember?: string;
      previousResponses?: string[];
      isFollowUp?: boolean;
    }
  ) {
    // 1. Emergency Detection (Highest Priority)
    const emergencyAssessment = EmergencyDetection.assessEmergencyLevel(input);
    if (emergencyAssessment.isEmergency) {
      return {
        type: 'emergency',
        response: emergencyAssessment.message,
        action: emergencyAssessment.action,
        severity: emergencyAssessment.severity
      };
    }

    // 2. Clinical Analysis
    const clinicalAssessment = this.diagnosticEngine.analyzeSymptom(input);
    
    // 3. Cultural Adaptation
    const culturalContext = context.familyMember 
      ? MexicanFamilyContext.getFamilyMember(context.familyMember)
      : null;

    // 4. Conversation Flow Management
    const conversationState = this.conversationManager.getState();
    const response = ResponseGenerator.generateResponse(
      conversationState,
      null, // QuestionFlow would be determined based on symptom type
      input
    );

    // 5. Generate Contextual Answer Options
    const answerOptions = AnswerOptionGenerator.generateOptions(
      this.determineQuestionType(input),
      { patientType: culturalContext ? 'family' : 'self', familyMember: context.familyMember }
    );

    return {
      type: 'clinical',
      response,
      answerOptions,
      confidence: clinicalAssessment.confidence,
      severity: clinicalAssessment.severity,
      recommendations: clinicalAssessment.recommendations
    };
  }

  private determineQuestionType(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('dolor') && lowerInput.includes('cabeza')) {
      return 'headache_type';
    }
    if (lowerInput.includes('dolor') && lowerInput.includes('pecho')) {
      return 'pain_intensity';
    }
    if (lowerInput.includes('desde') || lowerInput.includes('cuándo')) {
      return 'duration';
    }
    
    return 'yes_no';
  }

  /**
   * Get current conversation state
   */
  getConversationState() {
    return this.conversationManager.getState();
  }

  /**
   * Check if ready for diagnosis
   */
  canProvideDiagnosis(): boolean {
    return this.conversationManager.canProvideDiagnosis();
  }
}

/**
 * BRAIN CONFIGURATION
 * Central configuration for all intelligence modules
 */
export const BrainConfig = {
  // Confidence thresholds
  DIAGNOSIS_CONFIDENCE_THRESHOLD: 0.8,
  EMERGENCY_CONFIDENCE_THRESHOLD: 0.9,
  MIN_QUESTIONS_FOR_DIAGNOSIS: 5,
  
  // Emergency settings
  EMERGENCY_ESCALATION_ENABLED: true,
  MEXICAN_EMERGENCY_NUMBERS: {
    general: '911',
    redCross: '065'
  },
  
  // Cultural settings
  DEFAULT_LANGUAGE: 'es-MX',
  FAMILY_CONSULTATION_ENABLED: true,
  TRADITIONAL_REMEDIES_ENABLED: true,
  
  // Performance settings
  MAX_CONVERSATION_LENGTH: 50,
  RESPONSE_TIMEOUT_MS: 5000,
  
  // Safety settings
  CONSERVATIVE_MODE: true,
  REQUIRE_SPECIALIST_REFERRAL_FOR_CHRONIC: true,
  AUTO_ESCALATE_SEVERE_SYMPTOMS: true
};

/**
 * BRAIN UTILITIES
 * Helper functions for common operations
 */
export class BrainUtils {
  
  /**
   * Validate medical input for safety
   */
  static validateMedicalInput(input: string): {
    isValid: boolean;
    concerns: string[];
  } {
    const concerns: string[] = [];
    
    // Check for emergency keywords
    if (EmergencyTriageSystem.assessEmergency(input)) {
      concerns.push('Emergency symptoms detected');
    }
    
    // Check for medication mentions
    if (input.toLowerCase().includes('medicamento') || input.toLowerCase().includes('pastilla')) {
      concerns.push('Medication mentioned - requires careful handling');
    }
    
    return {
      isValid: concerns.length === 0,
      concerns
    };
  }

  /**
   * Get Mexican cultural context for input
   */
  static getMexicanContext(input: string) {
    const translatedSymptom = MexicanMedicalTerminology.translateToMedical(input);
    const symptomMapping = SymptomMapper.findSymptomMapping(input);
    
    return {
      translatedSymptom,
      symptomMapping,
      culturalTerms: MexicanMedicalTerminology.getMexicanVariants(translatedSymptom)
    };
  }

  /**
   * Assess traditional remedy safety
   */
  static assessTraditionalRemedy(remedyName: string, currentMedications: string[] = []) {
    const remedy = TraditionalMexicanRemedies.findRemedy(remedyName);
    if (!remedy) return null;
    
    return {
      remedy,
      safetyAssessment: TraditionalMexicanRemedies.assessSafety(remedy, currentMedications),
      modernGuidance: TraditionalMexicanRemedies.getModernGuidance(remedy)
    };
  }
}

/**
 * BRAIN PERFORMANCE MONITOR
 * Tracks performance and accuracy metrics
 */
export class BrainPerformanceMonitor {
  private static metrics = {
    totalInteractions: 0,
    emergencyDetections: 0,
    diagnosticAccuracy: 0,
    averageQuestionsToConfidence: 0,
    culturalAdaptations: 0
  };

  static recordInteraction(type: 'emergency' | 'clinical' | 'cultural') {
    this.metrics.totalInteractions++;
    
    switch (type) {
      case 'emergency':
        this.metrics.emergencyDetections++;
        break;
      case 'cultural':
        this.metrics.culturalAdaptations++;
        break;
    }
  }

  static getMetrics() {
    return { ...this.metrics };
  }

  static resetMetrics() {
    this.metrics = {
      totalInteractions: 0,
      emergencyDetections: 0,
      diagnosticAccuracy: 0,
      averageQuestionsToConfidence: 0,
      culturalAdaptations: 0
    };
  }
}

// Default export for easy importing
export default DoctorMXBrain;
