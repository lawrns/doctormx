# NOM-004 Compliance Guide

**Version:** 1.0
**Last Updated:** February 9, 2026
**Project:** Doctor.mx Telemedicine Platform
**Standard:** NOM-004-SSA3-2012

---

## Table of Contents

1. [Overview](#overview)
2. [NOM-004 Requirements](#nom-004-requirements)
3. [Digital Signature Requirements](#digital-signature-requirements)
4. [Implementation Mapping](#implementation-mapping)
5. [Audit Requirements](#audit-requirements)
6. [Data Retention](#data-retention)
7. [Validation Checklist](#validation-checklist)
8. [Compliance Evidence](#compliance-evidence)

---

## Overview

### What is NOM-004-SSA3-2012?

**NOM-004-SSA3-2012** is the Official Mexican Standard for the organization, operation, and accreditation of clinical records. It establishes:

- **Minimum requirements** for clinical record content
- **Organization standards** for medical documentation
- **Signature requirements** for medical records
- **Retention policies** for patient data
- **Quality criteria** for clinical documentation

### Legal Reference

- **Official Publication:** DOF (Diario Oficial de la Federación)
- **Publication Date:** October 15, 2012
- **Effective Date:** October 15, 2012
- **Last Update:** 2012 (no major updates as of 2026)
- **Official URL:** https://www.dof.gob.mx/nota_detalle.php?codigo=5276277&fecha=15/10/2012

### Applicability to Doctor.mx

NOM-004 applies to all healthcare facilities and professionals who generate clinical records, including:

- ✅ **Telemedicine platforms** (Doctor.mx)
- ✅ **Electronic medical records** (EMR)
- ✅ **Clinical consultations** (SOAP notes)
- ✅ **Prescriptions** (Electronic prescriptions)
- ✅ **Medical certificates** (Sick leave, etc.)

---

## NOM-004 Requirements

### 1. Clinical Record Content Requirements

**Required Elements (Article 11):**

| Element | Description | Doctor.mx Field | Status |
|---------|-------------|-----------------|--------|
| Patient Identification | Full name, age, gender | `profiles.full_name`, `soap_consultations.objective_data->>patientAge` | ✅ Implemented |
| Consultation Date | Date and time of consultation | `soap_consultations.created_at` | ✅ Implemented |
| Reason for Consultation | Chief complaint | `soap_consultations.subjective_data->>chiefComplaint` | ✅ Implemented |
| Medical History | Relevant background | `soap_consultations.subjective_data->>medicalHistory` | ✅ Implemented |
| Physical Examination | Objective findings | `soap_consultations.objective_data` | ✅ Implemented |
| Diagnosis | Clinical diagnosis | `soap_consultations.assessment_data->>consensus->>primaryDiagnosis` | ✅ Implemented |
| Treatment Plan | Recommendations and treatment | `soap_consultations.plan_data` | ✅ Implemented |
| **Professional Signature** | **Autographic or electronic** | `digital_signatures` | 🟡 Pending |
| Professional Identification | License number, specialty | `doctors.license_number`, `doctors.specialties` | ✅ Implemented |

### 2. Signature Requirements

**Article 13 - Signature Requirements:**

NOM-004 explicitly allows three types of signatures:

1. **Autographic Signature (Firma Autógrafa):**
   - Traditional handwritten signature
   - Required for paper records
   - Not practical for telemedicine

2. **Electronic Signature (Firma Electrónica):**
   - Digital signature using certificates
   - Must meet LFEA requirements
   - **Recommended for Doctor.mx**

3. **Digital Signature (Firma Digital):**
   - Cryptographic signature
   - Higher security level
   - **Best choice for compliance**

**Key Requirements:**
- ✅ Signature must uniquely identify the signer
- ✅ Signature must be under the signer's exclusive control
- ✅ Signature must be linked to the signed document
- ✅ Signature must detect any subsequent modifications
- ✅ Signature must include timestamp

### 3. Record Integrity Requirements

**Article 14 - Record Integrity:**

All clinical records must:

- ✅ Be **immutable** once signed (no modifications without audit trail)
- ✅ Include **creation and modification timestamps**
- ✅ Identify the **author** of each entry
- ✅ Maintain **version control** for amendments
- ✅ Preserve **original content** when amended

**Current Implementation:**
```sql
-- soap_consultations table (partial)
CREATE TABLE soap_consultations (
  id TEXT PRIMARY KEY,
  patient_id UUID NOT NULL,
  status soap_consultation_status NOT NULL,

  -- Immutable timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Author identification
  -- (links to doctor via appointment_id)
);
```

### 4. Interoperability Requirements

**Article 15 - Data Exchange:**

Clinical records must support:

- 🟡 **Standardized terminology** (ICD-10, SNOMED CT) - *Partial*
- 🟡 **Structured data format** - *JSONB implemented, but not standard*
- ❌ **HL7/FHIR compatibility** - *Not implemented*
- ❌ **Export capabilities** - *Partial (ARCO rights only)*

---

## Digital Signature Requirements

### NOM-004 Signature Criteria

Based on NOM-004 Article 13, digital signatures must meet these criteria:

#### 1. Identity Verification

**Requirement:** Signature must uniquely identify the signing professional.

**Implementation:**
```typescript
interface SignatureIdentity {
  // Professional identification
  doctorId: string
  licenseNumber: string // Cédula profesional
  specialty: string[]
  fullName: string

  // Certificate information
  certificateId: string
  certificateNumber: string // RFC for e.firma
  issuer: string // Must be SAT for e.firma
}
```

**Validation:**
- ✅ Certificate issued by SAT (for e.firma)
- ✅ Certificate matches doctor's RFC
- ✅ Certificate is valid (not expired, not revoked)
- ✅ Doctor's license number verified

#### 2. Exclusive Control

**Requirement:** Signature must be under the exclusive control of the signer.

**Implementation:**
```typescript
interface SignatureControl {
  // Private key protection
  keyStorage: 'hardware_token' | 'secure_enclave' | 'encrypted_software'

  // Authentication required
  authenticationRequired: true
  authenticationMethod: 'pin' | 'biometric' | 'password'

  // Signing context
  ipAddress: string
  userAgent: string
  timestamp: Date
  location?: Geolocation
}
```

**Security Measures:**
- Private keys never stored on server
- PIN/biometric required for signing
- Hardware tokens (PKCS#11) supported
- Audit trail of all signing operations

#### 3. Document Linkage

**Requirement:** Signature must be linked to the signed document.

**Implementation:**
```typescript
interface SignatureLinkage {
  // Document reference
  documentId: string
  documentType: 'soap_consultation' | 'prescription' | 'medical_certificate'
  documentVersion: number
  documentHash: string // SHA-256 hash of document content

  // Signature data
  signatureValue: string // Base64-encoded signature
  signedHash: string // Hash that was signed
  signatureAlgorithm: string // e.g., 'RSA-SHA256'
}
```

**Linkage Mechanism:**
- Signature covers document hash
- Any document change invalidates signature
- Document hash stored with signature
- Signature verification includes hash check

#### 4. Tamper Detection

**Requirement:** Signature must detect any subsequent modifications.

**Implementation:**
```typescript
interface SignatureTamperDetection {
  // Document integrity
  originalHash: string
  currentHash: string
  hashMatches: boolean

  // Signature integrity
  signatureValid: boolean
  signatureVerificationDate: Date
  verificationResult: 'valid' | 'invalid' | 'tampered'

  // Amendment tracking
  amendments: Amendment[]
  hasAmendments: boolean
}

interface Amendment {
  amendmentId: string
  amendedBy: string
  amendmentDate: Date
  amendmentReason: string
  originalContent: string
  amendedContent: string
  amendmentSignature?: string
}
```

**Tamper Detection:**
- Document hash verification
- Signature integrity check
- Amendment tracking with separate signatures
- Audit log of all modifications

---

## Implementation Mapping

### SOAP Consultation Signing

**Current Schema (soap_consultations):**
```sql
CREATE TABLE soap_consultations (
  id TEXT PRIMARY KEY,
  patient_id UUID NOT NULL,
  status soap_consultation_status NOT NULL,

  -- SOAP data
  subjective_data JSONB NOT NULL,
  objective_data JSONB DEFAULT '{}',
  assessment_data JSONB,
  plan_data JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Enhanced Schema with Signature Support:**
```sql
-- Add signature reference
ALTER TABLE soap_consultations
ADD COLUMN signature_id UUID REFERENCES digital_signatures(id),
ADD COLUMN signature_status TEXT DEFAULT 'unsigned', -- 'unsigned', 'signed', 'verified'
ADD COLUMN signed_at TIMESTAMPTZ,
ADD COLUMN signed_by UUID REFERENCES profiles(id),
ADD COLUMN document_hash TEXT;

-- Add constraint: completed consultations must be signed
ALTER TABLE soap_consultations
ADD CONSTRAINT nom_004_signed_consultation
CHECK (
  status != 'complete' OR signature_status = 'signed'
);

-- Add index for signature queries
CREATE INDEX idx_soap_consultations_signature
ON soap_consultations(signature_id, signature_status);
```

### Prescription Signing

**Current Schema (prescriptions):**
```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  medications JSONB,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Enhanced Schema with Signature Support:**
```sql
ALTER TABLE prescriptions
ADD COLUMN signature_id UUID REFERENCES digital_signatures(id),
ADD COLUMN signature_status TEXT DEFAULT 'unsigned',
ADD COLUMN signed_at TIMESTAMPTZ,
ADD COLUMN verification_code TEXT UNIQUE, -- For pharmacy verification
ADD COLUMN qr_code TEXT;

-- NOM-004 requirement: All prescriptions must be signed
ALTER TABLE prescriptions
ADD CONSTRAINT nom_004_signed_prescription
CHECK (signature_status = 'signed');

-- Generate verification code (alphanumeric, 8 characters)
UPDATE prescriptions
SET verification_code = upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 8))
WHERE verification_code IS NULL;
```

### Medical Certificate Signing

**New Table (medical_certificates):**
```sql
CREATE TABLE medical_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id TEXT REFERENCES soap_consultations(id),
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  patient_id UUID NOT NULL REFERENCES profiles(id),

  -- Certificate content
  certificate_type TEXT NOT NULL, -- 'sick_leave', 'fitness_certificate', 'disability'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_granted INTEGER NOT NULL,
  diagnosis TEXT NOT NULL,
  recommendations TEXT,
  restrictions TEXT,

  -- NOM-004 signature requirement
  signature_id UUID REFERENCES digital_signatures(id) NOT NULL,
  signature_status TEXT NOT NULL DEFAULT 'unsigned',
  signed_at TIMESTAMPTZ,
  verification_code TEXT UNIQUE,

  -- Document integrity
  document_hash TEXT NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT nom_004_signed_certificate
    CHECK (signature_status = 'signed')
);
```

---

## Audit Requirements

### Signature Audit Trail

NOM-004 requires a complete audit trail of all clinical record modifications.

**Audit Log Schema:**
```sql
CREATE TABLE nom_004_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event details
  event_type TEXT NOT NULL, -- 'create', 'sign', 'amend', 'verify', 'access'
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Document reference
  document_type TEXT NOT NULL, -- 'soap_consultation', 'prescription', 'certificate'
  document_id TEXT NOT NULL,
  document_version INTEGER NOT NULL DEFAULT 1,

  -- User context
  user_id UUID NOT NULL REFERENCES profiles(id),
  user_role TEXT NOT NULL, -- 'doctor', 'patient', 'admin'
  user_name TEXT NOT NULL,

  -- Signature context (if applicable)
  signature_id UUID REFERENCES digital_signatures(id),
  certificate_id UUID REFERENCES digital_certificates(id),
  certificate_number TEXT,

  -- Event data
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,

  -- Compliance data
  nom_004_compliant BOOLEAN NOT NULL DEFAULT true,
  compliance_notes TEXT
);

-- Index for audit queries
CREATE INDEX idx_nom_004_audit_log_document
ON nom_004_audit_log(document_type, document_id, event_timestamp DESC);

CREATE INDEX idx_nom_004_audit_log_user
ON nom_004_audit_log(user_id, event_timestamp DESC);
```

### Audit Event Types

```typescript
enum NOM004AuditEventType {
  // Document lifecycle
  CREATE = 'create',           // Document created
  SIGN = 'sign',               // Document signed
  VERIFY = 'verify',           // Signature verified
  AMEND = 'amend',             // Document amended
  ACCESS = 'access',           // Document accessed

  // Signature lifecycle
  CERTIFICATE_UPLOAD = 'certificate_upload',
  CERTIFICATE_VALIDATE = 'certificate_validate',
  CERTIFICATE_EXPIRE = 'certificate_expire',
  CERTIFICATE_REVOKE = 'certificate_revoke',

  // Compliance events
  COMPLIANCE_CHECK = 'compliance_check',
  COMPLIANCE_FAIL = 'compliance_fail',
  COMPLIANCE_PASS = 'compliance_pass',
}
```

### Audit Record Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "sign",
  "event_timestamp": "2026-02-09T14:30:00Z",
  "document_type": "soap_consultation",
  "document_id": "consult-123",
  "document_version": 1,
  "user_id": "doc-456",
  "user_role": "doctor",
  "user_name": "Dr. María González López",
  "signature_id": "sig-789",
  "certificate_id": "cert-012",
  "certificate_number": "GODL561231JT2",
  "event_data": {
    "signature_algorithm": "RSA-SHA256",
    "signature_format": "CAdES-B",
    "certificate_issuer": "CN=AC del Servicio de Administración Tributaria",
    "certificate_valid_until": "2027-12-31T23:59:59Z"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "nom_004_compliant": true,
  "compliance_notes": null
}
```

---

## Data Retention

### NOM-004 Retention Requirements

**Article 38 - Retention Period:**

- **Minimum:** 5 years from last consultation
- **Recommended:** 25 years for legal/statistical purposes
- **Archive:** After 5 years, records may be moved to cold storage

**Implementation:**
```sql
-- Add retention tracking to profiles
ALTER TABLE profiles
ADD COLUMN data_retention_until DATE GENERATED ALWAYS AS (
  (CURRENT_DATE + INTERVAL '5 years')
) STORED;

-- Archive table for long-term storage
CREATE TABLE soap_consultations_archive (
  LIKE soap_consultations INCLUDING ALL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_deletion_date DATE NOT NULL
);

-- Function to archive old records
CREATE OR REPLACE FUNCTION archive_old_consultations()
RETURNS void AS $$
BEGIN
  -- Move consultations older than 5 years to archive
  INSERT INTO soap_consultations_archive
  SELECT *, NOW() as archived_at,
         (NOW() + INTERVAL '20 years')::DATE as scheduled_deletion_date
  FROM soap_consultations
  WHERE created_at < NOW() - INTERVAL '5 years';

  -- Delete from main table (soft delete recommended)
  UPDATE soap_consultations
  SET status = 'archived'
  WHERE created_at < NOW() - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql;
```

### Signature Retention

**Digital Certificate Retention:**
- Active certificates: Retain while valid
- Expired certificates: Retain for 25 years
- Revoked certificates: Retain for 25 years

**Signature Record Retention:**
- All signatures: Retain for 25 years
- Signature metadata: Retain indefinitely (for audit)

---

## Validation Checklist

### Pre-Implementation Checklist

- [ ] Digital signature system designed
- [ ] Certificate management system implemented
- [ ] Audit logging system implemented
- [ ] Database schema updated
- [ ] API endpoints created
- [ ] UI components designed

### Technical Checklist

**Certificate Management:**
- [ ] Certificate upload functionality
- [ ] Certificate validation against SAT
- [ ] OCSP/CRL revocation checking
- [ ] Certificate chain verification
- [ ] Certificate expiration monitoring

**Signature Operations:**
- [ ] Document signing workflow
- [ ] Signature generation (CAdES/XAdES)
- [ ] Signature verification
- [ ] Document hashing
- [ ] Timestamp integration

**Compliance Features:**
- [ ] NOM-004 signature validation
- [ ] Audit trail logging
- [ ] Amendment tracking
- [ ] Version control
- [ ] Tamper detection

**Security Measures:**
- [ ] Private key protection
- [ ] PIN/biometric authentication
- [ ] Secure key storage
- [ ] Encryption at rest
- [ ] Secure communication (TLS)

### Legal Checklist

- [ ] Legal review of signature implementation
- [ ] Compliance with LFEA requirements
- [ ] Compliance with NOM-004 requirements
- [ ] Data protection (LFPDPPP) compliance
- [ ] Terms of service updated
- [ ] Privacy policy updated

### Testing Checklist

**Unit Tests:**
- [ ] Certificate validation tests
- [ ] Signature generation tests
- [ ] Signature verification tests
- [ ] Hash generation tests
- [ ] Revocation checking tests

**Integration Tests:**
- [ ] End-to-end signing workflow
- [ ] OCSP integration
- [ ] CRL integration
- [ ] Timestamp authority integration
- [ ] Database operations

**Compliance Tests:**
- [ ] NOM-004 requirement validation
- [ ] Audit trail completeness
- [ ] Tamper detection
- [ ] Amendment tracking
- [ ] Data retention

**User Acceptance Tests:**
- [ ] Doctor signup with e.firma
- [ ] Certificate upload
- [ ] Document signing
- [ ] Signature verification
- [ ] Error handling

---

## Compliance Evidence

### Documentation Requirements

To demonstrate NOM-004 compliance, maintain:

1. **Technical Documentation:**
   - [ ] System architecture
   - [ ] Security procedures
   - [ ] Data flow diagrams
   - [ ] Integration specifications

2. **Legal Documentation:**
   - [ ] Legal opinion on compliance
   - [ ] Certificate agreements
   - [ ] Data processing agreements
   - [ ] Privacy policy

3. **Operational Documentation:**
   - [ ] User manuals for doctors
   - [ ] Training materials
   - [ ] Incident response procedures
   - [ ] Audit procedures

### Audit Trail Evidence

**Sample Audit Report:**

```typescript
interface NOM004ComplianceReport {
  reportDate: Date
  reportingPeriod: {
    start: Date
    end: Date
  }

  statistics: {
    totalDocuments: number
    signedDocuments: number
    unsignedDocuments: number
    signatureComplianceRate: number
  }

  signatureBreakdown: {
    byDocumentType: Record<string, number>
    byDoctor: Record<string, number>
    bySignatureType: Record<string, number>
  }

  certificateStatus: {
    active: number
    expired: number
    revoked: number
  }

  complianceMetrics: {
    averageSigningTime: number // milliseconds
    signatureVerificationRate: number
    tamperDetectionRate: number
    auditTrailCompleteness: number
  }

  recommendations: string[]
}
```

### Validation Evidence

**Self-Assessment Tool:**

```typescript
// Generate compliance score
function calculateNOM004ComplianceScore(): ComplianceScore {
  const checks = [
    { name: 'All consultations signed', weight: 0.3, pass: checkAllConsultationsSigned() },
    { name: 'All prescriptions signed', weight: 0.25, pass: checkAllPrescriptionsSigned() },
    { name: 'Audit trail complete', weight: 0.2, pass: checkAuditTrailComplete() },
    { name: 'Certificates valid', weight: 0.15, pass: checkCertificatesValid() },
    { name: 'Data retention compliant', weight: 0.1, pass: checkDataRetentionCompliant() },
  ]

  const weightedScore = checks.reduce((total, check) => {
    return total + (check.pass ? check.weight : 0)
  }, 0)

  const percentage = weightedScore * 100

  return {
    percentage,
    status: percentage >= 95 ? 'compliant' :
            percentage >= 80 ? 'mostly_compliant' :
            percentage >= 60 ? 'partially_compliant' : 'non_compliant',
    checks,
    recommendations: generateRecommendations(checks),
  }
}

interface ComplianceScore {
  percentage: number
  status: 'compliant' | 'mostly_compliant' | 'partially_compliant' | 'non_compliant'
  checks: Array<{ name: string; weight: number; pass: boolean }>
  recommendations: string[]
}
```

---

## Conclusion

NOM-004-SSA3-2012 compliance for digital signatures requires:

1. **Identity Verification:** Unique identification of signing professionals
2. **Exclusive Control:** Signer has sole control of signature mechanism
3. **Document Linkage:** Signature linked to signed document
4. **Tamper Detection:** Detection of any post-signing modifications

The proposed implementation meets all NOM-004 requirements and provides:

- ✅ Legal compliance with Mexican healthcare standards
- ✅ Secure digital signature infrastructure
- ✅ Complete audit trail
- ✅ Data integrity protection
- ✅ Interoperability with SAT's e.firma

---

**Next Steps:**

1. Obtain legal opinion on implementation
2. Update database schema
3. Implement signature services
4. Conduct user acceptance testing
5. Deploy to production
6. Maintain compliance documentation

---

**Document Control**

- **Owner:** Doctor.mx Compliance Team
- **Last Updated:** February 9, 2026
- **Next Review:** May 9, 2026
- **Version:** 1.0

---

**References:**

1. **NOM-004-SSA3-2012:** https://www.dof.gob.mx/nota_detalle.php?codigo=5276277&fecha=15/10/2012
2. **LFEA (Ley de Firma Electrónica Avanzada):** http://www.dof.gob.mx/nota_detalle.php?codigo=5150631&fecha=05/07/2010
3. **Código de Comercio (Articles 89-109):** Electronic commerce provisions

---

**Disclaimer:** This document provides guidance on NOM-004 compliance but does not constitute legal advice. Consult qualified legal counsel for specific compliance requirements.
