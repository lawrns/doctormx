# DOCTORMX TEAM-ORIENTED GIANT EXECUTION PLAN
## Agent Teams Workflow with Task Assignments by Specialist

> **Date:** 2026-02-09
> **Council Approval:** APPROVED WITH CONDITIONS (Quality > Time/Effort)
> **Quality Standard:** Stripe-level excellence, patient safety first

---

## AGENT TEAM STRUCTURE

| Role | Worktree | Branch | Responsibilities | Lead |
|------|----------|--------|------------------|------|
| **Coordinator** | ~/doctormx | `main` | Orchestration, merges, coordination | You |
| **Frontend Specialist** | ~/doctormx/worktrees/frontend | `feature/frontend-work` | UI/UX, components, pages, mobile | Assigned |
| **Backend Specialist** | ~/doctormx/worktrees/backend | `feature/backend-work` | Business logic, APIs, integrations | Assigned |
| **Database Specialist** | ~/doctormx/worktrees/database | `feature/database-work` | Schema, migrations, tests, infra | Assigned |
| **AI/ML Specialist** | ~/doctormx/worktrees/ai | `feature/ai-work` | AI features, prompts, LLMs, clinical tools | Assigned |

---

## FILE OWNERSHIP MATRIX

### Frontend Specialist (~/doctormx/worktrees/frontend)
```
OWNED FILES (exclusive access):
src/components/          # All UI components
src/app/                # All pages EXCEPT /api
  ├── admin/            # Admin dashboard pages
  ├── ai-consulta/      # AI consultation UI
  ├── app/              # Patient dashboard
  ├── auth/             # Auth pages
  ├── book/             # Booking flow pages
  ├── chat/             # Chat UI
  ├── consultation/     # Video consultation UI
  ├── doctor/           # Doctor portal
  └── doctors/          # Doctor discovery
public/                 # Static assets

NO TOUCH:
src/lib/                # Business logic (Backend)
src/app/api/            # API routes (Backend)
supabase/              # Database (Database)
```

### Backend Specialist (~/doctormx/worktrees/backend)
```
OWNED FILES (exclusive access):
src/lib/                # All business logic modules
  ├── appointments.ts
  ├── availability.ts
  ├── booking.ts
  ├── cache.ts
  ├── chat.ts
  ├── doctors.ts
  ├── followup.ts
  ├── notifications.ts
  ├── offline-notes.ts
  ├── patient.ts
  ├── payment.ts
  ├── premium-features.ts
  ├── prescriptions.ts
  ├── rate-limit.ts
  ├── reviews.ts
  ├── subscription.ts
  └── video.ts
src/app/api/            # All API routes
src/hooks/              # Custom hooks

NO TOUCH:
src/components/         # UI (Frontend)
supabase/              # Database (Database)
src/lib/ai/             # AI logic (AI Specialist)
```

### Database Specialist (~/doctormx/worktrees/database)
```
OWNED FILES (exclusive access):
supabase/              # Database migrations & schema
  ├── migrations/
  └── FULL_SCHEMA.sql
src/lib/supabase/      # Supabase client utilities
src/lib/auth.ts        # Authentication utilities
src/lib/validation/    # Input validation schemas
tests/                 # All test files
  ├── unit/           # Unit tests (Vitest)
  ├── e2e/            # E2E tests (Playwright)
  └── __tests__/      # Component tests
Infrastructure configs:
  - next.config.ts
  - vite.config.js
  - tsconfig.json
  - tailwind.config.ts
  - .env.example

NO TOUCH:
src/components/         # UI (Frontend)
src/app/                # Pages (Frontend)
src/lib/ (except supabase, auth, validation)  # Logic (Backend)
```

### AI/ML Specialist (~/doctormx/worktrees/ai)
```
OWNED FILES (exclusive access):
src/lib/ai/            # All AI/ML logic
  ├── adaptive-questionnaire/
  ├── client.ts
  ├── confidence.ts
  ├── copilot.ts
  ├── prompts/
  ├── router.ts
  ├── soap/
  ├── triage/
  └── vision/
src/app/ai-consulta/   # AI consultation pages (shared with Frontend)
src/app/chat/          # Chat-related pages (shared with Frontend)
Clinical AI components:
  - src/components/ClinicalCopilot.tsx
  - src/components/AdaptiveQuestionnaire.tsx
  - src/components/soap/ (all SOAP components)

NO TOUCH:
src/lib/ (except ai/)  # Other business logic (Backend)
src/components/ (except clinical AI)  # Other UI (Frontend)
supabase/             # Database (Database)
```

---

## COLLABORATION PROTOCOL

### Task Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    COORDINATOR (LEAD)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Create Task in shared task list                         │ │
│  │ 2. Assign to specific specialist                          │ │
│  │ 3. Set dependencies if needed                              │ │
│  │ 4. Set priority (CRITICAL/HIGH/MEDIUM/LOW)                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐          │
│  │   Frontend   │  │    Backend    │  │   Database   │          │
│  │  Specialist  │  │  Specialist   │  │  Specialist  │          │
│  └─────────────┘  └──────────────┘  └─────────────┘          │
│                                                              │
│  Each works in their worktree, owns their files            │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐          │
│  │     AI/ML    │  │              │  │              │          │
│  │  Specialist  │  │              │  │              │          │
│  └─────────────┘  └──────────────┘  └─────────────┘          │
│                                                              │
│  When task complete:                                        │
│  1. Mark task "in_progress" → "completed"                   │
│  2. Message Coordinator: "Task X complete, ready for review" │
│  3. Coordinator reviews, may request changes               │
│  4. If approved, task marked fully complete                │
│  5. Dependent tasks unblocked automatically                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Management

**Example:**
```
Task A (Frontend): "Add skeleton screens for appointment list"
  └─> depends on: Task B (Database): "Add pagination to appointments API"

Task B must complete BEFORE Task A can start.
Frontend Specialist waits for Database Specialist to finish.
```

### Merge Protocol

1. **Specialist completes task in their worktree**
2. **Commits to feature branch** (e.g., `feature/frontend-work`)
3. **Messages Coordinator** with pull request
4. **Coordinator reviews** and tests
5. **If approved**: Coordinator merges to `main`
6. **All worktrees update** with `git pull`
7. **Task marked complete** in shared task list

### Conflict Resolution

