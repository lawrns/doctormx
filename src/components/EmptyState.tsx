import { Button } from './Button'
import Link from 'next/link'

type EmptyStateVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  variant?: EmptyStateVariant
  tips?: string[]
}

const subtleIcons: Record<EmptyStateVariant, React.ReactNode> = {
  default: (
    <svg className="w-12 h-12 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  success: (
    <svg className="w-12 h-12 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-12 h-12 text-[#ca8a04]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-12 h-12 text-[#dc2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-12 h-12 text-[var(--color-accent-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  tips
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6">
      {/* Subtle icon - no colored backgrounds */}
      <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
        {icon || subtleIcons[variant]}
      </div>

      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
          {description}
        </p>
      )}

      {tips && tips.length > 0 && (
        <div className="max-w-md mx-auto mb-6 text-left bg-[var(--color-surface-elevated)] rounded-lg p-4">
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
            💡 Consejos:
          </p>
          <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-[var(--color-accent-500)] mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button variant="primary">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={action.onClick} variant="primary">
              {action.label}
            </Button>
          )
        )}

        {secondaryAction && secondaryAction.href && (
          <Link href={secondaryAction.href}>
            <Button variant="secondary">
              {secondaryAction.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
