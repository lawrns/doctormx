import { chromium } from 'playwright';

async function testRealPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Test with a real doctor URL
  const testUrl = 'https://www.doctoralia.com.mx/iris-andrea-ledezma-osorio/ginecologo/coyoacan';

  console.log('Loading page...');
  await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 60000 });

  console.log('\n=== Testing Selectors ===\n');

  const tests = await page.evaluate(() => {
    const results = {};

    // Test name
    results.name_h1 = document.querySelector('h1')?.textContent?.trim();
    results.name_h2 = document.querySelector('h2')?.textContent?.trim();

    // Test specialty
    results.specialty_itemprop = document.querySelector('[itemprop="medicalSpecialty"]')?.textContent?.trim();
    results.specialty_class = document.querySelector('.specialties')?.textContent?.trim();
    results.specialty_heading = document.querySelector('h3, h4')?.textContent?.trim();

    // Test rating
    results.rating_itemprop = document.querySelector('[itemprop="ratingValue"]')?.textContent?.trim();
    results.rating_class = document.querySelector('.rating-value, .stars')?.textContent?.trim();

    // Test photo
    const photoImg = document.querySelector('[itemprop="image"]');
    results.photo_itemprop_src = photoImg?.getAttribute('src');
    results.photo_itemprop_content = photoImg?.getAttribute('content');
    const mainImg = document.querySelector('.doctor-avatar img, .doctor-photo img, img[alt*="Dr"]');
    results.photo_main_img = mainImg?.getAttribute('src');

    // Test about/description
    results.about_itemprop = document.querySelector('[itemprop="description"]')?.textContent?.trim()?.substring(0, 100);
    results.about_class = document.querySelector('.about-doctor, .description, .doctor-bio')?.textContent?.trim()?.substring(0, 100);

    // Count different elements
    results.address_count_itemprop = document.querySelectorAll('[itemtype*="schema.org/Place"]').length;
    results.address_count_class = document.querySelectorAll('.address-card, .clinic-address').length;

    results.service_count_testid = document.querySelectorAll('[data-test-id*="service"]').length;
    results.service_count_class = document.querySelectorAll('.service-item, .service-card').length;

    return results;
  });

  console.log(JSON.stringify(tests, null, 2));

  // Save page source for analysis
  const content = await page.content();
  const fs = await import('fs/promises');
  await fs.writeFile('test-page-source.html', content);
  console.log('\n✓ Page source saved to test-page-source.html');

  console.log('\nKeeping browser open for 30 seconds - inspect the page...');
  await page.waitForTimeout(30000);

  await browser.close();
}

testRealPage().catch(console.error);
