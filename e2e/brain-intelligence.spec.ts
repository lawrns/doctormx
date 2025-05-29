import { test, expect } from '@playwright/test';

/**
 * BRAIN INTELLIGENCE TESTING
 *
 * Tests for the enhanced AI doctor brain intelligence upgrades:
 * - Emergency detection with 99%+ accuracy
 * - Mexican endemic diseases (Dengue, Chikungunya, Zika, Chagas)
 * - Enhanced confidence algorithms
 * - Cultural medical terminology
 * - Safety-first emergency protocols
 */

test.describe('Brain Intelligence Upgrades', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/doctor');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Emergency Detection (CRITICAL)', () => {
    test('should immediately escalate chest pain to 911', async ({ page }) => {
      // Type chest pain symptom
      const input = page.locator('textarea.chat-textarea');
      await input.fill('Tengo dolor de pecho muy fuerte');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Check for emergency response
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify emergency escalation
      await expect(lastMessage).toContainText('🚨');
      await expect(lastMessage).toContainText('911');
      await expect(lastMessage).toContainText('EMERGENCIA');
    });

    test('should detect stroke FAST signs', async ({ page }) => {
      // Type stroke symptom
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await input.fill('No puedo sonreír y tengo la cara desviada');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Check for emergency response
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify stroke emergency detection
      await expect(lastMessage).toContainText('🚨');
      await expect(lastMessage).toContainText('911');
    });

    test('should detect anaphylaxis symptoms', async ({ page }) => {
      // Type anaphylaxis symptom
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await input.fill('Tengo la lengua hinchada y comezón en la garganta');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Check for emergency response
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify anaphylaxis emergency detection
      await expect(lastMessage).toContainText('🚨');
      await expect(lastMessage).toContainText('911');
    });
  });

  test.describe('Mexican Endemic Diseases (HIGH PRIORITY)', () => {
    test('should recognize dengue fever pattern', async ({ page }) => {
      // Type dengue symptoms
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await input.fill('Tengo fiebre alta, dolor de cabeza intenso y dolor detrás de los ojos');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Check for dengue recognition
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify dengue detection and proper guidance
      await expect(lastMessage).toContainText('DENGUE');
      await expect(lastMessage).toContainText('NO tome aspirina');
      await expect(lastMessage).toContainText('picaduras de mosquito');
    });

    test('should recognize chikungunya pattern', async ({ page }) => {
      // Type chikungunya symptoms
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await input.fill('Tengo fiebre súbita y dolor articular muy severo');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Check for chikungunya recognition
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify chikungunya detection
      await expect(lastMessage).toContainText('CHIKUNGUNYA');
      await expect(lastMessage).toContainText('dolor articular');
    });
  });

  test.describe('Enhanced Confidence Algorithm', () => {
    test('should build confidence through progressive questioning', async ({ page }) => {
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');

      // First question - low confidence
      await input.fill('Tengo dolor de cabeza');
      await page.locator('button[aria-label="Enviar mensaje"]').click();
      await page.waitForTimeout(2000);

      // Check for follow-up question
      const messages = page.locator('.message-content');
      await expect(messages.last()).toContainText('banda apretada');

      // Answer with specific information - should increase confidence
      await input.fill('Es pulsátil como latidos');
      await page.locator('button[aria-label="Enviar mensaje"]').click();
      await page.waitForTimeout(2000);

      // Should ask more specific questions
      await expect(messages.last()).toContainText('náuseas');
    });

    test('should handle contradictory responses', async ({ page }) => {
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');

      // First response - severe pain
      await input.fill('Tengo dolor intenso nivel 9');
      await page.locator('button[aria-label="Enviar mensaje"]').click();
      await page.waitForTimeout(2000);

      // Contradictory response - mild pain
      await input.fill('En realidad es dolor leve');
      await page.locator('button[aria-label="Enviar mensaje"]').click();
      await page.waitForTimeout(2000);

      // Should ask for clarification
      const messages = page.locator('.message-content');
      await expect(messages.last()).toContainText('clarificar');
    });
  });

  test.describe('Mexican Medical Terminology', () => {
    test('should understand Mexican colloquialisms', async ({ page }) => {
      // Use Mexican medical terms
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await input.fill('Tengo destemplanza y me duele la pancita');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Should understand and respond appropriately
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify understanding of Mexican terms
      await expect(lastMessage).toContainText('fiebre');
      await expect(lastMessage).toContainText('abdomen');
    });

    test('should adapt for family consultation', async ({ page }) => {
      // Select family member first
      const familyButton = page.locator('text=Para mi familia');
      if (await familyButton.count() > 0) {
        await familyButton.click();
        await page.waitForTimeout(1000);

        // Select specific family member
        const childButton = page.locator('text=Para mi hijo/a');
        if (await childButton.count() > 0) {
          await childButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // Type symptom for child
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await input.fill('Mi hijo tiene fiebre');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Should adapt language for family consultation
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify family-adapted response
      await expect(lastMessage).toContainText('niño');
    });
  });

  test.describe('Safety Protocols', () => {
    test('should bypass question minimum for emergencies', async ({ page }) => {
      // Type emergency symptom
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await input.fill('No puedo respirar');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Should immediately escalate without asking 5+ questions
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify immediate emergency response
      await expect(lastMessage).toContainText('🚨');
      await expect(lastMessage).toContainText('911');
      await expect(lastMessage).toContainText('INMEDIATAMENTE');
    });

    test('should provide Mexican emergency numbers', async ({ page }) => {
      // Type emergency symptom
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      await input.fill('Dolor de pecho insoportable');

      // Send message
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for AI response
      await page.waitForTimeout(3000);

      // Should provide Mexican emergency numbers
      const messages = page.locator('.message-content');
      const lastMessage = messages.last();

      // Verify Mexican emergency context
      await expect(lastMessage).toContainText('911');
      await expect(lastMessage).toContainText('Cruz Roja');
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should respond within reasonable time', async ({ page }) => {
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');

      const startTime = Date.now();

      await input.fill('Tengo dolor de estómago');
      await page.locator('button[aria-label="Enviar mensaje"]').click();

      // Wait for response
      await page.waitForSelector('.message-content:last-child', { timeout: 10000 });

      const responseTime = Date.now() - startTime;

      // Should respond within 10 seconds
      expect(responseTime).toBeLessThan(10000);
    });

    test('should handle multiple rapid messages', async ({ page }) => {
      const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
      const sendButton = page.locator('button[aria-label="Enviar mensaje"]');

      // Send multiple messages rapidly
      await input.fill('Mensaje 1');
      await sendButton.click();

      await input.fill('Mensaje 2');
      await sendButton.click();

      await input.fill('Mensaje 3');
      await sendButton.click();

      // Wait for all responses
      await page.waitForTimeout(5000);

      // Should handle all messages without errors
      const messages = page.locator('.message-content');
      const messageCount = await messages.count();

      // Should have at least user messages + AI responses
      expect(messageCount).toBeGreaterThan(3);
    });
  });
});
