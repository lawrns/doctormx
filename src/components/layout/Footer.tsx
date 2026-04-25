'use client'

import Link from 'next/link'
import { HeartHandshake } from 'lucide-react'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--foreground)/0.15)] bg-foreground text-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 inline-flex rounded-lg focus-visible:ring-2 focus-visible:ring-card focus-visible:ring-offset-2 focus-visible:ring-offset-foreground" aria-label="Doctor.mx - Inicio">
              <DoctorMxLogo inverted showDescriptor />
            </Link>
            <p className="text-sm leading-relaxed text-card/70 mb-4">
              Plataforma de salud digital construida para decidir con evidencia visible, no promesas infladas.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-card/10 bg-card/5 px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-card/80">
              <HeartHandshake className="h-3.5 w-3.5" />
              Confianza clínica
            </div>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em] text-card">
              Para pacientes
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/doctors"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Buscar doctores
                </Link>
              </li>
              <li>
                <Link
                  href="/specialties"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Especialidades
                </Link>
              </li>
              <li>
                <Link
                  href="/app/second-opinion"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Segunda opinión
                </Link>
              </li>
              <li>
                <Link
                  href="/consulta-online"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Videoconsulta
                </Link>
              </li>
            </ul>
          </div>

          {/* For Doctors */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em] text-card">
              Para doctores
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/for-doctors"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Únete a Doctor.mx
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link
                  href="/for-doctors"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Reclama tu perfil
                </Link>
              </li>
              <li>
                <Link
                  href="/for-doctors"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Leads para doctores
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em] text-card">
              Compañía
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/for-doctors"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Para doctores
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.08em] text-card">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/security"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Seguridad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Términos
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-card/60 transition-colors hover:text-card hover:underline hover:underline-offset-4"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-card/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-card/50">
              © {new Date().getFullYear()} Doctor.mx. Todos los derechos
              reservados.
            </p>
            <p className="text-sm text-card/50">
              Cédula, reseñas y seguridad visibles cuando el dato existe.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
