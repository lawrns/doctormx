'use client';

import { Stethoscope, Star, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { DoctorMatch } from '@/lib/ai/referral';

interface RecommendedDoctorsCardProps {
  recommendations: DoctorMatch[];
  consultationType?: string;
  loading?: boolean;
  onViewAllDoctors?: () => void;
  onBookDoctor?: (doctorId: string) => void;
}

export function RecommendedDoctorsCard({
  recommendations,
  consultationType = 'AI Consultation',
  loading = false,
  onViewAllDoctors,
  onBookDoctor,
}: RecommendedDoctorsCardProps) {
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-blue-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-blue-200 rounded w-1/2 mb-2" />
                    <div className="h-2 bg-blue-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            Especialistas recomendados
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Basado en tus síntomas y preferencias • Sugerencias AI
          </p>
        </div>
        {onViewAllDoctors && (
          <button
            onClick={onViewAllDoctors}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800">
          <strong>Importante:</strong> Estas son sugerencias generadas por IA basadas en la información proporcionada.
          Verifica siempre las credenciales del médico y la disponibilidad antes de agendar.
        </p>
      </div>

      {/* Doctor Cards */}
      <div className="grid gap-4">
        {recommendations.slice(0, 3).map((match) => (
          <div
            key={match.doctorId}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Doctor Info */}
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {match.doctor?.profile?.photo_url ? (
                    <img
                      src={match.doctor.profile.photo_url}
                      alt={match.doctor.profile.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Stethoscope className="w-6 h-6 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {match.doctor?.profile?.full_name || 'Especialista'}
                  </h4>

                  {/* Specialty */}
                  {match.doctor?.specialties && match.doctor.specialties.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {match.doctor.specialties[0]?.name}
                    </p>
                  )}

                  {/* Rating */}
                  {match.doctor?.rating_avg && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium text-gray-700">
                        {match.doctor.rating_avg.toFixed(1)}
                      </span>
                      {match.doctor?.rating_count && match.doctor.rating_count > 0 && (
                        <span className="text-xs text-gray-500">
                          ({match.doctor.rating_count} reseñas)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {match.doctor?.city && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {match.doctor.city}
                    </div>
                  )}

                  {/* Reasons - Expandable */}
                  {match.reasons && match.reasons.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedDoctorId(
                          expandedDoctorId === match.doctorId ? null : match.doctorId
                        )}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {expandedDoctorId === match.doctorId ? 'Ocultar razones' : 'Ver razones'}
                      </button>

                      {expandedDoctorId === match.doctorId && (
                        <div className="mt-2 space-y-1">
                          {match.reasons.map((reason, idx) => (
                            <div
                              key={idx}
                              className="bg-green-50 border border-green-200 rounded px-2 py-1 text-xs text-green-800"
                            >
                              ✓ {reason}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {onBookDoctor && (
                  <button
                    onClick={() => onBookDoctor(match.doctorId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    Agendar
                  </button>
                )}
                <a
                  href={`/doctores/${match.doctorId}`}
                  className="text-xs text-gray-600 hover:text-gray-900 text-center underline"
                >
                  Ver perfil
                </a>
              </div>
            </div>

            {/* Price indication */}
            {match.doctor?.price_cents && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span>Precio aproximado:</span>
                <span className="font-semibold text-gray-900">
                  ${Math.round(match.doctor.price_cents / 100)} MXN
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All CTA */}
      {onViewAllDoctors && recommendations.length === 3 && (
        <div className="pt-4 border-t border-blue-100">
          <button
            onClick={onViewAllDoctors}
            className="w-full bg-white hover:bg-gray-50 border border-blue-200 text-blue-600 hover:text-blue-700 font-medium py-3 rounded-lg transition-colors"
          >
            Explorar todos los especialistas disponibles
          </button>
        </div>
      )}
    </div>
  );
}

export default RecommendedDoctorsCard;
