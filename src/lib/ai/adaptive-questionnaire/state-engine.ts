/**
 * State Transition Engine
 * Manages conversation phases and determines when to transition between them
 */

import {
  ConversationState,
  ConversationPhase,
  UrgencyLevel,
  Symptom,
  DiagnosticHypothesis,
  RedFlag,
  ConversationContext,
  RED_FLAG_PATTERNS
} from './types'

export class StateTransitionEngine {
  
  /**
   * Evaluate if we should transition to a new phase based on current state
   */
  evaluatePhaseTransition(state: ConversationState): ConversationPhase {
    const { phase, collected_symptoms, diagnostic_hypotheses, question_count, red_flags } = state
    
    // Emergency override - if critical red flags detected, move to synthesis immediately
    const hasCriticalRedFlags = red_flags.some(rf => rf.severity === 'critical')
    if (hasCriticalRedFlags) {
      return 'synthesis'
    }
    
    switch (phase) {
      case 'history_taking':
        return this.evaluateHistoryTakingTransition(state)
      case 'focused_inquiry':
        return this.evaluateFocusedInquiryTransition(state)
      case 'synthesis':
        return 'synthesis' // Already in final phase
      default:
        return 'history_taking'
    }
  }
  
  private evaluateHistoryTakingTransition(state: ConversationState): ConversationPhase {
    const { collected_symptoms, question_count, knowledge_gaps } = state
    
    // Must have at least 3 questions and at least one symptom identified
    const hasMinimumData = question_count >= 3 && collected_symptoms.length > 0
    
    // Check if we have enough information to form hypotheses
    const hasEnoughContext = collected_symptoms.some(s => 
      s.severity !== undefined && s.duration !== undefined
    )
    
    // If we have enough data and no major knowledge gaps, move to focused inquiry
    if (hasMinimumData && hasEnoughContext && knowledge_gaps.length < 3) {
      return 'focused_inquiry'
    }
    
    return 'history_taking'
  }
  
  private evaluateFocusedInquiryTransition(state: ConversationState): ConversationPhase {
    const { 
      diagnostic_hypotheses, 
      question_count, 
      knowledge_gaps,
      collected_symptoms 
    } = state
    
    // If we've asked too many questions, move to synthesis
    if (question_count >= 15) {
      return 'synthesis'
    }
    
    // If we have confident diagnoses and few knowledge gaps, synthesize
    const hasConfidentDiagnoses = diagnostic_hypotheses.some(h => h.confidence > 0.7)
    const minimalKnowledgeGaps = knowledge_gaps.length <= 2
    const hasDetailedSymptoms = collected_symptoms.every(s => 
      s.severity !== undefined && s.duration !== undefined && s.location !== undefined
    )
    
    if (hasConfidentDiagnoses && minimalKnowledgeGaps && hasDetailedSymptoms) {
      return 'synthesis'
    }
    
    // If we have no knowledge gaps and sufficient questions, synthesize
    if (knowledge_gaps.length === 0 && question_count >= 8) {
      return 'synthesis'
    }
    
    return 'focused_inquiry'
  }
  
  /**
   * Calculate urgency level based on symptoms and red flags
   */
  calculateUrgencyLevel(state: ConversationState): UrgencyLevel {
    const { red_flags, collected_symptoms, diagnostic_hypotheses } = state
    
    // Critical red flags = emergency
    const hasCriticalRedFlags = red_flags.some(rf => rf.severity === 'critical')
    if (hasCriticalRedFlags) {
      return 'emergency'
    }
    
    // High severity red flags = high urgency
    const hasHighRedFlags = red_flags.some(rf => rf.severity === 'high')
    if (hasHighRedFlags) {
      return 'high'
    }
    
    // Check for high-severity symptoms
    const highSeveritySymptoms = collected_symptoms.filter(s => 
      s.severity && s.severity >= 8
    )
    if (highSeveritySymptoms.length > 0) {
      return 'high'
    }
    
    // Check diagnostic hypotheses for urgent conditions
    const urgentConditions = ['infarto', 'accidente cerebrovascular', 'apendicitis', 
      'peritonitis', 'neumonía', 'sepsis', 'embolia']
    
    const hasUrgentDiagnosis = diagnostic_hypotheses.some(h => 
      urgentConditions.some(condition => 
        h.diagnosis.toLowerCase().includes(condition)
      ) && h.confidence > 0.5
    )
    
    if (hasUrgentDiagnosis) {
      return 'high'
    }
    
    // Medium urgency for moderate symptoms or multiple symptoms
    const moderateSeveritySymptoms = collected_symptoms.filter(s => 
      s.severity && s.severity >= 5
    )
    if (moderateSeveritySymptoms.length >= 2 || collected_symptoms.length >= 3) {
      return 'medium'
    }
    
    return 'low'
  }
  
