# DOCTORY / DOCTOR.MX MASTER PLAN

## Revenue-Dominant Telemedicine Platform for Mexico

**Target:** USD $20M+ Year 1 Revenue from 10,000+ Mexican Doctors

---

## EXECUTIVE SUMMARY

**Core Thesis:** Mexico's healthcare system is fragmented, with 50%+ of the
population lacking consistent access to quality care. Only 30% of private
providers have integrated digital care vs 60% in Brazil. Doctory can capture
this gap by becoming the **"doctor's operating system"** — not just
telemedicine, but a complete practice management + patient acquisition + second
opinion engine.

**Key Assumptions:**

- ~324,000 practicing physicians in Mexico (2021 data)
- 10,000 doctors = 3% market penetration (achievable)
- Average subscription: 499-1,499 MXN/month ($25-75 USD)
- Additional revenue from referrals, pharmacy, lab partnerships

---

## 1. MARKET & ECOSYSTEM INTELLIGENCE

### 1.1 Mexican Telemedicine Landscape

**Market Size:**

- Mexican telemedicine market projected to reach **$1.2B by 2026** (Statista)
- Digital health market: **$2.4B in 2024**, growing 8.86% annually to $3.7B by
  2029
- Expected to add **$2B+ from 2024-2029**

**Key Stats:**

- Only **2.4 doctors per 1,000 people** (vs OECD average 3.5)
- **80%+ smartphone penetration**
- **75% internet connectivity**
- **68% of patients prefer video consultations** for follow-ups (Doctoralia 2024
  survey)
- Only **30% of private providers** fully integrated digital care

### 1.2 Competitor Analysis

#### Doctoralia (DocPlanner) — PRIMARY COMPETITOR

- **10M+ monthly visits in Mexico**
- **150,000+ professionals** on platform globally (13 countries)
- **65M unique patients** monthly worldwide
- **Revenue model:** SaaS subscription + marketplace
- **Pricing:** Estimated $100-300 USD/month for premium tiers
- **Strengths:** SEO dominance, directory depth, video consultation (600K
  in 2021)
- **Weaknesses:** Expensive for solo practitioners, generic platform not
  Mexico-optimized
- **Key product:** "Noa Notes" — AI documentation tool

**OPPORTUNITY GAP:** Doctoralia is expensive and not WhatsApp-native. Focus on
doctors who can't afford $200+/month.

#### Sofía Salud — INSURTECH COMPETITOR

- **$37.5M total funding** (Series A $19M from Index Ventures)
- Started as free telemedicine, pivoted to health insurance
- **Model:** Tech-enabled health plans for individuals, families, SMEs
- **Strengths:** Venture-backed, full-stack insurance + care
- **Weaknesses:** Different market (insurance vs doctor tools)

#### Salud Digna — DIAGNOSTIC COMPETITOR

- Non-profit, **10,500+ employees**
- **IDB loan: $10M** for expansion
- Focus: **Affordable diagnostics** for underserved populations
- **Partnership opportunity:** Lab referral integration

#### Farmacias Similares — DISRUPTIVE MODEL

- **~10,000 pharmacies** across Mexico
- **45% of all prescription drugs by volume**
- **60 pesos ($3) doctor consultations** at on-site consultorios
- **136M appointments/year** (2023)
- **9%+ annual growth**

**CRITICAL INSIGHT:** Farmacias Similares proves Mexicans WILL pay for
accessible healthcare. They filled the gap when Seguro Popular ended in 2020.

### 1.3 US/EU Analogs Worth Copying

#### Zocdoc — Directory + Booking

- **$1.8B valuation**
- **$3,000/year subscription** for doctors
- **Revenue:** Subscription + Sponsored Results ads
- **Key learning:** Took 9 years to build two-sided network, door-to-door sales

#### Teladoc — B2B Telemedicine Giant

- **$2.03B revenue (2021)**, 86% YoY growth
- **15.4M telehealth visits** annually
- **53.6M paid members**
- **Revenue model:** 85% access fees (PMPM), 13% visit fees
- **Key learning:** B2B employer/insurer contracts drive scale

#### K Health — AI-First Primary Care

- **3M users**, $97M funding
- AI trained on **400M data points** from Maccabi HMO (Israel)
- **85% match rate** between AI symptom checker and physician diagnosis
- **$19/consultation**, $49/year unlimited messaging
- **Partnership with Anthem** (40M members)
- **Key learning:** AI triage → human escalation works

### 1.4 Why Doctors Churn or Refuse SaaS Tools

**Research findings on physician tech adoption barriers:**

1. **No real improvement over current processes** — Tech that doesn't simplify
   workflows gets rejected
2. **Adds more work** — Doctors want to focus on patients, not admin
3. **Difficult to explain to patients** — If patients can't use it, doctors
   won't adopt
4. **Cost without clear ROI** — Must demonstrate patient volume increase
5. **Integration complexity** — Standalone tools that don't connect to existing
   systems fail

**DO THIS:**

- Reduce admin burden measurably
- WhatsApp-native (patients already use it)
- Clear patient acquisition value proposition
- Simple onboarding (<10 minutes)

