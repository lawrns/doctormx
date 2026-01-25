/**
 * Anonymous Quota System for Doctor.mx
 * Allows 5 free AI consultations without authentication
 * Tracks by session ID in browser storage + server-side
 */

import { cookies } from 'next/headers'

const ANONYMOUS_QUOTA_LIMIT = 5
const SESSION_COOKIE_NAME = 'doctor_mx_session'
const QUOTA_COOKIE_NAME = 'doctor_mx_quota_used'

export interface AnonymousQuota {
  sessionId: string
  used: number
  limit: number
  remaining: number
}

/**
 * Generate or retrieve anonymous session ID (async)
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(SESSION_COOKIE_NAME)

  if (existing) {
    return existing.value
  }

  // Generate new session ID
  const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

  // Set cookie (30 days expiry)
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })

  return sessionId
}

/**
 * Get anonymous quota from session
 */
export async function getAnonymousQuota(sessionId?: string): Promise<AnonymousQuota> {
  const actualSessionId = sessionId || await getOrCreateSessionId()
  const cookieStore = await cookies()

  // Try to get from cookie first (fast path)
  const quotaCookie = cookieStore.get(QUOTA_COOKIE_NAME)
  let used = 0

  if (quotaCookie) {
    used = parseInt(quotaCookie.value, 10)
  }

  return {
    sessionId: actualSessionId,
    used,
    limit: ANONYMOUS_QUOTA_LIMIT,
    remaining: Math.max(0, ANONYMOUS_QUOTA_LIMIT - used),
  }
}

/**
 * Check if anonymous user can consult
 */
export async function canAnonymousConsult(sessionId?: string): Promise<{
  canConsult: boolean
  quota: AnonymousQuota
  message: string
}> {
  const quota = await getAnonymousQuota(sessionId)

  if (quota.remaining <= 0) {
    return {
      canConsult: false,
      quota,
      message: 'Has usado tus 5 consultas gratis. Regístrate o actualiza a Premium para continuar.',
    }
  }

  return {
    canConsult: true,
    quota,
    message: `${quota.remaining} consultas gratis restantes.`,
  }
}

/**
 * Record anonymous consultation usage
 */
export async function useAnonymousConsultation(sessionId?: string): Promise<AnonymousQuota> {
  const actualSessionId = sessionId || await getOrCreateSessionId()
  const cookieStore = await cookies()

  // Get current usage
  const quotaCookie = cookieStore.get(QUOTA_COOKIE_NAME)
  let used = quotaCookie ? parseInt(quotaCookie.value, 10) : 0

  // Increment and save
  used += 1
  cookieStore.set(QUOTA_COOKIE_NAME, used.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })

  return {
    sessionId: actualSessionId,
    used,
    limit: ANONYMOUS_QUOTA_LIMIT,
    remaining: Math.max(0, ANONYMOUS_QUOTA_LIMIT - used),
  }
}
