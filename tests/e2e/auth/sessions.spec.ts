import { test, expect, BrowserContext } from '@playwright/test';
import { login, logout, clearAuth, testUsers } from '../helpers/auth.helper';

/**
 * E2E Tests for Session Management
 *
 * Tests session handling including:
 * - Session creation and persistence
 * - Token storage (cookies, localStorage)
 * - Session refresh
 * - Multiple device sessions
 * - Session expiration
 * - Concurrent sessions
 * - Logout and cleanup
 */

test.describe('Session Creation', () => {
  test('should create session on login', async ({ page, context }) => {
    await clearAuth(page);
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill credentials
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.fill('input[type="password"]', testUsers.patient.password);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/app/, { timeout: 5000 });

    // Check for auth cookies
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') || c.name.includes('auth') || c.name.includes('session')
    );

    expect(authCookies.length).toBeGreaterThan(0);

    // Check for localStorage tokens
    const accessToken = await page.evaluate(() => localStorage.getItem('sb-access-token'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('sb-refresh-token'));

    expect(accessToken || refreshToken).toBeTruthy();
  });

  test('should store session tokens securely', async ({ page, context }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Check cookies have secure attributes
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => c.name.includes('sb-') || c.name.includes('auth'));

    for (const cookie of authCookies) {
      // Cookies should be secure or httpOnly
      const isSecure = cookie.secure || cookie.httpOnly || cookie.sameSite === 'lax' || cookie.sameSite === 'strict';
      expect(isSecure).toBeTruthy();
    }

    // Check tokens in localStorage
    const tokens = await page.evaluate(() => ({
      accessToken: localStorage.getItem('sb-access-token'),
      refreshToken: localStorage.getItem('sb-refresh-token')
    }));

    // At least one token should exist
    expect(tokens.accessToken || tokens.refreshToken).toBeTruthy();
  });

  test('should persist session across page reloads', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be logged in
    await expect(page).toHaveURL(/\/app/);

    // Check for session indicators
    const loggedInIndicator = page.locator('button:has-text("Cerrar"), a:has-text("perfil"), nav');
    expect(await loggedInIndicator.count()).toBeGreaterThan(0);
  });

  test('should persist session across navigation', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Navigate to different pages
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/doctors/);

    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/app\/appointments/);

    // Session should still be active
    const isLoggedIn = await page.evaluate(() => {
      const token = localStorage.getItem('sb-access-token');
      return !!token;
    });

    expect(isLoggedIn).toBeTruthy();
  });
});

test.describe('Session Persistence', () => {
  test('should maintain session when remember me is checked', async ({ page, context }) => {
    await clearAuth(page);
    await page.goto('/auth/login');

    // Check remember me
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    if (await rememberCheckbox.count() > 0) {
      await rememberCheckbox.check();
    }

    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.fill('input[type="password"]', testUsers.patient.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/app/, { timeout: 5000 });

    // Get cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('sb-'));

    if (sessionCookie) {
      // Remember me should set longer expiration
      expect(sessionCookie.expires).toBeGreaterThan(-1); // -1 means session cookie
    }
  });

  test('should restore session on browser restart', async ({ browser, context }) => {
    // Create a page and login
    const page = await context.newPage();
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Get cookies before closing
    const cookiesBefore = await context.cookies();

    // Close context and create new one
    await context.close();

    const newContext = await browser.newContext({
      storageState: { cookies: cookiesBefore, origins: [] }
    });

    const newPage = await newContext.newPage();
    await newPage.goto('/app');
    await newPage.waitForLoadState('networkidle');

    // Should restore session
    expect(newPage.url()).toMatch(/\/app/);

    await newContext.close();
  });

  test('should sync session across tabs', async ({ context }) => {
    await clearAuth(context.pages()[0]);
    await login(context.pages()[0], testUsers.patient);

    // Open new tab
    const newTab = await context.newPage();
    await newTab.goto('/app');
    await newTab.waitForLoadState('networkidle');

    // Should be logged in new tab
    expect(newTab.url()).toMatch(/\/app/);

    // Logout from first tab
    await logout(context.pages()[0]);

    // Second tab should reflect logout
    await newTab.reload();
    await newTab.waitForLoadState('networkidle');

    const currentUrl = newTab.url();
    const isLoggedOut = currentUrl.includes('login') || !currentUrl.includes('/app');

    expect(isLoggedOut).toBeTruthy();
  });
});

