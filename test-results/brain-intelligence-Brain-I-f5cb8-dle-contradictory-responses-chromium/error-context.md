# Test info

- Name: Brain Intelligence Upgrades >> Enhanced Confidence Algorithm >> should handle contradictory responses
- Location: /Users/excite/Documents/GitHub/doctormx/e2e/brain-intelligence.spec.ts:148:9

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]')

    at /Users/excite/Documents/GitHub/doctormx/e2e/brain-intelligence.spec.ts:152:19
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
   52 |       
   53 |       // Check for emergency response
   54 |       const messages = page.locator('.message-content');
   55 |       const lastMessage = messages.last();
   56 |       
   57 |       // Verify stroke emergency detection
   58 |       await expect(lastMessage).toContainText('🚨');
   59 |       await expect(lastMessage).toContainText('911');
   60 |     });
   61 |
   62 |     test('should detect anaphylaxis symptoms', async ({ page }) => {
   63 |       // Type anaphylaxis symptom
   64 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
   65 |       await input.fill('Tengo la lengua hinchada y comezón en la garganta');
   66 |       
   67 |       // Send message
   68 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
   69 |       
   70 |       // Wait for AI response
   71 |       await page.waitForTimeout(3000);
   72 |       
   73 |       // Check for emergency response
   74 |       const messages = page.locator('.message-content');
   75 |       const lastMessage = messages.last();
   76 |       
   77 |       // Verify anaphylaxis emergency detection
   78 |       await expect(lastMessage).toContainText('🚨');
   79 |       await expect(lastMessage).toContainText('911');
   80 |     });
   81 |   });
   82 |
   83 |   test.describe('Mexican Endemic Diseases (HIGH PRIORITY)', () => {
   84 |     test('should recognize dengue fever pattern', async ({ page }) => {
   85 |       // Type dengue symptoms
   86 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
   87 |       await input.fill('Tengo fiebre alta, dolor de cabeza intenso y dolor detrás de los ojos');
   88 |       
   89 |       // Send message
   90 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
   91 |       
   92 |       // Wait for AI response
   93 |       await page.waitForTimeout(3000);
   94 |       
   95 |       // Check for dengue recognition
   96 |       const messages = page.locator('.message-content');
   97 |       const lastMessage = messages.last();
   98 |       
   99 |       // Verify dengue detection and proper guidance
  100 |       await expect(lastMessage).toContainText('DENGUE');
  101 |       await expect(lastMessage).toContainText('NO tome aspirina');
  102 |       await expect(lastMessage).toContainText('picaduras de mosquito');
  103 |     });
  104 |
  105 |     test('should recognize chikungunya pattern', async ({ page }) => {
  106 |       // Type chikungunya symptoms
  107 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  108 |       await input.fill('Tengo fiebre súbita y dolor articular muy severo');
  109 |       
  110 |       // Send message
  111 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  112 |       
  113 |       // Wait for AI response
  114 |       await page.waitForTimeout(3000);
  115 |       
  116 |       // Check for chikungunya recognition
  117 |       const messages = page.locator('.message-content');
  118 |       const lastMessage = messages.last();
  119 |       
  120 |       // Verify chikungunya detection
  121 |       await expect(lastMessage).toContainText('CHIKUNGUNYA');
  122 |       await expect(lastMessage).toContainText('dolor articular');
  123 |     });
  124 |   });
  125 |
  126 |   test.describe('Enhanced Confidence Algorithm', () => {
  127 |     test('should build confidence through progressive questioning', async ({ page }) => {
  128 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  129 |       
  130 |       // First question - low confidence
  131 |       await input.fill('Tengo dolor de cabeza');
  132 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  133 |       await page.waitForTimeout(2000);
  134 |       
  135 |       // Check for follow-up question
  136 |       const messages = page.locator('.message-content');
  137 |       await expect(messages.last()).toContainText('banda apretada');
  138 |       
  139 |       // Answer with specific information - should increase confidence
  140 |       await input.fill('Es pulsátil como latidos');
  141 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  142 |       await page.waitForTimeout(2000);
  143 |       
  144 |       // Should ask more specific questions
  145 |       await expect(messages.last()).toContainText('náuseas');
  146 |     });
  147 |
  148 |     test('should handle contradictory responses', async ({ page }) => {
  149 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  150 |       
  151 |       // First response - severe pain
> 152 |       await input.fill('Tengo dolor intenso nivel 9');
      |                   ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  153 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  154 |       await page.waitForTimeout(2000);
  155 |       
  156 |       // Contradictory response - mild pain
  157 |       await input.fill('En realidad es dolor leve');
  158 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  159 |       await page.waitForTimeout(2000);
  160 |       
  161 |       // Should ask for clarification
  162 |       const messages = page.locator('.message-content');
  163 |       await expect(messages.last()).toContainText('clarificar');
  164 |     });
  165 |   });
  166 |
  167 |   test.describe('Mexican Medical Terminology', () => {
  168 |     test('should understand Mexican colloquialisms', async ({ page }) => {
  169 |       // Use Mexican medical terms
  170 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
  171 |       await input.fill('Tengo destemplanza y me duele la pancita');
  172 |       
  173 |       // Send message
  174 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
  175 |       
  176 |       // Wait for AI response
  177 |       await page.waitForTimeout(3000);
  178 |       
  179 |       // Should understand and respond appropriately
  180 |       const messages = page.locator('.message-content');
  181 |       const lastMessage = messages.last();
  182 |       
  183 |       // Verify understanding of Mexican terms
  184 |       await expect(lastMessage).toContainText('fiebre');
  185 |       await expect(lastMessage).toContainText('abdomen');
  186 |     });
  187 |
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
```