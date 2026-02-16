# Stripe Integration - Reusable Assets

> **Status**: ✅ VERIFIED WORKING  
> **Source**: `src/app/api/webhooks/stripe/`, `src/lib/stripe.ts`

---

## 1. Webhook Route Handler

**Source**: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import { HTTP_STATUS } from '@/lib/constants'
import { verifySignature } from './utils/signature-verification'
import { dispatchEvent, SUPPORTED_EVENTS } from './handlers'
import { logWebhookEvent, logIncomingEvent } from './utils/logging'
import type Stripe from 'stripe'

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  // Validate signature header
  if (!signature) {
    logger.warn('Stripe webhook received without signature')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  // Verify signature
  const verification = verifySignature(body, signature)

  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.error.includes('configured') 
        ? HTTP_STATUS.INTERNAL_SERVER_ERROR 
        : HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const event = verification.event
  logIncomingEvent(event)

  try {
    // Dispatch to appropriate handler
    const handled = await dispatchEvent(event.type, event.data.object)

    if (!handled) {
      logger.info(`Unhandled Stripe event type: ${event.type}`)
    }

    await logWebhookEvent(event, 'processed')
    return NextResponse.json({ received: true, event: event.type })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error processing Stripe webhook:', {
      error: errorMessage,
      eventType: event.type,
      eventId: event.id,
    })

    await logWebhookEvent(event, 'failed', errorMessage)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: errorMessage },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

/**
 * GET handler for webhook verification
 */
export async function GET() {
  return NextResponse.json({
    status: 'Stripe webhook endpoint active',
    supportedEvents: SUPPORTED_EVENTS,
  })
}
```

---

## 2. Signature Verification

**Source**: `src/app/api/webhooks/stripe/utils/signature-verification.ts`

```typescript
import { logger } from '@/lib/observability/logger'
import type Stripe from 'stripe'

interface VerificationResult {
  valid: boolean
  event?: Stripe.Event
  error?: string
}

/**
 * Verify Stripe webhook signature
 */
export function verifySignature(
  body: string,
  signature: string
): VerificationResult {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured')
    return { valid: false, error: 'Webhook secret not configured' }
  }

  try {
    // Dynamically import Stripe to avoid serverless cold start issues
    const { default: Stripe } = require('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    })

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    return { valid: true, event }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.warn('Stripe signature verification failed:', { error: message })
    return { valid: false, error: `Signature verification failed: ${message}` }
  }
}
```

---

## 3. Event Handler System

**Source**: `src/app/api/webhooks/stripe/handlers/index.ts`

```typescript
import { logger } from '@/lib/observability/logger'
import type Stripe from 'stripe'
import type { StripeWebhookEventType } from '../types'

// Import all handlers
import { handlePaymentIntentSucceeded } from './payment-intent-succeeded'
import { handlePaymentIntentFailed } from './payment-intent-failed'
import { handlePaymentIntentCanceled } from './payment-intent-canceled'
import { handleChargeSucceeded } from './charge-succeeded'
import { handleChargeFailed } from './charge-failed'
import { handleCheckoutSessionCompleted } from './checkout-session-completed'
import { handleSubscriptionCreated } from './subscription-created'
import { handleSubscriptionUpdated } from './subscription-updated'
import { handleSubscriptionDeleted } from './subscription-deleted'
import { handleInvoicePaymentSucceeded } from './invoice-payment-succeeded'
import { handleInvoicePaymentFailed } from './invoice-payment-failed'

// Export individual handlers
export {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handlePaymentIntentCanceled,
  handleChargeSucceeded,
  handleChargeFailed,
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
}

type StripeEventHandler = (data: Stripe.Event.Data.Object) => Promise<void>

const HANDLER_MAP: Record<string, StripeEventHandler> = {
  // Card payment events
  'payment_intent.succeeded': handlePaymentIntentSucceeded as StripeEventHandler,
  'payment_intent.payment_failed': handlePaymentIntentFailed as StripeEventHandler,
  'payment_intent.canceled': handlePaymentIntentCanceled as StripeEventHandler,

  // OXXO-specific events (voucher-based payments)
  'charge.succeeded': handleChargeSucceeded as StripeEventHandler,
  'charge.failed': handleChargeFailed as StripeEventHandler,

  // Subscription billing events
  'checkout.session.completed': handleCheckoutSessionCompleted as StripeEventHandler,
  'customer.subscription.created': handleSubscriptionCreated as StripeEventHandler,
  'customer.subscription.updated': handleSubscriptionUpdated as StripeEventHandler,
  'customer.subscription.deleted': handleSubscriptionDeleted as StripeEventHandler,
  'invoice.payment_succeeded': handleInvoicePaymentSucceeded as StripeEventHandler,
  'invoice.payment_failed': handleInvoicePaymentFailed as StripeEventHandler,
}

