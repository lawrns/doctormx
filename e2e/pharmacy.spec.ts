import { test, expect } from '@playwright/test';

test.describe('Pharmacy Integration', () => {
  test('doctor pharmacy page requires doctor authentication', async ({ page }) => {
    await page.goto('/doctor/pharmacy');

    const bodyText = (await page.locator('body').textContent())?.toLowerCase() ?? '';
    const isLoginGate =
      page.url().includes('/auth/login') ||
      bodyText.includes('iniciar sesión') ||
      bodyText.includes('login') ||
      bodyText.includes('correo electrónico') ||
      bodyText.includes('contraseña');

    expect(isLoginGate).toBeTruthy();
  });

  test('pharmacy API endpoint works', async ({ request }) => {
    const response = await request.get('/api/pharmacy/search?q=Paracetamol');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBeTruthy();
    expect(data).toHaveProperty('total');
  });

  test('pharmacy compare API works', async ({ request }) => {
    const response = await request.post('/api/pharmacy/compare', {
      data: { medicationName: 'Paracetamol' }
    });
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('medicationName');
    expect(data).toHaveProperty('results');
  });
});