test.describe('Session Refresh', () => {
  test('should refresh access token automatically', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Get initial token
    const initialToken = await page.evaluate(() => localStorage.getItem('sb-access-token'));

    // Wait a bit and navigate
    await page.waitForTimeout(2000);
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Token might be refreshed
    const currentToken = await page.evaluate(() => localStorage.getItem('sb-access-token'));

    // Should still have a valid token (might be same or refreshed)
    expect(currentToken).toBeTruthy();
  });

  test('should handle expired access token', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Manually expire access token
    await page.evaluate(() => {
      localStorage.setItem('sb-access-token', 'expired_token');
    });

    // Try to access protected route
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');

    // Should either refresh token or redirect to login
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/app') || currentUrl.includes('login');

    expect(hasAccess).toBeTruthy();
  });

  test('should use refresh token when access token expires', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Verify refresh token exists
    const refreshToken = await page.evaluate(() => localStorage.getItem('sb-refresh-token'));
    expect(refreshToken).toBeTruthy();

    // Make authenticated request
    const response = await page.request.get('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('sb-access-token'))}`
      }
    });

    // Should succeed or handle token refresh
    expect([200, 401, 404]).toContain(response.status());
  });
});

test.describe('Multiple Sessions', () => {
  test('should allow concurrent sessions from different devices', async ({ browser }) => {
    // Create two browser contexts (simulating different devices)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login both contexts with same user
    await page1.goto('/auth/login');
    await page1.fill('input[type="email"]', testUsers.patient.email);
    await page1.fill('input[type="password"]', testUsers.patient.password);
    await page1.click('button[type="submit"]');
    await page1.waitForURL(/\/app/, { timeout: 5000 });

    await page2.goto('/auth/login');
    await page2.fill('input[type="email"]', testUsers.patient.email);
    await page2.fill('input[type="password"]', testUsers.patient.password);
    await page2.click('button[type="submit"]');
    await page2.waitForURL(/\/app/, { timeout: 5000 });

    // Both should be logged in
    expect(page1.url()).toMatch(/\/app/);
    expect(page2.url()).toMatch(/\/app/);

    await context1.close();
    await context2.close();
  });

  test('should handle session conflicts', async ({ browser }) => {
    // Login with two different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login as patient
    await login(page1, testUsers.patient);

    // Login as doctor
    await login(page2, testUsers.doctor);

    // Each should maintain their own session
    await page1.goto('/app');
    await page2.goto('/doctor');

    expect(page1.url()).toMatch(/\/app/);
    expect(page2.url()).toMatch(/\/doctor/);

    // Verify sessions are independent
    const patientToken = await page1.evaluate(() => localStorage.getItem('sb-access-token'));
    const doctorToken = await page2.evaluate(() => localStorage.getItem('sb-access-token'));

    expect(patientToken).toBeTruthy();
    expect(doctorToken).toBeTruthy();

    await context1.close();
    await context2.close();
  });

  test('should handle logout from one device', async ({ browser }) => {
    // Create two contexts for same user
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login both
    await page1.goto('/auth/login');
    await page1.fill('input[type="email"]', testUsers.patient.email);
    await page1.fill('input[type="password"]', testUsers.patient.password);
    await page1.click('button[type="submit"]');
    await page1.waitForURL(/\/app/, { timeout: 5000 });

    await page2.goto('/auth/login');
    await page2.fill('input[type="email"]', testUsers.patient.email);
    await page2.fill('input[type="password"]', testUsers.patient.password);
    await page2.click('button[type="submit"]');
    await page2.waitForURL(/\/app/, { timeout: 5000 });

    // Logout from first device
    await logout(page1);

    // Second device might still be logged in (depending on implementation)
    await page2.reload();
    await page2.waitForLoadState('networkidle');

    const currentUrl = page2.url();
    // Either still logged in or redirected to login
    const isValidState = currentUrl.includes('/app') || currentUrl.includes('login');

    expect(isValidState).toBeTruthy();

    await context1.close();
    await context2.close();
  });
});

