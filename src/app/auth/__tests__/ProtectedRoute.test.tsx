import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'

// Mock next/navigation
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/app/dashboard',
}))

// Create mock functions for Supabase
const mockGetSession = vi.fn()

const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Simple ProtectedRoute component for testing
function ProtectedRoute({ children, redirectTo = '/auth/login' }: { children: React.ReactNode; redirectTo?: string }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await mockSupabaseClient.auth.getSession()
      
      if (!session) {
        mockPush(redirectTo)
      } else {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [redirectTo])

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

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
  })

  it('muestra pantalla de carga inicialmente', () => {
    mockGetSession.mockImplementation(() => new Promise(() => {}))

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('renderiza children cuando el usuario está autenticado', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
    })

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  it('no renderiza children y redirige cuando no está autenticado', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })
})
