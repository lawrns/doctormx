import { NextRequest, NextResponse } from 'next/server'
import { getDoctorById } from '@/lib/doctors'
import { checkSubscriptionStatus } from '@/lib/subscription'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const doctor = await getDoctorById(id)

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    const subscriptionStatus = await checkSubscriptionStatus(id)

    const isActive = (doctor.doctor_subscriptions as Array<{ status: string; current_period_end: string }> | null | undefined)?.some(
      sub => sub.status === 'active' && new Date(sub.current_period_end) > new Date()
    ) || false

    return NextResponse.json({
      ...doctor,
      subscription_status: isActive ? 'active' : 'inactive',
      subscription_details: subscriptionStatus.subscription,
    })
  } catch {
    return NextResponse.json(
      { error: 'Doctor not found' },
      { status: 404 }
    )
  }
}
