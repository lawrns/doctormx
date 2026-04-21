'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,

  MapPin,
  Search,
  Video,
  Stethoscope,
  CheckCircle2,
  GraduationCap,

  Clock,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'

/* ────────────────────────────
   Types
   ──────────────────────────── */
interface Doctor {
  id: string
  bio: string | null
  price_cents: number
  rating_avg: number
  rating_count: number
  city: string | null
  state: string | null
  years_experience: number | null
  video_enabled: boolean | null
  profile: { full_name: string; photo_url: string | null } | null
  specialties: { id: string; name: string; slug: string }[]
}

interface Specialty {
  id: string
  name: string
  slug: string
}

interface PageParams {
  specialty?: string
  search?: string
  sortBy?: 'rating' | 'price' | 'experience'
  sortOrder?: 'asc' | 'desc'
  appointmentType?: 'all' | 'video' | 'in_person'
}

/* ────────────────────────────
   Deterministic helpers
   ──────────────────────────── */
function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getAiMatch(id: string): number {
  const h = hashString(id)
  return 70 + (h % 30)
}

function generateDates(seed: string) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const today = new Date()
  const dates = []
  for (let i = 0; i < 8; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const label = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : days[d.getDay()]
    const dt = `${d.getDate()} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][d.getMonth()]}`
    dates.push({ label, dt, index: i })
  }
  const h = hashString(seed)
  const activeIndex = h % dates.length
  const strikeCount = (h >> 2) % 3
  const strikes = new Set<number>()
  for (let i = 0; i < strikeCount; i++) strikes.add((h >> (3 + i * 2)) % dates.length)
  strikes.delete(activeIndex)
  return { dates, activeIndex, strikes }
}

function pinPosition(id: string, index: number): { left: string; top: string } {
  const h = hashString(id)
  const cols = 4
  const row = Math.floor(index / cols)
  const col = index % cols
  const baseLeft = 10 + col * 22 + (h % 12)
  const baseTop = 12 + row * 18 + ((h >> 3) % 10)
  return { left: `${baseLeft}%`, top: `${baseTop}%` }
}

/* ────────────────────────────
   Icons
   ──────────────────────────── */
function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

/* ────────────────────────────
   Components
   ──────────────────────────── */
function ModeToggle() {
  const [isDark, setIsDark] = useState(false)
  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
  }
  return (
    <div className="flex gap-1">
      <button
        onClick={toggle}
        className={`w-[30px] h-[30px] flex items-center justify-center rounded-md border text-xs transition-all ${
          !isDark ? 'bg-ink border-ink text-primary-foreground' : 'bg-background border-border text-muted-foreground'
        }`}
        aria-label="Modo claro"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={toggle}
        className={`w-[30px] h-[30px] flex items-center justify-center rounded-md border text-xs transition-all ${
          isDark ? 'bg-ink border-ink text-primary-foreground' : 'bg-background border-border text-muted-foreground'
        }`}
        aria-label="Modo oscuro"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2.5">
        {title}
      </div>
      {children}
    </div>
  )
}

