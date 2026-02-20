import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './spinner'

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Cargando')
  })

  it('applies custom className', () => {
    render(<Spinner className="custom-spinner" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-spinner')
  })

  it('renders with custom size', () => {
    render(<Spinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with sm size', () => {
    render(<Spinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('renders sr-only text', () => {
    render(<Spinner />)
    const srText = screen.getByText('Cargando...')
    expect(srText).toHaveClass('sr-only')
  })
})
