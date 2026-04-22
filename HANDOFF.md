# DoctorMx — AI Handoff Document

**Date:** 2026-04-22  
**Completed Phases:** 1 (Reminders + Intake Forms) and 2 (AutoSOAP Clinical Scribing)  
**Next Phases:** 3 (Booking Widget + Insurance), 4 (Campaigns + Practice Management)

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

### Phase 3.1 — Embeddable Website Booking Widget (PENDING)

**Goal:** Let doctors embed a booking widget on their own websites.

**What to build:**
- `src/app/api/widget/config/route.ts` — GET/POST widget config (doctorId, colors, services, allowed slots)
- `src/app/widget/[doctorId]/page.tsx` — lightweight booking widget page (no Doctor.mx chrome)
- `src/components/BookingWidget.tsx` — iframe-friendly React component with:
  - Doctor profile header (name, photo, specialty, rating)
  - Service selector with prices
  - Calendar + time slot picker
  - Patient info form (name, email, phone)
  - Booking confirmation + payment redirect
- `src/app/api/widget/book/route.ts` — CORS-enabled booking endpoint
- `src/app/doctor/widget/page.tsx` — doctor settings for widget (copy embed code, customize colors)

**Database migration needed:**
- `doctor_widget_configs` table: `doctor_id`, `primary_color`, `accent_color`, `enabled_services JSONB`, `custom_title`, `custom_message`, `is_active`

---

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

1. **Feature flags table may not exist in production yet.**
   - Migration `20260422150000_auto_soap_notes.sql` creates it with seed data.
   - If deploying to existing Supabase project, run the migration.

2. **AutoSOAP AI generation requires OpenRouter API key.**
   - If `OPENROUTER_API_KEY` is missing, the generate endpoint will fail.
   - Fallback: mock generation or skip AI draft, let doctor type manually.

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

---

## 6. Database Migrations Applied

| Migration | Description |
|-----------|-------------|
| `20260422100000_fix_referral_code_return.sql` | (previous session) |
| `20260422150000_auto_soap_notes.sql` | `soap_notes`, `feature_flags` tables + RLS + trigger |

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

---

## 8. Next AI: Start Here

1. **Deploy Phase 2** if not done:
   ```bash
   cd /Users/lukatenbosch/Downloads/doctory
   npx netlify deploy --build --prod
   ```

2. **Run Supabase migration** if needed:
   ```bash
   npx supabase migration up
   # or apply manually: supabase/migrations/20260422150000_auto_soap_notes.sql
   ```

3. **Pick a Phase 3 or 4 feature** from section 4 above.

4. **Follow taste-skill** design rules (section 1).

5. **Update this handoff** when you finish your session.
