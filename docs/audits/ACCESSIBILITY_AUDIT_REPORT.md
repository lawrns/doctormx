# DoctorMX Accessibility (a11y) Audit Report

**Date:** 2026-02-03  
**Auditor:** Code Review Analysis  
**Scope:** Complete codebase review focusing on WCAG 2.1 AA compliance

---

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| **Overall Accessibility Score** | **6.5/10** | ⚠️ Needs Improvement |
| ARIA & Semantics | 7/10 | ✅ Good foundation |
| Keyboard Navigation | 6/10 | ⚠️ Partial support |
| Color Contrast | 7/10 | ✅ Generally good |
| Focus Management | 5/10 | ❌ Needs work |
| Screen Reader Support | 6/10 | ⚠️ Partial support |
| Form Accessibility | 7/10 | ✅ Good foundation |

---

## Detailed Findings

### 🔴 CRITICAL ISSUES (4)

#### 1. Missing Skip Navigation Links
**File:** `src/app/layout.tsx` (root layout)  
**WCAG Criterion:** 2.4.1 Bypass Blocks (Level A)  
**Severity:** Critical

**Issue:** No skip links are provided to allow keyboard users to bypass repetitive navigation blocks.

**Before:**
```tsx
// No skip link present in layout
<body>
  <Header />
  <main>{children}</main>
  <Footer />
</body>
```

**After:**
```tsx
<body>
  <a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg"
  >
    Saltar al contenido principal
  </a>
  <Header />
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
  <Footer />
</body>
```

---

#### 2. Password Toggle Buttons Lack Accessible Labels
**Files:** 
- `src/app/auth/login/page.tsx` (lines 393-403)
- `src/app/auth/reset-password/page.tsx` (lines 350-360, 408-418)

**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical

**Issue:** Password visibility toggle buttons use only icons without accessible labels.

**Before:**
```tsx
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500..."
>
  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
</button>
```

**After:**
```tsx
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500..."
  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
  aria-pressed={showPassword}
>
  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
</button>
```

---

#### 3. Mobile Menu Button Lacks Accessible Name
**File:** `src/components/layout/Header.tsx` (lines 106-120)  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical

**Issue:** Mobile menu button has no accessible name or aria-expanded state.

**Before:**
```tsx
<button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</button>
```

**After:**
```tsx
<button 
  className="md:hidden p-2 text-gray-600 hover:text-gray-900"
  aria-label="Abrir menú de navegación"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
  onClick={() => setIsMenuOpen(!isMenuOpen)}
>
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</button>
```

---

#### 4. Social Login Buttons Lack Accessible Names
**File:** `src/app/auth/login/page.tsx` (lines 498-537)  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical

**Issue:** Google and Apple sign-in buttons contain only SVG icons without accessible labels.

**Before:**
```tsx
<Button
  type="button"
  variant="outline"
  onClick={() => handleSocialLogin('google')}
>
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    {/* Google icon paths */}
  </svg>
  Google
</Button>
```

**After:**
```tsx
<Button
  type="button"
  variant="outline"
  onClick={() => handleSocialLogin('google')}
  aria-label="Iniciar sesión con Google"
>
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {/* Google icon paths */}
  </svg>
  Google
</Button>
```

---

### 🟠 HIGH SEVERITY ISSUES (5)

#### 5. Modal Focus Trap Missing
**File:** `src/components/Modal.tsx` (lines 1-106)  
**WCAG Criterion:** 2.4.3 Focus Order (Level A)  
**Severity:** High

**Issue:** Custom Modal component doesn't implement focus trapping, allowing keyboard users to tab outside the modal while it's open.

**Current Implementation:** Only handles Escape key (line 29-33) but no focus trap.

**Recommendation:** Use Radix Dialog (already in ui/dialog.tsx) which has built-in focus trap, or implement focus trap manually:

```tsx
// Recommended: Use existing Radix Dialog instead of custom Modal
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
```

---

#### 6. Form Error Messages Not Announced to Screen Readers
**File:** `src/app/auth/register/page.tsx` (lines 456-458, 494-496, etc.)  
**WCAG Criterion:** 3.3.1 Error Identification (Level A), 4.1.3 Status Messages (Level AA)  
**Severity:** High

**Issue:** Error messages are displayed visually but not programmatically associated or announced.

**Before:**
```tsx
{step2Form.formState.errors.fullName && (
  <p className="text-sm text-red-500 mt-1">{step2Form.formState.errors.fullName.message}</p>
)}
```

**After:**
```tsx
{step2Form.formState.errors.fullName && (
  <p 
    className="text-sm text-red-500 mt-1" 
    id="fullname-error"
    role="alert"
    aria-live="polite"
  >
    {step2Form.formState.errors.fullName.message}
  </p>
)}
// Input needs: aria-describedby={error ? "fullname-error" : undefined}
```

