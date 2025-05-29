/**
 * DEBUG DOCTOR PAGE
 * 
 * Simple script to check what's actually happening on the doctor page
 */

const { chromium } = require('playwright');

async function debugDoctorPage() {
  console.log('🔍 Starting Doctor Page Debug...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`🌐 BROWSER: ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });
  
  try {
    console.log('📍 Navigating to doctor page...');
    await page.goto('http://localhost:8888/doctor');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded, checking content...');
    
    // Check if page has any content
    const bodyText = await page.textContent('body');
    console.log(`Page has ${bodyText.length} characters of content`);
    
    if (bodyText.length < 100) {
      console.log('❌ Page appears to be mostly empty');
      console.log('Content:', bodyText);
    } else {
      console.log('✅ Page has content');
    }
    
    // Check for specific elements
    const elements = {
      'Doctor title': 'h1, h2, h3',
      'Chat container': '.chat-messages-container',
      'Textarea': 'textarea',
      'Send button': 'button[aria-label="Enviar mensaje"]',
      'Tab navigation': 'nav',
      'Any button': 'button'
    };
    
    for (const [name, selector] of Object.entries(elements)) {
      const count = await page.locator(selector).count();
      const visible = count > 0 ? await page.locator(selector).first().isVisible() : false;
      console.log(`${name}: ${count} found, visible: ${visible}`);
    }
    
    // Check for React errors
    const reactErrors = await page.evaluate(() => {
      return window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.rendererInterfaces?.size || 0;
    });
    console.log(`React renderers: ${reactErrors}`);
    
    // Check if ConversationProvider is working
    const hasConversationContext = await page.evaluate(() => {
      return window.React && window.React.version;
    });
    console.log(`React version: ${hasConversationContext}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-doctor-page.png' });
    console.log('📸 Screenshot saved as debug-doctor-page.png');
    
    // Wait a bit to see the page
    console.log('⏳ Waiting 5 seconds for manual inspection...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the debug
debugDoctorPage().catch(console.error);
