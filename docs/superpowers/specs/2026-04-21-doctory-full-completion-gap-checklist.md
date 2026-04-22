# Doctory Full Completion Gap Checklist

**Source spec:** [2026-04-21-doctory-full-completion-design.md](/Users/lukatenbosch/Downloads/doctory/docs/superpowers/specs/2026-04-21-doctory-full-completion-design.md)

## Legend

- `[x]` Implemented
- `[~]` Partially implemented
- `[ ]` Missing

## Phase 0 - Blocking Auth Fix

- [x] Middleware now redirects missing profiles to login instead of bypassing role enforcement. See [src/lib/supabase/middleware.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/supabase/middleware.ts:121).
- [x] Cross-role redirects exist for doctor-to-patient and patient-to-doctor routing. See [src/lib/supabase/middleware.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/supabase/middleware.ts:128).
- [x] Subscription checkout uses Stripe Checkout Sessions and returns `checkoutUrl`. See [src/app/api/subscriptions/route.ts](/Users/lukatenbosch/Downloads/doctory/src/app/api/subscriptions/route.ts:74).

## Workstream 1 - Stripe Doctor Subscriptions

- [x] `POST /api/subscriptions` creates a Stripe Checkout Session. See [src/app/api/subscriptions/route.ts](/Users/lukatenbosch/Downloads/doctory/src/app/api/subscriptions/route.ts:160).
- [x] Webhook handles `customer.subscription.created`, `updated`, `deleted`, `invoice.payment_failed`, and `checkout.session.completed`. See [src/app/api/webhooks/stripe/route.ts](/Users/lukatenbosch/Downloads/doctory/src/app/api/webhooks/stripe/route.ts:225).
- [x] `doctor_subscriptions` persistence and `stripe_customer_id` support exist in migrations. See [supabase/migrations/20260421090000_doctory_full_completion.sql](/Users/lukatenbosch/Downloads/doctory/supabase/migrations/20260421090000_doctory_full_completion.sql:1).
- [~] Subscription lifecycle still depends on existing status rows and does not visibly expose a dedicated end-of-grace cleanup job. The webhook stores `grace_period_ends_at`, but there is no scheduler shown that hides doctors when the grace window expires. See [src/app/api/webhooks/stripe/route.ts](/Users/lukatenbosch/Downloads/doctory/src/app/api/webhooks/stripe/route.ts:181).

## Workstream 2 - SEP Cedula Verification

- [x] SEP lookup is no longer a mock and now calls the public endpoint. See [src/lib/sep-verification/index.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/sep-verification/index.ts:187).
- [x] Doctor onboarding triggers SEP verification server-side. See [src/app/api/doctor/onboarding/route.ts](/Users/lukatenbosch/Downloads/doctory/src/app/api/doctor/onboarding/route.ts:37).
- [x] Verification results are stored in `doctor_verifications`. See [src/lib/sep-verification/index.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/sep-verification/index.ts:339).
- [~] Admin review is wired to pending doctors, but it does not yet surface SEP raw response, confidence score, or manual override notes in the current UI. See [src/app/admin/verify/page.tsx](/Users/lukatenbosch/Downloads/doctory/src/app/admin/verify/page.tsx:6) and [src/app/api/admin/verify-doctor/route.ts](/Users/lukatenbosch/Downloads/doctory/src/app/api/admin/verify-doctor/route.ts:6).
- [~] Approval still updates only `doctors.status`; it does not visibly trigger the subscription check or notification flow described in the spec. See [src/app/api/admin/verify-doctor/route.ts](/Users/lukatenbosch/Downloads/doctory/src/app/api/admin/verify-doctor/route.ts:37).

## Workstream 3 - Notifications

- [x] Email sending exists via Resend in the main notification module. See [src/lib/notifications.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/notifications.ts:1).
- [x] WhatsApp notification service exists and supports subscription failure alerts. See [src/lib/whatsapp-notifications.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/whatsapp-notifications.ts:1).
- [x] Core appointment confirmation, reminder, receipt, and follow-up email endpoints exist. See [src/app/api/notifications/email/appointment-confirmed/route.ts](/Users/lukatenbosch/Downloads/doctory/src/app/api/notifications/email/appointment-confirmed/route.ts:1).
- [~] The spec asked for a dedicated `src/lib/email/` structure with templates and dispatcher; the current implementation is consolidated in `src/lib/notifications.ts` instead.
- [~] The full notification matrix is not complete yet. Doctor approval, rejection, verification queue alerts, appointment cancellation, video-link-ready, and subscription-activated messages are not clearly implemented as separate event paths.

