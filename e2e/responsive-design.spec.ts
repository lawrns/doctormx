import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop Small', width: 1200, height: 800 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
  ];

  test.describe('Homepage Responsiveness', () => {
    viewports.forEach(({ name, width, height }) => {
      test(`should render correctly on ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check main content is visible
        await expect(page.locator('h1, h2').first()).toBeVisible();

        // Check navigation is accessible
        if (width >= 768) {
          // Desktop/tablet navigation
          await expect(page.locator('nav')).toBeVisible();
        } else {
          // Mobile navigation (hamburger menu)
          const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]');
          if (await mobileMenu.count() > 0) {
            await expect(mobileMenu.first()).toBeVisible();
          }
        }

        // Check no horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(width + 20); // Allow small tolerance
      });
    });
  });

  test.describe('AI Doctor Page Responsiveness', () => {
    viewports.forEach(({ name, width, height }) => {
      test(`should render correctly on ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/doctor');
        await page.waitForLoadState('networkidle');

        // Check chat interface is visible - Use actual selectors
        await expect(page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]')).toBeVisible();
        await expect(page.locator('button[aria-label="Enviar mensaje"]')).toBeVisible();

        // Check chat header
        await expect(page.locator('h1, h2').first()).toBeVisible();

        // Check messages area is properly sized
        const messagesArea = page.locator('.chat-textarea').first();
        if (await messagesArea.count() > 0) {
          await expect(messagesArea).toBeVisible();
        }

        // Test chat interaction - Use actual selectors
        const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
        await input.fill('Test responsive message');
        await page.locator('button[aria-label="Enviar mensaje"]').click();

        // Verify message appears and is properly formatted
        await expect(page.locator('text=Test responsive message')).toBeVisible();

        // Check no horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(width + 20);
      });
    });
  });

  test.describe('Navigation and Layout', () => {
    test('should have working navigation on all screen sizes', async ({ page }) => {
      for (const { name, width, height } of viewports) {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Test navigation to doctor page
        const doctorLink = page.locator('a[href*="/doctor"], text="Doctor"').first();
        if (await doctorLink.count() > 0 && await doctorLink.isVisible()) {
          await doctorLink.click();
          await expect(page).toHaveURL(/.*doctor/);
          await expect(page.locator('h1')).toContainText('Doctor');
        }

        // Go back to home
        await page.goto('/');
      }
    });
  });

  test.describe('Touch and Mobile Interactions', () => {
    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/doctor');
      await page.waitForLoadState('networkidle');

      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');

      // Test touch input
      await input.tap();
      await expect(input).toBeFocused();

      await input.fill('Touch test message');

      const sendButton = page.locator('button[aria-label="Enviar mensaje"]');
      await sendButton.tap();

      await expect(page.locator('text=Touch test message')).toBeVisible();
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto('/doctor');
      await page.waitForLoadState('networkidle');

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await expect(input).toBeFocused();

      // Type message
      await page.keyboard.type('Keyboard navigation test');

      // Submit with Enter
      await page.keyboard.press('Enter');

      await expect(page.locator('text=Keyboard navigation test')).toBeVisible();
    });
  });

  test.describe('Performance on Different Screen Sizes', () => {
    test('should load quickly on all viewports', async ({ page }) => {
      for (const { name, width, height } of viewports.slice(0, 3)) { // Test a few key sizes
        await page.setViewportSize({ width, height });

        const startTime = Date.now();
        await page.goto('/doctor');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Should load within reasonable time (adjust as needed)
        expect(loadTime).toBeLessThan(5000);

        // Check that critical elements are visible
        await expect(page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]')).toBeVisible();
      }
    });
  });
});