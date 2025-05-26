# WhatsApp Business API Implementation for DoctorMX
## Critical for Mexican Market Success

### Market Context & Opportunity
- **90% of Mexicans use WhatsApp daily** for personal and business communication
- **67% prefer WhatsApp over traditional SMS** for business interactions
- **Healthcare communication via WhatsApp is culturally accepted** and expected
- **Voice messages are preferred** for expressing health concerns in Spanish

## 1. WhatsApp Business API Setup

### Account Configuration
```bash
# WhatsApp Business Platform Setup
# 1. Create Facebook Business Manager account
# 2. Set up WhatsApp Business Account
# 3. Verify business phone number in Mexico

# Required Environment Variables
WHATSAPP_ACCESS_TOKEN="your_permanent_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id" 
WHATSAPP_BUSINESS_ACCOUNT_ID="your_business_account_id"
WHATSAPP_VERIFY_TOKEN="your_custom_verify_token"
WHATSAPP_APP_SECRET="your_app_secret"

# Mexican Business Verification
BUSINESS_NAME="DoctorMX - Tu Médico Inteligente"
BUSINESS_CATEGORY="Medical Services"
BUSINESS_DESCRIPTION="Consultas médicas con inteligencia artificial 24/7"
BUSINESS_WEBSITE="https://doctormx.com"
```

### Webhook Configuration
```typescript
// netlify/functions/whatsapp-webhook.ts
export const handler = async (event: any, context: any) => {
  const { httpMethod, body, queryStringParameters } = event;
  
  // Webhook verification (required by WhatsApp)
  if (httpMethod === 'GET') {
    const mode = queryStringParameters['hub.mode'];
    const token = queryStringParameters['hub.verify_token'];
    const challenge = queryStringParameters['hub.challenge'];
    
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      return {
        statusCode: 200,
        body: challenge
      };
    } else {
      return { statusCode: 403, body: 'Forbidden' };
    }
  }
  
  // Handle incoming messages
  if (httpMethod === 'POST') {
    const data = JSON.parse(body);
    
    // Verify webhook signature
    const signature = event.headers['x-hub-signature-256'];
    if (!verifySignature(body, signature)) {
      return { statusCode: 403, body: 'Invalid signature' };
    }
    
    await processWhatsAppMessage(data);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }
  
  return { statusCode: 405, body: 'Method not allowed' };
};

// Signature verification for security
const verifySignature = (payload: string, signature: string): boolean => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
};
```

## 2. Message Processing & AI Integration

### Intelligent Message Router
```typescript
// Enhanced message processing with Mexican healthcare context
const processWhatsAppMessage = async (webhookData: any) => {
  const entry = webhookData.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  
  if (!value?.messages) return;
  
  const message = value.messages[0];
  const contact = value.contacts[0];
  
  const messageData = {
    messageId: message.id,
    from: message.from,
    timestamp: new Date(parseInt(message.timestamp) * 1000),
    type: message.type,
    text: message.text?.body || '',
    audio: message.audio,
    image: message.image,
    document: message.document,
    contactName: contact?.profile?.name,
    waId: contact?.wa_id
  };
  
  // Mexican health context analysis
  const healthContext = await analyzeMexicanHealthContext(messageData);
  
  // Route to appropriate handler
  await routeMessage(messageData, healthContext);
};

const analyzeMexicanHealthContext = async (message: any) => {
  const text = message.text.toLowerCase();
  
  // Mexican health terminology detection
  const healthTerms = {
    emergency: ['emergencia', 'urgente', 'grave', 'auxilio', 'dolor fuerte'],
    symptoms: ['dolor', 'síntoma', 'molestia', 'malestar', 'fiebre', 'tos'],
    imss: ['imss', 'issste', 'seguro social', 'clínica', 'hospital'],
    family: ['mi hijo', 'mi esposa', 'mi mamá', 'familiar', 'bebé'],
    medication: ['medicina', 'medicamento', 'pastilla', 'jarabe', 'receta'],
    appointment: ['cita', 'consulta', 'doctor', 'médico', 'agendar']
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
    respectful: text.includes('por favor') || text.includes('disculpe'),
    urgent: text.includes('!!') || text.includes('???') || text.includes('YA')
  };
  
  return {
    categories: detectedCategories,
    cultural: culturalMarkers,
    urgency: detectedCategories.includes('emergency') ? 'high' : 
             culturalMarkers.urgent ? 'medium' : 'low',
    language: 'es-MX',
    hasAudio: !!message.audio
  };
};
```

