'use client'

import { motion, HTMLMotionProps, Variants } from 'framer-motion'
import { ReactNode } from 'react'

// Fade in from bottom animation
export function FadeInUp({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  ...props 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Fade in animation
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  ...props 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Scale in animation
export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  ...props 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Slide in from left
export function SlideInLeft({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  ...props 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Slide in from right
export function SlideInRight({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  ...props 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger container for child animations
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = '',
  ...props 
}: { 
  children: ReactNode
  staggerDelay?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger item (child of StaggerContainer)
export function StaggerItem({ 
  children, 
  className = '',
  ...props 
}: { 
  children: ReactNode
  className?: string
} & HTMLMotionProps<'div'>) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      variants={itemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Hover scale effect
export function HoverScale({ 
  children, 
  scale = 1.02,
  className = '',
  ...props 
}: { 
  children: ReactNode
  scale?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated counter
export function AnimatedCounter({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  )
}

// Floating animation (subtle up/down movement)
export function FloatingElement({ 
  children, 
  className = '',
  yOffset = 10,
  duration = 3,
  ...props 
}: { 
  children: ReactNode
  className?: string
  yOffset?: number
  duration?: number
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Pulse animation
export function PulseElement({ 
  children, 
  className = '',
  scale = 1.05,
  duration = 2,
  ...props 
}: { 
  children: ReactNode
  className?: string
  scale?: number
  duration?: number
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Scroll-triggered fade in
export function ScrollFadeIn({ 
  children, 
  className = '',
  ...props 
}: { 
  children: ReactNode
  className?: string
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated gradient background
export function AnimatedGradient({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`absolute inset-0 -z-10 ${className}`}
      style={{
        background: 'linear-gradient(120deg, #e0f2fe 0%, #dbeafe 25%, #ede9fe 50%, #fce7f3 75%, #e0f2fe 100%)',
        backgroundSize: '400% 400%',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// Text reveal animation (character by character)
export function TextReveal({ 
  text, 
  className = '',
  delay = 0,
}: { 
  text: string
  className?: string
  delay?: number
}) {
  const words = text.split(' ')
  
  return (
    <motion.span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: delay + (wordIndex * 0.1) + (charIndex * 0.03),
                ease: 'easeOut',
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </motion.span>
  )
}

// Morphing blob background
export function MorphingBlob({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
        borderRadius: ['30% 70% 70% 30% / 30% 30% 70% 70%', '70% 30% 30% 70% / 70% 70% 30% 30%', '30% 70% 70% 30% / 30% 30% 70% 70%'],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
