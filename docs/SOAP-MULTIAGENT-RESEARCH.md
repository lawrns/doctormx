# SOAP Methodology & Multi-Agent Medical Consultation Research

> Comprehensive research compilation for Doctory v2 - Pre-consultation/triage
> system design

---

## Table of Contents

1. [SOAP Framework](#1-soap-framework)
2. [Multi-Agent Medical Consultation](#2-multi-agent-medical-consultation)
3. [UX Patterns](#3-ux-patterns)
4. [Technical Architecture](#4-technical-architecture)
5. [Sources](#5-sources)

---

## 1. SOAP Framework

### 1.1 Clinical Definition and Proper Usage

**SOAP** (Subjective, Objective, Assessment, Plan) is a clinical documentation
methodology theorized by Dr. Larry Weed nearly 50 years ago. It provides:

- A cognitive framework for clinical reasoning
- A standardized method for documenting patient encounters
- A structured approach to diagnosis and treatment planning

#### The Four Components

| Section            | Purpose                    | Content Type                                                                |
| ------------------ | -------------------------- | --------------------------------------------------------------------------- |
| **Subjective (S)** | Patient's perspective      | Chief complaint, symptoms, feelings, duration, patient-reported history     |
| **Objective (O)**  | Observable/measurable data | Vital signs, lab results, physical examination findings, diagnostic imaging |
| **Assessment (A)** | Clinical interpretation    | Diagnosis, differential diagnoses, clinical reasoning synthesis             |
| **Plan (P)**       | Next steps                 | Treatment plan, medications, follow-up, referrals, patient education        |

#### Alternative Frameworks

- **APSO** (Assessment, Plan, Subjective, Objective) - Rearranges order to
  front-load the most clinically relevant information for ongoing care
- **OODA Loop** (Observe, Orient, Decide, Act) - Military-derived framework that
  makes "Decisions" an explicit category, enhancing learning opportunities

### 1.2 Application to Pre-Consultation/Triage

In a pre-consultation context, SOAP adapts as follows:

| Stage          | Pre-Consultation Application                                                             |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Subjective** | Digital intake forms, symptom questionnaires, patient self-reported symptoms and history |
| **Objective**  | Remote vital signs (if available), historical EHR data, wearable device data             |
| **Assessment** | AI-assisted preliminary triage, risk stratification, urgency scoring                     |
| **Plan**       | Routing decision (specialist type, urgency level, care pathway)                          |

### 1.3 Digital Implementation Best Practices

#### AI-Powered SOAP Generation Workflow

1. **Data Capture** - Natural language processing (NLP) and speech-to-text
   capture patient-clinician conversations
2. **Information Organization** - AI intelligently categorizes information into
   appropriate SOAP sections
3. **Clinical Decision Support** - System suggests differential diagnoses, flags
   inconsistencies
4. **Human Review** - Clinician reviews, edits, and signs the note

#### Key Implementation Features

- **Real-time validation** - Context-driven NLP checks for precision and
  completeness
- **EHR Integration** - Seamless connection to existing electronic health
  records
- **HIPAA Compliance** - Business Associate Agreement (BAA), encryption, secure
  data storage
- **Scalability** - Handle growing patient volumes without performance
  degradation

#### Implementation Timeline (Typical)

| Phase                    | Duration   |
| ------------------------ | ---------- |
| Platform selection       | 1 week     |
| Equipment/template setup | 1 week     |
| Provider training        | 3-5 days   |
| Pilot program            | 1-2 weeks  |
| Full adoption            | 2-3 months |

### 1.4 Common Pitfalls to Avoid in Automated Systems

#### General Documentation Errors

1. **Vague chief complaints** - Missing duration, specifics, or context
2. **Copy-forward syndrome** - Reusing previous notes without updating for
   current visit
3. **"WNL" abuse** - Using "Within Normal Limits" without describing what was
   examined
4. **Missing pertinent negatives** - Not documenting what was ruled out
5. **Diagnosis-documentation mismatch** - Findings don't support the assessment
6. **Incomplete medication details** - Missing dosages, frequencies, or routes
7. **No return precautions** - Missing safety net instructions

#### AI-Specific Errors

| Error Type               | Description                                       | Mitigation                 |
| ------------------------ | ------------------------------------------------- | -------------------------- |
| **Hallucinations**       | AI generates information not discussed            | Human review mandatory     |
| **Transcription errors** | Mishearing medication names or numbers            | Verification prompts       |
| **Context errors**       | Misattributing information to wrong patient/visit | Session isolation          |
| **Template responses**   | Lack of patient-specific detail                   | Customization requirements |
| **Consent gaps**         | Missing AI recording disclosure                   | Explicit consent flow      |

#### Legal Responsibility

> **Critical**: The signing clinician is legally responsible for accuracy and
> completeness of ALL clinical documentation, regardless of whether AI was used
> to generate the initial draft.

---

## 2. Multi-Agent Medical Consultation

### 2.1 How Different Medical Specialists Collaborate

#### Real-World MDT (Multi-Disciplinary Team) Model

Traditional MDT consultations involve multiple specialists discussing complex
cases:

- **Oncology MDTs** - Include oncologist, radiologist, pathologist, surgeon,
  nurse specialist
- **Cardiac MDTs** - Cardiologist, cardiac surgeon, imaging specialist,
  anesthesiologist
- **Neurology MDTs** - Neurologist, neurosurgeon, neuroradiologist,
  rehabilitation specialist

#### Digital MDT Principles

- **Gold standard** - MDT consultations remain the benchmark for complex case
  decision-making
- **Information synthesis** - Each specialist contributes domain-specific
  expertise
- **Consensus building** - Structured discussions lead to agreed treatment plans
- **Traceability** - Decisions are documented with supporting rationale

### 2.2 Consensus-Building Patterns in Medical Decision-Making

#### MDTeamGPT Framework

Research has developed AI frameworks that simulate MDT consultations:

- **Consensus aggregation** - Lead physician consolidates outputs into
  categories:
  - Consistency (agents agree)
  - Conflict (agents disagree - requires discussion)
  - Independence (separate findings)
  - Integration (combined insights)
- **Residual discussion** - Multi-round consultations until consensus
- **Knowledge bases** - Correct Answer and Chain-of-Thought repositories enable
  continuous learning

#### Multi-Agent Medical Decision Consensus Matrix

A quantitative approach using **Kendall's coefficient of concordance** to
measure agreement:

| Metric                                  | Value  |
| --------------------------------------- | ------ |
| Average accuracy                        | 87.5%  |
| Consensus achievement rate              | 89.3%  |
| Mean Kendall's W                        | 0.823  |
| Clinical appropriateness (expert rated) | 8.9/10 |

The system deploys **7 specialized agents**:

1. Oncologist
2. Radiologist
3. Nurse
4. Psychologist
5. Patient Advocate
6. Nutritionist
7. Rehabilitation Therapist

### 2.3 AI Agent Orchestration for Medical Triage

#### Architecture Patterns

**1. Complexity-Based Routing (MDAgents)**

```
Query Analysis → Complexity Classification → Team Assignment
                       ↓
            ┌─────────┴─────────┐
            │                   │
    Low Complexity      High Complexity
            │                   │
   Single Primary        Multi-Specialist
   Care Clinician            Team
```

**2. Multi-Agent Conversation (MAC)**

- Optimal configuration: **4 doctor agents + 1 supervisor agent**
- Base model: GPT-4 or equivalent
- Simulates real-world MDT discussions
- Outperforms single models in both primary and follow-up consultations

**3. Hierarchical Action Selection**

```
Doctor Agent → Phase Selection → Action Set → Execution
                    ↓
        ┌──────────┴──────────┐
        │                     │
   Intake Phase          Diagnosis Phase
        │                     │
   Symptom Collection    Test Ordering
   History Taking        Specialist Referral
```

#### Framework Options

| Framework     | Strengths                                   | Use Case                |
| ------------- | ------------------------------------------- | ----------------------- |
| **LangChain** | Standard for LLM chaining, memory, agents   | General orchestration   |
| **CrewAI**    | Role-based multi-agent orchestration        | Team-based workflows    |
| **AutoGen**   | Microsoft-backed, multi-agent conversations | Enterprise scenarios    |
| **MetaGPT**   | Complex workflow management                 | Large-scale deployments |

### 2.4 Examples of Successful Multi-Agent Medical Systems

#### Research Implementations

| System           | Architecture                           | Performance            |
| ---------------- | -------------------------------------- | ---------------------- |
| **MDTeamGPT**    | Self-evolving multi-agent consultation | 90.1% accuracy (MedQA) |
| **Zodiac**       | Cardiologist-level diagnostics         | Multi-agent consensus  |
| **MedAgents**    | Zero-shot medical reasoning            | ACL Findings 2024      |
| **KG4Diagnosis** | Knowledge graph enhancement            | Improved accuracy      |

#### Commercial/Clinical Tools

- **TriageGO** - ML-based ED triage with explainable recommendations
- **Isabel Symptom Checker** - 96% accuracy matching symptoms to 6,000+ diseases
- **AITE (AI Triage Engine)** - Conversational triage with care pathway
  recommendations

---

## 3. UX Patterns

### 3.1 Visualizing SOAP Workflows for Patients

#### Design Principles

1. **One purpose per screen** - Each screen serves a single, clear function
2. **Logical flow reflection** - Interface structure follows actual clinical
   workflow
3. **Progress visibility** - Clear indication of where patient is in the process
4. **Simplicity over features** - Reduce cognitive load, especially during
   health stress

#### Visual Hierarchy for SOAP Sections

```
┌─────────────────────────────────────────┐
│  📝 Tell Us About Your Symptoms         │  ← SUBJECTIVE
│  ─────────────────────────────────────  │
│  [Symptom selection / description]      │
│  [Duration picker]                      │
│  [Severity scale]                       │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  📊 Your Health Data                    │  ← OBJECTIVE
│  ─────────────────────────────────────  │
│  [Vital signs entry/wearable sync]      │
│  [Medication list review]               │
│  [Relevant history display]             │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  🔍 What We're Seeing                   │  ← ASSESSMENT
│  ─────────────────────────────────────  │
│  [Preliminary triage result]            │
│  [Risk indicators]                      │
│  [Urgency level visualization]          │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  📋 Next Steps                          │  ← PLAN
│  ─────────────────────────────────────  │
│  [Recommended specialist]               │
│  [Appointment booking]                  │
│  [Self-care instructions]               │
└─────────────────────────────────────────┘
```

### 3.2 Animation Patterns That Enhance Understanding

#### Micro-Interactions Best Practices

| Pattern                 | Purpose                              | Implementation                                  |
| ----------------------- | ------------------------------------ | ----------------------------------------------- |
| **Progress indicators** | Show advancement through SOAP phases | Animated step indicators, progress rings        |
| **Loading states**      | Indicate AI processing               | Pulsing specialist avatars, thinking animations |
| **Feedback loops**      | Confirm user actions                 | Check animations, subtle color transitions      |
| **Data visualization**  | Display health metrics               | Animated charts, gauge meters                   |

#### Animation Guidelines

- **Purposeful motion** - Every animation should enhance comprehension
- **Subtle haptics** - Vibration patterns for medication reminders,
  confirmations
- **Countdown animations** - Clear waiting time indicators during processing
- **Transition continuity** - Smooth screen transitions maintain context

#### Emotional Design Elements

| Element             | Effect         |
| ------------------- | -------------- |
| Soft color palettes | Reduce anxiety |
| Rounded corners     | Create warmth  |
| Hand-drawn icons    | Build trust    |
| Calm visuals        | Foster safety  |

### 3.3 Mobile-First Medical Interface Considerations

#### Core Requirements

1. **Touch targets** - Minimum 9mm (44x44px) for accessibility
2. **Font size** - Minimum 16px body text with 1.5 line height
3. **Contrast ratio** - Minimum 4.5:1 for medical accuracy
4. **One-handed operation** - Critical actions reachable with thumb

#### Multi-User Design Challenges

```
┌─────────────────────────────────────────┐
│  Patient View                           │
│  • Wants reassurance                    │
│  • Needs simple language                │
│  • Seeks clarity on next steps          │
├─────────────────────────────────────────┤
│  Clinician View                         │
│  • Wants speed                          │
│  • Needs clinical detail                │
│  • Requires quick decision support      │
├─────────────────────────────────────────┤
│  Admin View                             │
│  • Wants error prevention               │
│  • Needs workflow efficiency            │
│  • Requires compliance tracking         │
└─────────────────────────────────────────┘
```

### 3.4 Accessibility Requirements for Medical Apps

#### WCAG 2.1 AA Compliance (Required by May 2026)

The HHS has mandated that all public-facing healthcare web content and mobile
apps must conform to WCAG 2.1 AA standards.

#### Four Core Principles (POUR)

| Principle          | Requirement                          |
| ------------------ | ------------------------------------ |
| **Perceivable**    | Content available to all senses      |
| **Operable**       | Navigation works for all abilities   |
| **Understandable** | Information is clear and predictable |
| **Robust**         | Works with assistive technologies    |

#### Healthcare-Specific Accessibility

```typescript
// Example accessibility considerations
interface AccessibilityRequirements {
  // Visual
  minimumFontSize: "16px";
  colorContrastRatio: "4.5:1";
  screenReaderCompatible: true;

  // Motor
  touchTargetSize: "44x44px";
  gestureAlternatives: true;

  // Cognitive
  clearLanguage: true; // Avoid medical jargon
  chunkedInformation: true;

  // Privacy-conscious
  screenReaderPHIControl: true; // User controls what's read aloud
  sharedDeviceProtection: true;
}
```

#### Key Compliance Actions

1. Conduct accessibility audit against WCAG 2.1 AA
2. Regular testing with scanning technologies
3. Include users with disabilities in research
4. Train personnel on accessibility requirements

---

## 4. Technical Architecture

### 4.1 State Machines for Medical Consultation Flows

#### Why State Machines for Healthcare

- **Predictable behavior** - Clear, defined states prevent undefined behavior
- **Visual documentation** - State diagrams serve as living documentation
- **Complex flow management** - Multi-step wizards, conditional branching
- **Audit compliance** - Every state transition is trackable

#### XState Implementation Pattern

```typescript
import { assign, createMachine } from "xstate";

const consultationMachine = createMachine({
  id: "consultation",
  initial: "intake",
  context: {
    patientId: null,
    symptoms: [],
    vitals: null,
    assessment: null,
    plan: null,
    specialistAgents: [],
  },
  states: {
    // SUBJECTIVE PHASE
    intake: {
      initial: "chiefComplaint",
      states: {
        chiefComplaint: {
          on: { SUBMIT_COMPLAINT: "symptomDetails" },
        },
        symptomDetails: {
          on: {
            SUBMIT_SYMPTOMS: "medicalHistory",
            BACK: "chiefComplaint",
          },
        },
        medicalHistory: {
          on: {
            COMPLETE_SUBJECTIVE: "#consultation.objective",
            BACK: "symptomDetails",
          },
        },
      },
    },

    // OBJECTIVE PHASE
    objective: {
      initial: "vitals",
      states: {
        vitals: {
          on: { SUBMIT_VITALS: "dataReview" },
        },
        dataReview: {
          on: {
            COMPLETE_OBJECTIVE: "#consultation.assessment",
            BACK: "vitals",
          },
        },
      },
    },

    // ASSESSMENT PHASE (Multi-Agent)
    assessment: {
      initial: "agentConsultation",
      states: {
        agentConsultation: {
          invoke: {
            id: "specialistAgents",
            src: "consultSpecialists",
            onDone: {
              target: "consensusBuilding",
              actions: assign({ agentResponses: (_, event) => event.data }),
            },
          },
        },
        consensusBuilding: {
          invoke: {
            id: "buildConsensus",
            src: "buildConsensus",
            onDone: {
              target: "presentAssessment",
              actions: assign({ assessment: (_, event) => event.data }),
            },
          },
        },
        presentAssessment: {
          on: {
            APPROVE_ASSESSMENT: "#consultation.plan",
            REQUEST_CLARIFICATION: "agentConsultation",
          },
        },
      },
    },

    // PLAN PHASE
    plan: {
      initial: "generatePlan",
      states: {
        generatePlan: {
          on: { PLAN_READY: "reviewPlan" },
        },
        reviewPlan: {
          on: {
            ACCEPT_PLAN: "#consultation.complete",
            MODIFY_PLAN: "generatePlan",
          },
        },
      },
    },

    complete: {
      type: "final",
      entry: "saveConsultation",
    },
  },
});
```

### 4.2 Handling Specialist "Agents" in Sequence or Parallel

#### Parallel Agent Consultation

```typescript
// Parallel specialist consultation
interface SpecialistAgent {
  id: string;
  specialty:
    | "general"
    | "cardiology"
    | "dermatology"
    | "neurology"
    | "orthopedics";
  prompt: string;
  weight: number; // Confidence weight for consensus
}

async function consultSpecialistsParallel(
  symptoms: Symptom[],
  agents: SpecialistAgent[],
): Promise<AgentResponse[]> {
  // All agents consult simultaneously
  const consultations = agents.map((agent) => invokeAgent(agent, symptoms));

  return Promise.all(consultations);
}
```

#### Sequential Agent Consultation (for dependent decisions)

```typescript
async function consultSpecialistsSequential(
  symptoms: Symptom[],
  agents: SpecialistAgent[],
): Promise<AgentResponse[]> {
  const responses: AgentResponse[] = [];

  for (const agent of agents) {
    // Each agent sees previous agent responses
    const response = await invokeAgent(agent, symptoms, responses);
    responses.push(response);

    // Early exit if high-confidence diagnosis reached
    if (response.confidence > 0.95) break;
  }

  return responses;
}
```

#### Hybrid Pattern: MAC (Multi-Agent Conversation)

```typescript
interface MACConfiguration {
  doctorAgents: 4;
  supervisorAgent: 1;
  maxRounds: 3;
  consensusThreshold: 0.8;
}

async function runMAC(
  case: PatientCase,
  config: MACConfiguration
): Promise<ConsensusResult> {
  let round = 0;
  let consensus: ConsensusResult | null = null;

  while (round < config.maxRounds && !consensus) {
    // Round 1: Independent analysis
    const analyses = await Promise.all(
      config.doctorAgents.map(agent => agent.analyze(case))
    );

    // Round 2: Cross-discussion
    const discussions = await Promise.all(
      config.doctorAgents.map((agent, i) =>
        agent.discuss(analyses.filter((_, j) => j !== i))
      )
    );

    // Round 3: Supervisor synthesis
    const supervisorAssessment = await config.supervisorAgent.synthesize(discussions);

    // Check consensus
    const kendallW = calculateKendallW(discussions);
    if (kendallW >= config.consensusThreshold) {
      consensus = supervisorAssessment;
    }

    round++;
  }

  return consensus || { status: 'escalate_to_human' };
}
```

### 4.3 Data Structures for SOAP Note Capture

#### Core SOAP Schema

```typescript
interface SOAPNote {
  id: string;
  patientId: string;
  encounterId: string;
  timestamp: Date;
  status: "draft" | "pending_review" | "signed" | "amended";

  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  assessment: AssessmentSection;
  plan: PlanSection;

  metadata: {
    aiAssisted: boolean;
    aiModel?: string;
    reviewedBy?: string;
    signedBy?: string;
    signedAt?: Date;
  };
}

interface SubjectiveSection {
  chiefComplaint: {
    description: string;
    duration: string;
    onset: "sudden" | "gradual";
    severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  };

  historyOfPresentIllness: {
    symptoms: Symptom[];
    associatedSymptoms: Symptom[];
    aggravatingFactors: string[];
    relievingFactors: string[];
    previousTreatments: string[];
  };

  reviewOfSystems: Record<SystemCategory, SystemReview>;

  pastMedicalHistory: {
    conditions: Condition[];
    surgeries: Surgery[];
    hospitalizations: Hospitalization[];
  };

  medications: Medication[];
  allergies: Allergy[];

  socialHistory: {
    smoking: SmokingStatus;
    alcohol: AlcoholUse;
    drugs: DrugUse;
    occupation: string;
    livingSituation: string;
  };

  familyHistory: FamilyCondition[];
}

interface ObjectiveSection {
  vitalSigns: {
    bloodPressure: { systolic: number; diastolic: number };
    heartRate: number;
    respiratoryRate: number;
    temperature: { value: number; unit: "C" | "F" };
    oxygenSaturation: number;
    weight?: { value: number; unit: "kg" | "lbs" };
    height?: { value: number; unit: "cm" | "in" };
    bmi?: number;
  };

  physicalExam: Record<ExamCategory, ExamFinding>;

  diagnosticResults: {
    labResults: LabResult[];
    imagingResults: ImagingResult[];
    otherTests: TestResult[];
  };
}

interface AssessmentSection {
  primaryDiagnosis: Diagnosis;
  differentialDiagnoses: Diagnosis[];

  clinicalReasoning: string;

  riskStratification?: {
    level: "low" | "moderate" | "high" | "critical";
    factors: string[];
    score?: number;
    scoringSystem?: string;
  };

  // Multi-agent assessment data
  agentConsensus?: {
    agents: AgentAssessment[];
    consensusScore: number; // Kendall's W
    consensusCategory: "consistent" | "conflict" | "independent" | "integrated";
  };
}

interface PlanSection {
  diagnosticPlan: {
    testsOrdered: TestOrder[];
    consultationsRequested: ConsultationRequest[];
  };

  therapeuticPlan: {
    medications: MedicationOrder[];
    procedures: ProcedureOrder[];
    therapies: TherapyOrder[];
  };

  patientEducation: {
    instructions: string[];
    resources: Resource[];
    warningSignsToWatch: string[];
  };

  followUp: {
    timing: string;
    provider: string;
    instructions: string;
  };

  disposition: "home" | "admitted" | "transferred" | "refer_specialist";
}
```

#### FHIR Mapping Considerations

```typescript
// Mapping SOAP to FHIR resources
interface SOAPtoFHIRMapping {
  subjective: {
    // Maps to Condition, Observation (patient-reported)
    resource: "Condition" | "Observation";
    category: "patient-reported";
  };

  objective: {
    // Maps to Observation (vital signs, lab results)
    resource: "Observation" | "DiagnosticReport";
    category: "vital-signs" | "laboratory";
  };

  assessment: {
    // Maps to Condition (diagnosis), ClinicalImpression
    resource: "Condition" | "ClinicalImpression";
  };

  plan: {
    // Maps to CarePlan, MedicationRequest, ServiceRequest
    resource: "CarePlan" | "MedicationRequest" | "ServiceRequest";
  };
}
```

### 4.4 Real-Time Collaboration Patterns

#### WebSocket Architecture for Multi-Agent Consultation

```typescript
// WebSocket event types for real-time consultation
type ConsultationEvent =
  | { type: "AGENT_JOINED"; agentId: string; specialty: string }
  | { type: "AGENT_THINKING"; agentId: string }
  | { type: "AGENT_RESPONSE"; agentId: string; response: AgentResponse }
  | { type: "CONSENSUS_UPDATE"; score: number; status: string }
  | { type: "HUMAN_OVERRIDE"; clinicianId: string; action: string }
  | { type: "CONSULTATION_COMPLETE"; result: ConsensusResult };

// WebSocket server configuration
interface ConsultationWebSocketConfig {
  endpoint: "/ws/consultation";

  channels: {
    patient: `consultation:${string}:patient`; // Patient view
    clinician: `consultation:${string}:clinician`; // Clinician dashboard
    agents: `consultation:${string}:agents`; // Agent coordination
  };

  heartbeat: 30000; // 30 second keepalive
  reconnectAttempts: 5;
}
```

#### Real-Time State Synchronization

```typescript
// Supabase Realtime example for consultation state
const consultationChannel = supabase
  .channel("consultation-room")
  .on("postgres_changes", {
    event: "UPDATE",
    schema: "public",
    table: "consultations",
    filter: `id=eq.${consultationId}`,
  }, (payload) => {
    // Sync state machine with database changes
    consultationMachine.send({
      type: "EXTERNAL_UPDATE",
      data: payload.new,
    });
  })
  .subscribe();
```

#### API Design Pattern (FHIR-Compliant)

```typescript
// RESTful API endpoints for consultation service
interface ConsultationAPI {
  // Create new consultation (triage entry)
  "POST /consultations": {
    request: CreateConsultationRequest;
    response: Consultation;
  };

  // Get consultation status and current state
  "GET /consultations/:id": {
    response: ConsultationWithState;
  };

  // Submit SOAP section data
  "PATCH /consultations/:id/subjective": {
    request: SubjectiveSection;
    response: Consultation;
  };

  // Trigger agent consultation
  "POST /consultations/:id/assess": {
    request: { agentConfiguration?: AgentConfig };
    response: { taskId: string; estimatedDuration: number };
  };

  // Get agent consultation results
  "GET /consultations/:id/assessment": {
    response: AssessmentSection;
  };

  // Clinician approval/override
  "POST /consultations/:id/approve": {
    request: { clinicianId: string; modifications?: Partial<SOAPNote> };
    response: SignedSOAPNote;
  };
}
```

---

## 5. Sources

### Academic & Medical Informatics

- [SOAP Notes - StatPearls - NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK482263/) -
  Authoritative clinical reference
- [Predicting Relations between SOAP Note Sections - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10197152/) -
  Research on SOAP section relationships
- [Using ChatGPT-4 to Create Structured Medical Notes - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11074889/) -
  AI documentation study
- [SOAP Notes - APSU Writing Center (PDF)](https://www.apsu.edu/writingcenter/writing-resources/SOAP-Note-Taking-Method-2024.pdf) -
  Educational resource

### Multi-Agent Medical AI

- [Multiagent AI Systems in Health Care - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12360800/) -
  Comprehensive overview
- [Enhancing diagnostic capability with multi-agents - npj Digital Medicine](https://www.nature.com/articles/s41746-025-01550-0) -
  MAC framework research
- [MDTeamGPT - arXiv](https://arxiv.org/abs/2503.13856) - Self-evolving
  multi-agent framework
- [Multi-Agent Medical Decision Consensus Matrix - arXiv](https://arxiv.org/abs/2512.14321) -
  Oncology MDT system
- [MDAgents - MIT Media Lab](https://www.media.mit.edu/projects/mdagents-adaptive-collaboration-strategy-for-llms-in-medical-decision-making/overview/) -
  Adaptive collaboration
- [A foundational architecture for AI agents in healthcare - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12629813/) -
  Architecture patterns
- [Healthcare agent - npj Artificial Intelligence](https://www.nature.com/articles/s44387-025-00021-x) -
  LLM medical consultation

### Triage & Clinical Decision Support

- [Use of AI in Triage in Hospital Emergency Departments - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11158416/) -
  Scoping review
- [AI-driven triage in emergency departments - ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1386505625000553) -
  Benefits and challenges
- [Artificial Intelligence Decision Support for Medical Triage - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8075483/) -
  System architecture
- [How Virtual Triage Can Improve Patient Experience - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10561746/) -
  Virtual triage review
- [Infermedica API](https://infermedica.com/solutions/infermedica-api) -
  Commercial triage solution

### UX Design & Accessibility

- [Healthcare App Design - TopFlightApps](https://topflightapps.com/ideas/healthcare-mobile-app-design/) -
  Comprehensive guide
- [Healthcare UI Design 2025 - Eleken](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications) -
  Best practices
- [WCAG Guidelines for Digital Health - Nozomi Health](https://studio.nozomihealth.com/blog/wcag-guidelines-creating-accessibility-in-digital-health-apps) -
  Accessibility guide
- [WCAG for Healthcare Apps - Nuom Health](https://www.nuom.health/insights/wcag-for-healthcare-apps-designing-accessible-digital-health) -
  Compliance requirements
- [UX Design in Healthcare - TechMagic](https://www.techmagic.co/blog/ux-design-in-healthcare) -
  Accessibility components

### Technical Architecture

- [XState - Official Documentation](https://stately.ai/docs/xstate) - State
  machine library
- [XState GitHub](https://github.com/statelyai/xstate) - Source code
- [FHIR JSON Schema - HL7](https://www.hl7.org/fhir/json.html) - Healthcare
  interoperability
- [Map SOAP to HL7 FHIR - FHIR Community](http://community.fhir.org/t/map-subjective-objective-assessment-plan-soap-to-hl7-fhir/637) -
  SOAP mapping discussion
- [Real-Time Collaboration Tool for Healthcare (PDF)](https://www.oaijse.com/VolumeArticles/FullTextPDF/1040_9.Real-Time_Collaboration_Tool_for_Healthcare.pdf) -
  Architecture paper

### AI Documentation Best Practices

- [Common SOAP Note Mistakes - SOAP Note AI](https://www.soapnoteai.com/common-soap-note-mistakes/) -
  Error prevention
- [AI-Assisted SOAP Notes Best Practices - SOAP Note AI](https://www.soapnoteai.com/soap-note-guides-and-example/ai-assisted-documentation/) -
  Implementation guide
- [Generating SOAP Notes with AI - John Snow Labs](https://www.johnsnowlabs.com/generating-soap-notes-with-ai-enhancing-clinical-documentation-efficiency-2/) -
  Technical implementation
- [How to Build SOAP Notes AI Agent - Stack AI](https://www.stack-ai.com/blog/how-to-build-soap-notes-ai-agent) -
  Development guide

### Agent Frameworks

- [AI Agent Orchestration in Healthcare - Medium](https://medium.com/ai-simplified-in-plain-english/ai-agent-orchestration-in-healthcare-a-direct-mistral-approach-for-medical-operations-da1f8c01c98b) -
  Mistral implementation
- [Top AI Agent Frameworks 2025 - Ideas2IT](https://www.ideas2it.com/blogs/ai-agent-frameworks) -
  Framework comparison
- [How to Build AI Agent for Healthcare - Aalpha](https://www.aalpha.net/blog/how-to-build-ai-agent-for-healthcare/) -
  Step-by-step guide
- [AI Agents for Healthcare - LeewayHertz](https://www.leewayhertz.com/ai-agent-for-healthcare/) -
  Applications and implementation

---

## Summary: Key Takeaways for Doctory v2

### SOAP Implementation

1. **Adapt SOAP for pre-consultation** - Focus on Subjective (patient
   self-report) and lightweight Objective (available data) to inform Assessment
   (AI triage) and Plan (routing)
2. **Human review mandatory** - AI generates drafts; clinicians sign and are
   legally responsible
3. **Avoid common pitfalls** - Vague complaints, hallucinations, missing
   pertinent negatives

### Multi-Agent Architecture

1. **Optimal configuration** - 4 specialist agents + 1 supervisor for consensus
2. **Use Kendall's W** - Quantitative consensus measurement
3. **Complexity-based routing** - Simple cases → single agent; complex → full
   MDT simulation
4. **Framework choice** - LangChain for orchestration, consider CrewAI for
   role-based agents

### UX Design

1. **One purpose per screen** - Guide patients through SOAP phases clearly
2. **WCAG 2.1 AA compliance** - Required by May 2026
3. **Emotional design** - Calm visuals, soft colors, reassuring feedback
4. **Mobile-first** - 9mm touch targets, 16px fonts, 4.5:1 contrast

### Technical Architecture

1. **XState for state management** - Visual, predictable, auditable
2. **Parallel agent consultation** - Speed; sequential for dependent decisions
3. **FHIR-compliant data structures** - Future interoperability
4. **WebSocket for real-time** - Agent status updates, consultation progress
