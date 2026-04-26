import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { MessageCircleQuestion, ShieldCheck } from 'lucide-react'
import { DoctorAnswerForm } from '@/components/doctor/DoctorAnswerForm'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import DoctorLayout from '@/components/DoctorLayout'
import { getModerationQuestions } from '@/lib/expert-questions'

export default async function DoctorQuestionsPage() {
  const { user, profile } = await requireRole('doctor')
  const questions = await getModerationQuestions({ status: 'approved', limit: 30 })

  return (
    <DoctorLayout profile={profile} isPending={false} currentPath="/doctor/preguntas">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="info">Enriquecimiento público</Badge>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
            Preguntas para responder
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Responde preguntas aprobadas para ayudar a pacientes y enriquecer tu perfil médico con contenido propio.
          </p>
        </div>
        <Link href="/preguntas-respuestas" className="text-sm font-semibold text-[hsl(var(--interactive))] hover:underline">
          Ver Q&A público
        </Link>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="p-[var(--space-4)]">
            <div className="flex items-center gap-3">
              <MessageCircleQuestion className="h-5 w-5 text-[hsl(var(--interactive))]" />
              <p className="text-sm text-muted-foreground">No hay preguntas aprobadas pendientes.</p>
            </div>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="p-[var(--space-4)]">
              <div className="flex flex-wrap items-center gap-2">
                {question.specialty ? <Badge variant="outline">{question.specialty.name}</Badge> : null}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Moderada
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-foreground">
                {question.question}
              </p>
              <div className="mt-4">
                <DoctorAnswerForm questionId={question.id} />
              </div>
            </Card>
          ))
        )}
      </div>
    </DoctorLayout>
  )
}
