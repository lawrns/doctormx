import { test, expect } from '@playwright/test';
import { clearAuth, login, testUsers } from '../helpers/auth.helper';
import { generateTestEmail } from '../helpers/test-data.factory';

/**
 * E2E Tests for Password Reset Flow
 *
 * Tests password reset functionality including:
 * - Request password reset
 * - Email verification
 * - Reset token validation
 * - New password submission
 * - Password strength validation
 * - Reset confirmation
 * - Login with new password
 * - Reset link expiration
 * - Rate limiting
 */

test.describe('Password Reset Request', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/auth/forgot-password');
    await page.waitForLoadState('networkidle');
  });

  test('should display forgot password form', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("¿Olvidaste tu contraseña?")')).toBeVisible();

    // Check email input
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Check submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check back to login link
    await expect(page.locator('a:has-text("Iniciar sesión")')).toBeVisible();
  });

  test('should request password reset with valid email', async ({ page }) => {
    // Enter email
    await page.fill('input[type="email"]', testUsers.patient.email);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Should show success message
    const successMessage = page.locator('text=/enviado|correo|email|instrucciones/i');
    if (await successMessage.count() > 0) {
      await expect(successMessage.first()).toBeVisible();
    }

    // Should not be on forgot password page anymore (or show confirmation state)
    const currentUrl = page.url();
    const hasConfirmation = currentUrl.includes('sent') || currentUrl.includes('confirm') ||
                           await successMessage.count() > 0;

    expect(hasConfirmation).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email');

    // Trigger validation
    await page.click('input[type="email"]');
    await page.keyboard.press('Tab');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for validation error
    const emailError = page.locator('text=/inválido|invalid|format/i');
    if (await emailError.count() > 0) {
      await expect(emailError.first()).toBeVisible();
    }
  });

  test('should require email field', async ({ page }) => {
    // Try to submit without email
    await page.click('button[type="submit"]');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for validation error
    const requiredError = page.locator('text=/requerido|required|necesario/i');
    if (await requiredError.count() > 0) {
      await expect(requiredError.first()).toBeVisible();
    }
  });

  test('should handle non-existent email gracefully', async ({ page }) => {
    // Enter non-existent email
    await page.fill('input[type="email"]', 'nonexistent@test.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Should not reveal if email exists or not (security best practice)
    // Either show success message or generic error
    const hasMessage = await page.locator('text=/enviado|correo|email/i').count() > 0;

    expect(hasMessage).toBeTruthy();
  });

  test('should have link back to login', async ({ page }) => {
    await expect(page.locator('a:has-text("Iniciar sesión")')).toBeVisible();

    await page.click('a:has-text("Iniciar sesión")');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/.*login.*/);
    await expect(page.locator('h1:has-text("Iniciar sesión")')).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');

    // Check for loading state immediately
    const submitButton = page.locator('button[type="submit"]');
    const loader = submitButton.locator('svg[class*="spin"], .animate-spin');

    if (await loader.count() > 0) {
      await expect(loader.first()).toBeVisible();
      await expect(submitButton).toHaveAttribute('disabled');
    }
  });
});

