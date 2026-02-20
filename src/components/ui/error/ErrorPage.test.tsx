import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorPage } from './ErrorPage'

describe('ErrorPage', () => {
  it('renders with default props', () => {
    render(<ErrorPage title="Error Occurred" />)
    expect(screen.getByText('Error Occurred')).toBeInTheDocument()
  })

  it('renders with default description', () => {
    render(<ErrorPage title="Error" />)
    expect(screen.getByText(/Lo sentimos, ha ocurrido un error/)).toBeInTheDocument()
  })

  it('renders with custom description', () => {
    render(<ErrorPage title="Error" description="Custom description" />)
    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })

  it('renders with reset button', () => {
    const reset = vi.fn()
    render(<ErrorPage title="Error" reset={reset} />)
    const button = screen.getByText('Intentar de nuevo')
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(reset).toHaveBeenCalled()
  })

  it('renders different variants', () => {
    const variants = ['default', 'medical', 'doctor-portal', 'admin', 'auth', 'patient'] as const
    variants.forEach(variant => {
      const { container } = render(
        <ErrorPage title="Error" variant={variant} />
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('renders with custom primary action', () => {
    render(
      <ErrorPage
        title="Error"
        primaryAction={{ label: 'Go Home', href: '/' }}
      />
    )
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })

  it('renders with custom secondary action', () => {
    render(
      <ErrorPage
        title="Error"
        secondaryAction={{ label: 'Help', href: '/help' }}
      />
    )
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('renders back link by default', () => {
    render(<ErrorPage title="Error" />)
    expect(screen.getByText('Volver al Inicio')).toBeInTheDocument()
  })

  it('hides back link when showBackLink is false', () => {
    render(<ErrorPage title="Error" showBackLink={false} />)
    expect(screen.queryByText('Volver al Inicio')).not.toBeInTheDocument()
  })

  it('renders doctor-portal specific actions', () => {
    render(<ErrorPage title="Error" variant="doctor-portal" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Ayuda')).toBeInTheDocument()
  })

  it('renders admin specific actions', () => {
    render(<ErrorPage title="Error" variant="admin" />)
    expect(screen.getByText('Panel Admin')).toBeInTheDocument()
  })

  it('renders auth specific actions', () => {
    render(<ErrorPage title="Error" variant="auth" />)
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
  })

  it('renders patient specific actions', () => {
    render(<ErrorPage title="Error" variant="patient" />)
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
  })

  it('renders support info for doctor-portal variant', () => {
    render(<ErrorPage title="Error" variant="doctor-portal" />)
    expect(screen.getByText(/Si el problema persiste/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ErrorPage title="Error" className="custom-error" />)
    const container = screen.getByText('Error').closest('div[class*="min-h-screen"]')
    expect(container).toHaveClass('custom-error')
  })
})
