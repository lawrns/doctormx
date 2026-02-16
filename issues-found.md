# Issues Found - Week 1 Flow A Verification
**Generated:** 2026-02-16  
**Status:** Critical Issues Blocking Approval

---

## 🔴 CRITICAL (Blocking)

### Issue #1: Build Fails Due to Syntax Errors
**Severity:** CRITICAL  
**Files Affected:** 40+ files  
**Test:** `npm run build`, `npx tsc --noEmit`

**Error Summary:**
```
Turbopack build failed with 35 errors
TypeScript: 100+ errors across 40+ files
```

**Specific Errors:**
1. `src/app/chat/[conversationId]/page.tsx:69`
   ```
   .from(.doctores')
         ^
   Expression expected
   ```

2. `src/app/auth/login/page.tsx`
   ```
   JSX element 'div' has no corresponding closing tag
   JSX element 'span' has no corresponding closing tag
   Expected corresponding JSX closing tag for 'blockquote'
   ```

3. `src/app/app/appointments/page.tsx:94`
   ```
   Expected ',', got 'finally'
   ```

4. `src/lib/doctors.ts`, `src/lib/discovery.ts`, `src/lib/analytics.ts`
   ```
   Variable declaration expected
   Expression expected
   Unterminated string literal
   ```

**Impact:** Application cannot build or deploy  
**Fix Required:** Complete the `.doctores` to `doctores` syntax migration properly

---

### Issue #2: TypeScript Compilation Errors
**Severity:** CRITICAL  
**Command:** `npm run typecheck`  
**Output:**
```
src/app/__tests__/booking-flow.test.ts(69,23): error TS1109: Expression expected
src/app/app/appointments/page.tsx(94,5): error TS1005: ',' expected
src/app/app/profile/page.tsx(343,10): error TS17008: JSX element 'div' has no corresponding closing tag
src/app/auth/login/page.tsx(160,14): error TS17008: JSX element 'div' has no corresponding closing tag
src/app/chat/[conversationId]/page.tsx(69,17): error TS1135: Argument expression expected
src/components/ChatList.tsx(50,24): error TS1003: Identifier expected
src/components/landing/StatsSection.tsx(52,81): error TS1109: Expression expected
src/lib/doctors.ts(10,8): error TS1134: Variable declaration expected
src/lib/discovery.ts(114,8): error TS1134: Variable declaration expected
src/lib/analytics.ts(13,2): error TS1131: Property or signature expected
... 90+ more errors
```

**Impact:** Type safety compromised, IDE support broken  
**Fix Required:** Fix all TypeScript syntax errors

---

## 🟡 HIGH (Must Fix)

### Issue #3: Whatsapp_sessions RLS Policies Incomplete
**Severity:** HIGH  
**File:** `supabase/migrations/004_whatsapp_tables.sql:33-34`

**Current State:**
```sql
CREATE POLICY "Admins manage sessions" ON whatsapp_sessions FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

**Problem:**
- Patients CANNOT view their own WhatsApp sessions
- Doctors CANNOT view their assigned sessions
- Only admins have access

**Required Policies:**
```sql
-- Patients can view their own sessions
CREATE POLICY "Patients view own sessions" 
  ON whatsapp_sessions FOR SELECT
  USING (patient_id = auth.uid());

-- Doctors can view assigned sessions  
CREATE POLICY "Doctors view assigned sessions"
  ON whatsapp_sessions FOR SELECT
  USING (assigned_doctor_id IN (
    SELECT id FROM doctores WHERE user_id = auth.uid()
  ));
```

**Impact:** WhatsApp functionality broken for patients/doctors  
**Security Risk:** Data isolation compromised

---

### Issue #4: IDOR Protection Not Integrated
**Severity:** HIGH  
**File:** `src/lib/payment.ts`

**Current Implementation:**
```typescript
async function getAppointmentPaymentData(appointmentId: string, userId: string) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`...`)
    .eq('id', appointmentId)
    .eq('patient_id', userId)
    .single()

  if (error || !appointment) {
    throw new Error('Cita no encontrada o no autorizada')  // Generic 500 error
  }
  // ...
}
```

**Problems:**
1. Does NOT use the implemented IDOR protection module (`src/lib/security/idor-protection.ts`)
2. Returns generic 500 error instead of 403 Forbidden
3. Does NOT log security events for unauthorized access attempts
4. Error message reveals implementation details

**Required Fix:**
```typescript
import { verifyAppointmentOwnership, logIDORAttempt, getRequestMetadata } from '@/lib/security/idor-protection'

