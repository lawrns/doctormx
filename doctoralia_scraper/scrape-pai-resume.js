import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pLimit from 'p-limit';

// PAI-powered scraper with resume capability
const limit = pLimit(5); // Concurrent profile scraping
const BASE_URL = 'https://www.doctoralia.com.mx';
const OUTPUT_DIR = './doctors_data';
const DELAY_BETWEEN_PAGES = 500;
const PROGRESS_FILE = './scrape_progress.json';

// Helper to download and convert image to WebP
async function downloadAndConvertImage(url, outputPath) {
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Handle protocol-relative URLs
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    await sharp(Buffer.from(buffer))
      .webp({ quality: 85 })
      .toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error(`  ✗ Image error: ${error.message}`);
    return null;
  }
}

// Extract doctor details from profile page
async function scrapeDoctorProfile(page, profileUrl) {
  try {
    await page.goto(profileUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    await page.waitForTimeout(500);

    const doctorData = await page.evaluate(() => {
      const data = {};
      data.name = document.querySelector('h1')?.textContent?.trim() || '';
      data.specialty = document.querySelector('[itemprop="medicalSpecialty"]')?.textContent?.trim() || '';

      const ratingElement = document.querySelector('[itemprop="ratingValue"]');
      data.rating = ratingElement ? parseFloat(ratingElement.textContent) : null;

      const reviewCountElement = document.querySelector('[itemprop="reviewCount"]');
      data.reviewCount = reviewCountElement ? parseInt(reviewCountElement.textContent) : 0;

      data.addresses = [];
      const addressElements = document.querySelectorAll('[itemtype*="schema.org/Place"]');
      addressElements.forEach(addrEl => {
        const address = {
          name: addrEl.querySelector('[itemprop="name"]')?.textContent?.trim() || '',
          street: addrEl.querySelector('[itemprop="streetAddress"]')?.textContent?.trim() || '',
          city: addrEl.querySelector('[itemprop="addressLocality"]')?.textContent?.trim() || '',
          state: addrEl.querySelector('[itemprop="addressRegion"]')?.textContent?.trim() || '',
          postalCode: addrEl.querySelector('[itemprop="postalCode"]')?.textContent?.trim() || '',
          phone: addrEl.querySelector('[itemprop="telephone"]')?.textContent?.trim() || '',
        };
        data.addresses.push(address);
      });

      const photoElement = document.querySelector('[itemprop="image"]');
      data.photoUrl = photoElement?.getAttribute('src') || photoElement?.getAttribute('content') || '';
      data.about = document.querySelector('[itemprop="description"]')?.textContent?.trim() || '';

      data.services = [];
      const serviceElements = document.querySelectorAll('[data-test-id*="service"], .service-item');
      serviceElements.forEach(svcEl => {
        const service = {
          name: svcEl.querySelector('.service-name, [itemprop="name"]')?.textContent?.trim() || '',
          price: svcEl.querySelector('.service-price, [itemprop="price"]')?.textContent?.trim() || '',
        };
        if (service.name) data.services.push(service);
      });

      data.insurance = [];
      const insuranceElements = document.querySelectorAll('.insurance-item, [data-test-id*="insurance"]');
      insuranceElements.forEach(insEl => {
        const insurance = insEl.textContent?.trim();
        if (insurance) data.insurance.push(insurance);
      });

      data.education = [];
      const eduElements = document.querySelectorAll('.education-item, [data-test-id*="education"]');
      eduElements.forEach(eduEl => {
        const education = eduEl.textContent?.trim();
        if (education) data.education.push(education);
      });

      data.languages = [];
      const langElements = document.querySelectorAll('.language-item, [data-test-id*="language"]');
      langElements.forEach(langEl => {
        const language = langEl.textContent?.trim();
        if (language) data.languages.push(language);
      });

      return data;
    });

    doctorData.profileUrl = profileUrl;
    doctorData.scrapedAt = new Date().toISOString();
    return doctorData;
  } catch (error) {
    console.error(`  ✗ Profile error: ${error.message}`);
    return null;
  }
}

// Load or create progress file
async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { completed: [], currentSpecialty: null, currentCity: null };
  }
}

// Save progress
async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Check if specialty/city combination is completed
async function isCompleted(specialtySlug, citySlug, progress) {
  const dirPath = path.join(OUTPUT_DIR, specialtySlug, citySlug);
  try {
    const stats = await fs.stat(dirPath);
    const files = await fs.readdir(dirPath);
    const jsonCount = files.filter(f => f.endsWith('.json')).length;
    return jsonCount > 0 && progress.completed.includes(`${specialtySlug}/${citySlug}`);
  } catch (error) {
    return false;
  }
}

// Mark specialty/city as completed
async function markCompleted(specialtySlug, citySlug, progress) {
  const key = `${specialtySlug}/${citySlug}`;
  if (!progress.completed.includes(key)) {
    progress.completed.push(key);
    await saveProgress(progress);
  }
}

