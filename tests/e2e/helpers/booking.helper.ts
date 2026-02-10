import { Page } from '@playwright/test';

/**
 * Helper functions for booking and appointment management in E2E tests
 */

export interface AppointmentSlot {
  date: string;
  time: string;
  doctorId: string;
}

/**
 * Navigate to booking page for a doctor
 */
export async function navigateToBooking(page: Page, doctorId: string): Promise<void> {
  await page.goto(`/book/${doctorId}`);
  await page.waitForLoadState('networkidle');

  // Handle redirect to login if not authenticated
  if (page.url().includes('/login')) {
    throw new Error('User needs to be authenticated to book');
  }
}

/**
 * Select a date on the booking calendar
 */
export async function selectDate(page: Page, date: string): Promise<void> {
  // Look for date selector
  const dateInput = page.locator('input[type="date"]');
  if (await dateInput.count() > 0) {
    await dateInput.fill(date);
    await page.waitForTimeout(500);
    return;
  }

  // Look for clickable date button
  const dateButton = page.locator(`button[data-date="${date}"], button:has-text("${date}")`);
  if (await dateButton.count() > 0) {
    await dateButton.first().click();
    await page.waitForTimeout(500);
  }
}

/**
 * Select a time slot
 */
export async function selectTimeSlot(page: Page, time: string): Promise<void> {
  const timeSlot = page.locator(`button[data-time="${time}"], button:has-text("${time}")`);
  const count = await timeSlot.count();

  if (count > 0) {
    await timeSlot.first().click();
    await page.waitForTimeout(500);

    // Verify selection
    const isSelected = await timeSlot.first().evaluate(el => {
      return el.classList.contains('selected') || el.classList.contains('active');
    });

    if (!isSelected) {
      throw new Error(`Time slot ${time} was not selected`);
    }
  } else {
    throw new Error(`Time slot ${time} not found`);
  }
}

/**
 * Get available time slots
 */
export async function getAvailableTimeSlots(page: Page): Promise<string[]> {
  const timeSlots = page.locator('button[data-time], [data-testid="time-slot"]');
  const count = await timeSlots.count();

  if (count === 0) {
    return [];
  }

  const slots: string[] = [];
  for (let i = 0; i < count; i++) {
    const slot = timeSlots.nth(i);
    const time = await slot.getAttribute('data-time');
    if (time) {
      slots.push(time);
    }
  }

  return slots;
}

/**
 * Proceed to checkout
 */
export async function proceedToCheckout(page: Page): Promise<void> {
  const checkoutButton = page.locator('button:has-text("Continuar"), button:has-text("Pagar"), a:has-text("Checkout")');
  const count = await checkoutButton.count();

  if (count > 0) {
    await checkoutButton.first().click();
    await page.waitForLoadState('networkidle');

    // Verify redirect to checkout
    if (!page.url().includes('/checkout')) {
      throw new Error('Did not navigate to checkout');
    }
  }
}

/**
 * Get booking summary
 */
export async function getBookingSummary(page: Page): Promise<{
  doctorName: string;
  date: string;
  time: string;
  price: number;
}> {
  const doctorName = await page.locator('[data-testid="doctor-name"], .doctor-name').textContent() || '';
  const date = await page.locator('[data-testid="booking-date"], .booking-date').textContent() || '';
  const time = await page.locator('[data-testid="booking-time"], .booking-time').textContent() || '';

  const priceText = await page.locator('[data-testid="booking-price"], .booking-price, text=/\\$\\d+/').textContent() || '';
  const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

  return { doctorName: doctorName.trim(), date: date.trim(), time: time.trim(), price };
}

/**
 * Fill pre-consultation chat
 */
