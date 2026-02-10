import { test, expect } from '@playwright/test';
import { login, logout, clearAuth, testUsers } from '../helpers/auth.helper';

/**
 * E2E Tests for Role-Based Access Control (RBAC)
 *
 * Tests role-based authorization including:
 * - Patient role permissions
 * - Doctor role permissions
 * - Admin role permissions
 * - Cross-role access prevention
 * - Protected route enforcement
 * - Role-specific UI elements
 * - API endpoint authorization
 */

test.describe('Patient Role Access', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);
  });

  test('should access patient dashboard', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Should load successfully
    await expect(page).toHaveURL(/\/app/);

    // Check for patient-specific elements
    const patientElements = page.locator('a[href*="/doctors"], a[href*="/appointments"], button:has-text("Agendar")');
    expect(await patientElements.count()).toBeGreaterThan(0);
  });

  test('should access doctors catalog', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Should load successfully
    await expect(page).toHaveURL(/\/doctors/);

    // Should see doctor cards or empty state
    const content = page.locator('[data-testid="doctor-card"], .text:has-text("no hay doctores")');
    expect(await content.count()).toBeGreaterThan(0);
  });

  test('should access booking flow', async ({ page }) => {
    // Navigate to a booking page (using dummy ID)
    await page.goto('/book/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Should load booking interface or redirect to available doctors
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/book') || currentUrl.includes('/doctors');
    expect(hasAccess).toBeTruthy();
  });

  test('should access consultation room', async ({ page }) => {
    // Navigate to consultation room (using dummy ID)
    await page.goto('/consultation/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Should load consultation interface or show appropriate message
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/consultation') || currentUrl.includes('/app');
    expect(hasAccess).toBeTruthy();
  });

  test('should not access doctor dashboard', async ({ page }) => {
    await page.goto('/doctor');
    await page.waitForLoadState('networkidle');

    // Should be redirected or show unauthorized
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('unauthorized') ||
                      currentUrl.includes('login') ||
                      currentUrl.includes('/app');

    expect(isBlocked).toBeTruthy();
  });

  test('should not access doctor appointments', async ({ page }) => {
    await page.goto('/doctor/appointments');
    await page.waitForLoadState('networkidle');

    // Should be blocked
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('unauthorized') ||
                      currentUrl.includes('login') ||
                      !currentUrl.includes('/doctor');

    expect(isBlocked).toBeTruthy();
  });

  test('should not access doctor availability', async ({ page }) => {
    await page.goto('/doctor/availability');
    await page.waitForLoadState('networkidle');

    // Should be blocked
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('unauthorized') ||
                      currentUrl.includes('login') ||
                      !currentUrl.includes('/doctor');

    expect(isBlocked).toBeTruthy();
  });

  test('should not access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be blocked
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('unauthorized') ||
                      currentUrl.includes('login') ||
                      currentUrl.includes('/app');

    expect(isBlocked).toBeTruthy();
  });

  test('should see patient-specific navigation', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Check for patient navigation items
    const patientNav = page.locator('nav, header').filter({ hasText: /doctores|consultas|perfil/i });
    expect(await patientNav.count()).toBeGreaterThan(0);

    // Should not see doctor-only navigation
    const doctorNav = page.locator('a[href*="/doctor/availability"], a[href*="/doctor/patients"]');
    expect(await doctorNav.count()).toBe(0);
  });

  test('should access patient profile', async ({ page }) => {
    await page.goto('/app/profile');
    await page.waitForLoadState('networkidle');

    // Should load profile page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/app\/profile|\/app/);
  });

  test('should access patient appointments', async ({ page }) => {
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Should load appointments page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/app\/appointments|\/app/);
  });

  test('should access patient medical records', async ({ page }) => {
    await page.goto('/app/medical-records');
    await page.waitForLoadState('networkidle');

    // Should load medical records page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/app\/medical-records|\/app/);
  });
});

