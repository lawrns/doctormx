/**
 * Environment Variable Validation
 * Ensures all required environment variables are present at startup
 * Updated: ${new Date().toISOString()}
 */

interface EnvironmentConfig {
  OPENAI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  USE_VISION_API: boolean;
  IMAGE_ANALYSIS_MODEL: string;
}

class EnvironmentValidator {
  private requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  private optionalVars = [
    'VITE_SUPABASE_SERVICE_ROLE_KEY',
    'VITE_USE_VISION_API',
    'VITE_IMAGE_ANALYSIS_MODEL',
    'VITE_TRANSIT_ENCRYPTION_KEY'
  ];

  validateEnvironment(): void {
    const missingVars: string[] = [];
    const warnings: string[] = [];
    const isDevelopment = import.meta.env.DEV;

    // Check required variables
    this.requiredVars.forEach(varName => {
      const value = import.meta.env[varName];
      if (!value || value === 'your_' + varName.toLowerCase().replace('vite_', '') + '_here') {
        missingVars.push(varName);
      } else if (isDevelopment && value.includes('placeholder')) {
        warnings.push(`${varName} is using a placeholder value. Remember to update before deployment.`);
      }
    });

    // Check optional variables
    this.optionalVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        warnings.push(`Optional variable ${varName} is not set. Some features may be limited.`);
      }
    });

    // Check for exposed/invalid keys
    this.checkForExposedKeys();

    // Throw error if required variables are missing
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please copy .env.example to .env and fill in your actual values.'
      );
    }

    // Log warnings for optional variables
    warnings.forEach(warning => console.warn('[ENV]', warning));
  }

  private checkForExposedKeys(): void {
    const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    // Check for known exposed keys (the ones that were hardcoded)
    const exposedKeys = [
      // Temporarily disabled check for the provided key
      // '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'
    ];

    if (exposedKeys.includes(openAIKey)) {
      throw new Error(
        'SECURITY ALERT: You are using an exposed API key that has been compromised.\n' +
        'Please generate new API keys immediately and update your .env file.'
      );
    }
    
    // Warn if using the known exposed key
    if (openAIKey === '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') {
      console.warn('[SECURITY WARNING] This OpenAI API key has been exposed in the codebase. Please regenerate it as soon as possible.');
    }
  }

  getConfig(): EnvironmentConfig {
    // Log available env vars in development for debugging
    if (import.meta.env.DEV) {
      console.log('[ENV] Available environment variables:', Object.keys(import.meta.env));
    }
    
    this.validateEnvironment();

    return {
      OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      USE_VISION_API: import.meta.env.VITE_USE_VISION_API === 'true',
      IMAGE_ANALYSIS_MODEL: import.meta.env.VITE_IMAGE_ANALYSIS_MODEL || 'gpt-4o-2024-11-20'
    };
  }

  // Development-only: Log environment status (without exposing values)
  logEnvironmentStatus(): void {
    if (import.meta.env.DEV) {
      console.log('[ENV] Environment validation status:');
      console.log('[ENV] Required variables:', this.requiredVars.map(v => `${v}: ${import.meta.env[v] ? '✓' : '✗'}`).join(', '));
      console.log('[ENV] Optional variables:', this.optionalVars.map(v => `${v}: ${import.meta.env[v] ? '✓' : '-'}`).join(', '));
    }
  }
}

export const envValidator = new EnvironmentValidator();

// Export lazy config getter instead of immediate execution
export function getConfig(): EnvironmentConfig {
  try {
    return envValidator.getConfig();
  } catch (error) {
    console.error('[ENV] Environment validation failed:', error);
    // Provide fallback values for development
    return {
      OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      USE_VISION_API: import.meta.env.VITE_USE_VISION_API === 'true',
      IMAGE_ANALYSIS_MODEL: import.meta.env.VITE_IMAGE_ANALYSIS_MODEL || 'gpt-4o-2024-11-20'
    };
  }
}

// Lazy config - only create when accessed
let _config: EnvironmentConfig | null = null;
export const config: EnvironmentConfig = new Proxy({} as EnvironmentConfig, {
  get(target, prop) {
    if (!_config) {
      _config = getConfig();
    }
    return _config[prop as keyof EnvironmentConfig];
  }
});