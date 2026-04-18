'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'

interface SupportPresenceOrbProps {
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  imageClassName?: string
}

export function SupportPresenceOrb({ size = 'md', isLoading = false, imageClassName = 'object-cover' }: SupportPresenceOrbProps) {
  const reducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: {
      frame: 'h-10 w-10',
      outer: 'h-8 w-8 text-[10px]',
      icon: 'h-3.5 w-3.5',
      ringInset: 'inset-0.5',
    },
    md: {
      frame: 'h-12 w-12',
      outer: 'h-10 w-10 text-xs',
      icon: 'h-4 w-4',
      ringInset: 'inset-1',
    },
    lg: {
      frame: 'h-14 w-14',
      outer: 'h-12 w-12 text-sm',
      icon: 'h-5 w-5',
      ringInset: 'inset-1',
    },
  } as const

  const current = sizeClasses[size]

  return (
    <motion.div
      className={`relative flex items-center justify-center ${current.frame}`}
      animate={!reducedMotion && isLoading ? { scale: [1, 1.08, 1] } : undefined}
      transition={!reducedMotion && isLoading ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {!reducedMotion ? (
        <>
          <motion.span
            className="absolute inset-0 rounded-full bg-sky-400/18"
            animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0.1, 0.45] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className={`absolute rounded-full bg-cyan-300/14 ${current.ringInset}`}
            animate={isLoading ? { scale: [1, 1.16, 1], opacity: [0.45, 0.14, 0.45] } : { scale: [1, 1.1, 1], opacity: [0.35, 0.08, 0.35] }}
            transition={isLoading ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.1 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
        </>
      ) : null}
      <div className={`relative flex items-center justify-center overflow-hidden rounded-full border border-white/65 bg-[radial-gradient(circle_at_30%_20%,rgba(191,219,254,0.95),rgba(14,165,233,0.92)_42%,rgba(12,74,110,0.98))] text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] ${current.outer}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent_42%)]" />
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <Image
            src="/images/simeon.png"
            alt="Doctor Simeon"
            fill
            sizes="(max-width: 768px) 40px, 48px, 56px"
            className={imageClassName}
          />
        </div>
      </div>
    </motion.div>
  )
}
