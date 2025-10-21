#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

if (!VAPI_API_KEY) {
  console.error('❌ Error: VAPI_API_KEY environment variable is required');
  console.log('Please set your VAPI API key:');
  console.log('export VAPI_API_KEY="your_api_key_here"');
  process.exit(1);
}

const assistantConfig = {
  name: "Asistente Doctor.mx",
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Eres un asistente de voz profesional, cálido y persuasivo de Doctor.mx. Tu misión es contactar a doctores en México para invitarlos al programa fundador de Doctor.mx. Habla siempre en español neutro y con tono amable, claro y entusiasta.  
Durante la llamada, sigue este guion estructurado con pausas naturales:

---
👋 INTRODUCCIÓN:
"Hola, ¿qué tal? ¿Hablo con el doctor o la doctora? Perfecto.  
Le saluda el asistente virtual de **Doctor.mx**.  
Estamos abriendo su ciudad con una plataforma que automatiza la agenda médica con inteligencia artificial."

(📍pausa breve)

---
💡 BENEFICIO PRINCIPAL:
"Doctor.mx incluye un **recepcionista AI disponible las 24 horas**, que responde WhatsApp, agenda citas y confirma pacientes automáticamente.  
Así usted puede enfocarse en su consulta y no perder pacientes por mensajes sin responder."

(📍pausa breve)

---
💰 OFERTA ESPECIAL:
"Estamos ofreciendo un **precio fundador exclusivo** de $499 pesos al mes o $4,999 al año, válido solo durante los primeros 6 meses del lanzamiento en su ciudad.  
Después, el precio se duplicará para nuevas altas, pero los fundadores conservan su tarifa para siempre."

(📍pausa breve)

---
📊 VALOR AGREGADO:
"El sistema incluye perfil premium en Doctor.mx, optimización en Google Maps y recordatorios automáticos para reducir ausencias.  
Además, puede migrar toda su agenda actual en 48 horas."

(📍pausa breve)

---
📞 CIERRE Y LLAMADO A LA ACCIÓN:
"¿Le gustaría recibir una demostración de 2 minutos por WhatsApp para conocer cómo funciona?  
Solo necesito su confirmación y le enviamos el enlace directamente."

Si el doctor responde afirmativamente, confirma:  
"Perfecto, le enviaremos la demo al mismo número de este contacto. Muchas gracias doctor(a) y que tenga excelente día."

Si dice que no, responde amablemente:  
"De acuerdo doctor(a), muchas gracias por su tiempo. Si cambia de opinión, puede visitar doctor.mx/fundadores para más información. Que tenga excelente día."

---
Mantén tono profesional, sin prisas, y cierra siempre de forma amable.`
      }
    ]
  },
  voice: {
    provider: "rime-ai",
    voiceId: "elliot-rime-ai"
  },
  transcriber: {
    provider: "openai",
    model: "gpt-4o-mini-transcribe"
  },
  language: "es-419"
};

async function createAssistant() {
  try {
    console.log('🚀 Creating VAPI Assistant...');
    
    const response = await axios.post(`${VAPI_BASE_URL}/assistant`, assistantConfig, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const assistant = response.data;
    console.log('✅ Assistant created successfully!');
    console.log(`📋 Assistant ID: ${assistant.id}`);
    console.log(`📋 Assistant Name: ${assistant.name}`);
    
    return assistant.id;
  } catch (error) {
    console.error('❌ Error creating assistant:', error.response?.data || error.message);
    throw error;
  }
}

async function makeCall(toNumber, fromNumber, assistantId, doctorName = '') {
  try {
    console.log(`📞 Calling ${doctorName} at ${toNumber}...`);
    
    const callConfig = {
      assistantId: assistantId,
      customer: {
        number: toNumber
      },
      metadata: {
        name: doctorName,
        greeting: `Hola ${doctorName}, le habla el asistente de Doctor.mx`
      }
    };

    const response = await axios.post(`${VAPI_BASE_URL}/call`, callConfig, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const call = response.data;
    console.log(`✅ Call initiated successfully!`);
    console.log(`📋 Call ID: ${call.id}`);
    console.log(`📋 Status: ${call.status}`);
    
    return call.id;
  } catch (error) {
    console.error(`❌ Error making call to ${toNumber}:`, error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    // Create the assistant
    const assistantId = await createAssistant();
    
    // Set up calling parameters
    const FROM_NUMBER = process.env.FROM_NUMBER || "+525555555555";
    const doctors = {
      "+526144067062": "José",
      "+526141189516": "Óscar", 
      "+526141115056": "Isaac"
    };

    console.log('\n📞 Starting calls to doctors...');
    console.log(`📱 From Number: ${FROM_NUMBER}`);
    console.log(`🤖 Assistant ID: ${assistantId}\n`);

    // Make calls to each doctor
    for (const [number, name] of Object.entries(doctors)) {
      try {
        await makeCall(number, FROM_NUMBER, assistantId, name);
        console.log(`⏳ Waiting 20 seconds before next call...\n`);
        await new Promise(resolve => setTimeout(resolve, 20000));
      } catch (error) {
        console.error(`Failed to call ${name} (${number}):`, error.message);
        console.log('Continuing with next call...\n');
      }
    }

    console.log('🎉 All calls completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Assistant created: ${assistantId}`);
    console.log(`📞 Calls attempted to: ${Object.keys(doctors).length} doctors`);
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createAssistant, makeCall };
