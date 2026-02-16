'use client'

import { motion } from 'framer-motion'
import type { ConversationState } from '../types'

interface ProgressBarProps {
  state: ConversationState | null
  getPhaseLabel: (phase: string) => string
}

export function ProgressBar({ state, getPhaseLabel }: ProgressBarProps) {
  if (!state) return null

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-white/70 mb-1">
        <span>{getPhaseLabel(state.phase)}</span>
        <span>{state.progress}%</span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${state.progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-white rounded-full"
        />
      </div>
    </div>
  )
}
