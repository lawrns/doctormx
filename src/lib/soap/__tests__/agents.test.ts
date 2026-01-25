/**
 * Tests for SOAP Multi-Agent Consultation System
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock OpenAI before importing agents
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}))

// Mock GLM module
vi.mock('@/lib/ai/glm', () => ({
  glmChatCompletion: vi.fn(),
  GLM_CONFIG: {
    models: {
      reasoning: 'glm-4.7',
      costEffective: 'glm-4.5-air',
      vision: 'glm-4.5v',
    },
  },
}))

// Import after mocks
import {
  calculateKendallW,
  getAgreementLevel,
} from '../agents'
import type { SpecialistAssessment, SpecialistRole, UrgencyLevel } from '../types'

// ============================================
// MOCK DATA
// ============================================

function createMockAssessment(
  role: SpecialistRole,
  urgency: UrgencyLevel,
  confidence: number
): SpecialistAssessment {
  return {
    specialistId: role,
    specialist: {
      id: role.substring(0, 4),
      role,
      name: `Dr. ${role}`,
      avatar: `/avatars/${role}.png`,
      description: `${role} specialist`,
    },
    confidence,
    relevance: 0.8,
    clinicalImpression: 'Test impression',
    differentialDiagnoses: [
      {
        name: 'Test diagnosis',
        probability: 0.7,
        supportingEvidence: ['Evidence 1'],
        refutingEvidence: [],
      },
    ],
    redFlags: [],
    contributingFactors: [],
    recommendedTests: ['Test 1'],
    urgencyLevel: urgency,
    shouldRefer: false,
    reasoningNotes: 'Test notes',
    tokensUsed: 500,
    costUSD: 0.001,
    latencyMs: 1000,
  }
}

// ============================================
// KENDALL'S W TESTS
// ============================================

describe('calculateKendallW', () => {
  it('should return 1.0 for single specialist', () => {
    const specialists = [
      createMockAssessment('general-practitioner', 'moderate', 0.8),
    ]

    const kendallW = calculateKendallW(specialists)
    expect(kendallW).toBe(1.0)
  })

  it('should return high agreement when all specialists agree', () => {
    const specialists = [
      createMockAssessment('general-practitioner', 'moderate', 0.8),
      createMockAssessment('dermatologist', 'moderate', 0.75),
      createMockAssessment('internist', 'moderate', 0.8),
      createMockAssessment('psychiatrist', 'moderate', 0.82),
    ]

    const kendallW = calculateKendallW(specialists)
    expect(kendallW).toBeGreaterThanOrEqual(0.8)
  })

  it('should return lower agreement when specialists disagree on urgency', () => {
    const specialists = [
      createMockAssessment('general-practitioner', 'emergency', 0.9),
      createMockAssessment('dermatologist', 'self-care', 0.3),
      createMockAssessment('internist', 'moderate', 0.6),
      createMockAssessment('psychiatrist', 'routine', 0.5),
    ]

    const kendallW = calculateKendallW(specialists)
    // With varying urgency and confidence, expect less than perfect agreement
    expect(kendallW).toBeLessThan(0.9)
  })

  it('should return higher agreement for similar assessments', () => {
    const specialists = [
      createMockAssessment('general-practitioner', 'moderate', 0.7),
      createMockAssessment('dermatologist', 'routine', 0.65),
      createMockAssessment('internist', 'moderate', 0.75),
      createMockAssessment('psychiatrist', 'routine', 0.7),
    ]

    const kendallW = calculateKendallW(specialists)
    // Adjacent urgency levels (moderate/routine) and similar confidence = high agreement
    expect(kendallW).toBeGreaterThanOrEqual(0.5)
  })
})

describe('getAgreementLevel', () => {
  it('should return "strong" for W >= 0.8', () => {
    expect(getAgreementLevel(0.8)).toBe('strong')
    expect(getAgreementLevel(0.95)).toBe('strong')
    expect(getAgreementLevel(1.0)).toBe('strong')
  })

  it('should return "moderate" for W between 0.6 and 0.8', () => {
    expect(getAgreementLevel(0.6)).toBe('moderate')
    expect(getAgreementLevel(0.7)).toBe('moderate')
    expect(getAgreementLevel(0.79)).toBe('moderate')
  })

  it('should return "weak" for W between 0.4 and 0.6', () => {
    expect(getAgreementLevel(0.4)).toBe('weak')
    expect(getAgreementLevel(0.5)).toBe('weak')
    expect(getAgreementLevel(0.59)).toBe('weak')
  })

  it('should return "disagreement" for W < 0.4', () => {
    expect(getAgreementLevel(0.0)).toBe('disagreement')
    expect(getAgreementLevel(0.2)).toBe('disagreement')
    expect(getAgreementLevel(0.39)).toBe('disagreement')
  })
})

// ============================================
// PROMPTS TESTS
// ============================================

describe('prompts', () => {
  it('should export specialist prompts', async () => {
    const {
      GP_SYSTEM_PROMPT,
      DERMATOLOGIST_SYSTEM_PROMPT,
      INTERNIST_SYSTEM_PROMPT,
      PSYCHIATRIST_SYSTEM_PROMPT,
      SUPERVISOR_SYSTEM_PROMPT,
    } = await import('../prompts')

    expect(GP_SYSTEM_PROMPT).toBeDefined()
    expect(GP_SYSTEM_PROMPT).toContain('Medico General')

    expect(DERMATOLOGIST_SYSTEM_PROMPT).toBeDefined()
    expect(DERMATOLOGIST_SYSTEM_PROMPT).toContain('Dermatologa')

    expect(INTERNIST_SYSTEM_PROMPT).toBeDefined()
    expect(INTERNIST_SYSTEM_PROMPT).toContain('Internista')

    expect(PSYCHIATRIST_SYSTEM_PROMPT).toBeDefined()
    expect(PSYCHIATRIST_SYSTEM_PROMPT).toContain('Psiquiatra')

    expect(SUPERVISOR_SYSTEM_PROMPT).toBeDefined()
    expect(SUPERVISOR_SYSTEM_PROMPT).toContain('consenso')
  })

  it('should build patient data prompt correctly', async () => {
    const { buildPatientDataPrompt } = await import('../prompts')

    const subjective = {
      chiefComplaint: 'Dolor de cabeza',
      symptomsDescription: 'Dolor pulsatil',
      symptomDuration: '3 dias',
      symptomSeverity: 7,
      onsetType: 'gradual' as const,
      associatedSymptoms: ['nausea'],
      aggravatingFactors: ['luz'],
      relievingFactors: ['oscuridad'],
      previousTreatments: ['ibuprofeno'],
    }

    const prompt = buildPatientDataPrompt(subjective)

    expect(prompt).toContain('Dolor de cabeza')
    expect(prompt).toContain('Dolor pulsatil')
    expect(prompt).toContain('3 dias')
    expect(prompt).toContain('7/10')
    expect(prompt).toContain('nausea')
    expect(prompt).toContain('luz')
    expect(prompt).toContain('oscuridad')
    expect(prompt).toContain('ibuprofeno')
  })
})

// ============================================
// TYPES TESTS
// ============================================

describe('types', () => {
  it('should export all required types', async () => {
    const types = await import('../types')

    expect(types.SPECIALISTS).toBeDefined()
    expect(types.SPECIALISTS['general-practitioner']).toBeDefined()
    expect(types.SPECIALISTS['dermatologist']).toBeDefined()
    expect(types.SPECIALISTS['internist']).toBeDefined()
    expect(types.SPECIALISTS['psychiatrist']).toBeDefined()
  })
})

// ============================================
// STATE MACHINE TESTS
// ============================================

describe('consultationMachine', () => {
  it('should export state machine and helpers', async () => {
    const {
      consultationMachine,
      getConsultationStatus,
      getConsultationProgress,
    } = await import('../consultation-machine')

    expect(consultationMachine).toBeDefined()
    expect(consultationMachine.id).toBe('soapConsultation')

    expect(getConsultationStatus).toBeDefined()
    expect(getConsultationProgress).toBeDefined()
  })

  it('should map state values correctly', async () => {
    const { getConsultationStatus } = await import('../consultation-machine')

    expect(getConsultationStatus('idle')).toBe('intake')
    expect(getConsultationStatus('intake')).toBe('intake')
    expect(getConsultationStatus('objective')).toBe('objective')
    expect(getConsultationStatus('assessment')).toBe('consulting')
    expect(getConsultationStatus('plan')).toBe('plan')
    expect(getConsultationStatus('review')).toBe('review')
    expect(getConsultationStatus('complete')).toBe('complete')
    expect(getConsultationStatus('escalated')).toBe('escalated')
    expect(getConsultationStatus('error')).toBe('error')
  })
})
