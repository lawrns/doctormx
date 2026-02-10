# Webhook Signature Verification

## Overview

This document describes the comprehensive webhook signature verification system implemented for Doctor.mx. The system provides secure signature verification for all external webhooks including Stripe, Twilio, and Meta/WhatsApp Business API.

## Architecture

The webhook signature verification system is located in `src/lib/webhooks/` and consists of:

- **signatures.ts**: Core verification functions for each provider
- **index.ts**: Module exports and types
- **__tests__/signatures.test.ts**: Comprehensive test suite

## Security Features

### 1. Timing-Safe Comparison

All signature comparisons use `crypto.timingSafeEqual()` to prevent timing attacks that could leak information about valid signatures.

```typescript
import { timingSafeEqual } from 'crypto'

const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
const providedBuffer = Buffer.from(signature, 'utf8')

if (expectedBuffer.length !== providedBuffer.length) {
  return false
}

return timingSafeEqual(expectedBuffer, providedBuffer)
```

### 2. HMAC-Based Verification

All providers use HMAC (Hash-based Message Authentication Code) for signature verification:

- **Stripe**: HMAC-SHA256
- **Twilio**: HMAC-SHA1
- **WhatsApp**: HMAC-SHA256

### 3. Timestamp Validation (Stripe)

Stripe webhooks include timestamp validation to prevent replay attacks. Webhooks with timestamps older than 5 minutes are rejected.

### 4. Comprehensive Logging

Failed verification attempts are logged with sufficient context for monitoring while avoiding sensitive data exposure.

## Supported Providers

### Stripe

**Header**: `stripe-signature`

**Format**: `t={timestamp},v1={signature}`

**Environment Variable**: `STRIPE_WEBHOOK_SECRET`

**Example Usage**:

```typescript
import { verifyStripeWebhook } from '@/lib/webhooks'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  const isValid = verifyStripeWebhook(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 })
  }

  // Process webhook...
}
```

### Twilio

**Header**: `X-Twilio-Signature`

**Environment Variable**: `TWILIO_AUTH_TOKEN`

**Special Considerations**:
- Requires the full URL (including query string)
- Signs URL + sorted form parameters

**Example Usage**:

```typescript
import { verifyTwilioWebhook } from '@/lib/webhooks'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('X-Twilio-Signature')!

  const isValid = verifyTwilioWebhook(
    request.url,
    body,
    signature,
    process.env.TWILIO_AUTH_TOKEN!
  )

  if (!isValid) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Parse form data and process...
}
```

### WhatsApp (Meta)

**Header**: `X-Hub-Signature-256`

**Format**: `sha256={signature}`

**Environment Variable**: `WHATSAPP_APP_SECRET`

**Example Usage**:

```typescript
import { verifyWhatsAppWebhook } from '@/lib/webhooks'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('X-Hub-Signature-256')!

  const isValid = verifyWhatsAppWebhook(
    body,
    signature,
    process.env.WHATSAPP_APP_SECRET!
  )

  if (!isValid) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Parse JSON and process...
}
```

## Generic Verification Helper

For more flexibility, use the generic `verifyWebhookSignature` function:

```typescript
import { verifyWebhookSignature } from '@/lib/webhooks'

const result = verifyWebhookSignature({
  provider: 'stripe',
  secret: process.env.STRIPE_WEBHOOK_SECRET!,
  payload: await request.text(),
  signature: request.headers.get('stripe-signature')!,
})

if (!result.valid) {
  console.error('Verification failed:', result.error)
  return new Response('Invalid signature', { status: 401 })
}
```

## Middleware Helper

For Next.js route handlers, use the `createWebhookVerifier` helper:

```typescript
import { createWebhookVerifier } from '@/lib/webhooks'

const verifyStripeWebhook = createWebhookVerifier('stripe', () =>
  process.env.STRIPE_WEBHOOK_SECRET!
)

export async function POST(request: Request) {
  const verification = await verifyStripeWebhook(request)

  if (!verification.valid) {
    return new Response('Invalid signature', { status: 401 })
  }

  // Process webhook...
}
```

