import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';

export default function EnhancedDoctorPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'referrals', label: 'Referencias IA', icon: '🤖' },
    { id: 'appointments', label: 'Citas', icon: '📅' },
    { id: 'patients', label: 'Pacientes', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ];

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock doctor data
      setDoctorData({
        id: user?.id,
        name: user?.name || 'Dr. María García',
        specialty: 'Medicina Interna',
        verification_status: 'verified',
        license_status: 'verified',
        rating: 4.8,
        total_patients: 1250,
        total_consultations: 3400,
        response_time_avg: 2.5,
        bio: 'Especialista en medicina interna con más de 10 años de experiencia. Enfoque en medicina preventiva y manejo de enfermedades crónicas.',
        specialties: ['Medicina Interna', 'Cardiología', 'Endocrinología'],
        consultation_fee: 800,
        insurance_providers: ['IMSS', 'ISSSTE', 'Seguro Popular'],
        availability: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '15:00', available: true },
          saturday: { start: '10:00', end: '14:00', available: false },
          sunday: { start: '10:00', end: '14:00', available: false }
        }
      });

      // Mock referrals data
      setReferrals([
        {
          id: 'ref_001',
          patient_id: 'patient_001',
          patient_name: 'Ana López',
          symptoms: 'Dolor de pecho, dificultad para respirar',
          urgency: 'high',
          specialty: 'Cardiología',
          ai_analysis: {
            recommended_specialty: 'Cardiología',
            urgency_level: 'alta',
            reasoning: 'Síntomas cardiovasculares que requieren evaluación especializada inmediata',
            red_flags: ['Dolor de pecho', 'Dificultad respiratoria']
          },
          match_score: 95,
          status: 'pending',
          created_at: '2024-01-23T10:30:00Z',
          consultation_fee: 800,
          estimated_wait_time: '2 horas'
        },
        {
          id: 'ref_002',
          patient_id: 'patient_002',
          patient_name: 'Carlos Méndez',
          symptoms: 'Fatiga constante, pérdida de peso',
          urgency: 'medium',
          specialty: 'Endocrinología',
          ai_analysis: {
            recommended_specialty: 'Endocrinología',
            urgency_level: 'moderada',
            reasoning: 'Síntomas sugestivos de desorden endocrino que requiere evaluación',
            red_flags: []
          },
          match_score: 88,
          status: 'accepted',
          created_at: '2024-01-22T14:15:00Z',
          consultation_fee: 800,
          estimated_wait_time: '4 horas'
        },
        {
          id: 'ref_003',
          patient_id: 'patient_003',
          patient_name: 'María Rodríguez',
          symptoms: 'Dolor abdominal, náuseas',
          urgency: 'medium',
          specialty: 'Gastroenterología',
          ai_analysis: {
            recommended_specialty: 'Gastroenterología',
            urgency_level: 'moderada',
            reasoning: 'Síntomas gastrointestinales que requieren evaluación especializada',
            red_flags: []
          },
          match_score: 75,
          status: 'completed',
          created_at: '2024-01-21T09:45:00Z',
          consultation_fee: 800,
          estimated_wait_time: '6 horas'
        }
      ]);

      // Mock appointments data
      setAppointments([
        {
          id: 'apt_001',
          patient_name: 'Ana López',
          patient_id: 'patient_001',
          date: '2024-01-25',
          time: '10:00',
          status: 'scheduled',
          type: 'follow_up',
          notes: 'Seguimiento de síntomas cardiovasculares',
          consultation_fee: 800,
          payment_status: 'paid'
        },
        {
          id: 'apt_002',
          patient_name: 'Carlos Méndez',
          patient_id: 'patient_002',
          date: '2024-01-25',
          time: '14:00',
          status: 'confirmed',
          type: 'initial',
          notes: 'Primera consulta por fatiga y pérdida de peso',
          consultation_fee: 800,
          payment_status: 'pending'
        },
        {
          id: 'apt_003',
          patient_name: 'María Rodríguez',
          patient_id: 'patient_003',
          date: '2024-01-26',
          time: '11:00',
          status: 'completed',
          type: 'follow_up',
          notes: 'Consulta completada - diagnóstico: gastritis',
          consultation_fee: 800,
          payment_status: 'paid'
        }
      ]);

      // Mock stats data
      setStats({
        total_referrals: 45,
        accepted_referrals: 38,
        completed_consultations: 32,
        pending_referrals: 7,
        avg_response_time: 2.5,
        patient_satisfaction: 4.8,
        monthly_earnings: 25600,
        referral_conversion_rate: 84.4
      });

    } catch (error) {
      console.error('Error loading doctor data:', error);
      toast.error('Error al cargar datos del doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReferral = async (referralId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReferrals(referrals.map(ref => 
        ref.id === referralId 
          ? { ...ref, status: 'accepted' }
          : ref
      ));
      
      toast.success('Referencia aceptada exitosamente');
    } catch (error) {
      toast.error('Error al aceptar referencia');
    }
  };

  const handleRejectReferral = async (referralId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReferrals(referrals.map(ref => 
        ref.id === referralId 
          ? { ...ref, status: 'rejected' }
          : ref
      ));
      
      toast.success('Referencia rechazada');
    } catch (error) {
      toast.error('Error al rechazar referencia');
    }
  };

  const handleViewReferralDetails = (referral) => {
    setSelectedReferral(referral);
    setShowReferralModal(true);
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

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Panel de Doctor - {doctorData?.name}
              </h2>
              <p className="text-gray-600">
                {doctorData?.specialty} • Verificado • {doctorData?.rating}⭐
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Tiempo de respuesta promedio</div>
                <div className="text-lg font-semibold text-medical-600">
                  {doctorData?.response_time_avg}h
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Pacientes totales</div>
                <div className="text-lg font-semibold text-medical-600">
                  {doctorData?.total_patients}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-medical-500 text-medical-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">🤖</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stats?.total_referrals}</div>
                      <div className="text-blue-100 text-sm">Referencias IA</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">✅</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stats?.accepted_referrals}</div>
                      <div className="text-green-100 text-sm">Aceptadas</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">💰</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${stats?.monthly_earnings?.toLocaleString()}</div>
                      <div className="text-purple-100 text-sm">Ganancias mensuales</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">⭐</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stats?.patient_satisfaction}</div>
                      <div className="text-orange-100 text-sm">Satisfacción</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Referencias Recientes</h3>
                  <div className="space-y-3">
                    {referrals.slice(0, 3).map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{referral.patient_name}</div>
                          <div className="text-sm text-gray-600">{referral.specialty}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                            {referral.status === 'pending' ? 'Pendiente' : 
                             referral.status === 'accepted' ? 'Aceptada' : 
                             referral.status === 'rejected' ? 'Rechazada' : 'Completada'}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(referral.created_at).toLocaleDateString('es-MX')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Citas</h3>
                  <div className="space-y-3">
                    {appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{appointment.patient_name}</div>
                          <div className="text-sm text-gray-600">{appointment.type === 'initial' ? 'Primera consulta' : 'Seguimiento'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString('es-MX')}
                          </div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Referencias de IA</h3>
                <div className="text-sm text-gray-500">
                  {referrals.filter(r => r.status === 'pending').length} pendientes
                </div>
              </div>

              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{referral.patient_name}</h4>
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
                        <p className="text-gray-600 mb-2">{referral.symptoms}</p>
                        <div className="text-sm text-gray-500">
                          Especialidad: {referral.specialty} • Puntuación: {referral.match_score}/100
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-medical-600">
                          ${referral.consultation_fee}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.estimated_wait_time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleViewReferralDetails(referral)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ver Detalles
                      </button>
                      {referral.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRejectReferral(referral.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => handleAcceptReferral(referral.id)}
                            className="px-4 py-2 bg-medical-500 text-white rounded-lg hover:bg-medical-600 transition-colors"
                          >
                            Aceptar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Citas</h3>
              
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.patient_name}</h4>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('es-MX')}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.time}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status === 'scheduled' ? 'Programada' :
                           appointment.status === 'confirmed' ? 'Confirmada' :
                           appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {appointment.type === 'initial' ? 'Primera consulta' : 'Seguimiento'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${appointment.consultation_fee}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Other tabs placeholder */}
          {activeTab === 'patients' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-medical-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Pacientes</h3>
              <p className="text-gray-600 mb-4">
                Próximamente: historial de pacientes, notas médicas y seguimiento
              </p>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-medical-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Avanzados</h3>
              <p className="text-gray-600 mb-4">
                Próximamente: métricas detalladas, gráficos de rendimiento y análisis de tendencias
              </p>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-medical-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración</h3>
              <p className="text-gray-600 mb-4">
                Próximamente: configuración de disponibilidad, tarifas y preferencias
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Referral Details Modal */}
      {showReferralModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detalles de la Referencia</h3>
              <button
                onClick={() => setShowReferralModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Paciente</h4>
                <p className="text-gray-600">{selectedReferral.patient_name}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Síntomas</h4>
                <p className="text-gray-600">{selectedReferral.symptoms}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Análisis de IA</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Especialidad recomendada:</strong> {selectedReferral.ai_analysis.recommended_specialty}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Nivel de urgencia:</strong> {selectedReferral.ai_analysis.urgency_level}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Razón:</strong> {selectedReferral.ai_analysis.reasoning}
                  </p>
                  {selectedReferral.ai_analysis.red_flags.length > 0 && (
                    <div>
                      <strong className="text-sm text-gray-700">Señales de alarma:</strong>
                      <ul className="text-sm text-gray-700 ml-4">
                        {selectedReferral.ai_analysis.red_flags.map((flag, index) => (
                          <li key={index}>• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Información de la Cita</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Tarifa de consulta:</span>
                    <p className="font-medium">${selectedReferral.consultation_fee}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tiempo de espera estimado:</span>
                    <p className="font-medium">{selectedReferral.estimated_wait_time}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Puntuación de compatibilidad:</span>
                    <p className="font-medium">{selectedReferral.match_score}/100</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Fecha de referencia:</span>
                    <p className="font-medium">
                      {new Date(selectedReferral.created_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowReferralModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
              {selectedReferral.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleRejectReferral(selectedReferral.id);
                      setShowReferralModal(false);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => {
                      handleAcceptReferral(selectedReferral.id);
                      setShowReferralModal(false);
                    }}
                    className="px-4 py-2 bg-medical-500 text-white rounded-lg hover:bg-medical-600 transition-colors"
                  >
                    Aceptar Referencia
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

