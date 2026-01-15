// Referrals API - Create and List Referrals
// POST: Create new referral
// GET: List doctor's referrals (sent and received)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { REFERRALS_CONFIG } from '@/lib/domains/referrals'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check feature flag
    const enabled = await isFeatureEnabled('doctor_referrals_enabled', { userId: user.id })
    if (!enabled) {
      return NextResponse.json(
        { error: 'Referral network is not available for your subscription' },
        { status: 403 }
      )
    }
    
    // Verify user is a doctor
    const { data: doctor } = await supabase
      .from('doctors')
      .select('user_id, subscription_tier')
      .eq('user_id', user.id)
      .single()
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Only doctors can create referrals' },
        { status: 403 }
      )
    }
    
    // Parse body
    const body = await request.json()
    const { patient_id, specialty_needed, urgency, reason, clinical_notes, receiving_doctor_id } = body
    
    // Validate required fields
    if (!patient_id || !specialty_needed || !reason) {
      return NextResponse.json(
        { error: 'patient_id, specialty_needed, and reason are required' },
        { status: 400 }
      )
    }
    
    // Calculate expiry based on urgency
    const expiresAt = new Date()
    if (urgency === 'emergency') {
      expiresAt.setHours(expiresAt.getHours() + 24)
    } else if (urgency === 'urgent') {
      expiresAt.setDate(expiresAt.getDate() + 7)
    } else {
      expiresAt.setDate(expiresAt.getDate() + REFERRALS_CONFIG.REFERRAL_EXPIRY_DAYS)
    }
    
    // Create referral
    const { data: referral, error: createError } = await supabase
      .from('doctor_referrals')
      .insert({
        referring_doctor_id: user.id,
        receiving_doctor_id: receiving_doctor_id || null,
        patient_id,
        specialty_needed,
        urgency: urgency || 'routine',
        reason,
        clinical_notes,
        status: receiving_doctor_id ? 'pending' : 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()
    
    if (createError) {
      console.error('[Referrals] Create error:', createError)
      throw createError
    }
    
    // If specific doctor was targeted, create invitation
    if (receiving_doctor_id) {
      await supabase
        .from('referral_invitations')
        .insert({
          referral_id: referral.id,
          doctor_id: receiving_doctor_id,
          status: 'pending',
        })
    }
    
    return NextResponse.json({
      id: referral.id,
      status: referral.status,
      expires_at: referral.expires_at,
    }, { status: 201 })
    
  } catch (error) {
    console.error('[Referrals] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
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
    const type = searchParams.get('type') || 'all' // sent, received, all
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    
    // Build query
    let query = supabase
      .from('doctor_referrals')
      .select(`
        *,
        referring_doctor:doctors!doctor_referrals_referring_doctor_id_fkey(
          user_id,
          full_name,
          specialties
        ),
        receiving_doctor:doctors!doctor_referrals_receiving_doctor_id_fkey(
          user_id,
          full_name,
          specialties
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Filter by type
    if (type === 'sent') {
      query = query.eq('referring_doctor_id', user.id)
    } else if (type === 'received') {
      query = query.eq('receiving_doctor_id', user.id)
    } else {
      query = query.or(`referring_doctor_id.eq.${user.id},receiving_doctor_id.eq.${user.id}`)
    }
    
    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: referrals, error } = await query
    
    if (error) {
      throw error
    }
    
    // Get stats
    const { data: stats } = await supabase
      .from('referral_network_stats')
      .select('*')
      .eq('doctor_id', user.id)
      .single()
    
    return NextResponse.json({
      referrals,
      stats: stats || {
        referrals_sent: 0,
        referrals_received: 0,
        referrals_completed: 0,
      },
    })
    
  } catch (error) {
    console.error('[Referrals] List error:', error)
    return NextResponse.json(
      { error: 'Failed to list referrals' },
      { status: 500 }
    )
  }
}
