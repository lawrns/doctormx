import { NextRequest, NextResponse } from 'next/server'
import { adaptiveQuestionnaireService } from '@/lib/ai/adaptive-questionnaire/service'
import { logger } from '@/lib/observability/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const conversationId = id

    const result = await adaptiveQuestionnaireService.getConversationState(conversationId)

    return NextResponse.json({
      success: true,
      state: result.state,
      history: result.history,
      summary: result.summary
    })
  } catch (error) {
    logger.error('[API /questionnaire/state] Error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to get conversation state' },
      { status: 500 }
    )
  }
}
