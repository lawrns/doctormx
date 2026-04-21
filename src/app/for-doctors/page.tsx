'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  PageHero,
  ChapterHeader,
  EditorialSection,
  HeroStat,
  SignatureCard,
  Eyebrow,
  ColorFeature,
} from '@/components/editorial'
import {
  CheckCircle,
  Users,
  Calendar,
  Video,
  CreditCard,
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
  Stethoscope,
} from 'lucide-react'

const benefits = [
  {
    icon: Users,
    title: 'Pacientes de todo México',
    description:
      'Tu perfil visible para miles de pacientes que buscan especialistas como tú. Verificación de cédula profesional incluida.',
  },
  {
    icon: Calendar,
    title: 'Agenda inteligente',
    description:
      'Sincronización con Google Calendar. Recordatorios automáticos por WhatsApp y email. Cero citas perdidas.',
  },
  {
    icon: Video,
    title: 'Telemedicina HD cifrada',
    description:
      'Videoconsultas con calidad profesional. Recetas digitales COFEPRIS. Expediente clínico integrado.',
  },
  {
    icon: CreditCard,
    title: 'Cobro directo a tu cuenta',
    description:
      'Pagos en 48 horas vía Stripe. Tarjetas, SPEI, y OXXO Pay. Tu dinero, sin intermediarios.',
  },
  {
    icon: TrendingUp,
    title: 'Analítica para crecer',
    description:
      'Métricas de tu práctica: pacientes nuevos, retención, ingresos mensuales, y referencias de IA.',
  },
  {
    icon: Shield,
    title: 'Cumplimiento garantizado',
    description:
      'Plataforma alineada con NOM y LFPDPPP. Cifrado end-to-end. Seguro de responsabilidad profesional.',
  },
]

const testimonials = [
  {
    name: 'Dr. Carlos Mendoza',
    specialty: 'Cardiólogo',
    location: 'Guadalajara',
    content:
      'Doctor.mx me permitió expandir mi práctica y llegar a pacientes que antes no podía atender. La plataforma es intuitiva y el soporte es excelente.',
  },
  {
    name: 'Dra. Ana López',
    specialty: 'Dermatóloga',
    location: 'CDMX',
    content:
      'Las videoconsultas transformaron mi práctica. Ahora atiendo pacientes de todo el país sin sacrificar la calidad de la atención.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ForDoctorsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ─── HERO ─── */}
      <div className="pt-24 md:pt-32 pb-16 md:pb-20">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <Eyebrow className="mb-8">Para médicos</Eyebrow>

          <div className="grid lg:grid-cols-2 gap-16 items-end">
            <div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95] mb-8">
                Más pacientes.
                <br />
                Menos{' '}
                <em className="font-serif font-normal">papeleo</em>.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10">
                La plataforma de telemedicina líder en México. Conecta con
                pacientes de todo el país, gestiona citas automáticamente, y
                recibe pagos seguros.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register?role=doctor">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-ink hover:bg-cobalt-800 text-white rounded-xl text-[15px] font-medium tracking-tight transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(15,37,95,0.35)]"
                  >
                    Registrarme gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/doctor/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 rounded-xl text-[15px] font-medium tracking-tight"
                  >
                    Ver planes y precios
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-vital" />
                  Sin costo de registro
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-vital" />
                  Cancela cuando quieras
                </span>
              </div>
            </div>

            {/* Feature card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-card rounded-3xl border border-border shadow-dx-1 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    AI.REFERRALS
                  </span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cobalt-600 to-cobalt-800 flex items-center justify-center mb-6">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  Videoconsultas HD
                </h3>
                <p className="text-muted-foreground mb-8">
                  Atiende pacientes desde cualquier lugar con calidad
                  profesional y cifrado end-to-end.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Grabación opcional',
                    'Chat integrado',
                    'Recetas digitales',
                    'Pagos seguros',
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-vital flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-border">
            {[
              { value: '500+', label: 'Doctores activos' },
              { value: '10,000+', label: 'Consultas realizadas' },
              { value: '98%', label: 'Satisfacción' },
              { value: '48h', label: 'Tiempo de pago' },
            ].map((s, i) => (
              <HeroStat key={i} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── CHAPTER 1: BENEFICIOS ─── */}
      <EditorialSection>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <ChapterHeader
            number="01"
            title="Todo lo que necesitas"
            lead="Herramientas profesionales diseñadas específicamente para médicos mexicanos."
          />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {benefits.map((b, i) => (
              <motion.div key={i} variants={item}>
                <SignatureCard>
                  <div className="w-10 h-10 rounded-xl bg-cobalt-800 flex items-center justify-center mb-5">
                    <b.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {b.description}
                  </p>
                </SignatureCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </EditorialSection>

      {/* ─── CHAPTER 2: TESTIMONIOS ─── */}
      <EditorialSection>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <ChapterHeader
            number="02"
            title="Lo que dicen nuestros doctores"
            lead="Médicos de todo México que ya crecen con Doctor.mx."
          />

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <SignatureCard className="h-full flex flex-col">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 text-amber fill-amber"
                      />
                    ))}
                  </div>
                  <p className="text-foreground italic leading-relaxed mb-8 flex-1">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cobalt-300 to-cobalt-800 flex items-center justify-center text-white font-display text-sm font-light">
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">
                        {t.name}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.specialty} · {t.location}
                      </p>
                    </div>
                  </div>
                </SignatureCard>
              </motion.div>
            ))}
          </div>
        </div>
      </EditorialSection>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28 bg-cobalt-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,102,245,0.25),transparent_50%)]" />
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <Eyebrow className="text-white/60 mb-6">Empezar es gratis</Eyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Tu práctica,{' '}
            <em className="font-serif font-normal">sin límites</em>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Crea tu perfil gratuito y comienza a recibir pacientes esta semana.
          </p>
          <Link href="/auth/register?role=doctor">
            <Button
              size="lg"
              className="h-14 px-10 bg-white text-cobalt-900 hover:bg-white/90 rounded-xl text-[15px] font-medium tracking-tight transition-all duration-200 hover:-translate-y-0.5"
            >
              Registrarme gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/50 text-sm mt-6 font-mono uppercase tracking-wider">
            Registro gratuito · Perfil listo en 10 minutos · Sin cuota mensual
            obligatoria
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
