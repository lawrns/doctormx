import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'doctor') {
    return NextResponse.json({ error: 'Only doctors can manage billing' }, { status: 403 })
  }

  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (doctorError || !doctor?.stripe_customer_id) {
    return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 })
  }

  const origin = request.nextUrl.origin
  const session = await stripe.billingPortal.sessions.create({
    customer: doctor.stripe_customer_id,
    return_url: `${origin}/doctor/subscription`,
  })

  return NextResponse.json({
    success: true,
    portalUrl: session.url,
  })
}
