'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Live Region Component - WCAG 2.1 AA Compliant
 *
 * Provides ARIA live regions for screen reader announcements.
 * Live regions allow dynamic content changes to be announced without focus.
 *
 * WCAG 2.1 Requirements:
 * - 2.2.1 Timing Adjustable: Users can control time limits
 * - 4.1.3 Status Messages: Content updates are announced
 *
 * @example
 * ```tsx
 * // Polite announcement (doesn't interrupt)
 * <LiveRegion message="Se guardaron los cambios" />
 *
 * // Assertive announcement (interrupts immediately)
 * <LiveRegion message="Error: No se pudo guardar" role="alert" />
 *
 * // For dynamic updates
 * const [announcement, setAnnouncement] = useState('')
 * <LiveRegion message={announcement} />
 * ```
 */

export type LiveRegionRole = 'status' | 'alert' | 'log' | 'progressbar'

interface LiveRegionProps {
  /**
   * The message to announce
   * Changes trigger screen reader announcement
   */
  message: string

  /**
   * ARIA role for the live region
   * - status: Polite announcements (default)
   * - alert: Assertive/interrupting announcements
   * - log: Chat-like log history
   * - progressbar: Progress updates
   */
  role?: LiveRegionRole

  /**
   * When to announce
   * - polite: Wait until user is idle (default for status)
   * - assertive: Interrupt immediately (default for alert)
   */
  politeness?: 'polite' | 'assertive'

  /**
   * Whether the message is visible visually
   * Default: false (screen reader only)
   */
  isVisible?: boolean

  /**
   * CSS class for visual display when isVisible is true
   */
  className?: string

  /**
   * Additional aria properties
   */
  ariaLive?: 'polite' | 'assertive'
  ariaAtomic?: boolean
  ariaRelevant?: string
}

/**
 * Primary Live Region Component
 */