export const SUPPORTED_EVENTS: StripeWebhookEventType[] = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'charge.succeeded',
  'charge.failed',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]

export function hasHandler(eventType: string): boolean {
  return eventType in HANDLER_MAP
}

export async function dispatchEvent(
  eventType: string,
  eventData: Stripe.Event.Data.Object
): Promise<boolean> {
  const handler = HANDLER_MAP[eventType]

  if (!handler) {
    logger.info(`No handler registered for event type: ${eventType}`)
    return false
  }

  await handler(eventData)
  return true
}

export function getHandler(eventType: string): StripeEventHandler | undefined {
  return HANDLER_MAP[eventType]
}
```

---

## 4. Payment Success Handler (with Idempotency)

**Source**: `src/app/api/webhooks/stripe/handlers/payment-intent-succeeded.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { isEventProcessed } from '../utils/event-validation'
import { sendPaymentNotifications } from '../utils/notifications'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle successful card payment
 * Updates payment status to 'paid' and confirms the appointment
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const supabase = await createClient()
  const appointmentId = paymentIntent.metadata?.appointment_id

  if (!appointmentId) {
    logger.warn('Payment intent succeeded but no appointment_id in metadata', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Check for idempotency - prevent duplicate processing
  const alreadyProcessed = await isEventProcessed(
    paymentIntent.id,
    'payment_intent.succeeded'
  )
  if (alreadyProcessed) {
    logger.info(`Payment intent ${paymentIntent.id} already processed, skipping`)
    return
  }

  try {
    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_method: paymentIntent.payment_method_types?.[0] || 'card',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (paymentError) {
      logger.error('Failed to update payment status:', {
        error: paymentError,
        paymentIntentId: paymentIntent.id,
      })
      throw paymentError
    }

    // Update appointment status to confirmed
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('status', 'pending_payment')  // Only update if still pending
      .select('*, patient:profiles!patient_id(full_name, email, phone)')
      .single()

    if (appointmentError) {
      logger.error('Failed to confirm appointment:', {
        error: appointmentError,
        appointmentId,
      })
      throw appointmentError
    }

    if (appointment) {
      logHandlerSuccess('payment_intent.succeeded', paymentIntent.id, { appointmentId })

      // Send notifications (non-blocking)
      await sendPaymentNotifications(appointment, 'card')
    }
  } catch (error) {
    logHandlerError('payment_intent.succeeded', paymentIntent.id, error, { appointmentId })
    throw error  // Re-throw to trigger Stripe retry
  }
}
```

---

## 5. Idempotency Pattern

**Source**: `src/app/api/webhooks/stripe/utils/event-validation.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

/**
 * Check if event has already been processed
 */
export async function isEventProcessed(
  stripeEventId: string,
  eventType: string
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', stripeEventId)
      .eq('event_type', eventType)
      .single()

    return !!existingEvent
  } catch (error) {
    // If error, assume not processed to be safe
    logger.warn('Error checking event idempotency:', {
      stripeEventId,
      eventType,
      error,
    })
    return false
  }
}

/**
 * Log webhook event for idempotency tracking
 */
export async function logWebhookEvent(
  event: Stripe.Event,
  status: 'processed' | 'failed',
  errorMessage?: string
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('webhook_events').upsert({
    stripe_event_id: event.id,
    event_type: event.type,
    status,
    error_message: errorMessage,
    processed_at: status === 'processed' ? new Date().toISOString() : null,
  }, {
    onConflict: 'stripe_event_id',
  })
}

/**
 * Validate required metadata fields
 */
