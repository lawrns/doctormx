import { NextRequest, NextResponse } from 'next/server'
import { invalidateCurrentSession } from '@/lib/session'
import { logger } from '@/lib/observability/logger'

/**
 * POST /auth/signout
 * Signs out the current user by invalidating their session
 *
 * Returns:
 * - 200: Successfully signed out
 * - 500: Server error during sign out
 */
export async function POST(request: NextRequest) {
  try {
    // Invalidate the current session using our session management function
    await invalidateCurrentSession()

    const origin = request.nextUrl.origin
    return NextResponse.redirect(new URL('/auth/login', origin))
  } catch (error) {
    logger.error('Sign out error:', { error })

    // Return error response but still redirect to login
    // This ensures the user is not stuck even if signout fails
    const origin = request.nextUrl.origin
    return NextResponse.redirect(
      new URL('/auth/login?error=signout_failed', origin)
    )
  }
}
