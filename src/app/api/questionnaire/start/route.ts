import { NextRequest, NextResponse } from 'next/server'
import { adaptiveQuestionnaireService } from '@/lib/ai/adaptive-questionnaire/service'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('[API /questionnaire/start] Error', { error: errorMessage })
    return NextResponse.json(
      { success: false, error: errorMessage || 'Failed to start conversation' },
      { status: 500 }
    )
  }
}
