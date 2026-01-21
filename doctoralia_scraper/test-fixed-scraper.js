import { chromium } from 'playwright';

async function testFixedScraper() {
  console.log('🧪 Testing Fixed Scraper\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const testUrl = 'https://www.doctoralia.com.mx/aida-fabiola-gonzalez-zimbron/ginecologo/miguel-hidalgo';
  
  console.log(`Testing: ${testUrl}\n`);

  await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const doctorData = await page.evaluate(() => {
    const data = {};

    // Name
    const nameEl = document.querySelector('[data-test-id="doctor-header-fullname"], h1, [itemprop="name"]');
    data.name = nameEl?.textContent?.replace(/\s+/g, ' ').trim() || '';

    // Specialty
    const specEl = document.querySelector('h2');
    data.specialty = specEl?.textContent?.split('·')[0]?.replace(/\s+/g, ' ').trim() || '';

    // Rating - from data-score attribute
    const ratingEl = document.querySelector('.rating[data-score]');
    data.rating = ratingEl ? parseFloat(ratingEl.getAttribute('data-score')) : null;

    // Review count
    const reviewText = document.body.textContent.match(/(\d+)\s*opini[oó]n/i);
    data.reviewCount = reviewText ? parseInt(reviewText[1]) : 0;

    // Photo - CORRECT selector
    const photoEl = document.querySelector('img[src*="doctoralia"], img[src*="doctor"]');
    data.photoUrl = photoEl?.getAttribute('src') || '';

    // About
    const aboutEl = document.querySelector('[data-test-id="about-description"], .about-description, [itemprop="description"]');
    data.about = aboutEl?.textContent?.replace(/\s+/g, ' ').trim() || '';

    // Addresses
    data.addresses = [];
    const addrs = document.querySelectorAll('[data-test-id="address-info-street"]');
    addrs.forEach(a => {
      const full = a?.textContent?.replace(/\s+/g, ' ').trim();
      if (full) data.addresses.push({ full });
    });

    // Services - CORRECT extraction
    data.services = [];
    const svcs = document.querySelectorAll('[data-test-id="address-service-item"]');
    svcs.forEach(s => {
      const name = s.querySelector('a')?.textContent?.trim();
      const price = s.querySelector('[data-id="service-price"]')?.textContent?.trim();
      if (name) {
        data.services.push({ 
          name, 
          price: price || '' 
        });
      }
    });

    // Insurance
    data.insurance = [];
    const insItems = document.querySelectorAll('[data-test-id*="insurance"], .insurance-item, [itemprop="acceptedInsurance"]');
    insItems.forEach(i => {
      const name = i.textContent?.trim();
      if (name && !data.insurance.includes(name)) {
        data.insurance.push(name);
      }
    });

    // Education
    data.education = [];
    const eduItems = document.querySelectorAll('[data-test-id*="education"], .education-item, [itemprop="education"]');
    eduItems.forEach(e => {
      const name = e.textContent?.trim();
      if (name && !data.education.includes(name)) {
        data.education.push(name);
      }
    });

    // Languages
    data.languages = [];
    const langItems = document.querySelectorAll('[data-test-id*="language"], .language-item, [itemprop="knowsLanguage"]');
    langItems.forEach(l => {
      const name = l.textContent?.trim();
      if (name && !data.languages.includes(name)) {
        data.languages.push(name);
      }
    });

    return data;
  });

  doctorData.profileUrl = testUrl;
  doctorData.scrapedAt = new Date().toISOString();

  console.log('=== EXTRACTED DATA ===\n');
  console.log(JSON.stringify(doctorData, null, 2));

  console.log('\n=== VALIDATION ===\n');
  console.log(`✓ Name: ${doctorData.name ? 'EXTRACTED' : 'MISSING'}`);
  console.log(`✓ Specialty: ${doctorData.specialty ? 'EXTRACTED' : 'MISSING'}`);
  console.log(`✓ Rating: ${doctorData.rating !== null ? 'EXTRACTED (' + doctorData.rating + ')' : 'MISSING'}`);
  console.log(`✓ Review Count: ${doctorData.reviewCount > 0 ? 'EXTRACTED (' + doctorData.reviewCount + ')' : 'MISSING'}`);
  console.log(`✓ Photo URL: ${doctorData.photoUrl ? 'EXTRACTED' : 'MISSING'}`);
  console.log(`✓ About: ${doctorData.about ? 'EXTRACTED (' + doctorData.about.length + ' chars)' : 'MISSING'}`);
  console.log(`✓ Addresses: ${doctorData.addresses.length} found`);
  console.log(`✓ Services: ${doctorData.services.length} found`);
  console.log(`✓ Insurance: ${doctorData.insurance.length} found`);
  console.log(`✓ Education: ${doctorData.education.length} found`);
  console.log(`✓ Languages: ${doctorData.languages.length} found`);

  if (doctorData.services.length > 0) {
    console.log('\n=== SAMPLE SERVICES ===\n');
    doctorData.services.slice(0, 3).forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} - ${s.price}`);
    });
  }

  await browser.close();

  // Save test result
  const fs = await import('fs/promises');
  await fs.writeFile('test-fixed-result.json', JSON.stringify(doctorData, null, 2));
  console.log('\n✅ Test result saved to test-fixed-result.json');

  return doctorData;
}

testFixedScraper().catch(console.error);