**DON'T DO THIS:**

- Require behavior change without benefit
- Complex multi-step workflows
- Desktop-only interfaces
- Require patient app downloads

### 1.5 WhatsApp Medicine Reality

**How informal WhatsApp medicine works in Mexico:**

- Doctors share personal WhatsApp with trusted patients
- Patients send photos of symptoms, lab results, prescriptions
- Quick responses, no appointments needed
- Payment via transfer or in-person
- Zero documentation, zero liability protection

**Doctory opportunity:** Formalize this with:

- Business WhatsApp API integration
- Automatic documentation
- Payment processing
- Liability protection through proper workflows

---

## 2. PRODUCT STRATEGY: "SECOND OPINION ENGINE"

### 2.1 Why Second Opinion > Telemedicine

**Market insight:** "Second opinion" is a **high-trust, high-value positioning**
that differentiates from commodity telemedicine:

| Telemedicine                  | Second Opinion Platform              |
| ----------------------------- | ------------------------------------ |
| First-line care (flu, rashes) | Complex/life-altering decisions      |
| Immediate/same-day            | 24-72 hour deep review               |
| Verbal interaction            | Document/imaging analysis            |
| Short prescription note       | Formal evaluation with justification |
| Local doctors                 | Global expert access                 |

**Key differentiator:** Second opinions are **advisory, not prescriptive** —
reducing liability while maintaining high value perception.

### 2.2 Proposed Escalation Architecture

```
PATIENT QUERY
    ↓
[AI TRIAGE] — Symptom checker, 2-min assessment
    ↓
├── LOW COMPLEXITY → Self-care guidance + monitoring
├── MEDIUM → Async chat with GP (WhatsApp-native)
└── HIGH → Video consult with specialist OR
            Second opinion request with document upload
    ↓
[DOCTOR VALIDATION] — Human review of all AI outputs
    ↓
[DOCUMENTATION] — AI-generated SOAP notes, doctor-approved
```

### 2.3 AI-Assisted Second Opinions (Liability-Aware)

**What AI SHOULD do:**

- Pre-triage before human review
- Flag inconsistencies in pathology/lab reports
- Generate preliminary case summaries
- Match patients to appropriate specialists
- Automate documentation (SOAP notes)
- Reduce turnaround time

**What AI must NOT do:**

- Provide diagnosis without human validation
- Prescribe medications
- Make treatment recommendations without doctor sign-off
- Access patient data without consent

**Guardrails:**

1. All AI outputs labeled as "preliminary" or "for physician review"
2. Mandatory human sign-off before patient delivery
3. Audit trail of all AI-generated content
4. Clear disclaimers: "AI-assisted, physician-validated"

### 2.4 Legal/Ethical Positioning in Mexico

**Key regulatory reality:**

- Mexico has **NO specific telemedicine law** — same rules as in-person medicine
- No increase in liability risk for telemedicine (per CMS Expert Guide)
- E-prescriptions regulated by COFEPRIS, but ecosystem adoption is low
- Video consultations called "video consultations" not "telemedicine" due to
  regulatory gap

**Safe positioning language:**

- "Segunda opinión médica" (medical second opinion)
- "Consulta de orientación" (guidance consultation)
- "Evaluación complementaria" (complementary evaluation)
- Avoid: "Diagnóstico" (diagnosis), "Tratamiento" (treatment) as standalone
  claims

**Structural mitigations:**

1. Terms clearly state second opinion is advisory
2. Final decisions rest with patient and primary physician
3. All participating doctors carry professional liability insurance
4. Platform operates as technology provider, not healthcare provider
5. Patient consent flow documents understanding of limitations

### 2.5 Trust Mechanics

**Credential Verification:**

- CONACEM (Consejo Mexicano de Especialidades Médicas) certification check
- Cédula profesional verification (required for all Mexican doctors)
- Specialty board certification display
- Years of experience, institutional affiliations

**Outcome Signals:**

- "Patients helped" counter (anonymized)
- Response time metrics
- Specialty-specific case volume
- Optional: Patient satisfaction (private, not public reviews)

**Peer Visibility:**

- Doctors see other verified doctors on platform
- Referral network visibility
- Professional credibility through association

---

## 3. NATIONAL DOCTOR DIRECTORY AT SCALE

### 3.1 Data Sourcing Strategy

**Public Registries:**

| Source                   | Data Available              | Method                     |
| ------------------------ | --------------------------- | -------------------------- |
| CONACEM                  | Board-certified specialists | API/scrape public registry |
| Cédula Profesional (SEP) | All licensed physicians     | Public verification portal |
| State medical colleges   | Local practitioner lists    | Partnership requests       |
| IMSS/ISSSTE directories  | Public sector doctors       | FOI requests, public data  |

**Self-Claiming Flow:**

1. Create unclaimed profile from public data
2. Send invitation (WhatsApp/email) to claim
3. Verification via cédula upload + selfie match
4. Profile activation upon verification

**Scraping Targets:**

