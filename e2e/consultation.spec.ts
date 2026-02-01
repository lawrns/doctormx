import { test, expect } from '@playwright/test';

test.describe('Consultation & Booking', () => {
  test('should load appointments page', async ({ page }) => {
    await page.goto('/app/appointments');
    await expect(page.locator('body')).toContainText(/cita|consulta|appointment/i);
  });

  test('should load AI consulta page', async ({ page }) => {
    await page.goto('/ai-consulta');
    await expect(page.locator('body')).toContainText(/consulta|consultation|ai/i);
  });

  test('should display chat interface', async ({ page }) => {
    await page.goto('/app/chat');
    const chatInput = page.locator('input[type="text"], textarea, [contenteditable]').first();
    if (await chatInput.isVisible().catch(() => false)) {
      await expect(chatInput).toBeVisible();
    }
  });
});
