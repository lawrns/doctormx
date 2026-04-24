import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  MapPin,
  PencilLine,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Stethoscope,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'

export const metadata: Metadata = {
  title: 'Doctor.mx Design System Book',
  description: 'Official visual and implementation rules for the Doctor.mx product experience.',
}

const colors = [
  { name: 'Ink', value: '#0A1533', token: '--brand-ink', text: 'text-white' },
  { name: 'Blue 700', value: '#0B5FB8', token: '--brand-ocean dark', text: 'text-white' },
  { name: 'Blue 600', value: '#0D72D6', token: '--brand-ocean / vital', text: 'text-white' },
  { name: 'Blue 500', value: '#2688E6', token: '--ring', text: 'text-white' },
  { name: 'Blue 300', value: '#8FC4FF', token: '--brand-sky', text: 'text-[#071a4e]' },
  { name: 'Soft Blue', value: '#E8F3FF', token: '--surface-tint', text: 'text-[#071a4e]' },
  { name: 'Surface', value: '#FFFFFF', token: '--card', text: 'text-[#071a4e]' },
  { name: 'Background', value: '#F4F5F8', token: '--background', text: 'text-[#071a4e]' },
  { name: 'Border', value: '#DDE1EC', token: '--border', text: 'text-[#071a4e]' },
  { name: 'Muted', value: '#5C6783', token: '--muted-foreground', text: 'text-white' },
  { name: 'Gold', value: '#F4A736', token: '--brand-gold', text: 'text-[#071a4e]' },
  { name: 'Coral', value: '#FF5A3D', token: '--destructive', text: 'text-white' },
  { name: 'No Green', value: '#0D72D6', token: 'success mapped blue', text: 'text-white' },
]

const principles = [
  {
    title: 'AI doctor first',
    body: 'Dr. Simeón is the entry point. Verified doctors are the handoff layer, not the first story.',
  },
  {
    title: 'Evidence over claims',
    body: 'Trust must be backed by visible cédula, verification, real review context, modality, price, or security proof.',
  },
  {
    title: 'Premium clinical calm',
    body: 'Deep navy, softer medical blue, cool grays, white space, and real human presence. No green brand accents.',
  },
  {
    title: 'Data honesty',
    body: 'If data is not verified, say so. Do not fabricate counts, availability, map pins, or proof.',
  },
  {
    title: 'Marketplace density',
    body: 'Directory and booking surfaces use tight white rows, low radius, real availability, and practical search/filter controls.',
  },
]

const typeRows = [
  {
    label: 'Hero display',
    className: 'font-display text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.055em]',
    sample: 'Tu salud merece una recomendación confiable.',
  },
  {
    label: 'Section title',
    className: 'font-display text-4xl font-semibold leading-tight tracking-[-0.04em]',
    sample: 'Del síntoma a la cita correcta.',
  },
  {
    label: 'Body',
    className: 'text-base leading-7 text-[#5c6783]',
    sample: 'Describe tus síntomas, recibe orientación inicial y agenda con médicos verificados cuando corresponde.',
  },
  {
    label: 'Mono label',
    className: 'font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]',
    sample: 'MÉDICOS VERIFICADOS',
  },
]

const spacing = [
  { token: 'Control', value: '6px radius', note: 'Buttons, inputs, compact badges' },
  { token: 'Marketplace card', value: '8px radius', note: 'Directory rows, doctor cards, compact proof modules' },
  { token: 'Public panel', value: '12px radius', note: 'Booking rails, AI panels, checkout sections' },
  { token: 'Hero media', value: '14px max', note: 'Large elevated media/panel masks only' },
  { token: 'Section compact', value: '64-80px', note: 'Supporting public sections' },
  { token: 'Section major', value: '80-96px', note: 'Major narrative blocks' },
]

