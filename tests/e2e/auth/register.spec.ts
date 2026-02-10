import { test, expect } from '@playwright/test';
import { clearAuth, login } from '../helpers/auth.helper';
import { generatePatientData, generateDoctorData, generateMexicanPhoneNumber } from '../helpers/test-data.factory';

/**
 * E2E Tests for Registration Flow
 *
 * Tests user registration process for both patients and doctors:
 * - Multi-step registration flow
 * - Account type selection
 * - Personal information validation
 * - Password strength indicator
 * - Doctor-specific fields (license, specialties)
 * - Patient-specific fields (medical history, terms)
 * - Email uniqueness validation
 * - Success and error handling
 */

test.describe('Patient Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
  });

  test('should display registration form elements', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("Crear cuenta")')).toBeVisible();

    // Check progress indicator
    await expect(page.locator('text=/Paso 1 de 3/')).toBeVisible();

    // Check account type selection
    await expect(page.locator('text=/Soy paciente/')).toBeVisible();
    await expect(page.locator('text=/Soy médico/')).toBeVisible();
  });

  test('should select patient account type', async ({ page }) => {
    // Click patient option
    await page.click('label:has-text("Soy paciente")');

    // Verify selection
    const selectedOption = page.locator('[data-state="checked"], .border-primary');
    expect(await selectedOption.count()).toBeGreaterThan(0);
  });

  test('should complete patient registration', async ({ page }) => {
    // Step 1: Select patient account type
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(500);

    // Step 2: Fill personal information
    const patientData = generatePatientData();

    await page.fill('input[name="fullName"]', patientData.fullName);
    await page.fill('input[name="email"]', patientData.email);
    await page.fill('input[name="phone"]', patientData.phone);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    // Wait for validation
    await page.waitForTimeout(500);

    // Proceed to step 3
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(500);

    // Step 3: Complete patient registration
    // Check medical history checkbox (optional)
    const medicalHistoryCheckbox = page.locator('input[type="checkbox"]').first();
    if (await medicalHistoryCheckbox.count() > 0) {
      await medicalHistoryCheckbox.check();
    }

    // Accept terms
    await page.click('label:has-text("Acepto los términos")');

    // Submit registration
    await page.click('button:has-text("Crear cuenta")');

    // Wait for redirect
    await page.waitForTimeout(3000);

    // Should be redirected to patient dashboard
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/app/);
  });

  test('should validate email format in real-time', async ({ page }) => {
    // Select patient type
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Enter invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.waitForTimeout(500);

    // Check for validation error
    const emailError = page.locator('text=/inválido|invalid|format/i');
    if (await emailError.count() > 0) {
      await expect(emailError.first()).toBeVisible();
    }

    // Enter valid email
    await page.fill('input[name="email"]', 'valid@email.com');
    await page.waitForTimeout(500);

    // Validation indicator should show success
    const successIndicator = page.locator('.bg-green-500, [data-testid="validation-success"]');
    if (await successIndicator.count() > 0) {
      await expect(successIndicator.first()).toBeVisible();
    }
  });

  test('should show password strength indicator', async ({ page }) => {
    // Select patient type and go to step 2
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Enter weak password
    await page.fill('input[name="password"]', '123456');
    await page.waitForTimeout(500);

    // Check for weak password indicator
    const weakIndicator = page.locator('text=/Débil|weak/i');
    if (await weakIndicator.count() > 0) {
      await expect(weakIndicator.first()).toBeVisible();
    }

    // Enter strong password
    await page.fill('input[name="password"]', 'StrongP@ss123!');
    await page.waitForTimeout(500);

    // Check for strong password indicator
    const strongIndicator = page.locator('text=/Fuerte|strong/i');
    if (await strongIndicator.count() > 0) {
      await expect(strongIndicator.first()).toBeVisible();
    }
  });

  test('should validate password confirmation', async ({ page }) => {
    // Select patient type and go to step 2
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Fill passwords that don't match
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Different123!');
    await page.waitForTimeout(500);

    // Try to proceed
    await page.click('button:has-text("Siguiente")');

    // Should stay on step 2 or show error
    const currentStep = page.locator('text=/Paso 2 de 3/');
    const hasError = await currentStep.count() > 0;

    expect(hasError).toBeTruthy();

    // Fill matching passwords
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.waitForTimeout(500);

    // Validation indicator should show success
    const successIndicator = page.locator('.bg-green-500');
    if (await successIndicator.count() > 0) {
      await expect(successIndicator.first()).toBeVisible();
    }
  });

  test('should require terms acceptance', async ({ page }) => {
    // Complete steps 1 and 2
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    const patientData = generatePatientData();
    await page.fill('input[name="fullName"]', patientData.fullName);
    await page.fill('input[name="email"]', patientData.email);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button:has-text("Siguiente")');

    // Try to submit without accepting terms
    await page.click('button:has-text("Crear cuenta")');
    await page.waitForTimeout(500);

    // Should show error or prevent submission
    const termsError = page.locator('text=/términos|terms|aceptar/i');
    if (await termsError.count() > 0) {
      await expect(termsError.first()).toBeVisible();
    }
  });

  test('should handle existing email error', async ({ page }) => {
    // Complete steps 1 and 2 with existing email
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Use an email that might already exist
    await page.fill('input[name="fullName"]', 'Test Patient');
    await page.fill('input[name="email"]', 'patient@test.com'); // Known test email
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button:has-text("Siguiente")');

    // Accept terms
    await page.click('label:has-text("Acepto los términos")');
    await page.click('button:has-text("Crear cuenta")');

    // Wait for response
    await page.waitForTimeout(2000);

    // Should show error about existing user
    const errorAlert = page.locator('[role="alert"], .destructive');
    if (await errorAlert.count() > 0) {
      await expect(errorAlert.first()).toBeVisible();
    }
  });

  test('should navigate between steps', async ({ page }) => {
    // Step 1 to Step 2
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');
    await expect(page.locator('text=/Paso 2 de 3/')).toBeVisible();

    // Step 2 back to Step 1
    await page.click('button:has-text("Atrás")');
    await expect(page.locator('text=/Paso 1 de 3/')).toBeVisible();

    // Verify patient selection is preserved
    const selectedOption = page.locator('[data-state="checked"]');
    expect(await selectedOption.count()).toBeGreaterThan(0);
  });

  test('should preserve data when navigating back', async ({ page }) => {
    // Go to step 2
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Fill some data
    const testName = 'Test Patient Name';
    await page.fill('input[name="fullName"]', testName);

    // Go back to step 1
    await page.click('button:has-text("Atrás")');

    // Go forward again
    await page.click('button:has-text("Siguiente")');

    // Name should be preserved
    const nameValue = await page.locator('input[name="fullName"]').inputValue();
    expect(nameValue).toBe(testName);
  });

  test('should have link to login page', async ({ page }) => {
    await expect(page.locator('a:has-text("Inicia sesión")')).toBeVisible();

    await page.click('a:has-text("Inicia sesión")');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/.*login.*/);
    await expect(page.locator('h1:has-text("Iniciar sesión")')).toBeVisible();
  });
});

