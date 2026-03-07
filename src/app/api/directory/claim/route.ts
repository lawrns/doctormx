// Directory Claim API - Initiate Profile Claim
// POST: Start claim process for unclaimed profile

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    const enabled = await isFeatureEnabled('directory_claim_flow_enabled', { userId: user.id })
    if (!enabled) {
      return NextResponse.json(
        { error: 'Profile claiming is not available' },
        { status: 403 }
      )
    }
    
    // Parse body
    const body = await request.json()
    const { profile_id, cedula_profesional } = body
    
    if (!profile_id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      )
    }
    
    // Check if profile exists and is unclaimed
    const { data: profile, error: profileError } = await supabase
      .from('unclaimed_doctor_profiles')
      .select('*')
      .eq('id', profile_id)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    if (profile.claim_status !== 'unclaimed') {
      return NextResponse.json(
        { error: 'Profile has already been claimed or is pending claim' },
        { status: 400 }
      )
    }
    
    // Check if user already has a pending claim
    const { data: existingClaim } = await supabase
      .from('profile_claims')
      .select('id')
      .eq('claimant_user_id', user.id)
      .eq('doctor_profile_id', profile_id)
      .in('status', ['claim_pending', 'verification_required'])
      .single()
    
    if (existingClaim) {
      return NextResponse.json(
        { error: 'You already have a pending claim for this profile', claim_id: existingClaim.id },
        { status: 400 }
      )
    }
    
    // Check if user already has a doctor profile
    const { data: existingDoctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (existingDoctor) {
      return NextResponse.json(
        { error: 'You already have a doctor profile' },
        { status: 400 }
      )
    }
    
    // Create claim
    const { data: claim, error: claimError } = await supabase
      .from('profile_claims')
      .insert({
        doctor_profile_id: profile_id,
        claimant_user_id: user.id,
        status: 'claim_pending',
        cedula_profesional: cedula_profesional || profile.cedula_profesional,
      })
      .select()
      .single()
    
    if (claimError) {
      console.error('[DirectoryClaim] Create error:', claimError)
      throw claimError
    }
    
    // Update profile status
    await supabase
      .from('unclaimed_doctor_profiles')
      .update({ 
        claim_status: 'claim_pending',
        claim_id: claim.id,
      })
      .eq('id', profile_id)
    
    return NextResponse.json({
      claim_id: claim.id,
      status: claim.status,
      next_step: 'verification_required',
      message: 'Claim initiated. Please complete verification.',
    }, { status: 201 })
    
  } catch (error) {
    console.error('[DirectoryClaim] Error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate claim' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's claims
    const { data: claims, error } = await supabase
      .from('profile_claims')
      .select(`
        *,
        unclaimed_doctor_profiles (
          id,
          full_name,
          specialty,
          city,
          state
        )
      `)
      .eq('claimant_user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ claims })
    
  } catch (error) {
    console.error('[DirectoryClaim] List error:', error)
    return NextResponse.json(
      { error: 'Failed to list claims' },
      { status: 500 }
    )
  }
}
