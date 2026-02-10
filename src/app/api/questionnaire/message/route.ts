import { NextRequest, NextResponse } from 'next/server'
import { adaptiveQuestionnaireService } from '@/lib/ai/adaptive-questionnaire/service'
import { logger } from '@/lib/observability/logger'
import type { QuestionnaireRequestBody } from '@/lib/types/api'

export async function POST(request: NextRequest) {
  let body: QuestionnaireRequestBody = {}

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
        progress: Math.min(result.state.question_count * 5, 100)
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