function FilterOption({
  label,
  count,
  href,
  active,
}: {
  label: string
  count: number
  href: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 py-1.5 text-[13px] transition-colors rounded-md ${
        active ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
      }`}
    >
      <input
        type="checkbox"
        readOnly
        checked={active}
        className="w-3.5 h-3.5 accent-cobalt-700 shrink-0 cursor-pointer"
      />
      <span className="flex-1">{label}</span>
      <span className="text-[11px] text-muted-foreground font-mono">{count}</span>
    </Link>
  )
}

function DoctorCard({
  doctor,
  isSelected,
  onSelect,
  index,
}: {
  doctor: Doctor
  isSelected: boolean
  onSelect: () => void
  index: number
}) {
  const name = doctor.profile?.full_name || 'Doctor'
  const initials = getInitials(name)
  const aiMatch = getAiMatch(doctor.id)
  const { dates, activeIndex, strikes } = generateDates(doctor.id)
  const isFeatured = hashString(doctor.id) % 3 === 0

  const features = useMemo(() => {
    const list: { icon: React.ReactNode; text: string; muted?: boolean }[] = []
    if (doctor.bio) {
      list.push({
        icon: <Stethoscope className="w-3.5 h-3.5 text-primary mt-0.5" />,
        text: doctor.bio.slice(0, 80) + (doctor.bio.length > 80 ? '…' : ''),
      })
    }
    if (doctor.years_experience) {
      list.push({
        icon: <Clock className="w-3.5 h-3.5 text-primary mt-0.5" />,
        text: `${doctor.years_experience} años de experiencia`,
      })
    }
    if (doctor.video_enabled) {
      list.push({
        icon: <Video className="w-3.5 h-3.5 text-primary mt-0.5" />,
        text: 'Teleconsulta disponible',
      })
    }
    list.push({
      icon: <ShieldCheck className="w-3.5 h-3.5 text-primary mt-0.5" />,
      text: 'Especialista verificado',
    })
    if (doctor.city) {
      list.push({
        icon: <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />,
        text: `${doctor.city}${doctor.state ? `, ${doctor.state}` : ''}`,
        muted: true,
      })
    }
    list.push({
      icon: <GraduationCap className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />,
      text: `Primera visita desde $${(doctor.price_cents / 100).toLocaleString('es-MX')}`,
      muted: true,
    })
    return list
  }, [doctor])

  return (
    <article
      onClick={onSelect}
      className={`bg-card border rounded-2xl grid grid-cols-1 md:grid-cols-[1fr_210px] overflow-hidden cursor-pointer transition-all duration-200 ease-dx ${
        isSelected
          ? 'border-ink shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]'
          : 'border-border hover:border-primary hover:shadow-dx-2'
      }`}
    >
      {/* LEFT */}
      <div className="p-4 border-r border-border/60 flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {isFeatured && (
              <div className="absolute -top-1 -left-1 bg-amber text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider z-10">
                Destacado
              </div>
            )}
            <div className="w-[58px] h-[58px] rounded-full overflow-hidden bg-gradient-to-br from-cobalt-300 to-cobalt-800 flex items-center justify-center">
              {doctor.profile?.photo_url ? (
                <Image
                  src={doctor.profile.photo_url}
                  alt={name}
                  width={58}
                  height={58}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-display text-lg font-bold">{initials}</span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-display text-[15px] font-bold text-ink tracking-tight">
                {name}
              </h3>
              <VerifiedIcon className="text-primary shrink-0" />
            </div>

            <div className="text-xs text-muted-foreground mt-0.5">
              {doctor.specialties.length > 0 ? (
                <>
                  <Link
                    href={`/doctors?specialty=${doctor.specialties[0].slug}`}
                    className="text-primary font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {doctor.specialties[0].name}
                  </Link>
                  <span> · Ver más</span>
                </>
              ) : (
                'Especialista médico'
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs mt-1">
              <span className="text-vital">
                {'★'.repeat(Math.round(doctor.rating_avg))}
                {'☆'.repeat(5 - Math.round(doctor.rating_avg))}
              </span>
              <span className="font-bold text-ink">{doctor.rating_avg.toFixed(1)}</span>
              <span className="text-muted-foreground">({doctor.rating_count} opiniones)</span>
              <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary font-mono">
                <CheckCircle2 className="w-2.5 h-2.5" /> {aiMatch}% match
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-1">
          {features.map((f, i) => (
            <div
              key={i}
              className={`flex items-start gap-1.5 text-xs leading-relaxed ${
                f.muted ? 'text-muted-foreground' : 'text-foreground'
              }`}
            >
              {f.icon}
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — availability */}
      <div className="p-3 bg-secondary/50 flex flex-col gap-2">
        <div className="text-[11px] text-muted-foreground font-medium">Selecciona una fecha:</div>
        <div className="grid grid-cols-4 gap-1">
          {dates.map((d) => {
            const isActive = d.index === activeIndex
            const isStrike = strikes.has(d.index)
            return (
              <button
                key={d.index}
                disabled={isStrike}
                onClick={(e) => e.stopPropagation()}
                className={`py-1.5 px-0.5 border rounded-md text-center text-[10px] transition-all font-sans ${
                  isActive
                    ? 'bg-ink border-ink text-primary-foreground'
                    : isStrike
                    ? 'opacity-45 line-through pointer-events-none bg-background border-border text-foreground'
                    : 'bg-card border-border text-foreground hover:bg-secondary hover:border-primary/30 hover:text-primary'
                }`}
              >
                <span className="block font-semibold text-[11px]">{d.label}</span>
                <span className={`block ${isActive ? 'text-white/75' : 'text-muted-foreground'}`}>
                  {d.dt}
                </span>
              </button>
            )
          })}
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1 py-1.5 border rounded-md text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-primary hover:border-primary/30 transition-all"
        >
          Ver más <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </article>
  )
}

function CdmxMap({
  doctors,
  selectedIndex,
  onSelectPin,
}: {
  doctors: Doctor[]
  selectedIndex: number | null
  onSelectPin: (idx: number) => void
}) {
  return (
    <div className="relative w-full h-full bg-[#e8eef2] dark:bg-[#141d2b] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#c8d4e0" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="380" height="700" fill="#e8eef2" className="dark:fill-[#141d2b]" />
        <rect width="380" height="700" fill="url(#grid)" />

        {/* Parks */}
        <ellipse cx="190" cy="200" rx="55" ry="35" fill="#c8e6c9" opacity="0.7" />
        <text x="190" y="204" textAnchor="middle" fontSize="8" fill="#4caf50" fontFamily="Inter">Bosque de Chapultepec</text>
        <ellipse cx="80" cy="520" rx="30" ry="20" fill="#c8e6c9" opacity="0.6" />
        <ellipse cx="310" cy="600" rx="25" ry="18" fill="#c8e6c9" opacity="0.6" />

        {/* Water */}
        <ellipse cx="300" cy="480" rx="20" ry="14" fill="#b3d4f5" opacity="0.7" />

        {/* Urban blocks */}
        <g fill="#dde4ee" stroke="#c5cede" strokeWidth="0.5" opacity="0.8">
          <rect x="10" y="80" width="60" height="40" rx="2" />
          <rect x="80" y="70" width="45" height="50" rx="2" />
          <rect x="135" y="75" width="55" height="45" rx="2" />
          <rect x="200" y="60" width="70" height="55" rx="2" />
          <rect x="280" y="70" width="85" height="40" rx="2" />
          <rect x="10" y="140" width="75" height="35" rx="2" />
          <rect x="95" y="135" width="90" height="40" rx="2" />
          <rect x="260" y="120" width="105" height="50" rx="2" />
          <rect x="10" y="290" width="65" height="45" rx="2" />
          <rect x="85" y="280" width="80" height="55" rx="2" />
          <rect x="230" y="270" width="55" height="45" rx="2" />
          <rect x="295" y="265" width="75" height="60" rx="2" />
          <rect x="10" y="370" width="90" height="50" rx="2" />
          <rect x="110" y="360" width="70" height="55" rx="2" />
          <rect x="190" y="355" width="85" height="60" rx="2" />
          <rect x="285" y="345" width="80" height="65" rx="2" />
          <rect x="10" y="450" width="55" height="40" rx="2" />
          <rect x="75" y="455" width="90" height="40" rx="2" />
          <rect x="340" y="445" width="30" height="35" rx="2" />
          <rect x="10" y="540" width="100" height="50" rx="2" />
          <rect x="120" y="535" width="75" height="50" rx="2" />
          <rect x="205" y="530" width="90" height="55" rx="2" />
          <rect x="305" y="540" width="60" height="40" rx="2" />
          <rect x="10" y="620" width="80" height="60" rx="2" />
          <rect x="100" y="625" width="100" height="50" rx="2" />
          <rect x="210" y="618" width="80" height="55" rx="2" />
          <rect x="300" y="610" width="70" height="65" rx="2" />
        </g>

        {/* Roads */}
        <g stroke="#fff" fill="none" strokeLinecap="round">
          <path d="M 50 600 Q 190 380 330 160" strokeWidth="5" opacity="0.9" />
          <path d="M 50 600 Q 190 380 330 160" stroke="#e8b84b" strokeWidth="1.5" strokeDasharray="8,6" opacity="0.6" />
          <path d="M 175 680 L 180 0" strokeWidth="4.5" opacity="0.85" />
          <path d="M 10 300 Q 20 180 100 100 Q 200 40 340 80 Q 370 180 370 320 Q 365 480 330 570 Q 260 660 180 680 Q 100 695 30 650 Q 10 580 10 490" strokeWidth="3.5" strokeDasharray="none" opacity="0.7" />
          <line x1="0" y1="250" x2="380" y2="250" strokeWidth="2.5" opacity="0.6" />
          <line x1="0" y1="340" x2="380" y2="340" strokeWidth="2" opacity="0.5" />
          <line x1="0" y1="430" x2="380" y2="430" strokeWidth="2" opacity="0.5" />
          <line x1="0" y1="500" x2="380" y2="500" strokeWidth="2" opacity="0.4" />
          <line x1="0" y1="570" x2="380" y2="570" strokeWidth="1.5" opacity="0.4" />
          <line x1="90" y1="0" x2="90" y2="700" strokeWidth="2" opacity="0.4" />
          <line x1="270" y1="0" x2="270" y2="700" strokeWidth="2" opacity="0.4" />
        </g>

        {/* Labels */}
        <text x="205" y="246" textAnchor="middle" fontSize="7.5" fill="#8a95b0" transform="rotate(-1 205 246)">Av. Presidente Masaryk</text>
        <text x="182" y="400" textAnchor="middle" fontSize="7.5" fill="#8a95b0" transform="rotate(90 182 400)">Insurgentes</text>
        <text x="80" y="380" textAnchor="middle" fontSize="7.5" fill="#e8b84b" transform="rotate(-35 80 380)">Paseo de la Reforma</text>

        <text x="55" y="170" textAnchor="middle" fontSize="9" fill="#5c6783" fontWeight="600">Polanco</text>
        <text x="160" y="320" textAnchor="middle" fontSize="9" fill="#5c6783" fontWeight="600">Condesa</text>
        <text x="275" y="160" textAnchor="middle" fontSize="9" fill="#5c6783" fontWeight="600">Lomas</text>
        <text x="200" y="450" textAnchor="middle" fontSize="9" fill="#5c6783" fontWeight="600">Del Valle</text>
        <text x="80" y="570" textAnchor="middle" fontSize="9" fill="#5c6783" fontWeight="600">Coyoacán</text>
        <text x="310" y="390" textAnchor="middle" fontSize="9" fill="#5c6783" fontWeight="600">Santa Fe</text>
        <text x="160" y="590" textAnchor="middle" fontSize="9" fill="#5c6783" fontWeight="600">Tlalpan</text>
        <text x="280" y="500" textAnchor="middle" fontSize="9" fill="#5c6783" fontWeight="600">Nápoles</text>
      </svg>

      {/* Pins */}
      {doctors.slice(0, 8).map((doctor, idx) => {
        const pos = pinPosition(doctor.id, idx)
        const isSelected = selectedIndex === idx
        return (
          <button
            key={doctor.id}
            onClick={() => onSelectPin(idx)}
            className={`absolute w-9 h-9 flex items-center justify-center rounded-[50%_50%_50%_0] border-2 border-white shadow-md transition-all duration-200 ${
              isSelected
                ? 'bg-vital scale-[1.15] -rotate-45'
                : 'bg-ink -rotate-45 hover:bg-vital hover:scale-110'
            }`}
            style={{ left: pos.left, top: pos.top }}
            title={doctor.profile?.full_name}
          >
            <div className="rotate-45 text-white text-[8px] font-bold font-mono">
              ${(doctor.price_cents / 100).toLocaleString('es-MX')}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover:opacity-100">
              {doctor.profile?.full_name} · ${(doctor.price_cents / 100).toLocaleString('es-MX')}
            </div>
          </button>
        )
      })}

      {/* Map overlay controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex items-center gap-2 bg-card border rounded-xl px-3 py-2 text-xs text-foreground shadow-dx-1 flex-1">
          <Search className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Buscar zona...</span>
        </div>
        <div className="w-2" />
        <div className="flex flex-col gap-1">
          <button className="w-8 h-8 bg-card border rounded-md flex items-center justify-center text-sm shadow-dx-1 hover:bg-secondary transition-colors">+</button>
          <button className="w-8 h-8 bg-card border rounded-md flex items-center justify-center text-sm shadow-dx-1 hover:bg-secondary transition-colors">−</button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────
   Main export
   ──────────────────────────── */
export function DoctorsDirectoryClient({
  doctors,
  specialties,
  params,
}: {
  doctors: Doctor[]
  specialties: Specialty[]
  params: PageParams
}) {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0)

  const buildQuery = useCallback(
    (newParams: Record<string, string | undefined>) => {
      const sp = new URLSearchParams()
      if (params.specialty) sp.set('specialty', params.specialty)
      if (params.search) sp.set('search', params.search)
      if (params.sortBy) sp.set('sortBy', params.sortBy)
      if (params.sortOrder) sp.set('sortOrder', params.sortOrder)
      if (params.appointmentType) sp.set('appointmentType', params.appointmentType)

      Object.entries(newParams).forEach(([key, value]) => {
        if (value) sp.set(key, value)
        else sp.delete(key)
      })

      return sp.toString() ? `?${sp.toString()}` : ''
    },
    [params]
  )

  const handleSelectCard = (idx: number) => setSelectedIndex(idx)
  const handleSelectPin = (idx: number) => setSelectedIndex(idx)

  const currentSpecialty = specialties.find((s) => s.slug === params.specialty)
  const heading = currentSpecialty
    ? `${currentSpecialty.name} en México`
    : params.search
    ? `Resultados para "${params.search}"`
    : 'Doctores y Especialistas en México'

  const totalCount = doctors.length

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-[200] bg-card border-b border-border h-14 flex items-center">
        <div className="max-w-[1440px] mx-auto w-full px-6 flex items-center gap-4">
          <Link href="/" className="font-display text-lg font-bold text-foreground shrink-0">
            doctor.mx
          </Link>

          <form
            action="/doctors"
            className="hidden sm:flex items-center bg-secondary border border-border rounded-lg overflow-hidden flex-1 max-w-[560px]"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const search = fd.get('search') as string
              const city = fd.get('city') as string
              router.push(`/doctors${buildQuery({ search: search || undefined, city: city || undefined })}`)
            }}
          >
            <input
              name="search"
              type="text"
              placeholder="Especialidad o doctor..."
              defaultValue={params.search || ''}
              className="flex-1 px-3 py-2 bg-transparent text-foreground text-[13px] outline-none placeholder:text-muted-foreground"
            />
            <div className="w-px h-5 bg-border shrink-0" />
            <input
              name="city"
              type="text"
              placeholder="Ciudad..."
              defaultValue="Ciudad de México"
              className="px-3 py-2 bg-transparent text-foreground text-[13px] outline-none placeholder:text-muted-foreground w-[160px]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-ink text-primary-foreground text-[13px] font-semibold hover:bg-ink/90 transition-colors shrink-0"
            >
              Buscar
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* PAGE */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr_380px] h-[calc(100vh-56px)] overflow-hidden">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col border-r border-border overflow-y-auto p-5 gap-6 bg-card">
          <FilterSection title="Especialidad">
            <div className="flex flex-col">
              {specialties.slice(0, 6).map((s) => (
                <FilterOption
                  key={s.id}
                  label={s.name}
                  count={Math.floor(hashString(s.id) % 80) + 20}
                  href={`/doctors${buildQuery({ specialty: s.slug === params.specialty ? undefined : s.slug })}`}
                  active={params.specialty === s.slug}
                />
              ))}
            </div>
          </FilterSection>

          <div className="h-px bg-border/60" />

          <FilterSection title="Disponibilidad">
            <FilterOption label="Hoy" count={Math.min(24, totalCount)} href={`/doctors${buildQuery({})}`} />
            <FilterOption label="Esta semana" count={Math.min(67, totalCount)} href={`/doctors${buildQuery({})}`} />
            <FilterOption
              label="Teleconsulta"
              count={doctors.filter((d) => d.video_enabled).length}
              href={`/doctors${buildQuery({ appointmentType: params.appointmentType === 'video' ? undefined : 'video' })}`}
              active={params.appointmentType === 'video'}
            />
          </FilterSection>

          <div className="h-px bg-border/60" />

          <FilterSection title="Calificación">
            <FilterOption label="4.5 o más ★" count={doctors.filter((d) => d.rating_avg >= 4.5).length} href={`/doctors${buildQuery({})}`} />
            <FilterOption label="4.0 o más ★" count={doctors.filter((d) => d.rating_avg >= 4).length} href={`/doctors${buildQuery({})}`} />
          </FilterSection>

          <div className="h-px bg-border/60" />

          <FilterSection title="Precio por consulta">
            <FilterOption label="Hasta $500" count={doctors.filter((d) => d.price_cents <= 50000).length} href={`/doctors${buildQuery({})}`} />
            <FilterOption label="$500–$800" count={doctors.filter((d) => d.price_cents > 50000 && d.price_cents <= 80000).length} href={`/doctors${buildQuery({})}`} />
            <FilterOption label="Más de $800" count={doctors.filter((d) => d.price_cents > 80000).length} href={`/doctors${buildQuery({})}`} />
          </FilterSection>
        </aside>

        {/* RESULTS */}
        <div className="flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-10 px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-lg font-bold text-ink tracking-tight">{heading}</h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {totalCount} especialista{totalCount !== 1 ? 's' : ''} · ordenados por relevancia
              </p>
            </div>
            <select
              value={params.sortBy || 'rating'}
              onChange={(e) => {
                router.push(`/doctors${buildQuery({ sortBy: e.target.value })}`)
              }}
              className="px-2.5 py-1.5 border border-border rounded-md bg-card text-foreground text-xs outline-none cursor-pointer"
            >
              <option value="rating">Relevancia</option>
              <option value="rating">Calificación</option>
              <option value="price">Precio ↑</option>
              <option value="experience">Disponibilidad</option>
            </select>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {doctors.length === 0 ? (
              <div className="text-center py-20">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No encontramos doctores</h3>
                <p className="text-sm text-muted-foreground mt-1">Intenta con otra especialidad o término de búsqueda.</p>
              </div>
            ) : (
              doctors.map((doctor, idx) => (
                <div
                  key={doctor.id}
                  role="link"
                  tabIndex={0}
                  className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl cursor-pointer"
                  onClick={() => router.push(`/doctors/${doctor.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/doctors/${doctor.id}`) }}
                >
                  <DoctorCard
                    doctor={doctor}
                    isSelected={selectedIndex === idx}
                    onSelect={() => handleSelectCard(idx)}
                    index={idx}
                  />
                </div>
              ))
            )}
          </div>

          {doctors.length > 0 && (
            <div className="flex justify-center gap-1.5 p-5">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  className={`w-8 h-8 border rounded-md text-xs font-semibold transition-all ${
                    p === 1
                      ? 'bg-ink border-ink text-primary-foreground'
                      : 'bg-card border-border text-foreground hover:bg-ink hover:border-ink hover:text-primary-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="w-8 h-8 border rounded-md text-xs font-semibold bg-card border-border text-foreground hover:bg-ink hover:border-ink hover:text-primary-foreground transition-all">
                ›
              </button>
            </div>
          )}
        </div>

        {/* MAP */}
        <div className="hidden lg:block border-l border-border relative overflow-hidden">
          <CdmxMap doctors={doctors} selectedIndex={selectedIndex} onSelectPin={handleSelectPin} />
        </div>
      </div>
    </div>
  )
}
