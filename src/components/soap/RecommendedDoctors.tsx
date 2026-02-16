'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Star,
  Video,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ConsensusResult } from '@/lib/soap/types';
import { logger } from '@/lib/observability/logger';

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
  nextAvailable: string | null; // "Tomorrow 3PM", "Today 6PM", etc.
  videoConsultation: boolean;
  verified: boolean;
}

interface RecommendedDoctorsProps {
  consultationId: string;
  consensus: ConsensusResult;
  patientHistory: Record<string, unknown>;
  onSelectDoctor: (doctorId: string) => void;
}

export function RecommendedDoctors({
  consultationId,
  consensus,
  patientHistory,
  onSelectDoctor,
}: RecommendedDoctorsProps) {
  const [doctores, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract diagnosis name for use throughout component
  const primaryDiagnosisName = consensus.primaryDiagnosis?.name || 'general';
  const specialty = mapDiagnosisToSpecialty(primaryDiagnosisName);

  useEffect(() => {
    fetchRecommendedDoctors();
  }, [consensus.primaryDiagnosis]);

  const fetchRecommendedDoctors = async () => {
    try {
      setLoading(true);

      // Call API to get doctores matching AI recommendation
      const response = await fetch('/api/directory/recommended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty,
          urgencyLevel: (consensus as any).urgencyLevel || 'routine',
          consultationId,
          limit: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommended doctores');
      }

      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      logger.error('Error fetching recommended doctores', { error: err instanceof Error ? err.message : String(err) });
      setError('No pudimos cargar las recomendaciones de médicos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500" />
          Conectándote con especialistas...
        </h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || doctores.length === 0) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {error || 'No hay especialistas disponibles en este momento'}
        </h3>
        <Link
          href="/doctores"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          Ver todos los médicos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-blue-500 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Los especialistas recomiendan continuar con:
            </h3>
            <p className="text-gray-700">
              Basado en tu diagnóstico de{' '}
              <span className="font-semibold text-blue-700">
                {primaryDiagnosisName}
              </span>
              , estos médicos verificados pueden ayudarte:
            </p>
            {consensus.urgencyLevel === 'urgent' && (
              <div className="mt-3 flex items-center gap-2 text-orange-700 font-semibold">
                <Clock className="w-5 h-5" />
                Recomendamos atención en las próximas 24-48 horas
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Doctor Cards */}
      <div className="grid gap-4">
        {doctores.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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

      {/* See more link */}
      <div className="text-center">
        <Link
          href={`/doctores?specialty=${specialty}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          Ver más especialistas en {specialty}
          <ArrowRight className="w-4 h-4" />
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
    <div
      className={`
        relative bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl
        transition-all duration-300 overflow-hidden
        ${priority ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
      `}
    >
      {/* Priority badge */}
      {priority && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 fill-current" />
            Mejor opción
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex gap-6">
          {/* Doctor Photo */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 ring-4 ring-white">
              {doctor.photo ? (
                <Image
                  src={doctor.photo}
                  alt={doctor.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                  {doctor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              )}
              {doctor.verified && (
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-tl-lg p-1">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {doctor.name}
              </h4>
              <p className="text-blue-600 font-semibold">{doctor.specialty}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
                <span>({doctor.reviewCount} reseñas)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                {doctor.city}, {doctor.state}
              </div>
              <div className="text-gray-600">
                {doctor.yearsExperience} años de experiencia
              </div>
            </div>

            {/* Availability & Features */}
            <div className="flex flex-wrap gap-3">
              {doctor.nextAvailable && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  <Calendar className="w-4 h-4" />
                  Disponible: {doctor.nextAvailable}
                </div>
              )}
              {doctor.videoConsultation && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  <Video className="w-4 h-4" />
                  Video consulta
                </div>
              )}
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${(doctor.priceCents / 100).toFixed(0)} MXN
                </p>
                <p className="text-xs text-gray-500">por consulta</p>
              </div>
              <Link
                href={`/book/${doctor.id}?from=ai-consultation&consultationId=${consultationId}`}
                onClick={onSelect}
                className={`
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold
                  shadow-md hover:shadow-lg transform hover:scale-105
                  transition-all duration-200
                  focus:outline-none focus:ring-4
                  ${priority
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white focus:ring-blue-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
                  }
                `}
              >
                Agendar cita
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* AI Referral Badge */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>
              Tu expediente de IA será compartido con el doctor para ahorrar tiempo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Map AI diagnosis to doctor specialty
 * Comprehensive mapping with extensive pattern matching for Mexican healthcare
 */
function mapDiagnosisToSpecialty(diagnosis: string): string {
  const lowerDiagnosis = diagnosis.toLowerCase();

  // Cardiology - Heart & Cardiovascular
  if (
    /hipertension|presion.*alta|cardiaco|corazon|arritmia|infarto|angina|palpitacion|taquicardia|bradicardia|valvular|insuficiencia.*cardiaca|soplo|colesterol.*alto/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Cardiología';
  }

  // Dermatology - Skin, Hair, Nails
  if (
    /piel|dermatitis|acne|erupcion|rash|sarpullido|urticaria|eczema|psoriasis|melasma|vitiligo|verruga|lunar|manchas.*piel|hongo|micosis|sarna|alopecia|caida.*cabello|uña|caspa|rosácea/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Dermatología';
  }

  // Gastroenterology - Digestive System
  if (
    /gastro|estomago|intestino|digestion|reflujo|gastritis|ulcera|colon|colitis|diarrea|estreñimiento|hemorroides|higado|hepat|vesicula|pancreat|nausea|vomito|acidez|dispepsia|abdomen|intestinal|ibs|crohn/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Gastroenterología';
  }

  // Neurology - Brain & Nervous System
  if (
    /neurologico|cerebro|nervioso|migraña|jaqueca|cefalea|dolor.*cabeza|mareo|vertigo|convulsion|epilepsia|temblor|parkinson|esclerosis|neuropatia|paralisis|tic|neuralgia/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Neurología';
  }

  // Psychiatry / Psychology - Mental Health
  if (
    /ansiedad|depresion|psiquiatrico|mental|estres|panico|fobia|bipolar|esquizofrenia|insomnio|trastorno.*sueño|adiccion|tdah|deficit.*atencion|toc|obsesivo|compulsivo/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Psiquiatría';
  }

  // Gynecology / Obstetrics
  if (
    /ginecologico|menstrual|embarazo|ovario|utero|vaginal|menopaus|endometriosis|quiste.*ovario|mioma|anticonceptiv|pap|amenorrea|dismenorrea|sangrado.*vaginal/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Ginecología';
  }

  // Pediatrics
  if (
    /pediatrico|niño|niña|infantil|bebe|lactante|neonato|sarampion|varicela|paperas/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Pediatría';
  }

  // Orthopedics / Traumatology - Bones, Joints, Spine
  if (
    /ortope|traumato|fractura|hueso|articulacion|rodilla|hombro|cadera|espalda|columna|lumbar|cervical|hernia.*disco|escoliosis|osteo|tendon|ligamento|esguince|luxacion|menisco|artritis|artrosis|gota/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Ortopedia';
  }

  // Pulmonology - Respiratory
  if (
    /pulmon|respiratorio|asma|bronquitis|neumon|epoc|tos|disnea|ahogo|tuberculosis|enfisema|fibrosis.*pulmonar|apnea.*sueño/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Neumología';
  }

  // Endocrinology - Hormones & Metabolism
  if (
    /endocrino|diabetes|tiro|hipotiro|hipertiro|obesidad|metabol|hormona|suprarrenal|colesterol|triglicerido|glucosa/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Endocrinología';
  }

  // Urology - Urinary & Male Reproductive
  if (
    /urolog|renal|riñon|vejiga|prostata|incontinencia|cistitis|infeccion.*urinaria|calculo.*renal|piedra.*riñon|hematuria/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Urología';
  }

  // Ophthalmology - Eyes
  if (
    /oftalmolog|ojo|vista|vision|catarata|glaucoma|conjuntivitis|retina|cornea|miopia|astigmatismo|presbicia|estrabismo/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Oftalmología';
  }

  // Otorhinolaryngology (ENT) - Ear, Nose, Throat
  if (
    /otorrino|oido|nariz|garganta|sinusitis|otitis|faringitis|amigdalitis|laringitis|rinitis|alergica|sordera|tinnitus|adenoides|ronquido/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Otorrinolaringología';
  }

  // Rheumatology - Autoimmune & Joint Diseases
  if (
    /reumatolog|artritis.*reumatoide|lupus|fibromialgia|vasculitis|espondilitis|sjogren|dolor.*articular.*cronico/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Reumatología';
  }

  // Oncology - Cancer
  if (
    /cancer|oncolog|tumor|maligno|leucemia|linfoma|neoplasia|quimioterapia|metastasis|carcinoma/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Oncología';
  }

  // Allergology / Immunology
  if (
    /alergia|alergico|inmunolog|urticaria|anafilaxia|alergia.*alimentaria|rinitis.*alergica|asma.*alergica|dermatitis.*atopica/i.test(
      lowerDiagnosis
    )
  ) {
    return 'Alergología';
  }

  // Default to general medicine for common/minor conditions
  return 'Medicina General';
}
