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

/**
 * Security Headers Configuration
 * Implements defense in depth strategy for web security
 * 
 * Headers Applied:
 * - Content-Security-Policy: Prevents XSS and data injection
 * - Strict-Transport-Security: Enforces HTTPS connections
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME sniffing
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Restricts browser features
 */

// CSP Policy - Production ready with necessary exemptions for healthcare platform
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://js.stripe.com',
    'https://*.stripe.com',
    'https://cdn.jsdelivr.net',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.stripe.com',
    'https://*.googleusercontent.com',
    'https://images.unsplash.com',
    'https://avatars.githubusercontent.com',
    'https://res.cloudinary.com',
    'https://i.pravatar.cc',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://*.stripe.com',
    'https://api.stripe.com',
    'https://meet.jit.si',
    'https://*.daily.co',
    'wss://*.supabase.co',
  ],
  'frame-src': [
    "'self'",
    'https://*.stripe.com',
    'https://js.stripe.com',
    'https://hooks.stripe.com',
    'https://meet.jit.si',
    'https://*.daily.co',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
}

/**
 * Build Content Security Policy header string
 */
function buildCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy - Primary XSS protection
  response.headers.set('Content-Security-Policy', buildCSP())
  
  // Strict Transport Security - Force HTTPS for 2 years
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  
  // X-Frame-Options - Clickjacking protection (redundant with CSP frame-ancestors)
  response.headers.set('X-Frame-Options', 'DENY')
  
  // X-Content-Type-Options - Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer Policy - Limit referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy - Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(self), geolocation=(self), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  )
  
  // X-XSS-Protection - Legacy browser protection (redundant with CSP)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Remove headers that leak information
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  
  return response
}

/**
 * Log security event for monitoring
 */
async function logSecurityEvent(
  request: NextRequest,
  event: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const { logger } = await import('@/lib/observability/logger')
    logger.info(`[Security] ${event}`, {
      path: request.nextUrl.pathname,
      method: request.method,
      ip: request.ip || request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      ...details
    })
  } catch {
    // Non-blocking: logging failures shouldn't break requests
  }
}

export async function middleware(request: NextRequest) {
  // First run session authentication
  let response = await updateSession(request)

  // Apply security headers to all responses
  response = applySecurityHeaders(response)

  // Enforce CSRF protection on state-changing methods
  if (requiresCSRFProtection(request)) {
    const csrfToken = getCSRFCookie(request)

    // Validate CSRF token if user is authenticated
    const hasAuthCookie = request.cookies.has('sb-access-token') ||
                          request.cookies.has('sb-refresh-token')

    if (hasAuthCookie) {
      const isValid = validateCSRFToken(request, csrfToken || '', true)

      if (!isValid.valid) {
        await logSecurityEvent(request, 'CSRF validation failed', { 
          reason: isValid.error 
        })
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
      response = NextResponse.next({ request })
      setCSRFCookie(response, csrf.token)
      response = applySecurityHeaders(response)
      return response
    }
  }

  // Security: Log suspicious requests
  const userAgent = request.headers.get('user-agent') || ''
  const isSuspicious = 
    userAgent.includes('sqlmap') ||
    userAgent.includes('nikto') ||
    userAgent.includes('nmap') ||
    request.nextUrl.pathname.includes('wp-admin') ||
    request.nextUrl.pathname.includes('.env') ||
    request.nextUrl.pathname.includes('config.php')

  if (isSuspicious) {
    await logSecurityEvent(request, 'Suspicious request detected', {
      userAgent,
      path: request.nextUrl.pathname
    })
    
    // Return 404 for suspicious paths to avoid revealing application structure
    if (request.nextUrl.pathname.includes('wp-admin') ||
        request.nextUrl.pathname.includes('.env') ||
        request.nextUrl.pathname.includes('config.php')) {
      return new NextResponse('Not Found', { 
        status: 404,
        headers: {
          'Content-Security-Policy': buildCSP(),
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
        }
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
