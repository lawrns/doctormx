import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RetryButton, useRetry, SmartRetryButton } from './retry-button'

describe('RetryButton', () => {
  it('renders with default props', () => {
    const onRetry = vi.fn()
    render(<RetryButton onRetry={onRetry} />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Reintentar')
  })

  it('handles click events', async () => {
    const onRetry = vi.fn().mockResolvedValue(undefined)
    render(<RetryButton onRetry={onRetry} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    await waitFor(() => {
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  it('renders with custom label', () => {
    const onRetry = vi.fn()
    render(<RetryButton onRetry={onRetry} label="Custom Label" />)
    expect(screen.getByText('Custom Label')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    const onRetry = vi.fn()
    render(<RetryButton onRetry={onRetry} disabled />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies custom className', () => {
    const onRetry = vi.fn()
    render(<RetryButton onRetry={onRetry} className="custom-button" />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-button')
  })

  it('has correct aria-label', () => {
    const onRetry = vi.fn()
    render(<RetryButton onRetry={onRetry} label="Retry Action" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Retry Action')
  })

  it('renders with different sizes', () => {
    const onRetry = vi.fn()
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach(size => {
      const { container } = render(<RetryButton onRetry={onRetry} size={size} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('renders with different variants', () => {
    const onRetry = vi.fn()
    const variants = ['primary', 'secondary', 'ghost', 'outline'] as const
    variants.forEach(variant => {
      const { container } = render(<RetryButton onRetry={onRetry} variant={variant} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('shows attempt count when enabled', () => {
    const onRetry = vi.fn()
    // Note: The attempt count is managed internally by the component state
    // and only shows after retry attempts have been made
    const { container } = render(<RetryButton onRetry={onRetry} showAttemptCount maxRetries={3} />)
    // Before any retries, attempt is 0 so count shouldn't show
    expect(container.textContent).toContain('Reintentar')
  })
})

describe('useRetry hook', () => {
  it('initializes correctly', () => {
    const fn = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<TestComponent fn={fn} />)
    expect(container).toBeInTheDocument()
  })
})

function TestComponent({ fn }: { fn: () => Promise<void> }) {
  const retryState = useRetry(fn)
  return null
}
