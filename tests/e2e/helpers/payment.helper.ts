import { Page, FrameLocator } from '@playwright/test';

/**
 * Helper functions for payment processing in E2E tests
 * Uses Stripe test mode with test card numbers
 */

/**
 * Stripe Test Card Numbers
 * @see https://stripe.com/docs/testing
 */
export const stripeTestCards = {
  // Successful payments
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  mastercardDebit: '5200828282828210',
  amex: '378282246310005',
  
  // Declined cards
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  lostCard: '4000000000009987',
  stolenCard: '4000000000009979',
  expiredCard: '4000000000000069',
  incorrectCvc: '4000000000000127',
  processingError: '4000000000000119',
  
  // Requires authentication (3D Secure)
  requires3ds: '4000002500003155',
  
  // Mexican-specific
  mexicoSuccess: '4000004840000008',
  mexicoDeclined: '4000004840000008', // Same as success but triggers decline scenario
};

/**
 * Test expiry date (always in the future)
 */
export function getTestExpiryDate(): { month: string; year: string } {
  const now = new Date();
  const expiryYear = (now.getFullYear() + 1).toString().slice(-2);
  const expiryMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  
  return {
    month: expiryMonth,
    year: expiryYear
  };
}

/**
 * Test CVC codes
 */
export const testCvc = {
  visa: '123',
  mastercard: '123',
  amex: '1234'
};

/**
 * Test ZIP codes for different countries
 */
export const testPostalCodes = {
  mexico: '06600',
  us: '90210',
  canada: 'K1A 0B1'
};

/**
 * Fill Stripe card form in iframe
 */
export async function fillStripeCardForm(
  page: Page,
  cardNumber: string = stripeTestCards.visa,
  cvc: string = testCvc.visa,
  postalCode: string = testPostalCodes.mexico
): Promise<void> {
  // Wait for Stripe iframe to load
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
  
  // Wait for card number input
  const cardNumberInput = stripeFrame.locator('input[name="cardnumber"], input[data-elements-stable-field-name="cardNumber"]');
  await cardNumberInput.waitFor({ state: 'visible', timeout: 10000 });
  
  // Fill card number
  await cardNumberInput.fill(cardNumber);
  
  // Fill expiry date
  const expiry = getTestExpiryDate();
  const expiryInput = stripeFrame.locator('input[name="exp-date"], input[data-elements-stable-field-name="cardExpiry"]');
  await expiryInput.fill(`${expiry.month}${expiry.year}`);
  
  // Fill CVC
  const cvcInput = stripeFrame.locator('input[name="cvc"], input[data-elements-stable-field-name="cardCvc"]');
  await cvcInput.fill(cvc);
  
  // Fill postal code if present
  const postalInput = stripeFrame.locator('input[name="postal"], input[data-elements-stable-field-name="postalCode"]');
  if (await postalInput.count() > 0) {
    await postalInput.fill(postalCode);
  }
}

/**
 * Complete Stripe payment with card
 */
export async function completeStripeCardPayment(
  page: Page,
  cardNumber: string = stripeTestCards.visa
): Promise<void> {
  // Fill card form
  await fillStripeCardForm(page, cardNumber);
  
  // Click pay button
  const payButton = page.locator('button[type="submit"]').filter({ hasText: /pagar|pay/i });
  await payButton.click();
  
  // Wait for payment processing
  await page.waitForTimeout(3000);
}

/**
 * Complete OXXO payment flow
 */
export async function completeOXXOPayment(page: Page): Promise<void> {
  // Select OXXO payment method
  const oxxoButton = page.locator('button:has-text("OXXO"), label:has-text("OXXO"), [data-testid="oxxo-payment"]').first();
  await oxxoButton.click();
  
  // Wait for OXXO form
  await page.waitForTimeout(1000);
  
  // Fill customer name if required
  const nameInput = page.locator('input[name="name"], input[placeholder*="nombre"]').first();
  if (await nameInput.count() > 0) {
    await nameInput.fill('Test Patient');
  }
  
  // Fill email if required
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill('test@example.com');
  }
  
  // Generate voucher
  const generateButton = page.locator('button:has-text("Generar"), button:has-text("Confirmar")').first();
  await generateButton.click();
  
  // Wait for voucher generation
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for payment confirmation
 */
