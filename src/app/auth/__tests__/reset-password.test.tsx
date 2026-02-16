import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ResetPasswordPage from '../reset-password/page'

// Mock next/navigation
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock framer-motion para evitar animaciones en tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock timers para el setTimeout
vi.useFakeTimers()

// Mock Supabase client
const mockUpdateUser = vi.fn()
const mockGetSession = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      updateUser: mockUpdateUser,
      getSession: mockGetSession,
    },
  })),
}))

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock session válida por defecto
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado - Sesión válida', () => {
    it('renderiza el título de la página', async () => {
      await act(async () => {
        render(<ResetPasswordPage />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Nueva contrasena')).toBeInTheDocument()
      })
    })

    it('renderiza el campo de nueva contraseña', async () => {
      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/nueva contrasena/i)).toBeInTheDocument()
      })
    })

    it('renderiza el campo de confirmar contraseña', async () => {
      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/confirmar contrasena/i)).toBeInTheDocument()
      })
    })

    it('renderiza el botón de actualizar', async () => {
      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actualizar contrasena/i })).toBeInTheDocument()
      })
    })
  })

  describe('Renderizado - Verificación de sesión', () => {
    it('muestra estado de carga mientras verifica sesión', async () => {
      mockGetSession.mockImplementation(() => new Promise(() => {}))

      await act(async () => {
        render(<ResetPasswordPage />)
      })

      expect(screen.getByText(/verificando sesion/i)).toBeInTheDocument()
    })

    it('muestra error cuando la sesión es inválida', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByText(/enlace invalido o expirado/i)).toBeInTheDocument()
      })
    })

    it('muestra botón para solicitar nuevo enlace cuando la sesión es inválida', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /solicitar nuevo enlace/i })).toBeInTheDocument()
      })
    })

    it('muestra botón para volver al login cuando la sesión es inválida', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /volver al inicio de sesion/i })).toBeInTheDocument()
      })
    })
  })

  describe('Interacciones de usuario', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Nueva contrasena')).toBeInTheDocument()
      })
    })

    it('permite escribir en el campo de contraseña', async () => {
      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } })
      })
      expect(passwordInput).toHaveValue('NewPass123!')
    })

    it('permite escribir en el campo de confirmar contraseña', async () => {
      const confirmInput = screen.getByPlaceholderText(/repite tu contrasena/i)
      await act(async () => {
        fireEvent.change(confirmInput, { target: { value: 'NewPass123!' } })
      })
      expect(confirmInput).toHaveValue('NewPass123!')
    })

    it('permite mostrar/ocultar la contraseña', async () => {
      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      const toggleButtons = screen.getAllByRole('button', { name: '' })
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      await act(async () => {
        fireEvent.click(toggleButtons[0])
      })
      expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('muestra indicador de fortaleza de contraseña', async () => {
      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/seguridad:/i)).toBeInTheDocument()
      })
    })
  })

  describe('Validaciones', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Nueva contrasena')).toBeInTheDocument()
      })
    })

    it('muestra error cuando la contraseña es muy corta', async () => {
      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      const submitButton = screen.getByRole('button', { name: /actualizar contrasena/i })

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'short' } })
        fireEvent.blur(passwordInput)
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/la contrasena debe tener al menos 8 caracteres/i)).toBeInTheDocument()
      })
    })

    it('muestra error cuando las contraseñas no coinciden', async () => {
      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      const confirmInput = screen.getByPlaceholderText(/repite tu contrasena/i)

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.change(confirmInput, { target: { value: 'Different123!' } })
        fireEvent.blur(confirmInput)
      })

      await waitFor(() => {
        expect(screen.getByText(/las contrasenas no coinciden/i)).toBeInTheDocument()
      })
    })
  })

  describe('Estados de loading', () => {
    it('deshabilita el botón durante la actualización', async () => {
      mockUpdateUser.mockImplementation(() => new Promise(() => {}))

      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Nueva contrasena')).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      const confirmInput = screen.getByPlaceholderText(/repite tu contrasena/i)

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })
      })

      const submitButton = screen.getByRole('button', { name: /actualizar contrasena/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/actualizando/i)).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /actualizando/i })).toBeDisabled()
    })
  })

  describe('Manejo de errores', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Nueva contrasena')).toBeInTheDocument()
      })
    })

    it('muestra error cuando falla la actualización', async () => {
      mockUpdateUser.mockResolvedValue({
        error: { message: 'Password is too weak' },
      })

      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      const confirmInput = screen.getByPlaceholderText(/repite tu contrasena/i)

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })
      })

      const submitButton = screen.getByRole('button', { name: /actualizar contrasena/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Password is too weak')).toBeInTheDocument()
      })
    })
  })

  describe('Flujo completo (happy path)', () => {
    it('muestra mensaje de éxito después de actualizar la contraseña', async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Nueva contrasena')).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      const confirmInput = screen.getByPlaceholderText(/repite tu contrasena/i)

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })
      })

      const submitButton = screen.getByRole('button', { name: /actualizar contrasena/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/contrasena actualizada/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/seras redirigido al inicio de sesion/i)).toBeInTheDocument()
    })

    it('llama a updateUser con la contraseña correcta', async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Nueva contrasena')).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      const confirmInput = screen.getByPlaceholderText(/repite tu contrasena/i)

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })
      })

      const submitButton = screen.getByRole('button', { name: /actualizar contrasena/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          password: 'NewPassword123!',
        })
      })
    })

    it('redirige al login después de 3 segundos en éxito', async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      await act(async () => {
        render(<ResetPasswordPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Nueva contrasena')).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/minimo 8 caracteres/i)
      const confirmInput = screen.getByPlaceholderText(/repite tu contrasena/i)

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })
      })

      const submitButton = screen.getByRole('button', { name: /actualizar contrasena/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/contrasena actualizada/i)).toBeInTheDocument()
      })

      // Avanzar el timer
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })
  })
})
