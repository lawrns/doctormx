# Patient Consent Management System

**Sistema de Gestión de Consentimiento de Pacientes**

Comprehensive consent management system for Doctor.mx telemedicine platform, implementing LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares) compliance requirements.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Compliance](#compliance)
9. [Testing](#testing)
10. [Maintenance](#maintenance)

---

## Overview

The Patient Consent Management System provides a comprehensive framework for managing user consent throughout their lifecycle on the Doctor.mx platform. It ensures compliance with Mexican data protection laws (LFPDPPP) while providing flexibility for various consent scenarios.

### Key Principles

- **Dynamic Consent**: Users can withdraw consent at any time (except for essential consents)
- **Transparent Versioning**: All changes to consent documents are tracked and versioned
- **Age-Appropriate**: Special handling for minors requiring guardian consent
- **Complete Audit Trail**: Every consent action is logged for compliance
- **User-Friendly**: Clear, accessible consent interfaces

---

## Features

### 1. Dynamic Consent Management

```typescript
// Grant consent
await grantConsent({
  user_id: 'user-123',
  consent_type: 'telemedicine',
  consent_version_id: 'version-456',
  delivery_method: 'click_wrap',
})

// Withdraw consent
await withdrawConsent({
  consent_record_id: 'consent-789',
  withdrawal_reason: 'User requested withdrawal',
})

// Check if user has consent
const hasConsent = await hasUserConsent('user-123', 'telemedicine')
```

### 2. Consent Versioning

- Semantic versioning (e.g., 1.0.0, 1.1.0, 2.0.0)
- Automatic comparison between versions
- Re-consent requirements for major changes
- Version history tracking

```typescript
// Compare versions
const comparison = await compareConsentVersions('v1-id', 'v2-id')
console.log(comparison.requires_re_consent) // true for major changes

// Check if user needs to re-consent
const needsReConsent = await checkIfReConsentRequired('user-123', 'telemedicine')
```

### 3. Age Verification & Guardian Consent

```typescript
// Verify age and check requirements
const verification = await verifyAgeAndConsentRequirements(
  'user-123',
  'medical_treatment',
  '2010-05-15' // date of birth
)

if (verification.requires_guardian) {
  // Create guardian consent
  await createGuardianConsent({
    user_id: 'user-123',
    guardian_name: 'Juan Pérez',
    guardian_relationship: 'parent',
    guardian_contact: 'juan@example.com',
    verification_method: 'document_upload',
    consent_scope: ['medical_treatment', 'data_processing'],
  })
}
```

### 4. Consent History & Audit Trail

```typescript
// Get consent history
const history = await getConsentHistory('consent-record-id')

// Get audit logs
const auditLogs = await getAuditLogsForUser('user-123', {
  eventType: 'consent_granted',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
})

// Export for compliance
const csvExport = await exportConsentHistory('user-123', 'csv')
```

### 5. Consent Requests & Reminders

```typescript
// Create consent request
await createConsentRequest(
  'user-123',
  ['telemedicine', 'recording'],
  'version_update'
)

// Get pending requests
const pending = await getPendingConsentRequests('user-123')
```

---

## Architecture

### Directory Structure

```
src/lib/consent/
├── index.ts          # Core consent system
├── types.ts          # TypeScript type definitions
├── history.ts        # Consent history tracking
└── versioning.ts     # Consent version management
```

### Database Tables

```
consent_versions         # Consent document versions
user_consent_records     # User granted consents
guardian_consent_records # Guardian consents for minors
consent_history          # Audit history
consent_requests         # Pending consent requests
consent_audit_logs       # Comprehensive audit trail
```

### Data Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├─→ grantConsent()
       │   ├─→ Verify age
       │   ├─→ Check guardian requirement
       │   ├─→ Create consent record
       │   └─→ Track in history
       │
       ├─→ withdrawConsent()
       │   ├─→ Validate withdrawal allowed
       │   ├─→ Update consent status
       │   └─→ Track in history
       │
       ├─→ hasUserConsent()
       │   └─→ Check active consent
       │
       └─→ getUserConsentSummary()
           └─→ Aggregate consent data
```

---

## Installation

### 1. Run Database Migration

```bash
# Apply the consent system migration
psql -U postgres -d doctormx -f supabase/migrations/20250209_consent_system.sql
```

### 2. Install Dependencies

```bash
# No additional dependencies required
# Uses existing Supabase client
```

### 3. Initialize Consent Versions

```typescript
import { createConsentVersion } from '@/lib/consent'

// Create initial consent versions
await createConsentVersion({
  consent_type: 'medical_treatment',
  version: '1.0.0',
  title: 'Consentimiento para Tratamiento Médico',
  description: '...',
  legal_text: '...',
  category: 'essential',
  effective_date: new Date().toISOString(),
}, 'admin-user-id')
```

---

## Usage

### Basic Consent Flow

```typescript
import {
  grantConsent,
  withdrawConsent,
  hasUserConsent,
  getUserConsentSummary
} from '@/lib/consent'

// 1. Check if user needs to grant consent
if (!await hasUserConsent(userId, 'telemedicine')) {
  // 2. Present consent to user
  // 3. User grants consent
  await grantConsent({
    user_id: userId,
    consent_type: 'telemedicine',
    consent_version_id: latestVersion.id,
    delivery_method: 'click_wrap',
  })
}

// 4. Get consent summary for dashboard
const summary = await getUserConsentSummary(userId)
console.log(`Active consents: ${summary.active_consents}`)
```

### Guardian Consent for Minors

```typescript
import {
  verifyAgeAndConsentRequirements,
  createGuardianConsent,
  grantConsent
} from '@/lib/consent'

// 1. Verify age
const ageCheck = await verifyAgeAndConsentRequirements(
  userId,
  'medical_treatment',
  dateOfBirth
)

// 2. If minor, create guardian consent
if (ageCheck.requires_guardian) {
  const guardianConsent = await createGuardianConsent({
    user_id: userId,
    guardian_name: 'María González',
    guardian_relationship: 'parent',
    guardian_contact: 'maria@example.com',
    verification_method: 'document_upload',
    consent_scope: ['medical_treatment', 'data_processing'],
  })

  // 3. Grant consent with guardian reference
  await grantConsent({
    user_id: userId,
    consent_type: 'medical_treatment',
    consent_version_id: versionId,
    delivery_method: 'click_wrap',
    guardian_consent_record_id: guardianConsent.id,
  })
}
```

### Version Updates

```typescript
import {
  incrementConsentVersion,
  getConsentTypesRequiringReConsent,
  createConsentRequest
} from '@/lib/consent'

// 1. Create new version with major changes
const newVersion = await incrementConsentVersion(
  'telemedicine',
  'major', // Major version increment (1.0.0 → 2.0.0)
  'admin-user-id'
)

// 2. Find users who need to re-consent
for (const user of allUsers) {
  const needsReConsent = await checkIfReConsentRequired(
    user.id,
    'telemedicine'
  )

  if (needsReConsent) {
    await createConsentRequest(
      user.id,
      ['telemedicine'],
      'version_update'
    )
  }
}
```

### Compliance Reporting

```typescript
import {
  generateComplianceReport,
  getAuditLogStatistics
} from '@/lib/consent'

// Generate monthly compliance report
const report = await generateComplianceReport(
  new Date('2026-01-01'),
  new Date('2026-01-31')
)

console.log('Compliance Rate:', report.consent_type_breakdown)

// Get audit statistics
const stats = await getAuditLogStatistics(
  new Date('2026-01-01'),
  new Date('2026-01-31')
)

console.log('Total Events:', stats.total_events)
console.log('Events by Type:', stats.events_by_type)
```

---

## API Reference

### Core Functions

#### `grantConsent(input: GrantConsentInput): Promise<UserConsentRecord>`

Grant consent for a user.

**Parameters:**
- `user_id`: User ID
- `consent_type`: Type of consent to grant
- `consent_version_id`: Version of consent document
- `delivery_method`: How consent was delivered
- `date_of_birth`: Optional date of birth for age verification
- `guardian_consent_record_id`: Optional guardian consent ID for minors
- `metadata`: Optional additional data

**Returns:** Created consent record

**Throws:** `ConsentError` if validation fails

---

#### `withdrawConsent(input: WithdrawConsentInput): Promise<UserConsentRecord>`

Withdraw previously granted consent.

**Parameters:**
- `consent_record_id`: ID of consent record to withdraw
- `withdrawal_reason`: Reason for withdrawal
- `withdrawn_by`: Who is withdrawing ('user', 'guardian', 'admin')

**Returns:** Updated consent record

**Throws:** `ConsentError` if consent cannot be withdrawn

---

#### `hasUserConsent(userId: string, consentType: ConsentType, versionId?: string): Promise<boolean>`

Check if user has granted valid consent.

**Parameters:**
- `userId`: User ID
- `consentType`: Type of consent to check
- `versionId`: Optional specific version to check

**Returns:** `true` if user has valid consent

---

#### `getUserConsents(userId: string, filter?: ConsentFilter): Promise<UserConsentRecord[]>`

Get all consents for a user.

**Parameters:**
- `userId`: User ID
- `filter`: Optional filter options

**Returns:** Array of consent records

---

#### `getUserConsentSummary(userId: string): Promise<UserConsentSummary>`

Get consent summary for dashboard display.

**Parameters:**
- `userId`: User ID

**Returns:** Consent summary with statistics

---

### Versioning Functions

#### `createConsentVersion(input: CreateConsentVersionInput, createdBy: string): Promise<ConsentVersion>`

Create a new consent version.

**Parameters:**
- `consent_type`: Type of consent
- `version`: Semantic version number
- `title`: Consent title
- `description`: Consent description
- `legal_text`: Full legal text
- `category`: Consent category
- `effective_date`: When version becomes effective
- `required_for_new_users`: If true, new users must accept
- `requires_re_consent`: If true, existing users must re-consent
- Additional optional parameters...

**Returns:** Created consent version

---

#### `compareConsentVersions(oldVersionId: string, newVersionId: string): Promise<VersionComparison>`

Compare two consent versions.

**Parameters:**
- `oldVersionId`: Old version ID
- `newVersionId`: New version ID

**Returns:** Comparison result with changes

---

#### `checkIfReConsentRequired(userId: string, consentType: string): Promise<boolean>`

Check if user needs to re-consent due to version changes.

**Parameters:**
- `userId`: User ID
- `consentType`: Type of consent

**Returns:** `true` if re-consent is required

---

### History & Audit Functions

#### `trackConsentGranted(consentRecordId: string, userId: string, metadata?: Record<string, unknown>): Promise<ConsentHistoryEntry>`

Track consent granted event in history.

**Parameters:**
- `consentRecordId`: Consent record ID
- `userId`: User who granted consent
- `metadata`: Optional additional data

**Returns:** Created history entry

---

#### `getConsentHistory(consentRecordId: string): Promise<ConsentHistoryEntry[]>`

Get history for a specific consent record.

**Parameters:**
- `consentRecordId`: Consent record ID

**Returns:** Array of history entries

---

#### `getAuditLogsForUser(userId: string, options?: AuditLogOptions): Promise<ConsentAuditLog[]>`

Get audit logs for a user.

**Parameters:**
- `userId`: User ID
- `options`: Optional filters (event type, date range, limit)

**Returns:** Array of audit log entries

---

#### `exportConsentHistory(userId: string, format: 'json' | 'csv'): Promise<string>`

Export consent history for compliance requests.

**Parameters:**
- `userId`: User ID
- `format`: Export format ('json' or 'csv')

**Returns:** Exported data as string

---

### Guardian Consent Functions

#### `createGuardianConsent(input: CreateGuardianConsentInput): Promise<GuardianConsentRecord>`

Create guardian consent record for a minor.

**Parameters:**
- `user_id`: Minor's user ID
- `guardian_name`: Guardian's full name
- `guardian_relationship`: Relationship to minor
- `guardian_contact`: Guardian's contact information
- `verification_method`: How guardian was verified
- `consent_scope`: Types of consent guardian can grant
- Additional optional parameters...

**Returns:** Created guardian consent record

---

#### `hasValidGuardianConsent(userId: string, consentType: ConsentType): Promise<boolean>`

Check if valid guardian consent exists for a minor.

**Parameters:**
- `userId`: Minor's user ID
- `consentType`: Type of consent to check

**Returns:** `true` if valid guardian consent exists

---

## Database Schema

### Consent Versions

```sql
CREATE TABLE consent_versions (
  id UUID PRIMARY KEY,
  consent_type consent_type NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  legal_text TEXT NOT NULL,
  category consent_category NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  deprecated_date TIMESTAMPTZ,
  required_for_new_users BOOLEAN DEFAULT true,
  requires_re_consent BOOLEAN DEFAULT false,
  data_retention_period TEXT,
  third_party_sharing TEXT[],
  age_restriction JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL,
  UNIQUE(consent_type, version)
);
```

### User Consent Records

```sql
CREATE TABLE user_consent_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  consent_type consent_type NOT NULL,
  consent_version_id UUID NOT NULL REFERENCES consent_versions(id),
  status consent_status NOT NULL DEFAULT 'granted',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_method consent_delivery_method NOT NULL,
  age_verification age_verification_status NOT NULL,
  guardian_consent_record_id UUID REFERENCES guardian_consent_records(id),
  withdrawn_at TIMESTAMPTZ,
  withdrawal_reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

### Guardian Consent Records

```sql
CREATE TABLE guardian_consent_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  guardian_name TEXT NOT NULL,
  guardian_relationship guardian_relationship NOT NULL,
  guardian_contact TEXT NOT NULL,
  verification_method TEXT NOT NULL,
  consent_scope consent_type[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  effective_date TIMESTAMPTZ NOT NULL,
  expiration_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL
);
```

---

## Compliance

### LFPDPPP Requirements

The system implements the following LFPDPPP requirements:

1. **Explicit Consent**: All consents require explicit user action
2. **Purpose Specification**: Clear description of data processing purposes
3. **Data Minimization**: Only collect necessary data for each consent type
4. **ARCO Rights**: Integration with ARCO system for data rights
5. **Audit Trail**: Complete logging of all consent events
6. **Withdrawal Rights**: Users can withdraw non-essential consents
7. **Age Verification**: Special handling for minors
8. **Version Control**: Tracking of consent document changes

### Consent Categories

#### Essential (Cannot be withdrawn)
- `medical_treatment`: Required for providing medical services
- `emergency_contact`: Required for emergency situations

#### Functional (Required for specific features)
- `telemedicine`: Required for video consultations
- `recording`: Required for consultation recording
- `data_sharing`: Required for sharing with specialists
- `prescription_forwarding`: Required for pharmacy integration

#### Analytical (For improvement)
- `ai_analysis`: For AI-powered consultation analysis
- `research`: For research and statistics

#### Marketing (Optional)
- `marketing`: For promotional communications

#### Legal (Required by law)
- `data_processing`: Required by LFPDPPP

### Data Retention

Consent records follow these retention periods:

| Consent Type | Retention Period | Legal Basis |
|--------------|------------------|-------------|
| Medical Treatment | 5 years active, 25 years archive | NOM-004-SSA3-2012 |
| Data Processing | Until purpose fulfilled + legal retention | LFPDPPP |
| Telemedicine | 5 years active | NOM-004-SSA3-2012 |
| Marketing | Until withdrawal + 1 year | LFPDPPP |

---

## Testing

### Unit Tests

```typescript
import { grantConsent, withdrawConsent, hasUserConsent } from '@/lib/consent'

describe('Consent Management', () => {
  it('should grant consent', async () => {
    const consent = await grantConsent({
      user_id: 'test-user',
      consent_type: 'telemedicine',
      consent_version_id: 'test-version',
      delivery_method: 'click_wrap',
    })

    expect(consent.status).toBe('granted')
  })

  it('should check consent status', async () => {
    const hasConsent = await hasUserConsent('test-user', 'telemedicine')
    expect(hasConsent).toBe(true)
  })

  it('should withdraw consent', async () => {
    const withdrawn = await withdrawConsent({
      consent_record_id: 'test-consent',
      withdrawal_reason: 'User requested',
    })

    expect(withdrawn.status).toBe('withdrawn')
  })
})
```

### Integration Tests

```typescript
describe('Consent Versioning', () => {
  it('should detect version changes', async () => {
    const comparison = await compareConsentVersions('v1', 'v2')

    expect(comparison.has_major_changes).toBeDefined()
    expect(comparison.changes).toBeDefined()
  })

  it('should require re-consent for major changes', async () => {
    const needsReConsent = await checkIfReConsentRequired(
      'test-user',
      'telemedicine'
    )

    expect(needsReConsent).toBe(true)
  })
})
```

---

## Maintenance

### Regular Tasks

#### Daily
- Process expired consents (automated via cron job)
- Send consent reminders for pending requests

#### Weekly
- Review consent requests approaching expiration
- Generate compliance reports

#### Monthly
- Review and update consent versions if needed
- Audit consent history for anomalies
- Generate compliance summary

#### Quarterly
- Full compliance audit
- Review age verification procedures
- Update guardian consent processes

### Automated Jobs

```typescript
// Expire old consents (runs daily)
import { expireOldConsents } from '@/lib/consent'

async function dailyMaintenance() {
  // This function is called by a scheduled job
  // The database function expire_old_consents() is executed
  // to automatically expire consents past their expiration date
}

// Send reminders for pending consent requests
async function sendReminders() {
  const pendingRequests = await getPendingRequestsRequiringReminder()
  for (const request of pendingRequests) {
    await sendConsentReminder(request.user_id, request.consent_type)
  }
}
```

### Monitoring

Key metrics to monitor:

- Consent grant rate
- Consent withdrawal rate
- Pending consent requests
- Re-consent required percentage
- Guardian consent verification time
- Audit log size and growth

---

## Troubleshooting

### Common Issues

#### Issue: User cannot withdraw essential consent

**Solution**: Essential consents (`medical_treatment`, `emergency_contact`) cannot be withdrawn as they are required for service delivery.

#### Issue: Guardian consent not recognized

**Solution**: Ensure:
1. Guardian consent record has `status: 'active'`
2. Guardian consent `consent_scope` includes the consent type
3. Guardian consent has not expired

#### Issue: Re-consent not triggered after version update

**Solution**: Verify:
1. New version has `requires_re_consent: true`
2. New version is the latest active version
3. Version's `effective_date` has passed

#### Issue: Age verification fails

**Solution**: Check:
1. User's `date_of_birth` is set in profiles table
2. Consent version's `age_restriction` settings
3. Minimum age matches legal requirement (18 in Mexico)

---

## References

- [LFPDPPP Full Text](http://www.dof.gob.mx/nota_detalle.php?codigo=5150631&fecha=05/07/2010)
- [NOM-004-SSA3-2012](https://www.dof.gob.mx/nota_detalle.php?codigo=5276277&fecha=15/10/2012)
- [ARCO Rights System](/docs/arco/README.md)
- [Mexico Compliance Documentation](/docs/compliance/mexico.md)

---

**Document Version**: 1.0.0
**Last Updated**: 2026-02-09
**Maintained By**: Doctor.mx Compliance Team
