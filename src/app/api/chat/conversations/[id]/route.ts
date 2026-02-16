import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConversation, getMessages } from '@/lib/chat'
import { logger } from '@/lib/observability/logger'
import { logSecurityEvent } from '@/lib/security/audit-logger'

/**
 * GET /api/chat/conversations/[id]
 * 
 * Retrieves a conversation and its messages.
 * Security: Validates that the authenticated user is a participant in the
 * conversation (either patient or doctor) to prevent IDOR attacks.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // SECURITY CHECK: Verify user is a participant in the conversation
    // This prevents IDOR attacks where User A tries to access User B's conversations
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('id, patient_id, doctor_id')
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      logger.warn('Conversation access attempt for non-existent conversation', {
        userId: user.id,
        conversationId,
      })
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // IDOR Protection: Verify user is part of this conversation
    const isParticipant = 
      conversation.patient_id === user.id || 
      conversation.doctor_id === user.id

    if (!isParticipant) {
      // Log security event for IDOR attempt
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await logSecurityEvent({
        eventType: 'permission_denied',
        severity: 'high',
        userId: user.id,
        description: `IDOR_ATTEMPT: User ${user.id} attempted to access conversation ${conversationId} without being a participant`,
        ipAddress,
        userAgent,
        details: {
          type: 'IDOR_ATTEMPT',
          targetResource: conversationId,
          resourceType: 'chat_conversation',
          action: 'access',
          actualPatient: conversation.patient_id,
          actualDoctor: conversation.doctor_id,
          attemptedBy: user.id,
          timestamp: new Date().toISOString(),
        },
      })

      logger.warn(`IDOR_ATTEMPT_BLOCKED: User ${user.id} tried to access conversation ${conversationId}`, {
        userId: user.id,
        conversationId,
        actualPatient: conversation.patient_id,
        actualDoctor: conversation.doctor_id,
      })

      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const conversationData = await getConversation(conversationId)

    if (!conversationData) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const messages = await getMessages(conversationId, limit, offset)

    logger.info('Conversation accessed successfully', {
      userId: user.id,
      conversationId,
    })

    return NextResponse.json({
      conversation: conversationData,
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
