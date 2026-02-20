import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from './error-state'

describe('ErrorState', () => {
  it('renders with default props', () => {
    render(<ErrorState />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    render(<ErrorState title="Custom Error Title" />)
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<ErrorState message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    const button = screen.getByText('Intentar de nuevo')
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalled()
  })

  it('renders with custom retry text', () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} retryText="Custom Retry" />)
    expect(screen.getByText('Custom Retry')).toBeInTheDocument()
  })

  it('renders with error code', () => {
    render(<ErrorState errorCode="ERR_001" />)
    expect(screen.getByText('(Código: ERR_001)')).toBeInTheDocument()
  })

  it('renders generic type correctly', () => {
    render(<ErrorState type="generic" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders network type correctly', () => {
    render(<ErrorState type="network" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders notFound type correctly', () => {
    render(<ErrorState type="notFound" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders server type correctly', () => {
    render(<ErrorState type="server" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders permission type correctly', () => {
    render(<ErrorState type="permission" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders timeout type correctly', () => {
    render(<ErrorState type="timeout" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has correct aria-live attribute', () => {
    render(<ErrorState />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })
})