const doRules = [
  'Primary public CTA above the fold is “Hablar con Dr. Simeón”.',
  'Green is not a brand color or success color; use soft medical blue for positive verification.',
  'Cards must earn their border/shadow through hierarchy or containment.',
  'Every doctor card needs photo, specialty, city, rating, price, modality, and verification affordance when available.',
  'Use real controls for filters; do not disguise navigation as checkbox inputs.',
  'Use Plus Jakarta Sans for UI/display and IBM Plex Mono for system labels.',
  'Keep marketplace radii low: 6px controls, 8px cards, 12px decision panels, true pills only for chips.',
]

const dontRules = [
  'No fake metrics, fake slots, fake pins, or fake reviews presented as production truth.',
  'No oversized rounded shells, bubbly metric tiles, or decorative cards without decision value.',
  'No green brand accents, generic SaaS gradients, or toy chatbot UI.',
  'No directory-first homepage story that hides Dr. Simeón.',
]

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#071a4e]">
      <section className="relative overflow-hidden bg-[#061a50] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-12rem] top-[-18rem] h-[34rem] w-[34rem] rounded-full bg-[#0d72d6]/30 blur-3xl" />
          <div className="absolute left-[45%] top-[-10rem] h-[34rem] w-[34rem] rounded-full border border-white/10" />
        </div>

        <div className="editorial-shell relative py-10 sm:py-14">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DoctorMxLogo inverted showDescriptor />
            <div className="flex flex-wrap gap-2">
              <Badge className="border-white/14 bg-white/10 text-white">Version 1.1</Badge>
              <Badge className="border-white/14 bg-white/10 text-white">Official</Badge>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fc4ff]">
                Doctor.mx Design System Book
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.75rem,6vw,5.2rem)] font-semibold leading-[0.96] tracking-[-0.055em]">
                Softer blue. Lower radius. Verified human care.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
                The canonical ruleset for making Doctor.mx feel premium, medically serious, AI-first, and marketplace-credible.
              </p>
            </div>

            <div className="rounded-[14px] border border-white/14 bg-white p-5 text-[#071a4e] shadow-[0_28px_90px_-48px_rgba(0,0,0,0.75)]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8f3ff] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0d72d6]">
                <Stethoscope className="h-4 w-4" />
                Hero grammar
              </div>
              <div className="space-y-3">
                <div className="rounded-[10px] bg-[#dce9ff] px-4 py-3 text-sm text-[#0a2769]">
                  Tengo brotes en la cara desde hace semanas.
                </div>
                <div className="rounded-[10px] border border-[#d8e3f6] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#5c6783]">Especialidad recomendada</p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Dermatología</h2>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-[#0d72d6]" />
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-[#5c6783] sm:grid-cols-2">
                    <span className="flex items-center gap-2"><Video className="h-4 w-4 text-[#0d72d6]" /> En línea</span>
                    <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#0d72d6]" /> Desde $650</span>
                    <span className="flex items-center gap-2 sm:col-span-2"><ShieldCheck className="h-4 w-4 text-[#0d72d6]" /> Cédula y verificación visible</span>
                  </div>
                </div>
                <Button className="w-full" variant="hero">Hablar con Dr. Simeón</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-shell py-12 sm:py-16">
        <SectionHeading eyebrow="01 / Principles" title="Rules before decoration." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {principles.map((principle) => (
            <Card key={principle.title} className="rounded-[10px] p-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold tracking-[-0.03em]">{principle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5c6783]">{principle.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9e3f5] bg-white py-12 sm:py-16">
        <div className="editorial-shell">
          <SectionHeading eyebrow="02 / Color" title="Softer blue is the brand. Green is not." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {colors.map((color) => (
              <div key={color.name} className="overflow-hidden rounded-[8px] border border-[#d9e3f5] bg-white">
                <div className={`flex h-28 flex-col justify-end p-4 ${color.text}`} style={{ backgroundColor: color.value }}>
                  <p className="text-sm font-semibold">{color.name}</p>
                  <p className="font-mono text-[11px] opacity-80">{color.value}</p>
                </div>
                <div className="p-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#5c6783]">
                  {color.token}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-shell py-12 sm:py-16">
        <SectionHeading eyebrow="03 / Typography" title="Confident, not bulky." />
        <div className="space-y-4">
          {typeRows.map((row) => (
            <div key={row.label} className="grid gap-4 border-t border-[#d9e3f5] py-6 lg:grid-cols-[12rem_1fr] lg:items-start">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">{row.label}</p>
              <p className={row.className}>{row.sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9e3f5] bg-white py-12 sm:py-16">
        <div className="editorial-shell">
          <SectionHeading eyebrow="04 / Components" title="Canonical primitives and public patterns." />
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[12px] border border-[#d9e3f5] bg-[#f7faff] p-6">
              <h3 className="text-xl font-semibold tracking-[-0.03em]">Buttons and badges</h3>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="hero">Primary action</Button>
                <Button variant="outline">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="success">Verified</Badge>
                <Badge variant="warning">Rating</Badge>
                <Badge variant="destructive">Risk</Badge>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#5c6783]">
                Use `src/components/ui/button.tsx`, `badge.tsx`, and `card.tsx`. Do not introduce one-off public primitives.
              </p>
            </div>

            <DoctorCardSpec />
          </div>
        </div>
      </section>

      <section className="editorial-shell py-12 sm:py-16">
        <SectionHeading eyebrow="05 / Marketplace Rhythm" title="Doctoralia-level utility, Doctor.mx restraint." />
        <MarketplaceDensitySpec />
      </section>

      <section className="border-y border-[#d9e3f5] bg-white py-12 sm:py-16">
        <div className="editorial-shell">
          <SectionHeading eyebrow="06 / Doctor Connect" title="Acquisition patterns for medical professionals." />
          <ConnectSystemSpec />
        </div>
      </section>

      <section className="border-b border-[#d9e3f5] bg-[#f4f7fb] py-12 sm:py-16">
        <div className="editorial-shell">
          <SectionHeading eyebrow="07 / Layout" title="Use density only when it helps decisions." />
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[12px] border border-[#d9e3f5] bg-white p-6">
              <h3 className="text-xl font-semibold tracking-[-0.03em]">Spacing scale</h3>
              <div className="mt-5 space-y-3">
                {spacing.map((item) => (
                  <div key={item.token} className="grid grid-cols-[8rem_7rem_1fr] gap-3 border-t border-[#e7eef9] pt-3 text-sm">
                    <span className="font-semibold">{item.token}</span>
                    <span className="font-mono text-xs text-[#0d72d6]">{item.value}</span>
                    <span className="text-[#5c6783]">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#d9e3f5] bg-[#061a50] p-6 text-white">
              <h3 className="text-xl font-semibold tracking-[-0.03em]">Hero composition</h3>
              <div className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_0.7fr_0.9fr]">
                <div className="rounded-[8px] bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8fc4ff]">Narrative</p>
                  <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em]">Dr. Simeón first</p>
                </div>
                <div className="rounded-[8px] bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8fc4ff]">Human</p>
                  <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em]">Doctor face</p>
                </div>
                <div className="rounded-[8px] bg-white p-4 text-[#071a4e]">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0d72d6]">Handoff</p>
                  <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em]">AI to booking</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-white/70">
                This is the approved above-the-fold grammar: message, human reassurance, structured AI panel, and proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-shell py-12 sm:py-16">
        <SectionHeading eyebrow="08 / Do and Do Not" title="Guardrails for every public surface." />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[12px] border border-[#c8d9fa] bg-[#f7faff] p-6">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#0b5fb8]">Do</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#071a4e]">
              {doRules.map((rule) => (
                <li key={rule} className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#0d72d6]" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[12px] border border-[#ffd2c6] bg-[#fff7f4] p-6">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#b93720]">Do Not</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#071a4e]">
              {dontRules.map((rule) => (
                <li key={rule} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ff5a3d]" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="editorial-shell py-12 sm:py-16">
        <div className="rounded-[14px] bg-[#071a4e] p-6 text-white sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8fc4ff]">Implementation contract</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                If it violates this book, it does not ship.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                Keep this route and `docs/brand/doctor-mx-design-system.md` synchronized when tokens, primitives, or public IA changes.
              </p>
            </div>
            <Button asChild className="bg-white text-[#071a4e] hover:bg-white/94">
              <Link href="https://github.com/lawrns/doctormx/blob/main/docs/brand/doctor-mx-design-system.md">
                Read source
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">{title}</h2>
    </div>
  )
}

function MarketplaceDensitySpec() {
  return (
    <div className="rounded-[12px] border border-[#d9e3f5] bg-white p-4 shadow-[0_14px_34px_-28px_rgba(15,37,95,0.28)] sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="rounded-[8px] border border-[#d9e3f5] bg-[#f7faff] p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <div className="flex items-center gap-3 rounded-[6px] border border-[#d9e3f5] bg-white px-3 py-2.5">
                <Search className="h-4 w-4 text-[#0d72d6]" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#5c6783]">Especialidad</p>
                  <p className="text-sm font-semibold text-[#071a4e]">Dermatología</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[6px] border border-[#d9e3f5] bg-white px-3 py-2.5">
                <MapPin className="h-4 w-4 text-[#0d72d6]" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#5c6783]">Ubicación</p>
                  <p className="text-sm font-semibold text-[#071a4e]">CDMX o en línea</p>
                </div>
              </div>
              <button className="rounded-[6px] bg-[#0d72d6] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_-16px_rgba(13,114,214,0.65)]">
                Buscar
              </button>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#e7eef9] rounded-[8px] border border-[#d9e3f5] bg-white">
            {['Dra. Ana López', 'Dr. Rodrigo Vázquez'].map((name, index) => (
              <div key={name} className="grid gap-3 p-3 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#e8f3ff]">
                  <Stethoscope className="h-5 w-5 text-[#0d72d6]" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#071a4e]">{name}</p>
                    <BadgeCheck className="h-4 w-4 text-[#0d72d6]" aria-hidden="true" />
                  </div>
                  <p className="mt-1 text-sm text-[#5c6783]">{index === 0 ? 'Dermatología · Polanco' : 'Cardiología · Monterrey'} · 4.9 ({index === 0 ? '214' : '187'} reseñas)</p>
                  <p className="mt-1 text-xs text-[#5c6783]">Cédula visible · En línea y presencial · Desde ${index === 0 ? '650' : '850'} MXN</p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:justify-end">
                  {['Hoy 10:30', '11:00', '15:30'].map((slot) => (
                    <span key={slot} className="rounded-full border border-[#c8d9fa] bg-[#f7faff] px-2.5 py-1 text-xs font-semibold text-[#0d72d6]">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-[#d9e3f5] bg-[#061a50] p-5 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8fc4ff]">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Marketplace rule
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">Compact beats cushioned.</h3>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Search, filters, doctors, slots, verification, and price should sit in one scannable decision path. Use whitespace for clarity, not inflated card size.
          </p>
          <div className="mt-5 grid gap-2 text-sm text-white/78">
            <span className="rounded-[6px] bg-white/10 px-3 py-2">6px controls</span>
            <span className="rounded-[8px] bg-white/10 px-3 py-2">8px doctor cards</span>
            <span className="rounded-[12px] bg-white/10 px-3 py-2">12px decision panels</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConnectSystemSpec() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[12px] border border-[#d9e3f5] bg-[#f8fbff] p-4">
        <div className="rounded-[10px] border border-[#d9e3f5] bg-white p-4 shadow-[0_18px_50px_-40px_rgba(15,37,95,0.42)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
                Practice search
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#071a4e]">
                Reclama tu perfil médico con IA
              </h3>
            </div>
            <Badge variant="info">IA asistiva</Badge>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-3 rounded-[8px] border border-[#cfdcf1] bg-[#f8fbff] px-3 py-3">
              <Search className="h-4 w-4 text-[#0d72d6]" />
              <span className="text-sm text-[#5c6783]">Dra. Ana López Polanco</span>
            </div>
            <button className="rounded-[8px] bg-[#0d72d6] px-5 py-3 text-sm font-semibold text-white">
              Buscar
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#e6edf8] overflow-hidden rounded-[8px] border border-[#d8e3f6]">
            {[
              ['Perfil Doctor.mx', 'Dra. Ana López', 'Polanco, CDMX', 'Listo para reclamar'],
              ['Google Places', 'Clínica Dermatológica López', 'Av. Homero 407, CDMX', 'Perfil nuevo'],
            ].map(([source, name, address, status]) => (
              <div key={name} className="grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#e8f3ff] text-[#0d72d6]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#071a4e]">{name}</p>
                    <p className="mt-1 text-sm text-[#5c6783]">{address}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{source}</Badge>
                      <Badge variant="info">{status}</Badge>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#0d72d6]">Preparar perfil</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { title: 'Loading', body: 'Skeletons row-shaped, never spinner-only.' },
            { title: 'Empty', body: 'Offer create-from-zero without pretending live data.' },
            { title: 'Error', body: 'Inline recovery copy near the search action.' },
          ].map((item) => (
            <div key={item.title} className="rounded-[8px] border border-[#d9e3f5] bg-white p-4">
              <p className="font-semibold text-[#071a4e]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#5c6783]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[12px] border border-[#d9e3f5] bg-white p-5">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-[#0d72d6]" />
            <h3 className="text-xl font-semibold tracking-[-0.03em]">AI enrichment timeline</h3>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { icon: ClipboardCheck, label: 'Search', body: 'Directory first, external sources second.' },
              { icon: PencilLine, label: 'Draft', body: 'Fields are suggested with visible confidence.' },
              { icon: ShieldCheck, label: 'Confirm', body: 'Credentials need doctor/admin confirmation.' },
            ].map(({ icon: Icon, label, body }) => (
              <div key={label} className="grid grid-cols-[36px_1fr] gap-3 rounded-[8px] border border-[#e7eef9] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#e8f3ff] text-[#0d72d6]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#071a4e]">{label}</p>
                  <p className="mt-1 text-sm leading-5 text-[#5c6783]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#d9e3f5] bg-[#071a4e] p-5 text-white">
          <div className="flex items-center gap-2 text-[#8fc4ff]">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">Compliance rule</p>
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
            Suggested is not verified.
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/70">
            The UI must never imply AI or Brave can verify cédula, specialty certification, identity, or SEP status.
          </p>
        </div>
      </div>
    </div>
  )
}

function DoctorCardSpec() {
  return (
    <div className="rounded-[12px] border border-[#d9e3f5] bg-white p-5 shadow-[0_20px_50px_-36px_rgba(15,37,95,0.38)]">
      <div className="grid gap-4 sm:grid-cols-[9rem_1fr_auto]">
        <div className="flex h-36 items-center justify-center rounded-[8px] bg-[#e8f3ff]">
          <Stethoscope className="h-10 w-10 text-[#0d72d6]" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-[-0.03em]">Dra. Paula Ramirez</h3>
            <BadgeCheck className="h-4 w-4 text-[#0d72d6]" />
          </div>
          <p className="mt-1 text-sm text-[#5c6783]">Dermatología · Ciudad de México</p>
          <div className="mt-4 grid gap-2 text-sm text-[#5c6783] sm:grid-cols-2">
            <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-[#f4a736] text-[#f4a736]" /> 4.9 · 214 reseñas</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#0d72d6]" /> Polanco, CDMX</span>
            <span className="flex items-center gap-2"><Video className="h-4 w-4 text-[#0d72d6]" /> En línea y presencial</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#0d72d6]" /> Cédula visible</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 sm:items-end">
          <div className="text-left sm:text-right">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5c6783]">Desde</p>
            <p className="text-2xl font-semibold">$650</p>
          </div>
          <Button variant="hero">Ver disponibilidad</Button>
        </div>
      </div>
    </div>
  )
}
