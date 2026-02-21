# Clinical Workflows Documentation

**Platform:** Doctor.mx Telemedicine Platform
**Last Updated:** 2026-02-09
**Audience:** Medical Staff, Technical Teams, Healthcare Administrators

---

## Table of Contents

1. [Doctor Workflow](#doctor-workflow)
2. [Patient Journey](#patient-journey)
3. [Emergency Handling](#emergency-handling)
4. [Appointment Lifecycle](#appointment-lifecycle)
5. [Clinical Consultation Flow](#clinical-consultation-flow)
6. [SOAP Notes Integration](#soap-notes-integration)

---

## Doctor Workflow

### Overview

Doctors on Doctor.mx follow a streamlined workflow from registration to consultation completion. The system is designed to minimize administrative overhead while maintaining clinical excellence.

### Doctor Registration Flow

```mermaid
flowchart TD
    A[Registration Start] --> B{Account Type}
    B -->|Doctor| C[Auth Registration]
    C --> D[Complete Profile]
    D --> E[Medical Credentials]
    E --> F[Specialty Selection]
    F --> G[Onboarding Page]
    G --> H{Status Check}
    H -->|Draft| I[Complete Onboarding]
    I --> J[Submit for Verification]
    J --> K[Admin Review]
    K --> L{Verification Decision}
    L -->|Approved| M[Subscription Check]
    L -->|Rejected| N[Edit Profile]
    N --> I
    M -->|Active| O[Published in Directory]
    M -->|Inactive| P[Subscription Required]
    P --> Q[Subscribe to Premium]
    Q --> O
    O --> R[Start Receiving Appointments]
```

### Doctor Daily Workflow

```mermaid
flowchart LR
    A[Login] --> B[Dashboard Overview]
    B --> C{Task Selection}
    C --> D[View Appointments]
    C --> E[Manage Availability]
    C --> F[Review Analytics]
    C --> G[Patient Follow-ups]

    D --> H[Join Consultation]
    H --> I[Clinical Consultation]
    I --> J[Generate SOAP Notes]
    J --> K[Prescribe Medications]
    K --> L[Complete Consultation]
    L --> M[Auto-rating Request]

    E --> N[Set Schedule]
    N --> O[Update Pricing]

    F --> P[View Performance]
    P --> Q[Revenue Analytics]

    G --> R[Review Patient Status]
    R --> S[Send Follow-up Messages]
```

### Key Doctor Pages

| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/doctor` | Overview of appointments, earnings, and quick actions |
| Appointments | `/doctor/appointments` | View and manage upcoming and past consultations |
| Availability | `/doctor/availability` | Set schedule and time slots |
| Analytics | `/doctor/analytics` | Performance metrics and earnings |
| Consultation Room | `/doctor/consultation/[appointmentId]` | Active consultation interface |
| Prescriptions | `/doctor/prescription/[appointmentId]` | Generate and send prescriptions |
| Follow-ups | `/doctor/followups` | Monitor patient post-consultation status |

---

## Patient Journey

### Overview

Patients experience a frictionless journey from symptom discovery through consultation to follow-up care.

### Complete Patient Journey Diagram

```mermaid
flowchart TD
    A[Patient Lands on Platform] --> B{Browse without Login}
    B --> C[Explore Doctors]
    B --> D[AI Symptom Checker]

    C --> E[View Doctor Profiles]
    E --> F[Check Availability]
    F --> G{Ready to Book}

    D --> H[Describe Symptoms]
    H --> I[AI Assessment]
    I --> J[Red Flag Detection]
    J --> K{Emergency?}
    K -->|Yes| L[Emergency Alert]
    K -->|No| M[Specialist Recommendation]

    G --> N[Select Date/Time]
    M --> N
    N --> O{Login Required}
    O -->|Not Logged In| P[Redirect to Login]
    P --> Q[After Login]
    O -->|Logged In| Q

    Q --> R[Checkout Page]
    R --> S[Select Payment Method]
    S --> T{Payment Type}
    T -->|Card| U[Instant Payment]
    T -->|OXXO| V[Generate Voucher]
    T -->|SPEI| W[Bank Transfer]

    U --> X[Appointment Confirmed]
    V --> Y[Pending OXXO Payment]
    W --> Z[Pending SPEI Payment]
    Y --> X
    Z --> X

    X --> AA[Confirmation Email/WhatsApp]
    AA --> AB[Wait for Appointment]
    AB --> AC[Pre-consultation Chat]

    AC --> AD[Consultation Time]
    AD --> AE[Enter Video Room]
    AE --> AF[Active Consultation]
    AF --> AG[Doctor Generates SOAP]
    AG --> AH[Prescriptions Sent]
    AH --> AI[Consultation Complete]

    AI --> AJ[Rate Doctor]
    AJ --> AK[Follow-up Monitoring]
    AK --> AL[Health Outcome]
```

### Patient Entry Points

```mermaid
flowchart LR
    A[Patient Entry Points] --> B[Landing Page]
    A --> C[Direct Doctor Link]
    A --> D[AI Consultation]
    A --> E[Second Opinion]

    B --> F[Browse Directory]
    C --> G[Doctor Profile → Book]
    D --> H[Symptom Assessment]
    E --> I[Upload Medical Records]

    F --> J[Filter by Specialty]
    J --> K[Select Doctor]

    H --> L{Red Flags?}
    L -->|Yes| M[Emergency Warning]
    L -->|No| N[Book Recommended Doctor]

    K --> O[Check Availability]
    N --> O
    O --> P[Select Slot]
    P --> Q[Complete Booking]
```

### Key Patient Pages

| Page | Path | Purpose |
|------|------|---------|
| Home | `/` | Landing page with doctor directory |
| Doctors | `/doctors` | Browse all verified doctors |
| Doctor Profile | `/doctors/[id]` | View doctor details, reviews, availability |
| AI Consultation | `/app/ai-consulta` | AI-powered symptom assessment |
| Booking | `/book/[doctorId]` | Select appointment time |
| Checkout | `/checkout/[appointmentId]` | Complete payment |
| Consultation Room | `/consultation/[appointmentId]` | Video consultation interface |
| Appointments | `/app/appointments` | View scheduled appointments |
| Follow-ups | `/app/followups` | Track post-consultation care |

---

## Emergency Handling

### Overview

Doctor.mx implements a multi-layered emergency detection system to prioritize patient safety. The system automatically identifies red flags and escalates appropriately.

### Emergency Detection Flow

```mermaid
flowchart TD
    A[Patient Input] --> B[Red Flag Analysis]
    B --> C{Emergency Detected?}

    C -->|Critical| D[Immediate 911 Alert]
    C -->|High| E[Urgent Care Warning]
    C -->|Moderate| F[Consultation Recommended]
    C -->|None| G[Normal Flow]

    D --> H[Emergency Modal]
    H --> I[Call 911 Button]
    H --> J[Emergency Resources]

    E --> K[Warning Banner]
    K --> L[Recommendation]
    L --> M[User Decision]
    M --> N[Proceed with Caution]
    M --> O[Seek Urgent Care]

    F --> P[Schedule Soon]
    P --> Q[24-48hr Window]

    G --> R[Continue Booking]
```

### Red Flag Categories

The enhanced red flag system (`src/lib/ai/red-flags-enhanced.ts`) classifies emergencies into severity levels:

#### Critical (Urgency Score 8-10)

| Condition | Pattern | Action |
|-----------|---------|--------|
| Stroke/ACV | Paralysis, face drooping, speech difficulty | Call 911 immediately |
| Cardiac Emergency | Chest pain, radiating pain, crushing sensation | Call 911, chew aspirin |
| Respiratory Failure | Cannot breathe, blue lips, cyanosis | Call 911 immediately |
| Severe Bleeding | Uncontrolled hemorrhage | Call 911, apply pressure |
| Anaphylaxis | Throat closing, tongue swelling | Call 911, use EpiPen |
| Suicidal Ideation | Wants to die, suicidal thoughts | Call 911 + Lifeline 800-911-2000 |
| Seizures | Convulsions, uncontrollable spasms | Call 911, protect from injury |
| Thunderclap Headache | Worst headache of life | Call 911, neuro imaging |
| Hypertensive Crisis | BP ≥180/120 with symptoms | Call 911 immediately |

#### High Severity (Urgency Score 5-7)

| Condition | Action |
|-----------|--------|
| Difficulty breathing | Emergency room within 2 hours |
| High fever (>40°C) | Immediate evaluation |
| Abdominal rigidity | Surgical emergency possible |
| Vision loss | Ophthalmic emergency within 2 hours |
| Severe pain (10/10) | Urgent evaluation |
| Diabetic hypoglycemia | Check glucose, administer carbs |
| Angioedema | Stop ACE inhibitor, ER visit |
| Deep vein thrombosis | ER for Doppler, PE risk |

### Condition-Specific Flags

The system considers patient medical history for enhanced detection:

```mermaid
flowchart TD
    A[Patient Context] --> B{Has Diabetes?}
    A --> C{Has Hypertension?}
    A --> D{Is Pregnant?}
    A --> E{Has COPD?}
    A --> F{On Anticoagulants?}

    B --> G[Diabetic Ketoacidosis Flags]
    B --> H[Hypoglycemia Detection]

    C --> I[Hypertensive Crisis Flags]
    C --> J[Heart Failure Decompensation]

    D --> K[Preeclampsia Detection]
    D --> L[Obstetric Emergencies]

    E --> M[Respiratory Failure Flags]

    F --> N[Bleeding Risk Escalation]

    G --> O[Emergency Alert]
    H --> O
    I --> O
    J --> P[Urgent Alert]
    K --> O
    L --> O
    M --> O
    N --> P
```

### Mental Health Crisis Handling

```mermaid
flowchart LR
    A[Detects Suicidal Content] --> B[Critical Alert]
    B --> C[Modal: Crisis Resources]
    C --> D[911 Button]
    C --> E[Lifeline: 800-911-2000]
    C --> F[SAPTEL: 55-5259-8121]
    C --> G[In-Platform Support Chat]

    D --> H[Call Placed]
    E --> H
    F --> H
    G --> I[Connected to Support]
```

### Emergency Response Protocol

1. **Detection:** Pattern matching against symptom descriptions
2. **Classification:** Critical, High, or Moderate urgency
3. **Escalation:**
   - Critical: Immediate 911 call prompt with resources
   - High: Warning with recommendation for ER within 2-24 hours
   - Moderate: Recommendation for consultation within 24 hours
4. **Documentation:** All red flags logged for quality assurance
5. **Follow-up:** Automated check-in for urgent cases

---

## Appointment Lifecycle

### State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft: Patient initiates booking
    Draft --> PendingPayment: Slot reserved
    PendingPayment --> Confirmed: Payment successful
    PendingPayment --> Cancelled: Payment failed/timeout
    Confirmed --> InProgress: Consultation starts
    InProgress --> Completed: Consultation ends
    InProgress --> NoShow: Patient absent
    Completed --> ReviewRequested: Auto-rating prompt
    ReviewRequested --> [*]: Review submitted
    NoShow --> [*]
    Cancelled --> [*]
```

### State Transitions

| From | To | Trigger | System Actions |
|------|-----|---------|----------------|
| Draft | PendingPayment | Patient selects slot | Create appointment record, send confirmation |
| PendingPayment | Confirmed | Stripe webhook `payment_intent.succeeded` | Update status, send receipt, create video room |
| PendingPayment | Cancelled | Stripe webhook `payment_intent.payment_failed` | Release slot, notify patient |
| Confirmed | InProgress | Both parties join video | Mark consultation as active |
| InProgress | Completed | Doctor ends consultation | Generate SOAP note, request rating |
| InProgress | NoShow | Patient doesn't join (15 min after start) | Notify doctor, option to cancel |
| Completed | ReviewRequested | Automatic after completion | Send rating email/notification |

### Payment Methods

```mermaid
flowchart LR
    A[Patient Checkout] --> B{Payment Method}
    B -->|Credit Card| C[Stripe Card Payment]
    B -->|OXXO| D[Cash Payment Voucher]
    B -->|SPEI| E[Bank Transfer]

    C --> F[Instant Confirmation]
    D --> G[Voucher Generated]
    G --> H[Pay at OXXO]
    H --> I[3-Day Window]
    I --> J[Confirmation on Payment]

    E --> K[SPEI Instructions]
    K --> L[Transfer to CLABE]
    L --> M[Instant Confirmation]
```

---

## Clinical Consultation Flow

### Pre-Consultation Phase

```mermaid
flowchart TD
    A[Appointment Confirmed] --> B[Pre-consultation Chat Available]
    B --> C{Patient Has Questions?}
    C -->|Yes| D[Chat with Doctor]
    C -->|No| E[Wait for Appointment]
    D --> F[Clarify Symptoms/Medical History]
    F --> E

    E --> G[30 Minutes Before]
    G --> H[Send Reminder]
    H --> I[Prepare Video Room]
    I --> J[Appointment Time]
```

### Active Consultation Phase

```mermaid
flowchart TD
    A[Consultation Starts] --> B[Video Connection Established]
    B --> C[Doctor View]
    B --> D[Patient View]

    C --> E[Patient Info Sidebar]
    C --> F[Video Feed]
    C --> G[Clinical Copilot AI]
    C --> H[Consultation Notes]

    E --> I[Medical History]
    E --> J[Allergies]
    E --> K[Current Medications]
    E --> L[Chronic Conditions]

    G --> M[Red Flag Monitoring]
    G --> N[Treatment Suggestions]
    G --> O[Drug Interaction Checks]

    D --> P[Join Video Call]
    P --> Q[Active Consultation]

    Q --> R[Discussion]
    R --> S[Examination]
    S --> T[Diagnosis Discussion]
    T --> U[Treatment Plan]
    U --> V[Doctor Ends Consultation]
```

### Post-Consultation Phase

```mermaid
flowchart TD
    A[Consultation Ends] --> B{Doctor Takes Notes?}
    B -->|Yes| C[SOAP Notes Modal]
    B -->|No| D[Mark Complete]

    C --> E[Generate SOAP with AI]
    E --> F[Review/Edit SOAP]
    F --> G{Approve SOAP?}
    G -->|Yes| H[Save to Patient Record]
    G -->|No| I[Edit Manually]
    I --> H

    H --> J{Prescription Needed?}
    J -->|Yes| K[Generate Prescription]
    J -->|No| L[Skip Prescription]

    K --> M[Send to Pharmacy]
    M --> L

    D --> N[Complete Consultation]
    L --> N
    N --> O[Rating Request Sent]
    O --> P[Follow-up Monitoring]
```

---

## SOAP Notes Integration

### SOAP Generation Workflow

```mermaid
flowchart TD
    A[Doctor Ends Consultation] --> B[Collect Consultation Notes]
    B --> C[AI SOAP Generation]
    C --> D[Patient Context Analysis]

    D --> E[Structured SOAP Output]
    E --> F[Subjective]
    E --> G[Objective]
    E --> H[Assessment]
    E --> I[Plan]

    F --> J[Doctor Review]
    G --> J
    H --> J
    I --> J

    J --> K{Approve SOAP?}
    K -->|Yes| L[Save to Record]
    K -->|Edit| M[Modify Fields]
    M --> L

    L --> N[Export Options]
    N --> O[PDF Export]
    N --> P[EHR Integration]
    N --> Q[Patient Copy]
```

### SOAP Note Structure

The SOAP notes system (`src/lib/soap/`) generates structured clinical documentation:

- **Subjective:** Patient's reported symptoms, history, concerns
- **Objective:** Examination findings, vital signs, observable data
- **Assessment:** Clinical impression, diagnosis, differential diagnoses
- **Plan:** Treatment recommendations, medications, follow-up, referrals

### Multi-Specialist Consultation

For complex cases, the AI consultation system (`src/app/api/ai/consult/route.ts`) provides multi-specialist analysis:

```mermaid
flowchart TD
    A[Complex Case] --> B[AI Symptom Analysis]
    B --> C[Specialist Selection]
    C --> D[General Practitioner]
    C --> E[Relevant Specialists]

    D --> F[Independent Assessment]
    E --> F

    F --> G[Consensus Building]
    G --> H[Kendall's W Agreement]
    H --> I{Agreement Level}

    I -->|Strong| J[Confident Recommendation]
    I -->|Moderate| K[Recommendation with Caveats]
    I -->|Weak| L[Human Review Required]

    J --> M[Treatment Plan]
    K --> M
    L --> N[Escalate to Human Doctor]
```

---

## Video Consultation Technical Details

### Video Room Creation

```mermaid
sequenceDiagram
    participant Patient
    participant Doctor
    participant App
    participant Daily.co API

    Patient->>App: Join consultation
    Doctor->>App: Join consultation

    App->>Daily.co: Create room
    Daily.co-->>App: Room URL

    App->>Patient: Redirect to room
    App->>Doctor: Redirect to room

    Patient->>Daily.co: Enter room
    Doctor->>Daily.co: Enter room

    Daily.co-->>Patient: Video connected
    Daily.co-->>Doctor: Video connected

    Note over Patient,Doctor: Active consultation

    Doctor->>App: End consultation
    App->>Daily.co: Close room
```

### Clinical Copilot Features

The Clinical Copilot (`src/components/ClinicalCopilot.tsx`) provides real-time assistance:

- **Red Flag Detection:** Continuous monitoring of conversation
- **Treatment Suggestions:** Evidence-based recommendations
- **Drug Interactions:** Check against patient medications
- **Dosing Guidelines:** Pediatric and adult dosing
- **Diagnostic Support:** Differential diagnosis suggestions
- **Documentation Assistance:** SOAP note generation

---

## Follow-up System

### Automated Follow-ups

```mermaid
flowchart TD
    A[Consultation Complete] --> B[Follow-up Schedule]
    B --> C{Urgency Level}

    C -->|High| D[24-hour Check-in]
    C -->|Moderate| E[48-hour Check-in]
    C -->|Routine| F[7-day Check-in]

    D --> G[WhatsApp Message]
    E --> G
    F --> G

    G --> H{Patient Responds?}
    H -->|Yes| I[Log Response]
    H -->|No| J[Retry in 24 hours]

    I --> K{Condition Improved?}
    K -->|Yes| L[Close Follow-up]
    K -->|No| M[Alert Doctor]
    K -->|Worse| N[Urgent Escalation]

    J --> O{Max Retries?}
    O -->|No| G
    O -->|Yes| L
```

---

## Quality Assurance

### Consultation Quality Metrics

- **Red Flag Detection Rate:** % of emergencies properly identified
- **SOAP Note Completion:** % of consultations with SOAP notes
- **Patient Satisfaction:** Post-consultation ratings
- **Follow-up Adherence:** % of patients completing follow-ups
- **Time to Documentation:** Average time from consult to SOAP note
- **Prescription Accuracy:** Drug interaction checks performed

---

## Compliance and Safety

### Mexican Healthcare Compliance

1. **Emergency Triage:** Complies with Mexican emergency care standards
2. **Prescription Regulations:** Digital prescriptions compliant with COFEPRIS
3. **Data Privacy:** Patient data handled per Mexican privacy laws
4. **Medical Liability:** Clear scope limitations for telemedicine
5. **Emergency Resources:** Access to 911 and mental health crisis lines

### Safety Mechanisms

1. **Red Flag System:** Multi-layered emergency detection
2. **Mandatory Disclaimer:** Platform limitations clearly communicated
3. **Doctor Verification:** Only verified doctors can consult
4. **Prescription Controls:** Doctor-only prescription generation
5. **Audit Trail:** All consultations logged for quality review

---

## Quick Reference

### Emergency Phone Numbers (Mexico)

- **Emergency Services:** 911
- **Lifeline (Suicide Prevention):** 800-911-2000
- **SAPTEL (Mental Health):** 55-5259-8121
- **Crisis Line:** 800-290-0024

### System Status Codes

- `draft`: Doctor profile incomplete
- `pending`: Doctor awaiting verification
- `approved`: Doctor verified and active
- `pending_payment`: Appointment awaiting payment
- `confirmed`: Appointment paid and scheduled
- `in_progress`: Active consultation
- `completed`: Consultation finished
- `cancelled`: Appointment cancelled
- `no_show`: Patient missed appointment

### Consultation Duration

- **Standard:** 30 minutes
- **Slot Interval:** 30 minutes
- **Buffer Time:** 0 minutes (back-to-back scheduling)
- **Cancellation Window:** Up to appointment time
- **Payment Timeout:** 3 days (OXXO), instant (cards/SPEI)

---

## Support

For technical support or clinical workflow questions:

- **Technical Issues:** Contact development team
- **Clinical Questions:** Consult medical director
- **Emergency Protocols:** Refer to this documentation
- **Platform Training:** Schedule onboarding session

---

**Document Version:** 1.0
**Last Review:** 2026-02-09
**Next Review:** 2026-05-09
