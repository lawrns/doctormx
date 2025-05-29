# Test info

- Name: Critical User Flows >> Error Handling >> should handle JavaScript errors gracefully
- Location: /Users/excite/Documents/GitHub/doctormx/e2e/user-flows.spec.ts:130:9

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="síntomas"]')

    at /Users/excite/Documents/GitHub/doctormx/e2e/user-flows.spec.ts:142:19
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
   63 |       await page.locator('button[type="submit"]').click();
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
> 142 |       await input.fill('Test JS error handling');
      |                   ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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
  199 |       expect(buttonLabel || buttonText).toBeTruthy();
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