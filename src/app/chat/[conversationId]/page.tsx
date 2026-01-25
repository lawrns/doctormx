'use client'

import { useState, useEffect, useRef, useCallback, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChatInput } from '@/components/ChatInput'
import type { ChatMessage, ConversationWithDetails } from '@/lib/chat'

interface ChatPageProps {
  params: Promise<{ conversationId: string }>
}

export default function ChatPage({ params }: ChatPageProps) {
  const resolvedParams = use(params)
  const conversationId = resolvedParams.conversationId
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null)
  const [messages, setMessages] = useState<(ChatMessage & { sender_name?: string; sender_photo_url?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!supabase) return

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setUserRole((profile?.role === 'doctor' ? 'doctor' : 'patient') as 'patient' | 'doctor')
      }
    }
    getUser()
  }, [supabase])

  const fetchConversation = useCallback(async () => {
    if (!conversationId || !supabase) return
    try {
      const { data } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          patient:profiles!chat_conversations_patient_id_fkey(id, full_name, photo_url),
          doctor:doctors!chat_conversations_doctor_id_fkey(id, profile:profiles(id, full_name, photo_url))
        `)
        .eq('id', conversationId)
        .single()

      if (data) {
        setConversation({
          ...data,
          patient_name: data.patient?.full_name,
          patient_photo_url: data.patient?.photo_url,
          doctor_name: data.doctor?.profile?.full_name,
          doctor_photo_url: data.doctor?.profile?.photo_url,
        })
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }, [conversationId])

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(full_name, photo_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data.map((msg: any) => ({
          ...msg,
          sender_name: msg.sender?.full_name,
          sender_photo_url: msg.sender?.photo_url,
        })))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      fetchMessages()
    }
  }, [conversationId, fetchConversation, fetchMessages])

  useEffect(() => {
    if (userId && conversationId) {
      const markRead = async () => {
        await supabase
          .from('chat_message_receipts')
          .upsert(
            messages
              .filter((m) => m.sender_id !== userId)
              .map((m) => ({
                message_id: m.id,
                user_id: userId,
                read_at: new Date().toISOString(),
              })),
            { onConflict: 'message_id, user_id' }
          )
      }
      markRead()
    }
  }, [userId, conversationId, messages])

  useEffect(() => {
    if (!conversationId) return
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: any) => {
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              sender:profiles!chat_messages_sender_id_fkey(full_name, photo_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            const newMessage = {
              ...data,
              sender_name: data.sender?.full_name,
              sender_photo_url: data.sender?.photo_url,
            }
            setMessages((prev) => [...prev, newMessage])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    }
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  const getOtherParty = () => {
    if (!conversation) return { name: '', photoUrl: null }
    return userRole === 'patient'
      ? { name: conversation.doctor_name, photoUrl: conversation.doctor_photo_url }
      : { name: conversation.patient_name, photoUrl: conversation.patient_photo_url }
  }

  const otherParty = getOtherParty()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href={userRole === 'patient' ? '/app/chat' : '/doctor/chat'}
            className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-ink-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-xl overflow-hidden">
              {otherParty.photoUrl ? (
                
                              <img
                  src={otherParty.photoUrl}
                  alt={otherParty.name || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                (otherParty.name?.charAt(0) || '?').toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-semibold text-ink-primary">
                {userRole === 'patient' ? `Dr. ${otherParty.name}` : otherParty.name}
              </h1>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-success-500 rounded-full" />
                <span className="text-xs text-ink-muted">En línea</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-secondary-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-ink-secondary mb-2">Aún no hay mensajes</p>
            <p className="text-ink-muted text-sm">Inicia la conversación</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === userId
            const showDate = index === 0 ||
              formatDate(message.created_at) !== formatDate(messages[index - 1].created_at)

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-6">
                    <span className="px-3 py-1 bg-secondary-100 text-ink-muted text-xs rounded-full">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-xs overflow-hidden">
                          {message.sender_photo_url ? (
                            
                              <img
                              src={message.sender_photo_url}
                              alt={message.sender_name || ''}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (message.sender_name?.charAt(0) || '?').toUpperCase()
                          )}
                        </div>
                        <span className="text-xs text-ink-muted">{message.sender_name}</span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-white border border-border text-ink-primary rounded-bl-md'
                      }`}
                    >
                      {message.attachment_url && (
                        <div className="mb-2">
                          {message.attachment_type?.startsWith('image/') ? (
                            
                              <img
                              src={message.attachment_url}
                              alt={message.attachment_name || 'Imagen'}
                              className="max-w-full rounded-lg"
                            />
                          ) : (
                            <a
                              href={message.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                            >
                              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-sm text-ink-primary truncate max-w-[200px]">
                                {message.attachment_name || 'Archivo'}
                              </span>
                            </a>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-xs ${isOwn ? 'text-primary-100' : 'text-ink-muted'}`}>
                          {formatTime(message.created_at)}
                        </span>
                        {isOwn && message.read_at && (
                          <svg className="w-4 h-4 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        conversationId={conversationId}
        onMessageSent={fetchMessages}
        userId={userId}
      />
    </div>
  )
}
