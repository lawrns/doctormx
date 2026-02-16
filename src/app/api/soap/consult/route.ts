/**
 * POST /api/soap/consult
 *
 * Start a new multi-agent SOAP consultation
 * This endpoint processes the consultation synchronously and returns the full result
 */

import { NextRequest, NextResponse } from 'next/server'

// Extended timeout for multi-agent AI consultation (requires Vercel/Netlify Pro)
// SOAP runs 4 specialist consultations + consensus + plan = ~6 GLM API calls
export const maxDuration = 60 // 60 seconds max
import { createClient } from '@/lib/supabase/server'
import { runSOAPConsultation } from '@/lib/soap/agents'
import { logger } from '@/lib/observability/logger'
import { rateLimit } from '@/lib/cache'
import type { SubjectiveData, ObjectiveData, StartConsultationRequest } from '@/lib/soap/types'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMA
// ============================================

const SubjectiveSchema = z.object({
  chiefComplaint: z.string().min(5, 'Chief complaint must be at least 5 characters'),
  symptomsDescription: z.string().min(10, 'Symptoms description must be at least 10 characters'),
  symptomDuration: z.string().min(1, 'Symptom duration is required'),
  symptomSeverity: z.number().min(1).max(10),
  onsetType: z.enum(['sudden', 'gradual']),
  associatedSymptoms: z.array(z.string()).default([]),
  aggravatingFactors: z.array(z.string()).default([]),
  relievingFactors: z.array(z.string()).default([]),
  previousTreatments: z.array(z.string()).default([]),
  medicalHistory: z.string().optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  familyHistory: z.string().optional(),
  socialHistory: z.string().optional(),
})

const ObjectiveSchema = z.object({
  patientAge: z.number().min(0).max(150).optional(),
  patientGender: z.enum(['male', 'female', 'other']).optional(),
  bodyLocation: z.array(z.string()).optional(),
  visualSymptoms: z.string().optional(),
  vitalSigns: z.object({
    bloodPressure: z.object({
      systolic: z.number(),
      diastolic: z.number(),
    }).optional(),
    heartRate: z.number().optional(),
    temperature: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  previousDiagnoses: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
}).optional()

const ConsultRequestSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  subjective: SubjectiveSchema,
  objective: ObjectiveSchema,
})

// ============================================
// POST HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting for expensive AI endpoint
    const identifier = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'anonymous'
    const { success } = await rateLimit.ai.limit(identifier)

    if (!success) {
      logger.warn('[API] Rate limit exceeded for SOAP consultation', { identifier })
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validationResult = ConsultRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { patientId, subjective, objective } = validationResult.data

    // Optional: Verify patient exists (if authenticated)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // If authenticated, verify patient ID matches or user is doctor/admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'patient' && user.id !== patientId) {
        return NextResponse.json(
          { error: 'Unauthorized: Cannot create consultation for another patient' },
          { status: 403 }
        )
      }
    }

    logger.info('[API] Starting SOAP consultation', { patientId })

    // Run the full consultation
    const consultation = await runSOAPConsultation(
      patientId,
      subjective as SubjectiveData,
      objective as ObjectiveData | undefined
    )

    // Store in database
    const { error: dbError } = await supabase.from('soap_consultations').insert({
      id: consultation.id,
      patient_id: consultation.patientId,
      status: consultation.status,
      subjective_data: consultation.subjective,
      objective_data: consultation.objective,
      assessment_data: consultation.assessment,
      plan_data: consultation.plan,
      total_tokens: consultation.metadata.totalTokens,
      total_cost_usd: consultation.metadata.totalCostUSD,
      total_latency_ms: consultation.metadata.totalLatencyMs,
      ai_model: consultation.metadata.aiModel,
      completed_at: consultation.completedAt?.toISOString(),
    })

    if (dbError) {
      logger.warn('[API] Failed to store consultation in DB', {
        error: dbError.message,
        consultationId: consultation.id,
      })
      // Continue anyway - the consultation was successful
    }

    // Build response summary
    const response = {
      consultation: {
        id: consultation.id,
        patientId: consultation.patientId,
        status: consultation.status,
        createdAt: consultation.createdAt.toISOString(),
        completedAt: consultation.completedAt?.toISOString(),
        subjective: consultation.subjective,
        objective: consultation.objective,
        assessment: consultation.assessment,
        plan: consultation.plan,
        metadata: consultation.metadata,
      },
      summary: {
        urgency: consultation.assessment?.consensus.urgencyLevel || 'moderate',
        primaryDiagnosis: consultation.assessment?.consensus.primaryDiagnosis?.name || null,
        confidence: consultation.assessment?.consensus.confidenceScore || 0,
        recommendedAction: getRecommendedAction(
          consultation.assessment?.consensus.urgencyLevel || 'moderate'
        ),
        keyFindings: [
          ...(consultation.assessment?.consensus.combinedRedFlags || []),
          ...(consultation.assessment?.consensus.differentialDiagnoses.slice(0, 3).map(d => d.name) || []),
        ],
        specialistAgreement: consultation.assessment?.consensus.agreementLevel || 'unknown',
        kendallW: consultation.assessment?.consensus.kendallW || 0,
      },
    }

    const latencyMs = Date.now() - startTime

    logger.info('[API] SOAP consultation complete', {
      consultationId: consultation.id,
      urgency: response.summary.urgency,
      latencyMs,
    })

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    const latencyMs = Date.now() - startTime
    logger.error('[API] SOAP consultation failed', { error, latencyMs })

    return NextResponse.json(
      {
        error: 'Consultation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================
// HELPERS
// ============================================

function getRecommendedAction(
  urgency: string
): 'emergency' | 'urgent-appointment' | 'routine-appointment' | 'self-care' {
  switch (urgency) {
    case 'emergency':
      return 'emergency'
    case 'urgent':
      return 'urgent-appointment'
    case 'moderate':
    case 'routine':
      return 'routine-appointment'
    case 'self-care':
      return 'self-care'
    default:
      return 'routine-appointment'
  }
}
