// PHI-Safe Logger
// Wraps the standard logger to automatically redact Protected Health Information (PHI)
// from log output. This is an opt-in layer — by default the base logger logs everything.

import { logger as baseLogger } from './logger'
import type { LogContext } from './logger'

const PHI_FIELDS = new Set([
  'name', 'email', 'phone', 'address', 'ssn', 'diagnosis',
  'notes', 'transcript', 'consultationNotes', 'patientName',
  'doctorName', 'full_name', 'password', 'token', 'secret',
  'authorization', 'cookie',
])

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function redact<T>(obj: T): T {
  if (!isObject(obj) && !Array.isArray(obj)) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(redact) as unknown as T
  }

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (PHI_FIELDS.has(key)) {
      result[key] = '[REDACTED]'
      continue
    }

    result[key] = isObject(value) || Array.isArray(value) ? redact(value) : value
  }

  return result as T
}

function makePhiLogger(defaultContext?: LogContext) {
  const log = (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: LogContext,
    error?: Error
  ) => {
    const merged = { ...(defaultContext || {}), ...(context || {}) }
    const safeContext = Object.keys(merged).length > 0 ? redact(merged) : undefined
    ;(baseLogger as any)[level](message, safeContext, error)
  }

  return {
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext, error?: Error) => log('warn', message, context, error),
    error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),
    phiDebug: (message: string, context?: LogContext) => log('debug', message, context),
    phiInfo: (message: string, context?: LogContext) => log('info', message, context),
    phiWarn: (message: string, context?: LogContext, error?: Error) => log('warn', message, context, error),
    phiError: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),

    child: (childContext: LogContext) => {
      return makePhiLogger({ ...(defaultContext || {}), ...childContext })
    },
  }
}

export const phiLogger = makePhiLogger()

export default phiLogger
