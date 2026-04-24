import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPublicQuestions, createQuestion, getQuestionStats, resolveSpecialtyId } from '@/lib/expert-questions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const specialtyParam = searchParams.get('specialtyId') || searchParams.get('specialty') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const questionStats = await getQuestionStats()
      return NextResponse.json(questionStats)
    }

    const specialtyId = await resolveSpecialtyId(specialtyParam)
    const questions = await getPublicQuestions({
      specialtyId: specialtyId || undefined,
      limit,
      offset,
    })

    return NextResponse.json({
      questions,
      pagination: {
        limit,
        offset,
        hasMore: questions.length === limit,
      },
    })
  } catch (error) {
    console.error('Error fetching expert questions:', error)
    return NextResponse.json(
      { error: 'Error al obtener preguntas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, email, display_name, specialty_id, is_anonymous } = body
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!question || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: pregunta y correo electronico' },
        { status: 400 }
      )
    }

    if (question.length < 20) {
      return NextResponse.json(
        { error: 'La pregunta debe tener al menos 20 caracteres' },
        { status: 400 }
      )
    }

    if (question.length > 2000) {
      return NextResponse.json(
        { error: 'La pregunta no debe exceder 2000 caracteres' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Correo electronico invalido' },
        { status: 400 }
      )
    }

    const resolvedSpecialtyId = await resolveSpecialtyId(specialty_id)
    const newQuestion = await createQuestion({
      question,
      email,
      display_name,
      specialty_id: resolvedSpecialtyId || undefined,
      is_anonymous: is_anonymous !== false,
      patient_id: user?.id,
    })

    return NextResponse.json(
      { message: 'Pregunta enviada exitosamente. Nuestro equipo la revisara.', question: newQuestion },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating expert question:', error)
    return NextResponse.json(
      { error: 'Error al enviar la pregunta' },
      { status: 500 }
    )
  }
}
