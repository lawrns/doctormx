import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageCircleQuestion, ShieldCheck } from 'lucide-react'
import { DoctorAnswerForm } from '@/components/doctor/DoctorAnswerForm'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getModerationQuestions } from '@/lib/expert-questions'

export default async function DoctorQuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/doctor/preguntas')
  }

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, status')
    .eq('id', user.id)
    .single()

  if (!doctor || doctor.status !== 'approved') {
    redirect('/doctor')
  }

  const questions = await getModerationQuestions({ status: 'approved', limit: 30 })

  return (
    <main className="min-h-screen bg-[hsl(var(--public-bg))] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="info">Enriquecimiento publico</Badge>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
              Preguntas para responder
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--public-muted))]">
              Responde preguntas aprobadas para ayudar a pacientes y enriquecer tu perfil medico con contenido propio.
            </p>
          </div>
          <Link href="/preguntas-respuestas" className="text-sm font-semibold text-[hsl(var(--brand-ocean))] hover:underline">
            Ver Q&A publico
          </Link>
        </div>

        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <MessageCircleQuestion className="h-5 w-5 text-[hsl(var(--brand-ocean))]" />
                <p className="text-sm text-[hsl(var(--public-muted))]">No hay preguntas aprobadas pendientes.</p>
              </div>
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id} className="surface-panel p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {question.specialty ? <Badge variant="outline">{question.specialty.name}</Badge> : null}
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--public-muted))]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Moderada
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-[hsl(var(--public-ink))]">
                  {question.question}
                </p>
                <div className="mt-4">
                  <DoctorAnswerForm questionId={question.id} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
