import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pLimit from 'p-limit';

const limit = pLimit(5); // Concurrent profile scraping
const BASE_URL = 'https://www.doctoralia.com.mx';
const OUTPUT_DIR = './doctors_data';
const DELAY_BETWEEN_PAGES = 500;

async function downloadAndConvertImage(url, outputPath) {
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    await sharp(Buffer.from(buffer)).webp({ quality: 85 }).toFile(outputPath);
    return outputPath;
  } catch (error) {
    return null;
  }
}

async function scrapeDoctorProfile(page, profileUrl) {
  try {
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(300);

    const doctorData = await page.evaluate(() => {
      const data = {};
      data.name = document.querySelector('h1')?.textContent?.trim().replace(/\s+/g, ' ') || '';
      data.specialty = document.querySelector('[itemprop="medicalSpecialty"]')?.textContent?.trim() || '';
      const ratingEl = document.querySelector('[itemprop="ratingValue"]');
      data.rating = ratingEl ? parseFloat(ratingEl.textContent) : null;
      const reviewEl = document.querySelector('[itemprop="reviewCount"]');
      data.reviewCount = reviewEl ? parseInt(reviewEl.textContent) : 0;
      const photoEl = document.querySelector('[itemprop="image"]');
      data.photoUrl = photoEl?.getAttribute('src') || photoEl?.getAttribute('content') || '';
      data.about = document.querySelector('[itemprop="description"]')?.textContent?.trim() || '';
      return data;
    });

    doctorData.profileUrl = profileUrl;
    doctorData.scrapedAt = new Date().toISOString();
    return doctorData;
  } catch (error) {
    return null;
  }
}

async function scrapeImmediately() {
  console.log('🚀 IMMEDIATE SCRAPER - Saves files instantly!\n');

  let discoveredData;
  try {
    const data = await fs.readFile('discovered_data.json', 'utf-8');
    discoveredData = JSON.parse(data);
  } catch (error) {
    console.error('Error reading discovered_data.json');
    return;
  }

  const { specialties, cities } = discoveredData;
  console.log(`📋 ${specialties.length} specialties × ${cities.length} cities\n`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });

  let totalScraped = 0;
  const scrapedUrls = new Set();

  try {
    for (const specialty of specialties) {
      for (const city of cities) {
        console.log(`\n📍 ${specialty.name} in ${city.name}`);

        const listingPage = await browser.newPage();
        let pageNum = 1;
        let hasMore = true;

        while (hasMore) {
          const url = `${BASE_URL}/${specialty.slug}/${city.slug}?page=${pageNum}`;

          try {
            await listingPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await listingPage.waitForTimeout(300);

            const profileUrls = await listingPage.evaluate(() => {
              const urls = [];
              const cards = document.querySelectorAll('[itemtype*="Physician"], [data-doctor-id], .doctor-card');
              cards.forEach(card => {
                const link = card.querySelector('a[href*="/"]');
                if (link) {
                  const href = link.getAttribute('href');
                  if (href && href.includes('/')) {
                    urls.push(href.startsWith('http') ? href : `https://www.doctoralia.com.mx${href}`);
                  }
                }
              });
              return [...new Set(urls)];
            });

            if (profileUrls.length === 0) {
              hasMore = false;
              break;
            }

            const newUrls = profileUrls.filter(u => !scrapedUrls.has(u));
            console.log(`  Page ${pageNum}: ${newUrls.length} new doctors`);

            // SCRAPE AND SAVE IMMEDIATELY - page by page
            const tasks = newUrls.map(profileUrl =>
              limit(async () => {
                const profilePage = await browser.newPage();
                try {
                  const doctorData = await scrapeDoctorProfile(profilePage, profileUrl);

                  if (doctorData && doctorData.name) {
                    const dirPath = path.join(OUTPUT_DIR, specialty.slug, city.slug);
                    await fs.mkdir(dirPath, { recursive: true });

                    if (doctorData.photoUrl) {
                      const photoFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
                      const photoPath = path.join(dirPath, photoFileName);
                      const saved = await downloadAndConvertImage(doctorData.photoUrl, photoPath);
                      doctorData.localPhotoPath = saved ? photoPath : null;
                    }

                    const jsonFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
                    const jsonPath = path.join(dirPath, jsonFileName);
                    await fs.writeFile(jsonPath, JSON.stringify(doctorData, null, 2));

                    scrapedUrls.add(profileUrl);
                    totalScraped++;

                    if (totalScraped % 20 === 0) {
                      console.log(`  ✅ ${totalScraped} doctors saved total`);
                    }
                  }
                } catch (err) {
                  // Silent fail
                } finally {
                  await profilePage.close();
                }
              })
            );

            await Promise.all(tasks);
            console.log(`  ✓ Page ${pageNum} complete - ${newUrls.length} saved`);

            const hasNextPage = await listingPage.evaluate(() => {
              const allLinks = Array.from(document.querySelectorAll('a, button'));
              const nextBtn = allLinks.find(el =>
                el.textContent.trim().toLowerCase() === 'siguiente' ||
                el.classList.contains('pagination-next')
              );
              return nextBtn && !nextBtn.hasAttribute('disabled') && !nextBtn.classList.contains('disabled');
            });

            if (!hasNextPage) {
              hasMore = false;
            } else {
              pageNum++;
              await listingPage.waitForTimeout(DELAY_BETWEEN_PAGES);
            }
          } catch (error) {
            console.error(`  ❌ Error page ${pageNum}: ${error.message}`);
            hasMore = false;
          }
        }

        await listingPage.close();
        console.log(`  ✅ ${city.name} complete!`);
      }
    }

    console.log(`\n🎉 COMPLETE! Total: ${totalScraped} doctors`);

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'summary.json'),
      JSON.stringify({
        totalDoctors: totalScraped,
        scrapedAt: new Date().toISOString()
      }, null, 2)
    );

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await browser.close();
  }
}

scrapeImmediately();