---

#### 7. Form Steps Missing Live Region Updates
**File:** `src/app/auth/register/page.tsx` (stepper component)  
**WCAG Criterion:** 4.1.3 Status Messages (Level AA)  
**Severity:** High

**Issue:** When users navigate between form steps, screen reader users are not informed of step changes.

**Before:**
```tsx
<motion.span className="text-sm font-medium text-neutral-600">
  Paso {currentStep} de 3
</motion.span>
```

**After:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {`Paso ${currentStep} de 3: ${stepTitles[currentStep]}`}
</div>
<motion.span className="text-sm font-medium text-neutral-600" aria-hidden="true">
  Paso {currentStep} de 3
</motion.span>
```

---

#### 8. Icon-Only Buttons Lack Tooltips
**Files:** 
- `src/components/layout/Footer.tsx` (social links, lines 34-48)
- `src/app/auth/login/page.tsx` (password toggle)

**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)  
**Severity:** High

**Issue:** Footer social media links have no visible labels or tooltips.

**Before:**
```tsx
<a href="#" className="text-gray-400 hover:text-gray-600">
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    {/* Twitter icon */}
  </svg>
</a>
```

**After:**
```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

<Tooltip>
  <TooltipTrigger asChild>
    <a href="#" className="text-gray-400 hover:text-gray-600" aria-label="Twitter">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {/* Twitter icon */}
      </svg>
    </a>
  </TooltipTrigger>
  <TooltipContent>Síguenos en Twitter</TooltipContent>
</Tooltip>
```

---

#### 9. Custom Modal Missing ARIA Attributes
**File:** `src/components/Modal.tsx`  
**WCAG Criterion:** 1.3.1 Info and Relationships (Level A), 4.1.2 Name, Role, Value (Level A)  
**Severity:** High

**Issue:** Modal lacks proper ARIA roles and attributes for screen reader users.

**Before:**
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="fixed inset-0 bg-[rgba(15,23,42,0.2)] backdrop-blur-sm" onClick={onClose} />
  <div className="relative w-full bg-[var(--color-surface)] rounded-lg shadow-xl">
    {/* Content */}
  </div>
</div>
```

**After:**
```tsx
<div 
  className="fixed inset-0 z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby={title ? "modal-title" : undefined}
>
  <div 
    className="fixed inset-0 bg-[rgba(15,23,42,0.2)] backdrop-blur-sm" 
    onClick={onClose}
    aria-hidden="true"
  />
  <div 
    className="relative w-full bg-[var(--color-surface)] rounded-lg shadow-xl"
    role="document"
  >
    {title && <h3 id="modal-title" className="...">{title}</h3>}
    {/* Content */}
  </div>
</div>
```

---

### 🟡 MEDIUM SEVERITY ISSUES (4)

#### 10. Missing Heading Hierarchy
**Files:** 
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/auth/forgot-password/page.tsx`

**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)  
**Severity:** Medium

**Issue:** Pages may skip heading levels or lack proper H1 structure.

**Recommendation:** Ensure each page has exactly one `<h1>` and proper heading hierarchy (h1 → h2 → h3, no skipping).

---

#### 11. Form Labels with Icons Missing Accessible Association
**File:** `src/app/auth/register/page.tsx` (lines 425-428, 462-465, etc.)  
**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)  
**Severity:** Medium

**Issue:** Labels contain icons without aria-hidden, potentially causing screen reader confusion.

**Before:**
```tsx
<Label htmlFor="fullName" className="mb-2">
  <User className="w-4 h-4" />
  Nombre completo
</Label>
```

**After:**
```tsx
<Label htmlFor="fullName" className="mb-2 flex items-center gap-2">
  <User className="w-4 h-4" aria-hidden="true" />
  Nombre completo
</Label>
```

---

#### 12. Progress Bar Missing ARIA Attributes
**File:** `src/app/auth/register/page.tsx` (line 288)  
**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)  
**Severity:** Medium

**Issue:** Progress component lacks proper ARIA attributes for accessibility.

**Before:**
```tsx
<Progress value={progress} className="h-2 mb-6" />
```

**After:**
```tsx
<Progress 
  value={progress} 
  className="h-2 mb-6"
  aria-label="Progreso del registro"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={Math.round(progress)}
/>
```

---

#### 13. Image Upload Zone Missing Keyboard Support
**File:** `src/components/ImageUploader.tsx` (lines 319-387)  
**WCAG Criterion:** 2.1.1 Keyboard (Level A)  
**Severity:** Medium

**Issue:** Drag-and-drop zone relies solely on click, may not be fully keyboard accessible.

**Recommendation:** Ensure the dropzone is focusable and keyboard-activatable:

```tsx
<div
  ref={dropZoneRef}
  tabIndex={0}
  role="button"
  aria-label="Zona para subir imagen. Presiona Enter para seleccionar archivo."
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }}
  // ... existing props