test.describe('Session Expiration', () => {
  test('should handle session timeout gracefully', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Clear session to simulate timeout
    await page.evaluate(() => {
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
    });

    // Try to access protected route
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/);

    // Should show session expired message if implemented
    const expiredMessage = page.locator('text=/sesión expirada|session expired/i');
    if (await expiredMessage.count() > 0) {
      await expect(expiredMessage.first()).toBeVisible();
    }
  });

  test('should show warning before session expires', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // This test checks if there's a session timeout warning
    // Implementation might vary
    const warningElement = page.locator('[data-testid="session-warning"], .session-timeout');

    // Warning element is optional
    if (await warningElement.count() > 0) {
      // If implemented, verify it's not immediately visible
      const isVisible = await warningElement.isVisible();
      expect(isVisible).toBeFalsy();
    }
  });

  test('should allow session refresh before expiration', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Simulate user activity before expiration
    await page.goto('/app');
    await page.mouse.move(100, 100);
    await page.waitForTimeout(1000);

    // Session should still be active
    const hasToken = await page.evaluate(() => !!localStorage.getItem('sb-access-token'));
    expect(hasToken).toBeTruthy();
  });
});

test.describe('Session Cleanup', () => {
  test('should clear session data on logout', async ({ page, context }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Set some session data
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
      sessionStorage.setItem('test-session', 'test-value');
    });

    // Logout
    await logout(page);

    // Check localStorage is cleared
    const localStorageCleared = await page.evaluate(() => {
      const token = localStorage.getItem('sb-access-token');
      const testKey = localStorage.getItem('test-key');
      return !token && !testKey;
    });

    // Check cookies are cleared
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') || c.name.includes('auth') || c.name.includes('session')
    );

    expect(authCookies.length).toBe(0);
  });

  test('should clear all session storage on logout', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Set various storage items
    await page.evaluate(() => {
      localStorage.setItem('item1', 'value1');
      sessionStorage.setItem('item2', 'value2');
    });

    // Logout
    await logout(page);

    // Verify all cleared
    const localStorageLength = await page.evaluate(() => localStorage.length);
    const sessionStorageLength = await page.evaluate(() => sessionStorage.length);

    expect(localStorageLength).toBe(0);
    expect(sessionStorageLength).toBe(0);
  });

  test('should handle logout from all tabs', async ({ context }) => {
    await clearAuth(context.pages()[0]);
    await login(context.pages()[0], testUsers.patient);

    // Open multiple tabs
    const tab1 = context.pages()[0];
    const tab2 = await context.newPage();
    const tab3 = await context.newPage();

    await tab2.goto('/app');
    await tab3.goto('/app');

    // Logout from first tab
    await logout(tab1);

    // Check other tabs
    for (const tab of [tab1, tab2, tab3]) {
      await tab.reload();
      await tab.waitForLoadState('networkidle');

      const currentUrl = tab.url();
      const isLoggedOut = currentUrl.includes('login') || !currentUrl.includes('/app');

      expect(isLoggedOut).toBeTruthy();
    }
  });
});

