'use client'

import { useEffect, useRef, RefObject } from 'react'
import { logger } from '@/lib/observability/logger'

/**
 * Focus Trap Hook - WCAG 2.1 AA Compliant
 *
 * Traps keyboard focus within a container (typically a modal or dialog).
 * This is required by WCAG 2.1 (Focus Not Obscured - 2.4.7, and Focus Order - 2.4.3).
 *
 * Features:
 * - Tab/Shift+Tab cycles within container
 * - Escape key triggers callback
 * - Returns focus to trigger element on unmount
 * - Handles dynamically added focusable elements
 *
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null)
 * useFocusTrap({
 *   containerRef: modalRef,
 *   isActive: isOpen,
 *   onEscape: () => setIsOpen(false)
 * })
 * ```
 */

export type FocusableElement = HTMLElement | SVGElement

interface FocusTrapOptions {
  /**
   * Ref to the container element
   */
  containerRef: RefObject<HTMLElement>

  /**
   * Whether the focus trap is active
   */
  isActive: boolean

  /**
   * Callback when Escape key is pressed
   */
  onEscape?: () => void

  /**
   * Callback when focus trap is deactivated
   * Use to restore focus to trigger element
   */
  onDeactivate?: () => void

  /**
   * Element to return focus to when trap is deactivated
   * Defaults to document.activeElement when trap activates
   */
  returnFocusRef?: RefObject<HTMLElement>

  /**
   * Additional elements to consider focusable
   */
  additionalFocusable?: RefObject<HTMLElement>[]
}

/**
 * Get all focusable elements within a container
 * Following WCAG 2.1 focusable elements criteria
 */
function getFocusableElements(container: HTMLElement): FocusableElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'summary',
    'details > summary:first-of-type',
  ].join(', ')

  const focusable = Array.from(
    container.querySelectorAll<FocusableElement>(focusableSelectors)
  )

  // Filter out hidden elements and elements with tabindex="-1"
  return focusable.filter((el) => {
    if (el.getAttribute('tabindex') === '-1') return false
    if (el instanceof HTMLElement) {
      return el.offsetParent !== null || getComputedStyle(el).visibility !== 'hidden'
    }
    return true
  })
}

/**
 * Check if an element is visible for focus
 */
function isElementVisible(el: FocusableElement): boolean {
  if (el instanceof HTMLElement) {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           el.offsetParent !== null
  }
  return true
}

/**
 * Primary Focus Trap Hook
 */
export function useFocusTrap({
  containerRef,
  isActive,
  onEscape,
  onDeactivate,
  returnFocusRef,
  additionalFocusable = [],
}: FocusTrapOptions) {
  // Store the element that had focus before trap activated
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current

    // Store current focus element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the first focusable element in container
    const focusableElements = getFocusableElements(container)
    const firstFocusable = focusableElements.find(isElementVisible)

    if (firstFocusable) {
      // Small delay to ensure animations complete
      setTimeout(() => {
        firstFocusable.focus()
      }, 50)
    } else {
      logger.warn('No focusable elements found in focus trap container')
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape?.()
        return
      }

      if (e.key !== 'Tab') return

      e.preventDefault()

      // Get current focusable elements (re-check for dynamic elements)
      const additionalElements: FocusableElement[] = []

      for (const ref of additionalFocusable) {
        const el = ref.current
        if (el && isElementVisible(el)) {
          additionalElements.push(el as FocusableElement)
        }
      }

      const allFocusable: FocusableElement[] = [
        ...getFocusableElements(container),
        ...additionalElements,
      ]

      const visibleFocusable = allFocusable.filter(isElementVisible)

      if (visibleFocusable.length === 0) return

      const currentIndex = visibleFocusable.indexOf(
        document.activeElement as FocusableElement
      )

      let nextIndex: number

      if (e.shiftKey) {
        // Shift+Tab: go to previous element, wrap to last
        nextIndex = currentIndex <= 0 ? visibleFocusable.length - 1 : currentIndex - 1
      } else {
        // Tab: go to next element, wrap to first
        nextIndex = currentIndex === -1 || currentIndex >= visibleFocusable.length - 1
          ? 0
          : currentIndex + 1
      }

      visibleFocusable[nextIndex]?.focus()
    }

    // Prevent focus from leaving the container via mouse
    const handleFocusIn = (e: FocusEvent) => {
      if (!container.contains(e.target as Node)) {
        // Focus is leaving the container, bring it back
        const focusableElements = getFocusableElements(container)
        const firstVisible = focusableElements.find(isElementVisible)
        firstVisible?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)

      // Restore focus when trap is deactivated
      const returnToElement = returnFocusRef?.current || previousActiveElement.current
      if (returnToElement && isElementVisible(returnToElement)) {
        returnToElement.focus()
      }

      onDeactivate?.()
    }
  }, [isActive, containerRef, onEscape, onDeactivate, returnFocusRef, additionalFocusable])
}

/**
 * Focus Trap Component for direct use
 * Wraps children and traps focus when active
 */
interface FocusTrapProps {
  isActive: boolean
  onEscape?: () => void
  onDeactivate?: () => void
  returnFocusRef?: RefObject<HTMLElement>
  children: React.ReactNode
  className?: string
}

export function FocusTrap({
  isActive,
  onEscape,
  onDeactivate,
  returnFocusRef,
  children,
  className = '',
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useFocusTrap({
    containerRef,
    isActive,
    onEscape,
    onDeactivate,
    returnFocusRef,
  })

  return (
    <div
      ref={containerRef}
      className={className}
      role={isActive ? 'dialog' : undefined}
      aria-modal={isActive}
    >
      {children}
    </div>
  )
}

/**
 * Stackable Focus Trap for nested modals
 * Manages multiple focus traps in a stack
 */
class FocusTrapStack {
  private static instance: FocusTrapStack
  private stack: Array<{
    container: HTMLElement
    onEscape: (() => void) | undefined
  }> = []

  private constructor() {}

  static getInstance(): FocusTrapStack {
    if (!FocusTrapStack.instance) {
      FocusTrapStack.instance = new FocusTrapStack()
    }
    return FocusTrapStack.instance
  }

  push(container: HTMLElement, onEscape?: () => void) {
    this.stack.push({ container, onEscape })
  }

  pop() {
    return this.stack.pop()
  }

  top() {
    return this.stack[this.stack.length - 1]
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      const topTrap = this.top()
      if (topTrap?.onEscape) {
        topTrap.onEscape()
      }
    }
  }
}

/**
 * Hook for managing stackable focus traps (nested modals)
 */
export function useStackableFocusTrap(options: FocusTrapOptions) {
  const stackRef = useRef<FocusTrapStack>(FocusTrapStack.getInstance())

  useEffect(() => {
    if (!options.isActive || !options.containerRef.current) return

    const container = options.containerRef.current
    const stack = stackRef.current

    stack.push(container, options.onEscape)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if this is the top of the stack
      if (stack.top()?.container === container) {
        if (e.key === 'Escape') {
          e.preventDefault()
          options.onEscape?.()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      stack.pop()
    }
  }, [options.isActive, options.containerRef, options.onEscape])
}

