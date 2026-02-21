// Referrals API - Get, Accept, Decline Referral
// GET: Get referral details
// PATCH: Update referral (accept, decline, complete)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { REFERRALS_CONFIG } from '@/lib/domains/referrals'
import { logger } from '@/lib/observability/logger'

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
    
    // Get referral
    const { data: referral, error } = await supabase
      .from('doctor_referrals')
      .select(`
        *,
        referring_doctor:doctors!doctor_referrals_referring_doctor_id_fkey(
          user_id,
          full_name,
          specialties,
          city,
          state
        ),
        receiving_doctor:doctors!doctor_referrals_receiving_doctor_id_fkey(
          user_id,
          full_name,
          specialties,
          city,
          state
        )
      `)
      .eq('id', id)
      .single()
    
    if (error || !referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }
    
    // Check access
    if (
      referral.referring_doctor_id !== user.id &&
      referral.receiving_doctor_id !== user.id &&
      referral.patient_id !== user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json({ referral })
    
  } catch (error) {
    logger.error('[Referrals] Get error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to get referral' },
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
    
    // Get current referral
    const { data: referral, error: fetchError } = await supabase
      .from('doctor_referrals')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError || !referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }
    
    // Parse action
    const body = await request.json()
    const { action, response_notes, declined_reason, outcome_notes, outcome_rating } = body
    
    const updates: Record<string, unknown> = {}
    
    switch (action) {
      case 'accept':
        // Only receiving doctor or unassigned can accept
        if (referral.receiving_doctor_id && referral.receiving_doctor_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        if (referral.status !== 'pending') {
          return NextResponse.json({ error: 'Referral cannot be accepted' }, { status: 400 })
        }
        
        updates.status = 'accepted'
        updates.receiving_doctor_id = user.id
        updates.responded_at = new Date().toISOString()
        updates.response_notes = response_notes
        break
        
      case 'decline':
        // Only receiving doctor can decline
        if (referral.receiving_doctor_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        if (referral.status !== 'pending') {
          return NextResponse.json({ error: 'Referral cannot be declined' }, { status: 400 })
        }
        
        updates.status = 'declined'
        updates.responded_at = new Date().toISOString()
        updates.declined_reason = declined_reason
        break
        
      case 'complete': {
        // Either doctor can mark as complete
        if (referral.referring_doctor_id !== user.id && referral.receiving_doctor_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        if (referral.status !== 'accepted') {
          return NextResponse.json({ error: 'Referral must be accepted before completion' }, { status: 400 })
        }

        updates.status = 'completed'
        updates.completed_at = new Date().toISOString()
        updates.outcome_notes = outcome_notes
        updates.outcome_rating = outcome_rating

        // Calculate referral fee (10% of consultation, capped)
        const baseFee = 50000 // Assume 500 MXN consultation
        const feePercent = REFERRALS_CONFIG.REFERRAL_FEE_PERCENTAGE / 100
        let feeCents = Math.round(baseFee * feePercent)
        feeCents = Math.max(feeCents, REFERRALS_CONFIG.MIN_REFERRAL_FEE_CENTS)
        feeCents = Math.min(feeCents, REFERRALS_CONFIG.MAX_REFERRAL_FEE_CENTS)
        updates.referral_fee_cents = feeCents
        break
      }
        
      case 'cancel':
        // Only referring doctor can cancel
        if (referral.referring_doctor_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        if (!['pending', 'accepted'].includes(referral.status)) {
          return NextResponse.json({ error: 'Referral cannot be cancelled' }, { status: 400 })
        }
        
        updates.status = 'cancelled'
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    // Update referral
    const { error: updateError } = await supabase
      .from('doctor_referrals')
      .update(updates)
      .eq('id', id)
    
    if (updateError) {
      throw updateError
    }
    
    // Get updated referral
    const { data: updated } = await supabase
      .from('doctor_referrals')
      .select('*')
      .eq('id', id)
      .single()
    
    return NextResponse.json({
      referral: updated,
      message: `Referral ${action}ed successfully`,
    })
    
  } catch (error) {
    logger.error('[Referrals] Update error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to update referral' },
      { status: 500 }
    )
  }
}
