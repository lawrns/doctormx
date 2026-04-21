'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  PageHero,
  ChapterHeader,
  EditorialSection,
  HeroStat,
  SignatureCard,
  ColorFeature,
  Eyebrow,
} from '@/components/editorial'
import {
  Shield,
  Heart,
  Stethoscope,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Activity,
  Award,
} from 'lucide-react'

const team = [
  {
    name: 'Dra. Ana María García',
    role: 'Directora Médica & Co-fundadora',
    credentials: 'MD, MPH',
    bio: '15+ años de práctica clínica e innovación en tecnología médica. Ex Directora Médica en HealthTech MX.',
    education: 'UNAM · Harvard MPH',
  },
  {
    name: 'Dr. Carlos Rodríguez',
    role: 'Director de Operaciones Clínicas',
    credentials: 'MD, MBA',
    bio: 'Lidera nuestras iniciativas de calidad clínica y expansión de la red médica.',
    education: 'Tec de Monterrey · IPADE MBA',
  },
  {
    name: 'Dra. Sofía Hernández',
    role: 'Directora de Tecnología',
    credentials: 'PhD Computer Science',
    bio: 'Pionera en aplicaciones de IA en salud con 10+ años en desarrollo de software médico.',
    education: 'MIT · Stanford PhD',
  },
  {
    name: 'Dr. Miguel Ángel López',
    role: 'Presidente del Consejo Médico',
    credentials: 'MD, FACC',
    bio: 'Cardiólogo de renombre que guía nuestra gobernanza clínica y estándares de calidad.',
    education: 'UNAM · Mayo Clinic Fellowship',
  },
]

const advisors = [
  {
    name: 'Dra. Patricia Morales',
    title: 'Experta en Política de Salud',
    credentials: 'MD, Políticas de Salud',
    expertise: 'Regulación de salud digital',
  },
  {
    name: 'Dr. Roberto Sánchez',
    title: 'Defensor de la Seguridad del Paciente',
    credentials: 'MD, Mejora de Calidad',
    expertise: 'Sistemas de calidad clínica',
  },
  {
    name: 'Dra. Laura Jiménez',
    title: 'Especialista en Telemedicina',
    credentials: 'MD, Telehealth',
    expertise: 'Entrega de atención virtual',
  },
]

const certifications = [
  { name: 'COFEPRIS', desc: 'Registro sanitario', icon: Shield },
  { name: 'HIPAA', desc: 'Cumplimiento de privacidad', icon: Activity },
  { name: 'ISO 27001', desc: 'Seguridad de la información', icon: Award },
  { name: 'Cifrado E2E', desc: 'Protección de datos', icon: CheckCircle },
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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ─── HERO ─── */}
      <PageHero
        eyebrow="Nosotros"
        title={
          <>
            Redefiniendo la{' '}
            <em className="font-serif font-normal">atención médica</em> en México
          </>
        }
        lead="Conectamos a pacientes con doctores verificados a través de una plataforma segura, moderna y centrada en la confianza."
        stats={[
          { value: '3,742+', label: 'Doctores verificados' },
          { value: '50,000+', label: 'Pacientes atendidos' },
          { value: '150+', label: 'Ciudades cubiertas' },
        ]}
      />

      {/* ─── CHAPTER 1: NUESTRA MISIÓN ─── */}
      <EditorialSection>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <ChapterHeader
            number="01"
            title="Nuestra misión"
            lead="Hacer que la atención médica de calidad sea accesible para cada persona en México."
          />

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <ColorFeature
              variant="cobalt"
              label="Propósito"
              title={
                <>
                  Salud sin{' '}
                  <em className="font-serif font-normal">barreras</em>
                </>
              }
              value="Conectamos al doctor indicado en el momento correcto."
            />
            <ColorFeature
              variant="vital"
              label="Impacto"
              title="100,000+"
              value="Consultas realizadas a través de la plataforma"
            />
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Heart,
                title: 'Primero el paciente',
                body: 'Cada decisión prioriza la seguridad, privacidad y calidad clínica.',
              },
              {
                icon: Stethoscope,
                title: 'Impulso al médico',
                body: 'Herramientas para crecer la práctica y atender mejor a más pacientes.',
              },
              {
                icon: Shield,
                title: 'Confianza verificada',
                body: 'Cada doctor es verificado. Cada consulta está protegida.',
              },
            ].map((m, i) => (
              <motion.div key={i} variants={item}>
                <SignatureCard>
                  <m.icon className="w-6 h-6 text-cobalt-700 mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {m.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {m.body}
                  </p>
                </SignatureCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </EditorialSection>

      {/* ─── CHAPTER 2: EQUIPO LÍDER ─── */}
      <EditorialSection>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <ChapterHeader
            number="02"
            title="Equipo líder"
            lead="Profesionales de salud y tecnología enfocados en elevar el estándar de la atención médica digital en México."
          />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {team.map((member, i) => (
              <motion.div key={i} variants={item}>
                <SignatureCard>
                  <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cobalt-300 to-cobalt-800 flex items-center justify-center flex-shrink-0 text-white font-display text-xl font-light">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-sm text-cobalt-700 mb-1.5">
                        {member.role}
                      </p>
                      <Badge
                        variant="outline"
                        className="font-mono text-[9px] uppercase tracking-wider mb-3"
                      >
                        {member.credentials}
                      </Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {member.bio}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                        {member.education}
                      </p>
                    </div>
                  </div>
                </SignatureCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </EditorialSection>

      {/* ─── CHAPTER 3: CONSEJO MÉDICO ─── */}
      <EditorialSection>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <ChapterHeader
            number="03"
            title="Consejo médico asesor"
            lead="Especialistas que supervisan nuestros estándares clínicos, de seguridad y de calidad asistencial."
          />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {advisors.map((advisor, i) => (
              <motion.div key={i} variants={item}>
                <SignatureCard className="text-center">
                  <div className="w-14 h-14 rounded-full bg-cobalt-800 flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                    {advisor.name}
                  </h3>
                  <p className="text-sm text-cobalt-700 mb-2">
                    {advisor.title}
                  </p>
                  <Badge
                    variant="outline"
                    className="font-mono text-[9px] uppercase tracking-wider mb-3"
                  >
                    {advisor.credentials}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {advisor.expertise}
                  </p>
                </SignatureCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </EditorialSection>

      {/* ─── CHAPTER 4: CERTIFICACIONES ─── */}
      <EditorialSection>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <ChapterHeader
            number="04"
            title="Certificaciones y cumplimiento"
            lead="Operamos con los más altos estándares de seguridad, privacidad y calidad en salud digital."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-vital-soft flex items-center justify-center mx-auto mb-4">
                  <cert.icon className="w-7 h-7 text-vital" />
                </div>
                <p className="font-display text-lg font-semibold text-foreground mb-0.5">
                  {cert.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {cert.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </EditorialSection>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28 bg-cobalt-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,102,245,0.25),transparent_50%)]" />
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <Eyebrow className="text-white/60 mb-6">Únete</Eyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Construyamos una mejor experiencia de{' '}
            <em className="font-serif font-normal">salud</em>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Ya sea que busques atención médica o quieras crecer tu práctica, Doctor.mx te acompaña.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/doctors">
              <Button
                size="lg"
                className="h-14 px-8 bg-white text-cobalt-900 hover:bg-white/90 rounded-xl text-[15px] font-medium tracking-tight"
              >
                Reservar una consulta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/for-doctors">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 border-white/30 text-white hover:bg-white/10 rounded-xl text-[15px] font-medium tracking-tight"
              >
                Unirme a la red médica
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
