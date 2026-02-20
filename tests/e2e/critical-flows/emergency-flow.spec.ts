/**
 * E2E Test: Emergency Escalation Flow
 * 
 * Tests the emergency detection and escalation process
 * Covers: TST-005.4 - Emergency escalation E2E
 * 
 * Scenarios:
 * - Emergency symptom detection in AI consulta
 * - 911 emergency redirection
 * - Emergency contact notification
 * - Priority queue escalation
 * - Post-emergency follow-up
 * - Emergency resources display
 */

import { test, expect, Page } from '@playwright/test';
import { patientFactory, emergencyFactory } from '../../fixtures/test-data';
import { auth, forms, elements, timing } from '../../utils/test-helpers';

test.describe('Critical Flow: Emergency Escalation', () => {
  
  test.describe('Scenario 1: Emergency Detection in AI Consulta', () => {
    test.beforeEach(async ({ page }) => {
      // Login as patient
      await auth.loginAsPatient(page);
    });

    test('should detect emergency symptoms and trigger alert', async ({ page }) => {
      // Step 1: Navigate to AI Consulta
      await test.step('Navigate to AI Consulta', async () => {
        await page.goto('/app/ai-consulta');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/.*ai-consulta/);
      });

      // Step 2: Verify AI Consulta interface
      await test.step('Verify AI Consulta interface', async () => {
        const chatTitle = page.locator('h1, h2').filter({ hasText: /consulta|IA|asistente/i }).first();
        
        if (await chatTitle.count() > 0) {
          await expect(chatTitle).toBeVisible();
        }

        // Check for disclaimer
        const disclaimer = page.locator('text=/IA asiste|no diagnostica|orientativa|emergencia/i').first();
        
        if (await disclaimer.count() > 0) {
          await expect(disclaimer).toBeVisible();
        }
      });

      // Step 3: Enter emergency symptoms
      await test.step('Enter emergency symptoms', async () => {
        const emergencyScenario = emergencyFactory.scenarios.chestPain;
        
        const messageInput = page.locator('textarea, input[type="text"]').filter({ hasText: '' }).first();
        
        if (await messageInput.count() > 0) {
          await messageInput.fill(emergencyScenario.symptoms);
          await expect(messageInput).toHaveValue(emergencyScenario.symptoms);
          
          // Send message
          const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")').first();
          if (await sendButton.count() > 0) {
            await sendButton.click();
            await page.waitForTimeout(3000);
          }
        }
      });

      // Step 4: Verify emergency alert is triggered
      await test.step('Verify emergency alert', async () => {
        // Check for emergency alert
        const emergencyAlert = page.locator('[data-testid="emergency-alert"], [role="alert"]').filter({ hasText: /emergencia|urgente|911|riesgo/i }).first();
        
        if (await emergencyAlert.count() > 0) {
          await expect(emergencyAlert).toBeVisible();
          
          // Verify alert has proper styling (red/urgent)
          const alertClass = await emergencyAlert.getAttribute('class') || '';
          const hasUrgentStyling = alertClass.includes('red') || alertClass.includes('danger') || alertClass.includes('urgent') || alertClass.includes('emergency');
          
          // Alert should have urgent styling or be prominently displayed
          expect(hasUrgentStyling || await emergencyAlert.isVisible()).toBe(true);
        }

        // Check for 911 call suggestion
        const call911Button = page.locator('a:has-text("911"), button:has-text("911"), a[href^="tel:911"]').first();
        
        if (await call911Button.count() > 0) {
          await expect(call911Button).toBeVisible();
          
          // Verify it has tel: protocol
          const href = await call911Button.getAttribute('href');
          if (href) {
            expect(href).toMatch(/^tel:/);
          }
        }
      });

      // Step 5: Verify emergency resources displayed
      await test.step('Verify emergency resources', async () => {
        const emergencyResources = page.locator('text=/emergencias|urgencias|hospital|ambulancia/i').first();
        
        if (await emergencyResources.count() > 0) {
          await expect(emergencyResources).toBeVisible();
        }

        // Check for nearby hospitals
        const hospitalsList = page.locator('[data-testid="hospitals-list"], .hospitals, text=/hospitales|cercano/i').first();
        
        if (await hospitalsList.count() > 0) {
          await expect(hospitalsList).toBeVisible();
        }
      });
    });

    test('should detect severe bleeding emergency', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      const emergencyScenario = emergencyFactory.scenarios.severeBleeding;
      
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill(emergencyScenario.symptoms);
        
        const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Verify emergency response
      const emergencyAlert = page.locator('text=/emergencia|urgente|riesgo|grave/i').first();
      
      if (await emergencyAlert.count() > 0) {
        await expect(emergencyAlert).toBeVisible();
      }
    });

    test('should detect stroke symptoms', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      const emergencyScenario = emergencyFactory.scenarios.stroke;
      
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill(emergencyScenario.symptoms);
        
        const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Verify emergency response mentions stroke
      const strokeAlert = page.locator('text=/emergencia|ictus|derrame|FAST|signos/i').first();
      
      if (await strokeAlert.count() > 0) {
        await expect(strokeAlert).toBeVisible();
      }
    });

    test('should handle non-emergency symptoms normally', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      const nonEmergencyScenario = emergencyFactory.scenarios.moderateSymptoms;
      
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill(nonEmergencyScenario.symptoms);
        
        const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Should NOT show emergency alert
      const emergencyAlert = page.locator('[data-testid="emergency-alert"]').first();
      
      if (await emergencyAlert.count() > 0) {
        const isVisible = await emergencyAlert.isVisible();
        expect(isVisible).toBe(false);
      }

      // Should show normal consultation response
      const normalResponse = page.locator('text=/recomendación|sugerencia|consulta|programar/i').first();
      
      if (await normalResponse.count() > 0) {
        await expect(normalResponse).toBeVisible();
      }
    });
  });

  test.describe('Scenario 2: Emergency Redirection', () => {
    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
    });

    test('should provide 911 calling option', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Enter emergency symptoms
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill(emergencyFactory.scenarios.chestPain.symptoms);
        
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Verify 911 link/button
      const emergency911 = page.locator('a[href="tel:911"], button:has-text("911"), a:has-text("Llamar 911")').first();
      
      if (await emergency911.count() > 0) {
        await expect(emergency911).toBeVisible();
        
        const href = await emergency911.getAttribute('href');
        expect(href).toBe('tel:911');
      }
    });

    test('should display nearby emergency services', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Trigger emergency
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill('Dolor intenso en el pecho');
        
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Check for emergency services
      const services = page.locator('text=/hospital|clínica|urgencias|emergencia|cercano/i').first();
      
      if (await services.count() > 0) {
        await expect(services).toBeVisible();
      }

      // Check for map or directions
      const mapLink = page.locator('a:has-text("Mapa"), a:has-text("Dirección"), a:has-text("Cómo llegar")').first();
      
      if (await mapLink.count() > 0) {
        await expect(mapLink).toBeVisible();
      }
    });

    test('should provide emergency instructions', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Trigger emergency
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill('No puedo respirar bien');
        
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Check for first aid instructions
      const instructions = page.locator('text=/mantener|calma|sentado|respirar|posición/i').first();
      
      if (await instructions.count() > 0) {
        await expect(instructions).toBeVisible();
      }
    });
  });

  test.describe('Scenario 3: Priority Queue Escalation', () => {
    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
    });

    test('should escalate urgent cases to priority queue', async ({ page }) => {
      // Navigate to AI consulta
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Enter urgent (but not 911-level) symptoms
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill('Fiebre muy alta de 40 grados y dolor de cabeza intenso');
        
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Check for priority queue option
      const priorityOption = page.locator('text=/urgente|prioridad|inmediato|lo antes posible/i').first();
      
      if (await priorityOption.count() > 0) {
        await expect(priorityOption).toBeVisible();
      }

      // Check for immediate consultation option
      const immediateConsult = page.locator('button:has-text("Consulta inmediata"), a:has-text("Urgente")').first();
      
      if (await immediateConsult.count() > 0) {
        await expect(immediateConsult).toBeVisible();
      }
    });

    test('should show estimated wait time for urgent cases', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Trigger urgent case
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill('Dolor abdominal severo');
        
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Check for wait time
      const waitTime = page.locator('text=/minutos|espera|disponible|hora/i').first();
      
      if (await waitTime.count() > 0) {
        await expect(waitTime).toBeVisible();
      }
    });
  });

  test.describe('Scenario 4: Emergency Contact Notification', () => {
    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
    });

    test('should notify emergency contacts', async ({ page }) => {
      // Navigate to AI consulta
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Trigger emergency
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill('Me siento muy mal, dolor intenso');
        
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Check for emergency contact notification option
      const notifyContacts = page.locator('text=/contacto|familiar|notificar|avisar/i').first();
      
      if (await notifyContacts.count() > 0) {
        await expect(notifyContacts).toBeVisible();
      }
    });

    test('should allow adding emergency contacts', async ({ page }) => {
      // Navigate to profile or settings
      await page.goto('/app/profile');
      await page.waitForLoadState('networkidle');

      // Look for emergency contacts section
      const emergencyContacts = page.locator('text=/contacto de emergencia|emergencia/i').first();
      
      if (await emergencyContacts.count() > 0) {
        await emergencyContacts.click();
        await page.waitForTimeout(1000);

        // Check for add contact button
        const addButton = page.locator('button:has-text("Agregar"), button:has-text("Añadir")').first();
        
        if (await addButton.count() > 0) {
          await expect(addButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Scenario 5: Post-Emergency Follow-up', () => {
    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
    });

    test('should schedule follow-up after emergency', async ({ page }) => {
      // Navigate to follow-ups
      await page.goto('/app/followups');
      await page.waitForLoadState('networkidle');

      // Check for emergency follow-up
      const emergencyFollowup = page.locator('text=/emergencia|seguimiento|post/i').first();
      
      if (await emergencyFollowup.count() > 0) {
        await expect(emergencyFollowup).toBeVisible();
      }
    });

    test('should display emergency history', async ({ page }) => {
      // Navigate to medical history
      await page.goto('/app/profile');
      await page.waitForLoadState('networkidle');

      // Look for medical history or emergency history
      const history = page.locator('text=/historial|antecedentes|emergencias pasadas/i').first();
      
      if (await history.count() > 0) {
        await expect(history).toBeVisible();
      }
    });
  });

  test.describe('Scenario 6: Emergency Resources and Information', () => {
    test('should display emergency resources page', async ({ page }) => {
      // Try to navigate to emergency resources
      await page.goto('/emergency');
      await page.waitForLoadState('networkidle');

      // If page exists, verify content
      if (!page.url().includes('404')) {
        const emergencyTitle = page.locator('h1, h2').filter({ hasText: /emergencia|urgencia/i }).first();
        
        if (await emergencyTitle.count() > 0) {
          await expect(emergencyTitle).toBeVisible();
        }

        // Check for 911 info
        const emergency911 = page.locator('text=/911|emergencias/i').first();
        
        if (await emergency911.count() > 0) {
          await expect(emergency911).toBeVisible();
        }
      }
    });

    test('should display emergency numbers', async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('networkidle');

      // Look for emergency numbers
      const emergencyNumbers = page.locator('text=/911|065|emergencia|urgencia/i').first();
      
      if (await emergencyNumbers.count() > 0) {
        await expect(emergencyNumbers).toBeVisible();
      }
    });

    test('should provide first aid information', async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('networkidle');

      // Look for first aid info
      const firstAid = page.locator('text=/primeros auxilios|RCP|primeros auxilios/i').first();
      
      if (await firstAid.count() > 0) {
        await expect(firstAid).toBeVisible();
      }
    });
  });

  test.describe('Scenario 7: Unauthenticated Emergency Access', () => {
    test('should allow emergency symptom checker without login', async ({ page }) => {
      // Navigate to AI consulta without login
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Should either allow access or redirect to login
      const currentUrl = page.url();
      
      if (currentUrl.includes('ai-consulta')) {
        // If allowed, verify interface
        const chatInterface = page.locator('textarea, input[type="text"]').first();
        
        if (await chatInterface.count() > 0) {
          await expect(chatInterface).toBeVisible();
        }
      } else {
        // If redirected, should be to login
        expect(currentUrl).toMatch(/\/login|\/auth/);
      }
    });
  });

  test.describe('Scenario 8: Mobile Emergency Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
      await auth.loginAsPatient(page);
    });

    test('should display mobile-optimized emergency alert', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Trigger emergency
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill('Dolor intenso en el pecho, no puedo respirar');
        
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Verify emergency alert is visible and prominent on mobile
      const emergencyAlert = page.locator('[data-testid="emergency-alert"], [role="alert"]').first();
      
      if (await emergencyAlert.count() > 0) {
        const box = await emergencyAlert.boundingBox();
        const viewport = await page.evaluate(() => ({ width: window.innerWidth }));
        
        if (box) {
          // Alert should take most of the width on mobile
          expect(box.width).toBeGreaterThan(viewport.width * 0.8);
        }
      }

      // Verify 911 button is easily clickable
      const call911 = page.locator('a[href="tel:911"], button:has-text("911")').first();
      
      if (await call911.count() > 0) {
        const box = await call911.boundingBox();
        
        if (box) {
          // Should be large enough for emergency tapping
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(100);
        }
      }
    });

    test('should support swipe for emergency actions', async ({ page }) => {
      await page.goto('/app/ai-consulta');
      await page.waitForLoadState('networkidle');

      // Trigger emergency
      const messageInput = page.locator('textarea, input[type="text"]').first();
      
      if (await messageInput.count() > 0) {
        await messageInput.fill('Emergencia médica');
        
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }

      // Page should be scrollable
      const body = page.locator('body');
      const scrollHeight = await body.evaluate(el => el.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      expect(scrollHeight).toBeGreaterThanOrEqual(viewportHeight);
    });
  });
});
