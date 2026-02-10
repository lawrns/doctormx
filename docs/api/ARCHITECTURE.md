# Doctor.mx API Architecture

## System Architecture Overview

```mermaid
graph TB
    Client[Client Application]
    API[Doctor.mx API Gateway]
    Auth[Supabase Auth Service]
    RateLimit[Rate Limiting Service]
    Cache[Redis Cache Layer]

    Client -->|HTTPS| API
    API -->|Session Validation| Auth
    API -->|Check Limits| RateLimit
    API -->|Cache Hit| Cache

    subgraph "API Services"
        API --> PatientAPI[Patient Services]
        API --> DoctorAPI[Doctor Services]
        API --> AI[AI Services]
        API --> Payments[Payment Services]
    end

    subgraph "AI Services"
        AI --> Consult[AI Consultation]
        AI --> Copilot[AI Copilot]
        AI --> Vision[Image Analysis]
        AI --> Transcribe[Audio Transcription]
        AI --> SOAP[SOAP Stream]
    end

    subgraph "External Services"
        Payments --> Stripe[Stripe Payments]
        Payments --> OXXO[OXXO Payments]
        API --> Twilio[Twilio SMS/WhatsApp]
    end

    subgraph "Data Layer"
        PatientAPI --> DB[(Supabase Database)]
        DoctorAPI --> DB
        AI --> VectorDB[(Vector Database)]
        AI --> Knowledge[(Medical Knowledge Base)]
    end

    style API fill:#4CAF50
    style AI fill:#2196F3
    style Payments fill:#FF9800
    style DB fill:#9C27B0
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Supabase
    participant RateLimiter
    participant Resource

    Client->>Supabase: Login Request
    Supabase-->>Client: Session Token (Cookie)

    Client->>API: API Request (with cookie)
    API->>RateLimiter: Check Rate Limit
    RateLimiter-->>API: Limit Status

    alt Rate Limit Exceeded
        API-->>Client: 429 Too Many Requests
    else Within Limits
        API->>Supabase: Validate Session
        Supabase-->>API: User Data + Role

        alt Invalid Session
            API-->>Client: 401 Unauthorized
        else Valid Session
            API->>Resource: Access Resource
            Resource-->>API: Resource Data
            API-->>Client: 200 OK + Data
        end
    end
```

## Rate Limiting Architecture

```mermaid
graph LR
    Request[Incoming Request] --> ID[Get Identifier]
    ID --> Type{Identifier Type}

    Type -->|User ID| UserLimiter[User Rate Limiter]
    Type -->|IP Address| IPLimiter[IP Rate Limiter]
    Type -->|Anonymous| AnonLimiter[Anonymous Limiter]

    UserLimiter --> Tier{User Tier}
    IPLimiter --> Default[Default Limits]
    AnonLimiter --> Default

    Tier -->|Premium| PremiumLimiter[Premium Limits<br/>500 req/min]
    Tier -->|Regular| RegularLimiter[Regular Limits<br/>100 req/min]

    PremiumLimiter --> Check{Check Window}
    RegularLimiter --> Check
    Default --> Check

    Check -->|Under Limit| Allow[Allow Request]
    Check -->|Over Limit| Deny[Deny Request<br/>429 Status]

    style Allow fill:#4CAF50
    style Deny fill:#F44336
```

## AI Consultation Flow

```mermaid
sequenceDiagram
    participant Patient
    participant API
    participant AI
    participant Specialists[4 AI Specialists]
    participant RAG[RAG Engine]
    participant Knowledge[Medical Knowledge]
    participant Database

    Patient->>API: Start Consultation
    API->>AI: Process Request

    AI->>RAG: Retrieve Medical Context
    RAG->>Knowledge: Vector Search
    Knowledge-->>RAG: Relevant Documents
    RAG-->>AI: Augmented Prompt

    par Parallel Specialist Consultation
        AI->>Specialists: Consult GP
        AI->>Specialists: Consult Dermatologist
        AI->>Specialists: Consult Internist
        AI->>Specialists: Consult Psychiatrist
    end

    Specialists-->>AI: Specialist Assessments
    AI->>AI: Build Consensus
    AI->>AI: Generate Treatment Plan

    AI-->>API: Complete Result
    API->>Database: Store Consultation
    Database-->>API: Confirmation
    API-->>Patient: Consultation Result
```

