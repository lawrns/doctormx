import { NextRequest, NextResponse } from 'next/server'
import { adaptiveQuestionnaireService } from '@/lib/ai/adaptive-questionnaire/service'
import { logger } from '@/lib/observability/logger'

export async function POST(
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
      conversationComplete: true
    })
  } catch (error) {
    logger.error('[API /questionnaire/complete] Error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to complete conversation' },
      { status: 500 }
    )
  }
}
