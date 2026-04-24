import { createHash, randomBytes, randomUUID } from 'crypto'
import { APPOINTMENT_CONFIG, STATUS } from '@/config/constants'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export type WidgetAppointmentType = 'video' | 'in_person'

export type WidgetService = {
  id: string
  name: string
  description: string
  price_cents: number
  duration_minutes: number
  appointment_type: WidgetAppointmentType
}

export type WidgetConfig = {
  doctor_id: string
  primary_color: string
  accent_color: string
  enabled_services: WidgetService[]
  custom_title: string | null
  custom_message: string | null
  allowed_origins: string[]
  is_active: boolean
}

export type WidgetDoctor = {
  id: string
  status: string
  bio: string | null
  city: string | null
  state: string | null
  price_cents: number
  currency: string
  rating_avg: number
  rating_count: number
  office_address: string | null
  offers_video: boolean
  offers_in_person: boolean
  profile: {
    full_name: string
    photo_url: string | null
  } | null
  specialties: Array<{
    id: string
    name: string
    slug: string
  }>
}

export type WidgetContext = {
  doctor: WidgetDoctor
  config: WidgetConfig
}

type SupabaseServiceClient = ReturnType<typeof createServiceClient>

const DEFAULT_PRIMARY_COLOR = '#0d72d6'
const DEFAULT_ACCENT_COLOR = '#0d72d6'
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeHexColor(value: unknown, fallback: string) {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback
}

function toCents(value: unknown, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.round(parsed)
}

function cleanText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function slugifyServiceId(value: string, fallback: string) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

  return slug || fallback
}

function defaultAppointmentType(doctor: Pick<WidgetDoctor, 'offers_video' | 'offers_in_person'>): WidgetAppointmentType {
  return doctor.offers_video ? 'video' : 'in_person'
}

export function normalizeWidgetServices(
  value: unknown,
  doctor: Pick<WidgetDoctor, 'price_cents' | 'offers_video' | 'offers_in_person'>
): WidgetService[] {
  const allowedTypes = new Set<WidgetAppointmentType>([
    ...(doctor.offers_video ? ['video' as const] : []),
    ...(doctor.offers_in_person ? ['in_person' as const] : []),
  ])

  const rows = Array.isArray(value) ? value : []
  const normalized = rows
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null

      const record = item as Record<string, unknown>
      const name = cleanText(record.name)
      if (!name) return null

      const requestedType = record.appointment_type === 'in_person' ? 'in_person' : 'video'
      const appointmentType = allowedTypes.has(requestedType)
        ? requestedType
        : defaultAppointmentType(doctor)

      if (!allowedTypes.has(appointmentType)) return null

      return {
        id: slugifyServiceId(cleanText(record.id, name), `servicio-${index + 1}`),
        name: name.slice(0, 72),
        description: cleanText(record.description, '').slice(0, 160),
        price_cents: Math.max(100, toCents(record.price_cents, doctor.price_cents)),
        duration_minutes: Math.min(
          180,
          Math.max(15, toCents(record.duration_minutes, APPOINTMENT_CONFIG.DURATION_MINUTES))
        ),
        appointment_type: appointmentType,
      } satisfies WidgetService
    })
    .filter(Boolean) as WidgetService[]

  if (normalized.length > 0) {
    return normalized.slice(0, 6)
  }

  const fallbackType = defaultAppointmentType(doctor)
  return [
    {
      id: 'consulta-medica',
      name: fallbackType === 'video' ? 'Consulta en linea' : 'Consulta presencial',
      description: fallbackType === 'video' ? 'Videoconsulta privada de 30 minutos' : 'Cita en consultorio',
      price_cents: Math.max(100, doctor.price_cents),
      duration_minutes: APPOINTMENT_CONFIG.DURATION_MINUTES,
      appointment_type: fallbackType,
    },
  ]
}

function normalizeOrigins(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((origin) => cleanText(origin))
    .filter(Boolean)
    .slice(0, 12)
}

function transformDoctor(row: any): WidgetDoctor {
  const specialties = (row.doctor_specialties || [])
    .map((item: any) => item.specialty)
    .filter(Boolean)
    .map((specialty: any) => ({
      id: specialty.id,
      name: specialty.name,
      slug: specialty.slug,
    }))

  return {
    id: row.id,
    status: row.status,
    bio: row.bio || null,
    city: row.city || null,
    state: row.state || null,
    price_cents: row.price_cents || 0,
    currency: row.currency || 'MXN',
    rating_avg: Number(row.rating_avg || 0),
    rating_count: Number(row.rating_count || 0),
    office_address: row.office_address || null,
    offers_video: row.offers_video !== false,
    offers_in_person: Boolean(row.office_address && row.offers_in_person === true),
    profile: row.profile
      ? {
          full_name: row.profile.full_name,
          photo_url: row.profile.photo_url || null,
        }
      : null,
    specialties,
  }
}

