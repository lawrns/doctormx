'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'

export function SupportThinkingState() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_30px_hsl(var(--shadow-color)/0.08)]">
      <div className="flex items-center gap-3">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-ink"
          animate={reducedMotion ? undefined : { scale: [1, 1.05, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BrainCircuit className="h-5 w-5" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Dr. Simeon está revisando…</p>
          <div className="mt-2 flex items-center gap-1.5">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="h-2 w-2 rounded-full bg-[hsl(var(--trust))]"
                animate={reducedMotion ? undefined : { y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 1, repeat: Infinity, delay: index * 0.14, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
