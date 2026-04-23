# DoctorMx — AI Handoff Document

**Date:** 2026-04-22  
**Completed Phases:** 1 (Reminders + Intake Forms), 2 (AutoSOAP Clinical Scribing), and 3.1 (Embeddable Booking Widget)  
**Next Phases:** 3.2 (Insurance), 4 (Campaigns + Practice Management)

---

## 1. Project Overview

Doctor.mx is a telemedicine platform for Mexico. We are closing competitive gaps with Doctoralia PRO. The codebase is Next.js 15 + React + TypeScript + Tailwind CSS v3 + shadcn/ui + Supabase (Postgres) + Netlify.

**Design system:** Follows `taste-skill` (high-agency frontend). Key rules:
- No emojis, no neon glows, no pure black, no Inter font
- Use Framer Motion with spring physics for animations
- Use Geist/Satoshi for headlines, sans-serif for UI
- Lucide React icons only
- Asymmetric layouts, tinted shadows, max 1 accent color

---

## 2. Completed Work

### Phase 1.1 — Automated Appointment Reminders (DONE)

**Database tables:**
- `appointment_reminder_schedules` — per-channel reminder schedule entries
- `doctor_reminder_preferences` — doctor-configured channels/timings

**API routes:**
- `POST /api/reminders/cron` — cron job to send due reminders (email/SMS/WhatsApp)
- `POST /api/reminders/respond` — patient confirm/cancel/reschedule webhook
- `GET/PUT /api/doctor/reminders/preferences` — doctor settings CRUD
- `GET /api/doctor/reminders/stats` — reminder stats + recent activity

**UI pages:**
- `/doctor/reminders/page.tsx` — doctor settings UI (channel toggles, timing toggles, status, recent activity)

**Integration:**
- `src/lib/booking.ts` line ~76: `scheduleAppointmentReminders(appointment.id)` is called after successful booking

**Backend lib:**
- `src/lib/reminders.ts` — full reminder scheduling/sending/response logic

---

### Phase 1.2 — Patient Intake Forms (DONE)

**Database tables:**
- `intake_form_templates` — doctor-built form templates (field definitions as JSONB)
- `patient_intake_responses` — patient-filled forms with red-flag detection

**API routes:**
- `GET/POST/PUT/DELETE /api/intake/templates` — template CRUD
- `GET/POST /api/intake/responses` — patient submission + doctor review

**UI pages:**
- `/doctor/intake-forms/page.tsx` — form builder with 6 field types (text, textarea, select, multiselect, scale, toggle), drag-style reordering, default templates
- `/app/intake/[appointmentId]/page.tsx` — patient-facing form with validation and red-flag alerts

**Components:**
- `src/components/IntakeResponseReview.tsx` — expandable review card for doctors, used in appointments list
- `src/app/doctor/appointments/page.tsx` now embeds `IntakeResponseReview` below each `AppointmentCard`

---

### Phase 2 — AutoSOAP AI Clinical Scribing (DONE)

**Name:** AutoSOAP (never call it "Noa" — that name was rejected).

**Database tables:**
- `soap_notes` — AI-generated + doctor-reviewed SOAP notes with status lifecycle (`draft` → `generating` → `pending_review` → `approved` → `rejected` → `archived`)
- `feature_flags` — toggles including `ai_soap_notes_enabled` (default: enabled for all via migration)

**API routes:**
- `GET/POST/PATCH /api/soap-notes/appointment/[appointmentId]` — CRUD for SOAP notes linked to appointments
- `POST /api/soap-notes/generate` — AI generation endpoint (already existed, generates from transcript + patient context)
- `POST /api/soap-notes/[id]/approve` — approve with optional doctor edits

**UI components:**
- `src/components/AutoSoapPanel.tsx` — accordion-style SOAP editor (Subjetivo/Objetivo/Análisis/Plan)
  - Shows patient intake context
  - "Generar borrador" — calls AI generation API
  - "Guardar borrador" — saves as `pending_review`
  - "Finalizar nota" — approves and sends to patient

**Pages:**
- `/doctor/consultation/[appointmentId]/page.tsx` — video call page now includes `AutoSoapPanel` in the sidebar instead of the old plain textarea
- `/doctor/consultation/[appointmentId]/review/page.tsx` — post-consultation review page (read-only SOAP display + "Enviar al paciente" action)

**Integration flow:**
1. During video call, doctor opens AutoSOAP panel
2. Patient intake form responses are fetched and displayed as context
3. Doctor clicks "Generar borrador" → API sends transcript + intake context to AI → returns structured SOAP
4. Doctor edits any section → clicks "Finalizar nota" → sets `status=approved`, `sent_to_patient_at=NOW()`

