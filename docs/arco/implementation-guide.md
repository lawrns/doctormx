# ARCO Rights System - Implementation Guide

**Version:** 1.0
**Last Updated:** February 9, 2026
**Compliance:** LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [User Flows](#user-flows)
6. [Admin Workflows](#admin-workflows)
7. [SLA Management](#sla-management)
8. [Escalation Procedures](#escalation-procedures)
9. [Data Operations](#data-operations)
10. [Compliance Requirements](#compliance-requirements)
11. [Testing](#testing)
12. [Monitoring](#monitoring)

---

## Overview

The ARCO (Acceso, Rectificación, Cancelación, Oposición) Rights System implements Mexican data protection law compliance for Doctor.mx. This system enables users to exercise their rights under LFPDPPP.

### What Are ARCO Rights?

| Right | Description | User Can... |
|-------|-------------|-------------|
| **Acceso (Access)** | Right to know what data is held | Request complete copy of all personal data |
| **Rectificación (Rectification)** | Right to correct inaccurate data | Request corrections to incomplete/incorrect data |
| **Cancelación (Cancellation)** | Right to deletion (Right to be forgotten) | Request removal of personal data |
| **Oposición (Opposition)** | Right to oppose processing | Object to specific data processing activities |

### Legal Requirements

- **Response SLA:** 20 business days maximum (LFPDPPP Article 18)
- **Acknowledgment:** Within 24 hours of request submission
- **Denial Documentation:** Must provide legal basis if denying request
- **Verification:** Must verify requester identity before providing data
- **Retention:** Must retain medical records for 5 years (NOM-004-SSA3-2012)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       User Interface                         │
│  /app/derechos-arco - Request submission portal              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  /api/arco/* - Request endpoints                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  src/lib/arco/                                               │
│  ├─ index.ts - Core functions & types                       │
│  ├─ requests.ts - Request CRUD operations                   │
│  ├─ sla-tracker.ts - SLA compliance monitoring              │
│  ├─ escalation.ts - Automatic escalation logic               │
│  └─ data-export.ts - Data export/deletion operations        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (Supabase)                 │
│  arco_requests, arco_request_history, data_amendments, etc. │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

#### arco_requests
Main table for all ARCO rights requests.

```sql
CREATE TABLE arco_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  request_type ARCO_REQUEST_TYPE NOT NULL, -- ACCESS, RECTIFY, CANCEL, OPPOSE
  status ARCO_REQUEST_STATUS DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data_scope TEXT[], -- Tables affected
  due_date TIMESTAMPTZ NOT NULL, -- 20 business days
  escalation_level ESCALATION_LEVEL DEFAULT 'tier_1',
  assigned_to UUID REFERENCES profiles(id),
  ...
);
```

#### arco_request_history
Audit trail for all status changes.

```sql
CREATE TABLE arco_request_history (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES arco_requests(id),
  old_status ARCO_REQUEST_STATUS,
  new_status ARCO_REQUEST_STATUS NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL
);
```

#### data_amendments
Tracks all data corrections (RECTIFY requests).

```sql
CREATE TABLE data_amendments (
  id UUID PRIMARY KEY,
  arco_request_id UUID REFERENCES arco_requests(id),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  requested_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  applied_at TIMESTAMPTZ
);
```

#### data_deletions
Tracks all data deletions (CANCEL requests).

```sql
CREATE TABLE data_deletions (
  id UUID PRIMARY KEY,
  arco_request_id UUID REFERENCES arco_requests(id),
  table_name TEXT NOT NULL,
  deletion_type TEXT NOT NULL, -- hard_delete, anonymize, soft_delete
  reason TEXT NOT NULL,
  legal_basis TEXT,
  data_snapshot JSONB
);
```

#### privacy_preferences
User consent and privacy settings (OPPOSE requests).

```sql
CREATE TABLE privacy_preferences (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES profiles(id),
  marketing_emails BOOLEAN DEFAULT TRUE,
  analytics_consent BOOLEAN DEFAULT TRUE,
  ai_training_consent BOOLEAN DEFAULT FALSE,
  voice_recording_consent BOOLEAN DEFAULT FALSE,
  ...
);
```

---

## API Reference

### Creating a Request

```typescript
import { createArcoRequest } from '@/lib/arco'

const request = await createArcoRequest(userId, {
  request_type: 'ACCESS',
  title: 'Solicitud de Acceso a Mis Datos',
  description: 'Deseo recibir una copia de todos mis datos personales',
  data_scope: ['all'],
  justification: 'Ejercicio de derecho ARCO',
})
```

### Getting User Requests

```typescript
import { getUserArcoRequests } from '@/lib/arco'

const requests = await getUserArcoRequests(userId, {
  status: 'pending',
  request_type: 'ACCESS'
})
```

### Updating Request Status (Admin)

```typescript
import { updateArcoRequest } from '@/lib/arco'

const updated = await updateArcoRequest(
  requestId,
  { status: 'acknowledged', assigned_to: adminId },
  adminId
)
```

### Exporting User Data

```typescript
import { exportUserDataToJson } from '@/lib/arco'

const jsonData = await exportUserDataToJson(userId, ['all'])
```

---

## User Flows

### 1. Submitting an ARCO Request

**Entry Point:** `/app/derechos-arco`

**Steps:**

1. User selects the ARCO right they want to exercise
2. System displays appropriate form based on right type
3. User fills in required information:
   - **Acceso:** Select data scope, provide justification
   - **Rectificación:** Specify table/field to correct, provide correct value
   - **Cancelación:** Accept retention policy warnings, confirm deletion
   - **Oposición:** Select processing activities to oppose
4. User submits request
5. System creates request record with calculated due date (20 business days)
6. System sends acknowledgment email within 24 hours

**Response Time:** Immediate

**Acknowledgment:** Within 24 hours

### 2. Tracking Request Status

**Entry Point:** `/app/derechos-arco/mis-solicitudes`

**Display:**

| Request | Type | Status | Days Remaining | Actions |
|---------|------|--------|----------------|---------|
| #12345 | Acceso | Processing | 12 | View Details |
| #12346 | Rectificación | Pending | 18 | View Details |

### 3. Receiving Data (Acceso)

When ACCESS request is completed:

1. User receives email notification
2. User logs in to portal
3. User downloads data in chosen format (JSON/PDF)
4. Download link expires after 7 days

---

## Admin Workflows

### 1. Request Dashboard

**Location:** `/app/admin/arco`

**Features:**

- View all pending requests
- Filter by type, status, escalation level
- Sort by due date, priority, creation date
- SLA compliance indicators
- Bulk actions (acknowledge, assign)

### 2. Processing Requests

#### Access Request Flow

```
1. Receive Request
   ↓
2. Verify User Identity
   ↓
3. Generate Data Export
   ↓
4. Review for Sensitive Data
   ↓
5. Provide Download Link
   ↓
6. Mark as Completed
```

#### Rectification Request Flow

```
1. Receive Request
   ↓
2. Verify Data Inaccuracy
   ↓
3. Get Approval (if medical data)
   ↓
4. Apply Amendment
   ↓
5. Record in Audit Trail
   ↓
6. Notify User
   ↓
7. Mark as Completed
```

#### Cancellation Request Flow

```
1. Receive Request
   ↓
2. Check Retention Requirements
   ↓
3. Create Deletion Plan
   ↓
4. Get Legal Approval (if needed)
   ↓
5. Execute Deletion/Anonymization
   ↓
6. Confirm with User
   ↓
7. Mark as Completed
```

#### Opposition Request Flow

```
1. Receive Request
   ↓
2. Update Privacy Preferences
   ↓
3. Stop Opposed Processing
   ↓
4. Notify User
   ↓
5. Mark as Completed
```

### 3. Denying Requests

**Valid Reasons for Denial:**

1. **Request is frivolous or vexatious**
2. **Request would reveal confidential commercial information**
3. **Request violates legal retention requirements**
4. **Request cannot be verified**
5. **Request exceeds technical capabilities**

**Required Documentation:**

```typescript
await updateArcoRequest(requestId, {
  status: 'denied',
  denial_reason: 'User-friendly explanation',
  denial_legal_basis: 'Legal reference (e.g., NOM-004-SSA3-2012 Art. 24)'
}, adminId)
```

---

## SLA Management

### Time Thresholds

| Status | Business Days | Action Required |
|--------|---------------|-----------------|
| 0-5 days | Green Zone | Normal processing |
| 5-15 days | Yellow Zone | Monitor closely |
| 15-18 days | Orange Zone | Prepare escalation |
| 18-20 days | Red Zone | Escalate immediately |
| >20 days | Overdue | Compliance violation |

### Automated Checks

**Daily Job:** Check for requests approaching deadlines

```typescript
// Run daily via cron
import { getRequestsNeedingReminders } from '@/lib/arco/sla-tracker'

const { warning, critical, overdue } = await getRequestsNeedingReminders()

// Send notifications to assigned staff
for (const request of critical) {
  await notifyStaff(request.assigned_to, {
    subject: 'CRITICAL: ARCO Request at 90% SLA',
    message: `Request ${request.id} requires immediate attention`
  })
}
```

### Compliance Reporting

```typescript
import { getSlaMetrics } from '@/lib/arco/sla-tracker'

const metrics = await getSlaMetrics(
  new Date('2026-01-01'),
  new Date('2026-02-01')
)

// Returns:
// - sla_compliance_rate: 98.5%
// - average_response_time_days: 8.2
// - overdue_requests: 2
```

---

## Escalation Procedures

### Escalation Levels

| Level | Responsible Team | Auto-Escalate | Approval Required |
|-------|------------------|---------------|-------------------|
| Tier 1 | Customer Support | Day 5 | No |
| Tier 2 | Data Protection Officer | Day 10 | No |
| Tier 3 | Legal Department | Day 15 | Yes |
| Tier 4 | External Counsel | Day 20 | Yes |

### Escalation Triggers

1. **Time-based:** Automatic at day thresholds
2. **SLA breach:** Immediately when overdue
3. **Complexity:** For legal/medical data
4. **Stuck requests:** No progress for 7 business days
5. **Manual:** Admin can escalate anytime

### Escalation Workflow

```typescript
import { shouldEscalate, escalateRequest } from '@/lib/arco/escalation'

// Check if escalation needed
const decision = await shouldEscalate(request)

if (decision.should_escalate) {
  await escalateRequest(
    request.id,
    adminId,
    decision.reason
  )
}
```

---

## Data Operations

### Access (Data Export)

**Supported Formats:**

- **JSON:** Machine-readable, full data
- **PDF:** Human-readable, formatted report
- **Plain Text:** Simple format for accessibility

**Export Process:**

```typescript
import {
  getUserDataExport,
  exportUserDataToJson,
  exportUserDataToText
} from '@/lib/arco/data-export'

// Get complete data package
const dataPackage = await getUserDataExport(userId, ['all'])

// Export as JSON
const jsonExport = await exportUserDataToJson(userId)

// Export as text
const textExport = await exportUserDataToText(userId)
```

**Data Package Contents:**

```typescript
{
  user_profile: { ... },
  appointments: [ ... ],
  consultations: [ ... ],
  prescriptions: [ ... ],
  payments: [ ... ],
  chat_history: [ ... ],
  privacy_preferences: { ... },
  export_metadata: {
    exported_at: "2026-02-09T12:00:00Z",
    total_records: 42
  }
}
```

### Rectification (Data Amendment)

**Process:**

1. User submits rectification request
2. Admin reviews proposed change
3. For medical data: Get doctor approval
4. Record amendment in audit trail
5. Apply change to database
6. Notify user of completion

```typescript
import { recordDataAmendment, applyDataAmendment } from '@/lib/arco/data-export'

// Record the amendment
await recordDataAmendment(
  requestId,
  'profiles',
  userId,
  'phone',
  '555-0100',
  '555-0199',
  'Número incorrecto',
  userId
)

// After approval, apply it
await applyDataAmendment(amendmentId, adminId)
```

### Cancellation (Data Deletion)

**Retention Policy:**

| Data Type | Retention Period | Deletion Type |
|-----------|------------------|---------------|
| Marketing data | Immediate | Hard delete |
| User profile | After retention | Anonymize |
| Medical records | 5 years | Hard delete |
| Prescriptions | 5 years | Hard delete |
| Payments | 5 years (tax) | Hard delete |
| Chat history | 2 years | Hard delete |

**Deletion Process:**

```typescript
import { planDataDeletion, executeDataDeletion } from '@/lib/arco/data-export'

// Plan the deletion
const plan = await planDataDeletion(requestId, userId)

// Review shows:
// - immediate_deletions: []
// - delayed_deletions: ['appointments', 'prescriptions', ...]
// - requires_anonymization: ['profiles']

// Execute after approval/retention period
await executeDataDeletion(requestId, userId, adminId)
```

### Opposition (Privacy Preferences)

**Update Preferences:**

```typescript
import { updateUserPrivacyPreferences } from '@/lib/arco'

await updateUserPrivacyPreferences(userId, {
  marketing_emails: false,
  analytics_consent: false,
  ai_training_consent: false,
})
```

---

## Compliance Requirements

### Legal References

1. **LFPDPPP Articles 15-23:** ARCO rights
2. **NOM-004-SSA3-2012:** Medical record retention (5 years)
3. **NOM-024-SSA3-2012:** Health information systems
4. **SAT Requirements:** Financial record retention (5 years)

### Required Documentation

For each ARCO request, maintain:

- [x] Request submission details
- [x] Identity verification record
- [x] Processing timeline
- [x] Communications log
- [x] Decision (approve/deny)
- [x] Legal basis for denial (if applicable)
- [x] Data export/deletion record
- [x] User confirmation of delivery

### Audit Trail

All ARCO operations are logged in:

- `arco_request_history` - Status changes
- `arco_communications` - All communications
- `data_amendments` - All corrections
- `data_deletions` - All deletions

---

## Testing

### Unit Tests

```typescript
// src/lib/__tests__/arco.test.ts

describe('ARCO System', () => {
  describe('createArcoRequest', () => {
    it('should create ACCESS request with 20-day due date')
    it('should reject duplicate pending requests')
    it('should validate data scope')
  })

  describe('SLA Tracker', () => {
    it('should calculate business days correctly')
    it('should identify overdue requests')
    it('should trigger escalation at thresholds')
  })

  describe('Data Export', () => {
    it('should export all user data')
    it('should sanitize sensitive fields')
    it('should handle large datasets')
  })
})
```

### Integration Tests

```typescript
describe('ARCO Request Flow', () => {
  it('should complete ACCESS request within SLA')
  it('should properly escalate overdue requests')
  it('should handle rectification with approval')
  it('should respect retention periods on cancellation')
})
```

### Compliance Tests

```typescript
describe('LFPDPPP Compliance', () => {
  it('should respond within 20 business days')
  it('should acknowledge within 24 hours')
  it('should document all denials')
  it('should verify requester identity')
  it('should maintain 5-year medical record retention')
})
```

---

## Monitoring

### Key Metrics

Track these metrics for compliance:

1. **SLA Compliance Rate:** % of requests answered within 20 business days
2. **Average Response Time:** Mean business days to completion
3. **Overdue Rate:** % of requests exceeding SLA
4. **Escalation Rate:** % of requests escalated
5. **Denial Rate:** % of requests denied with valid legal basis

### Alerts

Configure alerts for:

- Requests at 75% SLA (15 days)
- Requests at 90% SLA (18 days)
- Overdue requests
- High-priority requests not acknowledged
- Unusual denial patterns

### Dashboard Queries

```sql
-- Active requests by status
SELECT status, COUNT(*) FROM arco_requests
WHERE status NOT IN ('completed', 'denied', 'cancelled')
GROUP BY status;

-- SLA compliance this month
SELECT
  COUNT(*) FILTER (WHERE completed_at <= due_date) * 100.0 / COUNT(*) as compliance_rate
FROM arco_requests
WHERE completed_at >= DATE_TRUNC('month', NOW());

-- Requests approaching deadline
SELECT id, request_type, due_date - NOW() as time_remaining
FROM arco_requests
WHERE status NOT IN ('completed', 'denied', 'cancelled')
AND due_date - NOW() < INTERVAL '5 days';
```

---

## Troubleshooting

### Common Issues

**Issue:** User cannot submit duplicate request
**Solution:** Previous request must be completed/cancelled first

**Issue:** Cannot delete user due to foreign key constraints
**Solution:** Use anonymization instead of hard delete for profile

**Issue:** Medical records deletion requested
**Solution:** Explain NOM-004 5-year retention requirement

**Issue:** Request escalated to wrong level
**Solution:** Admin can manually adjust escalation level

**Issue:** Data export too large
**Solution:** Implement pagination or limit to recent records

---

## Best Practices

1. **Always verify identity** before providing data
2. **Document everything** for audit purposes
3. **Communicate proactively** with requesters
4. **Monitor SLA compliance** daily
5. **Escalate early** rather than late
6. **Train staff** on LFPDPPP requirements
7. **Review denials** with legal counsel
8. **Maintain retention schedules** rigorously
9. **Test export/deletion** procedures regularly
10. **Keep legal references** up to date

---

## Appendix

### LFPDPPP Quick Reference

| Article | Requirement |
|---------|-------------|
| Art. 15 | Right of Access (Acceso) |
| Art. 16 | Right of Rectification (Rectificación) |
| Art. 17 | Right of Cancellation (Cancelación) |
| Art. 18 | Right of Opposition (Oposición) |
| Art. 18 | 20 business day response SLA |
| Art. 22 | Denial must include legal basis |

### Contact Information

- **Privacy Officer:** privacidad@doctormx.com
- **Legal Counsel:** legal@doctormx.com
- **Data Protection:** dpo@doctormx.com

### Related Documents

- [Privacy Policy](/privacy) - Aviso de Privacidad
- [Terms of Service](/terms) - Términos y Condiciones
- [Mexico Compliance](/docs/compliance/mexico.md) - Full compliance documentation

---

**Document Owner:** Doctor.mx Compliance Team
**Review Date:** Quarterly
**Next Review:** May 2026
