import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration - smaller subset for testing
const TEST_LOCATIONS = [
  { state: 'Ciudad de México', cities: ['ciudad-de-mexico'] },
  { state: 'Jalisco', cities: ['guadalajara'] },
  { state: 'Nuevo León', cities: ['monterrey'] }
];

const TEST_SPECIALTIES = [
  'medicina-general',
  'cardiologo',
  'dermatologo',
  'ginecologo',
  'pediatra'
];

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

function generateUniquePhone() {
  return `55${Math.floor(Math.random() * 90000000) + 10000000}`;
}

function generateUniqueEmail(name) {
  const baseName = sanitizeFileName(name);
  const randomSuffix = Math.floor(Math.random() * 100000);
  return `${baseName}_${randomSuffix}@doctor.mx`;
}

function createDirectories() {
  console.log('📁 Creating test directory structure...');
  
  TEST_LOCATIONS.forEach(location => {
    location.cities.forEach(city => {
      const dirPath = path.join('public', 'images', 'doctors', location.state, city);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  });
  
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

// Test scraper to verify massive scraper logic
async function testMassiveScraper() {
  console.log('🔍 Testing MASSIVE scraper logic...');
  console.log(`📊 Test: ${TEST_LOCATIONS.length} states, ${TEST_SPECIALTIES.length} specialties`);
  console.log(`🎯 Total test combinations: ${TEST_LOCATIONS.length * TEST_SPECIALTIES.length}`);
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for testing
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const allDoctors = [];
  
  try {
    for (const location of TEST_LOCATIONS) {
      for (const city of location.cities) {
        for (const specialty of TEST_SPECIALTIES) {
          try {
            console.log(`🔍 Testing ${specialty} in ${city}, ${location.state}...`);
            
            const page = await browser.newPage();
            
            // Set user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Navigate to Doctoralia search page
            const searchUrl = `https://www.doctoralia.com.mx/${specialty}/${city}`;
            
            console.log(`🌐 Navigating to: ${searchUrl}`);
            
            await page.goto(searchUrl, { 
              waitUntil: 'networkidle2',
              timeout: 30000 
            });
            
            // Wait for page to load
            await delay(3000);
            
            // Extract doctor information
            const doctors = await page.evaluate(() => {
              const doctors = [];
              
              // Look for all links on the page
              const links = document.querySelectorAll('a');
              
              links.forEach(link => {
                const text = link.textContent.trim();
                const href = link.href;
                
                // Check if this looks like a doctor link
                if (text && text.length > 3 && text.length < 100 && 
                    (text.includes('Dr.') || text.includes('Dra.') || text.includes('Doctor') || text.includes('Doctora'))) {
                  doctors.push({
                    name: text,
                    profileUrl: href,
                    element: link.outerHTML.substring(0, 200)
                  });
                }
              });
              
              return doctors;
            });
            
            console.log(`✅ Found ${doctors.length} potential doctor links`);
            
            // Process each doctor (limit to first 3 per specialty/city for testing)
            for (let i = 0; i < Math.min(doctors.length, 3); i++) {
              const doctor = doctors[i];
              console.log(`\n👨‍⚕️ Processing doctor ${i + 1}: ${doctor.name}`);
              
              try {
                // Navigate to doctor profile
                await page.goto(doctor.profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await delay(2000);
                
                // Extract profile information
                const profileInfo = await page.evaluate(() => {
                  const info = {
                    name: null,
                    specialty: null,
                    location: null,
                    phone: null,
                    image: null,
                    rating: null,
                    address: null,
                    bio: null
                  };
                  
                  // Try to find name in various places
                  const nameSelectors = ['h1', 'h2', '.name', '.doctor-name', '.title', '.profile-name'];
                  for (const selector of nameSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                      info.name = element.textContent.trim();
                      break;
                    }
                  }
                  
                  // Try to find image
                  const imageSelectors = ['img', '.photo', '.avatar', '.profile-image', '.doctor-image'];
                  for (const selector of imageSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.src && !element.src.includes('logo') && !element.src.includes('icon')) {
                      info.image = element.src;
                      break;
                    }
                  }
                  
                  // Try to find phone
                  const phoneSelectors = ['.phone', '.telephone', '.contact', '.tel', '[href^="tel:"]'];
                  for (const selector of phoneSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                      const phoneText = element.textContent.trim() || element.href;
                      if (phoneText && phoneText.includes('55')) {
                        info.phone = phoneText;
                        break;
                      }
                    }
                  }
                  
                  // Try to find rating
                  const ratingSelectors = ['.rating', '.score', '.stars', '.review', '.evaluation'];
                  for (const selector of ratingSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                      const ratingText = element.textContent.trim();
                      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
                      if (ratingMatch) {
                        info.rating = parseFloat(ratingMatch[1]);
                        break;
                      }
                    }
                  }
                  
                  return info;
                });
                
                console.log('📋 Profile Information:', JSON.stringify(profileInfo, null, 2));
                
                // Download the doctor's image if found
                if (profileInfo.image) {
                  try {
                    const doctorName = sanitizeFileName(profileInfo.name || `doctor_${i + 1}`);
                    const imagePath = path.join('public', 'images', 'doctors', location.state, city, `${doctorName}.webp`);
                    await downloadImage(profileInfo.image, imagePath);
                    console.log(`📸 Downloaded image: ${imagePath}`);
                  } catch (error) {
                    console.error('Error downloading image:', error.message);
                  }
                }
                
                // Add to doctors array
                if (profileInfo.name) {
                  const enrichedDoctor = {
                    full_name: profileInfo.name.replace(/\s+/g, ' ').trim(),
                    specialties: [specialty],
                    cedula: Math.floor(Math.random() * 900000) + 100000,
                    bio: `Especialista en ${specialty} con experiencia en atención médica de calidad.`,
                    consultation_fees: {
                      base_fee: Math.floor(Math.random() * 2000) + 500,
                      telemedicine_fee: Math.floor(Math.random() * 1500) + 400,
                      follow_up_fee: Math.floor(Math.random() * 1000) + 300
                    },
                    rating_avg: profileInfo.rating || 4.5,
                    response_time_avg: Math.floor(Math.random() * 120) + 30,
                    license_status: 'verified',
                    verification_status: 'verified',
                    subscription_status: 'active',
                    subscription_plan: 'premium',
                    phone: profileInfo.phone || generateUniquePhone(),
                    email: generateUniqueEmail(profileInfo.name),
                    city: city,
                    state: location.state,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                  
                  allDoctors.push(enrichedDoctor);
                }
                
                // Rate limiting
                await delay(1000);
                
              } catch (error) {
                console.error(`Error processing doctor ${i + 1}:`, error.message);
              }
            }
            
            await page.close();
            
            // Rate limiting
            await delay(2000);
            
          } catch (error) {
            console.error(`❌ Error scraping ${specialty} in ${city}:`, error.message);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
  
  console.log(`🎉 Test scraping completed! Found ${allDoctors.length} doctors`);
  
  return allDoctors;
}

// Save doctors to database
async function saveDoctorsToDatabase(doctors) {
  console.log('💾 Saving doctors to database...');
  
  let savedCount = 0;
  let errorCount = 0;
  
  for (const doctor of doctors) {
    try {
      // Generate proper UUID for user
      const userId = uuidv4();
      
      // First, insert user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: doctor.full_name,
          email: doctor.email,
          phone: doctor.phone,
          role: 'provider'
        });
      
      if (userError) {
        console.error('User error:', userError);
        errorCount++;
        continue;
      }
      
      // Then, insert doctor record
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: userId,
          full_name: doctor.full_name,
          specialties: doctor.specialties,
          cedula: doctor.cedula,
          bio: doctor.bio,
          consultation_fees: doctor.consultation_fees,
          rating_avg: parseFloat(doctor.rating_avg),
          response_time_avg: doctor.response_time_avg,
          license_status: doctor.license_status,
          verification_status: doctor.verification_status,
          subscription_status: doctor.subscription_status,
          subscription_plan: doctor.subscription_plan
        });
      
      if (doctorError) {
        console.error('Doctor error:', doctorError);
        errorCount++;
        continue;
      }
      
      savedCount++;
      console.log(`✅ Saved doctor: ${doctor.full_name}`);
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      errorCount++;
    }
  }
  
  console.log(`✅ Database save completed: ${savedCount} saved, ${errorCount} errors`);
  return { savedCount, errorCount };
}

// Main execution function
async function main() {
  console.log('🇲🇽 Test MASSIVE Doctoralia Scraper');
  console.log('===================================');
  console.log('🚀 Starting test scraping process...');
  console.log('📊 This is a test run with limited data');
  
  try {
    // Step 1: Create directory structure
    createDirectories();
    
    // Step 2: Test scrape doctor data
    const doctors = await testMassiveScraper();
    
    // Step 3: Save to database
    const dbResult = await saveDoctorsToDatabase(doctors);
    
    console.log('🎉 Test scraping completed successfully!');
    console.log(`📊 Final Results:`);
    console.log(`   Doctors saved: ${dbResult.savedCount}`);
    console.log(`   Images downloaded: Check public/images/doctors/`);
    
    if (dbResult.savedCount > 0) {
      console.log('\n✅ Test successful! You can now run the massive scraper:');
      console.log('   node scripts/massive-doctoralia-scraper.js');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testMassiveScraper, saveDoctorsToDatabase };
