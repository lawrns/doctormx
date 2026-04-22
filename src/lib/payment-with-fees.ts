// Enhanced Payment Processing with Platform Fees
// Handles payment confirmation, platform fee deduction, and doctor transfers
// Input: Payment intent ID, appointment ID
// Process: Verify payment → Calculate fees → Transfer to doctor → Record everything
// Output: Complete payment record with fee breakdown

import { createServiceClient } from '@/lib/supabase/server'
import { calculatePlatformFee, calculateDoctorNetAmount } from './platform-fees'
import { type SubscriptionTier } from './subscription-types'
import { logger } from '@/lib/observability/logger'
import { ensureVideoRoomForAppointment } from '@/lib/video/videoService'

export interface PaymentWithFees {
  paymentId: string
  appointmentId: string
  grossAmount: number
  platformFee: number
  doctorNetAmount: number
  doctorStripeAccountId?: string
  status: 'pending' | 'transferred' | 'failed'
  transferredAt?: string
}

/**
 * Confirm payment and process platform fee split
 * Called after Stripe webhook confirms successful payment
 */
export async function confirmPaymentWithFees(
  paymentIntentId: string,
  appointmentId: string
): Promise<PaymentWithFees> {
  const supabase = await createServiceClient()

  try {
    // 1. Get payment and appointment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('provider_ref', paymentIntentId)
      .single()

    if (paymentError || !payment) {
      throw new Error(`Payment not found: ${paymentError?.message}`)
    }

    // 2. Get appointment with doctor details
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors (
          id,
          stripe_account_id,
          price_cents,
          subscription_tier
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (apptError || !appointment) {
      throw new Error(`Appointment not found: ${apptError?.message}`)
    }

    const doctor = Array.isArray(appointment.doctor) 
      ? appointment.doctor[0] 
      : appointment.doctor

    if (!doctor) {
      throw new Error('Doctor not found for appointment')
    }

    // 3. Get doctor's subscription tier
    const { data: subscription } = await supabase
      .from('doctor_subscriptions')
      .select('tier')
      .eq('doctor_id', doctor.id)
      .eq('status', 'active')
      .single()

    const tier = (subscription?.tier as SubscriptionTier) || 'starter'

    // 4. Calculate fees
    const grossAmount = payment.amount_cents
    const platformFee = calculatePlatformFee(grossAmount, tier)
    const doctorNet = calculateDoctorNetAmount(grossAmount, tier)

    // 5. Record platform fee
    const { error: feeError } = await supabase
      .from('platform_fees')
      .insert({
        payment_id: payment.id,
        appointment_id: appointmentId,
        doctor_id: doctor.id,
        gross_amount_cents: grossAmount,
        platform_fee_cents: platformFee,
        doctor_net_cents: doctorNet,
        tier: tier,
        fee_percent: tier === 'starter' ? 10 : tier === 'pro' ? 5 : 0,
        status: 'pending_transfer',
      })
      .select()
      .single()

    if (feeError) {
      logger.error('Failed to record platform fee:', { error: feeError })
      // Continue - don't block payment confirmation
    }

    // 6. If doctor has Stripe Connect account, schedule transfer
    if (doctor.stripe_account_id && doctorNet > 0) {
      try {
        await scheduleDoctorTransfer({
          doctorStripeAccountId: doctor.stripe_account_id,
          amount: doctorNet,
          appointmentId,
          paymentId: payment.id,
        })
      } catch (transferError) {
        logger.error('Failed to schedule doctor transfer:', { 
          error: transferError,
          doctorId: doctor.id,
          amount: doctorNet 
        })
        // Mark for manual processing
        await supabase
          .from('platform_fees')
          .update({ 
            status: 'transfer_failed',
            error_message: String(transferError)
          })
          .eq('payment_id', payment.id)
      }
    }

    // 7. Confirm appointment
    await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointmentId)

    ensureVideoRoomForAppointment(supabase, appointmentId).catch((error) => {
      logger.error('Failed to create video room after payment:', { error, appointmentId })
    })

    // 8. Update payment status
    await supabase
      .from('payments')
      .update({ 
        status: 'paid',
        fee_cents: platformFee,
        net_cents: doctorNet,
      })
      .eq('id', payment.id)

    logger.info('Payment confirmed with fees:', {
      paymentId: payment.id,
      appointmentId,
      grossAmount,
      platformFee,
      doctorNet,
      tier,
    })

    return {
      paymentId: payment.id,
      appointmentId,
      grossAmount,
      platformFee,
      doctorNetAmount: doctorNet,
      doctorStripeAccountId: doctor.stripe_account_id,
      status: doctor.stripe_account_id ? 'transferred' : 'pending',
    }

  } catch (error) {
    logger.error('Error confirming payment with fees:', { error, paymentIntentId, appointmentId })
    throw error
  }
}