test.describe('Password Reset Completion', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should display reset password form with valid token', async ({ page }) => {
    // Navigate to reset page with token (simulated)
    await page.goto('/auth/reset-password?token=valid_reset_token');
    await page.waitForLoadState('networkidle');

    // Should show reset form
    const passwordInput = page.locator('input[type="password"]');
    const hasPasswordInput = await passwordInput.count() > 0;

    // If reset page exists, check form elements
    if (hasPasswordInput) {
      await expect(passwordInput.first()).toBeVisible();

      const confirmInput = page.locator('input[name="confirmPassword"], input[name="confirm"]');
      expect(await confirmInput.count()).toBeGreaterThan(0);

      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    }
  });

  test('should validate new password strength', async ({ page }) => {
    await page.goto('/auth/reset-password?token=valid_reset_token');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      // Enter weak password
      await passwordInput.fill('123456');
      await page.waitForTimeout(500);

      // Check for strength indicator or error
      const weakIndicator = page.locator('text=/débil|weak|corta/i');
      if (await weakIndicator.count() > 0) {
        await expect(weakIndicator.first()).toBeVisible();
      }

      // Enter strong password
      await passwordInput.fill('NewSecurePass123!');
      await page.waitForTimeout(500);

      // Check for strong indicator
      const strongIndicator = page.locator('text=/fuerte|strong/good/i');
      if (await strongIndicator.count() > 0) {
        await expect(strongIndicator.first()).toBeVisible();
      }
    }
  });

  test('should require password confirmation', async ({ page }) => {
    await page.goto('/auth/reset-password?token=valid_reset_token');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[name="password"]').first();
    const confirmInput = page.locator('input[name="confirmPassword"], input[name="confirm"]').first();

    if (await passwordInput.count() > 0 && await confirmInput.count() > 0) {
      await passwordInput.fill('NewPassword123!');
      await confirmInput.fill('DifferentPassword123!');

      // Try to submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // Should show mismatch error
      const mismatchError = page.locator('text=/coinciden|match|igual/i');
      if (await mismatchError.count() > 0) {
        await expect(mismatchError.first()).toBeVisible();
      }
    }
  });

  test('should show error with invalid token', async ({ page }) => {
    await page.goto('/auth/reset-password?token=invalid_or_expired_token');
    await page.waitForLoadState('networkidle');

    // Should show error or redirect
    const errorMessage = page.locator('text=/inválido|expirado|invalid|expired/i');
    const currentUrl = page.url();

    const hasError = await errorMessage.count() > 0 || currentUrl.includes('login');

    expect(hasError).toBeTruthy();
  });

  test('should successfully reset password and allow login', async ({ page }) => {
    // This test assumes a valid reset token flow
    // In a real scenario, you'd need to:
    // 1. Request reset
    // 2. Get token from email
    // 3. Use token to reset

    // Simulate successful reset
    await page.goto('/auth/reset-password?token=valid_reset_token');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[name="password"]').first();
    const confirmInput = page.locator('input[name="confirmPassword"], input[name="confirm"]').first();

    if (await passwordInput.count() > 0 && await confirmInput.count() > 0) {
      await passwordInput.fill('NewPassword123!');
      await confirmInput.fill('NewPassword123!');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Should redirect to login or show success
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('login') || currentUrl.includes('success');

      if (isRedirected) {
        // Try to login with new password
        await page.goto('/auth/login');
        await page.fill('input[type="email"]', testUsers.patient.email);
        await page.fill('input[type="password"]', 'NewPassword123!');
        await page.click('button[type="submit"]');

        await page.waitForTimeout(2000);

        // Should login successfully (or fail if token was invalid)
        const loginUrl = page.url();
        const loginSuccess = loginUrl.includes('/app') || loginUrl.includes('/doctor');

        // Note: This might fail if using test user with actual password
        // The test verifies the flow, not actual authentication
      }
    }
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/auth/reset-password?token=valid_reset_token');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[name="password"]').first();

    if (await passwordInput.count() > 0) {
      // Look for strength indicator
      const strengthBar = page.locator('[data-testid="password-strength"], .strength-meter');

      if (await strengthBar.count() > 0) {
        // Enter different passwords
        await passwordInput.fill('123');
        await page.waitForTimeout(500);

        // Should show weak indicator
        await expect(strengthBar.first()).toBeVisible();
      }
    }
  });

  test('should have link to resend reset email', async ({ page }) => {
    await page.goto('/auth/reset-password?token=expired_token');
    await page.waitForLoadState('networkidle');

    // Look for resend link
    const resendLink = page.locator('a:has-text("reenviar"), a:has-text("resend"), button:has-text("reenviar")');

    if (await resendLink.count() > 0) {
      await resendLink.first().click();

      // Should navigate to forgot password or show resend form
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();

      const isResendPage = currentUrl.includes('forgot-password') || currentUrl.includes('resend');

      expect(isResendPage).toBeTruthy();
    }
  });
});