function buildConfig(row: any, doctor: WidgetDoctor): WidgetConfig {
  return {
    doctor_id: doctor.id,
    primary_color: normalizeHexColor(row?.primary_color, DEFAULT_PRIMARY_COLOR),
    accent_color: normalizeHexColor(row?.accent_color, DEFAULT_ACCENT_COLOR),
    enabled_services: normalizeWidgetServices(row?.enabled_services, doctor),
    custom_title: cleanText(row?.custom_title) || null,
    custom_message: cleanText(row?.custom_message) || null,
    allowed_origins: normalizeOrigins(row?.allowed_origins),
    is_active: row?.is_active ?? true,
  }
}

export async function getWidgetContext(
  doctorId: string,
  options: { publicOnly?: boolean } = {}
): Promise<WidgetContext | null> {
  const supabase = createServiceClient()

  const { data: doctorRow, error: doctorError } = await supabase
    .from('doctors')
    .select(`
      id,
      status,
      bio,
      city,
      state,
      price_cents,
      currency,
      rating_avg,
      rating_count,
      office_address,
      offers_video,
      offers_in_person,
      profile:profiles!doctors_id_fkey (
        full_name,
        photo_url
      ),
      doctor_specialties (
        specialty:specialties (
          id,
          name,
          slug
        )
      )
    `)
    .eq('id', doctorId)
    .maybeSingle()

  if (doctorError || !doctorRow) return null

  const doctor = transformDoctor(doctorRow)
  if (options.publicOnly && doctor.status !== 'approved') return null

  const { data: configRow } = await supabase
    .from('doctor_widget_configs')
    .select('*')
    .eq('doctor_id', doctorId)
    .maybeSingle()

  const config = buildConfig(configRow, doctor)
  if (options.publicOnly && !config.is_active) return null

  return { doctor, config }
}

export function createCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function normalizeEmail(email: unknown) {
  const normalized = cleanText(email).toLowerCase()
  return EMAIL_PATTERN.test(normalized) ? normalized : null
}

export function normalizePhone(phone: unknown) {
  const cleaned = cleanText(phone)
  return cleaned ? cleaned.slice(0, 32) : null
}

export async function ensureWidgetPatient(input: {
  email: string
  fullName: string
  phone: string | null
}) {
  const supabase = createServiceClient()

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', input.email)
    .maybeSingle()

  if (existingProfile?.id) {
    if (existingProfile.role !== 'patient') {
      throw new Error('Este correo ya esta asociado a una cuenta que no puede reservar citas.')
    }

    await supabase
      .from('profiles')
      .update({
        full_name: input.fullName,
        phone: input.phone,
      })
      .eq('id', existingProfile.id)

    return existingProfile.id as string
  }

  const generatedPassword = `${randomUUID()}-${randomBytes(16).toString('hex')}`
  const admin = (supabase.auth as any)?.admin

  if (!admin?.createUser) {
    throw new Error('El servicio de cuentas no esta disponible.')
  }

  const { data: authData, error: authError } = await admin.createUser({
    email: input.email,
    password: generatedPassword,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      source: 'booking_widget',
    },
  })

  if (authError || !authData?.user?.id) {
    throw new Error(authError?.message || 'No pudimos preparar la cuenta del paciente.')
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    role: 'patient',
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
  })

  if (profileError) {
    throw new Error(profileError.message)
  }

  return authData.user.id as string
}

function getStartAndEnd(date: string, time: string) {
  const start = new Date(`${date}T${time}:00`)
  const end = new Date(start.getTime() + APPOINTMENT_CONFIG.DURATION_MINUTES * 60000)
  return { start, end }
}

