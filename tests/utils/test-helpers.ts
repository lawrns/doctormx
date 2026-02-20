/**
 * Test Helpers for E2E Tests
 * 
 * Provides utility functions to simplify E2E test writing
 */

import { Page, expect, Locator } from '@playwright/test';

/**
 * Authentication Helpers
 */
export const auth = {
  /**
   * Login as a patient
   */
  async loginAsPatient(page: Page, email: string = 'patient@test.com', password: string = 'TestPassword123!') {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    // Verify we're logged in (redirected to app or dashboard)
    await expect(page).toHaveURL(/\/(app|dashboard)/);
  },

  /**
   * Login as a doctor
   */
  async loginAsDoctor(page: Page, email: string = 'doctor@test.com', password: string = 'TestPassword123!') {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    // Verify we're logged in (redirected to doctor dashboard)
    await expect(page).toHaveURL(/\/doctor/);
  },

  /**
   * Logout current user
   */
  async logout(page: Page) {
    await page.goto('/auth/logout');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on login page or home
    await expect(page).toHaveURL(/\/(auth\/login|\/)$/);
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(page: Page): Promise<boolean> {
    try {
      // Check for auth token in localStorage
      const token = await page.evaluate(() => localStorage.getItem('sb-access-token'));
      return !!token;
    } catch {
      return false;
    }
  }
};

/**
 * Navigation Helpers
 */
export const navigation = {
  /**
   * Navigate to a page and wait for it to load
   */
  async goto(page: Page, url: string) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  },

  /**
   * Click a link and wait for navigation
   */
  async clickAndWait(page: Page, locator: Locator, options: { timeout?: number } = {}) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: options.timeout }),
      locator.click()
    ]);
  },

  /**
   * Wait for URL to match pattern
   */
  async waitForUrl(page: Page, pattern: RegExp, timeout: number = 10000) {
    await expect(page).toHaveURL(pattern, { timeout });
  }
};

/**
 * Form Helpers
 */
export const forms = {
  /**
   * Fill a text input by label or placeholder
   */
  async fillInput(page: Page, selector: string, value: string) {
    const input = page.locator(selector).first();
    await input.fill(value);
    await expect(input).toHaveValue(value);
  },

  /**
   * Select an option from a dropdown
   */
  async selectOption(page: Page, selector: string, value: string) {
    const select = page.locator(selector).first();
    await select.selectOption(value);
  },

  /**
   * Check a checkbox
   */
  async checkBox(page: Page, selector: string) {
    const checkbox = page.locator(selector).first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  },

  /**
   * Submit a form
   */
  async submitForm(page: Page, selector: string = 'button[type="submit"]') {
    const submitButton = page.locator(selector).first();
    await submitButton.click();
    await page.waitForLoadState('networkidle');
  },

  /**
   * Clear all form fields
   */
  async clearForm(page: Page, formSelector: string = 'form') {
    const inputs = page.locator(`${formSelector} input, ${formSelector} textarea`);
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      
      if (type !== 'submit' && type !== 'button' && type !== 'hidden') {
        await input.fill('');
      }
    }
  }
};

/**
 * Element Helpers
 */
export const elements = {
  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator, timeout: number = 5000) {
    await expect(locator).toBeVisible({ timeout });
  },

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator, timeout: number = 5000) {
    await expect(locator).toBeHidden({ timeout });
  },

  /**
   * Check if element exists
   */
  async exists(locator: Locator): Promise<boolean> {
    return await locator.count() > 0;
  },

  /**
   * Get text content of element
   */
  async getText(locator: Locator): Promise<string | null> {
    return await locator.textContent();
  },

  /**
   * Click element if it exists
   */
  async clickIfExists(locator: Locator) {
    if (await locator.count() > 0) {
      await locator.first().click();
    }
  }
};

/**
 * Timing Helpers
 */
export const timing = {
  /**
   * Wait for a specific duration
   */
  async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(page: Page, timeout: number = 10000) {
    await page.waitForLoadState('networkidle', { timeout });
  },

  /**
   * Retry an operation with timeout
   */
  async retry<T>(
    operation: () => Promise<T>,
    options: { maxRetries?: number; delay?: number } = {}
  ): Promise<T> {
    const { maxRetries = 3, delay = 1000 } = options;
    
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.wait(delay);
        }
      }
    }
    
    throw lastError;
  }
};

/**
 * Stripe Payment Helpers
 */
