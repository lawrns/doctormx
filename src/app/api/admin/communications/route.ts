import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

export async function GET() {
  try {
    const { supabase } = await requireRole('admin')

    const [
      conversationsResult,
      messagesResult,
      unreadReceiptsResult,
      pendingDoctorsResult,
      orphanConversationDoctorProfilesResult,
      orphanConversationPatientProfilesResult,
    ] = await Promise.all([
      supabase
        .from('chat_conversations')
        .select('id, patient_id, doctor_id, last_message_preview, last_message_at, created_at', { count: 'exact' })
        .order('last_message_at', { ascending: false })
        .limit(10),
      supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('chat_message_receipts')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('doctors')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('chat_conversations')
        .select('id, doctor:profiles!chat_conversations_doctor_id_fkey(id)', { count: 'exact' })
        .is('doctor.id', null),
      supabase
        .from('chat_conversations')
        .select('id, patient:profiles!chat_conversations_patient_id_fkey(id)', { count: 'exact' })
        .is('patient.id', null),
    ])

    const conversations = conversationsResult.data || []
    const totalConversations = conversationsResult.count || 0
    const totalMessages = messagesResult.count || 0
    const totalReceipts = unreadReceiptsResult.count || 0
    const pendingDoctors = pendingDoctorsResult.count || 0
    const orphanConversationDoctorProfiles = orphanConversationDoctorProfilesResult.count || 0
    const orphanConversationPatientProfiles = orphanConversationPatientProfilesResult.count || 0

    const activeConversations24h = conversations.filter((conversation) => {
      if (!conversation.last_message_at) return false
      return new Date(conversation.last_message_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
    }).length

    const conversationsAwaitingFirstReply = conversations.filter((conversation) => {
      return Boolean(conversation.last_message_preview) && !conversation.last_message_preview?.trim().startsWith('Dr.')
    }).length

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          conversations: totalConversations,
          messages: totalMessages,
          receipts: totalReceipts,
          pendingDoctors,
          activeConversations24h,
          orphanConversationDoctorProfiles,
          orphanConversationPatientProfiles,
          conversationsAwaitingFirstReply,
        },
        recentConversations: conversations,
      },
    })
  } catch (error) {
    console.error('Admin communications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communications metrics' },
      { status: 500 }
    )
  }
}