## Workstream 4 - Video + Physical Appointments

- [x] Appointment booking supports `video` and `in_person`. See [src/app/book/[doctorId]/BookingForm.tsx](/Users/lukatenbosch/Downloads/doctory/src/app/book/[doctorId]/BookingForm.tsx:52).
- [x] Appointment schema includes `appointment_type`, `video_status`, `consultation_notes`, and `video_room_id`. See [supabase/migrations/006_add_video_appointments.sql](/Users/lukatenbosch/Downloads/doctory/supabase/migrations/006_add_video_appointments.sql:1).
- [x] Daily.co room creation and join-token logic exist in the video service. See [src/lib/video/videoService.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/video/videoService.ts:1).
- [x] Patient video join page exists. See [src/app/app/appointments/[id]/video/page.tsx](/Users/lukatenbosch/Downloads/doctory/src/app/app/appointments/[id]/video/page.tsx:1).
- [~] The patient join page is functional but still uses a simplified client-side Daily iframe integration and does not show the full pre-join/token refresh flow described in the spec.
- [ ] Doctor video join page is missing. The spec called for `src/app/doctor/consultation/[appointmentId]/page.tsx`, but the current doctor consultation page is a static placeholder. See [src/app/doctor/consultation/[appointmentId]/page.tsx](/Users/lukatenbosch/Downloads/doctory/src/app/doctor/consultation/[appointmentId]/page.tsx:189).
- [ ] Post-call SOAP notes submission and prescription PDF flow are not implemented in the doctor consultation UI.
- [~] Physical appointment booking exists, but the current booking flow still routes to checkout and does not fully show all spec-required office-address and reminder behavior in one place. See [src/app/book/[doctorId]/BookingForm.tsx](/Users/lukatenbosch/Downloads/doctory/src/app/book/[doctorId]/BookingForm.tsx:130).

## Workstream 5 - Admin Panel

- [x] Admin dashboard exists. See [src/app/admin/page.tsx](/Users/lukatenbosch/Downloads/doctory/src/app/admin/page.tsx:1).
- [~] `/admin/doctors` is linked but not implemented as a page. See [src/app/admin/page.tsx](/Users/lukatenbosch/Downloads/doctory/src/app/admin/page.tsx:135).
- [~] `/admin/verify` exists but is a simplified pending-doctors list, not the SEP review experience described in the spec. See [src/app/admin/verify/page.tsx](/Users/lukatenbosch/Downloads/doctory/src/app/admin/verify/page.tsx:6).
- [~] Directory discovery filters approved doctors, but it does not enforce `is_listed = true` in the query layer the way the spec requested. See [src/lib/discovery.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/discovery.ts:117).
- [x] The more production-focused directory module already filters by active subscription and approved status after query time. See [src/lib/discovery.ts](/Users/lukatenbosch/Downloads/doctory/src/lib/discovery.ts:128).

## Checklist Against Success Criteria

- [x] Doctor registration to onboarding redirect is handled correctly.
- [x] Doctor onboarding runs SEP verification.
- [x] Doctor subscription checkout uses Stripe Checkout.
- [~] Video appointment creation and joining work, but the doctor-side consultation flow is still incomplete.
- [~] Presencial booking works, but the end-to-end messaging and office-address presentation are not fully aligned with the spec.
- [~] SOAP notes are present in the broader codebase, but not fully connected to the doctor consultation completion flow.
- [~] Admin approval exists, but notifications and review detail depth are incomplete.
- [~] Subscription failure handling exists, but directory hiding after grace expiry is not fully automated.
- [~] Notifications are partly implemented, but the complete Spanish Doctory-branded matrix is not wired everywhere.

## Highest-Priority Gaps

1. Build `/admin/doctors`.
2. Expand `/admin/verify` with SEP confidence, raw response, and manual override flow.
3. Finish doctor-side video consultation UI and connect SOAP/prescription completion.
4. Enforce `doctors.is_listed = true` in directory queries.
5. Add an automated grace-period cleanup for `past_due` subscriptions.
6. Finish the notification matrix for doctor approval, rejection, and appointment lifecycle events.
