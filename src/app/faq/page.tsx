import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import {
  MessageSquare,
  ShieldCheck,
  Lock,
  Calendar,
  Video,
  CreditCard,
  User,
  ChevronDown,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | Doctor.mx',
  description:
    'Resuelve tus dudas sobre Doctor.mx. Opiniones, verificacion, privacidad, reservas, consultas en linea, pagos y cuenta.',
  openGraph: {
    title: 'Preguntas Frecuentes | Doctor.mx',
    description: 'Resuelve tus dudas sobre Doctor.mx.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/faq',
  },
}

type FAQItem = {
  question: string
  answer: string
}

type FAQSection = {
  title: string
  icon: React.ReactNode
  items: FAQItem[]
}

const faqSections: FAQSection[] = [
  {
    title: 'Opiniones y resenas',
    icon: <MessageSquare className="h-5 w-5" />,
    items: [
      {
        question: 'Como puedo dejar una resena de un doctor?',
        answer:
          'Despues de tu consulta, recibiras un enlace para calificar al doctor. Puedes asignar de 1 a 5 estrellas y escribir un comentario sobre tu experiencia. Las resenas son anonimas y se publican despues de una revision automatica.',
      },
      {
        question: 'Como moderan las resenas?',
        answer:
          'Todas las resenas pasan por un sistema de moderacion automatica que detecta contenido ofensivo, spam o informacion falsa. Las resenas que no cumplen nuestras normas son eliminadas. Los doctores pueden responder a las resenas pero no pueden eliminarlas.',
      },
      {
        question: 'Como reporto una resena falsa o inapropiada?',
        answer:
          'Puedes reportar cualquier resena haciendo clic en el boton de reporte que aparece junto a cada opinion. Nuestro equipo revisara el reporte en un plazo de 48 horas y tomara las medidas correspondientes.',
      },
    ],
  },
  {
    title: 'Perfil y verificacion',
    icon: <ShieldCheck className="h-5 w-5" />,
    items: [
      {
        question: 'Como verifican los perfiles de los doctores?',
        answer:
          'Verificamos la cedula profesional de cada doctor a traves del sistema de la Direccion General de Profesiones de la SEP. Tambien verificamos titulos universitarios, certificaciones de especialidad y referencias profesionales.',
      },
      {
        question: 'Cual es el proceso de verificacion de cedula?',
        answer:
          'El doctor proporciona su numero de cedula profesional durante el registro. Nuestro equipo valida este numero contra la base de datos oficial de la SEP. El proceso toma entre 24 y 72 horas habiles. Solo los doctores con cedula verificada pueden recibir pacientes.',
      },
      {
        question: 'Que significa el badge "Verificado"?',
        answer:
          'El badge de verificacion indica que la cedula profesional del doctor ha sido validada con la SEP, que su perfil esta completo con informacion actualizada y que cumple con nuestros estandares de calidad.',
      },
    ],
  },
  {
    title: 'Privacidad y seguridad',
    icon: <Lock className="h-5 w-5" />,
    items: [
      {
        question: 'Como protegen mis datos personales?',
        answer:
          'Utilizamos encriptacion de extremo a extremo para toda la informacion medica. Nuestros servidores estan protegidos con los estandares mas altos de seguridad. Solo el doctor asignado puede acceder a tu historial medico.',
      },
      {
        question: 'Cumplen con la LFPDPPP?',
        answer:
          'Si, cumplimos con la Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares (LFPDPPP). Puedes ejercer tus derechos ARCO (Acceso, Rectificacion, Cancelacion y Oposicion) en cualquier momento contactando a nuestro equipo de privacidad.',
      },
      {
        question: 'Las consultas en linea son seguras?',
        answer:
          'Las videoconsultas utilizan encriptacion de nivel hospitalario (AES-256). Las notas medicas y recetas se almacenan en servidores certificados HIPAA. Nunca compartimos tu informacion con terceros sin tu consentimiento explicito.',
      },
    ],
  },
  {
    title: 'Reserva de citas',
    icon: <Calendar className="h-5 w-5" />,
    items: [
      {
        question: 'Como agenda una cita?',
        answer:
          'Busca al doctor por especialidad o nombre, selecciona el horario disponible que te convenga, elige el tipo de consulta (presencial o videoconsulta) y completa el pago. Recibiras una confirmacion por correo y WhatsApp.',
      },
      {
        question: 'Cual es la politica de cancelacion?',
        answer:
          'Puedes cancelar o reprogramar tu cita hasta 2 horas antes de la hora programada sin costo. Las cancelaciones con menos de 2 horas de anticipacion tienen un cargo del 50%. Si el doctor cancela, se te reembolsa el 100%.',
      },
      {
        question: 'Que metodos de pago aceptan?',
        answer:
          'Aceptamos tarjetas de credito y debito (Visa, Mastercard, American Express), transferencia SPEI, pago en tiendas OXXO, y PayPal. Todos los pagos son procesados de forma segura.',
      },
    ],
  },
  {
    title: 'Consulta en linea',
    icon: <Video className="h-5 w-5" />,
    items: [
      {
        question: 'Como funciona la videoconsulta?',
        answer:
          'En el horario de tu cita, accede a la sala de videoconsulta desde tu navegador o app. El doctor se conectara y realizara la consulta por video. Al finalizar, recibiras notas medicas y recetas digitales en tu perfil.',
      },
      {
        question: 'Que necesito para una consulta en linea?',
        answer:
          'Necesitas un dispositivo con camara y microfono (computadora, tablet o celular), conexion a internet estable (minimo 2 Mbps), y un navegador actualizado. No necesitas descargar ningun software adicional.',
      },
      {
        question: 'Puedo elegir entre video, chat o llamada?',
        answer:
          'Si, al agendar puedes elegir la modalidad que prefieras. Algunos doctores ofrecen las tres modalidades y otros solo algunas. La modalidad seleccionada se indica claramente en el perfil del doctor.',
      },
    ],
  },
  {
    title: 'Pagos',
    icon: <CreditCard className="h-5 w-5" />,
    items: [
      {
        question: 'Puedo pagar en OXXO?',
        answer:
          'Si, al seleccionar el metodo de pago elige "Pago en tienda". Se generara un codigo de barras que puedes llevar a cualquier tienda OXXO. El pago se refleja en un plazo maximo de 24 horas.',
      },
      {
        question: 'Como funciona el pago por SPEI?',
        answer:
          'Selecciona "Transferencia bancaria" y se generara una CLABE interbancaria unica para tu cita. Tienes 24 horas para completar la transferencia desde tu banco. Una vez confirmado el pago, tu cita queda agendada.',
      },
      {
        question: 'Cual es la politica de reembolso?',
        answer:
          'Si el doctor no se presenta a la consulta, recibes el 100% de reembolso. Para cancelaciones con mas de 2 horas de anticipacion, el reembolso es completo. Los reembolsos se procesan en 3-5 dias habiles al metodo de pago original.',
      },
    ],
  },
  {
    title: 'Mi cuenta',
    icon: <User className="h-5 w-5" />,
    items: [
      {
        question: 'Como edito mi perfil?',
        answer:
          'Accede a tu perfil desde el menu de usuario. Puedes actualizar tu nombre, numero de telefono, foto de perfil y preferencias de notificacion. Los cambios se guardan automaticamente.',
      },
      {
        question: 'Como elimino mi cuenta?',
        answer:
          'Puedes solicitar la eliminacion de tu cuenta desde Configuracion > Privacidad > Eliminar cuenta. Tus datos medicos se retienen por 5 anos segun lo exige la normatividad mexicana. Los datos no medicos se eliminan en 30 dias.',
      },
      {
        question: 'Puedo tener cuentas de paciente y doctor?',
        answer:
          'Si, puedes tener ambas cuentas asociadas al mismo correo electronico. Sin embargo, necesitas completar el proceso de verificacion profesional para la cuenta de doctor, incluyendo la validacion de tu cedula profesional.',
      },
    ],
  },
]

