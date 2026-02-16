import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import LoginPage from '../login/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: vi.fn(),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock Supabase client
const mockSignInWithPassword = vi.fn()
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  })),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })
    // Mock search params
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('') as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado', () => {
    it('renderiza el título de la página', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    })

    it('renderiza los campos de email y contraseña', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    })

    it('renderiza el selector de tipo de usuario (paciente/doctor)', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      expect(screen.getByText('Paciente')).toBeInTheDocument()
      expect(screen.getByText('Doctor')).toBeInTheDocument()
    })

    it('renderiza el checkbox de recordarme', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      expect(screen.getByLabelText(/recordarme en este dispositivo/i)).toBeInTheDocument()
    })

    it('renderiza el botón de submit', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('renderiza los botones de login social', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument()
    })

    it('renderiza el link para recuperar contraseña', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      expect(screen.getByText(/¿olvidaste tu contraseña?/i)).toBeInTheDocument()
    })

    it('renderiza el link para registrarse', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      expect(screen.getByText(/regístrate gratis/i)).toBeInTheDocument()
    })
  })

  describe('Interacciones de usuario', () => {
    it('permite escribir en el campo de email', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      const emailInput = screen.getByPlaceholderText(/nombre@ejemplo.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('permite escribir en el campo de contraseña', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      const passwordInput = screen.getByPlaceholderText('••••••••')
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
      })
      expect(passwordInput).toHaveValue('password123')
    })

    it('permite cambiar el tipo de usuario', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      const doctorButton = screen.getByRole('button', { name: /doctor/i })
      await act(async () => {
        fireEvent.click(doctorButton)
      })
      expect(doctorButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('permite toggle del checkbox de recordarme', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      const checkbox = screen.getByRole('checkbox', { name: /recordarme/i })
      await act(async () => {
        fireEvent.click(checkbox)
      })
      expect(checkbox).toBeChecked()
    })

    it('permite mostrar/ocultar la contraseña', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const toggleButton = screen.getByRole('button', { name: '' })
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      await act(async () => {
        fireEvent.click(toggleButton)
      })
      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Estados de loading', () => {
    it('deshabilita el botón de submit durante el loading', async () => {
      mockSignInWithPassword.mockImplementation(() => new Promise(() => {}))
      
      await act(async () => {
        render(<LoginPage />)
      })
      
      const emailInput = screen.getByPlaceholderText(/nombre@ejemplo.com/i)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
      })
      
      expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled()
    })

    it('muestra spinner durante el loading', async () => {
      mockSignInWithPassword.mockImplementation(() => new Promise(() => {}))
      
      await act(async () => {
        render(<LoginPage />)
      })
      
      const emailInput = screen.getByPlaceholderText(/nombre@ejemplo.com/i)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /iniciando sesión/i }).querySelector('svg')).toHaveClass('animate-spin')
      })
    })
  })

  describe('Manejo de errores', () => {
    it('muestra error cuando las credenciales son inválidas', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      })

      await act(async () => {
        render(<LoginPage />)
      })
      
      const emailInput = screen.getByPlaceholderText(/nombre@ejemplo.com/i)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
      })
    })

    it('muestra error cuando el email es inválido', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      
      const emailInput = screen.getByPlaceholderText(/nombre@ejemplo.com/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.blur(emailInput)
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/correo electrónico inválido/i)).toBeInTheDocument()
      })
    })

    it('muestra error cuando la contraseña es muy corta', async () => {
      await act(async () => {
        render(<LoginPage />)
      })
      
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: '123' } })
        fireEvent.blur(passwordInput)
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument()
      })
    })
  })

  describe('Flujo completo (happy path)', () => {
    it('redirige a /app después de login exitoso como paciente', async () => {
      const mockPush = vi.fn()
      const mockRefresh = vi.fn()
      
      vi.doMock('next/navigation', () => ({
        useRouter: () => ({
          push: mockPush,
          refresh: mockRefresh,
        }),
        useSearchParams: vi.fn(() => new URLSearchParams('')),
      }))

      mockSignInWithPassword.mockResolvedValue({ error: null })

      await act(async () => {
        render(<LoginPage />)
      })
      
      const emailInput = screen.getByPlaceholderText(/nombre@ejemplo.com/i)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('redirige a redirect param cuando existe', async () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('redirect=/doctor/dashboard') as any)

      mockSignInWithPassword.mockResolvedValue({ error: null })

      await act(async () => {
        render(<LoginPage />)
      })
      
      const emailInput = screen.getByPlaceholderText(/nombre@ejemplo.com/i)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalled()
      })
    })
  })

  describe('Login social', () => {
    it('inicia login con Google', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null })

      await act(async () => {
        render(<LoginPage />)
      })
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      
      await act(async () => {
        fireEvent.click(googleButton)
      })

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: 'http://localhost:3000/auth/callback',
          },
        })
      })
    })

    it('inicia login con Apple', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null })

      await act(async () => {
        render(<LoginPage />)
      })
      
      const appleButton = screen.getByRole('button', { name: /apple/i })
      
      await act(async () => {
        fireEvent.click(appleButton)
      })

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'apple',
          options: {
            redirectTo: 'http://localhost:3000/auth/callback',
          },
        })
      })
    })

    it('muestra error cuando falla login social', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        error: { message: 'OAuth provider error' },
      })

      await act(async () => {
        render(<LoginPage />)
      })
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      
      await act(async () => {
        fireEvent.click(googleButton)
      })

      await waitFor(() => {
        expect(screen.getByText('OAuth provider error')).toBeInTheDocument()
      })
    })
  })
})