// In route handler:
const ownership = await verifyAppointmentOwnership(appointmentId, userId)
if (!ownership.allowed) {
  await logIDORAttempt({
    userId,
    targetResource: appointmentId,
    resourceType: 'appointment',
    action: 'payment_init',
    ipAddress: request.ip,
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
  })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Impact:** Security events not logged, improper error responses

---

### Issue #5: Test Suite Failures
**Severity:** HIGH  
**Command:** `npm test`  
**Results:**
```
Test Files: 36 failed | 19 passed (55)
Tests:      197 failed | 615 passed | 48 skipped (860)
```

**Critical Test Failures:**

1. **Stripe Webhook Tests**
   - File: `src/app/api/__tests__/webhooks/stripe.test.ts`
   - Errors: Expected 200, received 500
   - Affected tests: Event handling, error cases, edge cases

2. **Security Tests**
   - File: `src/app/api/__tests__/security/admin.security.test.ts`
   - Errors: FormData construction failures
   - Affected: CSRF protection, input validation tests

3. **Payment Flow Tests**
   - File: `src/app/__tests__/payment-flow.test.ts`
   - Errors: Missing STRIPE_PUBLISHABLE_KEY
   - Failures: 3 tests failing

4. **Clinical Validation Tests**
   - File: `tests/clinical/validation-cases.test.ts`
   - Errors: ~20 classification accuracy failures
   - Issues: Emergency detection not meeting thresholds

**Impact:** Cannot verify correctness of security implementations  
**Fix Required:** Fix test infrastructure and failing tests

---

### Issue #6: Foreign Key Reference Issues
**Severity:** HIGH  
**Files:** `src/lib/doctors.ts`, `src/lib/discovery.ts`, `src/lib/analytics.ts`

**Current Code:**
```typescript
// src/lib/doctors.ts:22
profile:profiles.doctores_id_fkey (
  id,
  full_name,
  photo_url
)
```

**Problem:** The foreign key reference syntax `profiles.doctores_id_fkey` may not be valid in all contexts.

**Impact:** Database queries may fail  
**Fix Required:** Verify and fix all foreign key relationship references

---

## 🟢 MEDIUM (Should Fix)

### Issue #7: Security Event Schema Validation
**Severity:** MEDIUM  
**File:** `src/lib/security/audit-logger.ts`

**Observation:** The `logSecurityEvent` function logs to `security_audit` table but there's no verification that the table schema matches the insert operations.

**Recommendation:** Add schema validation or type checking for security event logging.

---

### Issue #8: Test Coverage Gaps
**Severity:** MEDIUM  

**Missing Tests:**
1. No specific tests for IDOR protection module
2. No integration tests for payment metadata handling
3. No tests verifying 403 responses for unauthorized access

**Recommendation:** Add comprehensive security test coverage.

---

## Summary Table

| # | Issue | Severity | Status | Blocking |
|---|-------|----------|--------|----------|
| 1 | Build fails due to syntax errors | 🔴 Critical | Open | YES |
| 2 | TypeScript compilation errors | 🔴 Critical | Open | YES |
| 3 | Whatsapp_sessions RLS incomplete | 🟡 High | Open | NO |
| 4 | IDOR protection not integrated | 🟡 High | Open | NO |
| 5 | Test suite failures | 🟡 High | Open | YES |
| 6 | Foreign key reference issues | 🟡 High | Open | NO |
| 7 | Security event schema validation | 🟢 Medium | Open | NO |
| 8 | Test coverage gaps | 🟢 Medium | Open | NO |

**Total Issues:** 8  
**Critical/Blocking:** 3  
**High Priority:** 3  
**Medium Priority:** 2

---

## Recommended Fix Priority

### Phase 1: Unblock Build (Day 1)
1. Fix all TypeScript syntax errors in 40+ files
2. Fix JSX mismatches in page components
3. Verify `npm run build` passes
4. Verify `npx tsc --noEmit` passes with 0 errors

### Phase 2: Security Fixes (Day 2)
1. Add missing RLS policies for whatsapp_sessions
2. Integrate IDOR protection module into payment flow
3. Fix error handling to return 403 for unauthorized access
4. Add security event logging for IDOR attempts

### Phase 3: Test Fixes (Day 3)
1. Fix Stripe webhook test failures
2. Fix security test infrastructure
3. Fix FormData construction errors
4. Add missing security tests

---

## Verification Re-Run Checklist

After fixes are applied, verify:

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run build` completes successfully
- [ ] `npm test` passes with >95% success rate
- [ ] Payments RLS policies verified in database
- [ ] Whatsapp_sessions RLS policies verified
- [ ] IDOR protection returns 403 for unauthorized access
- [ ] Security events logged to security_audit table
- [ ] Payment metadata uses snake_case in Stripe
- [ ] Webhooks correctly read metadata
