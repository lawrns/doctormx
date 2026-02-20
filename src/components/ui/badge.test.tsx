import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from './badge'

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Badge Content</Badge>)
    const badge = screen.getByText('Badge Content')
    expect(badge).toBeInTheDocument()
    expect(badge.parentElement).toHaveAttribute('data-slot', 'badge')
  })

  it('renders with default variant', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
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

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Badge</Badge>)
    const badge = document.querySelector('.custom-badge')
    expect(badge).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<Badge ref={ref}>Badge</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current).toHaveAttribute('data-slot', 'badge')
  })
})

describe('badgeVariants', () => {
  it('returns default classes', () => {
    const classes = badgeVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('items-center')
  })

  it('applies variant classes', () => {
    const classes = badgeVariants({ variant: 'secondary' })
    expect(classes).toContain('bg-gray-100')
  })
})
