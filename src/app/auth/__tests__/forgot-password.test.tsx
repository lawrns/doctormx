import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ForgotPasswordPage from '../forgot-password/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
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

// Mock Supabase client
const mockResetPasswordForEmail = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  })),
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado', () => {
    it('renderiza el título de la página', async () => {
      await act(async () => {
        render(<ForgotPasswordPage />)
      })
      expect(screen.getByText('Recuperar contrasena')).toBeInTheDocument()
    })

    it('renderiza la descripción', async () => {
      await act(async () => {
        render(<ForgotPasswordPage />)
      })
      expect(screen.getByText(/ingresa tu correo electronico y te enviaremos instrucciones/i)).toBeInTheDocument()
    })

    it('renderiza el campo de email', async () => {
      await act(async () => {
        render(<ForgotPasswordPage />)
      })
      expect(screen.getByLabelText(/correo electronico/i)).toBeInTheDocument()
    })

    it('renderiza el botón de enviar', async () => {
      await act(async () => {
        render(<ForgotPasswordPage />)
      })
      expect(screen.getByRole('button', { name: /enviar instrucciones/i })).toBeInTheDocument()
    })

    it('renderiza el link para volver al login', async () => {
      await act(async () => {
        render(<ForgotPasswordPage />)
      })
      expect(screen.getByText(/volver al inicio de sesion/i)).toBeInTheDocument()
    })
  })

  describe('Interacciones de usuario', () => {
    it('permite escribir en el campo de email', async () => {
      await act(async () => {
        render(<ForgotPasswordPage />)
      })
      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('limpia el campo cuando se hace click en enviar de nuevo', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null })

      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument()
      })

      const resendButton = screen.getByRole('button', { name: /enviar de nuevo/i })
      await act(async () => {
        fireEvent.click(resendButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/recuperar contrasena/i)).toBeInTheDocument()
      })
    })
  })

  describe('Estados de loading', () => {
    it('deshabilita el botón durante el envío', async () => {
      mockResetPasswordForEmail.mockImplementation(() => new Promise(() => {}))

      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/enviando/i)).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled()
    })

    it('muestra spinner durante el envío', async () => {
      mockResetPasswordForEmail.mockImplementation(() => new Promise(() => {}))

      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /enviando/i }).querySelector('svg')).toHaveClass('animate-spin')
      })
    })
  })

  describe('Manejo de errores', () => {
    it('muestra error cuando el email es inválido', async () => {
      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.blur(emailInput)
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/correo electronico invalido/i)).toBeInTheDocument()
      })
    })

    it('muestra error cuando falla el envío del email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        error: { message: 'Rate limit exceeded' },
      })

      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
      })
    })
  })

  describe('Flujo completo (happy path)', () => {
    it('muestra mensaje de éxito después de enviar el email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null })

      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
      expect(screen.getByText(/si no ves el correo en tu bandeja de entrada/i)).toBeInTheDocument()
    })

    it('llama a resetPasswordForEmail con los parámetros correctos', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null })

      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
          redirectTo: 'http://localhost:3000/auth/reset-password',
        })
      })
    })

    it('muestra botón para volver al login después del éxito', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null })

      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /volver al inicio de sesion/i })).toBeInTheDocument()
      })
    })
  })

  describe('Reenvío de email', () => {
    it('permite reenviar el email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null })

      await act(async () => {
        render(<ForgotPasswordPage />)
      })

      // Primer envío
      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument()
      })

      // Click en reenviar
      const resendButton = screen.getByRole('button', { name: /enviar de nuevo/i })
      await act(async () => {
        fireEvent.click(resendButton)
      })

      // Verificar que volvemos al formulario
      await waitFor(() => {
        expect(screen.getByText(/recuperar contrasena/i)).toBeInTheDocument()
      })
    })
  })
})
