'use client'

import { useState, useEffect } from 'react'
import { WriteReview } from '@/components/WriteReview'

interface ReviewableAppointment {
  id: string
  doctor_id: string
  doctor_name: string
  appointment_date: string
}

interface ReviewTriggerProps {
  appointments: ReviewableAppointment[]
  onReviewSubmitted?: () => void
}

export function ReviewTrigger({ appointments, onReviewSubmitted }: ReviewTriggerProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<ReviewableAppointment | null>(null)

  useEffect(() => {
    if (appointments.length > 0 && !showReviewModal) {
      const latest = appointments[0]
      setSelectedAppointment(latest)
      setShowReviewModal(true)
    }
  }, [appointments, showReviewModal])

  const handleReviewSuccess = () => {
    setShowReviewModal(false)
    setSelectedAppointment(null)
    if (onReviewSubmitted) {
      onReviewSubmitted()
    }
  }

  if (!selectedAppointment) {
    return null
  }

  return (
    <WriteReview
      appointmentId={selectedAppointment.id}
      doctorId={selectedAppointment.doctor_id}
      doctorName={selectedAppointment.doctor_name}
      appointmentDate={selectedAppointment.appointment_date}
      onSuccess={handleReviewSuccess}
    />
  )
}