export async function getWidgetAvailableSlots(doctorId: string, date: string) {
  const supabase = createServiceClient()
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay()

  const { data: rules, error: rulesError } = await supabase
    .from('availability_rules')
    .select('start_time, end_time')
    .eq('doctor_id', doctorId)
    .eq('day_of_week', dayOfWeek)
    .eq('active', true)

  if (rulesError) throw new Error(rulesError.message)
  if (!rules?.length) return []

  const allSlots = rules.flatMap((rule: { start_time: string; end_time: string }) => {
    const slots: string[] = []
    const [startHour, startMin] = rule.start_time.split(':').map(Number)
    const [endHour, endMin] = rule.end_time.split(':').map(Number)
    let cursor = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    while (cursor + APPOINTMENT_CONFIG.DURATION_MINUTES <= endMinutes) {
      const hours = Math.floor(cursor / 60)
      const mins = cursor % 60
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`)
      cursor += APPOINTMENT_CONFIG.SLOT_INTERVAL_MINUTES
    }

    return slots
  })

  const dayStart = new Date(`${date}T00:00:00`)
  const dayEnd = new Date(`${date}T23:59:59.999`)

  const [{ data: appointments }, { data: holds }] = await Promise.all([
    supabase
      .from('appointments')
      .select('start_ts')
      .eq('doctor_id', doctorId)
      .gte('start_ts', dayStart.toISOString())
      .lte('start_ts', dayEnd.toISOString())
      .in('status', ['pending_payment', 'confirmed']),
    supabase
      .from('appointment_holds')
      .select('start_ts')
      .eq('doctor_id', doctorId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .gte('start_ts', dayStart.toISOString())
      .lte('start_ts', dayEnd.toISOString()),
  ])

  const occupied = new Set([
    ...(appointments || []).map((appointment: { start_ts: string }) => appointment.start_ts.substring(11, 16)),
    ...(holds || []).map((hold: { start_ts: string }) => hold.start_ts.substring(11, 16)),
  ])

  return allSlots.filter((slot) => !occupied.has(slot))
}

export async function getWidgetAvailableDates(doctorId: string, startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const dates: string[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    const date = cursor.toISOString().split('T')[0]
    const slots = await getWidgetAvailableSlots(doctorId, date)
    if (slots.length > 0) dates.push(date)
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

export async function createWidgetAppointment(input: {
  doctorId: string
  patientId: string
  date: string
  time: string
  appointmentType: WidgetAppointmentType
  serviceName: string
}) {
  const supabase = createServiceClient()
  const availableSlots = await getWidgetAvailableSlots(input.doctorId, input.date)

  if (!availableSlots.includes(input.time)) {
    throw new Error('El horario ya no esta disponible.')
  }

  const { start, end } = getStartAndEnd(input.date, input.time)
  const now = new Date()

  await supabase
    .from('appointment_holds')
    .update({ status: 'expired', updated_at: now.toISOString() })
    .eq('doctor_id', input.doctorId)
    .eq('start_ts', start.toISOString())
    .eq('status', 'active')
    .lt('expires_at', now.toISOString())

  const { data: hold, error: holdError } = await supabase
    .from('appointment_holds')
    .insert({
      patient_id: input.patientId,
      doctor_id: input.doctorId,
      start_ts: start.toISOString(),
      end_ts: end.toISOString(),
      status: 'active',
      expires_at: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()

  if (holdError) {
    throw new Error('El horario ya esta reservado temporalmente.')
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      patient_id: input.patientId,
      doctor_id: input.doctorId,
      start_ts: start.toISOString(),
      end_ts: end.toISOString(),
      status: STATUS.APPOINTMENT.PENDING_PAYMENT,
      appointment_type: input.appointmentType,
      video_status: input.appointmentType === 'in_person' ? null : 'pending',
      reason_for_visit: input.serviceName,
    })
    .select('id')
    .single()

  if (appointmentError || !appointment) {
    await supabase
      .from('appointment_holds')
      .update({ status: 'released', updated_at: new Date().toISOString() })
      .eq('id', hold.id)

    throw new Error(appointmentError?.message || 'No pudimos crear la cita.')
  }

  await supabase
    .from('appointment_holds')
    .update({
      appointment_id: appointment.id,
      status: 'converted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', hold.id)

  return appointment.id as string
}

export async function createWidgetPaymentIntent(input: {
  appointmentId: string
  doctorId: string
  patientId: string
  amountCents: number
  currency: string
}) {
  const supabase = createServiceClient()
  const paymentIntent = await stripe.paymentIntents.create({
    amount: input.amountCents,
    currency: input.currency.toLowerCase(),
    metadata: {
      appointmentId: input.appointmentId,
      doctorId: input.doctorId,
      patientId: input.patientId,
      amountCents: String(input.amountCents),
      amount: String(input.amountCents),
      currency: input.currency,
      source: 'booking_widget',
    },
    payment_method_types: ['card', 'oxxo', 'customer_balance'],
    payment_method_options: {
      oxxo: {
        expires_after_days: 3,
      },
      customer_balance: {
        funding_type: 'bank_transfer',
        bank_transfer: {
          type: 'mx_bank_transfer',
        },
      },
    },
  })

  const { error } = await supabase.from('payments').insert({
    appointment_id: input.appointmentId,
    provider: 'stripe',
    provider_ref: paymentIntent.id,
    stripe_payment_intent_id: paymentIntent.id,
    amount_cents: input.amountCents,
    currency: input.currency,
    status: 'pending',
    fee_cents: 0,
    net_cents: input.amountCents,
  })

  if (error) throw new Error(error.message)

  return paymentIntent
}

export function createWidgetBookingToken() {
  return randomBytes(32).toString('base64url')
}

export function hashWidgetBookingToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createWidgetBookingIntent(input: {
  doctorId: string
  patientId: string
  appointmentId: string
  patientEmail: string
  token: string
  origin: string | null
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('widget_booking_intents').insert({
    doctor_id: input.doctorId,
    patient_id: input.patientId,
    appointment_id: input.appointmentId,
    patient_email: input.patientEmail,
    token_hash: hashWidgetBookingToken(input.token),
    origin: input.origin,
  })

  if (error) throw new Error(error.message)
}

export async function validateWidgetBookingToken(input: {
  appointmentId: string
  token: string
}) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('widget_booking_intents')
    .select('id, doctor_id, patient_id, appointment_id, patient_email, status, expires_at')
    .eq('appointment_id', input.appointmentId)
    .eq('token_hash', hashWidgetBookingToken(input.token))
    .maybeSingle()

  if (error || !data) return null
  return data
}
