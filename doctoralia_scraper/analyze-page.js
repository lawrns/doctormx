import { chromium } from 'playwright';
import fs from 'fs/promises';

async function analyzePage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const testUrl = 'https://www.doctoralia.com.mx/diana-selenne-hernandez-castilla/ginecologo/iztapalapa';

  console.log(`Analyzing: ${testUrl}\n`);

  await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Get the fully rendered HTML
  const html = await page.content();
  await fs.writeFile('page-source.html', html);
  console.log('Full HTML saved to page-source.html\n');

  // Extract all the data we can find
  const extracted = await page.evaluate(() => {
    const data = {};

    // Name - try multiple approaches
    data.name_h1 = document.querySelector('h1')?.textContent?.trim();
    data.name_config = window.ZLApp?.AppConfig?.DOCTOR?.FULLNAME;
    data.name_meta = document.querySelector('meta[property="og:title"]')?.content;

    // Specialty
    data.specialty_config = window.ZLApp?.AppConfig?.SPECIALIZATION?.NAME;
    data.specialty_breadcrumb = Array.from(document.querySelectorAll('.breadcrumb a, .breadcrumb span')).map(e => e.textContent.trim());

    // Rating
    data.rating_score = document.querySelector('.rating-score, .stars-score, [data-score]')?.textContent;
    data.rating_itemprop = document.querySelector('[itemprop="ratingValue"]')?.textContent;
    data.rating_aggregateRating = document.querySelector('[itemprop="aggregateRating"]');

    // Reviews
    data.reviews_count = document.querySelector('[itemprop="reviewCount"]')?.textContent;
    data.reviews_alt = document.querySelector('.reviews-count, [data-reviews]')?.textContent;

    // Photo
    data.photo_itemprop = document.querySelector('[itemprop="image"]')?.getAttribute('src') ||
                          document.querySelector('[itemprop="image"]')?.getAttribute('content');
    data.photo_config = window.ZLApp?.AppConfig?.DOCTOR?.AVATAR;
    const doctorImg = document.querySelector('img[alt*="Dr"], img.doctor-photo, img[src*="doctor"]');
    data.photo_img = doctorImg?.src || doctorImg?.srcset;

    // About
    data.about_itemprop = document.querySelector('[itemprop="description"]')?.textContent?.trim();
    data.about_section = document.querySelector('.about, .description, .doctor-bio, #about')?.textContent?.trim();

    // Addresses
    data.addresses = [];
    const addressElements = document.querySelectorAll('[itemtype*="Place"], .address-item, .clinic-address');
    addressElements.forEach(addr => {
      data.addresses.push({
        full: addr.textContent?.trim(),
        street: addr.querySelector('[itemprop="streetAddress"]')?.textContent?.trim(),
        city: addr.querySelector('[itemprop="addressLocality"]')?.textContent?.trim()
      });
    });

    // Check for ZLApp config
    if (window.ZLApp && window.ZLApp.AppConfig) {
      data.zlapp_available = true;
      data.zlapp_doctor = window.ZLApp.AppConfig.DOCTOR;
      data.zlapp_specialization = window.ZLApp.AppConfig.SPECIALIZATION;
    }

    // All class names on the page
    data.all_classes = Array.from(new Set(
      Array.from(document.querySelectorAll('*'))
        .flatMap(el => Array.from(el.classList))
    )).slice(0, 50);

    return data;
  });

  console.log('=== EXTRACTED DATA ===\n');
  console.log(JSON.stringify(extracted, null, 2));

  await browser.close();
}

analyzePage();
