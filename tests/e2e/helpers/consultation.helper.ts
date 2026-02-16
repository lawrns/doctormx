import { Page, BrowserContext } from '@playwright/test';

/**
 * Helper functions for video consultation in E2E tests
 * Supports Daily.co video integration
 */

/**
 * Join video consultation room
 */
export async function joinConsultationRoom(
  page: Page,
  appointmentId: string
): Promise<void> {
  // Navigate to consultation room
  await page.goto(`/consultation/${appointmentId}`);
  await page.waitForLoadState('networkidle');
  
  // Wait for room to load
  await page.waitForTimeout(2000);
  
  // Look for join button
  const joinButton = page.locator('button:has-text("Ingresar"), button:has-text("Unirse"), button:has-text("Join"), [data-testid="join-button"]').first();
  
  if (await joinButton.count() > 0) {
    // Check if button is enabled
    const isDisabled = await joinButton.isDisabled();
    
    if (isDisabled) {
      throw new Error('Join button is disabled - consultation may not be ready yet');
    }
    
    await joinButton.click();
    
    // Wait for video to initialize
    await page.waitForTimeout(3000);
  }
}

/**
 * Grant camera and microphone permissions
 */
export async function grantMediaPermissions(context: BrowserContext): Promise<void> {
  await context.grantPermissions(['camera', 'microphone']);
}

/**
 * Check if video is connected
 */
export async function isVideoConnected(page: Page): Promise<boolean> {
  // Check for video elements
  const videoElements = [
    'video',
    '[data-testid="local-video"]',
    '[data-testid="remote-video"]',
    '.daily-video'
  ];
  
  for (const selector of videoElements) {
    const locator = page.locator(selector).first();
    if (await locator.count() > 0) {
      const isVisible = await locator.isVisible();
      if (isVisible) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Toggle camera on/off
 */
export async function toggleCamera(page: Page): Promise<boolean> {
  const cameraButton = page.locator('button[aria-label*="cámara"], button[aria-label*="camera"], button:has-text("Cámara"), [data-testid="toggle-camera"]').first();
  
  if (await cameraButton.count() === 0) {
    return false;
  }
  
  await cameraButton.click();
  await page.waitForTimeout(500);
  
  // Return current state based on button
  const ariaPressed = await cameraButton.getAttribute('aria-pressed');
  return ariaPressed === 'true';
}

/**
 * Toggle microphone on/off
 */
export async function toggleMicrophone(page: Page): Promise<boolean> {
  const micButton = page.locator('button[aria-label*="micrófono"], button[aria-label*="microphone"], button[aria-label*="mic"], button:has-text("Micrófono"), [data-testid="toggle-mic"]').first();
  
  if (await micButton.count() === 0) {
    return false;
  }
  
  await micButton.click();
  await page.waitForTimeout(500);
  
  // Return current state based on button
  const ariaPressed = await micButton.getAttribute('aria-pressed');
  return ariaPressed === 'true';
}

/**
 * End consultation
 */
export async function endConsultation(page: Page): Promise<void> {
  const endButton = page.locator('button:has-text("Finalizar"), button:has-text("Terminar"), button:has-text("End"), button:has-text("Colgar"), [data-testid="end-call"]').first();
  
  if (await endButton.count() === 0) {
    throw new Error('End consultation button not found');
  }
  
  await endButton.click();
  
  // Wait for confirmation modal or redirect
  await page.waitForTimeout(1000);
  
  // Confirm if modal appears
  const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Yes"), [data-testid="confirm-end"]').first();
  if (await confirmButton.count() > 0) {
    await confirmButton.click();
  }
  
  // Wait for redirect to post-consultation page
  await page.waitForLoadState('networkidle');
}

/**
 * Share screen
 */
export async function shareScreen(page: Page): Promise<boolean> {
  const shareButton = page.locator('button[aria-label*="pantalla"], button[aria-label*="screen"], button:has-text("Compartir"), [data-testid="share-screen"]').first();
  
  if (await shareButton.count() === 0) {
    return false;
  }
  
  await shareButton.click();
  await page.waitForTimeout(1000);
  
  // Browser will show native screen picker - we can't automate this
  // But we can check if the button state changed
  return true;
}

/**
 * Send chat message during consultation
 */
export async function sendChatMessage(page: Page, message: string): Promise<void> {
  // Open chat panel if needed
  const chatButton = page.locator('button[aria-label*="chat"], button:has-text("Chat"), [data-testid="toggle-chat"]').first();
  
  if (await chatButton.count() > 0) {
    await chatButton.click();
    await page.waitForTimeout(500);
  }
  
  // Type message
  const chatInput = page.locator('input[type="text"], textarea').filter({ has: page.locator('') }).first();
  if (await chatInput.count() > 0) {
    await chatInput.fill(message);
    
    // Send message
    const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")').first();
    await sendButton.click();
    
    // Wait for message to appear
    await page.waitForTimeout(1000);
  }
}

/**
 * Check connection quality
 */
export async function getConnectionQuality(page: Page): Promise<'excellent' | 'good' | 'fair' | 'poor' | 'unknown'> {
  const qualityIndicator = page.locator('[data-testid="connection-quality"], .connection-quality').first();
  
  if (await qualityIndicator.count() === 0) {
    return 'unknown';
  }
  
  const classList = await qualityIndicator.getAttribute('class') || '';
  const textContent = await qualityIndicator.textContent() || '';
  
  if (classList.includes('excellent') || textContent.includes('excelente')) return 'excellent';
  if (classList.includes('good') || textContent.includes('buena')) return 'good';
  if (classList.includes('fair') || textContent.includes('regular')) return 'fair';
  if (classList.includes('poor') || textContent.includes('mala')) return 'poor';
  
  return 'unknown';
}

/**
 * Wait for doctor to join
 */
export async function waitForDoctorToJoin(page: Page, timeout: number = 60000): Promise<boolean> {
  const doctorVideo = page.locator('[data-testid="remote-video"], .remote-video, video:not([data-testid="local-video"])').first();
  
  try {
    await doctorVideo.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get consultation timer
 */
export async function getConsultationTimer(page: Page): Promise<string> {
  const timer = page.locator('[data-testid="consultation-timer"], .timer, .consultation-duration').first();
  
  if (await timer.count() === 0) {
    return '';
  }
  
  return await timer.textContent() || '';
}

/**
 * Verify consultation room elements
 */
export async function verifyConsultationRoom(page: Page): Promise<{
  hasVideo: boolean;
  hasControls: boolean;
  hasChat: boolean;
  hasTimer: boolean;
}> {
  const hasVideo = await page.locator('video, [data-testid="video-container"]').count() > 0;
  const hasControls = await page.locator('button[aria-label*="cámara"], button[aria-label*="micrófono"], [data-testid="call-controls"]').count() > 0;
  const hasChat = await page.locator('[data-testid="chat-panel"], button[aria-label*="chat"]').count() > 0;
  const hasTimer = await page.locator('[data-testid="consultation-timer"], .timer').count() > 0;
  
  return { hasVideo, hasControls, hasChat, hasTimer };
}

/**
 * Handle device permission denied error
 */
export async function handlePermissionError(page: Page): Promise<string | null> {
  const errorMessage = page.locator('text=/permiso|cámara|micrófono|permission|camera|microphone/i').first();
  
  if (await errorMessage.count() > 0 && await errorMessage.isVisible()) {
    return await errorMessage.textContent();
  }
  
  return null;
}

/**
 * Mock video consultation (for testing without Daily.co)
 */
export async function mockVideoConsultation(page: Page): Promise<void> {
  await page.route('**/api/daily/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'test_token_' + Date.now(),
        roomUrl: 'https://test.daily.co/test-room',
        roomName: 'test-room'
      })
    });
  });
}