- Hospital websites (staff directories)
- Medical conference attendee lists
- Medical school alumni databases
- Existing directory platforms (ethical considerations)

### 3.2 Verification Workflow

```
UNCLAIMED PROFILE (public data)
    ↓
INVITATION SENT → WhatsApp + Email
    ↓
DOCTOR CLAIMS PROFILE
    ↓
├── Upload Cédula Profesional
├── Selfie verification (liveness check)
├── CONACEM certification (if specialist)
└── Contact info confirmation
    ↓
VERIFIED BADGE ✓
```

**Anti-Ghost Profile Measures:**

- Profiles without claim after 6 months → reduced visibility
- Contact info verification required for full features
- "Last active" timestamps
- Periodic re-verification prompts

### 3.3 SEO + Local Discovery Loops

**Programmatic Page Strategy:**

- `/doctor/[specialty]/[city]` — "Cardiólogo en Guadalajara"
- `/doctor/[name]-[specialty]` — Individual profiles
- `/clinica/[name]/[location]` — Clinic pages
- `/segunda-opinion/[condition]` — Condition-specific landing pages

**SEO Playbook:**

1. Generate 1000+ city × specialty combinations
2. Structured data markup (Schema.org Physician)
3. Google Business Profile integration
4. Local backlink building (hospital partnerships)
5. Content: "Guía de [specialty] en [city]"

**Target keywords:**

- "Médico cerca de mí"
- "Mejor cardiólogo en CDMX"
- "Segunda opinión [condición]"
- "Consulta médica en línea México"

### 3.4 Free vs Paid Visibility

**Free Tier (Unclaimed/Basic):**

- Basic profile listing
- Contact info visible after claim
- No appointment booking
- No analytics

**Paid Tier (499 MXN/month — STARTER):**

- Priority in search results
- Appointment booking enabled
- Basic analytics (profile views)
- WhatsApp integration
- Calendar sync

**Premium Tier (999 MXN/month — PROFESSIONAL):**

- Everything in Starter
- AI documentation (SOAP notes)
- Patient follow-up automation
- Referral network access
- Enhanced analytics

**Elite Tier (1,499 MXN/month — SPECIALIST):**

- Everything in Professional
- Second opinion panel eligibility
- Priority matching for complex cases
- Marketing tools (sponsored visibility)
- Multi-location support

---

## 4. REVENUE-DRIVING FEATURE SET

### 4.1 Features Doctors Will PAY For (Priority Order)

| Feature                             | Pain Point Solved               | Willingness to Pay |
| ----------------------------------- | ------------------------------- | ------------------ |
| Patient acquisition (SEO/directory) | "I need more patients"          | HIGH               |
| WhatsApp automation                 | "I spend hours on WhatsApp"     | HIGH               |
| AI documentation                    | "Paperwork takes 2+ hours/day"  | HIGH               |
| Online booking                      | "Phone tag wastes time"         | MEDIUM-HIGH        |
| E-prescription                      | "Patients lose paper scripts"   | MEDIUM             |
| Referral network                    | "I don't know specialists"      | MEDIUM             |
| Video consultation                  | "Patients can't always come in" | MEDIUM             |
| Payment processing                  | "Cash is messy"                 | MEDIUM             |
| Patient follow-up                   | "Patients don't return"         | MEDIUM             |
| Reputation management               | "I need credibility"            | LOW-MEDIUM         |

### 4.2 WhatsApp-Native Workflows

**WhatsApp Business API Integration:**

```
PATIENT: "Hola doctor, tengo dolor de cabeza desde hace 3 días"
    ↓
BOT: "Gracias por contactarnos. Para atenderle mejor:
      1. ¿Es su primera consulta?
      2. ¿Tiene cita programada?
      3. ¿Necesita agendar cita?"
    ↓
[TRIAGE] → Route to appropriate response
    ↓
DOCTOR RECEIVES: Structured intake form + patient history
    ↓
DOCTOR RESPONDS: Voice note or text (AI transcribes to notes)
```

**Automation Options:**

- Appointment reminders (reduce no-shows 30%+)
- Post-visit follow-ups
- Prescription refill requests
- Lab result notifications
- Payment reminders

### 4.3 AI Documentation System

**Inspired by Doctoralia's "Noa Notes":**

**Input:** Voice recording of doctor-patient conversation (with consent)
**Output:** Structured SOAP note in Spanish

```
SUBJETIVO: Paciente masculino de 45 años refiere dolor de cabeza 
           de 3 días de evolución, intensidad 6/10...
OBJETIVO: Signos vitales estables, exploración neurológica normal...
ANÁLISIS: Cefalea tensional probable, sin datos de alarma...
PLAN: Paracetamol 500mg c/8h, seguimiento en 1 semana si persiste...
```

**Value proposition:**

- Save 1-2 hours daily on documentation
- Maintain eye contact during consultations
- Reduce transcription errors
- Auto-populate patient records

### 4.4 Referral Network

**Peer-to-Peer Referrals:**

- GPs can refer directly to specialists on platform
- Specialists can refer back with notes
- Tracking: Referral sent → Accepted → Completed
- Optional: Referral fee sharing (5-10% of first visit)

