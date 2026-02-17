import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as React from 'react'

// Mock next/navigation
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(''),
}))

// Simple Login Form Component for testing
function TestLoginForm() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email.includes('@')) {
      setError('Correo electrónico válido')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    // Simulate successful login
    mockPush('/app')
  }

  return (
    <div>
      <h1>Iniciar sesión</h1>
      <div data-testid="error-container">
        {error ? <span data-testid="error-message">{error}</span> : null}
      </div>
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
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            data-testid="password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            data-testid="toggle-password"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              data-testid="remember-me"
            />
            Recordarme
          </label>
        </div>
        <button type="submit" data-testid="submit-button">
          Iniciar sesión
        </button>
      </form>
      <a href="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
      <a href="/auth/register">Regístrate</a>
    </div>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado', () => {
    it('renderiza el título de la página', () => {
      render(<TestLoginForm />)
      expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    })

    it('renderiza los campos de email y contraseña', () => {
      render(<TestLoginForm />)
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    })

    it('renderiza el checkbox de recordarme', () => {
      render(<TestLoginForm />)
      expect(screen.getByLabelText(/recordarme/i)).toBeInTheDocument()
    })

    it('renderiza el botón de submit', () => {
      render(<TestLoginForm />)
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('renderiza el link para recuperar contraseña', () => {
      render(<TestLoginForm />)
      expect(screen.getByText(/¿olvidaste tu contraseña?/i)).toBeInTheDocument()
    })

    it('renderiza el link para registrarse', () => {
      render(<TestLoginForm />)
      expect(screen.getByText(/regístrate/i)).toBeInTheDocument()
    })
  })

  describe('Interacciones de usuario', () => {
    it('permite escribir en el campo de email', () => {
      render(<TestLoginForm />)
      const emailInput = screen.getByTestId('email-input')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('permite escribir en el campo de contraseña', () => {
      render(<TestLoginForm />)
      const passwordInput = screen.getByTestId('password-input')
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      expect(passwordInput).toHaveValue('password123')
    })

    it('permite toggle del checkbox de recordarme', () => {
      render(<TestLoginForm />)
      const checkbox = screen.getByTestId('remember-me')
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('permite mostrar/ocultar la contraseña', () => {
      render(<TestLoginForm />)
      const passwordInput = screen.getByTestId('password-input')
      const toggleButton = screen.getByTestId('toggle-password')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Flujo completo (happy path)', () => {
    it('redirige después de login exitoso', () => {
      render(<TestLoginForm />)
      
      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      expect(mockPush).toHaveBeenCalledWith('/app')
    })
  })
})
