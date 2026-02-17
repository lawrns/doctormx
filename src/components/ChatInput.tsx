'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/observability/logger'

interface ChatInputProps {
  conversationId: string
  onMessageSent: () => void
  userId: string
}

export function ChatInput({ conversationId, onMessageSent, userId }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleSend = useCallback(async () => {
    if (!message.trim() && !attachment) return

    setSending(true)
    try {
      let attachmentUrl: string | undefined
      let attachmentName: string | undefined
      let attachmentType: string | undefined

      if (attachment) {
        const fileExt = attachment.name.split('.').pop()
        const fileName = `${conversationId}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, attachment)

        if (uploadError) {
          logger.error('Error uploading file', { error: uploadError.message })
          throw uploadError
        }

        const { data: urlData } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(fileName)

        attachmentUrl = urlData.publicUrl
        attachmentName = attachment.name
        attachmentType = attachment.type
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          sender_type: 'patient',
          content: message,
          message_type: attachment ? 'file' : 'text',
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_type: attachmentType,
        })

      if (error) {
        logger.error('Error sending message', { error: error.message })
        throw error
      }

      setMessage('')
      setAttachment(null)
      setAttachmentPreview(null)
      onMessageSent()
    } catch (error) {
      logger.error('Error sending message', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setSending(false)
    }
  }, [message, attachment, conversationId, userId, onMessageSent, supabase])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no debe exceder 10MB')
      return
    }

    setAttachment(file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setAttachmentPreview(null)
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    setAttachmentPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white border-t border-border p-4">
      {attachment && (
        <div className="mb-3 p-3 bg-secondary-50 rounded-lg flex items-center gap-3">
          {attachmentPreview ? (
            
                              <img
              src={attachmentPreview}
              alt={attachment.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-primary truncate">{attachment.name}</p>
            <p className="text-xs text-ink-muted">
              {(attachment.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={removeAttachment}
            className="p-1 hover:bg-secondary-200 rounded-full transition-colors"
            aria-label="Eliminar archivo adjunto"
          >
            <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-ink-muted hover:text-primary-600 hover:bg-secondary-50 rounded-full transition-colors"
          aria-label="Adjuntar archivo"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            rows={1}
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            aria-label="Mensaje"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sending || (!message.trim() && !attachment)}
          className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={sending ? "Enviando mensaje..." : "Enviar mensaje"}
        >
          {sending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
