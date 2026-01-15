'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { APPOINTMENT_CONFIG } from '@/config/constants'
import PreConsultaChat from '@/components/PreConsultaChat'
import { AI_CONFIG } from '@/lib/ai/config'

type DoctorProfile = {
  id: string
  status: string
  bio: string | null
  languages: string[]
  years_experience: number | null
  city: string | null
  state: string | null
  country: string
  price_cents: number
  currency: string
  rating_avg: number
  rating_count: number
  profile: {
    id: string
    full_name: string
    photo_url: string | null
    phone?: string | null
  } | null
  specialties: Array<{
    id: string
    name: string | undefined
    slug: string | undefined
  }>
}

type UserProfile = {
  id: string
  full_name: string
  phone: string | null
  photo_url: string | null
  role: string
}

type BookingFormProps = {
  doctor: DoctorProfile
  currentUser: UserProfile | null
}

export default function BookingForm({ doctor, currentUser }: BookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [showPreConsulta, setShowPreConsulta] = useState(false)
  const [preConsultaCompleted, setPreConsultaCompleted] = useState(false)
  const [preConsultaSummary, setPreConsultaSummary] = useState<{
    chiefComplaint: string
    urgencyLevel: string
    suggestedSpecialty: string
  } | null>(null)

  useEffect(() => {
    const dateParam = searchParams.get('date')
    const timeParam = searchParams.get('time')
    if (dateParam) setSelectedDate(dateParam)
    if (timeParam) setSelectedTime(timeParam)
  }, [searchParams])

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true)
      fetch(`/api/doctors/${doctor.id}/slots?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => { setAvailableSlots(data.slots || []); setLoadingSlots(false) })
        .catch(() => setLoadingSlots(false))
    }
  }, [selectedDate, doctor.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('date', selectedDate)
      if (selectedTime) currentUrl.searchParams.set('time', selectedTime)
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl.pathname + currentUrl.search)}`)
      return
    }
    if (AI_CONFIG.features.preConsulta && !preConsultaCompleted) { setShowPreConsulta(true); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: doctor.id, date: selectedDate, time: selectedTime, preConsultaSummary }),
      })
      const data = await res.json()
      if (res.ok) router.push(`/checkout/${data.appointmentId}`)
      else { alert(data.error || 'Error al crear la cita'); setSubmitting(false) }
    } catch { alert('Error al crear la cita'); setSubmitting(false) }
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
  const max = maxDate.toISOString().split('T')[0]
  const formatPrice = (cents: number, currency: string) => new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100)

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-ink-primary">Doctor.mx</span>
          </Link>
          <Link href={`/doctors/${doctor.id}`} className="text-ink-secondary hover:text-primary-600 font-medium">← Volver al perfil</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-white">
            <h1 className="text-2xl font-bold">Agendar Consulta</h1>
            <p className="text-white/80 mt-1">Selecciona la fecha y hora de tu cita</p>
          </div>
          <div className="p-6">
            <div className="bg-secondary-50 p-4 rounded-xl mb-6 flex items-center gap-4 border border-border">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl overflow-hidden">
                {doctor.profile?.photo_url ? (
                  <Image src={doctor.profile.photo_url} alt={doctor.profile.full_name} width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink-primary text-lg">Dr. {doctor.profile?.full_name}</p>
                <p className="text-sm text-ink-secondary">Consulta en línea</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary-600">{formatPrice(doctor.price_cents, doctor.currency)}</p>
                <p className="text-xs text-ink-muted">por consulta</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink-primary mb-2">Selecciona una fecha</label>
                <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }} min={today} max={max} required className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-ink-primary focus:border-primary-500 focus:outline-none" />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-ink-primary mb-3">Selecciona un horario</label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-warning-700 bg-warning-50 p-4 rounded-xl">No hay horarios disponibles para esta fecha.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button key={slot} type="button" onClick={() => setSelectedTime(slot)} className={`px-4 py-3 rounded-xl border-2 text-sm font-medium ${selectedTime === slot ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-ink-secondary border-border hover:border-primary-300'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {preConsultaCompleted && <div className="bg-success-50 border border-success-200 rounded-xl p-4"><p className="text-sm text-success-700 font-medium">✓ Pre-consulta completada con Dr. Simeon IA</p></div>}
              {selectedDate && selectedTime && (
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-semibold text-lg disabled:opacity-50">
                  {submitting ? 'Creando cita...' : currentUser ? (AI_CONFIG.features.preConsulta && !preConsultaCompleted ? 'Iniciar pre-consulta con IA' : 'Continuar al pago →') : 'Iniciar sesión y continuar'}
                </button>
              )}
            </form>
          </div>
        </div>
      </main>
      <PreConsultaChat isOpen={showPreConsulta} onCloseAction={() => setShowPreConsulta(false)} onCompleteAction={(_, summary) => { setPreConsultaCompleted(true); setPreConsultaSummary(summary); setShowPreConsulta(false); setTimeout(() => (document.querySelector('form') as HTMLFormElement)?.requestSubmit(), 500) }} />
    </div>
  )
}
