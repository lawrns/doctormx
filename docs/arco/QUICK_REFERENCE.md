# ARCO Rights System - Quick Reference

**Last Updated:** February 9, 2026

---

## TL;DR

The ARCO system implements Mexican data protection law (LFPDPPP) giving users rights to:
- **ACCESS** their data
- **RECTIFY** inaccurate data
- **CANCEL** (delete) their data
- **OPPOSE** data processing

**Legal SLA:** 20 business days to respond

---

## File Structure

```
src/lib/arco/
├── index.ts           # Core functions & entry point
├── requests.ts        # Request CRUD operations
├── sla-tracker.ts     # SLA compliance monitoring
├── escalation.ts      # Automatic escalation logic
└── data-export.ts     # Export/deletion operations

src/types/arco.ts      # All ARCO type definitions

supabase/migrations/
└── 20250209_arco_system.sql  # Database schema

docs/arco/
└── implementation-guide.md    # Full documentation
```

---

## Quick Start

### Create an ARCO Request

```typescript
import { createArcoRequest } from '@/lib/arco'

const request = await createArcoRequest(userId, {
  request_type: 'ACCESS',
  title: 'Solicitud de Acceso',
  description: 'Quiero una copia de mis datos',
  data_scope: ['all']
})
```

### Get User's Requests

```typescript
import { getUserArcoRequests } from '@/lib/arco'

const requests = await getUserArcoRequests(userId)
```

### Export User Data

```typescript
import { exportUserDataToJson } from '@/lib/arco'

const json = await exportUserDataToJson(userId, ['all'])
```

### Check SLA Compliance

```typescript
import { checkSlaCompliance } from '@/lib/arco'

const status = await checkSlaCompliance(request)
// Returns: { is_overdue, business_days_remaining, ... }
```

---

## Request Types

| Type | Code | Description |
|------|------|-------------|
| Acceso | `ACCESS` | User wants copy of their data |
| Rectificación | `RECTIFY` | User wants to correct data |
| Cancelación | `CANCEL` | User wants data deleted |
| Oposición | `OPPOSE` | User wants to stop processing |

---

## Request Statuses

| Status | Code | Can Transition To |
|--------|------|-------------------|
| Pendiente | `pending` | acknowledged, cancelled |
| Reconocido | `acknowledged` | processing, escalated |
| Procesando | `processing` | completed, denied, escalated |
| Info Requerida | `info_required` | processing, cancelled |
| Escalado | `escalated` | processing, completed, denied |
| Completado | `completed` | *(terminal)* |
| Denegado | `denied` | *(terminal)* |
| Cancelado | `cancelled` | *(terminal)* |

---

## Escalation Levels

| Level | Days | Team | Auto-Escalate |
|-------|------|------|---------------|
| Tier 1 | 0-5 | Support | Day 5 |
| Tier 2 | 5-10 | DPO | Day 10 |
| Tier 3 | 10-15 | Legal | Day 15 |
| Tier 4 | 15-20 | External | Day 20 |

---

## Data Scope Options

```typescript
type DataTableScope =
  | 'profiles'           // User profile
  | 'appointments'       // Appointment history
  | 'prescriptions'      // Medical prescriptions
  | 'soap_consultations' // Medical notes
  | 'chat_conversations' // Chat history
  | 'chat_messages'      // Individual messages
  | 'payments'           // Payment history
  | 'follow_up_schedules' // Follow-up reminders
  | 'all'                // Everything
```

---

## Retention Policies

| Data Type | Retention | Can Delete? |
|-----------|-----------|-------------|
| Profile | Until closure | Anonymize only |
| Appointments | 5 years | After retention |
| Prescriptions | 5 years | After retention |
| Medical Notes | 5 years | After retention |
| Chat | 2 years | After retention |
| Payments | 5 years (tax) | After retention |

---

## Common Operations

### Admin: Update Request Status

```typescript
import { updateArcoRequest } from '@/lib/arco'

await updateArcoRequest(requestId, {
  status: 'acknowledged',
  assigned_to: adminId
}, adminId)
```

### Admin: Get All Requests

```typescript
import { getAllArcoRequests } from '@/lib/arco'

const { data, pagination } = await getAllArcoRequests({
  status: 'pending',
  request_type: 'ACCESS'
}, 'created_at', 1, 20)
```

### Admin: Escalate Request

```typescript
import { escalateRequest } from '@/lib/arco'

await escalateRequest(requestId, adminId, 'Approaching SLA limit')
```

### User: Update Privacy Preferences

```typescript
import { updateUserPrivacyPreferences } from '@/lib/arco'

await updateUserPrivacyPreferences(userId, {
  marketing_emails: false,
  analytics_consent: false
})
```

---

## SLA Time Thresholds

