import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
  createVideoRoom: vi.fn(),
  getJoinToken: vi.fn(),
  updateVideoStatus: vi.fn(),
  isVideoAppointmentJoinable: vi.fn(),
  sendEmail: vi.fn(),
  getEmailTemplate: vi.fn((content: string, name?: string) => `${name || ''}${content}`),
  sendDoctorStatusEmail: vi.fn(),
  sendWhatsAppNotification: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
  createServiceClient: mocks.createServiceClient,
}))

vi.mock('@/lib/video/videoService', () => ({
  createVideoRoom: mocks.createVideoRoom,
  getJoinToken: mocks.getJoinToken,
  updateVideoStatus: mocks.updateVideoStatus,
  isVideoAppointmentJoinable: mocks.isVideoAppointmentJoinable,
}))

vi.mock('@/lib/notifications', () => ({
  sendEmail: mocks.sendEmail,
  getEmailTemplate: mocks.getEmailTemplate,
  sendDoctorStatusEmail: mocks.sendDoctorStatusEmail,
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendWhatsAppNotification: mocks.sendWhatsAppNotification,
}))

function request(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init)
}

function createVideoSupabase({
  user = { id: 'patient-1' },
  role = 'patient',
  appointment,
  details,
}: {
  user?: { id: string } | null
  role?: 'patient' | 'doctor'
  appointment: Record<string, unknown>
  details?: Record<string, unknown>
}) {
  const appointmentsSelect = vi
    .fn()
    .mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: appointment, error: null }),
      }),
    })
    .mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: details || null, error: null }),
      }),
    })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role, full_name: role === 'doctor' ? 'Dra. Test' : 'Paciente Test' },
                error: null,
              }),
            }),
          }),
        }
      }

      if (table === 'appointments') {
        return {
          select: appointmentsSelect,
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }

      return {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }
    }),
  }
}

describe('video appointment route stabilization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.updateVideoStatus.mockResolvedValue(undefined)
    mocks.createVideoRoom.mockResolvedValue({
      roomId: 'apt-1',
      roomUrl: 'https://daily.test/apt-1',
    })
    mocks.getJoinToken.mockResolvedValue('join-token')
    mocks.isVideoAppointmentJoinable.mockReturnValue(true)
    mocks.sendEmail.mockResolvedValue({ success: true })
  })

  it('escapes SOAP notes before rendering completion email HTML', async () => {
    const supabase = createVideoSupabase({
      user: { id: 'doctor-1' },
      role: 'doctor',
      appointment: {
        id: 'apt-1',
        doctor_id: 'doctor-1',
        patient_id: 'patient-1',
        start_ts: new Date().toISOString(),
        end_ts: new Date().toISOString(),
        appointment_type: 'video',
        video_status: 'in_progress',
      },
      details: {
        patient: { full_name: 'Paciente', email: 'patient@example.com' },
        doctor: { full_name: 'Dra. <script>' },
      },
    })
    mocks.createClient.mockResolvedValue(supabase)

    const { PATCH } = await import('@/app/api/appointments/[id]/video/route')
    const response = await PATCH(
      request('https://doctory.test/api/appointments/apt-1/video', {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'end',
          consultationNotes: '<img src=x onerror=alert(1)> & follow up',
        }),
      }),
      { params: Promise.resolve({ id: 'apt-1' }) }
    )

    expect(response.status).toBe(200)
    expect(mocks.updateVideoStatus).toHaveBeenCalledWith(
      supabase,
      'apt-1',
      'completed',
      expect.objectContaining({
        consultationNotes: '<img src=x onerror=alert(1)> & follow up',
      })
    )
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('&lt;img src=x onerror=alert(1)&gt; &amp; follow up'),
      })
    )
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.not.stringContaining('<img src=x'),
      })
    )
  })

  it('does not return a null video room to patients before the doctor prepares it', async () => {
    const supabase = createVideoSupabase({
      user: { id: 'patient-1' },
      role: 'patient',
      appointment: {
        id: 'apt-1',
        doctor_id: 'doctor-1',
        patient_id: 'patient-1',
        start_ts: new Date().toISOString(),
        end_ts: new Date().toISOString(),
        appointment_type: 'video',
        video_status: 'pending',
        video_room_url: null,
        video_room_id: null,
      },
    })
    mocks.createClient.mockResolvedValue(supabase)

    const { GET } = await import('@/app/api/appointments/[id]/video/route')
    const response = await GET(
      request('https://doctory.test/api/appointments/apt-1/video'),
      { params: Promise.resolve({ id: 'apt-1' }) }
    )

    expect(response.status).toBe(409)
    expect(mocks.getJoinToken).not.toHaveBeenCalled()
  })

  it('creates a missing video room idempotently when the doctor joins', async () => {
    const supabase = createVideoSupabase({
      user: { id: 'doctor-1' },
      role: 'doctor',
      appointment: {
        id: 'apt-1',
        doctor_id: 'doctor-1',
        patient_id: 'patient-1',
        start_ts: new Date().toISOString(),
        end_ts: new Date().toISOString(),
        appointment_type: 'video',
        video_status: 'pending',
        video_room_url: null,
        video_room_id: null,
      },
    })
    mocks.createClient.mockResolvedValue(supabase)

    const { GET } = await import('@/app/api/appointments/[id]/video/route')
    const response = await GET(
      request('https://doctory.test/api/appointments/apt-1/video'),
      { params: Promise.resolve({ id: 'apt-1' }) }
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.roomUrl).toBe('https://daily.test/apt-1')
    expect(mocks.createVideoRoom).toHaveBeenCalledOnce()
    expect(mocks.getJoinToken).toHaveBeenCalledWith('apt-1', 'doctor-1', 'doctor', 'Dra. Test')
  })
})

