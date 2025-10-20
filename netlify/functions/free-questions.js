import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxlbametpfubwnrmrbsv.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    }
  }

  try {
    const { userId } = JSON.parse(event.body || '{}')

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing userId' })
      }
    }

    console.log('🎯 Checking free question eligibility for user:', userId)

    // Get user's free questions data
    const { data: freeQuestionsData, error: freeQuestionsError } = await supabase
      .from('user_free_questions')
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('🔍 Free questions query result:', { 
      data: freeQuestionsData, 
      error: freeQuestionsError,
      userId 
    })

    if (freeQuestionsError && freeQuestionsError.code !== 'PGRST116') {
      console.error('❌ Error getting free questions:', freeQuestionsError)
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Database error', details: freeQuestionsError.message })
      }
    }

    // If no record exists, create one with 5 free questions
    if (!freeQuestionsData) {
      const { error: insertError } = await supabase
        .from('user_free_questions')
        .insert({
          user_id: userId,
          questions_remaining: 5,
          questions_used: 0,
          reset_date: new Date().toISOString().split('T')[0]
        })

      if (insertError) {
        console.error('❌ Error creating free questions record:', insertError)
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Failed to create free questions record' })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          eligible: true,
          remaining: 5,
          message: 'Tienes 5 preguntas gratuitas disponibles este mes.'
        })
      }
    }

    // Check if user is eligible for free questions
    const remaining = freeQuestionsData.questions_remaining || 0
    const eligible = remaining > 0

    console.log('✅ Free question eligibility:', {
      eligible,
      remaining,
      message: eligible 
        ? `Tienes ${remaining} preguntas gratuitas disponibles este mes.`
        : 'Has agotado tus preguntas gratuitas de este mes.'
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        eligible,
        remaining,
        message: eligible 
          ? `Tienes ${remaining} preguntas gratuitas disponibles este mes.`
          : 'Has agotado tus preguntas gratuitas de este mes.'
      })
    }

  } catch (error) {
    console.error('❌ Error in free-questions function:', error)
    
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
