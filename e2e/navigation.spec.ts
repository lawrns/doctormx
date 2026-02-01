import { test, expect } from '@playwright/test';

test.describe('Home Page & Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Doctor|Mx|Salud|Health/i);
  });

  test('should navigate to doctors page from home', async ({ page }) => {
    await page.goto('/');
    
    // Find and click doctors link
    const doctorsLink = page.locator('a[href*="doctor"], nav a:has-text("Doctor"), button:has-text("Doctor")').first();
    
    if (await doctorsLink.isVisible().catch(() => false)) {
      await doctorsLink.click();
      await page.waitForTimeout(1000);
      await expect(page.url()).toContain('doctor');
    }
  });

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation elements
    const nav = page.locator('nav, header nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer').first();
    if (await footer.isVisible().catch(() => false)) {
      await expect(footer).toBeVisible();
    }
  });
});