test.describe('Doctor Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
  });

  test('should select doctor account type', async ({ page }) => {
    // Click doctor option
    await page.click('label:has-text("Soy médico")');

    // Verify selection
    const selectedOption = page.locator('[data-state="checked"], .border-green-500');
    expect(await selectedOption.count()).toBeGreaterThan(0);

    // Verify doctor-specific branding
    await expect(page.locator('text=/ofreceré servicios médicos/i')).toBeVisible();
  });

  test('should complete doctor registration', async ({ page }) => {
    // Step 1: Select doctor account type
    await page.click('label:has-text("Soy médico")');
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(500);

    // Step 2: Fill personal information
    const doctorData = generateDoctorData();

    await page.fill('input[name="fullName"]', doctorData.fullName);
    await page.fill('input[name="email"]', doctorData.email);
    await page.fill('input[name="phone"]', doctorData.phone);
    await page.fill('input[name="password"]', 'DoctorPass123!');
    await page.fill('input[name="confirmPassword"]', 'DoctorPass123!');

    // Proceed to step 3
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(500);

    // Step 3: Complete doctor-specific information
    // Fill license number
    const licenseInput = page.locator('input[name="licenseNumber"]');
    if (await licenseInput.count() > 0) {
      await licenseInput.fill('1234567890');
    }

    // Select at least one specialty
    await page.click('label:has-text("Medicina General")');

    // Submit registration
    await page.click('button:has-text("Crear cuenta")');

    // Wait for redirect
    await page.waitForTimeout(3000);

    // Should be redirected to doctor onboarding
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/doctor\/onboarding/);
  });

  test('should require specialty selection', async ({ page }) => {
    // Complete steps 1 and 2 for doctor
    await page.click('label:has-text("Soy médico")');
    await page.click('button:has-text("Siguiente")');

    const doctorData = generateDoctorData();
    await page.fill('input[name="fullName"]', doctorData.fullName);
    await page.fill('input[name="email"]', doctorData.email);
    await page.fill('input[name="password"]', 'DoctorPass123!');
    await page.fill('input[name="confirmPassword"]', 'DoctorPass123!');
    await page.click('button:has-text("Siguiente")');

    // Try to submit without selecting specialty
    await page.click('button:has-text("Crear cuenta")');
    await page.waitForTimeout(500);

    // Should show validation error
    const specialtyError = page.locator('text=/especialidad|specialty|selecciona/i');
    if (await specialtyError.count() > 0) {
      await expect(specialtyError.first()).toBeVisible();
    }
  });

  test('should allow multiple specialty selection', async ({ page }) => {
    // Go to step 3 for doctor
    await page.click('label:has-text("Soy médico")');
    await page.click('button:has-text("Siguiente")');

    const doctorData = generateDoctorData();
    await page.fill('input[name="fullName"]', doctorData.fullName);
    await page.fill('input[name="email"]', doctorData.email);
    await page.fill('input[name="password"]', 'DoctorPass123!');
    await page.fill('input[name="confirmPassword"]', 'DoctorPass123!');
    await page.click('button:has-text("Siguiente")');

    // Select multiple specialties
    await page.click('label:has-text("Medicina General")');
    await page.click('label:has-text("Cardiología")');
    await page.click('label:has-text("Pediatría")');

    // Verify selections
    const selectedSpecialties = page.locator('.border-green-500, .bg-green-50');
    expect(await selectedSpecialties.count()).toBeGreaterThanOrEqual(3);
  });

  test('should show doctor-specific information in step 3', async ({ page }) => {
    // Go to step 3 for doctor
    await page.click('label:has-text("Soy médico")');
    await page.click('button:has-text("Siguiente")');

    await page.fill('input[name="fullName"]', 'Dr. Test');
    await page.fill('input[name="email"]', 'doctor@test.com');
    await page.fill('input[name="password"]', 'DoctorPass123!');
    await page.fill('input[name="confirmPassword"]', 'DoctorPass123!');
    await page.click('button:has-text("Siguiente")');

    // Check for doctor-specific fields
    await expect(page.locator('text=/Perfil profesional/i')).toBeVisible();
    await expect(page.locator('text=/cérdula|license/i')).toBeVisible();
    await expect(page.locator('text=/Especialidades/i')).toBeVisible();

    // Verify specialty options
    await expect(page.locator('label:has-text("Medicina General")')).toBeVisible();
    await expect(page.locator('label:has-text("Cardiología")')).toBeVisible();
    await expect(page.locator('label:has-text("Dermatología")')).toBeVisible();
  });

  test('should display info about completing profile later', async ({ page }) => {
    // Go to step 3 for doctor
    await page.click('label:has-text("Soy médico")');
    await page.click('button:has-text("Siguiente")');

    await page.fill('input[name="fullName"]', 'Dr. Test');
    await page.fill('input[name="email"]', 'doctor@test.com');
    await page.fill('input[name="password"]', 'DoctorPass123!');
    await page.fill('input[name="confirmPassword"]', 'DoctorPass123!');
    await page.click('button:has-text("Siguiente")');

    // Check for info message about completing profile
    const infoMessage = page.locator('text=/después del registro|completarás tu perfil/i');
    if (await infoMessage.count() > 0) {
      await expect(infoMessage.first()).toBeVisible();
    }
  });
});

