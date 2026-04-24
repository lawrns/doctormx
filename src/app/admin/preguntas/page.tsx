import { redirect } from 'next/navigation'
import { QuestionModerationActions } from '@/components/admin/QuestionModerationActions'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getModerationQuestions } from '@/lib/expert-questions'

export default async function AdminQuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/preguntas')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const questions = await getModerationQuestions({ status: 'pending', limit: 50 })

  return (
    <main className="min-h-screen bg-[hsl(var(--public-bg))] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Badge variant="warning">Moderacion</Badge>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
          Preguntas pendientes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--public-muted))]">
          Aprueba solo preguntas generales, sin urgencias ni datos personales sensibles. Las respuestas las publican medicos verificados.
        </p>

        <div className="mt-6 space-y-4">
          {questions.length === 0 ? (
            <Card className="surface-panel p-6">
              <p className="text-sm text-[hsl(var(--public-muted))]">No hay preguntas pendientes.</p>
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id} className="surface-panel p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {question.specialty ? <Badge variant="outline">{question.specialty.name}</Badge> : null}
                  <Badge variant="warning">Pendiente</Badge>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-[hsl(var(--public-ink))]">
                  {question.question}
                </p>
                <div className="mt-4">
                  <QuestionModerationActions questionId={question.id} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
