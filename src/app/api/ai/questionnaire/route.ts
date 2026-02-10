/**
 * AI Questionnaire API Route
 *
 * Server-only API route for adaptive questionnaire functionality.
 * Replaces client-side service role key usage with proper authentication.
 *
 * SECURITY: This route runs server-side only and requires authentication.
 * Service role is only used here with proper user authorization.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import type { SupabaseClientType } from '@/lib/types/api'

// Types matching the adaptive questionnaire service
interface StartConversationRequest {
  action: 'start'
  patientId?: string
}

interface ProcessResponseRequest {
  action: 'process'
  conversationId: string
  patientResponse: string
  metadata?: { imageUrl?: string; audioUrl?: string }
}

type QuestionnaireRequest = StartConversationRequest | ProcessResponseRequest

/**
 * POST handler for questionnaire operations
 * Requires authentication via session cookie
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify user authentication
    const authHeader = request.headers.get('authorization')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create auth client to verify session
    const authClient = createBrowserClient(supabaseUrl, anonKey, {
      auth: {
        storageKey: 'sb-session-token',
        detectSessionInUrl: false,
        persistSession: true,
      },
    })

    // Get session from cookie
    const { data: { session }, error: sessionError } = await authClient.auth.getSession()

    if (sessionError || !session) {
      logger.warn('[Questionnaire API] Unauthorized access attempt', {
        error: sessionError?.message,
      })
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Parse request body
    const body: QuestionnaireRequest = await request.json()

    // 3. Create service role client for database operations
    // Only used server-side with proper user authorization
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      logger.error('[Questionnaire API] Service role key not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const serviceSupabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // 4. Handle different actions
    if (body.action === 'start') {
      return await handleStartConversation(serviceSupabase, userId, body.patientId)
    } else if (body.action === 'process') {
      return await handleProcessResponse(serviceSupabase, userId, body)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('[Questionnaire API] Request failed', { error: errorMessage })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle conversation start
 */
async function handleStartConversation(
  supabase: SupabaseClientType,
  userId: string,
  patientId?: string
) {
  try {
    // Verify user can access this patient data (must be their own)
    if (patientId && patientId !== userId) {
      logger.warn('[Questionnaire API] Unauthorized patient access attempt', {
        userId,
        attemptedPatientId: patientId,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Use userId as patientId if not provided
    const finalPatientId = patientId || userId

    // Create conversation with RLS-compliant query
    const { data: conversation, error } = await supabase
      .from('adaptive_conversations')
      .insert({
        patient_id: finalPatientId,
        phase: 'history_taking',
        state: {
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
          completed: false,
        },
        symptoms: [],
        diagnoses: [],
        urgency_level: 'low',
        red_flags: [],
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`)
    }

    logger.info('[Questionnaire API] Conversation started', {
      conversationId: conversation.id,
      userId,
    })

    // Return first question (simplified - in production, use the question generator)
    return NextResponse.json({
      conversationId: conversation.id,
      firstQuestion: {
        id: 'welcome',
        type: 'open',
        text: '¿Cuál es el motivo principal de tu consulta hoy?',
        options: undefined,
      },
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('[Questionnaire API] Failed to start conversation', { error: errorMessage })
    return NextResponse.json(
      { error: 'Failed to start conversation' },
      { status: 500 }
    )
  }
}

/**
 * Handle patient response processing
 */
async function handleProcessResponse(
  supabase: SupabaseClientType,
  userId: string,
  request: ProcessResponseRequest
) {
  try {
    // Verify user owns this conversation
    const { data: conversation, error: fetchError } = await supabase
      .from('adaptive_conversations')
      .select('patient_id, state, id')
      .eq('id', request.conversationId)
      .single()

    if (fetchError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (conversation.patient_id !== userId) {
      logger.warn('[Questionnaire API] Unauthorized conversation access attempt', {
        userId,
        conversationId: request.conversationId,
        conversationOwnerId: conversation.patient_id,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Store the response
    await supabase
      .from('adaptive_conversation_turns')
      .insert({
        conversation_id: request.conversationId,
        role: 'user',
        content: request.patientResponse,
        metadata: request.metadata,
      })

    // In production, use the AI service to generate next question
    // For now, return a placeholder response
    return NextResponse.json({
      nextQuestion: {
        id: 'followup',
        type: 'open',
        text: '¿Desde cuándo presentas estos síntomas?',
        options: undefined,
      },
      state: conversation.state,
      toolsExecuted: [],
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('[Questionnaire API] Failed to process response', { error: errorMessage })
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    )
  }
}
