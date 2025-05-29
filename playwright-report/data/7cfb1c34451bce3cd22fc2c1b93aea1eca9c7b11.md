# Test info

- Name: Critical User Flows >> Accessibility >> should have proper ARIA labels
- Location: /Users/excite/Documents/GitHub/doctormx/e2e/user-flows.spec.ts:181:9

# Error details

```
Error: expect(received).toBeTruthy()

Received: ""
    at /Users/excite/Documents/GitHub/doctormx/e2e/user-flows.spec.ts:199:41
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
  164 |       // Should be able to reach the input field
  165 |       const input = page.locator('input[placeholder*="síntomas"]');
  166 |       await expect(input).toBeFocused();
  167 |       
  168 |       // Should be able to type
  169 |       await page.keyboard.type('Accessibility test');
  170 |       
  171 |       // Should be able to reach submit button
  172 |       await page.keyboard.press('Tab');
  173 |       const submitButton = page.locator('button[type="submit"]');
  174 |       await expect(submitButton).toBeFocused();
  175 |       
  176 |       // Should be able to submit with Enter
  177 |       await page.keyboard.press('Enter');
  178 |       await expect(page.locator('text=Accessibility test')).toBeVisible();
  179 |     });
  180 |
  181 |     test('should have proper ARIA labels', async ({ page }) => {
  182 |       await page.goto('/doctor');
  183 |       await page.waitForLoadState('networkidle');
  184 |       
  185 |       // Check for essential ARIA labels
  186 |       const input = page.locator('input[placeholder*="síntomas"]');
  187 |       const inputRole = await input.getAttribute('role');
  188 |       const inputLabel = await input.getAttribute('aria-label');
  189 |       const inputPlaceholder = await input.getAttribute('placeholder');
  190 |       
  191 |       // Should have either aria-label or meaningful placeholder
  192 |       expect(inputLabel || inputPlaceholder).toBeTruthy();
  193 |       
  194 |       const submitButton = page.locator('button[type="submit"]');
  195 |       const buttonLabel = await submitButton.getAttribute('aria-label');
  196 |       const buttonText = await submitButton.textContent();
  197 |       
  198 |       // Button should have label or text content
> 199 |       expect(buttonLabel || buttonText).toBeTruthy();
      |                                         ^ Error: expect(received).toBeTruthy()
  200 |     });
  201 |   });
  202 |
  203 |   test.describe('Performance', () => {
  204 |     test('should load critical resources quickly', async ({ page }) => {
  205 |       const startTime = Date.now();
  206 |       
  207 |       await page.goto('/doctor');
  208 |       await page.waitForLoadState('domcontentloaded');
  209 |       
  210 |       const domLoadTime = Date.now() - startTime;
  211 |       expect(domLoadTime).toBeLessThan(3000); // 3 seconds for DOM
  212 |       
  213 |       await page.waitForLoadState('networkidle');
  214 |       const fullLoadTime = Date.now() - startTime;
  215 |       expect(fullLoadTime).toBeLessThan(5000); // 5 seconds for full load
  216 |     });
  217 |
  218 |     test('should handle rapid interactions', async ({ page }) => {
  219 |       await page.goto('/doctor');
  220 |       await page.waitForLoadState('networkidle');
  221 |       
  222 |       const input = page.locator('input[placeholder*="síntomas"]');
  223 |       const sendButton = page.locator('button[type="submit"]');
  224 |       
  225 |       // Send multiple messages rapidly
  226 |       for (let i = 0; i < 3; i++) {
  227 |         await input.fill(`Rapid message ${i + 1}`);
  228 |         await sendButton.click();
  229 |         
  230 |         // Small delay to prevent overwhelming
  231 |         await page.waitForTimeout(100);
  232 |       }
  233 |       
  234 |       // Should handle all messages appropriately
  235 |       await expect(page.locator('text=Rapid message 1')).toBeVisible();
  236 |       
  237 |       // Should not crash or become unresponsive
  238 |       await expect(input).toBeEnabled();
  239 |     });
  240 |   });
  241 | });
```