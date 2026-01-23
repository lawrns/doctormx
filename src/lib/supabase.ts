import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that credentials are provided
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
  // Don't throw - let the app load but log the error
}

// Global variable to store the Supabase instance
let supabaseInstance: SupabaseClient | null = null;
let hasWarnedMultipleInstances = false;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Enhanced singleton with debug logging and error handling
export const getSupabaseClient = () => {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check for existing instance on window object (for multiple module loads)
  if (isBrowser && (window as any).__supabaseInstance) {
    supabaseInstance = (window as any).__supabaseInstance;
    // Reduced logging to avoid console noise
    return supabaseInstance;
  }

  // Create new instance only if none exists
  if (!supabaseInstance) {
    console.log('[Auth] Creating new Supabase client instance');
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          storageKey: 'doctormx-auth-storage',
          autoRefreshToken: true,
          debug: false, // Disable debug to reduce console noise
        }
      });

      // Store on window object to prevent multiple instances
      if (isBrowser) {
        (window as any).__supabaseInstance = supabaseInstance;
        // Add a flag to track instance creation
        (window as any).__supabaseInstanceCount = ((window as any).__supabaseInstanceCount || 0) + 1;

        if ((window as any).__supabaseInstanceCount > 1 && !hasWarnedMultipleInstances) {
          console.warn('[Auth] Multiple Supabase instances detected. Count:', (window as any).__supabaseInstanceCount);
          hasWarnedMultipleInstances = true;
        }
      }
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

// Initialize the client immediately to ensure singleton pattern works
if (typeof window !== 'undefined') {
  // Force initialization on module load
  getSupabaseClient();
}

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