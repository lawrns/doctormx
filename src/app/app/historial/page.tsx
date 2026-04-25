import { requireRole } from '@/lib/auth'
import { PatientShell } from '@/components/PatientShell'
import { getPatientConsultationHistory, getPatientPrescriptions, type ConsultationRecord, type PrescriptionRecord } from '@/lib/patient-records'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/editorial'
import { Calendar, Stethoscope, FileText, Pill, ChevronRight, User, Video, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function HistorialPage() {
  const { user, profile } = await requireRole('patient')
  const consultations = await getPatientConsultationHistory(user.id)
  const prescriptions = await getPatientPrescriptions(user.id)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'default' | 'info' | 'secondary'> = {
      completed: 'info',
      confirmed: 'default',
    }
    return map[status] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      completed: 'Completada',
      confirmed: 'Confirmada',
    }
    return map[status] || status
  }

  return (
    <PatientShell profile={{ full_name: profile.full_name }} currentPath="/app/historial">
      <div className="space-y-8">
        <div>
          <Eyebrow className="mb-2">Historial medico</Eyebrow>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Tus consultas y recetas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Accede a tu historial completo de consultas, diagnosticos y recetas.
          </p>
        </div>

        {/* Consultations */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Consultas</h2>
            <span className="text-sm text-muted-foreground">({consultations.length})</span>
          </div>

          {consultations.length === 0 ? (
            <Card className="rounded-2xl border border-border">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aun no tienes consultas registradas.</p>
                <Link href="/doctors">
                  <Button variant="outline">
                    Buscar doctor
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation: ConsultationRecord) => (
                <Card key={consultation.id} className="rounded-2xl border border-border overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-foreground truncate">
                            {consultation.doctorName}
                          </p>
                          {consultation.doctorSpecialty && (
                            <p className="text-sm text-muted-foreground">{consultation.doctorSpecialty}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(consultation.date)}
                            </span>
                            {consultation.appointmentType === 'video' && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                Videoconsulta
                              </span>
                            )}
                            {consultation.appointmentType === 'in_person' && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Presencial
                              </span>
                            )}
                            <Badge variant={getStatusBadge(consultation.status)}>
                              {getStatusLabel(consultation.status)}
                            </Badge>
                          </div>

                          {/* Reason for visit / diagnosis */}
                          {consultation.reasonForVisit && (
                            <p className="mt-2 text-sm text-foreground line-clamp-2">
                              <span className="font-medium">Motivo: </span>
                              {consultation.reasonForVisit}
                            </p>
                          )}

                          {/* SOAP summary if available */}
                          {consultation.patientSummary && (
                            <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Resumen medico
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {consultation.patientSummary}
                              </p>
                            </div>
                          )}

                          {/* SOAP assessment if available */}
                          {!consultation.patientSummary && consultation.soapAssessment && (
                            <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Diagnostico
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {consultation.soapAssessment}
                              </p>
                            </div>
                          )}

                          {/* SOAP plan */}
                          {consultation.soapPlan && (
                            <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Plan de tratamiento
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {consultation.soapPlan}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Link href={`/app/appointments/${consultation.id}`} className="flex-shrink-0">
                        <Button variant="ghost" size="sm" className="gap-1">
                          Ver consulta
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pill className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Recetas</h2>
            <span className="text-sm text-muted-foreground">({prescriptions.length})</span>
          </div>

          {prescriptions.length === 0 ? (
            <Card className="rounded-2xl border border-border">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes recetas registradas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((rx: PrescriptionRecord) => (
                <Card key={rx.id} className="rounded-2xl border border-border overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-foreground">
                            Receta de {rx.doctorName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(rx.createdAt)}
                          </p>

                          {rx.medications.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {rx.medications.map((med, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-xl bg-secondary/50 border border-border"
                                >
                                  <p className="text-sm font-medium text-foreground">{med.name}</p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                    {med.dosage && <span>Dosis: {med.dosage}</span>}
                                    {med.frequency && <span>Frecuencia: {med.frequency}</span>}
                                    {med.duration && <span>Duracion: {med.duration}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {rx.instructions && (
                            <p className="mt-3 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Instrucciones: </span>
                              {rx.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                      {rx.pdfUrl && (
                        <a
                          href={rx.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button variant="outline" size="sm" className="gap-1">
                            <FileText className="w-4 h-4" />
                            Ver PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientShell>
  )
}
