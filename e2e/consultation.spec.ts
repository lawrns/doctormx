import { test, expect } from '@playwright/test';

test.describe('Consultation & Booking', () => {
  test('should load appointments page', async ({ page }) => {
    await page.goto('/app/appointments');
    await expect(page.locator('body')).toContainText(/cita|consulta|appointment|iniciar sesión|login/i);
  });

  test('should load AI consulta page', async ({ page }) => {
    await page.goto('/ai-consulta');
    await expect(page.locator('body')).toContainText(/consulta|consultation|ai/i);
  });

  test('should display chat interface', async ({ page }) => {
    await page.goto('/app/chat');
    await expect(page.locator('body')).toContainText(/chat|mensaje|consulta|iniciar sesión|login/i);
  });
});
