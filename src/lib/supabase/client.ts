import { createBrowserClient } from '@supabase/ssr'

type BrowserClient = ReturnType<typeof createBrowserClient>

let supabaseInstance: BrowserClient | null = null

const AUTH_CONFIG_ERROR_MESSAGE =
  'Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'

function createDisabledQuery(mode: 'collection' | 'single' = 'collection') {
  const resolvedValue =
    mode === 'collection'
      ? { data: [], error: null as null, count: 0 }
      : { data: null, error: null as null, count: 0 }

  function proxyTarget() {
    return proxy
  }

  const proxy = new Proxy(proxyTarget, {
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
        return (...args: unknown[]) => {
          void args
          return proxy
        }
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
        prop === 'createSignedUrl' ||
        prop === 'createSignedUrls' ||
        prop === 'upload' ||
        prop === 'update' ||
        prop === 'upsert' ||
        prop === 'insert' ||
        prop === 'delete' ||
        prop === 'remove' ||
        prop === 'move' ||
        prop === 'list' ||
        prop === 'download' ||
        prop === 'rpc'
      ) {
        return async () => ({ data: null, error: null })
      }

      return (...args: unknown[]) => {
        void args
        return proxy
      }
    },
  })

  return proxy
}

function createDisabledChannel() {
  const channel = {
    on: (...args: unknown[]) => {
      void args
      return channel
    },
    subscribe: (...args: unknown[]) => {
      void args
      return channel
    },
  }

  return channel
}

function createDisabledAuth() {
  const configError = new Error(AUTH_CONFIG_ERROR_MESSAGE)

  return {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: configError,
    }),
    signInWithOAuth: async () => ({
      data: { provider: null, url: null },
      error: configError,
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: configError,
    }),
    resetPasswordForEmail: async () => ({
      data: { user: null, session: null },
      error: configError,
    }),
    updateUser: async () => ({
      data: { user: null, session: null },
      error: configError,
    }),
    signOut: async () => ({ error: configError }),
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

function createDisabledSupabaseClient() {
  return {
    auth: createDisabledAuth(),
    from: () => createDisabledQuery(),
    rpc: async () => ({ data: null, error: null }),
    storage: createDisabledStorage(),
    channel: () => createDisabledChannel(),
    removeChannel: async () => null,
  }
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return { supabaseUrl, supabaseAnonKey }
}

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  if (typeof window === 'undefined') {
    supabaseInstance = createDisabledSupabaseClient() as BrowserClient
    return supabaseInstance
  }

  const config = getSupabaseConfig()
  if (!config) {
    supabaseInstance = createDisabledSupabaseClient() as BrowserClient
    return supabaseInstance
  }

  supabaseInstance = createBrowserClient(config.supabaseUrl, config.supabaseAnonKey)
  return supabaseInstance
}
