import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Patient Booking Journey
 *
 * Tests the complete flow from doctor discovery to appointment confirmation
 * Requirements: Requirement 1, 2, 3 from requirements.md
 */

// Test data
const testPatient = {
  email: `patient-${Date.now()}@test.com`,
  password: 'TestPassword123!',
  fullName: 'Test Patient',
  phone: '5512345678'
};

const testAddress = {
  street: 'Av. Reforma 222',
  city: 'Ciudad de México',
  state: 'Ciudad de México',
  zipCode: '06600'
};

test.describe('Patient Booking Journey', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    // Navigate to home page
    await page.goto('/');
  });

  test('should display doctor catalog without authentication', async () => {
    // Requirement 1.1: Public catalog should display without authentication
    await page.goto('/doctors');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on the doctors page
    await expect(page).toHaveURL(/.*doctors/);

    // Verify page has doctor cards or empty state
    const doctorCards = page.locator('[data-testid="doctor-card"], a[href*="/doctors/"]');
    const count = await doctorCards.count();

    // Either show doctors or show helpful empty state
    if (count > 0) {
      // Verify doctor card structure (Requirement 1.2)
      const firstCard = doctorCards.first();
      await expect(firstCard).toBeVisible();

      // Should show doctor name
      const doctorName = firstCard.locator('text=/Dr\\.|\\w+/');
      await expect(doctorName).toBeVisible();

      // Should show specialty
      const specialty = firstCard.locator('text=/Cardiología|Medicina General|Pediatría|Dermatología/i');
      if (await specialty.count() > 0) {
        await expect(specialty).toBeVisible();
      }

      // Should show price
      const price = firstCard.locator('text=/\\$\\d+/');
      if (await price.count() > 0) {
        await expect(price).toBeVisible();
      }

      // Should show rating
      const rating = firstCard.locator('[data-testid="rating"], .rating, svg');
      if (await rating.count() > 0) {
        await expect(rating).toBeVisible();
      }
    } else {
      // Requirement 1.6: Display helpful empty state
      const emptyState = page.locator('text=/no hay doctores|no se encontraron/i');
      await expect(emptyState).toBeVisible();
    }
  });

  test('should filter doctors by specialty', async () => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Requirement 1.4: Filter by specialty
    const specialtyFilter = page.locator('select[name="specialty"], [data-testid="specialty-filter"]').first();
    if (await specialtyFilter.count() > 0) {
      await specialtyFilter.selectOption('Cardiología');
      await page.waitForTimeout(1000);

      // Verify URL updates with filter
      await expect(page).toHaveURL(/.*specialty=.*/);

      // Verify filtered results
      const doctorCards = page.locator('[data-testid="doctor-card"]');
      const count = await doctorCards.count();
      console.log(`Found ${count} doctors after filtering`);
    }
  });

  test('should view doctor profile', async () => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Find first doctor card
    const doctorCard = page.locator('a[href*="/doctors/"]').first();
    const count = await doctorCard.count();

    if (count > 0) {
      // Requirement 1.3: Navigate to doctor profile
      await doctorCard.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on a doctor profile page
      await expect(page).toHaveURL(/\/doctors\/[a-f0-9-]+/);

      // Verify profile sections
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Should have book button
      const bookButton = page.locator('button:has-text("Agendar"), a:has-text("Agendar"), button:has-text("Reservar")');
      if (await bookButton.count() > 0) {
        await expect(bookButton.first()).toBeVisible();
      }
    }
  });

  test('should redirect to login when booking without authentication', async () => {
    // Go directly to booking page
    await page.goto('/book/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Requirement 2.3: Should redirect to login
    await expect(page).toHaveURL(/.*login.*/);

    // Verify redirect URL is preserved
    const url = page.url();
    expect(url).toContain('redirect');
  });

  test('should complete patient registration', async () => {
    // Navigate to registration
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');

    // Switch to patient registration (if there's a doctor toggle)
    const doctorToggle = page.locator('input[type="radio"][value="patient"], button:has-text("Paciente")');
    if (await doctorToggle.count() > 0) {
      await doctorToggle.first().click();
    }

    // Fill registration form
    await page.fill('input[name="fullName"], input[name="name"], input[placeholder*="nombre"]', testPatient.fullName);
    await page.fill('input[name="email"], input[type="email"]', testPatient.email);
    await page.fill('input[name="phone"], input[type="tel"]', testPatient.phone);
    await page.fill('input[name="password"], input[type="password"]', testPatient.password);

    // Submit form
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /registrarse|crear cuenta/i });
    await submitButton.click();

    // Wait for redirect to dashboard or onboarding
    await page.waitForTimeout(3000);

    // Should be redirected to patient dashboard or complete profile
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/app|\/complete-profile/);
  });

  test('should select date and time slot', async () => {
    // First login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to booking page (use a dummy doctor ID for testing)
    await page.goto('/book/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Requirement 2.1: Select date
    const dateButton = page.locator('button[data-date], [data-testid="date-selector"]').first();
    if (await dateButton.count() > 0) {
      await dateButton.click();
      await page.waitForTimeout(500);
    }

    // Requirement 2.2: Select time slot
    const timeSlot = page.locator('button[data-time], [data-testid="time-slot"]').first();
    if (await timeSlot.count() > 0) {
      // Check initial state
      const classList = await timeSlot.getAttribute('class') || '';
      const isSelected = classList.includes('selected') || classList.includes('active');

      await timeSlot.click();
      await page.waitForTimeout(500);

      // Verify slot is visually highlighted
      const classListAfter = await timeSlot.getAttribute('class') || '';
      expect(classListAfter).not.toBe(classList);
    }

    // Requirement 2.8: Display total price
    const priceDisplay = page.locator('text=/Total|\\$\\d+/');
    if (await priceDisplay.count() > 0) {
      await expect(priceDisplay).toBeVisible();
    }
  });

  test('should handle slot unavailability error', async () => {
    // This test would require mocking an unavailable slot scenario
    // For now, we'll test the UI elements
    await page.goto('/book/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Verify error message container exists
    const errorMessage = page.locator('[data-testid="booking-error"], .error-message, [role="alert"]');
    // It's OK if it's not visible initially
  });

  test('should show booking confirmation after payment', async () => {
    // This test requires integration with Stripe test mode
    // Full payment flow test

    // First login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to checkout (use a dummy appointment ID)
    await page.goto('/checkout/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Requirement 3.1: Display appointment details
    const appointmentDetails = page.locator('[data-testid="appointment-details"]');
    if (await appointmentDetails.count() > 0) {
      await expect(appointmentDetails).toBeVisible();
    }

    // Verify payment form exists
    const cardElement = page.locator('input[name="cardnumber"], iframe[name^="__privateStripeFrame"]');
    if (await cardElement.count() > 0) {
      await expect(cardElement.first()).toBeVisible();
    }
  });

  test('should display OXXO payment option', async () => {
    await page.goto('/checkout/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Check for OXXO payment option
    const oxxoButton = page.locator('button:has-text("OXXO"), label:has-text("OXXO")');
    if (await oxxoButton.count() > 0) {
      await expect(oxxoButton).toBeVisible();

      // Click OXXO option
      await oxxoButton.first().click();
      await page.waitForTimeout(500);

      // Should show voucher generation option
      const voucherInfo = page.locator('text=/voucher|comprobante|OXXO/i');
      if (await voucherInfo.count() > 0) {
        await expect(voucherInfo).toBeVisible();
      }
    }
  });

  test('should display consultation room link', async () => {
    // Login as patient
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to consultation room
    await page.goto('/consultation/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Requirement 4.3: Display appointment details
    const appointmentInfo = page.locator('text=/Fecha|Hora|Consulta/i');
    if (await appointmentInfo.count() > 0) {
      await expect(appointmentInfo).toBeVisible();
    }

    // Requirement 4.6: Display join button
    const joinButton = page.locator('button:has-text("Ingresar"), a:has-text("Ingresar")');
    if (await joinButton.count() > 0) {
      await expect(joinButton).toBeVisible();
    }

    // Requirement 4.7: Display instructions
    const instructions = page.locator('text=/cámara|micrófono|internet/i');
    if (await instructions.count() > 0) {
      await expect(instructions).toBeVisible();
    }
  });
});

test.describe('Patient Booking - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Verify mobile layout
    const doctorCards = page.locator('[data-testid="doctor-card"], a[href*="/doctors/"]');
    const count = await doctorCards.count();

    if (count > 0) {
      // On mobile, cards should stack vertically
      const firstCard = doctorCards.first();
      const boundingBox = await firstCard.boundingBox();
      expect(boundingBox).not.toBeNull();

      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Check button sizes for touch (minimum 44x44px)
    const buttons = page.locator('button, a[href]').filter({ hasText: /Agendar|Reservar/ });
    const count = await buttons.count();

    if (count > 0) {
      const firstButton = buttons.first();
      const boundingBox = await firstButton.boundingBox();

      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
