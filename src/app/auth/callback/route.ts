import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

function isSafeInternalPath(value: string | null): value is string {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//'))
}

function buildRedirectTarget(request: NextRequest) {
  const nextParam = request.nextUrl.searchParams.get('next')
  const redirectParam = request.nextUrl.searchParams.get('redirect')
  const target = isSafeInternalPath(nextParam)
    ? nextParam
    : isSafeInternalPath(redirectParam)
      ? redirectParam
      : '/app'

  return new URL(target, request.url)
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'auth-config-missing')
    return NextResponse.redirect(loginUrl)
  }

  const redirectResponse = NextResponse.redirect(buildRedirectTarget(request))
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          redirectResponse.cookies.set(name, value, {
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
          })
        )
      },
    },
  })

  const errorDescription =
    request.nextUrl.searchParams.get('error_description') ||
    request.nextUrl.searchParams.get('error')

  if (errorDescription) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', errorDescription)
    return NextResponse.redirect(loginUrl)
  }

  const code = request.nextUrl.searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'oauth-callback-failed')
      return NextResponse.redirect(loginUrl)
    }
  }

  return redirectResponse
}
