# Test info

- Name: Brain Intelligence Upgrades >> Emergency Detection (CRITICAL) >> should detect anaphylaxis symptoms
- Location: /Users/excite/Documents/GitHub/doctormx/e2e/brain-intelligence.spec.ts:62:9

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]')

    at /Users/excite/Documents/GitHub/doctormx/e2e/brain-intelligence.spec.ts:65:19
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
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | /**
   4 |  * BRAIN INTELLIGENCE TESTING
   5 |  * 
   6 |  * Tests for the enhanced AI doctor brain intelligence upgrades:
   7 |  * - Emergency detection with 99%+ accuracy
   8 |  * - Mexican endemic diseases (Dengue, Chikungunya, Zika, Chagas)
   9 |  * - Enhanced confidence algorithms
   10 |  * - Cultural medical terminology
   11 |  * - Safety-first emergency protocols
   12 |  */
   13 |
   14 | test.describe('Brain Intelligence Upgrades', () => {
   15 |   test.beforeEach(async ({ page }) => {
   16 |     await page.goto('/doctor');
   17 |     await page.waitForLoadState('networkidle');
   18 |   });
   19 |
   20 |   test.describe('Emergency Detection (CRITICAL)', () => {
   21 |     test('should immediately escalate chest pain to 911', async ({ page }) => {
   22 |       // Type chest pain symptom
   23 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
   24 |       await input.fill('Tengo dolor de pecho muy fuerte');
   25 |       
   26 |       // Send message
   27 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
   28 |       
   29 |       // Wait for AI response
   30 |       await page.waitForTimeout(3000);
   31 |       
   32 |       // Check for emergency response
   33 |       const messages = page.locator('.message-content');
   34 |       const lastMessage = messages.last();
   35 |       
   36 |       // Verify emergency escalation
   37 |       await expect(lastMessage).toContainText('🚨');
   38 |       await expect(lastMessage).toContainText('911');
   39 |       await expect(lastMessage).toContainText('EMERGENCIA');
   40 |     });
   41 |
   42 |     test('should detect stroke FAST signs', async ({ page }) => {
   43 |       // Type stroke symptom
   44 |       const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
   45 |       await input.fill('No puedo sonreír y tengo la cara desviada');
   46 |       
   47 |       // Send message
   48 |       await page.locator('button[aria-label="Enviar mensaje"]').click();
   49 |       
   50 |       // Wait for AI response
   51 |       await page.waitForTimeout(3000);
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
>  65 |       await input.fill('Tengo la lengua hinchada y comezón en la garganta');
      |                   ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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
  152 |       await input.fill('Tengo dolor intenso nivel 9');
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
```