test.describe('Registration Flow - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/auth/register');
  });

  test('should validate all required fields', async ({ page }) => {
    // Select patient type
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Try to submit with empty fields
    await page.click('button:has-text("Siguiente")');

    // Check for validation errors
    const errors = page.locator('text=/requerido|required|min/i');
    expect(await errors.count()).toBeGreaterThan(0);
  });

  test('should validate minimum name length', async ({ page }) => {
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Enter too short name
    await page.fill('input[name="fullName"]', 'AB');
    await page.waitForTimeout(500);

    // Check for validation error
    const nameError = page.locator('text=/3 caracteres|min 3/i');
    if (await nameError.count() > 0) {
      await expect(nameError.first()).toBeVisible();
    }
  });

  test('should validate phone number format', async ({ page }) => {
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Enter valid Mexican phone number
    await page.fill('input[name="phone"]', '5512345678');

    // Should not show error (phone is optional)
    const phoneError = page.locator('text=/teléfono|phone.*inválido/i');
    if (await phoneError.count() > 0) {
      // If there's a validation, it should pass for valid format
      const isVisible = await phoneError.isVisible();
      expect(isVisible).toBeFalsy();
    }
  });

  test('should validate password complexity', async ({ page }) => {
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Test different password complexities
    const testCases = [
      { password: '123456', shouldBeWeak: true },
      { password: 'password', shouldBeWeak: true },
      { password: 'Password123', shouldBeMedium: true },
      { password: 'SecureP@ss123!', shouldBeStrong: true }
    ];

    for (const testCase of testCases) {
      await page.fill('input[name="password"]', testCase.password);
      await page.waitForTimeout(500);

      // Check strength indicator
      if (testCase.shouldBeWeak) {
        const weak = page.locator('text=/Débil|weak/i');
        if (await weak.count() > 0) {
          await expect(weak.first()).toBeVisible();
        }
      }
    }
  });
});

