'use client'

import { ReactNode, useEffect, useCallback, useRef } from 'react'
import { useFocusTrap } from '@/components/ui/accessibility/focus-trap'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  /**
   * ID for the modal dialog (for accessibility)
   * @default "modal-dialog"
   */
  id?: string
  /**
   * Additional ARIA description
   */
  description?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  id = 'modal-dialog',
  description,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus trap for accessibility
  useFocusTrap({
    containerRef: modalRef,
    isActive: isOpen,
    onEscape: onClose,
  })

  // Handle body scroll and focus management
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      // Focus the modal on open
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstFocusable = focusableElements?.[0] as HTMLElement
      firstFocusable?.focus()
    }

    return () => {
      // Restore body scroll
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  if (!isOpen) return null

  const titleId = `${id}-title`
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-[rgba(15,23,42,0.2)] backdrop-blur-sm animate-fade-in"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        id={id}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-[var(--color-surface)] rounded-lg shadow-xl interactive
          animate-fade-in-up
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={descriptionId}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
            {title && (
              <h3
                id={titleId}
                className="text-lg font-semibold text-[var(--color-text-primary)] display-text"
              >
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] interactive focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Cerrar diálogo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </header>
        )}

        {/* Content */}
        {description && (
          <p id={descriptionId} className="sr-only">
            {description}
          </p>
        )}
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}

// Modal Footer helper for consistent button layouts
export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-4 pt-4 border-t border-[var(--border-default)]">
      {children}
    </div>
  )
}
