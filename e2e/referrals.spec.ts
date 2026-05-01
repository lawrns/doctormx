import { test, expect } from '@playwright/test'

test.describe('Referral signup flow', () => {
  test('patient signs up with a referral code and receives the share card', async ({ page }) => {
    const captured: {
      signupBody: Record<string, unknown> | null
      profileInsertBody: Record<string, unknown> | null
      redemptionBody: Record<string, unknown> | null
    } = {
      signupBody: null,
      profileInsertBody: null,
      redemptionBody: null,
    }

    await page.addInitScript(() => {
      Object.defineProperty(window, 'open', {
        configurable: true,
        value: (url: string) => {
          ;(window as Window & { __lastOpenedUrl?: string }).__lastOpenedUrl = url
          return null
        },
      })

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            ;(window as Window & { __lastClipboardText?: string }).__lastClipboardText = text
          },
        },
      })
    })

    await page.route('**/api/analytics/event**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, sent: true }),
      })
    })

    await page.route('**/auth/v1/signup**', async (route) => {
      captured.signupBody = route.request().postDataJSON() as Record<string, unknown>
      const email = (captured.signupBody?.email as string) || 'lucia@example.com'

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-123',
            email,
            aud: 'authenticated',
            role: 'authenticated',
          },
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: 'user-123',
              email,
            },
          },
        }),
      })
    })

    await page.route('**/rest/v1/profiles**', async (route) => {
      captured.profileInsertBody = route.request().postDataJSON() as Record<string, unknown>

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.route('**/api/patient-referrals**', async (route) => {
      captured.redemptionBody = route.request().postDataJSON() as Record<string, unknown>

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            applied: true,
            refereeBonusApplied: true,
          },
          summary: {
            code: 'ABC123',
            shareUrl: 'https://doctor.mx/auth/register?ref=ABC123',
            totalRedeemed: 1,
            totalRewarded: 1,
            creditsCents: 10000,
            freeConsultsRemaining: 2,
          },
        }),
      })
    })

    await page.goto('/auth/register?ref=abc123')

    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible()

    await page.getByText('Soy paciente').click()
    await page.getByRole('button', { name: 'Siguiente' }).click()

    await expect(page.getByPlaceholder('Juan Pérez')).toBeVisible()
    await page.getByPlaceholder('Juan Pérez').fill('Lucía Pérez')
    await page.getByPlaceholder('tu@email.com').fill('lucia@example.com')
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Test1234!')
    await page.getByPlaceholder('Confirma tu contraseña').fill('Test1234!')

    await page.getByRole('button', { name: 'Siguiente' }).click()

    await expect(page.getByRole('heading', { name: 'Perfil básico' })).toBeVisible()
    await expect(page.getByPlaceholder('AB12CD')).toHaveValue('ABC123')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.getByTestId('referral-share-card')).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'Tu red de referidos está activa' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Compartir por WhatsApp/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Copiar enlace/ })).toBeVisible()

    expect(captured.signupBody).toMatchObject({
      email: 'lucia@example.com',
      password: 'Test1234!',
    })
    expect(captured.profileInsertBody).toMatchObject({
      full_name: 'Lucía Pérez',
      phone: null,
      role: 'patient',
    })
    expect(captured.redemptionBody).toEqual({ referralCode: 'ABC123' })

    await page.getByRole('button', { name: /Compartir por WhatsApp/ }).click()
    await expect.poll(async () => {
      return page.evaluate(() => (window as Window & { __lastOpenedUrl?: string }).__lastOpenedUrl || '')
    }).toContain('wa.me/?text=')

    await page.getByRole('button', { name: /Copiar enlace/ }).click()
    await expect(page.getByRole('button', { name: /Enlace copiado/ })).toBeVisible()
    await expect.poll(async () => {
      return page.evaluate(() => (window as Window & { __lastClipboardText?: string }).__lastClipboardText || '')
    }).toBe('https://doctor.mx/auth/register?ref=ABC123')
  })
})
