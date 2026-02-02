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
    logger.error('[API /questionnaire/upload] Error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
