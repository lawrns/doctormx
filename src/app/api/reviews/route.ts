import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createReview, getDoctorReviews, canPatientReview, hasPatientReviewedAppointment, getPatientReviewableAppointments } from '@/lib/reviews'
import {
  parsePaginationParams,
  buildPaginatedResponse,
  decodeCursor,
  encodeCursor,
} from '@/lib/pagination'
import type { PaginatedResult } from '@/lib/pagination'
import { logger } from '@/lib/observability/logger'

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const { searchParams } = new URL(request.url)

    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const reviewable = searchParams.get('reviewable')

    if (doctorId) {
      // Parse pagination parameters
      const { limit } = parsePaginationParams(searchParams)

      const reviews = await getDoctorReviews(doctorId, { limit })

      // Return simple response
      return NextResponse.json({
        reviews,
        pagination: {
          limit,
          count: reviews.length,
        }
      })
    }

    if (reviewable === 'true' && patientId === user.id) {
      const appointments = await getPatientReviewableAppointments(user.id)
      return NextResponse.json({ appointments })
    }

    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  } catch (error) {
    logger.error('Error fetching reviews:', { err: error })
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const body = await request.json()

    const { appointmentId, doctorId, rating, comment } = body

    if (!appointmentId || !doctorId || !rating) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: appointmentId, doctorId, rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    const canReview = await canPatientReview(user.id, appointmentId)
    if (!canReview) {
      const alreadyReviewed = await hasPatientReviewedAppointment(user.id, appointmentId)
      if (alreadyReviewed) {
        return NextResponse.json(
          { error: 'Ya has reseñado esta consulta' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Solo puedes reseñar consultas completadas' },
        { status: 400 }
      )
    }

    const review = await createReview({
      appointmentId,
      patientId: user.id,
      doctorId,
      rating,
      comment,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    logger.error('Error creating review:', { err: error })
    return NextResponse.json(
      { error: 'Error al crear reseña' },
      { status: 500 }
    )
  }
}
