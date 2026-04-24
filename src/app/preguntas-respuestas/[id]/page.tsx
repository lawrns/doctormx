import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, MessageCircleQuestion, ShieldCheck, Stethoscope } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { QAPageSchema } from '@/components/StructuredData'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getPublicQuestionById, getPublicQuestions, incrementViewCount } from '@/lib/expert-questions'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const question = await getPublicQuestionById(id)

  if (!question) {
    return { title: 'Pregunta no encontrada | Doctor.mx' }
  }

  const title = `${question.question.slice(0, 78)} | Preguntas medicas Doctor.mx`
  const description = question.answers?.[0]?.answer?.slice(0, 155) || 'Respuesta revisada por especialistas verificados en Doctor.mx.'

  return {
    title,
    description,
    alternates: { canonical: `https://doctor.mx/preguntas-respuestas/${id}` },
    openGraph: {
      title,
      description,
      url: `https://doctor.mx/preguntas-respuestas/${id}`,
      type: 'article',
    },
  }
}

export default async function ExpertQuestionPage({ params }: PageProps) {
  const { id } = await params
  const question = await getPublicQuestionById(id)

  if (!question) {
    notFound()
  }

  await incrementViewCount(id)

  const primaryAnswer = question.answers?.[0]
  const related = question.specialty_id
    ? (await getPublicQuestions({ specialtyId: question.specialty_id, limit: 4 })).filter((item) => item.id !== question.id)
    : []

  return (
    <main className="min-h-screen bg-[hsl(var(--public-bg))]">
      <QAPageSchema
        questions={[
          {
            question: question.question,
            answer: primaryAnswer?.answer,
            author: primaryAnswer?.doctor?.full_name,
            dateAsked: question.created_at,
          },
        ]}
      />
      <Header />

      <section className="editorial-shell py-8 lg:py-10">
        <Link href="/preguntas-respuestas" className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--brand-ocean))]">
          <ArrowLeft className="h-4 w-4" />
          Volver a preguntas
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <article className="space-y-5">
            <Card className="surface-panel-strong p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {question.specialty ? <Badge variant="info">{question.specialty.name}</Badge> : null}
                <span className="text-xs font-medium text-[hsl(var(--public-muted))]">
                  Preguntado el {formatDate(question.created_at)}
                </span>
              </div>
              <h1 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-[hsl(var(--public-ink))] sm:text-3xl">
                {question.question}
              </h1>
              <p className="mt-4 text-sm leading-6 text-[hsl(var(--public-muted))]">
                Esta respuesta es orientativa y no sustituye una consulta medica. Si tienes signos de alarma, busca atencion inmediata.
              </p>
            </Card>

            <div className="space-y-4">
              {(question.answers || []).map((answer) => (
                <Card key={answer.id} className="surface-panel p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[hsl(var(--surface-tint))]">
                      {answer.doctor?.photo_url ? (
                        <Image
                          src={answer.doctor.photo_url}
                          alt={answer.doctor.full_name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-[hsl(var(--brand-ocean))]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[hsl(var(--public-ink))]">
                          {answer.doctor?.full_name || 'Medico verificado'}
                        </p>
                        <Badge variant="outline" className="normal-case tracking-normal">
                          Respuesta medica
                        </Badge>
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[hsl(var(--public-muted))]">
                        {answer.answer}
                      </p>
                      <p className="mt-4 text-xs font-medium text-[hsl(var(--public-muted))]">
                        Respondido el {formatDate(answer.created_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="surface-panel p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-[hsl(var(--public-ink))]">
                    Necesitas una valoracion?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                    Agenda con un medico verificado y lleva tu contexto desde el inicio.
                  </p>
                </div>
              </div>
              <Button asChild className="mt-4 w-full" variant="hero">
                <Link href={question.specialty?.slug ? `/doctors?specialty=${question.specialty.slug}` : '/doctors'}>
                  Ver medicos disponibles
                </Link>
              </Button>
            </Card>

            {related.length > 0 ? (
              <Card className="surface-panel p-5">
                <h2 className="font-display text-lg font-semibold text-[hsl(var(--public-ink))]">
                  Preguntas relacionadas
                </h2>
                <div className="mt-4 divide-y divide-[hsl(var(--public-border)/0.8)]">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/preguntas-respuestas/${item.id}`}
                      className="block py-3 text-sm font-medium leading-6 text-[hsl(var(--public-ink))] hover:text-[hsl(var(--brand-ocean))]"
                    >
                      {item.question}
                    </Link>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card className="surface-panel p-5">
              <div className="flex items-center gap-3 text-sm text-[hsl(var(--public-muted))]">
                <CalendarDays className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                <span>La respuesta no crea relacion medico-paciente ni reemplaza una consulta.</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-[hsl(var(--public-muted))]">
                <MessageCircleQuestion className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                <span>Las preguntas se moderan antes de publicarse.</span>
              </div>
            </Card>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  )
}
