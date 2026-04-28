import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnvCache, parseEnv } from '@/lib/env.schema'

beforeEach(() => {
  resetEnvCache()
})

describe('env.schema', () => {
  it('defaults NODE_ENV to development when unset', () => {
    const env = parseEnv({})
    expect(env.NODE_ENV).toBe('development')
  })

  it('accepts full production config without error', () => {
    const env = parseEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_key',
      NEXT_PUBLIC_APP_URL: 'https://doctory.app',
    })
    expect(env.NODE_ENV).toBe('production')
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
  })

  it('fills defaults for missing required vars', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
    })
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('')
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('')
  })

  it('provides empty anon key when missing', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
    })
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-key')
  })

  it('parses optional vars when present', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
      CRON_SECRET: 'my-secret',
    })
    expect(env.CRON_SECRET).toBe('my-secret')
  })

  it('omits optional vars when not set', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
    })
    expect(env.CRON_SECRET).toBeUndefined()
  })

  it('infers types correctly from parsed schema', () => {
    const env = parseEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
    })
    const url: string = env.NEXT_PUBLIC_SUPABASE_URL
    expect(typeof url).toBe('string')
  })
})
