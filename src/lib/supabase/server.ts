import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Helper to get Supabase URL from either standard or VITE_ prefixed env vars
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (!url) {
    throw new Error('Supabase URL must be set via NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL')
  }
  return url
}

// Helper to get Supabase anon key from either standard or VITE_ prefixed env vars
function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Supabase anon key must be set via NEXT_PUBLIC_SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY')
  }
  return key
}

/**
 * Create a Supabase client for server-side operations.
 * Uses cookies() for authentication in App Router.
 *
 * Note: For Next.js 15+ App Router, we use createServerClient which
 * automatically handles cookies through the Request object.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        flowType: 'pkce', // Recommended for server-side
        debug: process.env.NODE_ENV === 'development',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

/**
 * Service role client for server-side operations that bypass RLS
 */
export function createServiceClient() {
  const supabaseUrl = getSupabaseUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}
