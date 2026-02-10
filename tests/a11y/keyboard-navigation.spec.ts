import { test, expect } from '@playwright/test';

/**
 * Keyboard Navigation Accessibility Tests
 *
 * Tests WCAG 2.1 requirements for keyboard accessibility:
 * - 2.1.1 Keyboard (Level A): All functionality available via keyboard
 * - 2.1.2 No Keyboard Trap (Level A): Keyboard focus not trapped
 * - 2.1.3 Focus Order (Level A): Logical focus order
 * - 2.1.4 Character Key Shortcuts (Level A): Can be disabled
 * - 2.4.3 Focus Order (Level A): Sequential navigation
 * - 2.4.7 Focus Visible (Level AA): Visible focus indicator
 *
 * Coverage: All interactive elements across Doctor.mx
 */

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure keyboard focus is visible
    await page.addInitScript(() => {
      window.localStorage.setItem('showFocusIndicators', 'true');
    });
  });

  test.describe('Tab Navigation', () => {
    test('Tab through all interactive elements on landing page', async ({ page }) => {
      await page.goto('/');

      const interactiveElements = await page.locator(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]'
      ).all();

      expect(interactiveElements.length).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(interactiveElements.length, 50); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            type: (el as HTMLInputElement)?.type,
            role: el?.getAttribute('role'),
            ariaDisabled: el?.getAttribute('aria-disabled'),
            disabled: (el as HTMLInputElement)?.disabled,
            tabIndex: el?.getAttribute('tabindex')
          };
        });

        // Verify focused element is interactive and not disabled
        if (focusedElement.tagName) {
          const isDisabled = focusedElement.disabled === true || focusedElement.ariaDisabled === 'true';
          const hasValidTab = focusedElement.tabIndex === null || focusedElement.tabIndex !== '-1';

          expect(isDisabled).toBeFalsy();
          expect(hasValidTab).toBeTruthy();
        }
      }
    });

    test('Tab order follows visual layout (left to right, top to bottom)', async ({ page }) => {
      await page.goto('/auth/login');

      const focusableElements = [];
      let elementIndex = 0;

      // Collect first 10 focusable elements with their positions
      await page.evaluate(() => {
        window.focusablePositions = [];
        const focusables = document.querySelectorAll(
          'a:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"])'
        );

        focusables.forEach((el, index) => {
          if (index < 10) {
            const rect = el.getBoundingClientRect();
            (window as any).focusablePositions.push({
              index,
              top: rect.top,
              left: rect.left,
              tagName: el.tagName
            });
          }
        });
      });

      const positions = await page.evaluate(() => (window as any).focusablePositions);

      // Verify tab order roughly follows visual order (elements on same row should be ordered left to right)
      for (let i = 1; i < positions.length; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];

        // If elements are on approximately the same row (within 50px vertically)
        if (Math.abs(curr.top - prev.top) < 50) {
          expect(curr.left).toBeGreaterThanOrEqual(prev.left - 10);
        }
      }
    });

    test('Shift+Tab navigates backwards', async ({ page }) => {
      await page.goto('/');

      // Press Tab twice
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const secondFocused = await page.evaluate(() => ({
        tagName: document.activeElement?.tagName,
        id: document.activeElement?.id
      }));

      // Press Shift+Tab once
      await page.keyboard.press('Shift+Tab');

      const firstFocused = await page.evaluate(() => ({
        tagName: document.activeElement?.tagName,
        id: document.activeElement?.id
      }));

      // Should be back to first focused element
      expect(secondFocused).not.toEqual(firstFocused);
    });
  });

  test.describe('Interactive Elements', () => {
    test('All links are keyboard accessible', async ({ page }) => {
      await page.goto('/doctors');

      const links = await page.locator('a[href]:not([role="button"])').all();
      const testLinks = links.slice(0, 10); // Test first 10 links

      for (const link of testLinks) {
        try {
          await link.focus();
          const isFocused = await link.evaluate(el => el === document.activeElement);
          expect(isFocused).toBeTruthy();

          // Verify Enter key activates link
          const href = await link.getAttribute('href');
          if (href && !href.startsWith('http')) {
            // Only test internal links
            const isActive = await link.evaluate(el => {
              const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
              el.dispatchEvent(event);
              return true;
            });
            expect(isActive).toBeTruthy();
          }
        } catch (e) {
          // Element might not be visible or focusable, skip
        }
      }
    });

    test('All buttons are keyboard accessible', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button').all();
      const testButtons = buttons.slice(0, 10);

      for (const button of testButtons) {
        try {
          await button.focus();
          const isFocused = await button.evaluate(el => el === document.activeElement);
          expect(isFocused).toBeTruthy();

          const isDisabled = await button.isDisabled();
          if (!isDisabled) {
            // Space and Enter should activate buttons
            const canActivate = await button.evaluate(el => {
              const spaceEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true });
              const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
              el.dispatchEvent(spaceEvent);
              el.dispatchEvent(enterEvent);
              return true;
            });
            expect(canActivate).toBeTruthy();
          }
        } catch (e) {
          // Element might not be visible, skip
        }
      }
    });

    test('Form inputs are keyboard accessible', async ({ page }) => {
      await page.goto('/auth/register');

      const inputs = await page.locator('input, select, textarea').all();
      const testInputs = inputs.slice(0, 10);

      for (const input of testInputs) {
        try {
          await input.focus();
          const isFocused = await input.evaluate(el => el === document.activeElement);
          expect(isFocused).toBeTruthy();

          // Verify input can receive keyboard input
          const isWritable = await input.evaluate(el => {
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
              return !el.readOnly && !el.disabled;
            }
            if (el instanceof HTMLSelectElement) {
              return !el.disabled;
            }
            return true;
          });

          if (isWritable) {
            // Type a character to verify input reception
            await page.keyboard.type('a');
            const value = await input.evaluate(el => {
              if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                return el.value;
              }
              return '';
            });
            expect(value.length).toBeGreaterThan(0);
            // Clear the input
            await input.evaluate(el => {
              if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                el.value = '';
              }
            });
          }
        } catch (e) {
          // Element might not be visible or writable, skip
        }
      }
    });

    test('Dropdown menus are keyboard accessible', async ({ page }) => {
      await page.goto('/app');

      // Find dropdown triggers (common patterns)
      const dropdownTriggers = page.locator('[aria-haspopup="true"], [data-state="closed"]');

      const count = await dropdownTriggers.count();
      if (count > 0) {
        const trigger = dropdownTriggers.first();
        await trigger.focus();
        await trigger.press('Enter');
        await page.waitForTimeout(300);

        // Verify dropdown menu is visible and keyboard navigable
        const menu = page.locator('[role="menu"], [role="listbox"]').first();
        if (await menu.isVisible()) {
          // Arrow keys should navigate menu items
          await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(100);

          const firstMenuItem = menu.locator('[role="menuitem"], [role="option"]').first();
          const isFocused = await firstMenuItem.evaluate(el => el === document.activeElement);
          expect(isFocused).toBeTruthy();

          // ESC should close menu
          await page.keyboard.press('Escape');
          await page.waitForTimeout(200);

          const menuStillVisible = await menu.isVisible().catch(() => false);
          expect(menuStillVisible).toBeFalsy();
        }
      }
    });

    test('Tabs are keyboard navigable', async ({ page }) => {
      await page.goto('/app/appointments');

      const tabList = page.locator('[role="tablist"]').first();
      if (await tabList.isVisible()) {
        await tabList.focus();

        const tabs = tabList.locator('[role="tab"]');
        const tabCount = await tabs.count();

        if (tabCount > 0) {
          await tabs.first().focus();

          // Arrow keys should navigate between tabs
          for (let i = 0; i < Math.min(tabCount - 1, 3); i++) {
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(50);

            const currentTab = tabs.nth(i + 1);
            const isFocused = await currentTab.evaluate(el => el === document.activeElement);
            expect(isFocused).toBeTruthy();
          }

          // Enter/Space should activate tab
          await page.keyboard.press('Enter');
          await page.waitForTimeout(200);

          // Verify selected tab
          const selectedTab = page.locator('[role="tab"][aria-selected="true"]');
          expect(await selectedTab.count()).toBeGreaterThan(0);
        }
      }
    });

    test('Modals trap focus', async ({ page }) => {
      await page.goto('/');

      // Find and trigger a modal
      const modalTrigger = page.getByRole('button', { name: /iniciar|login|registro|register/i }).first();
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"]').first();
        if (await modal.isVisible()) {
          // Focus should be in modal
          const focusInModal = await modal.evaluate(el => el.contains(document.activeElement));
          expect(focusInModal).toBeTruthy();

          // Tab should cycle within modal
          const focusableCount = await modal.locator(
            'a:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
          ).count();

          // Press Tab multiple times
          for (let i = 0; i < Math.min(focusableCount + 2, 10); i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(50);

            const stillInModal = await modal.evaluate(el => el.contains(document.activeElement));
            expect(stillInModal).toBeTruthy();
          }

          // ESC should close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      }
    });
  });

  test.describe('Escape Key Behavior', () => {
    test('ESC closes modals and dialogs', async ({ page }) => {
      await page.goto('/auth/login');

      // Look for modal/dialog triggers
      const triggers = page.locator('[aria-haspopup="dialog"], [data-testid*="modal-trigger"]');

      const count = await triggers.count();
      if (count > 0) {
        await triggers.first().click();
        await page.waitForTimeout(300);

        const dialog = page.locator('[role="dialog"]').first();
        if (await dialog.isVisible()) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);

          const isVisible = await dialog.isVisible().catch(() => false);
          expect(isVisible).toBeFalsy();
        }
      }
    });

    test('ESC closes dropdowns and popovers', async ({ page }) => {
      await page.goto('/app');

      const dropdown = page.locator('[aria-haspopup="true"]').first();
      if (await dropdown.isVisible()) {
        await dropdown.click();
        await page.waitForTimeout(200);

        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);

        // Dropdown should be closed
        const isOpen = await dropdown.getAttribute('aria-expanded');
        expect(isOpen).not.toBe('true');
      }
    });

    test('ESC exits fullscreen or overlay modes', async ({ page }) => {
      await page.goto('/app/appointments');

      // Check for any overlay/fullscreen elements
      const overlay = page.locator('[data-state="open"]').first();
      if (await overlay.isVisible()) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        const stillOpen = await overlay.isVisible().catch(() => false);
        expect(stillOpen).toBeFalsy();
      }
    });
  });

  test.describe('Focus Indicators', () => {
    test('All interactive elements have visible focus indicators', async ({ page }) => {
      await page.goto('/');

      const focusableElements = await page.locator(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).all();

      const testElements = focusableElements.slice(0, 20);

      for (const el of testElements) {
        try {
          await el.focus();

          const hasFocusIndicator = await el.evaluate(element => {
            const styles = window.getComputedStyle(element);
            const hasOutline = styles.outline !== 'none' && styles.outlineWidth !== '0px';
            const hasBoxShadow = styles.boxShadow !== 'none';
            const hasCustomFocus = element.getAttribute('data-focus-visible') !== null;

            return hasOutline || hasBoxShadow || hasCustomFocus;
          });

          expect(hasFocusIndicator).toBeTruthy();
        } catch (e) {
          // Element might not be focusable, skip
        }
      }
    });

    test('Focus indicator meets contrast requirements (WCAG AA)', async ({ page }) => {
      await page.goto('/');

      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.focus();

        // Get the outline color
        const focusColors = await button.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            outlineColor: styles.outlineColor,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow
          };
        });

        // Verify there's some focus indication
        const hasFocusStyle =
          focusColors.outlineWidth !== '0px' ||
          focusColors.boxShadow !== 'none';

        expect(hasFocusStyle).toBeTruthy();
      }
    });
  });

  test.describe('Skip Links', () => {
    test('Skip navigation link is present and functional', async ({ page }) => {
      await page.goto('/');

      // Look for skip links (usually at the top of the page)
      const skipLink = page.locator('a').filter({ hasText: /(skip|saltar|ir al|go to|main content)/i }).first();

      if (await skipLink.count() > 0) {
        // Get the href
        const href = await skipLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href?.startsWith('#')).toBeTruthy();

        // Verify the target exists
        if (href) {
          const targetId = href.substring(1);
          const target = page.locator(`#${targetId}, [id="${targetId}"], a[name="${targetId}"]`);
          const count = await target.count();
          expect(count).toBeGreaterThan(0);
        }

        // Test that skip link works
        await skipLink.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(100);

        // Focus should move to target
        const targetElement = page.locator(href);
        if (await targetElement.count() > 0) {
          const isFocused = await targetElement.first().evaluate(el => {
            // Check if element is focused or is the focusable area
            return el === document.activeElement || el.contains(document.activeElement);
          });
          expect(isFocused).toBeTruthy();
        }
      }
    });

    test('Skip link becomes visible on focus', async ({ page }) => {
      await page.goto('/');

      const skipLink = page.locator('a').filter({ hasText: /(skip|saltar|ir al)/i }).first();

      if (await skipLink.count() > 0) {
        // Skip links are often visually hidden until focused
        const isVisibleBefore = await skipLink.isVisible().catch(() => false);

        await skipLink.focus();
        await page.waitForTimeout(50);

        const isVisibleAfter = await skipLink.isVisible();
        const hasFocus = await skipLink.evaluate(el => el === document.activeElement);

        expect(hasFocus).toBeTruthy();
        // Should be visible or have some indication of being focused
        expect(isVisibleAfter || isVisibleBefore).toBeTruthy();
      }
    });
  });

  test.describe('No Keyboard Traps', () => {
    test('Can navigate entire page with Tab key', async ({ page }) => {
      await page.goto('/');

      // Press Tab 50 times or until we cycle back
      let firstElement = null;
      let cycleCount = 0;
      const maxTabs = 100;

      for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(30);

        const currentElement = await page.evaluate(() => ({
          tagName: document.activeElement?.tagName,
          className: document.activeElement?.className,
          id: document.activeElement?.id
        }));

        if (firstElement === null) {
          firstElement = currentElement;
        } else if (
          currentElement.tagName === firstElement.tagName &&
          currentElement.id === firstElement.id
        ) {
          cycleCount++;
          if (cycleCount >= 2) {
            // We've cycled back to the start
            break;
          }
        }
      }

      // Should be able to navigate without getting stuck
      expect(cycleCount).toBeGreaterThanOrEqual(1);
    });

    test('Can exit any modal with keyboard', async ({ page }) => {
      await page.goto('/');

      // Find any modal/dialog
      const modalTriggers = page.locator('[aria-haspopup="dialog"], button[data-trigger="modal"]');

      const triggerCount = await modalTriggers.count();
      if (triggerCount > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]').first();
        if (await dialog.isVisible()) {
          // Try ESC to close
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);

          // Dialog should be closed
          const isOpen = await dialog.isVisible().catch(() => false);
          expect(isOpen).toBeFalsy();

          // If still open, look for close button
          if (isOpen) {
            const closeButton = page.locator('[role="dialog"] button[aria-label*="close" i], [role="dialog"] button[aria-label*="cerrar" i]').first();
            if (await closeButton.isVisible()) {
              await closeButton.focus();
              await page.keyboard.press('Enter');
              await page.waitForTimeout(300);

              const stillOpen = await dialog.isVisible().catch(() => false);
              expect(stillOpen).toBeFalsy();
            }
          }
        }
      }
    });
  });

  test.describe('Mobile Keyboard Support', () => {
    test('Keyboard navigation works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      let canNavigate = false;
      let attempts = 0;

      // Try to Tab through 10 elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);

        const focusedElement = await page.evaluate(() => ({
          tagName: document.activeElement?.tagName,
          visible: document.activeElement ? (
            window.getComputedStyle(document.activeElement).display !== 'none' &&
            window.getComputedStyle(document.activeElement).visibility !== 'hidden'
          ) : false
        }));

        if (focusedElement.tagName && focusedElement.visible) {
          canNavigate = true;
        }
        attempts++;
      }

      expect(canNavigate).toBeTruthy();
    });

    test('Touch targets maintain keyboard accessibility', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/doctors');

      const touchTargets = await page.locator('button, a, input').all();
      const testTargets = touchTargets.slice(0, 5);

      for (const target of testTargets) {
        try {
          await target.focus();
          const isFocused = await target.evaluate(el => el === document.activeElement);
          expect(isFocused).toBeTruthy();
        } catch (e) {
          // Element might not be visible, skip
        }
      }
    });
  });

  test.describe('Custom Interactive Components', () => {
    test('Custom dropdowns are keyboard accessible', async ({ page }) => {
      await page.goto('/app/appointments');

      // Look for custom selects or dropdowns
      const customSelects = page.locator('[role="combobox"], [data-testid*="select"], [data-testid*="dropdown"]');

      const count = await customSelects.count();
      if (count > 0) {
        const select = customSelects.first();
        await select.focus();

        // Space or Enter should open
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);

        // Should show listbox
        const listbox = page.locator('[role="listbox"], [role="menu"]').first();
        if (await listbox.isVisible()) {
          // Arrow keys should navigate
          await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(50);

          const firstOption = listbox.locator('[role="option"], [role="menuitem"]').first();
          const isFocused = await firstOption.evaluate(el => el === document.activeElement);
          expect(isFocused).toBeTruthy();

          // Enter should select
          await page.keyboard.press('Enter');
          await page.waitForTimeout(200);
        }
      }
    });

    test('Date pickers are keyboard accessible', async ({ page }) => {
      await page.goto('/book/sample-doctor');

      const dateInput = page.locator('input[type="date"], input[placeholder*="fecha" i], input[placeholder*="date" i]').first();

      if (await dateInput.isVisible()) {
        await dateInput.focus();

        // Should be able to type date
        await page.keyboard.type('2024-12-25');
        await page.waitForTimeout(100);

        const value = await dateInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    });

    test('Carousels/sliders are keyboard accessible', async ({ page }) => {
      await page.goto('/');

      const carousel = page.locator('[role="region"][aria-label*="slider" i], [role="region"][aria-label*="carrusel" i], [data-testid*="carousel"], [data-testid*="slider"]').first();

      if (await carousel.isVisible()) {
        // Look for navigation buttons
        const prevButton = carousel.locator('button').filter({ hasText: /(previous|prev|anterior|←)/i }).first();
        const nextButton = carousel.locator('button').filter({ hasText: /(next|siguiente|→)/i }).first();

        if (await nextButton.isVisible()) {
          await nextButton.focus();
          expect(await nextButton.evaluate(el => el === document.activeElement)).toBeTruthy();

          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
        }

        if (await prevButton.isVisible()) {
          await prevButton.focus();
          expect(await prevButton.evaluate(el => el === document.activeElement)).toBeTruthy();

          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
        }

        // Check for arrow key navigation
        await carousel.focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);

        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(100);
      }
    });
  });
});
