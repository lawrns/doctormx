export const ANALYTICS_EVENTS = {
  LANDING_VIEW: 'landing_view',
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  AI_CONSULT_STARTED: 'ai_consult_started',
  AI_CONSULT_COMPLETED: 'ai_consult_completed',
  BOOKING_STARTED: 'booking_started',
  BOOKING_PAID: 'booking_paid',
  PRESCRIPTION_RECEIVED: 'prescription_received',
  SHARED_WHATSAPP: 'shared_whatsapp',
  REFERRAL_CODE_SHARED: 'referral_code_shared',
  REFERRAL_CODE_REDEEMED: 'referral_code_redeemed',
} as const

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

export type AnalyticsProperties = Record<string, unknown>

export interface TrackAnalyticsEventInput {
  event: AnalyticsEventName | (string & {})
  distinctId?: string
  userId?: string
  anonymousId?: string
  pathname?: string
  url?: string
  properties?: AnalyticsProperties
}

const ANALYTICS_STORAGE_KEY = 'doctor-mx:analytics-id'

function getPosthogHost(): string | null {
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    process.env.POSTHOG_HOST ||
    'https://eu.i.posthog.com'

  return host.replace(/\/$/, '')
}

function getPosthogApiKey(): string | null {
  return (
    process.env.POSTHOG_API_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY ||
    null
  )
}

function buildEventPayload(input: TrackAnalyticsEventInput) {
  const properties: AnalyticsProperties = {
    ...(input.properties || {}),
  }

  if (input.pathname) {
    properties.pathname = input.pathname
  }

  if (input.url) {
    properties.url = input.url
  }

  if (input.anonymousId) {
    properties.anonymous_id = input.anonymousId
  }

  if (input.userId) {
    properties.user_id = input.userId
  }

  return {
    event: input.event,
    distinct_id: input.distinctId || input.userId || input.anonymousId || crypto.randomUUID(),
    properties,
  }
}

async function captureToPosthog(input: TrackAnalyticsEventInput): Promise<{
  sent: boolean
  reason?: string
}> {
  const apiKey = getPosthogApiKey()
  const host = getPosthogHost()

  if (!apiKey || !host) {
    return { sent: false, reason: 'posthog_not_configured' }
  }

  try {
    const response = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        timestamp: new Date().toISOString(),
        ...buildEventPayload(input),
      }),
      keepalive: true,
    })

    if (!response.ok) {
      const message = await response.text().catch(() => '')
      return {
        sent: false,
        reason: `posthog_http_${response.status}${message ? `:${message}` : ''}`,
      }
    }

    return { sent: true }
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'posthog_capture_failed',
    }
  }
}

export async function trackServerEvent(
  input: TrackAnalyticsEventInput
): Promise<{ sent: boolean; reason?: string }> {
  return captureToPosthog(input)
}

export function getAnonymousAnalyticsId(): string {
  if (typeof window === 'undefined') {
    return crypto.randomUUID()
  }

  const existing = window.localStorage.getItem(ANALYTICS_STORAGE_KEY)
  if (existing) {
    return existing
  }

  const created = crypto.randomUUID()
  window.localStorage.setItem(ANALYTICS_STORAGE_KEY, created)
  return created
}

export async function trackClientEvent(
  event: TrackAnalyticsEventInput['event'],
  properties: AnalyticsProperties = {},
  options: {
    distinctId?: string
    userId?: string
    anonymousId?: string
    pathname?: string
    url?: string
    useBeacon?: boolean
  } = {}
): Promise<{ sent: boolean; reason?: string }> {
  if (typeof window === 'undefined') {
    return { sent: false, reason: 'server_render' }
  }

  const payload: TrackAnalyticsEventInput = {
    event,
    distinctId: options.distinctId,
    userId: options.userId,
    anonymousId: options.anonymousId || getAnonymousAnalyticsId(),
    pathname: options.pathname || window.location.pathname,
    url: options.url || window.location.href,
    properties,
  }

  const body = JSON.stringify(payload)

  if (options.useBeacon !== false && navigator.sendBeacon) {
    const ok = navigator.sendBeacon(
      '/api/analytics/event',
      new Blob([body], { type: 'application/json' })
    )

    if (ok) {
      return { sent: true }
    }
  }

  try {
    const response = await fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    })

    return { sent: response.ok, reason: response.ok ? undefined : response.statusText }
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'client_capture_failed',
    }
  }
}
