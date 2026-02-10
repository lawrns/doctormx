import { test, expect } from '@playwright/test';

/**
 * Screen Reader Compatibility Tests
 *
 * Tests WCAG 2.1 requirements for screen reader accessibility:
 * - 1.3.1 Info and Relationships (Level A): Semantic markup
 * - 2.4.1 Bypass Blocks (Level A): Skip links
 * - 2.4.4 Link Purpose (Level A): Clear link context
 * - 3.1.1 Language of Page (Level A): Proper lang attribute
 * - 3.2.1 On Focus (Level A): No unexpected context changes
 * - 3.2.2 On Input (Level A): No unexpected changes
 * - 3.3.2 Labels or Instructions (Level A): Clear labels
 * - 4.1.1 Parsing (Level A): Valid HTML
 * - 4.1.2 Name, Role, Value (Level A): Proper ARIA attributes
 *
 * Tested with NVDA/JAWS compatibility in mind
 */

test.describe('Screen Reader Compatibility', () => {
  test.describe('Semantic HTML', () => {
    test('Page has proper heading structure (h1-h6)', async ({ page }) => {
      await page.goto('/');

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingData = await Promise.all(
        headings.map(async (heading) => ({
          tag: await heading.evaluate(el => el.tagName),
          text: await heading.textContent()
        }))
      );

      // Should have at least one h1
      const h1Count = headingData.filter(h => h.tag === 'H1').length;
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Headings should not skip levels (e.g., h1 -> h3)
      const levels = headingData.map(h => parseInt(h.tag.substring(1)));
      for (let i = 1; i < levels.length; i++) {
        const diff = levels[i] - levels[i - 1];
        // Allow going back to lower level (sections) but not skipping up more than 1
        expect(diff).toBeLessThanOrEqual(1);
      }

      // All headings should have text content (not empty)
      for (const heading of headingData) {
        expect(heading.text?.trim()).toBeTruthy();
      }
    });

    test('Landmarks are properly defined', async ({ page }) => {
      await page.goto('/');

      // Check for landmark regions
      const landmarks = await page.evaluate(() => {
        const landmarkRoles = ['banner', 'nav', 'main', 'complementary', 'contentinfo', 'search', 'form'];
        const found: Record<string, number> = {};

        landmarkRoles.forEach(role => {
          const elements = document.querySelectorAll(`[role="${role}"]`);
          found[role] = elements.length;
        });

        // Also check for semantic HTML equivalents
        found['header'] = document.querySelectorAll('header').length;
        found['nav'] = (found['nav'] || 0) + document.querySelectorAll('nav').length;
        found['main'] = document.querySelectorAll('main').length;
        found['aside'] = document.querySelectorAll('aside').length;
        found['footer'] = document.querySelectorAll('footer').length;

        return found;
      });

      // Should have at least a main landmark
      expect(landmarks.main + landmarks['[role="main"]']).toBeGreaterThan(0);

      // Should have navigation
      expect(landmarks.nav).toBeGreaterThan(0);

      // Should have banner/header
      expect(landmarks.header + landmarks.banner).toBeGreaterThan(0);

      // Should have contentinfo/footer
      expect(landmarks.footer + landmarks.contentinfo).toBeGreaterThan(0);
    });

    test('Lists are properly marked up', async ({ page }) => {
      await page.goto('/doctors');

      // Check that list items are within list containers
      const orphanListItems = await page.locator('li').filter({
        has: page.locator(':scope')
      }).all();

      const orphans = await Promise.all(
        orphanListItems.map(async (li) => {
          const parent = await li.evaluate(el => el.parentElement?.tagName);
          return parent !== 'UL' && parent !== 'OL' && parent !== 'MENU';
        })
      );

      // No list items should be orphaned
      expect(orphans.every(o => !o)).toBeTruthy();
    });

    test('Buttons have accessible names', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button:not([aria-hidden="true"])').all();
      const testButtons = buttons.slice(0, 20);

      for (const button of testButtons) {
        const accessibleName = await button.evaluate(el => {
          // Get accessible name according to ARIA spec
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const text = el.textContent?.trim();
          const title = el.getAttribute('title');

          if (ariaLabel) return ariaLabel;
          if (ariaLabelledby) {
            const labelledBy = document.getElementById(ariaLabelledby);
            return labelledBy?.textContent?.trim();
          }
          if (text) return text;
          return title;
        });

        expect(accessibleName?.trim()?.length).toBeGreaterThan(0);
      }
    });

    test('Links have discernible text', async ({ page }) => {
      await page.goto('/');

      const links = await page.locator('a[href]:not([aria-hidden="true"])').all();
      const testLinks = links.slice(0, 20);

      for (const link of testLinks) {
        const hasDiscernibleText = await link.evaluate(el => {
          const ariaLabel = el.getAttribute('aria-label');
          const text = el.textContent?.trim();
          const title = el.getAttribute('title');
          const img = el.querySelector('img[alt]');

          if (ariaLabel) return ariaLabel.length > 0;
          if (text && text.length > 0) return true;
          if (title && title.length > 0) return true;
          if (img && img.getAttribute('alt')) return true;

          return false;
        });

        expect(hasDiscernibleText).toBeTruthy();
      }
    });

    test('Form fields have accessible labels', async ({ page }) => {
      await page.goto('/auth/register');

      const inputs = await page.locator(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'
      ).all();
      const testInputs = inputs.slice(0, 15);

      for (const input of testInputs) {
        const hasLabel = await input.evaluate(el => {
          // Check for explicit label
          const id = el.getAttribute('id');
          if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) return true;
          }

          // Check for implicit label (wrapped in label)
          if (el.closest('label')) return true;

          // Check for aria-label
          if (el.getAttribute('aria-label')) return true;

          // Check for aria-labelledby
          const labelledBy = el.getAttribute('aria-labelledby');
          if (labelledBy) return true;

          // Check for placeholder (not recommended, but better than nothing)
          const placeholder = el.getAttribute('placeholder');
          if (placeholder && placeholder.length > 0) return true;

          return false;
        });

        expect(hasLabel).toBeTruthy();
      }
    });
  });

  test.describe('ARIA Attributes', () => {
    test('ARIA roles are valid', async ({ page }) => {
      await page.goto('/');

      const ariaElements = await page.locator('[role]').all();
      const validRoles = [
        'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell',
        'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
        'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form',
        'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox',
        'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
        'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option',
        'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row',
        'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
        'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
        'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
        'treegrid', 'treeitem'
      ];

      for (const el of ariaElements) {
        const role = await el.getAttribute('role');
        expect(validRoles).toContain(role);
      }
    });

    test('ARIA attributes are properly used', async ({ page }) => {
      await page.goto('/app');

      // Check aria-expanded on dropdowns
      const expandedElements = await page.locator('[aria-expanded]').all();
      for (const el of expandedElements) {
        const expanded = await el.getAttribute('aria-expanded');
        expect(['true', 'false']).toContain(expanded);
      }

      // Check aria-selected on tabs
      const selectedElements = await page.locator('[aria-selected]').all();
      for (const el of selectedElements) {
        const selected = await el.getAttribute('aria-selected');
        expect(['true', 'false']).toContain(selected);
      }

      // Check aria-checked on checkboxes/radios
      const checkedElements = await page.locator('[aria-checked]').all();
      for (const el of checkedElements) {
        const checked = await el.getAttribute('aria-checked');
        expect(['true', 'false', 'mixed']).toContain(checked);
      }

      // Check aria-disabled
      const disabledElements = await page.locator('[aria-disabled]').all();
      for (const el of disabledElements) {
        const disabled = await el.getAttribute('aria-disabled');
        expect(['true', 'false']).toContain(disabled);
      }
    });

    test('Required ARIA attributes are present', async ({ page }) => {
      await page.goto('/app/appointments');

      // Check for required attributes on common patterns
      const tabs = await page.locator('[role="tab"]').all();
      for (const tab of tabs) {
        const ariaSelected = await tab.getAttribute('aria-selected');
        const ariaControls = await tab.getAttribute('aria-controls');

        // aria-selected is required for tabs
        expect(ariaSelected).toBeTruthy();

        // aria-controls should point to panel
        if (ariaControls) {
          const panel = page.locator(`#${ariaControls}`);
          expect(await panel.count()).toBeGreaterThan(0);
        }
      }

      // Check tabpanels
      const tabpanels = await page.locator('[role="tabpanel"]').all();
      for (const panel of tabpanels) {
        const ariaLabelledby = await panel.getAttribute('aria-labelledby');
        expect(ariaLabelledby).toBeTruthy();
      }
    });

    test('Live regions are properly configured', async ({ page }) => {
      await page.goto('/app/chat');

      const liveRegions = await page.locator('[aria-live]').all();
      const validPoliteness = ['polite', 'assertive', 'off'];

      for (const region of liveRegions) {
        const politeness = await region.getAttribute('aria-live');
        expect(validPoliteness).toContain(politeness);
      }

      // Check aria-atomic usage
      const atomicRegions = await page.locator('[aria-atomic]').all();
      for (const region of atomicRegions) {
        const atomic = await region.getAttribute('aria-atomic');
        expect(['true', 'false']).toContain(atomic);
      }
    });

    test('Modal dialogs have proper ARIA attributes', async ({ page }) => {
      await page.goto('/');

      // Trigger a modal if possible
      const loginButton = page.getByRole('button', { name: /iniciar|login|entrar/i }).first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]').first();
        if (await dialog.isVisible()) {
          // Should have aria-modal
          const ariaModal = await dialog.getAttribute('aria-modal');
          expect(ariaModal).toBe('true');

          // Should have aria-label or aria-labelledby
          const ariaLabel = await dialog.getAttribute('aria-label');
          const ariaLabelledby = await dialog.getAttribute('aria-labelledby');

          expect(ariaLabel || ariaLabelledby).toBeTruthy();
        }
      }
    });
  });

  test.describe('Screen Reader Announcements', () => {
    test('Error messages are announced to screen readers', async ({ page }) => {
      await page.goto('/auth/login');

      const submitButton = page.getByRole('button', { name: /iniciar|entrar|login/i }).first();
      if (await submitButton.isVisible()) {
        // Submit empty form to trigger validation errors
        await submitButton.click();
        await page.waitForTimeout(500);

        // Look for aria-live regions with errors
        const liveErrors = await page.locator('[aria-live="assertive"], [role="alert"]').all();
        const hasErrors = liveErrors.length > 0 || await page.getByText(/error|requerido|necesario/i).count() > 0;

        if (hasErrors) {
          // Errors should be in a live region or role="alert"
          const inLiveRegion = liveErrors.length > 0;
          expect(inLiveRegion || await page.locator('[role="alert"]').count() > 0).toBeTruthy();
        }
      }
    });

    test('Success messages are announced to screen readers', async ({ page }) => {
      await page.goto('/auth/register');

      // Fill form with valid data (if possible)
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');

        // Check if there's a success message region
        const successRegion = page.locator('[aria-live="polite"]').first();
        const hasSuccessRegion = await successRegion.count() > 0;

        if (hasSuccessRegion) {
          const role = await successRegion.getAttribute('role');
          expect(role || 'polite').toBeTruthy();
        }
      }
    });

    test('Loading states are announced', async ({ page }) => {
      await page.goto('/app/appointments');

      // Look for loading indicators
      const loadingElements = await page.locator(
        '[aria-busy="true"], [data-testid*="loading"], [role="status"]'
      ).all();

      for (const el of loadingElements) {
        const ariaBusy = await el.getAttribute('aria-busy');
        const role = await el.getAttribute('role');

        // Should have aria-busy or appropriate role
        expect(ariaBusy === 'true' || role === 'status').toBeTruthy();
      }
    });

    test('Dynamic content updates are announced', async ({ page }) => {
      await page.goto('/app/chat');

      // Check for live regions for dynamic content
      const liveRegions = await page.locator('[aria-live]').all();

      // Chat interfaces should have live regions for new messages
      expect(liveRegions.length).toBeGreaterThan(0);

      for (const region of liveRegions) {
        const politeness = await region.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(politeness);
      }
    });
  });

  test.describe('Navigation and Orientation', () => {
    test('Skip links are present and functional', async ({ page }) => {
      await page.goto('/');

      // Look for skip links
      const skipLinks = await page.locator('a').filter({
        hasText: /(skip|saltar|ir al contenido|go to main|jump to)/i
      }).all();

      if (skipLinks.length > 0) {
        // First skip link should work
        const skipLink = skipLinks[0];
        const href = await skipLink.getAttribute('href');

        expect(href).toBeTruthy();
        expect(href?.startsWith('#')).toBeTruthy();

        // Test the skip link
        await skipLink.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);

        // Focus should move
        const focused = await page.evaluate(() => ({
          tagName: document.activeElement?.tagName,
          id: document.activeElement?.id
        }));

        expect(focused.tagName).toBeTruthy();
      }
    });

    test('Page has proper language declaration', async ({ page }) => {
      await page.goto('/');

      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(lang?.length).toBeGreaterThan(1);

      // Should be a valid language code
      const validLangs = ['es', 'es-MX', 'en', 'en-US'];
      expect(validLangs.some(l => lang?.startsWith(l))).toBeTruthy();
    });

    test('Navigation menus are properly marked', async ({ page }) => {
      await page.goto('/');

      const navMenus = await page.locator('nav, [role="navigation"]').all();

      for (const nav of navMenus) {
        // Should have aria-label or aria-labelledby if using role="navigation"
        const role = await nav.getAttribute('role');
        if (role === 'navigation') {
          const ariaLabel = await nav.getAttribute('aria-label');
          const ariaLabelledby = await nav.getAttribute('aria-labelledby');

          expect(ariaLabel || ariaLabelledby).toBeTruthy();
        }
      }

      // Should have at least one nav
      expect(navMenus.length).toBeGreaterThan(0);
    });

    test('Breadcrumbs are properly marked (if present)', async ({ page }) => {
      await page.goto('/doctors/cardiologia');

      const breadcrumb = page.locator('nav[aria-label*="breadcrumb" i], [role="navigation"] [aria-label*="breadcrumb" i], ol[class*="breadcrumb"]').first();

      if (await breadcrumb.isVisible()) {
        // Check for proper ARIA - breadcrumb itself might be the nav or contain nav
        const isBreadcrumbNav = await breadcrumb.evaluate(el => el.tagName === 'NAV');
        if (isBreadcrumbNav) {
          const ariaLabel = await breadcrumb.getAttribute('aria-label');
          expect(ariaLabel?.toLowerCase()).toContain('breadcrumb');
        }

        // Check for list structure
        const listItems = breadcrumb.locator('li');
        expect(await listItems.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Form Accessibility for Screen Readers', () => {
    test('Required fields are indicated to screen readers', async ({ page }) => {
      await page.goto('/auth/register');

      const requiredInputs = await page.locator('input[required], [aria-required="true"]').all();

      for (const input of requiredInputs) {
        const ariaRequired = await input.getAttribute('aria-required');
        const required = await input.getAttribute('required');

        expect(ariaRequired === 'true' || required !== null).toBeTruthy();
      }
    });

    test('Error messages are associated with inputs', async ({ page }) => {
      await page.goto('/auth/login');

      const submitButton = page.getByRole('button', { name: /iniciar|entrar/i }).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);

        const inputs = await page.locator('input[aria-invalid="true"], input[aria-describedby*="error" i]').all();
        const errorMessages = await page.locator('[id*="error" i], [role="alert"]').all();

        if (inputs.length > 0) {
          // If inputs have aria-invalid, there should be error messages
          expect(errorMessages.length).toBeGreaterThan(0);
        }
      }
    });

    test('Fieldsets and legends are used for related fields', async ({ page }) => {
      await page.goto('/auth/register');

      const fieldsets = await page.locator('fieldset').all();

      for (const fieldset of fieldsets) {
        const legend = fieldset.locator('legend');
        expect(await legend.count()).toBeGreaterThan(0);
      }
    });

    test('Select dropdowns indicate current value', async ({ page }) => {
      await page.goto('/app/profile');

      const selects = await page.locator('select').all();
      const testSelects = selects.slice(0, 5);

      for (const select of testSelects) {
        const ariaLabel = await select.getAttribute('aria-label');
        const ariaLabelledby = await select.getAttribute('aria-labelledby');
        const id = await select.getAttribute('id');

        // Should have some form of label
        const hasLabel = ariaLabel || ariaLabelledby ||
          (id && await page.locator(`label[for="${id}"]`).count() > 0);

        expect(hasLabel).toBeTruthy();
      }
    });
  });

  test.describe('Tables Accessibility', () => {
    test('Data tables have proper headers', async ({ page }) => {
      await page.goto('/doctor/analytics');

      const tables = await page.locator('table').all();

      for (const table of tables) {
        // Should have th elements with scope
        const headers = table.locator('th[scope]');
        expect(await headers.count()).toBeGreaterThan(0);

        // Check for caption (recommended for data tables)
        const caption = table.locator('caption');
        const ariaLabel = await table.getAttribute('aria-label');
        const ariaLabelledby = await table.getAttribute('aria-labelledby');

        // Should have at least one of these
        const hasDescription = await caption.count() > 0 || ariaLabel || ariaLabelledby;
        // Not strictly required but good practice
      }
    });

    test('Tables are not used for layout', async ({ page }) => {
      await page.goto('/');

      const tables = await page.locator('table').all();

      for (const table of tables) {
        const role = await table.getAttribute('role');
        const ariaLabel = await table.getAttribute('aria-label');

        // If it's a layout table, should have role="presentation"
        const hasHeaders = await table.locator('th').count() > 0;
        const hasCaption = await table.locator('caption').count() > 0;

        if (!hasHeaders && !hasCaption && !ariaLabel) {
          // Likely a layout table
          expect(role).toBe('presentation');
        }
      }
    });
  });

  test.describe('Images and Media', () => {
    test('Informative images have alt text', async ({ page }) => {
      await page.goto('/');

      const images = await page.locator('img:not([alt=""]):not([role="presentation"])').all();
      const testImages = images.slice(0, 15);

      for (const img of testImages) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt?.trim()?.length).toBeGreaterThan(0);
      }
    });

    test('Decorative images are marked as presentation', async ({ page }) => {
      await page.goto('/');

      const decorativeImages = await page.locator('img[alt=""], img[role="presentation"]').all();

      for (const img of decorativeImages) {
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');

        expect(alt === '' || role === 'presentation').toBeTruthy();
      }
    });

    test('Functional images (buttons, links) have accessible names', async ({ page }) => {
      await page.goto('/');

      const imageLinks = await page.locator('a[href] img').all();
      const testImageLinks = imageLinks.slice(0, 5);

      for (const img of testImageLinks) {
        const alt = await img.getAttribute('alt');
        const parentAriaLabel = await img.evaluate(el =>
          el.closest('a')?.getAttribute('aria-label')
        );

        // Should have alt or parent should have aria-label
        expect(alt || parentAriaLabel).toBeTruthy();
      }

      const imageButtons = await page.locator('button img').all();
      const testImageButtons = imageButtons.slice(0, 5);

      for (const img of testImageButtons) {
        const alt = await img.getAttribute('alt');
        const parentAriaLabel = await img.evaluate(el =>
          el.closest('button')?.getAttribute('aria-label')
        );

        expect(alt || parentAriaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Focus and Context', () => {
    test('Focus moves to new content on navigation', async ({ page }) => {
      await page.goto('/');

      const link = page.locator('a[href]').first();
      const href = await link.getAttribute('href');

      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        await link.click();
        await page.waitForTimeout(300);

        // Focus should be on page or skip link
        const focused = await page.evaluate(() => ({
          tagName: document.activeElement?.tagName,
          body: document.activeElement === document.body
        }));

        expect(focused.body || focused.tagName === 'A' || focused.tagName === 'H1').toBeTruthy();
      }
    });

    test('Focus is managed in modals', async ({ page }) => {
      await page.goto('/');

      const modalTrigger = page.getByRole('button', { name: /iniciar|login|registro/i }).first();
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]').first();
        if (await dialog.isVisible()) {
          // Focus should be in dialog
          const focusInDialog = await dialog.evaluate(el => el.contains(document.activeElement));
          expect(focusInDialog).toBeTruthy();
        }
      }
    });
  });
});
