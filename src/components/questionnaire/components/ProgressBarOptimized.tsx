'use client'

import type { ConversationState } from '../types'

interface ProgressBarProps {
  state: ConversationState | null
  getPhaseLabel: (phase: string) => string
}

/**
 * Optimized ProgressBar without framer-motion
 * Uses CSS transitions for smooth animations
 */
export function ProgressBar({ state, getPhaseLabel }: ProgressBarProps) {
  if (!state) return null

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-white/70 mb-1">
        <span>{getPhaseLabel(state.phase)}</span>
        <span>{state.progress}%</span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500 ease-out"
          style={{ width: `${state.progress}%` }}
        />
      </div>
    </div>
  )
}