### Response Templates for Mexican Healthcare
```typescript
const mexicanHealthResponseTemplates = {
  welcome: {
    new_user: `¡Hola! 👋 Soy Dr. Simeon, tu médico mexicano inteligente.

Estoy aquí para ayudarte con:
• 🩺 Análisis de síntomas 
• 💊 Recomendaciones médicas
• 🏥 Conexión con doctores locales
• 🔍 Análisis de imágenes médicas

¿En qué puedo ayudarte hoy?`,

    returning_user: `¡Hola de nuevo! 😊 Me da mucho gusto verte.

¿Cómo te has sentido desde nuestra última consulta? ¿En qué puedo ayudarte hoy?`
  },

  emergency: {
    immediate: `🚨 EMERGENCIA DETECTADA 🚨

Si es una emergencia médica real:
📞 Llama INMEDIATAMENTE al 911
🏥 Ve al hospital más cercano

Mientras tanto, analizo tus síntomas para ayudarte mejor. Describe exactamente qué está pasando.`,

    severity_assessment: `Entiendo tu preocupación. Vamos a evaluar la situación paso a paso.

En una escala del 1 al 10:
• ¿Qué tan intenso es el dolor?
• ¿Cuándo comenzó?
• ¿Has tomado algún medicamento?

Tu seguridad es mi prioridad. 🩺`
  },

  consultation: {
    symptom_gathering: `Perfecto, vamos a analizar tus síntomas.

Para darte la mejor recomendación necesito saber:
1️⃣ ¿Cuándo comenzaron los síntomas?
2️⃣ ¿En qué parte del cuerpo sientes molestias?
3️⃣ ¿Has tenido esto antes?

Puedes enviarme:
• 📝 Mensajes de texto
• 🎙️ Notas de voz (más fácil)
• 📸 Fotos si es necesario`,

    image_analysis: `📸 Perfecto, voy a analizar esta imagen médica.

🔍 Analizando... esto puede tomar unos segundos.

Mientras tanto, ¿puedes contarme:
• ¿Cuándo notaste estos cambios?
• ¿Hay dolor o molestias?
• ¿Has usado algún tratamiento?`
  },

  medication: {
    availability: `💊 Te ayudo a encontrar este medicamento.

Farmacias cercanas que pueden tenerlo:
🏪 Farmacia del Ahorro - 2.1 km
🏪 Similares - 1.8 km  
🏪 Guadalajara - 3.2 km

💡 **Tip**: Llama antes de ir para confirmar disponibilidad.

¿Necesitas direcciones o información de precios?`,

    generic_alternatives: `💊 Te sugiero estas alternativas más económicas:

**Medicamento original**: {original_med}
**Genérico equivalente**: {generic_med}
💰 **Ahorro**: ~60% menos

⚠️ **Importante**: Siempre consulta con tu médico antes de cambiar medicamentos.

¿Te ayudo a encontrar dónde comprarlo?`
  },

  appointment: {
    provider_search: `🏥 Te ayudo a encontrar doctores cerca de ti.

Basado en tus síntomas, te recomiendo:
👨‍⚕️ **{specialty}** - Especialidad más adecuada

Doctores disponibles en tu área:
📍 Dr. {name} - {distance}
⭐ {rating} estrellas | ${price} MXN
📅 Disponible: {availability}

¿Quieres que agende una cita?`,

    booking_assistance: `📅 ¡Perfecto! Voy a ayudarte a agendar.

