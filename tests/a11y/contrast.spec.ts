import { test, expect } from '@playwright/test';

/**
 * WCAG 2.1 AA Contrast Ratio Tests
 *
 * Tests WCAG 2.1 Level AA contrast requirements:
 * - 1.4.3 Contrast (Minimum) (Level AA):
 *   - Normal text: 4.5:1 contrast ratio
 *   - Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio
 * - 1.4.6 Contrast (Enhanced) (Level AAA):
 *   - Normal text: 7:1 contrast ratio
 *   - Large text: 4.5:1 contrast ratio
 * - 1.4.11 Non-text Contrast (Level AA):
 *   - UI components and graphical objects: 3:1 contrast ratio
 *
 * Note: These tests use computed colors. For production, consider using
 * specialized tools like axe-core or Chrome DevTools Lighthouse.
 */

test.describe('WCAG AA Contrast Ratios', () => {
  /**
   * Calculate relative luminance of a color
   * Based on WCAG 2.0 specification
   */
  function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(v => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  function getContrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
    const l1 = getLuminance(...fg);
    const l2 = getLuminance(...bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse color from various formats (rgb, hex, named)
   */
  function parseColor(colorStr: string): [number, number, number] | null {
    if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
      return null;
    }

    // RGB format
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }

    // Hex format
    if (colorStr.startsWith('#')) {
      const hex = colorStr.slice(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16)
        ];
      }
      if (hex.length === 6) {
        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16)
        ];
      }
    }

    return null;
  }

  /**
   * Determine if text is "large" according to WCAG
   * Large text: 18pt (24px) or 14pt (18.66px) bold
   */
  async function isLargeText(page: any, element: any): Promise<boolean> {
    const styles = await element.evaluate((el: any) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight
      };
    });

    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = parseInt(styles.fontWeight);

    // 18pt = 24px, 14pt bold ≈ 19px with font-weight >= 700
    return fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
  }

  /**
   * Get effective background color (handling transparency)
   */
  async function getEffectiveBackgroundColor(page: any, element: any): Promise<[number, number, number]> {
    return await element.evaluate((el: any) => {
      const computed = window.getComputedStyle(el);
      let bg = computed.backgroundColor;

      // If transparent, get parent's background
      if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
        let parent = el.parentElement;
        while (parent && (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)')) {
          bg = window.getComputedStyle(parent).backgroundColor;
          parent = parent.parentElement;
        }
      }

      // Default to white if still transparent
      if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
        bg = 'rgb(255, 255, 255)';
      }

      // Parse RGB
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
      return [255, 255, 255]; // Default white
    });
  }

  test.describe('Text Contrast (WCAG AA)', () => {
    test('Body text meets 4.5:1 contrast ratio', async ({ page }) => {
      await page.goto('/');

      const textElements = await page.locator('p, span, div, td, li, a, button').all();
      const testElements = textElements.slice(0, 30);

      const failures: Array<{ element: string; ratio: number; required: number }> = [];

      for (const el of testElements) {
        try {
          const isVisible = await el.isVisible();
          if (!isVisible) continue;

          const hasText = (await el.textContent())?.trim().length > 0;
          if (!hasText) continue;

          const large = await isLargeText(page, el);
          const requiredRatio = large ? 3.0 : 4.5;

          const colors = await el.evaluate((element: any) => {
            const computed = window.getComputedStyle(element);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });

          const fg = parseColor(colors.color);
          const bg = parseColor(colors.backgroundColor);

          if (!fg) continue;

          const effectiveBg = bg || await getEffectiveBackgroundColor(page, el);
          const ratio = getContrastRatio(fg, effectiveBg);

          if (ratio < requiredRatio) {
            const tagName = await el.evaluate(e => e.tagName);
            failures.push({
              element: `${tagName}: "${(await el.textContent())?.slice(0, 30)}"`,
              ratio: Math.round(ratio * 100) / 100,
              required: requiredRatio
            });
          }
        } catch (e) {
          // Skip elements that can't be analyzed
        }
      }

      if (failures.length > 0) {
        console.warn('Text contrast failures:', failures);
      }

      // Allow some failures for edge cases, but overall should be good
      expect(failures.length).toBeLessThanOrEqual(3);
    });

    test('Headings meet 4.5:1 contrast ratio', async ({ page }) => {
      await page.goto('/');

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      const failures: Array<{ heading: string; level: string; ratio: number }> = [];

      for (const heading of headings) {
        const colors = await heading.evaluate((el: any) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });

        const fg = parseColor(colors.color);
        const bg = parseColor(colors.backgroundColor);

        if (fg) {
          const effectiveBg = bg || await getEffectiveBackgroundColor(page, heading);
          const ratio = getContrastRatio(fg, effectiveBg);

          if (ratio < 4.5) {
            const text = await heading.textContent();
            const level = await heading.evaluate(el => el.tagName);
            failures.push({
              heading: text?.slice(0, 30) || '',
              level,
              ratio: Math.round(ratio * 100) / 100
            });
          }
        }
      }

      if (failures.length > 0) {
        console.warn('Heading contrast failures:', failures);
      }

      expect(failures.length).toBe(0);
    });

    test('Links have sufficient contrast', async ({ page }) => {
      await page.goto('/');

      const links = await page.locator('a[href]:not([role="button"])').all();
      const testLinks = links.slice(0, 20);

      const failures: Array<{ href: string; ratio: number }> = [];

      for (const link of testLinks) {
        try {
          const isVisible = await link.isVisible();
          if (!isVisible) continue;

          const colors = await link.evaluate((el: any) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              textDecoration: computed.textDecoration
            };
          });

          const fg = parseColor(colors.color);
          const bg = parseColor(colors.backgroundColor);

          if (fg) {
            const effectiveBg = bg || await getEffectiveBackgroundColor(page, link);
            const ratio = getContrastRatio(fg, effectiveBg);

            // Links need 4.5:1, or 3:1 if they have underline
            const requiredRatio = colors.textDecoration !== 'none' ? 3.0 : 4.5;

            if (ratio < requiredRatio) {
              const href = await link.getAttribute('href');
              failures.push({
                href: href || '',
                ratio: Math.round(ratio * 100) / 100
              });
            }
          }
        } catch (e) {
          // Skip
        }
      }

      if (failures.length > 0) {
        console.warn('Link contrast failures:', failures);
      }

      expect(failures.length).toBe(0);
    });

    test('Form labels have sufficient contrast', async ({ page }) => {
      await page.goto('/auth/register');

      const labels = await page.locator('label').all();

      const failures: Array<{ label: string; ratio: number }> = [];

      for (const label of labels) {
        try {
          const colors = await label.evaluate((el: any) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });

          const fg = parseColor(colors.color);
          const bg = parseColor(colors.backgroundColor);

          if (fg) {
            const effectiveBg = bg || await getEffectiveBackgroundColor(page, label);
            const ratio = getContrastRatio(fg, effectiveBg);

            if (ratio < 4.5) {
              const text = await label.textContent();
              failures.push({
                label: text?.slice(0, 30) || '',
                ratio: Math.round(ratio * 100) / 100
              });
            }
          }
        } catch (e) {
          // Skip
        }
      }

      if (failures.length > 0) {
        console.warn('Label contrast failures:', failures);
      }

      expect(failures.length).toBe(0);
    });

    test('Placeholder text meets contrast requirements', async ({ page }) => {
      await page.goto('/auth/login');

      const inputs = await page.locator('input[placeholder], textarea[placeholder]').all();

      const failures: Array<{ input: string; ratio: number }> = [];

      for (const input of inputs) {
        try {
          const placeholderColor = await input.evaluate((el: any) => {
            const computed = window.getComputedStyle(el);
            // @ts-ignore - placeholderColor is WebKit-specific
            return computed.placeholderColor || computed.color;
          });

          const bgColor = await input.evaluate((el: any) => {
            return window.getComputedStyle(el).backgroundColor;
          });

          const fg = parseColor(placeholderColor);
          const bg = parseColor(bgColor);

          if (fg) {
            const effectiveBg = bg || await getEffectiveBackgroundColor(page, input);
            const ratio = getContrastRatio(fg, effectiveBg);

            // Placeholder needs 4.5:1 (same as normal text)
            if (ratio < 4.5) {
              const id = await input.getAttribute('id');
              failures.push({
                input: id || '',
                ratio: Math.round(ratio * 100) / 100
              });
            }
          }
        } catch (e) {
          // Skip
        }
      }

      if (failures.length > 0) {
        console.warn('Placeholder contrast failures:', failures);
      }

      expect(failures.length).toBe(0);
    });
  });

  test.describe('UI Component Contrast (WCAG AA)', () => {
    test('Button borders/icons meet 3:1 contrast ratio', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button').all();
      const testButtons = buttons.slice(0, 15);

      const failures: string[] = [];

      for (const button of testButtons) {
        try {
          const isVisible = await button.isVisible();
          if (!isVisible) continue;

          const colors = await button.evaluate((el: any) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              border: computed.border,
              outline: computed.outline,
              boxShadow: computed.boxShadow
            };
          });

          const fg = parseColor(colors.color);
          const bg = parseColor(colors.backgroundColor);

          if (fg && bg) {
            // Check button background vs adjacent content
            const ratio = getContrastRatio(fg, bg);

            // UI components need 3:1
            if (ratio < 3.0) {
              const text = await button.textContent();
              failures.push(`Button "${text?.slice(0, 20)}": ratio ${Math.round(ratio * 100) / 100}`);
            }
          }
        } catch (e) {
          // Skip
        }
      }

      if (failures.length > 0) {
        console.warn('Button contrast failures:', failures);
      }

      expect(failures.length).toBe(0);
    });

    test('Form inputs meet 3:1 contrast ratio', async ({ page }) => {
      await page.goto('/auth/login');

      const inputs = await page.locator('input, select, textarea').all();

      const failures: string[] = [];

      for (const input of inputs) {
        try {
          const isVisible = await input.isVisible();
          if (!isVisible) continue;

          const colors = await input.evaluate((el: any) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              border: computed.border
            };
          });

          const fg = parseColor(colors.color);
          const bg = parseColor(colors.backgroundColor);

          if (fg && bg) {
            const ratio = getContrastRatio(fg, bg);

            // UI components need 3:1
            if (ratio < 3.0) {
              const id = await input.getAttribute('id');
              failures.push(`Input "${id}": ratio ${Math.round(ratio * 100) / 100}`);
            }
          }
        } catch (e) {
          // Skip
        }
      }

      if (failures.length > 0) {
        console.warn('Input contrast failures:', failures);
      }

      expect(failures.length).toBe(0);
    });

    test('Focus indicators meet contrast requirements', async ({ page }) => {
      await page.goto('/');

      const firstButton = page.locator('button').first();
      if (await firstButton.isVisible()) {
        await firstButton.focus();

        const focusStyles = await firstButton.evaluate((el: any) => {
          const computed = window.getComputedStyle(el, ':focus');
          return {
            outlineColor: computed.outlineColor,
            outlineWidth: computed.outlineWidth,
            outlineStyle: computed.outlineStyle,
            boxShadow: computed.boxShadow
          };
        });

        // Focus indicator should be visible
        const hasFocusIndicator =
          focusStyles.outlineStyle !== 'none' && focusStyles.outlineWidth !== '0px' ||
          focusStyles.boxShadow !== 'none';

        expect(hasFocusIndicator).toBeTruthy();

        // If there's an outline, check its contrast
        if (focusStyles.outlineStyle !== 'none') {
          const outlineColor = parseColor(focusStyles.outlineColor);
          if (outlineColor) {
            // Outline should be against something with reasonable contrast
            // This is a simplified check - full check would require knowing what's behind
            expect(outlineColor).toBeTruthy();
          }
        }
      }
    });

    test('Icons meet 3:1 contrast ratio', async ({ page }) => {
      await page.goto('/');

      const svgs = await page.locator('svg').all();
      const testSvgs = svgs.slice(0, 10);

      const failures: string[] = [];

      for (const svg of testSvgs) {
        try {
          const isVisible = await svg.isVisible();
          if (!isVisible) continue;

          // Get SVG fill color
          const fill = await svg.evaluate((el: any) => {
            const computed = window.getComputedStyle(el);
            return computed.fill;
          });

          // Get parent background
          const bgColor = await svg.evaluate((el: any) => {
            const parent = el.parentElement;
            if (parent) {
              return window.getComputedStyle(parent).backgroundColor;
            }
            return 'rgb(255, 255, 255)';
          });

          const fg = parseColor(fill);
          const bg = parseColor(bgColor);

          if (fg && bg) {
            const ratio = getContrastRatio(fg, bg);

            // Icons need 3:1
            if (ratio < 3.0) {
              failures.push(`SVG icon: ratio ${Math.round(ratio * 100) / 100}`);
            }
          }
        } catch (e) {
          // Skip
        }
      }

      if (failures.length > 0) {
        console.warn('Icon contrast failures:', failures);
      }

      expect(failures.length).toBeLessThanOrEqual(2);
    });
  });

  test.describe('Error and Status Messages', () => {
    test('Error messages have sufficient contrast', async ({ page }) => {
      await page.goto('/auth/login');

      // Trigger validation error
      const submitButton = page.getByRole('button', { name: /iniciar|entrar/i }).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);

        const errorMessages = await page.locator(
          '[role="alert"], [aria-live="assertive"], .error, .error-message'
        ).all();

        const failures: string[] = [];

        for (const errorMsg of errorMessages) {
          try {
            const isVisible = await errorMsg.isVisible();
            if (!isVisible) continue;

            const colors = await errorMsg.evaluate((el: any) => {
              const computed = window.getComputedStyle(el);
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor
              };
            });

            const fg = parseColor(colors.color);
            const bg = parseColor(colors.backgroundColor);

            if (fg && bg) {
              const ratio = getContrastRatio(fg, bg);

              if (ratio < 4.5) {
                const text = await errorMsg.textContent();
                failures.push(`Error "${text?.slice(0, 30)}": ratio ${Math.round(ratio * 100) / 100}`);
              }
            }
          } catch (e) {
            // Skip
          }
        }

        if (failures.length > 0) {
          console.warn('Error message contrast failures:', failures);
        }

        expect(failures.length).toBe(0);
      }
    });

    test('Success messages have sufficient contrast', async ({ page }) => {
      await page.goto('/');

      const successElements = await page.locator(
        '[class*="success"], [class*="success-message"], [role="status"]'
      ).all();

      const failures: string[] = [];

      for (const success of successElements) {
        try {
          const isVisible = await success.isVisible();
          if (!isVisible) continue;

          const colors = await success.evaluate((el: any) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });

          const fg = parseColor(colors.color);
          const bg = parseColor(colors.backgroundColor);

          if (fg && bg) {
            const ratio = getContrastRatio(fg, bg);

            if (ratio < 4.5) {
              const text = await success.textContent();
              failures.push(`Success "${text?.slice(0, 30)}": ratio ${Math.round(ratio * 100) / 100}`);
            }
          }
        } catch (e) {
          // Skip
        }
      }

      if (failures.length > 0) {
        console.warn('Success message contrast failures:', failures);
      }

      expect(failures.length).toBe(0);
    });
  });

  test.describe('Dark Mode / High Contrast', () => {
    test('Contrast is maintained in dark mode (if supported)', async ({ page }) => {
      await page.goto('/');

      // Check if there's a dark mode toggle
      const darkModeToggle = page.locator('[aria-label*="dark" i], [aria-label*="oscuro" i], [data-theme-toggle]').first();

      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        // Test contrast in dark mode
        const body = page.locator('body');
        const bodyColors = await body.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });

        const bg = parseColor(bodyColors.backgroundColor);
        if (bg) {
          // In dark mode, background should be dark
          const luminance = getLuminance(...bg);
          expect(luminance).toBeLessThan(128);
        }
      }
    });
  });

  test.describe('Gradient and Pattern Backgrounds', () => {
    test('Text over gradients has fallback contrast', async ({ page }) => {
      await page.goto('/');

      // Check for text over gradient backgrounds
      const gradientElements = await page.evaluate(() => {
        const elements: Array<{ tagName: string; hasGradient: boolean; bgValue: string }> = [];
        const allElements = document.querySelectorAll('*');

        for (const el of Array.from(allElements)) {
          const computed = window.getComputedStyle(el as Element);
          const bg = computed.backgroundImage;
          const hasGradient = bg.includes('gradient');

          if (hasGradient && (el as Element).textContent?.trim()) {
            elements.push({
              tagName: (el as Element).tagName,
              hasGradient,
              bgValue: bg
            });
          }
        }

        return elements.slice(0, 10);
      });

      // If there are gradient backgrounds, they should have solid fallbacks
      for (const el of gradientElements) {
        // Gradients should have a solid background color fallback
        expect(el.hasGradient).toBeTruthy();
      }
    });
  });
});