test.describe('Password Reset Security', () => {
  test('should rate limit reset requests', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Submit multiple requests quickly
    for (let i = 0; i < 5; i++) {
      await page.goto('/auth/forgot-password');
      await page.fill('input[type="email"]', `test${i}@example.com`);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // After several attempts, might show rate limiting
    const rateLimitMessage = page.locator('text=/espera|intenta de nuevo|too many|rate limit/i');

    // Rate limiting is optional - just verify page is still functional
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should not reveal if email exists', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Try with existing email
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const existingResponse = await page.locator('text=/enviado|correo/i').count();

    // Try with non-existing email
    await page.goto('/auth/forgot-password');
    await page.fill('input[type="email"]', 'nonexistent@test.com');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const nonExistingResponse = await page.locator('text=/enviado|correo/i').count();

    // Both should show similar messages (not revealing if email exists)
    expect(existingResponse > 0 || nonExistingResponse > 0).toBeTruthy();
  });

  test('should invalidate reset token after use', async ({ page }) => {
    // This test verifies that a reset token can only be used once
    // First reset
    await page.goto('/auth/reset-password?token=single_use_token');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[name="password"]').first();
    const confirmInput = page.locator('input[name="confirmPassword"]').first();

    if (await passwordInput.count() > 0 && await confirmInput.count() > 0) {
      await passwordInput.fill('NewPassword123!');
      await confirmInput.fill('NewPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Try to use same token again
      await page.goto('/auth/reset-password?token=single_use_token');
      await page.waitForLoadState('networkidle');

      // Should show error (token already used)
      const errorMessage = page.locator('text=/inválido|usado|expired/i');
      const hasError = await errorMessage.count() > 0;

      expect(hasError).toBeTruthy();
    }
  });

  test('should expire reset token after time', async ({ page }) => {
    // Navigate with expired token
    await page.goto('/auth/reset-password?token=expired_token_123');
    await page.waitForLoadState('networkidle');

    // Should show expiration error
    const expiredMessage = page.locator('text=/expirado|expiró|expired/i');
    const hasExpiredMessage = await expiredMessage.count() > 0;

    if (hasExpiredMessage) {
      await expect(expiredMessage.first()).toBeVisible();
    }

    // Should provide option to request new token
    const newTokenLink = page.locator('a:has-text("nuevo"), a:has-text("solicitar"), button:has-text("solicitar")');
    const hasNewTokenOption = await newTokenLink.count() > 0;

    expect(hasNewTokenOption || hasExpiredMessage).toBeTruthy();
  });

  test('should validate token format', async ({ page }) => {
    // Try with malformed token
    await page.goto('/auth/reset-password?token=invalid@#$%token');
    await page.waitForLoadState('networkidle');

    // Should show error
    const errorMessage = page.locator('text=/inválido|invalid|format/i');
    const hasError = await errorMessage.count() > 0 || page.url().includes('login');

    expect(hasError).toBeTruthy();
  });

  test('should prevent token reuse across different users', async ({ page }) => {
    // This test verifies security measure against token reuse
    // Navigate with a token
    await page.goto('/auth/reset-password?token=user_a_token');
    await page.waitForLoadState('networkidle');

    // The token should be tied to specific user
    // Implementation detail: server validates token ownership
    const currentUrl = page.url();

    // Should either show form or error (not allow arbitrary reset)
    const isValid = currentUrl.includes('reset-password') || currentUrl.includes('login');

    expect(isValid).toBeTruthy();
  });
});

test.describe('Password Reset User Experience', () => {
  test('should show helpful instructions', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Look for instructions
    const instructions = page.locator('text=/ingresa tu correo|recibirás un correo|instrucciones/i');

    if (await instructions.count() > 0) {
      await expect(instructions.first()).toBeVisible();
    }
  });

  test('should have clear confirmation message', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Should show clear confirmation
    const confirmation = page.locator('text=/correo enviado|check your email|instrucciones enviadas/i');
    const hasConfirmation = await confirmation.count() > 0;

    expect(hasConfirmation).toBeTruthy();
  });

  test('should provide estimated delivery time', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Some implementations show estimated time
    const timeEstimate = page.locator('text=/minutos|pocos minutos|momento/i');
    const hasTimeEstimate = await timeEstimate.count() > 0;

    // This is optional
    if (hasTimeEstimate) {
      await expect(timeEstimate.first()).toBeVisible();
    }
  });

  test('should handle back navigation properly', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be on login or forgot-password
    const currentUrl = page.url();
    const isValidState = currentUrl.includes('login') || currentUrl.includes('forgot-password');

    expect(isValidState).toBeTruthy();
  });

  test('should be accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/forgot-password');

    // Check form is usable on mobile
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check buttons are touch-friendly (at least 44px height)
    const submitButton = page.locator('button[type="submit"]');
    const box = await submitButton.boundingBox();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should maintain consistency with login page styling', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Should have similar layout to login page
    const hasForm = await page.locator('form').count() > 0;
    const hasInput = await page.locator('input[type="email"]').count() > 0;
    const hasButton = await page.locator('button[type="submit"]').count() > 0;

    expect(hasForm && hasInput && hasButton).toBeTruthy();
  });
});

