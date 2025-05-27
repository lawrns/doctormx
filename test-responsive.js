const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Test different viewport sizes
  const viewports = [
    { width: 1920, height: 1080, label: 'Desktop' },
    { width: 1024, height: 768, label: 'Tablet Landscape' },
    { width: 768, height: 1024, label: 'Tablet Portrait' },
    { width: 375, height: 812, label: 'iPhone X' },
    { width: 414, height: 896, label: 'iPhone 11' }
  ];
  
  console.log('Starting responsive tests...');
  
  // Navigate to the app
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  for (const viewport of viewports) {
    console.log(`\nTesting ${viewport.label} (${viewport.width}x${viewport.height})`);
    await page.setViewport(viewport);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for transitions
    
    // Take screenshot
    await page.screenshot({
      path: `screenshot-${viewport.label.toLowerCase().replace(' ', '-')}.png`,
      fullPage: true
    });
    
    // Check for register button visibility
    try {
      const registerButton = await page.$('a[href="/register"] button');
      if (registerButton) {
        const isVisible = await registerButton.isIntersectingViewport();
        const buttonStyles = await registerButton.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            opacity: styles.opacity,
            display: styles.display
          };
        });
        console.log('Register button:', { isVisible, styles: buttonStyles });
      }
    } catch (e) {
      console.log('Register button not found');
    }
    
    // Check sidebar toggle
    if (viewport.width < 1024) {
      try {
        const sidebarToggle = await page.$('button[aria-label*="menú"]');
        if (sidebarToggle) {
          await sidebarToggle.click();
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Sidebar toggle clicked');
        }
      } catch (e) {
        console.log('Sidebar toggle not found');
      }
    }
    
    // Check chat interface
    await page.goto('http://localhost:5173/doctor', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const chatContainer = await page.$('.chat-messages-container');
    if (chatContainer) {
      const chatStyles = await chatContainer.evaluate(el => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          backgroundColor: styles.backgroundColor,
          height: rect.height,
          overflow: styles.overflow
        };
      });
      console.log('Chat container:', chatStyles);
    }
  }
  
  console.log('\nTest complete. Check screenshots.');
  await browser.close();
})();