**Doctor seleccionado**: Dr. {name}
**Especialidad**: {specialty}
**Costo**: ${price} MXN

¿Qué día y hora te conviene más?
🌅 Mañana (9:00-12:00)
🌞 Tarde (14:00-17:00)
🌙 Noche (18:00-20:00)`
  },

  family_health: {
    child_symptoms: `👶 Entiendo tu preocupación por tu pequeño/a.

Para niños, es especialmente importante ser preciso:
• 👶 ¿Qué edad tiene?
• 🌡️ ¿Tiene fiebre? ¿Cuánto?
• 😴 ¿Está comiendo y durmiendo normal?
• 🍼 ¿Hay cambios en su comportamiento?

Los niños no pueden expresar bien sus molestias, así que observa estos signos...`,

    elderly_care: `👴👵 Te ayudo con el cuidado de tu familiar mayor.

Para adultos mayores consideramos:
• 💊 Medicamentos actuales
• 🩺 Condiciones crónicas (diabetes, presión)
• 🦴 Movilidad y caídas
• 🧠 Estado mental

¿Puedes contarme más sobre la situación específica?`
  }
};
```

## 3. Automated Conversation Flows

### Onboarding Flow for New Users
```typescript
class WhatsAppOnboardingFlow {
  private flowStates = {
    welcome: 'WELCOME',
    profile_setup: 'PROFILE_SETUP', 
    health_preferences: 'HEALTH_PREFS',
    location_setup: 'LOCATION',
    insurance_info: 'INSURANCE',
    completed: 'COMPLETED'
  };

  async startOnboarding(phoneNumber: string, userData: any) {
    const user = await this.createOrUpdateUser(phoneNumber, userData);
    
    // Send welcome message with Mexican cultural context
    await this.sendMessage(phoneNumber, {
      type: 'template',
      template: {
        name: 'doctormx_welcome_onboarding',
        language: { code: 'es_MX' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: userData.name || 'amigo/a' }
          ]
        }]
      }
    });

    // Set user state
    await this.updateUserState(user.id, this.flowStates.welcome);
    
    // Schedule follow-up questions
    setTimeout(() => this.askProfileInfo(phoneNumber), 30000); // 30 seconds
  }

  async askProfileInfo(phoneNumber: string) {
    const message = `Ahora vamos a personalizar tu experiencia 😊

Para darte mejores recomendaciones médicas:

1️⃣ ¿Cuál es tu nombre completo?
2️⃣ ¿Qué edad tienes?
3️⃣ ¿Tienes alguna condición médica conocida? (diabetes, presión alta, etc.)

Puedes responder una por una o todo junto 📝`;

    await this.sendMessage(phoneNumber, {
      type: 'text',
      text: message
    });

    await this.updateUserState(phoneNumber, this.flowStates.profile_setup);
  }

  async processProfileResponse(phoneNumber: string, message: string) {
    // AI-powered information extraction
    const extractedInfo = await this.extractProfileInfo(message);
    
    if (extractedInfo.isComplete) {
      await this.saveProfileInfo(phoneNumber, extractedInfo);
      await this.askLocationPermission(phoneNumber);
    } else {
      await this.askMissingInfo(phoneNumber, extractedInfo.missing);
    }
  }

  async askLocationPermission(phoneNumber: string) {
    const message = `📍 ¿Me permites acceder a tu ubicación?

Esto me ayuda a:
• 🏥 Encontrar doctores y hospitales cerca
• 🏪 Localizar farmacias cercanas  
• 🚨 Darte mejores recomendaciones de emergencia
• 🌡️ Considerar factores ambientales locales

*Tu privacidad está protegida - solo uso la información para mejorar tu atención médica.*`;

    await this.sendMessage(phoneNumber, {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: message },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'location_yes',
                title: '📍 Sí, compartir'
              }
            },
            {
              type: 'reply', 
              reply: {
                id: 'location_no',
                title: '❌ No por ahora'
              }
            }
          ]
        }
      }
    });
  }

  async processLocationResponse(phoneNumber: string, response: string) {
    if (response === 'location_yes') {
      await this.requestLocationAccess(phoneNumber);
    } else {
      await this.askManualLocation(phoneNumber);
    }
  }

  async askInsuranceInfo(phoneNumber: string) {
    const message = `🏥 Una última pregunta sobre tu seguro médico:

