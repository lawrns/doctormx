'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import type { ConversationWithDetails } from '@/lib/chat'

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

          // Fetch doctor profiles
          const { data: doctorProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, photo_url')
            .in('id', doctorIds)

          const patientMap = new Map<string, { id: string; full_name?: string; photo_url?: string }>(patientProfiles?.map((p: { id: string; full_name?: string; photo_url?: string }) => [p.id, p]) || [])
          const doctorProfileMap = new Map<string, { id: string; full_name?: string; photo_url?: string }>(doctorProfiles?.map((p: { id: string; full_name?: string; photo_url?: string }) => [p.id, p]) || [])

          const conversationsWithDetails = conversationsData.map((conv: any) => {
            const patient = patientMap.get(conv.patient_id)
            const doctorProfile = doctorProfileMap.get(conv.doctor_id)
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
        console.error('Error fetching conversations:', error)
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
        (payload: any) => {
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
      <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-2">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        iconName="message"
        title={userRole === 'patient' ? 'Todavía no tienes conversaciones' : 'Todavía no tienes mensajes con pacientes'}
        description={userRole === 'patient'
          ? 'Cuando reserves una consulta o continúes seguimiento con un doctor, tus conversaciones aparecerán aquí.'
          : 'Los mensajes aparecerán aquí cuando un paciente te contacte desde una consulta o seguimiento.'}
        action={userRole === 'patient'
          ? { label: 'Buscar un doctor', href: '/doctors' }
          : { label: 'Configurar disponibilidad', href: '/doctor/availability' }}
        secondaryAction={userRole === 'patient'
          ? { label: 'Ver mis citas', href: '/app/appointments' }
          : { label: 'Ir al dashboard', href: '/doctor' }}
        className="py-12"
      />
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-dx-1 overflow-hidden">
      <div className="divide-y divide-border">
        {conversations.map((conv) => {
          const otherParty = getOtherParty(conv)
          return (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className="block p-4 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/30 rounded-full flex items-center justify-center text-xl overflow-hidden text-foreground">
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
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-card rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {userRole === 'patient' ? `Dr. ${otherParty.name}` : otherParty.name}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message_preview || 'Sin mensajes aún'}
                  </p>
                </div>
                {conv.unread_count && conv.unread_count > 0 && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-medium">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
