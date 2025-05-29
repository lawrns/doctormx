import { test, expect } from '@playwright/test';

test.describe('AI Doctor Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/doctor');
  });

  test('should load without white screen on desktop', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the main content is visible
    await expect(page.locator('h1')).toContainText('Doctor IA');
    await expect(page.locator('text=Dr. Simeon')).toBeVisible();

    // Verify the page is not white/empty
    const body = page.locator('body');
    await expect(body).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');

    // Check that chat interface is present
    await expect(page.locator('input[placeholder*="síntomas"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should handle chat interaction', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Type a message - Use actual textarea selector
    const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
    await input.fill('Tengo dolor de cabeza');

    // Send message - Use correct button selector
    await page.locator('button[aria-label="Enviar mensaje"]').click();

    // Verify user message appears
    await expect(page.locator('text=Tengo dolor de cabeza')).toBeVisible();

    // Wait for AI response
    await expect(page.locator('.bg-gray-100')).toBeVisible({ timeout: 5000 });
  });

  test('should show consultation limit for anonymous users', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check consultation limit indicator
    await expect(page.locator('text=Consultas gratuitas')).toBeVisible();
    await expect(page.locator('text=Crear cuenta para más consultas')).toBeVisible();
  });

  test('mobile: should load mobile version correctly', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile');

    await page.waitForLoadState('networkidle');

    // Should use mobile component
    await expect(page.locator('[data-testid="mobile-ai-doctor"]', { timeout: 10000 })).toBeVisible();
  });

  test('mobile: should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // Check mobile responsiveness - Use actual chat container
    const chatContainer = page.locator('.chat-textarea').first();
    await expect(chatContainer).toBeVisible();

    // Input should be responsive - Use actual textarea selector
    const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
    await expect(input).toBeVisible();

    // Send button should be visible - Use correct button selector
    const sendButton = page.locator('button[aria-label="Enviar mensaje"]');
    await expect(sendButton).toBeVisible();
  });

  test('should handle empty messages gracefully', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
    const sendButton = page.locator('button[aria-label="Enviar mensaje"]');

    // Try to send empty message
    await sendButton.click();

    // Should not add any message
    const messageCount = await page.locator('.max-w-md').count();
    expect(messageCount).toBe(0); // Only initial bot message should be there
  });

  test('should prevent multiple rapid submissions', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const input = page.locator('textarea[placeholder*="Cuéntame qué te duele o preocupa"]');
    const sendButton = page.locator('button[aria-label="Enviar mensaje"]');

    await input.fill('Test message');

    // Click send button rapidly
    await sendButton.click();
    await sendButton.click();
    await sendButton.click();

    // Should only send one message
    const userMessages = await page.locator('.bg-\\[\\#006D77\\]').count();
    expect(userMessages).toBe(1);
  });
});