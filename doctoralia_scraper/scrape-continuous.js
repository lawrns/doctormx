import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pLimit from 'p-limit';

const limit = pLimit(5); // Concurrent profile scraping
const BASE_URL = 'https://www.doctoralia.com.mx';
const OUTPUT_DIR = './doctors_data';
const DELAY_BETWEEN_PAGES = 500;

// Helper to download and convert image to WebP
async function downloadAndConvertImage(url, outputPath) {
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
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

// Main scraping function - saves continuously
async function scrapeAllContinuous() {
  console.log('Starting continuous scraper (saves as it goes)...\n');

  let discoveredData;
  try {
    const data = await fs.readFile('discovered_data.json', 'utf-8');
    discoveredData = JSON.parse(data);
  } catch (error) {
    console.error('Error reading discovered_data.json');
    return;
  }

  const { specialties, cities } = discoveredData;
  console.log(`Loaded ${specialties.length} specialties and ${cities.length} cities\n`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });

  let totalScraped = 0;
  const scrapedUrls = new Set(); // Track to avoid duplicates

  try {
    for (const specialty of specialties) {
      for (const city of cities) {
        console.log(`\n=== ${specialty.name} in ${city.name} ===`);

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

            console.log(`  Page ${pageNum}: ${profileUrls.length} doctors`);
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
            console.error(`  Error on page ${pageNum}: ${error.message}`);
            hasMore = false;
          }
        }

        await listingPage.close();
        console.log(`  Total URLs: ${urlsToScrape.length}`);

        // Now scrape each profile immediately (in parallel batches)
        if (urlsToScrape.length > 0) {
          console.log(`  Scraping profiles...`);

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
          console.log(`  ✓ Completed: ${urlsToScrape.length} doctors saved`);
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`\n=== SCRAPING COMPLETE ===`);
    console.log(`Total doctors scraped: ${totalScraped}`);

    const summary = {
      totalDoctors: totalScraped,
      specialties: specialties.length,
      cities: cities.length,
      scrapedAt: new Date().toISOString(),
      outputDirectory: OUTPUT_DIR
    };

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await browser.close();
  }
}

scrapeAllContinuous();
