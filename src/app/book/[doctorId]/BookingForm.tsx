'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { APPOINTMENT_CONFIG } from '@/config/constants'
import type { Doctor, Profile } from '@/types'

type BookingFormProps = {
  doctor: Doctor
  currentUser: Profile | null // Puede ser null si no está auth
}

export default function BookingForm({ doctor, currentUser }: BookingFormProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Cargar slots disponibles cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true)
      fetch(`/api/doctors/${doctor.id}/slots?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setAvailableSlots(data.slots || [])
          setLoadingSlots(false)
        })
        .catch(() => setLoadingSlots(false))
    }
  }, [selectedDate, doctor.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Si no hay usuario, redirigir a login con return URL
    if (!currentUser) {
      const returnUrl = `/book/${doctor.id}?date=${selectedDate}&time=${selectedTime}`
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`)
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          date: selectedDate,
          time: selectedTime,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push(`/checkout/${data.appointmentId}`)
      } else {
        alert(data.error || 'Error al crear la cita')
        setSubmitting(false)
      }
    } catch {
      alert('Error al crear la cita')
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
  const max = maxDate.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Doctory</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Agendar Consulta
          </h1>

          {/* Info del Doctor */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
              {doctor.profile?.photo_url ? (
                <Image
                  src={doctor.profile.photo_url}
                  alt={doctor.profile.full_name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  👨‍⚕️
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Dr. {doctor.profile?.full_name}
              </p>
              <p className="text-sm text-gray-600">
                ${(doctor.price_cents / 100).toFixed(2)} {doctor.currency}
              </p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona una fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setSelectedTime('')
                }}
                min={today}
                max={max}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Seleccionar Hora */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona un horario
                </label>
                {loadingSlots ? (
                  <p className="text-sm text-gray-500 py-4">Cargando horarios...</p>
                ) : availableSlots.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      No hay horarios disponibles para esta fecha. Intenta con otra fecha.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedTime === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            {selectedDate && selectedTime && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Creando cita...'
                  : currentUser
                    ? 'Continuar al pago'
                    : 'Iniciar sesión y continuar'}
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