```
Day 0   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Day 20
│       │               │       │       │     │
Green   Yellow          Orange  Red    Overdue
0-5     5-15            15-18   18-20   >20
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `REQUEST_NOT_FOUND` | Request doesn't exist |
| `INVALID_REQUEST_TYPE` | Invalid ARCO type |
| `INVALID_STATUS` | Invalid status transition |
| `ALREADY_COMPLETED` | Request already complete |
| `UNAUTHORIZED_ACCESS` | User lacks permission |
| `SLA_EXCEEDED` | Request is overdue |
| `MISSING_REQUIRED_INFO` | Required field missing |
| `CANNOT_DELETE_REQUIRED_DATA` | Legal retention applies |
| `LEGAL_HOLD` | Data legally required |
| `DUPLICATE_REQUEST` | Duplicate pending request |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `arco_requests` | Main request records |
| `arco_request_history` | Audit trail |
| `arco_attachments` | Supporting documents |
| `arco_communications` | Communication log |
| `data_amendments` | Rectification records |
| `data_deletions` | Cancellation records |
| `privacy_preferences` | User consent settings |

---

## Key Functions Reference

### Request Management

```typescript
// Create request
createArcoRequest(userId, input) → ArcoRequestRow

// Get single request
getArcoRequest(requestId, userId, isAdmin?) → ArcoRequestWithDetails

// Get user's requests
getUserArcoRequests(userId, filter?) → ArcoRequestRow[]

// Update request (admin)
updateArcoRequest(requestId, input, adminId) → ArcoRequestRow

// Get all requests (admin)
getAllArcoRequests(filter, sort, page, perPage) → PaginatedResponse
```

### SLA Tracking

```typescript
// Check SLA status
checkSlaCompliance(request) → SLAStatus

// Track compliance
trackSlaCompliance() → ComplianceSummary

// Get metrics
getSlaMetrics(startDate, endDate) → SlaComplianceMetrics

// Get requests needing reminders
getRequestsNeedingReminders() → {warning, critical, overdue}
```

### Escalation

```typescript
// Check if should escalate
shouldEscalate(request) → EscalationDecision

// Escalate request
escalateRequest(requestId, adminId, reason?) → ArcoRequestRow

// Get appropriate level
getEscalationLevel(type, priority, userId) → EscalationLevel

// Update level manually
updateEscalationLevel(requestId, level, adminId, reason?) → ArcoRequestRow
```

### Data Operations

```typescript
// Get data export
getUserDataExport(userId, scope) → DataExportPackage

// Export as JSON
exportUserDataToJson(userId, scope) → string

// Export as text
exportUserDataToText(userId, scope) → string

// Create export attachment
createDataExportAttachment(requestId, userId, format) → Attachment

// Record amendment
recordDataAmendment(requestId, table, record, field, old, new, reason, by) → void

// Apply amendment
applyDataAmendment(amendmentId, approvedBy) → void

// Plan deletion
planDataDeletion(requestId, userId) → DeletionPlan

// Execute deletion
executeDataDeletion(requestId, userId, executedBy) → void
```

### Privacy Preferences

```typescript
// Get user preferences
getUserPrivacyPreferences(userId) → PrivacyPreferencesRow

// Update preferences
updateUserPrivacyPreferences(userId, updates) → PrivacyPreferencesRow

// Check specific consent
hasUserConsent(userId, consentType) → boolean
```

---

## Utilities

```typescript
// Calculate business days
calculateBusinessDays(startDate, endDate) → number

// Add business days
addBusinessDays(startDate, days) → Date

// Check if overdue
isRequestOverdue(request) → boolean

// Get status color
getStatusColor(status) → string (CSS class)

// Get priority color
getPriorityColor(priority) → string (CSS class)

// Format request type
formatRequestType(type) → string

// Validate data scope
isValidDataScope(scope) → boolean
```

---

## Testing Checklist

- [ ] User can submit ACCESS request
- [ ] User can submit RECTIFY request
- [ ] User can submit CANCEL request
- [ ] User can submit OPPOSE request
- [ ] Duplicate requests are rejected
- [ ] Due date is 20 business days
- [ ] Acknowledgment sent within 24h
- [ ] Escalation happens at thresholds
- [ ] Data export includes all tables
- [ ] Medical records 5-year retention enforced
- [ ] Profile anonymization works
- [ ] Privacy preferences update correctly
- [ ] SLA tracking is accurate
- [ ] Overdue requests trigger alerts
- [ ] Admin can update request status
- [ ] Denial requires legal basis

---

## Compliance Checklist

- [ ] 20 business day SLA enforced
- [ ] 24 hour acknowledgment
- [ ] Identity verification required
- [ ] All denials documented
- [ ] 5-year medical retention (NOM-004)
- [ ] 5-year tax retention (SAT)
- [ ] Audit trail maintained
- [ ] Communications logged
- [ ] Escalation procedures defined
- [ ] Staff trained on LFPDPPP

---

## Contacts

- **Privacy Officer:** privacidad@doctormx.com
- **Legal:** legal@doctormx.com
- **Support:** support@doctormx.com

---

## Related Documentation

- [Full Implementation Guide](./implementation-guide.md)
- [Mexico Compliance](../compliance/mexico.md)
- [Privacy Policy](/privacy)

---

**For questions or issues, refer to the [implementation guide](./implementation-guide.md) or contact the privacy officer.**
