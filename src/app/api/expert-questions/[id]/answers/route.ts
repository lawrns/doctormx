import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { getPublicQuestionById, getModerationQuestionById, createAnswer } from '@/lib/expert-questions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const question = await getPublicQuestionById(id)
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
    const supabase = createServiceClient()

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

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, status')
      .eq('id', user.id)
      .eq('status', 'approved')
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!doctor && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo medicos verificados pueden responder preguntas' },
        { status: 403 }
      )
    }

    // Verify the question exists and is approved for doctor answering.
    const question = await getModerationQuestionById(id)
    if (!question) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      )
    }

    if (!['approved', 'answered'].includes(question.status)) {
      return NextResponse.json(
        { error: 'La pregunta debe estar aprobada antes de recibir respuestas' },
        { status: 409 }
      )
    }

    const newAnswer = await createAnswer({
      question_id: id,
      doctor_id: user.id,
      answer,
      is_featured: profile?.role === 'admin' ? is_featured || false : false,
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
