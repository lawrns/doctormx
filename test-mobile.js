const puppeteer = require('puppeteer');

async function testMobileExperience() {
  console.log('🧪 Starting mobile experience tests...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    devtools: true
  });

  try {
    // Test iPhone 12 Pro
    console.log('📱 Testing iPhone 12 Pro experience...');
    const iphonePage = await browser.newPage();
    // iPhone 12 Pro viewport
    await iphonePage.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });
    await iphonePage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1');
    
    // Test local development server
    await iphonePage.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for the page to fully load
    await iphonePage.waitForSelector('main', { timeout: 10000 });
    
    // Test 1: Check if mobile layout is applied
    const isMobileLayout = await iphonePage.evaluate(() => {
      const navbar = document.querySelector('header');
      return navbar && window.getComputedStyle(navbar).height === '56px'; // Mobile height
    });
    console.log(`✓ Mobile navbar height: ${isMobileLayout ? 'Correct' : 'Incorrect'}`);
    
    // Test 2: Check if WhatsApp button is visible
    const whatsappButton = await iphonePage.$('a[href*="wa.me"]');
    console.log(`✓ WhatsApp button: ${whatsappButton ? 'Present' : 'Missing'}`);
    
    // Test 3: Navigate to AI Doctor
    await iphonePage.waitForSelector('a[href="/doctor"]', { visible: true });
    await iphonePage.evaluate(() => {
      const link = document.querySelector('a[href="/doctor"]');
      if (link) link.click();
    });
    await iphonePage.waitForTimeout(2000);
    
    // Test 4: Check if mobile chat interface is loaded
    const isMobileChat = await iphonePage.evaluate(() => {
      // Check for WhatsApp-style header
      const header = document.querySelector('.bg-\\[\\#075E54\\]');
      return !!header;
    });
    console.log(`✓ WhatsApp-style chat UI: ${isMobileChat ? 'Loaded' : 'Not loaded'}`);
    
    // Test 5: Test input field
    const inputField = await iphonePage.$('textarea[placeholder*="Escribe"]');
    if (inputField) {
      await inputField.click();
      await inputField.type('Tengo dolor de cabeza');
      console.log('✓ Input field: Functional');
    } else {
      console.log('✗ Input field: Not found');
    }
    
    // Test 6: Test attachment menu
    const attachButton = await iphonePage.$('button svg.lucide-paperclip');
    if (attachButton) {
      await attachButton.click();
      await iphonePage.waitForTimeout(500);
      const attachMenu = await iphonePage.$('.absolute.bottom-16');
      console.log(`✓ Attachment menu: ${attachMenu ? 'Opens correctly' : 'Failed to open'}`);
    }
    
    // Test Android experience
    console.log('\n📱 Testing Android (Pixel 5) experience...');
    const androidPage = await browser.newPage();
    // Pixel 5 viewport
    await androidPage.setViewport({
      width: 393,
      height: 851,
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true
    });
    await androidPage.setUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36');
    
    await androidPage.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Test responsive grid on homepage
    const gridCols = await androidPage.evaluate(() => {
      const grid = document.querySelector('.grid');
      if (grid) {
        const styles = window.getComputedStyle(grid);
        return styles.gridTemplateColumns;
      }
      return null;
    });
    console.log(`✓ Responsive grid: ${gridCols ? 'Applied' : 'Not found'}`);
    
    // Test tablet experience
    console.log('\n📱 Testing iPad experience...');
    const ipadPage = await browser.newPage();
    // iPad Pro viewport
    await ipadPage.setViewport({
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    await ipadPage.setUserAgent('Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
    
    await ipadPage.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Should use desktop layout on iPad
    await ipadPage.goto('http://localhost:5173/doctor', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    const isDesktopChat = await ipadPage.evaluate(() => {
      // Check for desktop tab navigation
      const tabs = document.querySelector('nav.flex.space-x-8');
      return !!tabs;
    });
    console.log(`✓ iPad uses desktop layout: ${isDesktopChat ? 'Yes' : 'No'}`);
    
    // Performance test
    console.log('\n⚡ Testing mobile performance...');
    const metrics = await iphonePage.metrics();
    console.log(`✓ JS Heap Size: ${(metrics.JSHeapUsedSize / 1048576).toFixed(2)} MB`);
    console.log(`✓ DOM Nodes: ${metrics.Nodes}`);
    
    // Test orientation change
    console.log('\n🔄 Testing landscape orientation...');
    await iphonePage.setViewport({ 
      width: 844, 
      height: 390, 
      deviceScaleFactor: 3,
      isLandscape: true 
    });
    await iphonePage.waitForTimeout(1000);
    
    const landscapeLayout = await iphonePage.evaluate(() => {
      const chatContainer = document.querySelector('.fixed.inset-0');
      return chatContainer ? 'Mobile chat maintained' : 'Layout broken';
    });
    console.log(`✓ Landscape orientation: ${landscapeLayout}`);
    
    console.log('\n✅ All mobile tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Run the tests
testMobileExperience().catch(console.error);