```
If multiple specialists need the same file:
1. Coordinator creates SHARED task
2. Coordinates collaboration (pair programming or sequential)
3. Example: AI consultation page needs both Frontend + AI/ML
   - AI/ML handles AI integration, prompts
   - Frontend handles UI, states, transitions
   - They coordinate through shared interface
```

---

## GIANT EXECUTION PLAN BY PHASE

## PHASE 0: FOUNDATION CLEANUP (1-2 weeks)
**BLOCKER: Cannot proceed to production until complete**
**Goal: Eliminate CRITICAL security vulnerabilities, establish testing foundation**

### Week 1: Security & Critical Fixes (5 days)

#### Task F001: Rotate ALL Exposed API Keys
- **Assignee:** Coordinator (security-critical)
- **Effort:** 4 hours
- **Priority:** CRITICAL
- **Dependencies:** None
**Steps:**
1. Delete `.env` from git history
2. Generate new OpenAI API key
3. Generate new Supabase service role key
4. Generate new Redis credentials
5. Update all environment variables
6. Verify no secrets in code

**Acceptance:** No API keys in code, all secrets in environment

---

#### Task F002: Remove Service Role Key from Client Code
- **Assignee:** Backend Specialist
- **Files:** `src/lib/ai/adaptive-questionnaire/service.ts:24-39`
- **Effort:** 8 hours
- **Priority:** CRITICAL
- **Dependencies:** None
**Code Changes:**
```typescript
// BEFORE (client-accessible):
import { createServiceClient } from '@/lib/supabase/server'

// AFTER (server-only API route):
// src/app/api/ai/questionnaire/route.ts
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: Request) {
  // Verify user first
  const { user } = await requireAuth()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Then use service role with explicit authorization
  const serviceSupabase = createServiceClient()
  const { data } = await serviceSupabase
    .from('patient_responses')
    .select('*')
    .eq('user_id', user.id) // Always filter by user
  return Response.json({ data })
}
```

**Acceptance:** Service role only in server-only routes

---

#### Task F003: Implement File Upload Security
- **Assignee:** Backend Specialist
- **Files:** `src/app/api/ai/vision/analyze/route.ts:166-183`
- **Effort:** 4 hours
- **Priority:** CRITICAL
- **Dependencies:** None
**Code Changes:**
```typescript
// Add to src/lib/file-security.ts
export async function validateFileUpload(
  file: File,
  options: {
    maxSizeBytes: number
    allowedTypes: string[]
    allowedExtensions: string[]
  }
): Promise<{ valid: boolean; error?: string }> {
  // Size check
  if (file.size > options.maxSizeBytes) {
    return { valid: false, error: `File too large. Maximum: ${options.maxSizeBytes / 1024 / 1024}MB` }
  }

  // Extension check
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!options.allowedExtensions.includes(ext)) {
    return { valid: false, error: `Invalid file type. Allowed: ${options.allowedExtensions.join(', ')}` }
  }

  // Magic number verification
  const buffer = await file.arrayBuffer()
  const uint8 = new Uint8Array(buffer)

  // Check magic numbers for images
  const magicNumbers = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47]
  }

  // Verify file type matches extension
  for (const [type, magic] of Object.entries(magicNumbers)) {
    if (options.allowedTypes.includes(type)) {
      const match = magic.every((val, i) => uint8[i] === val)
      if (match && !file.type.includes(type.split('/')[1])) {
        return { valid: false, error: 'File content does not match extension' }
      }
    }
  }

  return { valid: true }
}

// Use in API route:
const validation = await validateFileUpload(file, {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
})

if (!validation.valid) {
  return NextResponse.json({ error: validation.error }, { status: 400 })
}
```

**Acceptance:** Files validated for size, type, and magic numbers

---

#### Task F004: Fix XSS Vulnerabilities
- **Assignee:** Frontend Specialist
- **Files:** `src/app/doctor/[specialty]/page.tsx:120-130`
- **Effort:** 4 hours
- **Priority:** CRITICAL
- **Dependencies:** None
**Code Changes:**
```typescript
// Add to package.json:
// "dompurify": "^3.0.9"

// Use in component:
import DOMPurify from 'dompurify'

// Sanitize all user input
const sanitizedSpecialty = DOMPurify.sanitize(specialtyName)
const sanitizedCity = DOMPurify.sanitize(cityName)

// For structured data:
const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'MedicalSpecialty',
  name: sanitizedSpecialty
}
```

**Acceptance:** All user input sanitized, no dangerouslySetInnerHTML without sanitization

---

#### Task F005: Fix Mobile Patient Navigation
- **Assignee:** Frontend Specialist
- **Files:** `src/components/PatientLayout.tsx:172`
- **Effort:** 4 hours
- **Priority:** CRITICAL (affects 70%+ of users)
**Code Changes:**
```typescript
// BEFORE:
<div className="hidden lg:flex"> {/* sidebar completely hidden on mobile */}

// AFTER: Add slide-out menu
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header with menu button */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
        <h1 className="text-lg font-semibold">Doctormx</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            {/* Nav items here */}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col">
        {/* Sidebar content */}
      </aside>
    </div>
  )
}
```

**Acceptance:** Mobile navigation functional, slide-out menu works

---

### Week 2: Testing & Type Safety (5 days)

#### Task D001: Webhook Testing Suite
- **Assignee:** Database Specialist (testing focus)
- **Files:** Create `src/app/api/__tests__/webhooks/stripe.test.ts`
- **Effort:** 16 hours
- **Priority:** CRITICAL
- **Dependencies:** None
**Test Coverage:**
```typescript
// src/app/api/__tests__/webhooks/stripe.test.ts
import { POST } from '../stripe/route'
import { createMocks } from 'node-mocks-http'

describe('Stripe Webhook', () => {
  describe('Signature verification', () => {
    it('should reject requests without valid signature', async () => {
      const request = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid_signature'
        },
        body: JSON.stringify({ type: 'payment_intent.succeeded' })
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should accept requests with valid signature', async () => {
      // Test with valid signature
    })
  })

  describe('Idempotency', () => {
    it('should not process duplicate webhook events', async () => {
      // First call should succeed
      // Second call with same id should return 200 but not process again
    })
  })

  describe('Payment intent success', () => {
    it('should update appointment status on payment success', async () => {
      // Test appointment status update
    })

    it('should send confirmation notification', async () => {
      // Test notification sent
    })
  })

  describe('OXXO payment', () => {
    it('should handle OXXO payment method', async () => {
      // Test OXXO-specific logic
    })
  })
})
```

**Acceptance:** 90%+ coverage of webhook scenarios

