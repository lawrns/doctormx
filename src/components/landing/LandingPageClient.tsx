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
import { SocialProofBar } from './SocialProofBar'
import DrSimeonShowcase from './DrSimeonShowcase'
import { HowItWorks } from './HowItWorks'
import { StatsSection } from './StatsSection'
import { FeaturesSection } from './FeaturesSection'
import { TestimonialsSection } from './TestimonialsSection'
import { CTASection } from './CTASection'
import { ShieldCheck, ArrowUpRight, HeartHandshake } from 'lucide-react'
import { landingNavItems } from '@/lib/public-nav'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'

export function LandingPageClient() {
  useEffect(() => {
    void trackClientEvent(ANALYTICS_EVENTS.LANDING_VIEW, {
      surface: 'landing-hero',
    })
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden bg-transparent text-[hsl(var(--text-primary))]">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="border-b border-[#d4d9e3]/70 bg-[#f7f8fb]/92 px-4 py-2.5 text-center backdrop-blur-xl"
      >
        <div className="editorial-shell flex flex-col items-center justify-center gap-2 text-sm sm:flex-row sm:gap-4">
          <span className="inline-flex items-center gap-2 font-medium tracking-[-0.01em] text-[#0a1533]">
            5 consultas médicas gratis para todos los mexicanos
          </span>
          <span className="hidden sm:inline text-[#d4d9e3]">|</span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#00a878]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verificado por COFEPRIS
          </span>
        </div>
      </motion.div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="sticky top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border)/0.42)] bg-[hsl(var(--card)/0.72)] backdrop-blur-lg"
      >
        <div className="editorial-shell">
          <div className="flex h-16 items-center justify-between gap-6">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1f48de] to-[#0f255f]">
                <span className="absolute inset-[5px] rounded-full border-[1.5px] border-[#00a878]" />
                <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00a878]" />
              </div>
              <span className="font-display text-xl font-medium tracking-[-0.02em] text-[#0a1533]">
                Doctor.mx
              </span>
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
                <SheetContent side="right" className="w-[88%] max-w-sm border-l border-[#d4d9e3] bg-white">
                  <SheetHeader className="border-b border-[#eef0f5] pb-4">
                    <SheetTitle className="font-display text-[#0a1533]">Explora Doctor.mx</SheetTitle>
                    <SheetDescription className="text-[#5c6783]">Navega por las principales rutas públicas desde cualquier pantalla.</SheetDescription>
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
                      <Link href="/auth/login">
                        <Button variant="ghost" className="w-full justify-center">Iniciar sesión</Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button variant="hero" className="w-full justify-center">Empezar gratis</Button>
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
              <Badge variant="luxe" className="hidden lg:inline-flex">Disponibilidad 24/7</Badge>
              <Link href="/auth/login" className="hidden sm:inline-flex">
                <Button variant="ghost">Iniciar sesión</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="hero" className="px-5 text-sm font-semibold">
                  Consultar gratis
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <HeroSection />
      <SocialProofBar />
      <DrSimeonShowcase />
      <HowItWorks />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />

      <footer className="border-t border-[#1c2647] bg-[#0a1533] py-16 text-[#f7f8fb]">
        <div className="editorial-shell">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="mb-4 flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1f48de] to-[#0f255f]">
                  <span className="absolute inset-[5px] rounded-full border-[1.5px] border-[#00a878]" />
                  <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00a878]" />
                </div>
                <span className="font-display text-xl font-medium tracking-[-0.02em]">Doctor.mx</span>
              </Link>
              <p className="text-sm leading-relaxed text-[#f7f8fb]/70">
                La plataforma de salud digital más confiable de México. Conectamos pacientes con los mejores especialistas certificados.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#f7f8fb]/10 bg-[#f7f8fb]/5 px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#f7f8fb]/80">
                <HeartHandshake className="h-3.5 w-3.5" />
                Confianza clínica + diseño premium
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em]">Pacientes</h4>
              <ul className="space-y-2.5 text-sm text-[#f7f8fb]/60">
                <li><Link href="/doctors" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Buscar doctores</Link></li>
                <li><Link href="/specialties" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Especialidades</Link></li>
                <li><Link href="/app/second-opinion" className="transition-colors hover:text-[#f7f8fb] hover:underline hover:underline-offset-4">Segunda opinión</Link></li>
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
            <div className="flex items-center gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f8fb]/5 transition-colors hover:bg-[#f7f8fb]/10">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f8fb]/5 transition-colors hover:bg-[#f7f8fb]/10">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f8fb]/5 transition-colors hover:bg-[#f7f8fb]/10">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
