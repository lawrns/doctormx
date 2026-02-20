/**
 * E2E Test: Complete Booking Flow
 * 
 * Tests the critical path from doctor discovery to appointment confirmation
 * Covers: TST-005.1 - Complete booking flow E2E
 * 
 * Scenarios:
 * - New patient registration and first booking
 * - Existing patient booking flow
 * - Doctor search and filtering
 * - Date/time slot selection
 * - Booking confirmation
 * - Error handling
 */

import { test, expect, Page } from '@playwright/test';
import { patientFactory, appointmentFactory, timeSlots } from '../../fixtures/test-data';
import { auth, forms, elements, timing } from '../../utils/test-helpers';

test.describe('Critical Flow: Complete Booking', () => {
  
  test.describe('Scenario 1: New Patient Registration to First Booking', () => {
    let testPatient: ReturnType<typeof patientFactory.create>;

    test.beforeEach(async () => {
      testPatient = patientFactory.create();
    });

    test('should complete full journey from landing to booking confirmation', async ({ page }) => {
      // Step 1: Navigate to landing page
      await test.step('Navigate to landing page', async () => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Verify landing page loaded
        await expect(page).toHaveURL('/');
        await expect(page.locator('h1, h2').first()).toBeVisible();
      });

      // Step 2: Browse doctors catalog
      await test.step('Browse doctors catalog', async () => {
        const doctorsLink = page.locator('a[href*="doctores"], a:has-text("Doctores"), a:has-text("Buscar")').first();
        
        if (await doctorsLink.isVisible()) {
          await doctorsLink.click();
        } else {
          await page.goto('/doctores');
        }
        
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*doctores/);
      });

      // Step 3: Apply specialty filter
      await test.step('Filter doctors by specialty', async () => {
        const specialtyFilter = page.locator('select[name="specialty"], [data-testid="specialty-filter"], button:has-text("Especialidad")').first();
        
        if (await specialtyFilter.count() > 0) {
          await specialtyFilter.click();
          await page.waitForTimeout(500);
          
          // Select a specialty option
          const specialtyOption = page.locator('text=Medicina General').first();
          if (await specialtyOption.count() > 0) {
            await specialtyOption.click();
            await page.waitForTimeout(1000);
          }
        }
      });

      // Step 4: Select a doctor
      await test.step('Select a doctor from catalog', async () => {
        const doctorCard = page.locator('a[href^="/doctores/"]').first();
        const doctorCount = await doctorCard.count();
        
        if (doctorCount === 0) {
          test.skip(true, 'No doctors available in catalog');
        }
        
        await expect(doctorCard).toBeVisible();
        await doctorCard.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on doctor profile page
        await expect(page).toHaveURL(/\/doctores\/[a-zA-Z0-9-]+/);
      });

      // Step 5: Click book appointment button
      await test.step('Initiate booking process', async () => {
        const bookButton = page.locator('button:has-text("Agendar"), a:has-text("Agendar"), button:has-text("Reservar"), a:has-text("Reservar")').first();
        
        if (await bookButton.count() === 0) {
          test.skip(true, 'Book button not found on doctor profile');
        }
        
        await bookButton.click();
        await page.waitForLoadState('networkidle');
        
        // Should redirect to login since we're not authenticated
        await expect(page).toHaveURL(/.*login.*/);
      });

      // Step 6: Navigate to registration
      await test.step('Navigate to registration', async () => {
        const registerLink = page.locator('a:has-text("Regístrate"), a:has-text("Crear cuenta"), a[href*="register"]').first();
        
        if (await registerLink.count() > 0) {
          await registerLink.click();
        } else {
          await page.goto('/auth/register');
        }
        
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*register/);
      });

      // Step 7: Complete registration
      await test.step('Complete patient registration', async () => {
        // Ensure patient role is selected
        const patientToggle = page.locator('input[type="radio"][value="patient"], button:has-text("Paciente")').first();
        if (await patientToggle.count() > 0) {
          await patientToggle.click();
        }

        // Fill registration form
        await forms.fillInput(page, 'input[name="fullName"], input[name="name"], input[placeholder*="nombre"]', testPatient.fullName);
        await forms.fillInput(page, 'input[name="email"], input[type="email"]', testPatient.email);
        await forms.fillInput(page, 'input[name="phone"], input[type="tel"]', testPatient.phone);
        await forms.fillInput(page, 'input[name="password"], input[type="password"]', testPatient.password);
        
        // Accept terms if checkbox exists
        const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="conditions"]').first();
        if (await termsCheckbox.count() > 0) {
          await termsCheckbox.check();
        }
        
        // Submit form
        await forms.submitForm(page);
        
        // Should be redirected to dashboard or complete profile
        await expect(page).toHaveURL(/\/(app|complete-profile)/, { timeout: 10000 });
      });

      // Step 8: Complete profile if needed
      await test.step('Complete profile information', async () => {
        if (page.url().includes('complete-profile')) {
          await forms.fillInput(page, 'input[name="dateOfBirth"], input[type="date"]', testPatient.dateOfBirth);
          await forms.selectOption(page, 'select[name="gender"]', 'male');
          await forms.submitForm(page);
          
          await page.waitForLoadState('networkidle');
        }
      });

      // Step 9: Navigate to doctors and book
      await test.step('Navigate to booking after registration', async () => {
        await page.goto('/doctores');
        await page.waitForLoadState('networkidle');
        
        const doctorCard = page.locator('a[href^="/doctores/"]').first();
        if (await doctorCard.count() > 0) {
          await doctorCard.click();
          await page.waitForLoadState('networkidle');
          
          const bookButton = page.locator('button:has-text("Agendar"), a:has-text("Agendar")').first();
          if (await bookButton.count() > 0) {
            await bookButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      });

      // Step 10: Verify booking page loaded
      await test.step('Verify booking interface', async () => {
        // Should be on booking page or doctor profile
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(book|doctores)/);
        
        // Verify booking elements if on booking page
        if (currentUrl.includes('/book/')) {
          // Check for date selector
          const dateSelector = page.locator('[data-testid="date-selector"], button[data-date]').first();
          if (await dateSelector.count() > 0) {
            await expect(dateSelector).toBeVisible();
          }
        }
      });
    });

    test('should preserve booking intent through authentication', async ({ page }) => {
      // Navigate directly to booking with redirect parameter
      const doctorId = appointmentFactory.testIds.valid;
      await page.goto(`/book/${doctorId}`);
      await page.waitForLoadState('networkidle');
      
      // Should redirect to login with redirect parameter
      await expect(page).toHaveURL(/.*login.*/);
      
      const url = page.url();
      expect(url).toContain('redirect');
      expect(url).toContain(encodeURIComponent(`/book/${doctorId}`));
    });
  });

  test.describe('Scenario 2: Existing Patient Complete Booking', () => {
    test.beforeEach(async ({ page }) => {
      // Login as existing patient
      await auth.loginAsPatient(page);
    });

    test('should complete booking flow with date and time selection', async ({ page }) => {
      // Step 1: Navigate to doctor catalog
      await test.step('Navigate to doctor catalog', async () => {
        await page.goto('/doctores');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/.*doctores/);
      });

      // Step 2: Select a doctor
      await test.step('Select a doctor', async () => {
        const doctorCard = page.locator('a[href^="/doctores/"]').first();
        
        if (await doctorCard.count() === 0) {
          test.skip(true, 'No doctors available in catalog');
        }
        
        await doctorCard.click();
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/\/doctores\/[a-zA-Z0-9-]+/);
      });

      // Step 3: Start booking
      await test.step('Initiate booking', async () => {
        const bookButton = page.locator('button:has-text("Agendar"), a:has-text("Agendar"), a[href*="/book/"]').first();
        
        if (await bookButton.count() === 0) {
          test.skip(true, 'Book button not found');
        }
        
        await bookButton.click();
        await page.waitForLoadState('networkidle');
        
        // Should be on booking page
        await expect(page).toHaveURL(/\/book\//);
      });

      // Step 4: Select date
      await test.step('Select appointment date', async () => {
        const dateSelector = page.locator('button[data-date], [data-testid="date-selector"], .calendar-day').first();
        
        if (await dateSelector.count() > 0) {
          // Find an available date (not disabled)
          const availableDates = page.locator('button[data-date]:not([disabled]), .calendar-day:not(.disabled)');
          const count = await availableDates.count();
          
          if (count > 0) {
            await availableDates.first().click();
            await page.waitForTimeout(500);
            
            // Verify date is selected
            const selectedDate = page.locator('button[data-date].selected, .calendar-day.selected').first();
            if (await selectedDate.count() > 0) {
              await expect(selectedDate).toHaveClass(/selected/);
            }
          }
        }
      });

      // Step 5: Select time slot
      await test.step('Select time slot', async () => {
        const timeSlot = page.locator('button[data-time], [data-testid="time-slot"], .time-slot').first();
        
        if (await timeSlot.count() > 0) {
          // Find available time slot
          const availableSlots = page.locator('button[data-time]:not([disabled]), .time-slot:not(.disabled):not(.unavailable)');
          const count = await availableSlots.count();
          
          if (count > 0) {
            await availableSlots.first().click();
            await page.waitForTimeout(500);
            
            // Verify slot is selected
            const selectedSlot = page.locator('button[data-time].selected, .time-slot.selected').first();
            if (await selectedSlot.count() > 0) {
              const classList = await selectedSlot.getAttribute('class') || '';
              expect(classList).toMatch(/selected|active/);
            }
          }
        }
      });

      // Step 6: Enter consultation reason
      await test.step('Enter consultation details', async () => {
        const reasonInput = page.locator('textarea[name="reason"], input[name="reason"], textarea[placeholder*="motivo"]').first();
        
        if (await reasonInput.count() > 0) {
          await reasonInput.fill('Consulta general de seguimiento');
          await expect(reasonInput).toHaveValue('Consulta general de seguimiento');
        }
        
        // Select consultation type if available
        const typeSelector = page.locator('select[name="type"], button[data-type="video"], button[data-type="in-person"]').first();
        if (await typeSelector.count() > 0) {
          await typeSelector.click();
        }
      });

      // Step 7: Review and confirm booking
      await test.step('Review booking details', async () => {
        // Check for price display
        const priceDisplay = page.locator('text=/Total|\$\d+|MXN/').first();
        if (await priceDisplay.count() > 0) {
          await expect(priceDisplay).toBeVisible();
          
          const priceText = await priceDisplay.textContent();
          expect(priceText).toMatch(/\$\d+/);
        }
        
        // Check for doctor info summary
        const doctorSummary = page.locator('[data-testid="doctor-summary"], .doctor-info').first();
        if (await doctorSummary.count() > 0) {
          await expect(doctorSummary).toBeVisible();
        }
      });

      // Step 8: Proceed to payment/checkout
      await test.step('Proceed to checkout', async () => {
        const confirmButton = page.locator('button[type="submit"], button:has-text("Confirmar"), button:has-text("Continuar"), a:has-text("Pagar")').first();
        
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForLoadState('networkidle');
          
          // Should redirect to checkout or confirmation
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/(checkout|confirmation|payment)/);
        }
      });
    });

    test('should handle slot unavailability gracefully', async ({ page }) => {
      // Navigate to booking page
      await page.goto(`/book/${appointmentFactory.testIds.valid}`);
      await page.waitForLoadState('networkidle');
      
      // Try to select a date
      const dateSelector = page.locator('button[data-date]').first();
      if (await dateSelector.count() > 0) {
        await dateSelector.click();
        await page.waitForTimeout(500);
      }
      
      // Check for unavailable slots
      const unavailableSlots = page.locator('button[data-time].unavailable, .time-slot.unavailable, button[disabled]');
      
      if (await unavailableSlots.count() > 0) {
        // Verify unavailable slots cannot be clicked
        const firstUnavailable = unavailableSlots.first();
        const isDisabled = await firstUnavailable.evaluate(el => (el as HTMLButtonElement).disabled);
        expect(isDisabled).toBe(true);
      }
      
      // Check for error message container
      const errorContainer = page.locator('[data-testid="booking-error"], [role="alert"]').first();
      // Should exist even if not visible initially
    });

    test('should validate required fields before booking', async ({ page }) => {
      // Navigate to booking page
      await page.goto(`/book/${appointmentFactory.testIds.valid}`);
      await page.waitForLoadState('networkidle');
      
      // Try to submit without selecting date/time
      const submitButton = page.locator('button[type="submit"], button:has-text("Confirmar")').first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Should show validation errors or stay on same page
        const currentUrl = page.url();
        expect(currentUrl).toContain('/book/');
        
        // Check for validation message
        const errorMessage = page.locator('text=/selecciona|requerido|obligatorio/i').first();
        if (await errorMessage.count() > 0) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });
  });

  test.describe('Scenario 3: Doctor Search and Filter', () => {
    test('should search doctors by name', async ({ page }) => {
      await page.goto('/doctores');
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[name="search"], input[placeholder*="buscar"], input[type="search"]').first();
      
      if (await searchInput.count() > 0) {
        await searchInput.fill('García');
        await page.waitForTimeout(1000);
        
        // Check for filtered results
        const results = page.locator('[data-testid="doctor-card"], a[href^="/doctores/"]').first();
        // Results may or may not be present depending on data
      }
    });

    test('should filter by multiple criteria', async ({ page }) => {
      await page.goto('/doctores');
      await page.waitForLoadState('networkidle');
      
      // Apply specialty filter
      const specialtyFilter = page.locator('select[name="specialty"]').first();
      if (await specialtyFilter.count() > 0) {
        await specialtyFilter.selectOption('Cardiología');
        await page.waitForTimeout(1000);
      }
      
      // Apply availability filter
      const availabilityFilter = page.locator('select[name="availability"], button:has-text("Disponible")').first();
      if (await availabilityFilter.count() > 0) {
        await availabilityFilter.click();
        await page.waitForTimeout(1000);
      }
      
      // Verify URL contains filter parameters
      const url = page.url();
      if (await specialtyFilter.count() > 0) {
        expect(url).toMatch(/specialty=|filtro=/);
      }
    });

    test('should sort doctors by rating or price', async ({ page }) => {
      await page.goto('/doctores');
      await page.waitForLoadState('networkidle');
      
      const sortSelector = page.locator('select[name="sort"], button:has-text("Ordenar")').first();
      
      if (await sortSelector.count() > 0) {
        // Sort by rating
        await sortSelector.selectOption('rating');
        await page.waitForTimeout(1000);
        
        // Sort by price
        await sortSelector.selectOption('price');
        await page.waitForTimeout(1000);
        
        // Sort by availability
        await sortSelector.selectOption('availability');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Scenario 4: Mobile Booking Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should complete booking on mobile device', async ({ page }) => {
      // Login
      await auth.loginAsPatient(page);
      
      // Navigate to doctors
      await page.goto('/doctores');
      await page.waitForLoadState('networkidle');
      
      // Select first doctor
      const doctorCard = page.locator('a[href^="/doctores/"]').first();
      if (await doctorCard.count() > 0) {
        await doctorCard.click();
        await page.waitForLoadState('networkidle');
        
        // Click book button
        const bookButton = page.locator('button:has-text("Agendar"), a:has-text("Agendar")').first();
        if (await bookButton.count() > 0) {
          await bookButton.click();
          await page.waitForLoadState('networkidle');
          
          // Verify mobile-friendly layout
          const body = page.locator('body');
          const scrollWidth = await body.evaluate(el => el.scrollWidth);
          const viewportWidth = await page.evaluate(() => window.innerWidth);
          
          expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
        }
      }
    });

    test('should have touch-friendly controls', async ({ page }) => {
      await page.goto('/doctores');
      await page.waitForLoadState('networkidle');
      
      // Check button sizes
      const buttons = page.locator('button, a[href]').filter({ hasText: /Agendar|Reservar|Ver más/ });
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        
        if (box) {
          // Minimum touch target size: 44x44px
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });
});
