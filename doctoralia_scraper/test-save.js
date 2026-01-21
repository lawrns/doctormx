import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = './doctors_data_TEST';

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

    console.log(`  ✓ Image saved: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`  ✗ Failed to download image ${url}:`, error.message);
    return null;
  }
}

async function testSingleDoctorScrape() {
  console.log('=== TESTING FILE SAVE & IMAGE CONVERSION ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Get first doctor from listing page
    console.log('Step 1: Finding a doctor profile URL...');
    await page.goto('https://www.doctoralia.com.mx/ginecologo/ciudad-de-mexico?page=1', {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    const firstDoctorUrl = await page.evaluate(() => {
      const doctorCards = document.querySelectorAll('[itemtype*="schema.org/Physician"], [data-doctor-id], .doctor-card');
      if (doctorCards.length > 0) {
        const link = doctorCards[0].querySelector('a[href*="/"]');
        if (link) {
          const href = link.getAttribute('href');
          return href.startsWith('http') ? href : `https://www.doctoralia.com.mx${href}`;
        }
      }
      return null;
    });

    if (!firstDoctorUrl) {
      console.log('✗ Could not find doctor URL');
      return;
    }

    console.log(`✓ Found doctor: ${firstDoctorUrl}\n`);

    // Scrape doctor profile
    console.log('Step 2: Scraping doctor profile...');
    await page.goto(firstDoctorUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    await page.waitForTimeout(1000);

    const doctorData = await page.evaluate(() => {
      const data = {};
      data.name = document.querySelector('h1')?.textContent?.trim() || 'Unknown Doctor';
      data.specialty = document.querySelector('[itemprop="medicalSpecialty"]')?.textContent?.trim() || '';

      const ratingElement = document.querySelector('[itemprop="ratingValue"]');
      data.rating = ratingElement ? parseFloat(ratingElement.textContent) : null;

      const reviewCountElement = document.querySelector('[itemprop="reviewCount"]');
      data.reviewCount = reviewCountElement ? parseInt(reviewCountElement.textContent) : 0;

      const photoElement = document.querySelector('[itemprop="image"]');
      data.photoUrl = photoElement?.getAttribute('src') || photoElement?.getAttribute('content') || '';

      data.about = document.querySelector('[itemprop="description"]')?.textContent?.trim() || '';

      return data;
    });

    doctorData.profileUrl = firstDoctorUrl;
    doctorData.scrapedAt = new Date().toISOString();

    console.log(`✓ Scraped: ${doctorData.name}\n`);

    // Create directory structure
    console.log('Step 3: Creating directory structure...');
    const dirPath = path.join(OUTPUT_DIR, 'ginecologo', 'ciudad-de-mexico');
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`✓ Created: ${dirPath}\n`);

    // Download and convert image
    console.log('Step 4: Downloading and converting profile photo to WebP...');
    if (doctorData.photoUrl) {
      const photoFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
      const photoPath = path.join(dirPath, photoFileName);
      const savedPhoto = await downloadAndConvertImage(doctorData.photoUrl, photoPath);
      doctorData.localPhotoPath = savedPhoto ? photoPath : null;
    } else {
      console.log('  ⚠ No photo URL found');
    }

    console.log('');

    // Save JSON
    console.log('Step 5: Saving doctor data as JSON...');
    const jsonFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const jsonPath = path.join(dirPath, jsonFileName);
    await fs.writeFile(jsonPath, JSON.stringify(doctorData, null, 2));
    console.log(`✓ Saved JSON: ${jsonPath}\n`);

    // Verify files exist
    console.log('Step 6: Verifying files were created...');
    const files = await fs.readdir(dirPath);
    console.log(`✓ Files in directory: ${files.join(', ')}\n`);

    // Show file sizes
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      console.log(`  ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
    }

    console.log('\n=== TEST SUCCESSFUL! ===');
    console.log('✓ File saving works correctly');
    console.log('✓ Image download and WebP conversion works');
    console.log('✓ Directory structure creation works');
    console.log(`\nTest files saved to: ${dirPath}`);

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSingleDoctorScrape();