**Trust signals:**

- "Referred by X doctors"
- Referral acceptance rate
- Patient outcomes from referrals

### 4.5 Reputation Without Public Reviews

**Problem:** Mexican doctors fear negative public reviews **Solution:** Private
reputation metrics

- Patient satisfaction scores (visible only to doctor)
- "Would recommend" percentage (aggregate, not individual)
- Response time metrics
- Case volume by specialty
- Optional: Display "Verified Patients Helped: 500+"

### 4.6 Subscription Tier Summary

| Tier             | Price (MXN/mo) | Price (USD) | Key Features                      |
| ---------------- | -------------- | ----------- | --------------------------------- |
| **FREE**         | 0              | $0          | Basic profile, claim only         |
| **STARTER**      | 499            | ~$25        | Booking, WhatsApp, calendar       |
| **PROFESSIONAL** | 999            | ~$50        | + AI docs, referrals, analytics   |
| **SPECIALIST**   | 1,499          | ~$75        | + Second opinion panel, marketing |
| **CLINIC**       | 2,999          | ~$150       | Multi-doctor, CRM, phone system   |

---

## 5. ENGINEERING & SYSTEMS PLAN

### 5.1 Current Stack Assessment

| Component     | Technology          | Verdict   | Rationale                                        |
| ------------- | ------------------- | --------- | ------------------------------------------------ |
| **Framework** | Next.js App Router  | ✅ KEEP   | Modern, SEO-friendly, fast                       |
| **Database**  | Supabase (Postgres) | ✅ KEEP   | HIPAA-compliant with BAA, real-time              |
| **Auth**      | Supabase Auth       | ✅ KEEP   | Integrated, secure, SSO-ready                    |
| **Storage**   | Supabase Storage    | ✅ KEEP   | Encrypted, HIPAA-ready                           |
| **Payments**  | Stripe              | ✅ KEEP   | Best-in-class, Mexico support                    |
| **Video**     | Jitsi Meet          | ⚠️ EXTEND | Self-hosted = control, but needs HIPAA hardening |
| **Messaging** | WhatsApp            | 🆕 ADD    | WhatsApp Business API integration required       |

### 5.2 System Architecture (Textual Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PATIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  WhatsApp Bot  │  Web Portal  │  Mobile Web  │  SMS (fallback)  │
└───────┬────────┴──────┬───────┴──────┬───────┴────────┬─────────┘
        │               │              │                │
        ▼               ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Next.js API Routes)           │
│  - Rate limiting  - Auth middleware  - Request validation       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  BOOKING     │   │  MESSAGING   │   │  VIDEO       │
│  SERVICE     │   │  SERVICE     │   │  SERVICE     │
│  - Calendar  │   │  - WhatsApp  │   │  - Jitsi     │
│  - Slots     │   │  - Chat      │   │  - Recording │
│  - Reminders │   │  - AI Bot    │   │  - Transcr.  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CORE SERVICES LAYER                           │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  USER MGT   │  DIRECTORY  │  BILLING    │  AI ENGINE  │ RECORDS │
│  - Doctors  │  - Profiles │  - Stripe   │  - Triage   │ - PHI   │
│  - Patients │  - Search   │  - Invoices │  - SOAP     │ - Files │
│  - Roles    │  - SEO      │  - Payouts  │  - Summary  │ - Audit │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘
       │             │             │             │           │
       ▼             ▼             ▼             ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Supabase)                         │
│  PostgreSQL  │  Row-Level Security  │  Real-time  │  Storage    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Key Data Models

```sql
-- Core entities (simplified)

doctors (
  id UUID PRIMARY KEY,
  cedula_profesional TEXT UNIQUE NOT NULL,
  conacem_verified BOOLEAN DEFAULT FALSE,
  specialty_id UUID REFERENCES specialties(id),
  subscription_tier TEXT, -- free, starter, professional, specialist, clinic
  stripe_customer_id TEXT,
  whatsapp_number TEXT,
  profile_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ
);

patients (
  id UUID PRIMARY KEY,
  phone_number TEXT, -- primary identifier for WhatsApp
  email TEXT,
  encrypted_name TEXT, -- PHI encrypted at rest
  created_at TIMESTAMPTZ
);

consultations (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id),
  patient_id UUID REFERENCES patients(id),
  type TEXT, -- video, chat, second_opinion, in_person
  status TEXT, -- scheduled, in_progress, completed, cancelled
  ai_summary_id UUID REFERENCES ai_summaries(id),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

second_opinions (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  requesting_doctor_id UUID REFERENCES doctors(id),
  reviewing_doctor_id UUID REFERENCES doctors(id),
  status TEXT, -- pending, in_review, completed
  ai_preliminary_summary TEXT,
  doctor_final_opinion TEXT,
  documents JSONB, -- references to encrypted files
  created_at TIMESTAMPTZ
);

ai_summaries (
  id UUID PRIMARY KEY,
  consultation_id UUID,
  raw_transcript TEXT, -- encrypted
  soap_note JSONB,
  doctor_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ
);
```