describe('subscription cron stabilization', () => {
  const originalSecret = process.env.CRON_SECRET

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret
  })

  it('rejects requests when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET

    const { GET } = await import('@/app/api/cron/subscriptions/route')
    const response = await GET(
      request('https://doctory.test/api/cron/subscriptions', {
        headers: { authorization: 'Bearer undefined' },
      })
    )

    expect(response.status).toBe(401)
  })

  it('hides doctors whose past-due grace period expired', async () => {
    process.env.CRON_SECRET = 'cron-secret'
    const updateIn = vi.fn().mockResolvedValue({ error: null })
    const lt = vi.fn().mockResolvedValue({
      data: [
        { doctor_id: 'doctor-1', stripe_subscription_id: 'sub-1', grace_period_ends_at: '2026-04-01' },
        { doctor_id: 'doctor-1', stripe_subscription_id: 'sub-2', grace_period_ends_at: '2026-04-02' },
        { doctor_id: 'doctor-2', stripe_subscription_id: 'sub-3', grace_period_ends_at: '2026-04-03' },
      ],
      error: null,
    })

    mocks.createServiceClient.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'doctor_subscriptions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  lt,
                }),
              }),
            }),
          }
        }

        if (table === 'doctors') {
          return {
            update: vi.fn().mockReturnValue({
              in: updateIn,
            }),
          }
        }

        throw new Error(`Unexpected table ${table}`)
      }),
    })

    const { GET } = await import('@/app/api/cron/subscriptions/route')
    const response = await GET(
      request('https://doctory.test/api/cron/subscriptions', {
        headers: { authorization: 'Bearer cron-secret' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(updateIn).toHaveBeenCalledWith('id', ['doctor-1', 'doctor-2'])
    expect(payload.hiddenDoctors).toBe(2)
    expect(payload.processed).toBe(3)
  })
})

describe('admin verification route stabilization', () => {
  it('rejects unsafe redirect targets after a valid action', async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: null })
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
              }),
            }),
          }
        }

        if (table === 'doctors') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'doctor-1',
                    status: 'pending',
                    doctor_subscriptions: [],
                    profile: { full_name: 'Dra. Test', email: null, phone: null },
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: updateEq,
            }),
          }
        }

        if (table === 'doctor_verifications') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }

        throw new Error(`Unexpected table ${table}`)
      }),
    })

    const formData = new FormData()
    formData.set('doctorId', 'doctor-1')
    formData.set('action', 'approve')
    formData.set('redirectTo', 'https://evil.test/steal')

    const { POST } = await import('@/app/api/admin/verify-doctor/route')
    const response = await POST(
      request('https://doctory.test/api/admin/verify-doctor', {
        method: 'POST',
        body: formData,
      })
    )

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('https://doctory.test/admin/verify')
    expect(updateEq).toHaveBeenCalledWith('id', 'doctor-1')
  })
})
