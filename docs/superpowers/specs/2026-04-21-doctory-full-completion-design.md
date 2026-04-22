# Doctory — Full Production Completion Design

**Date:** 2026-04-21  
**Scope:** Full production-ready telemedicine platform (video + physical appointments, Doctoralia-parity)  
**Approach:** Phase 0 auth fix → 5 parallel workstreams  
**Stack:** Next.js 16 App Router, Supabase, Stripe, Daily.co, Resend, WhatsApp  

---

## Decisions Log

| Question | Answer |
|---|---|
| Completion scope | Full production (D) — all features + polish |
| Appointment types | Video (telemedicine) + presencial, like Doctoralia |
| Video provider | Daily.co (already in codebase) |
| Doctor verification | SEP cédula auto-verify via real API, admin confirms edge cases |
| Notifications | Email (Resend) + WhatsApp — both channels for all critical events |
| Payment model | Hybrid: free profile + SEP verify → subscribe to go live in directory |

---

## Phase 0 — Auth Bug Fix (Blocking, Do First)

Two bugs prevent doctors from landing on the correct dashboard.

### Bug 1: Middleware null-profile bypass

**File:** `src/lib/supabase/middleware.ts:121`  
**Problem:** `if (!userProfile) return supabaseResponse` — when the `profiles` table lookup fails (race condition immediately after registration), the middleware skips role enforcement entirely. A doctor visiting `/app` passes through unchecked and sees the patient dashboard.  
**Fix:** Replace with a redirect to `/auth/login?redirect={path}` on null profile. Also add explicit cross-role redirect: doctor at `/app/*` → `/doctor`, patient at `/doctor/*` → `/app`.

```ts
// Before
if (!userProfile) return supabaseResponse

// After
if (!userProfile) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/login'
  url.searchParams.set('redirect', path)
  return NextResponse.redirect(url)
}

// Cross-role guard (add after role is confirmed)
if (userProfile.role === 'doctor' && path.startsWith('/app')) {
  return NextResponse.redirect(new URL('/doctor', request.url))
}
if (userProfile.role === 'patient' && path.startsWith('/doctor')) {
  return NextResponse.redirect(new URL('/app', request.url))
}
```

### Bug 2: Subscription checkout routes to appointment checkout

**File:** `src/app/doctor/subscription/page.tsx:162`  
**Problem:** `router.push('/checkout/${data.subscription.id}')` sends the doctor to the appointment payment page (`/checkout/[appointmentId]`), which uses payment intents. Subscriptions require Stripe Checkout Sessions — a completely different flow.  
**Fix:** `/api/subscriptions` POST must return `{ checkoutUrl: string }` (a Stripe Checkout Session URL). Client does `window.location.href = checkoutUrl` to redirect to Stripe-hosted subscription page.

---

## Workstream 1 — Stripe Doctor Subscriptions

### API Route: `POST /api/subscriptions`

New file: `src/app/api/subscriptions/route.ts`

**Request body:** `{ planId: 'starter' | 'pro' | 'elite' | 'clinic', billingInterval: 'month' | 'year' }`

**Flow:**
1. Authenticate user, verify `profiles.role === 'doctor'`
2. Look up or create Stripe Customer (`stripe.customers.create` with `metadata: { doctorId }`)
3. Store `stripe_customer_id` in `doctors` table
4. Map `planId` + `billingInterval` → correct Price ID from env:
   - `STRIPE_STARTER_PRICE_ID` / `STRIPE_STARTER_ANNUAL_PRICE_ID`
   - `STRIPE_PRO_PRICE_ID` / `STRIPE_PRO_ANNUAL_PRICE_ID`
   - `STRIPE_ELITE_PRICE_ID` / `STRIPE_ELITE_ANNUAL_PRICE_ID`
   - `STRIPE_CLINIC_PRICE_ID` / `STRIPE_CLINIC_ANNUAL_PRICE_ID`
5. Create Stripe Checkout Session: `mode: 'subscription'`, `payment_method_types: ['card']`, `success_url: /doctor?subscribed=1`, `cancel_url: /doctor/subscription`
6. Return `{ checkoutUrl: session.url }`

**Client update** (`subscription/page.tsx:handleSubscribe`):
```ts
if (data.checkoutUrl) {
  window.location.href = data.checkoutUrl
}
```

### Webhook additions: `src/app/api/webhooks/stripe/route.ts`

| Event | Action |
|---|---|
| `customer.subscription.created` | Upsert `doctor_subscriptions` (`status: active`, `tier`, `current_period_end`). If doctor is SEP-verified, also set `doctors.status = 'approved'`. |
| `customer.subscription.updated` | Update `doctor_subscriptions` tier/period. |
| `customer.subscription.deleted` | Set `status: 'cancelled'`. Hide doctor from directory (set `doctors.is_listed = false`). |
| `invoice.payment_failed` | Trigger WhatsApp + email payment failure notification to doctor. 3-day grace period before hiding from directory (`is_listed = false`). |
| `checkout.session.completed` | Guard: if `mode === 'subscription'`, ensure `doctor_subscriptions` is upserted (belt-and-suspenders with the event above). |

