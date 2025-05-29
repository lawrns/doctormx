import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.describe('Anonymous User Journey', () => {
    test('should complete anonymous consultation flow', async ({ page }) => {
      // Start at homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to AI Doctor
      const doctorButton = page.locator('a[href*="/doctor"], text="Doctor"').first();
      if (await doctorButton.count() > 0) {
        await doctorButton.click();
      } else {
        await page.goto('/doctor');
      }
      
      await page.waitForLoadState('networkidle');
      
      // Verify consultation limit is shown
      await expect(page.locator('text=Consultas gratuitas')).toBeVisible();
      
      // Send a medical query
      const input = page.locator('input[placeholder*="síntomas"]');
      await input.fill('Tengo dolor de cabeza desde hace 2 días');
      await page.locator('button[type="submit"]').click();
      
      // Verify user message appears
      await expect(page.locator('text=Tengo dolor de cabeza desde hace 2 días')).toBeVisible();
      
      // Verify AI response appears
      await expect(page.locator('.bg-gray-100')).toBeVisible({ timeout: 5000 });
      
      // Continue conversation
      await input.fill('Es un dolor punzante');
      await page.locator('button[type="submit"]').click();
      
      await expect(page.locator('text=Es un dolor punzante')).toBeVisible();
      
      // Check that conversion prompt might appear
      const conversionPrompt = page.locator('text=Crear cuenta');
      if (await conversionPrompt.count() > 0) {
        await expect(conversionPrompt).toBeVisible();
      }
    });

    test('should handle consultation limit reached', async ({ page }) => {
      await page.goto('/doctor');
      await page.waitForLoadState('networkidle');
      
      // Simulate multiple consultations by directly manipulating localStorage
      await page.evaluate(() => {
        const limit = { total: 3, used: 3, remaining: 0 };
        localStorage.setItem('anonymous_consultation_limit', JSON.stringify(limit));
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Try to send a message
      const input = page.locator('input[placeholder*="síntomas"]');
      await input.fill('Test message');
      await page.locator('button[type="submit"]').click();
      
      // Should show conversion prompt
      await expect(page.locator('text=Crear cuenta')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Navigation Flow', () => {
    test('should navigate between main pages', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test navigation to different sections
      const navLinks = [
        { text: 'Doctor', url: '/doctor' },
        { text: 'Conectar', url: '/connect' },
      ];
      
      for (const { text, url } of navLinks) {
        const link = page.locator(`a[href*="${url}"], text="${text}"`).first();
        if (await link.count() > 0 && await link.isVisible()) {
          await link.click();
          await page.waitForLoadState('networkidle');
          expect(page.url()).toContain(url);
        }
      }
    });

    test('should handle direct URL access', async ({ page }) => {
      const routes = ['/doctor', '/connect', '/image-analysis', '/lab-testing'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Should not show error page
        await expect(page.locator('text=404')).not.toBeVisible();
        await expect(page.locator('text=Error')).not.toBeVisible();
        
        // Should show some content
        const body = page.locator('body');
        const bodyText = await body.textContent();
        expect(bodyText).toBeTruthy();
        expect(bodyText!.length).toBeGreaterThan(10);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/doctor');
      await page.waitForLoadState('networkidle');
      
      // Simulate network failure
      await page.route('**/*', route => route.abort());
      
      const input = page.locator('input[placeholder*="síntomas"]');
      await input.fill('Test network error');
      await page.locator('button[type="submit"]').click();
      
      // Should show user message even if network fails
      await expect(page.locator('text=Test network error')).toBeVisible();
      
      // Should show some indication of error or continue working offline
      // The specific behavior depends on your error handling implementation
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      let jsErrors: string[] = [];
      
      page.on('pageerror', (error) => {
        jsErrors.push(error.message);
      });
      
      await page.goto('/doctor');
      await page.waitForLoadState('networkidle');
      
      // Interact with the page
      const input = page.locator('input[placeholder*="síntomas"]');
      await input.fill('Test JS error handling');
      await page.locator('button[type="submit"]').click();
      
      // Should not have critical JavaScript errors
      const criticalErrors = jsErrors.filter(error => 
        error.includes('Cannot read property') || 
        error.includes('is not a function') ||
        error.includes('undefined')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/doctor');
      await page.waitForLoadState('networkidle');
      
      // Start navigation from the top
      await page.keyboard.press('Tab');
      
      // Should be able to reach the input field
      const input = page.locator('input[placeholder*="síntomas"]');
      await expect(input).toBeFocused();
      
      // Should be able to type
      await page.keyboard.type('Accessibility test');
      
      // Should be able to reach submit button
      await page.keyboard.press('Tab');
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeFocused();
      
      // Should be able to submit with Enter
      await page.keyboard.press('Enter');
      await expect(page.locator('text=Accessibility test')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/doctor');
      await page.waitForLoadState('networkidle');
      
      // Check for essential ARIA labels
      const input = page.locator('input[placeholder*="síntomas"]');
      const inputRole = await input.getAttribute('role');
      const inputLabel = await input.getAttribute('aria-label');
      const inputPlaceholder = await input.getAttribute('placeholder');
      
      // Should have either aria-label or meaningful placeholder
      expect(inputLabel || inputPlaceholder).toBeTruthy();
      
      const submitButton = page.locator('button[type="submit"]');
      const buttonLabel = await submitButton.getAttribute('aria-label');
      const buttonText = await submitButton.textContent();
      
      // Button should have label or text content
      expect(buttonLabel || buttonText).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('should load critical resources quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/doctor');
      await page.waitForLoadState('domcontentloaded');
      
      const domLoadTime = Date.now() - startTime;
      expect(domLoadTime).toBeLessThan(3000); // 3 seconds for DOM
      
      await page.waitForLoadState('networkidle');
      const fullLoadTime = Date.now() - startTime;
      expect(fullLoadTime).toBeLessThan(5000); // 5 seconds for full load
    });

    test('should handle rapid interactions', async ({ page }) => {
      await page.goto('/doctor');
      await page.waitForLoadState('networkidle');
      
      const input = page.locator('input[placeholder*="síntomas"]');
      const sendButton = page.locator('button[type="submit"]');
      
      // Send multiple messages rapidly
      for (let i = 0; i < 3; i++) {
        await input.fill(`Rapid message ${i + 1}`);
        await sendButton.click();
        
        // Small delay to prevent overwhelming
        await page.waitForTimeout(100);
      }
      
      // Should handle all messages appropriately
      await expect(page.locator('text=Rapid message 1')).toBeVisible();
      
      // Should not crash or become unresponsive
      await expect(input).toBeEnabled();
    });
  });
});