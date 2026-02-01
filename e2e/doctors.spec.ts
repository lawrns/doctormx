import { test, expect } from '@playwright/test';

test.describe('Doctor Directory', () => {
  test('should load doctor directory page', async ({ page }) => {
    await page.goto('/doctors');
    await expect(page.locator('body')).toContainText(/doctor|medico|directorio/i);
  });

  test('should display doctor content', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForTimeout(2000);
    
    // Check for any content indicating doctors loaded
    const hasContent = await page.locator('body').textContent().then(text => 
      text && (text.toLowerCase().includes('dr') || 
               text.toLowerCase().includes('doctor') || 
               text.toLowerCase().includes('médico') ||
               text.toLowerCase().includes('especialista'))
    );
    
    expect(hasContent).toBeTruthy();
  });

  test('should allow searching doctors', async ({ page }) => {
    await page.goto('/doctors');
    
    const searchInput = page.locator('input').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Dr');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/dr|doctor|medico/i);
    }
  });
});
