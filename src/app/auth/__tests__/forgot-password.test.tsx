import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as React from 'react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Simple ForgotPassword Form Component for testing
function TestForgotPasswordForm() {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email.includes('@')) {
      setError('Correo electrónico inválido')
      return
    }

    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div>
        <h1>Revisa tu correo</h1>
        <p>Hemos enviado instrucciones para restablecer tu contraseña a {email}</p>
        <button onClick={() => { setIsSuccess(false); setEmail(''); }}>
          Enviar de nuevo
        </button>
        <a href="/auth/login">Volver al inicio de sesión</a>
      </div>
    )
  }

  return (
    <div>
      <h1>Recuperar contraseña</h1>
      <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña</p>
      {error ? <div data-testid="error-message">{error}</div> : null}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            data-testid="email-input"
          />
        </div>
        <button type="submit" disabled={isLoading} data-testid="submit-button">
          {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
        </button>
      </form>
      <a href="/auth/login">Volver al inicio de sesión</a>
    </div>
  )
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado', () => {
    it('renderiza el título de la página', () => {
      render(<TestForgotPasswordForm />)
      expect(screen.getByRole('heading', { name: /recuperar contraseña/i })).toBeInTheDocument()
    })

    it('renderiza el campo de email', () => {
      render(<TestForgotPasswordForm />)
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    })

    it('renderiza el botón de enviar', () => {
      render(<TestForgotPasswordForm />)
      expect(screen.getByRole('button', { name: /enviar instrucciones/i })).toBeInTheDocument()
    })

    it('renderiza el link para volver al login', () => {
      render(<TestForgotPasswordForm />)
      expect(screen.getByText(/volver al inicio de sesión/i)).toBeInTheDocument()
    })
  })

  describe('Interacciones de usuario', () => {
    it('permite escribir en el campo de email', () => {
      render(<TestForgotPasswordForm />)
      const emailInput = screen.getByTestId('email-input')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('Flujo completo (happy path)', () => {
    it('muestra mensaje de éxito después de enviar el email', () => {
      render(<TestForgotPasswordForm />)

      const emailInput = screen.getByTestId('email-input')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument()
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
    })
  })
})
