'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Monitor,
  Star,
  UserRound,
} from 'lucide-react'
import { APPOINTMENT_CONFIG } from '@/config/constants'
import { Button } from '@/components/ui/button'
import type { WidgetConfig, WidgetDoctor, WidgetService } from '@/lib/widget'

type BookingWidgetProps = {
  doctor: WidgetDoctor
  config: WidgetConfig
}

const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  })
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function buildCalendarDays(month: Date, availableDates: string[]) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)
  const startPadding = firstDay.getDay()
  const today = new Date(todayString() + 'T00:00:00')
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
  const available = new Set(availableDates)

  const days: Array<{
    date: string | null
    day: number | null
    isPast: boolean
    isToday: boolean
    isAvailable: boolean
  }> = []

  for (let index = 0; index < startPadding; index += 1) {
    days.push({ date: null, day: null, isPast: true, isToday: false, isAvailable: false })
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, monthIndex, day)
    const dateString = date.toISOString().split('T')[0]
    const isPast = date < today || date > maxDate
    days.push({
      date: dateString,
      day,
      isPast,
      isToday: dateString === todayString(),
      isAvailable: !isPast && available.has(dateString),
    })
  }

  return days
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />
}

export function BookingWidget({ doctor, config }: BookingWidgetProps) {
  const doctorName = doctor.profile?.full_name || 'Doctor.mx'
  const specialty = doctor.specialties[0]?.name || 'Consulta medica'
  const [selectedServiceId, setSelectedServiceId] = useState(config.enabled_services[0]?.id || '')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loadingDates, setLoadingDates] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [patient, setPatient] = useState({ fullName: '', email: '', phone: '' })
  const [confirmation, setConfirmation] = useState<{
    appointmentId: string
    paymentUrl: string
  } | null>(null)

  const selectedService = useMemo(
    () => config.enabled_services.find((service) => service.id === selectedServiceId) || config.enabled_services[0],
    [config.enabled_services, selectedServiceId]
  )

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth, availableDates),
    [currentMonth, availableDates]
  )

  const widgetStyle = {
    '--widget-primary': config.primary_color,
    '--widget-accent': config.accent_color,
  } as CSSProperties

  useEffect(() => {
    const controller = new AbortController()
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const today = new Date(todayString() + 'T00:00:00')
    const boundedStart = start < today ? today : start

    setLoadingDates(true)
    fetch(
      `/api/widget/dates?doctorId=${doctor.id}&start=${boundedStart.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`,
      { signal: controller.signal }
    )
      .then((response) => response.json())
      .then((data) => setAvailableDates(Array.isArray(data.dates) ? data.dates : []))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setAvailableDates([])
      })
      .finally(() => setLoadingDates(false))

    return () => controller.abort()
  }, [currentMonth, doctor.id])

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    const controller = new AbortController()
    setLoadingSlots(true)
    setSelectedTime('')

    fetch(`/api/widget/slots?doctorId=${doctor.id}&date=${selectedDate}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => setAvailableSlots(Array.isArray(data.slots) ? data.slots : []))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setAvailableSlots([])
      })
      .finally(() => setLoadingSlots(false))

    return () => controller.abort()
  }, [selectedDate, doctor.id])

  const canGoPrevious = useMemo(() => {
    const previous = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const currentStart = new Date()
    currentStart.setDate(1)
    currentStart.setHours(0, 0, 0, 0)
    return previous >= currentStart
  }, [currentMonth])

  const canSubmit = Boolean(
    selectedService &&
      selectedDate &&
      selectedTime &&
      patient.fullName.trim().length >= 3 &&
      patient.email.trim().includes('@')
  )

  const submitBooking = async () => {
    if (!selectedService || !canSubmit) return
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/widget/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          serviceId: selectedService.id,
          date: selectedDate,
          time: selectedTime,
          patient,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No pudimos crear la reserva.')
      }

      setConfirmation({
        appointmentId: data.appointmentId,
        paymentUrl: data.paymentUrl,
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No pudimos crear la reserva.')
    } finally {
      setSubmitting(false)
    }
  }

  const goToPayment = () => {
    if (confirmation?.paymentUrl) {
      window.location.assign(confirmation.paymentUrl)
    }
  }

  return (
    <div style={widgetStyle} className="min-h-[100dvh] bg-[#f4f5f8] p-3 text-slate-950 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="mx-auto grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-[0.86fr_1.14fr]"
      >
        <aside className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_rgba(15,37,95,0.08)] lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-slate-100">
              {doctor.profile?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctor.profile.photo_url}
                  alt={doctorName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-950 text-sm font-semibold text-white">
                  {initials(doctorName) || <UserRound className="h-5 w-5" />}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {specialty}
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-slate-950">
                {config.custom_title || `Agenda con ${doctorName}`}
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            {config.custom_message || doctor.bio || 'Elige servicio, horario y datos del paciente para preparar tu reserva.'}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 pt-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Resenas</p>
              <p className="mt-1 flex items-center gap-1 font-mono text-lg font-semibold text-slate-950">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {doctor.rating_avg ? doctor.rating_avg.toFixed(1) : 'Nuevo'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Desde</p>
              <p className="mt-1 font-mono text-lg font-semibold text-slate-950">
                {selectedService ? formatCurrency(selectedService.price_cents, doctor.currency) : '--'}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {selectedService?.appointment_type === 'in_person' ? (
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" />
                {doctor.office_address || [doctor.city, doctor.state].filter(Boolean).join(', ')}
              </span>
            ) : (
              <span className="flex items-start gap-2">
                <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" />
                Videoconsulta privada con enlace seguro despues del pago.
              </span>
            )}
          </div>
        </aside>

        <main className="rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-[0_24px_60px_rgba(15,37,95,0.08)] sm:p-5">
          <AnimatePresence mode="wait">
            {confirmation ? (
              <motion.section
                key="confirmed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="p-2 sm:p-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-slate-950">
                  Horario apartado
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Completa el pago para confirmar la cita con {doctorName}.
                </p>
                <div className="mt-6 rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">{selectedService?.name}</p>
                  <p className="mt-1">{formatDate(selectedDate)} a las {selectedTime}</p>
                  <p className="mt-3 font-mono text-xs text-slate-500">ID {confirmation.appointmentId}</p>
                </div>
                <Button
                  type="button"
                  onClick={goToPayment}
                  className="mt-6 h-12 w-full rounded-[10px] bg-[var(--widget-primary)] text-white shadow-[0_14px_30px_rgba(15,37,95,0.18)] transition-transform active:scale-[0.98]"
                >
                  Ir al pago seguro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.section>
            ) : (
              <motion.section
                key="booking"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="space-y-6"
              >
                <section>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    Servicio
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {config.enabled_services.map((service: WidgetService) => {
                      const active = selectedServiceId === service.id
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            setSelectedServiceId(service.id)
                            setSelectedTime('')
                          }}
                          className="min-h-[112px] rounded-[10px] border bg-white p-4 text-left transition-all active:scale-[0.98]"
                          style={{
                            borderColor: active ? config.primary_color : '#e2e8f0',
                            boxShadow: active ? '0 14px 32px rgba(15,37,95,0.10)' : 'none',
                          }}
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span>
                              <span className="block font-semibold text-slate-950">{service.name}</span>
                              <span className="mt-1 block text-xs leading-5 text-slate-500">
                                {service.description || (service.appointment_type === 'video' ? 'Videoconsulta' : 'Presencial')}
                              </span>
                            </span>
                            {service.appointment_type === 'video' ? (
                              <Monitor className="h-4 w-4 shrink-0 text-slate-500" />
                            ) : (
                              <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                            )}
                          </span>
                          <span className="mt-4 flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              {service.duration_minutes} min
                            </span>
                            <span className="font-mono font-semibold text-slate-950">
                              {formatCurrency(service.price_cents, doctor.currency)}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.86fr]">
                  <div className="rounded-[10px] border border-slate-200 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                        {formatMonth(currentMonth)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!canGoPrevious}
                          onClick={() => setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                          className="h-9 w-9 rounded-lg border border-slate-200 text-slate-700 transition active:scale-[0.98] disabled:opacity-40"
                        >
                          <ChevronLeft className="mx-auto h-4 w-4" />
                          <span className="sr-only">Mes anterior</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                          className="h-9 w-9 rounded-lg border border-slate-200 text-slate-700 transition active:scale-[0.98]"
                        >
                          <ChevronRight className="mx-auto h-4 w-4" />
                          <span className="sr-only">Mes siguiente</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
                      {WEEKDAYS.map((day, index) => (
                        <div key={`${day}-${index}`} className="py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {loadingDates ? (
                      <div className="mt-1 grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, index) => (
                          <SkeletonBlock key={index} className="aspect-square" />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                          const active = selectedDate === day.date
                          return (
                            <button
                              key={day.date || `empty-${index}`}
                              type="button"
                              disabled={!day.date || day.isPast || !day.isAvailable}
                              onClick={() => day.date && setSelectedDate(day.date)}
                              className="relative aspect-square rounded-lg text-sm font-semibold transition active:scale-[0.96] disabled:cursor-not-allowed disabled:text-slate-300"
                              style={{
                                backgroundColor: active ? config.primary_color : day.isAvailable ? '#f8fafc' : 'transparent',
                                color: active ? '#ffffff' : day.isAvailable ? '#0f172a' : undefined,
                                border: day.isToday && !active ? `1px solid ${config.primary_color}` : '1px solid transparent',
                              }}
                            >
                              {day.day}
                              {day.isAvailable && !active ? (
                                <span
                                  className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                                  style={{ backgroundColor: config.accent_color }}
                                />
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[10px] border border-slate-200 p-4">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Clock className="h-4 w-4 text-slate-500" />
                      Horarios
                    </div>
                    {!selectedDate ? (
                      <div className="rounded-[10px] bg-slate-50 p-4 text-sm text-slate-500">
                        Selecciona una fecha disponible.
                      </div>
                    ) : loadingSlots ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <SkeletonBlock key={index} className="h-10" />
                        ))}
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="rounded-[10px] bg-slate-50 p-4 text-sm text-slate-500">
                        No hay horarios para {formatDate(selectedDate)}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot) => {
                          const active = selectedTime === slot
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className="h-10 rounded-lg border text-sm font-semibold transition active:scale-[0.98]"
                              style={{
                                borderColor: active ? config.primary_color : '#e2e8f0',
                                backgroundColor: active ? config.primary_color : '#ffffff',
                                color: active ? '#ffffff' : '#0f172a',
                              }}
                            >
                              {slot}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <div className="mb-3 text-sm font-semibold text-slate-950">Datos del paciente</div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                      Nombre completo
                      <input
                        value={patient.fullName}
                        onChange={(event) => setPatient((value) => ({ ...value, fullName: event.target.value }))}
                        className="h-11 rounded-[10px] border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        placeholder="Nombre del paciente"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Correo
                      <input
                        type="email"
                        value={patient.email}
                        onChange={(event) => setPatient((value) => ({ ...value, email: event.target.value }))}
                        className="h-11 rounded-[10px] border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        placeholder="paciente@correo.com"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Telefono
                      <input
                        type="tel"
                        value={patient.phone}
                        onChange={(event) => setPatient((value) => ({ ...value, phone: event.target.value }))}
                        className="h-11 rounded-[10px] border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        placeholder="+52"
                      />
                    </label>
                  </div>
                </section>

                {selectedDate && selectedTime && selectedService ? (
                  <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-950">{selectedService.name}</p>
                    <p className="mt-1">{formatDate(selectedDate)} a las {selectedTime}</p>
                  </div>
                ) : null}

                {error ? (
                  <div className="flex items-start gap-3 rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                ) : null}

                <Button
                  type="button"
                  disabled={!canSubmit || submitting}
                  onClick={submitBooking}
                  className="h-12 w-full rounded-[10px] bg-[var(--widget-primary)] text-white shadow-[0_14px_30px_rgba(15,37,95,0.18)] transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? 'Reservando...' : 'Reservar y continuar'}
                  {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                </Button>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  )
}