/**
 * Submit post-consultation rating
 */
export async function submitConsultationRating(
  page: Page,
  rating: number,
  comment?: string
): Promise<void> {
  // Wait for rating modal or page
  await page.waitForTimeout(1000);
  
  // Select rating stars
  const stars = page.locator('[data-testid="star-rating"] button, button[aria-label*="estrella"]').all();
  
  if ((await stars).length >= rating) {
    await (await stars)[rating - 1].click();
  }
  
  // Add comment if provided
  if (comment) {
    const commentInput = page.locator('textarea[name="comment"], textarea[placeholder*="comentario"]').first();
    if (await commentInput.count() > 0) {
      await commentInput.fill(comment);
    }
  }
  
  // Submit rating
  const submitButton = page.locator('button[type="submit"]').filter({ hasText: /enviar|submit|guardar/i }).first();
  await submitButton.click();
  
  await page.waitForLoadState('networkidle');
}

/**
 * Get appointment details from consultation page
 */
export async function getAppointmentDetails(page: Page): Promise<{
  doctorName: string;
  specialty: string;
  dateTime: string;
}> {
  const doctorName = await page.locator('[data-testid="doctor-name"], .doctor-name, h2:has-text("Dr.")').textContent() || '';
  const specialty = await page.locator('[data-testid="doctor-specialty"], .specialty').textContent() || '';
  const dateTime = await page.locator('[data-testid="appointment-datetime"], .datetime').textContent() || '';
  
  return {
    doctorName: doctorName.trim(),
    specialty: specialty.trim(),
    dateTime: dateTime.trim()
  };
}

/**
 * Check if consultation can be joined (within time window)
 */
export async function canJoinConsultation(page: Page): Promise<{
  canJoin: boolean;
  timeRemaining?: string;
  message?: string;
}> {
  const joinButton = page.locator('button:has-text("Ingresar"), button:has-text("Unirse"), [data-testid="join-button"]').first();
  
  if (await joinButton.count() === 0) {
    return { canJoin: false, message: 'Join button not found' };
  }
  
  const isDisabled = await joinButton.isDisabled();
  
  if (!isDisabled) {
    return { canJoin: true };
  }
  
  // Check for countdown or message
  const countdown = page.locator('[data-testid="countdown"], .countdown, text=/minutos|horas/i').first();
  const timeRemaining = await countdown.textContent() || undefined;
  
  const message = page.locator('[data-testid="waiting-message"], .waiting-message').first();
  const messageText = await message.textContent() || undefined;
  
  return {
    canJoin: false,
    timeRemaining,
    message: messageText
  };
}
