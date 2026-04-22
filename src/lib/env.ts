/**
 * Environment Variable Validator and Configuration Manager
 * 
 * This module provides comprehensive validation and typed access to all
 * environment variables used in the Doctory telemedicine application.
 * 
 * Usage:
 *   import { validateEnv, getSupabaseConfig, getStripeConfig } from '@/lib/env';
 *   
 *   // Validate at startup (throws if critical vars are missing)
 *   validateEnv();
 *   
 *   // Access typed configurations
 *   const supabase = getSupabaseConfig();
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey?: string;
  webhookSecret?: string;
}

export interface AIConfig {
  primaryKey: string;
  fallbackKey?: string;
  provider: 'glm' | 'kimi' | 'openai' | 'fallback';
}

export interface RedisConfig {
  restUrl?: string;
  restToken?: string;
  redisUrl?: string;
}

export interface SentryConfig {
  dsn?: string;
  publicDsn?: string;
}

export interface AppConfig {
  url: string;
  environment: Environment;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  isTest: boolean;
}

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  environment: Environment;
}

// ============================================================================
// Environment Detection
// ============================================================================

function getEnvironment(): Environment {
  const env = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;
  
  if (env === 'test' || process.env.VITEST) return 'test';
  if (vercelEnv === 'production') return 'production';
  if (vercelEnv === 'preview') return 'staging';
  if (env === 'production') return 'production';
  if (env === 'development') return 'development';
  
  return 'development';
}

const ENVIRONMENT = getEnvironment();

// ============================================================================
// Variable Definitions
// ============================================================================

interface EnvVarDef {
  name: string;
  required: boolean | ((env: Environment) => boolean);
  category: string;
  description: string;
  isPublic?: boolean;
}

const ENV_VARS: EnvVarDef[] = [
  // Supabase
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    category: 'Supabase',
    description: 'Supabase project URL',
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    category: 'Supabase',
    description: 'Supabase anonymous key for client-side auth',
    isPublic: true,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: (env) => env === 'production' || env === 'staging',
    category: 'Supabase',
    description: 'Supabase service role key for server-side operations',
  },
  
  // Stripe
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    category: 'Stripe',
    description: 'Stripe publishable key for client-side payment UI',
    isPublic: true,
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: (env) => env === 'production' || env === 'staging',
    category: 'Stripe',
    description: 'Stripe secret key for server-side payment operations',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: (env) => env === 'production' || env === 'staging',
    category: 'Stripe',
    description: 'Stripe webhook endpoint secret for verifying webhooks',
  },
  
  // AI
  {
    name: 'GLM_API_KEY',
    required: false,
    category: 'AI',
    description: 'GLM (Zhipu AI) API key for primary AI features',
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    category: 'AI',
    description: 'OpenAI API key for fallback AI features',
  },
  
  // Redis (Upstash)
  {
    name: 'UPSTASH_REDIS_REST_URL',
    required: false,
    category: 'Redis',
    description: 'Upstash Redis REST API URL',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    category: 'Redis',
    description: 'Upstash Redis REST API token',
  },
  {
    name: 'REDIS_URL',
    required: false,
    category: 'Redis',
    description: 'Redis protocol URL for Fly/Redis Cloud compatible Redis',
  },
  
  // Sentry
  {
    name: 'SENTRY_DSN',
    required: false,
    category: 'Sentry',
    description: 'Sentry DSN for server-side error tracking',
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    category: 'Sentry',
    description: 'Sentry DSN for client-side error tracking',
    isPublic: true,
  },
  
  // App
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    category: 'App',
    description: 'Public URL of the application',
    isPublic: true,
  },
  // WhatsApp Business API
  {
    name: 'WHATSAPP_PHONE_NUMBER_ID',
    required: (env) => env === 'production' || env === 'staging',
    category: 'WhatsApp',
    description: 'WhatsApp Business API phone number ID from Meta',
  },
  {
    name: 'WHATSAPP_ACCESS_TOKEN',
    required: (env) => env === 'production' || env === 'staging',
    category: 'WhatsApp',
    description: 'WhatsApp Business API access token from Meta',
  },
  {
    name: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
    required: (env) => env === 'production' || env === 'staging',
    category: 'WhatsApp',
    description: 'Webhook verification token for Meta webhook setup',
  },
  {
    name: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
    required: false,
    category: 'WhatsApp',
    description: 'WhatsApp Business Account ID for analytics',
  },
  
];

// ============================================================================
// Validation Logic
// ============================================================================

function isRequired(def: EnvVarDef, env: Environment): boolean {
  if (typeof def.required === 'function') {
    return def.required(env);
  }
  return def.required;
}

function getEnvValue(name: string): string | undefined {
  return process.env[name];
}

function validateVariable(def: EnvVarDef, env: Environment): { valid: boolean; error?: string } {
  const value = getEnvValue(def.name);
  const required = isRequired(def, env);
  
  if (required && !value) {
    return {
      valid: false,
      error: `Missing required environment variable: ${def.name} (${def.category}: ${def.description})`,
    };
  }
  
  if (value) {
    // Validate URL format for URL variables
    if (def.name.includes('_URL') && !value.startsWith('http')) {
      return {
        valid: false,
        error: `Invalid URL format for ${def.name}: must start with http:// or https://`,
      };
    }
    
    // Validate key format for key variables
    if (def.name.includes('_KEY') && value.length < 10) {
      return {
        valid: false,
        error: `Invalid key format for ${def.name}: key appears too short`,
      };
    }
  }
  
  return { valid: true };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Validates all environment variables based on current environment.
 * Should be called at application startup.
 * 
 * @throws Error if critical environment variables are missing or invalid
 * @returns Validation result with details
 */