export function LiveRegion({
  message,
  role = 'status',
  politeness,
  isVisible = false,
  className = '',
  ariaLive,
  ariaAtomic = true,
  ariaRelevant = 'additions text',
}: LiveRegionProps) {
  const announcementRef = useRef<HTMLDivElement>(null)
  const [previousMessage, setPreviousMessage] = useState(message)

  // Determine aria-live based on role or explicit politeness
  const getAriaLive = (): 'polite' | 'assertive' => {
    if (ariaLive) return ariaLive
    if (politeness) return politeness
    return role === 'alert' ? 'assertive' : 'polite'
  }

  // Clear message after announcement (for repeated announcements)
  useEffect(() => {
    if (!message) return

    // Small delay to ensure screen reader picks up the change
    const timer = setTimeout(() => {
      setPreviousMessage(message)
    }, 100)

    return () => clearTimeout(timer)
  }, [message])

  // Announce message changes
  useEffect(() => {
    if (!announcementRef.current || !message) return

    // Force content update for screen readers
    announcementRef.current.textContent = message

    // Clear after announcement to allow re-announcement of same message
    if (message === previousMessage) {
      const timer = setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = ''
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [message, previousMessage])

  const visibleClasses = isVisible
    ? `${className}`
    : 'sr-only'

  return (
    <div
      ref={announcementRef}
      role={role}
      aria-live={getAriaLive()}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
      className={visibleClasses}
      aria-label={isVisible ? undefined : message}
    >
      {isVisible ? message : previousMessage || message}
    </div>
  )
}

/**
 * Hook for programmatic announcements
 * Use this when you need to announce from event handlers
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { announce, AnnouncementComponent } = useLiveRegion()
 *
 *   const handleClick = () => {
 *     announce('El archivo se subió correctamente')
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleClick}>Subir archivo</button>
 *       <AnnouncementComponent />
 *     </>
 *   )
 * }
 * ```
 */
export interface UseLiveRegionReturn {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, options?: { role?: LiveRegionRole; politeness?: 'polite' | 'assertive' }) => void

  /**
   * Component to render in your JSX
   */
  AnnouncementComponent: () => JSX.Element

  /**
   * Clear current announcement
   */
  clear: () => void
}

export function useLiveRegion(defaultRole: LiveRegionRole = 'status'): UseLiveRegionReturn {
  const [announcement, setAnnouncement] = useState('')
  const [role, setRole] = useState<LiveRegionRole>(defaultRole)
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite')

  const announce = (
    message: string,
    options?: { role?: LiveRegionRole; politeness?: 'polite' | 'assertive' }
  ) => {
    setRole(options?.role || defaultRole)
    setPoliteness(options?.politeness || 'polite')
    setAnnouncement(message)
  }

  const clear = () => {
    setAnnouncement('')
  }

  const AnnouncementComponent = () => (
    <LiveRegion
      message={announcement}
      role={role}
      politeness={politeness}
    />
  )

  return { announce, AnnouncementComponent, clear }
}

/**
 * Multiple independent live regions for complex scenarios
 */
export function MultiLiveRegion({
  regions,
}: {
  regions: Array<{
    id: string
    message: string
    role?: LiveRegionRole
  }>
}) {
  return (
    <>
      {regions.map((region) => (
        <div
          key={region.id}
          role={region.role || 'status'}
          aria-live={region.role === 'alert' ? 'assertive' : 'polite'}
          aria-atomic
          className="sr-only"
        >
          {region.message}
        </div>
      ))}
    </>
  )
}

/**
 * Live region specifically for form validation errors
 * Automatically announces errors when they appear
 */
interface FormErrorLiveRegionProps {
  /**
   * Error message to announce
   * Empty string or undefined means no error
   */
  error: string

  /**
   * ID of the form input this error relates to
   * Used for aria-describedby
   */
  htmlFor?: string

  /**
   * Whether to show the error visually
   */
  isVisible?: boolean

  /**
   * CSS class for visual display
   */
  className?: string
}

export function FormErrorLiveRegion({
  error,
  htmlFor,
  isVisible = false,
  className = '',
}: FormErrorLiveRegionProps) {
  const errorId = `${htmlFor}-error`

  useEffect(() => {
    if (!error || !htmlFor) return

    // Automatically associate error with input
    const input = document.getElementById(htmlFor)
    if (input) {
      input.setAttribute('aria-describedby', errorId)
      input.setAttribute('aria-invalid', 'true')

      return () => {
        input.removeAttribute('aria-describedby')
        input.removeAttribute('aria-invalid')
      }
    }
  }, [error, htmlFor, errorId])

  if (!error) return null

  return (
    <div
      id={errorId}
      role="alert"
      aria-live="assertive"
      aria-atomic
      className={isVisible ? className : 'sr-only'}
    >
      {error}
    </div>
  )
}

/**
 * Live region for loading states and progress
 */
interface LoadingAnnouncementProps {
  /**
   * Current loading message
   */
  message: string

  /**
   * Progress percentage (0-100)
   * Announced as "X por ciento completado"
   */
  progress?: number

  /**
   * Whether loading is complete
   */
  isComplete?: boolean

  /**
   * Completion message
   */
  completeMessage?: string
}

export function LoadingAnnouncement({
  message,
  progress,
  isComplete = false,
  completeMessage = 'Completado',
}: LoadingAnnouncementProps) {
  const announcement = isComplete
    ? completeMessage
    : progress !== undefined
    ? `${message}: ${Math.round(progress)} por ciento completado`
    : message

  return <LiveRegion message={announcement} role={isComplete ? 'status' : 'progressbar'} />
}

/**
 * Context for global announcements from anywhere in the app
 */
import { createContext, useContext } from 'react'

interface GlobalLiveRegionContextValue {
  announce: (message: string, options?: { role?: LiveRegionRole }) => void
  announceSuccess: (message: string) => void
  announceError: (message: string) => void
}

const GlobalLiveRegionContext = createContext<GlobalLiveRegionContextValue | null>(null)

/**
 * Provider for global live region
 * Place at the root of your app
 */
export function GlobalLiveRegionProvider({ children }: { children: React.ReactNode }) {
  const { announce, AnnouncementComponent } = useLiveRegion()

  const announceSuccess = (message: string) => {
    announce(message, { role: 'status' })
  }

  const announceError = (message: string) => {
    announce(`Error: ${message}`, { role: 'alert' })
  }

  return (
    <GlobalLiveRegionContext.Provider value={{ announce, announceSuccess, announceError }}>
      {children}
      <AnnouncementComponent />
    </GlobalLiveRegionContext.Provider>
  )
}

/**
 * Hook to use global live region
 * Use this to announce from anywhere in the app
 */
export function useGlobalLiveRegion() {
  const context = useContext(GlobalLiveRegionContext)

  if (!context) {
    throw new Error('useGlobalLiveRegion must be used within GlobalLiveRegionProvider')
  }

  return context
}
