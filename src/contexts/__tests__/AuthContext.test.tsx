import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import React, { useContext } from 'react'

// Mock de react-router-dom
const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock del logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

// Mock de Supabase - hoisted al top
const mockOnAuthStateChange = vi.fn()
const mockUnsubscribe = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockSignOutUser = vi.fn()

const mockSupabase = {
  auth: {
    onAuthStateChange: mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    }),
  },
}

vi.mock('../lib/supabase.js', () => ({
  supabase: mockSupabase,
  getCurrentUser: mockGetCurrentUser,
  signOutUser: mockSignOutUser,
}))

// Importar después de los mocks
import { AuthProvider, useAuth, AuthContext } from '../AuthContext'

// Componente de prueba - usa useAuth hook en lugar de useContext
const TestComponent = () => {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="user">{auth?.user ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="loading">{auth?.loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{auth?.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <button onClick={() => auth?.logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado del Provider', () => {
    it('renderiza children correctamente', async () => {
      mockGetCurrentUser.mockResolvedValue({ user: null, error: null })

      await act(async () => {
        render(
          <AuthProvider>
            <div data-testid="child">Child Content</div>
          </AuthProvider>
        )
      })

      expect(screen.getByTestId('child')).toHaveTextContent('Child Content')
    })

    it('inicializa con loading true', async () => {
      mockGetCurrentUser.mockImplementation(() => new Promise(() => {}))

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    })

    it('establece loading a false después de verificar usuario', async () => {
      mockGetCurrentUser.mockResolvedValue({ user: null, error: null })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
    })
  })

  describe('useAuth hook', () => {
    it('lanza error cuando se usa fuera del provider', () => {
      // Crear un componente que use useAuth
      const ComponentWithoutProvider = () => {
        try {
          const auth = useAuth()
          return <div>{auth ? 'has auth' : 'no auth'}</div>
        } catch (error: any) {
          return <div data-testid="error">{error.message}</div>
        }
      }

      render(<ComponentWithoutProvider />)
      expect(screen.getByTestId('error')).toHaveTextContent(/useAuth debe ser usado dentro de un AuthProvider/i)
    })
  })

  describe('Estado de autenticación', () => {
    it('establece usuario cuando hay sesión activa', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        confirmed_at: new Date().toISOString(),
      }
      mockGetCurrentUser.mockResolvedValue({ user: mockUser, error: null })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('logged-in')
      })
    })

    it('establece isAuthenticated a true cuando hay usuario', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        confirmed_at: new Date().toISOString(),
      }
      mockGetCurrentUser.mockResolvedValue({ user: mockUser, error: null })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      })
    })

    it('establece isAuthenticated a false cuando no hay usuario', async () => {
      mockGetCurrentUser.mockResolvedValue({ user: null, error: null })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
      })
    })

    it('maneja error de sesión faltante sin mostrar error en consola', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGetCurrentUser.mockResolvedValue({
        user: null,
        error: { message: 'Auth session missing!', name: 'AuthSessionMissingError' },
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('logged-out')
      })

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Logout', () => {
    it('llama a signOutUser cuando se invoca logout', async () => {
      mockSignOutUser.mockResolvedValue({ error: null })
      mockGetCurrentUser.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      })

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await act(async () => {
        fireEvent.click(logoutButton)
      })

      await waitFor(() => {
        expect(mockSignOutUser).toHaveBeenCalled()
      })
    })

    it('navega a home después del logout exitoso', async () => {
      mockSignOutUser.mockResolvedValue({ error: null })
      mockGetCurrentUser.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      })

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await act(async () => {
        fireEvent.click(logoutButton)
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('maneja error durante el logout', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSignOutUser.mockResolvedValue({ error: { message: 'Network error' } })
      mockGetCurrentUser.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      })

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await act(async () => {
        fireEvent.click(logoutButton)
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error cerrando sesión:', expect.any(Object))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Auth state change listener', () => {
    it('suscribe a cambios de autenticación', async () => {
      mockGetCurrentUser.mockResolvedValue({ user: null, error: null })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })
    })

    it('actualiza usuario cuando se recibe evento SIGNED_IN', async () => {
      let authStateCallback: Function | null = null
      mockOnAuthStateChange.mockImplementation((callback: Function) => {
        authStateCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe,
            },
          },
        }
      })
      mockGetCurrentUser.mockResolvedValue({ user: null, error: null })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      // Simular evento SIGNED_IN
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          confirmed_at: new Date().toISOString(),
        },
      }

      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', mockSession)
        }
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('logged-in')
      })
    })

    it('limpia usuario y navega al login cuando se recibe evento SIGNED_OUT', async () => {
      let authStateCallback: Function | null = null
      mockOnAuthStateChange.mockImplementation((callback: Function) => {
        authStateCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe,
            },
          },
        }
      })
      mockGetCurrentUser.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('logged-in')
      })

      // Simular evento SIGNED_OUT
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_OUT', null)
        }
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('logged-out')
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('cancela suscripción al desmontar', async () => {
      mockGetCurrentUser.mockResolvedValue({ user: null, error: null })

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Email verification', () => {
    it('establece isEmailVerified a true cuando el usuario tiene confirmed_at', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        confirmed_at: new Date().toISOString(),
      }
      mockGetCurrentUser.mockResolvedValue({ user: mockUser, error: null })

      // Componente que verifica isEmailVerified
      const EmailVerificationComponent = () => {
        const auth = useAuth()
        const user = auth?.user as any
        return (
          <div data-testid="email-verified">
            {user?.isEmailVerified ? 'verified' : 'not-verified'}
          </div>
        )
      }

      await act(async () => {
        render(
          <AuthProvider>
            <EmailVerificationComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('email-verified')).toHaveTextContent('verified')
      })
    })

    it('establece isEmailVerified a false cuando el usuario no tiene confirmed_at', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        confirmed_at: null,
      }
      mockGetCurrentUser.mockResolvedValue({ user: mockUser, error: null })

      // Componente que verifica isEmailVerified
      const EmailVerificationComponent = () => {
        const auth = useAuth()
        const user = auth?.user as any
        return (
          <div data-testid="email-verified">
            {user?.isEmailVerified ? 'verified' : 'not-verified'}
          </div>
        )
      }

      await act(async () => {
        render(
          <AuthProvider>
            <EmailVerificationComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('email-verified')).toHaveTextContent('not-verified')
      })
    })
  })

  describe('isLoggingOut state', () => {
    it('establece isLoggingOut a true durante el logout', async () => {
      mockSignOutUser.mockImplementation(() => new Promise(() => {}))
      mockGetCurrentUser.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
        error: null,
      })

      // Componente que verifica isLoggingOut
      const LogoutStateComponent = () => {
        const auth = useAuth()
        return (
          <div>
            <div data-testid="logging-out">{auth?.isLoggingOut ? 'logging-out' : 'not-logging-out'}</div>
            <button onClick={() => auth?.logout()}>Logout</button>
          </div>
        )
      }

      await act(async () => {
        render(
          <AuthProvider>
            <LogoutStateComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('logging-out')).toHaveTextContent('not-logging-out')
      })

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await act(async () => {
        fireEvent.click(logoutButton)
      })

      expect(screen.getByTestId('logging-out')).toHaveTextContent('logging-out')
    })

    it('establece isLoggingOut a false después del logout exitoso', async () => {
      mockSignOutUser.mockResolvedValue({ error: null })
      mockGetCurrentUser.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
        error: null,
      })

      // Componente que verifica isLoggingOut
      const LogoutStateComponent = () => {
        const auth = useAuth()
        return (
          <div>
            <div data-testid="logging-out">{auth?.isLoggingOut ? 'logging-out' : 'not-logging-out'}</div>
            <button onClick={() => auth?.logout()}>Logout</button>
          </div>
        )
      }

      await act(async () => {
        render(
          <AuthProvider>
            <LogoutStateComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('logging-out')).toHaveTextContent('not-logging-out')
      })

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await act(async () => {
        fireEvent.click(logoutButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('logging-out')).toHaveTextContent('not-logging-out')
      })
    })
  })
})
