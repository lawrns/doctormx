import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pLimit from 'p-limit';

const limit = pLimit(15);
const BASE_URL = 'https://www.doctoralia.com.mx';
const OUTPUT_DIR = './doctors_data';
const DELAY_BETWEEN_PAGES = 150;

async function downloadAndConvertImage(url, outputPath) {
  try {
    if (!url || url.includes('placeholder') || url.includes('default')) return null;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    await sharp(Buffer.from(buffer)).webp({ quality: 85 }).toFile(outputPath);
    return outputPath;
  } catch (error) {
    return null;
  }
}

async function scrapeDoctorProfile(page, profileUrl) {
  try {
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500); // Wait for JS to execute

    const doctorData = await page.evaluate(() => {
      const data = {};

      // Name - try multiple sources
      data.name = document.querySelector('h1')?.textContent?.trim().replace(/\s+/g, ' ') ||
                  window.ZLApp?.AppConfig?.DOCTOR?.FULLNAME?.trim() || '';

      // Specialty - from config
      data.specialty = window.ZLApp?.AppConfig?.SPECIALIZATION?.NAME || '';

      // Rating and review count - from data attributes
      const profileElement = document.querySelector('[data-eec-stars-rating]');
      const ratingValue = profileElement?.getAttribute('data-eec-stars-rating');
      const reviewCountValue = profileElement?.getAttribute('data-eec-opinions-count');
      data.rating = ratingValue ? parseFloat(ratingValue) : null;
      data.reviewCount = reviewCountValue ? parseInt(reviewCountValue) : 0;

      // Photo - try multiple sources
      data.photoUrl = document.querySelector('img[src*="amazonaws"]')?.src ||
                     document.querySelector('img[alt*="Dr"]')?.src ||
                     document.querySelector('.doctor-photo img')?.src ||
                     window.ZLApp?.AppConfig?.DOCTOR?.AVATAR || '';

      // About/Description
      data.about = document.querySelector('[data-test-id="about-description"]')?.textContent?.trim() || '';

      // Addresses - extract from data-test-id elements
      data.addresses = [];
      const addressStreets = document.querySelectorAll('[data-test-id="address-info-street"]');
      addressStreets.forEach(streetEl => {
        const parent = streetEl.closest('h4, div');
        const fullAddress = parent?.textContent?.trim().replace(/\s+/g, ' ') || '';
        if (fullAddress) {
          data.addresses.push({ full: fullAddress });
        }
      });

      // Services - extract from address-service-item elements
      data.services = [];
      const serviceItems = document.querySelectorAll('[data-test-id="address-service-item"]');
      serviceItems.forEach(item => {
        const nameEl = item.querySelector('a.text-body, span.text-body');
        const serviceName = nameEl?.textContent?.trim() || '';

        // Look for price in the parent or sibling elements
        let priceText = '';
        const priceEl = item.querySelector('[data-id="service-price"]') ||
                       item.closest('div')?.querySelector('[data-id="service-price"]');
        if (priceEl) {
          priceText = priceEl.textContent?.trim() || '';
        }

        if (serviceName && !data.services.some(s => s.name === serviceName)) {
          data.services.push({
            name: serviceName,
            price: priceText
          });
        }
      });

      // Insurance - may be dynamically loaded
      data.insurance = [];
      const insuranceList = document.querySelector('[data-id="insurances-list-vue"] ul');
      if (insuranceList) {
        const insuranceItems = insuranceList.querySelectorAll('li');
        insuranceItems.forEach(item => {
          const name = item.textContent?.trim();
          if (name && name.length > 2) {
            data.insurance.push(name);
          }
        });
      }

      // Education - from ul#school
      data.education = [];
      const schoolList = document.querySelector('ul#school');
      if (schoolList) {
        const eduItems = schoolList.querySelectorAll('li');
        eduItems.forEach(item => {
          const edu = item.textContent?.trim();
          if (edu && edu.length > 5) {
            data.education.push(edu);
          }
        });
      }

      // Languages - from ul#language
      data.languages = [];
      const langList = document.querySelector('ul#language');
      if (langList) {
        const langItems = langList.querySelectorAll('li');
        langItems.forEach(item => {
          const lang = item.textContent?.trim();
          if (lang && lang.length > 1) {
            data.languages.push(lang);
          }
        });
      }

      // Experience (years)
      const experienceHeading = Array.from(document.querySelectorAll('h2, h3')).find(h =>
        h.textContent.trim().toLowerCase() === 'experiencia'
      );
      if (experienceHeading) {
        let sibling = experienceHeading.nextElementSibling;
        while (sibling && !['H2', 'H3'].includes(sibling.tagName)) {
          const text = sibling.textContent?.trim();
          const yearMatch = text?.match(/(\d+)\s*(?:años?|years?)/i);
          if (yearMatch) {
            data.yearsOfExperience = parseInt(yearMatch[1]);
            break;
          }
          sibling = sibling.nextElementSibling;
        }
      }

      return data;
    });

    doctorData.profileUrl = profileUrl;
    doctorData.scrapedAt = new Date().toISOString();

    return doctorData;
  } catch (error) {
    console.error(`  ✗ Error scraping ${profileUrl}: ${error.message}`);
    return null;
  }
}

async function scrapeFixed() {
  console.log('🚀 FIXED SCRAPER - Extracts ALL data + downloads images!\n');

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
  let totalPhotos = 0;
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

            const tasks = newUrls.map(profileUrl =>
              limit(async () => {
                const profilePage = await browser.newPage();
                try {
                  const doctorData = await scrapeDoctorProfile(profilePage, profileUrl);

                  if (doctorData && doctorData.name) {
                    const dirPath = path.join(OUTPUT_DIR, specialty.slug, city.slug);
                    await fs.mkdir(dirPath, { recursive: true });

                    // Download photo
                    if (doctorData.photoUrl) {
                      const photoFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
                      const photoPath = path.join(dirPath, photoFileName);
                      const saved = await downloadAndConvertImage(doctorData.photoUrl, photoPath);
                      doctorData.localPhotoPath = saved ? photoPath : null;
                      if (saved) totalPhotos++;
                    }

                    // Save JSON
                    const jsonFileName = `${doctorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
                    const jsonPath = path.join(dirPath, jsonFileName);
                    await fs.writeFile(jsonPath, JSON.stringify(doctorData, null, 2));

                    scrapedUrls.add(profileUrl);
                    totalScraped++;

                    if (totalScraped % 20 === 0) {
                      console.log(`  ✅ ${totalScraped} doctors (${totalPhotos} photos)`);
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
            console.log(`  ✓ Page ${pageNum} done (${totalScraped} total, ${totalPhotos} photos)`);

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
      }
    }

    console.log(`\n🎉 COMPLETE!`);
    console.log(`Total doctors: ${totalScraped}`);
    console.log(`Total photos: ${totalPhotos}`);

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'summary.json'),
      JSON.stringify({
        totalDoctors: totalScraped,
        totalPhotos: totalPhotos,
        scrapedAt: new Date().toISOString()
      }, null, 2)
    );

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await browser.close();
  }
}

scrapeFixed();