### 5.4 Critical Async Workflows

**1. WhatsApp Message Processing:**

```
Incoming Message → Queue (Redis/Supabase Realtime)
    → AI Classification (intent detection)
    → Route to appropriate handler
    → Response generation
    → WhatsApp API send
    → Log + Analytics
```

**2. Video Consultation with AI Notes:**

```
Jitsi Room Created → Recording Started (with consent)
    → Audio stream → Whisper transcription (real-time)
    → Session ends → Full transcript
    → GPT-4 SOAP note generation
    → Doctor review queue
    → Approval → Patient record update
```

**3. Second Opinion Request:**

```
Patient uploads documents → Encryption + Storage
    → AI preliminary analysis
    → Match to specialist (based on condition)
    → Notification to specialist
    → 24-72hr review window
    → Doctor writes opinion
    → AI formats + structures
    → Patient notification
    → Payment processed
```

### 5.5 Infrastructure Optimizations (Low-Cost)

| Optimization              | Savings            | Implementation                     |
| ------------------------- | ------------------ | ---------------------------------- |
| **Edge caching**          | 60% bandwidth      | Vercel/Cloudflare edge             |
| **Image optimization**    | 40% storage        | Next.js Image, WebP                |
| **DB connection pooling** | 30% DB costs       | Supabase pooler                    |
| **Async processing**      | Lower compute      | Background jobs via Edge Functions |
| **AI model caching**      | 50% API costs      | Cache common responses             |
| **CDN for static**        | 70% origin traffic | Cloudflare Free tier               |

### 5.6 AI Replaces Human Ops (Leverage Points)

| Human Task             | AI Replacement           | Savings     |
| ---------------------- | ------------------------ | ----------- |
| Appointment scheduling | WhatsApp bot             | 2 FTEs      |
| Initial patient intake | AI triage bot            | 1 FTE       |
| Documentation          | SOAP note generator      | Doctor time |
| Follow-up reminders    | Automated messages       | 1 FTE       |
| Case routing           | AI specialty matching    | 0.5 FTE     |
| Translation            | Real-time AI translation | Variable    |

### 5.7 Technical Debt Assessment

**Acceptable Debt (defer):**

- Perfect mobile app (mobile web sufficient initially)
- Multi-language (Spanish-first, English later)
- Complex analytics dashboards (basic metrics first)
- Offline mode (low priority for target users)

**Fatal Debt (fix immediately):**

- Security vulnerabilities in auth flow
- Unencrypted PHI storage
- Missing audit logs
- No backup/disaster recovery
- Rate limiting gaps

---

## 6. AI STRATEGY (PRACTICAL)

### 6.1 Where AI Adds Genuine Leverage

| Use Case                   | Model                       | Value                        | Maturity |
| -------------------------- | --------------------------- | ---------------------------- | -------- |
| **Symptom triage**         | GPT-4/Claude                | Pre-filter before human      | HIGH     |
| **SOAP note generation**   | GPT-4 + Whisper             | 1-2 hrs/day saved per doctor | HIGH     |
| **Specialist matching**    | Embeddings + classification | Better case routing          | MEDIUM   |
| **Document summarization** | GPT-4                       | Speed second opinions        | HIGH     |
| **Translation**            | GPT-4/DeepL                 | Expand accessibility         | HIGH     |
| **Chatbot (FAQ)**          | Fine-tuned model            | Reduce support load          | MEDIUM   |

### 6.2 What Must Stay Human

- **Final diagnosis** — Always physician-validated
- **Prescription decisions** — Legal/ethical requirement
- **Complex case judgment** — AI as assistant, not decider
- **Patient relationship** — Trust requires human connection
- **Edge cases** — AI escalates, doesn't guess
- **Liability-bearing decisions** — Doctor sign-off mandatory

### 6.3 Hallucination Guardrails

**Technical Controls:**

1. **Structured output enforcement** — JSON schema validation
2. **Confidence thresholds** — Flag low-confidence outputs
3. **Source citation requirement** — AI must reference input data
4. **Human-in-the-loop** — No patient-facing AI without review
5. **Audit logging** — Every AI output tracked

**UX Controls:**

1. Label all AI content as "AI-generated, pending review"
2. Require explicit doctor approval before patient delivery
3. Easy override/edit interface for doctors
4. Feedback loop for incorrect outputs

**Monitoring:**

- Track AI accuracy vs doctor corrections
- Flag patterns of hallucination
- Regular model evaluation with medical experts

### 6.4 Fine-Tune vs Prompt vs Tool-Use

| Approach        | When to Use                       | Doctory Application            |
| --------------- | --------------------------------- | ------------------------------ |
| **Prompting**   | Quick iteration, general tasks    | FAQ bot, initial triage        |
| **RAG**         | Domain knowledge, updates         | Medical guidelines, drug info  |
| **Fine-tuning** | Consistent style, specific format | SOAP notes in Mexican Spanish  |
| **Tool-use**    | External data access              | Lab results lookup, scheduling |

