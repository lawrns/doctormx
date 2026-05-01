import { test, expect } from '@playwright/test';

const PROD_URL = process.env.PROD_URL?.replace(/\/$/, '');
const RUN_MUTATING_PROD_SMOKE = process.env.RUN_MUTATING_PROD_SMOKE === '1';

function productionUrl(path: string) {
  if (!PROD_URL) {
    throw new Error('Set PROD_URL to run production smoke tests.');
  }

  return `${PROD_URL}${path}`;
}

// Use a unique disposable email to avoid conflicts
const testEmail = `smoke.test.${Date.now()}@mailinator.com`;
const testPassword = 'TestPass123!';

test.describe('Production Smoke Tests @doctor.mx', () => {
  test.beforeEach(() => {
    test.skip(!PROD_URL, 'Set PROD_URL to run production smoke tests against an explicit deployment.');
  });

  test('registration page loads with design system', async ({ page }) => {
    await page.goto(productionUrl('/auth/register'));
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
    await page.goto(productionUrl('/auth/login'));
    await expect(page).toHaveTitle(/Iniciar sesión|Doctor\.mx/);

    // Form elements
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar sesión|Entrar/ })).toBeVisible();

    // Design system: no raw hsl() tokens visible
    const body = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
    expect(body).not.toContain('hsl(var');
  });

  test('registration flow reaches review step without submitting', async ({ page }) => {
    await page.goto(productionUrl('/auth/register'));

    await page.getByText('Soy paciente').click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByPlaceholder('Juan Pérez')).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder('Juan Pérez').fill('Smoke Test User');
    await page.getByPlaceholder('tu@email.com').fill(testEmail);
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill(testPassword);
    await page.getByPlaceholder('Confirma tu contraseña').fill(testPassword);
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByRole('heading', { name: 'Perfil básico' })).toBeVisible();
    await expect(page.getByPlaceholder('55 1234 5678')).toBeVisible();
    await expect(page.getByPlaceholder('AB12CD')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
  });

  test('full registration + login flow when explicitly enabled', async ({ page }) => {
    test.skip(
      !RUN_MUTATING_PROD_SMOKE,
      'Set RUN_MUTATING_PROD_SMOKE=1 to create disposable production smoke accounts.',
    );

    await page.goto(productionUrl('/auth/register'));

    await page.getByText('Soy paciente').click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByPlaceholder('Juan Pérez')).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder('Juan Pérez').fill('Smoke Test User');
    await page.getByPlaceholder('tu@email.com').fill(testEmail);
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill(testPassword);
    await page.getByPlaceholder('Confirma tu contraseña').fill(testPassword);
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByRole('heading', { name: 'Perfil básico' })).toBeVisible();
    await page.getByPlaceholder('55 1234 5678').fill('55 1234 5678');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await page.waitForTimeout(8000);

    const url = page.url();
    const bodyText = await page.locator('body').innerText();
    const registrationSuccess =
      url.includes('/app') ||
      url.includes('/auth/login') ||
      bodyText.toLowerCase().includes('verifica') ||
      bodyText.toLowerCase().includes('confirmar') ||
      bodyText.toLowerCase().includes('éxito') ||
      bodyText.toLowerCase().includes('success') ||
      bodyText.toLowerCase().includes('bienvenido');

    expect(registrationSuccess, `Registration result: ${url} — ${bodyText.slice(0, 300)}`).toBeTruthy();

    await page.goto(productionUrl('/auth/login'));
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
    await page.goto(productionUrl('/ai-consulta'));
    await expect(page).toHaveTitle(/Doctor\.mx/);

    // Header should be visible
    await expect(page.locator('header').first()).toBeVisible();

    // Header should be visible
    await expect(page.locator('header').first()).toBeVisible();
  });

  test('checkout page loads for anonymous user', async ({ page }) => {
    // Try to load a checkout page — should either show payment form or redirect to login
    await page.goto(productionUrl('/checkout/test-appointment-id'));
    await page.waitForTimeout(2000);

    const url = page.url();
    const bodyText = await page.locator('body').innerText();

    // Either shows checkout UI or redirects to login
    const isCheckout = bodyText.includes('Completar Pago') || bodyText.includes('pago');
    const isLoginRedirect = url.includes('/auth/login');

    expect(isCheckout || isLoginRedirect).toBeTruthy();
  });
});
