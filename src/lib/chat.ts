import { createClient } from '@/lib/supabase/server'
import { requireConversationParticipant } from '@/lib/auth-guard'
import type { ChatConversation, ChatMessage as ChatMessageType, UserRole } from '@/types'
import { logger } from '@/lib/observability/logger'

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

  // Fetch conversation data separately to avoid complex join issues
  const { data: conversation, error: convError } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (convError || !conversation) {
    logger.error('Error getting conversation:', { error: convError })
    return null
  }

  // Fetch patient profile
  const { data: patientProfile } = await supabase
    .from('profiles')
    .select('full_name, photo_url')
    .eq('id', conversation.patient_id)
    .single()

  // Fetch doctor profile
  const { data: doctorProfile } = await supabase
    .from('profiles')
    .select('full_name, photo_url')
    .eq('id', conversation.doctor_id)
    .single()

  return {
    ...conversation,
    patient_name: patientProfile?.full_name,
    patient_photo_url: patientProfile?.photo_url,
    doctor_name: doctorProfile?.full_name,
    doctor_photo_url: doctorProfile?.photo_url,
  }
}

export async function getConversations(
  userId: string,
  role: UserRole
): Promise<ConversationWithDetails[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('chat_conversations')
      .select('*')
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

    // Fetch profiles separately to avoid complex join issues
    const conversations = data || []
    const patientIds = [...new Set(conversations.map((c: { patient_id: string; doctor_id: string }) => c.patient_id))]
    const doctorIds = [...new Set(conversations.map((c: { patient_id: string; doctor_id: string }) => c.doctor_id))]

    // Get patient profiles
    const { data: patientProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, photo_url')
      .in('id', patientIds)

    // Get doctor profiles
    const { data: doctorProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, photo_url')
      .in('id', doctorIds)

    type ChatProfile = { id: string; full_name?: string | null; photo_url?: string | null }
    const patientMap = new Map((patientProfiles as ChatProfile[] | null | undefined)?.map(p => [p.id, p]) || [])
    const doctorProfileMap = new Map((doctorProfiles as ChatProfile[] | null | undefined)?.map(p => [p.id, p]) || [])

    // Batch: get unread counts for all conversations in a single query
    const conversationIds = conversations.map((c: { id: string }) => c.id)
    const unreadCounts = await getUnreadCounts(conversationIds, userId)

    const conversationsWithDetails = conversations.map((conv: { id: string; patient_id: string; doctor_id: string; last_message_preview?: string | null; last_message_at?: string | null }) => {
      const patient = patientMap.get(conv.patient_id)
      const doctorProfile = doctorProfileMap.get(conv.doctor_id)
      
      return {
        ...conv,
        patient_name: patient?.full_name,
        patient_photo_url: patient?.photo_url,
        doctor_name: doctorProfile?.full_name,
        doctor_photo_url: doctorProfile?.photo_url,
        unread_count: unreadCounts[conv.id] || 0,
      }
    })

    return conversationsWithDetails
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
  await requireConversationParticipant(params.conversationId)
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
      message_type: params.type || 'text',
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
      last_message_preview: preview.slice(0, 100),
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (error) {
    logger.error('Error updating conversation last message:', { error })
  }
}

export async function getMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<MessageWithSender[]> {
  await requireConversationParticipant(conversationId)
  const supabase = await createClient()

  // Fetch messages separately to avoid complex join issues
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    logger.error('Error getting messages:', { error })
    throw error
  }

  if (!messages || messages.length === 0) {
    return []
  }

  // Get unique sender IDs
  const senderIds = [...new Set(messages.map((m: { sender_id: string }) => m.sender_id))]

  // Fetch sender profiles separately
  const { data: senderProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, photo_url')
    .in('id', senderIds)

  type SenderProfile = { id: string; full_name?: string | null; photo_url?: string | null }
  const senderMap = new Map((senderProfiles as SenderProfile[] | null | undefined)?.map(p => [p.id, p]) || [])

  return messages.reverse().map((msg: ChatMessage) => {
    const sender = senderMap.get(msg.sender_id)
    return {
      ...msg,
      sender_name: sender?.full_name,
      sender_photo_url: sender?.photo_url,
    }
  })
}

export async function markAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)

  if (!messages || messages.length === 0) {
    return
  }

  for (const msg of messages) {
    await supabase
      .from('chat_message_receipts')
      .upsert(
        { message_id: msg.id, user_id: userId, read_at: new Date().toISOString() },
        { onConflict: 'message_id, user_id' }
      )
  }
}

async function getUnreadCounts(conversationIds: string[], userId: string): Promise<Record<string, number>> {
  if (conversationIds.length === 0) return {}

  const supabase = await createClient()

  // Single query: get all unread messages grouped by conversation
  // A message is unread if: sender != userId AND no receipt exists for userId
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('id, conversation_id')
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)

  if (error || !messages || messages.length === 0) {
    return Object.fromEntries(conversationIds.map(id => [id, 0]))
  }

  const messageIds = messages.map((m: { id: string }) => m.id)

  // Get read receipts for these messages
  const { data: receipts } = await supabase
    .from('chat_message_receipts')
    .select('message_id')
    .in('message_id', messageIds)
    .eq('user_id', userId)

  const readSet = new Set((receipts || []).map((r: { message_id: string }) => r.message_id))

  const counts: Record<string, number> = {}
  for (const id of conversationIds) {
    counts[id] = 0
  }

  for (const msg of messages) {
    if (!readSet.has(msg.id)) {
      counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1
    }
  }

  return counts
}

export async function getTotalUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()

  // Single query: count unread messages across all user's conversations
  const { data: conversations } = await supabase
    .from('chat_conversations')
    .select('id')
    .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)

  if (!conversations || conversations.length === 0) {
    return 0
  }

  const conversationIds = conversations.map((c: { id: string }) => c.id)

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id')
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)

  if (!messages || messages.length === 0) {
    return 0
  }

  const messageIds = messages.map((m: { id: string }) => m.id)

  const { count, error } = await supabase
    .from('chat_message_receipts')
    .select('*', { count: 'exact', head: true })
    .in('message_id', messageIds)
    .eq('user_id', userId)

  if (error) {
    logger.error('Error getting total unread count:', { error })
    return 0
  }

  return messages.length - (count || 0)
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
    .gt('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

  if (error) {
    logger.error('Error getting online users:', { error })
    return []
  }

  return (data || []).map((u: { user_id: string }) => u.user_id)
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