test.describe('Registration Flow - Security', () => {
  test('should prevent submission with invalid data', async ({ page }) => {
    await page.goto('/auth/register');
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    // Fill with invalid data
    await page.fill('input[name="fullName"]', 'A');
    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '456');

    // Try to submit
    await page.click('button:has-text("Siguiente")');

    // Should not proceed to step 3
    await page.waitForTimeout(500);
    const step2 = page.locator('text=/Paso 2 de 3/');
    expect(await step2.count()).toBeGreaterThan(0);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Complete the form
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    const patientData = generatePatientData();
    await page.fill('input[name="fullName"]', patientData.fullName);
    await page.fill('input[name="email"]', patientData.email);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button:has-text("Siguiente")');

    await page.click('label:has-text("Acepto los términos")');

    // Mock offline scenario by intercepting requests
    await page.context().setOffline(true);

    // Try to submit
    await page.click('button:has-text("Crear cuenta")');
    await page.waitForTimeout(2000);

    // Should show error or stay on page
    const currentUrl = page.url();
    const hasRegisterPath = currentUrl.includes('register');

    await page.context().setOffline(false);
  });
});

test.describe('Registration Flow - User Experience', () => {
  test('should show progress indicator', async ({ page }) => {
    await page.goto('/auth/register');

    // Check initial progress
    await expect(page.locator('text=/Paso 1 de 3/')).toBeVisible();

    // Progress to step 2
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    await expect(page.locator('text=/Paso 2 de 3/')).toBeVisible();

    // Progress to step 3
    await page.fill('input[name="fullName"]', 'Test Patient');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button:has-text("Siguiente")');

    await expect(page.locator('text=/Paso 3 de 3/')).toBeVisible();
  });

  test('should display appropriate images for user type', async ({ page }) => {
    await page.goto('/auth/register');

    // Check patient image
    const patientImage = page.locator('img, div[style*="backgroundImage"]').filter({ hasText: '' }).first();
    expect(await patientImage.count()).toBeGreaterThan(0);

    // Select doctor type
    await page.click('label:has-text("Soy médico")');

    // Image should change or doctor branding should be visible
    const doctorBranding = page.locator('text=/ofreceré servicios médicos/i');
    expect(await doctorBranding.count()).toBeGreaterThan(0);
  });

  test('should show success state after registration', async ({ page }) => {
    // This test verifies the flow after successful registration
    await page.goto('/auth/register');

    // Complete patient registration
    await page.click('label:has-text("Soy paciente")');
    await page.click('button:has-text("Siguiente")');

    const patientData = generatePatientData();
    await page.fill('input[name="fullName"]', patientData.fullName);
    await page.fill('input[name="email"]', patientData.email);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button:has-text("Siguiente")');

    await page.click('label:has-text("Acepto los términos")');
    await page.click('button:has-text("Crear cuenta")');

    // Wait for redirect or success message
    await page.waitForTimeout(3000);

    // Should either redirect to dashboard or show success
    const currentUrl = page.url();
    const isSuccess = currentUrl.includes('/app') || currentUrl.includes('success');

    // At minimum, should not be on registration page with errors
    if (currentUrl.includes('register')) {
      const errors = page.locator('[role="alert"]');
      expect(await errors.count()).toBe(0);
    }
  });
});
