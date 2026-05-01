import { test, expect } from '@playwright/test';

test.describe('Voice-to-SOAP Feature', () => {
  test('doctor marketing surface describes SOAP note support', async ({ page }) => {
    await page.goto('/for-doctors');

    await expect(page.locator('body')).toContainText(/soap|nota|consulta/i);
  });

  test('doctor comparison page shows SOAP note value proposition', async ({ page }) => {
    await page.goto('/alternativa-doctoralia');

    await expect(page.locator('body')).toContainText(/IA para notas SOAP|notas clínicas/i);
  });

  test('SOAP structuring API is protected for anonymous users', async ({ request }) => {
    const response = await request.post('/api/ai/structure-soap', {
      data: {
        appointmentId: 'test-appointment-id',
        rawText: 'Paciente refiere tos y fiebre. Indico reposo y seguimiento.',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.text();
    expect(body).toMatch(/Unauthorized/i);
  });

  test('legacy public SOAP demo route is not part of the current surface', async ({ request }) => {
    const response = await request.get('/soap-demo');

    expect(response.status()).toBe(404);
  });
});
