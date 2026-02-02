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

    const result = await adaptiveQuestionnaireService.generateSummary(conversationId)

    return NextResponse.json({
      success: true,
      summary: result.summary,
      conversationComplete: result.conversationComplete
    })
  } catch (error) {
    logger.error('[API /questionnaire/summary] Error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
