import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPatientProfile, updatePatientProfile, type UpdateProfileData } from '@/lib/patient'
import { logger } from '@/lib/observability/logger'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profile = await getPatientProfile(user.id)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    logger.error('Error fetching patient profile:', { err: error })
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: UpdateProfileData = await request.json()

    const updatedProfile = await updatePatientProfile(user.id, body)

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    logger.error('Error updating patient profile:', { err: error })
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
