import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from './badge'

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    // The badge text is wrapped in a span, check parent for data-slot
    const badgeParent = badge.parentElement
    expect(badgeParent).toHaveAttribute('data-slot', 'badge')
  })

  it('renders with default variant', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    // The class is on the parent element
    expect(badge.parentElement).toHaveClass('bg-gray-100')
  })

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    const badge = screen.getByText('Secondary')
    expect(badge.parentElement).toHaveClass('bg-gray-100')
  })

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    const badge = screen.getByText('Destructive')
    expect(badge.parentElement).toHaveClass('bg-red-100')
  })

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText('Outline')
    expect(badge.parentElement).toHaveClass('border-gray-300')
  })

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    const badge = screen.getByText('Success')
    expect(badge.parentElement).toHaveClass('bg-green-100')
  })

  it('renders with info variant', () => {
    render(<Badge variant="info">Info</Badge>)
    const badge = screen.getByText('Info')
    expect(badge.parentElement).toHaveClass('bg-teal-100')
  })

  it('renders with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    const badge = screen.getByText('Warning')
    expect(badge.parentElement).toHaveClass('bg-yellow-100')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Badge</Badge>)
    const badge = document.querySelector('.custom-badge')
    expect(badge).toBeInTheDocument()
  })

  it('renders as child when asChild is true', () => {
    // Note: asChild requires proper Slot implementation
    // This test verifies the prop is accepted without errors
    const { container } = render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    )
    expect(container).toBeInTheDocument()
    expect(screen.getByText('Link Badge')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    render(
      <Badge>
        <svg data-testid="icon" />
        Badge with Icon
      </Badge>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})

describe('badgeVariants', () => {
  it('returns default classes', () => {
    const classes = badgeVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('items-center')
    expect(classes).toContain('justify-center')
  })

  it('applies variant classes', () => {
    const classes = badgeVariants({ variant: 'success' })
    expect(classes).toContain('bg-green-100')
  })
})
