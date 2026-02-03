'use client'

import { useState, useEffect, useMemo } from 'react'
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

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function BookingForm({ doctor, currentUser }: BookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showPreConsulta, setShowPreConsulta] = useState(false)
  const [preConsultaCompleted, setPreConsultaCompleted] = useState(false)
  const [preConsultaSummary, setPreConsultaSummary] = useState<{
    chiefComplaint: string
    urgencyLevel: string
    suggestedSpecialty: string
  } | null>(null)
  const [consultationId, setConsultationId] = useState<string | null>(null)

  useEffect(() => {
    if (!searchParams) return
    const dateParam = searchParams.get('date')
    const timeParam = searchParams.get('time')
    const consultationIdParam = searchParams.get('consultationId')
    if (dateParam) setSelectedDate(dateParam)
    if (timeParam) setSelectedTime(timeParam)
    if (consultationIdParam) setConsultationId(consultationIdParam)
  }, [searchParams])

  // Fetch available dates for calendar
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setLoadingCalendar(true)
      const today = new Date()
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
      
      try {
        const res = await fetch(
          `/api/doctors/${doctor.id}/available-dates?start=${today.toISOString().split('T')[0]}&end=${maxDate.toISOString().split('T')[0]}`
        )
        const data = await res.json()
        setAvailableDates(data.dates || [])
      } catch {
        // Silently fail - calendar is enhancement, not critical
      } finally {
        setLoadingCalendar(false)
      }
    }
    
    fetchAvailableDates()
  }, [doctor.id])

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true)
      setSelectedTime('')
      fetch(`/api/doctors/${doctor.id}/slots?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => { setAvailableSlots(data.slots || []); setLoadingSlots(false) })
        .catch(() => {
          setAvailableSlots([])
          setLoadingSlots(false)
        })
    }
  }, [selectedDate, doctor.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      const redirectPath = window.location.pathname + window.location.search
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
      return
    }
    if (AI_CONFIG.features.preConsulta && !preConsultaCompleted) { setShowPreConsulta(true); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          date: selectedDate,
          time: selectedTime,
          preConsultaSummary,
          consultationId: consultationId || undefined
        }),
      })
      const data = await res.json()
      if (res.ok) router.push(`/checkout/${data.appointmentId}`)
      else { alert(data.error || 'Error al crear la cita'); setSubmitting(false) }
    } catch { alert('Error al crear la cita'); setSubmitting(false) }
  }

  // Generate calendar days for current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startPadding = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days: { date: string | null; isAvailable: boolean; isToday: boolean; isPast: boolean }[] = []
    
    // Add padding days
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, isAvailable: false, isToday: false, isPast: true })
    }
    
    // Add actual days
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const isPast = date < today
      const isBeyondMax = date > maxDate
      
      days.push({
        date: dateStr,
        isAvailable: availableDates.includes(dateStr) && !isPast && !isBeyondMax,
        isToday: date.toDateString() === today.toDateString(),
        isPast: isPast || isBeyondMax
      })
    }
    
    return days
  }, [currentMonth, availableDates])

  // Get next 3 available dates when current selection has no slots
  const nextAvailableDates = useMemo(() => {
    if (!selectedDate || availableSlots.length > 0) return []
    
    const selectedIndex = availableDates.indexOf(selectedDate)
    if (selectedIndex === -1) return availableDates.slice(0, 3)
    
    return availableDates.slice(selectedIndex + 1, selectedIndex + 4)
  }, [selectedDate, availableSlots, availableDates])

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-MX', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Format short date for pills
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-MX', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
  const max = maxDate.toISOString().split('T')[0]
  const formatPrice = (cents: number, currency: string) => new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100)

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Check if month is outside allowed range
  const isPrevMonthDisabled = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const currentMonthStart = new Date()
    currentMonthStart.setDate(1)
    return prevMonth < currentMonthStart
  }

  const isNextMonthDisabled = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    const maxMonth = new Date()
    maxMonth.setDate(maxDate.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
    maxMonth.setDate(1)
    return nextMonth > maxMonth
  }

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
              {/* Mini Calendar */}
              <div>
                <label className="block text-sm font-medium text-ink-primary mb-3">
                  Selecciona una fecha
                </label>
                
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    disabled={isPrevMonthDisabled()}
                    className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 text-ink-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-semibold text-ink-primary">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    disabled={isNextMonthDisabled()}
                    className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 text-ink-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-ink-secondary py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={!day.date || day.isPast}
                      onClick={() => day.date && setSelectedDate(day.date)}
                      className={`
                        relative aspect-square rounded-lg text-sm font-medium transition-all
                        ${!day.date ? 'invisible' : ''}
                        ${day.isPast ? 'text-ink-muted cursor-not-allowed' : 'hover:bg-secondary-100'}
                        ${selectedDate === day.date ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md' : ''}
                        ${day.isAvailable && selectedDate !== day.date ? 'text-success-700 bg-success-50' : ''}
                        ${!day.isAvailable && !day.isPast && selectedDate !== day.date ? 'text-ink-primary' : ''}
                        ${day.isToday && selectedDate !== day.date ? 'ring-2 ring-primary-400' : ''}
                      `}
                    >
                      {day.date && new Date(day.date + 'T00:00:00').getDate()}
                      
                      {/* Availability indicator dot */}
                      {day.isAvailable && selectedDate !== day.date && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-success-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Calendar Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-ink-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border-2 border-primary-400 rounded"></span>
                    <span>Hoy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-primary-500 rounded"></span>
                    <span>Seleccionado</span>
                  </div>
                </div>

                {/* Hidden native date input for accessibility and form validation */}
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }} 
                  min={today} 
                  max={max} 
                  required 
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-ink-primary mb-3">
                    Horarios para {formatDateDisplay(selectedDate)}
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="space-y-4">
                      <div className="text-warning-700 bg-warning-50 p-4 rounded-xl border border-warning-200">
                        <p className="font-medium">No hay horarios disponibles para esta fecha.</p>
                        <p className="text-sm text-warning-600 mt-1">
                          El doctor no tiene agenda disponible para el {formatDateDisplay(selectedDate)}.
                        </p>
                      </div>
                      
                      {/* Suggested alternative dates */}
                      {nextAvailableDates.length > 0 && (
                        <div className="bg-primary-50 p-4 rounded-xl border border-primary-200">
                          <p className="text-sm font-medium text-primary-800 mb-3">
                            📅 Próximas fechas con disponibilidad:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {nextAvailableDates.map(date => (
                              <button
                                key={date}
                                type="button"
                                onClick={() => setSelectedDate(date)}
                                className="px-3 py-2 bg-white text-primary-700 rounded-lg border border-primary-300 hover:bg-primary-100 hover:border-primary-500 text-sm font-medium transition-colors"
                              >
                                {formatShortDate(date)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-secondary">
                        {availableSlots.length} horario{availableSlots.length !== 1 ? 's' : ''} disponible{availableSlots.length !== 1 ? 's' : ''}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button 
                            key={slot} 
                            type="button" 
                            onClick={() => setSelectedTime(slot)} 
                            className={`
                              px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                              ${selectedTime === slot 
                                ? 'bg-primary-500 text-white border-primary-500 shadow-md' 
                                : 'bg-white text-ink-secondary border-border hover:border-primary-300 hover:bg-primary-50'
                              }
                            `}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {preConsultaCompleted && (
                <div className="bg-success-50 border border-success-200 rounded-xl p-4">
                  <p className="text-sm text-success-700 font-medium">
                    ✓ Pre-consulta completada con Dr. Simeon IA
                  </p>
                </div>
              )}
              
              {consultationId && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700 font-medium">
                    ✨ Referido desde tu consulta de IA multi-especialista
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Tu expediente médico será compartido con el doctor para continuidad de atención
                  </p>
                </div>
              )}
              
              {selectedDate && selectedTime && (
                <div className="bg-secondary-50 rounded-xl p-4 border border-border">
                  <p className="text-sm text-ink-secondary mb-1">Cita seleccionada:</p>
                  <p className="text-lg font-semibold text-ink-primary">
                    {formatDateDisplay(selectedDate)} a las {selectedTime}
                  </p>
                </div>
              )}
              
              {selectedDate && selectedTime && (
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-semibold text-lg disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Creando cita...' : currentUser ? (AI_CONFIG.features.preConsulta && !preConsultaCompleted ? 'Iniciar pre-consulta con IA' : 'Continuar al pago →') : 'Iniciar sesión y continuar'}
                </button>
              )}
            </form>
          </div>
        </div>
      </main>
      <PreConsultaChat 
        isOpen={showPreConsulta} 
        onCloseAction={() => setShowPreConsulta(false)} 
        onCompleteAction={(_, summary) => { 
          setPreConsultaCompleted(true); 
          setPreConsultaSummary(summary); 
          setShowPreConsulta(false); 
          setTimeout(() => (document.querySelector('form') as HTMLFormElement)?.requestSubmit(), 500) 
        }} 
      />
    </div>
  )
}
