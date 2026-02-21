import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPatientMedicalHistory, updatePatientMedicalHistory, type UpdateMedicalHistoryData } from '@/lib/patient'
import { logger } from '@/lib/observability/logger'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const medicalHistory = await getPatientMedicalHistory(user.id)

    return NextResponse.json({ medicalHistory })
  } catch (error) {
    logger.error('Error fetching medical history:', { err: error })
    return NextResponse.json({ error: 'Failed to fetch medical history' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: UpdateMedicalHistoryData = await request.json()

    const updatedHistory = await updatePatientMedicalHistory(user.id, body)

    return NextResponse.json({ medicalHistory: updatedHistory })
  } catch (error) {
    logger.error('Error updating medical history:', { err: error })
    return NextResponse.json({ error: 'Failed to update medical history' }, { status: 500 })
  }
}
