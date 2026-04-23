'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Stethoscope,
  Star,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ConsensusResult } from '@/lib/soap/types';
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  priceCents: number;
  city: string;
  state: string;
  nextAvailable: string | null;
  videoConsultation: boolean;
  verified: boolean;
}

interface RecommendedDoctorsProps {
  consultationId: string;
  consensus: ConsensusResult;
  patientHistory?: Record<string, unknown>;
  onSelectDoctor: (doctorId: string) => void;
}

function getPrimaryDiagnosisName(consensus: ConsensusResult): string {
  return consensus.primaryDiagnosis?.name || 'medicina general';
}

export function RecommendedDoctors({
  consultationId,
  consensus,
  patientHistory,
  onSelectDoctor,
}: RecommendedDoctorsProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const primaryDiagnosisName = getPrimaryDiagnosisName(consensus);
  const specialty = mapDiagnosisToSpecialty(primaryDiagnosisName);
  const patientHistorySignature = JSON.stringify(patientHistory || {});

  useEffect(() => {
    let cancelled = false;

    const fetchRecommendedDoctors = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/directory/recommended', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            specialty,
            urgencyLevel: consensus.urgencyLevel || 'routine',
            consultationId,
            patientHistory: patientHistory || {},
            limit: 3,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommended doctors');
        }

        const data = await response.json();
        if (!cancelled) {
          setDoctors(data.doctors || []);
        }
      } catch (err) {
        console.error('Error fetching recommended doctors:', err);
        if (!cancelled) {
          setError('No pudimos cargar la lista de especialistas');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchRecommendedDoctors();

      return () => {
      cancelled = true;
    };
  }, [consultationId, consensus.urgencyLevel, patientHistorySignature, specialty]);

  if (loading) {
    return (
      <Card className="rounded-xl border-border/70 shadow-sm">
        <div className="space-y-4 p-5 md:p-6">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Preparando especialistas
              </h3>
              <p className="text-sm text-muted-foreground">
                Buscando opciones que encajen con la orientación clínica.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/70 bg-muted/30 p-4"
                aria-hidden="true"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded-full bg-muted" />
                    <div className="h-3 w-24 rounded-full bg-muted" />
                    <div className="h-3 w-full rounded-full bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error || doctors.length === 0) {
    return (
      <Card className="rounded-xl border-border/70 shadow-sm">
        <div className="p-5 md:p-6">
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {error || 'No hay especialistas disponibles por ahora'}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Puedes continuar con la orientación clínica y volver a esta vista después.
            </p>
            <Link
              href="/doctors"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Ver todos los médicos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Stethoscope className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Siguiente paso clínico
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Basado en <span className="font-medium text-foreground">{primaryDiagnosisName}</span>, estas opciones están mejor alineadas con el caso.
          </p>
          {consensus.urgencyLevel === 'urgent' ? (
            <p className="flex items-center gap-1 text-xs text-amber-700">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Recomendamos atención dentro de las próximas 24-48 horas
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {doctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25, ease: 'easeOut' }}
          >
            <DoctorCard
              doctor={doctor}
              consultationId={consultationId}
              onSelect={() => onSelectDoctor(doctor.id)}
              priority={index === 0}
            />
          </motion.div>
        ))}
      </div>

      <div className="pt-1">
        <Link
          href={`/doctors?specialty=${specialty}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Ver más especialistas en {specialty}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function DoctorCard({
  doctor,
  consultationId,
  onSelect,
  priority,
}: {
  doctor: Doctor;
  consultationId: string;
  onSelect: () => void;
  priority: boolean;
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden rounded-xl border-border/70 shadow-sm transition-shadow hover:shadow-md',
        priority && 'border-primary/20 bg-primary/5'
      )}
    >
      <div className="p-4 md:p-5">
        <div className="flex gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted">
            {doctor.photo ? (
              <Image
                src={doctor.photo}
                alt={doctor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-semibold text-foreground">
                {doctor.name
                  .split(' ')
                  .map((segment) => segment[0])
                  .join('')}
              </div>
            )}
            {doctor.verified ? (
              <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-tl-lg bg-background">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              </div>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-base font-semibold text-foreground">
                  {doctor.name}
                </h4>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {doctor.specialty}
                </p>
              </div>

              {priority ? (
                <Badge
                  variant="outline"
                  className="rounded-lg border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground"
                >
                  Recomendación principal
                </Badge>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden="true" />
                <span className="font-medium text-foreground">{doctor.rating.toFixed(1)}</span>
                <span>({doctor.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>
                  {doctor.city}, {doctor.state}
                </span>
              </div>
              <div>
                {doctor.yearsExperience} años de experiencia
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {doctor.nextAvailable ? (
                <Badge
                  variant="outline"
                  className="rounded-lg border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground"
                >
                  <Calendar className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  {doctor.nextAvailable}
                </Badge>
              ) : null}
              {doctor.videoConsultation ? (
                <Badge
                  variant="outline"
                  className="rounded-lg border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground"
                >
                  <Video className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  Video consulta
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  ${(doctor.priceCents / 100).toFixed(0)} MXN
                </p>
                <p className="text-xs text-muted-foreground">por consulta</p>
              </div>

              <Link
                href={`/book/${doctor.id}?from=ai-consultation&consultationId=${consultationId}`}
                onClick={() => {
                  onSelect();
                  void trackClientEvent(ANALYTICS_EVENTS.BOOKING_STARTED, {
                    surface: 'soap-recommended-doctors',
                    consultationId,
                    doctorId: doctor.id,
                    doctorName: doctor.name,
                    specialty: doctor.specialty,
                    priority,
                  });
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  priority
                    ? 'border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-border/70 bg-background text-foreground hover:bg-muted/60'
                )}
              >
                Agendar cita
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          Tu expediente de IA se comparte con el doctor para ahorrar tiempo.
        </div>
      </div>
    </Card>
  );
}

function mapDiagnosisToSpecialty(diagnosis: string): string {
  const lowerDiagnosis = diagnosis.toLowerCase();

  if (
    /hipertension|presion.*alta|cardiaco|corazon|arritmia|infarto|angina|palpitacion|taquicardia|bradicardia|valvular|insuficiencia.*cardiaca|soplo|colesterol.*alto/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Cardiología';
  }

  if (
    /piel|dermatitis|acne|erupcion|rash|sarpullido|urticaria|eczema|psoriasis|melasma|vitiligo|verruga|lunar|manchas.*piel|hongo|micosis|sarna|alopecia|caida.*cabello|uña|caspa|rosácea/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Dermatología';
  }

  if (
    /gastro|estomago|intestino|digestion|reflujo|gastritis|ulcera|colon|colitis|diarrea|estreñimiento|hemorroides|higado|hepat|vesicula|pancreat|nausea|vomito|acidez|dispepsia|abdomen|intestinal|ibs|crohn/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Gastroenterología';
  }

  if (
    /neurologico|cerebro|nervioso|migraña|jaqueca|cefalea|dolor.*cabeza|mareo|vertigo|convulsion|epilepsia|temblor|parkinson|esclerosis|neuropatia|paralisis|tic|neuralgia/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Neurología';
  }

  if (
    /ansiedad|depresion|psiquiatrico|mental|estres|panico|fobia|bipolar|esquizofrenia|insomnio|trastorno.*sueño|adiccion|tdah|deficit.*atencion|toc|obsesivo|compulsivo/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Psiquiatría';
  }

  if (
    /ginecologico|menstrual|embarazo|ovario|utero|vaginal|menopaus|endometriosis|quiste.*ovario|mioma|anticonceptiv|pap|amenorrea|dismenorrea|sangrado.*vaginal/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Ginecología';
  }

  if (/pediatrico|niño|niña|infantil|bebe|lactante|neonato|sarampion|varicela|paperas/i.test(lowerDiagnosis)) {
    return 'Pediatría';
  }

  if (
    /ortope|traumato|fractura|hueso|articulacion|rodilla|hombro|cadera|espalda|columna|lumbar|cervical|hernia.*disco|escoliosis|osteo|tendon|ligamento|esguince|luxacion|menisco|artritis|artrosis|gota/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Ortopedia';
  }

  if (
    /pulmon|respiratorio|asma|bronquitis|neumon|epoc|tos|disnea|ahogo|tuberculosis|enfisema|fibrosis.*pulmonar|apnea.*sueño/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Neumología';
  }

  if (
    /endocrino|diabetes|tiro|hipotiro|hipertiro|obesidad|metabol|hormona|suprarrenal|colesterol|triglicerido|glucosa/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Endocrinología';
  }

  if (
    /urolog|renal|riñon|vejiga|prostata|incontinencia|cistitis|infeccion.*urinaria|calculo.*renal|piedra.*riñon|hematuria/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Urología';
  }

  if (
    /oftalmolog|ojo|vista|vision|catarata|glaucoma|conjuntivitis|retina|cornea|miopia|astigmatismo|presbicia|estrabismo/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Oftalmología';
  }

  if (
    /otorrino|oido|nariz|garganta|sinusitis|otitis|faringitis|amigdalitis|laringitis|rinitis|alergica|sordera|tinnitus|adenoides|ronquido/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Otorrinolaringología';
  }

  if (
    /reumatolog|artritis.*reumatoide|lupus|fibromialgia|vasculitis|espondilitis|sjogren|dolor.*articular.*cronico/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Reumatología';
  }

  if (
    /cancer|oncolog|tumor|maligno|leucemia|linfoma|neoplasia|quimioterapia|metastasis|carcinoma/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Oncología';
  }

  if (
    /alergia|alergico|inmunolog|urticaria|anafilaxia|alergia.*alimentaria|rinitis.*alergica|asma.*alergica|dermatitis.*atopica/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Alergología';
  }

  return 'Medicina General';
}
