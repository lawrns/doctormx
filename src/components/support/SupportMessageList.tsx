'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { SupportPresenceOrb } from './SupportPresenceOrb'
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
          const showAssistantIdentity = isAssistant && (index === 0 || messages[index - 1]?.role !== 'assistant')

          return (
            <motion.div
              key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="flex w-full"
            >
              <div className={`flex w-full min-w-0 items-end gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                {isAssistant ? (
                  <div className={`shrink-0 transition-opacity ${showAssistantIdentity ? 'opacity-100' : 'opacity-0'}`}>
                    <SupportPresenceOrb size="sm" />
                  </div>
                ) : null}
                <div className="min-w-0 max-w-[82%]">
                  {showAssistantIdentity ? (
                    <div className="mb-1.5 ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700/85">
                      Doctor Simeon
                    </div>
                  ) : null}
                  <div
                    className={isAssistant
                      ? 'w-fit max-w-full break-words rounded-[1.35rem] rounded-bl-md border border-slate-200/80 bg-white px-4 py-3 text-sm leading-[1.55] text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
                      : 'ml-auto w-fit min-w-[3rem] max-w-full break-words rounded-[1.35rem] rounded-br-md bg-[linear-gradient(135deg,hsl(var(--brand-ocean)),hsl(var(--brand-sky)))] px-4 py-3 text-sm leading-[1.55] text-white shadow-[0_8px_20px_rgba(14,165,233,0.24)]'}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