---

#### Task D002: Video Service Tests
- **Assignee:** Database Specialist (testing focus)
- **Files:** Create `src/lib/video/__tests__/videoService.test.ts`
- **Effort:** 8 hours
- **Priority:** CRITICAL
**Test Coverage:**
```typescript
describe('VideoService', () => {
  describe('Room creation', () => {
    it('should create video room with proper expiration', async () => {
      const room = await createVideoRoom({
        appointmentId: 'apt_123',
        patientId: 'patient_456',
        doctorId: 'doctor_789'
      })
      expect(room.expiresAt).toBeDefined()
      expect(room.expiresAt).toBeLessThanOrEqual(new Date(Date.now() + 3600000))
    })
  })

  describe('Token generation', () => {
    it('should generate patient token with read-only access', async () => {
      const token = await generatePatientToken('room_123', 'patient_456')
      expect(token).toBeDefined()
      // Verify token has correct permissions
    })

    it('should generate doctor token with full access', async () => {
      const token = await generateDoctorToken('room_123', 'doctor_789')
      expect(token).toBeDefined()
    })
  })

  describe('Status updates', () => {
    it('should update video status on join', async () => {
      await updateVideoStatus('room_123', 'JOINED', 'patient_456')
      // Verify status updated
    })
  })
})
```

**Acceptance:** All video service functions tested

---

#### Task D003: Emergency AI Triage Tests
- **Assignee:** AI/ML Specialist (testing focus)
- **Files:** Create `src/app/api/__tests__/ai/consult-emergency.test.ts`
- **Effort:** 8 hours
- **Priority:** CRITICAL (patient safety)
**Test Coverage:**
```typescript
describe('Emergency AI Triage', () => {
  const emergencySymptoms = [
    'chest pain',
    'difficulty breathing',
    'severe bleeding',
    'loss of consciousness',
    'slurred speech',
    'sudden severe headache'
  ]

  emergencySymptoms.forEach(symptom => {
    it(`should detect "${symptom}" as emergency`, async () => {
      const result = await analyzeTriage(symptom)
      expect(result.urgencyLevel).toBe('EMERGENCY')
      expect(result.recommendation).toContain('emergency services')
    })
  })

  it('should route to emergency immediately', async () => {
    const result = await analyzeTriage('chest pain and shortness of breath')
    expect(result.routing).toBe('EMERGENCY_SERVICES')
    expect(responseTime).toBeLessThan(120000) // 2 minutes
  })
})
```

**Acceptance:** All emergency symptoms correctly detected

---

#### Task T001: Replace `any` Types in Critical Paths
- **Assignee:** Backend Specialist (type safety focus)
- **Files:** Multiple files with `any` in critical paths
- **Effort:** 16 hours
- **Priority:** HIGH
**Specific Files:**
```typescript
// src/lib/ai/client.ts:120,228,300
// BEFORE:
const client = (provider as unknown as any) as AIClient

// AFTER:
type AIClient = OpenAI | AnthropicClient
function createAIClient(provider: 'openai' | 'anthropic'): AIClient {
  if (provider === 'openai') return new OpenAI()
  return new AnthropicClient()
}

// src/lib/encryption.ts:247,254
// BEFORE:
(cipher as any).setAAD(buffer)
(decipher as any).setAuthTag(buffer)

// AFTER:
interface AuthenticatedCipher extends Cipher {
  setAAD(buffer: Buffer): void
  getAuthTag(): Buffer
}

// src/app/api/webhooks/whatsapp/route.ts:50
// BEFORE:
async function processMessage(message: any)

// AFTER:
interface WhatsAppMessage {
  from: string
  id: string
  type: 'text' | 'image' | 'document'
  text?: { body: string }
  image?: { id: string; caption?: string }
}
async function processMessage(message: WhatsAppMessage)
```

**Acceptance:** No `any` types in critical paths

---

#### Task T002: Add Composite Database Indexes
- **Assignee:** Database Specialist
- **Files:** Create migration file in `supabase/migrations/`
- **Effort:** 4 hours
- **Priority:** HIGH (performance)
**Migration:**
```sql
-- supabase/migrations/YYYYMMDDXXXX_add_performance_indexes.sql

-- Appointments: doctor_id + start_ts (for availability checks)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_start
ON appointments(doctor_id, start_ts DESC);

-- Appointments: patient_id + start_ts (for patient history)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_start
ON appointments(patient_id, start_ts DESC);

-- Chat messages: conversation_id + created_at (for pagination)
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
ON chat_messages(conversation_id, created_at DESC);

-- Profiles: role + created_at (for metrics)
CREATE INDEX IF NOT EXISTS idx_profiles_role_created
ON profiles(role, created_at DESC);

-- Medical image analyses: patient_id + created_at (for history)
CREATE INDEX IF NOT EXISTS idx_medical_images_patient_created
ON medical_image_analyses(patient_id, created_at DESC);

-- Chat message receipts: message_id + user_id (for read tracking)
CREATE INDEX IF NOT EXISTS idx_chat_receipts_message_user
ON chat_message_receipts(message_id, user_id);
```

**Acceptance:** All composite indexes created, queries 60%+ faster

---

## PHASE 1: CORE FEATURES TO SUPERIORITY (3-4 weeks)

### Week 3: Performance & Code Quality

#### Task C001: Replace All Console Statements with Logger
- **Assignee:** Clean Code Specialist (Backend + Frontend)
- **Files:** 50+ files with console statements
- **Effort:** 8 hours
- **Priority:** HIGH
**Code Pattern:**
```typescript
// BEFORE:
console.log('User logged in:', user)
console.error('Error fetching appointments:', error)
console.warn('Missing configuration:', config)

// AFTER:
import { logger } from '@/lib/observability/logger'

logger.info('User logged in', { userId: user.id, email: user.email })
logger.error('Error fetching appointments', { error, userId: user.id })
logger.warn('Missing configuration', { missingKeys: Object.keys(config).filter(k => !config[k]) })
```

**Acceptance:** Zero console.log/warn in production code

---

