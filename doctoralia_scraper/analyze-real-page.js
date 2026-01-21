import { chromium } from 'playwright';
import fs from 'fs/promises';

async function analyzePage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const profileUrl = 'https://www.doctoralia.com.mx/aida-fabiola-gonzalez-zimbron/ginecologo/miguel-hidalgo';
  
  console.log(`Fetching: ${profileUrl}`);
  await page.goto(profileUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  const html = await page.content();
  await fs.writeFile('real-page-source.html', html);
  console.log('Saved HTML to real-page-source.html');

  const analysis = await page.evaluate(() => {
    const results = {};

    // Try different selectors for name
    results.nameSelectors = [];
    const nameSelectors = [
      'h1',
      '[data-test-id="doctor-header-fullname"]',
      '.doctor-header-fullname',
      '.unified-doctor-header__name',
      '[itemprop="name"]'
    ];
    nameSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        results.nameSelectors.push({ selector: sel, text: el.textContent.trim() });
      }
    });

    // Try different selectors for photo
    results.photoSelectors = [];
    const photoSelectors = [
      '.doctor-avatar img',
      '.unified-doctor-header__avatar img',
      '[itemprop="image"]',
      'img[src*="doctoralia"]',
      'img[src*="doctor"]'
    ];
    photoSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        results.photoSelectors.push({ selector: sel, src: el.getAttribute('src') });
      }
    });

    // Try different selectors for rating
    results.ratingSelectors = [];
    const ratingSelectors = [
      '[itemprop="ratingValue"]',
      '.rating-value',
      '[data-test-id="rating"]',
      '.stars'
    ];
    ratingSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        results.ratingSelectors.push({ selector: sel, text: el.textContent.trim() });
      }
    });

    // Try different selectors for review count
    results.reviewSelectors = [];
    const reviewSelectors = [
      '[itemprop="reviewCount"]',
      '[data-test-id="review-count"]',
      '.review-count'
    ];
    reviewSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        results.reviewSelectors.push({ selector: sel, text: el.textContent.trim() });
      }
    });

    // Try different selectors for about
    results.aboutSelectors = [];
    const aboutSelectors = [
      '[data-test-id="about-description"]',
      '[itemprop="description"]',
      '.about-description',
      '.doctor-description'
    ];
    aboutSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        results.aboutSelectors.push({ selector: sel, text: el.textContent.trim().substring(0, 200) });
      }
    });

    // Try different selectors for services
    results.serviceSelectors = [];
    const serviceSelectors = [
      '[data-test-id="address-service-item"]',
      '.service-item',
      '[itemprop="offers"]',
      '.service-card'
    ];
    serviceSelectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        const sample = Array.from(els).slice(0, 3).map(el => {
          const name = el.querySelector('h4, h5, h3, [itemprop="name"]')?.textContent?.trim();
          const price = el.querySelector('.price, [itemprop="price"]')?.textContent?.trim();
          return { name, price };
        });
        results.serviceSelectors.push({ selector: sel, count: els.length, sample });
      }
    });

    // Try different selectors for addresses
    results.addressSelectors = [];
    const addressSelectors = [
      '[data-test-id="address-info-street"]',
      '[itemprop="address"]',
      '.address-info',
      '.clinic-address'
    ];
    addressSelectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        const sample = Array.from(els).slice(0, 3).map(el => el.textContent.trim());
        results.addressSelectors.push({ selector: sel, count: els.length, sample });
      }
    });

    // Try different selectors for insurance
    results.insuranceSelectors = [];
    const insuranceSelectors = [
      '[data-test-id="insurance-item"]',
      '.insurance-item',
      '[itemprop="acceptedInsurance"]',
      '.insurance-card'
    ];
    insuranceSelectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        const sample = Array.from(els).slice(0, 3).map(el => el.textContent.trim());
        results.insuranceSelectors.push({ selector: sel, count: els.length, sample });
      }
    });

    // Look for any data attributes
    results.dataAttributes = [];
    document.querySelectorAll('[data-test-id]').forEach(el => {
      const testId = el.getAttribute('data-test-id');
      if (testId && !results.dataAttributes.includes(testId)) {
        results.dataAttributes.push(testId);
      }
    });

    return results;
  });

  console.log('\n=== ANALYSIS RESULTS ===\n');
  console.log(JSON.stringify(analysis, null, 2));

  await browser.close();
}

analyzePage().catch(console.error);
