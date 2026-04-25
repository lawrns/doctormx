// Sistema de Suscripciones para Pacientes
// Input: Patient ID, Plan ID
// Process: Check subscription → Validate quota → Track usage → Handle Stripe checkout
// Output: Subscription status with usage limits

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/observability/logger'

export interface PatientPlan {
  id: string
  name: string
  description: string | null
  price_cents: number
  interval: string
  consultations_per_month: number | null
  features: string[]
  stripe_price_id: string | null
  is_active: boolean
}

export interface PatientSubscription {
  id: string
  patient_id: string
  plan_id: string
  plan?: PatientPlan
  stripe_subscription_id: string | null
  status: string
  current_period_start: string
  current_period_end: string
  consultations_used: number
  consultations_total: number
  created_at: string
}

export interface ConsultationQuotaResult {
  allowed: boolean
  used: number
  total: number
  subscriptionActive: boolean
  planName?: string
}

export async function getPatientPlans(): Promise<PatientPlan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('patient_subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_cents', { ascending: true })

  if (error) {
    logger.error('Error fetching patient plans:', { error })
    return []
  }

  return (data || []).map((plan: Record<string, unknown>) => ({
    id: plan.id as string,
    name: plan.name as string,
    description: plan.description as string | null,
    price_cents: plan.price_cents as number,
    interval: plan.interval as string,
    consultations_per_month: plan.consultations_per_month as number | null,
    features: (plan.features as string[]) || [],
    stripe_price_id: plan.stripe_price_id as string | null,
    is_active: plan.is_active as boolean,
  }))
}

export async function getPatientSubscription(patientId: string): Promise<PatientSubscription | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('patient_subscriptions')
    .select(`
      *,
      plan:patient_subscription_plans(*)
    `)
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const plan = data.plan as Record<string, unknown> | null
  const consultationsTotal = (plan?.consultations_per_month as number) || 0

  return {
    id: data.id as string,
    patient_id: data.patient_id as string,
    plan_id: data.plan_id as string,
    stripe_subscription_id: data.stripe_subscription_id as string | null,
    status: data.status as string,
    current_period_start: data.current_period_start as string,
    current_period_end: data.current_period_end as string,
    consultations_used: (data.consultations_used as number) || 0,
    consultations_total: consultationsTotal,
    created_at: data.created_at as string,
    plan: plan ? {
      id: plan.id as string,
      name: plan.name as string,
      description: plan.description as string | null,
      price_cents: plan.price_cents as number,
      interval: plan.interval as string,
      consultations_per_month: plan.consultations_per_month as number | null,
      features: (plan.features as string[]) || [],
      stripe_price_id: plan.stripe_price_id as string | null,
      is_active: plan.is_active as boolean,
    } : undefined,
  }
}

export async function checkConsultationQuota(patientId: string): Promise<ConsultationQuotaResult> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('patient_subscriptions')
    .select(`
      *,
      plan:patient_subscription_plans(*)
    `)
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .maybeSingle()

  if (!subscription) {
    return { allowed: true, used: 0, total: 0, subscriptionActive: false }
  }

  const plan = subscription.plan as Record<string, unknown> | null
  const limit = (plan?.consultations_per_month as number) || 0
  const used = (subscription.consultations_used as number) || 0

  if (limit <= 0) {
    return {
      allowed: true,
      used: 0,
      total: 0,
      subscriptionActive: true,
      planName: plan?.name as string,
    }
  }

  return {
    allowed: used < limit,
    used,
    total: limit,
    subscriptionActive: true,
    planName: plan?.name as string,
  }
}

export async function incrementConsultationUsage(patientId: string): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.rpc('increment_patient_consultation_usage', {
    p_patient_id: patientId,
  })

  if (error) {
    logger.error('Error incrementing consultation usage:', { error, patientId })
    throw error
  }
}

export async function createPatientSubscriptionViaStripe(
  patientId: string,
  planId: string
): Promise<{ clientSecret?: string; error?: string }> {
  const supabase = createServiceClient()

  try {
    // Check if patient already has an active subscription
    const { data: existing } = await supabase
      .from('patient_subscriptions')
      .select('id')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return { error: 'Ya tienes una suscripcion activa. Cancela la actual antes de contratar otra.' }
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('patient_subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (!plan) {
      return { error: 'Plan no encontrado.' }
    }

    // Get patient profile for Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', patientId)
      .single()

    if (!profile) {
      return { error: 'Perfil de paciente no encontrado.' }
    }

    // Use Stripe price ID if available, otherwise create payment intent
    if (plan.stripe_price_id && plan.stripe_price_id.startsWith('price_')) {
      // Create Stripe Checkout Session for subscription
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: profile.email,
        line_items: [{
          price: plan.stripe_price_id,
          quantity: 1,
        }],
        metadata: {
          patient_id: patientId,
          plan_id: planId,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/app/suscripcion?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/app/suscripcion?canceled=true`,
      })

      return { clientSecret: session.id }
    }

    // Fallback: create a one-time payment intent for the first month
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price_cents as number,
      currency: 'mxn',
      metadata: {
        patient_id: patientId,
        plan_id: planId,
        type: 'patient_subscription',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return { clientSecret: paymentIntent.client_secret || undefined }
  } catch (error) {
    logger.error('Error creating patient subscription via Stripe:', { error })
    return { error: error instanceof Error ? error.message : 'Error al procesar el pago.' }
  }
}
