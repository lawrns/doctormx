import { NextRequest, NextResponse } from 'next/server'
import { getTrialStatus, startDoctorTrial } from '@/lib/trials'

export async function GET(request: NextRequest) {
  const doctorId = request.nextUrl.searchParams.get('doctorId')

  if (!doctorId) {
    return NextResponse.json({ error: 'Missing doctorId' }, { status: 400 })
  }

  const status = await getTrialStatus(doctorId)
  return NextResponse.json(status)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { doctorId } = body

  if (!doctorId) {
    return NextResponse.json({ error: 'Missing doctorId' }, { status: 400 })
  }

  const result = await startDoctorTrial(doctorId)
  if (!result.success) {
    return NextResponse.json(result, { status: 409 })
  }

  return NextResponse.json(result)
}