#### Task C002: Extract Constants File for Magic Numbers
- **Assignee:** Clean Code Specialist (Backend)
- **Files:** Multiple files with magic numbers
- **Effort:** 4 hours
**Create:**
```typescript
// src/lib/constants/pricing.ts
export const PRICING = {
  CONSULTATION_SINGLE_MXN: 499,
  CONSULTATION_SINGLE_USD: 29,
  SUBSCRIPTION_6_MONTHS_MXN: 1999,
  SUBSCRIPTION_6_MONTHS_USD: 117,
  PLATFORM_FEE_PERCENT: 0.40,
} as const

// src/lib/constants/time.ts
export const TIME = {
  VIDEO_ROOM_EXPIRATION_MS: 3600000, // 1 hour
  APPOINTMENT_DURATION_MIN: 30,
  APPOINTMENT_BUFFER_MIN: 15,
  TOKEN_EXPIRATION_MS: 7200000, // 2 hours
} as const

// src/lib/constants/ai.ts
export const AI = {
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  EMERGENCY_SYMPTOMS: ['chest pain', 'difficulty breathing', /* ... */],
} as const
```

**Acceptance:** No magic numbers in code

---

#### Task P001: Parallelize Analytics Queries
- **Assignee:** Backend Specialist
- **Files:** `src/lib/analytics.ts:112-230`
- **Effort:** 4 hours
**Code Changes:**
```typescript
// BEFORE: Sequential queries
const doctorResult = await getDoctorCount()
const patientResult = await getPatientCount()
const appointmentResult = await getAppointmentCount()

// AFTER: Parallel queries
const [doctorResult, patientResult, appointmentResult] = await Promise.all([
  getDoctorCount(),
  getPatientCount(),
  getAppointmentCount()
])
```

**Acceptance:** Analytics queries 75%+ faster

---

#### Task P002: Optimize Chat Conversations (N+1 Fix)
- **Assignee:** Backend Specialist
- **Files:** `src/lib/chat.ts:131-207`
- **Effort:** 4 hours
**Code Changes:**
```typescript
// BEFORE: Multiple sequential queries
const conversations = await getConversations(userId)
for (const conv of conversations) {
  conv.patient = await getPatientProfile(conv.patient_id)
  conv.doctor = await getDoctorProfile(conv.doctor_id)
  conv.unread = await getUnreadCount(conv.id)
}

// AFTER: Single query with joins
const conversations = await supabase
  .from('chat_conversations as c')
  .select(`
    c.*,
    p.full_name as patient_name,
    p.photo_url as patient_photo,
    dp.full_name as doctor_name,
    dp.photo_url as doctor_photo,
    COUNT(cm.id) FILTER (WHERE cm.read_at IS NULL AND cm.sender_id != c.patient_id) as unread_count
  `)
  .leftJoin('profiles as p', 'c.patient_id', 'p.id')
  .leftJoin('doctors as d', 'c.doctor_id', 'd.id')
  .leftJoin('profiles as dp', 'd.user_id', 'dp.id')
  .leftJoin('chat_messages as cm', 'c.id', 'cm.conversation_id')
  .eq('c.patient_id', userId)
  .group('c.id')
```

**Acceptance:** Chat loading 80%+ faster

---

#### Task P003: Implement Vision Result Caching
- **Assignee:** AI/ML Specialist
- **Files:** `src/app/api/ai/vision/analyze/route.ts`
- **Effort:** 4 hours
**Code Changes:**
```typescript
import crypto from 'crypto'
import { cache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // Generate content-based hash
  const buffer = await file.arrayBuffer()
  const imageHash = crypto.createHash('sha256').update(buffer).digest('hex')

  // Check cache
  const cacheKey = `vision:medical:${imageHash}`
  const cached = await cache.get(cacheKey)

  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { 'X-Cache': 'HIT' }
    })
  }

  // Process with AI
  const result = await analyzeImage(buffer)

  // Cache for 1 hour
  await cache.set(cacheKey, JSON.stringify(result), 3600)

  return NextResponse.json(result, {
    headers: { 'X-Cache': 'MISS' }
  })
}
```

**Acceptance:** Duplicate images return in 50-100ms

---

### Week 4: UX Improvements

#### Task UX001: Map Technical Errors to User-Friendly Messages
- **Assignee:** Frontend Specialist
- **Files:** Multiple API response handlers
- **Effort:** 8 hours
**Create:**
```typescript
// src/lib/errors/user-messages.ts
export function getUserMessage(error: Error): string {
  const errorMap = {
    'service_unavailable': 'El servicio no está disponible. Por favor intenta más tarde.',
    'insufficient_balance': 'No tienes saldo suficiente. Recarga tu cuenta.',
    'no_api_key': 'Error de configuración. Contacta a soporte.',
    'rate_limit_exceeded': 'Has excedido el límite de consultas. Espera unos minutos.',
    'network_error': 'Error de conexión. Verifica tu internet.',
    'payment_failed': 'El pago no pudo ser procesado. Intenta con otro método.',
  }

  // Return user-friendly message or generic fallback
  return errorMap[error.message] || 'Ha ocurrido un error. Por favor intenta de nuevo.'
}

// Use in components:
try {
  await bookAppointment(data)
} catch (error) {
  setError(getUserMessage(error))
}
```

**Acceptance:** All error messages user-friendly

---

#### Task UX002: Add Success Feedback for Forms
- **Assignee:** Frontend Specialist
- **Files:** Booking form, registration form
- **Effort:** 4 hours
**Code Pattern:**
```typescript
// AFTER form submission success:
const { toast } = await import('@/components/ui/use-toast')
toast({
  title: '¡Cita agendada!',
  description: `Tu consulta está programada para ${format(appointment.date)} a las ${format(appointment.time)}`,
  action: <ToastAction altText="Agregar a calendario">Agregar a calendario</ToastAction>,
})
```

**Acceptance:** All form submissions show success feedback

---

#### Task UX003: Implement Network Fallback for Video
- **Assignee:** Frontend Specialist + Backend Specialist
- **Files:** `src/app/app/appointments/[id]/video/page.tsx`
- **Effort:** 8 hours
**Code Changes:**
```typescript
// Add network quality detection
const [networkQuality, setNetworkQuality] = useState<'good' | 'poor' | 'offline'>('good')

useEffect(() => {
  // Monitor connection quality
  const checkConnection = async () => {
    const connection = navigator.connection || (navigator as any).webkitConnection
    if (connection) {
      const isPoor = connection.effectiveType === '2g' || connection.downlink < 0.5
      setNetworkQuality(isPoor ? 'poor' : 'good')
    }
  }

  checkConnection()
  const interval = setInterval(checkConnection, 5000)
  return () => clearInterval(interval)
}, [])

// Render fallback options for poor connections
return (
  <div>
    {networkQuality === 'poor' && (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <AlertTriangle className="h-6 w-6 text-yellow-400" />
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Conexión lenta detectada</strong>
            </p>
            <p className="text-sm text-yellow-700">
              Opciones disponibles:
            </p>
            <div className="mt-2 space-y-2">
              <button className="block w-full text-left px-4 py-2 bg-white border rounded-md hover:bg-yellow-50">
                📞 Llamada de audio solo
              </button>
              <button className="block w-full text-left px-4 py-2 bg-white border rounded-md hover:bg-yellow-50">
                💬 Chat con el doctor
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {networkQuality === 'offline' && (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        Sin conexión a internet. Verifica tu conexión e intenta nuevamente.
      </div>
    )}

    {/* Video call interface */}
    {networkQuality === 'good' && <VideoRoom />}
  </div>
)
```

