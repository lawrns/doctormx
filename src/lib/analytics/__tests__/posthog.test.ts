import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  trackClientEvent,
  trackServerEvent,
} from '../posthog'

describe('posthog analytics helpers', () => {
  const originalApiKey = process.env.POSTHOG_API_KEY
  const originalHost = process.env.POSTHOG_HOST

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.POSTHOG_API_KEY = 'posthog-test-key'
    process.env.POSTHOG_HOST = 'https://example.test'
  })

  afterEach(() => {
    process.env.POSTHOG_API_KEY = originalApiKey
    process.env.POSTHOG_HOST = originalHost
    vi.unstubAllGlobals()
  })

  it('sends server events to the capture endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(''),
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await trackServerEvent({
      event: 'signup_completed',
      distinctId: 'user-1',
      userId: 'user-1',
      pathname: '/auth/register',
      properties: {
        accountType: 'patient',
      },
    })

    expect(result).toEqual({ sent: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0] || []
    expect(url).toBe('https://example.test/capture/')
    expect(options).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const payload = JSON.parse((options as RequestInit).body as string)
    expect(payload).toMatchObject({
      api_key: 'posthog-test-key',
      event: 'signup_completed',
      distinct_id: 'user-1',
      properties: {
        accountType: 'patient',
        pathname: '/auth/register',
        user_id: 'user-1',
      },
    })
    expect(payload.timestamp).toBeTruthy()
  })

  it('returns a best-effort miss when PostHog is not configured', async () => {
    process.env.POSTHOG_API_KEY = ''
    process.env.POSTHOG_HOST = ''

    const result = await trackServerEvent({
      event: 'landing_view',
      distinctId: 'anon-1',
    })

    expect(result).toEqual({
      sent: false,
      reason: 'posthog_not_configured',
    })
  })

  it('falls back to fetch when running on the client without beacon support', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(''),
    })

    vi.stubGlobal('window', {
      location: {
        pathname: '/auth/register',
        href: 'https://doctor.mx/auth/register',
      },
      localStorage: {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
      },
    })
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('fetch', fetchMock)

    const result = await trackClientEvent('signup_started', {
      accountType: 'patient',
    })

    expect(result.sent).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