### Database changes

```sql
-- Add stripe_customer_id to doctors table
ALTER TABLE doctors ADD COLUMN stripe_customer_id text;
ALTER TABLE doctors ADD COLUMN is_listed boolean DEFAULT false;

-- doctor_subscriptions table (if not exists)
CREATE TABLE IF NOT EXISTS doctor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  tier text NOT NULL,       -- 'starter' | 'pro' | 'elite' | 'clinic'
  billing_interval text,    -- 'month' | 'year'
  status text NOT NULL,     -- 'active' | 'cancelled' | 'past_due'
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## Workstream 2 — SEP Cédula Real API

### Replace mock in `src/lib/sep-verification/index.ts`

**Current state:** `searchCedula()` uses a hardcoded mock dictionary.  
**Target:** Real HTTP call to SEP's public cédula endpoint.

```ts
// Real SEP API call (replace mock CEDULA_DATABASE lookup)
async function fetchFromSEP(cedula: string): Promise<CedulaSearchResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const response = await fetch(
      `https://www.cedulaprofesional.sep.gob.mx/cedula/presidencia/indexAvanzada.action?json=true&cedula=${cedula}`,
      { signal: controller.signal, headers: { 'Accept': 'application/json' } }
    )
    clearTimeout(timeout)
    if (!response.ok) throw new Error(`SEP API ${response.status}`)
    const data = await response.json()
    return mapSEPResponse(data)  // normalize field names to CedulaSearchResult
  } catch (err) {
    clearTimeout(timeout)
    // On timeout/network error: return status: 'not_found' → routes to manual admin review
    return { found: false, cedula, status: 'not_found' }
  }
}
```

**Auto-trigger:** When doctor completes onboarding form and submits, call `verifyCedulaSEP(cedula, fullName)` server-side. Results:
- Confidence ≥ 70%: store result, set `doctors.status = 'pending'`, notify admin
- Confidence < 70%: flag for manual admin review, store raw SEP data, notify admin with low-confidence warning
- SEP unreachable: queue for retry (30-min cron), notify admin

### Admin review route

`/admin/verify` already exists. Wire it to `doctor_verifications` table. Admin can:
- See SEP result + confidence score
- Click "Aprobar" → sets `doctors.status = 'approved'` + triggers subscription check
- Click "Solicitar documentos" → emails doctor asking for manual credential upload
- Click "Rechazar" → sets `doctors.status = 'rejected'`, notifies doctor

---

## Workstream 3 — Notifications (Email + WhatsApp)

### Email: Resend

Install `resend` npm package. Add `RESEND_API_KEY` to env. Create `src/lib/email/` with:
- `resend-client.ts` — lazy init of Resend client
- `templates/` — React Email components in Spanish for each event type
- `send-notification.ts` — unified `sendEmail(event, data)` dispatcher

### WhatsApp

Existing `src/lib/whatsapp-notifications.ts` — wire all untriggered calls. Confirm `WHATSAPP_API_KEY` env var is set.

### Notification Events Matrix

| Event | Email | WhatsApp | Recipient(s) |
|---|---|---|---|
| Doctor registered | ✓ welcome + onboarding steps | ✓ | Doctor |
| SEP verification complete | ✓ result + next step | ✓ | Doctor |
| Doctor approved | ✓ go-live confirmation | ✓ | Doctor |
| Doctor rejected | ✓ reason + appeal link | ✓ | Doctor |
| Doctor SEP verified — new pending | ✓ review queue alert | — | Admin |
| Appointment booked | ✓ confirmation + details | ✓ | Doctor + Patient |
| Appointment reminder 24h | ✓ | ✓ | Doctor + Patient |
| Video link ready (15min before) | — | ✓ with join link | Doctor + Patient |
| Appointment cancelled | ✓ + refund info | ✓ | Doctor + Patient |
| Appointment completed | ✓ + prescription if issued | — | Patient |
| Payment failed (subscription) | ✓ | ✓ | Doctor |
| Subscription activated | ✓ receipt | — | Doctor |

All WhatsApp messages use Spanish. All emails use Spanish with Doctory branding.

---

## Workstream 4 — Video + Physical Appointments

### Booking Flow: Appointment Type Selector

Add `appointment_type: 'video' | 'presencial'` field to the booking UI. For `presencial`: show doctor's `office_address` (require doctors to fill this in their profile). For `video`: show estimated duration, system requirements note.

Database: `appointments.appointment_type` already typed in `src/types/index.ts`.

### Video Room Creation

**Trigger:** When `appointments.status` changes to `confirmed` AND `appointment_type === 'video'`:
- Server action calls `createVideoRoom()` from `src/lib/video/videoService.ts:47`
- Stores `video_room_url` + `video_token` back to `appointments` row
- Sets `video_status: 'ready'`
- Sends WhatsApp with join link to both parties (via WS3 notification)

**Environment vars required:** `DAILY_API_KEY`, `DAILY_DOMAIN`

### Video Join UI

**Patient page:** `src/app/app/appointments/[id]/video/page.tsx`  
**Doctor page:** `src/app/doctor/consultation/[appointmentId]/page.tsx`

Both pages:
1. Check `isVideoAppointmentJoinable()` — show countdown if too early
2. Call `GET /api/appointments/[id]/video` to get a fresh join token (`getJoinToken()`)
3. Embed Daily.co via `@daily-co/daily-js` (already in package.json v0.87.0): `callFrame.join({ url, token })`
4. On call end event: update `video_status: 'completed'`, show SOAP notes form

### Post-Call: SOAP Notes + Prescription

After doctor ends call:
- Inline SOAP notes form (Subjective, Objective, Assessment, Plan)
- Optional: generate digital prescription PDF (`src/lib/prescriptions-pdf.ts`)
- On submit: store notes to `appointments.consultation_notes`, email PDF to patient

### Physical Appointment Flow

For `presencial` appointments: no video room. Confirmation email includes office address + Google Maps link. Day-of WhatsApp reminder includes address. After appointment: doctor marks complete from dashboard, SOAP notes optional.

---

## Workstream 5 — Admin Panel

### Doctor Approval Queue: `/admin/doctors`

- List filtered by `doctors.status = 'pending'`
- Each row shows: name, specialty, cédula, SEP confidence score, registration date
- Inline actions: **Aprobar** / **Solicitar docs** / **Rechazar**
- Approving: sets `doctors.status = 'approved'`, triggers WS3 notification

### Verification Review: `/admin/verify` (already exists, wire to real data)

- Shows raw SEP response + name match score for each flagged doctor
- Manual override: admin can approve despite low confidence with a note

### Directory Listing Filter

The doctors directory query (`src/lib/domains/directory/index.ts`) must filter: `doctors.status = 'approved' AND doctors.is_listed = true`. This ensures only subscribed + verified doctors appear. Wire this filter — it's likely missing or not enforced today.

### Revenue Dashboard: `/admin` (RevenueDashboard component exists)

- Wire to real `doctor_subscriptions` + `payments` tables
- Show MRR, churn, active doctors by tier, appointment volume

### Dispute / Refund: `/admin/appointments`

- List appointments with `status: 'cancelled'` or patient complaints
- Trigger Stripe refund via `stripe.refunds.create({ payment_intent: ... })`

---

## Environment Variables Checklist

```bash
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (add annual Price IDs)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_STARTER_ANNUAL_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
STRIPE_ELITE_PRICE_ID=
STRIPE_ELITE_ANNUAL_PRICE_ID=
STRIPE_CLINIC_PRICE_ID=
STRIPE_CLINIC_ANNUAL_PRICE_ID=

