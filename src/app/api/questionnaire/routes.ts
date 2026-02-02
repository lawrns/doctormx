/**
 * API Routes for Adaptive Questionnaire
 * /api/questionnaire/* endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { adaptiveQuestionnaireService } from '@/lib/ai/adaptive-questionnaire/service'
import { logger } from '@/lib/observability/logger'

/**
 * POST /api/questionnaire/start
 * Initialize a new adaptive questionnaire conversation
 */
export async function POST_start(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId } = body

    const result = await adaptiveQuestionnaireService.startConversation(patientId)

    return NextResponse.json({
      success: true,
      conversationId: result.conversationId,
      firstQuestion: result.firstQuestion
    })
  } catch (error) {
    logger.error('[API /questionnaire/start] Error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to start conversation' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/questionnaire/message
 * Send a message and get next question
 */
export async function POST_message(request: NextRequest) {
  let body: { conversationId?: string; message?: string; metadata?: any } = {}
  
  try {
    body = await request.json()
    const { conversationId, message, metadata } = body

    if (!conversationId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing conversationId or message' },
        { status: 400 }
      )
    }

    const result = await adaptiveQuestionnaireService.processResponse(
      conversationId,
      message,
      metadata
    )

    return NextResponse.json({
      success: true,
      nextQuestion: result.nextQuestion,
      state: {
        phase: result.state.phase,
        urgencyLevel: result.state.urgency_level,
        questionCount: result.state.question_count,
        symptoms: result.state.collected_symptoms,
        progress: result.state.question_count * 5 // Simple progress calculation
      },
      redFlags: result.redFlags,
      completed: result.state.completed
    })
  } catch (error) {
    logger.error('[API /questionnaire/message] Error', { error, conversationId: body?.conversationId })
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/questionnaire/[id]/state
 * Get current conversation state
 */
export async function GET_state(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id

    const result = await adaptiveQuestionnaireService.getConversationState(conversationId)

    return NextResponse.json({
      success: true,
      state: result.state,
      history: result.history,
      summary: result.summary
    })
  } catch (error) {
    logger.error('[API /questionnaire/state] Error', { error, conversationId: params?.id })
    return NextResponse.json(
      { success: false, error: 'Failed to get conversation state' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/questionnaire/[id]/upload
 * Upload medical image or document
 */
export async function POST_upload(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const body = await request.json()
    const { image, description } = body

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Missing image data' },
        { status: 400 }
      )
    }

    const result = await adaptiveQuestionnaireService.uploadImage(
      conversationId,
      image,
      description
    )

    return NextResponse.json(result)
  } catch (error) {
    logger.error('[API /questionnaire/upload] Error', { error, conversationId: params?.id })
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/questionnaire/[id]/summary
 * Generate conversation summary and recommendations
 */
export async function GET_summary(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id

    const result = await adaptiveQuestionnaireService.generateSummary(conversationId)

    return NextResponse.json({
      success: true,
      summary: result.summary,
      conversationComplete: result.conversationComplete
    })
  } catch (error) {
    logger.error('[API /questionnaire/summary] Error', { error, conversationId: params?.id })
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/questionnaire/[id]/complete
 * Mark conversation as complete and finalize
 */
export async function POST_complete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    
    const result = await adaptiveQuestionnaireService.generateSummary(conversationId)

    return NextResponse.json({
      success: true,
      summary: result.summary,
      conversationComplete: true
    })
  } catch (error) {
    logger.error('[API /questionnaire/complete] Error', { error, conversationId: params?.id })
    return NextResponse.json(
      { success: false, error: 'Failed to complete conversation' },
      { status: 500 }
    )
  }
}
