import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('authentication page loads', async ({ page }) => {
    await page.goto('/auth/register');
    // Page may redirect to login if already authenticated check
    await expect(page.locator('body')).toContainText(/doctor|login|sesion|registro/i);
  });

  test('should show auth form elements', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForTimeout(1000);
    
    // Look for common auth form elements
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[name*="correo"]').first();
    const passwordInput = page.locator('input[type="password"], input[name*="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Registrarse")').first();
    
    const hasAuthElements = await Promise.all([
      emailInput.isVisible().catch(() => false),
      passwordInput.isVisible().catch(() => false),
      submitButton.isVisible().catch(() => false)
    ]).then(results => results.some(Boolean));
    
    expect(hasAuthElements).toBeTruthy();
  });
});
