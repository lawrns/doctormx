'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode, useEffect, useState, useRef } from 'react'

// ============================================
// DOCTRONIC EASING FUNCTIONS
// Matches design system from globals.css
// ============================================

export const doctronicEasing = {
  easeOut: [0, 0, 0.2, 1], // cubic-bezier(0, 0, 0.2, 1)
  easeInOut: [0.4, 0, 0.2, 1], // cubic-bezier(0.4, 0, 0.2, 1)
  easeBounce: [0.68, -0.55, 0.265, 1.55], // cubic-bezier(0.68, -0.55, 0.265, 1.55)
} as const

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate staggered delay for child animations
 * @param index - Index of the child element
 * @param baseDelay - Base delay in seconds (default: 0.1)
 * @returns Calculated delay in seconds
 *
 * @example
 * ```tsx
 * {items.map((item, i) => (
 *   <motion.div key={i} transition={{ delay: staggerDelay(i, 0.05) }}>
 *     {item}
 *   </motion.div>
 * ))}
 * ```
 */
export function staggerDelay(index: number, baseDelay: number = 0.1): number {
  return index * baseDelay
}

/**
 * Create an animated gradient configuration
 * @param color1 - First color (hex or CSS color)
 * @param color2 - Second color (hex or CSS color)
 * @returns Gradient animation configuration
 *
 * @example
 * ```tsx
 * const gradient = createGradientAnimation('#5588ff', '#00B4A3')
 * <motion.div style={gradient.style} animate={gradient.animate} />
 * ```
 */
export function createGradientAnimation(color1: string, color2: string) {
  return {
    style: {
      background: `linear-gradient(120deg, ${color1} 0%, ${color2} 100%)`,
      backgroundSize: '200% 200%',
    },
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  }
}

// ============================================
// TEXT REVEAL ANIMATION
// Character-by-character reveal with optional cursor
// ============================================

interface TextRevealAnimationProps {
  text: string
  showCursor?: boolean
  duration?: number
  delay?: number
  className?: string
  cursorClassName?: string
}

/**
 * Character-by-character text reveal animation
 *
 * @example
 * ```tsx
 * <TextRevealAnimation
 *   text="Welcome to Doctronic"
 *   showCursor={true}
 *   duration={0.8}
 * />
 * ```
 */
export function TextRevealAnimation({
  text,
  showCursor = false,
  duration = 0.8,
  delay = 0,
  className = '',
  cursorClassName = '',
}: TextRevealAnimationProps) {
  const chars = text.split('')
  const charDelay = duration / chars.length

  return (
    <span className={`inline-block ${className}`}>
      {chars.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + index * charDelay,
            ease: doctronicEasing.easeOut,
          }}
          className="inline-block"
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
      {showCursor && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'linear',
            delay: delay + duration,
          }}
          className={`inline-block ml-1 w-0.5 h-[1em] bg-current ${cursorClassName}`}
        />
      )}
    </span>
  )
}

// ============================================
// CHAT BUBBLE ANIMATION
// Message bubble slide-in from sides
// ============================================

interface ChatBubbleAnimationProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  side: 'left' | 'right'
  duration?: number
  delay?: number
  className?: string
}

/**
 * Chat message bubble slide-in animation
 *
 * @example
 * ```tsx
 * <ChatBubbleAnimation side="left" delay={0.2}>
 *   <p>Hello from the doctor!</p>
 * </ChatBubbleAnimation>
 * ```
 */
export function ChatBubbleAnimation({
  children,
  side,
  duration = 0.6,
  delay = 0,
  className = '',
  ...props
}: ChatBubbleAnimationProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: side === 'left' ? -30 : 30,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        duration,
        delay,
        ease: doctronicEasing.easeOut,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// TYPING INDICATOR
// 3-dot loader with proper bounce delays
// ============================================

interface TypingIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
}

/**
 * Animated typing indicator (3 dots)
 *
 * @example
 * ```tsx
 * <TypingIndicator size="md" color="var(--color-primary-500)" />
 * ```
 */
