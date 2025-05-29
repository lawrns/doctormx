# Test info

- Name: Brain Intelligence Upgrades >> Performance and Reliability >> should handle multiple rapid messages
- Location: /Users/excite/Documents/GitHub/doctormx/e2e/brain-intelligence.spec.ts:283:9

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]')

    at /Users/excite/Documents/GitHub/doctormx/e2e/brain-intelligence.spec.ts:288:19
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
  188 |     test('should adapt for family consultation', async ({ page }) => {
  189 |       // Select family member first
  190 |       const familyButton = page.locator('text=Para mi familia');
  191 |       if (await familyButton.count() > 0) {
  192 |         await familyButton.click();
  193 |         await page.waitForTimeout(1000);
  194 |         
  195 |         // Select specific family member
  196 |         const childButton = page.locator('text=Para mi hijo/a');
  197 |         if (await childButton.count() > 0) {
  198 |           await childButton.click();
  199 |           await page.waitForTimeout(1000);
  200 |         }
  201 |       }
  202 |       
  203 |       // Type symptom for child
  204 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  205 |       await input.fill('Mi hijo tiene fiebre');
  206 |       
  207 |       // Send message
  208 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  209 |       
  210 |       // Wait for AI response
  211 |       await page.waitForTimeout(3000);
  212 |       
  213 |       // Should adapt language for family consultation
  214 |       const messages = page.locator('.message-content');
  215 |       const lastMessage = messages.last();
  216 |       
  217 |       // Verify family-adapted response
  218 |       await expect(lastMessage).toContainText('niño');
  219 |     });
  220 |   });
  221 |
  222 |   test.describe('Safety Protocols', () => {
  223 |     test('should bypass question minimum for emergencies', async ({ page }) => {
  224 |       // Type emergency symptom
  225 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  226 |       await input.fill('No puedo respirar');
  227 |       
  228 |       // Send message
  229 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  230 |       
  231 |       // Wait for AI response
  232 |       await page.waitForTimeout(3000);
  233 |       
  234 |       // Should immediately escalate without asking 5+ questions
  235 |       const messages = page.locator('.message-content');
  236 |       const lastMessage = messages.last();
  237 |       
  238 |       // Verify immediate emergency response
  239 |       await expect(lastMessage).toContainText('🚨');
  240 |       await expect(lastMessage).toContainText('911');
  241 |       await expect(lastMessage).toContainText('INMEDIATAMENTE');
  242 |     });
  243 |
  244 |     test('should provide Mexican emergency numbers', async ({ page }) => {
  245 |       // Type emergency symptom
  246 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  247 |       await input.fill('Dolor de pecho insoportable');
  248 |       
  249 |       // Send message
  250 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  251 |       
  252 |       // Wait for AI response
  253 |       await page.waitForTimeout(3000);
  254 |       
  255 |       // Should provide Mexican emergency numbers
  256 |       const messages = page.locator('.message-content');
  257 |       const lastMessage = messages.last();
  258 |       
  259 |       // Verify Mexican emergency context
  260 |       await expect(lastMessage).toContainText('911');
  261 |       await expect(lastMessage).toContainText('Cruz Roja');
  262 |     });
  263 |   });
  264 |
  265 |   test.describe('Performance and Reliability', () => {
  266 |     test('should respond within reasonable time', async ({ page }) => {
  267 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  268 |       
  269 |       const startTime = Date.now();
  270 |       
  271 |       await input.fill('Tengo dolor de estómago');
  272 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  273 |       
  274 |       // Wait for response
  275 |       await page.waitForSelector('.message-content:last-child', { timeout: 10000 });
  276 |       
  277 |       const responseTime = Date.now() - startTime;
  278 |       
  279 |       // Should respond within 10 seconds
  280 |       expect(responseTime).toBeLessThan(10000);
  281 |     });
  282 |
  283 |     test('should handle multiple rapid messages', async ({ page }) => {
  284 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  285 |       const sendButton = page.locator('button[aria-label="Enviar mensaje"]');
  286 |       
  287 |       // Send multiple messages rapidly
> 288 |       await input.fill('Mensaje 1');
      |                   ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  289 |       await sendButton.click();
  290 |       
  291 |       await input.fill('Mensaje 2');
  292 |       await sendButton.click();
  293 |       
  294 |       await input.fill('Mensaje 3');
  295 |       await sendButton.click();
  296 |       
  297 |       // Wait for all responses
  298 |       await page.waitForTimeout(5000);
  299 |       
  300 |       // Should handle all messages without errors
  301 |       const messages = page.locator('.message-content');
  302 |       const messageCount = await messages.count();
  303 |       
  304 |       // Should have at least user messages + AI responses
  305 |       expect(messageCount).toBeGreaterThan(3);
  306 |     });
  307 |   });
  308 | });
  309 |
```