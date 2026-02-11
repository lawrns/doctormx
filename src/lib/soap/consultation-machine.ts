/**
 * XState State Machine for SOAP Consultation Flow
 *
 * States: intake -> objective -> assessment -> plan -> complete
 * Handles agent consultation invocation and tracks consultation progress
 */

import { createMachine, assign, fromPromise } from 'xstate'
import type {
  SubjectiveData,
  ObjectiveData,
  SpecialistAssessment,
  ConsensusResult,
  TreatmentPlan,
  ConsultationStatus,
} from './types'
import {
  consultSpecialists,
  buildConsensus,
  generatePlan,
} from './agents'
import { logger } from '@/lib/observability/logger'

// ============================================
// CONTEXT TYPE
// ============================================

export interface ConsultationContext {
  // Identifiers
  consultationId: string
  patientId: string

  // SOAP Data
  subjective: SubjectiveData | null
  objective: ObjectiveData | null

  // Assessment Results
  specialistAssessments: SpecialistAssessment[]
  consensus: ConsensusResult | null
  plan: TreatmentPlan | null

  // Progress tracking
  specialistsCompleted: number
  totalSpecialists: number

  // Metadata
  totalTokens: number
  totalCostUSD: number
  totalLatencyMs: number
  error: string | null

  // Timestamps
  startedAt: Date
  completedAt: Date | null
}

// ============================================
// EVENT TYPES
// ============================================

export type ConsultationEvent =
  | { type: 'START'; patientId: string; subjective: SubjectiveData }
  | { type: 'SUBMIT_SUBJECTIVE'; subjective: SubjectiveData }
  | { type: 'SUBMIT_OBJECTIVE'; objective: ObjectiveData }
  | { type: 'SKIP_OBJECTIVE' }
  | { type: 'SPECIALISTS_DONE'; specialists: SpecialistAssessment[]; tokens: number; cost: number; latency: number }
  | { type: 'CONSENSUS_DONE'; consensus: ConsensusResult; tokens: number; cost: number; latency: number }
  | { type: 'PLAN_DONE'; plan: TreatmentPlan; tokens: number; cost: number; latency: number }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'ESCALATE' }
  | { type: 'RESET' }

// ============================================
// ACTOR DEFINITIONS
// ============================================

const consultSpecialistsActor = fromPromise<
  { specialists: SpecialistAssessment[]; totalTokens: number; totalCostUSD: number; totalLatencyMs: number },
  { subjective: SubjectiveData; objective: ObjectiveData | null }
>(async ({ input }) => {
  logger.info('[StateMachine] Invoking specialist consultations')
  return consultSpecialists(input.subjective, input.objective || undefined)
})

const buildConsensusActor = fromPromise<
  { consensus: ConsensusResult; tokensUsed: number; costUSD: number; latencyMs: number },
  { specialists: SpecialistAssessment[] }
>(async ({ input }) => {
  logger.info('[StateMachine] Building consensus')
  return buildConsensus(input.specialists)
})

const generatePlanActor = fromPromise<
  { plan: TreatmentPlan; tokensUsed: number; costUSD: number; latencyMs: number },
  { consensus: ConsensusResult; subjective: SubjectiveData }
>(async ({ input }) => {
  logger.info('[StateMachine] Generating treatment plan')
  return generatePlan(input.consensus, input.subjective)
})

// ============================================
// STATE MACHINE
// ============================================

