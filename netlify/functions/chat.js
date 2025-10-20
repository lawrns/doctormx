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

    // Evaluate red flags
    const redFlagKeywords = [
      'emergencia', 'urgencia', 'ambulancia', 'hospital', 'sangre', 'hemorragia',
      'dolor de pecho', 'dificultad para respirar', 'desmayo', 'convulsión',
      'intoxicación', 'suicidio', 'herida grave', 'fractura', 'trauma'
    ]

    const messageLower = message.toLowerCase()
    const triggeredRedFlags = redFlagKeywords.filter(keyword => 
      messageLower.includes(keyword)
    )

    console.log('🚨 Red flags result:', { 
      triggered: triggeredRedFlags.length > 0, 
      reasons: triggeredRedFlags 
    })

    if (triggeredRedFlags.length > 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          reply: '⚠️ Detecté síntomas que podrían requerir atención médica inmediata. Te recomiendo acudir a urgencias o llamar al 911. Esta plataforma no sustituye la atención médica de emergencia.',
          redFlagsTriggered: true,
          triggeredFlags: triggeredRedFlags,
          freeQuestionUsed: false
        })
      }
    }

    // Generate AI reply
    console.log('🤖 Generating AI reply...')

    const systemPrompt = `Eres Dr. Simeon, un doctor virtual mexicano especializado en medicina general. Tu objetivo es proporcionar orientación médica inicial de manera empática, profesional y responsable.

INSTRUCCIONES IMPORTANTES:
- Responde de manera conversacional y natural, como un doctor real
- Haz preguntas de seguimiento para obtener más información
- Sé empático y comprensivo
- NO proporciones diagnósticos definitivos
- Siempre recomienda consultar con un médico en persona si los síntomas persisten
- Usa lenguaje médico apropiado pero accesible
- Mantén las respuestas concisas pero informativas
- Si el usuario sube imágenes médicas, analízalas y proporciona orientación basada en lo que ves

FORMATO DE RESPUESTA:
- Saluda de manera profesional
- Si hay imágenes, menciona que las estás analizando
- Pregunta sobre síntomas específicos
- Proporciona orientación general
- Recomienda cuándo buscar atención médica presencial

IMPORTANTE: Esta es una herramienta de orientación médica. No sustituye la consulta médica profesional.`

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content }))
    ]

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    })

    const aiReply = completion.choices[0].message.content

    console.log('✅ AI reply generated:', aiReply.substring(0, 100) + '...')

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
        redFlagsTriggered: false
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
