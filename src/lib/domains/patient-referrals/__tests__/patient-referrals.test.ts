import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServiceClient } from '@/lib/supabase/server'
import {
  PATIENT_REFERRAL_CONFIG,
  buildShareUrl,
  getReferralSummaryForUser,
  redeemReferralAtSignup,
  validateReferralCode,
} from '..'

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
}))

function createProfilesSelectMock(options: {
  summaryProfile?: {
    referral_code: string | null
    referral_credits_cents: number | null
    free_ai_consults_remaining: number | null
  }
  referrerLookup?: { id: string; full_name?: string | null } | null
  bonusProfile?: { free_ai_consults_remaining: number | null } | null
  referrerRewardProfile?: {
    free_ai_consults_remaining: number | null
    referral_credits_cents: number | null
  } | null
  refereeRewardProfile?: { free_ai_consults_remaining: number | null } | null
  validateProfile?: { id: string; full_name: string | null } | null
}) {
  let bonusFetchCount = 0

  return vi.fn().mockImplementation((fields: string) => {
    const eq = vi.fn().mockImplementation((column: string) => {
      if (fields.includes('referral_code, referral_credits_cents')) {
        return {
          single: vi.fn().mockResolvedValue({
            data: options.summaryProfile ?? null,
            error: null,
          }),
        }
      }

      if (fields === 'id, full_name') {
        return {
          maybeSingle: vi.fn().mockResolvedValue({
            data: options.validateProfile ?? null,
            error: null,
          }),
        }
      }

      if (fields === 'id' && column === 'referral_code') {
        return {
          maybeSingle: vi.fn().mockResolvedValue({
            data: options.referrerLookup ?? null,
            error: null,
          }),
        }
      }

      if (fields.includes('free_ai_consults_remaining, referral_credits_cents')) {
        return {
          single: vi.fn().mockResolvedValue({
            data: options.referrerRewardProfile ?? null,
            error: null,
          }),
        }
      }

      if (fields === 'free_ai_consults_remaining') {
        bonusFetchCount += 1
        const data =
          bonusFetchCount === 1
            ? options.bonusProfile ?? null
            : options.refereeRewardProfile ?? null

        return {
          single: vi.fn().mockResolvedValue({
            data,
            error: null,
          }),
        }
      }

      if (fields === 'id' && column === 'referee_id') {
        return {
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }
      }

      if (fields === 'id' && column === 'referrer_id') {
        return {
          in: vi.fn().mockResolvedValue({
            count: 0,
            error: null,
          }),
          eq: vi.fn().mockResolvedValue({
            count: 0,
            error: null,
          }),
        }
      }

      return {
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })

    return { eq }
  })
}

describe('patient-referrals domain', () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'https://doctor.mx/'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl
  })

  it('builds a stable share URL from the app base URL', () => {
    expect(buildShareUrl('AB/CD 12')).toBe(
      'https://doctor.mx/auth/register?ref=AB%2FCD%2012'
    )
  })

  it('returns a summary and backfills a missing referral code', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 'REF123', error: null })
    const profilesUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const patientReferralsSelect = vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation((column: string) => {
        if (column === 'referrer_id') {
          return {
            in: vi.fn().mockResolvedValue({ count: 3, error: null }),
            eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
          }
        }

        return {
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }),
    }))

    vi.mocked(createServiceClient).mockReturnValue({
      rpc,
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: createProfilesSelectMock({
              summaryProfile: {
                referral_code: null,
                referral_credits_cents: 12500,
                free_ai_consults_remaining: 2,
              },
            }),
            update: profilesUpdate,
          }
        }

        if (table === 'patient_referrals') {
          return {
            select: patientReferralsSelect,
          }
        }

        throw new Error(`Unexpected table: ${table}`)
      }),
    } as never)

    const summary = await getReferralSummaryForUser('user-1')

    expect(summary).toEqual({
      code: 'REF123',
      shareUrl: 'https://doctor.mx/auth/register?ref=REF123',
      totalRedeemed: 3,
      totalRewarded: 2,
      creditsCents: 12500,
      freeConsultsRemaining: 2,
    })
    expect(rpc).toHaveBeenCalledWith('generate_referral_code')
    expect(profilesUpdate).toHaveBeenCalledWith({ referral_code: 'REF123' })
  })

  it('redeems a valid referral code and applies rewards when under the monthly cap', async () => {
    const profilesUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        is: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    const patientReferralsSelect = vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation((column: string) => {
        if (column === 'referrer_id') {
          return {
            in: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: 2, error: null }),
            }),
            eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
          }
        }

        if (column === 'referee_id') {
          return {
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }

        return {
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }),
    }))

    const profilesSelect = createProfilesSelectMock({
      referrerLookup: { id: 'referrer-1', full_name: 'Ana López' },
      bonusProfile: { free_ai_consults_remaining: 0 },
      referrerRewardProfile: {
        free_ai_consults_remaining: 4,
        referral_credits_cents: 5000,
      },
      refereeRewardProfile: { free_ai_consults_remaining: 1 },
    })

    vi.mocked(createServiceClient).mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: profilesSelect,
            update: profilesUpdate,
          }
        }

        if (table === 'patient_referrals') {
          return {
            select: patientReferralsSelect,
            insert,
          }
        }

        throw new Error(`Unexpected table: ${table}`)
      }),
    } as never)

    const result = await redeemReferralAtSignup({
      newUserId: 'user-2',
      referralCode: 'ref123',
    })

    expect(result).toEqual({
      applied: true,
      refereeBonusApplied: true,
    })
    expect(profilesUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        free_ai_consults_remaining: 1,
      })
    )
    expect(profilesUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        free_ai_consults_remaining: 5,
        referral_credits_cents: 15000,
      })
    )
  })

  it('halts rewards once the monthly cap has been reached', async () => {
    const profilesUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        is: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    const patientReferralsSelect = vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation((column: string) => {
        if (column === 'referrer_id') {
          return {
            in: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({
                count: PATIENT_REFERRAL_CONFIG.MONTHLY_REWARD_CAP,
                error: null,
              }),
            }),
            eq: vi.fn().mockResolvedValue({
              count: PATIENT_REFERRAL_CONFIG.MONTHLY_REWARD_CAP,
              error: null,
            }),
          }
        }

        if (column === 'referee_id') {
          return {
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }

        return {
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }),
    }))

    const profilesSelect = createProfilesSelectMock({
      referrerLookup: { id: 'referrer-1', full_name: 'Ana López' },
      bonusProfile: { free_ai_consults_remaining: 0 },
    })

    vi.mocked(createServiceClient).mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: { success: true, cap_exceeded: true }, error: null }),
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: profilesSelect,
            update: profilesUpdate,
          }
        }

        if (table === 'patient_referrals') {
          return {
            select: patientReferralsSelect,
            insert,
          }
        }

        throw new Error(`Unexpected table: ${table}`)
      }),
    } as never)

    const result = await redeemReferralAtSignup({
      newUserId: 'user-3',
      referralCode: 'ref123',
    })

    expect(result).toEqual({
      applied: true,
      reason: 'monthly_cap_exceeded',
      refereeBonusApplied: true,
    })
  })

  it('rejects malformed referral codes during validation', async () => {
    const result = await validateReferralCode('not-a-code')

    expect(result).toEqual({ valid: false })
  })
})