export function validateEnv(strict: boolean = true): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  
  for (const def of ENV_VARS) {
    const result = validateVariable(def, ENVIRONMENT);
    
    if (!result.valid) {
      if (isRequired(def, ENVIRONMENT)) {
        missing.push(def.name);
        errors.push(result.error!);
      } else {
        warnings.push(`Optional variable ${def.name} is not set`);
      }
    }
  }
  
  // Special validation: at least one AI key should be present in production
  if (ENVIRONMENT === 'production' || ENVIRONMENT === 'staging') {
    const hasGLM = !!getEnvValue('GLM_API_KEY');
    const hasOpenAI = !!getEnvValue('OPENAI_API_KEY');
    
    if (!hasGLM && !hasOpenAI) {
      const msg = 'At least one AI API key (GLM_API_KEY or OPENAI_API_KEY) is recommended for production/staging';
      warnings.push(msg);
    }
  }
  
  const result: EnvValidationResult = {
    valid: missing.length === 0,
    missing,
    warnings,
    environment: ENVIRONMENT,
  };
  
  if (strict && !result.valid) {
    throw new Error(
      `Environment validation failed for ${ENVIRONMENT}:\n` +
      errors.map(e => `  - ${e}`).join('\n')
    );
  }
  
  // Log warnings in non-test environments
  if (warnings.length > 0 && ENVIRONMENT !== 'test') {
    console.warn('[ENV] Configuration warnings:\n', warnings.map(w => `  - ${w}`).join('\n'));
  }
  
  return result;
}

/**
 * Get Supabase configuration
 * @throws Error if required Supabase variables are not set
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const serviceRoleKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }
  
  return {
    url,
    anonKey,
    serviceRoleKey: serviceRoleKey || undefined,
  };
}

/**
 * Get Stripe configuration
 * @throws Error if required Stripe variables are not set
 */
export function getStripeConfig(): StripeConfig {
  const publishableKey = getEnvValue('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  const secretKey = getEnvValue('STRIPE_SECRET_KEY');
  const webhookSecret = getEnvValue('STRIPE_WEBHOOK_SECRET');
  
  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  }
  
  return {
    publishableKey,
    secretKey: secretKey || undefined,
    webhookSecret: webhookSecret || undefined,
  };
}

