import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeFileName(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

function createDirectories() {
  console.log('📁 Creating directory structure...');
  
  const dirPath = path.join('public', 'images', 'doctors', 'Ciudad de México', 'Ciudad de México');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  console.log('✅ Directory structure created successfully!');
}

// Image download function
async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        fs.unlink(filePath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Debug scraper to understand Doctoralia structure
async function debugDoctoraliaStructure() {
  console.log('🔍 Debugging Doctoralia structure...');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to a specific Doctoralia page
    const searchUrl = 'https://www.doctoralia.com.mx/cardiologo/ciudad-de-mexico';
    
    console.log(`🌐 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for page to load
    await delay(5000);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-doctoralia-structure.png', fullPage: true });
    
    // Get page HTML to analyze structure
    const html = await page.content();
    fs.writeFileSync('debug-doctoralia.html', html);
    
    // Analyze the page structure
    const pageAnalysis = await page.evaluate(() => {
      const analysis = {
        title: document.title,
        url: window.location.href,
        doctorElements: [],
        allElements: [],
        textContent: document.body.textContent.substring(0, 1000)
      };
      
      // Look for any elements that might contain doctor information
      const possibleSelectors = [
        'div', 'article', 'section', 'li', 'a', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
      ];
      
      possibleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          if (index < 20) { // Limit to first 20 of each type
            const text = element.textContent.trim();
            if (text.length > 10 && text.length < 200) {
              analysis.allElements.push({
                tag: selector,
                text: text,
                className: element.className,
                id: element.id,
                href: element.href || null
              });
            }
          }
        });
      });
      
      // Look for doctor-specific patterns
      const doctorPatterns = [
        'Dr.', 'Dra.', 'Doctor', 'Doctora', 'Medico', 'Medica',
        'Cardiologo', 'Dermatologo', 'Ginecologo', 'Pediatra'
      ];
      
      doctorPatterns.forEach(pattern => {
        const elements = document.querySelectorAll(`*:contains("${pattern}")`);
        elements.forEach(element => {
          const text = element.textContent.trim();
          if (text.includes(pattern)) {
            analysis.doctorElements.push({
              tag: element.tagName,
              text: text,
              className: element.className,
              id: element.id,
              href: element.href || null
            });
          }
        });
      });
      
      return analysis;
    });
    
    console.log('📊 Page Analysis:');
    console.log(`Title: ${pageAnalysis.title}`);
    console.log(`URL: ${pageAnalysis.url}`);
    console.log(`Doctor elements found: ${pageAnalysis.doctorElements.length}`);
    console.log(`All elements found: ${pageAnalysis.allElements.length}`);
    
    // Log some doctor elements
    pageAnalysis.doctorElements.slice(0, 10).forEach((element, index) => {
      console.log(`Doctor ${index + 1}:`, element);
    });
    
    // Try to extract actual doctor data
    const doctors = await page.evaluate(() => {
      const doctors = [];
      
      // Look for links that might be doctor profiles
      const links = document.querySelectorAll('a[href*="/doctor/"], a[href*="/medico/"], a[href*="/cardiologo/"]');
      
      links.forEach((link, index) => {
        if (index < 20) { // Limit to first 20 links
          const text = link.textContent.trim();
          const href = link.href;
          
          if (text && text.length > 3 && text.length < 100) {
            doctors.push({
              name: text,
              profileUrl: href,
              element: link.outerHTML.substring(0, 200)
            });
          }
        }
      });
      
      // Look for images that might be doctor photos
      const images = document.querySelectorAll('img');
      const doctorImages = [];
      
      images.forEach((img, index) => {
        if (index < 20) { // Limit to first 20 images
          if (img.src && img.alt) {
            doctorImages.push({
              src: img.src,
              alt: img.alt,
              className: img.className
            });
          }
        }
      });
      
      return { doctors, doctorImages };
    });
    
    console.log(`\n🔍 Found ${doctors.doctors.length} potential doctor links:`);
    doctors.doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.profileUrl}`);
    });
    
    console.log(`\n📸 Found ${doctors.doctorImages.length} potential doctor images:`);
    doctors.doctorImages.forEach((image, index) => {
      console.log(`${index + 1}. ${image.alt} - ${image.src}`);
    });
    
    // Try to visit a doctor profile page
    if (doctors.doctors.length > 0) {
      console.log('\n🔍 Visiting first doctor profile...');
      
      const profileUrl = doctors.doctors[0].profileUrl;
      await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(3000);
      
      // Take screenshot of profile page
      await page.screenshot({ path: 'debug-doctor-profile.png', fullPage: true });
      
      // Extract profile information
      const profileInfo = await page.evaluate(() => {
        const info = {
          name: null,
          specialty: null,
          location: null,
          phone: null,
          image: null,
          rating: null,
          address: null
        };
        
        // Try to find name
        const nameSelectors = ['h1', 'h2', '.name', '.doctor-name', '.title'];
        for (const selector of nameSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            info.name = element.textContent.trim();
            break;
          }
        }
        
        // Try to find specialty
        const specialtySelectors = ['.specialty', '.specialization', '.field'];
        for (const selector of specialtySelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            info.specialty = element.textContent.trim();
            break;
          }
        }
        
        // Try to find image
        const imageSelectors = ['img', '.photo', '.avatar', '.profile-image'];
        for (const selector of imageSelectors) {
          const element = document.querySelector(selector);
          if (element && element.src) {
            info.image = element.src;
            break;
          }
        }
        
        // Try to find phone
        const phoneSelectors = ['.phone', '.telephone', '.contact'];
        for (const selector of phoneSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            info.phone = element.textContent.trim();
            break;
          }
        }
        
        // Try to find location
        const locationSelectors = ['.location', '.address', '.place'];
        for (const selector of locationSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            info.location = element.textContent.trim();
            break;
          }
        }
        
        return info;
      });
      
      console.log('📋 Profile Information:');
      console.log(JSON.stringify(profileInfo, null, 2));
      
      // Download the doctor's image if found
      if (profileInfo.image) {
        try {
          const doctorName = sanitizeFileName(profileInfo.name || 'doctor');
          const imagePath = path.join('public', 'images', 'doctors', 'Ciudad de México', 'Ciudad de México', `${doctorName}.webp`);
          await downloadImage(profileInfo.image, imagePath);
          console.log(`📸 Downloaded image: ${imagePath}`);
        } catch (error) {
          console.error('Error downloading image:', error.message);
        }
      }
    }
    
    await page.close();
    
  } finally {
    await browser.close();
  }
}

// Main execution function
async function main() {
  console.log('🇲🇽 Debug Doctoralia Scraper');
  console.log('============================');
  console.log('🚀 Starting debug process...');
  
  try {
    // Step 1: Create directory structure
    createDirectories();
    
    // Step 2: Debug Doctoralia structure
    await debugDoctoraliaStructure();
    
    console.log('🎉 Debug completed successfully!');
    console.log('📁 Check the following files:');
    console.log('   - debug-doctoralia-structure.png (screenshot of search page)');
    console.log('   - debug-doctor-profile.png (screenshot of profile page)');
    console.log('   - debug-doctoralia.html (full HTML of search page)');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { debugDoctoraliaStructure };
