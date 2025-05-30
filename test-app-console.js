// Simple script to test the DoctorMX app and capture console logs
const puppeteer = require('puppeteer');

async function testDoctorMXApp() {
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture console logs
    const logs = [];
    page.on('console', msg => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      logs.push(logEntry);
      console.log(`[${logEntry.timestamp}] ${logEntry.type.toUpperCase()}: ${logEntry.text}`);
    });
    
    // Capture errors
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
    
    console.log('Navigating to DoctorMX app...');
    await page.goto('http://localhost:8888', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('Waiting for app to load...');
    await page.waitForTimeout(5000);
    
    // Check for specific issues
    console.log('\n=== ANALYSIS ===');
    
    // Check for multiple Supabase instances
    const multipleInstancesLogs = logs.filter(log => 
      log.text.includes('Multiple GoTrueClient instances') ||
      log.text.includes('Multiple Supabase instances')
    );
    
    if (multipleInstancesLogs.length > 0) {
      console.log('❌ Multiple Supabase instances detected:');
      multipleInstancesLogs.forEach(log => console.log(`  - ${log.text}`));
    } else {
      console.log('✅ No multiple Supabase instance warnings found');
    }
    
    // Check for feature flags errors
    const featureFlagsErrors = logs.filter(log => 
      log.text.includes('feature_flags') && 
      (log.text.includes('404') || log.text.includes('error') || log.text.includes('failed'))
    );
    
    if (featureFlagsErrors.length > 0) {
      console.log('❌ Feature flags errors detected:');
      featureFlagsErrors.forEach(log => console.log(`  - ${log.text}`));
    } else {
      console.log('✅ No feature flags errors found');
    }
    
    // Check for camera processing errors
    const cameraErrors = logs.filter(log => 
      log.text.includes('IndexSizeError') ||
      log.text.includes('getImageData') ||
      log.text.includes('source width is 0')
    );
    
    if (cameraErrors.length > 0) {
      console.log('❌ Camera processing errors detected:');
      cameraErrors.forEach(log => console.log(`  - ${log.text}`));
    } else {
      console.log('✅ No camera processing errors found');
    }
    
    // Check for image analysis errors
    const imageAnalysisErrors = logs.filter(log => 
      log.text.includes('ComprehensiveMedicalImageAnalyzer') && 
      log.text.includes('failed')
    );
    
    if (imageAnalysisErrors.length > 0) {
      console.log('❌ Image analysis errors detected:');
      imageAnalysisErrors.forEach(log => console.log(`  - ${log.text}`));
    } else {
      console.log('✅ No image analysis errors found');
    }
    
    console.log(`\nTotal console messages: ${logs.length}`);
    console.log('Test completed. Browser will remain open for manual inspection.');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(60000); // Wait 1 minute
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testDoctorMXApp();
} catch (error) {
  console.log('Puppeteer not available. Please install it with: npm install puppeteer');
  console.log('Alternatively, test manually by opening http://localhost:8888 and checking the browser console.');
}
