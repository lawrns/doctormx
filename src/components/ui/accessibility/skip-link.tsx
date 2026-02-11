'use client'

import { useState, useEffect } from 'react'

/**
 * SkipLink Component - WCAG 2.1 AA Compliant
 *
 * Allows keyboard users to skip repetitive navigation and jump directly to main content.
 * This is a WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks).
 *
 * Usage:
 * 1. Place at the top of your layout (before any other content)
 * 2. Ensure target element has matching id (default: "main-content")
 *
 * @example
 * ```tsx
 * <SkipLink targetId="main-content" />
 * <main id="main-content">...</main>
 * ```
 */
interface SkipLinkProps {
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
   * CSS class name for styling
   */
  className?: string
}

export function SkipLink({
  targetId = 'main-content',
  label = 'Saltar al contenido principal',
  className = '',
}: SkipLinkProps) {
  const [isFocused, setIsFocused] = useState(false)

  // Handle keyboard focus for better visibility
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)

    if (target) {
      target.setAttribute('tabindex', '-1')
      target.focus()

      // Remove tabindex after blur to allow normal tab flow
      const handleBlur = () => {
        target.removeAttribute('tabindex')
        target.removeEventListener('blur', handleBlur)
      }
      target.addEventListener('blur', handleBlur)
    }
  }

  const baseStyles = `
    sr-only
    ${isFocused ? 'not-sr-only' : ''}
    absolute
    top-4
    left-4
    z-[9999]
    px-4
    py-3
    bg-white
    text-blue-600
    font-semibold
    rounded-lg
    shadow-lg
    border-2
    border-blue-600
    focus:outline-none
    focus:ring-4
    focus:ring-blue-300
    transition-all
    duration-200
  `

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`${baseStyles} ${className}`.trim()}
      aria-label={label}
    >
      {label}
    </a>
  )
}

/**
 * Utility to ensure an element can receive focus for skip links
 * Apply this to your main content area
 */
export function MainContent({
  id = 'main-content',
  children,
  className = '',
}: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      id={id}
      className={className}
      tabIndex={-1}
      aria-label="Contenido principal"
    >
      {children}
    </main>
  )
}

/**
 * Multiple skip links for complex layouts
 * Use when you have multiple important sections
 */
export function SkipLinks({
  links,
}: {
  links: Array<{ id: string; label: string }>
}) {
  const [isFocused, setIsFocused] = useState(false)

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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.getElementById(targetId)

    if (target) {
      target.setAttribute('tabindex', '-1')
      target.focus()

      const handleBlur = () => {
        target.removeAttribute('tabindex')
        target.removeEventListener('blur', handleBlur)
      }
      target.addEventListener('blur', handleBlur)
    }
  }

  if (!isFocused) {
    return (
      <div className="sr-only" aria-label="Enlaces de navegación rápida">
        {links.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => handleClick(e, link.id)}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-3 focus:bg-white focus:text-blue-600 focus:font-semibold focus:rounded-lg focus:shadow-lg focus:border-2 focus:border-blue-600"
            aria-label={link.label}
          >
            {link.label}
          </a>
        ))}
      </div>
    )
  }

  return (
    <nav
      className="fixed top-4 left-4 z-[9999] flex flex-col gap-2 bg-white p-2 rounded-lg shadow-lg border-2 border-blue-600"
      aria-label="Navegación rápida"
    >
      <span className="text-xs font-semibold text-gray-600 px-2">Ir a:</span>
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(e) => handleClick(e, link.id)}
          className="px-4 py-2 text-blue-600 font-semibold rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={link.label}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
