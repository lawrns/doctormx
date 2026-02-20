import { createClient } from '@/lib/supabase/server'
import type { ChatConversation, ChatMessage as ChatMessageType, UserRole } from '@/types'
import { logger } from '@/lib/observability/logger'
import { LIMITS, TIME } from '@/lib/constants'

export type ChatMessage = ChatMessageType

export type MessageType = 'text' | 'image' | 'file'

export interface CreateConversationParams {
  patientId: string
  doctorId: string
  appointmentId?: string
}

export interface SendMessageParams {
  conversationId: string
  senderId: string
  content: string
  type?: MessageType
  attachmentUrl?: string
  attachmentName?: string
  attachmentType?: string
}

export interface ConversationWithDetails extends ChatConversation {
  patient_name?: string
  patient_photo_url?: string
  doctor_name?: string
  doctor_photo_url?: string
  unread_count?: number
  last_message?: ChatMessage
}

export interface MessageWithSender extends ChatMessage {
  sender_name?: string
  sender_photo_url?: string
}

export async function createConversation(params: CreateConversationParams): Promise<ChatConversation | null> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('patient_id', params.patientId)
    .eq('doctor_id', params.doctorId)
    .maybeSingle()

  if (existing) {
    return {
      id: existing.id,
      patient_id: params.patientId,
      doctor_id: params.doctorId,
      appointment_id: null,
      last_message_preview: null,
      last_message_at: null,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      patient_id: params.patientId,
      doctor_id: params.doctorId,
      appointment_id: params.appointmentId || null,
    })
    .select()
    .single()

  if (error) {
    logger.error('Error creating conversation:', { error })
    throw error
  }

  return data
}

export async function getConversation(
  conversationId: string
): Promise<ConversationWithDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('chat_conversations')
    .select(`
      *,
      patient:profiles!chat_conversations_patient_id_fkey(
        full_name,
        photo_url
      ),
      doctor.doctores!chat_conversations_doctor_id_fkey(
        user_id,
        user:profiles.doctores_user_id_fkey(
          full_name,
          photo_url
        )
      )
    `)
    .eq('id', conversationId)
    .single()

  if (error || !data) {
    logger.error('Error getting conversation:', { error })
    return null
  }

  // Type assertion for nested Supabase relations
  const conv = data as unknown as {
    id: string
    patient_id: string
    doctor_id: string
    appointment_id: string | null
    last_message_preview: string | null
    last_message_at: string | null
    is_archived: boolean
    created_at: string
    updated_at: string
    patient: { full_name?: string; photo_url?: string } | null
    doctor: { user_id?: string; user?: { full_name?: string; photo_url?: string } } | null
  }

  return {
    id: conv.id,
    patient_id: conv.patient_id,
    doctor_id: conv.doctor_id,
    appointment_id: conv.appointment_id,
    last_message_preview: conv.last_message_preview,
    last_message_at: conv.last_message_at,
    is_archived: conv.is_archived,
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    patient_name: conv.patient?.full_name,
    patient_photo_url: conv.patient?.photo_url,
    doctor_name: conv.doctor?.user?.full_name,
    doctor_photo_url: conv.doctor?.user?.photo_url,
  }
}

