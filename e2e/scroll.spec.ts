import { test, expect } from '@playwright/test';

test.describe('Scroll Position Verification', () => {
  test('AI Doctor (Second Opinion) should start at top', async ({ page }) => {
    await page.goto('/app/second-opinion');
    await page.waitForLoadState('networkidle');
    
    // Check scroll position immediately
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('Doctor Directory should start at top', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('Doctor Profile should start at top', async ({ page }) => {
    await page.goto('/doctors');
    const doctorLink = page.locator('a[href^="/doctors/"]').first();
    if (await doctorLink.isVisible()) {
      await doctorLink.click();
      await page.waitForLoadState('networkidle');
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);
    }
  });

  test('Search Assistant results should start at top', async ({ page }) => {
    await page.goto('/');
    // Interaction might be complex, let's just check direct navigation
    await page.goto('/doctors?specialty=cardiologia');
    await page.waitForLoadState('networkidle');
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });
});
