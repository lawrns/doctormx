# Test info

- Name: AI Doctor Page >> should handle empty messages gracefully
- Location: /Users/excite/Documents/GitHub/doctormx/e2e/doctor-page.spec.ts:76:7

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')
    - locator resolved to <button disabled type="submit" class="px-4 py-2 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    20 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

    at /Users/excite/Documents/GitHub/doctormx/e2e/doctor-page.spec.ts:83:22
```

# Page snapshot

```yaml
- img
- heading "Algo salió mal" [level=2]
- paragraph: Ha ocurrido un error en esta sección. Puedes intentar reiniciar el componente o volver a la página anterior.
- text: "ReferenceError: AnalysisPage is not defined"
- button "Reintentar"
- button "Volver"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('AI Doctor Page', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/doctor');
   6 |   });
   7 |
   8 |   test('should load without white screen on desktop', async ({ page }) => {
   9 |     // Wait for the page to load
   10 |     await page.waitForLoadState('networkidle');
   11 |     
   12 |     // Check that the main content is visible
   13 |     await expect(page.locator('h1')).toContainText('Doctor IA');
   14 |     await expect(page.locator('text=Dr. Simeon')).toBeVisible();
   15 |     
   16 |     // Verify the page is not white/empty
   17 |     const body = page.locator('body');
   18 |     await expect(body).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
   19 |     
   20 |     // Check that chat interface is present
   21 |     await expect(page.locator('input[placeholder*="síntomas"]')).toBeVisible();
   22 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
   23 |   });
   24 |
   25 |   test('should handle chat interaction', async ({ page }) => {
   26 |     await page.waitForLoadState('networkidle');
   27 |     
   28 |     // Type a message
   29 |     const input = page.locator('input[placeholder*="síntomas"]');
   30 |     await input.fill('Tengo dolor de cabeza');
   31 |     
   32 |     // Send message
   33 |     await page.locator('button[type="submit"]').click();
   34 |     
   35 |     // Verify user message appears
   36 |     await expect(page.locator('text=Tengo dolor de cabeza')).toBeVisible();
   37 |     
   38 |     // Wait for AI response
   39 |     await expect(page.locator('.bg-gray-100')).toBeVisible({ timeout: 5000 });
   40 |   });
   41 |
   42 |   test('should show consultation limit for anonymous users', async ({ page }) => {
   43 |     await page.waitForLoadState('networkidle');
   44 |     
   45 |     // Check consultation limit indicator
   46 |     await expect(page.locator('text=Consultas gratuitas')).toBeVisible();
   47 |     await expect(page.locator('text=Crear cuenta para más consultas')).toBeVisible();
   48 |   });
   49 |
   50 |   test('mobile: should load mobile version correctly', async ({ page, isMobile }) => {
   51 |     test.skip(!isMobile, 'This test is only for mobile');
   52 |     
   53 |     await page.waitForLoadState('networkidle');
   54 |     
   55 |     // Should use mobile component
   56 |     await expect(page.locator('[data-testid="mobile-ai-doctor"]', { timeout: 10000 })).toBeVisible();
   57 |   });
   58 |
   59 |   test('mobile: should be responsive', async ({ page }) => {
   60 |     await page.setViewportSize({ width: 375, height: 667 });
   61 |     await page.waitForLoadState('networkidle');
   62 |     
   63 |     // Check mobile responsiveness
   64 |     const chatContainer = page.locator('.flex.flex-col');
   65 |     await expect(chatContainer).toBeVisible();
   66 |     
   67 |     // Input should be responsive
   68 |     const input = page.locator('input[placeholder*="síntomas"]');
   69 |     await expect(input).toBeVisible();
   70 |     
   71 |     // Send button should be visible
   72 |     const sendButton = page.locator('button[type="submit"]');
   73 |     await expect(sendButton).toBeVisible();
   74 |   });
   75 |
   76 |   test('should handle empty messages gracefully', async ({ page }) => {
   77 |     await page.waitForLoadState('networkidle');
   78 |     
   79 |     const input = page.locator('input[placeholder*="síntomas"]');
   80 |     const sendButton = page.locator('button[type="submit"]');
   81 |     
   82 |     // Try to send empty message
>  83 |     await sendButton.click();
      |                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
   84 |     
   85 |     // Should not add any message
   86 |     const messageCount = await page.locator('.max-w-md').count();
   87 |     expect(messageCount).toBe(0); // Only initial bot message should be there
   88 |   });
   89 |
   90 |   test('should prevent multiple rapid submissions', async ({ page }) => {
   91 |     await page.waitForLoadState('networkidle');
   92 |     
   93 |     const input = page.locator('input[placeholder*="síntomas"]');
   94 |     const sendButton = page.locator('button[type="submit"]');
   95 |     
   96 |     await input.fill('Test message');
   97 |     
   98 |     // Click send button rapidly
   99 |     await sendButton.click();
  100 |     await sendButton.click();
  101 |     await sendButton.click();
  102 |     
  103 |     // Should only send one message
  104 |     const userMessages = await page.locator('.bg-\\[\\#006D77\\]').count();
  105 |     expect(userMessages).toBe(1);
  106 |   });
  107 | });
```