**Feature flag:**
- `ai_soap_notes_enabled` is set to `true` with 100% rollout in migration `20260422150000_auto_soap_notes.sql`

---

### Phase 3.1 — Embeddable Website Booking Widget (DONE)

**Database tables:**
- `doctor_widget_configs` — per-doctor widget colors, copy, service JSON, allowed origins, active state
- `widget_booking_intents` — public widget payment links with hashed booking tokens

**Migration:**
- `20260422170000_booking_widget.sql`
  - Adds `doctor_widget_configs`
  - Adds `widget_booking_intents`
  - Adds missing `profiles.email`
  - Adds appointment cancellation metadata columns used by existing cancellation code

**API routes:**
- `GET/POST /api/widget/config` — public config by `doctorId` and authenticated doctor settings upsert
- `GET /api/widget/dates` — CORS-enabled available dates for active widgets
- `GET /api/widget/slots` — CORS-enabled available time slots
- `POST /api/widget/book` — CORS-enabled public booking endpoint; creates/reuses patient profile, creates appointment, creates Stripe PaymentIntent, returns widget payment URL

**UI pages/components:**
- `/widget/[doctorId]/page.tsx` — iframe-safe booking surface without Doctor.mx support chrome
- `/widget/pay/[appointmentId]/page.tsx` — token-protected public Stripe PaymentElement checkout
- `/widget/success/page.tsx` — public post-payment confirmation surface
- `/doctor/widget/page.tsx` — doctor settings UI with colors, services, live preview iframe, copyable embed code
- `src/components/BookingWidget.tsx` — iframe-friendly service/calendar/time/patient form with loading, empty, error, and confirmation states

**Integration notes:**
- `next.config.ts` no longer sends `X-Frame-Options: DENY` for `/widget/*`; the rest of the app still keeps the deny header.
- `src/components/SupportWidget.tsx` hides itself on `/widget/*` so embeds stay clean.
- `src/lib/availability.ts` now checks active appointment holds with the service client when computing occupied slots.
- `src/lib/payment-with-fees.ts` marks `widget_booking_intents.status = paid` after Stripe webhook payment confirmation.
- Remote Supabase migration was applied on 2026-04-22 via `psql` and recorded in `supabase_migrations.schema_migrations`.

### Homepage + Support Widget Polish (DONE)

**Homepage layout changes:**
- `src/components/landing/HowItWorks.tsx` no longer uses one large rounded card/list slab; it is now an open line-based clinical flow.
- `src/components/landing/FeaturesSection.tsx` no longer uses a grid of feature cards; it now uses thin rule-separated feature rows.
- `src/components/landing/StatsSection.tsx` no longer boxes each metric as a card; metrics sit on open dividers.
- `src/components/public/TrustClaimBlock.tsx` uses open rule-separated claims instead of a nested card container.
- Follow-up cleanup removed the loud high-contrast homepage direction from `dad04739`: `ClinicalFlowStage` and `ClinicalSafetySection` were deleted, the hero returned to a calmer light clinical layout, and `FeaturesSection` was restored as a restrained divider-led editorial section.

**Support widget changes:**
- Bottom-right launcher now uses design-system tokens (`ink`, `border`, `primary-foreground`, `shadow-color`) instead of hardcoded sky/cyan gradients.
- Support panel, send button, user messages, thinking state, and action cards were normalized to token colors and tokenized shadows.
- Dr. Simeon UX personalization pass made `/ai-consulta` conversation-first, hid the support widget on AI consult surfaces, normalized naming to `Dr. Simeon`, removed exposed tool/confidence UI from the main chat, and toned down authenticated intake gradients/emoji/severity styling.
- Redis env reads now use runtime bracket access so `REDIS_URL` is not statically inlined into Netlify build artifacts.
- `/api/ai/preconsulta` now returns a bounded Dr. Simeon degraded-mode response when upstream AI providers are unavailable instead of hard-failing with 503.

---

## 3. Architecture & Key Files

### Design System
- `taste-skill` compliance: spring physics via Framer Motion, no emojis, Lucide icons, Geist/Satoshi fonts
- Common animation values: `transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}`
- Cards use `shadow-[0_1px_3px_rgba(0,0,0,0.04)]` or `shadow-[0_8px_30px_rgba(0,0,0,0.08)]`
- Badges: `text-[10px]` for compact status indicators