/**
 * Schedule a transfer to doctor's Stripe Connect account
 */
async function scheduleDoctorTransfer({
  doctorStripeAccountId,
  amount,
  appointmentId,
  paymentId,
}: {
  doctorStripeAccountId: string
  amount: number
  appointmentId: string
  paymentId: string
}) {
  // For now, we'll mark it for manual/automated transfer
  // In production, this would create a Stripe Transfer
  
  const supabase = await createServiceClient()
  
  // Record the pending transfer
  await supabase
    .from('doctor_transfers')
    .insert({
      payment_id: paymentId,
      appointment_id: appointmentId,
      doctor_stripe_account_id: doctorStripeAccountId,
      amount_cents: amount,
      status: 'pending',
      scheduled_for: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    })

  // Note: Actual Stripe Transfer would happen via webhook or cron job
  // to handle the delay (doctors get paid 48 hours after consult)
}

/**
 * Get revenue summary for a date range
 * Used for admin dashboard
 */
export async function getRevenueSummary(
  startDate: Date,
  endDate: Date
): Promise<{
  totalGross: number
  totalPlatformFees: number
  totalDoctorPayouts: number
  consultCount: number
  byTier: Record<SubscriptionTier, { count: number; fees: number }>
}> {
  const supabase = await createServiceClient()

  const { data: fees, error } = await supabase
    .from('platform_fees')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error || !fees) {
    throw new Error(`Failed to get revenue summary: ${error?.message}`)
  }

  const summary = {
    totalGross: 0,
    totalPlatformFees: 0,
    totalDoctorPayouts: 0,
    consultCount: fees.length,
    byTier: {
      starter: { count: 0, fees: 0 },
      pro: { count: 0, fees: 0 },
      elite: { count: 0, fees: 0 },
    } as Record<SubscriptionTier, { count: number; fees: number }>,
  }

  for (const fee of fees) {
    summary.totalGross += fee.gross_amount_cents
    summary.totalPlatformFees += fee.platform_fee_cents
    summary.totalDoctorPayouts += fee.doctor_net_cents
    
    const tier = fee.tier as SubscriptionTier
    if (summary.byTier[tier]) {
      summary.byTier[tier].count++
      summary.byTier[tier].fees += fee.platform_fee_cents
    }
  }

  return summary
}

/**
 * Project annual platform revenue
 * Based on current doctor base and consult volume
 */
export async function projectAnnualRevenue(): Promise<{
  subscriptionRevenue: number
  platformFeeRevenue: number
  totalProjected: number
  assumptions: {
    avgConsultsPerMonth: number
    avgConsultPrice: number
    doctorGrowthRate: number
  }
}> {
  const supabase = await createServiceClient()

  // Get current stats
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, subscription_tier, price_cents')
    .eq('status', 'approved')

  const { data: subscriptions } = await supabase
    .from('doctor_subscriptions')
    .select('tier, plan_price_cents')
    .eq('status', 'active')

  const { data: recentConsults } = await supabase
    .from('appointments')
    .select('doctor_id, status')
    .eq('status', 'completed')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Calculate subscription revenue
  const subscriptionRevenue = (subscriptions || [])
    .reduce((sum, sub) => sum + (sub.plan_price_cents || 0), 0)

  // Estimate platform fees (based on last 30 days)
  const avgConsultsPerDoctor = (recentConsults?.length || 0) / (doctors?.length || 1)
  const avgConsultPrice = (doctors?.reduce((sum, d) => sum + (d.price_cents || 50000), 0) ?? 0) / (doctors?.length || 1) || 50000

  // Project with 20% month-over-month growth
  let monthlyPlatformFees = 0
  for (const doctor of (doctors || [])) {
    const tier = doctor.subscription_tier || 'starter'
    const feeRate = tier === 'starter' ? 0.10 : tier === 'pro' ? 0.05 : 0
    monthlyPlatformFees += avgConsultsPerDoctor * avgConsultPrice * feeRate
  }

  // Growth projection (compounding)
  let annualPlatformRevenue = 0
  let currentMonthlyFees = monthlyPlatformFees
  const growthRate = 1.20 // 20% MoM

  for (let month = 0; month < 12; month++) {
    annualPlatformRevenue += currentMonthlyFees
    currentMonthlyFees *= growthRate
  }

  return {
    subscriptionRevenue: subscriptionRevenue * 12,
    platformFeeRevenue: Math.round(annualPlatformRevenue),
    totalProjected: (subscriptionRevenue * 12) + Math.round(annualPlatformRevenue),
    assumptions: {
      avgConsultsPerMonth: Math.round(avgConsultsPerDoctor),
      avgConsultPrice: Math.round(avgConsultPrice),
      doctorGrowthRate: 0.20,
    },
  }
}
