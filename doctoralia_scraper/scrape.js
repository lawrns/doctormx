import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pLimit from 'p-limit';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import https from 'https';

const limit = pLimit(8); // Limit concurrent requests
const BASE_URL = 'https://www.doctoralia.com.mx';
const OUTPUT_DIR = './doctors_data';
const DELAY_BETWEEN_PAGES = 500; // 500ms between pages (faster scraping)

// Helper to download and convert image to WebP
async function downloadAndConvertImage(url, outputPath) {
  try {
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Download image
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

    const buffer = await response.arrayBuffer();

    // Convert to WebP using sharp
    await sharp(Buffer.from(buffer))
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`  ✓ Image saved: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`  ✗ Failed to download image ${url}:`, error.message);
    return null;
  }
}

// Extract doctor details from profile page
async function scrapeDoctorProfile(page, profileUrl, specialty, city) {
  try {
    await page.goto(profileUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    await page.waitForTimeout(500);

    const doctorData = await page.evaluate(() => {
      const data = {};

      // Basic info
      data.name = document.querySelector('h1')?.textContent?.trim() || '';
      data.specialty = document.querySelector('[itemprop="medicalSpecialty"]')?.textContent?.trim() || '';

      // Rating and reviews
      const ratingElement = document.querySelector('[itemprop="ratingValue"]');
      data.rating = ratingElement ? parseFloat(ratingElement.textContent) : null;

      const reviewCountElement = document.querySelector('[itemprop="reviewCount"]');
      data.reviewCount = reviewCountElement ? parseInt(reviewCountElement.textContent) : 0;

      // Location/address
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

      // Profile photo
      const photoElement = document.querySelector('[itemprop="image"]');
      data.photoUrl = photoElement?.getAttribute('src') || photoElement?.getAttribute('content') || '';

      // About/Bio
      data.about = document.querySelector('[itemprop="description"]')?.textContent?.trim() || '';

      // Services and prices
      data.services = [];
      const serviceElements = document.querySelectorAll('[data-test-id*="service"], .service-item, [itemtype*="Service"]');
      serviceElements.forEach(svcEl => {
        const service = {
          name: svcEl.querySelector('.service-name, [itemprop="name"]')?.textContent?.trim() || '',
          price: svcEl.querySelector('.service-price, [itemprop="price"]')?.textContent?.trim() || '',
        };
        if (service.name) data.services.push(service);
      });

      // Insurance accepted
      data.insurance = [];
      const insuranceElements = document.querySelectorAll('.insurance-item, [data-insurance]');
      insuranceElements.forEach(ins => {
        data.insurance.push(ins.textContent?.trim() || '');
      });

      // Education and experience
      data.education = [];
      const educationElements = document.querySelectorAll('[itemtype*="EducationalOccupationalCredential"], .education-item');
      educationElements.forEach(edu => {
        data.education.push(edu.textContent?.trim() || '');
      });

      // Languages
      data.languages = [];
      const languageElements = document.querySelectorAll('[data-language], .language-item');
      languageElements.forEach(lang => {
        data.languages.push(lang.textContent?.trim() || '');
      });

      return data;
    });

    // Add metadata
    doctorData.profileUrl = profileUrl;
    doctorData.scrapedAt = new Date().toISOString();

    return doctorData;
  } catch (error) {
    console.error(`  ✗ Error scraping profile ${profileUrl}:`, error.message);
    return null;
  }
}

// Scrape all doctors from a listing page (with pagination)
async function scrapeListingPage(page, specialty, city) {
  const doctors = [];
  let pageNum = 1;
  let hasMore = true;

  console.log(`\nScraping ${specialty.name} in ${city.name}...`);

  while (hasMore) {
    const url = `${BASE_URL}/${specialty.slug}/${city.slug}?page=${pageNum}`;
    console.log(`  Page ${pageNum}: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });
      await page.waitForTimeout(300);

      // Extract doctor profile URLs from this page
      const profileUrls = await page.evaluate(() => {
        const urls = [];
        const doctorCards = document.querySelectorAll('[itemtype*="schema.org/Physician"], [data-doctor-id], .doctor-card');

        doctorCards.forEach(card => {
          const link = card.querySelector('a[href*="/"]');
          if (link) {
            const href = link.getAttribute('href');
            if (href && href.includes('/')) {
              // Make absolute URL
              const fullUrl = href.startsWith('http') ? href : `https://www.doctoralia.com.mx${href}`;
              urls.push(fullUrl);
            }
          }
        });

        return [...new Set(urls)]; // Remove duplicates
      });

      console.log(`    Found ${profileUrls.length} doctors on page ${pageNum}`);

      if (profileUrls.length === 0) {
        hasMore = false;
        break;
      }

      doctors.push(...profileUrls);

      // Check if there's a next page
      const hasNextPage = await page.evaluate(() => {
        // Look for "Siguiente" link/button
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
        await page.waitForTimeout(DELAY_BETWEEN_PAGES);
      }

    } catch (error) {
      console.error(`    Error on page ${pageNum}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`  Total doctors found: ${doctors.length}`);
  return doctors;
}

// Main scraping function
async function scrapeAll() {
  console.log('Starting scraper...\n');

  // Read discovered data
  let discoveredData;
  try {
    const data = await fs.readFile('discovered_data.json', 'utf-8');
    discoveredData = JSON.parse(data);
  } catch (error) {
    console.error('Error reading discovered_data.json. Please run discover.js first.');
    return;
  }

  const { specialties, cities } = discoveredData;
  console.log(`Loaded ${specialties.length} specialties and ${cities.length} cities\n`);

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });
  const page = await browser.newPage();

  // Track overall progress
  const allDoctorUrls = new Map(); // URL -> { specialty, city }
  let totalScraped = 0;

  try {
    // Phase 1: Collect all doctor URLs
    console.log('=== PHASE 1: Collecting all doctor URLs ===\n');

    for (const specialty of specialties) {
      for (const city of cities) {
        const urls = await scrapeListingPage(page, specialty, city);

        urls.forEach(url => {
          if (!allDoctorUrls.has(url)) {
            allDoctorUrls.set(url, { specialty, city });
          }
        });

        // Small delay between combinations
        await page.waitForTimeout(200);
      }
    }

    console.log(`\n=== PHASE 1 COMPLETE ===`);
    console.log(`Total unique doctors found: ${allDoctorUrls.size}\n`);

    // Phase 2: Scrape individual profiles (parallel processing)
    console.log('=== PHASE 2: Scraping individual doctor profiles ===\n');

    const doctorEntries = Array.from(allDoctorUrls.entries());

    // Process in parallel batches
    const tasks = doctorEntries.map(([url, { specialty, city }], i) =>
      limit(async () => {
        // Create a new page for each parallel task
        const profilePage = await browser.newPage();

        try {
          console.log(`[${i + 1}/${doctorEntries.length}] Scraping: ${url}`);

          const doctorData = await scrapeDoctorProfile(profilePage, url, specialty, city);

          if (doctorData) {
            // Create directory structure: specialty/city/
            const dirPath = path.join(OUTPUT_DIR, specialty.slug, city.slug);
            await fs.mkdir(dirPath, { recursive: true });

            // Download and convert profile photo
            if (doctorData.photoUrl) {
              const photoFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
              const photoPath = path.join(dirPath, photoFileName);
              const savedPhoto = await downloadAndConvertImage(doctorData.photoUrl, photoPath);
              doctorData.localPhotoPath = savedPhoto ? photoPath : null;
            }

            // Save doctor data as JSON
            const jsonFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            const jsonPath = path.join(dirPath, jsonFileName);
            await fs.writeFile(jsonPath, JSON.stringify(doctorData, null, 2));

            console.log(`  ✓ Saved: ${jsonPath}`);
            totalScraped++;
          }
        } catch (error) {
          console.error(`  ✗ Error scraping ${url}:`, error.message);
        } finally {
          await profilePage.close();
        }
      })
    );

    // Execute all tasks with concurrency limit
    await Promise.all(tasks);

    console.log(`\n=== SCRAPING COMPLETE ===`);
    console.log(`Total doctors scraped: ${totalScraped}`);

    // Create summary file
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

scrapeAll();
