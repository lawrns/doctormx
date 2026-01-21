import { chromium } from 'playwright';

async function analyzeDetailed() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const testUrl = 'https://www.doctoralia.com.mx/diana-selenne-hernandez-castilla/ginecologo/iztapalapa';

  console.log(`Analyzing: ${testUrl}\n`);

  await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Extract detailed data
  const extracted = await page.evaluate(() => {
    const data = {};

    // Rating from data attribute
    const profileElement = document.querySelector('[data-eec-stars-rating]');
    data.rating = profileElement?.getAttribute('data-eec-stars-rating') || null;
    data.reviewCount = profileElement?.getAttribute('data-eec-opinions-count') || null;

    // About section - try multiple selectors
    data.about_candidates = {
      about_section: document.querySelector('.about-section')?.textContent?.trim(),
      description_block: document.querySelector('.description-block')?.textContent?.trim(),
      doctor_description: document.querySelector('.doctor-description')?.textContent?.trim(),
      bio_text: document.querySelector('.bio-text')?.textContent?.trim(),
      profile_description: document.querySelector('.profile-description')?.textContent?.trim(),
      itemprop_description: document.querySelector('[itemprop="description"]')?.textContent?.trim()
    };

    // Find all headings to understand structure
    data.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName,
      text: h.textContent?.trim().slice(0, 80)
    }));

    // Services and prices - look for price-related elements
    data.services_found = [];
    document.querySelectorAll('[class*="service"], [class*="price"], [class*="treatment"]').forEach(el => {
      data.services_found.push({
        class: el.className,
        text: el.textContent?.trim().slice(0, 100)
      });
    });

    // Insurance - look for insurance-related elements
    data.insurance_found = [];
    document.querySelectorAll('[class*="insurance"], [class*="plan"]').forEach(el => {
      data.insurance_found.push({
        class: el.className,
        text: el.textContent?.trim().slice(0, 100)
      });
    });

    // Education - look for education-related elements
    data.education_found = [];
    document.querySelectorAll('[class*="education"], [class*="degree"], [class*="credential"]').forEach(el => {
      data.education_found.push({
        class: el.className,
        text: el.textContent?.trim().slice(0, 100)
      });
    });

    // Languages - look for language elements
    data.languages_found = [];
    document.querySelectorAll('[class*="language"], [class*="idioma"]').forEach(el => {
      data.languages_found.push({
        class: el.className,
        text: el.textContent?.trim().slice(0, 100)
      });
    });

    // Addresses - look for address/location elements
    data.addresses_found = [];
    document.querySelectorAll('[class*="address"], [class*="location"], [class*="clinic"], [itemtype*="Place"]').forEach(el => {
      data.addresses_found.push({
        class: el.className,
        text: el.textContent?.trim().slice(0, 150)
      });
    });

    // Look for data-* attributes that might contain structured data
    data.data_attributes = {};
    const mainElement = document.querySelector('[data-eec]');
    if (mainElement) {
      Array.from(mainElement.attributes).forEach(attr => {
        if (attr.name.startsWith('data-eec')) {
          data.data_attributes[attr.name] = attr.value;
        }
      });
    }

    return data;
  });

  console.log('=== DETAILED ANALYSIS ===\n');
  console.log(JSON.stringify(extracted, null, 2));

  await browser.close();
}

analyzeDetailed();