  /**
   * Detect red flags from patient text
   */
  detectRedFlags(text: string): RedFlag[] {
    const detected: RedFlag[] = []
    const lowerText = text.toLowerCase()
    
    for (const pattern of RED_FLAG_PATTERNS) {
      if (pattern.pattern.test(lowerText)) {
        detected.push({
          symptom: this.extractMatchingText(lowerText, pattern.pattern),
          severity: pattern.severity,
          message: pattern.message,
          action: pattern.action,
          detected_at: new Date().toISOString()
        })
      }
    }
    
    return detected
  }
  
  private extractMatchingText(text: string, pattern: RegExp): string {
    const match = text.match(pattern)
    return match ? match[0] : 'unknown'
  }
  
  /**
   * Identify knowledge gaps based on current state
   */
  identifyKnowledgeGaps(state: ConversationState): string[] {
    const gaps: string[] = []
    const { collected_symptoms, patient_info, diagnostic_hypotheses } = state
    
    // Check symptom details
    for (const symptom of collected_symptoms) {
      if (symptom.severity === undefined) {
        gaps.push(`severity:${symptom.name}`)
      }
      if (symptom.duration === undefined) {
        gaps.push(`duration:${symptom.name}`)
      }
      if (symptom.location === undefined) {
        gaps.push(`location:${symptom.name}`)
      }
    }
    
    // Check patient info
    if (!patient_info.age) gaps.push('patient:age')
    if (!patient_info.gender) gaps.push('patient:gender')
    if (!patient_info.medical_history) gaps.push('patient:medical_history')
    
    // Check diagnostic confidence
    if (diagnostic_hypotheses.length === 0) {
      gaps.push('diagnosis:hypotheses_needed')
    } else {
      const lowConfidenceDiagnoses = diagnostic_hypotheses.filter(h => h.confidence < 0.5)
      for (const diagnosis of lowConfidenceDiagnoses) {
        gaps.push(`diagnosis:confidence:${diagnosis.diagnosis}`)
      }
    }
    
    return gaps
  }
  
  /**
   * Determine if conversation is complete
   */
  isConversationComplete(state: ConversationState): boolean {
    const { phase, question_count, knowledge_gaps } = state
    
    if (phase !== 'synthesis') return false
    
    // Emergency conversations are "complete" for triage purposes
    if (state.urgency_level === 'emergency') return true
    
    // Complete if we have sufficient information
    const hasMinimumQuestions = question_count >= 5
    const hasAcceptableGaps = knowledge_gaps.length <= 3
    
    return hasMinimumQuestions && hasAcceptableGaps
  }
  
  /**
   * Calculate conversation progress percentage
   */
  calculateProgress(state: ConversationState): number {
    const { phase, question_count, knowledge_gaps, collected_symptoms } = state
    
    let progress = 0
    
    // Phase-based progress
    switch (phase) {
      case 'history_taking':
        progress = 25
        break
      case 'focused_inquiry':
        progress = 60
        break
      case 'synthesis':
        progress = 85
        break
    }
    
    // Adjust based on questions asked
    const questionProgress = Math.min(question_count / 10, 1) * 10
    progress += questionProgress
    
    // Adjust based on symptoms collected
    const symptomProgress = Math.min(collected_symptoms.length / 3, 1) * 5
    progress += symptomProgress
    
    // Reduce progress for knowledge gaps
    const gapPenalty = Math.min(knowledge_gaps.length * 2, 10)
    progress -= gapPenalty
    
    return Math.max(0, Math.min(100, progress))
  }
  
  /**
   * Update state with new information
   */
  updateState(
    currentState: ConversationState, 
    updates: Partial<ConversationState>
  ): ConversationState {
    const newState = {
      ...currentState,
      ...updates,
      last_update: new Date().toISOString()
    }
    
    // Re-evaluate phase
    newState.phase = this.evaluatePhaseTransition(newState)
    
    // Re-calculate urgency
    newState.urgency_level = this.calculateUrgencyLevel(newState)
    
    // Update knowledge gaps
    newState.knowledge_gaps = this.identifyKnowledgeGaps(newState)
    
    return newState
  }
}

export const stateTransitionEngine = new StateTransitionEngine()
