import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'example-key';

// Global variable to store the Supabase instance
let supabaseInstance: SupabaseClient | null = null;

// Enhanced singleton with debug logging and error handling
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    console.log('[Auth] Creating new Supabase client instance');
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          storageKey: 'doctormx-auth-storage',
          autoRefreshToken: true,
          debug: import.meta.env.DEV, // Enable debug only in development
        }
      });
    } catch (error) {
      console.error('[Auth] Error creating Supabase client:', error);
      // Create a fallback instance with minimal functionality
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
  }
  return supabaseInstance;
};

// Create and export the Supabase client
export const supabase = getSupabaseClient();

// Helper function to detect and fix auth state issues
export const checkAndFixAuthState = async () => {
  const client = getSupabaseClient();
  try {
    // Get current session
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
      console.error('[Auth] Session check error:', error);
      return false;
    }
    
    if (!session) {
      console.log('[Auth] No active session found');
      return false;
    }
    
    // Check if token is about to expire (within next 5 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;
    
    if (expiresAt && (expiresAt - now < fiveMinutes)) {
      console.log('[Auth] Token near expiration, refreshing...');
      const { data, error: refreshError } = await client.auth.refreshSession();
      
      if (refreshError) {
        console.error('[Auth] Token refresh error:', refreshError);
        return false;
      }
      
      console.log('[Auth] Token refreshed successfully');
    }
    
    return true;
  } catch (e) {
    console.error('[Auth] Unexpected error checking auth state:', e);
    return false;
  }
};