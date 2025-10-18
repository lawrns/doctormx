import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';

export default function AIReferralSystem() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [referralResult, setReferralResult] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadReferralHistory();
  }, []);

  const loadReferralHistory = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock history data
      setReferralHistory([
        {
          id: 'ref_001',
          symptoms: 'Dolor de pecho, dificultad para respirar',
          specialty: 'Cardiología',
          urgency: 'high',
          status: 'completed',
          created_at: '2024-01-20T10:30:00Z',
          selected_doctor: 'Dr. María García'
        },
        {
          id: 'ref_002',
          symptoms: 'Fatiga constante, pérdida de peso',
          specialty: 'Endocrinología',
          urgency: 'medium',
          status: 'pending',
          created_at: '2024-01-22T14:15:00Z',
          selected_doctor: null
        }
      ]);
    } catch (error) {
      console.error('Error loading referral history:', error);
    }
  };

  const handleCreateReferral = async () => {
    if (!symptoms.trim()) {
      toast.error('Por favor describe tus síntomas');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock referral result
      const mockResult = {
        referral_id: `ref_${Date.now()}`,
        patient_id: user?.id,
        ai_analysis: {
          recommended_specialty: 'Cardiología',
          urgency_level: 'alta',
          reasoning: 'Los síntomas descritos (dolor de pecho y dificultad para respirar) son indicativos de posibles problemas cardiovasculares que requieren evaluación especializada inmediata.',
          red_flags: ['Dolor de pecho', 'Dificultad respiratoria']
        },
        matched_doctors: [
          {
            doctor_id: 'doc_001',
            match_score: 95,
            reasons: ['Especialidad exacta', 'Calificación alta (4.8)', 'Respuesta rápida', 'Disponibilidad inmediata'],
            availability: {
              next_available: '2024-01-25T10:00:00Z',
              time_slots: ['2024-01-25T10:00:00Z', '2024-01-25T11:00:00Z', '2024-01-25T14:00:00Z']
            },
            estimated_wait_time: '2 horas',
            consultation_fee: 800,
            insurance_accepted: true
          },
          {
            doctor_id: 'doc_002',
            match_score: 88,
            reasons: ['Especialidad exacta', 'Calificación alta (4.6)', 'Respuesta moderada', 'Acepta tu seguro'],
            availability: {
              next_available: '2024-01-25T15:00:00Z',
              time_slots: ['2024-01-25T15:00:00Z', '2024-01-26T09:00:00Z']
            },
            estimated_wait_time: '4 horas',
            consultation_fee: 750,
            insurance_accepted: true
          },
          {
            doctor_id: 'doc_003',
            match_score: 82,
            reasons: ['Especialidad exacta', 'Calificación alta (4.5)', 'Disponibilidad inmediata'],
            availability: {
              next_available: '2024-01-26T09:00:00Z',
              time_slots: ['2024-01-26T09:00:00Z', '2024-01-26T10:00:00Z']
            },
            estimated_wait_time: '6 horas',
            consultation_fee: 900,
            insurance_accepted: false
          }
        ],
        referral_message: `📋 **Análisis de Referencia Médica**

**Especialidad recomendada:** Cardiología
**Nivel de urgencia:** alta

**Razón de la referencia:**
Los síntomas descritos (dolor de pecho y dificultad para respirar) son indicativos de posibles problemas cardiovasculares que requieren evaluación especializada inmediata.

⚠️ **Señales de alarma detectadas:**
• Dolor de pecho
• Dificultad respiratoria

**Doctores recomendados:**

1. **Doctor doc_001**
   • Puntuación de compatibilidad: 95/100
   • Tiempo de respuesta estimado: 2 horas
   • Tarifa de consulta: $800 MXN
   • Razones: Especialidad exacta, Calificación alta (4.8), Respuesta rápida, Disponibilidad inmediata

2. **Doctor doc_002**
   • Puntuación de compatibilidad: 88/100
   • Tiempo de respuesta estimado: 4 horas
   • Tarifa de consulta: $750 MXN
   • Razones: Especialidad exacta, Calificación alta (4.6), Respuesta moderada, Acepta tu seguro

3. **Doctor doc_003**
   • Puntuación de compatibilidad: 82/100
   • Tiempo de respuesta estimado: 6 horas
   • Tarifa de consulta: $900 MXN
   • Razones: Especialidad exacta, Calificación alta (4.5), Disponibilidad inmediata

💡 **Próximos pasos:**
1. Revisa los doctores recomendados
2. Selecciona el que mejor se adapte a tus necesidades
3. Agenda tu cita directamente
4. Si tienes síntomas de emergencia, acude inmediatamente a urgencias

⚠️ **Importante:** Esta es una referencia basada en IA. Siempre consulta con un médico profesional para diagnóstico y tratamiento.`,
        created_at: new Date().toISOString()
      };

      setReferralResult(mockResult);
      toast.success('Referencia creada exitosamente');
      
      // Add to history
      setReferralHistory([mockResult, ...referralHistory]);
      
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Error al crear referencia');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = async (doctorId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Doctor seleccionado. Te contactaremos pronto para agendar la cita.');
      
      // Update referral status
      setReferralResult(prev => ({
        ...prev,
        selected_doctor_id: doctorId
      }));
      
    } catch (error) {
      toast.error('Error al seleccionar doctor');
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sistema de Referencias con IA
              </h2>
              <p className="text-gray-600">
                Describe tus síntomas y recibe referencias inteligentes a especialistas
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
            </button>
          </div>
        </div>

        {/* Referral History */}
        {showHistory && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Referencias</h3>
            <div className="space-y-3">
              {referralHistory.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{referral.symptoms}</div>
                    <div className="text-sm text-gray-600">
                      {referral.specialty} • {referral.selected_doctor || 'Sin doctor seleccionado'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(referral.urgency)}`}>
                      {referral.urgency === 'emergency' ? 'Emergencia' : 
                       referral.urgency === 'high' ? 'Alta' : 
                       referral.urgency === 'medium' ? 'Moderada' : 'Baja'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                      {referral.status === 'pending' ? 'Pendiente' : 
                       referral.status === 'accepted' ? 'Aceptada' : 
                       referral.status === 'rejected' ? 'Rechazada' : 'Completada'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {!referralResult ? (
            /* Referral Form */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe tus síntomas *
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Ejemplo: Tengo dolor de pecho desde hace 2 días, es pulsante y empeora con la actividad física. También tengo dificultad para respirar cuando hago esfuerzo."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información adicional (opcional)
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Información adicional como medicamentos que tomas, alergias, historial médico relevante, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>Importante:</strong> Este sistema utiliza inteligencia artificial para analizar tus síntomas y recomendarte especialistas. 
                    Siempre consulta con un médico profesional para diagnóstico y tratamiento. 
                    Si tienes síntomas de emergencia, acude inmediatamente a urgencias.
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateReferral}
                disabled={loading || !symptoms.trim()}
                className="w-full py-3 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analizando síntomas...' : 'Crear Referencia con IA'}
              </button>
            </motion.div>
          ) : (
            /* Referral Results */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* AI Analysis */}
              <div className="bg-gradient-to-r from-medical-50 to-blue-50 rounded-xl p-6 border border-medical-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de IA</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Especialidad recomendada:</span>
                    <p className="font-medium text-gray-900">{referralResult.ai_analysis.recommended_specialty}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nivel de urgencia:</span>
                    <p className="font-medium text-gray-900">{referralResult.ai_analysis.urgency_level}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Razón de la referencia:</span>
                  <p className="text-sm text-gray-700 mt-1">{referralResult.ai_analysis.reasoning}</p>
                </div>
                {referralResult.ai_analysis.red_flags.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Señales de alarma:</span>
                    <ul className="text-sm text-red-700 mt-1">
                      {referralResult.ai_analysis.red_flags.map((flag, index) => (
                        <li key={index}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Matched Doctors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctores Recomendados</h3>
                <div className="space-y-4">
                  {referralResult.matched_doctors.map((doctor, index) => (
                    <div key={doctor.doctor_id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">Doctor {index + 1}</h4>
                            <span className="px-2 py-1 bg-medical-100 text-medical-800 text-xs font-medium rounded-full">
                              {doctor.match_score}/100
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Razones: {doctor.reasons.join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-medical-600">
                            ${doctor.consultation_fee}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.estimated_wait_time}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-500">Próxima disponibilidad:</span>
                          <p className="text-sm font-medium">
                            {new Date(doctor.availability.next_available).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Seguro médico:</span>
                          <p className="text-sm font-medium">
                            {doctor.insurance_accepted ? 'Aceptado' : 'No aceptado'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Horarios disponibles:</span>
                          <p className="text-sm font-medium">
                            {doctor.availability.time_slots.length} opciones
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectDoctor(doctor.doctor_id)}
                        className="w-full py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
                      >
                        Seleccionar este Doctor
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReferralResult(null);
                    setSymptoms('');
                    setAdditionalInfo('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Nueva Referencia
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Ver Historial
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

