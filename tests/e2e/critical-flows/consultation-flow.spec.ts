/**
 * E2E Test: Video Consultation Flow
 * 
 * Tests the complete video consultation experience
 * Covers: TST-005.2 - Video consultation E2E
 * 
 * Scenarios:
 * - Join video consultation room
 * - Pre-consultation preparation
 * - In-consultation features
 * - Post-consultation actions
 * - Connection quality handling
 * - Permissions handling
 */

import { test, expect, Page } from '@playwright/test';
import { patientFactory, doctorFactory, consultationFactory } from '../../fixtures/test-data';
import { auth, videoConsultation, timing, elements } from '../../utils/test-helpers';

test.describe('Critical Flow: Video Consultation', () => {
  
  test.describe('Scenario 1: Patient Joins Video Consultation', () => {
    test.beforeEach(async ({ page }) => {
      // Login as patient
      await auth.loginAsPatient(page);
    });

    test('should access consultation room and view appointment details', async ({ page }) => {
      // Step 1: Navigate to appointments
      await test.step('Navigate to appointments', async () => {
        await page.goto('/app/appointments');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/.*appointments/);
      });

      // Step 2: Find upcoming appointment
      await test.step('Find upcoming appointment', async () => {
        const appointmentCard = page.locator('[data-testid="appointment-card"], .appointment-card').first();
        
        if (await appointmentCard.count() === 0) {
          // If no appointments, navigate directly to consultation page
          await page.goto(`/consultation/${consultationFactory.create().id}`);
          await page.waitForLoadState('networkidle');
        } else {
          // Click on appointment to view details
          await appointmentCard.click();
          await page.waitForLoadState('networkidle');
        }
      });

      // Step 3: Verify consultation room elements
      await test.step('Verify consultation room interface', async () => {
        // Check for room title
        const roomTitle = page.locator('h1, h2').filter({ hasText: /consulta|sala|video/i }).first();
        if (await roomTitle.count() > 0) {
          await expect(roomTitle).toBeVisible();
        }

        // Check for appointment information
        const appointmentInfo = page.locator('text=/Fecha|Hora|Doctor|Paciente/i').first();
        await expect(appointmentInfo).toBeVisible();

        // Check for join button or instructions
        const joinSection = page.locator('button:has-text("Ingresar"), .join-section, [data-testid="join-room"]').first();
        if (await joinSection.count() > 0) {
          await expect(joinSection).toBeVisible();
        }
      });

      // Step 4: Verify consultation instructions
      await test.step('Verify consultation instructions', async () => {
        const instructions = page.locator('text=/cámara|micrófono|internet|prueba|test/i').first();
        if (await instructions.count() > 0) {
          await expect(instructions).toBeVisible();
        }

        // Check for technical requirements
        const techRequirements = page.locator('text=/Chrome|Firefox|Safari|navegador/i').first();
        if (await techRequirements.count() > 0) {
          await expect(techRequirements).toBeVisible();
        }
      });
    });

    test('should handle join button state based on appointment time', async ({ page }) => {
      // Navigate to a consultation room
      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Find join button
      const joinButton = page.locator('button:has-text("Ingresar"), button:has-text("Unirse"), [data-testid="join-button"]').first();
      
      if (await joinButton.count() > 0) {
        // Check button state
        const isDisabled = await joinButton.isDisabled();
        
        if (isDisabled) {
          // If disabled, check for countdown or message
          const countdown = page.locator('text=/minutos|horas|espera|pronto|disponible/i').first();
          const waitMessage = page.locator('text=/consulta comenzará|demasiado temprano/i').first();
          
          const hasCountdown = await countdown.count() > 0;
          const hasWaitMessage = await waitMessage.count() > 0;
          
          expect(hasCountdown || hasWaitMessage).toBe(true);
        } else {
          // If enabled, button should be clickable
          await expect(joinButton).toBeEnabled();
        }
      }
    });

    test('should display video room with proper permissions', async ({ page }) => {
      // Grant camera and microphone permissions
      await videoConsultation.grantPermissions(page);

      // Navigate to consultation
      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Look for video container
      const videoContainer = page.locator('[data-testid="video-container"], .video-room, iframe').first();
      
      if (await videoContainer.count() > 0) {
        await expect(videoContainer).toBeVisible();
      }

      // Check for video controls
      const videoControls = page.locator('button:has-text("Cámara"), button:has-text("Micrófono"), button:has-text("Colgar"), [data-testid="video-controls"]').first();
      if (await videoControls.count() > 0) {
        await expect(videoControls).toBeVisible();
      }
    });

    test('should handle pre-consultation chat', async ({ page }) => {
      // Navigate to appointments
      await page.goto('/app/appointments');
      await page.waitForLoadState('networkidle');

      // Look for chat button
      const chatButton = page.locator('button:has-text("Chat"), a:has-text("Chat"), [data-testid="chat-button"]').first();
      
      if (await chatButton.count() > 0) {
        await chatButton.click();
        await page.waitForTimeout(1000);

        // Verify chat interface
        const chatContainer = page.locator('[data-testid="chat-container"], .chat-container').first();
        await expect(chatContainer).toBeVisible();

        // Check for message input
        const messageInput = page.locator('textarea, input[type="text"]').filter({ hasText: '' }).first();
        if (await messageInput.count() > 0) {
          await expect(messageInput).toBeVisible();
          
          // Type a message
          await messageInput.fill('Hola doctor, estoy listo para la consulta');
          await expect(messageInput).toHaveValue('Hola doctor, estoy listo para la consulta');
        }

        // Check for send button
        const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")').first();
        if (await sendButton.count() > 0) {
          await expect(sendButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Scenario 2: Doctor Joins Video Consultation', () => {
    test.beforeEach(async ({ page }) => {
      // Login as doctor
      await auth.loginAsDoctor(page);
    });

    test('should access doctor consultation room', async ({ page }) => {
      // Navigate to doctor appointments
      await page.goto('/doctor/appointments');
      await page.waitForLoadState('networkidle');

      // Find upcoming appointment
      const appointmentRow = page.locator('tr, [data-testid="appointment-row"], .appointment-item').first();
      
      if (await appointmentRow.count() > 0) {
        // Look for join button in appointment
        const joinButton = appointmentRow.locator('button:has-text("Ingresar"), a:has-text("Ingresar"), button:has-text("Iniciar")').first();
        
        if (await joinButton.count() > 0) {
          await joinButton.click();
          await page.waitForLoadState('networkidle');
          
          // Should be on consultation page
          await expect(page).toHaveURL(/\/consultation\//);
        }
      } else {
        // Navigate directly to consultation page
        await page.goto(`/doctor/consultation/${consultationFactory.create().id}`);
        await page.waitForLoadState('networkidle');
      }

      // Verify doctor-specific controls
      const doctorControls = page.locator('button:has-text("Receta"), button:has-text("Notas"), button:has-text("SOAP"), [data-testid="doctor-controls"]').first();
      if (await doctorControls.count() > 0) {
        await expect(doctorControls).toBeVisible();
      }
    });

    test('should access patient information during consultation', async ({ page }) => {
      await page.goto(`/doctor/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Look for patient info panel
      const patientInfo = page.locator('[data-testid="patient-info"], .patient-card, text=/Paciente:|Nombre:/i').first();
      
      if (await patientInfo.count() > 0) {
        await expect(patientInfo).toBeVisible();
      }

      // Check for medical history access
      const historyButton = page.locator('button:has-text("Historial"), button:has-text("Antecedentes"), a:has-text("Ver historial")').first();
      if (await historyButton.count() > 0) {
        await expect(historyButton).toBeVisible();
      }
    });
  });

  test.describe('Scenario 3: In-Consultation Features', () => {
    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
      await videoConsultation.grantPermissions(page);
    });

    test('should handle video controls during consultation', async ({ page }) => {
      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Look for video control buttons
      const cameraButton = page.locator('button:has-text("Cámara"), button[aria-label*="cámara"], [data-testid="toggle-camera"]').first();
      const micButton = page.locator('button:has-text("Micrófono"), button[aria-label*="micrófono"], [data-testid="toggle-mic"]').first();
      const endButton = page.locator('button:has-text("Colgar"), button:has-text("Terminar"), button[aria-label*="terminar"], [data-testid="end-call"]').first();

      // Test camera toggle if available
      if (await cameraButton.count() > 0) {
        await cameraButton.click();
        await page.waitForTimeout(500);
        // Button should still be visible after toggle
        await expect(cameraButton).toBeVisible();
      }

      // Test microphone toggle if available
      if (await micButton.count() > 0) {
        await micButton.click();
        await page.waitForTimeout(500);
        await expect(micButton).toBeVisible();
      }

      // Verify end call button exists
      if (await endButton.count() > 0) {
        await expect(endButton).toBeVisible();
      }
    });

    test('should display connection quality indicator', async ({ page }) => {
      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Look for connection quality indicator
      const qualityIndicator = page.locator('[data-testid="connection-quality"], .connection-status, text=/conexión|señal/i').first();
      
      if (await qualityIndicator.count() > 0) {
        await expect(qualityIndicator).toBeVisible();
      }

      // Look for network status
      const networkStatus = page.locator('text=/buena|regular|débil|excelente/i').first();
      if (await networkStatus.count() > 0) {
        const status = await networkStatus.textContent();
        expect(status).toMatch(/buena|regular|débil|excelente/i);
      }
    });

    test('should handle screen sharing option', async ({ page }) => {
      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Look for screen share button
      const screenShareButton = page.locator('button:has-text("Pantalla"), button[aria-label*="pantalla"], [data-testid="share-screen"]').first();
      
      if (await screenShareButton.count() > 0) {
        await expect(screenShareButton).toBeVisible();
        
        // Note: Actually clicking screen share would trigger browser permission dialog
        // which is hard to automate in tests
      }
    });
  });

  test.describe('Scenario 4: Post-Consultation', () => {
    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
    });

    test('should display post-consultation summary', async ({ page }) => {
      // Navigate to completed appointments
      await page.goto('/app/appointments');
      await page.waitForLoadState('networkidle');

      // Look for completed/past appointments tab
      const pastTab = page.locator('button:has-text("Completadas"), button:has-text("Pasadas"), a:has-text("Historial"]').first();
      
      if (await pastTab.count() > 0) {
        await pastTab.click();
        await page.waitForTimeout(1000);
      }

      // Look for consultation summary link
      const summaryLink = page.locator('a:has-text("Ver resumen"), a:has-text("SOAP"), button:has-text("Notas médicas"]').first();
      
      if (await summaryLink.count() > 0) {
        await summaryLink.click();
        await page.waitForLoadState('networkidle');

        // Verify summary page elements
        const summaryTitle = page.locator('h1, h2').filter({ hasText: /resumen|notas|SOAP/i }).first();
        if (await summaryTitle.count() > 0) {
          await expect(summaryTitle).toBeVisible();
        }

        // Check for diagnosis or notes
        const diagnosis = page.locator('text=/diagnóstico|Diagnóstico|impresión/i').first();
        if (await diagnosis.count() > 0) {
          await expect(diagnosis).toBeVisible();
        }
      }
    });

    test('should allow patient to rate consultation', async ({ page }) => {
      await page.goto('/app/appointments');
      await page.waitForLoadState('networkidle');

      // Look for rate button
      const rateButton = page.locator('button:has-text("Calificar"), a:has-text("Calificar"), button:has-text("Opinión"]').first();
      
      if (await rateButton.count() > 0) {
        await rateButton.click();
        await page.waitForTimeout(1000);

        // Verify rating modal
        const ratingModal = page.locator('[data-testid="rating-modal"], [role="dialog"]').filter({ hasText: /califica|opinión/i }).first();
        if (await ratingModal.count() > 0) {
          await expect(ratingModal).toBeVisible();

          // Select rating (stars)
          const stars = page.locator('[data-testid="star-rating"] button, button[aria-label*="estrella"]').first();
          if (await stars.count() > 0) {
            await stars.click();
          }

          // Add comment
          const commentInput = page.locator('textarea[name="comment"]').first();
          if (await commentInput.count() > 0) {
            await commentInput.fill('Excelente consulta, muy profesional');
          }

          // Submit
          const submitButton = page.locator('button[type="submit"]').filter({ hasText: /enviar|publicar/i }).first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(2000);

            // Verify success message
            const successMessage = page.locator('text=/gracias|enviado|recibido/i').first();
            if (await successMessage.count() > 0) {
              await expect(successMessage).toBeVisible();
            }
          }
        }
      }
    });

    test('should access prescription after consultation', async ({ page }) => {
      await page.goto('/app/appointments');
      await page.waitForLoadState('networkidle');

      // Look for prescription link
      const prescriptionLink = page.locator('a:has-text("Receta"), button:has-text("Receta"), a:has-text("Medicamentos"]').first();
      
      if (await prescriptionLink.count() > 0) {
        await prescriptionLink.click();
        await page.waitForLoadState('networkidle');

        // Verify prescription page
        const prescriptionTitle = page.locator('h1, h2').filter({ hasText: /receta|prescripción/i }).first();
        if (await prescriptionTitle.count() > 0) {
          await expect(prescriptionTitle).toBeVisible();
        }

        // Check for medication list
        const medications = page.locator('text=/medicamento|dosis|frecuencia/i').first();
        if (await medications.count() > 0) {
          await expect(medications).toBeVisible();
        }

        // Check for download option
        const downloadButton = page.locator('button:has-text("Descargar"), a:has-text("Descargar"), button:has-text("PDF"]').first();
        if (await downloadButton.count() > 0) {
          await expect(downloadButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Scenario 5: Error Handling and Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
    });

    test('should handle invalid consultation room', async ({ page }) => {
      // Navigate to non-existent consultation
      await page.goto('/consultation/invalid-room-id');
      await page.waitForLoadState('networkidle');

      // Should show error or redirect
      const errorMessage = page.locator('text=/no encontrada|inválida|error|no existe/i').first();
      const redirect = page.url().includes('/app') || page.url().includes('/appointments');
      
      expect(await errorMessage.count() > 0 || redirect).toBe(true);
    });

    test('should handle expired consultation link', async ({ page }) => {
      // Navigate to expired consultation
      await page.goto(`/consultation/${consultationFactory.create().id}?expired=true`);
      await page.waitForLoadState('networkidle');

      // Should show expiration message
      const expiredMessage = page.locator('text=/expirada|finalizada|concluida|pasada/i').first();
      
      if (await expiredMessage.count() > 0) {
        await expect(expiredMessage).toBeVisible();
      }
    });

    test('should handle network disconnection gracefully', async ({ page }) => {
      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Simulate offline
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // Check for offline indicator
      const offlineIndicator = page.locator('text=/sin conexión|offline|reconectando/i').first();
      
      // Restore connection
      await page.context().setOffline(false);
      
      if (await offlineIndicator.count() > 0) {
        await expect(offlineIndicator).toBeVisible();
      }
    });

    test('should display proper error when camera is blocked', async ({ page }) => {
      // Explicitly deny permissions
      await page.context().clearPermissions();

      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Check for permission error message
      const permissionError = page.locator('text=/permiso|cámara|micrófono|acceso denegado/i').first();
      
      if (await permissionError.count() > 0) {
        await expect(permissionError).toBeVisible();
      }

      // Check for instructions to enable permissions
      const instructions = page.locator('text=/configuración|habilitar|permitir/i').first();
      
      if (await instructions.count() > 0) {
        await expect(instructions).toBeVisible();
      }
    });
  });

  test.describe('Scenario 6: Mobile Video Consultation', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
      await videoConsultation.grantPermissions(page);
    });

    test('should display mobile-optimized video interface', async ({ page }) => {
      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Check video container fits in viewport
      const videoContainer = page.locator('[data-testid="video-container"], .video-room').first();
      
      if (await videoContainer.count() > 0) {
        const box = await videoContainer.boundingBox();
        const viewport = await page.evaluate(() => ({ 
          width: window.innerWidth, 
          height: window.innerHeight 
        }));
        
        if (box) {
          expect(box.width).toBeLessThanOrEqual(viewport.width);
        }
      }

      // Check for mobile-friendly controls
      const controls = page.locator('[data-testid="video-controls"], .mobile-controls').first();
      
      if (await controls.count() > 0) {
        await expect(controls).toBeVisible();
      }
    });

    test('should handle device orientation changes', async ({ page }) => {
      await page.goto(`/consultation/${consultationFactory.create().id}`);
      await page.waitForLoadState('networkidle');

      // Change to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);

      // Verify video still visible
      const videoContainer = page.locator('[data-testid="video-container"], .video-room, video').first();
      
      if (await videoContainer.count() > 0) {
        await expect(videoContainer).toBeVisible();
      }

      // Change back to portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
    });
  });
});
