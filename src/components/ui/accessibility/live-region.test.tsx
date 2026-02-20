import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveRegion } from './live-region'

describe('LiveRegion', () => {
  it('renders with default props', () => {
    render(<LiveRegion message="Update message" />)
    const region = screen.getByRole('status')
    expect(region).toBeInTheDocument()
  })

  it('renders with polite politeness', () => {
    render(<LiveRegion message="Polite message" />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('renders with assertive politeness', () => {
    render(<LiveRegion message="Assertive message" role="alert" />)
    const region = screen.getByRole('alert')
    expect(region).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders with atomic true', () => {
    render(<LiveRegion message="Atomic message" />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-atomic', 'true')
  })

  it('renders with relevant additions text', () => {
    render(<LiveRegion message="Relevant message" />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-relevant', 'additions text')
  })

  it('applies custom className when visible', () => {
    render(<LiveRegion message="Message" isVisible className="custom-region" />)
    const region = screen.getByRole('status')
    expect(region).toHaveClass('custom-region')
  })

  it('has sr-only class for invisible announcements', () => {
    render(<LiveRegion message="Screen reader only" />)
    const region = screen.getByRole('status')
    expect(region).toHaveClass('sr-only')
  })
})
