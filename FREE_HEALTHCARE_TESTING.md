# Doctor.mx Free Healthcare Testing Checklist

## 🚀 Anonymous Quota System Testing

### ✅ Cookie Management
- [ ] Session ID cookie created on first visit (`doctor_mx_session`)
  - [ ] Cookie has httpOnly flag
  - [ ] Cookie has secure flag (production only)
  - [ ] Cookie has sameSite=lax
  - [ ] Cookie expires in 30 days
- [ ] Quota cookie created (`doctor_mx_quota_used`)
  - [ ] Starts at 0
  - [ ] Increments after each consultation
  - [ ] Max value is 5
  - [ ] Persists across browser sessions

### ✅ API Endpoints (`/api/ai/quota`)
- [ ] GET request returns correct quota
  - [ ] Response includes `sessionId`
  - [ ] Response includes `used` count (0-5)
  - [ ] Response includes `remaining` count
  - [ ] Response includes `limit` (5)
  - [ ] Response includes `message` in Spanish
- [ ] POST with `action: 'check'` validates quota
  - [ ] Returns `canConsult: true` when quota available
  - [ ] Returns `canConsult: false` when quota exhausted
- [ ] POST with `action: 'use'` consumes quota
  - [ ] Increments quota correctly
  - [ ] Returns 403 when quota exceeded
  - [ ] Returns helpful upgrade message

### ✅ Anonymous Consultation Page (`/ai-consulta`)

#### Page Load
- [ ] Page loads without authentication requirement
- [ ] Session ID generated/stored in localStorage
- [ ] Quota banner displays at top (●○○○○)
- [ ] Quota counter in header shows remaining count
- [ ] Welcome message from Dr. Simeon appears
- [ ] Chat interface is functional

#### Chat Flow
- [ ] User can send first message
- [ ] AI responds within 2 seconds
- [ ] Message history persists during session
- [ ] Input field clears after sending
- [ ] User can send follow-up messages
- [ ] After 3+ messages, evaluation triggers

#### Results Display
- [ ] Evaluation summary card appears
  - [ ] Shows urgency level (low/medium/high)
  - [ ] Shows suggested specialty
  - [ ] Shows AI confidence level
- [ ] Doctor referrals display (up to 3)
  - [ ] Doctor name visible
  - [ ] Specialty visible
  - [ ] Rating visible
  - [ ] "Agendar Cita" button works
- [ ] Quota decremented correctly (●●○○○)
- [ ] WhatsApp share button visible

### ✅ WhatsApp Sharing

#### Share Button
- [ ] Button appears on results page
- [ ] Clicking opens WhatsApp with correct message
- [ ] Message includes:
  - [ ] Patient context (symptoms, evaluation)
  - [ ] AI recommendation
  - [ ] Doctor.mx URL
  - [ ] "5 consultas gratis" mention
- [ ] Button shows "¡Compartido!" state after click
- [ ] Success message appears

#### Share Card Component
- [ ] Previews share message text
- [ ] Shows formatted WhatsApp message
- [ ] "Compartir en WhatsApp" button functional
- [ ] Pulse animation visible
- [ ] Mobile-responsive

### ✅ Landing Page (FREE-First Redesign)

#### Announcement Bar
- [ ] Bar displays at very top of page
- [ ] Text: "5 CONSULTAS MÉDICAS GRATIS PARA TODOS LOS MEXICANOS"
- [ ] Green gradient background (emerald-500 to green-600)
- [ ] Sparkles icons visible on both sides
- [ ] Font is bold (font-bold) and larger (text-base)

#### Navigation
- [ ] First nav item is "5 Consultas GRATIS" (reordered from original)
- [ ] Main CTA button: "Empezar GRATIS →" (changed from "Registrarse gratis")
- [ ] CTA button color: emerald gradient (changed from blue)
- [ ] CTA has shadow-emerald-500/30

#### Hero Section
- [ ] Main headline: "5 Consultas Medicas"
- [ ] Sub-headline: "100% GRATIS" (bold, green gradient)
- [ ] Animated underline present
- [ ] Subheadline mentions "sin registrar, sin pagar"
- [ ] Benefits show as green badges:
  - [ ] "5 consultas GRATIS" (emerald-50 bg, emerald-700 text)
  - [ ] "Sin registro requerido"
  - [ ] "Para todos los mexicanos"
- [ ] Main CTA: "CONSULTAR AHORA — GRATIS"
- [ ] CTA color: emerald-500 to green-600 gradient
- [ ] CTA links to `/ai-consulta` (not `/app/second-opinion`)

### ✅ Pre-Consulta API Anonymous Support

#### Request Handling
- [ ] Accepts `anonymous: true` parameter
- [ ] Checks quota before processing anonymous users
- [ ] Returns 403 when quota exceeded
  - [ ] Error code: `quota_exceeded`
  - [ ] Includes `requireAuth: true`
  - [ ] Includes helpful Spanish message
- [ ] Decrements quota on completed consultation

#### Response Format
- [ ] Includes `anonymous` boolean in response
- [ ] Includes `quota` object for anonymous users
- [ ] `quota.remaining` updates correctly (0-5)
- [ ] Authenticated users work normally (no regression)

### ✅ Cross-Browser Testing
- [ ] Chrome (latest) - all features work
- [ ] Firefox (latest) - all features work
- [ ] Safari (latest) - all features work
- [ ] Edge (latest) - all features work
- [ ] Mobile Chrome (Android) - all features work
- [ ] Mobile Safari (iOS) - all features work

