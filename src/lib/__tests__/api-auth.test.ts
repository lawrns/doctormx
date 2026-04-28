import { beforeEach, describe, expect, it, vi } from 'vitest'
import { withAuth } from '@/lib/api-auth'
import { createClient } from '@/lib/supabase/server'

describe('withAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no user is authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)

    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const request = new Request('http://localhost/api/test')
    const response = await wrapped(request as never)
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
    expect(handler).not.toHaveBeenCalled()
  })

  it('returns 500 on handler error', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    } as never)

    const handler = vi.fn().mockRejectedValue(new Error('handler error'))
    const wrapped = withAuth(handler)
    const request = new Request('http://localhost/api/test')
    const response = await wrapped(request as never)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Internal server error')
  })

  it('calls the handler with user and supabase when authenticated', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' }
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: mockUser } })
    const mockSupabase = {
      auth: { getUser: mockGetUser },
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const handler = vi.fn().mockResolvedValue(new Response('ok'))
    const wrapped = withAuth(handler)
    const request = new Request('http://localhost/api/test')
    const response = await wrapped(request as never)

    expect(response.status).toBe(200)
    expect(handler).toHaveBeenCalledWith(
      request,
      expect.objectContaining({
        user: mockUser,
        supabase: mockSupabase,
      })
    )
  })
})
