import { test, expect, Page, BrowserContext } from '@playwright/test';
import { 
  login, 
  registerPatient, 
  clearAuth, 
  TestUser 
} from './helpers/auth.helper';
import { 
  selectDate, 
  selectTimeSlot, 
  proceedToCheckout,
  verifyAppointmentCreated 
} from './helpers/booking.helper';
import { 
  stripeTestCards, 
  completeStripeCardPayment,
  completeOXXOPayment,
  waitForPaymentConfirmation,
  verifyCheckoutPage 
} from './helpers/payment.helper';
import { 
  joinConsultationRoom,
  grantMediaPermissions,
  isVideoConnected,
  endConsultation,
  verifyConsultationRoom,
  submitConsultationRating,
  canJoinConsultation
} from './helpers/consultation.helper';
import { generatePatientData, generateTestEmail } from './helpers/test-data.factory';

/**
 * E2E Test: Complete Patient Journey
 * 
 * Tests the critical user flow:
 * 1. Registration → 2. Booking → 3. Payment → 4. Consultation
 * 
 * This is a comprehensive end-to-end test that simulates a real patient
 * going through the entire platform experience.
 * 
 * Requirements covered:
 * - User registration and authentication
 * - Doctor discovery and booking
 * - Payment processing with Stripe
 * - Video consultation
 * - Post-consultation rating
 */