**Acceptance:** Video calls work even on poor connections

---

#### Task UX004: Show Doctor Verification Queue Position
- **Assignee:** Frontend Specialist
- **Files:** `src/components/DoctorLayout.tsx:17-28`
- **Effort:** 4 hours
**Code Changes:**
```typescript
// Fetch queue position
const { position, total } = await getVerificationQueuePosition(user.id)

// Display progress
<div className="bg-blue-50 border-l-4 border-blue-400 p-4">
  <div className="flex">
    <Clock className="h-6 w-6 text-blue-400" />
    <div className="ml-3">
      <p className="text-sm text-blue-700">
        <strong>Tu verificación está en proceso</strong>
      </p>
      <p className="text-sm text-blue-700">
        Posición en la cola: <strong>{position} de {total}</strong>
      </p>
      <p className="text-sm text-blue-600">
        Tiempo estimado: {Math.ceil(total / 10)} días hábiles
      </p>
    </div>
  </div>

  <div className="mt-4">
    <h3 className="text-sm font-medium text-gray-700">Mientras tanto:</h3>
    <ul className="mt-2 space-y-2">
      <li className="text-sm text-gray-600">✓ Completa tu perfil profesional</li>
      <li className="text-sm text-gray-600">✓ Sube tu documentación</li>
      <li className="text-sm text-gray-600">✓ Revisa los recursos de formación</li>
    </ul>
  </div>
</div>
```

**Acceptance:** Doctors see clear queue status

---

### Week 5: Advanced Testing & Compliance

#### Task D004: Authentication Integration Tests
- **Assignee:** Database Specialist
- **Files:** Create `src/lib/__tests__/auth-integration.test.ts`
- **Effort:** 8 hours
**Test Coverage:**
```typescript
describe('Authentication Integration', () => {
  it('should redirect unauthenticated users to login', async () => {
    // Test redirect
  })

  it('should requireRole for admin pages', async () => {
    // Test role enforcement
  })

  it('should handle session expiration', async () => {
    // Test logout on expiration
  })
})
```

**Acceptance:** Auth flows fully tested

---

#### Task D005: Prescription PDF Generation Tests
- **Assignee:** Database Specialist
- **Files:** Create `src/lib/prescriptions/__tests__/pdf.test.ts`
- **Effort:** 8 hours
**Test Coverage:**
```typescript
describe('Prescription PDF', () => {
  it('should generate PDF with valid format', async () => {
    const pdf = await generatePrescriptionPdf(mockPrescription)
    expect(pdf).toBeDefined()
    expect(pdf.buffer).toBeInstanceOf(Buffer)
  })

  it('should include all required fields', async () => {
    // Check for cédula, patient data, medications, signature
  })

  it('should upload to Supabase storage', async () => {
    // Test upload functionality
  })
})
```

**Acceptance:** PDF generation tested

---

#### Task COMP001: Draft Privacy Notice (Aviso de Privacidad)
- **Assignee:** Coordinator + Legal review
- **Files:** Create `PRIVACY_NOTICE.md` (Spanish)
- **Effort:** 4 hours
**Content:**
```markdown
# AVISO DE PRIVACIDAD

Doctormx se compromete a proteger y respetar tus datos personales.

## DATOS QUE RECOLECTAMOS
- Datos de identificación (nombre, email, teléfono)
- Datos de salud (síntomas, historial médico)
- Datos de pago (tarjeta, OXXO, SPEI)
- Datos de consultas (video, chat, notas)

## FINALIDAD DEL TRATAMIENTO
- Proveer servicios médicos a distancia
- Gestionar citas y pagos
- Enviar recordatorios y notificaciones
- Mejorar nuestros servicios

## DERECHOS ARCO
- Acceso: Solicitar copia de tus datos
- Rectificación: Corregir información inexacta
- Cancelación: Eliminar tus datos cuando ya no sean necesarios
- Oposición: Oponerte al uso de tus datos

## MEDIDAS DE SEGURIDAD
- Encriptación de datos
- Control de acceso
- Auditoría de acceso
- Cumplimos LFPDPPP y NOM-004/NOM-024

## CONTACTO
Para ejercer tus derechos: privacidad@doctormx.mx
```

**Acceptance:** Privacy notice compliant with LFPDPPP

---

#### Task COMP002: Implement Consent Mechanisms
- **Assignee:** Backend Specialist + Frontend Specialist
- **Files:** Registration flow, settings page
- **Effort:** 8 hours
**Code Changes:**
```typescript
// Add consent checkbox to registration
<div className="flex items-start">
  <input
    id="consent"
    type="checkbox"
    required
    className="mt-1"
  />
  <label htmlFor="consent" className="ml-2 text-sm text-gray-600">
    Acepto el <a href="/privacidad" className="underline">Aviso de Privacidad</a> y autorizo
    el tratamiento de mis datos de salud para servicios de telemedicina.
  </label>
</div>

// Store consent in database
const { data, error } = await supabase
  .from('user_consents')
  .insert({
    user_id: user.id,
    privacy_notice_accepted: true,
    health_data_consent: true,
    consented_at: new Date().toISOString(),
    ip_address: request.headers.get('x-forwarded-for')
  })
```

**Acceptance:** Consent mechanisms implemented

---

## PHASE 2: ADVANCED EXCELLENCE (2-3 weeks)

### Week 6: Architecture Improvements

