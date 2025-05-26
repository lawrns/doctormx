import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import crypto from 'crypto';

// WhatsApp Business API Webhook Handler for DoctorMX
// Critical component for Mexican market penetration (90% WhatsApp usage)

interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'document';
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  audio?: { id: string; mime_type: string };
  document?: { id: string; filename: string; mime_type: string };
}

interface WhatsAppContact {
  profile: { name: string };
  wa_id: string;
}

interface WhatsAppWebhookData {
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { phone_number_id: string };
        contacts?: WhatsAppContact[];
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
    }>;
  }>;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, body, queryStringParameters, headers } = event;

  try {
    // Handle webhook verification (required by WhatsApp)
    if (httpMethod === 'GET') {
      const mode = queryStringParameters?.['hub.mode'];
      const token = queryStringParameters?.['hub.verify_token'];
      const challenge = queryStringParameters?.['hub.challenge'];

      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ WhatsApp webhook verified successfully');
        return {
          statusCode: 200,
          body: challenge || '',
        };
      } else {
        console.log('❌ WhatsApp webhook verification failed');
        return { statusCode: 403, body: 'Forbidden' };
      }
    }

    // Handle incoming messages and status updates
    if (httpMethod === 'POST') {
      if (!body) {
        return { statusCode: 400, body: 'Missing request body' };
      }

      // Verify webhook signature for security
      const signature = headers['x-hub-signature-256'];
      if (!verifyWebhookSignature(body, signature)) {
        console.log('❌ Invalid webhook signature');
        return { statusCode: 403, body: 'Invalid signature' };
      }

      const webhookData: WhatsAppWebhookData = JSON.parse(body);
      
      // Process incoming messages
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          const { value } = change;
          
          // Handle incoming messages
          if (value.messages) {
            for (const message of value.messages) {
              const contact = value.contacts?.[0];
              await processIncomingMessage(message, contact);
            }
          }
          
          // Handle message status updates
          if (value.statuses) {
            for (const status of value.statuses) {
              await processMessageStatus(status);
            }
          }
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    }

    return { statusCode: 405, body: 'Method not allowed' };
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

// Verify webhook signature for security
function verifyWebhookSignature(payload: string, signature: string | undefined): boolean {
  if (!signature || !process.env.WHATSAPP_APP_SECRET) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
    .update(payload, 'utf8')
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}

// Process incoming WhatsApp messages
async function processIncomingMessage(
  message: WhatsAppMessage, 
  contact?: WhatsAppContact
): Promise<void> {
  console.log('📱 Processing WhatsApp message:', {
    id: message.id,
    from: message.from,
    type: message.type
  });

  const messageData = {
    messageId: message.id,
    from: message.from,
    timestamp: new Date(parseInt(message.timestamp) * 1000),
    type: message.type,
    text: message.text?.body || '',
    contactName: contact?.profile?.name || '',
    waId: contact?.wa_id || message.from,
  };

  // Analyze message for Mexican health context
  const healthContext = await analyzeMexicanHealthContext(messageData);
  
  // Route to appropriate handler based on intent
  await routeMessageToHandler(messageData, healthContext);
  
  // Log message for analytics
  await logMessageForAnalytics(messageData, healthContext);
}

// Analyze Mexican health context and user intent
async function analyzeMexicanHealthContext(messageData: any) {
  const text = messageData.text.toLowerCase();
  
  // Mexican health terminology detection
  const healthTerms = {
    emergency: ['emergencia', 'urgente', 'grave', 'auxilio', 'dolor fuerte', 'no respira'],
    symptoms: ['dolor', 'síntoma', 'molestia', 'malestar', 'fiebre', 'tos', 'mareado'],
    imss: ['imss', 'issste', 'seguro social', 'clínica', 'hospital público'],
    family: ['mi hijo', 'mi hija', 'mi esposa', 'mi esposo', 'mi mamá', 'mi papá', 'familiar', 'bebé'],
    medication: ['medicina', 'medicamento', 'pastilla', 'jarabe', 'receta', 'farmacia'],
    appointment: ['cita', 'consulta', 'doctor', 'médico', 'agendar', 'hora'],
    mental_health: ['estrés', 'ansiedad', 'depresión', 'tristeza', 'no duermo', 'preocupado']
  };

  const detectedCategories = [];
  for (const [category, terms] of Object.entries(healthTerms)) {
    if (terms.some(term => text.includes(term))) {
      detectedCategories.push(category);
    }
  }

  // Cultural context detection
  const culturalMarkers = {
    formal: text.includes('usted') || text.includes('señor') || text.includes('doctor'),
    informal: text.includes('tú') || text.includes('oye') || text.includes('hey'),
    respectful: text.includes('por favor') || text.includes('disculpe') || text.includes('gracias'),
    urgent: text.includes('!!') || text.includes('???') || text.includes('YA') || text.includes('AYUDA')
  };

  return {
    categories: detectedCategories,
    cultural: culturalMarkers,
    urgency: detectedCategories.includes('emergency') ? 'high' : 
             culturalMarkers.urgent ? 'medium' : 'low',
    language: 'es-MX',
    intent: determineIntent(detectedCategories, text)
  };
}