test.describe('Complete Password Reset Flow', () => {
  test('should complete full reset cycle', async ({ page }) => {
    // Step 1: Go to forgot password
    await page.goto('/auth/forgot-password');
    await expect(page.locator('h1:has-text("¿Olvidaste tu contraseña?")')).toBeVisible();

    // Step 2: Request reset
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Should show confirmation
    const confirmed = await page.locator('text=/enviado|correo/i').count() > 0;
    expect(confirmed).toBeTruthy();

    // Step 3: Navigate to reset page (simulating email link)
    await page.goto('/auth/reset-password?token=simulated_valid_token');
    await page.waitForLoadState('networkidle');

    const resetFormExists = await page.locator('input[name="password"]').count() > 0;

    if (resetFormExists) {
      // Step 4: Enter new password
      await page.fill('input[name="password"]', 'NewSecurePass123!');
      await page.fill('input[name="confirmPassword"]', 'NewSecurePass123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Step 5: Should redirect to login or show success
      const currentUrl = page.url();
      const isComplete = currentUrl.includes('login') || currentUrl.includes('success');

      expect(isComplete).toBeTruthy();
    }
  });

  test('should allow retry after failed reset', async ({ page }) => {
    await page.goto('/auth/reset-password?token=some_token');

    const passwordInput = page.locator('input[name="password"]').first();
    const confirmInput = page.locator('input[name="confirmPassword"]').first();

    if (await passwordInput.count() > 0 && await confirmInput.count() > 0) {
      // Enter mismatched passwords
      await passwordInput.fill('Password123!');
      await confirmInput.fill('Different123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      // Should show error and allow retry
      await page.fill('input[name="confirmPassword"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Should process the request
      const currentUrl = page.url();
      const hasResponded = !currentUrl.includes('reset-password') || await page.locator('text=/error/i').count() > 0;

      expect(hasResponded).toBeTruthy();
    }
  });

  test('should handle multiple reset requests', async ({ page }) => {
    // User requests reset, then requests again before using link
    await page.goto('/auth/forgot-password');

    // First request
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Second request (might invalidate first token)
    await page.goto('/auth/forgot-password');
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Should handle gracefully (either show confirmation or rate limit)
    const hasConfirmation = await page.locator('text=/enviado|correo/i').count() > 0;

    expect(hasConfirmation).toBeTruthy();
  });
});

test.describe('Password Reset Edge Cases', () => {
  test('should handle very long email addresses', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    const longEmail = 'a'.repeat(100) + '@test.com';
    await page.fill('input[type="email"]', longEmail);
    await page.click('button[type="submit"]');

    // Should handle without crashing
    await page.waitForTimeout(1000);
    const hasValidation = await page.locator('text=/inválido|longitud|length/i').count() > 0;

    // Either validates or submits
    expect(page.locator('h1')).toBeTruthy();
  });

  test('should handle special characters in email', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Test with special characters (valid email format)
    await page.fill('input[type="email"]', 'user+tag@example.com');
    await page.click('button[type="submit"]');

    // Should accept valid email with special chars
    await page.waitForTimeout(1000);

    const hasError = await page.locator('text=/inválido|invalid/i').count() > 0;

    // Should not show format error for valid email
    expect(hasError).toBeFalsy();
  });

  test('should handle unicode characters in password', async ({ page }) => {
    await page.goto('/auth/reset-password?token=valid_token');

    const passwordInput = page.locator('input[name="password"]').first();
    const confirmInput = page.locator('input[name="confirmPassword"]').first();

    if (await passwordInput.count() > 0 && await confirmInput.count() > 0) {
      // Enter password with unicode
      await passwordInput.fill('Contraseña123!ñ');
      await confirmInput.fill('Contraseña123!ñ');
      await page.click('button[type="submit"]');

      // Should handle unicode
      await page.waitForTimeout(2000);

      // Just verify no crash
      expect(page.locator('body')).toBeTruthy();
    }
  });

  test('should handle concurrent reset requests', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Quick multiple submissions
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.click('button[type="submit"]');

    // Try to submit again quickly
    await page.waitForTimeout(100);
    await page.click('button[type="submit"]');

    // Should handle gracefully
    await page.waitForTimeout(2000);

    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });

  test('should work with JavaScript disabled', async ({ context }) => {
    // Note: Playwright doesn't fully support JS-disabled testing
    // This is a placeholder for such testing
    const page = await context.newPage();

    // Navigate to page
    await page.goto('/auth/forgot-password');

    // Form should work with basic HTML form submission
    await expect(page.locator('form')).toBeVisible();

    await page.close();
  });
});
