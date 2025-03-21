// App initialization module
// This module handles all the app initialization in a proper sequence

import { ensureDependenciesLoaded, getMissingDependencies } from './lib/dependency-loader';
import { getSupabaseClient } from './lib/supabase';
import { initializePwa } from './pwa';

// Initialize the application
export async function initializeApp(): Promise<boolean> {
  // Create a container for initialization tasks
  const tasks: Promise<any>[] = [];
  const results: Record<string, any> = {};
  
  console.log('[App] Starting application initialization...');
  
  try {
    // First, ensure all external dependencies are loaded
    console.log('[App] Loading external dependencies...');
    await ensureDependenciesLoaded();
    
    // Check for missing dependencies
    const missingDeps = getMissingDependencies();
    if (missingDeps.length > 0) {
      throw new Error(`Missing dependencies after initialization: ${missingDeps.join(', ')}`);
    }
    
    // Initialize Supabase client
    console.log('[App] Initializing Supabase client...');
    const supabaseClient = getSupabaseClient();
    results.supabase = supabaseClient;
    
    // Pre-warm the auth session to prevent race conditions
    tasks.push(
      supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) {
          console.error('[App] Error pre-warming auth session:', error);
          return { success: false, error };
        } else {
          console.log('[App] Auth session pre-warmed:', data.session ? 'Active session' : 'No session');
          return { success: true, hasSession: !!data.session };
        }
      }).catch(error => {
        console.error('[App] Unexpected error pre-warming auth session:', error);
        return { success: false, error };
      })
    );
    
    // Initialize PWA - don't block on this task
    console.log('[App] Initializing PWA features...');
    tasks.push(
      initializePwa().catch(error => {
        console.error('[PWA] Initialization error:', error);
        return { success: false, error };
      })
    );
    
    // Wait for all initialization tasks to complete
    const taskResults = await Promise.allSettled(tasks);
    const failedTasks = taskResults.filter(result => result.status === 'rejected');
    
    if (failedTasks.length > 0) {
      console.warn('[App] Some initialization tasks failed:', failedTasks);
    }
    
    console.log('[App] Application initialized successfully');
    return true;
  } catch (error) {
    console.error('[App] Failed to initialize application:', error);
    return false;
  }
}

// Initialize immediately, but don't block
initializeApp().catch(error => {
  console.error('[App] Unhandled initialization error:', error);
});