export function validateMetadata(
  metadata: Record<string, string | undefined>,
  requiredFields: string[]
): { valid: true; values: Record<string, string> } | { valid: false; missing: string[] } {
  const missing: string[] = []
  const values: Record<string, string> = {}

  for (const field of requiredFields) {
    const value = metadata[field]
    if (!value) {
      missing.push(field)
    } else {
      values[field] = value
    }
  }

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return { valid: true, values }
}
```

### Database Schema for Idempotency

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processed', 'failed')),
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);

-- Cleanup old events (run periodically)
DELETE FROM webhook_events 
WHERE created_at < now() - interval '30 days';
```

---

## 6. Payment Flow Logic

### Creating a Payment Intent

```typescript
// src/app/api/create-payment-intent/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Verify user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { appointmentId, paymentMethodType = 'card' } = await request.json()

  // Get appointment details
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, doctor:doctors(price_cents, currency)')
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  // Create Stripe Payment Intent
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
  })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: appointment.doctor.price_cents,
    currency: appointment.doctor.currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: {
      appointment_id: appointmentId,
      patient_id: user.id,
    },
  })

  // Store payment intent reference
  await supabase.from('payments').insert({
    appointment_id: appointmentId,
    patient_id: user.id,
    amount_cents: appointment.doctor.price_cents,
    currency: appointment.doctor.currency,
    stripe_payment_intent_id: paymentIntent.id,
    status: 'pending',
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  })
}
```

### OXXO Payment Flow (Mexico-specific)

```typescript
// src/app/api/webhooks/stripe/handlers/charge-succeeded.ts
export async function handleChargeSucceeded(
  charge: Stripe.Charge
): Promise<void> {
  const supabase = await createClient()

  // OXXO payments come through charge.succeeded (not payment_intent.succeeded)
  if (charge.payment_method_details?.type !== 'oxxo') {
    return  // Not an OXXO payment
  }

  const appointmentId = charge.metadata?.appointment_id
  if (!appointmentId) {
    logger.warn('OXXO charge succeeded but no appointment_id')
    return
  }

  // Idempotency check
  const alreadyProcessed = await isEventProcessed(charge.id, 'charge.succeeded')
  if (alreadyProcessed) {
    logger.info(`OXXO charge ${charge.id} already processed`)
    return
  }

  // Update payment and appointment
  await supabase
    .from('payments')
    .update({ status: 'paid', payment_method: 'oxxo' })
    .eq('stripe_payment_intent_id', charge.payment_intent)

  await supabase
    .from('appointments')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', appointmentId)

  // Send notifications
  // ...
}
```

---

## 7. Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...                    # Server-side only
STRIPE_PUBLISHABLE_KEY=pk_test_...               # Client-side
STRIPE_WEBHOOK_SECRET=whsec_...                  # Webhook verification

# For production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 8. Error Handling Best Practices

```typescript
// Always throw errors to trigger Stripe retries
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    // ... processing logic
  } catch (error) {
    // Log the error
    logger.error('Payment processing failed', { error, paymentIntentId })
    
    // Re-throw to trigger Stripe retry mechanism
    // Stripe will retry up to 3 days with exponential backoff
    throw error
  }
}
```

### Supported Events Reference

| Event | Description | Handler |
|-------|-------------|---------|
| `payment_intent.succeeded` | Card payment successful | ✅ Implemented |
| `payment_intent.payment_failed` | Card payment failed | ✅ Implemented |
| `payment_intent.canceled` | Payment canceled | ✅ Implemented |
| `charge.succeeded` | OXXO payment successful | ✅ Implemented |
| `charge.failed` | OXXO payment failed | ✅ Implemented |
| `checkout.session.completed` | Subscription checkout complete | ✅ Implemented |
| `customer.subscription.created` | New subscription | ✅ Implemented |
| `customer.subscription.updated` | Subscription updated | ✅ Implemented |
| `customer.subscription.deleted` | Subscription canceled | ✅ Implemented |
| `invoice.payment_succeeded` | Subscription payment successful | ✅ Implemented |
| `invoice.payment_failed` | Subscription payment failed | ✅ Implemented |

---

## Summary: What to Keep

✅ **KEEP**:
- Webhook route handler structure
- Signature verification
- Event dispatcher pattern
- Idempotency checking (isEventProcessed)
- Payment intent handlers
- OXXO-specific charge handlers
- Database logging for webhook events
- Error handling (throw to trigger retries)

❌ **LEAVE BEHIND**:
- Unused event handlers
- Incomplete notification implementations
- Hardcoded test values
- Debug logging in production
