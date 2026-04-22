/**
 * Adaptive Questionnaire Service
 * Main service that coordinates all components for the adaptive questionnaire system
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  ConversationState,
  ConversationTurn,
  ConversationContext,
  Question,
  ToolResult,
  AdaptiveQuestionnaireConfig,
  DEFAULT_CONFIG,
  UrgencyLevel,
  RedFlag
} from './types'
import { stateTransitionEngine } from './state-engine'
import { toolRegistry } from './tool-registry'
import { questionGenerator } from './question-generator'
import { logger } from '@/lib/observability/logger'

// Create Supabase client for this service
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured')
  }

  // Try service role key first, fallback to anon key
  const key = serviceRoleKey || anonKey
  if (!key) {
    throw new Error('No Supabase key available')
  }

  return createSupabaseClient(supabaseUrl, key)
}

export class AdaptiveQuestionnaireService {
  private config: AdaptiveQuestionnaireConfig

  constructor(config: Partial<AdaptiveQuestionnaireConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Start a new conversation
   */
  async startConversation(patientId?: string): Promise<{ conversationId: string; firstQuestion: Question }> {
    const supabase = getSupabaseClient()
    
    try {
      // Create initial state
      const initialState: ConversationState = {
        phase: 'history_taking',
        collected_symptoms: [],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 0,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      // Insert conversation into database
      const { data: conversation, error } = await supabase
        .from('adaptive_conversations')
        .insert({
          patient_id: patientId,
          phase: initialState.phase,
          state: initialState,
          symptoms: [],
          diagnoses: [],
          urgency_level: initialState.urgency_level,
          red_flags: []
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create conversation: ${error.message}`)
      }

      // Generate first question
      const context: ConversationContext = {
        state: initialState,
        history: [],
        patient_id: patientId
      }

      const firstQuestion = await questionGenerator.generateNextQuestion(context)

      // Store first question as system message
      await this.addTurn(conversation.id, 'assistant', firstQuestion.text, {
        question_id: firstQuestion.id,
        question_type: firstQuestion.type
      })

      logger.info('[AdaptiveQuestionnaire] Conversation started', {
        conversationId: conversation.id,
        patientId,
        questionType: firstQuestion.type
      })

      return {
        conversationId: conversation.id,
        firstQuestion
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      logger.error('[AdaptiveQuestionnaire] Failed to start conversation', { 
        error: errorMessage,
        stack: errorStack,
        patientId 
      })
      throw new Error(`Failed to start conversation: ${errorMessage}`)
    }
  }

  /**
   * Process patient response and generate next question
   */
  async processResponse(
    conversationId: string,
    patientResponse: string,
    metadata?: { imageUrl?: string; audioUrl?: string }
  ): Promise<{
    nextQuestion: Question
    state: ConversationState
    toolsExecuted: ToolResult[]
    redFlags?: RedFlag[]
  }> {
    const supabase = getSupabaseClient()

    try {
      // Fetch conversation
      const { data: conversation, error: convError } = await supabase
        .from('adaptive_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convError || !conversation) {
        throw new Error(`Conversation not found: ${conversationId}`)
      }

      const currentState = conversation.state as ConversationState

      // Fetch conversation history
      const { data: turns, error: turnsError } = await supabase
        .from('conversation_turns')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('turn_number', { ascending: true })

      if (turnsError) {
        throw new Error(`Failed to fetch conversation history: ${turnsError.message}`)
      }

      // Create context
      type TurnRecord = { id: string; turn_number: number; role: string; content: string; tools_called: unknown; metadata: unknown; created_at: string }
      const context: ConversationContext = {
        state: currentState,
        history: turns?.map((t: TurnRecord) => ({
          id: t.id,
          turn_number: t.turn_number,
          role: t.role as 'user' | 'assistant' | 'system',
          content: t.content,
          tools_called: t.tools_called as ConversationTurn['tools_called'],
          metadata: t.metadata as Record<string, unknown>,
          created_at: t.created_at
        })) || [],
        patient_id: conversation.patient_id || undefined
      }

      // Add patient response to history
      await this.addTurn(conversationId, 'user', patientResponse, metadata)

      // Execute tools based on context
      const toolsExecuted: ToolResult[] = []
      const toolsCalled = []

      // 1. Detect red flags
      const redFlagTool = toolRegistry.get('detectRedFlags')
      if (redFlagTool) {
        const redFlagResult = await redFlagTool.execute({ text: patientResponse }, context)
        toolsExecuted.push(redFlagResult)
        toolsCalled.push({
          tool_name: 'detectRedFlags',
          parameters: { text: patientResponse },
          result: redFlagResult,
          executed_at: new Date().toISOString()
        })

        // Update red flags in state
        if (redFlagResult.success && redFlagResult.data) {
          const { red_flags, has_critical } = redFlagResult.data as { red_flags: RedFlag[]; has_critical: boolean }
          currentState.red_flags = [...currentState.red_flags, ...red_flags]
          
          if (has_critical && this.config.red_flag_escalation) {
            currentState.urgency_level = 'emergency'
          }
        }
      }

      // 2. Analyze symptom if present
      const symptomTool = toolRegistry.get('analyzeSymptom')
      if (symptomTool) {
        const symptomResult = await symptomTool.execute({
          symptom_name: 'detected_symptom',
          description: patientResponse,
          patient_text: patientResponse
        }, context)
        toolsExecuted.push(symptomResult)
        toolsCalled.push({
          tool_name: 'analyzeSymptom',
          parameters: { symptom_name: 'detected_symptom', description: patientResponse, patient_text: patientResponse },
          result: symptomResult,
          executed_at: new Date().toISOString()
        })

        if (symptomResult.success && symptomResult.data) {
          const symptom = symptomResult.data as { name: string; severity?: number; duration?: string; location?: string }
          const existingSymptom = currentState.collected_symptoms.find(s => s.name === symptom.name)
          
          if (!existingSymptom) {
            currentState.collected_symptoms.push(symptom)
          }
        }
      }

      // 3. Assess urgency if we have symptoms
      if (currentState.collected_symptoms.length > 0) {
        const urgencyTool = toolRegistry.get('assessUrgency')
        if (urgencyTool) {
          const urgencyResult = await urgencyTool.execute({
            symptoms: currentState.collected_symptoms.map(s => s.name),
            patient_text: patientResponse
          }, context)
          toolsExecuted.push(urgencyResult)
          toolsCalled.push({
            tool_name: 'assessUrgency',
            parameters: { symptoms: currentState.collected_symptoms.map(s => s.name) },
            result: urgencyResult,
            executed_at: new Date().toISOString()
          })

          if (urgencyResult.success && urgencyResult.data) {
            const { urgency_level } = urgencyResult.data as { urgency_level: UrgencyLevel }
            currentState.urgency_level = urgency_level
          }
        }
      }

      // 4. Generate differential diagnosis if in focused inquiry or synthesis
      if (currentState.phase === 'focused_inquiry' && currentState.collected_symptoms.length >= 2) {
        const diagnosisTool = toolRegistry.get('generateDifferentialDiagnosis')
        if (diagnosisTool) {
          const diagnosisResult = await diagnosisTool.execute({
            symptoms: currentState.collected_symptoms.map(s => s.name),
            patient_info: currentState.patient_info
          }, context)
          toolsExecuted.push(diagnosisResult)
          toolsCalled.push({
            tool_name: 'generateDifferentialDiagnosis',
            parameters: { symptoms: currentState.collected_symptoms.map(s => s.name) },
            result: diagnosisResult,
            executed_at: new Date().toISOString()
          })

          if (diagnosisResult.success && diagnosisResult.data) {
            currentState.diagnostic_hypotheses = diagnosisResult.data as any[]
          }
        }
      }

      // Update state
      currentState.question_count++
      currentState.last_update = new Date().toISOString()

      // Re-evaluate phase and update state
      const updatedState = stateTransitionEngine.updateState(currentState, {
        phase: stateTransitionEngine.evaluatePhaseTransition(currentState),
        urgency_level: stateTransitionEngine.calculateUrgencyLevel(currentState),
        knowledge_gaps: stateTransitionEngine.identifyKnowledgeGaps(currentState)
      })

      // Check if conversation is complete
      if (stateTransitionEngine.isConversationComplete(updatedState)) {
        updatedState.completed = true
      }

      // Generate next question
      const nextQuestion = await questionGenerator.generateNextQuestion({
        state: updatedState,
        history: context.history,
        patient_id: context.patient_id
      })

      // Add question to asked list
      updatedState.questions_asked.push(nextQuestion.id)

      // Store assistant response with tools used
      await this.addTurn(conversationId, 'assistant', nextQuestion.text, {
        question_id: nextQuestion.id,
        question_type: nextQuestion.type,
        tools_called: toolsCalled
      })

      // Update conversation in database
      await supabase
        .from('adaptive_conversations')
        .update({
          phase: updatedState.phase,
          state: updatedState,
          symptoms: updatedState.collected_symptoms,
          diagnoses: updatedState.diagnostic_hypotheses,
          urgency_level: updatedState.urgency_level,
          red_flags: updatedState.red_flags,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      logger.info('[AdaptiveQuestionnaire] Response processed', {
        conversationId,
        phase: updatedState.phase,
        questionCount: updatedState.question_count,
        urgencyLevel: updatedState.urgency_level,
        redFlagsCount: updatedState.red_flags.length
      })

      return {
        nextQuestion,
        state: updatedState,
        toolsExecuted,
        redFlags: updatedState.red_flags.length > 0 ? updatedState.red_flags : undefined
      }
    } catch (error) {
      logger.error('[AdaptiveQuestionnaire] Failed to process response', { error, conversationId })
      throw error
    }
  }

  /**
   * Get conversation state and summary
   */
  async getConversationState(conversationId: string): Promise<{
    state: ConversationState
    history: ConversationTurn[]
    summary: {
      progress: number
      symptoms: string[]
      urgency: UrgencyLevel
      phase: string
    }
  }> {
    const supabase = getSupabaseClient()

    try {
      // Fetch conversation
      const { data: conversation, error: convError } = await supabase
        .from('adaptive_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convError || !conversation) {
        throw new Error(`Conversation not found: ${conversationId}`)
      }

      // Fetch conversation history
      const { data: turns, error: turnsError } = await supabase
        .from('conversation_turns')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('turn_number', { ascending: true })

      if (turnsError) {
        throw new Error(`Failed to fetch conversation history: ${turnsError.message}`)
      }

      const state = conversation.state as ConversationState
      const progress = stateTransitionEngine.calculateProgress(state)

      type TurnRecord = { id: string; turn_number: number; role: string; content: string; tools_called: unknown; metadata: unknown; created_at: string }
      return {
        state,
        history: turns?.map((t: TurnRecord) => ({
          id: t.id,
          turn_number: t.turn_number,
          role: t.role as 'user' | 'assistant' | 'system',
          content: t.content,
          tools_called: t.tools_called as ConversationTurn['tools_called'],
          metadata: t.metadata as Record<string, unknown>,
          created_at: t.created_at
        })) || [],
        summary: {
          progress,
          symptoms: state.collected_symptoms.map(s => s.name),
          urgency: state.urgency_level,
          phase: state.phase
        }
      }
    } catch (error) {
      logger.error('[AdaptiveQuestionnaire] Failed to get conversation state', { error, conversationId })
      throw error
    }
  }

  /**
   * Generate final summary and recommendations
   */
  async generateSummary(conversationId: string): Promise<{
    summary: {
      chiefComplaint: string
      symptoms: string[]
      urgencyLevel: UrgencyLevel
      redFlags: RedFlag[]
      differentialDiagnoses: any[]
      recommendedAction: string
      recommendedSpecialty: string
      estimatedWaitTime: string
    }
    conversationComplete: boolean
  }> {
    const { state, history } = await this.getConversationState(conversationId)

    const triageTool = toolRegistry.get('triagePatient')
    let triageResult: { level: string; action: string; message: string; timeframe: string; specialty: string } | null = null

    if (triageTool) {
      const result = await triageTool.execute({
        symptoms: state.collected_symptoms.map(s => s.name),
        urgency_level: state.urgency_level,
        red_flags: state.red_flags.map(rf => rf.message)
      }, { state, history })

      if (result.success && result.data) {
        triageResult = result.data as any
      }
    }

    const summary = {
      chiefComplaint: state.collected_symptoms[0]?.name || 'No especificado',
      symptoms: state.collected_symptoms.map(s => s.name),
      urgencyLevel: state.urgency_level,
      redFlags: state.red_flags,
      differentialDiagnoses: state.diagnostic_hypotheses,
      recommendedAction: triageResult?.message || 'Consulta médica recomendada',
      recommendedSpecialty: triageResult?.specialty || 'Medicina General',
      estimatedWaitTime: triageResult?.timeframe || '24-48 horas'
    }

    return {
      summary,
      conversationComplete: state.completed || state.phase === 'synthesis'
    }
  }

  /**
   * Helper method to add a turn to the conversation
   */
  private async addTurn(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const supabase = getSupabaseClient()

    // Get current turn count
    const { count, error: countError } = await supabase
      .from('conversation_turns')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)

    if (countError) {
      throw new Error(`Failed to count turns: ${countError.message}`)
    }

    const turnNumber = (count || 0) + 1

    const { error } = await supabase
      .from('conversation_turns')
      .insert({
        conversation_id: conversationId,
        turn_number: turnNumber,
        role,
        content,
        metadata: metadata || {}
      })

    if (error) {
      throw new Error(`Failed to add turn: ${error.message}`)
    }
  }

  /**
   * Upload and process medical image
   */
  async uploadImage(conversationId: string, imageBase64: string, description?: string): Promise<{
    success: boolean
    imageUrl?: string
    analysis?: string
  }> {
    if (!this.config.multimodal_enabled) {
      return { success: false }
    }

    try {
      // In a real implementation, this would:
      // 1. Upload image to storage
      // 2. Use vision AI to analyze the image
      // 3. Add analysis to conversation context

      // For now, return mock success
      logger.info('[AdaptiveQuestionnaire] Image upload received', {
        conversationId,
        hasDescription: !!description
      })

      return {
        success: true,
        imageUrl: 'placeholder-url',
        analysis: description || 'Image uploaded for review'
      }
    } catch (error) {
      logger.error('[AdaptiveQuestionnaire] Failed to upload image', { error, conversationId })
      return { success: false }
    }
  }
}

export const adaptiveQuestionnaireService = new AdaptiveQuestionnaireService()
