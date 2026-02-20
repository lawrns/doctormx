// AI Doctor Referrals - Smart Doctor Matching from Consultations
// POST: Generate doctor recommendations based on consultation context

import { NextRequest, NextResponse } from 'next/server'
import { matchDoctorsForReferral } from '@/lib/ai/referral'
import { redis } from '@/lib/cache'
import { logger } from '@/lib/observability/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ConsultationContext {
  consultationType: 'pre-consulta' | 'soap' | 'emergency' | 'ai-consultation'
  symptoms: string[]
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  specialty: string
  sessionId: string
  patientId?: string
  location?: string
  budget?: string
  language?: string
  chiefComplaint?: string
}

// Rate limit: 10 requests per minute per session
const RATE_LIMIT_KEY = 'referrals:match:'
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60 // seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ConsultationContext

    // Validate required fields
    if (!body.symptoms || !body.urgency || !body.specialty || !body.sessionId) {
      return NextResponse.json(
        { error: 'symptoms, urgency, specialty, and sessionId are required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitKey = `${RATE_LIMIT_KEY}${body.sessionId}`
    const current = redis ? await redis.get(rateLimitKey) : null
    const count = current ? parseInt(String(current), 10) : 0

    if (count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Increment rate limit counter (using set with TTL for expiration)
    if (redis) {
      await redis.set(rateLimitKey, (count + 1).toString(), RATE_LIMIT_WINDOW)
    }

    // Generate doctor recommendations using existing logic
    const recommendations = await matchDoctorsForReferral({
      symptoms: body.symptoms,
      urgency: body.urgency,
      specialty: body.specialty,
      sessionId: body.sessionId,
      patientId: body.patientId,
      location: body.location,
      budget: body.budget,
      language: body.language ?? 'es',
    })

    // Add metadata to response
    return NextResponse.json({
      recommendations,
      meta: {
        consultationType: body.consultationType,
        count: recommendations.length,
        timestamp: new Date().toISOString(),
        disclaimer: 'These are AI-powered suggestions based on symptoms and preferences. Always verify doctor credentials and availability.',
      }
    })

  } catch (error) {
    logger.error('[AI Referrals] Error generating recommendations:', { err: error })
    return NextResponse.json(
      { error: 'Failed to generate doctor recommendations' },
      { status: 500 }
    )
  }
}
