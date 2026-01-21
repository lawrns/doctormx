import { chromium } from 'playwright';

async function testExtraction() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const testUrl = 'https://www.doctoralia.com.mx/diana-selenne-hernandez-castilla/ginecologo/iztapalapa';

  console.log(`Testing extraction on: ${testUrl}\n`);

  await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: 'test-page.png', fullPage: true });
  console.log('Screenshot saved: test-page.png\n');

  const data = await page.evaluate(() => {
    const result = {
      selectors_found: {},
      data: {}
    };

    // Test various selectors
    const selectors = {
      h1: document.querySelector('h1'),
      h1_text: document.querySelector('h1')?.textContent,
      specialty_meta: document.querySelector('[itemprop="medicalSpecialty"]'),
      specialty_breadcrumb: document.querySelector('.breadcrumb'),
      rating: document.querySelector('[itemprop="ratingValue"]'),
      rating_alt: document.querySelector('.rating-score, .stars-score, [data-rating]'),
      reviewCount: document.querySelector('[itemprop="reviewCount"]'),
      photo: document.querySelector('[itemprop="image"]'),
      photo_alt: document.querySelector('img[src*="doctor"], img[alt*="Dr"], .doctor-photo'),
      about: document.querySelector('[itemprop="description"]'),
      about_alt: document.querySelector('.about, .description, .bio'),
    };

    // Record what we found
    Object.entries(selectors).forEach(([key, element]) => {
      result.selectors_found[key] = element ? 'FOUND' : 'NOT FOUND';
      if (element && element.textContent) {
        result.data[key] = element.textContent.substring(0, 100);
      }
      if (element && element.tagName === 'IMG') {
        result.data[key] = element.src || element.srcset;
      }
    });

    // Get all h1-h6 tags
    result.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
      tag: h.tagName,
      text: h.textContent.trim().substring(0, 50)
    }));

    // Get all images
    result.images = Array.from(document.querySelectorAll('img')).slice(0, 10).map(img => ({
      src: img.src,
      alt: img.alt
    }));

    // Check for schema.org data
    const schemaScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    result.schemaData = schemaScripts.map(s => {
      try {
        return JSON.parse(s.textContent);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    return result;
  });

  console.log('=== EXTRACTION TEST RESULTS ===\n');
  console.log('Selectors found:');
  console.log(JSON.stringify(data.selectors_found, null, 2));
  console.log('\nData extracted:');
  console.log(JSON.stringify(data.data, null, 2));
  console.log('\nHeadings found:');
  console.log(JSON.stringify(data.headings, null, 2));
  console.log('\nImages found:');
  console.log(JSON.stringify(data.images, null, 2));
  console.log('\nSchema.org data:');
  console.log(JSON.stringify(data.schemaData, null, 2));

  console.log('\n\nPress Ctrl+C to close...');
  await page.waitForTimeout(60000);

  await browser.close();
}

testExtraction();
