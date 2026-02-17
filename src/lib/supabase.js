/**
 * Legacy supabase.js module for backward compatibility
 * This module exports the Supabase client and auth helper functions
 */

import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance = null;

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // For SSR/build time, return a mock
  if (typeof window === 'undefined') {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
      },
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured');
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export singleton supabase client
export const supabase = {
  get auth() {
    return getSupabaseClient().auth;
  },
};

/**
 * Get current user from session
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function getCurrentUser() {
  try {
    const client = getSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error) {
      return { user: null, error };
    }
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: Error|null}>}
 */
export async function signOutUser() {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}
