'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ConversationWithDetails } from '@/lib/chat'
import { logger } from '@/lib/observability/logger'

interface ChatConversationRow {
  id: string
  patient_id: string
  doctor_id: string
  last_message_at: string
  created_at: string
  status?: string
}

interface ChatListProps {
  initialConversations: ConversationWithDetails[]
  userRole: 'patient' | 'doctor'
}

export function ChatList({ initialConversations, userRole }: ChatListProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(initialConversations)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchConversations = async () => {
      try {
        // Fetch conversations separately to avoid complex join issues
        const { data: conversationsData } = await supabase
          .from('chat_conversations')
          .select('*')
          .order('last_message_at', { ascending: false })

        if (conversationsData && conversationsData.length > 0) {
          // Get unique patient and doctor IDs
          const patientIds = [...new Set(conversationsData.map((c: { patient_id: string }) => c.patient_id))]
          const doctorIds = [...new Set(conversationsData.map((c: { doctor_id: string }) => c.doctor_id))]

          // Fetch patient profiles
          const { data: patientProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, photo_url')
            .in('id', patientIds)

          // Fetch doctor data with user_id
          const { data: doctorsData } = await supabase
            .from('doctors')
            .select('id, user_id')
            .in('id', doctorIds)

          // Fetch doctor profiles
          const doctorUserIds = doctorsData?.map((d: { user_id: string }) => d.user_id) || []
          const { data: doctorProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, photo_url')
            .in('id', doctorUserIds)

          const patientMap = new Map<string, { id: string; full_name?: string; photo_url?: string }>(patientProfiles?.map((p: { id: string; full_name?: string; photo_url?: string }) => [p.id, p]) || [])
          const doctorToUserMap = new Map<string, string>(doctorsData?.map((d: { id: string; user_id: string }) => [d.id, d.user_id]) || [])
          const doctorProfileMap = new Map<string, { id: string; full_name?: string; photo_url?: string }>(doctorProfiles?.map((p: { id: string; full_name?: string; photo_url?: string }) => [p.id, p]) || [])

          const conversationsWithDetails = conversationsData.map((conv: ChatConversationRow) => {
            const patient = patientMap.get(conv.patient_id)
            const doctorUserId = doctorToUserMap.get(conv.doctor_id)
            const doctorProfile = doctorUserId ? doctorProfileMap.get(doctorUserId) : undefined
            return {
              ...conv,
              patient_name: patient?.full_name,
              patient_photo_url: patient?.photo_url,
              doctor_name: doctorProfile?.full_name,
              doctor_photo_url: doctorProfile?.photo_url,
            }
          })
          setConversations(conversationsWithDetails)
        }
      } catch (error) {
        logger.error('Error fetching conversations', { error: error instanceof Error ? error.message : String(error) })
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        (payload: { eventType: string; new?: ChatConversationRow }) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            fetchConversations()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
  }

  const getOtherParty = (conv: ConversationWithDetails) => {
    return userRole === 'patient'
      ? { name: conv.doctor_name, photoUrl: conv.doctor_photo_url }
      : { name: conv.patient_name, photoUrl: conv.patient_photo_url }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-border animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-ink-secondary text-lg mb-2">No tienes conversaciones</p>
        <p className="text-ink-muted text-sm">Inicia una conversación con un doctor desde tus consultas</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const otherParty = getOtherParty(conv)
        return (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className="block bg-white p-4 rounded-xl border border-border hover:border-primary-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-xl overflow-hidden">
                  {otherParty.photoUrl ? (
                    
                              <img
                      src={otherParty.photoUrl}
                      alt={otherParty.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (otherParty.name?.charAt(0) || '?').toUpperCase()
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-ink-primary truncate">
                    {userRole === 'patient' ? `Dr. ${otherParty.name}` : otherParty.name}
                  </h3>
                  <span className="text-xs text-ink-muted ml-2">
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>
                <p className="text-sm text-ink-secondary truncate">
                  {conv.last_message_preview || 'Sin mensajes aún'}
                </p>
              </div>
              {conv.unread_count && conv.unread_count > 0 && (
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </span>
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
