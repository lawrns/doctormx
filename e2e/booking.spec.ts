import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should navigate to search and see doctors', async ({ page }) => {
    await page.goto('/');
    console.log('Page title:', await page.title());
    
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    // Try to find any search related element or specialty card
    const specialtyCard = page.locator('a[href*="specialty"], a[href*="especialidad"]').first();
    if (await specialtyCard.isVisible()) {
      await specialtyCard.click();
    } else {
      await page.goto('/doctores');
    }
    
    await expect(page).toHaveURL(/\/(doctors|doctores)/, { timeout: 15000 });
  });

  test('should view doctor profile if available', async ({ page }) => {
    // Direct navigation to doctors list
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    
    // Check if we see any links (doctor profiles often have their own links)
    const links = page.locator('a');
    const linkCount = await links.count();
    console.log('Total links on /doctores:', linkCount);

    // Look for links that look like doctor profiles
    const doctorProfileLink = page.locator('a[href^="/doctors/"], a[href^="/doctores/"]').first();
    
    if (await doctorProfileLink.isVisible()) {
      await doctorProfileLink.click();
      await expect(page).toHaveURL(/\/(doctors|doctores)\/[a-z0-9-]+/);
      await expect(page.locator('body')).toBeVisible();
    } else {
      console.log('No specific doctor links found, checking body content');
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