#### Task A001: Implement Standardized Error Response Format
- **Assignee:** Backend Specialist
- **Files:** Create `src/lib/api/response.ts`, apply to all routes
- **Effort:** 8 hours
**Code:**
```typescript
// src/lib/api/response.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export function success<T>(data: T): Result<T> {
  return { success: true, data }
}

export function error<E extends Error>(error: E): Result<never, E> {
  return { success: false, error }
}

export async function handleResponse<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const data = await promise
    return success(data)
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    logger.error('Operation failed', { error })
    return error(error)
  }
}

// Use in API routes:
export async function GET(request: NextRequest) {
  const result = await handleResponse(getAppointments(request))

  if (!result.success) {
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: result.data })
}
```

**Acceptance:** All API routes use standardized format

---

#### Task A002: Create VideoProvider Interface
- **Assignee:** Backend Specialist
- **Files:** `src/lib/video/providers/types.ts`
- **Effort:** 8 hours
**Code:**
```typescript
// src/lib/video/providers/types.ts
export interface VideoRoom {
  id: string
  url: string
  createdAt: Date
  expiresAt: Date
}

export interface VideoToken {
  token: string
  userId: string
  room: string
}

export interface VideoProvider {
  createRoom(options: VideoRoomOptions): Promise<VideoRoom>
  createToken(roomId: string, userId: string, role: 'patient' | 'doctor'): Promise<VideoToken>
  endRoom(roomId: string): Promise<void>
  getStatus(roomId: string): Promise<VideoRoomStatus>
}

// Daily.co implementation
export class DailyCoProvider implements VideoProvider {
  async createRoom(options: VideoRoomOptions): Promise<VideoRoom> {
    // Daily.co specific implementation
  }

  async createToken(roomId: string, userId: string, role: string): Promise<VideoToken> {
    // Daily.co token generation
  }
}

// Usage with dependency injection
const provider: VideoProvider = new DailyCoProvider()
const room = await provider.createRoom({ appointmentId: 'apt_123' })
```

**Acceptance:** Video service uses provider interface

---

#### Task A003: Refactor AI Router (Factory Pattern)
- **Assignee:** AI/ML Specialist
- **Files:** `src/lib/ai/router.ts`
- **Effort:** 8 hours
**Code:**
```typescript
// src/lib/ai/providers/types.ts
export interface AIProvider {
  name: string
  analyzeSymptoms(symptoms: string[], context: PatientContext): Promise<AIResponse>
  generateSOAP(notes: string[]): Promise<SOAPNote>
  estimateConfidence(diagnosis: string): Promise<ConfidenceScore>
}

// src/lib/ai/providers/openai.ts
export class OpenAIProvider implements AIProvider {
  name = 'openai'
  async analyzeSymptoms(symptoms: string[], context: PatientContext): Promise<AIResponse> {
    // OpenAI implementation
  }
}

// src/lib/ai/providers/anthropic.ts
export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  async analyzeSymptoms(symptoms: string[], context: PatientContext): Promise<AIResponse> {
    // Anthropic implementation
  }
}

// src/lib/ai/factory.ts
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map()

  static getProvider(name: string): AIProvider {
    if (!this.providers.has(name)) {
      switch (name) {
        case 'openai':
          this.providers.set(name, new OpenAIProvider())
          break
        case 'anthropic':
          this.providers.set(name, new AnthropicProvider())
          break
        default:
          throw new Error(`Unknown AI provider: ${name}`)
      }
    }
    return this.providers.get(name)!
  }
}

// Usage:
const provider = AIProviderFactory.getProvider('openai')
const response = await provider.analyzeSymptoms(symptoms, context)
```

**Acceptance:** AI routing uses factory pattern

---

### Week 7: Polish & Validation

#### Task Q001: Add Dark Mode Toggle
- **Assignee:** Frontend Specialist
- **Files:** Settings page, theme provider
- **Effort:** 4 hours
**Code:**
```typescript
// src/components/ThemeProvider.tsx
import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Usage in settings:
const { theme, setTheme } = useTheme()
<div className="flex items-center gap-4">
  <button onClick={() => setTheme('light')}>☀️ Claro</button>
  <button onClick={() => setTheme('dark')}>🌙 Oscuro</button>
  <button onClick={() => setTheme('system')}>💻 Sistema</button>
</div>
```

**Acceptance:** Dark mode toggle functional

---

#### Task Q002: Implement Keyboard Navigation
- **Assignee:** Frontend Specialist
- **Files:** Modal, dropdown, interactive components
- **Effort:** 8 hours
**Code:**
```typescript
// src/components/Modal.tsx
import { useEffect } from 'react'
import { FocusTrap } from '@radix-ui/react-focus-trap'

export function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      const focusable = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const first = focusable[0] as HTMLElement
      first?.focus()

      // Trap focus
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusable = document.querySelectorAll('[tabindex]:not([tabindex="-1"])')
          const first = focusable[0] as HTMLElement
          const last = focusable[focusable.length - 1] as HTMLElement

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTab)
      return () => document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

  return (
    <FocusTrap disabled={!isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Modal content */}
      </div>
    </FocusTrap>
  )
}
```

**Acceptance:** Full keyboard navigation works

---

#### Task Q003: Add Comprehensive JSDoc Documentation
- **Assignee:** Clean Code Specialist (all specialists)
- **Files:** Functions >20 lines without documentation
- **Effort:** 8 hours
**Code:**
```typescript
/**
 * Process appointment booking with availability check and payment
 *
 * @param request - Booking request with patient ID, doctor ID, and time slot
 * @returns Promise resolving to appointment confirmation with payment details
 *
 * @example
 * ```ts
 * const result = await bookAppointment({
 *   patientId: 'patient_123',
 *   doctorId: 'doctor_456',
 *   slotStart: '2026-02-10T10:00:00',
 *   slotEnd: '2026-02-10T10:30:00'
 * })
 * console.log(result.appointmentId) // 'apt_789'
 * ```
 *
 * @throws {BookingError} When slot is unavailable or already booked
 * @throws {PaymentError} When payment processing fails
 *
 * @see {@link checkAvailability} for slot verification
 * @see {@link processPayment} for payment handling
 */
export async function bookAppointment(
  request: BookingRequest
): Promise<BookingResponse>
```

**Acceptance:** All complex functions have JSDoc

---

### Week 8: Final Validation