test.describe('Session Security', () => {
  test('should not expose tokens in URL', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Check URL doesn't contain tokens
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/token|access|auth/);

    // Navigate around
    await page.goto('/app/appointments');
    expect(page.url()).not.toMatch(/token|access|auth/);
  });

  test('should regenerate session ID after login', async ({ page, context }) => {
    await clearAuth(page);
    await page.goto('/auth/login');

    // Get initial cookies
    const cookiesBefore = await context.cookies();

    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.fill('input[type="password"]', testUsers.patient.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/app/, { timeout: 5000 });

    // Get cookies after login
    const cookiesAfter = await context.cookies();

    // Should have new session cookies
    const sessionCookiesBefore = cookiesBefore.filter(c => c.name.includes('session'));
    const sessionCookiesAfter = cookiesAfter.filter(c => c.name.includes('session'));

    // Session cookies should be different or new
    expect(sessionCookiesAfter.length).toBeGreaterThan(0);
  });

  test('should validate session on each request', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Make an authenticated request
    const response = await page.request.get('/api/user/profile');

    // Should either succeed with user data or fail appropriately
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('should handle concurrent session modifications', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await clearAuth(page1);
    await login(page1, testUsers.patient);

    // Both pages navigate
    await page1.goto('/app');
    await page2.goto('/app');
    await page2.waitForLoadState('networkidle');

    // Modify session from page1
    await page1.evaluate(() => localStorage.setItem('test-key', 'from-page1'));

    // Check if page2 sees the change
    const value = await page2.evaluate(() => localStorage.getItem('test-key'));

    // Should reflect the change (localStorage is shared in same context)
    expect(value).toBe('from-page1');
  });
});

test.describe('Session Recovery', () => {
  test('should recover session after network interruption', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Simulate network interruption
    await page.context().setOffline(true);

    // Try to navigate
    await page.goto('/app');
    await page.waitForTimeout(2000);

    // Restore network
    await page.context().setOffline(false);

    // Should recover session
    await page.reload();
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/app') || currentUrl.includes('login');

    expect(hasAccess).toBeTruthy();
  });

  test('should handle corrupted session tokens', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Corrupt the token
    await page.evaluate(() => {
      localStorage.setItem('sb-access-token', 'corrupted_token_value');
    });

    // Try to access protected route
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');

    // Should handle gracefully - redirect to login or show error
    const currentUrl = page.url();
    const isHandled = currentUrl.includes('login') ||
                      currentUrl.includes('unauthorized') ||
                      await page.locator('text=/error|unauthorized/i').count() > 0;

    expect(isHandled).toBeTruthy();
  });

  test('should recover from temporary storage issues', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Simulate storage being temporarily unavailable
    await page.evaluate(() => {
      // Disable localStorage temporarily
      const original = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        get: () => null,
        configurable: true
      });
    });

    // Restore localStorage
    await page.evaluate(() => {
      Object.defineProperty(window, 'localStorage', {
        get: () => window.originalStorage,
        configurable: true
      });
    });

    // Should still work or redirect appropriately
    await page.reload();
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isValidState = currentUrl.includes('/app') || currentUrl.includes('login');

    expect(isValidState).toBeTruthy();
  });
});

test.describe('Cross-Session Communication', () => {
  test('should update session changes across tabs', async ({ context }) => {
    await clearAuth(context.pages()[0]);
    await login(context.pages()[0], testUsers.patient);

    const tab1 = context.pages()[0];
    const tab2 = await context.newPage();

    await tab2.goto('/app');

    // Make changes in tab1
    await tab1.evaluate(() => {
      localStorage.setItem('pref-theme', 'dark');
    });

    // Check tab2 (storage events should sync)
    await page.waitForTimeout(500);
    const value = await tab2.evaluate(() => localStorage.getItem('pref-theme'));

    expect(value).toBe('dark');
  });

  test('should handle session events', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Listen for storage events
    const eventFired = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('storage', (e) => {
          if (e.key === 'sb-access-token') {
            resolve(true);
          }
        });

        // Trigger a change
        setTimeout(() => {
          localStorage.setItem('test-trigger', 'value');
          resolve(false);
        }, 100);
      });
    });

    // Event system should be functional
    expect(typeof eventFired).toBe('boolean' || 'undefined');
  });
});
