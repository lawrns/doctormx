/**
 * GET /api/soap/consult/[id]
 *
 * Get consultation details by ID
 * Returns full consultation data including specialist assessments and plan
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid consultation ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get consultation
    const { data: consultation, error } = await supabase
      .from('soap_consultations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Consultation not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Check authorization
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Patients can only see their own consultations
      if (profile?.role === 'patient' && consultation.patient_id !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Build response
    const response = {
      id: consultation.id,
      patientId: consultation.patient_id,
      status: consultation.status,
      createdAt: consultation.created_at,
      completedAt: consultation.completed_at,
      subjective: consultation.subjective_data,
      objective: consultation.objective_data,
      assessment: consultation.assessment_data,
      plan: consultation.plan_data,
      metadata: {
        totalTokens: consultation.total_tokens,
        totalCostUSD: consultation.total_cost_usd,
        totalLatencyMs: consultation.total_latency_ms,
        aiModel: consultation.ai_model,
      },
    }

    return NextResponse.json(response)

  } catch (error) {
    logger.error('[API] Failed to get consultation', { error })
    return NextResponse.json(
      { error: 'Failed to retrieve consultation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/soap/consult/[id]
 *
 * Delete a consultation (soft delete by setting status)
 * Only the patient or admin can delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid consultation ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get consultation to check ownership
    const { data: consultation, error: fetchError } = await supabase
      .from('soap_consultations')
      .select('patient_id')
      .eq('id', id)
      .single()

    if (fetchError || !consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'patient' && consultation.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Soft delete - mark as archived
    const { error: updateError } = await supabase
      .from('soap_consultations')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    logger.info('[API] Consultation archived', { id })

    return NextResponse.json(
      { message: 'Consultation archived', id },
      { status: 200 }
    )

  } catch (error) {
    logger.error('[API] Failed to delete consultation', { error })
    return NextResponse.json(
      { error: 'Failed to delete consultation' },
      { status: 500 }
    )
  }
}
