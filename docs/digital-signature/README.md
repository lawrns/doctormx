# Digital Signature Integration - Doctor.mx

**Version:** 1.0
**Last Updated:** February 9, 2026
**Status:** Design Phase
**Project:** Doctor.mx Telemedicine Platform

---

## Overview

This directory contains the complete design and implementation guide for integrating digital signature capabilities into Doctor.mx, ensuring compliance with Mexican healthcare regulations, particularly NOM-004-SSA3-2012.

### What is e.firma?

**e.firma** (formerly FIEL - Firma Electrónica Avanzada) is Mexico's official advanced electronic signature issued by the SAT (Tax Administration Service). It provides:

- **Legal Validity:** Equivalent to handwritten signature under Mexican law (LFEA)
- **Identity Verification:** In-person identity verification by SAT
- **Wide Acceptance:** Accepted by government agencies and private entities
- **Secure Technology:** X.509 v3 certificates with RSA key pairs

### Why Digital Signatures for Doctor.mx?

1. **Legal Compliance:** NOM-004-SSA3-2012 requires electronic/digital signatures for medical records
2. **Non-Repudiation:** Doctors cannot deny having signed documents
3. **Data Integrity:** Any modification to signed records is detectable
4. **Efficiency:** Streamlined workflow for signing prescriptions and clinical notes
5. **Patient Trust:** Enhanced security and legal validity for medical records

---

## Documentation Structure

### 1. Architecture (`architecture.md`)

**Purpose:** High-level system architecture and component design

**Contents:**
- System architecture overview
- Component design (Signature Service, Document Service, Compliance Service)
- Database schema for digital signatures
- Data flow diagrams
- Security architecture
- Scalability considerations
- Integration points

**Key Diagrams:**
- High-level architecture diagram
- Signature Service architecture
- Document signing flow
- Signature verification flow

**Who Should Read:** System architects, technical leads, DevOps engineers

### 2. e.firma Integration Guide (`e-firma-integration.md`)

**Purpose:** Technical implementation guide for SAT's e.firma integration

**Contents:**
- e.firma technical specifications
- Integration architecture
- Certificate loading and validation
- OCSP/CRL revocation checking
- Signature generation and verification
- User workflow implementation
- Error handling
- Testing strategy
- Troubleshooting

**Code Examples:**
- Certificate loading utilities
- Certificate validation logic
- OCSP validation implementation
- CRL checking implementation
- Signature generation
- Signature verification
- React hooks for certificate upload
- UI components for signing

**Who Should Read:** Full-stack developers, frontend developers, backend developers

### 3. NOM-004 Compliance (`nom-004-compliance.md`)

**Purpose:** Mapping of NOM-004 requirements to technical implementation

**Contents:**
- NOM-004 requirements overview
- Digital signature requirements per NOM-004
- Implementation mapping for:
  - SOAP consultations
  - Prescriptions
  - Medical certificates
- Audit requirements
- Data retention policies
- Validation checklist
- Compliance evidence

**Key Features:**
- Requirement-to-implementation mapping
- Database schema enhancements
- Compliance validation tools
- Self-assessment checklist

**Who Should Read:** Compliance officers, project managers, technical leads, legal team

### 4. Security Requirements (`security-requirements.md`)

**Purpose:** Security requirements and implementation guidelines

**Contents:**
- Threat model and risk assessment
- Security requirements (SR-001 to SR-007)
- Implementation guidelines for:
  - Client-side security
  - Server-side security
- Cryptographic requirements
- Access control (RBAC)
- Audit and monitoring
- Compliance requirements
- Security testing
- Incident response

**Key Topics:**
- Private key protection (HSM, secure enclave)
- Certificate validation
- Signature integrity
- Non-repudiation
- Multi-factor authentication
- Rate limiting
- Audit logging

**Who Should Read:** Security engineers, DevOps engineers, compliance officers

---

## Quick Start Guide

### Phase 1: Planning (Weeks 1-2)

