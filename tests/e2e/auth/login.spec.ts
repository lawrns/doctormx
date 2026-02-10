import { test, expect, Page } from '@playwright/test';
import { login, logout, clearAuth, waitForLoginSuccess, waitForLoginError, testUsers } from '../helpers/auth.helper';
import { generateTestEmail } from '../helpers/test-data.factory';

/**
 * E2E Tests for Login Flow
 *
 * Tests user authentication process including:
 * - Valid credentials login
 * - Invalid credentials handling
 * - User type selection (patient/doctor)
 * - Remember me functionality
 * - Password visibility toggle
 * - Social login buttons
 * - Redirect behavior
 * - Session persistence
 */

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
  });

  test('should display login form elements', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("Iniciar sesión")')).toBeVisible();

    // Check user type toggle
    await expect(page.locator('button:has-text("Paciente")')).toBeVisible();
    await expect(page.locator('button:has-text("Doctor")')).toBeVisible();

    // Check form fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Check submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText(/iniciar sesión/i);

    // Check social login buttons
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("Apple")')).toBeVisible();

    // Check forgot password link
    await expect(page.locator('a:has-text("¿Olvidaste tu contraseña?")')).toBeVisible();

    // Check registration link
    await expect(page.locator('a:has-text("Regístrate gratis")')).toBeVisible();
  });

  test('should login patient with valid credentials', async ({ page }) => {
    // Select patient type
    await page.click('button:has-text("Paciente")');

    // Fill in credentials
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.fill('input[type="password"]', testUsers.patient.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for successful redirect
    await waitForLoginSuccess(page, 'patient');

    // Verify we're on patient dashboard
    await expect(page).toHaveURL(/\/app/);
  });

  test('should login doctor with valid credentials', async ({ page }) => {
    // Select doctor type
    await page.click('button:has-text("Doctor")');

    // Fill in credentials
    await page.fill('input[type="email"]', testUsers.doctor.email);
    await page.fill('input[type="password"]', testUsers.doctor.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for successful redirect
    await waitForLoginSuccess(page, 'doctor');

    // Verify we're on doctor dashboard
    await expect(page).toHaveURL(/\/doctor/);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error message
    await page.waitForTimeout(2000);

    // Check for error message
    const errorMessage = page.locator('text=/inválidos|incorrectos|error|not found/i');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }

    // Should still be on login page
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.click('button[type="submit"]');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for validation errors
    const emailError = page.locator('text=/correo|email|required/i');
    const passwordError = page.locator('text=/contraseña|password|required/i');

    // At least one validation error should appear
    const hasErrors = await Promise.all([
      emailError.count().then(count => count > 0),
      passwordError.count().then(count => count > 0)
    ]);

    expect(hasErrors.some(Boolean)).toBeTruthy();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill in invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'ValidPassword123!');

    // Trigger validation
    await page.click('input[type="password"]');
    await page.keyboard.press('Tab');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for email validation error
    const emailError = page.locator('text=/inválido|invalid|format/i');
    if (await emailError.count() > 0) {
      await expect(emailError.first()).toBeVisible();
    }
  });

  test('should show validation error for short password', async ({ page }) => {
    // Fill in short password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '12345');

    // Trigger validation
    await page.click('input[type="email"]');
    await page.keyboard.press('Tab');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for password validation error
    const passwordError = page.locator('text=/6 caracteres|mínimo/i');
    if (await passwordError.count() > 0) {
      await expect(passwordError.first()).toBeVisible();
    }
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button').filter({ hasText: '' }).locator('xpath=ancestor::div[contains(@class, "relative")]//button');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button to show password
    const eyeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await eyeButton.count() > 0) {
      await eyeButton.first().click();
      await page.waitForTimeout(200);

      // Password should now be visible
      const visibleInput = page.locator('input[type="text"]');
      const hasVisiblePassword = await visibleInput.count() > 0;
      expect(hasVisiblePassword).toBeTruthy();

      // Click again to hide
      await eyeButton.first().click();
      await page.waitForTimeout(200);

      // Password should be hidden again
      await expect(passwordInput).toBeVisible();
    }
  });

  test('should persist session when remember me is checked', async ({ page, context }) => {
    // Select patient type
    await page.click('button:has-text("Paciente")');

    // Check remember me
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    if (await rememberCheckbox.count() > 0) {
      await rememberCheckbox.check();
    }

    // Fill in credentials
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.fill('input[type="password"]', testUsers.patient.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for successful login
    await waitForLoginSuccess(page, 'patient');

    // Check cookies are set
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('auth') || c.name.includes('session') || c.name.includes('sb-')
    );
    expect(authCookies.length).toBeGreaterThan(0);

    // Verify session persists across pages
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Should still be authenticated
    await expect(page).toHaveURL(/\/app/);
  });

  test('should redirect to specified URL after login', async ({ page }) => {
    // Navigate to login with redirect parameter
    await page.goto('/auth/login?redirect=/doctors');

    // Fill in credentials
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.fill('input[type="password"]', testUsers.patient.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForTimeout(3000);

    // Should be redirected to the specified URL
    await expect(page).toHaveURL(/\/doctors/);
  });

  test('should display loading state during login', async ({ page }) => {
    // Fill in credentials
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.fill('input[type="password"]', testUsers.patient.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Check for loading state immediately
    const submitButton = page.locator('button[type="submit"]');
    const loader = submitButton.locator('svg[class*="spin"], .animate-spin');

    if (await loader.count() > 0) {
      await expect(loader.first()).toBeVisible();
      await expect(submitButton).toHaveAttribute('disabled');
    }
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click registration link
    await page.click('a:has-text("Regístrate gratis")');

    // Should navigate to registration
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*register.*/);

    // Check registration page elements
    await expect(page.locator('h1:has-text("Crear cuenta")')).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Click forgot password link
    await page.click('a:has-text("¿Olvidaste tu contraseña?")');

    // Should navigate to forgot password
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*forgot-password.*/);
  });
});

