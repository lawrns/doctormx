// Second Opinion API - Get and Update Single Request
// GET: Get request details with documents
// PATCH: Update draft request

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getSecondOpinionRequest, 
  getSecondOpinionDocuments 
} from '@/lib/domains/second-opinion'

interface RouteParams {
  params: Promise<{ id: string }>
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
    
    // Get request
    const requestData = await getSecondOpinionRequest(id)
    
    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    
    // Check ownership (patient or assigned doctor)
    if (requestData.patient_id !== user.id && requestData.assigned_doctor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get documents
    const documents = await getSecondOpinionDocuments(id)
    
    return NextResponse.json({
      ...requestData,
      documents,
    })
    
  } catch (error) {
    console.error('[SecondOpinion] Get error:', error)
    return NextResponse.json(
      { error: 'Failed to get second opinion request' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get current request
    const current = await getSecondOpinionRequest(id)
    
    if (!current) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    
    // Only patient can update, and only in draft status
    if (current.patient_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (current.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot update request after submission' },
        { status: 400 }
      )
    }
    
    // Parse updates
    const body = await request.json()
    const allowedFields = [
      'chief_complaint',
      'current_diagnosis', 
      'current_treatment',
      'medical_history',
      'allergies',
      'medications',
      'questions',
    ]
    
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }
    
    // Update
    const { error } = await supabase
      .from('second_opinion_requests')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    // Get updated request
    const updated = await getSecondOpinionRequest(id)
    
    return NextResponse.json(updated)
    
  } catch (error) {
    console.error('[SecondOpinion] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update second opinion request' },
      { status: 500 }
    )
  }
}
