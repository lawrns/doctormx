import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/ai/consult/route'
import { createClient } from '@/lib/supabase/server'
import { aiChatCompletion } from '@/lib/ai/openai'
import { runSOAPConsultation } from '@/lib/soap/agents'

vi.mock('@/lib/ai/openai', () => ({
  aiChatCompletion: vi.fn(),
}))

vi.mock('@/lib/soap/agents', () => ({
  runSOAPConsultation: vi.fn(),
}))

vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('/api/ai/consult POST', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-123' },
          },
        }),
      },
    } as never)
  })

  it('continues intake conversation when there is not enough information yet', async () => {
    vi.mocked(aiChatCompletion)
      .mockResolvedValueOnce({
        content: JSON.stringify({
          chiefComplaint: 'dolor de garganta',
          symptomsDescription: 'Dolor de garganta desde ayer',
          symptomDuration: '1 día',
          symptomSeverity: 4,
          onsetType: 'gradual',
          associatedSymptoms: ['ardor'],
          aggravatingFactors: [],
          relievingFactors: [],
          previousTreatments: [],
          medicalHistory: '',
          medications: [],
          allergies: [],
          familyHistory: '',
          socialHistory: '',
          enoughInformation: false,
          followUpQuestion: '¿Tienes fiebre o tos?',
          urgencyHint: 'moderate',
        }),
        usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
        costUSD: 0.001,
        model: 'glm-5',
        provider: 'glm',
      })
      .mockResolvedValueOnce({
        content: JSON.stringify({
          urgency: 'moderate',
          specialty: 'medicina general',
          confidence: 0.7,
          redFlags: [],
          recommendedAction: 'book-appointment',
        }),
        usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
        costUSD: 0.001,
        model: 'glm-5',
        provider: 'glm',
      })
      .mockResolvedValueOnce({
        content: '¿Tienes fiebre o tos?',
        usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
        costUSD: 0.001,
        model: 'glm-5',
        provider: 'glm',
      })

    const request = new Request('http://localhost/api/ai/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Me duele la garganta desde ayer' }],
      }),
    })

    const response = await POST(request as never)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.complete).toBe(false)
    expect(json.message).toContain('¿Tienes fiebre o tos?')
    expect(runSOAPConsultation).not.toHaveBeenCalled()
  })

  it('runs SOAP consultation when enough information is available', async () => {
    vi.mocked(aiChatCompletion)
      .mockResolvedValueOnce({
        content: JSON.stringify({
          chiefComplaint: 'dolor de pecho',
          symptomsDescription: 'Dolor de pecho opresivo con falta de aire',
          symptomDuration: '2 horas',
          symptomSeverity: 8,
          onsetType: 'sudden',
          associatedSymptoms: ['falta de aire'],
          aggravatingFactors: ['caminar'],
          relievingFactors: ['reposo'],
          previousTreatments: [],
          medicalHistory: '',
          medications: [],
          allergies: [],
          familyHistory: '',
          socialHistory: '',
          enoughInformation: true,
          followUpQuestion: '¿Se irradia al brazo?',
          urgencyHint: 'urgent',
        }),
        usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
        costUSD: 0.001,
        model: 'glm-5',
        provider: 'glm',
      })
      .mockResolvedValueOnce({
        content: JSON.stringify({
          urgency: 'urgent',
          specialty: 'cardiología',
          confidence: 0.9,
          redFlags: ['dolor de pecho'],
          recommendedAction: 'book-appointment',
        }),
        usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
        costUSD: 0.001,
        model: 'glm-5',
        provider: 'glm',
      })
      .mockResolvedValueOnce({
        content: 'Gracias. Ya tengo suficiente información. [READY_FOR_ANALYSIS: true]',
        usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
        costUSD: 0.001,
        model: 'glm-5',
        provider: 'glm',
      })

    vi.mocked(runSOAPConsultation).mockResolvedValue({
      id: 'soap-1',
      patientId: 'user-123',
      createdAt: new Date(),
      completedAt: new Date(),
      status: 'complete',
      subjective: {
        chiefComplaint: 'dolor de pecho',
        symptomsDescription: 'Dolor de pecho opresivo con falta de aire',
        symptomDuration: '2 horas',
        symptomSeverity: 8,
        onsetType: 'sudden',
        associatedSymptoms: ['falta de aire'],
        aggravatingFactors: ['caminar'],
        relievingFactors: ['reposo'],
        previousTreatments: [],
      },
      objective: {},
      assessment: {
        specialists: [
          {
            specialistId: 'general-practitioner',
            specialist: {
              id: 'gp',
              role: 'general-practitioner',
              name: 'Dr. Garcia',
              avatar: '/avatars/gp.png',
              description: 'Medico General - Evaluacion primaria y triaje',
            },
            confidence: 0.85,
            relevance: 0.9,
            clinicalImpression: 'Requiere valoración cardiovascular pronta.',
            differentialDiagnoses: [
              {
                name: 'Angina inestable',
                probability: 0.7,
                supportingEvidence: ['dolor opresivo'],
                refutingEvidence: [],
              },
            ],
            redFlags: ['dolor de pecho'],
            contributingFactors: [],
            recommendedTests: ['ECG'],
            urgencyLevel: 'urgent',
            shouldRefer: true,
            referralReason: 'Descartar síndrome coronario agudo',
            reasoningNotes: 'Síntomas de alarma cardiovasculares.',
            tokensUsed: 100,
            costUSD: 0.1,
            latencyMs: 1000,
          },
        ],
        consensus: {
          kendallW: 0.85,
          agreementLevel: 'strong',
          primaryDiagnosis: {
            name: 'Angina inestable',
            probability: 0.7,
            supportingEvidence: ['dolor opresivo'],
            refutingEvidence: [],
          },
          differentialDiagnoses: [],
          consensusCategory: 'consistent',
          urgencyLevel: 'urgent',
          combinedRedFlags: ['dolor de pecho'],
          recommendedSpecialty: 'general-practitioner',
          recommendedTests: ['ECG'],
          supervisorSummary: 'Necesita valoración médica pronta.',
          confidenceScore: 0.85,
          requiresHumanReview: true,
        },
      },
      plan: {
        recommendations: ['Acude a valoración médica hoy mismo.'],
        selfCareInstructions: ['Evita esfuerzo físico mientras acudes a consulta.'],
        followUpTiming: '24 horas',
        followUpType: 'in-person',
        referralNeeded: true,
        referralSpecialty: 'general-practitioner',
        referralUrgency: 'urgent',
        returnPrecautions: ['Si empeora, ve a urgencias.'],
        patientEducation: ['El dolor de pecho debe valorarse pronto.'],
      },
      metadata: {
        totalTokens: 100,
        totalCostUSD: 0.1,
        totalLatencyMs: 1000,
        aiModel: 'glm-5',
      },
    })

    const request = new Request('http://localhost/api/ai/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Tengo dolor de pecho' },
          { role: 'assistant', content: '¿Desde cuándo y qué tan intenso es?' },
          { role: 'user', content: 'Desde hace dos horas, es fuerte y me falta el aire' },
          { role: 'assistant', content: '¿Hay algo que lo mejore o empeore?' },
          { role: 'user', content: 'Empeora al caminar y mejora un poco al reposar' },
        ],
      }),
    })

    const response = await POST(request as never)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.complete).toBe(true)
    expect(json.result.primaryDiagnosis).toBe('Angina inestable')
    expect(json.result.urgency).toBe('urgent')
    expect(json.result.recommendations).toContain('Acude a valoración médica hoy mismo.')
    expect(runSOAPConsultation).toHaveBeenCalledOnce()
  })
})
