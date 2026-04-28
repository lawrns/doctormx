// Unified Sentry utility — safe for client and server
// Graceful degradation if Sentry is not configured

const SENTRY_DSN =
  'https://c7f3941c8e0b4b3717aa1b313e3da0d3@o4509302601220096.ingest.us.sentry.io/4510767422570496'

function getSentry() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@sentry/react')
  } catch {
    return null
  }
}

let initialized = false

export function initSentry(): void {
  if (initialized) return
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || SENTRY_DSN
  if (!dsn) return
  try {
    const Sentry = getSentry()
    if (!Sentry) return
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
      release: process.env.npm_package_version || '0.1.0',
      beforeSend(event: any) {
        if (process.env.NODE_ENV === 'development') return null
        return event
      },
      beforeSendTransaction(event: any) {
        if (process.env.NODE_ENV === 'development') return null
        return event
      },
    })
    initialized = true
  } catch {
    // Sentry not available — graceful degradation
  }
}

export function captureError(
  err: unknown,
  context?: string,
  level: 'warning' | 'error' = 'error',
): void {
  try {
    const Sentry = getSentry()
    if (!Sentry?.captureException) return
    const error = err instanceof Error ? err : new Error(String(err))
    Sentry.captureException(error, { level, tags: context ? { context } : undefined })
  } catch {
    // graceful
  }
}

export function setUser(userId: string, email?: string): void {
  try {
    const Sentry = getSentry()
    if (!Sentry?.setUser) return
    Sentry.setUser({ id: userId, email })
  } catch {
    // graceful
  }
}

export function startSpan<T>(name: string, op: string, callback: () => T): T {
  try {
    const Sentry = getSentry()
    if (Sentry?.startSpan) {
      return Sentry.startSpan({ name, op }, () => callback())
    }
  } catch {
    // graceful
  }
  return callback()
}
