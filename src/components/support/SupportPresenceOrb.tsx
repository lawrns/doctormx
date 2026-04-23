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
      <div className={`relative flex items-center justify-center overflow-hidden rounded-full border border-border bg-card text-foreground shadow-[0_10px_24px_hsl(var(--shadow-color)/0.12)] ${current.outer}`}>
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <Image
            src="/images/simeon.png"
            alt="Dr. Simeon"
            fill
            sizes="(max-width: 768px) 40px, 48px, 56px"
            className={imageClassName}
          />
        </div>
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-card bg-vital" aria-hidden="true" />
      </div>
    </motion.div>
  )
}
