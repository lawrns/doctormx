import { expect, test } from '@playwright/test'

test.describe('frontend optimization smoke', () => {
  test('homepage exposes the patient conversion path on desktop and mobile', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /consulta médica en línea en méxico/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /consulta gratis con dr\. simeon/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /buscar doctor/i }).first()).toBeVisible()
    await expect(page.getByText(/de síntomas a consulta pagada/i)).toBeVisible()
    await expect(page.getByText(/revisión humana, privacidad/i)).toBeVisible()

    await page.setViewportSize({ width: 390, height: 844 })
    await page.mouse.wheel(0, 520)
    await expect(page.getByRole('link', { name: /consulta gratis/i }).last()).toBeVisible()
  })

  test('ai consult starts with safety boundaries and intake actions', async ({ page }) => {
    await page.goto('/ai-consulta')

    await expect(page.getByRole('heading', { name: /cómo te sientes/i })).toBeVisible()
    await expect(page.getByText(/orientación ia/i)).toBeVisible()
    await expect(page.getByText(/no sustituye urgencias/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /dolor de pecho/i })).toBeVisible()
  })

  test('doctor directory shows mobile filters and transactional booking actions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/doctors')

    await expect(page.getByPlaceholder(/especialidad o doctor/i).last()).toBeVisible()
    await expect(page.getByRole('link', { name: /teleconsulta/i })).toBeVisible()
    const bookingLink = page.getByRole('link', { name: /agendar cita/i }).first()
    const emptyState = page.getByText(/no encontramos doctores/i)

    if (await bookingLink.count()) {
      await expect(bookingLink).toBeVisible()
    } else {
      await expect(emptyState).toBeVisible()
    }
  })
})