### AI / LLM
- Primary: OpenRouter (Kimi K2.5) via `src/lib/openai.ts` (the `glm` client)
- Fallback: OpenAI for Whisper transcription only
- Config in `src/lib/ai/config.ts`
- SOAP generation domain: `src/lib/domains/soap-notes/index.ts` (already existed)

### Supabase
- Use `createClient()` for user-scoped queries (with RLS)
- Use `createServiceClient()` for cron jobs / background tasks (bypasses RLS)
- Auth middleware: `src/lib/auth.ts` `requireRole(role)`

### Booking Flow
- Booking: `/src/lib/booking.ts` → `reserveAppointmentSlot()` → calls `scheduleAppointmentReminders()`
- Video rooms: Daily.co (`src/lib/video.ts`, `src/lib/video/videoService.ts`)

---

## 4. Pending Work (Phases 3–4)

### Phase 3.2 — Insurance Integration (PENDING)

**Goal:** Accept IMSS, ISSSTE, GNP, AXA, MetLife, etc.

**What to build:**
- `insurance_providers` table: `id`, `name`, `type` (public/private), `logo_url`, `coverage_rules JSONB`
- `patient_insurance` table: `patient_id`, `provider_id`, `policy_number`, `member_id`, `is_active`
- `appointment_insurance_claims` table: `appointment_id`, `patient_insurance_id`, `status`, `claim_number`, `reimbursement_amount_cents`
- UI in patient checkout: insurance selector, copay calculation
- UI in doctor finances: claims dashboard, reimbursement tracking
- API: `src/app/api/insurance/...` for eligibility checks, claim submission

**Key complexity:** Public insurers (IMSS/ISSSTE) require FOLIO documents and 24-48h approval. Private insurers (GNP/AXA) have real-time APIs via WebService. Start with private first.

---

### Phase 4.1 — Patient Communication Campaigns (PENDING)

**Goal:** Bulk email/WhatsApp campaigns to patients (recalls, promotions, health tips).

**What to build:**
- `communication_campaigns` table: `id`, `doctor_id`, `name`, `channel` (email/whatsapp), `template_body`, `audience_filter JSONB`, `scheduled_at`, `status`
- `campaign_recipients` table: `campaign_id`, `patient_id`, `status` (pending/sent/failed), `sent_at`
- Doctor UI: `/doctor/campaigns/page.tsx` — campaign builder with audience segmentation (last visit > 6 months, specific specialty, etc.)
- API: `src/app/api/campaigns/...` for CRUD + send queue
- Cron job: `src/app/api/campaigns/cron/route.ts` — process scheduled campaigns

---

### Phase 4.2 — Practice Management (PENDING)

**Goal:** Waitlists, rooms, patient flow — clinic operations.

**What to build:**
- `waiting_list_entries` table: `patient_id`, `doctor_id`, `preferred_date_range`, `priority`, `status` (waiting/called/no_show/completed)
- `clinic_rooms` table: `id`, `doctor_id`, `name`, `type` (consultation/procedure/waiting)
- `patient_flow_events` table: `appointment_id`, `room_id`, `event_type` (arrived/in_room/seen/paid/left), `timestamp`
- Doctor UI: `/doctor/clinic-flow/page.tsx` — Kanban-style flow board (Waiting → In Room → Seen → Paid → Done)
- API: `src/app/api/waitlist/...`, `src/app/api/clinic-flow/...`

---

## 5. Known Issues & Blockers

1. **AutoSOAP production schema was reconciled on 2026-04-22.**
   - Production had the older `feature_flags(name, is_active)` shape and was missing `soap_notes`.
   - Migration `20260423021000_fix_auto_soap_production_schema.sql` adds the newer feature flag columns, seeds `ai_soap_notes_enabled`, creates `soap_notes`, and was applied/recorded on the remote Supabase project.

2. **AutoSOAP AI generation requires OpenRouter API key.**
   - If `OPENROUTER_API_KEY` is missing, the generate endpoint will fail.
   - Fallback: mock generation or skip AI draft, let doctor type manually.
   - Production AI health on 2026-04-22 showed provider credentials returning 401; replace the Netlify AI keys for real generation. Public preconsulta now has a safe degraded fallback, but provider-backed generation still needs valid keys.

3. **Daily.co video calls require Daily API key.**
   - Already configured in env.

4. **Patient intake form responses API currently uses `appointment_id` query param.**
   - Works but was built quickly; consider adding a direct foreign key from `patient_intake_responses` → `appointments` if needed.

5. **Chat transcript capture in video calls is local-only.**
   - AutoSOAP only captures typed chat messages. Real-time speech-to-text requires Deepgram/AssemblyAI integration (not built).

