import { Page, BrowserContext } from '@playwright/test';

/**
 * Helper functions for authentication in E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  fullName: string;
  role: 'patient' | 'doctor';
}

export const testUsers = {
  patient: {
    email: 'patient@test.com',
    password: 'TestPassword123!',
    fullName: 'Test Patient',
    role: 'patient' as const
  },
  doctor: {
    email: 'doctor@test.com',
    password: 'TestPassword123!',
    fullName: 'Dr. Test Doctor',
    role: 'doctor' as const
  },
  admin: {
    email: 'admin@test.com',
    password: 'AdminPassword123!',
    fullName: 'Test Admin',
    role: 'doctor' as const // Admin uses doctor role in system
  }
};

/**
 * Login a user with the given credentials
 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);

  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');

  // Verify we're redirected to appropriate dashboard
  const expectedPath = user.role === 'patient' ? '/app' : '/doctor';
  await page.waitForURL(`**${expectedPath}**`, { timeout: 5000 });
}

/**
 * Register a new patient user
 */
export async function registerPatient(
  page: Page,
  overrides?: Partial<TestUser>
): Promise<TestUser> {
  const user = {
    ...testUsers.patient,
    ...overrides,
    email: `patient-${Date.now()}@test.com`,
    fullName: `Patient ${Date.now()}`
  };

  await page.goto('/auth/register');
  await page.waitForLoadState('networkidle');

  // Switch to patient registration if needed
  const patientToggle = page.locator('input[type="radio"][value="patient"], button:has-text("Paciente")');
  if (await patientToggle.count() > 0) {
    await patientToggle.first().click();
  }

  // Fill registration form
  await page.fill('input[name="fullName"], input[name="name"]', user.fullName);
  await page.fill('input[name="email"], input[type="email"]', user.email);
  await page.fill('input[name="phone"], input[type="tel"]', '5512345678');
  await page.fill('input[name="password"], input[type="password"]', user.password);

  // Submit form
  const submitButton = page.locator('button[type="submit"]').filter({ hasText: /registrarse/i });
  await submitButton.click();

  // Wait for redirect
  await page.waitForLoadState('networkidle');

  return user;
}

/**
 * Register a new doctor user
 */
export async function registerDoctor(
  page: Page,
  overrides?: Partial<TestUser>
): Promise<TestUser> {
  const user = {
    ...testUsers.doctor,
    ...overrides,
    email: `doctor-${Date.now()}@test.com`,
    fullName: `Dr. ${Date.now()}`
  };

  await page.goto('/auth/register');
  await page.waitForLoadState('networkidle');

  // Switch to doctor registration
  const doctorToggle = page.locator('input[type="radio"][value="doctor"], button:has-text("Doctor")');
  if (await doctorToggle.count() > 0) {
    await doctorToggle.first().click();
  }

  // Fill registration form
  await page.fill('input[name="fullName"], input[name="name"]', user.fullName);
  await page.fill('input[name="email"], input[type="email"]', user.email);
  await page.fill('input[name="phone"], input[type="tel"]', '5512345678');
  await page.fill('input[name="password"], input[type="password"]', user.password);

  // Submit form
  const submitButton = page.locator('button[type="submit"]').filter({ hasText: /registrarse/i });
  await submitButton.click();

  // Wait for redirect to onboarding
  await page.waitForLoadState('networkidle');

  return user;
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  // Look for logout button/link
  const logoutButton = page.locator('button:has-text("Cerrar"), a:has-text("Cerrar"), button:has-text("Salir")');
  const count = await logoutButton.count();

  if (count > 0) {
    await logoutButton.first().click();
    await page.waitForLoadState('networkidle');

    // Verify redirect to login or home
    await page.waitForURL('**/login**', { timeout: 5000 });
  }
}

/**
 * Get authenticated page for a user
 */
export async function getAuthenticatedPage(
  context: BrowserContext,
  user: TestUser
): Promise<Page> {
  const page = await context.newPage();

  await page.goto('/auth/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');

  return page;
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const currentUrl = page.url();

  // If we're on a protected page, we're logged in
  if (currentUrl.includes('/app') || currentUrl.includes('/doctor') || currentUrl.includes('/admin')) {
    return true;
  }

  // Check for auth cookies
  const cookies = await page.context().cookies();
  return cookies.some(c => c.name.includes('auth') || c.name.includes('session'));
}

/**
 * Clear all auth data
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Wait for successful login
 */
export async function waitForLoginSuccess(page: Page, role: 'patient' | 'doctor'): Promise<void> {
  const expectedPath = role === 'patient' ? '/app' : '/doctor';
  await page.waitForURL(`**${expectedPath}**`, { timeout: 5000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for login error
 */
export async function waitForLoginError(page: Page): Promise<void> {
  const errorMessage = page.locator('text=/inválidos|incorrectos|error/i');

  if (await errorMessage.count() > 0) {
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  // Should still be on login page
  await page.waitForURL('**/login**', { timeout: 5000 });
}

/**
 * Complete doctor onboarding
 */
export async function completeDoctorOnboarding(page: Page): Promise<void> {
  await page.goto('/doctor/onboarding');
  await page.waitForLoadState('networkidle');

  // Fill onboarding form
  const specialty = page.locator('select[name="specialty"], input[name="specialty"]');
  if (await specialty.count() > 0) {
    await specialty.first().fill('Medicina General');
  }

  const license = page.locator('input[name="license"], input[name="cedula"]');
  if (await license.count() > 0) {
    await license.first().fill('1234567890');
  }

  const experience = page.locator('input[name="experience"], input[name="years"]');
  if (await experience.count() > 0) {
    await experience.first().fill('5');
  }

  const bio = page.locator('textarea[name="bio"]');
  if (await bio.count() > 0) {
    await bio.first().fill('Médico general con experiencia en telemedicina');
  }

  const price = page.locator('input[name="price"], input[name="consultation_price"]');
  if (await price.count() > 0) {
    await price.first().fill('500');
  }

  // Submit form
  const submitButton = page.locator('button[type="submit"]').filter({ hasText: /guardar|enviar/i });
  if (await submitButton.count() > 0) {
    await submitButton.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Set up test user data in database
 * This would typically call an API endpoint
 */
export async function createTestUserInDb(user: TestUser): Promise<void> {
  // This is a placeholder for DB setup
  // In a real implementation, this would call a test API endpoint
  console.log('Creating test user in DB:', user.email);
}

/**
 * Clean up test user data from database
 */
export async function cleanupTestUser(user: TestUser): Promise<void> {
  // This is a placeholder for DB cleanup
  console.log('Cleaning up test user:', user.email);
}
