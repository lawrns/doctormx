'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { APPOINTMENT_CONFIG } from '@/config/constants'
import PreConsultaChat from '@/components/PreConsultaChat'
import { AI_CONFIG } from '@/lib/ai/config'
import { apiRequest, APIError } from '@/lib/api'
import { logger } from '@/lib/observability/logger'
import { User, Check, AlertCircle, Loader2 } from 'lucide-react'
import { getBlurDataURL } from '@/lib/performance/image-blur'
import { FormValidationAnnouncer, FormErrorSummary } from '@/components/ui/FormValidationAnnouncer'
import { Button } from '@/components/ui/button'

export type DoctorProfile = {
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

type FormErrors = {
  date?: string
  time?: string
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
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dateParam = searchParams.get('date')
    const timeParam = searchParams.get('time')
    const consultationIdParam = searchParams.get('consultationId')
    if (dateParam) {
      setSelectedDate(dateParam)
      setTouched(prev => ({ ...prev, date: true }))
    }
    if (timeParam) {
      setSelectedTime(timeParam)
      setTouched(prev => ({ ...prev, time: true }))
    }
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
        const res = await apiRequest<{ dates: string[] }>(
          `/api/doctores/${doctor.id}/available-dates?start=${today.toISOString().split('T')[0]}&end=${maxDate.toISOString().split('T')[0]}`,
          { method: 'GET' }
        )
        setAvailableDates(res.data.dates || [])
      } catch (error) {
        const apiError = error as APIError
        if (apiError.code === 'TIMEOUT') {
          logger.warn('Timeout loading available dates', { doctorId: doctor.id })
        } else if (apiError.code === 'NETWORK_ERROR') {
          logger.warn('Network error loading available dates', { doctorId: doctor.id })
        }
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
      setTouched(prev => ({ ...prev, time: false }))
      apiRequest<{ slots: string[] }>(`/api/doctores/${doctor.id}/slots?date=${selectedDate}`, { method: 'GET' })
        .then(res => { 
          setAvailableSlots(res.data.slots || []); 
          setLoadingSlots(false) 
        })
        .catch((error) => {
          const apiError = error as APIError
          if (apiError.code === 'TIMEOUT') {
            logger.warn('Timeout loading slots', { doctorId: doctor.id, date: selectedDate })
          } else if (apiError.code === 'NETWORK_ERROR') {
            logger.warn('Network error loading slots', { doctorId: doctor.id, date: selectedDate })
          }
          setAvailableSlots([])
          setLoadingSlots(false)
        })
    }
  }, [selectedDate, doctor.id])

  // Validation functions
  const validateDate = useCallback((date: string): boolean => {
    if (!date) {
      setErrors(prev => ({ ...prev, date: 'Selecciona una fecha' }))
      return false
    }
    if (!availableDates.includes(date)) {
      setErrors(prev => ({ ...prev, date: 'Fecha no disponible' }))
      return false
    }
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.date
      return newErrors
    })
    return true
  }, [availableDates])

  const validateTime = useCallback((time: string): boolean => {
    if (!time) {
      setErrors(prev => ({ ...prev, time: 'Selecciona un horario' }))
      return false
    }
    if (!availableSlots.includes(time)) {
      setErrors(prev => ({ ...prev, time: 'Horario no disponible' }))
      return false
    }
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.time
      return newErrors
    })
    return true
  }, [availableSlots])

  const validateForm = useCallback((): boolean => {
    const isDateValid = validateDate(selectedDate)
    const isTimeValid = validateTime(selectedTime)
    
    if (!isDateValid || !isTimeValid) {
      const errorMessages = []
      if (!isDateValid) errorMessages.push('Fecha: Selecciona una fecha válida')
      if (!isTimeValid) errorMessages.push('Horario: Selecciona un horario válido')
      setAnnouncement(`Errores en el formulario: ${errorMessages.join('. ')}`)
      return false
    }
    
    return true
  }, [selectedDate, selectedTime, validateDate, validateTime])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setTouched(prev => ({ ...prev, date: true }))
    const isValid = availableDates.includes(date)
    if (isValid) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.date
        return newErrors
      })
      setAnnouncement(`Fecha seleccionada: ${formatDateDisplay(date)}`)
    } else {
      setErrors(prev => ({ ...prev, date: 'Fecha no disponible' }))
      setAnnouncement('Error: Fecha no disponible')
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setTouched(prev => ({ ...prev, time: true }))
    const isValid = availableSlots.includes(time)
    if (isValid) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.time
        return newErrors
      })
      setAnnouncement(`Horario seleccionado: ${time}`)
    } else {
      setErrors(prev => ({ ...prev, time: 'Horario no disponible' }))
      setAnnouncement('Error: Horario no disponible')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      const redirectPath = window.location.pathname + window.location.search
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
      return
    }
    
    if (!validateForm()) {
      // Focus first error
      if (errors.date && dateRef.current) {
        dateRef.current.focus()
        dateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if (errors.time && timeRef.current) {
        timeRef.current.focus()
        timeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    if (AI_CONFIG.features.preConsulta && !preConsultaCompleted) { 
      setShowPreConsulta(true)
      setAnnouncement('Iniciando pre-consulta con IA')
      return 
    }
    
    setSubmitting(true)
    setAnnouncement('Creando tu cita...')
    
    try {
      const res = await apiRequest<{ appointmentId: string }>('/api/appointments', {
        method: 'POST',
        body: {
          doctorId: doctor.id,
          date: selectedDate,
          time: selectedTime,
          preConsultaSummary,
          consultationId: consultationId || undefined
        },
      })
      setAnnouncement('Cita creada exitosamente')
      router.push(`/checkout/${res.data.appointmentId}`)
    } catch (error) {
      const apiError = error as APIError
      
      if (apiError.code === 'TIMEOUT') {
        setAnnouncement('Error: La solicitud tardó demasiado. Por favor intenta de nuevo.')
        alert('La solicitud tardó demasiado. Por favor, intenta de nuevo.')
      } else if (apiError.code === 'NETWORK_ERROR') {
        setAnnouncement('Error de conexión. Verifica tu internet e intenta de nuevo.')
        alert('Error de conexión. Verifica tu internet e intenta de nuevo.')
      } else {
        const msg = apiError.message ?? 'Error al crear la cita'
        setAnnouncement(`Error: ${msg}`)
        alert(msg)
      }
      
      setSubmitting(false)
    }
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

  // Error summary for screen readers
  const errorSummary = Object.entries(errors).reduce((acc, [key, err]) => {
    if (err && touched[key]) {
      acc[key] = err
    }
    return acc
  }, {} as Record<string, string>)

  return (
    <div className="min-h-screen bg-gradient-hero">
      <FormValidationAnnouncer message={announcement} politeness="polite" />

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
          <Link href={`/doctores/${doctor.id}`} className="text-ink-secondary hover:text-primary-600 font-medium">← Volver al perfil</Link>
        </div>
      </header>
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-white">
            <h1 className="text-2xl font-bold">Agendar Consulta</h1>
            <p className="text-white/80 mt-1">Selecciona la fecha y hora de tu cita</p>
          </div>
          <div className="p-6">
            <div className="bg-secondary-50 p-4 rounded-xl mb-6 flex items-center gap-4 border border-border">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl overflow-hidden">
                {doctor.profile?.photo_url ? (
                  <Image 
                    src={doctor.profile.photo_url} 
                    alt={doctor.profile.full_name} 
                    width={64} 
                    height={64} 
                    className="object-cover w-full h-full" 
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('doctor-avatar')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-gray-400" /></div>
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

            {/* Error Summary */}
            {Object.keys(errorSummary).length > 0 && (
              <div className="mb-4">
                <FormErrorSummary errors={errorSummary} title="Por favor selecciona:" />
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Mini Calendar */}
              <div ref={dateRef} tabIndex={-1}>
                <label className="block text-sm font-medium text-ink-primary mb-3">
                  Selecciona una fecha
                  <span className="text-destructive ml-1" aria-hidden="true">*</span>
                  <span className="sr-only">(requerido)</span>
                </label>
                
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    disabled={isPrevMonthDisabled()}
                    className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Mes anterior"
                  >
                    <svg className="w-5 h-5 text-ink-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-semibold text-ink-primary" aria-live="polite">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    disabled={isNextMonthDisabled()}
                    className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Mes siguiente"
                  >
                    <svg className="w-5 h-5 text-ink-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                <div 
                  className="grid grid-cols-7 gap-1"
                  role="grid"
                  aria-label="Calendario de disponibilidad"
                >
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={!day.date || day.isPast}
                      onClick={() => day.date && handleDateSelect(day.date)}
                      className={`
                        relative aspect-square rounded-lg text-sm font-medium transition-all
                        ${!day.date ? 'invisible' : ''}
                        ${day.isPast ? 'text-ink-muted cursor-not-allowed' : 'hover:bg-secondary-100'}
                        ${selectedDate === day.date ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md' : ''}
                        ${day.isAvailable && selectedDate !== day.date ? 'text-success-700 bg-success-50' : ''}
                        ${!day.isAvailable && !day.isPast && selectedDate !== day.date ? 'text-ink-primary' : ''}
                        ${day.isToday && selectedDate !== day.date ? 'ring-2 ring-primary-400' : ''}
                        ${errors.date && touched.date && selectedDate === day.date ? 'ring-2 ring-destructive' : ''}
                      `}
                      role="gridcell"
                      aria-selected={selectedDate === day.date}
                      aria-disabled={!day.date || day.isPast}
                      aria-label={day.date ? formatDateDisplay(day.date) : undefined}
                    >
                      {day.date && new Date(day.date + 'T00:00:00').getDate()}
                      
                      {/* Availability indicator dot */}
                      {day.isAvailable && selectedDate !== day.date && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-success-500 rounded-full" aria-hidden="true"></span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Calendar Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-ink-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-success-500 rounded-full" aria-hidden="true"></span>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border-2 border-primary-400 rounded" aria-hidden="true"></span>
                    <span>Hoy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-primary-500 rounded" aria-hidden="true"></span>
                    <span>Seleccionado</span>
                  </div>
                </div>

                {/* Error message */}
                {errors.date && touched.date && (
                  <p className="mt-2 text-sm text-destructive flex items-center gap-1" role="alert" aria-live="polite">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.date}
                  </p>
                )}

                {/* Hidden native date input for accessibility and form validation */}
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => { 
                    const newDate = e.target.value
                    handleDateSelect(newDate)
                  }} 
                  min={today} 
                  max={max} 
                  required 
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>

              {selectedDate && (
                <div ref={timeRef} tabIndex={-1}>
                  <label className="block text-sm font-medium text-ink-primary mb-3">
                    Horarios para {formatDateDisplay(selectedDate)}
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                    <span className="sr-only">(requerido)</span>
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
                      <span className="sr-only">Cargando horarios disponibles...</span>
                      <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" aria-hidden="true"></div>
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
                            Próximas fechas con disponibilidad:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {nextAvailableDates.map(date => (
                              <button
                                key={date}
                                type="button"
                                onClick={() => handleDateSelect(date)}
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
                      <div 
                        className="grid grid-cols-4 gap-2"
                        role="radiogroup"
                        aria-label="Horarios disponibles"
                      >
                        {availableSlots.map((slot) => (
                          <button 
                            key={slot} 
                            type="button" 
                            onClick={() => handleTimeSelect(slot)} 
                            className={`
                              px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                              ${selectedTime === slot 
                                ? 'bg-primary-500 text-white border-primary-500 shadow-md' 
                                : 'bg-white text-ink-secondary border-border hover:border-primary-300 hover:bg-primary-50'
                              }
                            `}
                            role="radio"
                            aria-checked={selectedTime === slot}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      
                      {/* Error message */}
                      {errors.time && touched.time && (
                        <p className="mt-2 text-sm text-destructive flex items-center gap-1" role="alert" aria-live="polite">
                          <AlertCircle className="w-4 h-4" aria-hidden="true" />
                          {errors.time}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {preConsultaCompleted && (
                <div className="bg-success-50 border border-success-200 rounded-xl p-4">
                  <p className="text-sm text-success-700 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Pre-consulta completada con Dr. Simeon IA
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
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-semibold text-lg disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Creando cita...
                    </>
                  ) : currentUser ? (
                    AI_CONFIG.features.preConsulta && !preConsultaCompleted ? 
                      'Iniciar pre-consulta con IA' : 
                      'Continuar al pago →'
                  ) : (
                    'Iniciar sesión y continuar'
                  )}
                </Button>
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
