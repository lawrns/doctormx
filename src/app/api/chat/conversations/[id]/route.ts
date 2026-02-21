import { requireAuth } from '@/lib/auth'
import { getConversation, getMessages } from '@/lib/chat'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    await requireAuth()

    const conversation = await getConversation(conversationId)

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const messages = await getMessages(conversationId, limit, offset)

    return NextResponse.json({
      conversation,
      messages,
    })
  } catch (error) {
    logger.error('Error getting conversation:', { err: error })
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    )
  }
}
