import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { CheckCircle, XCircle, Zap, MessageCircle, Video, Shield, ArrowRight, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Doctor.mx: La Mejor Alternativa a Doctoralia para Médicos Mexicanos | Desde $499/mes',
  description: '¿Buscas una alternativa a Doctoralia para tu consultorio? Doctor.mx ofrece IA para notas clínicas, pacientes por WhatsApp y verificación SEP por una fracción del costo. Prueba 14 días gratis.',
  openGraph: {
    title: 'Doctor.mx: Alternativa a Doctoralia para Médicos Mexicanos',
    description: 'Perfil verificado, IA clínica, pacientes por WhatsApp y videoconsultas por $499/mes. 14 días gratis.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/alternativa-doctoralia',
  },
}

const comparisonRows = [
  { feature: 'Precio mensual', doctormx: '$499 MXN', doctoralia: '$2,400 MXN', doctormxWin: true },
  { feature: 'Verificación de cédula SEP', doctormx: 'Sí', doctoralia: 'No', doctormxWin: true },
  { feature: 'IA para notas clínicas (SOAP)', doctormx: 'Sí', doctoralia: 'No', doctormxWin: true },
  { feature: 'Pacientes por WhatsApp', doctormx: 'Sí', doctoralia: 'No', doctormxWin: true },
  { feature: 'Videoconsultas integradas', doctormx: 'Sí', doctoralia: 'Sí', doctormxWin: false },
  { feature: 'Periodo de prueba gratis', doctormx: '14 días sin tarjeta', doctoralia: 'No', doctormxWin: true },
  { feature: 'Expediente clínico electrónico', doctormx: 'Sí (con IA)', doctoralia: 'Básico', doctormxWin: true },
  { feature: 'Receta electrónica', doctormx: 'Sí', doctoralia: 'No', doctormxWin: true },
  { feature: 'Directorio SEO para pacientes', doctormx: 'Sí', doctoralia: 'Sí', doctormxWin: false },
  { feature: 'Widget de reserva para tu sitio', doctormx: 'Sí', doctoralia: 'Limitado', doctormxWin: true },
]

const testimonials = [
  {
    name: 'Dra. María García',
    specialty: 'Dermatóloga',
    city: 'CDMX',
    quote: 'Me cambié de Doctoralia a Doctor.mx hace 3 meses. La IA para notas clínicas me ahorra 2 horas al día. Mis pacientes agendas por WhatsApp y pago 5 veces menos.',
  },
  {
    name: 'Dr. Carlos Mendoza',
    specialty: 'Cardiólogo',
    city: 'Monterrey',
    quote: 'La verificación SEP le da confianza a mis pacientes. En Doctoralia pagaba $2,400 y no tenía ni la mitad de las funciones que tengo ahora.',
  },
  {
    name: 'Dr. Alejandro Ruiz',
    specialty: 'Médico General',
    city: 'Guadalajara',
    quote: 'Lo mejor es el widget de reservas en mi sitio web. Mis pacientes agenda directamente sin salir de mi página. Y el precio es justo.',
  },
]

const faqs = [
  {
    q: '¿Por qué Doctor.mx es más barato que Doctoralia?',
    a: 'Doctor.mx está enfocado en médicos mexicanos. No gastamos en marketing masivo internacional ni en oficinas en 20 países. Invertimos en tecnología que te ayuda a ti: IA para notas clínicas, recepción por WhatsApp y expediente electrónico.',
  },
  {
    q: '¿Puedo migrar mis reseñas de Doctoralia a Doctor.mx?',
    a: 'Sí. Nuestro equipo te ayuda a migrar tu perfil, incluyendo reseñas verificadas, fotos y datos de contacto. El proceso toma menos de 48 horas.',
  },
  {
    q: '¿Cómo funciona la verificación de cédula SEP?',
    a: 'Verificamos tu cédula profesional directamente contra la base de datos de la SEP. Una vez verificada, tu perfil muestra una insignia de verificación que genera confianza en los pacientes.',
  },
  {
    q: '¿Qué incluye la prueba gratuita de 14 días?',
    a: 'Incluye todas las funciones: perfil verificado, IA para notas SOAP, recepción WhatsApp, videoconsultas, expediente electrónico y recetas digitales. Sin tarjeta de crédito.',
  },
  {
    q: '¿Doctor.mx reemplaza completamente a Doctoralia?',
    a: 'Para la mayoría de los médicos mexicanos, sí. Doctor.mx ofrece más funciones a menor costo, con tecnología diseñada específicamente para el sistema de salud mexicano.',
  },
]

export default function AlternativaDoctoraliaPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Header />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="editorial-shell py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="info" className="mb-4">Comparativa 2026</Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Doctor.mx: La mejor alternativa a Doctoralia para médicos mexicanos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Perfil verificado, IA para notas clínicas, pacientes por WhatsApp y videoconsultas. Todo por $499/mes en lugar de $2,400.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/connect">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Prueba Doctor.mx gratis por 14 días
                </Button>
              </Link>
              <Link href="#comparativa">
                <Button variant="secondary" size="lg">
                  Ver comparativa completa
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Sin tarjeta de crédito • Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparativa" className="editorial-shell py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Comparativa</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
              Doctor.mx vs Doctoralia
            </h2>
            <p className="mt-2 text-muted-foreground">Comparación objetiva de características y precios</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Característica</th>
                  <th className="px-6 py-4 text-center font-semibold text-primary">
                    <Zap className="w-4 h-4 inline mr-1" />
                    Doctor.mx
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Doctoralia</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{row.feature}</td>
                    <td className={`px-6 py-4 text-center ${row.feature === 'Precio mensual' ? 'text-lg font-bold text-primary' : ''}`}>
                      {row.doctormxWin ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <CheckCircle className="w-4 h-4" />
                          {row.doctormx}
                        </span>
                      ) : (
                        <span className="text-foreground">{row.doctormx}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {!row.doctormxWin && row.feature !== 'Videoconsultas integradas' ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <XCircle className="w-4 h-4" />
                          {row.doctoralia}
                        </span>
                      ) : (
                        row.doctoralia
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <Link href="/connect">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Crear perfil verificado gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="bg-card border-y border-border py-12 md:py-16">
        <div className="editorial-shell">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground">
              ¿Por qué los médicos eligen Doctor.mx?
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                { icon: <Zap className="w-6 h-6" />, title: 'IA para notas SOAP', desc: 'El asistente de IA genera notas clínicas en segundos. Dedica más tiempo a tus pacientes y menos al papeleo.' },
                { icon: <MessageCircle className="w-6 h-6" />, title: 'Pacientes por WhatsApp', desc: 'Tus pacientes te contactan por WhatsApp. Recibe consultas, agenda citas y envía recetas desde un solo lugar.' },
                { icon: <Video className="w-6 h-6" />, title: 'Videoconsultas integradas', desc: 'Videollamadas seguras y encriptadas directamente desde la plataforma. Sin necesidad de Zoom o Meet.' },
                { icon: <Shield className="w-6 h-6" />, title: 'Verificación SEP', desc: 'Tu cédula profesional verificada por la SEP visible en tu perfil. Genera confianza inmediata en tus pacientes.' },
              ].map((item, i) => (
                <Card key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="editorial-shell py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Testimonios</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
              Médicos que ya hicieron el cambio
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card key={i}>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.specialty} · {t.city}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card border-y border-border py-12 md:py-16">
        <div className="editorial-shell">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">FAQ</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                Preguntas frecuentes
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="p-6">
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink py-12 md:py-16">
        <div className="editorial-shell">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-primary-foreground">
              ¿Listo para cambiar a una plataforma hecha para médicos mexicanos?
            </h2>
            <p className="mt-4 text-primary-foreground/70">
              Únete a cientos de médicos que ya redujeron sus costos y aumentaron sus pacientes con Doctor.mx.
            </p>
            <div className="mt-8">
              <Link
                href="/connect"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-foreground px-6 text-sm font-semibold text-ink transition-transform active:scale-[0.98] hover:bg-primary-foreground/90"
              >
                Prueba Doctor.mx gratis por 14 días
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/50">Desde $499 MXN/mes • Sin compromiso • Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Doctor.mx',
            applicationCategory: 'MedicalApplication',
            description: 'Plataforma para médicos mexicanos con perfil verificado, IA para notas clínicas, pacientes por WhatsApp y videoconsultas.',
            offers: {
              '@type': 'Offer',
              price: '499',
              priceCurrency: 'MXN',
              description: 'Plan mensual para médicos',
            },
          }),
        }}
      />

      <Footer />
    </div>
  )
}
