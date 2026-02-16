# UI/UX TESTING GUIDE - Doctor.mx
## Checkpoint Document for Resumable Testing

**Created:** 2026-02-11  
**Status:** Ready for Testing  
**App URL:** http://localhost:3000  

---

## 📊 CURRENT STATE

### ✅ Pre-Testing Checklist (COMPLETED)

| Task | Status | Notes |
|------|--------|-------|
| Critical bugs fixed | ✅ | 4 bugs resolved |
| Security vulnerabilities patched | ✅ | 0 critical/high vulns remaining |
| TypeScript errors (critical) | ✅ | Core errors fixed |
| Dependencies updated | ✅ | All critical deps updated |
| Build passes | ✅ | npm run build successful |
| App starts | ✅ | npm run dev working |

### ⚠️ Known Non-Critical Issues

| Issue | Impact | Action Needed |
|-------|--------|---------------|
| SUPABASE_SERVICE_ROLE_KEY missing | Metrics not saved to DB | Optional: Add to .env |
| ~50 TypeScript warnings | None on runtime | Can be fixed later |
| Test files type errors | Tests won't compile | Not needed for UI testing |

---

## 🎯 TESTING SESSIONS

### SESSION 1: Critical Flows (DO THIS FIRST)
**Estimated Time:** 30-45 minutes  
**Priority:** 🔴 CRITICAL

#### 1.1 Landing Page & Navigation
```
URL: http://localhost:3000
```
- [ ] Page loads without errors
- [ ] Hero section visible
- [ ] Navigation menu works
- [ ] Mobile responsive (resize window)
- [ ] Footer links visible

**Expected Result:** Clean landing page, no console errors

#### 1.2 Registration Flow
```
URL: http://localhost:3000/auth/register
```
- [ ] Form displays correctly
- [ ] Email validation works
- [ ] Password validation works  
- [ ] Patient/Doctor toggle works
- [ ] Submit with valid data → redirects

**Test Data:**
- Email: test@example.com
- Password: Test123!Test
- Type: Patient

#### 1.3 Login Flow
```
URL: http://localhost:3000/auth/login
```
- [ ] Form displays correctly
- [ ] Valid credentials → dashboard
- [ ] Invalid credentials → error message
- [ ] "Forgot password" link works

**Test Credentials:** (Use the account you just created)

#### 1.4 Post-Login Dashboard
```
URL: http://localhost:3000/app (after login)
```
- [ ] Dashboard loads
- [ ] User name displayed
- [ ] Navigation sidebar/menu visible
- [ ] "Book Appointment" button works

---

### SESSION 2: Core Features
**Estimated Time:** 45-60 minutes  
**Priority:** 🟠 HIGH

#### 2.1 Doctor Search
```
URL: http://localhost:3000/doctors
```
- [ ] Doctor cards load
- [ ] Filter by specialty works
- [ ] Filter by city works
- [ ] Search by name works
- [ ] Click doctor → profile page

#### 2.2 Doctor Profile
```
URL: http://localhost:3000/doctors/[id]
```
- [ ] Profile info displays
- [ ] Photo visible
- [ ] Availability calendar shows
- [ ] Can select date/time
- [ ] "Book" button works

#### 2.3 Booking Flow
```
URL: Flow from doctor profile
```
- [ ] Booking form loads
- [ ] Selected date/time shown
- [ ] Required fields marked
- [ ] Validation works
- [ ] Submit → payment/checkout

#### 2.4 AI Consultation (Dr. Simeon)
```
URL: http://localhost:3000/ai-consulta
```
- [ ] Chat interface loads
- [ ] Can send message
- [ ] AI responds
- [ ] Emergency detection works (test with "chest pain")
- [ ] Summary generated at end

---

### SESSION 3: Advanced Features
**Estimated Time:** 30-45 minutes  
**Priority:** 🟡 MEDIUM

#### 3.1 Payment Flow
- [ ] Checkout page loads
- [ ] Stripe form displays
- [ ] Test card payment works (4242...)
- [ ] Confirmation shown

#### 3.2 Video Consultation
- [ ] Video room loads
- [ ] Camera/mic controls work
- [ ] Chat works during call
- [ ] Can end call

#### 3.3 Profile Management
```
URL: http://localhost:3000/app/profile
```
- [ ] Profile data displays
- [ ] Can edit information
- [ ] Photo upload works

---

## 🔍 TESTING COMMANDS

```bash
# Start the app
npm run dev

# View in different browsers
# Chrome: http://localhost:3000
# Firefox: http://localhost:3000
# Edge: http://localhost:3000

# Mobile testing
# Use Chrome DevTools (F12 → Toggle Device Toolbar)
# Or responsive mode in any browser
```

---

## 📱 RESPONSIVE TESTING CHECKLIST

Test these screen sizes:

| Device | Width | Priority | Status |
|--------|-------|----------|--------|
| Mobile (iPhone SE) | 375px | HIGH | ⬜ |
| Mobile (iPhone 12/13) | 390px | HIGH | ⬜ |
| Tablet (iPad) | 768px | MEDIUM | ⬜ |
| Desktop | 1440px | HIGH | ⬜ |

**Check on each:**
- [ ] No horizontal scroll
- [ ] Menu accessible (hamburger on mobile)
- [ ] Buttons easy to tap (44px+)
- [ ] Text readable without zoom

---

## 🐛 BUG REPORTING TEMPLATE

When you find an issue, document it like this:

```markdown
### Bug #[Number]

**Flow:** [Which flow/step]
**Severity:** [Critical/High/Medium/Low]
**URL:** [Page URL]

**Description:**
What happened?

**Expected:**
What should happen?

**Actual:**
What actually happened?

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Console Errors:**
```
Paste any red errors from F12 console here
```

**Screenshot:**
[Attach image]
```

---

## 📋 PROGRESS TRACKER

### Session 1: Critical Flows
| Test | Status | Notes |
|------|--------|-------|
| 1.1 Landing Page | ⬜ | |
| 1.2 Registration | ⬜ | |
| 1.3 Login | ⬜ | |
| 1.4 Dashboard | ⬜ | |

**Session 1 Complete:** ⬜

### Session 2: Core Features
| Test | Status | Notes |
|------|--------|-------|
| 2.1 Doctor Search | ⬜ | |
| 2.2 Doctor Profile | ⬜ | |
| 2.3 Booking Flow | ⬜ | |
| 2.4 AI Consultation | ⬜ | |

**Session 2 Complete:** ⬜

### Session 3: Advanced Features
| Test | Status | Notes |
|------|--------|-------|
| 3.1 Payment Flow | ⬜ | |
| 3.2 Video Consultation | ⬜ | |
| 3.3 Profile Management | ⬜ | |

**Session 3 Complete:** ⬜

---

## 🚀 QUICK START (For Resuming)

When you come back:

1. **Start the app:**
   ```bash
   cd C:\Users\danig\doctormx
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Check this guide:**
   - See "CURRENT STATE" above
   - Check "PROGRESS TRACKER" for what's left
   - Pick up where you left off

4. **Continue testing** from the next unchecked item

---

## 📞 SUPPORT

If you encounter issues:
1. Check F12 console for red errors
2. Document the bug using the template above
3. If app won't start, check:
   - Node modules installed (`npm install`)
   - Ports not in use (3000)
   - .env file present

---

**Last Updated:** 2026-02-11  
**Next Checkpoint:** After Session 1 completion

