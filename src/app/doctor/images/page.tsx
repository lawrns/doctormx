import { requireRole } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import DoctorLayout from '@/components/DoctorLayout'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { getImageTypeLabel, getStatusLabel } from '@/lib/ai/vision'
import type { AnalysisStatus, ImageType } from '@/lib/ai/vision'

type AnalysisRow = {
  id: string
  image_url: string
  image_type: ImageType
  status: AnalysisStatus
  patient_id: string
  patient_notes: string | null
  created_at: string
}

export default async function DoctorImagesPage() {
  const { user, profile, supabase } = await requireRole('doctor')

  let analyses: AnalysisRow[] = []
  try {
    const { data } = await supabase
      .from('medical_image_analyses')
      .select('id, image_url, image_type, status, patient_id, patient_notes, created_at')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })
    analyses = (data || []) as AnalysisRow[]
  } catch (err) {
    console.error('Failed to load image analyses:', err)
  }

  return (
    <DoctorLayout profile={profile!} isPending={false} currentPath="/doctor/images">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Análisis de imágenes</h1>
        <p className="text-muted-foreground">Revisa los análisis de imágenes solicitados por tus pacientes.</p>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          iconName="image"
          title="No hay análisis de imágenes"
          description="Los análisis de imágenes aparecerán aquí cuando los pacientes los soliciten."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`/doctor/images/${analysis.id}`}
              className="group rounded-lg border bg-card shadow-sm transition-colors hover:border-primary/30 overflow-hidden"
            >
              <div className="relative aspect-video bg-muted">
                {analysis.image_url ? (
                  <Image
                    src={analysis.image_url}
                    alt="Imagen médica"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{getImageTypeLabel(analysis.image_type)}</Badge>
                  <Badge
                    variant={
                      analysis.status === 'completed' || analysis.status === 'reviewed'
                        ? 'success'
                        : analysis.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {getStatusLabel(analysis.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {analysis.patient_notes || 'Sin notas del paciente'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(analysis.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DoctorLayout>
  )
}
