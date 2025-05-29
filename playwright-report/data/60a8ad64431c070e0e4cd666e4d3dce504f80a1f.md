# Test info

- Name: Responsive Design Tests >> AI Doctor Page Responsiveness >> should render correctly on Desktop Small (1200x800)
- Location: /Users/excite/Documents/GitHub/doctormx/e2e/responsive-design.spec.ts:44:11

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('textarea[placeholder*="Cuéntame qué te duele"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('textarea[placeholder*="Cuéntame qué te duele"]')

    at /Users/excite/Documents/GitHub/doctormx/e2e/responsive-design.spec.ts:50:86
```

# Page snapshot

```yaml
- banner:
  - link "DoctorMX DoctorMX":
    - /url: /
    - img "DoctorMX"
    - text: DoctorMX
  - navigation:
    - link "Consulta Virtual":
      - /url: /doctor
      - img
    - link "Análisis de Imágenes":
      - /url: /image-analysis
      - img
    - link "Exámenes a Domicilio":
      - /url: /lab-testing
      - img
  - button "Cambiar idioma":
    - img
    - text: ES
  - link "Iniciar Sesión":
    - /url: /login
    - button "Iniciar Sesión"
  - link "Registrarse":
    - /url: /register
    - button "Registrarse"
- main:
  - text: "Consultas gratuitas: 5 de 5"
  - link "Crear cuenta para más consultas →":
    - /url: /register
  - img
  - heading "Doctor IA - Chat Médico" [level=1]
  - paragraph: ¡Hola! Soy Dr. Simeon, tu médico mexicano inteligente. ¿Para quién es la consulta de hoy? Estoy aquí para ayudarte con cualquier problema de salud de tu familia.
  - textbox "Describe tus síntomas..."
  - button [disabled]:
    - img
- link "Contactar por WhatsApp":
  - /url: https://wa.me/526144792338
  - img
  - text: ¡Contáctanos!
- alert:
  - button "Close":
    - text: Close
    - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Responsive Design Tests', () => {
   4 |   const viewports = [
   5 |     { name: 'Mobile Portrait', width: 375, height: 667 },
   6 |     { name: 'Mobile Landscape', width: 667, height: 375 },
   7 |     { name: 'Tablet Portrait', width: 768, height: 1024 },
   8 |     { name: 'Tablet Landscape', width: 1024, height: 768 },
   9 |     { name: 'Desktop Small', width: 1200, height: 800 },
   10 |     { name: 'Desktop Large', width: 1920, height: 1080 },
   11 |   ];
   12 |
   13 |   test.describe('Homepage Responsiveness', () => {
   14 |     viewports.forEach(({ name, width, height }) => {
   15 |       test(`should render correctly on ${name} (${width}x${height})`, async ({ page }) => {
   16 |         await page.setViewportSize({ width, height });
   17 |         await page.goto('/');
   18 |         await page.waitForLoadState('networkidle');
   19 |
   20 |         // Check main content is visible
   21 |         await expect(page.locator('h1, h2').first()).toBeVisible();
   22 |
   23 |         // Check navigation is accessible
   24 |         if (width >= 768) {
   25 |           // Desktop/tablet navigation
   26 |           await expect(page.locator('nav')).toBeVisible();
   27 |         } else {
   28 |           // Mobile navigation (hamburger menu)
   29 |           const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]');
   30 |           if (await mobileMenu.count() > 0) {
   31 |             await expect(mobileMenu.first()).toBeVisible();
   32 |           }
   33 |         }
   34 |
   35 |         // Check no horizontal overflow
   36 |         const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
   37 |         expect(bodyWidth).toBeLessThanOrEqual(width + 20); // Allow small tolerance
   38 |       });
   39 |     });
   40 |   });
   41 |
   42 |   test.describe('AI Doctor Page Responsiveness', () => {
   43 |     viewports.forEach(({ name, width, height }) => {
   44 |       test(`should render correctly on ${name} (${width}x${height})`, async ({ page }) => {
   45 |         await page.setViewportSize({ width, height });
   46 |         await page.goto('/doctor');
   47 |         await page.waitForLoadState('networkidle');
   48 |
   49 |         // Check chat interface is visible - Use correct selectors
>  50 |         await expect(page.locator('textarea[placeholder*="Cuéntame qué te duele"]')).toBeVisible();
      |                                                                                      ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   51 |         await expect(page.locator('button[aria-label="Enviar mensaje"]')).toBeVisible();
   52 |
   53 |         // Check chat header
   54 |         await expect(page.locator('h1, h2').first()).toBeVisible();
   55 |
   56 |         // Check messages area is properly sized
   57 |         const messagesArea = page.locator('.chat-messages-container').first();
   58 |         if (await messagesArea.count() > 0) {
   59 |           await expect(messagesArea).toBeVisible();
   60 |         }
   61 |
   62 |         // Test chat interaction - Use correct selectors
   63 |         const input = page.locator('textarea[placeholder*="Cuéntame qué te duele"]');
   64 |         await input.fill('Test responsive message');
   65 |         await page.locator('button[aria-label="Enviar mensaje"]').click();
   66 |
   67 |         // Verify message appears and is properly formatted
   68 |         await expect(page.locator('text=Test responsive message')).toBeVisible();
   69 |
   70 |         // Check no horizontal overflow
   71 |         const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
   72 |         expect(bodyWidth).toBeLessThanOrEqual(width + 20);
   73 |       });
   74 |     });
   75 |   });
   76 |
   77 |   test.describe('Navigation and Layout', () => {
   78 |     test('should have working navigation on all screen sizes', async ({ page }) => {
   79 |       for (const { name, width, height } of viewports) {
   80 |         await page.setViewportSize({ width, height });
   81 |         await page.goto('/');
   82 |         await page.waitForLoadState('networkidle');
   83 |
   84 |         // Test navigation to doctor page
   85 |         const doctorLink = page.locator('a[href*="/doctor"], text="Doctor"').first();
   86 |         if (await doctorLink.count() > 0 && await doctorLink.isVisible()) {
   87 |           await doctorLink.click();
   88 |           await expect(page).toHaveURL(/.*doctor/);
   89 |           await expect(page.locator('h1')).toContainText('Doctor');
   90 |         }
   91 |
   92 |         // Go back to home
   93 |         await page.goto('/');
   94 |       }
   95 |     });
   96 |   });
   97 |
   98 |   test.describe('Touch and Mobile Interactions', () => {
   99 |     test('should handle touch interactions on mobile', async ({ page }) => {
  100 |       await page.setViewportSize({ width: 375, height: 667 });
  101 |       await page.goto('/doctor');
  102 |       await page.waitForLoadState('networkidle');
  103 |
  104 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele"]');
  105 |
  106 |       // Test touch input
  107 |       await input.tap();
  108 |       await expect(input).toBeFocused();
  109 |
  110 |       await input.fill('Touch test message');
  111 |
  112 |       const sendButton = page.locator('button[aria-label="Enviar mensaje"]');
  113 |       await sendButton.tap();
  114 |
  115 |       await expect(page.locator('text=Touch test message')).toBeVisible();
  116 |     });
  117 |
  118 |     test('should handle keyboard navigation', async ({ page }) => {
  119 |       await page.goto('/doctor');
  120 |       await page.waitForLoadState('networkidle');
  121 |
  122 |       // Tab through interactive elements
  123 |       await page.keyboard.press('Tab');
  124 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele"]');
  125 |       await expect(input).toBeFocused();
  126 |
  127 |       // Type message
  128 |       await page.keyboard.type('Keyboard navigation test');
  129 |
  130 |       // Submit with Enter
  131 |       await page.keyboard.press('Enter');
  132 |
  133 |       await expect(page.locator('text=Keyboard navigation test')).toBeVisible();
  134 |     });
  135 |   });
  136 |
  137 |   test.describe('Performance on Different Screen Sizes', () => {
  138 |     test('should load quickly on all viewports', async ({ page }) => {
  139 |       for (const { name, width, height } of viewports.slice(0, 3)) { // Test a few key sizes
  140 |         await page.setViewportSize({ width, height });
  141 |
  142 |         const startTime = Date.now();
  143 |         await page.goto('/doctor');
  144 |         await page.waitForLoadState('networkidle');
  145 |         const loadTime = Date.now() - startTime;
  146 |
  147 |         // Should load within reasonable time (adjust as needed)
  148 |         expect(loadTime).toBeLessThan(5000);
  149 |
  150 |         // Check that critical elements are visible
```