import { createServiceClient } from '@/lib/supabase/server'
import { discoverDoctors, getAvailableSpecialties, getDoctorProfile, type PublicDoctorSummary } from '@/lib/discovery'
import { getDoctorReviews } from '@/lib/reviews'

export interface PublicTrustMetrics {
  approvedDoctors: number
  specialties: number
  reviews: number
  verifiedDoctors: number
  averageRating: number | null
}

export interface PublicReviewHighlight {
  id: string
  rating: number
  comment: string
  createdAt: string
  patientName: string
  patientPhotoUrl: string | null
  doctorName: string
  doctorPhotoUrl: string | null
  doctorSpecialty: string
  doctorCity: string | null
}

export interface PublicLandingData {
  metrics: PublicTrustMetrics
  featuredDoctors: PublicDoctorSummary[]
  reviewHighlights: PublicReviewHighlight[]
}

function formatAverageRating(doctors: PublicDoctorSummary[]): number | null {
  const weighted = doctors.reduce(
    (sum, doctor) => sum + doctor.rating_avg * Math.max(doctor.rating_count, 0),
    0
  )
  const totalRatings = doctors.reduce((sum, doctor) => sum + Math.max(doctor.rating_count, 0), 0)

  if (totalRatings === 0) {
    return null
  }

  return Math.round((weighted / totalRatings) * 10) / 10
}

export async function getPublicLandingData(): Promise<PublicLandingData> {
  const supabase = createServiceClient()

  const [specialties, doctors, approvedDoctorsResult, reviewsResult, verifiedResult] = await Promise.all([
    getAvailableSpecialties(),
    discoverDoctors({
      sortBy: 'rating',
      sortOrder: 'desc',
    }),
    supabase.from('doctors').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase.from('doctor_verifications').select('doctor_id', { count: 'exact', head: true }).eq('sep_verified', true),
  ])

  const featuredDoctors = [...doctors]
    .filter((doctor) => Boolean(doctor.profile?.photo_url))
    .sort((a, b) => {
      const aVerified = a.verification?.sep_verified ? 1 : 0
      const bVerified = b.verification?.sep_verified ? 1 : 0
      if (aVerified !== bVerified) return bVerified - aVerified
      return b.rating_avg - a.rating_avg
    })
    .slice(0, 3)

  const reviewHighlights = await Promise.all(
    featuredDoctors.map(async (doctor) => {
      const reviews = await getDoctorReviews(doctor.id, { limit: 8 })
      const review = reviews.find((item) => item.comment && item.comment.trim())

      if (!review || !review.comment) {
        return null
      }

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment.trim(),
        createdAt: review.created_at,
        patientName: review.patient?.full_name || 'Paciente verificado',
        patientPhotoUrl: review.patient?.photo_url || null,
        doctorName: doctor.profile?.full_name || 'Doctor',
        doctorPhotoUrl: doctor.profile?.photo_url || null,
        doctorSpecialty: doctor.specialties[0]?.name || 'Especialidad médica',
        doctorCity: doctor.city,
      } satisfies PublicReviewHighlight
    })
  )

  return {
    metrics: {
      approvedDoctors: approvedDoctorsResult.count || 0,
      specialties: specialties.length,
      reviews: reviewsResult.count || 0,
      verifiedDoctors: verifiedResult.count || 0,
      averageRating: formatAverageRating(featuredDoctors),
    },
    featuredDoctors,
    reviewHighlights: reviewHighlights.filter(Boolean) as PublicReviewHighlight[],
  }
}

export async function getPublicDoctorProfile(doctorId: string) {
  return getDoctorProfile(doctorId)
}