# Daily.co (new)
DAILY_API_KEY=
DAILY_DOMAIN=

# Resend (new)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@doctory.mx

# WhatsApp (existing)
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=
```

---

## Implementation Order

```
Phase 0  ─────── Auth middleware fix + subscription checkout fix (1 dev, ~2h)
                          │
                          ▼
Phase 1  ┌────────────────────────────────────────────────┐
         │  WS1: Stripe    WS2: SEP     WS3: Notify       │
         │  subscriptions  real API     email+whatsapp     │
         │                                                 │
         │  WS4: Video+physical   WS5: Admin panel        │
         └────────────────────────────────────────────────┘
                    (all 5 run in parallel)
                          │
                          ▼
Phase 2  ─────── QA: full user journey smoke tests (patient + doctor)
```

Each workstream is independent — no shared file writes except `route.ts` additions and the `stripe webhook handler` (WS1 owns that, others read-only).

---

## Success Criteria

- [ ] Doctor registers → lands on `/doctor/onboarding`, never on `/app`
- [ ] Doctor completes onboarding → cédula verified against real SEP API
- [ ] Doctor subscribes → Stripe Checkout Session, payment recorded, `is_listed: true`
- [ ] Patient books video appointment → Daily.co room created, both parties get WhatsApp join link
- [ ] Patient books presencial appointment → confirmation with office address
- [ ] Post-call: doctor submits SOAP notes → patient receives email with notes/prescription
- [ ] Admin approves doctor → doctor notified via email + WhatsApp, appears in directory
- [ ] Subscription payment fails → doctor notified, hidden from directory after grace period
- [ ] All notifications in Spanish, all emails Doctory-branded
