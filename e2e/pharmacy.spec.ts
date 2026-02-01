import { test, expect } from '@playwright/test';

test.describe('Pharmacy Integration', () => {
  test('protected pharmacy page redirects to login', async ({ page }) => {
    await page.goto('/pharmacy/affiliate');
    await page.waitForTimeout(1000);
    
    // Protected route should show login or redirect
    const bodyText = await page.locator('body').textContent();
    const isAuthPage = bodyText && (
      bodyText.toLowerCase().includes('iniciar sesion') ||
      bodyText.toLowerCase().includes('login') ||
      bodyText.toLowerCase().includes('correo electronico') ||
      bodyText.toLowerCase().includes('contrasena')
    );
    
    // Either on pharmacy page or auth page
    expect(isAuthPage).toBeTruthy();
  });

  test('pharmacy API endpoint works', async ({ request }) => {
    const response = await request.get('/api/pharmacy/search?q=Paracetamol');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBeTruthy();
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
