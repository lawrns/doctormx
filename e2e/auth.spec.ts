import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('authentication page loads', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
    await expect(page.getByText('Selecciona tu cuenta')).toBeVisible();
  });

  test('should show auth form elements', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByLabel('Nombre completo')).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Contraseña', exact: true })).toBeVisible();

    await page.getByLabel('Nombre completo').fill('Test User');
    await page.getByLabel('Correo electrónico').fill('test@example.com');
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Test1234!')
    await page.getByRole('textbox', { name: 'Confirmar contraseña', exact: true }).fill('Test1234!')

    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByRole('checkbox', { name: /Acepto los términos/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
  });
});