¿Tienes alguno de estos seguros?

• 🏛️ IMSS (Instituto Mexicano del Seguro Social)
• 🏥 ISSSTE (Instituto de Seguridad Social para Trabajadores del Estado)  
• 🏢 Seguro privado (Seguros Monterrey, GNP, etc.)
• 💳 Seguro Popular / INSABI
• ❌ No tengo seguro

Esto me ayuda a recomendarte doctores que acepten tu seguro 💡`;

    await this.sendMessage(phoneNumber, {
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: message },
        action: {
          button: 'Seleccionar seguro',
          sections: [{
            title: 'Tipos de seguro',
            rows: [
              { id: 'imss', title: 'IMSS', description: 'Instituto Mexicano del Seguro Social' },
              { id: 'issste', title: 'ISSSTE', description: 'Instituto de Seguridad Social para Trabajadores del Estado' },
              { id: 'private', title: 'Seguro Privado', description: 'Seguros Monterrey, GNP, etc.' },
              { id: 'popular', title: 'Seguro Popular/INSABI', description: 'Seguro gubernamental' },
              { id: 'none', title: 'Sin seguro', description: 'No tengo seguro médico' }
            ]
          }]
        }
      }
    });
  }

  async completeOnboarding(phoneNumber: string) {
    const completionMessage = `🎉 ¡Listo! Tu perfil está completo.

**Dr. Simeon está configurado y listo para ayudarte:**

✅ Perfil médico personalizado
✅ Ubicación para recomendaciones locales  
✅ Información de seguro médico
✅ Preferencias de comunicación

**¿Cómo empezar?**
• Escríbeme cualquier síntoma o molestia
• Envía fotos de síntomas visibles 📸
• Pregunta sobre medicamentos 💊
• Pide citas con doctores 📅

*Estoy disponible 24/7 para cuidar de tu salud y la de tu familia* 👨‍⚕️👩‍⚕️

¿En qué puedo ayudarte hoy?`;

    await this.sendMessage(phoneNumber, {
      type: 'text',
      text: completionMessage
    });

    await this.updateUserState(phoneNumber, this.flowStates.completed);
    
    // Trigger marketing automation
    await this.triggerOnboardingComplete(phoneNumber);
  }
}
```

## 4. Advanced Features for Mexican Healthcare

### Voice Message Processing
```typescript
// Voice message transcription and analysis
const processVoiceMessage = async (audioMessage: any, userPhone: string) => {
  try {
    // Download audio from WhatsApp
    const audioUrl = await downloadWhatsAppMedia(audioMessage.id);
    
    // Transcribe using OpenAI Whisper (optimized for Mexican Spanish)
    const transcription = await transcribeAudio(audioUrl, {
      language: 'es',
      model: 'whisper-1',
      prompt: 'Transcripción médica en español mexicano. Incluye síntomas, dolores, medicamentos y consultas médicas.'
    });
    
    // Analyze medical content
    const medicalAnalysis = await analyzeMedicalContent(transcription.text, {
      context: 'mexican_healthcare',
      urgency_detection: true,
      symptom_extraction: true
    });
    
    // Send confirmation and analysis
    await sendMessage(userPhone, {
      type: 'text',
      text: `🎙️ **Entendí tu mensaje de voz:**

"${transcription.text}"

${medicalAnalysis.urgency === 'high' ? '🚨 **URGENTE** - ' : ''}Analizando tus síntomas...`
    });
    
    // Process as regular medical consultation
    await processHealthConsultation(transcription.text, userPhone, {
      source: 'voice_message',
      confidence: transcription.confidence,
      detected_emotions: medicalAnalysis.emotions
    });
    
  } catch (error) {
    await sendMessage(userPhone, {
      type: 'text', 
      text: `Lo siento, tuve problemas procesando tu mensaje de voz. 

