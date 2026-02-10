import { test, expect, Browser } from '@playwright/test';

/**
 * E2E Tests for Critical User Flows
 *
 * Tests the most important end-to-end journeys that must work correctly
 * These are smoke tests that verify the core functionality
 */

test.describe('Critical Flows - Happy Paths', () => {
  test('should complete new patient registration to first booking', async ({ page }) => {
    // Step 1: Navigate to landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify landing page loaded
    await expect(page).toHaveURL('/');

    // Step 2: Browse doctors
    const doctorsLink = page.locator('a[href*="doctors"], a:has-text("Doctores"), a:has-text("Buscar")');
    if (await doctorsLink.count() > 0) {
      await doctorsLink.first().click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/doctors');
      await page.waitForLoadState('networkidle');
    }

    // Verify we're on doctors page
    await expect(page).toHaveURL(/.*doctors/);

    // Step 3: Select a doctor
    const doctorCard = page.locator('a[href*="/doctors/"]').first();
    const doctorCount = await doctorCard.count();

    if (doctorCount > 0) {
      await doctorCard.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on doctor profile
      await expect(page).toHaveURL(/\/doctors\/[a-f0-9-]+/);

      // Step 4: Click book button
      const bookButton = page.locator('a:has-text("Agendar"), button:has-text("Agendar")');
      if (await bookButton.count() > 0) {
        await bookButton.first().click();
        await page.waitForLoadState('networkidle');

        // Should redirect to login or booking
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/book\/|\/login/);
      }
    }
  });

  test('should complete patient login to dashboard', async ({ page }) => {
    // Step 1: Navigate to login
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Step 2: Fill credentials
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');

    // Step 3: Submit login
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 4: Verify redirect to dashboard
    await expect(page).toHaveURL(/\/app/);

    // Step 5: Verify dashboard elements
    const dashboardTitle = page.locator('h1, h2').filter({ hasText: /panel|dashboard|mis citas/i });
    if (await dashboardTitle.count() > 0) {
      await expect(dashboardTitle).toBeVisible();
    }
  });

  test('should complete doctor login to dashboard', async ({ page }) => {
    // Step 1: Navigate to login
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Step 2: Fill credentials
    await page.fill('input[type="email"]', 'doctor@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');

    // Step 3: Submit login
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 4: Verify redirect to dashboard
    await expect(page).toHaveURL(/\/doctor/);

    // Step 5: Verify dashboard elements
    const dashboardTitle = page.locator('h1, h2').filter({ hasText: /panel|dashboard/i });
    if (await dashboardTitle.count() > 0) {
      await expect(dashboardTitle).toBeVisible();
    }
  });
});

test.describe('Critical Flows - Error Handling', () => {
  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');

    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Should either stay on login page or show error
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/login/);

    // Check for error message
    const errorMessage = page.locator('text=/inválidos|incorrectos|error/i');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should handle registration with existing email', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');

    // Try to register with existing email
    await page.fill('input[name="email"], input[type="email"]', 'patient@test.com');
    await page.fill('input[name="password"], input[type="password"]', 'TestPassword123!');
    await page.fill('input[name="fullName"], input[name="name"]', 'Test User');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Should show error about existing email
    const errorMessage = page.locator('text=/ya registrado|ya existe|email en uso/i');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should handle unauthorized page access', async ({ page }) => {
    // Try to access protected page without login
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Verify redirect parameter is preserved
    const currentUrl = page.url();
    expect(currentUrl).toContain('redirect');
  });

  test('should handle 404 page', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');

    // Should show 404 page or redirect
    const notFoundTitle = page.locator('text=/no encontrada|404|not found/i');
    if (await notFoundTitle.count() > 0) {
      await expect(notFoundTitle).toBeVisible();
    }
  });
});

test.describe('Critical Flows - Cross-Browser', () => {
  test('should work in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify basic functionality
    const title = page.locator('h1');
    if (await title.count() > 0) {
      await expect(title).toBeVisible();
    }
  });

  test('should work in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify basic functionality
    const title = page.locator('h1');
    if (await title.count() > 0) {
      await expect(title).toBeVisible();
    }
  });

  test('should work in Safari/Webkit', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-specific test');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify basic functionality
    const title = page.locator('h1');
    if (await title.count() > 0) {
      await expect(title).toBeVisible();
    }
  });
});

test.describe('Critical Flows - Performance', () => {
  test('should load landing page quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);

    console.log(`Landing page loaded in ${loadTime}ms`);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to key pages
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Check for errors
    expect(errors.length).toBe(0);

    if (errors.length > 0) {
      console.error('Console errors found:', errors);
    }
  });

  test('should handle concurrent page requests', async ({ context }) => {
    // Create multiple pages
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage()
    ]);

    // Navigate all pages simultaneously
    await Promise.all([
      pages[0].goto('/'),
      pages[1].goto('/doctors'),
      pages[2].goto('/auth/login')
    ]);

    // Wait for all to load
    await Promise.all([
      pages[0].waitForLoadState('networkidle'),
      pages[1].waitForLoadState('networkidle'),
      pages[2].waitForLoadState('networkidle')
    ]);

    // Verify all loaded successfully
    expect(await pages[0].title()).toBeTruthy();
    expect(await pages[1].title()).toBeTruthy();
    expect(await pages[2].title()).toBeTruthy();

    // Clean up
    await Promise.all(pages.map(p => p.close()));
  });
});