export function TypingIndicator({ size = 'md', color, className = '' }: TypingIndicatorProps) {
  const dotColor = color || 'var(--color-neutral-500)'

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className={`${dotSizes[size]} rounded-full`}
          style={{ backgroundColor: dotColor }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: doctronicEasing.easeInOut,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// SHIMMER EFFECT
// Gradient shimmer overlay for buttons
// ============================================

interface ShimmerEffectProps {
  duration?: number
  className?: string
  color1?: string
  color2?: string
}

/**
 * Shimmer effect overlay (for buttons, cards, etc.)
 *
 * @example
 * ```tsx
 * <button className="relative overflow-hidden">
 *   Click Me
 *   <ShimmerEffect />
 * </button>
 * ```
 */
export function ShimmerEffect({
  duration = 2,
  className = '',
  color1 = 'rgba(255, 255, 255, 0)',
  color2 = 'rgba(255, 255, 255, 0.3)',
}: ShimmerEffectProps) {
  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: `linear-gradient(90deg, ${color1} 0%, ${color2} 50%, ${color1} 100%)`,
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// ============================================
// MORPHING BLOB
// Animated background blob
// ============================================

interface MorphingBlobProps {
  size?: number
  color?: string
  duration?: number
  opacity?: number
  blur?: number
  className?: string
}

/**
 * Morphing blob background animation
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <MorphingBlob size={400} color="#5588ff" className="top-0 left-0" />
 *   <div className="relative z-10">Content here</div>
 * </div>
 * ```
 */
export function MorphingBlob({
  size = 300,
  color = 'var(--color-primary-500)',
  duration = 10,
  opacity = 0.3,
  blur = 48,
  className = '',
}: MorphingBlobProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity,
        filter: `blur(${blur}px)`,
      }}
      animate={{
        scale: [1, 1.2, 0.9, 1],
        rotate: [0, 90, 180, 270, 360],
        borderRadius: [
          '30% 70% 70% 30% / 30% 30% 70% 70%',
          '70% 30% 30% 70% / 70% 70% 30% 30%',
          '50% 50% 50% 50% / 50% 50% 50% 50%',
          '30% 70% 70% 30% / 30% 30% 70% 70%',
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: doctronicEasing.easeInOut,
      }}
    />
  )
}

// ============================================
// GLASS CARD ANIMATION
// Card with glass effect on hover
// ============================================

interface GlassCardAnimationProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  hoverScale?: number
  duration?: number
  className?: string
}

/**
 * Glass card with hover animation
 *
 * @example
 * ```tsx
 * <GlassCardAnimation>
 *   <h3>Premium Feature</h3>
 *   <p>Description here</p>
 * </GlassCardAnimation>
 * ```
 */
export function GlassCardAnimation({
  children,
  hoverScale = 1.02,
  duration = 0.3,
  className = '',
  ...props
}: GlassCardAnimationProps) {
  return (
    <motion.div
      className={`glass rounded-lg p-6 ${className}`}
      whileHover={{
        scale: hoverScale,
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration,
        ease: doctronicEasing.easeOut,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// STAGGERED FADE IN
// Container for staggered child animations
// ============================================

interface StaggeredFadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  staggerDelay?: number
  initialDelay?: number
  className?: string
}

/**
 * Container that staggers child animations
 * Children must be direct descendants
 *
 * @example
 * ```tsx
 * <StaggeredFadeIn staggerDelay={0.1}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggeredFadeIn>
 * ```
 */
export function StaggeredFadeIn({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  className = '',
  ...props
}: StaggeredFadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Child component for StaggeredFadeIn
 * Must be direct child of StaggeredFadeIn
 */
export function StaggeredItem({
  children,
  className = '',
  ...props
}: { children: ReactNode; className?: string } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: doctronicEasing.easeOut,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// PULSE GLOW
// Subtle pulsing glow effect
// ============================================

interface PulseGlowProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  color?: string
  intensity?: 'subtle' | 'medium' | 'strong'
  duration?: number
  className?: string
}

const glowIntensity = {
  subtle: '0 0 10px',
  medium: '0 0 20px',
  strong: '0 0 30px',
}

/**
 * Pulsing glow effect
 *
 * @example
 * ```tsx
 * <PulseGlow color="var(--color-primary-500)" intensity="medium">
 *   <button>Premium CTA</button>
 * </PulseGlow>
 * ```
 */
export function PulseGlow({
  children,
  color = 'var(--color-primary-500)',
  intensity = 'medium',
  duration = 2,
  className = '',
  ...props
}: PulseGlowProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `${glowIntensity[intensity]} ${color}00`,
          `${glowIntensity[intensity]} ${color}`,
          `${glowIntensity[intensity]} ${color}00`,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: doctronicEasing.easeInOut,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// FLOATING CARD
// Card with floating animation
// ============================================

interface FloatingCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  yOffset?: number
  duration?: number
  className?: string
}

/**
 * Floating card animation
 *
 * @example
 * ```tsx
 * <FloatingCard yOffset={12} duration={3}>
 *   <img src="/feature.png" alt="Feature" />
 * </FloatingCard>
 * ```
 */
export function FloatingCard({
  children,
  yOffset = 10,
  duration = 3,
  className = '',
  ...props
}: FloatingCardProps) {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: doctronicEasing.easeInOut,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// NUMBER COUNTER
// Animated number counter with easing
// ============================================

interface NumberCounterProps {
  from?: number
  to: number
  duration?: number
  delay?: number
  decimals?: number
  separator?: boolean
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * Animated number counter
 *
 * @example
 * ```tsx
 * <NumberCounter
 *   from={0}
 *   to={1250}
 *   duration={1.2}
 *   separator={true}
 *   suffix="+"
 * />
 * ```
 */
export function NumberCounter({
  from = 0,
  to,
  duration = 1.2,
  delay = 0,
  decimals = 0,
  separator = false,
  prefix = '',
  suffix = '',
  className = '',
}: NumberCounterProps) {
  const [count, setCount] = useState(from)
  const nodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp + delay * 1000

      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

      // Easing function (easeOut)
      const eased = 1 - Math.pow(1 - progress, 3)

      const current = from + (to - from) * eased
      setCount(current)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(to)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [from, to, duration, delay])

  const formattedValue = separator
    ? count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : count.toFixed(decimals)

  return (
    <motion.span
      ref={nodeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  )
}

// All exports are inline above - no need for duplicate export block
