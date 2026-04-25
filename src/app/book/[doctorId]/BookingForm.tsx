'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { APPOINTMENT_CONFIG } from '@/config/constants'
import PreConsultaChat from '@/components/PreConsultaChat'
import { useToast } from '@/components/Toast'
import { AI_CONFIG } from '@/lib/ai/config'
import { CheckCircle2, Clock, CreditCard, FileText, MapPin, Monitor, ShieldCheck, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import { captureError } from '@/lib/utils'
import type { PublicDoctorProfile } from '@/lib/discovery'

type DoctorProfile = PublicDoctorProfile & {
  address?: string | null
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

function formatVerifiedDate(date: Date | null) {
  if (!date) return 'Sin fecha pública'
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BookingForm({ doctor, currentUser }: BookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState<'video' | 'in_person'>(() =>
    doctor.offers_video === false && doctor.office_address && doctor.offers_in_person === true
      ? 'in_person'
      : 'video'
  )
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
  const [submitError, setSubmitError] = useState<string>('')
  const [hasHydratedUrlState, setHasHydratedUrlState] = useState(false)

  useEffect(() => {
    const dateParam = searchParams.get('date')
    const timeParam = searchParams.get('time')
    const appointmentTypeParam = searchParams.get('appointmentType')
    const consultationIdParam = searchParams.get('consultationId')
    if (dateParam) setSelectedDate(dateParam)
    if (timeParam) setSelectedTime(timeParam)
    if (appointmentTypeParam === 'video' || appointmentTypeParam === 'in_person') {
      setAppointmentType(appointmentTypeParam)
    }
    if (consultationIdParam) setConsultationId(consultationIdParam)
    setHasHydratedUrlState(true)
  }, [searchParams])

  useEffect(() => {
    if (!hasHydratedUrlState || typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)

    if (selectedDate) params.set('date', selectedDate)
    else params.delete('date')

    if (selectedTime) params.set('time', selectedTime)
    else params.delete('time')

    params.set('appointmentType', appointmentType)

    if (consultationId) params.set('consultationId', consultationId)
    else params.delete('consultationId')

    const query = params.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`
    const currentUrl = `${window.location.pathname}${window.location.search}`

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false })
    }
  }, [appointmentType, consultationId, hasHydratedUrlState, router, selectedDate, selectedTime])

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
      fetch(`/api/doctors/${doctor.id}/slots?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          const slots = data.slots || []
          setAvailableSlots(slots)
          setSelectedTime((current) => (current && slots.includes(current) ? current : ''))
          setLoadingSlots(false)
        })
        .catch((err) => {
          captureError(err, 'BookingForm.slots')
          setAvailableSlots([])
          setSelectedTime('')
          setLoadingSlots(false)
        })
    }
  }, [selectedDate, doctor.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      const params = new URLSearchParams(window.location.search)
      if (selectedDate) params.set('date', selectedDate)
      if (selectedTime) params.set('time', selectedTime)
      params.set('appointmentType', appointmentType)
      if (consultationId) params.set('consultationId', consultationId)
      const redirectPath = `${window.location.pathname}?${params.toString()}`
      addToast('Inicia sesión para reservar tu consulta sin perder la fecha seleccionada.', 'info')
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
      return
    }
    if (AI_CONFIG.features.preConsulta && !preConsultaCompleted) { setShowPreConsulta(true); return }
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          date: selectedDate,
          time: selectedTime,
          appointmentType,
          preConsultaSummary,
          consultationId: consultationId || undefined
        }),
      })
      const data = await res.json()
      if (res.ok) {
        addToast('Cita creada. Te llevamos al pago para confirmarla.', 'success')
        router.push(`/checkout/${data.appointmentId}`)
      } else {
        setSubmitError(data.error || 'No pudimos crear la cita. Intenta nuevamente o elige otro horario.')
        setSubmitting(false)
      }
    } catch {
      setSubmitError('No pudimos crear la cita por un problema de conexión. Verifica tu internet e intenta nuevamente.')
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
  const officeAddress = doctor.office_address || doctor.address || [doctor.city, doctor.state].filter(Boolean).join(', ')
  const canBookVideo = doctor.offers_video !== false
  const canBookInPerson = Boolean(doctor.office_address && doctor.offers_in_person === true)
  const verificationDate = doctor.verification?.verified_at ? new Date(doctor.verification.verified_at) : null
  const consultationModes = [
    canBookVideo ? 'Videoconsulta' : null,
    canBookInPerson ? 'Presencial' : null,
  ].filter(Boolean) as string[]
  const selectedSlotLabel = selectedDate && selectedTime ? `${formatShortDate(selectedDate)} · ${selectedTime}` : 'Pendiente'
  const reservationSteps = [
    { label: 'Modalidad', complete: Boolean(appointmentType) },
    { label: 'Fecha', complete: Boolean(selectedDate) },
    { label: 'Horario', complete: Boolean(selectedTime) },
    { label: 'Contexto', complete: !AI_CONFIG.features.preConsulta || preConsultaCompleted || Boolean(consultationId) },
    { label: 'Reserva', complete: false },
  ]

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
    maxMonth.setDate(maxMonth.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
    maxMonth.setDate(1)
    return nextMonth > maxMonth
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="nav-sticky sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="rounded-lg transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Doctor.mx - Inicio"
          >
            <DoctorMxLogo />
          </Link>
          <Link href={`/doctors/${doctor.id}`} className="text-muted-foreground font-medium hover:text-primary">
            ← Volver al perfil
          </Link>
        </div>
      </header>
      <main className="editorial-shell py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="surface-panel-strong overflow-hidden">
            <div className="border-b border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--card))] p-5 sm:p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-ocean))]">
                Reserva médica
              </p>
              <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                    Elige horario y confirma con confianza.
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                    La disponibilidad viene de la agenda real del médico. No retenemos el horario hasta crear la reserva.
                  </p>
                </div>
                <div className="text-sm font-semibold text-[hsl(var(--public-ink))]">
                  {formatPrice(doctor.price_cents, doctor.currency)}
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-5">
                {reservationSteps.map((step, index) => (
                  <div
                    key={step.label}
                    className={`border px-3 py-2 text-xs ${
                      step.complete
                        ? 'border-[hsl(var(--brand-ocean)/0.22)] bg-[hsl(var(--surface-tint))] text-[hsl(var(--public-ink))]'
                        : 'border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--card))] text-[hsl(var(--public-muted))]'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 font-semibold">
                      {step.complete ? <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--brand-leaf))]" /> : null}
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Tipo de consulta
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de consulta">
                  <Button
                    type="button"
                    variant={appointmentType === 'video' ? 'default' : 'outline'}
                    className="h-auto justify-start gap-3 rounded-[var(--public-radius-control)] p-4"
                    onClick={() => setAppointmentType('video')}
                    disabled={!canBookVideo}
                    role="radio"
                    aria-checked={appointmentType === 'video'}
                  >
                    <Monitor className="h-5 w-5 shrink-0" />
                    <span className="text-left">
                      <span className="block font-semibold">Video</span>
                      <span className="block text-xs opacity-80">{canBookVideo ? '30 min, enlace seguro' : 'No disponible'}</span>
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant={appointmentType === 'in_person' ? 'default' : 'outline'}
                    className="h-auto justify-start gap-3 rounded-[var(--public-radius-control)] p-4"
                    onClick={() => setAppointmentType('in_person')}
                    disabled={!canBookInPerson}
                    role="radio"
                    aria-checked={appointmentType === 'in_person'}
                    aria-describedby={!canBookInPerson ? 'in-person-unavailable' : undefined}
                  >
                    <MapPin className="h-5 w-5 shrink-0" />
                    <span className="text-left">
                      <span className="block font-semibold">Presencial</span>
                      <span className="block text-xs opacity-80">{canBookInPerson ? 'En consultorio' : 'No disponible'}</span>
                    </span>
                  </Button>
                </div>
                {(!canBookVideo || !canBookInPerson) && (
                  <div className="mt-3 rounded-[10px] border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-3 text-sm leading-5 text-[hsl(var(--public-muted))]">
                    {!canBookVideo && canBookInPerson
                      ? 'Este médico solo tiene consulta presencial disponible en este momento.'
                      : canBookVideo && !canBookInPerson
                        ? 'Este médico solo tiene videoconsulta disponible en este momento.'
                        : 'Este médico aún no tiene una modalidad confirmada para reservar.'}
                  </div>
                )}
                {appointmentType === 'in_person' ? (
                  <div className="mt-3 rounded-[var(--public-radius-control)] border border-border bg-secondary/50 p-4 text-sm text-foreground">
                    <p className="font-medium">Dirección del consultorio</p>
                    <p className="mt-1 text-muted-foreground">{officeAddress}</p>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 rounded-[var(--public-radius-control)] border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
                      Recibirás el enlace de acceso cuando tu pago quede confirmado. Te recomendamos entrar desde un lugar privado y con buena conexión.
                    </div>
                    {!canBookInPerson && (
                      <p id="in-person-unavailable" className="mt-2 text-sm text-muted-foreground">
                        Este médico solo tiene disponible la modalidad por video en este momento.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Mini Calendar */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Selecciona una fecha
                </label>
                
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousMonth}
                    disabled={isPrevMonthDisabled()}
                    className="rounded-lg disabled:opacity-30"
                  >
                    <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  <span className="font-semibold text-foreground">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={goToNextMonth}
                    disabled={isNextMonthDisabled()}
                    className="rounded-lg disabled:opacity-30"
                  >
                    <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      disabled={!day.date || day.isPast}
                      onClick={() => day.date && setSelectedDate(day.date)}
                      className={`
                        relative aspect-square h-auto w-full p-0 text-sm font-medium rounded-lg transition-all
                        ${!day.date ? 'invisible' : ''}
                        ${day.isPast ? 'text-muted-foreground cursor-not-allowed' : 'hover:bg-secondary'}
                        ${selectedDate === day.date ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                        ${day.isAvailable && selectedDate !== day.date ? 'text-vital bg-vital-soft' : ''}
                        ${!day.isAvailable && !day.isPast && selectedDate !== day.date ? 'text-foreground' : ''}
                        ${day.isToday && selectedDate !== day.date ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      {day.date && new Date(day.date + 'T00:00:00').getDate()}
                      
                      {/* Availability indicator dot */}
                      {day.isAvailable && selectedDate !== day.date && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-vital rounded-full"></span>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Calendar Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-vital rounded-full"></span>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border-2 border-primary rounded"></span>
                    <span>Hoy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-primary rounded"></span>
                    <span>Seleccionado</span>
                  </div>
                </div>

                {!loadingCalendar && availableDates.length === 0 && (
                  <div className="mt-4 rounded-[10px] border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-4">
                    <p className="text-sm font-semibold text-[hsl(var(--public-ink))]">
                      Este médico todavía no tiene horarios publicados.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                      No mostramos horarios inventados. Vuelve al perfil del médico o busca otro doctor con disponibilidad visible.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/doctors/${doctor.id}`}>Volver al perfil</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href="/doctors">Buscar otro doctor</Link>
                      </Button>
                    </div>
                  </div>
                )}

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
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Horarios para {formatDateDisplay(selectedDate)}
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="space-y-4">
                      <div className="text-foreground bg-secondary/50 p-4 rounded-[var(--public-radius-control)] border border-border">
                        <p className="font-medium">No hay horarios disponibles para esta fecha.</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          El doctor no tiene agenda disponible para el {formatDateDisplay(selectedDate)}.
                        </p>
                      </div>
                      
                      {/* Suggested alternative dates */}
                      {nextAvailableDates.length > 0 && (
                        <div className="bg-secondary/50 p-4 rounded-[var(--public-radius-control)] border border-border">
                          <p className="text-sm font-medium text-foreground mb-3">
                            Próximas fechas con disponibilidad:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {nextAvailableDates.map(date => (
                              <Button
                                key={date}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDate(date)}
                              >
                                {formatShortDate(date)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {availableSlots.length} horario{availableSlots.length !== 1 ? 's' : ''} disponible{availableSlots.length !== 1 ? 's' : ''}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <Button 
                            key={slot} 
                            type="button" 
                            variant={selectedTime === slot ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedTime(slot)} 
                            className="rounded-[var(--public-radius-control)]"
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {preConsultaCompleted && (
                <div className="bg-vital-soft border border-vital/20 rounded-[var(--public-radius-control)] p-4">
                  <p className="text-sm text-vital font-medium">
                    Pre-consulta completada con Dr. Simeon IA
                  </p>
                </div>
              )}
              
              {consultationId && (
                <div className="bg-secondary/50 border border-border rounded-[var(--public-radius-control)] p-4">
                  <p className="text-sm text-foreground font-medium">
                    Referido desde tu consulta de IA multi-especialista
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tu expediente médico será compartido con el doctor para continuidad de atención
                  </p>
                </div>
              )}
              
              {selectedDate && selectedTime && (
                <div className="bg-secondary/50 rounded-[var(--public-radius-control)] p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Cita seleccionada:</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDateDisplay(selectedDate)} a las {selectedTime}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {appointmentType === 'video'
                      ? 'Video consulta. El enlace se habilita cerca de la hora de inicio.'
                      : `Consulta presencial. Dirección: ${officeAddress}`}
                  </p>
                  <p className="mt-3 rounded-lg border border-amber/30 bg-amber/10 px-3 py-2 text-xs font-medium text-foreground">
                    Al continuar, este horario se reserva temporalmente mientras completas el pago. Si el pago no se confirma, el horario puede volver a quedar disponible.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="rounded-[var(--public-radius-control)] border border-destructive/20 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">No se pudo continuar con la reserva.</p>
                  <p className="mt-1 text-sm text-destructive">{submitError}</p>
                </div>
              )}
              
              {selectedDate && selectedTime && (
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={submitting} 
                  className="w-full"
                >
                  {submitting ? 'Creando cita...' : currentUser ? (AI_CONFIG.features.preConsulta && !preConsultaCompleted ? 'Iniciar pre-consulta con IA' : 'Continuar al pago →') : 'Iniciar sesión y continuar'}
                </Button>
              )}
            </form>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="surface-panel p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                Resumen del doctor
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                {doctor.profile?.full_name || 'Doctor'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                {formatPrice(doctor.price_cents, doctor.currency)} por consulta
              </p>
              <div className="mt-4 space-y-3 border-t border-[hsl(var(--public-border)/0.8)] pt-4 text-sm text-[hsl(var(--public-muted))]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                  <span>Horario seleccionado: <strong className="text-[hsl(var(--public-ink))]">{selectedSlotLabel}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                  <span>Cédula {doctor.verification?.cedula || doctor.license_number || 'no visible'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                  <span>{formatVerifiedDate(verificationDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                  <span>{consultationModes.join(' · ') || 'Modalidad por confirmar'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                  <span>Pago seguro; el cargo confirma la reserva.</span>
                </div>
              </div>
            </Card>

            <Card className="surface-panel p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                Qué pasa después
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-[hsl(var(--public-muted))]">
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--surface-tint))] font-semibold text-[hsl(var(--brand-ocean))]">
                    1
                  </span>
                  <span>Elegir horario y modalidad reales.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--surface-tint))] font-semibold text-[hsl(var(--brand-ocean))]">
                    2
                  </span>
                  <span>Confirmar reserva y completar el pago.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--surface-tint))] font-semibold text-[hsl(var(--brand-ocean))]">
                    3
                  </span>
                  <span>Recibir confirmación y acceso al siguiente paso.</span>
                </li>
              </ol>
              <div className="mt-5 border-t border-[hsl(var(--public-border)/0.78)] pt-4 text-xs leading-5 text-[hsl(var(--public-muted))]">
                Si abandonas el pago, el bloqueo temporal vence y el horario puede volver a mostrarse. Las políticas finales dependen del médico y se muestran antes de confirmar.
              </div>
            </Card>

            <Card className="surface-panel p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--public-radius-control)] bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                    IA con límites
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                    Dr. Simeon prepara el contexto, pero el médico humano toma la decisión clínica.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>
      <PreConsultaChat 
        isOpen={showPreConsulta} 
        onCloseAction={() => setShowPreConsulta(false)} 
        onCompleteAction={(_, summary) => { 
          setPreConsultaCompleted(true); 
          setPreConsultaSummary(summary); 
          setShowPreConsulta(false); 
          setTimeout(() => {
            (document.querySelector('form') as HTMLFormElement)?.requestSubmit()
          }, 500)
        }} 
      />
    </div>
  )
}
