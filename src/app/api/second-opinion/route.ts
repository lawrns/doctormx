// Second Opinion API - Create and List Requests
// POST: Create new request
// GET: List patient's requests

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createSecondOpinionRequest, 
  SECOND_OPINION_CONFIG,
  type CreateSecondOpinionInput,
  type SecondOpinionType 
} from '@/lib/domains/second-opinion'
import { isFeatureEnabled } from '@/lib/feature-flags'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check feature flag
    const enabled = await isFeatureEnabled('second_opinion_enabled', { userId: user.id })
    if (!enabled) {
      return NextResponse.json(
        { error: 'Second opinion feature is not available' },
        { status: 403 }
      )
    }
    
    // Parse body
    const body = await request.json()
    const { type, chief_complaint, current_diagnosis, current_treatment, medical_history, allergies, medications, questions } = body
    
    // Validate required fields
    if (!chief_complaint || typeof chief_complaint !== 'string' || chief_complaint.length < 10) {
      return NextResponse.json(
        { error: 'Chief complaint is required (minimum 10 characters)' },
        { status: 400 }
      )
    }
    
    // Validate type
    const validTypes: SecondOpinionType[] = ['basic', 'specialist', 'panel']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request type. Must be basic, specialist, or panel' },
        { status: 400 }
      )
    }
    
    // Create request
    const input: CreateSecondOpinionInput = {
      patient_id: user.id,
      type,
      chief_complaint,
      current_diagnosis,
      current_treatment,
      medical_history,
      allergies,
      medications,
      questions: Array.isArray(questions) ? questions : [],
    }
    
    const result = await createSecondOpinionRequest(input)
    
    return NextResponse.json({
      id: result.id,
      price_cents: SECOND_OPINION_CONFIG.PRICES[type as SecondOpinionType],
      currency: 'MXN',
    }, { status: 201 })
    
  } catch (error) {
    console.error('[SecondOpinion] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create second opinion request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query
    let query = supabase
      .from('second_opinion_requests')
      .select('*', { count: 'exact' })
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      requests: data,
      total: count || 0,
      limit,
      offset,
    })
    
  } catch (error) {
    console.error('[SecondOpinion] List error:', error)
    return NextResponse.json(
      { error: 'Failed to list second opinion requests' },
      { status: 500 }
    )
  }
}
