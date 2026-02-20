/**
 * Adaptive Questionnaire Service
 * Main service that coordinates all components for the adaptive questionnaire system
 *
 * SECURITY UPDATE: This service now uses the server-side API route instead of
 * direct database access with service role key. The service role key is only
 * used server-side with proper authentication and authorization.
 */

import {
  ConversationState,
  ConversationTurn,
  ConversationContext,
  Question,
  ToolResult,
  AdaptiveQuestionnaireConfig,
  DEFAULT_CONFIG,
  UrgencyLevel,
  RedFlag,
  DifferentialDiagnosis,
  TriageToolResult
} from './types'
import { stateTransitionEngine } from './state-engine'
import { toolRegistry } from './tool-registry'
import { questionGenerator } from './question-generator'
import { logger } from '@/lib/observability/logger'

/**
 * API client for the questionnaire service
 * Calls the server-side API route which handles authentication and authorization
 */
class QuestionnaireApiClient {
  private baseUrl: string

  constructor() {
    // Use relative URL for same-origin requests (includes auth cookies)
    this.baseUrl = '/api/ai/questionnaire'
  }

  /**
   * Start a new conversation via the API
   */
  async startConversation(patientId?: string): Promise<{ conversationId: string; firstQuestion: Question }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session auth
      body: JSON.stringify({
        action: 'start',
        patientId,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Process patient response via the API
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
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        action: 'process',
        conversationId,
        patientResponse,
        metadata,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `API error: ${response.status}`)
    }

    return response.json()
  }
}

// Create singleton API client
const apiClient = new QuestionnaireApiClient()

export class AdaptiveQuestionnaireService {
  private config: AdaptiveQuestionnaireConfig

  constructor(config: Partial<AdaptiveQuestionnaireConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Start a new conversation
   * Uses the secure API route instead of direct database access
   */
  async startConversation(patientId?: string): Promise<{ conversationId: string; firstQuestion: Question }> {
    try {
      logger.info('[AdaptiveQuestionnaire] Starting conversation', { patientId })

      // Use the secure API route
      const result = await apiClient.startConversation(patientId)

      logger.info('[AdaptiveQuestionnaire] Conversation started successfully', {
        conversationId: result.conversationId,
        patientId,
      })

      return result
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
   * Uses the secure API route instead of direct database access
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
    try {
      logger.info('[AdaptiveQuestionnaire] Processing response', {
        conversationId,
        responseLength: patientResponse.length,
      })

      // Use the secure API route
      const result = await apiClient.processResponse(conversationId, patientResponse, metadata)

      logger.info('[AdaptiveQuestionnaire] Response processed successfully', {
        conversationId,
        questionType: result.nextQuestion.type,
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('[AdaptiveQuestionnaire] Failed to process response', {
        error: errorMessage,
        conversationId,
      })
      throw new Error(`Failed to process response: ${errorMessage}`)
    }
  }

  /**
   * Get conversation state and summary
   * NOTE: This method will be migrated to use the API route in a follow-up task
   * For now, it uses a direct client (which respects RLS)
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
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      throw new Error('Supabase not configured')
    }

    const supabase = createClient(supabaseUrl, anonKey)

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
      differentialDiagnoses: DifferentialDiagnosis[]
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
        triageResult = result.data as TriageToolResult
      }
    }

    const summary = {
      chiefComplaint: state.collected_symptoms[0]?.name ?? 'No especificado',
      symptoms: state.collected_symptoms.map(s => s.name),
      urgencyLevel: state.urgency_level,
      redFlags: state.red_flags,
      differentialDiagnoses: state.diagnostic_hypotheses,
      recommendedAction: triageResult?.message ?? 'Consulta médica recomendada',
      recommendedSpecialty: triageResult?.specialty ?? 'Medicina General',
      estimatedWaitTime: triageResult?.timeframe ?? '24-48 horas'
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
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      throw new Error('Supabase not configured')
    }

    const supabase = createClient(supabaseUrl, anonKey)

    // Get current turn count
    const { count, error: countError } = await supabase
      .from('conversation_turns')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)

    if (countError) {
      throw new Error(`Failed to count turns: ${countError.message}`)
    }

    const turnNumber = (count ?? 0) + 1

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
        analysis: description ?? 'Image uploaded for review'
      }
    } catch (error) {
      logger.error('[AdaptiveQuestionnaire] Failed to upload image', { error, conversationId })
      return { success: false }
    }
  }
}

export const adaptiveQuestionnaireService = new AdaptiveQuestionnaireService()

