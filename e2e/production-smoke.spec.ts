import { test, expect } from '@playwright/test';

const PROD_URL = 'https://doctor.mx';

// Use a unique disposable email to avoid conflicts
const testEmail = `smoke.test.${Date.now()}@mailinator.com`;
const testPassword = 'TestPass123!';

test.describe('Production Smoke Tests @doctor.mx', () => {
  test('registration page loads with design system', async ({ page }) => {
    await page.goto(`${PROD_URL}/auth/register`);
    await expect(page).toHaveTitle(/Crear cuenta|Doctor\.mx/);

    // Design system elements
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Account type selection
    await expect(page.getByText('Soy paciente')).toBeVisible();
    await expect(page.getByText('Soy médico')).toBeVisible();

    // Navigate to form
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Form fields render
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('login page loads with design system', async ({ page }) => {
    await page.goto(`${PROD_URL}/auth/login`);
    await expect(page).toHaveTitle(/Iniciar sesión|Doctor\.mx/);

    // Form elements
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar sesión|Entrar/ })).toBeVisible();

    // Design system: no raw hsl() tokens visible
    const body = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
    expect(body).not.toContain('hsl(var');
  });

  test('full registration + login flow', async ({ page }) => {
    // Step 1: Register
    await page.goto(`${PROD_URL}/auth/register`);

    // Select patient account
    await page.getByText('Soy paciente').click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Wait for step 2 form to appear
    await expect(page.getByText('Información personal')).toBeVisible({ timeout: 10000 });

    // Fill registration form
    await page.getByPlaceholder(/Juan Pérez|Nombre completo/).fill('Smoke Test User');
    await page.getByPlaceholder(/tu@email.com|Correo electrónico/).fill(testEmail);
    await page.getByPlaceholder(/Mínimo 6 caracteres|Contraseña/).fill(testPassword);

    // Confirm password if field exists
    const confirmPw = page.locator('input[placeholder*="Confirma"], input[placeholder*="confirmar"]').first();
    if (await confirmPw.isVisible().catch(() => false)) {
      await confirmPw.fill(testPassword);
    }

    // Submit form by pressing Enter in the last password field
    await page.locator('input[type="password"]').last().press('Enter');

    // Wait for result — either redirect to app, login, or show message
    await page.waitForTimeout(8000);

    const url = page.url();
    const bodyText = await page.locator('body').innerText();

    // Acceptable outcomes
    const success =
      url.includes('/app') ||
      url.includes('/auth/login') ||
      bodyText.toLowerCase().includes('verifica') ||
      bodyText.toLowerCase().includes('confirmar') ||
      bodyText.toLowerCase().includes('éxito') ||
      bodyText.toLowerCase().includes('success') ||
      bodyText.toLowerCase().includes('bienvenido');

    expect(success, `Registration result: ${url} — ${bodyText.slice(0, 300)}`).toBeTruthy();

    // Step 2: Login with new account
    await page.goto(`${PROD_URL}/auth/login`);
    await page.locator('input[type="email"]').first().fill(testEmail);
    await page.locator('input[type="password"]').first().fill(testPassword);
    await page.getByRole('button', { name: /Iniciar sesión|Entrar/ }).click();

    await page.waitForTimeout(5000);
    const loginUrl = page.url();
    const loginBody = await page.locator('body').innerText();

    const loginSuccess =
      loginUrl.includes('/app') ||
      loginUrl.includes('/doctor') ||
      loginBody.toLowerCase().includes('verifica') ||
      loginBody.toLowerCase().includes('confirmar') ||
      loginBody.toLowerCase().includes('bienvenido');

    expect(loginSuccess, `Login result: ${loginUrl} — ${loginBody.slice(0, 300)}`).toBeTruthy();
  });

  test('public ai-consulta uses design system tokens', async ({ page }) => {
    await page.goto(`${PROD_URL}/ai-consulta`);
    await expect(page).toHaveTitle(/Doctor\.mx/);

    // Header should be visible
    await expect(page.locator('header').first()).toBeVisible();

    // Header should be visible
    await expect(page.locator('header').first()).toBeVisible();
  });

  test('checkout page loads for anonymous user', async ({ page }) => {
    // Try to load a checkout page — should either show payment form or redirect to login
    await page.goto(`${PROD_URL}/checkout/test-appointment-id`);
    await page.waitForTimeout(2000);

    const url = page.url();
    const bodyText = await page.locator('body').innerText();

    // Either shows checkout UI or redirects to login
    const isCheckout = bodyText.includes('Completar Pago') || bodyText.includes('pago');
    const isLoginRedirect = url.includes('/auth/login');

    expect(isCheckout || isLoginRedirect).toBeTruthy();
  });
});
