const puppeteer = require('puppeteer');

async function testMobile() {
  console.log('🧪 Testing mobile experience...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=400,800']
  });

  try {
    const page = await browser.newPage();
    
    // Set iPhone viewport
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });
    
    console.log('📱 Loading homepage...');
    await page.goto('http://localhost:8888', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'mobile-homepage.png' });
    console.log('✓ Homepage loaded and screenshot saved');
    
    // Check mobile elements
    const mobileElements = await page.evaluate(() => {
      const navbar = document.querySelector('header');
      const navbarHeight = navbar ? window.getComputedStyle(navbar).height : 'not found';
      const whatsappBtn = document.querySelector('a[href*="wa.me"]');
      const ctaButtons = document.querySelectorAll('a[href="/doctor"]');
      
      return {
        navbarHeight,
        hasWhatsApp: !!whatsappBtn,
        ctaButtonCount: ctaButtons.length,
        viewportWidth: window.innerWidth
      };
    });
    
    console.log('\n📊 Mobile Elements Check:');
    console.log(`- Navbar height: ${mobileElements.navbarHeight}`);
    console.log(`- WhatsApp button: ${mobileElements.hasWhatsApp ? '✓' : '✗'}`);
    console.log(`- CTA buttons found: ${mobileElements.ctaButtonCount}`);
    console.log(`- Viewport width: ${mobileElements.viewportWidth}px`);
    
    // Navigate to doctor page
    console.log('\n🩺 Navigating to AI Doctor...');
    await page.goto('http://localhost:8888/doctor', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for potential redirect or component load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if mobile chat is loaded
    const chatUI = await page.evaluate(() => {
      // Check for WhatsApp-style elements
      const greenHeader = document.querySelector('.bg-\\[\\#075E54\\]');
      const chatMessages = document.querySelector('.flex-1.overflow-y-auto');
      const inputArea = document.querySelector('textarea[placeholder*="Escribe"]');
      const attachButton = document.querySelector('button')?.innerHTML.includes('Paperclip') || 
                           document.querySelector('[class*="paperclip"]') ||
                           document.querySelector('button')?.innerHTML.includes('M21.44');
      
      return {
        hasGreenHeader: !!greenHeader,
        hasChatArea: !!chatMessages,
        hasInput: !!inputArea,
        hasAttachButton: !!attachButton,
        url: window.location.pathname
      };
    });
    
    console.log('\n💬 WhatsApp-style Chat UI:');
    console.log(`- URL: ${chatUI.url}`);
    console.log(`- Green header: ${chatUI.hasGreenHeader ? '✓' : '✗'}`);
    console.log(`- Chat area: ${chatUI.hasChatArea ? '✓' : '✗'}`);
    console.log(`- Input field: ${chatUI.hasInput ? '✓' : '✗'}`);
    console.log(`- Attach button: ${chatUI.hasAttachButton ? '✓' : '✗'}`);
    
    // Take screenshot of chat
    await page.screenshot({ path: 'mobile-chat.png' });
    console.log('\n✓ Chat screenshot saved');
    
    // Test input functionality
    if (chatUI.hasInput) {
      console.log('\n⌨️ Testing input...');
      await page.type('textarea[placeholder*="Escribe"]', 'Tengo dolor de cabeza');
      
      // Check if send button appears
      const sendButton = await page.$('button svg.lucide-send');
      console.log(`- Send button appears: ${sendButton ? '✓' : '✗'}`);
    }
    
    // Test landscape orientation
    console.log('\n🔄 Testing landscape mode...');
    await page.setViewport({
      width: 844,
      height: 390,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'mobile-landscape.png' });
    console.log('✓ Landscape screenshot saved');
    
    console.log('\n✅ Mobile testing completed!');
    console.log('\n📸 Screenshots saved:');
    console.log('   - mobile-homepage.png');
    console.log('   - mobile-chat.png');
    console.log('   - mobile-landscape.png');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testMobile().catch(console.error);