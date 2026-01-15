import { requireAuth } from '@/lib/auth'
import { sendMessage } from '@/lib/chat'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth()

    const body = await request.json()
    const { conversationId, content, type, attachmentUrl, attachmentName, attachmentType } = body

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, content' },
        { status: 400 }
      )
    }

    const message = await sendMessage({
      conversationId,
      senderId: user.id,
      content,
      type: type || 'text',
      attachmentUrl,
      attachmentName,
      attachmentType,
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
