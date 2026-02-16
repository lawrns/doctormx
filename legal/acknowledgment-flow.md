# Patient Acknowledgment Flow Documentation

## Overview

This document describes the complete patient acknowledgment flow for the DoctorMX platform, ensuring legal compliance and user safety before accessing AI-powered medical consultation features.

---

## 1. Flow Architecture

### 1.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PATIENT ACKNOWLEDGMENT FLOW                      │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │   Start  │
  └────┬─────┘
       │
       ▼
  ┌──────────────┐     No     ┌──────────────┐
  │   Authenticated? │────────▶│ Redirect to  │
  │              │            │   Login      │
  └──────┬───────┘            └──────────────┘
         │ Yes
         ▼
  ┌──────────────┐     Yes    ┌──────────────┐
  │ Has Previous │───────────▶│ Skip to AI   │
  │Acknowledgment│            │ Consultation │
  └──────┬───────┘            └──────────────┘
         │ No
         ▼
  ┌──────────────┐
  │   Display    │
  │   Medical    │
  │  Disclaimer  │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐     No     ┌──────────────┐
  │User Checks   │───────────▶│ Disable      │
  │Ack Checkbox  │            │ Continue Btn │
  └──────┬───────┘            └──────────────┘
         │ Yes
         ▼
  ┌──────────────┐
  │   Click      │
  │  Continue    │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐     Error  ┌──────────────┐
  │Store in DB   │───────────▶│ Display Error│
  └──────┬───────┘            └──────────────┘
         │ Success
         ▼
  ┌──────────────┐
  │   Log to     │
  │  Audit Trail │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │   Redirect   │
  │   to AI      │
  │ Consultation │
  └──────┬───────┘
         │
         ▼
  ┌──────────┐
  │   End    │
  └──────────┘
```

---

## 2. Detailed Flow Steps

### Step 1: Authentication Check

**Location:** `/consent/acknowledgment/page.tsx`

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  redirect('/auth/login?redirect=/consent/acknowledgment')
}
```

**Behavior:**
- Unauthenticated users are redirected to login
- Return URL is preserved for post-login redirect
- Session validation occurs server-side

### Step 2: Previous Acknowledgment Check

**Function:** `hasAcknowledgedDisclaimer(userId: string)`

```typescript
const { data } = await supabase
  .from('user_consent_records')
  .select('id, status, granted_at')
  .eq('user_id', userId)
  .eq('consent_type', 'ai_analysis')
  .eq('status', 'granted')
  .maybeSingle()

return !!data
```

**Database Query:**
```sql
SELECT id, status, granted_at 
FROM user_consent_records 
WHERE user_id = $1 
  AND consent_type = 'ai_analysis' 
  AND status = 'granted'
LIMIT 1;
```

**Behavior:**
- If acknowledged: Redirect to `/app/ai-consulta`
- If not acknowledged: Continue to disclaimer page

### Step 3: Disclaimer Display

**Component:** `MedicalDisclaimer` (`src/components/legal/MedicalDisclaimer.tsx`)

**Sections:**
1. **Header**: Warning icon + title
2. **Primary Alert**: Main disclaimer text (Spanish)
3. **Capabilities**: What the tool CAN do
4. **Limitations**: What the tool CANNOT do
5. **Privacy Notice**: Data protection information
6. **Emergency Info**: 911 and emergency contacts
7. **Acknowledgment**: Checkbox + legal text
8. **Actions**: Cancel / Continue buttons

### Step 4: User Acknowledgment

**State Management:**
```typescript
const [acknowledged, setAcknowledged] = useState(false)
```

**UI Behavior:**
- Continue button disabled until checkbox checked
- Checkbox includes full legal acknowledgment text
- Visual feedback on state change

**Legal Text (Spanish):**
```
"He leído y comprendo que esta herramienta no proporciona diagnóstico médico. 
Entiendo que debo consultar a un profesional de la salud para cualquier diagnóstico 
o tratamiento. Acepto que mi reconocimiento será registrado."
```

### Step 5: Continue Action

**Handler:** `handleAcknowledge(timestamp: string)`

**Process:**
1. Generate ISO timestamp
2. Validate acknowledgment
3. Store in database
4. Log to audit trail
5. Redirect on success

### Step 6: Database Storage

**Primary Table:** `user_consent_records`

```typescript
const { error } = await supabase
  .from('user_consent_records')
  .insert({
    user_id: userId,
    consent_type: 'ai_analysis',
    consent_version_id: versionId,
    status: 'granted',
    granted_at: timestamp,
    granted_from: ipAddress,
    delivery_method: 'click_wrap',
    metadata: {
      disclaimer_acknowledged: true,
      acknowledged_at: timestamp,
      acknowledgment_type: 'medical_disclaimer'
    }
  })
```

