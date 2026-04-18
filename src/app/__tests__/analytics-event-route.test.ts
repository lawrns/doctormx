import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { POST } from '@/app/api/analytics/event/route'
import { trackServerEvent } from '@/lib/analytics/posthog'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/analytics/posthog', () => ({
  trackServerEvent: vi.fn().mockResolvedValue({ sent: true }),
}))

describe('/api/analytics/event', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(trackServerEvent).mockResolvedValue({ sent: true })
  })

  it('rejects invalid payloads', async () => {
    const request = new Request('http://localhost/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: '' }),
    })

    const response = await POST(request as never)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Invalid analytics event payload')
  })

  it('attaches the authenticated user id and source metadata', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    } as never)

    const request = new Request('http://localhost/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'signup_completed',
        distinctId: 'anonymous-1',
        pathname: '/auth/register',
        properties: {
          accountType: 'patient',
        },
      }),
    })

    const response = await POST(request as never)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(trackServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'signup_completed',
        distinctId: 'anonymous-1',
        userId: 'user-1',
        pathname: '/auth/register',
        properties: expect.objectContaining({
          accountType: 'patient',
          source: 'client-analytics-route',
        }),
      })
    )
  })
})
