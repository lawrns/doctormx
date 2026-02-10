# Quick Start Guide - WCAG 2.1 AA Accessibility Tests

## Installation

Dependencies are already installed:
```bash
@axe-core/playwright@^4.11.1
```

## Quick Commands

### Run All Accessibility Tests
```bash
npm run test:a11y
```

### Run Specific Test Suites
```bash
npm run test:a11y:wcag          # WCAG compliance tests
npm run test:a11y:keyboard      # Keyboard navigation tests
npm run test:a11y:screen-reader # Screen reader compatibility
npm run test:a11y:contrast      # Contrast ratio tests
npm run test:a11y:mobile        # Mobile/touch target tests
```

### Interactive Testing
```bash
npm run test:a11y:ui            # UI mode
npm run test:a11y:debug         # Debug mode
npm run test:a11y:headed        # Headed mode
```

### View Results
```bash
npm run test:a11y:report        # Open HTML report
```

## Test Coverage Summary

| Test File | Lines | Test Cases | Coverage |
|-----------|-------|------------|----------|
| wcag.spec.ts | 422 | 50+ | WCAG 2.1 AA compliance |
| keyboard-navigation.spec.ts | 721 | 40+ | WCAG 2.1 keyboard requirements |
| screen-reader.spec.ts | 684 | 50+ | NVDA/JAWS compatibility |
| contrast.spec.ts | 720 | 30+ | WCAG AA contrast ratios |
| mobile-a11y.spec.ts | 702 | 40+ | Touch targets 48x48px |
| **Total** | **3,249** | **210+** | **Comprehensive WCAG 2.1 AA** |

## WCAG 2.1 Requirements Covered

### Level A (Must Have)
- Keyboard accessibility (2.1.1, 2.1.2, 2.1.3)
- Bypass blocks (2.4.1)
- Focus order (2.4.3)
- Language of page (3.1.1)
- Error identification (3.3.1)

### Level AA (Should Have)
- Contrast (minimum) 4.5:1 text, 3:1 UI (1.4.3)
- Focus visible (2.4.7)
- Target size 44x44px (2.5.5) - Level AAA tested

## Files Delivered

```
tests/a11y/
├── wcag.spec.ts                    (422 lines) - WCAG 2.1 AA compliance
├── keyboard-navigation.spec.ts      (721 lines) - Keyboard accessibility
├── screen-reader.spec.ts            (684 lines) - Screen reader compatibility
├── contrast.spec.ts                 (720 lines) - Contrast ratio validation
├── mobile-a11y.spec.ts              (702 lines) - Touch target testing
├── README.md                        (355 lines) - Full documentation
├── IMPLEMENTATION_SUMMARY.md        (280 lines) - Implementation details
└── QUICK_START.md                   (this file)

playwright.config.a11y.ts            (specialized config)
package.json                         (updated with a11y scripts)
```

## Common Issues

### Issue: Tests Fail on Authentication Pages
**Solution:** Create authentication fixtures:
```bash
tests/e2e/fixtures/patient-storage.json
tests/e2e/fixtures/doctor-storage.json
```

### Issue: Low Contrast Failures
**Solution:** Increase color contrast to 4.5:1 for text, 3:1 for UI components

### Issue: Touch Target Too Small
**Solution:** Add padding to meet 44x44px minimum

### Issue: Missing Alt Text
**Solution:** Add descriptive alt text to all images

## Next Steps

1. Run initial test suite: `npm run test:a11y`
2. Review HTML report: `playwright-a11y-report/index.html`
3. Fix any Level A or AA failures
4. Add to CI/CD pipeline
5. Run before each release

## Support

For detailed documentation, see `tests/a11y/README.md`