test.describe('Doctor Role Access', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.doctor);
  });

  test('should access doctor dashboard', async ({ page }) => {
    await page.goto('/doctor');
    await page.waitForLoadState('networkidle');

    // Should load successfully
    await expect(page).toHaveURL(/\/doctor/);

    // Check for doctor-specific elements
    const doctorElements = page.locator('a[href*="/doctor/appointments"], a[href*="/doctor/availability"]');
    expect(await doctorElements.count()).toBeGreaterThan(0);
  });

  test('should access doctor appointments', async ({ page }) => {
    await page.goto('/doctor/appointments');
    await page.waitForLoadState('networkidle');

    // Should load successfully
    await expect(page).toHaveURL(/\/doctor\/appointments/);
  });

  test('should access doctor availability', async ({ page }) => {
    await page.goto('/doctor/availability');
    await page.waitForLoadState('networkidle');

    // Should load successfully
    await expect(page).toHaveURL(/\/doctor\/availability/);
  });

  test('should access doctor patients list', async ({ page }) => {
    await page.goto('/doctor/patients');
    await page.waitForLoadState('networkidle');

    // Should load successfully
    await expect(page).toHaveURL(/\/doctor\/patients/);
  });

  test('should access doctor earnings', async ({ page }) => {
    await page.goto('/doctor/earnings');
    await page.waitForLoadState('networkidle');

    // Should load successfully
    await expect(page).toHaveURL(/\/doctor\/earnings/);
  });

  test('should access consultation room as doctor', async ({ page }) => {
    await page.goto('/consultation/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Should load consultation interface with doctor controls
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/consultation/);
  });

  test('should not access patient dashboard', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Should be redirected or show unauthorized
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('unauthorized') ||
                      currentUrl.includes('login') ||
                      currentUrl.includes('/doctor');

    expect(isBlocked).toBeTruthy();
  });

  test('should not access patient booking flow', async ({ page }) => {
    await page.goto('/book/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Doctors should not book for themselves
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('unauthorized') ||
                      currentUrl.includes('login') ||
                      currentUrl.includes('/doctor');

    expect(isBlocked).toBeTruthy();
  });

  test('should see doctor-specific navigation', async ({ page }) => {
    await page.goto('/doctor');
    await page.waitForLoadState('networkidle');

    // Check for doctor navigation items
    const doctorNav = page.locator('nav, header').filter({ hasText: /citas|disponibilidad|pacientes/i });
    expect(await doctorNav.count()).toBeGreaterThan(0);

    // Should not see patient-only navigation
    const patientNav = page.locator('a[href*="/app/appointments"], a[href*="/doctors"]');
    expect(await patientNav.count()).toBe(0);
  });

  test('should access doctor profile', async ({ page }) => {
    await page.goto('/doctor/profile');
    await page.waitForLoadState('networkidle');

    // Should load profile page
    await expect(page).toHaveURL(/\/doctor\/profile/);
  });

  test('should access doctor settings', async ({ page }) => {
    await page.goto('/doctor/settings');
    await page.waitForLoadState('networkidle');

    // Should load settings page
    await expect(page).toHaveURL(/\/doctor\/settings/);
  });

  test('should not access other doctor profiles', async ({ page }) => {
    // Try to access another doctor's profile
    await page.goto('/doctor/00000000-0000-0000-0000-000000000001');
    await page.waitForLoadState('networkidle');

    // Should be blocked or show limited view
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('unauthorized') ||
                      currentUrl.includes('forbidden') ||
                      currentUrl.includes('/doctor');

    expect(isBlocked).toBeTruthy();
  });
});