## SOAP Stream Architecture

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant SSE[Server-Sent Events]
    participant Specialists[AI Specialists]
    participant Consensus[Consensus Engine]
    participant Plan[Treatment Planner]

    Client->>API: POST /soap/stream
    API-->>Client: SSE Stream Established

    API->>SSE: event: start
    SSE-->>Client: consultationId, timestamp

    par Run 4 Specialists in Parallel
        API->>Specialists: GP Consultation
        API->>Specialists: Dermatologist
        API->>Specialists: Internist
        API->>Specialists: Psychiatrist
    end

    loop Each Specialist Completes
        Specialists-->>API: Assessment
        API->>SSE: event: specialist_done
        SSE-->>Client: specialist, diagnosis, confidence
    end

    API->>SSE: event: specialists_complete

    API->>Consensus: Build Consensus
    Consensus-->>API: Consensus Result
    API->>SSE: event: consensus_done
    SSE-->>Client: primaryDiagnosis, urgency, agreement

    API->>Plan: Generate Treatment Plan
    Plan-->>API: Treatment Plan
    API->>SSE: event: plan_done
    SSE-->>Client: recommendations, followUp

    API->>SSE: event: complete
    SSE-->>Client: Full consultation data
    API-->>Client: Stream Closed
```

## Payment Processing Flow

```mermaid
sequenceDiagram
    participant Patient
    participant API
    participant Stripe
    participant Webhook
    participant Database
    participant Notifications

    Patient->>API: Create Appointment
    API->>Database: Save Appointment (pending_payment)
    Database-->>API: Appointment ID

    API->>Stripe: Create Payment Intent
    Stripe-->>API: Payment Intent ID + Client Secret
    API-->>Patient: Payment Details

    Patient->>Stripe: Complete Payment
    Stripe-->>Patient: Payment Success/Failure

    Stripe->>Webhook: POST /webhooks/stripe
    Webhook->>Webhook: Verify Signature

    alt Payment Successful
        Webhook->>Database: Update Payment (paid)
        Webhook->>Database: Update Appointment (confirmed)
        Database-->>Webhook: Confirmation

        par Send Notifications
            Webhook->>Notifications: Email Receipt
            Webhook->>Notifications: WhatsApp Confirmation
        end
    else Payment Failed
        Webhook->>Database: Update Payment (failed)
        Webhook->>Database: Update Appointment (cancelled)
        Database-->>Webhook: Confirmation

        Webhook->>Notifications: Failure Notification
    end

    Webhook-->>Stripe: 200 OK
```

## Endpoint Categories & Relationships

```mermaid
graph TD
    API[Doctor.mx API]

    subgraph "Public Endpoints"
        API --> Directory[Directory Services]
        API --> Plans[Subscription Plans]
        API --> Search[Doctor Search]
    end

    subgraph "Patient Endpoints"
        API --> PatientAuth[Patient Auth]
        PatientAuth --> Appts[Appointments]
        PatientAuth --> Profile[Patient Profile]
        PatientAuth --> MedHistory[Medical History]
        PatientAuth --> AIConsult[AI Consultation]
    end

    subgraph "Doctor Endpoints"
        API --> DoctorAuth[Doctor Auth]
        DoctorAuth --> Availability[Availability]
        DoctorAuth --> AICopilot[AI Copilot]
        DoctorAuth --> Prescriptions[Prescriptions]
        DoctorAuth --> ApptsMgmt[Appointment Management]
    end

    subgraph "Admin Endpoints"
        API --> AdminAuth[Admin Auth]
        AdminAuth --> Analytics[Analytics]
        AdminAuth --> DoctorVerify[Doctor Verification]
        AdminAuth --> AIMetrics[AI Metrics]
    end

    subgraph "Webhook Endpoints"
        API --> StripeWebhook[Stripe Webhook]
        API --> TwilioWebhook[Twilio Webhook]
        API --> WhatsAppWebhook[WhatsApp Webhook]
    end

    subgraph "AI Services"
        AIConsult --> Consult[Multi-Specialist Consult]
        AIConsult --> SOAPStream[SOAP Stream]
        AIConsult --> Vision[Image Analysis]
        AIConsult --> Transcribe[Transcription]
        AICopilot --> Diagnosis[Diagnosis Assist]
        AICopilot --> Treatment[Treatment Suggest]
        AICopilot --> Summary[Summary Generate]
    end

    style API fill:#4CAF50
    style PatientAuth fill:#2196F3
    style DoctorAuth fill:#FF9800
    style AdminAuth fill:#F44336
    style AIConsult fill:#9C27B0
