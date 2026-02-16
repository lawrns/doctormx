# IDOR (Insecure Direct Object Reference) Security Fixes

**Date:** 2026-02-16  
**Scope:** Week 1 - Flow A Security Hardening  
**Status:** ✅ COMPLETED

---

## Executive Summary

This document details the implementation of IDOR (Insecure Direct Object Reference) protection mechanisms across the DoctorMX API endpoints. IDOR vulnerabilities occur when an attacker can access or modify resources belonging to other users by manipulating resource identifiers in requests.

### Changes Made

1. **Created IDOR Protection Module** (`src/lib/security/idor-protection.ts`)
2. **Fixed 4 Vulnerable API Endpoints**
3. **Added Security Event Logging** for all IDOR attempts
4. **Created Comprehensive Test Suite**

---

## Vulnerable Endpoints Fixed

### 1. POST `/api/create-payment-intent` 🔴 CRITICAL

**Vulnerability:** No ownership validation before creating payment intent. User A could pay for User B's appointment.

**Fix Applied:**
```typescript
// Added ownership check before payment creation
const { data: appointment } = await supabase
  .from('appointments')
  .select('patient_id, status, id')
  .eq('id', appointmentId)
  .single()

if (appointment?.patient_id !== user.id) {
  await logSecurityEvent({
    eventType: 'permission_denied',
    severity: 'high',
    userId: user.id,
    description: `IDOR_ATTEMPT: User ${user.id} attempted to create payment...`,
    // ... additional context
  })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Security Features Added:**
- ✅ Ownership verification before payment creation
- ✅ Appointment status validation (must be payable)
- ✅ Security event logging for IDOR attempts
- ✅ IP address and user agent tracking

---

### 2. POST `/api/confirm-payment` 🔴 CRITICAL

**Vulnerability:** No ownership validation before confirming payment. User A could confirm payment for User B's appointment.

**Fix Applied:**
```typescript
// Added ownership check before payment confirmation
const { data: appointment } = await supabase
  .from('appointments')
  .select('patient_id, status, id')
  .eq('id', appointmentId)
  .single()