#### Task V001: Run Full Test Suite
- **Assignee:** Database Specialist (testing lead)
- **Effort:** 4 hours
**Command:**
```bash
cd ~/doctormx
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

**Acceptance:** 70%+ coverage, all tests passing

---

#### Task V002: Security Audit
- **Assignee:** Security Expert (Coordinator + Backend)
- **Files:** All security-critical files
- **Effort:** 8 hours
**Checklist:**
```bash
# Run security checks
npm audit              # Check for vulnerable dependencies
npx snyk test         # Additional security scan
grep -r "sk-" .      # Ensure no API keys in code
grep -r "service_role" . # Ensure service role not in client code
```

**Acceptance:** Zero critical vulnerabilities

---

#### Task V003: Performance Benchmarking
- **Assignee:** Backend Specialist
- **Files:** All API endpoints
- **Effort:** 4 hours
**Targets:**
- API responses < 500ms (p95)
- Page loads < 2 seconds
- First contentful paint < 1.5 seconds

**Acceptance:** Performance targets met

---

## TASK ASSIGNMENT SUMMARY BY SPECIALIST

### Frontend Specialist Tasks
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| F005 | Fix mobile patient navigation | 4h | CRITICAL |
| F004 | Fix XSS vulnerabilities | 4h | CRITICAL |
| UX001 | Map technical errors to user-friendly | 8h | HIGH |
| UX002 | Add success feedback for forms | 4h | HIGH |
| UX003 | Implement network fallback for video | 8h | HIGH |
| UX004 | Show doctor verification queue position | 4h | HIGH |
| Q001 | Add dark mode toggle | 4h | MEDIUM |
| Q002 | Implement keyboard navigation | 8h | MEDIUM |
| COMP002 | Implement consent mechanisms (UI part) | 4h | HIGH |

### Backend Specialist Tasks
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| F002 | Remove service role key from client code | 8h | CRITICAL |
| F003 | Implement file upload security | 4h | CRITICAL |
| C001 | Replace console statements with logger | 4h | HIGH |
| P001 | Parallelize analytics queries | 4h | HIGH |
| P002 | Optimize chat conversations (N+1 fix) | 4h | HIGH |
| P003 | Implement vision result caching | 4h | HIGH |
| A001 | Implement standardized error response | 8h | MEDIUM |
| A002 | Create VideoProvider interface | 8h | MEDIUM |
| A003 | Refactor AI router (Factory pattern) | 8h | MEDIUM |
| V003 | Performance benchmarking | 4h | HIGH |

### Database Specialist Tasks
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| D001 | Webhook testing suite | 16h | CRITICAL |
| D002 | Video service tests | 8h | CRITICAL |
| D003 | Emergency AI triage tests | 8h | CRITICAL |
| D004 | Authentication integration tests | 8h | HIGH |
| D005 | Prescription PDF tests | 8h | HIGH |
| T002 | Add composite database indexes | 4h | HIGH |
| V001 | Run full test suite | 4h | HIGH |

### AI/ML Specialist Tasks
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| T001 | Replace `any` types in critical paths | 16h | HIGH |
| P003 | Implement vision result caching | 4h | HIGH |
| A003 | Refactor AI router (Factory pattern) | 8h | MEDIUM |
| COMP001 | Draft privacy notice | 4h | HIGH |

### Coordinator (Lead) Tasks
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| F001 | Rotate all exposed API keys | 4h | CRITICAL |
| COMP001 | Draft privacy notice | 4h | HIGH |
| COMP002 | Implement consent mechanisms (backend coordination) | 8h | HIGH |
| V002 | Security audit coordination | 8h | HIGH |
| Merges all specialist work | Ongoing | - |
| Creates all pull requests | Ongoing | - |

---

## COORDINATION PROTOCOL

### Daily Standup (Async)

**Each specialist reports:**
1. What I completed yesterday
2. What I'm working on today
3. Blockers or dependencies
4. ETA on current task

**Coordinator reviews:**
1. Task progress
2. Dependencies to unblock
3. Priority adjustments if needed
4. Merge requests ready for review

### Task Claiming

**Self-Claim (for unassigned tasks):**
1. Task marked `pending` and unblocked
2. Specialist claims task → marks `in_progress`
3. Specialist informs Coordinator
4. Works independently in their worktree

**Assigned Tasks:**
1. Coordinator assigns specific task
2. Specialist accepts and starts work
3. Reports progress daily

### Task Completion Flow

```
Specialist: "Task F005 complete, ready for review"
    ↓
Coordinator: Reviews PR, tests functionality
    ↓
If approved:
  - PR merged to main branch
  - Task marked `completed`
  - All worktrees update (git pull)
  - Dependent tasks unblocked
If not approved:
  - Coordinator provides feedback
  - Task remains `in_progress`
  - Specialist makes revisions