**Data Stored:**
| Field | Value | Purpose |
|-------|-------|---------|
| user_id | UUID | User identification |
| consent_type | 'ai_analysis' | Type of consent |
| status | 'granted' | Consent status |
| granted_at | ISO timestamp | When acknowledged |
| granted_from | IP address | Source tracking |
| metadata | JSON | Extended data |

### Step 7: Audit Logging

**Table:** `consent_audit_logs`

```typescript
await supabase
  .from('consent_audit_logs')
  .insert({
    event_type: 'consent_granted',
    user_id: userId,
    consent_type: 'ai_analysis',
    action: 'medical_disclaimer_acknowledged',
    action_result: 'success',
    actor_user_id: userId,
    actor_role: 'user',
    actor_ip_address: ipAddress,
    after_state: {
      disclaimer_acknowledged: true,
      acknowledged_at: timestamp,
      consent_type: 'ai_analysis'
    },
    occurred_at: timestamp
  })
```

### Step 8: Redirect

```typescript
if (result.success) {
  redirect('/app/ai-consulta')
} else {
  redirect(`/consent/acknowledgment?error=${encodeURIComponent(result.error)}`)
}
```

---

## 3. State Machine

```
                    ┌──────────────┐
         ┌─────────▶│   INITIAL    │◀────────┐
         │          │   (Check)    │         │
         │          └──────┬───────┘         │
         │                 │                 │
         │    ┌────────────┼────────────┐    │
         │    │            │            │    │
         │    ▼            ▼            ▼    │
         │  ┌─────┐   ┌──────────┐  ┌──────┐│
         │  │Auth │   │ Previously│  │ No   ││
         │  │ Req │   │ Acked     │  │ Ack  ││
         │  └─────┘   └────┬─────┘  └──┬───┘│
         │    │            │            │    │
         │    │            │            │    │
         │    ▼            ▼            ▼    │
         │ ┌────────┐  ┌─────────┐ ┌────────┐│
         └─│ Login  │  │ AI Page │ │Display │┘
           │Redirect│  │ Redirect│ │Disclaimer
           └────────┘  └─────────┘ └────┬───┘
                                        │
                                        ▼
                                   ┌──────────┐
                                   │ AWAITING │
                                   │  INPUT   │
                                   └────┬─────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
        ┌──────────┐             ┌──────────┐              ┌──────────┐
        │ CANCEL   │             │CHECK BOX │              │ UNCHECK  │
        │  CLICK   │             │  CHECK   │              │   BOX    │
        └────┬─────┘             └────┬─────┘              └────┬─────┘
             │                        │                         │
             ▼                        ▼                         ▼
        ┌──────────┐             ┌──────────┐              ┌──────────┐
        │ Redirect │             │ Continue │              │ Disable  │
        │  /app    │             │  Enable  │              │ Continue │
        └──────────┘             └────┬─────┘              └──────────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │ CONTINUE │
                                │  CLICK   │
                                └────┬─────┘
                                     │
                                     ▼
                               ┌──────────┐
                               │ STORING  │
                               │   DATA   │
                               └────┬─────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
        ┌──────────┐          ┌──────────┐          ┌──────────┐
        │ SUCCESS  │          │ DB ERROR │          │ AUDIT    │
        └────┬─────┘          └────┬─────┘          │  ERROR   │
             │                     │                └────┬─────┘
             │                     │                     │
             ▼                     ▼                     ▼
        ┌──────────┐          ┌──────────┐          ┌──────────┐
        │ Redirect │          │ Error    │          │ Log only │
        │AI Consult│          │ Message  │          │ Continue │
        └──────────┘          └──────────┘          └──────────┘
```

---

## 4. API Endpoints

### 4.1 Internal Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `hasAcknowledgedDisclaimer` | `page.tsx` | Check existing acknowledgment |
| `getLatestAIConsentVersion` | `page.tsx` | Get consent version ID |
| `storeAcknowledgment` | `page.tsx` | Server action to store data |
| `createDefaultAIConsentVersion` | `page.tsx` | Create version if missing |

### 4.2 Database Operations

| Operation | Table | Type |
|-----------|-------|------|
| SELECT | user_consent_records | Check existing |
| INSERT | user_consent_records | Store acknowledgment |
| INSERT | consent_audit_logs | Audit trail |
| SELECT | consent_versions | Get version |
| INSERT | consent_versions | Create default version |

---

## 5. Error Handling

### 5.1 Error Types

| Error | Cause | Handling |
|-------|-------|----------|
| Auth Error | No session | Redirect to login |
| DB Connection | Supabase unavailable | Retry with exponential backoff |
| Version Missing | No consent version | Create default version |
| Insert Error | Constraint violation | Display error message |
| Audit Log Error | Logging failure | Continue (non-blocking) |

