import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import React from 'react'

// Mock variables - hoisted
const mockNavigate = vi.hoisted(() => vi.fn())
const mockUnsubscribe = vi.hoisted(() => vi.fn())
const mockGetCurrentUser = vi.hoisted(() => vi.fn())
const mockSignOutUser = vi.hoisted(() => vi.fn())
const mockOnAuthStateChange = vi.hoisted(() => vi.fn())
const mockLoggerError = vi.hoisted(() => vi.fn())

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    error: mockLoggerError,
  },
}))

// Mock supabase with hoisted functions
vi.mock('@/lib/supabase.js', () => ({
  supabase: {
    auth: {
      onAuthStateChange: mockOnAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      }),
    },
  },
  getCurrentUser: mockGetCurrentUser,
  signOutUser: mockSignOutUser,
}))

// Import after mocks
import { AuthProvider, useAuth } from '../AuthContext'

// Test component
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
    // Default mock implementation
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    })
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
      // Never resolves to keep loading state
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

      // Logger.error should not be called for AuthSessionMissingError
      expect(mockLoggerError).not.toHaveBeenCalled()
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

      // Simulate SIGNED_IN event
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

      // Simulate SIGNED_OUT event
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
      // Create a promise that never resolves to keep isLoggingOut true
      mockSignOutUser.mockImplementation(() => new Promise(() => {}))
      mockGetCurrentUser.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
        error: null,
      })

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