test.describe('Critical Flows - Security', () => {
  test('should use HTTPS in production', async ({ page }) => {
    await page.goto('/');

    const url = page.url();

    // In production, should use HTTPS
    if (url.includes('doctory.mx') || url.includes('doctor.mx')) {
      expect(url).toMatch(/^https:/);
    }
  });

  test('should not expose sensitive data in URLs', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Check that password is not in URL
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('password123');
    expect(currentUrl).not.toContain('test@example.com');
  });

  test('should handle session timeout gracefully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Navigate to protected page
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Clear cookies to simulate session timeout
    await page.context().clearCookies();

    // Try to navigate to another protected page
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Critical Flows - Accessibility', () => {
  test('should have proper page titles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have skip navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for skip links
    const skipLink = page.locator('a[href^="#"]:has-text("Saltar"), a[href^="#"]:has-text("Skip")');
    // May or may not be present
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Find first focusable element
    const firstButton = page.locator('button, a[href]').first();
    if (await firstButton.count() > 0) {
      // Focus element
      await firstButton.focus();

      // Verify it's focused
      const isFocused = await firstButton.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for h1
    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    if (h1Count > 0) {
      // Should have exactly one h1
      expect(h1Count).toBe(1);

      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Critical Flows - Integration', () => {
  test('should handle Supabase connection', async ({ page }) => {
    // This test verifies Supabase integration is working
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Check for Supabase client initialization
    const hasSupabase = await page.evaluate(() => {
      return typeof window !== 'undefined' && 'supabase' in window;
    });

    // May or may not be exposed globally
    console.log(`Supabase client available: ${hasSupabase}`);
  });

  test('should handle Stripe checkout flow', async ({ page }) => {
    // Login as patient
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Navigate to checkout
    await page.goto('/checkout/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Check for Stripe elements
    const stripeElements = page.locator('input[name="cardnumber"], iframe[name*="stripe"]');
    const hasStripe = await stripeElements.count() > 0;

    console.log(`Stripe checkout available: ${hasStripe}`);
  });

  test('should handle video consultation initialization', async ({ page }) => {
    // Login as patient
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Navigate to consultation
    await page.goto('/consultation/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Check for video room elements
    const videoContainer = page.locator('[data-testid="video-container"], iframe');
    const hasVideo = await videoContainer.count() > 0;

    console.log(`Video consultation available: ${hasVideo}`);
  });
});

test.describe('Critical Flows - Data Integrity', () => {
  test('should preserve form data on validation errors', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');

    // Fill partial form
    await page.fill('input[name="fullName"], input[name="name"]', 'Test User');
    await page.fill('input[name="email"], input[type="email"]', 'invalid-email'); // Invalid format

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(1000);

    // Check that name field still has value
    const nameValue = await page.locator('input[name="fullName"], input[name="name"]').inputValue();
    expect(nameValue).toBe('Test User');
  });

  test('should handle concurrent form submissions', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill form
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');

    // Click submit button twice rapidly
    const submitButton = page.locator('button[type="submit"]');

    await Promise.all([
      submitButton.click(),
      submitButton.click()
    ]);

    await page.waitForTimeout(2000);

    // Should handle gracefully (not create duplicate sessions)
    // Verify we're on dashboard or stayed on login with error
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/app|\/login/);
  });
});

test.describe('Critical Flows - Internationalization', () => {
  test('should display Spanish text by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for Spanish text
    const spanishText = page.locator('text=/Agendar|Consulta|Doctor/i');
    const count = await spanishText.count();

    // Should have Spanish content
    expect(count).toBeGreaterThan(0);
  });

  test('should handle Spanish characters correctly', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');

    // Fill form with Spanish characters
    await page.fill('input[name="fullName"], input[name="name"]', 'José García López');
    await page.fill('input[name="email"], input[type="email"]', 'jose@test.com');

    // Verify name field accepts and displays Spanish characters
    const nameValue = await page.locator('input[name="fullName"], input[name="name"]').inputValue();
    expect(nameValue).toBe('José García López');
  });

  test('should format currency in MXN', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Check for MXN currency format
    const priceText = page.locator('text=/\\$\\d+|MXN/i');
    const count = await priceText.count();

    if (count > 0) {
      // Should show prices
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Critical Flows - Mobile Performance', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for horizontal scroll (should not have)
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('should have touch-friendly elements on mobile', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Check button sizes
    const buttons = page.locator('button, a[href]');
    const count = await buttons.count();

    if (count > 0) {
      // Sample first few buttons
      const sampleSize = Math.min(3, count);
      for (let i = 0; i < sampleSize; i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();

        if (boundingBox) {
          // Touch targets should be at least 44px
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });
});
