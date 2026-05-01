import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('authentication page loads', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
    await expect(page.getByText('Selecciona tu cuenta')).toBeVisible();
  });

  test('should show auth form elements', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByText('Soy paciente').click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByPlaceholder('Juan Pérez')).toBeVisible();
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Contraseña', exact: true })).toBeVisible();

    await page.getByPlaceholder('Juan Pérez').fill('Test User');
    await page.getByPlaceholder('tu@email.com').fill('test@example.com');
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Test1234!')
    await page.getByPlaceholder('Confirma tu contraseña').fill('Test1234!')

    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByRole('heading', { name: 'Perfil básico' })).toBeVisible();
    await expect(page.getByPlaceholder('55 1234 5678')).toBeVisible();
    await expect(page.getByPlaceholder('AB12CD')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
  });
});
