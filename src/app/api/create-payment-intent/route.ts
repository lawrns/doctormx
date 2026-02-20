import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializePayment } from '@/lib/payment'
import { withRateLimit } from '@/lib/rate-limit/middleware'
import { logger } from '@/lib/observability/logger'
import { logSecurityEvent } from '@/lib/security/audit-logger'

/**
 * POST /api/create-payment-intent
 * 
 * Creates a Stripe PaymentIntent for an appointment.
 * Security: Validates that the authenticated user owns the appointment before
 * allowing payment creation to prevent IDOR (Insecure Direct Object Reference) attacks.
 */
export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { appointmentId } = await req.json()

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId required' },
        { status: 400 }
      )
    }

    try {
      // SECURITY CHECK: Verify patient owns the appointment before creating payment
      // This prevents IDOR attacks where User A tries to pay for User B's appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('patient_id, status, id')
        .eq('id', appointmentId)
        .single()

      if (appointmentError || !appointment) {
        logger.warn('Payment attempt for non-existent appointment', {
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
        const ipAddress = (req.headers.get('x-forwarded-for') ?? 
                         req.headers.get('x-real-ip')) ?? 'unknown'
        const userAgent = req.headers.get('user-agent') ?? 'unknown'
        
        await logSecurityEvent({
          eventType: 'permission_denied',
          severity: 'high',
          userId: user.id,
          description: `IDOR_ATTEMPT: User ${user.id} attempted to create payment for appointment ${appointmentId} belonging to patient ${appointment.patient_id}`,
          ipAddress,
          userAgent,
          details: {
            type: 'IDOR_ATTEMPT',
            targetResource: appointmentId,
            resourceType: 'appointment',
            action: 'create_payment',
            actualOwner: appointment.patient_id,
            attemptedBy: user.id,
            timestamp: new Date().toISOString(),
          },
        })

        logger.warn(`IDOR_ATTEMPT_BLOCKED: User ${user.id} tried to pay for appointment ${appointmentId} owned by ${appointment.patient_id}`, {
          userId: user.id,
          appointmentId,
          actualOwner: appointment.patient_id,
        })

        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Validate appointment status allows payment
      const payableStatuses = ['pending_payment', 'pending']
      if (!payableStatuses.includes(appointment.status)) {
        logger.warn('Payment attempt for non-payable appointment', {
          userId: user.id,
          appointmentId,
          status: appointment.status,
        })
        return NextResponse.json(
          { error: `Cannot create payment for appointment with status: ${appointment.status}` },
          { status: 400 }
        )
      }

      // Sistema de pago maneja todo: validación + stripe + registro
      const result = await initializePayment({
        appointmentId,
        userId: user.id,
      })

      logger.info('Payment intent created successfully', {
        userId: user.id,
        appointmentId,
      })

      return NextResponse.json(result)
    } catch (error) {
      logger.error('Error creating payment intent:', { err: error, userId: user.id, appointmentId })
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }
  })
}