export async function getConversations(
  userId: string,
  role: UserRole
): Promise<ConversationWithDetails[]> {
  try {
    const supabase = await createClient()

    // Build base query with all needed relations in a single SELECT
    let query = supabase
      .from('chat_conversations')
      .select(`
        *,
        patient:profiles!chat_conversations_patient_id_fkey(
          full_name,
          photo_url
        ),
        doctor.doctores!chat_conversations_doctor_id_fkey(
          user_id
        ),
        doctor:user:profiles.doctores_user_id_fkey(
          full_name,
          photo_url
        )
      `)
      .order('last_message_at', { ascending: false })

    if (role === 'patient') {
      query = query.eq('patient_id', userId)
    } else if (role === 'doctor') {
      query = query.eq('doctor_id', userId)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error getting conversations:', { error })
      return []
    }

    // Type assertion for nested Supabase relations
    const conversations = (data || []) as unknown as Array<{
      id: string
      patient_id: string
      doctor_id: string
      appointment_id: string | null
      last_message_preview: string | null
      last_message_at: string | null
      is_archived: boolean
      created_at: string
      updated_at: string
      patient: { full_name?: string; photo_url?: string } | null
      doctor: { user_id?: string; user?: { full_name?: string; photo_url?: string } } | null
    }>

    if (conversations.length === 0) {
      return []
    }

    // OPTIMIZED: Single query to get all unread counts using proper filtering
    // This avoids N+1 by using a single aggregation query with proper indexes
    const conversationIds = conversations.map(c => c.id)
    
    // Use RPC for complex aggregation or raw query for unread counts
    // Fallback to optimized single query pattern
    const { data: unreadData, error: unreadError } = await supabase
      .from('chat_messages')
      .select('conversation_id, id')
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .not('id', 'in', (
        supabase
          .from('chat_message_receipts')
          .select('message_id')
          .eq('user_id', userId)
      ))

    if (unreadError) {
      logger.error('Error getting unread counts:', { error: unreadError })
    }

    // Build unread count map efficiently
    const unreadCountsByConversation = (unreadData || []).reduce((acc, msg) => {
      acc[msg.conversation_id] = (acc[msg.conversation_id] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    return conversations.map((conv) => ({
      id: conv.id,
      patient_id: conv.patient_id,
      doctor_id: conv.doctor_id,
      appointment_id: conv.appointment_id,
      last_message_preview: conv.last_message_preview,
      last_message_at: conv.last_message_at,
      is_archived: conv.is_archived,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      patient_name: conv.patient?.full_name,
      patient_photo_url: conv.patient?.photo_url,
      doctor_name: conv.doctor?.user?.full_name,
      doctor_photo_url: conv.doctor?.user?.photo_url,
      unread_count: unreadCountsByConversation[conv.id] ?? 0,
    }))
  } catch (err) {
    logger.error('Unexpected error in getConversations:', { error: err })
    return []
  }
}

export async function getOrCreateConversation(
  patientId: string,
  doctorId: string,
  appointmentId?: string
): Promise<ChatConversation> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .maybeSingle()

  if (existing) {
    return existing
  }

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: appointmentId || null,
    })
    .select()
    .single()

  if (error) {
    logger.error('Error creating conversation:', { error })
    throw error
  }

  return data
}

export async function sendMessage(params: SendMessageParams): Promise<ChatMessage | null> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', params.senderId)
    .single()

  const senderType = (profile?.role === 'doctor' ? 'doctor' : 'patient') as 'patient' | 'doctor'

  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      sender_type: senderType,
      content: params.content,
      message_type: params.type ?? 'text',
      attachment_url: params.attachmentUrl || null,
      attachment_name: params.attachmentName || null,
      attachment_type: params.attachmentType || null,
    })
    .select()
    .single()

  if (error) {
    logger.error('Error sending message:', { error })
    throw error
  }

  await updateConversationLastMessage(params.conversationId, params.content)

  return message
}