## Testing Helpers

The module includes test helpers for development/testing purposes:

```typescript
import {
  generateTestStripeSignature,
  generateTestWhatsAppSignature,
  generateTestTwilioSignature,
} from '@/lib/webhooks'

// Generate test signatures
const stripeSig = generateTestStripeSignature(payload, webhookSecret)
const whatsappSig = generateTestWhatsAppSignature(payload, appSecret)
const twilioSig = generateTestTwilioSignature(url, payload, authToken)
```

**WARNING**: These helpers should ONLY be used for testing purposes.

## Environment Variables

Ensure the following environment variables are configured:

```bash
# Stripe
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio
TWILIO_AUTH_TOKEN=...

# WhatsApp/Meta
WHATSAPP_APP_SECRET=...
```

## Error Handling

All verification functions return `boolean` for simple success/failure:

```typescript
if (!verifyStripeWebhook(payload, signature, secret)) {
  // Handle failed verification
  return new Response('Invalid signature', { status: 401 })
}
```

Failed verifications are automatically logged using the structured logger:

```typescript
logger.warn('Stripe webhook verification failed: Invalid signature', {
  provider: 'stripe',
  // Additional context without sensitive data
})
```

## Testing

Run the comprehensive test suite:

```bash
npm test src/lib/webhooks/__tests__/signatures.test.ts
```

The test suite includes:

- Valid signature verification
- Invalid signature rejection
- Timestamp validation (Stripe)
- Malformed signature handling
- Missing parameter handling
- Edge cases (empty payloads, special characters, large payloads)
- Timing-safe comparison verification

## Implementation Checklist

- [x] Create `src/lib/webhooks/signatures.ts` with all verification functions
- [x] Implement Stripe webhook verification with HMAC-SHA256
- [x] Implement Twilio webhook verification with HMAC-SHA1
- [x] Implement WhatsApp webhook verification with HMAC-SHA256
- [x] Use `crypto.timingSafeEqual()` for all comparisons
- [x] Add comprehensive logging for failed verifications
- [x] Update Stripe webhook handler (`src/app/api/webhooks/stripe/route.ts`)
- [x] Update Twilio webhook handler (`src/app/api/webhooks/twilio/route.ts`)
- [x] Update WhatsApp webhook handler (`src/app/api/webhooks/whatsapp/route.ts`)
- [x] Update followups callback handler (`src/app/api/followups/callback/route.ts`)
- [x] Return 401 for invalid signatures
- [x] Create comprehensive test suite
- [x] TypeScript compiles with 0 errors (in webhook module)

## Security Best Practices

1. **Never log sensitive data**: The verification functions only log non-sensitive context
2. **Always use timing-safe comparison**: Prevents timing attacks
3. **Validate timestamps**: Prevents replay attacks (Stripe)
4. **Return 401 on failure**: Consistent HTTP status for authentication failures
5. **Fail securely**: Default to rejection if verification fails

## Monitoring

Failed webhook verifications are logged with structured context:

```json
{
  "timestamp": "2024-02-09T22:50:09.845Z",
  "level": "warn",
  "message": "Stripe webhook verification failed: Signature mismatch",
  "context": {
    "provider": "stripe",
    "hasPayload": true,
    "hasSignature": true,
    "hasSecret": true
  }
}
```

Monitor these logs for:
- Unexpected increase in failed verifications (potential attacks)
- Missing configuration (secrets not set)
- Signature format changes (provider updates)

## References

- [Stripe Webhook Signatures](https://stripe.com/docs/webhooks/signatures)
- [Twilio Webhook Security](https://www.twilio.com/docs/usage/security#webhook-security)
- [Meta Webhook Security](https://developers.facebook.com/docs/graph-api/webhooks/setup#verify-payloads)
