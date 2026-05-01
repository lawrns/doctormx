# Money Path

## Sellable Wedge

The core revenue path is:

1. Patient enters through `/ai-consulta`, `/app/ai-consulta`, `/doctors`, `/doctors/[id]`, or specialty/city SEO routes.
2. System recommends or displays real doctors.
3. Patient books via `/book/[doctorId]`, `/checkout/[appointmentId]`, or widget flow.
4. Appointment is created as `pending_payment`.
5. Stripe PaymentIntent is created.
6. Successful payment marks payment paid and appointment confirmed.
7. Video room is created or made available.
8. Doctor conducts consult and may use AutoSOAP/prescriptions/followups.
9. Admin verifies doctors and monitors marketplace quality.

## Booking Semantics Observed

Key file: `src/lib/booking.ts`

- Entry: `reserveAppointmentSlot()`.
- Checks patient consultation quota before slot reservation.
- Calls `expireStalePendingPaymentAppointments({ doctorId })`.
- Validates slot availability through `getAvailableSlots()`.
- Validates doctor availability and status:
  - doctor must exist,
  - `doctor.status` must be `approved`,
  - video/in-person availability must match doctor settings,
  - in-person needs office address.
- Creates `appointment_holds` with 10-minute expiry.
- Inserts `appointments` with:
  - `status: pending_payment`,
  - `appointment_type`,
  - video status pending for video appointments,
  - optional `consultation_id`,
  - optional AI pre-consulta notes.
- Non-blocking side effects:
  - email confirmation,
  - WhatsApp confirmation,
  - reminder scheduling,
  - availability cache invalidation.

Do not change booking statuses, hold behavior, slot conflict behavior, quota behavior, reminder side effects, or AI referral linkage casually.

## Payment Semantics Observed

Key file: `src/lib/payment.ts`

- Entry: `initializePayment()`.
- Looks up appointment by appointment ID and patient user ID.
- Uses doctor price and currency unless a patient insurance estimate is selected.
- Creates Stripe PaymentIntent with Mexican payment methods:
  - `card`,
  - `oxxo`,
  - `customer_balance` / SPEI.
- Metadata includes appointment, doctor, patient, amount, currency, insurance fields.
- Records pending payment in `payments`.
- If insurance selected and accepted, upserts appointment insurance claim.

Confirmation:
- `confirmSuccessfulPayment()` retrieves Stripe PaymentIntent.
- Requires `paymentIntent.status === 'succeeded'`.
- Calls `validatePaymentIntentBinding()` before confirming.
- Updates payment to `paid`.
- Updates appointment to `confirmed`.
- Calls `ensureVideoRoomForAppointment()` asynchronously.
- Sends receipt email and WhatsApp asynchronously.

Failure/refund:
- `handlePaymentFailure()` cancels appointment, releases holds, marks payment failed.
- `processRefund()` creates Stripe refund and marks payment refunded.

Do not weaken PaymentIntent binding, alter Stripe webhook source-of-truth assumptions, or change pending/confirmed/refunded semantics without a dedicated security/payment review.

## Video Consult Semantics Observed

Key file: `src/lib/video.ts`

- Canonical service comment says Daily.co primary, Jitsi fallback.
- `createVideoRoom()` creates `doctory-${appointmentId}` rooms.
- If `DAILY_API_KEY` or `DAILY_DOMAIN` is missing, it returns a Jitsi URL.
- Daily rooms are private and expire after two hours.
- `isVideoAppointmentJoinable()` requires:
  - appointment has `video_room_url`,
  - appointment type is `video`,
  - current time is at least 15 minutes before appointment start.

Video behavior is a production trust boundary. Do not change fallback provider, room naming, joinability, appointment access, or token behavior casually.

## Doctor/Admin Flow

Key files:
- `src/app/api/admin/verify-doctor/route.ts`
- `src/app/api/doctor/verify-cedula/route.ts`
- `src/lib/public-trust.ts`

Observed admin verification:
- Requires authenticated user.
- Requires profile role `admin`.
- Accepts `approve`, `reject`, `request_docs`.
- Approval sets doctor `status: approved`.
- Approval sets `is_listed` only if doctor has active subscription.
- Approval attempts to set `doctor_verifications.sep_verified = true`.
- Reject/request docs set `is_listed: false`.
- Sends email/WhatsApp status notifications when contact data exists.

Observed doctor cédula verification:
- Auth required.
- Verifies cédula through `verifyCedulaSEP()`.
- Stores result with `storeVerificationResult()`.
- Can return autofill data from SEP result.

Do not loosen approval/listing rules, cédula verification policy, or public trust display logic.

## First Narrow Implementation Task

Before new features, make the verification baseline credible:

1. Run the existing baseline commands.
2. Identify whether `npm run verify` is actually runnable locally/CI.
3. If it fails, fix only the smallest test/config issues required to make the baseline meaningful.
4. Do not touch product semantics while doing this.