export async function waitForPaymentConfirmation(page: Page, timeout: number = 30000): Promise<void> {
  // Wait for success indicators
  const successIndicators = [
    'text=/pago exitoso|payment successful|confirmada|confirmed/i',
    '[data-testid="payment-success"]',
    '.payment-success',
    'h1:has-text("¡Gracias!")',
    'h2:has-text("¡Gracias!")'
  ];
  
  for (const indicator of successIndicators) {
    const locator = page.locator(indicator).first();
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout / successIndicators.length });
      return;
    } catch {
      continue;
    }
  }
  
  throw new Error('Payment confirmation not found');
}

/**
 * Wait for payment error
 */
export async function waitForPaymentError(page: Page, timeout: number = 10000): Promise<string> {
  const errorIndicators = [
    '[role="alert"]',
    '.payment-error',
    '[data-testid="payment-error"]',
    'text=/declinado|declined|error|fallido|failed/i'
  ];
  
  for (const indicator of errorIndicators) {
    const locator = page.locator(indicator).first();
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout / errorIndicators.length });
      return await locator.textContent() || 'Unknown error';
    } catch {
      continue;
    }
  }
  
  throw new Error('Payment error not found');
}

/**
 * Get payment summary details
 */
export async function getPaymentSummary(page: Page): Promise<{
  doctorName: string;
  date: string;
  time: string;
  amount: string;
  currency: string;
}> {
  const doctorName = await page.locator('[data-testid="doctor-name"], .doctor-name').textContent() || '';
  const date = await page.locator('[data-testid="appointment-date"], .appointment-date').textContent() || '';
  const time = await page.locator('[data-testid="appointment-time"], .appointment-time').textContent() || '';
  const amountText = await page.locator('[data-testid="total-amount"], .total-amount').textContent() || '';
  
  // Extract amount and currency
  const amountMatch = amountText.match(/[\d,]+\.?\d*/);
  const amount = amountMatch ? amountMatch[0] : '';
  const currency = amountText.includes('$') ? 'MXN' : '';
  
  return {
    doctorName: doctorName.trim(),
    date: date.trim(),
    time: time.trim(),
    amount,
    currency
  };
}

/**
 * Apply coupon code
 */
export async function applyCoupon(page: Page, couponCode: string): Promise<boolean> {
  const couponInput = page.locator('input[name="coupon"], input[placeholder*="cupón"]').first();
  
  if (await couponInput.count() === 0) {
    return false;
  }
  
  await couponInput.fill(couponCode);
  
  const applyButton = page.locator('button:has-text("Aplicar"), button:has-text("Apply")').first();
  await applyButton.click();
  
  // Wait for coupon validation
  await page.waitForTimeout(2000);
  
  // Check if applied successfully
  const successIndicator = page.locator('text=/aplicado|applied|descuento/i').first();
  return await successIndicator.count() > 0;
}

/**
 * Mock successful payment (for testing without Stripe)
 */
export async function mockSuccessfulPayment(page: Page): Promise<void> {
  await page.route('**/api/payment/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        paymentIntentId: 'pi_test_' + Date.now(),
        status: 'succeeded'
      })
    });
  });
}

/**
 * Mock failed payment (for testing without Stripe)
 */
export async function mockFailedPayment(page: Page, errorMessage: string = 'Payment declined'): Promise<void> {
  await page.route('**/api/payment/**', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: errorMessage
      })
    });
  });
}

/**
 * Verify checkout page loaded correctly
 */
export async function verifyCheckoutPage(page: Page): Promise<void> {
  // Check for checkout elements
  const checkoutElements = [
    'text=/checkout|pago|payment/i',
    '[data-testid="checkout-form"]',
    'form',
    'iframe[name^="__privateStripeFrame"]'
  ];
  
  let found = false;
  for (const element of checkoutElements) {
    const locator = page.locator(element).first();
    if (await locator.count() > 0) {
      found = true;
      break;
    }
  }
  
  if (!found) {
    throw new Error('Checkout page did not load correctly');
  }
}
