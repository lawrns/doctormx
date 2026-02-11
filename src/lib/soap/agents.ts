/**
 * SOAP Multi-Agent Consultation System
 *
 * Architecture (from research):
 * - 4 specialist agents: GP, dermatologist, internist, psychiatrist
 * - 1 supervisor agent for consensus building
 * - Kendall's W coefficient for agreement scoring
 * - Parallel consultation for speed
 */

import pLimit from 'p-limit'
import { glmChatCompletion, GLM_CONFIG } from '@/lib/ai/glm'
import { logger } from '@/lib/observability/logger'
import type {
  SpecialistRole,
  SpecialistAssessment,
  SubjectiveData,
  ObjectiveData,
  ConsensusResult,
  DiagnosisCandidate,
  TreatmentPlan,
  UrgencyLevel,
  AgreementLevel,
  ConsensusCategory,
  SOAPConsultation,
  SPECIALISTS,
} from './types'
import {
  getSpecialistPrompt,
  buildPatientDataPrompt,
  buildConsensusPrompt,
  buildPlanPrompt,
  SUPERVISOR_SYSTEM_PROMPT,
  PLAN_GENERATOR_PROMPT,
} from './prompts'

// ============================================
// CONCURRENCY LIMITING
// ============================================

// Limit to 2 concurrent API requests to avoid rate limits from GLM provider
// 4 simultaneous calls were causing 429 errors and quota exhaustion
const apiConcurrencyLimit = pLimit(2)

// ============================================
// SPECIALIST CONSULTATION
// ============================================

interface SpecialistResponse {
  clinicalImpression: string
  differentialDiagnoses: Array<{
    name: string
    icd10Code?: string
    probability: number
    supportingEvidence: string[]
    refutingEvidence: string[]
  }>
  redFlags: string[]
  contributingFactors: string[]
  recommendedTests: string[]
  urgencyLevel: UrgencyLevel
  shouldRefer: boolean
  referralReason?: string
  reasoningNotes: string
  confidence: number
  relevance: number
}

/**
 * Consult a single specialist agent
 */
async function consultSpecialist(
  role: SpecialistRole,
  subjective: SubjectiveData,
  objective?: ObjectiveData
): Promise<SpecialistAssessment> {
  const startTime = Date.now()

  const systemPrompt = getSpecialistPrompt(role)
  const userPrompt = buildPatientDataPrompt(subjective, objective)

  try {
    const response = await glmChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: GLM_CONFIG.models.reasoning, // Use best model for medical reasoning
      temperature: 0.3,
      maxTokens: 2000,
      jsonMode: true,
    })

    const latencyMs = Date.now() - startTime

    // Parse response
    let parsedResponse: SpecialistResponse
    try {
      // Clean potential markdown
      let content = response.content.trim()
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/, '').replace(/```\n?$/, '')
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/, '').replace(/```\n?$/, '')
      }
      parsedResponse = JSON.parse(content)
    } catch (parseError) {
      logger.error('[SOAP] Failed to parse specialist response', {
        role,
        content: response.content.substring(0, 500),
        error: parseError,
      })
      throw new Error(`Invalid JSON from ${role}: ${response.content.substring(0, 200)}`)
    }

    // Build specialist info (inline to avoid import issues)
    const specialistInfo = {
      'general-practitioner': {
        id: 'gp',
        role: 'general-practitioner' as SpecialistRole,
        name: 'Dr. Garcia',
        avatar: '/avatars/gp.png',
        description: 'Medico General',
      },
      'dermatologist': {
        id: 'derm',
        role: 'dermatologist' as SpecialistRole,
        name: 'Dra. Rodriguez',
        avatar: '/avatars/dermatologist.png',
        description: 'Dermatologa',
      },
      'internist': {
        id: 'int',
        role: 'internist' as SpecialistRole,
        name: 'Dr. Martinez',
        avatar: '/avatars/internist.png',
        description: 'Internista',
      },
      'psychiatrist': {
        id: 'psych',
        role: 'psychiatrist' as SpecialistRole,
        name: 'Dra. Lopez',
        avatar: '/avatars/psychiatrist.png',
        description: 'Psiquiatra',
      },
    }

    return {
      specialistId: role,
      specialist: specialistInfo[role],
      confidence: parsedResponse.confidence || 0.7,
      relevance: parsedResponse.relevance || 0.5,
      clinicalImpression: parsedResponse.clinicalImpression || '',
      differentialDiagnoses: parsedResponse.differentialDiagnoses || [],
      redFlags: parsedResponse.redFlags || [],
      contributingFactors: parsedResponse.contributingFactors || [],
      recommendedTests: parsedResponse.recommendedTests || [],
      urgencyLevel: parsedResponse.urgencyLevel || 'routine',
      shouldRefer: parsedResponse.shouldRefer || false,
      referralReason: parsedResponse.referralReason,
      reasoningNotes: parsedResponse.reasoningNotes || '',
      tokensUsed: response.usage.totalTokens,
      costUSD: response.costUSD,
      latencyMs,
    }
  } catch (error) {
    logger.error('[SOAP] Specialist consultation failed', { role, error })
    throw error
  }
}