if (appointment?.patient_id !== user.id) {
  await logSecurityEvent({ /* IDOR attempt details */ })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Additional protection: Verify payment belongs to this appointment
if (payment.appointment_id !== appointmentId) {
  await logSecurityEvent({
    eventType: 'suspicious_activity',
    severity: 'critical',
    // ... payment mismatch details
  })
}
```

**Security Features Added:**
- ✅ Ownership verification before payment confirmation
- ✅ Payment-to-appointment matching validation
- ✅ Critical severity logging for payment mismatches
- ✅ Security event logging for IDOR attempts

---

### 3. GET `/api/chat/conversations/[id]` 🟠 HIGH

**Vulnerability:** No ownership verification. User could access any conversation by ID.

**Fix Applied:**
```typescript
// Added participant verification
const { data: conversation } = await supabase
  .from('chat_conversations')
  .select('id, patient_id, doctor_id')
  .eq('id', conversationId)
  .single()

const isParticipant = 
  conversation.patient_id === user.id || 
  conversation.doctor_id === user.id

if (!isParticipant) {
  await logSecurityEvent({ /* IDOR attempt details */ })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Security Features Added:**
- ✅ Participant verification (patient OR doctor)
- ✅ Security event logging for unauthorized access attempts
- ✅ Detailed logging of actual vs attempted participants

---

### 4. `/api/consultation-notes` (GET & POST) 🔴 CRITICAL

**Vulnerability:** No authentication or ownership checks. Completely open endpoint.

**Fix Applied:**
```typescript
// Added authentication check
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Added appointment ownership verification
const { data: appointment } = await supabase
  .from('appointments')
  .select('id, patient_id, doctor_id')
  .eq('id', appointmentId)
  .single()

const isPatient = appointment.patient_id === user.id
const isDoctor = profile?.role === 'doctor' && appointment.doctor_id === user.id
const isAdmin = profile?.role === 'admin'

if (!isPatient && !isDoctor && !isAdmin) {
  await logSecurityEvent({ /* IDOR attempt details */ })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Security Features Added:**
- ✅ Mandatory authentication (401 for anonymous users)
- ✅ Patient OR doctor OR admin authorization
- ✅ Security event logging for IDOR attempts
- ✅ Separate protection for both GET and POST methods

---

## New Security Module

### `src/lib/security/idor-protection.ts`

A reusable module providing IDOR protection utilities:

#### Functions

| Function | Purpose | Usage |
|----------|---------|-------|
| `verifyOwnership()` | Generic ownership check for any resource | `verifyOwnership({ table, resourceId, userId })` |
| `verifyAppointmentOwnership()` | Specific check for appointment ownership | `verifyAppointmentOwnership(appointmentId, patientId)` |
| `verifyConversationOwnership()` | Check if user is conversation participant | `verifyConversationOwnership(conversationId, userId)` |
| `logIDORAttempt()` | Log IDOR attempts to security audit | `logIDORAttempt({ userId, targetResource, ... })` |
| `getRequestMetadata()` | Extract IP and user agent from request | `getRequestMetadata(request)` |
| `withIDORProtection()` | Middleware wrapper for routes | `withIDORProtection(resourceType, getResourceId, getUserId, handler)` |

#### Example Usage

```typescript
import { verifyAppointmentOwnership, logIDORAttempt, getRequestMetadata } from '@/lib/security/idor-protection'

// In your API route
const ownership = await verifyAppointmentOwnership(appointmentId, user.id)

if (!ownership.allowed) {
  const { ipAddress, userAgent } = getRequestMetadata(request)
  
  await logIDORAttempt({
    userId: user.id,
    targetResource: appointmentId,
    resourceType: 'appointment',
    action: 'payment',
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString(),
  })
  
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## Security Event Logging

### Event Types

All IDOR attempts are logged with:

```typescript
{
  eventType: 'permission_denied',
  severity: 'high',
  userId: string,
  description: string,
  ipAddress?: string,
  userAgent?: string,
  details: {
    type: 'IDOR_ATTEMPT',
    targetResource: string,
    resourceType: string,
    action: string,
    actualOwner?: string,
    attemptedBy: string,
    timestamp: string,
    // Additional context
  }
}
```

### Database Schema

Events are stored in the `security_audit` table:

```sql
CREATE TABLE security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  user_id UUID,
  description TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/security/idor-protection.ts` | ➕ NEW - IDOR protection utilities |
| `src/lib/security/audit-logger.ts` | 📝 Added `idor_attempt` event type |
| `src/app/api/create-payment-intent/route.ts` | 🔒 Added ownership validation & logging |
| `src/app/api/confirm-payment/route.ts` | 🔒 Added ownership validation & logging |
| `src/app/api/chat/conversations/[id]/route.ts` | 🔒 Added participant verification & logging |
| `src/app/api/consultation-notes/route.ts` | 🔒 Added authentication & ownership validation |
| `tests/security/idor-protection.test.ts` | ➕ NEW - Comprehensive test suite |

---

## Testing

### Unit Tests

```bash
# Run IDOR protection tests
npm test tests/security/idor-protection.test.ts
```

### Test Coverage

- ✅ Ownership verification (positive and negative cases)
- ✅ Appointment ownership validation
- ✅ Conversation participant validation
- ✅ Security event logging
- ✅ Error handling for missing resources
- ✅ Custom owner field support

### Manual Testing Checklist

- [ ] User A attempting to pay for User B's appointment → 403 Forbidden
- [ ] User A attempting to confirm payment for User B's appointment → 403 Forbidden
- [ ] User A attempting to access User B's conversation → 403 Forbidden
- [ ] User A attempting to access notes for User B's appointment → 403 Forbidden
- [ ] Security events logged in database for all IDOR attempts
- [ ] User paying for own appointment → Success (200)
- [ ] User accessing own conversation → Success (200)
- [ ] Anonymous access to consultation-notes → 401 Unauthorized

---

## Compliance

These fixes address:

- **OWASP Top 10 2021 - A01:2021-Broken Access Control**
- **HIPAA Security Rule - § 164.312(a)(1) - Access Control**
- **NIST Cybersecurity Framework - PR.AC-4 - Access permissions**

---

## Next Steps

1. **Deploy changes to staging environment**
2. **Run full security test suite**
3. **Monitor security_audit table for IDOR attempts**
4. **Set up alerts for high-severity security events**
5. **Apply similar patterns to future API endpoints**

---

## References

- [OWASP IDOR Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [CWE-639: Authorization Bypass Through User-Controlled Key](https://cwe.mitre.org/data/definitions/639.html)
- [OWASP API Security Top 10 - API1:2019 Broken Object Level Authorization](https://owasp.org/www-project-api-security/)
