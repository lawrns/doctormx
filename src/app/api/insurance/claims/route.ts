import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getDoctorInsuranceClaims } from '@/lib/insurance'

export async function GET() {
  const { user } = await requireRole('doctor')

  try {
    const claims = await getDoctorInsuranceClaims(user.id)
    return NextResponse.json({ claims })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No fue posible consultar reclamos' },
      { status: 500 }
    )
  }
}