/**
 * Consult all specialists in parallel
 */
export async function consultSpecialists(
  subjective: SubjectiveData,
  objective?: ObjectiveData
): Promise<{
  specialists: SpecialistAssessment[]
  totalTokens: number
  totalCostUSD: number
  totalLatencyMs: number
}> {
  const startTime = Date.now()

  const roles: SpecialistRole[] = [
    'general-practitioner',
    'dermatologist',
    'internist',
    'psychiatrist',
  ]

  logger.info('[SOAP] Starting parallel specialist consultations', {
    specialists: roles,
    concurrencyLimit: 2,
  })

  // Run consultations with limited concurrency (2 at a time) to avoid rate limits
  // This prevents 429 errors from the GLM API while still providing parallelism
  const results = await Promise.allSettled(
    roles.map((role) =>
      apiConcurrencyLimit(() => consultSpecialist(role, subjective, objective))
    )
  )

  const specialists: SpecialistAssessment[] = []
  let totalTokens = 0
  let totalCostUSD = 0

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const role = roles[i]

    if (result.status === 'fulfilled') {
      specialists.push(result.value)
      totalTokens += result.value.tokensUsed
      totalCostUSD += result.value.costUSD
    } else {
      logger.error('[SOAP] Specialist failed', { role, reason: result.reason })
    }
  }

  const totalLatencyMs = Date.now() - startTime

  logger.info('[SOAP] Parallel consultations complete', {
    successful: specialists.length,
    total: roles.length,
    totalLatencyMs,
    totalCostUSD,
  })

  return {
    specialists,
    totalTokens,
    totalCostUSD,
    totalLatencyMs,
  }
}

// ============================================
// KENDALL'S W COEFFICIENT
// ============================================

/**
 * Calculate Kendall's W coefficient of concordance
 *
 * Measures agreement among multiple raters (specialists)
 * W ranges from 0 (no agreement) to 1 (complete agreement)
 *
 * Based on urgency level rankings and diagnosis probabilities
 */
