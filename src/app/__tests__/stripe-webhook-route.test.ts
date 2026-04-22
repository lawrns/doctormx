import { describe, expect, it, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  sendEmail: vi.fn(),
  sendWhatsAppNotification: vi.fn(),
  updateEq: vi.fn().mockResolvedValue({ error: null }),
  doctorMaybeSingle: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('sig_test'),
  }),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: mocks.constructEvent,
    },
    customers: {
      retrieve: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
}))

vi.mock('@/lib/notifications', () => ({
  sendEmail: mocks.sendEmail,
  getEmailTemplate: vi.fn((content: string) => content),
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendWhatsAppNotification: mocks.sendWhatsAppNotification,
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'doctors') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: mocks.doctorMaybeSingle,
        }
      }

      if (table === 'doctor_subscriptions') {
        return {
          update: vi.fn().mockReturnValue({
            eq: mocks.updateEq,
          }),
        }
      }

      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }
    }),
  })),
}))

describe('Stripe webhook route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.updateEq.mockResolvedValue({ error: null })
    mocks.doctorMaybeSingle.mockResolvedValue({
      data: {
        id: 'doctor-1',
        profile: { full_name: 'Dra. Valeria Mora', phone: '+525511111111' },
      },
      error: null,
    })
  })

  it('marks only the failed invoice subscription as past due', async () => {
    mocks.constructEvent.mockReturnValue({
      id: 'evt_1',
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_1',
          customer: 'cus_1',
          subscription: 'sub_failed',
          hosted_invoice_url: 'https://billing.stripe.test/in_1',
          customer_email: 'doctor@example.com',
        },
      },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')
    const response = await POST({ text: vi.fn().mockResolvedValue('{}') } as never)

    expect(response.status).toBe(200)
    expect(mocks.updateEq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_failed')
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'doctor@example.com',
      })
    )
    expect(mocks.sendWhatsAppNotification).toHaveBeenCalled()
  })
})
