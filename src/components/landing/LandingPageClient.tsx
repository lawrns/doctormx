'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HeroSection } from './HeroSection'
import DrSimeonShowcase from './DrSimeonShowcase'
import { StatsSection } from './StatsSection'
import { FeaturesSection } from './FeaturesSection'
import { TestimonialsSection } from './TestimonialsSection'
import { CTASection } from './CTASection'
import { TrustFooter } from '@/components/TrustSignals'
import { Stethoscope, Search, UserPlus, Sparkles, ShieldCheck, ArrowUpRight, HeartHandshake } from 'lucide-react'

export function LandingPageClient() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-transparent text-[hsl(var(--text-primary))]">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="border-b border-border/70 bg-[hsl(var(--surface-quiet))/0.92] px-4 py-3 text-center backdrop-blur-xl"
      >
        <div className="editorial-shell flex flex-col items-center justify-center gap-2 text-sm sm:flex-row sm:gap-4">
          <span className="inline-flex items-center gap-2 font-semibold tracking-[-0.02em] text-[hsl(var(--text-primary))]">
            <Sparkles className="h-4 w-4 text-[hsl(var(--brand-gold))]" fill="currentColor" />
            5 CONSULTAS MÉDICAS GRATIS PARA TODOS LOS MEXICANOS
            <Sparkles className="h-4 w-4 text-[hsl(var(--brand-gold))]" fill="currentColor" />
          </span>
          <span className="hidden sm:inline text-[hsl(var(--text-soft))]">|</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brand-leaf)/0.18)] bg-[hsl(var(--surface-emerald))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-leaf))]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verificado por COFEPRIS
          </span>
        </div>
      </motion.div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="sticky top-0 left-0 right-0 z-50 border-b border-border/70 bg-[hsl(var(--background))/0.82] backdrop-blur-xl"
      >
        <div className="editorial-shell">
          <div className="flex min-h-[4.75rem] items-center justify-between gap-6 py-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(135deg,hsl(var(--brand-ocean)),hsl(var(--brand-sky)))] shadow-[var(--shadow-soft)]"
              >
                <Stethoscope className="h-5 w-5 text-white" />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">Doctor.mx</span>
                <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--text-soft))] sm:inline">Telemedicina premium en México</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {[
                { href: '/ai-consulta', label: '5 Consultas GRATIS', icon: Sparkles },
                { href: '/doctors', label: 'Buscar doctores', icon: Search },
                { href: '/for-doctors', label: 'Para doctores', icon: UserPlus },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.span
                    whileHover={{ y: -1 }}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[hsl(var(--text-secondary))] transition-colors hover:bg-secondary/70 hover:text-[hsl(var(--text-primary))]"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Badge variant="luxe" className="hidden lg:inline-flex">Disponibilidad 24/7</Badge>
              <Link href="/auth/login">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="ghost" className="hidden sm:flex">
                    Iniciar sesión
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/register">
                <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="hero" className="px-6 text-sm font-bold">
                    Empezar gratis
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <HeroSection />
      <DrSimeonShowcase />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />

      <TrustFooter />

      <footer className="border-t border-border/70 bg-[hsl(var(--brand-ink))] py-16 text-[hsl(var(--background))]">
        <div className="editorial-shell">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-white/10">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold tracking-[-0.04em]">Doctor.mx</span>
              </Link>
              <p className="text-sm leading-relaxed text-white/68">
                La plataforma de salud digital más confiable de México. Conectamos pacientes con los mejores especialistas certificados.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/80">
                <HeartHandshake className="h-3.5 w-3.5" />
                Confianza clínica + diseño premium
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Pacientes</h4>
              <ul className="space-y-2 text-sm text-white/68">
                <li><Link href="/doctors" className="hover:text-white transition-colors">Buscar doctores</Link></li>
                <li><Link href="/specialties" className="hover:text-white transition-colors">Especialidades</Link></li>
                <li><Link href="/app/second-opinion" className="hover:text-white transition-colors">Segunda opinión</Link></li>
                <li><Link href="/app" className="hover:text-white transition-colors">Mi cuenta</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Doctores</h4>
              <ul className="space-y-2 text-sm text-white/68">
                <li><Link href="/for-doctors" className="hover:text-white transition-colors">Únete como doctor</Link></li>
                <li><Link href="/doctor" className="hover:text-white transition-colors">Portal de doctores</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Planes y precios</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-white/68">
                <li><Link href="/help" className="hover:text-white transition-colors">Centro de ayuda</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-sm text-white/56">
              © {new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