export const stripePayment = {
  /**
   * Fill Stripe card element in iframe
   */
  async fillCardElement(page: Page, cardNumber: string, expDate: string, cvc: string, zip: string) {
    // Wait for Stripe iframe to load
    const cardFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    
    // Fill card number
    await cardFrame.locator('input[name="cardnumber"]').fill(cardNumber);
    
    // Fill expiry date
    await cardFrame.locator('input[name="exp-date"]').fill(expDate);
    
    // Fill CVC
    await cardFrame.locator('input[name="cvc"]').fill(cvc);
    
    // Fill ZIP
    await cardFrame.locator('input[name="postal"]').fill(zip);
  },

  /**
   * Fill card details using Payment Element (new Stripe integration)
   */
  async fillPaymentElement(page: Page, cardDetails: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
  }) {
    // Wait for Stripe Elements to load
    await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 10000 });
    
    // Get all iframes
    const frames = page.frames().filter(f => f.url().includes('stripe'));
    
    for (const frame of frames) {
      try {
        // Try to find and fill card number
        const cardInput = frame.locator('input[name="cardnumber"], input[placeholder*="1234"]').first();
        if (await cardInput.count() > 0) {
          await cardInput.fill(cardDetails.number);
          continue;
        }
        
        // Try to find and fill expiry
        const expInput = frame.locator('input[name="exp-date"], input[placeholder*="MM"]').first();
        if (await expInput.count() > 0) {
          await expInput.fill(`${cardDetails.expMonth}${cardDetails.expYear.slice(-2)}`);
          continue;
        }
        
        // Try to find and fill CVC
        const cvcInput = frame.locator('input[name="cvc"], input[placeholder*="CVC"]').first();
        if (await cvcInput.count() > 0) {
          await cvcInput.fill(cardDetails.cvc);
        }
      } catch {
        // Continue to next frame if this one doesn't have the expected input
      }
    }
  }
};

/**
 * Video Consultation Helpers
 */
export const videoConsultation = {
  /**
   * Grant camera and microphone permissions
   */
  async grantPermissions(page: Page) {
    await page.context().grantPermissions(['camera', 'microphone']);
  },

  /**
   * Join video consultation room
   */
  async joinRoom(page: Page) {
    const joinButton = page.locator('button:has-text("Ingresar"), button:has-text("Unirse")').first();
    await joinButton.click();
    await page.waitForTimeout(2000);
  },

  /**
   * Check if video is playing
   */
  async isVideoPlaying(page: Page): Promise<boolean> {
    try {
      const videoElement = page.locator('video').first();
      const isPlaying = await videoElement.evaluate((video: HTMLVideoElement) => {
        return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
      });
      return isPlaying;
    } catch {
      return false;
    }
  }
};

/**
 * Console and Error Helpers
 */
export const debugging = {
  /**
   * Setup console error listener
   */
  setupConsoleListener(page: Page): string[] {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    return errors;
  },

  /**
   * Setup page error listener
   */
  setupPageErrorListener(page: Page): Error[] {
    const errors: Error[] = [];
    
    page.on('pageerror', error => {
      errors.push(error);
    });
    
    return errors;
  },

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(page: Page, name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }
};

/**
 * Mobile-specific Helpers
 */
export const mobile = {
  /**
   * Set mobile viewport
   */
  async setMobileViewport(page: Page, device: 'iphone' | 'android' = 'iphone') {
    const viewports = {
      iphone: { width: 375, height: 667 },
      android: { width: 360, height: 740 }
    };
    
    await page.setViewportSize(viewports[device]);
  },

  /**
   * Check if element is within touch target size (44x44px minimum)
   */
  async isTouchFriendly(locator: Locator): Promise<boolean> {
    const box = await locator.boundingBox();
    if (!box) return false;
    
    return box.width >= 44 && box.height >= 44;
  },

  /**
   * Simulate swipe gesture
   */
  async swipe(page: Page, direction: 'up' | 'down' | 'left' | 'right') {
    const box = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    
    const startX = box.width / 2;
    const startY = box.height / 2;
    
    let endX = startX;
    let endY = startY;
    
    switch (direction) {
      case 'up':
        endY = startY - 200;
        break;
      case 'down':
        endY = startY + 200;
        break;
      case 'left':
        endX = startX - 200;
        break;
      case 'right':
        endX = startX + 200;
        break;
    }
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();
  }
};
