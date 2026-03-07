'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function SupportPresenceOrb() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      {!reducedMotion ? (
        <>
          <motion.span
            className="absolute inset-0 rounded-full bg-cyan-400/20"
            animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0.1, 0.45] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute inset-1 rounded-full bg-sky-400/15"
            animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.08, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
        </>
      ) : null}
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,hsl(var(--brand-sky)),hsl(var(--brand-ocean)))] text-white shadow-[0_10px_30px_rgba(14,165,233,0.35)]">
        <Sparkles className="h-5 w-5" />
      </div>
    </div>
  )
}
