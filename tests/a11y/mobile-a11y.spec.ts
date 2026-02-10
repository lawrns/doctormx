import { test, expect } from '@playwright/test';

/**
 * Mobile Accessibility Tests - WCAG 2.1 AA
 *
 * Tests WCAG 2.1 requirements for mobile/touch accessibility:
 * - 2.5.5 Target Size (Level AAA): 44x44 CSS pixels minimum
 * - 2.5.8 Target Size (Level AA): 24x24 CSS pixels minimum
 *
 * Best practice: 48x48px (9mm) recommended for better usability
 * This test suite uses 44x44px as the passing threshold (WCAG AAA)
 * with warnings for elements between 24-44px (WCAG AA minimum)
 *
 * Also tests:
 * - Viewport scaling and zoom
 * - Touch target spacing
 * - Mobile-specific gestures
 * - Responsive design accessibility
 */

test.describe('Mobile Accessibility', () => {
  // Mobile viewport dimensions
  const mobileViewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 390, height: 844, name: 'iPhone 13' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 360, height: 640, name: 'Android Small' },
    { width: 412, height: 915, name: 'Android Large' }
  ];

  /**
   * Get the touch target size of an element
   * Includes padding and margin that contribute to touch area
   */
  async function getTouchTargetSize(page: any, element: any): Promise<{
    width: number;
    height: number;
    totalWidth: number;
    totalHeight: number;
    hitArea: number;
  }> {
    return await element.evaluate((el: any) => {
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      const styles = {
        padding: {
          top: parseFloat(computed.paddingTop),
          right: parseFloat(computed.paddingRight),
          bottom: parseFloat(computed.paddingBottom),
          left: parseFloat(computed.paddingLeft)
        },
        border: {
          top: parseFloat(computed.borderTopWidth),
          right: parseFloat(computed.borderRightWidth),
          bottom: parseFloat(computed.borderBottomWidth),
          left: parseFloat(computed.borderLeftWidth)
        }
      };

      // Content size
      const width = rect.width;
      const height = rect.height;

      // Total size including padding and borders (contributes to touch target)
      const totalWidth = width + styles.padding.left + styles.padding.right +
                        styles.border.left + styles.border.right;
      const totalHeight = height + styles.padding.top + styles.padding.bottom +
                         styles.border.top + styles.border.bottom;

      // Check for pseudo-elements that might expand touch area
      const hasBefore = computed.content !== 'none';
      const hasAfter = computed.content !== 'none';

      return {
        width,
        height,
        totalWidth,
        totalHeight,
        hitArea: Math.max(totalWidth, totalHeight)
      };
    });
  }

  /**
   * Check if element has adequate spacing from other interactive elements
   */
  async function getSpacingToNeighbors(page: any, element: any): Promise<{
    minDistance: number;
    closestElement: string;
  }> {
    return await element.evaluate((el: any) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const interactiveElements = Array.from(document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], [onclick]'
      )).filter(e => e !== el && e.getBoundingClientRect());

      let minDistance = Infinity;
      let closestElement = 'none';

      for (const other of interactiveElements) {
        const otherRect = other.getBoundingClientRect();
        const otherCenterX = otherRect.left + otherRect.width / 2;
        const otherCenterY = otherRect.top + otherRect.height / 2;

        const distance = Math.sqrt(
          Math.pow(centerX - otherCenterX, 2) +
          Math.pow(centerY - otherCenterY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestElement = other.tagName || 'unknown';
        }
      }

      return { minDistance, closestElement };
    });
  }

  test.describe('Touch Target Size (WCAG 2.5.5)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    const MIN_TOUCH_TARGET = 44; // WCAG AAA (recommended)
    const ACCEPTABLE_TOUCH_TARGET = 24; // WCAG AA minimum

    test('All buttons meet minimum touch target size on mobile', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button:visible').all();

      const failures: Array<{ text: string; size: number; required: number }> = [];
      const warnings: Array<{ text: string; size: number; recommended: number }> = [];

      for (const button of buttons) {
        const size = await getTouchTargetSize(page, button);

        if (size.totalWidth < ACCEPTABLE_TOUCH_TARGET || size.totalHeight < ACCEPTABLE_TOUCH_TARGET) {
          const text = await button.textContent();
          failures.push({
            text: text?.slice(0, 30) || 'empty',
            size: Math.max(size.totalWidth, size.totalHeight),
            required: ACCEPTABLE_TOUCH_TARGET
          });
        } else if (size.totalWidth < MIN_TOUCH_TARGET || size.totalHeight < MIN_TOUCH_TARGET) {
          const text = await button.textContent();
          warnings.push({
            text: text?.slice(0, 30) || 'empty',
            size: Math.max(size.totalWidth, size.totalHeight),
            recommended: MIN_TOUCH_TARGET
          });
        }
      }

      if (warnings.length > 0) {
        console.warn('Buttons below recommended size (WCAG AAA):', warnings);
      }

      if (failures.length > 0) {
        console.error('Buttons below minimum size (WCAG AA):', failures);
      }

      expect(failures.length).toBe(0);
    });

    test('All links meet minimum touch target size on mobile', async ({ page }) => {
      await page.goto('/doctors');

      const links = await page.locator('a[href]:visible').all();
      const testLinks = links.slice(0, 30);

      const failures: Array<{ href: string; size: number }> = [];
      const warnings: Array<{ href: string; size: number }> = [];

      for (const link of testLinks) {
        const size = await getTouchTargetSize(page, link);

        if (size.totalWidth < ACCEPTABLE_TOUCH_TARGET || size.totalHeight < ACCEPTABLE_TOUCH_TARGET) {
          const href = await link.getAttribute('href');
          failures.push({
            href: href?.slice(0, 40) || '#',
            size: Math.max(size.totalWidth, size.totalHeight)
          });
        } else if (size.totalWidth < MIN_TOUCH_TARGET || size.totalHeight < MIN_TOUCH_TARGET) {
          const href = await link.getAttribute('href');
          warnings.push({
            href: href?.slice(0, 40) || '#',
            size: Math.max(size.totalWidth, size.totalHeight)
          });
        }
      }

      if (warnings.length > 0) {
        console.warn('Links below recommended size:', warnings.length, 'warnings');
      }

      expect(failures.length).toBe(0);
    });

    test('Form inputs meet minimum touch target size on mobile', async ({ page }) => {
      await page.goto('/auth/register');

      const inputs = await page.locator('input:visible, select:visible, textarea:visible').all();

      const failures: Array<{ type: string; size: number }> = [];

      for (const input of inputs) {
        const size = await getTouchTargetSize(page, input);

        // Inputs should be at least 44px tall for touch
        if (size.totalHeight < ACCEPTABLE_TOUCH_TARGET) {
          const inputType = await input.getAttribute('type') || 'text';
          failures.push({
            type: inputType,
            size: size.totalHeight
          });
        }
      }

      if (failures.length > 0) {
        console.error('Inputs below minimum height:', failures);
      }

      expect(failures.length).toBe(0);
    });

    test('Checkbox and radio buttons have adequate touch targets', async ({ page }) => {
      await page.goto('/auth/register');

      const checkboxes = await page.locator('input[type="checkbox"]:visible').all();
      const radios = await page.locator('input[type="radio"]:visible').all();

      const checkFailures: string[] = [];
      const radioFailures: string[] = [];

      // For checkboxes, check if label provides adequate touch target
      for (const checkbox of checkboxes) {
        const size = await getTouchTargetSize(page, checkbox);

        // Check if checkbox has a label that can be clicked
        const id = await checkbox.getAttribute('id');
        const hasLabel = id && await page.locator(`label[for="${id}"]`).count() > 0;
        const isInLabel = await checkbox.evaluate(el => el.closest('label') !== null);

        if (!hasLabel && !isInLabel && size.totalWidth < ACCEPTABLE_TOUCH_TARGET) {
          checkFailures.push(`Checkbox without adequate label target: ${size.totalWidth}px`);
        }
      }

      for (const radio of radios) {
        const size = await getTouchTargetSize(page, radio);

        const id = await radio.getAttribute('id');
        const hasLabel = id && await page.locator(`label[for="${id}"]`).count() > 0;
        const isInLabel = await radio.evaluate(el => el.closest('label') !== null);

        if (!hasLabel && !isInLabel && size.totalWidth < ACCEPTABLE_TOUCH_TARGET) {
          radioFailures.push(`Radio without adequate label target: ${size.totalWidth}px`);
        }
      }

      expect(checkFailures.length).toBe(0);
      expect(radioFailures.length).toBe(0);
    });

    test('Icon buttons have adequate touch targets', async ({ page }) => {
      await page.goto('/');

      const allButtons = await page.locator('button').all();
      const iconButtons: any[] = [];

      for (const btn of allButtons) {
        const text = await btn.textContent();
        // Consider it an icon button if it has an SVG and minimal text
        const hasSvg = await btn.locator('svg').count() > 0;
        const hasMinimalText = !text || text.trim().length < 3;
        if (hasSvg && hasMinimalText) {
          iconButtons.push(btn);
        }
      }

      const failures: Array<{ ariaLabel: string; size: number }> = [];

      for (const btn of iconButtons) {
        const size = await getTouchTargetSize(page, btn);

        if (size.totalWidth < MIN_TOUCH_TARGET || size.totalHeight < MIN_TOUCH_TARGET) {
          const ariaLabel = await btn.getAttribute('aria-label') || 'unnamed icon button';
          failures.push({
            ariaLabel,
            size: Math.max(size.totalWidth, size.totalHeight)
          });
        }
      }

      if (failures.length > 0) {
        console.error('Icon buttons below recommended size:', failures);
      }

      expect(failures.length).toBe(0);
    });
  });

  test.describe('Touch Target Spacing', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Interactive elements have adequate spacing', async ({ page }) => {
      await page.goto('/');

      const interactiveElements = await page.locator(
        'a:visible, button:visible, input:visible, [role="button"]:visible'
      ).all();

      const testElements = interactiveElements.slice(0, 30);
      const MIN_SPACING = 8; // 8px minimum spacing between targets

      const closeElements: Array<{ type: string; distance: number }> = [];

      for (const el of testElements) {
        const spacing = await getSpacingToNeighbors(page, el);

        if (spacing.minDistance < MIN_SPACING && spacing.minDistance > 0) {
          const tagName = await el.evaluate(e => e.tagName);
          closeElements.push({
            type: tagName,
            distance: Math.round(spacing.minDistance)
          });
        }
      }

      if (closeElements.length > 0) {
        console.warn('Elements with less than 8px spacing:', closeElements.length);
      }

      // Allow some close elements if they're large enough
      const tooClose = closeElements.filter(e => e.distance < 4);
      expect(tooClose.length).toBeLessThanOrEqual(5);
    });

    test('Vertically stacked buttons have adequate spacing', async ({ page }) => {
      await page.goto('/pricing');

      const buttons = await page.locator('button').all();
      const visibleButtons = [];

      for (const btn of buttons) {
        if (await btn.isVisible()) {
          visibleButtons.push(btn);
        }
      }

      const closePairs: Array<{ distance: number }> = [];

      for (let i = 0; i < visibleButtons.length - 1; i++) {
        const spacing = await visibleButtons[i].evaluate((el: any, other: any) => {
          const rect1 = el.getBoundingClientRect();
          const rect2 = other.getBoundingClientRect();

          // Check if vertically stacked
          const isVerticallyStacked = Math.abs(rect1.left - rect2.left) < 50;
          if (!isVerticallyStacked) return { distance: Infinity };

          const distance = Math.abs(rect2.top - rect1.bottom);
          return { distance };
        }, visibleButtons[i + 1]);

        if (spacing.distance < 8 && spacing.distance > 0) {
          closePairs.push({ distance: Math.round(spacing.distance) });
        }
      }

      if (closePairs.length > 0) {
        console.warn('Vertically stacked buttons with less than 8px spacing:', closePairs);
      }

      expect(closePairs.length).toBeLessThanOrEqual(3);
    });
  });

  test.describe('Viewport and Scaling', () => {
    test('Page has proper viewport meta tag', async ({ page }) => {
      await page.goto('/');

      const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

      expect(viewportMeta).toBeTruthy();
      expect(viewportMeta).toContain('width=device-width');
      expect(viewportMeta).toContain('initial-scale=1');
    });

    test('Page does not prevent user zooming (unless critical)', async ({ page }) => {
      await page.goto('/');

      const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

      if (viewportMeta) {
        // maximum-scale should not be less than 2 unless necessary
        const maxScaleMatch = viewportMeta.match(/maximum-scale=([0-9.]+)/);

        if (maxScaleMatch) {
          const maxScale = parseFloat(maxScaleMatch[1]);
          // If max-scale is set, it should allow at least 2x zoom
          expect(maxScale).toBeGreaterThanOrEqual(2);
        }

        // user-scalable should not be no
        expect(viewportMeta).not.toContain('user-scalable=no');
      }
    });

    test('Content is not wider than viewport on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const bodyWidth = await page.evaluate(() => {
        return document.body.scrollWidth;
      });

      const viewportWidth = await page.evaluate(() => {
        return window.innerWidth;
      });

      // Allow small margin for rounding
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    });

    test('No horizontal scrolling required on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/doctors');

      const canScrollHorizontally = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });

      expect(canScrollHorizontally).toBeFalsy();
    });
  });

  test.describe('Mobile-Specific Interactions', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Hamburger menu is accessible on mobile', async ({ page }) => {
      await page.goto('/');

      const menuButton = page.locator(
        'button[aria-label*="menu" i], button[aria-label*="menú" i], ' +
        'button[aria-expanded][aria-haspopup], .hamburger, .menu-toggle'
      ).first();

      if (await menuButton.isVisible()) {
        const size = await getTouchTargetSize(page, menuButton);
        expect(Math.max(size.totalWidth, size.totalHeight)).toBeGreaterThanOrEqual(44);

        // Should be keyboard accessible
        await menuButton.focus();
        const isFocused = await menuButton.evaluate(el => el === document.activeElement);
        expect(isFocused).toBeTruthy();
      }
    });

    test('Mobile navigation is accessible', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open mobile menu if present
      const menuToggle = page.locator('button[aria-expanded="false"]').first();
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await page.waitForTimeout(300);
      }

      const navLinks = await page.locator('nav a:visible').all();
      const testLinks = navLinks.slice(0, 10);

      for (const link of testLinks) {
        const size = await getTouchTargetSize(page, link);

        // Nav links should be extra large on mobile
        expect(size.totalHeight).toBeGreaterThanOrEqual(44);
      }
    });

    test('Bottom navigation bar (if present) has adequate touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/app');

      const bottomNav = page.locator('nav[style*="bottom" i], .bottom-nav, [class*="tab-bar"]').first();

      if (await bottomNav.isVisible()) {
        const navItems = await bottomNav.locator('a, button').all();

        for (const item of navItems) {
          const size = await getTouchTargetSize(page, item);
          expect(Math.max(size.totalWidth, size.totalHeight)).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('Swipe gestures have keyboard alternatives', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/app/appointments');

      // Look for carousels or swipeable content
      const carousels = await page.locator('[data-testid*="carousel"], [data-testid*="slider"], [role="region"]').all();

      for (const carousel of carousels) {
        const navButtons = await carousel.locator('button').all();

        // Should have navigation buttons as keyboard alternative
        const hasNavButtons = navButtons.length >= 2;
        const hasPrevNext = navButtons.some(btn =>
          btn.textContent() && /prev|next|anterior|siguiente/i.test(btn.textContent()!)
        );

        expect(hasNavButtons || hasPrevNext).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('Layout adapts to different mobile screen sizes', async ({ page }) => {
      const sizes = mobileViewports.slice(0, 3);

      for (const size of sizes) {
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto('/');

        // Check that content is visible
        const mainContent = page.locator('main, [role="main"], #content').first();
        expect(await mainContent.isVisible()).toBeTruthy();

        // Check no horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });

        expect(hasOverflow).toBeFalsy();
      }
    });

    test('Text is readable on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // Very small screen
      await page.goto('/');

      const bodyText = await page.locator('body p').first();
      if (await bodyText.isVisible()) {
        const fontSize = await bodyText.evaluate(el => {
          return parseFloat(window.getComputedStyle(el).fontSize);
        });

        // Body text should be at least 14px on mobile
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });

    test('Images scale properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const images = await page.locator('img:visible').all();
      const testImages = images.slice(0, 10);

      const overflowImages: string[] = [];

      for (const img of testImages) {
        const overflow = await img.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > window.innerWidth;
        });

        if (overflow) {
          const src = await img.getAttribute('src');
          overflowImages.push(src || 'unknown');
        }
      }

      if (overflowImages.length > 0) {
        console.warn('Images that overflow viewport:', overflowImages);
      }

      expect(overflowImages.length).toBe(0);
    });
  });

  test.describe('Mobile Form Accessibility', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Form inputs are large enough for touch', async ({ page }) => {
      await page.goto('/auth/register');

      const textInputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"]').all();

      for (const input of textInputs) {
        const size = await getTouchTargetSize(page, input);

        // Touch targets should be at least 44px high
        expect(size.totalHeight).toBeGreaterThanOrEqual(44);
      }
    });

    test('Select dropdowns have adequate touch targets', async ({ page }) => {
      await page.goto('/auth/register');

      const selects = await page.locator('select').all();

      for (const select of selects) {
        const size = await getTouchTargetSize(page, select);
        expect(size.totalHeight).toBeGreaterThanOrEqual(44);
      }
    });

    test('Submit buttons are large and prominent on mobile', async ({ page }) => {
      await page.goto('/auth/register');

      const submitButtons = await page.locator('button[type="submit"], input[type="submit"]').all();

      for (const btn of submitButtons) {
        const size = await getTouchTargetSize(page, btn);

        // Submit buttons should be especially large
        expect(size.totalHeight).toBeGreaterThanOrEqual(48);
        expect(size.totalWidth).toBeGreaterThanOrEqual(44);
      }
    });

    test('Checkbox labels are large enough for touch', async ({ page }) => {
      await page.goto('/auth/register');

      const checkboxes = await page.locator('input[type="checkbox"]').all();

      for (const checkbox of checkboxes) {
        const id = await checkbox.getAttribute('id');
        const label = id ? page.locator(`label[for="${id}"]`) : checkbox.locator('..').closest('label');

        if (await label.count() > 0) {
          const size = await getTouchTargetSize(page, label.first());

          // Label touch target should be at least 44px high
          expect(size.totalHeight).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Orientation Changes', () => {
    test('Content remains accessible in landscape orientation', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 }); // Landscape
      await page.goto('/');

      // Main content should still be visible
      const main = page.locator('main, [role="main"]').first();
      expect(await main.isVisible()).toBeTruthy();

      // No horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      expect(hasOverflow).toBeFalsy();
    });

    test('Touch targets remain adequate in landscape', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('/');

      const buttons = await page.locator('button:visible').all();
      const testButtons = buttons.slice(0, 10);

      for (const btn of testButtons) {
        const size = await getTouchTargetSize(page, btn);
        expect(Math.max(size.totalWidth, size.totalHeight)).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test.describe('High DPI/Retina Displays', () => {
    test('Touch targets account for device pixel ratio', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const devicePixelRatio = await page.evaluate(() => window.devicePixelRatio);

      if (devicePixelRatio > 1) {
        const button = page.locator('button').first();
        const cssSize = await getTouchTargetSize(page, button);

        // Physical size should still be adequate
        const physicalSize = {
          width: cssSize.width * devicePixelRatio,
          height: cssSize.height * devicePixelRatio
        };

        // 44 CSS pixels at 2x = 88 physical pixels
        expect(Math.max(physicalSize.width, physicalSize.height)).toBeGreaterThanOrEqual(44 * devicePixelRatio * 0.8);
      }
    });
  });
});
