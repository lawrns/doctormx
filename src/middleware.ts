import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import {
  requiresCSRFProtection,
  generateCSRFToken,
  validateCSRFToken,
  getCSRFCookie,
  setCSRFCookie,
  createCSRFErrorResponse,
} from '@/lib/csrf'

export async function middleware(request: NextRequest) {
  // First run session authentication
  const sessionResponse = await updateSession(request)

  // Enforce CSRF protection on state-changing methods
  if (requiresCSRFProtection(request)) {
    const csrfToken = getCSRFCookie(request)

    // Validate CSRF token if user is authenticated
    const hasAuthCookie = request.cookies.has('sb-access-token') ||
                          request.cookies.has('sb-refresh-token')

    if (hasAuthCookie) {
      const isValid = validateCSRFToken(request, csrfToken || '', true)

      if (!isValid.valid) {
        return createCSRFErrorResponse(isValid)
      }
    }
  }

  // Generate and set CSRF token for authenticated users on GET requests
  if (request.method === 'GET') {
    const hasAuthCookie = request.cookies.has('sb-access-token') ||
                          request.cookies.has('sb-refresh-token')

    if (hasAuthCookie && !getCSRFCookie(request)) {
      const csrf = generateCSRFToken()
      // Clone the response to set the cookie
      const response = NextResponse.next({ request })
      setCSRFCookie(response, csrf.token)
      return response
    }
  }

  return sessionResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