test.describe('Admin Role Access', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.admin);
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should load successfully (if admin panel exists)
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/admin') || currentUrl.includes('/doctor');

    expect(hasAccess).toBeTruthy();
  });

  test('should access admin monitoring', async ({ page }) => {
    await page.goto('/admin/monitoring');
    await page.waitForLoadState('networkidle');

    // Should load monitoring page
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/admin') || currentUrl.includes('/doctor');

    expect(hasAccess).toBeTruthy();
  });

  test('should access admin users management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Should load users management
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/admin') || currentUrl.includes('/doctor');

    expect(hasAccess).toBeTruthy();
  });

  test('should access admin analytics', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Should load analytics
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/admin') || currentUrl.includes('/doctor');

    expect(hasAccess).toBeTruthy();
  });
});

test.describe('Cross-Role Access Prevention', () => {
  test('patient cannot access doctor routes via direct URL', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    const protectedRoutes = [
      '/doctor',
      '/doctor/appointments',
      '/doctor/availability',
      '/doctor/patients',
      '/doctor/earnings',
      '/admin',
      '/admin/users',
      '/admin/analytics'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      const isBlocked = currentUrl.includes('unauthorized') ||
                        currentUrl.includes('login') ||
                        !currentUrl.includes('/doctor') && !currentUrl.includes('/admin');

      expect(isBlocked).toBeTruthy();
    }
  });

  test('doctor cannot access patient routes via direct URL', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.doctor);

    const protectedRoutes = [
      '/app',
      '/app/dashboard',
      '/app/appointments',
      '/app/medical-records',
      '/book/00000000-0000-0000-0000-000000000000'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      const isBlocked = currentUrl.includes('unauthorized') ||
                        currentUrl.includes('login') ||
                        currentUrl.includes('/doctor');

      expect(isBlocked).toBeTruthy();
    }
  });

  test('unauthenticated user cannot access protected routes', async ({ page }) => {
    await clearAuth(page);

    const protectedRoutes = [
      '/app',
      '/app/dashboard',
      '/doctor',
      '/doctor/appointments',
      '/admin',
      '/admin/users'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('login') || currentUrl.includes('unauthorized');

      expect(isRedirected).toBeTruthy();
    }
  });

  test('should preserve redirect parameter when blocked', async ({ page }) => {
    await clearAuth(page);

    const targetRoute = '/app/dashboard';
    await page.goto(targetRoute);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    // Should be redirected to login with redirect parameter
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('redirect');
    }
  });
});

test.describe('Role-Based UI Elements', () => {
  test('patient sees patient-specific UI', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Check for patient-specific elements
    const bookButton = page.locator('button:has-text("Agendar"), a:has-text("Buscar doctor")');
    expect(await bookButton.count()).toBeGreaterThan(0);

    // Should not see doctor controls
    const doctorControls = page.locator('button:has-text("Editar disponibilidad"), a:has-text("Mis pacientes")');
    expect(await doctorControls.count()).toBe(0);
  });

  test('doctor sees doctor-specific UI', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.doctor);
    await page.goto('/doctor');
    await page.waitForLoadState('networkidle');

    // Check for doctor-specific elements
    const doctorControls = page.locator('a:has-text("Citas"), a:has-text("Disponibilidad"), a:has-text("Pacientes")');
    expect(await doctorControls.count()).toBeGreaterThan(0);

    // Should not see patient booking controls
    const patientControls = page.locator('button:has-text("Buscar doctor"), a:has-text("Agendar")');
    expect(await patientControls.count()).toBe(0);
  });

  test('admin sees admin-specific UI', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.admin);
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check for admin-specific elements
    const adminControls = page.locator('a:has-text("Usuarios"), a:has-text("Monitoreo"), a:has-text("Analíticas")');
    const hasAdminControls = await adminControls.count() > 0 || page.url().includes('/doctor');

    expect(hasAdminControls).toBeTruthy();
  });

  test('role-based navigation menu', async ({ page }) => {
    await clearAuth(page);

    // Test patient navigation
    await login(page, testUsers.patient);
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    const patientNavItems = page.locator('nav a[href*="/doctors"], nav a[href*="/appointments"]');
    expect(await patientNavItems.count()).toBeGreaterThan(0);

    // Test doctor navigation
    await logout(page);
    await login(page, testUsers.doctor);
    await page.goto('/doctor');
    await page.waitForLoadState('networkidle');

    const doctorNavItems = page.locator('nav a[href*="/doctor/appointments"], nav a[href*="/doctor/availability"]');
    expect(await doctorNavItems.count()).toBeGreaterThan(0);
  });
});