```

## Security Layers

```mermaid
graph TB
    Request[Incoming Request]

    Request --> Layer1[Layer 1: CSRF Protection]
    Layer1 -->|Valid| Layer2[Layer 2: Rate Limiting]
    Layer1 -->|Invalid| CSRFError[403 Forbidden]

    Layer2 -->|Within Limit| Layer3[Layer 3: Authentication]
    Layer2 -->|Exceeded| RateError[429 Too Many Requests]

    Layer3 -->|Valid Token| Layer4[Layer 4: Authorization]
    Layer3 -->|Invalid Token| AuthError[401 Unauthorized]

    Layer4 -->|Sufficient| Layer5[Layer 5: Input Validation]
    Layer4 -->|Insufficient| AccessError[403 Forbidden]

    Layer5 -->|Valid| Business[Business Logic]
    Layer5 -->|Invalid| ValidationError[400 Bad Request]

    style CSRFError fill:#F44336
    style RateError fill:#FF9800
    style AuthError fill:#F44336
    style AccessError fill:#F44336
    style ValidationError fill:#FF9800
    style Business fill:#4CAF50
```

## Data Flow: Appointment Booking

```mermaid
stateDiagram-v2
    [*] --> SearchPatient: Patient searches doctors
    SearchPatient --> ViewProfile: View doctor profile
    ViewProfile --> CheckDates: Check available dates
    CheckDates --> ViewSlots: View time slots
    ViewSlots --> CreateAppointment: Select slot & create

    state CreateAppointment {
        [*] --> ValidateRequest
        ValidateRequest --> AuthCheck: Validate session
        AuthCheck --> RateLimitCheck: Check rate limit
        RateLimitCheck --> ValidateInput: Validate input
        ValidateInput --> CheckAvailability: Verify slot available
        CheckAvailability --> ReserveSlot: Reserve slot
    }

    CreateAppointment --> CreatePayment: Create payment intent
    CreatePayment --> AwaitPayment: Wait for payment

    state AwaitPayment {
        [*] --> PollStatus: Poll payment status
        PollStatus --> WebhookEvent: OR wait for webhook
        WebhookEvent --> ProcessPayment: Process payment
    }

    AwaitPayment --> ConfirmAppointment: Payment confirmed
    ConfirmAppointment --> SendNotifications: Send notifications
    SendNotifications --> [*]: Booking complete
```

## Microservices Communication

```mermaid
graph LR
    subgraph "Frontend Layer"
        Web[Web App]
        Mobile[Mobile App]
    end

    subgraph "API Gateway"
        Gateway[Next.js API Routes]
    end

    subgraph "Service Layer"
        PatientSvc[Patient Service]
        DoctorSvc[Doctor Service]
        AISvc[AI Service]
        PaymentSvc[Payment Service]
        NotifySvc[Notification Service]
    end

    subgraph "Data Layer"
        Supabase[(Supabase)]
        Redis[(Redis Cache)]
        Vector[(Vector DB)]
    end

    subgraph "External Services"
        Stripe[Stripe API]
        OpenAI[OpenAI API]
        GLM[GLM API]
        Twilio[Twilio API]
    end

    Web --> Gateway
    Mobile --> Gateway

    Gateway --> PatientSvc
    Gateway --> DoctorSvc
    Gateway --> AISvc
    Gateway --> PaymentSvc
    Gateway --> NotifySvc

    PatientSvc --> Supabase
    PatientSvc --> Redis
    DoctorSvc --> Supabase
    DoctorSvc --> Redis

    AISvc --> Vector
    AISvc --> OpenAI
    AISvc --> GLM

    PaymentSvc --> Stripe
    NotifySvc --> Twilio
```

## Caching Strategy

```mermaid
graph TB
    Request[API Request] --> CacheCheck{Check Cache}

    CacheCheck -->|Hit| ReturnCached[Return Cached Data]
    CacheCheck -->|Miss| FetchDB[Fetch from Database]

    FetchDB --> Process[Process Data]
    Process --> StoreCache[Store in Cache]
    StoreCache --> ReturnData[Return Data]

    ReturnCached --> Response[API Response]
    ReturnData --> Response

    subgraph "Cache Configuration"
        CacheTTL[ TTL: 5-60 minutes ]
        CacheKey[ Key: endpoint:params:userId ]
        CacheInvalidation[ Invalidate on mutations ]
    end

    style ReturnCached fill:#4CAF50
    style FetchDB fill:#FF9800
    style Response fill:#2196F3
```

---

## Architecture Notes

### Scalability
- Stateless API design
- Horizontal scaling ready
- Database connection pooling
- CDN for static assets

### Reliability
- Automatic retries with exponential backoff
- Graceful degradation for rate limiting
- Idempotent webhook processing
- Health check endpoints

### Performance
- Redis caching layer
- Database query optimization
- Parallel AI specialist queries
- Streaming responses (SSE)

### Security
- Defense in depth (5 layers)
- Regular security audits
- Dependency updates
- Secrets management

### Monitoring
- Rate limit tracking
- API response times
- Error rate monitoring
- Webhook delivery tracking

---

**Last Updated**: 2026-02-09
**API Version**: 1.0.0
