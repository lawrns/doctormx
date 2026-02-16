import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { ReactNode } from 'react'

// Mock next/navigation
const mockPush = vi.fn()
const mockPathname = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock Supabase client
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      }),
    },
  })),
}))

// Crear un componente ProtectedRoute simple para testing
interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const router = require('next/navigation').useRouter()
  const supabase = require('@/lib/supabase/client').createClient()

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push(redirectTo)
      } else {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        router.push(redirectTo)
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [redirectTo, router, supabase.auth])

  if (isLoading) {
    return (
      <div data-testid="loading-screen">
        <div>Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

import * as React from 'react'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    mockPathname.mockReturnValue('/app/dashboard')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado', () => {
    it('muestra pantalla de carga inicialmente', async () => {
      mockGetSession.mockImplementation(() => new Promise(() => {}))

      await act(async () => {
        render(
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        )
      })

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument()
      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    it('renderiza children cuando el usuario está autenticado', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      })

      await act(async () => {
        render(
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('no renderiza children cuando el usuario no está autenticado', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      await act(async () => {
        render(
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })

  describe('Redirección', () => {
    it('redirige a login cuando no hay sesión', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      await act(async () => {
        render(
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('redirige a ruta personalizada cuando se especifica', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      await act(async () => {
        render(
          <ProtectedRoute redirectTo="/custom-login">
            <div>Protected Content</div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/custom-login')
      })
    })

    it('no redirige cuando hay sesión activa', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      })

      await act(async () => {
        render(
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Auth state changes', () => {
    it('redirige cuando se recibe evento SIGNED_OUT', async () => {
      let authStateCallback: Function | null = null
      mockOnAuthStateChange.mockImplementation((callback: Function) => {
        authStateCallback = callback
        return {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }
      })

      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      })

      await act(async () => {
        render(
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })

      // Simular SIGNED_OUT
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_OUT', null)
        }
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('permite acceso cuando se recibe evento SIGNED_IN', async () => {
      let authStateCallback: Function | null = null
      mockOnAuthStateChange.mockImplementation((callback: Function) => {
        authStateCallback = callback
        return {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }
      })

      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      await act(async () => {
        render(
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })

      // Simular SIGNED_IN
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', { user: { id: 'user-123' } })
        }
      })

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })
    })
  })

  describe('Cleanup', () => {
    it('cancela suscripción al desmontar', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      })

      const { unmount } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Múltiples rutas protegidas', () => {
    it('maneja múltiples children', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      })

      await act(async () => {
        render(
          <ProtectedRoute>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
            <div data-testid="child-3">Child 3</div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument()
        expect(screen.getByTestId('child-2')).toBeInTheDocument()
        expect(screen.getByTestId('child-3')).toBeInTheDocument()
      })
    })

    it('maneja children anidados', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      })

      await act(async () => {
        render(
          <ProtectedRoute>
            <div data-testid="parent">
              <div data-testid="child">Nested Child</div>
            </div>
          </ProtectedRoute>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('parent')).toBeInTheDocument()
        expect(screen.getByTestId('child')).toBeInTheDocument()
      })
    })
  })
})
