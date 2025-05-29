/**
 * MANUAL BRAIN INTELLIGENCE TEST
 *
 * This script manually tests our brain intelligence upgrades
 * to verify they're working correctly.
 */

const { chromium } = require('playwright');

async function testBrainIntelligence() {
  console.log('🧠 Starting Brain Intelligence Test...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to doctor page
    console.log('📍 Navigating to doctor page...');
    await page.goto('http://localhost:8888/doctor');
    await page.waitForLoadState('networkidle');

    // Check if page loads (no white screen)
    console.log('✅ Checking if page loads properly...');
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Look for the textarea with correct selector
    console.log('🔍 Looking for chat textarea...');
    const textarea = await page.locator('textarea.chat-textarea').first();
    const isVisible = await textarea.isVisible();
    console.log(`Textarea visible: ${isVisible}`);

    if (!isVisible) {
      console.log('❌ Textarea not found - checking for alternative selectors...');
      const allTextareas = await page.locator('textarea').count();
      console.log(`Total textareas found: ${allTextareas}`);

      // Try different selectors
      const placeholderSelector = await page.locator('textarea[placeholder*="Cuéntame qué te duele"]').count();
      console.log(`Textareas with placeholder: ${placeholderSelector}`);

      // Check if page has loaded properly
      const pageContent = await page.textContent('body');
      console.log(`Page has content: ${pageContent.length > 100}`);

      if (pageContent.includes('Doctor')) {
        console.log('✅ Page loaded with doctor content');
      } else {
        console.log('❌ Page may not have loaded properly');
      }
    }

    // Test 1: Emergency Detection - Chest Pain
    console.log('\n🚨 TEST 1: Emergency Detection (Chest Pain)');
    if (isVisible) {
      await textarea.fill('Tengo dolor de pecho muy fuerte');

      // Look for send button
      const sendButton = await page.locator('button[aria-label="Enviar mensaje"]').first();
      const sendButtonVisible = await sendButton.isVisible();
      console.log(`Send button visible: ${sendButtonVisible}`);

      if (sendButtonVisible) {
        await sendButton.click();

        // Wait for response
        console.log('⏳ Waiting for AI response...');
        await page.waitForTimeout(3000);

        // Check for emergency response - try multiple selectors
        const messageSelectors = [
          '.message-content',
          '.chat-message',
          '[data-testid="message"]',
          '.text-gray-800',
          '.whitespace-pre-wrap'
        ];

        let messages = [];
        for (const selector of messageSelectors) {
          const found = await page.locator(selector).allTextContents();
          if (found.length > 0) {
            messages = found;
            console.log(`Found ${found.length} messages with selector: ${selector}`);
            break;
          }
        }

        if (messages.length === 0) {
          // Try getting all text content
          const bodyText = await page.textContent('body');
          console.log('Page content includes:', bodyText.substring(0, 500));

          // Check if emergency response is anywhere on page
          const hasEmergencyIcon = bodyText.includes('🚨');
          const has911 = bodyText.includes('911');
          const hasEmergencia = bodyText.includes('EMERGENCIA');

          console.log(`Emergency icon (🚨): ${hasEmergencyIcon}`);
          console.log(`Contains 911: ${has911}`);
          console.log(`Contains EMERGENCIA: ${hasEmergencia}`);

          if (hasEmergencyIcon || has911 || hasEmergencia) {
            console.log('✅ EMERGENCY DETECTION WORKING! (Found in page content)');
          } else {
            console.log('❌ Emergency detection may not be working properly');
          }
        } else {
          const lastMessage = messages[messages.length - 1] || '';
          console.log(`Last message: ${lastMessage.substring(0, 200)}...`);

          // Check for emergency indicators
          const hasEmergencyIcon = lastMessage.includes('🚨');
          const has911 = lastMessage.includes('911');
          const hasEmergencia = lastMessage.includes('EMERGENCIA');

          console.log(`Emergency icon (🚨): ${hasEmergencyIcon}`);
          console.log(`Contains 911: ${has911}`);
          console.log(`Contains EMERGENCIA: ${hasEmergencia}`);

          if (hasEmergencyIcon && has911 && hasEmergencia) {
            console.log('✅ EMERGENCY DETECTION WORKING!');
          } else {
            console.log('❌ Emergency detection may not be working properly');
          }
        }
      } else {
        console.log('❌ Send button not found');
      }
    } else {
      console.log('❌ Cannot test - textarea not visible');
    }

    // Test 2: Mexican Endemic Disease Detection
    console.log('\n🦟 TEST 2: Mexican Endemic Disease Detection (Dengue)');
    if (isVisible) {
      await page.waitForTimeout(2000);
      await textarea.fill('Tengo fiebre alta, dolor de cabeza intenso y dolor detrás de los ojos');

      const sendButton = await page.locator('button[aria-label="Enviar mensaje"]').first();
      if (await sendButton.isVisible()) {
        await sendButton.click();

        // Wait for response
        console.log('⏳ Waiting for AI response...');
        await page.waitForTimeout(5000);

        // Check for dengue recognition
        const messages = await page.locator('.message-content, .chat-message').allTextContents();
        const lastMessage = messages[messages.length - 1] || '';
        console.log(`Last message: ${lastMessage.substring(0, 200)}...`);

        // Check for dengue indicators
        const hasDengue = lastMessage.includes('DENGUE');
        const hasAspirinWarning = lastMessage.includes('NO tome aspirina');
        const hasMosquitoMention = lastMessage.includes('mosquito');

        console.log(`Contains DENGUE: ${hasDengue}`);
        console.log(`Contains aspirin warning: ${hasAspirinWarning}`);
        console.log(`Contains mosquito mention: ${hasMosquitoMention}`);

        if (hasDengue && hasAspirinWarning) {
          console.log('✅ DENGUE DETECTION WORKING!');
        } else {
          console.log('❌ Dengue detection may not be working properly');
        }
      }
    }

    console.log('\n🧠 Brain Intelligence Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testBrainIntelligence().catch(console.error);
