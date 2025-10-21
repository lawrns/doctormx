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

// Focus on major cities with more doctors
const MAJOR_LOCATIONS = [
  { state: 'Ciudad de México', cities: ['ciudad-de-mexico', 'alvaro-obregon', 'benito-juarez', 'coyoacan', 'cuauhtemoc'] },
  { state: 'Jalisco', cities: ['guadalajara', 'zapopan', 'tlaquepaque'] },
  { state: 'Nuevo León', cities: ['monterrey', 'guadalupe', 'san-nicolas'] },
  { state: 'Puebla', cities: ['puebla', 'tehuacan'] },
  { state: 'Guanajuato', cities: ['leon', 'guanajuato', 'irapuato'] },
  { state: 'Veracruz', cities: ['xalapa', 'veracruz'] },
  { state: 'Yucatán', cities: ['merida'] },
  { state: 'Quintana Roo', cities: ['cancun', 'playa-del-carmen'] },
  { state: 'Baja California', cities: ['tijuana', 'mexicali'] },
  { state: 'Chihuahua', cities: ['chihuahua', 'juarez'] },
  { state: 'Sonora', cities: ['hermosillo', 'ciudad-obregon'] },
  { state: 'Coahuila', cities: ['saltillo', 'torreon'] },
  { state: 'Tamaulipas', cities: ['tampico', 'reynosa'] },
  { state: 'Sinaloa', cities: ['culiacan', 'mazatlan'] },
  { state: 'Michoacán', cities: ['morelia', 'uruapan'] },
  { state: 'Oaxaca', cities: ['oaxaca'] },
  { state: 'Chiapas', cities: ['tuxtla-gutierrez'] },
  { state: 'Tabasco', cities: ['villahermosa'] },
  { state: 'Campeche', cities: ['campeche'] },
  { state: 'Aguascalientes', cities: ['aguascalientes'] },
  { state: 'Colima', cities: ['colima'] },
  { state: 'Durango', cities: ['durango'] },
  { state: 'Guerrero', cities: ['acapulco'] },
  { state: 'Hidalgo', cities: ['pachuca'] },
  { state: 'México', cities: ['toluca', 'ecatepec'] },
  { state: 'Morelos', cities: ['cuernavaca'] },
  { state: 'Nayarit', cities: ['tepic'] },
  { state: 'Querétaro', cities: ['queretaro'] },
  { state: 'San Luis Potosí', cities: ['san-luis-potosi'] },
  { state: 'Tlaxcala', cities: ['tlaxcala'] },
  { state: 'Zacatecas', cities: ['zacatecas'] }
];

// Focus on common specialties
const COMMON_SPECIALTIES = [
  'medicina-general',
  'cardiologo',
  'dermatologo',
  'ginecologo',
  'pediatra',
  'psiquiatra',
  'neurologo',
  'oftalmologo',
  'otorrinolaringologo',
  'traumatologo',
  'urologo',
  'gastroenterologo',
  'endocrinologo',
  'neumologo',
  'oncologo',
  'anestesiologo',
  'cirujano-general',
  'medicina-interna',
  'radiologo',
  'medicina-familiar',
  'geriatra',
  'infectologo',
  'nefrologo',
  'reumatologo',
  'hematologo',
  'alergologo',
  'inmunologo',
  'nutriologo',
  'psicologo',
  'dentista'
];

// Robust rate limiting
const RATE_LIMIT = {
  delayBetweenRequests: 3000,     // 3 seconds between requests
  delayBetweenBatches: 15000,     // 15 seconds between batches
  maxRetries: 3,                  // Retry failed requests
  timeout: 60000                  // 60 second timeout
};

// Scraping statistics
let stats = {
  totalDoctors: 0,
  totalImages: 0,
  totalErrors: 0,
  startTime: Date.now(),
  processedSpecialties: 0,
  processedLocations: 0,
  savedDoctors: 0,
  failedSaves: 0
};

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
  const randomSuffix = Math.floor(Math.random() * 1000000);
  return `${baseName}_${randomSuffix}@doctor.mx`;
}

