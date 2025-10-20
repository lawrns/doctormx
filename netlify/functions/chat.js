import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxlbametpfubwnrmrbsv.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { message, userId, history = [], images = [] } = JSON.parse(event.body)

    if (!message || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    console.log('📝 Chat request received:', {
      hasMessage: !!message,
      hasUserId: !!userId,
      hasImages: images.length > 0,
      imageCount: images.length,
      timestamp: new Date().toISOString()
    })

    // Check free question eligibility
    const { data: freeQuestionsData, error: freeQuestionsError } = await supabase
      .from('user_free_questions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (freeQuestionsError && freeQuestionsError.code !== 'PGRST116') {
      console.error('❌ Error checking free questions:', freeQuestionsError)
    }

    const remainingFreeQuestions = freeQuestionsData?.questions_remaining || 5
    const canUseFreeQuestion = remainingFreeQuestions > 0

    if (!canUseFreeQuestion) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          reply: 'Has agotado tus preguntas gratuitas de este mes. Suscríbete para continuar consultando.',
          freeQuestionUsed: false,
          remainingFreeQuestions: 0,
          requiresSubscription: true
        })
      }
    }

    // Enhanced emergency detection
    const emergencyKeywords = {
      critical: ['paro cardiaco', 'infarto', 'derrame cerebral', 'convulsión', 'desmayo', 'inconsciente'],
      urgent: ['dolor de pecho', 'dificultad para respirar', 'hemorragia', 'sangre', 'fractura', 'trauma'],
      concerning: ['fiebre alta', 'vómito', 'diarrea', 'dolor abdominal', 'mareo', 'debilidad']
    };

    const messageLower = message.toLowerCase();
    const triggeredFlags = {
      critical: emergencyKeywords.critical.filter(keyword => messageLower.includes(keyword)),
      urgent: emergencyKeywords.urgent.filter(keyword => messageLower.includes(keyword)),
      concerning: emergencyKeywords.concerning.filter(keyword => messageLower.includes(keyword))
    };

    const hasCritical = triggeredFlags.critical.length > 0;
    const hasUrgent = triggeredFlags.urgent.length > 0;
    const hasConcerning = triggeredFlags.concerning.length > 0;

    console.log('🚨 Emergency detection result:', { 
      critical: hasCritical,
      urgent: hasUrgent,
      concerning: hasConcerning,
      triggeredFlags 
    });

    if (hasCritical || hasUrgent) {
      const emergencyLevel = hasCritical ? 'critical' : 'urgent';
      const emergencyMessage = hasCritical 
        ? '🚨 EMERGENCIA MÉDICA CRÍTICA DETECTADA 🚨\n\nLos síntomas que describes requieren atención médica INMEDIATA. Por favor:\n\n1. Llama al 911 AHORA\n2. Acude al hospital más cercano\n3. No esperes más tiempo\n\nEsta plataforma NO puede manejar emergencias médicas.'
        : '⚠️ SÍNTOMAS DE URGENCIA MÉDICA DETECTADOS ⚠️\n\nLos síntomas que describes requieren evaluación médica urgente. Te recomiendo:\n\n1. Acudir a urgencias hospitalarias\n2. Llamar al 911 si empeora\n3. No conducir si te sientes mal\n\nEsta plataforma no sustituye la atención médica de emergencia.';

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          reply: emergencyMessage,
          redFlagsTriggered: true,
          emergencyLevel: emergencyLevel,
          triggeredFlags: triggeredFlags,
          responseOptions: [
            {
              id: 'call_911',
              text: '🚨 Llamar 911',
              action: 'emergency_call',
              style: 'danger'
            },
            {
              id: 'find_hospital',
              text: '🏥 Buscar Hospital',
              action: 'find_hospital',
              style: 'danger'
            }
          ],
          freeQuestionUsed: false
        })
      }
    }

    // Generate AI reply
    console.log('🤖 Generating AI reply...')

    // Determine conversation stage based on history length
    const conversationStage = history.length === 0 ? 'initial' : 
                            history.length <= 2 ? 'exploration' : 
                            history.length <= 4 ? 'analysis' : 'conclusion';

    const systemPrompt = `Eres Dr. Simeon, un doctor virtual mexicano especializado en medicina general. Tu objetivo es proporcionar orientación médica inicial de manera empática, profesional y responsable.

CONTEXTO DE CONVERSACIÓN:
- Etapa actual: ${conversationStage}
- Historial de mensajes: ${history.length}
- Usuario: ${userId}

INSTRUCCIONES POR ETAPA:

ETAPA INICIAL (primera interacción):
- Saluda cálidamente como Dr. Simeon
- Pide una descripción general de los síntomas
- Mantén la respuesta breve (máximo 150 palabras)
- Haz 1-2 preguntas específicas para comenzar

ETAPA EXPLORACIÓN (2-3 mensajes):
- Profundiza en síntomas específicos
- Pregunta sobre duración, intensidad, factores desencadenantes
- Mantén respuesta moderada (máximo 200 palabras)
- Haz 2-3 preguntas de seguimiento

ETAPA ANÁLISIS (4-5 mensajes):
- Proporciona orientación médica basada en la información recopilada
- Explica posibles causas (sin diagnóstico definitivo)
- Sugiere medidas de autocuidado
- Respuesta más detallada (máximo 300 palabras)

ETAPA CONCLUSIÓN (6+ mensajes):
- Resume la situación
- Proporciona recomendaciones específicas
- Indica cuándo buscar atención médica presencial
- Sugiere especialista si es necesario

INSTRUCCIONES GENERALES:
- Responde de manera conversacional y natural, como un doctor real
- Sé empático y comprensivo
- NO proporciones diagnósticos definitivos
- Usa lenguaje médico apropiado pero accesible
- Si el usuario sube imágenes médicas, analízalas y proporciona orientación basada en lo que ves
- Adapta el tono según la urgencia percibida

IMPORTANTE: Esta es una herramienta de orientación médica. No sustituye la consulta médica profesional.`

    // Prepare messages for OpenAI with conversation memory
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history with context tracking
    if (history.length > 0) {
      // Add conversation summary for long conversations
      if (history.length > 6) {
        const recentHistory = history.slice(-4); // Last 4 messages
        const olderHistory = history.slice(0, -4);
        
        // Create summary of older conversation
        const summaryPrompt = `Resume brevemente la conversación médica anterior en 2-3 oraciones:`;
        const olderMessages = olderHistory.map(h => `${h.role}: ${h.content}`).join('\n');
        
        messages.push({
          role: 'system',
          content: `CONTEXTO DE CONVERSACIÓN ANTERIOR:\n${olderMessages}\n\n${summaryPrompt}`
        });
        
        // Add recent history
        messages.push(...recentHistory.map(h => ({ role: h.role, content: h.content })));
      } else {
        // Add full history for shorter conversations
        messages.push(...history.map(h => ({ role: h.role, content: h.content })));
      }
    }

    // Handle image analysis if images are provided
    if (images && images.length > 0) {
      console.log('🖼️ Processing images for analysis...')
      
      const imageContent = images.map(img => ({
        type: 'image_url',
        image_url: {
          url: img.data,
          detail: 'high'
        }
      }))

      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: message || 'Por favor analiza estas imágenes médicas y proporciona orientación.'
          },
          ...imageContent
        ]
      })
    } else {
      messages.push({ role: 'user', content: message })
    }

    // Dynamic token limits based on conversation stage
    const tokenLimits = {
      initial: 200,
      exploration: 300,
      analysis: 400,
      conclusion: 500
    };

    const maxTokens = tokenLimits[conversationStage] || 300;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.7
    })

    let aiReply = completion.choices[0].message.content

    // Apply professional medical formatting
    const formatMedicalResponse = (reply, stage) => {
      let formatted = reply;
      
      // Add professional medical structure
      if (stage === 'analysis' || stage === 'conclusion') {
        // Add section headers for medical information
        formatted = formatted.replace(/(Posibles causas|Causas posibles|Diagnóstico diferencial)/gi, '**$1:**');
        formatted = formatted.replace(/(Recomendaciones|Tratamiento|Medidas de autocuidado)/gi, '**$1:**');
        formatted = formatted.replace(/(Cuándo buscar atención|Cuándo consultar|Seguimiento)/gi, '**$1:**');
        
        // Format medication mentions
        formatted = formatted.replace(/(paracetamol|ibuprofeno|acetaminofén|aspirina)/gi, '**$1**');
        
        // Format time references
        formatted = formatted.replace(/(\d+)\s*(días|horas|semanas|meses)/gi, '**$1 $2**');
        
        // Format severity levels
        formatted = formatted.replace(/(leve|moderado|severo|grave|crítico)/gi, '**$1**');
      }
      
      // Add professional disclaimer for analysis and conclusion stages
      if (stage === 'analysis' || stage === 'conclusion') {
        formatted += '\n\n---\n**⚠️ Importante:** Esta es una orientación médica general. Siempre consulta con un médico profesional para diagnóstico y tratamiento específico.';
      }
      
      return formatted;
    };

    aiReply = formatMedicalResponse(aiReply, conversationStage);

    console.log('✅ AI reply generated:', aiReply.substring(0, 100) + '...')

    // Generate interactive response options based on conversation stage and content
    const generateResponseOptions = (reply, stage, message) => {
      const options = [];
      const replyLower = reply.toLowerCase();
      const messageLower = message.toLowerCase();

      // Emergency options
      if (replyLower.includes('urgencia') || replyLower.includes('emergencia') || replyLower.includes('911')) {
        options.push({
          id: 'emergency',
          text: '🚨 Llamar Emergencias',
          action: 'emergency',
          style: 'danger'
        });
      }

      // Symptom severity options
      if (stage === 'exploration' || stage === 'analysis') {
        options.push(
          { id: 'mild', text: 'Leve', action: 'severity', value: 'mild', style: 'success' },
          { id: 'moderate', text: 'Moderado', action: 'severity', value: 'moderate', style: 'warning' },
          { id: 'severe', text: 'Severo', action: 'severity', value: 'severe', style: 'danger' }
        );
      }

      // Common follow-up options
      if (stage === 'exploration') {
        options.push(
          { id: 'duration', text: '¿Cuánto tiempo?', action: 'question', value: 'duration' },
          { id: 'frequency', text: '¿Con qué frecuencia?', action: 'question', value: 'frequency' },
          { id: 'triggers', text: '¿Qué lo empeora?', action: 'question', value: 'triggers' }
        );
      }

      // Enhanced specialist referral options
      if (stage === 'analysis' || stage === 'conclusion') {
        if (replyLower.includes('especialista') || replyLower.includes('derivar') || replyLower.includes('especialidad')) {
          // Extract specialty from reply
          const specialtyMatch = reply.match(/especialista en (.*?)(?:\.|,|$)/i) || 
                                reply.match(/especialidad.*?([a-záéíóúñ\s]+)/i);
          const specialty = specialtyMatch ? specialtyMatch[1].trim() : 'general';
          
          options.push({
            id: 'find_specialist',
            text: `🔍 Buscar ${specialty}`,
            action: 'find_specialist',
            value: specialty,
            style: 'primary'
          });
          
          options.push({
            id: 'book_appointment',
            text: '📅 Agendar Cita',
            action: 'book_appointment',
            value: specialty,
            style: 'primary'
          });
        }
      }

      // Treatment options
      if (replyLower.includes('medicamento') || replyLower.includes('tratamiento')) {
        options.push({
          id: 'prescription',
          text: '💊 Solicitar Receta',
          action: 'prescription',
          style: 'primary'
        });
      }

      // Appointment options
      if (stage === 'conclusion') {
        options.push({
          id: 'appointment',
          text: '📅 Agendar Cita',
          action: 'appointment',
          style: 'primary'
        });
      }

      // Image analysis options
      if (messageLower.includes('imagen') || messageLower.includes('foto')) {
        options.push({
          id: 'upload_image',
          text: '📷 Subir Imagen',
          action: 'upload_image',
          style: 'secondary'
        });
      }

      return options.slice(0, 4); // Limit to 4 options
    };

    const responseOptions = generateResponseOptions(aiReply, conversationStage, message);

    // Use free question
    console.log('💳 Using free question for AI reply...')

    if (freeQuestionsData) {
      const { error: updateError } = await supabase
        .from('user_free_questions')
        .update({
          questions_remaining: remainingFreeQuestions - 1,
          questions_used: (freeQuestionsData.questions_used || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('❌ Error updating free questions:', updateError)
      }
    } else {
      const { error: insertError } = await supabase
        .from('user_free_questions')
        .insert({
          user_id: userId,
          questions_remaining: 4,
          questions_used: 1,
          reset_date: new Date().toISOString().split('T')[0]
        })

      if (insertError) {
        console.error('❌ Error creating free questions record:', insertError)
      }
    }

    console.log('✅ Free question used:', {
      success: true,
      remaining: remainingFreeQuestions - 1,
      message: `Pregunta gratuita utilizada. Te quedan ${remainingFreeQuestions - 1} preguntas gratis este mes.`
    })

    // Return successful response
    console.log('✅ Returning successful response')

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reply: aiReply,
        freeQuestionUsed: true,
        remainingFreeQuestions: remainingFreeQuestions - 1,
        redFlagsTriggered: false,
        conversationStage: conversationStage,
        responseOptions: responseOptions
      })
    }

  } catch (error) {
    console.error('❌ Error in chat function:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}