// Main scraping function with resume capability
async function scrapeAllResume() {
  console.log('🤖 PAI-Powered Doctor Scraper with Resume Capability\n');
  console.log('Checking previous progress...\n');

  let discoveredData;
  try {
    const data = await fs.readFile('discovered_data.json', 'utf-8');
    discoveredData = JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading discovered_data.json');
    return;
  }

  const { specialties, cities } = discoveredData;
  console.log(`📋 Loaded ${specialties.length} specialties and ${cities.length} cities\n`);

  const progress = await loadProgress();
  console.log(`📊 Previously completed: ${progress.completed.length} specialty/city combinations\n`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });

  let totalScraped = 0;
  let totalSkipped = 0;
  const scrapedUrls = new Set();

  try {
    for (const specialty of specialties) {
      for (const city of cities) {
        const key = `${specialty.slug}/${city.slug}`;
        
        // Check if already completed
        if (await isCompleted(specialty.slug, city.slug, progress)) {
          console.log(`⏭️  Skipping ${specialty.name} in ${city.name} (already completed)`);
          totalSkipped++;
          continue;
        }

        console.log(`\n🏥 === ${specialty.name} in ${city.name} ===`);

        const listingPage = await browser.newPage();
        let pageNum = 1;
        let hasMore = true;
        const urlsToScrape = [];

        // Collect URLs from listing pages
        while (hasMore) {
          const url = `${BASE_URL}/${specialty.slug}/${city.slug}?page=${pageNum}`;

          try {
            await listingPage.goto(url, {
              waitUntil: 'domcontentloaded',
              timeout: 45000
            });
            await listingPage.waitForTimeout(300);

            const profileUrls = await listingPage.evaluate(() => {
              const urls = [];
              const doctorCards = document.querySelectorAll('[itemtype*="schema.org/Physician"], [data-doctor-id], .doctor-card');
              doctorCards.forEach(card => {
                const link = card.querySelector('a[href*="/"]');
                if (link) {
                  const href = link.getAttribute('href');
                  if (href && href.includes('/')) {
                    const fullUrl = href.startsWith('http') ? href : `https://www.doctoralia.com.mx${href}`;
                    urls.push(fullUrl);
                  }
                }
              });
              return [...new Set(urls)];
            });

            if (profileUrls.length === 0) {
              hasMore = false;
              break;
            }

            console.log(`  📄 Page ${pageNum}: ${profileUrls.length} doctors`);
            urlsToScrape.push(...profileUrls.filter(url => !scrapedUrls.has(url)));

            const hasNextPage = await listingPage.evaluate(() => {
              const allLinks = Array.from(document.querySelectorAll('a, button'));
              const nextButton = allLinks.find(el =>
                el.textContent.trim().toLowerCase() === 'siguiente' ||
                el.classList.contains('pagination-next')
              );
              return nextButton && !nextButton.hasAttribute('disabled') && !nextButton.classList.contains('disabled');
            });

            if (!hasNextPage) {
              hasMore = false;
            } else {
              pageNum++;
              await listingPage.waitForTimeout(DELAY_BETWEEN_PAGES);
            }
          } catch (error) {
            console.error(`  ⚠️  Error on page ${pageNum}: ${error.message}`);
            hasMore = false;
          }
        }

        await listingPage.close();
        console.log(`  📋 Total URLs: ${urlsToScrape.length}`);

        // Now scrape each profile immediately (in parallel batches)
        if (urlsToScrape.length > 0) {
          console.log(`  🔍 Scraping profiles...`);

          const tasks = urlsToScrape.map((profileUrl, i) =>
            limit(async () => {
              if (scrapedUrls.has(profileUrl)) return;

              const profilePage = await browser.newPage();
              try {
                const doctorData = await scrapeDoctorProfile(profilePage, profileUrl);

                if (doctorData && doctorData.name) {
                  const dirPath = path.join(OUTPUT_DIR, specialty.slug, city.slug);
                  await fs.mkdir(dirPath, { recursive: true });

                  // Download and convert photo
                  if (doctorData.photoUrl) {
                    const photoFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
                    const photoPath = path.join(dirPath, photoFileName);
                    const savedPhoto = await downloadAndConvertImage(doctorData.photoUrl, photoPath);
                    doctorData.localPhotoPath = savedPhoto ? photoPath : null;
                  }

                  // Save JSON
                  const jsonFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
                  const jsonPath = path.join(dirPath, jsonFileName);
                  await fs.writeFile(jsonPath, JSON.stringify(doctorData, null, 2));

                  scrapedUrls.add(profileUrl);
                  totalScraped++;

                  if (totalScraped % 10 === 0) {
                    console.log(`  ✓ Saved ${totalScraped} doctors total`);
                  }
                }
              } catch (error) {
                console.error(`  ✗ Error: ${error.message}`);
              } finally {
                await profilePage.close();
              }
            })
          );

          await Promise.all(tasks);
          console.log(`  ✅ Completed: ${urlsToScrape.length} doctors saved`);
          
          // Mark as completed
          await markCompleted(specialty.slug, city.slug, progress);
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`\n🎉 === SCRAPING COMPLETE ===`);
    console.log(`📊 Total doctors scraped: ${totalScraped}`);
    console.log(`⏭️  Total combinations skipped: ${totalSkipped}`);

    const summary = {
      totalDoctors: totalScraped,
      totalSkipped: totalSkipped,
      specialties: specialties.length,
      cities: cities.length,
      scrapedAt: new Date().toISOString(),
      outputDirectory: OUTPUT_DIR
    };

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );

    // Clean up progress file
    await fs.unlink(PROGRESS_FILE).catch(() => {});
    console.log('\n🧹 Cleaned up progress file');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    console.log('\n💡 Progress saved. Run the script again to resume.');
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeAllResume().catch(console.error);