async function updateConversationLastMessage(
  conversationId: string,
  preview: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('chat_conversations')
    .update({
      last_message_preview: preview.slice(0, LIMITS.CHAT_PREVIEW_LENGTH),
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (error) {
    logger.error('Error updating conversation last message:', { error })
  }
}

export async function getMessages(
  conversationId: string,
  limit = LIMITS.CHAT_MESSAGES_DEFAULT_LIMIT,
  offset = 0
): Promise<MessageWithSender[]> {
  const supabase = await createClient()

  // Fetch messages with sender profiles in a single join query
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:profiles!chat_messages_sender_id_fkey(
        full_name,
        photo_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    logger.error('Error getting messages:', { error })
    throw error
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.reverse().map((msg) => ({
    ...msg,
    sender_name: msg.sender?.full_name,
    sender_photo_url: msg.sender?.photo_url,
  }))
}

/**
 * Mark all messages in a conversation as read for a user
 * OPTIMIZED: Uses batch insert with proper conflict handling
 * Note: This requires two queries (select + upsert) for correctness
 * but both are optimized with proper indexes
 */
export async function markAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  // OPTIMIZED: Get unread message IDs using proper index
  // idx_chat_messages_conversation_sender helps this query
  const { data: unreadMessages, error: fetchError } = await supabase
    .from('chat_messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .not('id', 'in', (
      supabase
        .from('chat_message_receipts')
        .select('message_id')
        .eq('user_id', userId)
    ))

  if (fetchError) {
    logger.error('Error fetching unread messages:', { error: fetchError, conversationId })
    return
  }

  if (!unreadMessages || unreadMessages.length === 0) {
    return
  }

  // OPTIMIZED: Bulk insert/update receipts in a single query
  // Uses onConflict for idempotency and idx_chat_receipts_user_message index
  const receipts = unreadMessages.map(msg => ({
    message_id: msg.id,
    user_id: userId,
    read_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('chat_message_receipts')
    .upsert(receipts, { onConflict: 'message_id, user_id' })

  if (error) {
    logger.error('Error marking messages as read:', { error, conversationId, userId })
  }
}

/**
 * Get unread message count for a specific conversation
 * OPTIMIZED: Single query with proper indexes
 * Uses head=true for count-only optimization
 */
export async function getUnreadCount(
  conversationId: string, 
  userId: string
): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .not('id', 'in', (
      supabase
        .from('chat_message_receipts')
        .select('message_id')
        .eq('user_id', userId)
    ))

  if (error) {
    logger.error('Error getting unread count:', { error, conversationId, userId })
    return 0
  }

  return count ?? 0
}

/**
 * Get unread counts for multiple conversations in a single query
 * OPTIMIZED: Batch operation to avoid N+1 when loading conversation lists
 * 
 * @param conversationIds - Array of conversation IDs to check
 * @param userId - The user ID to check unread status for
 * @returns Map of conversation_id -> unread count
 */
export async function getUnreadCountsBatch(
  conversationIds: string[],
  userId: string
): Promise<Record<string, number>> {
  if (conversationIds.length === 0) {
    return {}
  }

  const supabase = await createClient()

  // OPTIMIZED: Single query to get all unread message IDs for all conversations
  // This is much more efficient than N individual getUnreadCount() calls
  const { data, error } = await supabase
    .from('chat_messages')
    .select('conversation_id, id')
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)
    .not('id', 'in', (
      supabase
        .from('chat_message_receipts')
        .select('message_id')
        .eq('user_id', userId)
    ))

  if (error) {
    logger.error('Error getting batch unread counts:', { error, userId })
    return {}
  }

  // Aggregate counts by conversation
  return (data || []).reduce((acc, msg) => {
    acc[msg.conversation_id] = (acc[msg.conversation_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export async function getTotalUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()

  // Step 1: Get all conversation IDs where user is participant
  const { data: conversations, error: convError } = await supabase
    .from('chat_conversations')
    .select('id')
    .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)

  if (convError || !conversations || conversations.length === 0) {
    return 0
  }

  const conversationIds = conversations.map(c => c.id)

  // Step 2: Get all read receipt message IDs for this user
  const { data: readReceipts, error: receiptError } = await supabase
    .from('chat_message_receipts')
    .select('message_id')
    .eq('user_id', userId)

  if (receiptError) {
    logger.error('Error getting read receipts:', { receiptError })
  }

  const readMessageIds = readReceipts?.map(r => r.message_id) || []

  // Step 3: Count unread messages
  let query = supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)

  // Exclude already read messages if any exist
  if (readMessageIds.length > 0) {
    query = query.not('id', 'in', `(${readMessageIds.join(',')})`)
  }

  const { count, error } = await query

  if (error) {
    logger.error('Error getting total unread count:', { error })
    return 0
  }

  return count ?? 0
}

export async function updatePresence(
  userId: string,
  conversationId: string | null,
  status: 'online' | 'away' | 'offline'
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('chat_user_presence')
    .upsert({
      user_id: userId,
      conversation_id: conversationId,
      status,
      last_seen_at: new Date().toISOString(),
    })
}

export async function getOnlineUsers(conversationId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('chat_user_presence')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('status', 'online')
    .gt('last_seen_at', new Date(Date.now() - TIME.ONLINE_PRESENCE_TIMEOUT_MINUTES * TIME.MINUTE_IN_MS).toISOString())

  if (error) {
    logger.error('Error getting online users:', { error })
    return []
  }

  return (data || []).map((u) => u.user_id)
}

export async function getParticipants(conversationId: string): Promise<{
  patientId: string
  doctorId: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('patient_id, doctor_id')
    .eq('id', conversationId)
    .single()

  if (error) {
    logger.error('Error getting participants:', { error })
    throw error
  }

  return {
    patientId: data.patient_id,
    doctorId: data.doctor_id,
  }
}