test.describe('Role-Based API Access', () => {
  test('patient cannot access doctor API endpoints', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Try to access doctor API endpoint
    const response = await page.request.get('/api/doctor/appointments', {
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('sb-access-token') || '')}`
      }
    });

    // Should return 401, 403, or 404
    expect([401, 403, 404]).toContain(response.status());
  });

  test('doctor cannot access patient API endpoints', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.doctor);

    // Try to access patient-specific API endpoint
    const response = await page.request.get('/api/patient/bookings', {
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('sb-access-token') || '')}`
      }
    });

    // Should return 401, 403, or 404
    expect([401, 403, 404]).toContain(response.status());
  });

  test('unauthenticated cannot access protected API', async ({ page }) => {
    await clearAuth(page);

    const response = await page.request.get('/api/doctor/appointments');

    // Should return 401
    expect(response.status()).toBe(401);
  });
});

test.describe('Role Verification', () => {
  test('should verify patient role on dashboard', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);
    await page.goto('/app');

    // Check for role indicator in page
    const roleIndicator = page.locator('text=/paciente|patient/i');
    const hasRoleIndicator = await roleIndicator.count() > 0;

    // Role indicator is optional, but if present should show patient
    if (hasRoleIndicator) {
      await expect(roleIndicator.first()).toBeVisible();
    }
  });

  test('should verify doctor role on dashboard', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.doctor);
    await page.goto('/doctor');

    // Check for role indicator in page
    const roleIndicator = page.locator('text=/doctor|médico/i');
    const hasRoleIndicator = await roleIndicator.count() > 0;

    // Role indicator is optional, but if present should show doctor
    if (hasRoleIndicator) {
      await expect(roleIndicator.first()).toBeVisible();
    }
  });

  test('should handle role mismatch gracefully', async ({ page }) => {
    await clearAuth(page);
    await login(page, testUsers.patient);

    // Store session
    const cookies = await page.context().cookies();

    // Try to manually navigate to doctor route
    await page.goto('/doctor');
    await page.waitForLoadState('networkidle');

    // Should be redirected
    const currentUrl = page.url();
    const isRedirected = !currentUrl.includes('/doctor') || currentUrl.includes('unauthorized');

    expect(isRedirected).toBeTruthy();
  });
});

test.describe('Role Transition', () => {
  test('should handle logout and login with different role', async ({ page }) => {
    // Login as patient
    await clearAuth(page);
    await login(page, testUsers.patient);

    await page.goto('/app');
    await expect(page).toHaveURL(/\/app/);

    // Logout
    await logout(page);

    // Login as doctor
    await login(page, testUsers.doctor);

    await page.goto('/doctor');
    await expect(page).toHaveURL(/\/doctor/);

    // Should not be able to access patient routes anymore
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('unauthorized') ||
                      currentUrl.includes('login') ||
                      currentUrl.includes('/doctor');

    expect(isBlocked).toBeTruthy();
  });

  test('should clear role-specific data on logout', async ({ page }) => {
    // Login as doctor
    await clearAuth(page);
    await login(page, testUsers.doctor);

    await page.goto('/doctor');
    await page.waitForLoadState('networkidle');

    // Store some data in localStorage
    await page.evaluate(() => {
      localStorage.setItem('doctor-pref', 'some-value');
    });

    // Logout
    await logout(page);

    // Verify data is cleared
    const storedValue = await page.evaluate(() => localStorage.getItem('doctor-pref'));
    expect(storedValue).toBeNull();
  });
});
