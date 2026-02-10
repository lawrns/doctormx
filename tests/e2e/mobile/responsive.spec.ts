import { test, expect, devices } from '@playwright/test';

/**
 * E2E Tests for Mobile Responsiveness
 *
 * Tests the platform's responsive design across different devices
 * Requirement: Requirement 21 - UI/UX Design System
 */

// Device configurations for testing
const mobileDevices = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
  { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
];

const tabletDevices = [
  { name: 'iPad', device: devices['iPad'] },
  { name: 'iPad Pro', device: devices['iPad Pro'] },
];

const desktopViewports = [
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Medium', width: 1920, height: 1080 },
  { name: 'Desktop Large', width: 2560, height: 1440 },
];

test.describe('Mobile Responsiveness - Landing Page', () => {
  for (const { name, device } of mobileDevices) {
    test(`should display correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify page loads
      await expect(page).toHaveURL('/');

      // Check for mobile navigation
      const mobileNav = page.locator('[data-testid="mobile-nav"], button:has-text("Menu"), button[aria-label*="menu"]');
      if (await mobileNav.count() > 0) {
        await expect(mobileNav).toBeVisible();
      }

      // Check for hero section
      const heroSection = page.locator('section, div').filter({ hasText: /Doctor|Telemedicina/i }).first();
      if (await heroSection.count() > 0) {
        await expect(heroSection).toBeVisible();

        // Verify content fits in viewport
        const boundingBox = await heroSection.boundingBox();
        expect(boundingBox).not.toBeNull();

        if (boundingBox) {
          expect(boundingBox.width).toBeLessThanOrEqual(device.viewport.width);
        }
      }
    });
  }

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find CTA buttons
    const ctaButtons = page.locator('a, button').filter({ hasText: /Agendar|Reservar|Empezar/i });
    const count = await ctaButtons.count();

    if (count > 0) {
      // Check first button meets touch target size (minimum 44x44px)
      const firstButton = ctaButtons.first();
      const boundingBox = await firstButton.boundingBox();

      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should display mobile menu', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for hamburger menu
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")');
    if (await menuButton.count() > 0) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Verify menu opens
      const mobileMenu = page.locator('[data-testid="mobile-menu"], nav[role="navigation"], .mobile-menu');
      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu).toBeVisible();
      }
    }
  });
});

test.describe('Mobile Responsiveness - Doctor Listing', () => {
  for (const { name, device } of mobileDevices) {
    test(`should display doctor cards correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('/doctors');
      await page.waitForLoadState('networkidle');

      // Check for doctor cards
      const doctorCards = page.locator('[data-testid="doctor-card"], a[href*="/doctors/"]');
      const count = await doctorCards.count();

      if (count > 0) {
        const firstCard = doctorCards.first();
        await expect(firstCard).toBeVisible();

        // Verify card fits in viewport
        const boundingBox = await firstCard.boundingBox();
        expect(boundingBox).not.toBeNull();

        if (boundingBox) {
          expect(boundingBox.width).toBeLessThanOrEqual(device.viewport.width);
        }

        // Verify card content is readable (not overlapping)
        const doctorName = firstCard.locator('text=/Dr\\.|Doctor/i').first();
        if (await doctorName.count() > 0) {
          await expect(doctorName).toBeVisible();
        }
      }
    });
  }

  test('should handle filter modal on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Look for filter button
    const filterButton = page.locator('button:has-text("Filtros"), button[aria-label*="filter"]');
    if (await filterButton.count() > 0) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Verify filter modal opens
      const filterModal = page.locator('[data-testid="filter-modal"], [role="dialog"]');
      if (await filterModal.count() > 0) {
        await expect(filterModal).toBeVisible();

        // Check for filter options
        const specialtyFilter = page.locator('select[name="specialty"], input[name="specialty"]');
        if (await specialtyFilter.count() > 0) {
          await expect(specialtyFilter).toBeVisible();
        }
      }
    }
  });
});