**Recommendation:** Start with prompting + RAG, fine-tune SOAP notes after 10K
examples.

### 6.5 Cost Control Strategies

| Strategy                     | Implementation                        | Savings             |
| ---------------------------- | ------------------------------------- | ------------------- |
| **Caching**                  | Hash common queries, cache responses  | 30-50%              |
| **Model tiering**            | GPT-3.5 for simple, GPT-4 for complex | 70% on simple tasks |
| **Batch processing**         | Non-urgent tasks in batches           | 50%                 |
| **Token optimization**       | Compress prompts, structured output   | 20-30%              |
| **Self-hosted alternatives** | Llama for non-critical tasks          | Variable            |

**Budget estimate:** At scale (10K doctors, 100K monthly AI interactions)

- ~$5,000-15,000/month AI API costs
- Offset by 3-5 FTE reduction

---

## 7. REGULATORY, LEGAL & RISK MAP

### 7.1 Mexican Telemedicine Regulation Summary

**Key Laws:**

- **Ley General de Salud** — Framework health law
- **LFPDPPP** — Data protection (Mexico's GDPR equivalent)
- **NOM-004-SSA3-2012** — Clinical records requirements
- **NOM-024-SSA3-2012** — Digital health record standards

**Critical Reality:**

> Mexico has **NO specific telemedicine law**. Video consultations follow same
> rules as in-person. No additional liability for telemedicine specifically.

**COFEPRIS Role:**

- Regulates drugs, medical devices
- E-prescription ecosystem (limited adoption)
- NOT primary regulator for telemedicine services
- Platform operating as tech provider, not healthcare provider

### 7.2 Clear Red Lines (DO NOT CROSS)

| Red Line                                    | Consequence                    | Mitigation                     |
| ------------------------------------------- | ------------------------------ | ------------------------------ |
| Practicing medicine without license         | Criminal liability             | Verify all doctor credentials  |
| Storing PHI without consent                 | LFPDPPP fines                  | Explicit consent flows         |
| AI making diagnosis claims                  | Medical malpractice exposure   | "Advisory" positioning only    |
| Prescribing controlled substances remotely  | Criminal charges               | Exclude from e-prescription    |
| Cross-border practice without local license | Regulatory violation           | Mexico-licensed doctors only   |
| Patient data sold to third parties          | Major fines, trust destruction | Never sell data, privacy-first |

### 7.3 Safe Positioning Language

**USE:**

- "Plataforma de tecnología para profesionales de la salud"
- "Herramienta de apoyo para segundas opiniones"
- "Sistema de gestión de consultas"
- "Orientación médica" (not "diagnóstico")

**AVOID:**

- "Somos tu doctor"
- "Diagnóstico automatizado"
- "Tratamiento con IA"
- "Telemedicina" (use "videoconsulta")

### 7.4 Structural Mitigations (UX + Legal)

**Patient-Facing:**

1. Consent flow before any consultation
2. Clear disclaimer: "This is not a replacement for in-person care"
3. Emergency redirect: "If emergency, call 911"
4. Second opinion disclaimer: "Advisory only, consult your primary physician"

**Doctor-Facing:**

1. Terms requiring professional liability insurance
2. Verification of active cédula profesional
3. Requirement to follow lex artis (standard of care)
4. Audit trail of all consultations

**Platform:**

1. Operate as technology provider, not healthcare provider
2. Business Associate Agreement (BAA) with Supabase for HIPAA
3. Data residency in Mexico (Supabase region selection)
4. Regular security audits

### 7.5 Malpractice Exposure Vectors

| Vector                               | Risk Level                 | Mitigation                          |
| ------------------------------------ | -------------------------- | ----------------------------------- |
| AI gives wrong information           | HIGH if unvalidated        | Human-in-the-loop mandatory         |
| Doctor misdiagnosis via video        | MEDIUM (same as in-person) | Standard malpractice insurance      |
| Platform data breach                 | HIGH                       | Encryption, security best practices |
| Second opinion contradicts treatment | LOW (advisory)             | Clear disclaimers                   |
| E-prescription fraud                 | MEDIUM                     | Verification workflows              |

---

## 8. GO-TO-MARKET & GROWTH LOOPS

### 8.1 Doctor Acquisition Funnel

```
AWARENESS (100K doctors)
    ↓ SEO, WhatsApp word-of-mouth, medical conferences
CONSIDERATION (20K)
    ↓ Free profile claim, value demonstration
TRIAL (5K)
    ↓ 14-day free Starter trial, onboarding call
CONVERSION (2K)
    ↓ Subscription activated
RETENTION
    ↓ Usage = stickiness, referral program
EXPANSION (10K target)
    ↓ Upgrade tiers, add locations, refer colleagues
```

### 8.2 First 1,000 Doctors Strategy

**Week 1-4: Seed Users (50-100 doctors)**

- Personal outreach to known physicians
- Medical school alumni networks
- WhatsApp groups of doctors (common in Mexico)
- Offer: Free lifetime Starter tier for early adopters

**Month 2-3: Medical Communities (500 doctors)**

- Partner with 2-3 medical associations
- Sponsor medical conferences/webinars
- Content marketing: "Cómo conseguir más pacientes en 2024"
- Local SEO for top 10 cities

**Month 4-6: Viral Mechanics (1,000 doctors)**

- Referral program: Get 1 month free for each referral
- "Verified on Doctory" badge for websites
- Case studies of successful doctors
- WhatsApp automation demo videos

### 8.3 Viral Loops Inside Doctor Communities

**Loop 1: Referral Network Effect**

```
Doctor A joins → Refers patient to Doctor B
    → Doctor B receives referral notification
    → "Join Doctory to accept referrals"
    → Doctor B joins → Refers to Doctor C...
```

**Loop 2: Badge/Credential Display**

```
Doctor claims profile → Gets "Verified" badge
    → Displays on personal website/social
    → Patients see badge → Search Doctory
    → Find other doctors → Those doctors claim profiles
```

**Loop 3: Second Opinion Network**

```
GP needs specialist opinion → Uses Doctory
    → Specialist receives case → Joins to respond
    → Specialist impressed → Uses for own patients
    → Refers more GPs to platform
```

### 8.4 Partnership Strategy

| Partner Type                        | Value to Doctory                     | Value to Partner                 | Priority |
| ----------------------------------- | ------------------------------------ | -------------------------------- | -------- |
| **Pharmacies** (Fahorro, Benavides) | Patient referrals, prescription data | Digital prescription integration | HIGH     |
| **Labs** (Salud Digna, Chopo)       | Lab result integration               | Patient referrals from doctors   | HIGH     |
| **Insurers** (GNP, AXA, Sofía)      | B2B contracts, patient volume        | Cost reduction, better outcomes  | MEDIUM   |
| **Medical associations**            | Credibility, member access           | Member benefit, modernization    | HIGH     |
| **Hospitals/Clinics**               | Institutional contracts              | Practice management tools        | MEDIUM   |
| **Medical schools**                 | Pipeline of new doctors              | Career tools for graduates       | LOW      |

### 8.5 SEO & Programmatic Pages

**Page Templates:**

1. `/doctor/[specialty]/[city]` — 50+ specialties × 100+ cities = 5,000+ pages
2. `/segunda-opinion/[condition]` — 200+ conditions
3. `/doctor/[name]` — Individual profiles (unclaimed + claimed)
4. `/guia/[topic]` — Educational content for patients

**Technical SEO:**

- Server-side rendering (Next.js SSR)
- Structured data (Schema.org Physician, MedicalOrganization)
- Internal linking between related profiles
- City/specialty hub pages
- Mobile-first indexing optimization

**Content Strategy:**

- "Mejores [especialidad] en [ciudad]" articles
- "¿Cuándo necesitas una segunda opinión?"
- "Guía de [condición médica]"
- Doctor-contributed articles (authority building)

### 8.6 Pricing Psychology for Mexican Doctors

**Anchoring:**

- Show Doctoralia pricing ($200+/month) as comparison
- "Starter at 499 MXN = less than 2 consultations"

**Loss Aversion:**

- "Doctors using Doctory average 15 more patients/month"
- "Without online presence, you're invisible to 68% of patients"

**Social Proof:**

- "Join 5,000+ verified Mexican doctors"
- Testimonials from respected specialists
- Medical association endorsements

**Risk Reduction:**

- 14-day free trial, no credit card
- Monthly billing, cancel anytime
- Money-back guarantee first month

---

## 9. YEAR-1 FINANCIAL MODEL (LOGIC)

### 9.1 Revenue Streams

| Stream                   | Model                      | Year 1 Target |
| ------------------------ | -------------------------- | ------------- |
| **Doctor Subscriptions** | 499-2,999 MXN/mo           | $12M          |
| **Second Opinion Fees**  | 500-2,000 MXN per case     | $3M           |
| **Pharmacy Referrals**   | Rev share on prescriptions | $2M           |
| **Lab Partnerships**     | Per-referral fee           | $1M           |
| **Sponsored Visibility** | Ads in search results      | $1M           |
| **B2B Clinic Contracts** | Enterprise pricing         | $1M           |
| **TOTAL**                |                            | **$20M**      |

### 9.2 Doctor Subscription Math

**Target:** 10,000 paying doctors by Month 12

**Tier Distribution Assumption:**

| Tier         | % of Paid | Count  | MXN/mo | USD/mo | Annual USD     |
| ------------ | --------- | ------ | ------ | ------ | -------------- |
| Starter      | 50%       | 5,000  | 499    | $25    | $1.5M          |
| Professional | 30%       | 3,000  | 999    | $50    | $1.8M          |
| Specialist   | 15%       | 1,500  | 1,499  | $75    | $1.35M         |
| Clinic       | 5%        | 500    | 2,999  | $150   | $0.9M          |
| **TOTAL**    | 100%      | 10,000 |        |        | **$5.55M ARR** |

Wait — that's only $5.5M from subscriptions. Need to revise.

**Revised Model for $20M:**

**Option A: Higher ARPU**

- Blended ARPU: $100/mo ($1,200/year)
- 10,000 doctors × $1,200 = **$12M subscriptions**
- Requires pushing doctors to higher tiers
- Transaction revenue (second opinions, referrals) = **$8M**

**Option B: More Doctors**

- 20,000 doctors at $50/mo average = **$12M**
- Transaction revenue = **$8M**
- Requires faster growth

**Recommended: Hybrid**

- 10,000 doctors, ARPU $100/mo = **$12M**
- Second opinions (5,000 cases/mo × $50 avg) = **$3M**
- Pharmacy referrals (100K prescriptions × $20 rev share) = **$2M**
- Lab referrals (50K referrals × $20) = **$1M**
- Sponsored/Ads = **$1M**
- B2B contracts = **$1M**
- **TOTAL = $20M**

### 9.3 ARPU Expansion Paths

| Expansion                  | Current | Target   | Driver                    |
| -------------------------- | ------- | -------- | ------------------------- |
| **Tier upgrades**          | $25 avg | $100 avg | Value demonstration       |
| **Add-ons**                | 0       | $20/mo   | AI notes, analytics       |
| **Multi-location**         | 1       | 2-3      | Clinic plans              |
| **Second opinion revenue** | 0       | $500/yr  | Case matching             |
| **Referral commissions**   | 0       | $200/yr  | Pharmacy/lab partnerships |

### 9.4 Cost Structure

**Year 1 Operating Costs (estimated):**

| Category                  | Monthly | Annual     | Notes                    |
| ------------------------- | ------- | ---------- | ------------------------ |
| **Engineering** (5 FTEs)  | $35K    | $420K      | Mexico salaries          |
| **AI/Cloud**              | $15K    | $180K      | Supabase, OpenAI, Vercel |
| **Sales/Growth** (3 FTEs) | $15K    | $180K      | Doctor acquisition       |
| **Operations** (2 FTEs)   | $8K     | $96K       | Support, compliance      |
| **Marketing**             | $20K    | $240K      | SEO, content, events     |
| **Legal/Compliance**      | $5K     | $60K       | Ongoing counsel          |
| **Office/Misc**           | $5K     | $60K       | Tools, subscriptions     |
| **TOTAL**                 | $103K   | **$1.24M** |                          |

**Gross Margin:** At $20M revenue, $1.24M costs = **94% gross margin**
(Excluding payment processing ~3% = 91%)

### 9.5 Break-Even Logic

**Monthly Fixed Costs:** ~$100K **Blended ARPU:** $100/mo **CAC:** $50 (target,
mostly organic) **LTV:** $1,200 (12-month avg retention) **LTV:CAC:** 24:1
(excellent)

**Break-even:** 1,000 paying doctors (~$100K MRR) **Target timeline:** Month 4-5

### 9.6 Why $20M is Plausible

**What Must Be True:**

1. ✅ **Market size sufficient:** 324K doctors, need 3% = 10K
2. ⚠️ **ARPU of $100/mo achievable:** Requires strong value prop, higher tiers
3. ⚠️ **Doctor acquisition at scale:** 2,500 new doctors/quarter = aggressive
4. ✅ **Transaction revenue viable:** Pharmacy/lab partnerships exist
5. ⚠️ **Low churn:** <5% monthly = strong product-market fit required
6. ✅ **Lean operations:** Mexico-based team keeps costs low

**Risk Factors:**

- Doctoralia responds with price cuts
- Doctor adoption slower than projected
- Regulatory changes
- Pharmacy partnership delays

**Upside Scenarios:**

- B2B insurer contracts (could add $5-10M)
- Expansion to Central America
- Patient-side monetization (not recommended initially)

---

## 10. IMPLEMENTATION PRIORITIES

### Phase 1: Foundation (Months 1-3)

- [ ] Directory MVP with 50K unclaimed profiles
- [ ] Doctor claim + verification flow
- [ ] Basic subscription billing (Stripe)
- [ ] WhatsApp integration (appointment reminders)
- [ ] SEO infrastructure (programmatic pages)

### Phase 2: Growth (Months 4-6)

- [ ] AI documentation (SOAP notes)
- [ ] Video consultation (Jitsi integration)
- [ ] Referral network between doctors
- [ ] Second opinion request flow
- [ ] 2,500 paying doctors

### Phase 3: Scale (Months 7-12)

- [ ] Pharmacy partnership integration
- [ ] Lab results integration
- [ ] Advanced analytics dashboard
- [ ] B2B clinic/hospital packages
- [ ] 10,000 paying doctors

---

## APPENDIX: KEY ASSUMPTIONS

1. **Exchange rate:** 20 MXN = 1 USD
2. **Doctor population:** 324,000 (2021, likely higher now)
3. **Smartphone penetration:** 80%+
4. **WhatsApp usage among doctors:** Near-universal
5. **Willingness to pay:** Based on Doctoralia's success at higher prices
6. **Churn rate:** 5% monthly (industry average for SMB SaaS)
7. **Regulatory stability:** No major changes expected near-term

---

_Document compiled: January 2026_ _For internal strategic planning only_
