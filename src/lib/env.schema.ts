import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_STARTER_PRICE_ID: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_ELITE_PRICE_ID: z.string().optional(),
  STRIPE_CLINIC_PRICE_ID: z.string().optional(),

  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  DEEPSEEK_API_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN: z.string().optional(),
  ENCRYPTION_MASTER_KEY: z.string().min(1).optional(),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),

  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional(),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),

  OLLAMA_PROXY_URL: z.string().optional(),
  OLLAMA_PROXY_KEY: z.string().optional(),

  GOOGLE_MAPS_API_KEY: z.string().optional(),
  INSURER_API_KEY: z.string().optional(),
  BRAVE_SEARCH_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
})

export type ParsedEnv = z.infer<typeof envSchema>

let _parsed: ParsedEnv | null = null
let _error: z.ZodError | null = null

export function resetEnvCache() {
  _parsed = null
  _error = null
}

export function parseEnv(env?: Record<string, string | undefined>): ParsedEnv {
  if (env === undefined) {
    env = process.env
    if (_parsed) return _parsed
  }
  const result = envSchema.safeParse(env)
  if (!result.success) {
    _error = result.error
    const missing = result.error.issues.map((i) => i.path.join('.')).filter(Boolean)
    if (missing.length > 0) {
      console.warn('[ENV] Missing required variables:', missing.join(', '))
    }
    const defaults: ParsedEnv = {
      NODE_ENV: (env.NODE_ENV as ParsedEnv['NODE_ENV']) || 'development',
      VERCEL_ENV: env.VERCEL_ENV as ParsedEnv['VERCEL_ENV'],
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL,
    }
    const parsed = Object.assign(defaults, Object.fromEntries(
      Object.entries(env).filter(([_, v]) => v !== undefined)
    )) as ParsedEnv
    if (env === process.env) _parsed = parsed
    return parsed
  } else {
    if (env === process.env) _parsed = result.data
    return result.data
  }
}

export function hasEnv(key: keyof ParsedEnv): boolean {
  const parsed = parseEnv()
  return Boolean(parsed[key] && String(parsed[key]).length > 0)
}

export function getEnv(key: keyof ParsedEnv): string | undefined {
  const parsed = parseEnv()
  const val = parsed[key]
  return val !== undefined && val !== null ? String(val) : undefined
}