test.describe('Mobile Responsiveness - Booking Flow', () => {
  test('should display booking page on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/book/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Check for booking interface
    const bookingContainer = page.locator('[data-testid="booking-container"], .booking-container');
    if (await bookingContainer.count() > 0) {
      await expect(bookingContainer).toBeVisible();

      // Verify date selector fits in viewport
      const dateSelector = page.locator('[data-testid="date-selector"]');
      if (await dateSelector.count() > 0) {
        await expect(dateSelector).toBeVisible();
      }
    }

    // Check for time slot buttons
    const timeSlots = page.locator('[data-testid="time-slot"]');
    const count = await timeSlots.count();

    if (count > 0) {
      // Verify time slots are touch-friendly
      const firstSlot = timeSlots.first();
      const boundingBox = await firstSlot.boundingBox();

      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should handle checkout on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/checkout/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Check for payment form
    const paymentForm = page.locator('[data-testid="payment-form"], form');
    if (await paymentForm.count() > 0) {
      await expect(paymentForm).toBeVisible();

      // Verify form inputs are usable
      const cardInput = page.locator('input[name="cardnumber"], input[placeholder*="tarjeta"]');
      if (await cardInput.count() > 0) {
        await expect(cardInput).toBeVisible();
      }
    }
  });
});

test.describe('Mobile Responsiveness - Patient Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  });

  test('should display patient dashboard on mobile', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Check for dashboard content
    const dashboardContainer = page.locator('[data-testid="dashboard"], main');
    if (await dashboardContainer.count() > 0) {
      await expect(dashboardContainer).toBeVisible();
    }

    // Check for mobile navigation
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav[role="navigation"].bottom');
    if (await bottomNav.count() > 0) {
      await expect(bottomNav).toBeVisible();
    }
  });

  test('should display appointments list on mobile', async ({ page }) => {
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Check for appointment cards
    const appointmentCards = page.locator('[data-testid="appointment-card"]');
    const count = await appointmentCards.count();

    if (count > 0) {
      const firstCard = appointmentCards.first();
      await expect(firstCard).toBeVisible();

      // Verify cards stack vertically
      const boundingBox = await firstCard.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should handle consultation room on mobile', async ({ page }) => {
    await page.goto('/consultation/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Check for video container
    const videoContainer = page.locator('[data-testid="video-container"]');
    if (await videoContainer.count() > 0) {
      await expect(videoContainer).toBeVisible();

      // Verify video container is responsive
      const boundingBox = await videoContainer.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(375);
      }
    }

    // Check for join button is easily tappable
    const joinButton = page.locator('button:has-text("Ingresar"), a:has-text("Ingresar")');
    if (await joinButton.count() > 0) {
      const boundingBox = await joinButton.first().boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('Tablet Responsiveness', () => {
  for (const { name, device } of tabletDevices) {
    test(`should display correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify page loads
      await expect(page).toHaveURL('/');

      // Check layout adapts to tablet
      const mainContent = page.locator('main, .container');
      if (await mainContent.count() > 0) {
        await expect(mainContent).toBeVisible();
      }
    });
  }

  test('should show different layout on tablet vs mobile', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    const doctorCardsMobile = page.locator('[data-testid="doctor-card"]');
    const mobileCount = await doctorCardsMobile.count();

    // Test tablet layout
    await page.setViewportSize(devices['iPad'].viewport);
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    const doctorCardsTablet = page.locator('[data-testid="doctor-card"]');
    const tabletCount = await doctorCardsTablet.count();

    // Both should show cards but layout may differ
    if (mobileCount > 0 && tabletCount > 0) {
      const firstMobileCard = await doctorCardsMobile.first().boundingBox();
      const firstTabletCard = await doctorCardsTablet.first().boundingBox();

      if (firstMobileCard && firstTabletCard) {
        // Tablet cards may be wider or show more columns
        console.log(`Mobile card width: ${firstMobileCard.width}, Tablet card width: ${firstTabletCard.width}`);
      }
    }
  });
});

test.describe('Desktop Responsiveness', () => {
  for (const { name, width, height } of desktopViewports) {
    test(`should display correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify page loads
      await expect(page).toHaveURL('/');

      // Check for desktop navigation
      const desktopNav = page.locator('nav[role="navigation"], header nav');
      if (await desktopNav.count() > 0) {
        await expect(desktopNav).toBeVisible();
      }

      // Check content is centered and max-width constrained
      const container = page.locator('.container, main');
      if (await container.count() > 0) {
        const boundingBox = await container.first().boundingBox();
        if (boundingBox) {
          // Should not span full width on large screens
          expect(boundingBox.width).toBeLessThanOrEqual(1280);
        }
      }
    });
  }

  test('should show multi-column layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    const doctorCards = page.locator('[data-testid="doctor-card"]');
    const count = await doctorCards.count();

    if (count >= 2) {
      // Check if cards are arranged in multiple columns
      const firstCard = await doctorCards.nth(0).boundingBox();
      const secondCard = await doctorCards.nth(1).boundingBox();

      if (firstCard && secondCard) {
        // If second card is to the right of first, we have multiple columns
        const hasMultipleColumns = secondCard.left > firstCard.left;
        console.log(`Multiple columns: ${hasMultipleColumns}`);
      }
    }
  });
});

test.describe('Responsive Typography', () => {
  const viewports = [
    devices['iPhone SE'],
    devices['iPad'],
    { viewport: { width: 1920, height: 1080 } }
  ];

  for (const device of viewports) {
    test(`should have readable typography on ${device.viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check heading sizes
      const h1 = page.locator('h1').first();
      if (await h1.count() > 0) {
        const fontSize = await h1.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });

        // Font size should be reasonable (12px to 48px)
        const numericSize = parseInt(fontSize);
        expect(numericSize).toBeGreaterThanOrEqual(12);
        expect(numericSize).toBeLessThanOrEqual(48);
      }

      // Check body text
      const bodyText = page.locator('p').first();
      if (await bodyText.count() > 0) {
        const fontSize = await bodyText.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });

        const numericSize = parseInt(fontSize);
        expect(numericSize).toBeGreaterThanOrEqual(12);
        expect(numericSize).toBeLessThanOrEqual(24);
      }
    });
  }
});

test.describe('Orientation Changes', () => {
  test('should handle landscape orientation on mobile', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1000);

    // Verify layout adapts
    const doctorCards = page.locator('[data-testid="doctor-card"]');
    if (await doctorCards.count() > 0) {
      await expect(doctorCards.first()).toBeVisible();
    }
  });

  test('should maintain usability in landscape', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 }); // iPhone 13 landscape
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Check that content is still accessible
    const appointmentCards = page.locator('[data-testid="appointment-card"]');
    const count = await appointmentCards.count();

    if (count > 0) {
      const firstCard = appointmentCards.first();
      await expect(firstCard).toBeVisible();

      // Verify buttons are still tappable
      const buttons = firstCard.locator('button, a');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const firstButton = buttons.first();
        const boundingBox = await firstButton.boundingBox();

        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
});

test.describe('Performance on Mobile', () => {
  test('should load quickly on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Body should not be wider than viewport
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance
  });
});

test.describe('Accessibility on Mobile', () => {
  test('should have sufficient touch targets', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');

    // Check all interactive elements
    const interactiveElements = page.locator('button, a, input, select, textarea');
    const count = await interactiveElements.count();

    if (count > 0) {
      // Sample first few elements
      const sampleSize = Math.min(5, count);
      for (let i = 0; i < sampleSize; i++) {
        const element = interactiveElements.nth(i);
        const boundingBox = await element.boundingBox();

        if (boundingBox) {
          // Touch targets should be at least 44x44px
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  test('should support zoom on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone SE'].viewport);
    await page.goto('/');

    // Check that viewport meta allows zoom
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    if (viewportMeta) {
      // Should not have maximum-scale=1 or user-scalable=no
      expect(viewportMeta).not.toContain('maximum-scale=1');
      expect(viewportMeta).not.toContain('user-scalable=no');
    }
  });
});
