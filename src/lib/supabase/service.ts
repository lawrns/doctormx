import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
 * Service role client for server-side operations that bypass RLS
 * This can be used in both server and edge contexts, but NOT in browser
 */
export function createServiceClient() {
  const supabaseUrl = getSupabaseUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}
