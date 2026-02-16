import { requireAuth } from '@/lib/auth'
import { getConversations, createConversation, type ConversationWithDetails } from '@/lib/chat'
import { NextResponse } from 'next/server'
import {
  parsePaginationParams,
  buildPaginatedResponse,
  decodeCursor,
  encodeCursor,
} from '@/lib/pagination'
import type { PaginatedResult } from '@/lib/pagination'
import { logger } from '@/lib/observability/logger'

/**
 * GET /api/chat/conversations
 *
 * Get paginated list of conversations for authenticated user
 *
 * Query params:
 * - cursor: string | null - pagination cursor
 * - limit: number (default: 20, max: 100)
 */
export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireAuth()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as 'patient' | 'doctor'
    if (!role || (role !== 'patient' && role !== 'doctor')) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)

    // Parse pagination parameters
    const { cursor, limit, direction } = parsePaginationParams(searchParams)

    // Build query with cursor support
    let query = supabase
      .from('chat_conversations')
      .select(`
        *,
        patient:profiles!chat_conversations_patient_id_fkey(
          full_name,
          photo_url
        ),
        doctor:doctors!chat_conversations_doctor_id_fkey(
          user_id
        ),
        doctor_user:profiles!doctors_user_id_fkey(
          full_name,
          photo_url
        )
      `)

    // Apply role filter
    if (role === 'patient') {
      query = query.eq('patient_id', user.id)
    } else if (role === 'doctor') {
      query = query.eq('doctor_id', user.id)
    }

    // Apply cursor filtering for forward pagination
    if (cursor && direction === 'forward') {
      try {
        const cursorData = decodeCursor(cursor)
        query = query.lt('last_message_at', cursorData.last_message_at || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    // Apply cursor filtering for backward pagination
    if (cursor && direction === 'backward') {
      try {
        const cursorData = decodeCursor(cursor)
        query = query.gt('last_message_at', cursorData.last_message_at || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    // Order by last_message_at descending (most recent first)
    query = query.order('last_message_at', { ascending: false, nullsFirst: false })
    query = query.order('id', { ascending: true })

    // Apply limit + 1 to check if there are more results
    query = query.limit(limit + 1)

    const { data: rawConversations, error } = await query

    if (error) {
      logger.error('Error getting conversations:', { err: { error } })
      return NextResponse.json(
        { error: 'Failed to get conversations' },
        { status: 500 }
      )
    }

    // Check if there are more results
    const conversations = (rawConversations || []) as Array<{
      id: string
      patient_id: string
      doctor_id: string
      appointment_id: string | null
      last_message_preview: string | null
      last_message_at: string | null
      is_archived: boolean
      created_at: string
      updated_at: string
      patient: { full_name: string | null; photo_url: string | null } | null
      doctor: { user_id: string } | null
      doctor_user: { full_name: string | null; photo_url: string | null } | null
    }>
    const hasMore = conversations.length > limit
    const paginatedConversations = hasMore ? conversations.slice(0, limit) : conversations

    const conversationIds = paginatedConversations.map(c => c.id)

    // Get unread counts for all conversations in a single query
    const { data: unreadCounts } = await supabase
      .from('chat_messages')
      .select('conversation_id')
      .not('id', 'in', (
        supabase
          .from('chat_message_receipts')
          .select('message_id')
          .eq('user_id', user.id)
      ))
      .in('conversation_id', conversationIds)
      .neq('sender_id', user.id)

    const unreadCountsByConversation = unreadCounts?.reduce((acc, msg) => {
      acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Transform conversations
    const enrichedConversations = paginatedConversations.map((conv: typeof conversations[number]) => ({
      id: conv.id,
      patient_id: conv.patient_id,
      doctor_id: conv.doctor_id,
      appointment_id: conv.appointment_id,
      last_message_preview: conv.last_message_preview,
      last_message_at: conv.last_message_at,
      is_archived: conv.is_archived,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      patient_name: conv.patient?.full_name ?? undefined,
      patient_photo_url: conv.patient?.photo_url ?? undefined,
      doctor_name: conv.doctor_user?.full_name ?? undefined,
      doctor_photo_url: conv.doctor_user?.photo_url ?? undefined,
      unread_count: unreadCountsByConversation[conv.id] || 0,
    }))

    // Build pagination response
    const result: PaginatedResult<ConversationWithDetails> = buildPaginatedResponse({
      data: enrichedConversations,
      limit,
      getNextCursor: (conv: ConversationWithDetails) =>
        conv ? encodeCursor({ id: conv.id, last_message_at: conv.last_message_at }) : null,
      getPrevCursor: (conv: ConversationWithDetails) =>
        conv ? encodeCursor({ id: conv.id, last_message_at: conv.last_message_at }) : null,
    })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error getting conversations:', { err: error })
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/conversations
 *
 * Create a new conversation
 */
export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAuth()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const { patientId, doctorId, appointmentId } = body

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, doctorId' },
        { status: 400 }
      )
    }

    const role = profile?.role as 'patient' | 'doctor'
    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    let actualPatientId = patientId
    let actualDoctorId = doctorId

    if (role === 'patient') {
      actualPatientId = user.id
    } else if (role === 'doctor') {
      actualDoctorId = user.id

      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!doctor) {
        return NextResponse.json(
          { error: 'User is not a registered doctor' },
          { status: 403 }
        )
      }
    }

    const conversation = await createConversation({
      patientId: actualPatientId,
      doctorId: actualDoctorId,
      appointmentId,
    })

    return NextResponse.json({ conversation })
  } catch (error) {
    logger.error('Error creating conversation:', { err: error })
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
