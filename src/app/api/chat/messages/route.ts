import { requireAuth } from '@/lib/auth'
import { sendMessage } from '@/lib/chat'
import { NextResponse } from 'next/server'
import { evaluateRedFlags, getCareLevelInfo, isMentalHealthCrisis, getMentalHealthResources } from '@/lib/triage'
import { logger } from '@/lib/observability/logger'

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

    // Evaluate triage for text messages
    let triageAlert = null
    if (type === 'text' || !type) {
      const triageResult = evaluateRedFlags({ message: content })
      
      if (triageResult.triggered && triageResult.action) {
        const careLevelInfo = getCareLevelInfo(triageResult.action)
        const isMentalHealth = isMentalHealthCrisis(content)
        
        triageAlert = {
          level: triageResult.action,
          severity: triageResult.severity,
          info: careLevelInfo,
          reasons: triageResult.reasons,
          recommendations: isMentalHealth 
            ? [...getMentalHealthResources(), ...triageResult.recommendations]
            : triageResult.recommendations,
          isMentalHealthCrisis: isMentalHealth,
        }
      }
    }

    const message = await sendMessage({
      conversationId,
      senderId: user.id,
      content,
      type: type ?? 'text',
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

    return NextResponse.json({ 
      message,
      triageAlert, // Include triage alert if detected
    })
  } catch (error) {
    logger.error('Error sending message:', { err: error })
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
