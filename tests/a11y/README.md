# Accessibility Testing Suite (WCAG 2.1 AA)

Comprehensive accessibility tests for Doctor.mx using Playwright and axe-core.

## Overview

This test suite validates WCAG 2.1 Level AA compliance across the application, including:
- Automated axe-core scans
- Keyboard navigation testing
- Screen reader compatibility
- Contrast ratio validation
- Mobile/touch target testing

## Test Files

### 1. `wcag.spec.ts`
Comprehensive WCAG 2.1 AA compliance tests using axe-core.

**Coverage:**
- All critical pages (landing, auth, pricing, etc.)
- Patient dashboard flows
- Doctor dashboard flows
- Interactive components (modals, dropdowns, tabs)
- Form accessibility
- WCAG 2.1 specific requirements (orientation, input purpose, character shortcuts)
- Dynamic content and live regions
- Media and alternatives
- Focus management
- Language declarations

**Key Tests:**
```typescript
// Run all WCAG compliance tests
npx playwright test wcag.spec.ts --config=playwright.config.a11y.ts

// Run specific page tests
npx playwright test wcag.spec.ts -g "Landing Page" --config=playwright.config.a11y.ts
```

### 2. `keyboard-navigation.spec.ts`
Tests WCAG 2.1 keyboard accessibility requirements (Success Criteria 2.1.x).

**Coverage:**
- Tab navigation through all interactive elements
- Focus order follows visual layout
- Shift+Tab backward navigation
- All links/buttons keyboard accessible
- Form inputs keyboard accessible
- Dropdown menus keyboard accessible
- Tabs keyboard navigable
- Modal focus traps
- Escape key behavior
- Focus indicators visibility
- Skip links functionality
- No keyboard traps
- Mobile keyboard support
- Custom interactive components

**Key Tests:**
```typescript
// Run all keyboard tests
npx playwright test keyboard-navigation.spec.ts --config=playwright.config.a11y.ts

// Test tab navigation specifically
npx playwright test keyboard-navigation.spec.ts -g "Tab Navigation" --config=playwright.config.a11y.ts
```

### 3. `screen-reader.spec.ts`
Tests NVDA/JAWS compatibility through proper ARIA attributes and semantic HTML.

**Coverage:**
- Semantic HTML (headings, landmarks, lists)
- ARIA attributes validation
- Screen reader announcements (errors, success, loading)
- Navigation and orientation (skip links, language)
- Form accessibility for screen readers
- Tables accessibility
- Images and media
- Focus and context management

**Key Tests:**
```typescript
// Run all screen reader tests
npx playwright test screen-reader.spec.ts --config=playwright.config.a11y.ts

// Test semantic structure
npx playwright test screen-reader.spec.ts -g "Semantic HTML" --config=playwright.config.a11y.ts
```

### 4. `contrast.spec.ts`
Validates WCAG AA contrast ratios for text and UI components.

**Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio
- UI components and graphics: 3:1 contrast ratio

**Coverage:**
- Body text contrast
- Heading contrast
- Link contrast
- Form label contrast
- Placeholder text contrast
- Button/UI component contrast
- Form input contrast
- Focus indicator contrast
- Icon contrast
- Error/success message contrast
- Dark mode contrast (if supported)

**Key Tests:**
```typescript
// Run all contrast tests
npx playwright test contrast.spec.ts --config=playwright.config.a11y.ts

// Test text contrast specifically
npx playwright test contrast.spec.ts -g "Text Contrast" --config=playwright.config.a11y.ts
```

### 5. `mobile-a11y.spec.ts`
Tests WCAG 2.1 Level AAA (and AA) touch target requirements.

**Requirements:**
- WCAG AAA: 44x44 CSS pixels minimum (recommended)
- WCAG AA: 24x24 CSS pixels minimum (acceptable)
- Best practice: 48x48px (9mm physical size)

**Coverage:**
- Touch target size (buttons, links, inputs)
- Icon button touch targets
- Checkbox/radio button targets
- Touch target spacing
- Viewport and scaling
- Mobile-specific interactions (hamburger menu, bottom nav)
- Responsive design
- Mobile form accessibility
- Orientation changes
- High DPI/Retina display support

**Key Tests:**
```typescript
// Run all mobile accessibility tests
npx playwright test mobile-a11y.spec.ts --config=playwright.config.a11y.ts

// Test touch target sizes
npx playwright test mobile-a11y.spec.ts -g "Touch Target Size" --config=playwright.config.a11y.ts
```

## Installation

