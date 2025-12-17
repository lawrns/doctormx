import { NextRequest, NextResponse } from 'next/server'
import { getDoctorById } from '@/lib/doctors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const doctor = await getDoctorById(id)
    return NextResponse.json(doctor)
  } catch {
    return NextResponse.json(
      { error: 'Doctor not found' },
      { status: 404 }
    )
  }
}