### 5.2 Error Messages (Spanish)

```typescript
const errorMessages = {
  DB_CONNECTION: 'Error de conexión. Por favor intente de nuevo.',
  VERSION_MISSING: 'Error de configuración. Contacte soporte.',
  INSERT_FAILED: 'No se pudo guardar el reconocimiento. Intente de nuevo.',
  UNKNOWN: 'Error desconocido. Contacte soporte técnico.'
}
```

---

## 6. Data Flow

### 6.1 Request Flow

```
User Browser
    │
    │ GET /consent/acknowledgment
    ▼
Next.js Server
    │
    ├─▶ Check Authentication
    │
    ├─▶ Check Existing Acknowledgment
    │
    ├─▶ Fetch Consent Version
    │
    └─▶ Render MedicalDisclaimer Component
    │
    ▼
User Browser (Display)
    │
    │ Checkbox Click
    ▼
Client State Update
    │
    │ Continue Click
    ▼
Server Action: handleAcknowledge
    │
    ├─▶ Validate Session
    │
    ├─▶ Insert/Update user_consent_records
    │
    ├─▶ Insert consent_audit_logs
    │
    └─▶ Redirect to /app/ai-consulta
    │
    ▼
User Browser (Redirected)
```

### 6.2 Data Entities

```
User
  ├── id: UUID
  ├── email: String
  └── profile: Profile

ConsentVersion
  ├── id: UUID
  ├── consent_type: 'ai_analysis'
  ├── version: '1.0.0'
  ├── title: String
  ├── description: String
  └── effective_date: DateTime

UserConsentRecord
  ├── id: UUID
  ├── user_id: UUID (FK)
  ├── consent_type: 'ai_analysis'
  ├── consent_version_id: UUID (FK)
  ├── status: 'granted'
  ├── granted_at: DateTime
  ├── granted_from: IPAddress
  └── metadata: JSON

ConsentAuditLog
  ├── id: UUID
  ├── event_type: 'consent_granted'
  ├── user_id: UUID (FK)
  ├── consent_type: 'ai_analysis'
  ├── action: 'medical_disclaimer_acknowledged'
  ├── action_result: 'success'
  ├── actor_user_id: UUID (FK)
  ├── actor_ip_address: IPAddress
  ├── after_state: JSON
  └── occurred_at: DateTime
```

---

## 7. Security Measures

### 7.1 Authentication

- Server-side session validation
- Secure cookie handling
- PKCE flow for OAuth

### 7.2 Authorization

```sql
-- RLS Policy: Users can only access their own records
CREATE POLICY "Users can read own consent records"
  ON user_consent_records FOR SELECT
  USING (user_id = auth.uid());
```

### 7.3 Data Protection

| Layer | Protection |
|-------|-----------|
| Transport | TLS 1.3 |
| Storage | AES-256 |
| Audit | Immutable logs |
| Access | Principle of least privilege |

---

## 8. Monitoring & Analytics

### 8.1 Events to Track

| Event | Data | Purpose |
|-------|------|---------|
| disclaimer_viewed | user_id, timestamp, version | Usage analytics |
| disclaimer_acknowledged | user_id, timestamp, time_spent | Conversion tracking |
| disclaimer_cancelled | user_id, timestamp, step | Drop-off analysis |
| disclaimer_error | error_type, timestamp | Error monitoring |

### 8.2 Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Acknowledgment Rate | > 95% | < 90% |
| Average Time to Acknowledge | < 60s | > 120s |
| Error Rate | < 0.1% | > 1% |
| DB Storage Success | 100% | < 99.9% |

---

## 9. Testing Checklist

### 9.1 Unit Tests

- [ ] Authentication check works correctly
- [ ] Previous acknowledgment detection
- [ ] Checkbox state management
- [ ] Button enable/disable logic
- [ ] Timestamp generation
- [ ] Database insertion
- [ ] Error handling

### 9.2 Integration Tests

- [ ] End-to-end flow with real database
- [ ] Audit log creation
- [ ] Redirect behavior
- [ ] Error recovery

### 9.3 E2E Tests

- [ ] Complete user journey
- [ ] Mobile responsiveness
- [ ] Accessibility (screen readers)
- [ ] Cross-browser compatibility

---

## 10. Compliance Verification

| Requirement | Status | Evidence |
|------------|--------|----------|
| Explicit consent | ✅ | Checkbox + timestamp |
| Record retention | ✅ | Database storage |
| Audit trail | ✅ | consent_audit_logs |
| Access control | ✅ | RLS policies |
| Encryption | ✅ | AES-256 + TLS 1.3 |
| Right to withdraw | ✅ | Consent management UI |

---

*Document Version: 1.0*  
*Last Updated: February 2025*  
*Author: Legal/Compliance Team*