1. **Review Documentation**
   - Read all documents in this directory
   - Understand NOM-004 requirements
   - Review security requirements

2. **Legal Review**
   - Consult with legal counsel on compliance
   - Review e.firma terms of use
   - Confirm data processing requirements

3. **Architecture Review**
   - Review proposed architecture
   - Assess infrastructure needs
   - Plan integration points

### Phase 2: Foundation (Weeks 3-6)

1. **Database Setup**
   - Run database migrations (see `architecture.md`)
   - Set up certificate tables
   - Set up signature tables
   - Configure Row-Level Security (RLS)

2. **Backend Services**
   - Implement certificate loading
   - Implement certificate validation
   - Implement OCSP/CRL checking
   - Create API endpoints

3. **Frontend Components**
   - Build certificate upload UI
   - Build signing workflow UI
   - Build signature verification UI

### Phase 3: Integration (Weeks 7-10)

1. **SOAP Consultation Signing**
   - Integrate signature workflow
   - Add signature requirements
   - Implement amendment tracking

2. **Prescription Signing**
   - Integrate prescription signing
   - Generate QR codes for verification
   - Implement pharmacy verification

3. **Medical Certificate Signing**
   - Create medical certificate system
   - Implement certificate signing
   - Add verification codes

### Phase 4: Compliance (Weeks 11-14)

1. **Audit Trail**
   - Implement comprehensive audit logging
   - Create audit reporting tools
   - Set up log monitoring

2. **Security Hardening**
   - Implement rate limiting
   - Set up MFA
   - Configure encryption

3. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Penetration testing
   - Compliance validation

### Phase 5: Deployment (Weeks 15-16)

1. **Staging Deployment**
   - Deploy to staging environment
   - Conduct user acceptance testing
   - Performance testing

2. **Production Deployment**
   - Deploy to production
   - Monitor for issues
   - Train doctors on usage

---

## Technology Stack

### Backend

- **Runtime:** Node.js with TypeScript
- **Framework:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **Cryptography:** Node.js crypto API, node-forge
- **Certificate Validation:** Custom implementation

### Frontend

- **Framework:** React with TypeScript
- **UI Components:** Tailwind CSS, shadcn/ui
- **State Management:** React hooks, Zustand
- **Forms:** React Hook Form

### Infrastructure

- **Hosting:** Vercel (frontend), Supabase (backend)
- **Storage:** Supabase Storage
- **Monitoring:** Custom monitoring, Sentry
- **Logging:** Pino logger

### External Services

- **Certificate Provider:** SAT e.firma
- **Timestamp Authority:** TBD (RFC 3161 compliant)
- **Certificate Revocation:** SAT OCSP/CRL services

---

## Key Features

### 1. Certificate Management

- Upload and store e.firma certificates
- Validate certificates against SAT infrastructure
- Monitor certificate expiration
- Handle certificate revocation

### 2. Digital Signatures

- Sign SOAP consultations
- Sign prescriptions
- Sign medical certificates
- Support for CAdES, XAdES, and PAdES formats

### 3. Signature Verification

- Verify signature integrity
- Check certificate validity
- Verify certificate chain
- Detect document tampering

### 4. Audit Trail

- Comprehensive logging of all signature operations
- Immutable audit records
- Compliance reporting
- Real-time monitoring

### 5. Security

- Private key protection (HSM, secure enclave)
- Multi-factor authentication
- Rate limiting
- Encryption at rest and in transit

---

## Compliance Summary

### NOM-004-SSA3-2012

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Electronic/Digital Signature | ✅ Compliant | e.firma integration |
| Signatory Identification | ✅ Compliant | Certificate validation |
| Document Linkage | ✅ Compliant | Hash-based binding |
| Tamper Detection | ✅ Compliant | Signature verification |
| Audit Trail | ✅ Compliant | Comprehensive logging |
| Record Retention | ✅ Compliant | 5-year minimum retention |