```bash
# Install dependencies
npm install --save-dev @axe-core/playwright

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Run All Accessibility Tests

```bash
# Run all a11y tests
npm run test:a11y

# Or using Playwright directly
npx playwright test --config=playwright.config.a11y.ts
```

### Run Specific Test Suites

```bash
# WCAG compliance tests
npx playwright test tests/a11y/wcag.spec.ts --config=playwright.config.a11y.ts

# Keyboard navigation tests
npx playwright test tests/a11y/keyboard-navigation.spec.ts --config=playwright.config.a11y.ts

# Screen reader compatibility
npx playwright test tests/a11y/screen-reader.spec.ts --config=playwright.config.a11y.ts

# Contrast ratio tests
npx playwright test tests/a11y/contrast.spec.ts --config=playwright.config.a11y.ts

# Mobile accessibility tests
npx playwright test tests/a11y/mobile-a11y.spec.ts --config=playwright.config.a11y.ts
```

### Run Tests in Interactive Mode

```bash
# Run with UI mode
npm run test:a11y:ui

# Run with debug mode
npm run test:a11y:debug

# Run in headed mode
npm run test:a11y:headed
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run accessibility tests
  run: npm run test:a11y

- name: Upload a11y test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: a11y-test-results
    path: playwright-a11y-report/
```

## WCAG 2.1 Compliance Summary

### Level A (Must Have)
- ✅ Keyboard accessibility (2.1.1, 2.1.2, 2.1.3)
- ✅ Bypass blocks (2.4.1)
- ✅ Page titles (2.4.2)
- ✅ Focus order (2.4.3)
- ✅ Link purpose (2.4.4)
- ✅ Headings and labels (2.4.6)
- ✅ Language of page (3.1.1)
- ✅ On focus/input (3.2.1, 3.2.2)
- ✅ Error identification (3.3.1)
- ✅ Labels or instructions (3.3.2)
- ✅ Status messages (4.1.3)

### Level AA (Should Have)
- ✅ Contrast (minimum) (1.4.3)
- ✅ Resize text (1.4.4)
- ✅ Images of text (1.4.9)
- ✅ Focus visible (2.4.7)
- ✅ Error suggestion (3.3.3)
- ✅ Label in name (2.5.3)
- ✅ Target size (2.5.5) - AAA level tested

### Level AAA (Nice to Have)
- ✅ Contrast (enhanced) (1.4.6) - Validated
- ✅ Target size (2.5.8) - 44x44px minimum

## Test Data & Fixtures

### Authentication Fixtures

For authenticated flows, create these fixture files:

```bash
# Patient authentication state
tests/e2e/fixtures/patient-storage.json

# Doctor authentication state
tests/e2e/fixtures/doctor-storage.json
```

Example fixture structure:
```json
{
  "cookies": [...],
  "origins": [
    {
      "origin": "http://localhost:3002",
      "localStorage": [...]
    }
  ]
}
```

## Accessibility Audit Checklist

Use this checklist for manual verification:

- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Keyboard can navigate all interactive elements
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Page has skip links
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] ARIA landmarks are defined
- [ ] Modals trap focus
- [ ] Error messages are announced
- [ ] Touch targets are 44x44px minimum
- [ ] Page has proper language attribute
- [ ] Links have discernible text
- [ ] Tables have proper headers
- [ ] Video has captions (if applicable)

## Common Issues & Fixes

### Issue: Low Contrast on Buttons

**Fix:** Increase color contrast ratio to 4.5:1
```css
.button {
  color: #ffffff; /* white */
  background-color: #0056b3; /* dark blue */
  /* Contrast ratio: 7.1:1 ✅ */
}
```

### Issue: Touch Targets Too Small

**Fix:** Add padding to meet 44x44px minimum
```css
.icon-button {
  width: 44px;
  height: 44px;
  padding: 10px;
}
```

### Issue: Missing Alt Text

**Fix:** Add descriptive alt text to images
```tsx
<img src="/doctor.jpg" alt="Dr. María González profile picture" />
```

### Issue: Focus Not Visible

**Fix:** Add visible focus styles
```css
*:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://www.deque.com/axe/)
- [Playwright Accessibility](https://playwright.dev/docs/accessibility-testing)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Contributing

When adding new features, ensure:
1. All accessibility tests pass
2. Manual keyboard testing is performed
3. Screen reader testing (NVDA/JAWS) is done for complex components
4. Color contrast is validated
5. Touch targets meet size requirements on mobile

## License

Part of the Doctor.mx project.
