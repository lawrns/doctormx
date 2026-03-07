'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'

export function SupportThinkingState() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="rounded-2xl border border-sky-200/40 bg-[linear-gradient(135deg,rgba(14,165,233,0.10),rgba(2,132,199,0.05))] p-4 shadow-[0_10px_30px_rgba(14,165,233,0.08)]">
      <div className="flex items-center gap-3">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700"
          animate={reducedMotion ? undefined : { scale: [1, 1.05, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BrainCircuit className="h-5 w-5" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">GLM 5 está preparando una respuesta</p>
          <div className="mt-2 flex items-center gap-1.5">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="h-2 w-2 rounded-full bg-sky-500"
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