### LFEA (Ley de Firma Electrónica Avanzada)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Advanced Electronic Signature | ✅ Compliant | e.firma (SAT-issued) |
| Identity Verification | ✅ Compliant | SAT in-person verification |
| Exclusive Control | ✅ Compliant | PIN/biometric required |
| Non-Repudiation | ✅ Compliant | Cryptographic binding |

### LFPDPPP (Data Protection)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Encryption at Rest | ✅ Compliant | AES-256 |
| Encryption in Transit | ✅ Compliant | TLS 1.3 |
| Access Control | ✅ Compliant | RBAC |
| Audit Logging | ✅ Compliant | Comprehensive logging |
| Data Minimization | ✅ Compliant | Minimal data collection |

---

## Security Architecture

### Client-Side Security

```
┌─────────────────────────────────────────┐
│          Client Application             │
│  (Web Browser / Mobile App / Desktop)   │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Private Key Storage              │ │
│  │   - Hardware Token (PKCS#11)       │ │
│  │   - Secure Enclave (iOS/Android)   │ │
│  │   - Encrypted Software Storage     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Signing Operations               │ │
│  │   - Hash Generation                │ │
│  │   - Signature Creation             │ │
│  │   - Timestamp Integration          │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Server-Side Security

```
┌─────────────────────────────────────────┐
│          Server Application             │
│         (Next.js API Routes)            │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Certificate Validation           │ │
│  │   - Chain Verification             │ │
│  │   - Expiration Checking            │ │
│  │   - Revocation Checking (OCSP/CRL) │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Signature Verification           │ │
│  │   - Integrity Verification         │ │
│  │   - Authenticity Verification      │ │
│  │   - Non-Repudiation                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Audit Logging                    │ │
│  │   - Event Recording                │ │
│  │   - Compliance Monitoring          │ │
│  │   - Security Monitoring            │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## API Endpoints

### Certificate Management

```
POST   /api/certificates/upload
GET    /api/certificates
GET    /api/certificates/:id
DELETE /api/certificates/:id
```

### Signature Operations

```
POST   /api/signatures/sign
POST   /api/signatures/verify
GET    /api/signatures/:id
GET    /api/signatures/document/:documentType/:documentId
```

### Compliance

```
GET    /api/compliance/nom-004/check
GET    /api/compliance/audit-log
GET    /api/compliance/report
```

---

## Database Schema

### Core Tables

```sql
-- Digital Certificates
digital_certificates
  - id, user_id, certificate_type
  - certificate_number, issuer_dn, subject_dn
  - valid_from, valid_until, status
  - public_key, certificate_pem

-- Digital Signatures
digital_signatures
  - id, document_type, document_id
  - certificate_id, signer_user_id
  - signature_value, signature_format
  - signed_at, timestamp_token
  - verification_status

-- Certificate Revocations
certificate_revocations
  - id, certificate_id
  - revocation_time, revocation_reason
  - crl_number, ocsp_response

-- Signature Audit Log
signature_audit_log
  - id, event_type, signature_id
  - user_id, event_data
  - success, error_message

-- Signature Policies
signature_policies
  - id, name, document_types
  - required_signature_level
  - nom_004_compliant, lfea_compliant
```

---

## Testing Strategy

### Unit Tests

- Certificate validation
- Signature generation
- Signature verification
- Hash generation
- Revocation checking

### Integration Tests

- End-to-end signing workflow
- OCSP integration
- CRL integration
- Database operations

### E2E Tests

- Complete signing flow
- Certificate upload
- Document signing
- Signature verification

### Compliance Tests

- NOM-004 requirement validation
- Audit trail completeness
- Tamper detection
- Amendment tracking

---

## Monitoring & Observability

### Key Metrics

- Signature success rate
- Average signing time
- Certificate validation failures
- Revocation check latency
- Verification success rate

### Alerting

- Failed signature operations
- Expired certificates
- Revoked certificates in use
- Unusual signature patterns
- Security incidents

---

## Deployment Checklist

