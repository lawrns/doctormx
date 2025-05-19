<!--
  progress.md - Project Progress Log
  This file tracks completed phases and outlines upcoming tasks.
-->
# Project Progress Log

## Completed Phases

### Initial Build Fixes
- Added Tailwind entry point (src/index.css)
- Created missing route/page/component stubs to satisfy Vite build
- Corrected generic arrow-function syntax in AIService for esbuild parsing

### Phase 1: Supabase + Front-End + Netlify + OpenAI LLM
- Updated `.env.example` with VITE_* environment variables
- Configured `netlify.toml` for serverless functions and SPA redirects
- Set up Supabase client for Auth and Database
- Implemented AIService proxies for standard & premium LLM endpoints via Netlify Functions

### Phase 2: Image Analysis & Referral Dashboard
- Real image-analysis integration:
  - Updated AIImageAnalysisPage to upload images to Supabase Storage
  - Switched AIService to call `/api/v1/image-analysis`
  - Implemented Netlify Function for GPT-Vision proxy (image-analysis.js)
- Referral Settings Dashboard:
  - Added ReferralSettingsPage under doctor dashboard
  - Updated DoctorRoutes.tsx to include marketing/referrals settings route
- Documented Supabase Storage bucket setup in README.md

## Completed Phases

### Phase 3: Doctor-AI Chat Enhancements
- Streaming response bubbles (token-by-token rendering):
  - Implemented fetch streaming in AIService to parse OpenAI token streams
  - Rendered incoming tokens in real-time within chat bubbles
  - Auto-scroll chat viewport shows latest tokens until message completion
- Connected AIDoctor component with streaming API:
  - Updated AIDoctor component to use streaming functionality
  - Replaced basic message component with enhanced chat bubble
  - Added support for streaming image analysis responses
- Error-state UI and retry button using withRetry helper:
  - Added inline error message bubbles when token stream fails
  - Implemented error handler in the streaming API chain
  - Ensured smooth and accessible loading and error state transitions
- UI consistency upgrades:
  - Applied brand-jade color scheme to chat and doctor interfaces
  - Standardized navigation components across main site and doctor portals
  - Fixed duplicate component structures for better code maintainability
  - Updated language selector and button styles with consistent branding
  - Fixed React errors in Navbar component and missing color conversions
  - Updated InstallPWA component to use consistent brand colors

## Completed Phases (continued)

### Phase 3+: Additional Chat Enhancements
- Contextual memory and message history persistence:
  - Persist chat messages to Supabase table `chat_history` on send/receive
  - Retrieve and hydrate last N messages on component mount
  - Trim or roll up history to stay within LLM context window constraints
- Feedback reactions (thumbs up/down) for user evaluation:
  - Add interactive reaction UI next to each chat message
  - Record feedback events in Supabase with message and user IDs
  - Display aggregated reaction counts or highlighted feedback state
- Doctor avatars and sentiment indicators:
  - Display distinct avatars for AI-doctor and user in message bubbles
  - Analyze message sentiment and show positive/neutral/negative icon
  - Style sentiment indicators using color-coded badges or emojis

### Phase 4: Referral System Expansion
- Social sharing (Facebook, Twitter, WhatsApp)
- Email/SMS invite flow via Supabase Functions
- Advanced referral analytics dashboard with conversion metrics
- Incentive badges and tiered reward UI
- Deep link signup integrating referral credits

### Phase 5: UI/UX Global Polish
- Consistent chat UI styles (bubbles, fonts, spacing)
- Page transition animations (Framer Motion)
- Dark-mode improvements and accessible color contrast
- Mobile-responsive layout and navigation tweaks
- ARIA roles and keyboard navigation audits

### Phase 6: Developer Experience
- Extract common chat hooks (`useChatContext`)
- Centralize Tailwind theme design tokens
- Add Storybook for component development and testing
- End-to-end tests for chat and referral flows
- CI/CD pipelines for linting, typechecking, and smoke tests

### Phase 7: Performance & Resilience
- Cache chat history in IndexedDB/localforage
- Optimistic UI updates for referral creation
- WebSocket/SSE fallback for LLM streaming responses
+ Integration with Sentry for error tracking and monitoring
 
## Phase 8: Mobile Lab Testing Service (Exámenes a Domicilio)
 
### Objectives
- Enable at-home laboratory sample collection by certified technicians.
- Provide seamless booking, scheduling, and digital delivery of lab results within the Doctor.mx platform.
 
### Completed Work
- Initial stub UI for mobile lab testing:
  - `LabTestingPage.tsx` with tabbed interface (Request, Schedule, Results).
  - Components: `LabTestRequestForm`, `AppointmentScheduler`, `LabResultsViewer`.
 
### To-Do List
 
#### Core UI & Routing
- [ ] Add `LabTestingPage` route in `App.tsx` (`/lab-testing`), under `AILayout`.
- [ ] Update `AINavbar` and main `Navbar` to include "Exámenes a Domicilio" menu item linking to `/lab-testing` (desktop & mobile).
 
#### Test Catalog & Request Workflow
- [ ] Enhance `LabTestRequestForm` to fetch available tests with price, description, and preparation instructions from backend API.
- [ ] Support multi-select, validation, and dynamic costing per test.
 
