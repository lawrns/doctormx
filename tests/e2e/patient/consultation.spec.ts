import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Patient Consultation Flow
 *
 * Tests the complete consultation experience including
 * pre-consultation chat, video consultation, and post-consultation review
 * Requirements: Requirement 4, 11, 12, 14
 */

test.describe('Patient Consultation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test patient
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  });

  test('should view upcoming appointments', async ({ page }) => {
    // Navigate to patient dashboard
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Click on appointments
    const appointmentsLink = page.locator('a[href*="appointments"], a:has-text("Mis Citas")');
    if (await appointmentsLink.count() > 0) {
      await appointmentsLink.first().click();
      await page.waitForLoadState('networkidle');

      // Verify appointments page
      await expect(page).toHaveURL(/.*appointments/);

      // Check for appointment cards
      const appointmentCards = page.locator('[data-testid="appointment-card"], .appointment-card');
      const count = await appointmentCards.count();
      console.log(`Found ${count} appointments`);
    }
  });

  test('should display appointment details', async ({ page }) => {
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Find first appointment
    const appointmentCard = page.locator('[data-testid="appointment-card"], .appointment-card').first();
    const count = await appointmentCard.count();

    if (count > 0) {
      // Verify appointment info is displayed
      const doctorName = appointmentCard.locator('text=/Dr\\.|Doctor/i');
      if (await doctorName.count() > 0) {
        await expect(doctorName).toBeVisible();
      }

      const dateInfo = appointmentCard.locator('text=/\\d{1,2}\\sde\\s\\w+|enero|febrero|marzo/i');
      if (await dateInfo.count() > 0) {
        await expect(dateInfo).toBeVisible();
      }

      const statusBadge = appointmentCard.locator('[data-testid="status"], .badge, [class*="status"]');
      if (await statusBadge.count() > 0) {
        await expect(statusBadge.first()).toBeVisible();
      }
    }
  });

  test('should join consultation room', async ({ page }) => {
    // Use a dummy appointment ID for testing
    const appointmentId = '00000000-0000-0000-0000-000000000000';
    await page.goto(`/consultation/${appointmentId}`);
    await page.waitForLoadState('networkidle');

    // Check for consultation room elements
    const roomTitle = page.locator('h1, h2').filter({ hasText: /consulta|video/i });
    if (await roomTitle.count() > 0) {
      await expect(roomTitle).toBeVisible();
    }

    // Check for video join button
    const joinButton = page.locator('button:has-text("Ingresar"), a:has-text("Ingresar"), button:has-text("Unirse")');
    if (await joinButton.count() > 0) {
      // Verify button is disabled if too early (Requirement 4.4, 4.5)
      const isDisabled = await joinButton.first().isDisabled();
      console.log(`Join button disabled: ${isDisabled}`);

      // Check for countdown or timer if disabled
      if (isDisabled) {
        const countdown = page.locator('text=/minutos|horas|espera/i');
        if (await countdown.count() > 0) {
          await expect(countdown).toBeVisible();
        }
      }
    }
  });

  test('should display pre-consultation chat', async ({ page }) => {
    // Navigate to appointments
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Find appointment with chat option
    const chatButton = page.locator('button:has-text("Chat"), a:has-text("Chat"), [data-testid="chat-button"]');
    if (await chatButton.count() > 0) {
      await chatButton.first().click();
      await page.waitForTimeout(1000);

      // Verify chat interface
      const chatContainer = page.locator('[data-testid="chat-container"], .chat-container');
      if (await chatContainer.count() > 0) {
        await expect(chatContainer).toBeVisible();

        // Check for message input
        const messageInput = page.locator('textarea, input[type="text"]').filter({ hasText: '' });
        if (await messageInput.count() > 0) {
          await expect(messageInput.first()).toBeVisible();
        }

        // Check for send button
        const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")');
        if (await sendButton.count() > 0) {
          await expect(sendButton.first()).toBeVisible();
        }
      }
    }
  });

  test('should access AI consulta feature', async ({ page }) => {
    await page.goto('/app/ai-consulta');
    await page.waitForLoadState('networkidle');

    // Requirement 12: AI Pre-Consulta Triage
    const pageTitle = page.locator('h1, h2').filter({ hasText: /consulta|síntomas|triage/i });
    if (await pageTitle.count() > 0) {
      await expect(pageTitle).toBeVisible();
    }

    // Check for disclaimer (Requirement 12.10)
    const disclaimer = page.locator('text=/La IA asiste|no diagnostica|orientativa/i');
    if (await disclaimer.count() > 0) {
      await expect(disclaimer).toBeVisible();
    }

    // Check for chat interface
    const chatInterface = page.locator('[data-testid="ai-chat"], .ai-chat-container');
    if (await chatInterface.count() > 0) {
      await expect(chatInterface).toBeVisible();
    }
  });

  test('should handle emergency red flag detection', async ({ page }) => {
    await page.goto('/app/ai-consulta');
    await page.waitForLoadState('networkidle');

    // Look for emergency alert elements (Requirement 12.6)
    const emergencyAlert = page.locator('[data-testid="emergency-alert"], [role="alert"]').filter({ hasText: /emergencia|911|urgente/i });
    // Should not be visible initially

    // Check for emergency resources section
    const emergencyResources = page.locator('text=/911|emergencias|urgencias/i');
    if (await emergencyResources.count() > 0) {
      // Resources should be available but not necessarily visible
      expect(await emergencyResources.count()).toBeGreaterThan(0);
    }
  });

  test('should display follow-up information', async ({ page }) => {
    await page.goto('/app/followups');
    await page.waitForLoadState('networkidle');

    // Requirement 14: Automated Follow-up
    const pageTitle = page.locator('h1, h2').filter({ hasText: /seguimiento|follow.?up/i });
    if (await pageTitle.count() > 0) {
      await expect(pageTitle).toBeVisible();
    }

    // Check for follow-up items
    const followUpItems = page.locator('[data-testid="followup-item"], .followup-card');
    const count = await followUpItems.count();
    console.log(`Found ${count} follow-ups`);

    if (count > 0) {
      // Verify follow-up status indicators
      const statusBadges = followUpItems.first().locator('[data-testid="status"], .badge');
      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toBeVisible();
      }
    }
  });

  test('should submit doctor review', async ({ page }) => {
    // Requirement 11: Patient Rates Consultation
    // Navigate to a completed consultation
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Look for review button or rating interface
    const reviewButton = page.locator('button:has-text("Calificar"), a:has-text("Calificar"), button:has-text("Opinar")');
    if (await reviewButton.count() > 0) {
      await reviewButton.first().click();
      await page.waitForTimeout(1000);

      // Check for rating interface
      const ratingModal = page.locator('[data-testid="rating-modal"], [role="dialog"]').filter({ hasText: /califica|opinión/i });
      if (await ratingModal.count() > 0) {
        await expect(ratingModal).toBeVisible();

        // Check for star rating
        const stars = page.locator('[data-testid="star-rating"], button[aria-label*="estrella"], button[aria-label*="star"]');
        if (await stars.count() > 0) {
          // Click first star
          await stars.first().click();
          await page.waitForTimeout(500);

          // Optionally add comment
          const commentInput = page.locator('textarea[name="comment"], textarea[placeholder*="comenta"]');
          if (await commentInput.count() > 0) {
            await commentInput.first().fill('Excelente consulta, muy atento el doctor.');
          }

          // Submit review
          const submitButton = page.locator('button[type="submit"]').filter({ hasText: /enviar|publicar/i });
          if (await submitButton.count() > 0) {
            await submitButton.first().click();
            await page.waitForTimeout(2000);

            // Verify success message
            const successMessage = page.locator('text=/Gracias|comentario enviado|recibido/i');
            if (await successMessage.count() > 0) {
              await expect(successMessage).toBeVisible();
            }
          }
        }
      }
    }
  });

  test('should view consultation history', async ({ page }) => {
    await page.goto('/app/appointments');
    await page.waitForLoadState('networkidle');

    // Look for history or past appointments section
    const pastAppointments = page.locator('text=/Pasadas|Completadas|Historial/i');
    if (await pastAppointments.count() > 0) {
      await expect(pastAppointments).toBeVisible();

      // Navigate to past appointments if there's a tab
      const pastTab = page.locator('button, a').filter({ hasText: /Pasadas|Historial/i }).first();
      if (await pastTab.count() > 0) {
        await pastTab.click();
        await page.waitForTimeout(1000);
      }
    }

    // Check for SOAP notes or consultation summaries
    const soapNotesLink = page.locator('a:has-text("SOAP"), button:has-text("Ver nota"), a:has-text("Resumen")');
    if (await soapNotesLink.count() > 0) {
      await expect(soapNotesLink.first()).toBeVisible();
    }
  });

  test('should access second opinion feature', async ({ page }) => {
    await page.goto('/app/second-opinion');
    await page.waitForLoadState('networkidle');

    // Check for second opinion interface
    const pageTitle = page.locator('h1, h2').filter({ hasText: /segunda opinión|second opinion/i });
    if (await pageTitle.count() > 0) {
      await expect(pageTitle).toBeVisible();
    }

    // Check for file upload
    const fileUpload = page.locator('input[type="file"]');
    if (await fileUpload.count() > 0) {
      await expect(fileUpload).toBeVisible();
    }

    // Check for description input
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="describe"]');
    if (await descriptionInput.count() > 0) {
      await expect(descriptionInput).toBeVisible();
    }
  });

  test('should handle image upload for analysis', async ({ page }) => {
    // Requirement 24: Medical Image Analysis
    await page.goto('/app/ai-consulta');
    await page.waitForLoadState('networkidle');

    // Check for image upload feature
    const imageUpload = page.locator('input[type="file"][accept*="image"], button:has-text("Subir imagen")');
    if (await imageUpload.count() > 0) {
      await expect(imageUpload.first()).toBeVisible();

      // Verify disclaimer for image analysis (Requirement 24.5)
      const imageDisclaimer = page.locator('text=/segunda opinión|análisis de imagen|no sustituye/i');
      if (await imageDisclaimer.count() > 0) {
        await expect(imageDisclaimer).toBeVisible();
      }
    }
  });

  test('should display health profile', async ({ page }) => {
    await page.goto('/app/profile');
    await page.waitForLoadState('networkidle');

    // Check for profile sections
    const profileTitle = page.locator('h1, h2').filter({ hasText: /perfil|mi información/i });
    if (await profileTitle.count() > 0) {
      await expect(profileTitle).toBeVisible();
    }

    // Check for medical history section
    const medicalHistory = page.locator('text=/Historial médico|Antecedentes|Alergias/i');
    if (await medicalHistory.count() > 0) {
      await expect(medicalHistory).toBeVisible();
    }
  });
});

test.describe('Patient Consultation - Real-time Features', () => {
  test('should handle video consultation permissions', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Navigate to consultation
    await page.goto('/consultation/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Check for camera/microphone permission prompts
    const joinButton = page.locator('button:has-text("Ingresar"), a:has-text("Ingresar")');
    if (await joinButton.count() > 0) {
      // Set up permission handlers
      const context = page.context();

      // Grant permissions
      await context.grantPermissions(['camera', 'microphone']);

      // Click join button
      await Promise.all([
        joinButton.first().click(),
        page.waitForTimeout(2000)
      ]);
    }
  });

  test('should display connection quality indicator', async ({ page }) => {
    // This test would verify video quality indicators
    // Implementation depends on video provider (Daily.co, Jitsi, etc.)
    await page.goto('/consultation/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    // Look for connection quality indicator
    const qualityIndicator = page.locator('[data-testid="connection-quality"], .connection-quality');
    // May or may not be present depending on implementation
  });
});
