import { requireAuth, AuthError } from '@/lib/auth'
import { markAsRead } from '@/lib/chat'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    const { user } = await requireAuth()

    await markAsRead(conversationId, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError || (error instanceof Error && error.name === 'AuthError')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    logger.error('Error marking message as read:', { err: error })
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    )
  }
}