```

---

## QUALITY GATES

### Before Merge to Main

**Every pull request must pass:**

1. **Code Review Checklist:**
   - [ ] No console.log statements
   - [ ] Proper error handling (Result type)
   - [ ] Type-safe (no `any` in critical paths)
   - [ ] Mobile responsive tested
   - [ ] Accessibility reviewed
   - [ ] Tests written (70%+ coverage for new code)
   - [ ] JSDoc on complex functions
   - [ ] No magic numbers
   - [ ] Healthcare security verified (if applicable)

2. **Automated Checks:**
   ```bash
   npm run build    # TypeScript compilation
   npm run test     # All tests passing
   npm run lint     # Linting clean
   ```

3. **Manual Verification:**
   - Manual testing of user flow
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Mobile testing (iOS Safari, Chrome Mobile)
   - Performance regression check

4. **Council Review** (for Phase transitions):
   - Visionary: Market fit, strategic alignment
   - Skeptic: Risks identified and mitigated
   - Optimizer: ROI validated, effort optimized
   - Craftsperson: Quality standards met

---

## SUCCESS METRICS

### Quality Metrics (Target by end of Phase 2)

| Metric | Current | Target | Owner |
|--------|---------|--------|-------|
| Test coverage | <20% | 70%+ | Database Specialist |
| Console statements | 327 | 0 | All Specialists |
| `any` types (critical) | 15 | 0 | Backend + AI/ML |
| Critical vulnerabilities | 6 | 0 | Coordinator + Backend |
| N+1 queries | 5+ | 0 | Backend Specialist |
| Mobile usability | Broken | 100% | Frontend Specialist |
| Page load time (p95) | 1-5s | <500ms | Backend Specialist |
| API response time (p95) | 500-5000ms | <500ms | Backend Specialist |
| Accessibility score | Unknown | 90%+ | Frontend Specialist |

### Business Metrics (Year 1)

| Metric | Target | Owner |
|--------|--------|-------|
| Monthly active users | 15,000 | Coordinator |
| Consultations/month | 10,000 | Coordinator |
| Revenue (MXN) | $12M | Coordinator |
| CAC | $400 MXN | Coordinator |
| LTV | $2,000 MXN | Coordinator |
| NPS (patient) | 70%+ | Coordinator |
| NPS (doctor) | 4.0+/5 | Coordinator |

---

## EXPERT INSIGHTS (Adding Value)

### 1. Architecture: Domain-Driven Design Recommendation

**Current State:** Good domain organization, but could be stronger

**Recommendation:** Implement DDD with bounded contexts:

```
src/domains/
├── appointments/      # Appointment booking domain
│   ├── application/   # Use cases (book, cancel, reschedule)
│   ├── domain/         # Entities, value objects
│   ├── infrastructure/ # Supabase repositories
│   └── presentation/    # API routes, UI helpers
├── prescriptions/      # Prescription domain
├── consultations/      # Video consultation domain
├── triage/             # AI triage domain
└── payments/           # Stripe payment domain
```

**Benefits:**
- Clear ownership of each domain
- Reduced coupling between domains
- Easier testing and maintenance
- Scalable architecture

---

### 2. Security: Zero Trust Architecture

**Recommendation:** Implement Zero Trust model for healthcare data

```
Principles:
1. Verify explicitly: Always authenticate and authorize
2. Least privilege: Minimum access required
3. Assume breach: Design for security even if compromised
```

**Implementation:**
- Every API call verifies user + role + resource ownership
- Medical data access requires additional verification
- Audit logging for all data access
- Regular security audits and penetration testing

---

### 3. Performance: Multi-Layer Caching Strategy

**Recommendation:** Implement comprehensive caching

```
Layer 1: Edge CDN (Cloudflare) - Static assets, images
Layer 2: Vercel Edge - Page cache, API responses
Layer 3: Redis (Upstash) - Database queries, AI responses
Layer 4: Browser cache - Non-sensitive data
```

**Expected Results:**
- 60%+ reduction in database load
- 80%+ faster API responses for cached data
- Improved scalability

---

### 4. Compliance: COFEPRIS SaMD Registration

**Recommendation:** Register AI triage system as SaMD

**Classification:** Class II (Diagnostic support)

**Requirements:**
1. Quality management system
2. Clinical validation studies
3. Risk management file
4. Technical documentation
5. Post-market surveillance

**Timeline:** 6-9 months

---

### 5. Market: Go-to-Market Strategy

**Phase 1 (Months 1-3): Mexico City Pilot**
- Target: 5,000 users
- Focus: Young professionals, chronic patients
- Partnership: Farmacias del Ahorro

**Phase 2 (Months 4-6): Metro Expansion**
- Cities: Guadalajara, Monterrey, Puebla
- Target: 50,000 users
- Partnership: Add Farmacias Guadalajara

**Phase 3 (Months 7-12): National Coverage**
- Target: All state capitals
- Focus: Underserved regions (Oaxaca, Chiapas)
- Partnership: Government programs (IMSS-Bienestar)

---

### 6. Technology: AI Evolution Roadmap

**Current State:** Multi-provider routing (OpenAI, Anthropic, GLM)

**Recommendation:**
1. **Short-term (Q2 2026):** Implement prompt versioning and A/B testing
2. **Medium-term (Q3 2026):** Fine-tune models on Mexican medical data
3. **Long-term (Q4 2026):** Implement custom medical LLM

**Benefits:**
- Improved Spanish medical terminology
- Better understanding of Mexican healthcare context
- Reduced API costs

---

## COUNCIL FINAL EVALUATION

### Members Present

| Member | Philosophy | Focus | Vote |
|--------|------------|-------|------|
| **Visionary** | Strategic innovation | Market opportunities, 5-year vision | ✅ APPROVE |
| **Skeptic** | Critical analysis | Risk identification, challenge assumptions | ✅ APPROVE |
| **Optimizer** | Efficiency, pragmatism | Resource allocation, ROI prioritization | ✅ APPROVE |
| **Craftsperson** | Quality, excellence | Best practices, technical perfection | ✅ APPROVE |

---

## FINAL COUNCIL DECLARATION

**UNANIMOUS DECLARATION:**

> "Quality is the priority over time and effort. This is non-negotiable.
> Patient safety depends on technical excellence. We will not ship buggy code.
> We will not compromise security for speed. We will not sacrifice testing for features."

**CONDITIONS FOR APPROVAL:**

1. ✅ Phase 0 MUST be complete before any production consideration
2. ✅ Quality gates must be passed for every merge
3. ✅ 70%+ test coverage required for critical paths
4. ✅ Zero critical vulnerabilities allowed in production
5. ✅ Mobile-first design enforced (70%+ of users)
6. ✅ All code reviewed by at least one specialist
7. ✅ Performance benchmarks met (<500ms API responses)

**ESTIMATED TIMELINE:**
- Phase 0: 1-2 weeks (BLOCKER)
- Phase 1: 3-4 weeks (Core Superiority)
- Phase 2: 2-3 weeks (Advanced Excellence)
- **Total to Production-Ready:** 6-9 weeks

---

## TEAM COORDINATION COMMANDS

### For Coordinator (You):

```bash
# Create task and assign to specialist
# TaskCreate for tracking, TaskUpdate for progress, then use Task tool to spawn specialist

# Start work on a task
# Mark TaskUpdate status to in_progress

# Complete task
# Mark TaskUpdate status to completed

# Review and merge specialist work
# Each specialist works in their worktree, submits PR for you to merge
```

### For Specialists:

```bash
# Navigate to your worktree
cd ~/doctormx/worktrees/frontend   # Frontend Specialist
cd ~/doctormx/worktrees/backend    # Backend Specialist
cd ~/doctormx/worktrees/database   # Database Specialist
cd ~/doctormx/worktrees/ai         # AI/ML Specialist

# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-task-name

# Work on your assigned files
# Only touch files in your ownership matrix

# Commit changes
git add .
git commit -m "Task F005: Fix mobile patient navigation"

# Push to remote
git push origin feature/your-task-name

# Notify Coordinator: "Task F005 complete, ready for review"
```

---

**REMEMBER:** This execution plan is TEAM-ORIENTED. Each specialist works in their own worktree on their assigned files. The Coordinator orchestrates, reviews, and merges. Quality is the priority. Patient safety depends on technical excellence.

---

*Document Version: 1.0*
*Last Updated: 2026-02-09*
*Council Approved: YES (Unanimous)*
*Quality Standard: Stripe-level Excellence*
