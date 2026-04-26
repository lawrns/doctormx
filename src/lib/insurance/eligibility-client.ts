// Real-time insurance eligibility verification client
// Checks patient coverage against Mexican insurer APIs
// Gracefully degrades to estimation when no API keys configured

export interface EligibilityRequest {
  policyNumber: string
  insurerId: string
  patientName: string
  patientDateOfBirth: string
  serviceType: 'consultation' | 'specialist' | 'diagnostic' | 'surgery'
}

export interface EligibilityResponse {
  status: 'verified' | 'estimated' | 'error'
  patientName?: string
  coveragePercent: number
  copayCents: number
  deductibleCents: number
  deductibleRemainingCents: number
  preAuthRequired: boolean
  expiresAt?: string
  rawResponse?: Record<string, unknown>
}

class InsurerAPIClient {
  private apiKey: string
  private useMock: boolean

  constructor() {
    this.apiKey = process.env.INSURER_API_KEY || ''
    this.useMock = !this.apiKey
  }

  async checkEligibility(request: EligibilityRequest): Promise<EligibilityResponse> {
    if (this.useMock) return this.mockEligibilityCheck(request)

    try {
      const res = await fetch('https://api.insurer-platform.mx/v1/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          policy_number: request.policyNumber,
          insurer_id: request.insurerId,
          patient_name: request.patientName,
          date_of_birth: request.patientDateOfBirth,
          service_type: request.serviceType,
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()

      return {
        status: 'verified',
        patientName: data.patient_name,
        coveragePercent: data.coverage_percent,
        copayCents: data.copay_cents,
        deductibleCents: data.deductible_cents,
        deductibleRemainingCents: data.deductible_remaining_cents,
        preAuthRequired: data.pre_auth_required,
        expiresAt: data.expires_at,
        rawResponse: data,
      }
    } catch (err) {
      console.warn('[Insurance] API call failed, estimating eligibility:', err)
      return this.mockEligibilityCheck(request)
    }
  }

  private mockEligibilityCheck(request: EligibilityRequest): EligibilityResponse {
    const isPrivate = ['AXA', 'GNP', 'MetLife', 'Mapfre'].includes(request.insurerId)
    return {
      status: 'estimated' as const,
      coveragePercent: isPrivate ? 80 : 60,
      copayCents: isPrivate ? 10000 : 20000,
      deductibleCents: isPrivate ? 50000 : 100000,
      deductibleRemainingCents: isPrivate ? 15000 : 50000,
      preAuthRequired: !isPrivate,
    }
  }
}

export const eligibilityClient = new InsurerAPIClient()
