# Test info

- Name: Critical User Flows >> Anonymous User Journey >> should handle consultation limit reached
- Location: /Users/excite/Documents/GitHub/doctormx/e2e/user-flows.spec.ts:47:9

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')
    - locator resolved to <button type="submit" class="px-4 py-2 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <main class="flex-1 overflow-auto bg-white">…</main> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <main class="flex-1 overflow-auto bg-white">…</main> intercepts pointer events
    - retrying click action
      - waiting 100ms
    55 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <main class="flex-1 overflow-auto bg-white">…</main> intercepts pointer events
     - retrying click action
       - waiting 500ms

    at /Users/excite/Documents/GitHub/doctormx/e2e/user-flows.spec.ts:63:51
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
      - text: Consulta Virtual
    - link "Análisis de Imágenes":
      - /url: /image-analysis
      - img
      - text: Análisis de Imágenes
    - link "Exámenes a Domicilio":
      - /url: /lab-testing
      - img
      - text: Exámenes a Domicilio
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
  - textbox "Describe tus síntomas...": Test message
  - button:
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
   3 | test.describe('Critical User Flows', () => {
   4 |   test.describe('Anonymous User Journey', () => {
   5 |     test('should complete anonymous consultation flow', async ({ page }) => {
   6 |       // Start at homepage
   7 |       await page.goto('/');
   8 |       await page.waitForLoadState('networkidle');
   9 |       
   10 |       // Navigate to AI Doctor
   11 |       const doctorButton = page.locator('a[href*="/doctor"], text="Doctor"').first();
   12 |       if (await doctorButton.count() > 0) {
   13 |         await doctorButton.click();
   14 |       } else {
   15 |         await page.goto('/doctor');
   16 |       }
   17 |       
   18 |       await page.waitForLoadState('networkidle');
   19 |       
   20 |       // Verify consultation limit is shown
   21 |       await expect(page.locator('text=Consultas gratuitas')).toBeVisible();
   22 |       
   23 |       // Send a medical query
   24 |       const input = page.locator('input[placeholder*="síntomas"]');
   25 |       await input.fill('Tengo dolor de cabeza desde hace 2 días');
   26 |       await page.locator('button[type="submit"]').click();
   27 |       
   28 |       // Verify user message appears
   29 |       await expect(page.locator('text=Tengo dolor de cabeza desde hace 2 días')).toBeVisible();
   30 |       
   31 |       // Verify AI response appears
   32 |       await expect(page.locator('.bg-gray-100')).toBeVisible({ timeout: 5000 });
   33 |       
   34 |       // Continue conversation
   35 |       await input.fill('Es un dolor punzante');
   36 |       await page.locator('button[type="submit"]').click();
   37 |       
   38 |       await expect(page.locator('text=Es un dolor punzante')).toBeVisible();
   39 |       
   40 |       // Check that conversion prompt might appear
   41 |       const conversionPrompt = page.locator('text=Crear cuenta');
   42 |       if (await conversionPrompt.count() > 0) {
   43 |         await expect(conversionPrompt).toBeVisible();
   44 |       }
   45 |     });
   46 |
   47 |     test('should handle consultation limit reached', async ({ page }) => {
   48 |       await page.goto('/doctor');
   49 |       await page.waitForLoadState('networkidle');
   50 |       
   51 |       // Simulate multiple consultations by directly manipulating localStorage
   52 |       await page.evaluate(() => {
   53 |         const limit = { total: 3, used: 3, remaining: 0 };
   54 |         localStorage.setItem('anonymous_consultation_limit', JSON.stringify(limit));
   55 |       });
   56 |       
   57 |       await page.reload();
   58 |       await page.waitForLoadState('networkidle');
   59 |       
   60 |       // Try to send a message
   61 |       const input = page.locator('input[placeholder*="síntomas"]');
   62 |       await input.fill('Test message');
>  63 |       await page.locator('button[type="submit"]').click();
      |                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
   64 |       
   65 |       // Should show conversion prompt
   66 |       await expect(page.locator('text=Crear cuenta')).toBeVisible({ timeout: 3000 });
   67 |     });
   68 |   });
   69 |
   70 |   test.describe('Navigation Flow', () => {
   71 |     test('should navigate between main pages', async ({ page }) => {
   72 |       await page.goto('/');
   73 |       await page.waitForLoadState('networkidle');
   74 |       
   75 |       // Test navigation to different sections
   76 |       const navLinks = [
   77 |         { text: 'Doctor', url: '/doctor' },
   78 |         { text: 'Conectar', url: '/connect' },
   79 |       ];
   80 |       
   81 |       for (const { text, url } of navLinks) {
   82 |         const link = page.locator(`a[href*="${url}"], text="${text}"`).first();
   83 |         if (await link.count() > 0 && await link.isVisible()) {
   84 |           await link.click();
   85 |           await page.waitForLoadState('networkidle');
   86 |           expect(page.url()).toContain(url);
   87 |         }
   88 |       }
   89 |     });
   90 |
   91 |     test('should handle direct URL access', async ({ page }) => {
   92 |       const routes = ['/doctor', '/connect', '/image-analysis', '/lab-testing'];
   93 |       
   94 |       for (const route of routes) {
   95 |         await page.goto(route);
   96 |         await page.waitForLoadState('networkidle');
   97 |         
   98 |         // Should not show error page
   99 |         await expect(page.locator('text=404')).not.toBeVisible();
  100 |         await expect(page.locator('text=Error')).not.toBeVisible();
  101 |         
  102 |         // Should show some content
  103 |         const body = page.locator('body');
  104 |         const bodyText = await body.textContent();
  105 |         expect(bodyText).toBeTruthy();
  106 |         expect(bodyText!.length).toBeGreaterThan(10);
  107 |       }
  108 |     });
  109 |   });
  110 |
  111 |   test.describe('Error Handling', () => {
  112 |     test('should handle network errors gracefully', async ({ page }) => {
  113 |       await page.goto('/doctor');
  114 |       await page.waitForLoadState('networkidle');
  115 |       
  116 |       // Simulate network failure
  117 |       await page.route('**/*', route => route.abort());
  118 |       
  119 |       const input = page.locator('input[placeholder*="síntomas"]');
  120 |       await input.fill('Test network error');
  121 |       await page.locator('button[type="submit"]').click();
  122 |       
  123 |       // Should show user message even if network fails
  124 |       await expect(page.locator('text=Test network error')).toBeVisible();
  125 |       
  126 |       // Should show some indication of error or continue working offline
  127 |       // The specific behavior depends on your error handling implementation
  128 |     });
  129 |
  130 |     test('should handle JavaScript errors gracefully', async ({ page }) => {
  131 |       let jsErrors: string[] = [];
  132 |       
  133 |       page.on('pageerror', (error) => {
  134 |         jsErrors.push(error.message);
  135 |       });
  136 |       
  137 |       await page.goto('/doctor');
  138 |       await page.waitForLoadState('networkidle');
  139 |       
  140 |       // Interact with the page
  141 |       const input = page.locator('input[placeholder*="síntomas"]');
  142 |       await input.fill('Test JS error handling');
  143 |       await page.locator('button[type="submit"]').click();
  144 |       
  145 |       // Should not have critical JavaScript errors
  146 |       const criticalErrors = jsErrors.filter(error => 
  147 |         error.includes('Cannot read property') || 
  148 |         error.includes('is not a function') ||
  149 |         error.includes('undefined')
  150 |       );
  151 |       
  152 |       expect(criticalErrors.length).toBe(0);
  153 |     });
  154 |   });
  155 |
  156 |   test.describe('Accessibility', () => {
  157 |     test('should be keyboard navigable', async ({ page }) => {
  158 |       await page.goto('/doctor');
  159 |       await page.waitForLoadState('networkidle');
  160 |       
  161 |       // Start navigation from the top
  162 |       await page.keyboard.press('Tab');
  163 |       
```