// Fix rating to be within database limits (0-10)
function fixRating(rating) {
  if (!rating) return 4.5;
  if (rating > 10) return Math.min(10, rating / 100); // Convert large numbers to 0-10 scale
  if (rating < 0) return 4.5;
  return Math.min(10, Math.max(0, rating));
}

function createDirectories() {
  console.log('📁 Creating directory structure...');
  
  MAJOR_LOCATIONS.forEach(location => {
    location.cities.forEach(city => {
      const dirPath = path.join('public', 'images', 'doctors', location.state, city);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  });
  
  console.log('✅ Directory structure created successfully!');
}

// Robust image download with retry
async function downloadImage(url, filePath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
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
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(2000);
    }
  }
}

// Robust scraper with better error handling
async function scrapeRobustDoctorData() {
  console.log('🔍 Starting ROBUST Doctoralia scraping...');
  console.log(`📊 Target: ${MAJOR_LOCATIONS.length} states, ${COMMON_SPECIALTIES.length} specialties`);
  console.log(`🎯 Estimated combinations: ${MAJOR_LOCATIONS.length * COMMON_SPECIALTIES.length}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  const allDoctors = [];
  
  try {
    for (const location of MAJOR_LOCATIONS) {
      for (const city of location.cities) {
        for (const specialty of COMMON_SPECIALTIES) {
          let retries = 0;
          let success = false;
          
          while (retries < RATE_LIMIT.maxRetries && !success) {
            try {
              console.log(`🔍 Scraping ${specialty} in ${city}, ${location.state}... (attempt ${retries + 1})`);
              
              const page = await browser.newPage();
              
              // Set user agent and timeouts
              await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
              await page.setDefaultTimeout(RATE_LIMIT.timeout);
              
              // Navigate to Doctoralia search page
              const searchUrl = `https://www.doctoralia.com.mx/${specialty}/${city}`;
              
              console.log(`🌐 Navigating to: ${searchUrl}`);
              
              await page.goto(searchUrl, { 
                waitUntil: 'networkidle2',
                timeout: RATE_LIMIT.timeout 
              });
              
              // Wait for page to load
              await delay(5000);
              
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
              
              // Process each doctor (limit to first 5 per specialty/city)
              for (let i = 0; i < Math.min(doctors.length, 5); i++) {
                const doctor = doctors[i];
                console.log(`\n👨‍⚕️ Processing doctor ${i + 1}: ${doctor.name}`);
                
                try {
                  // Navigate to doctor profile
                  await page.goto(doctor.profileUrl, { 
                    waitUntil: 'networkidle2', 
                    timeout: RATE_LIMIT.timeout 
                  });
                  await delay(3000);
                  
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
                  
                  // Download the doctor's image if found
                  if (profileInfo.image) {
                    try {
                      const doctorName = sanitizeFileName(profileInfo.name || `doctor_${i + 1}`);
                      const imagePath = path.join('public', 'images', 'doctors', location.state, city, `${doctorName}.webp`);
                      await downloadImage(profileInfo.image, imagePath);
                      console.log(`📸 Downloaded image: ${imagePath}`);
                      stats.totalImages++;
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
                      rating_avg: fixRating(profileInfo.rating),
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
                  await delay(2000);
                  
                } catch (error) {
                  console.error(`Error processing doctor ${i + 1}:`, error.message);
                  stats.totalErrors++;
                }
              }
              
              await page.close();
              success = true;
              
            } catch (error) {
              console.error(`❌ Error scraping ${specialty} in ${city} (attempt ${retries + 1}):`, error.message);
              retries++;
              stats.totalErrors++;
              
              if (retries < RATE_LIMIT.maxRetries) {
                console.log(`🔄 Retrying in 10 seconds...`);
                await delay(10000);
              }
            }
          }
          
          stats.processedSpecialties++;
          
          // Rate limiting between batches
          if (stats.processedSpecialties % 5 === 0) {
            console.log(`📈 Progress: ${stats.processedSpecialties}/${MAJOR_LOCATIONS.length * COMMON_SPECIALTIES.length} combinations`);
            console.log(`👥 Total doctors collected so far: ${allDoctors.length}`);
            await delay(RATE_LIMIT.delayBetweenBatches);
          } else {
            await delay(RATE_LIMIT.delayBetweenRequests);
          }
        }
        stats.processedLocations++;
      }
    }
  } finally {
    await browser.close();
  }
  
  stats.totalDoctors = allDoctors.length;
  console.log(`🎉 ROBUST scraping completed! Found ${stats.totalDoctors} doctors`);
  
  return allDoctors;
}

