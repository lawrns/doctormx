import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPatientInsurance } from '@/lib/insurance'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    insuranceId,
    policyNumber,
    memberId,
    holderName,
    coverageType,
  } = await request.json()

  if (!insuranceId) {
    return NextResponse.json({ error: 'insuranceId required' }, { status: 400 })
  }

  try {
    const record = await createPatientInsurance({
      patientId: user.id,
      insuranceId,
      policyNumber,
      memberId,
      holderName,
      coverageType,
    })

    return NextResponse.json({ patientInsurance: record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No fue posible guardar el seguro' },
      { status: 400 }
    )
  }
}