¿Puedes intentar:
• 📱 Escribir tu consulta
• 🎙️ Enviar otra nota de voz más clara
• ☎️ Llamarme si es urgente

Estoy aquí para ayudarte 😊`
    });
  }
};

const transcribeAudio = async (audioUrl: string, options: any) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await fetch(audioUrl);
  const audioBuffer = await response.arrayBuffer();
  
  const transcription = await openai.audio.transcriptions.create({
    file: new File([audioBuffer], 'audio.ogg', { type: 'audio/ogg' }),
    model: 'whisper-1',
    language: options.language,
    prompt: options.prompt,
    response_format: 'verbose_json'
  });
  
  return transcription;
};
```

### Image Analysis Integration
```typescript
const processHealthImage = async (imageMessage: any, userPhone: string) => {
  // Send immediate acknowledgment
  await sendMessage(userPhone, {
    type: 'text',
    text: `📸 Recibí tu imagen. Analizando con IA médica especializada...

🔍 Esto puede tomar 30-60 segundos.
⚕️ Mantén la calma mientras analizo.`
  });

  try {
    // Download image
    const imageUrl = await downloadWhatsAppMedia(imageMessage.id);
    
    // Medical image analysis using OpenAI Vision
    const analysis = await analyzeHealthImage(imageUrl, {
      context: 'mexican_healthcare',
      language: 'es-MX',
      safety_first: true
    });
    
    // Format response based on analysis
    let responseMessage = `🔍 **Análisis de imagen completado:**\n\n`;
    
    if (analysis.emergency_indicators.length > 0) {
      responseMessage += `🚨 **ATENCIÓN - Indicadores de emergencia detectados:**\n`;
      responseMessage += analysis.emergency_indicators.join('\n');
      responseMessage += `\n\n⚠️ **RECOMENDACIÓN: Busca atención médica inmediata**\n\n`;
    }
    
    responseMessage += `**Lo que veo:**\n${analysis.findings}\n\n`;
    responseMessage += `**Nivel de confianza:** ${analysis.confidence}%\n\n`;
    
    if (analysis.recommendations.length > 0) {
      responseMessage += `**Recomendaciones:**\n`;
      responseMessage += analysis.recommendations.map(r => `• ${r}`).join('\n');
    }
    
    responseMessage += `\n\n⚠️ **Importante:** Esta es una evaluación preliminar. Para diagnóstico definitivo, consulta con un médico especialista.`;
    
    await sendMessage(userPhone, {
      type: 'text',
      text: responseMessage
    });
    
    // Offer next steps
    await offerNextSteps(userPhone, analysis);
    
  } catch (error) {
    await sendMessage(userPhone, {
      type: 'text',
      text: `Lo siento, no pude analizar la imagen. 

Esto puede deberse a:
• 📱 Calidad de imagen muy baja
• 🔍 Imagen no médica
• ⚡ Problema técnico temporal

¿Puedes:
• 📸 Intentar con mejor iluminación
• 📝 Describir lo que ves
• 🎙️ Enviar nota de voz explicando

Estoy aquí para ayudarte de otra manera 😊`
    });
  }
};
```

## 5. Automated Health Campaigns

