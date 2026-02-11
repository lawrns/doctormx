import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Only create client on client side with valid env vars
  if (typeof window === 'undefined') {
    // Server-side - return a mock that throws on use
    throw new Error('Supabase client should only be used on client side')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build-time
    throw new Error('Supabase credentials not configured')
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