/**
 * Get AI configuration
 * Returns the primary AI key with fallback support
 */
export function getAIConfig(): AIConfig {
  const glmKey = getEnvValue('GLM_API_KEY');
  const kimiKey = getEnvValue('KIMI_API_KEY');
  const openAIKey = getEnvValue('OPENAI_API_KEY');
  
  if (glmKey) {
    return {
      primaryKey: glmKey,
      fallbackKey: kimiKey || openAIKey || undefined,
      provider: 'glm',
    };
  }

  if (kimiKey) {
    return {
      primaryKey: kimiKey,
      fallbackKey: openAIKey || undefined,
      provider: 'kimi',
    };
  }
  
  if (openAIKey) {
    return {
      primaryKey: openAIKey,
      provider: 'openai',
    };
  }
  
  // Return empty config for development (will fail when actually used)
  return {
    primaryKey: '',
    provider: 'fallback',
  };
}

/**
 * Get Redis configuration
 * @throws Error if required Redis variables are not set in production/staging
 */
export function getRedisConfig(): RedisConfig {
  const restUrl = getEnvValue('UPSTASH_REDIS_REST_URL');
  const restToken = getEnvValue('UPSTASH_REDIS_REST_TOKEN');
  const redisUrl = getEnvValue('REDIS_URL');
  
  if (ENVIRONMENT === 'production' || ENVIRONMENT === 'staging') {
    if (!redisUrl && !(restUrl && restToken)) {
      throw new Error('Redis is required in production/staging: set REDIS_URL or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN');
    }
  }
  
  return {
    restUrl: restUrl || undefined,
    restToken: restToken || undefined,
    redisUrl: redisUrl || undefined,
  };
}

/**
 * Get Sentry configuration
 */
export function getSentryConfig(): SentryConfig {
  return {
    dsn: getEnvValue('SENTRY_DSN') || undefined,
    publicDsn: getEnvValue('NEXT_PUBLIC_SENTRY_DSN') || undefined,
  };
}

/**
 * Get application configuration
 */
export function getAppConfig(): AppConfig {
  const url = getEnvValue('NEXT_PUBLIC_APP_URL');
  
  if (!url && ENVIRONMENT !== 'test') {
    console.warn('[ENV] NEXT_PUBLIC_APP_URL is not set, using default');
  }
  
  const defaultUrl = ENVIRONMENT === 'production' 
    ? 'https://doctory.app' 
    : ENVIRONMENT === 'staging'
    ? 'https://staging.doctory.app'
    : 'http://localhost:3000';
  
  return {
    url: url || defaultUrl,
    environment: ENVIRONMENT,
    isDevelopment: ENVIRONMENT === 'development',
    isStaging: ENVIRONMENT === 'staging',
    isProduction: ENVIRONMENT === 'production',
    isTest: ENVIRONMENT === 'test',
  };
}

/**
 * Get a specific environment variable value
 * @param name - Name of the environment variable
 * @param defaultValue - Optional default value if not set
 */
export function getEnv(name: string, defaultValue?: string): string | undefined {
  return getEnvValue(name) || defaultValue;
}

/**
 * Check if running in a specific environment
 */
export function isEnvironment(env: Environment): boolean {
  return ENVIRONMENT === env;
}

/**
 * Get current environment name
 */
export function getCurrentEnvironment(): Environment {
  return ENVIRONMENT;
}

// ============================================================================
// Auto-validation (runs on module import in non-test environments)
// ============================================================================

if (typeof window === 'undefined' && ENVIRONMENT !== 'test') {
  // Server-side only: validate on startup
  try {
    validateEnv(false); // Non-strict validation for development
  } catch (error) {
    console.error('[ENV] Failed to validate environment:', error);
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  validateEnv,
  getSupabaseConfig,
  getStripeConfig,
  getAIConfig,
  getRedisConfig,
  getSentryConfig,
  getAppConfig,
  getEnv,
  isEnvironment,
  getCurrentEnvironment,
  ENVIRONMENT,
};
