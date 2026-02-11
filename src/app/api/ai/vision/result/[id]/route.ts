import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { getAnalysis, getUrgencyLabel, getImageTypeLabel } from '@/lib/ai/vision'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const analysis = await getAnalysis(id)

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      )
    }

    const isOwner = analysis.patient_id === user.id
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profileData?.role === 'admin'
    const isDoctor = analysis.doctor_id === user.id

    if (!isOwner && !isAdmin && !isDoctor) {
      return NextResponse.json(
        { error: 'No autorizado para ver este análisis' },
        { status: 403 }
      )
    }

    const patientName = isOwner || isAdmin ? 'Paciente' : undefined
    const doctorName = analysis.doctor_id ? 'Dr. revisor' : undefined

    return NextResponse.json({
      analysis: {
        id: analysis.id,
        imageUrl: analysis.image_url,
        imageType: analysis.image_type,
        imageTypeLabel: getImageTypeLabel(analysis.image_type),
        patientNotes: analysis.patient_notes,
        findings: analysis.findings,
        possibleConditions: analysis.possible_conditions,
        urgencyLevel: analysis.urgency_level,
        urgencyLabel: getUrgencyLabel(analysis.urgency_level),
        recommendations: analysis.recommendations,
        followUpNeeded: analysis.follow_up_needed,
        followUpNotes: analysis.follow_up_notes,
        doctorNotes: analysis.doctor_notes,
        doctorAction: analysis.doctor_action,
        status: analysis.status,
        confidencePercent: analysis.confidence_percent,
        costCents: analysis.cost_cents,
        model: analysis.model,
        createdAt: analysis.created_at,
        reviewedAt: analysis.reviewed_at,
        patientName,
        doctorName
      }
    })
  } catch (error) {
    logger.error('[VISION] Error fetching analysis result:', { err: error })
    return NextResponse.json(
      { error: 'Error al obtener el análisis' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { doctorNotes, doctorAction, modifiedFindings } = body

    if (!doctorAction || !['approved', 'rejected', 'modified'].includes(doctorAction)) {
      return NextResponse.json(
        { error: 'Acción de doctor inválida' },
        { status: 400 }
      )
    }

    const analysis = await getAnalysis(id)

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      )
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileData?.role !== 'doctor' && profileData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo doctores pueden revisar análisis' },
        { status: 403 }
      )
    }

    const { error: updateError } = await supabase
      .from('medical_image_analyses')
      .update({
        doctor_id: user.id,
        doctor_notes: doctorNotes || null,
        doctor_action: doctorAction,
        findings: modifiedFindings || analysis.findings,
        status: 'reviewed',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      logger.error('[VISION] Error updating analysis:', { context: { analysisId: id, error: updateError } })
      return NextResponse.json(
        { error: 'Error al actualizar el análisis' },
        { status: 500 }
      )
    }

    logger.info('[VISION] Analysis reviewed', {
      analysisId: id,
      doctorId: user.id,
      action: doctorAction
    })

    return NextResponse.json({
      success: true,
      message: 'Análisis actualizado correctamente'
    })
  } catch (error) {
    const params = req.url.split('/').pop()
    logger.error('[VISION] Error updating analysis:', {
      context: {
        analysisId: params,
        error: error instanceof Error ? error.message : String(error)
      }
    })
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
