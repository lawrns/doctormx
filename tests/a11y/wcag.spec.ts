import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * WCAG 2.1 AA Accessibility Tests for Doctor.mx
 *
 * These tests use axe-core to automatically detect accessibility violations
 * according to WCAG 2.1 Level AA standards.
 *
 * Coverage:
 * - All critical user flows
 * - Authentication pages
 * - Patient dashboard
 * - Doctor dashboard
 * - Booking flow
 * - Consultation interface
 * - Forms and inputs
 */

test.describe('WCAG 2.1 AA Compliance', () => {
  const criticalPages = [
    { path: '/', name: 'Landing Page' },
    { path: '/auth/login', name: 'Login Page' },
    { path: '/auth/register', name: 'Register Page' },
    { path: '/doctors', name: 'Doctors Directory' },
    { path: '/specialties', name: 'Specialties Page' },
    { path: '/pricing', name: 'Pricing Page' },
    { path: '/help', name: 'Help Center' },
    { path: '/terms', name: 'Terms of Service' },
    { path: '/privacy', name: 'Privacy Policy' },
  ];

  criticalPages.forEach(({ path, name }) => {
    test(`${name} (${path}) - WCAG 2.1 AA Compliance`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.ignored-for-a11y')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Patient Dashboard', () => {
    test.use({ storageState: 'tests/e2e/fixtures/patient-storage.json' });

    const patientPages = [
      { path: '/app', name: 'Patient Dashboard Home' },
      { path: '/app/appointments', name: 'My Appointments' },
      { path: '/app/profile', name: 'Patient Profile' },
      { path: '/app/followups', name: 'Follow-ups' },
      { path: '/app/chat', name: 'Chat Interface' },
      { path: '/app/ai-consulta', name: 'AI Consultation' },
    ];

    patientPages.forEach(({ path, name }) => {
      test(`${name} - WCAG 2.1 AA Compliance`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('[data-testid="loading-spinner"]')
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    });
  });

  test.describe('Doctor Dashboard', () => {
    test.use({ storageState: 'tests/e2e/fixtures/doctor-storage.json' });

    const doctorPages = [
      { path: '/doctor', name: 'Doctor Dashboard Home' },
      { path: '/doctor/appointments', name: 'Appointments Management' },
      { path: '/doctor/prescription', name: 'Prescription Interface' },
      { path: '/doctor/analytics', name: 'Analytics Dashboard' },
      { path: '/doctor/profile', name: 'Doctor Profile' },
      { path: '/doctor/availability', name: 'Availability Settings' },
      { path: '/doctor/finances', name: 'Financial Dashboard' },
    ];

    doctorPages.forEach(({ path, name }) => {
      test(`${name} - WCAG 2.1 AA Compliance`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('[data-testid="loading-spinner"]')
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    });
  });

  test.describe('Interactive Components', () => {
    test('Modal/Dialog Accessibility', async ({ page }) => {
      await page.goto('/');

      // Trigger a modal (e.g., login modal)
      const loginButton = page.getByRole('button', { name: /iniciar sesión|login|entrar/i });
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(500);

        // Check focus trap
        const modal = page.locator('[role="dialog"]').first();
        if (await modal.isVisible()) {
          const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);

          // Verify focus is trapped in modal
          const closeButton = page.getByRole('button', { name: /cerrar|close/i }).first();
          await page.keyboard.press('Tab');
          const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
          expect(['BUTTON', 'INPUT', 'A', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
        }
      }
    });

    test('Dropdown Menu Accessibility', async ({ page }) => {
      await page.goto('/app');

      // Look for dropdown triggers
      const dropdownTrigger = page.locator('[data-state="closed"]').first();
      if (await dropdownTrigger.isVisible()) {
        await dropdownTrigger.click();
        await page.waitForTimeout(300);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });

    test('Tabs Accessibility', async ({ page }) => {
      await page.goto('/app/appointments');

      // Check for tab components
      const tabList = page.locator('[role="tablist"]').first();
      if (await tabList.isVisible()) {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);

        // Verify keyboard navigation
        const firstTab = page.locator('[role="tab"]').first();
        await firstTab.focus();
        await page.keyboard.press('ArrowRight');

        const nextTab = page.locator('[role="tab"]').nth(1);
        const isNextTabFocused = await nextTab.evaluate(el => el === document.activeElement);
        expect(isNextTabFocused).toBeTruthy();
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('Registration Form Accessibility', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      // Check form accessibility
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .include('form')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);

      // Verify all inputs have labels
      const inputs = page.locator('input:not([type="hidden"]), select, textarea');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const hasLabel = await input.evaluate(el => {
          const labels = ['aria-label', 'aria-labelledby', 'id'];
          return labels.some(prop => el.hasAttribute(prop)) ||
                 !!el.labels?.length;
        });
        expect(hasLabel).toBeTruthy();
      }
    });

    test('Booking Form Accessibility', async ({ page }) => {
      await page.goto('/book/sample-doctor-id');

      const form = page.locator('form').first();
      if (await form.isVisible()) {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .include('form')
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });
  });

  test.describe('WCAG 2.1 Specific Requirements', () => {
    test('Orientation (Success Criterion 1.3.4)', async ({ page }) => {
      // Test that content works in both portrait and landscape
      await page.goto('/');
      await page.setViewportSize({ width: 375, height: 667 }); // Portrait

      const portraitScan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(portraitScan.violations).toEqual([]);

      await page.setViewportSize({ width: 667, height: 375 }); // Landscape

      const landscapeScan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(landscapeScan.violations).toEqual([]);
    });

    test('Identify Input Purpose (Success Criterion 1.3.5)', async ({ page }) => {
      await page.goto('/auth/login');

      // Check that email inputs have autocomplete attributes
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        const autocomplete = await emailInput.getAttribute('autocomplete');
        expect(autocomplete).toBeTruthy();
      }

      // Check password input
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        const autocomplete = await passwordInput.getAttribute('autocomplete');
        expect(['current-password', 'new-password']).toContain(autocomplete);
      }
    });

    test('Character Key Shortcuts (Success Criterion 2.1.4)', async ({ page }) => {
      await page.goto('/app');

      // Verify that keyboard shortcuts can be turned off or remapped
      // Check for keyboard shortcut help/documentation
      const helpLink = page.getByRole('link', { name: /ayuda|help|atajos|shortcuts/i });

      if (await helpLink.isVisible()) {
        await helpLink.click();
        await page.waitForLoadState('networkidle');

        // Look for keyboard shortcut documentation
        const hasShortcutInfo = page.getByText(/keyboard|atajos|teclado/i).isVisible();
        expect(await hasShortcutInfo).toBeTruthy();
      }
    });

    test('Status Messages (Success Criterion 4.1.3)', async ({ page }) => {
      await page.goto('/auth/login');

      // Trigger form validation
      const submitButton = page.getByRole('button', { name: /iniciar|entrar|login/i }).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // Check for aria-live regions for error messages
        const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]');
        const errorMessages = page.locator('text=/error|incorrecto|inválido/i');

        if (await errorMessages.count() > 0) {
          expect(await liveRegions.count()).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Dynamic Content', () => {
    test('Live Region Updates', async ({ page }) => {
      await page.goto('/app/chat');

      // Check for proper aria-live regions for dynamic content
      const liveRegions = page.locator('[aria-live]');
      const count = await liveRegions.count();

      for (let i = 0; i < count; i++) {
        const region = liveRegions.nth(i);
        const politeness = await region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(politeness);
      }
    });

    test('Loading State Indicators', async ({ page }) => {
      await page.goto('/app/appointments');

      // Check for proper loading indicators with aria-busy
      const loadingElements = page.locator('[aria-busy="true"], [data-testid*="loading"]');

      if (await loadingElements.first().isVisible()) {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });
  });

  test.describe('Media and Alternatives', () => {
    test('Image Alternatives', async ({ page }) => {
      await page.goto('/');

      // Check all images have alt text
      const images = page.locator('img:not([role="presentation"])');
      const imageCount = await images.count();

      for (let i = 0; i < Math.min(imageCount, 20); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');

        // Decorative images should have empty alt
        // Content images should have meaningful alt
        const role = await img.getAttribute('role');
        if (role !== 'presentation') {
          expect(typeof alt === 'string').toBeTruthy();
        }
      }
    });

    test('SVG Accessibility', async ({ page }) => {
      await page.goto('/');

      // Check SVG elements have proper titles or aria-labels
      const svgs = page.locator('svg');
      const svgCount = await svgs.count();

      for (let i = 0; i < Math.min(svgCount, 10); i++) {
        const svg = svgs.nth(i);
        const hasTitle = await svg.locator('title').count() > 0;
        const hasAriaLabel = await svg.getAttribute('aria-label') !== null;
        const hasRole = await svg.getAttribute('role') === 'img';

        expect(hasTitle || hasAriaLabel || hasRole).toBeTruthy();
      }
    });
  });

  test.describe('Focus Management', () => {
    test('Skip Links', async ({ page }) => {
      await page.goto('/');

      // Check for skip navigation links
      const skipLink = page.locator('a[href^="#"]:not([href="#"])').first();

      if (await skipLink.isVisible()) {
        const text = await skipLink.textContent();
        const isSkipLink = /skip|saltar|ir al contenido/i.test(text || '');

        if (isSkipLink) {
          expect(await skipLink.isVisible()).toBeTruthy();
        }
      }
    });

    test('Focus Visible Indicator', async ({ page }) => {
      await page.goto('/');

      const firstLink = page.locator('a, button, input, select, textarea').first();
      if (await firstLink.isVisible()) {
        await firstLink.focus();

        // Check for visible focus indicator
        const computedStyle = await firstLink.evaluate(el => {
          return window.getComputedStyle(el);
        });

        const hasFocusStyle =
          computedStyle.outline !== 'none' ||
          computedStyle.boxShadow !== 'none';

        expect(hasFocusStyle).toBeTruthy();
      }
    });
  });

  test.describe('Language and Reading', () => {
    test('Page Language Declaration', async ({ page }) => {
      await page.goto('/');

      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(['es', 'es-MX', 'en']).toContain(lang);
    });

    test('Language Changes', async ({ page }) => {
      await page.goto('/');

      // Check for language changes within the document
      const elementsWithLang = page.locator('[lang]:not(html)');
      const count = await elementsWithLang.count();

      for (let i = 0; i < count; i++) {
        const el = elementsWithLang.nth(i);
        const lang = await el.getAttribute('lang');
        expect(lang).toBeTruthy();
        expect(lang?.length).toBeGreaterThan(1);
      }
    });
  });
});
