'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { SupportMessage } from '@/lib/support/types'

interface SupportMessageListProps {
  messages: SupportMessage[]
}

export function SupportMessageList({ messages }: SupportMessageListProps) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          const isAssistant = message.role === 'assistant'

          return (
            <motion.div
              key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={isAssistant
                  ? 'max-w-[88%] rounded-[1.35rem] rounded-bl-md border border-slate-200/80 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
                  : 'max-w-[82%] rounded-[1.35rem] rounded-br-md bg-[linear-gradient(135deg,hsl(var(--brand-ocean)),hsl(var(--brand-sky)))] px-4 py-3 text-sm leading-6 text-white shadow-[0_12px_30px_rgba(14,165,233,0.30)]'}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