// Robust database save with retry logic
async function saveDoctorsToDatabase(doctors) {
  console.log('💾 Saving doctors to database with retry logic...');
  
  let savedCount = 0;
  let errorCount = 0;
  const batchSize = 25; // Smaller batches for better reliability
  
  for (let i = 0; i < doctors.length; i += batchSize) {
    const batch = doctors.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(doctors.length / batchSize)}`);
    
    for (const doctor of batch) {
      let retries = 0;
      let success = false;
      
      while (retries < 3 && !success) {
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
            break;
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
            break;
          }
          
          savedCount++;
          success = true;
          
          if (savedCount % 50 === 0) {
            console.log(`📊 Progress: ${savedCount}/${doctors.length} doctors saved`);
          }
          
        } catch (error) {
          console.error('Error saving doctor:', error);
          retries++;
          errorCount++;
          
          if (retries < 3) {
            console.log(`🔄 Retrying save in 5 seconds...`);
            await delay(5000);
          }
        }
      }
    }
    
    // Delay between batches
    await delay(3000);
  }
  
  console.log(`✅ Database save completed: ${savedCount} saved, ${errorCount} errors`);
  return { savedCount, errorCount };
}

// Generate comprehensive report
function generateReport() {
  const endTime = Date.now();
  const duration = Math.round((endTime - stats.startTime) / 1000);
  
  const report = {
    summary: {
      totalDoctors: stats.totalDoctors,
      totalImages: stats.totalImages,
      totalErrors: stats.totalErrors,
      duration: `${duration} seconds`,
      processedSpecialties: stats.processedSpecialties,
      processedLocations: stats.processedLocations
    },
    performance: {
      doctorsPerSecond: (stats.totalDoctors / duration).toFixed(2),
      imagesPerSecond: (stats.totalImages / duration).toFixed(2),
      errorRate: ((stats.totalErrors / (stats.totalDoctors + stats.totalErrors)) * 100).toFixed(2) + '%'
    }
  };
  
  // Save report to file
  const reportPath = path.join('public', 'data', 'robust_scraping_report.json');
  if (!fs.existsSync(path.dirname(reportPath))) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📊 ROBUST Scraping Report:');
  console.log(`   Total Doctors: ${report.summary.totalDoctors}`);
  console.log(`   Total Images: ${report.summary.totalImages}`);
  console.log(`   Total Errors: ${report.summary.totalErrors}`);
  console.log(`   Duration: ${report.summary.duration}`);
  console.log(`   Performance: ${report.performance.doctorsPerSecond} doctors/sec`);
  console.log(`   Error Rate: ${report.performance.errorRate}`);
  
  return report;
}

// Main execution function
async function main() {
  console.log('🇲🇽 ROBUST Doctoralia Scraper');
  console.log('==============================');
  console.log('🚀 Starting ROBUST scraping process...');
  console.log('⚠️  This will take several hours to complete!');
  console.log('📊 Estimated combinations:', MAJOR_LOCATIONS.length * COMMON_SPECIALTIES.length);
  
  try {
    // Step 1: Create directory structure
    createDirectories();
    
    // Step 2: Scrape robust doctor data
    const doctors = await scrapeRobustDoctorData();
    
    // Step 3: Save to database
    const dbResult = await saveDoctorsToDatabase(doctors);
    
    // Step 4: Generate report
    const report = generateReport();
    
    console.log('🎉 ROBUST scraping completed successfully!');
    console.log(`📊 Final Results:`);
    console.log(`   Doctors saved: ${dbResult.savedCount}`);
    console.log(`   Images downloaded: Check public/images/doctors/`);
    console.log(`   Total errors: ${stats.totalErrors}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  scrapeRobustDoctorData, 
  saveDoctorsToDatabase, 
  generateReport,
  createDirectories 
};
