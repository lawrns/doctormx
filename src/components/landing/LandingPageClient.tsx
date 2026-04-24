'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { HeroSection } from './HeroSection'
import DrSimeonShowcase from './DrSimeonShowcase'
import { HowItWorks } from './HowItWorks'
import { AIGuidedMarketplacePreview } from './AIGuidedMarketplacePreview'
import { FeaturesSection } from './FeaturesSection'
import { TestimonialsSection } from './TestimonialsSection'
import { CTASection } from './CTASection'
import { ArrowUpRight, HeartHandshake, Stethoscope } from 'lucide-react'
import { landingNavItems } from '@/lib/public-nav'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'
import { MobileCtaBar, TrustClaimBlock } from '@/components/public'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import type { PublicLandingData } from '@/lib/public-trust'

type LandingPageClientProps = {
  trustData?: PublicLandingData | null
}

export function LandingPageClient({ trustData }: LandingPageClientProps) {
  useEffect(() => {
    void trackClientEvent(ANALYTICS_EVENTS.LANDING_VIEW, {
      surface: 'landing-hero',
    })
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden bg-transparent text-[hsl(var(--text-primary))]">
      <div className="border-b border-[#d4d9e3]/70 bg-[#f7f8fb]/92 px-4 py-2.5 text-center backdrop-blur-xl">
        <div className="editorial-shell flex flex-col items-center justify-center gap-2 text-sm sm:flex-row sm:gap-4">
          <span className="inline-flex items-center gap-2 font-medium tracking-[-0.01em] text-[#0a1533]">
            {trustData?.metrics.approvedDoctors
              ? `Dr. Simeón orienta primero · ${trustData.metrics.approvedDoctors.toLocaleString('es-MX')} doctores aprobados`
              : 'Dr. Simeón orienta primero · médicos verificados atienden después'}
          </span>
          <span className="hidden sm:inline text-[#d4d9e3]">|</span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#00a878]">
            <Stethoscope className="h-3.5 w-3.5" />
            IA con límites de seguridad
          </span>
        </div>
      </div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="sticky top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border)/0.42)] bg-[hsl(var(--card)/0.72)] backdrop-blur-lg"
      >
        <div className="editorial-shell">
          <div className="flex h-16 items-center justify-between gap-6">
            {/* Brand */}
            <Link
              href="/"
              className="group rounded-lg outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
              aria-label="Doctor.mx - Inicio"
            >
              <DoctorMxLogo showDescriptor />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {landingNavItems.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className="inline-flex items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[#5c6783] transition-colors hover:bg-[#eef0f5] hover:text-[#0a1533]">
                    {link.compactLabel}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="rounded-full p-2 text-[#5c6783] transition-colors hover:bg-[#eef0f5] hover:text-[#0a1533] lg:hidden"
                    aria-label="Abrir menú de navegación"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88%] max-w-sm border-l border-[#d4d9e3] bg-card">
                  <SheetHeader className="border-b border-[#eef0f5] pb-4">
                    <SheetTitle className="font-display text-[#0a1533]">Empieza con Dr. Simeón</SheetTitle>
                    <SheetDescription className="text-[#5c6783]">Describe síntomas, recibe orientación inicial y llega a médicos verificados cuando corresponde.</SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 px-4 pb-6">
                    {landingNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#1c2647] transition-colors hover:bg-[#f7f8fb] hover:text-[#0a1533]"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="mt-4 grid gap-3 border-t border-[#eef0f5] pt-4">
                      <Button asChild variant="ghost" className="w-full justify-center">
                        <Link href="/auth/login">Iniciar sesión</Link>
                      </Button>
                      <Button asChild variant="hero" className="w-full justify-center">
                        <Link href="/ai-consulta">Hablar con Dr. Simeón</Link>
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
              <Badge variant="luxe" className="hidden lg:inline-flex">IA clínica + médicos verificados</Badge>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
              <Button asChild variant="hero" className="hidden px-5 text-sm font-semibold sm:inline-flex">
                <Link href="/ai-consulta">
                  Hablar con Dr. Simeón
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <HeroSection trustData={trustData} />
      <AIGuidedMarketplacePreview trustData={trustData} />
      <HowItWorks />
      <TrustClaimBlock />
      <DrSimeonShowcase />
      <FeaturesSection />
      <TestimonialsSection trustData={trustData} />
      <CTASection trustData={trustData} />

      <footer className="border-t border-[#1c2647] bg-[#0a1533] py-16 text-[#f7f8fb]">
        <div className="editorial-shell">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="mb-4 inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#f7f8fb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1533]">
                <DoctorMxLogo inverted showDescriptor />
              </Link>
              <p className="text-sm leading-relaxed text-[#f7f8fb]/70">
                Dr. Simeón orienta primero y el marketplace conecta con médicos verificados cuando la consulta es el siguiente paso.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#f7f8fb]/10 bg-[#f7f8fb]/5 px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#f7f8fb]/80">
                <HeartHandshake className="h-3.5 w-3.5" />
                Orientación clínica + médicos reales
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em]">Pacientes</h4>
              <ul className="space-y-2.5 text-sm text-[#f7f8fb]/60">
                <li><Link href="/ai-consulta" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Hablar con Dr. Simeón</Link></li>
                <li><Link href="/doctors" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Buscar doctores</Link></li>
                <li><Link href="/specialties" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Especialidades</Link></li>
                <li><Link href="/app" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Mi cuenta</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em]">Doctores</h4>
              <ul className="space-y-2.5 text-sm text-[#f7f8fb]/60">
                <li><Link href="/for-doctors" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Únete como doctor</Link></li>
                <li><Link href="/doctor" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Portal de doctores</Link></li>
                <li><Link href="/pricing" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Planes y precios</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em]">Soporte</h4>
              <ul className="space-y-2.5 text-sm text-[#f7f8fb]/60">
                <li><Link href="/help" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Centro de ayuda</Link></li>
                <li><Link href="/contact" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Contacto</Link></li>
                <li><Link href="/privacy" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Privacidad</Link></li>
                <li><Link href="/terms" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Términos</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#f7f8fb]/10 pt-8 md:flex-row">
            <p className="text-sm text-[#f7f8fb]/50">
              © {new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
            </p>
            <p className="text-sm text-[#f7f8fb]/50">
              Soporte: <Link href="/contact" className="underline underline-offset-4 hover:text-[#f7f8fb]">contacto</Link>
            </p>
          </div>
        </div>
      </footer>
      <MobileCtaBar />
    </main>
  )
}