export const consultationMachine = createMachine({
  id: 'soapConsultation',
  types: {} as {
    context: ConsultationContext
    events: ConsultationEvent
  },
  initial: 'idle',
  context: {
    consultationId: '',
    patientId: '',
    subjective: null,
    objective: null,
    specialistAssessments: [],
    consensus: null,
    plan: null,
    specialistsCompleted: 0,
    totalSpecialists: 4,
    totalTokens: 0,
    totalCostUSD: 0,
    totalLatencyMs: 0,
    error: null,
    startedAt: new Date(),
    completedAt: null,
  },

  states: {
    // =====================================
    // IDLE - Waiting to start
    // =====================================
    idle: {
      on: {
        START: {
          target: 'intake',
          actions: assign({
            consultationId: () => `soap-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            patientId: ({ event }) => event.patientId,
            subjective: ({ event }) => event.subjective,
            startedAt: () => new Date(),
            error: null,
          }),
        },
      },
    },

    // =====================================
    // INTAKE - Collecting/validating subjective data
    // =====================================
    intake: {
      on: {
        SUBMIT_SUBJECTIVE: {
          target: 'objective',
          actions: assign({
            subjective: ({ event }) => event.subjective,
          }),
        },
        ERROR: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
      // Auto-transition if subjective already provided
      always: {
        target: 'objective',
        guard: ({ context }) => context.subjective !== null,
      },
    },

    // =====================================
    // OBJECTIVE - Collecting objective data (optional)
    // =====================================
    objective: {
      on: {
        SUBMIT_OBJECTIVE: {
          target: 'assessment',
          actions: assign({
            objective: ({ event }) => event.objective,
          }),
        },
        SKIP_OBJECTIVE: {
          target: 'assessment',
        },
        ERROR: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },

    // =====================================
    // ASSESSMENT - Multi-agent consultation
    // =====================================
    assessment: {
      initial: 'consultingSpecialists',

      states: {
        // --- Parallel specialist consultations ---
        consultingSpecialists: {
          invoke: {
            id: 'consultSpecialists',
            src: consultSpecialistsActor,
            input: ({ context }) => {
              if (!context.subjective) {
                throw new Error('Subjective data is required for specialist consultation');
              }
              return {
                subjective: context.subjective,
                objective: context.objective,
              };
            },
            onDone: {
              target: 'buildingConsensus',
              actions: assign({
                specialistAssessments: ({ event }) => event.output.specialists,
                specialistsCompleted: ({ event }) => event.output.specialists.length,
                totalTokens: ({ context, event }) => context.totalTokens + event.output.totalTokens,
                totalCostUSD: ({ context, event }) => context.totalCostUSD + event.output.totalCostUSD,
                totalLatencyMs: ({ context, event }) => context.totalLatencyMs + event.output.totalLatencyMs,
              }),
            },
            onError: {
              target: '#soapConsultation.error',
              actions: assign({
                error: ({ event }) => `Specialist consultation failed: ${event.error}`,
              }),
            },
          },
        },

        // --- Consensus building ---
        buildingConsensus: {
          invoke: {
            id: 'buildConsensus',
            src: buildConsensusActor,
            input: ({ context }) => ({
              specialists: context.specialistAssessments,
            }),
            onDone: {
              target: '#soapConsultation.plan',
              actions: assign({
                consensus: ({ event }) => event.output.consensus,
                totalTokens: ({ context, event }) => context.totalTokens + event.output.tokensUsed,
                totalCostUSD: ({ context, event }) => context.totalCostUSD + event.output.costUSD,
                totalLatencyMs: ({ context, event }) => context.totalLatencyMs + event.output.latencyMs,
              }),
            },
            onError: {
              target: '#soapConsultation.error',
              actions: assign({
                error: ({ event }) => `Consensus building failed: ${event.error}`,
              }),
            },
          },
        },
      },
    },

    // =====================================
    // PLAN - Generating treatment plan
    // =====================================
    plan: {
      initial: 'generatingPlan',

      states: {
        generatingPlan: {
          invoke: {
            id: 'generatePlan',
            src: generatePlanActor,
            input: ({ context }) => {
              if (!context.consensus) {
                throw new Error('Consensus data is required for plan generation');
              }
              if (!context.subjective) {
                throw new Error('Subjective data is required for plan generation');
              }
              return {
                consensus: context.consensus,
                subjective: context.subjective,
              };
            },
            onDone: {
              target: '#soapConsultation.review',
              actions: assign({
                plan: ({ event }) => event.output.plan,
                totalTokens: ({ context, event }) => context.totalTokens + event.output.tokensUsed,
                totalCostUSD: ({ context, event }) => context.totalCostUSD + event.output.costUSD,
                totalLatencyMs: ({ context, event }) => context.totalLatencyMs + event.output.latencyMs,
              }),
            },
            onError: {
              target: '#soapConsultation.error',
              actions: assign({
                error: ({ event }) => `Plan generation failed: ${event.error}`,
              }),
            },
          },
        },
      },
    },

    // =====================================
    // REVIEW - Awaiting human review (if needed)
    // =====================================
    review: {
      // Check if human review is required
      always: [
        {
          target: 'escalated',
          guard: ({ context }) => context.consensus?.urgencyLevel === 'emergency',
        },
        {
          target: 'complete',
          guard: ({ context }) => !context.consensus?.requiresHumanReview,
        },
        // Default fallback - if no guards match, complete anyway
        {
          target: 'complete',
        },
      ],
    },

    // =====================================
    // COMPLETE - Consultation finished
    // =====================================
    complete: {
      type: 'final',
      entry: assign({
        completedAt: () => new Date(),
      }),
    },

    // =====================================
    // ESCALATED - Sent to emergency
    // =====================================
    escalated: {
      type: 'final',
      entry: assign({
        completedAt: () => new Date(),
      }),
    },

    // =====================================
    // ERROR - Something went wrong
    // =====================================
    error: {
      on: {
        RETRY: {
          target: 'assessment',
          actions: assign({
            error: null,
          }),
        },
        RESET: {
          target: 'idle',
          actions: assign({
            consultationId: '',
            patientId: '',
            subjective: null,
            objective: null,
            specialistAssessments: [],
            consensus: null,
            plan: null,
            specialistsCompleted: 0,
            totalTokens: 0,
            totalCostUSD: 0,
            totalLatencyMs: 0,
            error: null,
            completedAt: null,
          }),
        },
      },
    },
  },
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map machine state to ConsultationStatus
 */
export function getConsultationStatus(stateValue: string | { [key: string]: string }): ConsultationStatus {
  // Handle nested states
  const state = typeof stateValue === 'string'
    ? stateValue
    : Object.keys(stateValue)[0]

  const statusMap: Record<string, ConsultationStatus> = {
    idle: 'intake',
    intake: 'intake',
    objective: 'objective',
    assessment: 'consulting',
    plan: 'plan',
    review: 'review',
    complete: 'complete',
    escalated: 'escalated',
    error: 'error',
  }

  return statusMap[state] || 'intake'
}

/**
 * Get progress information from context
 */
export function getConsultationProgress(context: ConsultationContext): {
  specialistsCompleted: number
  totalSpecialists: number
  consensusBuilt: boolean
  planGenerated: boolean
  percentComplete: number
} {
  const specialistsCompleted = context.specialistsCompleted
  const totalSpecialists = context.totalSpecialists
  const consensusBuilt = context.consensus !== null
  const planGenerated = context.plan !== null

  // Weight each phase
  const specialistWeight = 50
  const consensusWeight = 30
  const planWeight = 20

  let percentComplete = 0
  percentComplete += (specialistsCompleted / totalSpecialists) * specialistWeight
  if (consensusBuilt) percentComplete += consensusWeight
  if (planGenerated) percentComplete += planWeight

  return {
    specialistsCompleted,
    totalSpecialists,
    consensusBuilt,
    planGenerated,
    percentComplete: Math.round(percentComplete),
  }
}

// ============================================
// EXPORTS
// ============================================

export type ConsultationMachine = typeof consultationMachine

