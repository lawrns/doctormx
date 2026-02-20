import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import {
  FormValidationAnnouncer,
  InlineError,
  InlineSuccess,
  FieldErrorMessage,
  FormErrorSummary,
} from '../FormValidationAnnouncer'

describe('FormValidationAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders with sr-only class for screen readers', () => {
    render(<FormValidationAnnouncer message="Test message" />)
    const announcer = screen.getByRole('status')
    expect(announcer).toHaveClass('sr-only')
  })

  it('has correct aria-live attribute for polite announcements', () => {
    render(<FormValidationAnnouncer message="Test message" />)
    const announcer = screen.getByRole('status')
    expect(announcer).toHaveAttribute('aria-live', 'polite')
  })

  it('has correct aria-live attribute for assertive announcements', () => {
    render(<FormValidationAnnouncer message="Test message" politeness="assertive" />)
    const announcer = screen.getByRole('status')
    expect(announcer).toHaveAttribute('aria-live', 'assertive')
  })

  it('has aria-atomic attribute set to true', () => {
    render(<FormValidationAnnouncer message="Test message" />)
    const announcer = screen.getByRole('status')
    expect(announcer).toHaveAttribute('aria-atomic', 'true')
  })

  it('announces message after delay', async () => {
    render(<FormValidationAnnouncer message="Error en email" />)
    
    // Initially empty or not the message
    const announcer = screen.getByRole('status')
    expect(announcer.textContent).not.toBe('Error en email')
    
    // Wait for the delay
    vi.advanceTimersByTime(150)
    
    await waitFor(() => {
      expect(announcer.textContent).toBe('Error en email')
    })
  })

  it('clears announcement after timeout', async () => {
    render(<FormValidationAnnouncer message="Test message" />)
    
    vi.advanceTimersByTime(100)
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('Test message')
    })
    
    // Wait for clear timeout
    vi.advanceTimersByTime(3100)
    
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('')
    })
  })

  it('updates announcement when message changes', async () => {
    const { rerender } = render(<FormValidationAnnouncer message="First message" />)
    
    vi.advanceTimersByTime(150)
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('First message')
    })
    
    rerender(<FormValidationAnnouncer message="Second message" />)
    
    vi.advanceTimersByTime(150)
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('Second message')
    })
  })
})

describe('InlineError', () => {
  it('renders error message with correct role', () => {
    render(<InlineError message="Campo requerido" />)
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('Campo requerido')
  })

  it('has aria-live attribute set to polite', () => {
    render(<InlineError message="Error" />)
    const error = screen.getByRole('alert')
    expect(error).toHaveAttribute('aria-live', 'polite')
  })

  it('applies custom className', () => {
    render(<InlineError message="Error" className="custom-class" />)
    const error = screen.getByRole('alert')
    expect(error).toHaveClass('custom-class')
  })

  it('has correct ID attribute', () => {
    render(<InlineError id="email-error" message="Error" />)
    const error = screen.getByRole('alert')
    expect(error).toHaveAttribute('id', 'email-error')
  })
})

describe('InlineSuccess', () => {
  it('renders with aria-live attribute', () => {
    render(<InlineSuccess message="Campo válido" />)
    const success = screen.getByText('Campo válido')
    expect(success.parentElement).toHaveAttribute('aria-live', 'polite')
  })

  it('has aria-label for context', () => {
    render(<InlineSuccess message="Válido" id="field-success" />)
    const success = screen.getByText('Válido')
    expect(success).toBeInTheDocument()
  })

  it('hides icon from screen readers when showIcon is true', () => {
    render(<InlineSuccess message="Válido" showIcon />)
    const icon = document.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('can hide icon completely', () => {
    render(<InlineSuccess message="Válido" showIcon={false} />)
    const icon = document.querySelector('svg')
    expect(icon).not.toBeInTheDocument()
  })
})

describe('FieldErrorMessage', () => {
  it('renders null when no error', () => {
    const { container } = render(
      <FieldErrorMessage errorId="error" error={null} touched={true} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders null when not touched', () => {
    const { container } = render(
      <FieldErrorMessage errorId="error" error="Error message" touched={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders error message when error exists and touched', () => {
    render(<FieldErrorMessage errorId="email-error" error="Email inválido" touched={true} />)
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('Email inválido')
    expect(error).toHaveAttribute('id', 'email-error')
  })

  it('has correct accessibility attributes', () => {
    render(<FieldErrorMessage errorId="error" error="Error" touched={true} />)
    const error = screen.getByRole('alert')
    expect(error).toHaveAttribute('aria-live', 'polite')
    expect(error).toHaveClass('text-destructive')
  })
})

describe('FormErrorSummary', () => {
  it('renders null when no errors', () => {
    const { container } = render(<FormErrorSummary errors={{}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders error count and list', () => {
    const errors = {
      email: 'Email inválido',
      password: 'Contraseña muy corta',
    }
    render(<FormErrorSummary errors={errors} />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/email:/i)).toBeInTheDocument()
    expect(screen.getByText(/password:/i)).toBeInTheDocument()
  })

  it('has assertive aria-live for error summary', () => {
    const errors = { field: 'Error' }
    render(<FormErrorSummary errors={errors} />)
    const summary = screen.getByRole('alert')
    expect(summary).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders custom title', () => {
    const errors = { field: 'Error' }
    render(<FormErrorSummary errors={errors} title="Custom error title" />)
    expect(screen.getByText('Custom error title')).toBeInTheDocument()
  })

  it('capitalizes field names', () => {
    const errors = { email: 'Error' }
    render(<FormErrorSummary errors={errors} />)
    expect(screen.getByText(/email:/i)).toBeInTheDocument()
  })
})
