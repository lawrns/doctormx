'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * SkipLink Component - WCAG 2.1 AA Compliant
 *
 * Allows keyboard users to skip repetitive navigation and jump directly to main content.
 * This is a WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks).
 *
 * Features:
 * - Visually hidden by default (sr-only)
 * - Becomes visible on keyboard focus
 * - High contrast styling for visibility
 * - Smooth focus management
 * - Spanish localization for Mexican market
 *
 * Usage in layout.tsx (place before any other content):
 *   <SkipLink targetId="main-content" />
 *
 * In page components:
 *   <main id="main-content">
 *     [Main content here]
 *   </main>
 */
export interface SkipLinkProps {
  /**
   * The ID of the element to skip to
   * @default "main-content"
   */
  targetId?: string

  /**
   * Text to display on the link
   * @default "Saltar al contenido principal"
   */
  label?: string

  /**
   * Additional CSS class names
   */
  className?: string
}

export function SkipLink({
  targetId = 'main-content',
  label = 'Saltar al contenido principal',
  className,
}: SkipLinkProps) {
  const [isFocused, setIsFocused] = useState(false)

  // Detect keyboard navigation vs mouse navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocused(true)
      }
    }

    const handleMouseDown = () => {
      setIsFocused(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Handle skip link click with focus management
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)

    if (target) {
      // Make target focusable
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: false })

      // Remove tabindex after blur to allow normal tab flow
      const handleBlur = () => {
        target.removeAttribute('tabindex')
        target.removeEventListener('blur', handleBlur)
      }
      target.addEventListener('blur', handleBlur)

      // Scroll into view smoothly
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        // Base styles - screen reader only by default
        'sr-only',
        // Visible styles when focused
        'focus:not-sr-only focus:absolute',
        // Positioning - fixed at top-left for consistent location
        'focus:top-4 focus:left-4',
        // High z-index to ensure visibility above all content
        'focus:z-[9999]',
        // Visual styling with high contrast (WCAG AA compliant)
        'focus:px-6 focus:py-4',
        'focus:bg-white focus:text-blue-700',
        'focus:font-semibold focus:text-base',
        'focus:rounded-lg focus:shadow-xl',
        'focus:border-2 focus:border-blue-700',
        'focus:no-underline',
        // Focus ring for keyboard visibility
        'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
        // Smooth transitions
        'transition-all duration-200',
        className
      )}
      aria-label={label}
      data-testid="skip-link"
    >
      {label}
    </a>
  )
}

/**
 * MainContent wrapper component
 *
 * Utility component that ensures the main content area is properly
 * configured to receive focus from skip links.
 *
 * Usage:
 *   <MainContent>
 *     <h1>Page Title</h1>
 *     <p>Content...</p>
 *   </MainContent>
 */
export interface MainContentProps {
  id?: string
  children: React.ReactNode
  className?: string
  /**
   * ARIA label for the main content area
   * @default "Contenido principal"
   */
  ariaLabel?: string
}

export function MainContent({
  id = 'main-content',
  children,
  className,
  ariaLabel = 'Contenido principal',
}: MainContentProps) {
  return (
    <main
      id={id}
      className={className}
      tabIndex={-1}
      aria-label={ariaLabel}
    >
      {children}
    </main>
  )
}

export default SkipLink
