import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

const FALLBACK_SUPABASE_URL = 'http://127.0.0.1:54321'
const FALLBACK_SUPABASE_ANON_KEY = 'local-test-anon-key'

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

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  const browserSupabaseUrl = supabaseUrl || FALLBACK_SUPABASE_URL
  const browserSupabaseAnonKey = supabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY

  supabaseInstance = createBrowserClient(browserSupabaseUrl, browserSupabaseAnonKey)
  return supabaseInstance
}