### Pre-Deployment

- [ ] All documentation reviewed
- [ ] Legal approval obtained
- [ ] Security review completed
- [ ] Penetration testing completed
- [ ] Compliance validation passed

### Deployment

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Secrets configured
- [ ] SSL certificates installed
- [ ] Monitoring configured

### Post-Deployment

- [ ] Smoke tests passed
- [ ] Monitoring verified
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained

---

## Maintenance

### Regular Tasks

- **Daily:** Monitor certificate expiration
- **Weekly:** Review audit logs
- **Monthly:** Security updates
- **Quarterly:** Compliance review
- **Annually:** Penetration testing

### Certificate Management

- Monitor certificate expiration (30-day warning)
- Renew certificates before expiration
- Revoke compromised certificates immediately
- Update CRLs daily

---

## Support & Troubleshooting

### Common Issues

1. **Certificate not recognized**
   - Verify certificate format (PEM/DER)
   - Check certificate issued by SAT
   - Validate certificate not expired

2. **OCSP/CRL checks failing**
   - Check network connectivity
   - Verify SAT services accessible
   - Check firewall rules

3. **Private key not accessible**
   - Verify e.firma properly installed
   - Check hardware token connected
   - Verify correct PIN entered

### Getting Help

- **Technical Issues:** Contact engineering team
- **Compliance Issues:** Contact compliance officer
- **Legal Issues:** Contact legal counsel

---

## References & Resources

### Official Documentation

- [NOM-004-SSA3-2012](https://www.dof.gob.mx/nota_detalle.php?codigo=5276277&fecha=15/10/2012)
- [LFEA (Ley de Firma Electrónica Avanzada)](http://www.dof.gob.mx/nota_detalle.php?codigo=5150631&fecha=05/07/2010)
- [SAT e.firma Information](https://www.sat.gob.mx/portal/public/tramites/firma-electronica-avanzada-efirma)

### Technical Standards

- RFC 5280: Internet X.509 PKI Certificate and CRL Profile
- RFC 2560: X.509 Internet PKI Online Certificate Status Protocol
- RFC 5652: Cryptographic Message Syntax (CMS)
- ISO/IEC 27001: Information Security Management

### Security Resources

- NIST SP 800-57: Key Management Recommendations
- FIPS 140-2: Cryptographic Module Requirements
- OWASP Top 10: Web Application Security Risks

---

## Document Index

| Document | Description | Target Audience |
|----------|-------------|-----------------|
| `architecture.md` | System architecture and design | Architects, Tech Leads |
| `e-firma-integration.md` | e.firma integration guide | Developers |
| `nom-004-compliance.md` | NOM-004 compliance mapping | Compliance, Legal, PMs |
| `security-requirements.md` | Security requirements and guidelines | Security Engineers, DevOps |
| `README.md` | This document | All stakeholders |

---

## Changelog

### Version 1.0 (2026-02-09)

- Initial documentation
- Complete architecture design
- e.firma integration guide
- NOM-004 compliance mapping
- Security requirements
- Implementation roadmap

---

## Contributors

- **Engineering:** Doctor.mx Engineering Team
- **Compliance:** Doctor.mx Compliance Team
- **Legal:** Legal Counsel (pending review)
- **Security:** Security Team (pending review)

---

## License

This documentation is proprietary and confidential to Doctor.mx.

---

**Next Steps:**

1. Review all documentation
2. Conduct legal review
3. Approve architecture
4. Begin Phase 1 implementation
5. Establish timeline and milestones

---

**Document Control**

- **Owner:** Doctor.mx Product Team
- **Last Updated:** February 9, 2026
- **Next Review:** March 9, 2026
- **Status:** Design Phase - Pending Approval

---

**Disclaimer:** This documentation is based on publicly available information about Mexican healthcare regulations and SAT's e.firma infrastructure. Actual implementation may require adjustments based on legal review and SAT's technical specifications.

---

**End of Digital Signature Integration Documentation**
