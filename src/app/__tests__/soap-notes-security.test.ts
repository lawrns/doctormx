import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  isFeatureEnabled: vi.fn(),
  generateSoapNote: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: mocks.isFeatureEnabled,
}))

vi.mock('@/lib/domains/soap-notes', () => ({
  SOAP_NOTES_CONFIG: { MAX_TRANSCRIPT_LENGTH: 50000 },
  generateSoapNote: mocks.generateSoapNote,
}))

function request(body: unknown) {
  return new NextRequest('https://doctor.mx/api/soap-notes/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createSupabase({ appointment }: { appointment: Record<string, unknown> | null }) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'doctor-1' } }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === 'doctors') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'doctor-1' }, error: null }),
            }),
          }),
        }
      }

      if (table === 'appointments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: appointment,
                  error: appointment ? null : { message: 'not found' },
                }),
              }),
            }),
          }),
        }
      }

      if (table === 'soap_notes') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }
      }

      return {}
    }),
  }
}

describe('SOAP notes generation security', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.isFeatureEnabled.mockResolvedValue(true)
    mocks.generateSoapNote.mockResolvedValue({ id: 'soap-1', status: 'pending_review' })
  })

  it('requires an appointment id before processing PHI', async () => {
    mocks.createClient.mockResolvedValue(createSupabase({ appointment: null }))
    const { POST } = await import('@/app/api/soap-notes/generate/route')

    const response = await POST(request({ transcript: 'Paciente refiere dolor abdominal desde hace tres dias.' }))

    expect(response.status).toBe(400)
    expect(mocks.generateSoapNote).not.toHaveBeenCalled()
  })

  it('passes patient ownership context into SOAP generation', async () => {
    mocks.createClient.mockResolvedValue(
      createSupabase({
        appointment: { id: 'apt-1', doctor_id: 'doctor-1', patient_id: 'patient-1' },
      })
    )
    const { POST } = await import('@/app/api/soap-notes/generate/route')

    const response = await POST(
      request({
        appointment_id: 'apt-1',
        transcript: 'Paciente refiere dolor abdominal desde hace tres dias.',
      })
    )

    expect(response.status).toBe(201)
    expect(mocks.generateSoapNote).toHaveBeenCalledWith(
      expect.objectContaining({
        doctor_id: 'doctor-1',
        appointment_id: 'apt-1',
        patient_id: 'patient-1',
      })
    )
  })
})
