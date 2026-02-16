'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface TypingIndicatorProps {
  isTyping: boolean
}

export function TypingIndicator({ isTyping }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-2 h-2 rounded-full bg-blue-400"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-blue-400"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-blue-400"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
