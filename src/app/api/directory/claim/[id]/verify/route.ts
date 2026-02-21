// Directory Claim Verification API
// POST: Submit verification documents
// GET: Check verification status

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get claim
    const { data: claim, error: claimError } = await supabase
      .from('profile_claims')
      .select('*')
      .eq('id', id)
      .single()
    
    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    
    // Check ownership
    if (claim.claimant_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Check status
    if (!['claim_pending', 'verification_required'].includes(claim.status)) {
      return NextResponse.json(
        { error: 'Claim is not pending verification' },
        { status: 400 }
      )
    }
    
    // Parse multipart form
    const formData = await request.formData()
    const cedula = formData.get('cedula_profesional') as string | null
    const idDocument = formData.get('id_document') as File | null
    const cedulaDocument = formData.get('cedula_document') as File | null
    const selfie = formData.get('selfie') as File | null
    
    const updates: Record<string, unknown> = {}
    
    // Update cedula if provided
    if (cedula) {
      updates.cedula_profesional = cedula
    }
    
    // Upload ID document
    if (idDocument) {
      const idPath = `claims/${id}/id-${Date.now()}.${idDocument.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(idPath, idDocument, { contentType: idDocument.type })
      
      if (uploadError) {
        logger.error('[Verify] ID upload error:', { err: uploadError })
        return NextResponse.json({ error: 'Failed to upload ID document' }, { status: 500 })
      }
      updates.id_document_path = idPath
    }
    
    // Upload cedula document
    if (cedulaDocument) {
      const cedulaPath = `claims/${id}/cedula-${Date.now()}.${cedulaDocument.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(cedulaPath, cedulaDocument, { contentType: cedulaDocument.type })
      
      if (uploadError) {
        logger.error('[Verify] Cedula upload error:', { err: uploadError })
        return NextResponse.json({ error: 'Failed to upload cedula document' }, { status: 500 })
      }
      updates.cedula_document_path = cedulaPath
    }
    
    // Upload selfie
    if (selfie) {
      const selfiePath = `claims/${id}/selfie-${Date.now()}.${selfie.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(selfiePath, selfie, { contentType: selfie.type })
      
      if (uploadError) {
        logger.error('[Verify] Selfie upload error:', { err: uploadError })
        return NextResponse.json({ error: 'Failed to upload selfie' }, { status: 500 })
      }
      updates.selfie_path = selfiePath
    }
    
    // Check if all required documents are uploaded
    const hasAllDocs = (
      (updates.cedula_document_path || claim.cedula_document_path) &&
      (updates.id_document_path || claim.id_document_path) &&
      (updates.selfie_path || claim.selfie_path)
    )
    
    if (hasAllDocs) {
      updates.status = 'verification_required'
      updates.verification_method = 'manual' // Will be reviewed by admin
    }
    
    // Update claim
    const { error: updateError } = await supabase
      .from('profile_claims')
      .update(updates)
      .eq('id', id)
    
    if (updateError) {
      throw updateError
    }
    
    // Get updated claim
    const { data: updated } = await supabase
      .from('profile_claims')
      .select('*')
      .eq('id', id)
      .single()
    
    return NextResponse.json({
      claim: updated,
      message: hasAllDocs 
        ? 'Documents submitted. Your claim will be reviewed within 24-48 hours.'
        : 'Documents uploaded. Please submit all required documents to complete verification.',
    })
    
  } catch (error) {
    logger.error('[Verify] Error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to submit verification' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get claim
    const { data: claim, error: claimError } = await supabase
      .from('profile_claims')
      .select(`
        *,
        unclaimed_doctor_profiles (
          id,
          full_name,
          specialty,
          city,
          state,
          cedula_profesional
        )
      `)
      .eq('id', id)
      .single()
    
    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    
    // Check ownership
    if (claim.claimant_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json({ claim })
    
  } catch (error) {
    logger.error('[Verify] Get error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to get claim status' },
      { status: 500 }
    )
  }
}