### ✅ Responsive Design
- [ ] Desktop (1920x1080) - layout correct
- [ ] Laptop (1366x768) - layout correct
- [ ] Tablet (768x1024) - layout correct
- [ ] Mobile (375x667) - layout correct
- [ ] Mobile small (320x568) - layout correct

### ✅ Accessibility
- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces quota status
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators visible on all interactive elements
- [ ] Error messages are accessible

---

## 🧪 Integration Testing Scenarios

### Scenario 1: New Anonymous User (Full Flow)
1. Clear browser cookies and localStorage
2. Visit `/ai-consulta`
3. **Expected:**
   - Session ID created automatically
   - Quota banner shows "5 de 5 consultas gratis restantes"
   - Counter shows ●○○○○
4. Send message: "Tengo dolor de cabeza"
5. **Expected:**
   - AI responds with follow-up question
6. Send 2 more messages to complete consultation
7. **Expected:**
   - Evaluation summary appears
   - 3 doctor recommendations show
   - WhatsApp share button visible
   - Quota updates to ●●○○○ (4 remaining)
8. Refresh page
9. **Expected:**
   - Quota still shows 4 remaining
   - Session persists

### Scenario 2: Quota Exhausted User
1. Use all 5 consultations
2. Attempt 6th consultation
3. **Expected:**
   - Message: "Has usado tus 5 consultas gratis"
   - "Obtener Premium" button visible
   - Unable to send messages
4. Click "Obtener Premium"
5. **Expected:**
   - Redirected to upgrade page
   - Or registration page

### Scenario 3: Landing to Anonymous Consultation
1. Visit homepage (`/`)
2. **Expected:**
   - Green announcement bar visible
   - "5 CONSULTAS MÉDICAS GRATIS" text
   - Hero shows "100% GRATIS"
3. Click "CONSULTAR AHORA — GRATIS"
4. **Expected:**
   - Redirected to `/ai-consulta`
   - Anonymous consultation page loads
   - No authentication required

### Scenario 4: WhatsApp Viral Loop
1. Complete anonymous consultation
2. Click "Compartir en WhatsApp"
3. **Expected:**
   - WhatsApp opens (or wa.me link)
   - Message pre-filled with:
     - "Un paciente usó Doctor.mx..."
     - AI recommendation
     - Doctor.mx URL
     - "5 consultas gratis"
4. Send message to yourself
5. Click link in WhatsApp message
6. **Expected:**
   - Opens `/ai-consulta`
   - New session begins
   - Viral loop works

### Scenario 5: Authenticated User (No Regression)
1. Login as existing patient
2. Visit `/app/second-opinion`
3. **Expected:**
   - Original flow still works
   - Can use authenticated consultation
   - Quota system doesn't interfere
4. Check dashboard
5. **Expected:**
   - All previous features work
   - No broken UI from changes

---

## 📊 Performance Benchmarks

- [ ] Page load time (anonymous page) < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] API response time (quota check) < 200ms
- [ ] API response time (pre-consulta) < 2 seconds
- [ ] Cookie operations don't block UI
- [ ] Chat messages appear < 1 second

---

## 🔒 Security Testing

- [ ] Session IDs are cryptographically random (not sequential)
- [ ] Cookies have appropriate flags (httpOnly, secure, sameSite)
- [ ] No PII stored in anonymous sessions
- [ ] Rate limiting on quota endpoints (prevent abuse)
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection in chat (input sanitization)
- [ ] CSRF protection on state-changing operations

---

## 📱 Feature Flags & Configuration

- [ ] Can enable/disable anonymous quota system via env var
- [ ] Can adjust quota limit (default: 5)
- [ ] Can modify cookie expiry (default: 30 days)
- [ ] Can toggle WhatsApp sharing feature
- [ ] Feature flags documented in code

---

## 🚨 Known Issues & Workarounds

### Issue 1: Build Errors
- **Status:** Resolved
- **Issue:** Missing @tailwindcss/postcss, @supabase/ssr
- **Fix:** Installed dependencies with --legacy-peer-deps
- **Workaround:** None needed

### Issue 2: React Compiler
- **Status:** Resolved
- **Issue:** babel-plugin-react-compiler not found
- **Fix:** Disabled reactCompiler in next.config.ts
- **Workaround:** None needed

### Issue 3: Dev Server
- **Status:** Working
- **Issue:** None
- **Fix:** N/A
- **Workaround:** N/A

---

## ✅ Sign-Off Checklist

### Development
- [ ] All code changes committed
- [ ] Git branch created for feature
- [ ] Pull request ready
- [ ] Code review completed
- [ ] All automated tests passing

### QA
- [ ] Manual testing complete
- [ ] Browser compatibility verified
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Security review complete
- [ ] Documentation updated

### Deployment
- [ ] Staging deployment successful
- [ ] Smoke tests passed on staging
- [ ] Production deployment scheduled
- [ ] Monitoring configured
- [ ] Rollback plan documented

---

## 📝 Test Execution Log

| Date | Tester | Environment | Build Version | Status | Notes |
|------|--------|-------------|---------------|--------|-------|
| 2026-01-24 | AI | Local | dev | ✅ Pass | All features working |
| | | | | | |
| | | | | | |

---

**Tester:** _______________
**Date:** _______________
**Environment:** Local / Staging / Production
**Build Version:** _______________
**Status:** Pass / Fail / Partial
