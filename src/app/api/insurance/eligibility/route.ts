import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getInsuranceCheckoutOptions,
  getSelectedInsuranceEstimate,
} from '@/lib/insurance'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appointmentId = request.nextUrl.searchParams.get('appointmentId')

  if (!appointmentId) {
    return NextResponse.json({ error: 'appointmentId required' }, { status: 400 })
  }

  try {
    const options = await getInsuranceCheckoutOptions(appointmentId, user.id, supabase)
    return NextResponse.json(options)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No fue posible validar el seguro' },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { appointmentId, patientInsuranceId } = await request.json()

  if (!appointmentId) {
    return NextResponse.json({ error: 'appointmentId required' }, { status: 400 })
  }

  try {
    const result = await getSelectedInsuranceEstimate({
      appointmentId,
      patientId: user.id,
      patientInsuranceId,
      supabase,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No fue posible validar el seguro' },
      { status: 400 }
    )
  }
}
