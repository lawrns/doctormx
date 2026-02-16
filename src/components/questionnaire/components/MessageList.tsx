'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message, Symptom } from '../types'
import { TypingIndicator } from './TypingIndicator'
import { SymptomsList } from './SymptomsList'

interface MessageListProps {
  messages: Message[]
  isTyping: boolean
  symptoms: Symptom[]
}

export function MessageList({ messages, isTyping, symptoms }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence mode="popLayout">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 shadow-md',
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-600'
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-[10px] mt-1 opacity-50">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <TypingIndicator isTyping={isTyping} />
      <SymptomsList symptoms={symptoms} />

      <div ref={messagesEndRef} />
    </div>
  )
}