>
```

---

### 🟢 LOW SEVERITY ISSUES (2)

#### 14. Decorative SVG Icons Missing aria-hidden
**Files:** Multiple files throughout the codebase  
**WCAG Criterion:** 1.1.1 Non-text Content (Level A)  
**Severity:** Low

**Issue:** Many decorative SVG icons don't have `aria-hidden="true"`, causing potential noise for screen readers.

**Common Pattern to Fix:**
```tsx
// Before
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path ... />
</svg>

// After
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
  <path ... />
</svg>
```

---

#### 15. Animated Backgrounds Missing Reduced Motion Support
**Files:**
- `src/app/auth/login/page.tsx` (AnimatedBackground component)
- `src/app/auth/forgot-password/page.tsx`
- `src/app/auth/reset-password/page.tsx`

**WCAG Criterion:** 2.3.3 Animation from Interactions (Level AAA - recommended)  
**Severity:** Low

**Issue:** While HeroSection uses `useReducedMotion`, auth pages don't check for reduced motion preference.

**Recommendation:** Apply the pattern from HeroSection to all animated backgrounds:

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion'

function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion()
  
  if (prefersReducedMotion) {
    return null // or static background
  }
  
  return (
    <motion.div
      animate={{ /* animations */ }}
      // ...
    />
  )
}
```

---

## Positive Findings ✅

1. **Radix UI Integration**: Most UI components in `src/components/ui/` use Radix UI primitives which have excellent built-in accessibility (focus management, keyboard navigation, ARIA attributes).

2. **Form Components**: The form system in `src/components/ui/form.tsx` correctly implements:
   - `aria-describedby` for error messages
   - `aria-invalid` for invalid fields
   - Proper label associations via `htmlFor`

3. **Alt Text for Images**: `HeroSection` and other components properly use Next.js Image component with descriptive alt text.

4. **Focus Visible Styling**: Buttons and inputs have visible focus indicators (`focus-visible:ring` classes).

5. **Toast Notifications**: Toast component uses `role="alert"` for proper announcement.

6. **Color Contrast**: The medical blue theme (#3b82f6 on white) provides approximately 3.9:1 contrast ratio which meets WCAG AA for large text and UI components.

7. **Keyboard Escape Handling**: Custom Modal correctly handles Escape key to close (lines 29-33).

8. **Autocomplete Attributes**: Login and registration forms use proper `autoComplete` attributes (email, current-password, new-password).

---

## Testing Recommendations

### Automated Testing Tools
1. **axe DevTools** - Browser extension for automated accessibility testing
2. **Lighthouse** - Built-in Chrome DevTools accessibility audits
3. **ESLint Plugin:**
   ```bash
   npm install --save-dev eslint-plugin-jsx-a11y
   ```
   Add to `.eslintrc.json`:
   ```json
   {
     "extends": ["plugin:jsx-a11y/recommended"]
   }
   ```

### Manual Testing Checklist
- [ ] Navigate entire app using only keyboard (Tab, Shift+Tab, Enter, Space, Escape, Arrow keys)
- [ ] Test with screen reader (NVDA on Windows, VoiceOver on macOS)
- [ ] Verify focus indicators are visible on all interactive elements
- [ ] Test with browser zoom at 200% and 400%
- [ ] Verify color contrast using WebAIM Contrast Checker
- [ ] Test with reduced motion preference enabled

### Screen Reader Testing Steps
1. Enable VoiceOver (macOS: Cmd+F5) or NVDA (Windows)
2. Navigate to each page
3. Verify headings are announced correctly
4. Verify form labels are associated with inputs
5. Verify error messages are announced
6. Test modal dialogs (focus trap, close on Escape)

---

## Priority Action Items

| Priority | Action | Estimated Effort |
|----------|--------|------------------|
| P0 | Add skip navigation link to root layout | 30 min |
| P0 | Fix password toggle button labels | 30 min |
| P0 | Add accessible labels to mobile menu | 30 min |
| P1 | Implement focus trap in Modal or migrate to Radix Dialog | 2-3 hours |
| P1 | Add live regions for form step announcements | 1 hour |
| P1 | Associate form errors with aria-describedby | 2 hours |
| P2 | Add tooltips to icon-only buttons | 2 hours |
| P2 | Audit and add aria-hidden to decorative icons | 2 hours |
| P3 | Add reduced motion support to auth pages | 1 hour |

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

*Report generated for DoctorMX codebase accessibility review.*