function FAQAccordion({ section }: { section: FAQSection }) {
  return (
    <Card className="bg-card rounded-2xl border border-border shadow-dx-1 overflow-hidden">
      <div className="border-b border-border/70 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {section.icon}
          </div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
            {section.title}
          </h2>
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {section.items.map((item, index) => (
          <details key={index} className="group">
            <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-foreground hover:bg-accent transition-colors">
              <span className="font-medium pr-4">{item.question}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </Card>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="editorial-shell py-8 sm:py-10 lg:py-12">
        {/* Hero */}
        <section className="bg-card rounded-2xl border border-border shadow-dx-1 overflow-hidden sm:px-8 lg:px-10 lg:py-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="luxe">Centro de ayuda</Badge>
            <PublicSectionHeading
              eyebrow="Preguntas frecuentes"
              title="Resolvemos tus dudas"
              description="Encuentra respuestas a las preguntas mas comunes sobre Doctor.mx, desde como agendar citas hasta la proteccion de tus datos."
            />
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="mt-8 max-w-3xl mx-auto space-y-6">
          {faqSections.map((section, index) => (
            <FAQAccordion key={index} section={section} />
          ))}
        </section>

        {/* Still have questions CTA */}
        <section className="mt-12 text-center">
          <Card className="bg-card rounded-2xl border border-border shadow-dx-1 inline-block p-8 sm:p-10">
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
              No encontraste tu respuesta?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Nuestro equipo de soporte esta disponible para ayudarte.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/contact">
                <Button variant="hero">Contactar soporte</Button>
              </Link>
              <Link href="/app/ai-consulta">
                <Button variant="outline">Preguntar a Dr. Simeon IA</Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      {/* Structured Data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqSections.flatMap((section) =>
              section.items.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              }))
            ),
          }),
        }}
      />
    </div>
  )
}
