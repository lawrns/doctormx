# Payment Metadata Fixes - Week 1 Flow A

## Summary
Converted all payment metadata from camelCase to snake_case for consistency with Stripe webhook handling.

## Changes Made

### 1. src/lib/payment.ts - Metadata Conversion

**BEFORE:**
```typescript
metadata: {
  appointmentId: request.appointmentId,
  doctorId: appointmentData.doctorId,
  patientId: request.userId,
}
```

**AFTER:**
```typescript
metadata: {
  appointment_id: request.appointmentId,
  doctor_id: appointmentData.doctorId,
  patient_id: request.userId,
}
```

### 2. src/lib/payment.ts - Refund Metadata Conversion

**BEFORE:**
```typescript
metadata: {
  appointmentId,
  reason,
}
```

**AFTER:**
```typescript
metadata: {
  appointment_id: appointmentId,
  reason,
}
```

### 3. src/lib/payment.ts - Logger Context Updates

Updated logger context keys to use snake_case for consistency:
- `patientId` → `patient_id`
- `doctorId` → `doctor_id`

### 4. src/lib/payment.ts - stripe_payment_intent_id Field

Updated `recordPaymentAttempt` function to populate both fields:
- `provider_ref` (legacy)
- `stripe_payment_intent_id` (new)

```typescript
await supabase.from('payments').insert({
  appointment_id: data.appointmentId,
  provider: 'stripe',
  provider_ref: data.providerRef,
  stripe_payment_intent_id: data.providerRef,  // Added
  amount_cents: data.amount,
  currency: data.currency,
  status: 'pending',
  fee_cents: 0,
  net_cents: data.amount,
})
```

## Metadata Fields

| Field (camelCase) | Field (snake_case) | Description |
|-------------------|-------------------|-------------|
| appointmentId | appointment_id | Reference to appointment UUID |
| doctorId | doctor_id | Reference to doctor UUID |
| patientId | patient_id | Reference to patient UUID |

## Database Schema

The `payments` table already has the `stripe_payment_intent_id` field (confirmed in migration 001_complete_schema.sql):

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Verification

- [x] Metadata fields converted to snake_case
- [x] Refund metadata updated to snake_case
- [x] Logger context keys updated
- [x] stripe_payment_intent_id field populated on payment creation
- [x] Webhook handlers already use snake_case (no changes needed)

## Impact

This change ensures consistency between:
1. Payment metadata sent to Stripe
2. Webhook handlers reading metadata from Stripe
3. Database queries using stripe_payment_intent_id
4. TypeScript types (PaymentRow)

## Date Completed
2026-02-16
