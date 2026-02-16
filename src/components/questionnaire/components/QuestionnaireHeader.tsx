'use client'

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConversationState, UrgencyLevel } from '../types'
import { ProgressBar } from './ProgressBar'

interface QuestionnaireHeaderProps {
  state: ConversationState | null
  getUrgencyColor: (level: UrgencyLevel | string) => string
  getUrgencyLabel: (level: UrgencyLevel | string) => string
  getPhaseLabel: (phase: string) => string
}

export function QuestionnaireHeader({
  state,
  getUrgencyColor,
  getUrgencyLabel,
  getPhaseLabel
}: QuestionnaireHeaderProps) {
  return (
    <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
            />
          </div>
          <div>
            <h2 className="font-semibold">Asistente Médico IA</h2>
            <p className="text-xs text-white/70">DoctorMx</p>
          </div>
        </div>

        {state && (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                getUrgencyColor(state.urgencyLevel)
              )}
            >
              {getUrgencyLabel(state.urgencyLevel)}
            </div>
          </div>
        )}
      </div>

      <ProgressBar state={state} getPhaseLabel={getPhaseLabel} />
    </div>
  )
}