// Determine user intent from context
function determineIntent(categories: string[], text: string): string {
  if (categories.includes('emergency')) return 'emergency';
  if (categories.includes('symptoms')) return 'consultation';
  if (categories.includes('appointment')) return 'appointment';
  if (categories.includes('medication')) return 'medication';
  if (categories.includes('family')) return 'family_health';
  if (text.includes('hola') || text.includes('ayuda') || text.includes('información')) return 'greeting';
  return 'general';
}

// Route message to appropriate handler
async function routeMessageToHandler(messageData: any, healthContext: any): Promise<void> {
  const { intent, urgency } = healthContext;
  
  // Handle emergency cases immediately
  if (intent === 'emergency' || urgency === 'high') {
    await handleEmergency(messageData);
    return;
  }

  // Route to specific handlers
  switch (intent) {
    case 'consultation':
      await forwardToAIDoctor(messageData, healthContext);
      break;
    case 'appointment':
      await handleAppointmentRequest(messageData);
      break;
    case 'medication':
      await handleMedicationQuery(messageData);
      break;
    case 'family_health':
      await handleFamilyHealthQuery(messageData);
      break;
    case 'greeting':
      await sendWelcomeMessage(messageData);
      break;
    default:
      await forwardToAIDoctor(messageData, healthContext);
  }
}

// Handle emergency situations
async function handleEmergency(messageData: any): Promise<void> {
  const emergencyMessage = `🚨 **EMERGENCIA DETECTADA** 🚨

Si es una emergencia médica real:
📞 **Llama INMEDIATAMENTE al 911**
🏥 **Ve al hospital más cercano**

Hospitales de emergencia cerca:
🚑 Cruz Roja: 065
🏥 IMSS: Localiza tu clínica más cercana
🚨 Emergencias: 911

Mientras tanto, Dr. Simeon está analizando tu mensaje para ayudarte, pero en emergencias reales **la atención médica presencial es prioritaria**.

¿Puedes describir exactamente qué está pasando?`;

  await sendWhatsAppMessage(messageData.from, emergencyMessage);
  
  // Alert human medical team for immediate review
  await alertMedicalTeam({
    phone: messageData.from,
    message: messageData.text,
    urgency: 'EMERGENCY',
    timestamp: new Date()
  });
}

// Forward to AI Doctor for consultation
async function forwardToAIDoctor(messageData: any, healthContext: any): Promise<void> {
  try {
    // Call DoctorMX AI consultation endpoint
    const response = await fetch(`${process.env.DOCTORMX_API_URL}/.netlify/functions/ai-consultation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DOCTORMX_API_KEY}` // If needed
      },
      body: JSON.stringify({
        message: messageData.text,
        user_phone: messageData.from,
        platform: 'whatsapp',
        context: healthContext,
        user_name: messageData.contactName
      })
    });

    if (!response.ok) {
      throw new Error(`AI consultation failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    // Send AI response back to user
    await sendWhatsAppMessage(messageData.from, aiResponse.message);
    
  } catch (error) {
    console.error('❌ Error forwarding to AI Doctor:', error);
    await sendWhatsAppMessage(
      messageData.from, 
      `Lo siento, tuve un problema técnico. Por favor intenta de nuevo en unos minutos, o si es urgente, contacta directamente al 911 para emergencias médicas.`
    );
  }
}

// Send WhatsApp message
async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  const whatsappApiUrl = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  
  try {
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WhatsApp API error: ${response.status} - ${error}`);
    }

    console.log('✅ WhatsApp message sent successfully to:', to);
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
    throw error;
  }
}

// Send welcome message for new users
async function sendWelcomeMessage(messageData: any): Promise<void> {
  const welcomeMessage = `¡Hola! 👋 Soy **Dr. Simeon**, tu médico mexicano inteligente.

Estoy aquí para ayudarte con:
🩺 **Análisis de síntomas**
💊 **Recomendaciones médicas**
🏥 **Conexión con doctores locales**
📸 **Análisis de imágenes médicas**
👨‍👩‍👧‍👦 **Salud familiar**

**Para empezar:**
• Describe tus síntomas o molestias
• Envía fotos si es necesario 📸
• Pregunta sobre medicamentos 💊
• Solicita citas médicas 📅

*Entiendo el español mexicano y tu cultura. Estoy disponible 24/7.*

¿En qué puedo ayudarte hoy?`;

  await sendWhatsAppMessage(messageData.from, welcomeMessage);
  
  // Trigger user registration in marketing automation
  await triggerUserRegistration({
    phone: messageData.from,
    name: messageData.contactName,
    source: 'whatsapp',
    timestamp: new Date()
  });
}