export function calculateKendallW(specialists: SpecialistAssessment[]): number {
  if (specialists.length < 2) {
    return 1.0 // Single rater = perfect agreement with self
  }

  // Convert urgency levels to numeric ranks
  const urgencyRanks: Record<UrgencyLevel, number> = {
    'emergency': 5,
    'urgent': 4,
    'moderate': 3,
    'routine': 2,
    'self-care': 1,
  }

  // Get rankings from each specialist
  const urgencyRatings = specialists.map((s) => urgencyRanks[s.urgencyLevel])

  // Calculate mean rank
  const n = specialists.length // number of raters
  const k = 1 // number of items being ranked (urgency)

  // For single item ranking, use variance of ratings
  const mean = urgencyRatings.reduce((a, b) => a + b, 0) / n
  const squaredDiffs = urgencyRatings.map((r) => Math.pow(r - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n

  // Normalize to 0-1 range
  // Max variance for 5-point scale = 4 (when half say 1, half say 5)
  const maxVariance = 4
  const agreement = 1 - (variance / maxVariance)

  // Also consider confidence agreement
  const confidences = specialists.map((s) => s.confidence)
  const confMean = confidences.reduce((a, b) => a + b, 0) / n
  const confVariance = confidences.map((c) => Math.pow(c - confMean, 2))
    .reduce((a, b) => a + b, 0) / n
  const confAgreement = 1 - confVariance // Confidence is already 0-1

  // Weight urgency agreement more (60%) than confidence agreement (40%)
  const kendallW = Math.max(0, Math.min(1, 0.6 * agreement + 0.4 * confAgreement))

  return Math.round(kendallW * 100) / 100
}

/**
 * Get agreement level description
 */
export function getAgreementLevel(kendallW: number): AgreementLevel {
  if (kendallW >= 0.8) return 'strong'
  if (kendallW >= 0.6) return 'moderate'
  if (kendallW >= 0.4) return 'weak'
  return 'disagreement'
}

// ============================================
// CONSENSUS BUILDING
// ============================================

interface SupervisorResponse {
  consensusCategory: ConsensusCategory
  primaryDiagnosis: DiagnosisCandidate | null
  differentialDiagnoses: DiagnosisCandidate[]
  urgencyLevel: UrgencyLevel
  combinedRedFlags: string[]
  recommendedSpecialty: SpecialistRole | null
  recommendedTests: string[]
  supervisorSummary: string
  confidenceScore: number
  requiresHumanReview: boolean
  rationale: string
}

/**
 * Build consensus from specialist assessments using supervisor agent
 */
export async function buildConsensus(
  specialists: SpecialistAssessment[]
): Promise<{
  consensus: ConsensusResult
  tokensUsed: number
  costUSD: number
  latencyMs: number
}> {
  const startTime = Date.now()

  // Calculate Kendall's W first
  const kendallW = calculateKendallW(specialists)
  const agreementLevel = getAgreementLevel(kendallW)

  // Format specialist assessments for supervisor
  const assessmentSummaries = specialists.map((s) => ({
    specialist: `${s.specialist.name} (${s.specialist.description})`,
    assessment: JSON.stringify({
      clinicalImpression: s.clinicalImpression,
      differentialDiagnoses: s.differentialDiagnoses,
      redFlags: s.redFlags,
      urgencyLevel: s.urgencyLevel,
      confidence: s.confidence,
      relevance: s.relevance,
      shouldRefer: s.shouldRefer,
    }, null, 2),
  }))

  const userPrompt = buildConsensusPrompt(assessmentSummaries)

  try {
    const response = await glmChatCompletion({
      messages: [
        { role: 'system', content: SUPERVISOR_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: GLM_CONFIG.models.reasoning,
      temperature: 0.2, // Lower for more deterministic consensus
      maxTokens: 2000,
      jsonMode: true,
    })

    const latencyMs = Date.now() - startTime

    // Parse response
    let parsed: SupervisorResponse
    try {
      let content = response.content.trim()
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/, '').replace(/```\n?$/, '')
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/, '').replace(/```\n?$/, '')
      }
      parsed = JSON.parse(content)
    } catch (parseError) {
      logger.error('[SOAP] Failed to parse consensus response', {
        content: response.content.substring(0, 500),
        error: parseError,
      })
      throw new Error(`Invalid consensus JSON: ${response.content.substring(0, 200)}`)
    }

    // Build consensus result
    const consensus: ConsensusResult = {
      kendallW,
      agreementLevel,
      consensusCategory: parsed.consensusCategory || 'independent',
      primaryDiagnosis: parsed.primaryDiagnosis,
      differentialDiagnoses: parsed.differentialDiagnoses || [],
      urgencyLevel: parsed.urgencyLevel || 'moderate',
      combinedRedFlags: parsed.combinedRedFlags || [],
      recommendedSpecialty: parsed.recommendedSpecialty,
      recommendedTests: parsed.recommendedTests || [],
      supervisorSummary: parsed.supervisorSummary || '',
      confidenceScore: parsed.confidenceScore || kendallW,
      requiresHumanReview: parsed.requiresHumanReview ?? (kendallW < 0.6),
    }

    logger.info('[SOAP] Consensus built', {
      kendallW,
      agreementLevel,
      consensusCategory: consensus.consensusCategory,
      urgencyLevel: consensus.urgencyLevel,
      latencyMs,
    })

    return {
      consensus,
      tokensUsed: response.usage.totalTokens,
      costUSD: response.costUSD,
      latencyMs,
    }
  } catch (error) {
    logger.error('[SOAP] Consensus building failed', { error })
    throw error
  }
}

// ============================================
// PLAN GENERATION
// ============================================

interface PlanResponse {
  recommendations: string[]
  selfCareInstructions: string[]
  suggestedMedications?: Array<{
    name: string
    genericName?: string
    dosage: string
    frequency: string
    duration: string
    route: 'oral' | 'topical' | 'injection' | 'other'
    warnings: string[]
    interactions: string[]
    alternatives: Array<{ name: string; reason: string }>
  }>
  followUpTiming: string
  followUpType: 'telemedicine' | 'in-person' | 'emergency' | 'self-monitor'
  referralNeeded: boolean
  referralSpecialty?: SpecialistRole
  referralUrgency?: UrgencyLevel
  returnPrecautions: string[]
  patientEducation: string[]
}

/**
 * Generate treatment plan based on consensus
 */
export async function generatePlan(
  consensus: ConsensusResult,
  subjective: SubjectiveData
): Promise<{
  plan: TreatmentPlan
  tokensUsed: number
  costUSD: number
  latencyMs: number
}> {
  const startTime = Date.now()

  const consensusJson = JSON.stringify(consensus, null, 2)
  const userPrompt = buildPlanPrompt(consensusJson, subjective)

  try {
    const response = await glmChatCompletion({
      messages: [
        { role: 'system', content: PLAN_GENERATOR_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: GLM_CONFIG.models.costEffective, // Plan generation can use cheaper model
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true,
    })

    const latencyMs = Date.now() - startTime

    // Parse response
    let parsed: PlanResponse
    try {
      let content = response.content.trim()
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/, '').replace(/```\n?$/, '')
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/, '').replace(/```\n?$/, '')
      }
      parsed = JSON.parse(content)
    } catch (parseError) {
      logger.error('[SOAP] Failed to parse plan response', {
        content: response.content.substring(0, 500),
        error: parseError,
      })
      throw new Error(`Invalid plan JSON: ${response.content.substring(0, 200)}`)
    }

    const plan: TreatmentPlan = {
      recommendations: parsed.recommendations || [],
      selfCareInstructions: parsed.selfCareInstructions || [],
      suggestedMedications: parsed.suggestedMedications,
      followUpTiming: parsed.followUpTiming || '1 semana',
      followUpType: parsed.followUpType || 'telemedicine',
      referralNeeded: parsed.referralNeeded ?? consensus.recommendedSpecialty !== null,
      referralSpecialty: parsed.referralSpecialty || consensus.recommendedSpecialty || undefined,
      referralUrgency: parsed.referralUrgency || consensus.urgencyLevel,
      returnPrecautions: parsed.returnPrecautions || [],
      patientEducation: parsed.patientEducation || [],
    }

    logger.info('[SOAP] Plan generated', {
      referralNeeded: plan.referralNeeded,
      followUpType: plan.followUpType,
      latencyMs,
    })

    return {
      plan,
      tokensUsed: response.usage.totalTokens,
      costUSD: response.costUSD,
      latencyMs,
    }
  } catch (error) {
    logger.error('[SOAP] Plan generation failed', { error })
    throw error
  }
}

// ============================================
// FULL CONSULTATION FLOW
// ============================================

/**
 * Run complete multi-agent SOAP consultation
 */
export async function runSOAPConsultation(
  patientId: string,
  subjective: SubjectiveData,
  objective?: ObjectiveData
): Promise<SOAPConsultation> {
  const startTime = Date.now()
  const consultationId = `soap-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  logger.info('[SOAP] Starting full consultation', { consultationId, patientId })

  let totalTokens = 0
  let totalCostUSD = 0

  try {
    // Step 1: Parallel specialist consultations
    const specialistResult = await consultSpecialists(subjective, objective)
    totalTokens += specialistResult.totalTokens
    totalCostUSD += specialistResult.totalCostUSD

    if (specialistResult.specialists.length === 0) {
      throw new Error('No specialist consultations succeeded')
    }

    // Step 2: Build consensus
    const consensusResult = await buildConsensus(specialistResult.specialists)
    totalTokens += consensusResult.tokensUsed
    totalCostUSD += consensusResult.costUSD

    // Step 3: Generate plan
    const planResult = await generatePlan(consensusResult.consensus, subjective)
    totalTokens += planResult.tokensUsed
    totalCostUSD += planResult.costUSD

    const totalLatencyMs = Date.now() - startTime

    const consultation: SOAPConsultation = {
      id: consultationId,
      patientId,
      createdAt: new Date(),
      completedAt: new Date(),
      status: 'complete',
      subjective,
      objective: objective || {},
      assessment: {
        specialists: specialistResult.specialists,
        consensus: consensusResult.consensus,
      },
      plan: planResult.plan,
      metadata: {
        totalTokens,
        totalCostUSD,
        totalLatencyMs,
        aiModel: GLM_CONFIG.models.reasoning,
      },
    }

    logger.info('[SOAP] Consultation complete', {
      consultationId,
      urgency: consensusResult.consensus.urgencyLevel,
      agreementLevel: consensusResult.consensus.agreementLevel,
      totalLatencyMs,
      totalCostUSD,
    })

    return consultation
  } catch (error) {
    logger.error('[SOAP] Consultation failed', { consultationId, error })

    // Return error state consultation
    return {
      id: consultationId,
      patientId,
      createdAt: new Date(),
      status: 'error',
      subjective,
      objective: objective || {},
      assessment: null,
      plan: null,
      metadata: {
        totalTokens,
        totalCostUSD,
        totalLatencyMs: Date.now() - startTime,
        aiModel: GLM_CONFIG.models.reasoning,
      },
    }
  }
}

// ============================================
// UTILITY EXPORTS
// ============================================

export {
  consultSpecialist,
  type SpecialistResponse,
  type SupervisorResponse,
  type PlanResponse,
}

