import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getPatientSubscription,
  getPatientPlans,
  checkConsultationQuota,
  createPatientSubscriptionViaStripe,
} from '@/lib/patient-subscriptions'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const subscription = await getPatientSubscription(user.id)
    const quota = await checkConsultationQuota(user.id)
    const plans = subscription ? null : await getPatientPlans()

    return NextResponse.json({
      subscription,
      quota,
      plans,
    })
  } catch (error) {
    console.error('Error fetching patient subscription:', error)
    return NextResponse.json({ error: 'Error al obtener la suscripcion' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { plan_id } = await request.json()

    if (!plan_id) {
      return NextResponse.json({ error: 'Se requiere el ID del plan' }, { status: 400 })
    }

    const result = await createPatientSubscriptionViaStripe(user.id, plan_id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ clientSecret: result.clientSecret })
  } catch (error) {
    console.error('Error creating patient subscription:', error)
    return NextResponse.json({ error: 'Error al crear la suscripcion' }, { status: 500 })
  }
}
