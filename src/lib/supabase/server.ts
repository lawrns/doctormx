import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function createDisabledQuery(mode: 'collection' | 'single' = 'collection') {
  const resolvedValue =
    mode === 'collection'
      ? { data: [], error: null as null, count: 0 }
      : { data: null, error: null as null, count: 0 }

  let proxy: any
  proxy = new Proxy(() => proxy, {
    apply: () => proxy,
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (value: typeof resolvedValue) => void) =>
          resolve(resolvedValue)
      }

      if (prop === 'single' || prop === 'maybeSingle') {
        return async () => ({ data: null, error: null })
      }

      if (prop === 'select') {
        return (..._args: unknown[]) => proxy
      }

      if (prop === 'getPublicUrl') {
        return () => ({
          data: {
            publicUrl: '',
          },
          error: null,
        })
      }

      if (
        prop === 'update' ||
        prop === 'upsert' ||
        prop === 'insert' ||
        prop === 'delete' ||
        prop === 'remove' ||
        prop === 'move'
      ) {
        return (..._args: unknown[]) => proxy
      }

      if (
        prop === 'createSignedUrl' ||
        prop === 'createSignedUrls' ||
        prop === 'upload' ||
        prop === 'list' ||
        prop === 'download' ||
        prop === 'rpc'
      ) {
        return async () => ({ data: null, error: null })
      }

      return (..._args: unknown[]) => proxy
    },
  })

  return proxy
}

function createDisabledAuth() {
  return {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: null,
    }),
    signInWithOAuth: async () => ({
      data: { provider: null, url: null },
      error: null,
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: null,
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    }),
  }
}

function createDisabledStorage() {
  return {
    from: () => createDisabledQuery(),
  }
}

function createFallbackSupabaseClient() {
  return {
    auth: createDisabledAuth(),
    from: () => createDisabledQuery(),
    rpc: async () => ({ data: null, error: null }),
    storage: createDisabledStorage(),
  }
}

function warnOnce(message: string) {
  if (typeof process !== 'undefined' && process.env?.['_SUPABASE_WARNED']) return
  if (typeof process !== 'undefined') process.env['_SUPABASE_WARNED'] = '1'
  console.warn(`[Supabase] ${message}`)
}

function getSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url || null
}

function getSupabaseAnonKey(): string | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return key || null
}

export async function createClient() {
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  if (!supabaseUrl || !supabaseAnonKey) {
    warnOnce('NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set — using no-op fallback client')
    return createFallbackSupabaseClient() as unknown as ReturnType<
      typeof createServerClient
    >
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
              })
            )
          } catch {
            // Called from a Server Component - ignore
          }
        },
      },
    }
  )
}

// Service role client for server-side operations that bypass RLS
export function createServiceClient() {
  const supabaseUrl = getSupabaseUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    warnOnce('SUPABASE_SERVICE_ROLE_KEY not set — using no-op fallback for createServiceClient')
    return createFallbackSupabaseClient() as unknown as ReturnType<
      typeof createSupabaseClient
    >
  }
  
  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}