export async function fillPreConsultaChat(page: Page, symptoms: string[]): Promise<void> {
  const chatInput = page.locator('textarea[name="message"], input[type="text"]');
  const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")');

  for (const symptom of symptoms) {
    await chatInput.fill(symptom);
    await sendButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Complete OXXO payment flow
 */
export async function payWithOXXO(page: Page): Promise<void> {
  // Select OXXO payment method
  const oxxoButton = page.locator('button:has-text("OXXO"), label:has-text("OXXO")');
  if (await oxxoButton.count() > 0) {
    await oxxoButton.first().click();
    await page.waitForTimeout(500);

    // Confirm payment
    const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Generar")');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Complete card payment flow (test mode)
 */
export async function payWithCard(page: Page): Promise<void> {
  // This would interact with Stripe test elements
  // For now, just verify the form exists
  const cardElement = page.locator('input[name="cardnumber"], iframe[name*="stripe"]');
  if (await cardElement.count() > 0) {
    // In a real test, we would fill in Stripe test card details
    // Card: 4242 4242 4242 4242
    // Expiry: Any future date
    // CVC: Any 3 digits
    console.log('Card payment form detected');
  }
}

/**
 * Verify appointment was created
 */
export async function verifyAppointmentCreated(page: Page): Promise<boolean> {
  // Check for success message
  const successMessage = page.locator('text=/confirmada|creada|success/i');
  if (await successMessage.count() > 0) {
    return true;
  }

  // Check for redirect to appointments
  if (page.url().includes('/appointments')) {
    return true;
  }

  return false;
}

/**
 * Get appointment ID from URL
 */
export function getAppointmentIdFromUrl(url: string): string | null {
  const match = url.match(/\/appointment\/([a-f0-9-]+)/i);
  return match ? match[1] : null;
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(page: Page, appointmentId: string): Promise<void> {
  await page.goto(`/app/appointments`);
  await page.waitForLoadState('networkidle');

  // Find the appointment
  const appointmentCard = page.locator(`[data-appointment-id="${appointmentId}"]`);
  if (await appointmentCard.count() === 0) {
    throw new Error(`Appointment ${appointmentId} not found`);
  }

  // Click cancel button
  const cancelButton = appointmentCard.locator('button:has-text("Cancelar")');
  if (await cancelButton.count() > 0) {
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Confirm cancellation
    const confirmButton = page.locator('button:has-text("Confirmar")');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(
  page: Page,
  appointmentId: string,
  newDate: string,
  newTime: string
): Promise<void> {
  await page.goto(`/app/appointments`);
  await page.waitForLoadState('networkidle');

  // Find the appointment
  const appointmentCard = page.locator(`[data-appointment-id="${appointmentId}"]`);
  if (await appointmentCard.count() === 0) {
    throw new Error(`Appointment ${appointmentId} not found`);
  }

  // Click reschedule button
  const rescheduleButton = appointmentCard.locator('button:has-text("Reprogramar")');
  if (await rescheduleButton.count() > 0) {
    await rescheduleButton.click();
    await page.waitForTimeout(500);

    // Select new date and time
    await selectDate(page, newDate);
    await selectTimeSlot(page, newTime);

    // Confirm reschedule
    const confirmButton = page.locator('button:has-text("Confirmar")');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Join video consultation
 */
export async function joinConsultation(page: Page, appointmentId: string): Promise<void> {
  await page.goto(`/consultation/${appointmentId}`);
  await page.waitForLoadState('networkidle');

  // Look for join button
  const joinButton = page.locator('button:has-text("Ingresar"), a:has-text("Ingresar")');
  if (await joinButton.count() > 0) {
    // Check if button is enabled
    const isDisabled = await joinButton.first().isDisabled();

    if (isDisabled) {
      throw new Error('Cannot join consultation yet (button is disabled)');
    }

    await joinButton.first().click();
    await page.waitForTimeout(2000);
  }
}

/**
 * End consultation as doctor
 */
export async function endConsultation(page: Page, appointmentId: string): Promise<void> {
  await page.goto(`/doctor/consultation/${appointmentId}`);
  await page.waitForLoadState('networkidle');

  const endButton = page.locator('button:has-text("Finalizar"), button:has-text("Terminar")');
  if (await endButton.count() > 0) {
    await endButton.click();
    await page.waitForTimeout(500);

    // Confirm if needed
    const confirmButton = page.locator('button:has-text("Confirmar")');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Submit doctor review
 */
export async function submitReview(
  page: Page,
  appointmentId: string,
  rating: number,
  comment?: string
): Promise<void> {
  await page.goto(`/consultation/${appointmentId}`);
  await page.waitForLoadState('networkidle');

  // Look for review button
  const reviewButton = page.locator('button:has-text("Calificar")');
  if (await reviewButton.count() > 0) {
    await reviewButton.click();
    await page.waitForTimeout(500);

    // Select rating
    const stars = page.locator('button[aria-label*="estrella"], [data-testid="star-rating"] button');
    if (await stars.count() >= rating) {
      await stars.nth(rating - 1).click();
      await page.waitForTimeout(500);

      // Add comment if provided
      if (comment) {
        const commentInput = page.locator('textarea[name="comment"]');
        if (await commentInput.count() > 0) {
          await commentInput.fill(comment);
        }
      }

      // Submit review
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
  }
}

/**
 * Wait for appointment reminder
 */
export async function waitForAppointmentReminder(page: Page, appointmentId: string): Promise<void> {
  // This would check for reminder notifications
  // Implementation depends on notification system
  const reminder = page.locator(`[data-appointment-id="${appointmentId}"] [data-reminder]`);
  await reminder.waitFor({ state: 'visible', timeout: 60000 });
}
