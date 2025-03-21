import { supabase } from './supabase';
import { isStorageCorrupted, repairSupabaseAuthStorage } from './storage-utils';

// Maximum number of allowed Supabase auth events in a short time frame
const MAX_AUTH_EVENTS = 10;
// Time window for tracking events (milliseconds)
const EVENT_WINDOW_MS = 5000;

// Track auth events to detect potential loops
const authEvents: number[] = [];

// Initialize auth helper when imported
export const initAuthHelper = () => {
  console.log('[AuthHelper] Initializing auth helper');
  
  // Check if storage is corrupted on startup
  if (isStorageCorrupted('doctormx')) {
    console.warn('[AuthHelper] Detected corrupted storage, repairing...');
    repairSupabaseAuthStorage();
  }
  
  // Set up event monitoring to detect sign-in/sign-out loops
  supabase.auth.onAuthStateChange((event) => {
    // Record timestamp of auth event
    authEvents.push(Date.now());
    
    // Remove events older than our window
    const now = Date.now();
    while (authEvents.length > 0 && authEvents[0] < now - EVENT_WINDOW_MS) {
      authEvents.shift();
    }
    
    // If too many events in a short time, something is wrong
    if (authEvents.length > MAX_AUTH_EVENTS) {
      console.error('[AuthHelper] Detected auth event loop, attempting to fix');
      
      // Clear auth-related storage to break the loop
      repairSupabaseAuthStorage();
      
      // Reset event tracking
      authEvents.length = 0;
      
      // Force page reload to reset app state
      window.location.reload();
    }
  });
  
  // Check for token refresh problems
  monitorTokenRefresh();
};

// Monitor token refresh attempts to catch issues
const monitorTokenRefresh = () => {
  let refreshFailCount = 0;
  
  // Patch the Supabase auth refreshSession method to monitor failures
  const originalRefresh = supabase.auth.refreshSession;
  supabase.auth.refreshSession = async function(...args) {
    try {
      const result = await originalRefresh.apply(this, args);
      
      if (result.error) {
        refreshFailCount++;
        console.warn(`[AuthHelper] Token refresh failed (${refreshFailCount}): ${result.error.message}`);
        
        // After multiple failures, try to repair auth storage
        if (refreshFailCount >= 3) {
          console.error('[AuthHelper] Multiple token refresh failures, repairing storage');
          repairSupabaseAuthStorage();
          refreshFailCount = 0;
        }
      } else {
        // Reset counter on successful refresh
        refreshFailCount = 0;
      }
      
      return result;
    } catch (error) {
      console.error('[AuthHelper] Unexpected error in token refresh:', error);
      return { data: { session: null, user: null }, error };
    }
  };
};

// Export the initialized helper
export default initAuthHelper;