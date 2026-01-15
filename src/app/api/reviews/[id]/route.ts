import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { deleteReview, updateReview } from '@/lib/reviews'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    const body = await request.json()

    const { rating, comment } = body

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    const review = await updateReview(id, user.id, {
      rating,
      comment,
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Reseña no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar reseña' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth()
    const { id } = await params

    await deleteReview(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Reseña no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al eliminar reseña' },
      { status: 500 }
    )
  }
}