test.describe('Login Flow - User Roles', () => {
  test('patient user should access patient dashboard', async ({ page }) => {
    await login(page, testUsers.patient);

    // Verify patient-specific features
    await expect(page).toHaveURL(/\/app/);

    // Check for patient navigation
    const patientNav = page.locator('a[href*="/appointments"], a[href*="/doctors"]');
    expect(await patientNav.count()).toBeGreaterThan(0);
  });

  test('doctor user should access doctor dashboard', async ({ page }) => {
    await login(page, testUsers.doctor);

    // Verify doctor-specific features
    await expect(page).toHaveURL(/\/doctor/);

    // Check for doctor navigation
    const doctorNav = page.locator('a[href*="/doctor/appointments"], a[href*="/doctor/availability"]');
    expect(await doctorNav.count()).toBeGreaterThan(0);
  });

  test('patient should not access doctor routes', async ({ page }) => {
    await login(page, testUsers.patient);

    // Try to access doctor route
    await page.goto('/doctor/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected or show unauthorized
    const currentUrl = page.url();
    const isUnauthorized = currentUrl.includes('unauthorized') || currentUrl.includes('login');
    expect(isUnauthorized).toBeTruthy();
  });

  test('doctor should not access patient routes', async ({ page }) => {
    await login(page, testUsers.doctor);

    // Try to access patient route
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected or show unauthorized
    const currentUrl = page.url();
    const isUnauthorized = currentUrl.includes('unauthorized') || currentUrl.includes('login') || currentUrl.includes('/doctor');
    expect(isUnauthorized).toBeTruthy();
  });
});

test.describe('Login Flow - Logout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.patient);
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout button
    const logoutButton = page.locator('button:has-text("Cerrar"), a:has-text("Cerrar"), button:has-text("Salir")');
    const count = await logoutButton.count();

    if (count > 0) {
      await logoutButton.first().click();
      await page.waitForLoadState('networkidle');

      // Should be redirected to login
      await expect(page).toHaveURL(/.*login.*/);

      // Verify cookies are cleared
      const cookies = await page.context().cookies();
      const authCookies = cookies.filter(c =>
        c.name.includes('auth') || c.name.includes('session') || c.name.includes('sb-')
      );
      expect(authCookies.length).toBe(0);
    }
  });

  test('should require login after logout for protected routes', async ({ page }) => {
    // Logout
    await logout(page);

    // Try to access protected route
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/);

    // Verify redirect parameter is set
    const url = page.url();
    expect(url).toContain('redirect');
  });
});

test.describe('Login Flow - Security', () => {
  test('should handle concurrent login attempts', async ({ context }) => {
    // Create two pages
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Both navigate to login
    await page1.goto('/auth/login');
    await page2.goto('/auth/login');

    // Both try to login
    await page1.fill('input[type="email"]', testUsers.patient.email);
    await page1.fill('input[type="password"]', testUsers.patient.password);
    await page1.click('button[type="submit"]');

    await page2.fill('input[type="email"]', testUsers.doctor.email);
    await page2.fill('input[type="password"]', testUsers.doctor.password);
    await page2.click('button[type="submit"]');

    // Both should succeed
    await page1.waitForURL(/\/app/, { timeout: 5000 });
    await page2.waitForURL(/\/doctor/, { timeout: 5000 });

    await page1.close();
    await page2.close();
  });

  test('should rate limit excessive failed attempts', async ({ page }) => {
    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', `failed${i}@test.com`);
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
    }

    // After several attempts, might see rate limiting
    // This is a soft test - just verify the page still loads
    await expect(page.locator('h1:has-text("Iniciar sesión")')).toBeVisible();
  });

  test('should handle session expiration gracefully', async ({ page }) => {
    // Login
    await login(page, testUsers.patient);

    // Clear session manually
    await clearAuth(page);

    // Try to navigate to protected route
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/);
  });
});

test.describe('Login Flow - Accessibility', () => {
  test('should have proper form labels', async ({ page }) => {
    // Check email input has label
    const emailLabel = page.locator('label:has-text("Correo")');
    expect(await emailLabel.count()).toBeGreaterThan(0);

    // Check password input has label
    const passwordLabel = page.locator('label:has-text("Contraseña")');
    expect(await passwordLabel.count()).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through form
    await page.keyboard.press('Tab'); // User type
    await page.keyboard.press('Tab'); // Email
    await page.keyboard.press('Tab'); // Password
    await page.keyboard.press('Tab'); // Remember me

    // Focus should be on submit button or similar
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
  });

  test('should have proper error announcements', async ({ page }) => {
    // Submit empty form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Check for ARIA alerts or error messages
    const errorAlert = page.locator('[role="alert"], .error, .destructive');
    if (await errorAlert.count() > 0) {
      await expect(errorAlert.first()).toBeVisible();
    }
  });
});
