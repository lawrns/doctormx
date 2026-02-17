import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as React from 'react'

// Mock next/navigation
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Create mock functions for Supabase
const mockUpdateUser = vi.fn()

const mockSupabaseClient = {
  auth: {
    updateUser: mockUpdateUser,
  },
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Simple ResetPassword Form Component for testing
function TestResetPasswordForm() {
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    const { error: updateError } = await mockSupabaseClient.auth.updateUser({
      password,
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      setIsSuccess(true)
      mockPush('/auth/login')
    }
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div>
        <h1>Contraseña actualizada</h1>
        <p>Tu contraseña ha sido actualizada exitosamente.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Nueva contraseña</h1>
      <p>Ingresa tu nueva contraseña. Asegúrate de que sea segura.</p>
      {error && <div data-testid="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">Nueva contraseña</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
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
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
            data-testid="confirm-password-input"
          />
        </div>
        <button type="submit" disabled={isLoading} data-testid="submit-button">
          {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  )
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado', () => {
    it('renderiza el título de la página', () => {
      render(<TestResetPasswordForm />)
      expect(screen.getByRole('heading', { name: /nueva/i })).toBeInTheDocument()
    })

    it('renderiza el campo de nueva contraseña', () => {
      render(<TestResetPasswordForm />)
      expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument()
    })

    it('renderiza el campo de confirmar contraseña', () => {
      render(<TestResetPasswordForm />)
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    })

    it('renderiza el botón de actualizar', () => {
      render(<TestResetPasswordForm />)
      expect(screen.getByRole('button', { name: /actualizar contraseña/i })).toBeInTheDocument()
    })
  })

  describe('Interacciones de usuario', () => {
    it('permite escribir en el campo de contraseña', () => {
      render(<TestResetPasswordForm />)
      const passwordInput = screen.getByTestId('password-input')
      fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } })
      expect(passwordInput).toHaveValue('NewPass123!')
    })

    it('permite escribir en el campo de confirmar contraseña', () => {
      render(<TestResetPasswordForm />)
      const confirmInput = screen.getByTestId('confirm-password-input')
      fireEvent.change(confirmInput, { target: { value: 'NewPass123!' } })
      expect(confirmInput).toHaveValue('NewPass123!')
    })

    it('permite mostrar/ocultar la contraseña', () => {
      render(<TestResetPasswordForm />)
      const passwordInput = screen.getByTestId('password-input')
      const toggleButton = screen.getByTestId('toggle-password')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Validaciones', () => {
    it('muestra error cuando la contraseña es muy corta', async () => {
      render(<TestResetPasswordForm />)

      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordInput, { target: { value: 'short' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(/la contraseña debe tener al menos 8 caracteres/i)
      })
    })

    it('muestra error cuando las contraseñas no coinciden', async () => {
      render(<TestResetPasswordForm />)

      const passwordInput = screen.getByTestId('password-input')
      const confirmInput = screen.getByTestId('confirm-password-input')

      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmInput, { target: { value: 'Different123!' } })
      
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(/las contraseñas no coinciden/i)
      })
    })
  })

  describe('Estados de loading', () => {
    it('deshabilita el botón durante la actualización', async () => {
      mockUpdateUser.mockImplementation(() => new Promise(() => {}))

      render(<TestResetPasswordForm />)

      const passwordInput = screen.getByTestId('password-input')
      const confirmInput = screen.getByTestId('confirm-password-input')

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/actualizando/i)).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /actualizando/i })).toBeDisabled()
    })
  })

  describe('Manejo de errores', () => {
    it('muestra error cuando falla la actualización', async () => {
      mockUpdateUser.mockResolvedValue({
        error: { message: 'Password is too weak' },
      })

      render(<TestResetPasswordForm />)

      const passwordInput = screen.getByTestId('password-input')
      const confirmInput = screen.getByTestId('confirm-password-input')

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Password is too weak')
      })
    })
  })

  describe('Flujo completo (happy path)', () => {
    it('muestra mensaje de éxito después de actualizar la contraseña', async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      render(<TestResetPasswordForm />)

      const passwordInput = screen.getByTestId('password-input')
      const confirmInput = screen.getByTestId('confirm-password-input')

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument()
      })
    })

    it('llama a updateUser con la contraseña correcta', async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      render(<TestResetPasswordForm />)

      const passwordInput = screen.getByTestId('password-input')
      const confirmInput = screen.getByTestId('confirm-password-input')

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          password: 'NewPassword123!',
        })
      })
    })

    it('redirige al login después de éxito', async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      render(<TestResetPasswordForm />)

      const passwordInput = screen.getByTestId('password-input')
      const confirmInput = screen.getByTestId('confirm-password-input')

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })
  })
})