// Handle appointment requests
async function handleAppointmentRequest(messageData: any): Promise<void> {
  const appointmentMessage = `📅 Te ayudo a encontrar y agendar una cita médica.

**¿Qué tipo de consulta necesitas?**
• 🩺 Medicina general
• 👨‍⚕️ Especialista (especifica cuál)
• 🚑 Urgencias
• 🧠 Salud mental
• 👶 Pediatría

**También necesito saber:**
• 📍 Tu ubicación (ciudad o delegación)
• 🏥 ¿Tienes seguro? (IMSS, ISSSTE, privado)
• ⏰ ¿Cuándo prefieres? (mañana, tarde, noche)

Responde y busco las mejores opciones cerca de ti 🔍`;

  await sendWhatsAppMessage(messageData.from, appointmentMessage);
}

// Handle medication queries
async function handleMedicationQuery(messageData: any): Promise<void> {
  const medicationMessage = `💊 Te ayudo con información sobre medicamentos.

**¿Qué necesitas saber?**
• 🔍 Información sobre un medicamento específico
• 🏪 Dónde encontrar medicamentos cerca de ti
• 💰 Precios y alternativas genéricas
• ⏰ Recordatorios para tomar medicinas
• ⚠️ Efectos secundarios

**Para ayudarte mejor:**
• Escribe el nombre del medicamento
• O describe para qué lo necesitas
• O envía foto de la receta 📸

*Recuerda: Esta información es educativa. Siempre consulta con tu médico antes de cambiar tratamientos.*

¿Qué medicamento te interesa?`;

  await sendWhatsAppMessage(messageData.from, medicationMessage);
}

// Handle family health queries
async function handleFamilyHealthQuery(messageData: any): Promise<void> {
  const familyMessage = `👨‍👩‍👧‍👦 Entiendo tu preocupación por tu familia.

**Para ayudarte mejor, cuéntame:**
• 👶 ¿Es para un niño? (edad)
• 👵 ¿Es para un adulto mayor?
• 🤰 ¿Es para una embarazada?
• 👨‍👩‍👧‍👦 ¿Para toda la familia?

**Puedo ayudar con:**
• Síntomas en niños y bebés
• Cuidado de adultos mayores
• Salud durante el embarazo
• Planes de salud familiar
• Emergencias familiares

**Para dar mejores recomendaciones:**
• Describe los síntomas específicos
• Menciona la edad de la persona
• Si hay medicamentos actuales
• Si es urgente o puede esperar

*La salud de tu familia es importante. Estoy aquí para orientarte.*

¿Qué está pasando con tu familiar?`;

  await sendWhatsAppMessage(messageData.from, familyMessage);
}

// Process message status updates
async function processMessageStatus(status: any): Promise<void> {
  console.log('📊 Message status update:', {
    id: status.id,
    status: status.status,
    recipient: status.recipient_id
  });

  // Log status for analytics
  await logMessageStatus(status);
  
  // Handle failed messages
  if (status.status === 'failed') {
    await handleFailedMessage(status);
  }
}

// Log message for analytics
async function logMessageForAnalytics(messageData: any, healthContext: any): Promise<void> {
  try {
    // Send to marketing automation system
    await fetch(`${process.env.N8N_WEBHOOK_URL}/whatsapp-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'whatsapp_message_received',
        user_phone: messageData.from,
        message_type: messageData.type,
        intent: healthContext.intent,
        urgency: healthContext.urgency,
        categories: healthContext.categories,
        timestamp: messageData.timestamp
      })
    });
  } catch (error) {
    console.error('❌ Failed to log message analytics:', error);
  }
}

// Trigger user registration in marketing automation
async function triggerUserRegistration(userData: any): Promise<void> {
  try {
    await fetch(`${process.env.N8N_WEBHOOK_URL}/user-registered`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_phone: userData.phone,
        user_name: userData.name,
        registration_source: userData.source,
        timestamp: userData.timestamp,
        platform: 'whatsapp'
      })
    });
  } catch (error) {
    console.error('❌ Failed to trigger user registration:', error);
  }
}

// Alert medical team for emergencies
async function alertMedicalTeam(alertData: any): Promise<void> {
  try {
    // Send alert to Slack or email
    await fetch(process.env.SLACK_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 EMERGENCY ALERT: WhatsApp user ${alertData.phone} reported: "${alertData.message}"`,
        urgency: 'high',
        timestamp: alertData.timestamp
      })
    });
  } catch (error) {
    console.error('❌ Failed to alert medical team:', error);
  }
}

// Handle failed message delivery
async function handleFailedMessage(status: any): Promise<void> {
  console.error('❌ Failed to deliver message:', status);
  
  // Implement retry logic or alternative notification method
  // This could include email fallback or SMS backup
}

// Log message status for analytics
async function logMessageStatus(status: any): Promise<void> {
  try {
    await fetch(`${process.env.N8N_WEBHOOK_URL}/whatsapp-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'whatsapp_message_status',
        message_id: status.id,
        status: status.status,
        recipient_id: status.recipient_id,
        timestamp: new Date(parseInt(status.timestamp) * 1000)
      })
    });
  } catch (error) {
    console.error('❌ Failed to log message status:', error);
  }
}

export { handler }; 