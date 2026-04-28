import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { GET, POST } from '@/app/api/patient-referrals/route'
import {
  getReferralSummaryForUser,
  redeemReferralAtSignup,
} from '@/lib/domains/patient-referrals'
import { trackServerEvent } from '@/lib/analytics/posthog'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/domains/patient-referrals', () => ({
  getReferralSummaryForUser: vi.fn(),
  redeemReferralAtSignup: vi.fn(),
}))

vi.mock('@/lib/analytics/posthog', () => ({
  ANALYTICS_EVENTS: {
    REFERRAL_CODE_REDEEMED: 'referral_code_redeemed',
  },
  trackServerEvent: vi.fn().mockResolvedValue({ sent: true }),
}))

describe('/api/patient-referrals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated summary requests', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)

    const request = new Request('http://localhost/api/patient-referrals')
    const response = await GET(request as never)
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('returns the authenticated user summary', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    } as never)
    vi.mocked(getReferralSummaryForUser).mockResolvedValue({
      code: 'ABC123',
      shareUrl: 'https://doctor.mx/auth/register?ref=ABC123',
      totalRedeemed: 4,
      totalRewarded: 3,
      creditsCents: 15000,
      freeConsultsRemaining: 2,
    })

    const request = new Request('http://localhost/api/patient-referrals')
    const response = await GET(request as never)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.summary.code).toBe('ABC123')
    expect(getReferralSummaryForUser).toHaveBeenCalledWith('user-1')
  })

  it('rejects malformed redemption payloads', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    } as never)

    const request = new Request('http://localhost/api/patient-referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: 123 }),
    })

    const response = await POST(request as never)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Invalid referral payload')
  })

  it('redeems a referral code and emits analytics when successful', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-2' } },
        }),
      },
    } as never)
    vi.mocked(redeemReferralAtSignup).mockResolvedValue({
      applied: true,
      refereeBonusApplied: true,
    })
    vi.mocked(getReferralSummaryForUser).mockResolvedValue({
      code: 'ABC123',
      shareUrl: 'https://doctor.mx/auth/register?ref=ABC123',
      totalRedeemed: 1,
      totalRewarded: 1,
      creditsCents: 10000,
      freeConsultsRemaining: 2,
    })

    const request = new Request('http://localhost/api/patient-referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: 'abc123' }),
    })

    const response = await POST(request as never)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.result.applied).toBe(true)
    expect(redeemReferralAtSignup).toHaveBeenCalledWith({
      newUserId: 'user-2',
      referralCode: 'abc123',
    })
    expect(trackServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'referral_code_redeemed',
        distinctId: 'user-2',
        userId: 'user-2',
        pathname: '/api/patient-referrals',
      })
    )
  })
})
