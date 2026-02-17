import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import { createServiceClient } from '@/lib/supabase/server'

// ============================================================================
// WhatsApp Session Management (Stub implementations for build)
// ============================================================================

export interface TriageSummary {
  symptoms: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendedAction: string
  completed: boolean
  // Extended properties for compatibility with drSimeon
  chiefComplaint?: string
  urgencyLevel?: string
  suggestedSpecialty?: string
  aiConfidence?: number
  // Properties expected by webhook handlers
  success?: boolean
  aiResponse?: string
  triageComplete?: boolean
  summary?: {
    recommendedAction: string
    urgencyLevel?: string
  }
}

export async function createSession(patientId: string, doctorId?: string): Promise<string> {
  // TODO: Implement real session creation
  logger.info('Creating WhatsApp session (stub)', { patientId, doctorId })
  return `session-${Date.now()}`
}

export async function addMessage(
  sessionId: string, 
  message: string, 
  direction?: string,
  from?: string,
  metadata?: unknown,
  mediaUrl?: string,
  mediaType?: string
): Promise<void> {
  // TODO: Implement real message storage
  logger.info('Adding WhatsApp message (stub)', { sessionId, messageLength: message.length, direction, from })
}

export async function conductTriage(sessionId: string, symptoms: string[]): Promise<TriageSummary> {
  // TODO: Implement real triage logic with AI
  logger.info('Conducting triage (stub)', { sessionId, symptomsCount: symptoms.length })
  return {
    symptoms,
    severity: 'medium',
    recommendedAction: 'Consulta con médico general',
    completed: true,
    success: true,
    aiResponse: 'Gracias por compartir esa información. Un médico revisará tu caso pronto.'
  }
}

export async function routeHandoff(sessionId: string, doctorId: string): Promise<{ success: boolean; bookingLink?: string }> {
  // TODO: Implement real handoff logic
  logger.info('Routing handoff (stub)', { sessionId, doctorId })
  return { success: true, bookingLink: 'https://doctormx.com/book' }
}

// ============================================================================
// Doctor Lookup (Original function)
// ============================================================================

/**
 * GET /api/doctores/[id]
 *
 * Get specific doctor by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServiceClient()

    const { data: doctor, error } = await supabase
      .from('doctores')
      .select('id, full_name, bio, specialty_id')
      .eq('id', id)
      .single()

    if (error || !doctor) {
      logger.warn('Doctor not found', { id, error })
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ doctor })
  } catch (error) {
    logger.error('Error fetching doctor by ID', { error })
    return NextResponse.json(
      { error: 'Error fetching doctor' },
      { status: 500 }
    )
  }
}