6. **Netlify deploy command was interrupted in the last session.**
   - Last successful deploy was Phase 1 (commit `0d7fd204`).
   - Phase 2 commit `936108fb` is pushed to GitHub but may not be deployed yet.
   - Run: `cd /Users/lukatenbosch/Downloads/doctory && npx netlify deploy --build --prod`

7. **Booking widget payments require Stripe env vars.**
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` must be configured.
   - Public widget bookings create PaymentIntents directly; webhook confirmation remains the source of truth for marking appointments confirmed.

8. **Booking widget public patient creation requires Supabase service role.**
   - `/api/widget/book` uses `SUPABASE_SERVICE_ROLE_KEY` to create/reuse patient profiles for external website visitors.

9. **Supabase CLI migration history has a remote-only entry.**
   - `supabase db push --dry-run` reported remote migration `20260422190127` is not present locally.
   - The booking widget migration was applied idempotently via `psql` and recorded manually; fetch or repair the remote-only migration before relying on `supabase db push` for this project.

---

## 6. Database Migrations Applied

| Migration | Description |
|-----------|-------------|
| `20260422100000_fix_referral_code_return.sql` | (previous session) |
| `20260422150000_auto_soap_notes.sql` | `soap_notes`, `feature_flags` tables + RLS + trigger |
| `20260422170000_booking_widget.sql` | `doctor_widget_configs`, `widget_booking_intents`, `profiles.email`, appointment cancellation metadata; applied to remote Supabase on 2026-04-22 |
| `20260423021000_fix_auto_soap_production_schema.sql` | Reconciles legacy production `feature_flags`, seeds `ai_soap_notes_enabled`, creates `soap_notes`; applied to remote Supabase on 2026-04-22 |

**Reminder/intake migrations from Phase 1** are also applied but were created in earlier sessions.

---

## 7. Quick Reference: Where Things Live

| Feature | File Path |
|---------|-----------|
| Booking flow | `src/lib/booking.ts` |
| Reminder scheduling | `src/lib/reminders.ts` |
| Reminder settings UI | `src/app/doctor/reminders/page.tsx` |
| Intake form builder | `src/app/doctor/intake-forms/page.tsx` |
| Patient intake form | `src/app/app/intake/[appointmentId]/page.tsx` |
| Intake response review | `src/components/IntakeResponseReview.tsx` |
| AutoSOAP panel | `src/components/AutoSoapPanel.tsx` |
| Doctor video consultation | `src/app/doctor/consultation/[appointmentId]/page.tsx` |
| Post-consultation review | `src/app/doctor/consultation/[appointmentId]/review/page.tsx` |
| SOAP notes API | `src/app/api/soap-notes/appointment/[appointmentId]/route.ts` |
| SOAP generation API | `src/app/api/soap-notes/generate/route.ts` |
| SOAP approval API | `src/app/api/soap-notes/[id]/approve/route.ts` |
| Feature flags | `src/lib/feature-flags/index.ts`, `src/lib/feature-flags/flags.ts` |
| Design tokens | `src/app/globals.css`, Tailwind config |
| AI client | `src/lib/openai.ts` |
| Video service | `src/lib/video.ts`, `src/lib/video/videoService.ts` |
| Booking widget lib | `src/lib/widget.ts` |
| Public booking widget | `src/components/BookingWidget.tsx` |
| Widget settings UI | `src/app/doctor/widget/page.tsx`, `src/app/doctor/widget/WidgetSettingsClient.tsx` |
| Widget public page | `src/app/widget/[doctorId]/page.tsx` |
| Widget payment pages | `src/app/widget/pay/[appointmentId]/page.tsx`, `src/app/widget/success/page.tsx` |
| Widget APIs | `src/app/api/widget/*` |

---

## 8. Next AI: Start Here

1. **Supabase migration status:**
   - `20260422170000_booking_widget.sql` has been applied to the current remote Supabase project and recorded in migration history.
   - `20260423021000_fix_auto_soap_production_schema.sql` has also been applied and recorded.
   - For any other environment, apply the migration before testing the widget:
   ```bash
   npx supabase migration up
   # or apply manually: supabase/migrations/20260422170000_booking_widget.sql
   ```

2. **Deploy latest main** when ready:
   ```bash
   cd /Users/lukatenbosch/Downloads/doctory
   npx netlify deploy --build --prod
   ```

3. **Pick the next feature:** Phase 3.2 Insurance Integration.

4. **Follow taste-skill** design rules (section 1).

5. **Update this handoff** when you finish your session.
