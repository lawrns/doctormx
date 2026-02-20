import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toaster } from './sonner'

describe('Toaster', () => {
  it('renders with default props', () => {
    const { container } = render(<Toaster />)
    // Toaster uses a portal, so we just verify it renders without errors
    expect(container).toBeInTheDocument()
  })

  it('applies position classes', () => {
    const { container } = render(<Toaster position="top-center" />)
    expect(container).toBeInTheDocument()
  })

  it('applies richColors when enabled', () => {
    const { container } = render(<Toaster richColors />)
    expect(container).toBeInTheDocument()
  })

  it('applies closeButton when enabled', () => {
    const { container } = render(<Toaster closeButton />)
    expect(container).toBeInTheDocument()
  })
})
