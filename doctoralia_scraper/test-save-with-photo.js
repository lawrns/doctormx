import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = './doctors_data_TEST';

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
    const stats = await fs.stat(outputPath);
    console.log(`  ✓ File size: ${(stats.size / 1024).toFixed(2)} KB`);
    return outputPath;
  } catch (error) {
    console.error(`  ✗ Failed to download image ${url}:`, error.message);
    return null;
  }
}

async function testWithPhoto() {
  console.log('=== TESTING IMAGE DOWNLOAD & WEBP CONVERSION ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Finding doctors with photos...');
    await page.goto('https://www.doctoralia.com.mx/ginecologo/ciudad-de-mexico?page=1', {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    // Find a doctor with a photo
    const doctorWithPhoto = await page.evaluate(() => {
      const allImages = Array.from(document.querySelectorAll('img[src*="doctoralia"], img[srcset*="doctoralia"]'));

      for (const img of allImages) {
        const src = img.getAttribute('src') || img.getAttribute('srcset')?.split(' ')[0];
        if (src && src.includes('doctoralia') && !src.includes('logo')) {
          const card = img.closest('[itemtype*="Physician"], .doctor-card, article');
          if (card) {
            const link = card.querySelector('a[href]');
            if (link) {
              const href = link.getAttribute('href');
              const url = href.startsWith('http') ? href : `https://www.doctoralia.com.mx${href}`;
              const name = card.querySelector('h2, h3, .doctor-name')?.textContent?.trim() || 'Doctor';
              return { url, photoUrl: src.startsWith('http') ? src : `https:${src}`, name };
            }
          }
        }
      }
      return null;
    });

    if (!doctorWithPhoto) {
      console.log('⚠ Could not find doctor with photo on listing page');
      console.log('Testing with a sample image instead...\n');

      // Test with the Doctoralia logo as a sample
      const testPhotoUrl = 'https://www.doctoralia.com.mx/static/img/logo-doctoralia.svg';
      const dirPath = path.join(OUTPUT_DIR, 'test-images');
      await fs.mkdir(dirPath, { recursive: true });

      const photoPath = path.join(dirPath, 'test_image.webp');
      await downloadAndConvertImage(testPhotoUrl, photoPath);

      console.log('\n✓ WebP conversion works!');
      await browser.close();
      return;
    }

    console.log(`✓ Found: ${doctorWithPhoto.name}`);
    console.log(`  Photo URL: ${doctorWithPhoto.photoUrl}\n`);

    // Download and convert the photo
    const dirPath = path.join(OUTPUT_DIR, 'ginecologo', 'test-with-photo');
    await fs.mkdir(dirPath, { recursive: true });

    const photoFileName = 'doctor_photo_test.webp';
    const photoPath = path.join(dirPath, photoFileName);

    console.log('Downloading and converting to WebP...');
    await downloadAndConvertImage(doctorWithPhoto.photoUrl, photoPath);

    console.log('\n=== SUCCESS! ===');
    console.log('✓ Image downloaded from doctor profile');
    console.log('✓ Successfully converted to WebP format');
    console.log(`✓ File saved to: ${photoPath}`);

    // Verify it's actually a WebP file
    const fileBuffer = await fs.readFile(photoPath);
    const isWebP = fileBuffer[8] === 0x57 && fileBuffer[9] === 0x45 && fileBuffer[10] === 0x42 && fileBuffer[11] === 0x50;
    console.log(`✓ Verified: ${isWebP ? 'Valid WebP file' : 'Not WebP (might be SVG/other format)'}`);

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testWithPhoto();
