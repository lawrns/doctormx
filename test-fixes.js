const puppeteer = require('puppeteer');

async function testFixes() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  
  console.log('Testing Doctor MX Fixes...\n');
  
  // Test 1: Register button visibility
  console.log('1. Testing Register Button Visibility');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.setViewport({ width: 1920, height: 1080 });
  
  const registerButton = await page.$('a[href="/register"] button');
  if (registerButton) {
    const styles = await registerButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        visibility: computed.visibility,
        opacity: computed.opacity
      };
    });
    console.log('✓ Register button styles:', styles);
  } else {
    console.log('✗ Register button not found');
  }
  
  // Test 2: Mobile responsive resize
  console.log('\n2. Testing Mobile Responsive Resize');
  const viewports = [
    { width: 1920, height: 1080, label: 'Desktop' },
    { width: 1024, height: 768, label: 'Tablet' },
    { width: 375, height: 812, label: 'Mobile' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewport(viewport);
    await new Promise(r => setTimeout(r, 500));
    
    const layoutIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for overflow
      if (document.body.scrollWidth > window.innerWidth) {
        issues.push('Horizontal overflow detected');
      }
      
      // Check sidebar
      const sidebar = document.querySelector('.sidebar-wrapper');
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        if (window.innerWidth < 1024 && rect.left >= 0) {
          issues.push('Sidebar visible on mobile when it should be hidden');
        }
      }
      
      return issues;
    });
    
    console.log(`  ${viewport.label}: ${layoutIssues.length === 0 ? '✓ No issues' : '✗ Issues: ' + layoutIssues.join(', ')}`);
  }
  
  // Test 3: Chat area background
  console.log('\n3. Testing Chat Area Background');
  await page.goto('http://localhost:5173/doctor', { waitUntil: 'networkidle2' });
  await page.setViewport({ width: 1920, height: 1080 });
  await new Promise(r => setTimeout(r, 1000));
  
  const chatBackground = await page.evaluate(() => {
    const chatContainer = document.querySelector('.chat-messages-container');
    if (!chatContainer) return null;
    
    const styles = window.getComputedStyle(chatContainer);
    return {
      backgroundColor: styles.backgroundColor,
      backgroundImage: styles.backgroundImage
    };
  });
  
  if (chatBackground) {
    console.log('✓ Chat background:', chatBackground);
    if (chatBackground.backgroundImage !== 'none') {
      console.log('  ⚠️  Warning: Chat still has background image');
    }
  } else {
    console.log('✗ Chat container not found');
  }
  
  // Test 4: Sidebar minimize functionality
  console.log('\n4. Testing Sidebar Minimize');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Test on mobile first (where toggle is visible)
  await page.setViewport({ width: 768, height: 1024 });
  await new Promise(r => setTimeout(r, 500));
  
  // Find sidebar toggle button
  const sidebarToggle = await page.$('button[aria-label*="menú"]');
  if (sidebarToggle) {
    // Get initial state
    const initialSidebar = await page.evaluate(() => {
      const wrapper = document.querySelector('.sidebar-wrapper');
      return wrapper ? wrapper.classList.contains('open') : null;
    });
    
    // Click toggle
    await sidebarToggle.click();
    await new Promise(r => setTimeout(r, 500));
    
    // Check if state changed
    const afterToggle = await page.evaluate(() => {
      const wrapper = document.querySelector('.sidebar-wrapper');
      return wrapper ? wrapper.classList.contains('open') : null;
    });
    
    if (initialSidebar !== afterToggle) {
      console.log('✓ Sidebar toggle working');
    } else {
      console.log('✗ Sidebar toggle not working');
    }
  } else {
    console.log('✗ Sidebar toggle button not found');
  }
  
  // Test 5: Mobile chat interface
  console.log('\n5. Testing Mobile Chat Interface');
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/doctor', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  
  const mobileChat = await page.evaluate(() => {
    const issues = [];
    
    // Check if mobile layout is active
    const mobileContainer = document.querySelector('.ai-doctor-mobile-container');
    if (!mobileContainer && window.innerWidth <= 768) {
      issues.push('Mobile layout not active on mobile viewport');
    }
    
    // Check input area
    const inputArea = document.querySelector('.mobile-chat-input-area, .chat-input-area');
    if (inputArea) {
      const rect = inputArea.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        issues.push('Input area below viewport');
      }
    } else {
      issues.push('Input area not found');
    }
    
    return issues;
  });
  
  console.log(`  Mobile chat: ${mobileChat.length === 0 ? '✓ Working correctly' : '✗ Issues: ' + mobileChat.join(', ')}`);
  
  console.log('\n✅ All tests completed');
  
  await browser.close();
}

testFixes().catch(console.error);