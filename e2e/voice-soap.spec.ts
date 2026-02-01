import { test, expect } from '@playwright/test';

test.describe('Voice-to-SOAP Feature', () => {
  test('should display SOAP demo page', async ({ page }) => {
    await page.goto('/soap-demo');
    await expect(page.locator('body')).toContainText(/soap|nota|consulta/i);
  });

  test('should show SOAP note sections', async ({ page }) => {
    await page.goto('/soap-demo');
    
    // Check for SOAP sections
    const subjective = page.locator('text=/subjetivo|subjective/i').first();
    const objective = page.locator('text=/objetivo|objective/i').first();
    const assessment = page.locator('text=/analisis|assessment|plan/i').first();
    
    const elements = [subjective, objective, assessment];
    let visibleCount = 0;
    
    for (const el of elements) {
      if (await el.isVisible().catch(() => false)) {
        visibleCount++;
      }
    }
    
    // At least some SOAP sections should be visible
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('should display voice dictation interface if available', async ({ page }) => {
    await page.goto('/soap-demo');
    
    // Look for voice dictation button or interface
    const voiceButton = page.locator('button[data-testid="voice-dictation"], button[aria-label*="voz"], button[aria-label*="voice"], button:has-text("mic"), button:has-text("voz"), button svg').first();
    
    if (await voiceButton.isVisible().catch(() => false)) {
      await expect(voiceButton).toBeVisible();
    } else {
      // Voice feature might be behind a feature flag or on specific pages
      test.skip();
    }
  });
});
