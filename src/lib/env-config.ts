/**
 * Simple environment configuration that doesn't validate on import
 */

export interface EnvironmentConfig {
  OPENAI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  USE_VISION_API: boolean;
  IMAGE_ANALYSIS_MODEL: string;
}

// Lazy getter that only accesses env vars when called
export function getEnvConfig(): EnvironmentConfig {
  return {
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
    USE_VISION_API: import.meta.env.VITE_USE_VISION_API === 'true',
    IMAGE_ANALYSIS_MODEL: import.meta.env.VITE_IMAGE_ANALYSIS_MODEL || 'gpt-4o-2024-11-20'
  };
}

// For debugging
if (import.meta.env.DEV) {
  console.log('[ENV-CONFIG] Module loaded, env vars will be accessed lazily');
}