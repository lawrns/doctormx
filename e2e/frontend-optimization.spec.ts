import { expect, test } from '@playwright/test'

test.describe('frontend optimization smoke', () => {
  test('homepage exposes the patient conversion path on desktop and mobile', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /dr\. simeón te orienta en 2 minutos/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /hablar con dr\. simeón/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /ver médicos/i }).first()).toBeVisible()
    await expect(page.getByText(/orientación con ia, no un diagnóstico médico/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /descarta señales de alarma/i })).toBeVisible()

    await page.setViewportSize({ width: 390, height: 844 })
    await page.mouse.wheel(0, 520)
    await expect(page.getByRole('link', { name: /hablar con dr\. simeón/i }).last()).toBeVisible()
  })

  test('ai consult starts with safety boundaries and intake actions', async ({ page }) => {
    await page.goto('/ai-consulta')

    await expect(page.getByRole('heading', { name: /dr\. simeon/i })).toBeVisible()
    await expect(page.getByText(/orientación clínica inicial/i)).toBeVisible()
    await expect(page.getByText(/llama al 911/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /presión en el pecho/i })).toBeVisible()
  })

  test('doctor directory shows mobile filters and transactional booking actions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/doctors')

    await expect(page.getByRole('heading', { name: /doctores y especialistas verificados/i })).toBeVisible()
    await expect(page.getByText('Filtros').first()).toBeVisible()
    await expect(page.getByLabel(/ordenar doctores/i)).toBeVisible()
    const bookingLink = page.getByRole('link', { name: /agendar(?: cita)?/i }).first()
    const emptyState = page.getByText(/no encontramos doctores/i)

    if (await bookingLink.count()) {
      await expect(bookingLink).toBeVisible()
    } else {
      await expect(emptyState).toBeVisible()
    }
  })
})
