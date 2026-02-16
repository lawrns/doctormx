import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmSuccessfulPayment } from '@/lib/payment'
import { withRateLimit } from '@/lib/rate-limit/middleware'
import { logger } from '@/lib/observability/logger'
import { logSecurityEvent } from '@/lib/security/audit-logger'

/**
 * POST /api/confirm-payment
 * 
 * Confirms a successful payment and updates appointment status.
 * Security: Validates that the authenticated user owns the appointment before
 * confirming payment to prevent IDOR attacks.
 */
export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { appointmentId, paymentIntentId } = await req.json()

    if (!appointmentId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'appointmentId and paymentIntentId are required' },
        { status: 400 }
      )
    }

    try {
      // SECURITY CHECK: Verify patient owns the appointment before confirming payment
      // This prevents IDOR attacks where User A tries to confirm payment for User B's appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('patient_id, status, id')
        .eq('id', appointmentId)
        .single()

      if (appointmentError || !appointment) {
        logger.warn('Payment confirmation attempt for non-existent appointment', {
          userId: user.id,
          appointmentId,
        })
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      // IDOR Protection: Verify ownership
      if (appointment.patient_id !== user.id) {
        // Log security event for IDOR attempt
        const ipAddress = req.headers.get('x-forwarded-for') || 
                         req.headers.get('x-real-ip') || 
                         'unknown'
        const userAgent = req.headers.get('user-agent') || 'unknown'
        
        await logSecurityEvent({
          eventType: 'permission_denied',
          severity: 'high',
          userId: user.id,
          description: `IDOR_ATTEMPT: User ${user.id} attempted to confirm payment for appointment ${appointmentId} belonging to patient ${appointment.patient_id}`,
          ipAddress,
          userAgent,
          details: {
            type: 'IDOR_ATTEMPT',
            targetResource: appointmentId,
            resourceType: 'appointment',
            action: 'confirm_payment',
            actualOwner: appointment.patient_id,
            attemptedBy: user.id,
            paymentIntentId,
            timestamp: new Date().toISOString(),
          },
        })

        logger.warn(`IDOR_ATTEMPT_BLOCKED: User ${user.id} tried to confirm payment for appointment ${appointmentId} owned by ${appointment.patient_id}`, {
          userId: user.id,
          appointmentId,
          actualOwner: appointment.patient_id,
          paymentIntentId,
        })

        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Verify payment belongs to this appointment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('id, appointment_id, status')
        .eq('provider_ref', paymentIntentId)
        .single()

      if (paymentError || !payment) {
        logger.warn('Payment confirmation attempt for non-existent payment', {
          userId: user.id,
          appointmentId,
          paymentIntentId,
        })
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }

      if (payment.appointment_id !== appointmentId) {
        // Payment intent doesn't match the appointment - potential fraud
        await logSecurityEvent({
          eventType: 'suspicious_activity',
          severity: 'critical',
          userId: user.id,
          description: `PAYMENT_MISMATCH: User ${user.id} attempted to confirm payment ${paymentIntentId} for wrong appointment ${appointmentId}`,
          details: {
            type: 'PAYMENT_MISMATCH',
            paymentIntentId,
            requestedAppointmentId: appointmentId,
            actualAppointmentId: payment.appointment_id,
          },
        })

        return NextResponse.json(
          { error: 'Payment does not match appointment' },
          { status: 400 }
        )
      }

      // Sistema de confirmación maneja todo: verificar + actualizar + confirmar
      const result = await confirmSuccessfulPayment(paymentIntentId, appointmentId)

      if (!result.success) {
        return NextResponse.json(
          { error: 'Payment not successful' },
          { status: 400 }
        )
      }

      logger.info('Payment confirmed successfully', {
        userId: user.id,
        appointmentId,
        paymentIntentId,
      })

      return NextResponse.json({
        success: true,
        appointment: result.appointment,
      })
    } catch (error) {
      logger.error('Error confirming payment:', { err: error, userId: user.id, appointmentId })
      return NextResponse.json(
        { error: 'Failed to confirm payment' },
        { status: 500 }
      )
    }
  })
}
