import { createClient, createServiceClient } from '@/lib/supabase/server'

export interface Review {
  id: string
  appointment_id: string
  patient_id: string
  doctor_id: string
  rating: number
  comment: string | null
  created_at: string
  patient?: {
    full_name: string
    photo_url: string | null
  }
}

export interface DoctorRatingSummary {
  doctor_id: string
  rating_avg: number
  rating_count: number
  rating_distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export async function createReview(data: {
  appointmentId: string
  patientId: string
  doctorId: string
  rating: number
  comment?: string
}): Promise<Review> {
  const supabase = await createClient()

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      appointment_id: data.appointmentId,
      patient_id: data.patientId,
      doctor_id: data.doctorId,
      rating: data.rating,
      comment: data.comment || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    throw error
  }

  await updateDoctorRating(data.doctorId)

  return review
}

export async function getDoctorReviews(doctorId: string, options?: {
  limit?: number
  offset?: number
}): Promise<Review[]> {
  const supabase = createServiceClient()
  const limit = options?.limit || 20
  const offset = options?.offset || 0

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      patient:profiles!reviews_patient_id_fkey (
        full_name,
        photo_url
      )
    `)
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching reviews:', error)
    throw error
  }

  return reviews || []
}

export async function getDoctorRatingSummary(doctorId: string): Promise<DoctorRatingSummary> {
  const supabase = createServiceClient()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('doctor_id', doctorId)

  if (error) {
    console.error('Error fetching rating summary:', error)
    throw error
  }

  const reviewsArray = reviews || []
  const totalReviews = reviewsArray.length
  const averageRating = totalReviews > 0
    ? reviewsArray.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviewsArray.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating as 1 | 2 | 3 | 4 | 5]++
    }
  })

  return {
    doctor_id: doctorId,
    rating_avg: Math.round(averageRating * 10) / 10,
    rating_count: totalReviews,
    rating_distribution: distribution,
  }
}

export async function canPatientReview(patientId: string, appointmentId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single()

  if (error || !appointment) {
    return false
  }

  if (appointment.status !== 'completed') {
    return false
  }

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('appointment_id', appointmentId)
    .single()

  return !existingReview
}

export async function hasPatientReviewedAppointment(patientId: string, appointmentId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: review } = await supabase
    .from('reviews')
    .select('id')
    .eq('appointment_id', appointmentId)
    .eq('patient_id', patientId)
    .single()

  return !!review
}

export async function getPatientReviewableAppointments(patientId: string): Promise<Array<{
  id: string
  doctor_id: string
  doctor_name: string
  appointment_date: string
}>> {
  const supabase = await createClient()

  interface AppointmentWithDoctor {
    id: string
    doctor_id: string
    start_ts: string
    doctor?: {
      profile?: {
        full_name: string | null
      } | null
    } | null
  }

  // Single query with LEFT JOIN to exclude appointments that already have reviews
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      doctor_id,
      start_ts,
      doctor:doctors!appointments_doctor_id_fkey (
        profile:profiles!doctors_id_fkey (
          full_name
        )
      ),
      reviews:reviews(id)
    `)
    .eq('patient_id', patientId)
    .eq('status', 'completed')
    .order('start_ts', { ascending: false })

  if (error) {
    console.error('Error fetching appointments:', error)
    throw error
  }

  // Filter out appointments that already have reviews (done in-memory after single query)
  const reviewableAppointments = ((appointments || []) as Array<AppointmentWithDoctor & { reviews?: Array<{ id: string }> | null }>)
    .filter(apt => !apt.reviews || apt.reviews.length === 0)
    .map(apt => ({
      id: apt.id,
      doctor_id: apt.doctor_id,
      doctor_name: apt.doctor?.profile?.full_name || 'Doctor',
      appointment_date: apt.start_ts,
    }))

  return reviewableAppointments
}

export async function deleteReview(reviewId: string, userId: string): Promise<void> {
  const supabase = await createClient()

  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('doctor_id')
    .eq('id', reviewId)
    .eq('patient_id', userId)
    .single()

  if (fetchError || !review) {
    throw new Error('Review not found or unauthorized')
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) {
    console.error('Error deleting review:', error)
    throw error
  }

  await updateDoctorRating(review.doctor_id)
}

export async function updateReview(reviewId: string, userId: string, data: {
  rating?: number
  comment?: string
}): Promise<Review> {
  const supabase = await createClient()

  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('doctor_id')
    .eq('id', reviewId)
    .eq('patient_id', userId)
    .single()

  if (fetchError || !review) {
    throw new Error('Review not found or unauthorized')
  }

  const updateData: Record<string, unknown> = {}
  if (data.rating !== undefined) updateData.rating = data.rating
  if (data.comment !== undefined) updateData.comment = data.comment

  const { data: updatedReview, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', reviewId)
    .select()
    .single()

  if (error) {
    console.error('Error updating review:', error)
    throw error
  }

  await updateDoctorRating(review.doctor_id)

  return updatedReview
}

async function updateDoctorRating(doctorId: string): Promise<void> {
  const supabase = createServiceClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('doctor_id', doctorId)

  const reviewsArray = reviews || []
  const totalReviews = reviewsArray.length
  const averageRating = totalReviews > 0
    ? reviewsArray.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  await supabase
    .from('doctors')
    .update({
      rating_avg: Math.round(averageRating * 10) / 10,
      rating_count: totalReviews,
    })
    .eq('id', doctorId)
}

export async function getReviewByAppointment(appointmentId: string): Promise<Review | null> {
  const supabase = await createClient()

  const { data: review, error } = await supabase
    .from('reviews')
    .select(`
      *,
      patient:profiles!reviews_patient_id_fkey (
        full_name,
        photo_url
      )
    `)
    .eq('appointment_id', appointmentId)
    .single()

  if (error) {
    return null
  }

  return review
}