### Preventive Health Reminders
```typescript
class HealthCampaignAutomation {
  async schedulePreventiveCampaigns() {
    const campaigns = [
      {
        name: 'diabetes_awareness',
        target: 'adults_35_plus',
        frequency: 'monthly',
        message_template: 'diabetes_prevention_mx'
      },
      {
        name: 'vaccination_reminders',
        target: 'families_with_children',
        frequency: 'seasonal',
        message_template: 'vaccine_schedule_mx'
      },
      {
        name: 'womens_health',
        target: 'women_18_plus',
        frequency: 'monthly',
        message_template: 'womens_health_mx'
      }
    ];

    for (const campaign of campaigns) {
      await this.scheduleCampaign(campaign);
    }
  }

  async sendHealthTip(phoneNumber: string, category: string) {
    const tips = {
      diabetes: [
        '🍎 **Tip de Salud - Diabetes**\n\nLa diabetes tipo 2 afecta a 1 de cada 10 mexicanos.\n\n**Prevención natural:**\n• Camina 30 min diarios\n• Reduce refrescos y jugos\n• Come más nopales y chía\n• Controla el estrés\n\n¿Quieres saber tu riesgo de diabetes? Envía "diabetes test"',
        
        '💧 **Hidratación en México**\n\nCon nuestro clima, la deshidratación es común.\n\n**Signos de alerta:**\n• Orina amarilla oscura\n• Dolor de cabeza\n• Cansancio excesivo\n• Mareos\n\n**Meta diaria:** 8-10 vasos de agua\n🚫 Evita: Refrescos como hidratación\n\n¿Tienes síntomas de deshidratación?'
      ],
      
      nutrition: [
        '🌮 **Alimentación Mexicana Saludable**\n\nNuestra comida puede ser nutritiva:\n\n✅ **Buenos para ti:**\n• Frijoles (proteína y fibra)\n• Nopales (bajan azúcar)\n• Aguacate (grasas buenas)\n• Chiles (antioxidantes)\n\n❌ **Modera:**\n• Tortillas en exceso\n• Refrescos\n• Comida frita\n\n¿Quieres un plan de alimentación personalizado?'
      ]
    };
    
    const randomTip = tips[category][Math.floor(Math.random() * tips[category].length)];
    
    await sendMessage(phoneNumber, {
      type: 'text',
      text: randomTip
    });
  }
}
```

## 6. Performance Metrics & Analytics

### WhatsApp Analytics Dashboard
```typescript
const trackWhatsAppMetrics = async () => {
  const metrics = {
    message_volume: await getMessageVolume(),
    response_time: await getAverageResponseTime(),
    user_satisfaction: await getUserSatisfactionScore(),
    conversion_rate: await getConsultationConversionRate(),
    retention_rate: await getUserRetentionRate()
  };
  
  // Mexican-specific KPIs
  const mexicanKPIs = {
    voice_message_preference: await getVoiceMessageUsage(),
    family_consultation_rate: await getFamilyConsultationRate(),
    imss_referral_success: await getIMSSReferralSuccess(),
    emergency_response_time: await getEmergencyResponseTime()
  };
  
  await logMetrics({ ...metrics, ...mexicanKPIs });
};

const whatsappKPIs = {
  target_metrics: {
    daily_active_users: 500,
    average_response_time: '< 30 seconds',
    consultation_completion_rate: '> 80%',
    user_satisfaction: '> 4.5/5',
    voice_message_success_rate: '> 90%'
  },
  
  mexican_specific: {
    spanish_accuracy: '> 95%',
    cultural_context_understanding: '> 90%',
    imss_integration_success: '> 85%',
    family_health_coverage: '> 70%'
  }
};
```

## 7. Deployment Checklist

```bash
# WhatsApp Business API Deployment
□ Business verification completed
□ Phone number verified (Mexican number)
□ Webhook endpoints configured
□ Message templates approved by WhatsApp
□ Rate limiting implemented
□ Error handling and retry logic
□ Analytics and monitoring setup
□ COFEPRIS compliance review
□ Security audit completed
□ Load testing for 10,000+ users
□ Backup and disaster recovery
□ Team training on Mexican healthcare context

# Mexican Market Compliance
□ Spanish language accuracy verified
□ Cultural sensitivity review
□ Healthcare regulations compliance (COFEPRIS)
□ Privacy policy in Spanish
□ Terms of service localized
□ Emergency protocols established
□ Local medical provider partnerships
□ Insurance integration (IMSS/ISSSTE)
```

This WhatsApp implementation positions DoctorMX as the most accessible healthcare platform in Mexico, leveraging the country's communication preferences while maintaining medical accuracy and regulatory compliance. 