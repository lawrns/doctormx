import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getQuestionById, createAnswer } from '@/lib/expert-questions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const question = await getQuestionById(id)
    if (!question) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      question,
      answers: question.answers || [],
    })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json(
      { error: 'Error al obtener respuestas' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const { answer, is_featured } = body

    if (!answer || answer.length < 50) {
      return NextResponse.json(
        { error: 'La respuesta debe tener al menos 50 caracteres' },
        { status: 400 }
      )
    }

    if (answer.length > 5000) {
      return NextResponse.json(
        { error: 'La respuesta no debe exceder 5000 caracteres' },
        { status: 400 }
      )
    }

    // Verify the question exists
    const question = await getQuestionById(id)
    if (!question) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      )
    }

    const newAnswer = await createAnswer({
      question_id: id,
      doctor_id: user.id,
      answer,
      is_featured: is_featured || false,
    })

    return NextResponse.json(newAnswer, { status: 201 })
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json(
      { error: 'Error al enviar la respuesta' },
      { status: 500 }
    )
  }
}