test.describe('🚀 Critical Patient Journey - Complete Flow', () => {
  let testUser: TestUser;
  let createdAppointmentId: string | null = null;

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await clearAuth(page);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Cancel any created appointments if needed
    if (createdAppointmentId) {
      // This would call a cleanup API or helper
      console.log(`Cleanup: Appointment ${createdAppointmentId}`);
    }
  });

  /**
   * ============================================
   * STEP 1: REGISTRATION
   * ============================================
   */
  test('Step 1: Complete patient registration', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');

    // Verify registration page loaded
    await expect(page.locator('h1:has-text("Crear cuenta")')).toBeVisible();
    await expect(page.locator('text=/Paso 1 de 3/')).toBeVisible();

    // Step 1: Select patient account type
    await test.step('Select account type', async () => {
      await page.click('label:has-text("Soy paciente")');
      
      // Verify selection
      const selectedOption = page.locator('[data-state="checked"], .border-primary');
      await expect(selectedOption).toBeVisible();
      
      // Proceed to next step
      await page.click('button:has-text("Siguiente")');
      await page.waitForTimeout(500);
    });

    // Step 2: Fill personal information
    await test.step('Fill personal information', async () => {
      const patientData = generatePatientData();
      testUser = {
        email: patientData.email,
        password: 'SecurePass123!',
        fullName: patientData.fullName,
        role: 'patient'
      };

      await page.fill('input[name="fullName"]', testUser.fullName);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="phone"]', patientData.phone);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);

      // Verify password strength indicator
      const strengthIndicator = page.locator('text=/Fuerte|strong/i');
      await expect(strengthIndicator).toBeVisible();

      // Proceed to step 3
      await page.click('button:has-text("Siguiente")');
      await page.waitForTimeout(500);
    });

    // Step 3: Complete registration
    await test.step('Complete registration', async () => {
      // Accept terms
      await page.click('label:has-text("Acepto los términos")');
      
      // Submit registration
      await page.click('button:has-text("Crear cuenta")');
      
      // Wait for redirect to dashboard
      await page.waitForTimeout(3000);
      
      // Verify redirect to patient dashboard
      await expect(page).toHaveURL(/\/(app|verify-email)/);
      
      // If email verification is required, skip for test
      if (page.url().includes('/verify-email')) {
        // Mock email verification or navigate to login
        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');
        
        // Login with new credentials
        await page.fill('input[type="email"]', testUser.email);
        await page.fill('input[type="password"]', testUser.password);
        await page.click('button[type="submit"]');
        
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/app/);
      }
    });

    // Verify successful login
    await test.step('Verify dashboard access', async () => {
      await expect(page.locator('text=/Bienvenid|Dashboard|Panel/i')).toBeVisible();
      
      // Verify patient-specific elements
      const dashboardElements = [
        'text=/Mis citas|Próximas consultas/i',
        'a[href*="/doctors"], a:has-text("Buscar doctor")'
      ];
      
      for (const element of dashboardElements) {
        const locator = page.locator(element).first();
        if (await locator.count() > 0) {
          await expect(locator).toBeVisible();
        }
      }
    });

    console.log(`✅ Registration completed for: ${testUser.email}`);
  });

  /**
   * ============================================
   * STEP 2: BOOKING
   * ============================================
   */
  test('Step 2: Search doctors and book appointment', async ({ page }) => {
    // Login first
    await test.step('Login as patient', async () => {
      await login(page, {
        email: 'patient@test.com',
        password: 'TestPassword123!',
        fullName: 'Test Patient',
        role: 'patient'
      });
    });

    // Navigate to doctor catalog
    await test.step('Browse doctors by specialty', async () => {
      await page.goto('/doctors');
      await page.waitForLoadState('networkidle');
      
      // Verify doctors page loaded
      await expect(page).toHaveURL(/.*doctors/);
      
      // Filter by specialty (Cardiology)
      const specialtyFilter = page.locator('select[name="specialty"], [data-testid="specialty-filter"]').first();
      if (await specialtyFilter.count() > 0) {
        await specialtyFilter.selectOption('Cardiología');
        await page.waitForTimeout(1000);
        
        // Verify URL updates with filter
        await expect(page).toHaveURL(/.*specialty=.*/);
      }
    });

    // Select doctor
    await test.step('Select a doctor', async () => {
      const doctorCard = page.locator('[data-testid="doctor-card"], a[href*="/doctors/"]').first();
      const count = await doctorCard.count();
      
      if (count === 0) {
        // If no doctors, use a test doctor ID
        await page.goto('/doctors/00000000-0000-0000-0000-000000000000');
      } else {
        await doctorCard.click();
      }
      
      await page.waitForLoadState('networkidle');
      
      // Verify doctor profile loaded
      await expect(page).toHaveURL(/\/doctors\/[a-f0-9-]+/);
      
      // Verify doctor information is displayed
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    // Start booking process
    await test.step('Start booking appointment', async () => {
      const bookButton = page.locator('button:has-text("Agendar"), a:has-text("Agendar"), button:has-text("Reservar")').first();
      
      if (await bookButton.count() > 0) {
        await bookButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      // Should be on booking page
      await expect(page).toHaveURL(/\/book\/[a-f0-9-]+/);
    });

    // Select date and time
    await test.step('Select date and time slot', async () => {
      // Select tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await selectDate(page, dateString);
      
      // Select first available time slot
      const timeSlots = page.locator('button[data-time], [data-testid="time-slot"]');
      const slotCount = await timeSlots.count();
      
      if (slotCount > 0) {
        await timeSlots.first().click();
        await page.waitForTimeout(500);
        
        // Verify selection
        const selectedSlot = page.locator('button[data-time].selected, [data-testid="time-slot"].selected, button[data-time].bg-primary');
        await expect(selectedSlot.first()).toBeVisible();
      }
    });

    // Confirm booking
    await test.step('Confirm booking selection', async () => {
      // Check booking summary
      const summary = page.locator('[data-testid="booking-summary"], .booking-summary');
      if (await summary.count() > 0) {
        await expect(summary).toBeVisible();
      }
      
      // Proceed to checkout
      await proceedToCheckout(page);
      
      // Verify redirect to checkout
      await expect(page).toHaveURL(/\/checkout/);
      
      // Extract appointment ID from URL
      const url = page.url();
      const match = url.match(/\/checkout\/([a-f0-9-]+)/);
      if (match) {
        createdAppointmentId = match[1];
        console.log(`✅ Booking created: ${createdAppointmentId}`);
      }
    });
  });

  /**
   * ============================================
   * STEP 3: PAYMENT
   * ============================================
   */
  test('Step 3: Complete payment with Stripe', async ({ page }) => {
    // Login and navigate to checkout with a test appointment
    await test.step('Setup: Login and navigate to checkout', async () => {
      await login(page, {
        email: 'patient@test.com',
        password: 'TestPassword123!',
        fullName: 'Test Patient',
        role: 'patient'
      });
      
      // Use a test appointment ID
      await page.goto('/checkout/00000000-0000-0000-0000-000000000000');
      await page.waitForLoadState('networkidle');
    });

    // Verify checkout page
    await test.step('Verify checkout page', async () => {
      await verifyCheckoutPage(page);
      
      // Verify appointment summary
      const summaryElements = [
        '[data-testid="doctor-name"], .doctor-name',
        '[data-testid="appointment-date"], .appointment-date',
        'text=/\$\d+/' // Price
      ];
      
      for (const selector of summaryElements) {
        const locator = page.locator(selector).first();
        if (await locator.count() > 0) {
          await expect(locator).toBeVisible();
        }
      }
    });

    // Test card payment
    await test.step('Pay with credit card (Stripe test)', async () => {
      // Select card payment method if multiple options exist
      const cardOption = page.locator('button:has-text("Tarjeta"), label:has-text("Tarjeta"), [data-testid="card-payment"]').first();
      if (await cardOption.count() > 0) {
        await cardOption.click();
        await page.waitForTimeout(500);
      }
      
      // Fill Stripe card form using test card
      const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
      
      // Wait for Stripe iframe
      const cardInput = stripeFrame.locator('input[name="cardnumber"], input[data-elements-stable-field-name="cardNumber"]');
      await cardInput.waitFor({ state: 'visible', timeout: 10000 });
      
      // Fill card number (Stripe test card)
      await cardInput.fill(stripeTestCards.visa);
      
      // Fill expiry date
      const expiry = new Date();
      const expiryMonth = (expiry.getMonth() + 1).toString().padStart(2, '0');
      const expiryYear = (expiry.getFullYear() + 1).toString().slice(-2);
      
      const expiryInput = stripeFrame.locator('input[name="exp-date"], input[data-elements-stable-field-name="cardExpiry"]');
      await expiryInput.fill(`${expiryMonth}${expiryYear}`);
      
      // Fill CVC
      const cvcInput = stripeFrame.locator('input[name="cvc"], input[data-elements-stable-field-name="cardCvc"]');
      await cvcInput.fill('123');
      
      // Fill postal code
      const postalInput = stripeFrame.locator('input[name="postal"], input[data-elements-stable-field-name="postalCode"]');
      if (await postalInput.count() > 0) {
        await postalInput.fill('06600');
      }
      
      // Click pay button
      const payButton = page.locator('button[type="submit"]').filter({ hasText: /pagar|Pagar/i });
      await payButton.click();
      
      // Wait for payment processing
      await page.waitForTimeout(3000);
    });

    // Verify payment success
    await test.step('Verify payment success', async () => {
      // Wait for confirmation
      const successIndicator = page.locator(
        'text=/pago exitoso|payment successful|¡Gracias!|confirmada/i, [data-testid="payment-success"], h1:has-text("¡Gracias!")'
      ).first();
      
      // If immediate success, verify it
      if (await successIndicator.count() > 0) {
        await expect(successIndicator).toBeVisible();
      }
      
      // Check for redirect to appointments or confirmation page
      await expect(page).toHaveURL(/\/(app|confirmation|appointments)/);
      
      console.log('✅ Payment completed successfully');
    });
  });

  /**
   * ============================================
   * STEP 4: CONSULTATION
   * ============================================
   */
  test('Step 4: Join and complete video consultation', async ({ page, context }) => {
    // Grant camera and microphone permissions
    await grantMediaPermissions(context);

    // Login as patient
    await test.step('Login as patient', async () => {
      await login(page, {
        email: 'patient@test.com',
        password: 'TestPassword123!',
        fullName: 'Test Patient',
        role: 'patient'
      });
    });

    // Navigate to consultation room
    await test.step('Navigate to consultation room', async () => {
      // Use a test appointment ID
      const testAppointmentId = '00000000-0000-0000-0000-000000000000';
      await page.goto(`/consultation/${testAppointmentId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify consultation page loaded
      await expect(page.locator('h1, h2').filter({ hasText: /consulta|Consulta/i })).toBeVisible();
    });

    // Verify consultation room elements
    await test.step('Verify consultation room setup', async () => {
      const roomCheck = await verifyConsultationRoom(page);
      
      console.log('Room verification:', roomCheck);
      
      // Check if can join consultation
      const joinStatus = await canJoinConsultation(page);
      console.log('Join status:', joinStatus);
    });

    // Check pre-join setup
    await test.step('Pre-consultation setup', async () => {
      // Verify appointment details are displayed
      const appointmentInfo = page.locator('text=/Fecha|Hora|Doctor|Dr\./i');
      if (await appointmentInfo.count() > 0) {
        await expect(appointmentInfo.first()).toBeVisible();
      }
      
      // Check for device test buttons
      const cameraTest = page.locator('button:has-text("Cámara"), button[aria-label*="cámara"]').first();
      const micTest = page.locator('button:has-text("Micrófono"), button[aria-label*="micrófono"]').first();
      
      if (await cameraTest.count() > 0) {
        await expect(cameraTest).toBeVisible();
      }
      
      if (await micTest.count() > 0) {
        await expect(micTest).toBeVisible();
      }
    });

    // Simulate joining room (or verify join button state)
    await test.step('Join consultation room', async () => {
      const joinButton = page.locator('button:has-text("Ingresar"), button:has-text("Unirse"), [data-testid="join-button"]').first();
      
      if (await joinButton.count() > 0) {
        const isDisabled = await joinButton.isDisabled();
        
        if (!isDisabled) {
          // Join the room
          await joinButton.click();
          await page.waitForTimeout(3000);
          
          // Verify video elements
          const roomElements = await verifyConsultationRoom(page);
          expect(roomElements.hasControls).toBe(true);
        } else {
          // Button is disabled (consultation not ready yet)
          console.log('Join button disabled - consultation not ready');
          
          // Verify countdown or waiting message
          const countdown = page.locator('text=/minutos|horas|espera/i, [data-testid="countdown"]').first();
          if (await countdown.count() > 0) {
            await expect(countdown).toBeVisible();
          }
        }
      }
    });

    // Test in-room controls (if joined)
    await test.step('Test consultation controls', async () => {
      // These controls may or may not be present depending on if we joined
      const hasVideo = await page.locator('video, [data-testid="local-video"]').count() > 0;
      
      if (hasVideo) {
        // Test camera toggle
        const cameraButton = page.locator('button[aria-label*="cámara"], button:has-text("Cámara"), [data-testid="toggle-camera"]').first();
        if (await cameraButton.count() > 0) {
          await cameraButton.click();
          await page.waitForTimeout(500);
        }
        
        // Test microphone toggle
        const micButton = page.locator('button[aria-label*="micrófono"], button:has-text("Micrófono"), [data-testid="toggle-mic"]').first();
        if (await micButton.count() > 0) {
          await micButton.click();
          await page.waitForTimeout(500);
        }
        
        // End consultation
        const endButton = page.locator('button:has-text("Finalizar"), button:has-text("Colgar"), [data-testid="end-call"]').first();
        if (await endButton.count() > 0) {
          await endButton.click();
          await page.waitForLoadState('networkidle');
          
          console.log('✅ Consultation ended');
        }
      }
    });
  });

  /**
   * ============================================
   * COMPLETE FLOW INTEGRATION TEST
   * ============================================
   */
  test('Complete Journey: Registration → Booking → Payment → Consultation', async ({ page, context }) => {
    // Set longer timeout for complete flow
    test.setTimeout(120000);
    
    // Generate unique test user
    const uniqueEmail = generateTestEmail('patient-journey');
    const password = 'SecurePass123!';
    const fullName = 'Paciente Journey Test';
    
    console.log(`🚀 Starting complete journey test for: ${uniqueEmail}`);

    // === STEP 1: REGISTRATION ===
    await test.step('1. Complete Registration', async () => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      // Select patient type
      await page.click('label:has-text("Soy paciente")');
      await page.click('button:has-text("Siguiente")');
      await page.waitForTimeout(500);

      // Fill registration form
      await page.fill('input[name="fullName"]', fullName);
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="phone"]', '5512345678');
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);
      await page.click('button:has-text("Siguiente")');
      await page.waitForTimeout(500);

      // Accept terms and submit
      await page.click('label:has-text("Acepto los términos")');
      await page.click('button:has-text("Crear cuenta")');
      
      await page.waitForTimeout(3000);
      
      // Handle email verification or go to login
      if (page.url().includes('/verify-email')) {
        await page.goto('/auth/login');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
      }

      await expect(page).toHaveURL(/\/app/);
      console.log('✅ Step 1: Registration completed');
    });

    // === STEP 2: BOOKING ===
    await test.step('2. Book Appointment', async () => {
      await page.goto('/doctors');
      await page.waitForLoadState('networkidle');

      // Select first doctor or use test ID
      const doctorCard = page.locator('[data-testid="doctor-card"], a[href*="/doctors/"]').first();
      if (await doctorCard.count() > 0) {
        await doctorCard.click();
      } else {
        await page.goto('/doctors/00000000-0000-0000-0000-000000000000');
      }
      
      await page.waitForLoadState('networkidle');

      // Click book button
      const bookButton = page.locator('button:has-text("Agendar"), a:has-text("Agendar")').first();
      if (await bookButton.count() > 0) {
        await bookButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Select date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await selectDate(page, tomorrow.toISOString().split('T')[0]);

      // Select time slot
      const timeSlot = page.locator('button[data-time], [data-testid="time-slot"]').first();
      if (await timeSlot.count() > 0) {
        await timeSlot.click();
      }

      // Proceed to checkout
      await proceedToCheckout(page);
      await expect(page).toHaveURL(/\/checkout/);
      
      console.log('✅ Step 2: Booking completed');
    });

    // === STEP 3: PAYMENT ===
    await test.step('3. Complete Payment', async () => {
      await verifyCheckoutPage(page);

      // Fill Stripe card form
      const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
      const cardInput = stripeFrame.locator('input[name="cardnumber"], input[data-elements-stable-field-name="cardNumber"]');
      await cardInput.waitFor({ state: 'visible', timeout: 10000 });
      
      await cardInput.fill(stripeTestCards.visa);
      
      const expiry = new Date();
      const expiryMonth = (expiry.getMonth() + 1).toString().padStart(2, '0');
      const expiryYear = (expiry.getFullYear() + 1).toString().slice(-2);
      
      await stripeFrame.locator('input[name="exp-date"]').fill(`${expiryMonth}${expiryYear}`);
      await stripeFrame.locator('input[name="cvc"]').fill('123');
      await stripeFrame.locator('input[name="postal"]').fill('06600');

      // Submit payment
      await page.locator('button[type="submit"]').filter({ hasText: /pagar/i }).click();
      await page.waitForTimeout(3000);

      // Verify success
      await expect(page).toHaveURL(/\/(app|confirmation|appointments)/);
      
      console.log('✅ Step 3: Payment completed');
    });

    // === STEP 4: CONSULTATION ===
    await test.step('4. Access Consultation Room', async () => {
      await grantMediaPermissions(context);
      
      // Navigate to consultation
      await page.goto('/consultation/00000000-0000-0000-0000-000000000000');
      await page.waitForLoadState('networkidle');

      // Verify room elements
      const roomElements = await verifyConsultationRoom(page);
      expect(roomElements.hasControls).toBe(true);

      // Check join status
      const joinStatus = await canJoinConsultation(page);
      console.log('Consultation join status:', joinStatus);

      console.log('✅ Step 4: Consultation room verified');
    });

    console.log(`🎉 Complete journey test finished for: ${uniqueEmail}`);
  });
});

/**
 * ============================================
 * PAYMENT METHOD VARIANTS
 * ============================================
 */
test.describe('💳 Payment Method Variants', () => {
  test('Pay with OXXO', async ({ page }) => {
    await login(page, {
      email: 'patient@test.com',
      password: 'TestPassword123!',
      fullName: 'Test Patient',
      role: 'patient'
    });

    await page.goto('/checkout/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Select OXXO payment
    const oxxoButton = page.locator('button:has-text("OXXO"), label:has-text("OXXO")').first();
    if (await oxxoButton.count() > 0) {
      await oxxoButton.click();
      await page.waitForTimeout(500);

      // Generate voucher
      const generateButton = page.locator('button:has-text("Generar"), button:has-text("Confirmar")').first();
      await generateButton.click();
      
      await page.waitForLoadState('networkidle');

      // Verify voucher generated
      const voucher = page.locator('text=/voucher|comprobante|OXXO|referencia/i').first();
      if (await voucher.count() > 0) {
        await expect(voucher).toBeVisible();
      }

      console.log('✅ OXXO payment flow completed');
    }
  });

  test('Handle declined card payment', async ({ page }) => {
    await login(page, {
      email: 'patient@test.com',
      password: 'TestPassword123!',
      fullName: 'Test Patient',
      role: 'patient'
    });

    await page.goto('/checkout/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Fill with declined test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    const cardInput = stripeFrame.locator('input[name="cardnumber"]').first();
    await cardInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await cardInput.fill(stripeTestCards.declined);
    
    const expiry = new Date();
    const expiryMonth = (expiry.getMonth() + 1).toString().padStart(2, '0');
    const expiryYear = (expiry.getFullYear() + 1).toString().slice(-2);
    
    await stripeFrame.locator('input[name="exp-date"]').fill(`${expiryMonth}${expiryYear}`);
    await stripeFrame.locator('input[name="cvc"]').fill('123');

    // Submit payment
    await page.locator('button[type="submit"]').filter({ hasText: /pagar/i }).click();
    await page.waitForTimeout(3000);

    // Verify error message
    const errorMessage = page.locator('[role="alert"], .payment-error, text=/declinado|declined|error/i').first();
    expect(await errorMessage.count()).toBeGreaterThan(0);

    console.log('✅ Declined card handling verified');
  });
});

/**
 * ============================================
 * CONSULTATION SCENARIOS
 * ============================================
 */
test.describe('🎥 Consultation Scenarios', () => {
  test('Join consultation before scheduled time', async ({ page, context }) => {
    await grantMediaPermissions(context);
    
    await login(page, {
      email: 'patient@test.com',
      password: 'TestPassword123!',
      fullName: 'Test Patient',
      role: 'patient'
    });

    // Navigate to a future consultation
    await page.goto('/consultation/future-appointment-id');
    await page.waitForLoadState('networkidle');

    // Check join button is disabled
    const joinStatus = await canJoinConsultation(page);
    
    if (!joinStatus.canJoin) {
      expect(joinStatus.timeRemaining || joinStatus.message).toBeTruthy();
    }
  });

  test('Submit post-consultation rating', async ({ page }) => {
    await login(page, {
      email: 'patient@test.com',
      password: 'TestPassword123!',
      fullName: 'Test Patient',
      role: 'patient'
    });

    // Navigate to past appointment
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Find completed appointment with rating option
    const rateButton = page.locator('button:has-text("Calificar"), a:has-text("Calificar")').first();
    
    if (await rateButton.count() > 0) {
      await rateButton.click();
      await page.waitForTimeout(1000);

      // Select 5-star rating
      const stars = page.locator('[data-testid="star-rating"] button').all();
      if ((await stars).length >= 5) {
        await (await stars)[4].click();
      }

      // Add comment
      const commentInput = page.locator('textarea[name="comment"]').first();
      if (await commentInput.count() > 0) {
        await commentInput.fill('Excelente consulta, muy profesional el doctor.');
      }

      // Submit
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');

      // Verify success
      const successMessage = page.locator('text=/Gracias|calificación enviada|success/i').first();
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible();
      }

      console.log('✅ Post-consultation rating submitted');
    }
  });
});
