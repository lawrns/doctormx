import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingOverlay } from './loading-overlay'

describe('LoadingOverlay', () => {
  it('renders with default props', () => {
    render(<LoadingOverlay message="Loading..." />)
    // There are multiple status roles (outer container and spinner), so use getAllByRole
    const overlays = screen.getAllByRole('status')
    expect(overlays.length).toBeGreaterThanOrEqual(1)
  })

  it('renders with custom message', () => {
    render(<LoadingOverlay message="Loading data..." />)
    // The message appears in both the h2 title and sr-only span
    const messages = screen.getAllByText('Loading data...')
    expect(messages.length).toBeGreaterThanOrEqual(1)
  })

  it('has correct aria attributes', () => {
    render(<LoadingOverlay message="Loading..." />)
    // Check for aria-live attribute on one of the status elements
    const overlays = screen.getAllByRole('status')
    const hasAriaLive = overlays.some(el => el.getAttribute('aria-live') === 'polite')
    expect(hasAriaLive).toBe(true)
  })

  it('applies custom className', () => {
    render(<LoadingOverlay message="Loading..." className="custom-overlay" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('custom-overlay')
  })

  it('renders spinner by default', () => {
    render(<LoadingOverlay message="Loading..." />)
    const spinner = document.querySelector('[class*="animate-spin"]')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with progress', () => {
    render(<LoadingOverlay message="Loading..." progress={50} />)
    // With progress, there are two status elements (progress bar + spinner)
    const overlays = screen.getAllByRole('status')
    expect(overlays.length).toBeGreaterThanOrEqual(1)
  })

  it('renders with blur backdrop', () => {
    render(<LoadingOverlay message="Loading..." className="backdrop-blur-sm" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveClass('backdrop-blur-sm')
  })
})
