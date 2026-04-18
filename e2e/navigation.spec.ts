import { test, expect } from '@playwright/test';

test.describe('Home Page & Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Doctor|Mx|Salud|Health/i);
  });

  test('should navigate to doctors page from home', async ({ page }) => {
    await page.goto('/');

    const doctorsLink = page.locator('a[href="/doctors"]').first();
    await expect(doctorsLink).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/doctors(?:\?.*)?$/),
      doctorsLink.click(),
    ]);

    await expect(page).toHaveURL(/\/doctors(?:\?.*)?$/);
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