#### Scheduling & Dispatch
- [ ] Integrate `AppointmentScheduler` with real-time technician availability API.
- [ ] Capture geocoded address and preferred time windows.
- [ ] Implement dispatch engine to match requests to nearest available technician.
 
#### Backend & API Endpoints
- [ ] Design Supabase schema: tables for `lab_tests`, `lab_requests`, `technicians`, `schedule_slots`, `lab_results`.
- [ ] Implement secure endpoints (Netlify Functions or Supabase Edge Functions):
  - POST `/api/lab-testing/requests`
  - GET `/api/lab-testing/requests/:id`
  - GET `/api/lab-testing/availability`
 
#### Provider Onboarding & Portal
- [ ] Build technician registration flow with ID upload, certification, background check.
- [ ] Admin dashboard for review and approval of providers.
- [ ] Technician mobile/web portal to accept assignments, update status, and capture digital signatures.
 
#### Payment & Billing
- [ ] Integrate payment gateway (e.g., Stripe) for test fees, home service fee, rush options.
- [ ] Handle payment confirmations, failures, and refunds.
 
#### Results Integration
- [ ] Define data model for structured lab results (FHIR/HL7 import).
- [ ] Extend `LabResultsViewer` to display results with charts, PDFs, and historical trends.
- [ ] Notify users via email/SMS when results are available.
 
#### Monitoring, Notifications & QA
- [ ] Implement SMS/email reminders (24h, 1h prior) for scheduled visits.
- [ ] Manage no-show, reschedule, and escalation workflows.
- [ ] Enforce chain-of-custody protocols with timestamped status updates.
- [ ] Feedback & rating system for technician quality assurance.
 
#### Regulatory & Compliance
- [ ] Validate COFEPRIS-approved sample collection protocols.
- [ ] Ensure data encryption at rest and in transit; comply with privacy regulations.
- [ ] Confirm technician liability insurance and platform terms of service.
 
#### Analytics & Reporting
- [ ] Dashboards for booking volume, technician utilization, SLA metrics.
- [ ] Geo-coverage heatmaps to identify service gaps.
- [ ] User satisfaction and NPS tracking for continuous improvement.
 
## Phase 9: Expansion & Scale
- Prepare hub-and-spoke model for rural coverage and corporate wellness subscription packages.
  
## Phase 10: Chat-First Redesign & Partner Integrations

Building on our AI-Doctor and Telemedicine foundation, Phase 10 delivers a cohesive chat-first UX and revenue-driving modules:

1. First-Look Experience
   - Replace dark landing with medical-grade Hero (white/light background, teal & coral accents)
   - One-line promise (“Orientación de salud instantánea, gratis, desde casa”) + primary CTA “Iniciar evaluación”
2. Guided On-Ramp Wizard
   - 3-step wizard: Age & Sex → Symptom or Photo → Disclaimer
   - Persist state in WizardContext; on completion deep-link into chat
3. Conversational Core
   - Single full-screen chat canvas with Framer Motion typing indicators
   - SmartCard component for inline Lab, Pharmacy, and Doctor referral cards
4. At-Home Lab Module
   - Inline Lab availability SmartCard via `/api/lab-availability` Function
   - Deep-link to WhatsApp or in-app calendar picker
5. Pharmacy Marketplace Mini-Cart
   - Swipeable carousel of meds (thumbnail, price, % off)
   - Delivery vs. pickup toggles; affiliate checkout via Netlify Function
6. Doctor Referral Flow
   - SmartCard surfaces “Videollamada ahora” & “Agendar presencial”
   - Integrate Video booking widget & map pins; schedule via `/api/schedule-appointment`
7. Trust & Compliance Ribbon
   - Persistent disclaimer ribbon + “Cómo protegemos tus datos” link/modal
   - COFEPRIS & INAI logos in footer
8. Sponsorship Real Estate
   - “Patrocinado por” band on relevant cards; leaderboard slot in blog sidebar
9. Growth Hooks
   - Floating “Invitar por WhatsApp” button with share message + personal code
   - Unlock “Consulta gratis” badge after 3 referrals
10. Content & SEO Blog
    - /blog with Markdown FAQ articles targeting top 50 conditions
    - Internal links to Symptom Checker and chat flow
11. Dashboard & History (“Mi Salud”)
    - Timeline of past chats, lab result PDFs, refill reminders
12. Accessibility & Performance
    - Font-scaling toggle, high-contrast mode, lazy-load assets
    - Lighthouse score ≥ 90 mobile

### Net-New Feature Modules (MVP+)
- AI-Image Uploader (derm & wound triage)
- At-Home Lab Scheduling with WhatsApp deep-link
- Pharmacy Cart & Checkout (affiliate/PAAS integration)
- Doctor Booking Widget (video & in-person)
- Referral & Rewards Engine (WhatsApp focus)
- Personal Health Timeline + Secure File Vault
- Bilingual Toggle (ES/EN)
- Push-Notification Reminders
- Analytics & Partner Dashboard
- Regulatory Safe-Mode flag (disclaimer + 911 escalation)