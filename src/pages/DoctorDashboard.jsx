import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [doctorData, setDoctorData] = useState(null);
  const [consults, setConsults] = useState([]);
  const [selectedConsult, setSelectedConsult] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({
    total_consults: 0,
    active_consults: 0,
    avg_response_time: 0,
    total_earnings: 0
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/connect/login');
        return;
      }

      // Load doctor profile
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('*, users!inner(*)')
        .eq('user_id', user.id)
        .single();

      if (doctorError) throw doctorError;

      if (doctor.license_status !== 'verified') {
        navigate('/connect/verify');
        return;
      }

      setDoctorData(doctor);

      // Load active consults
      const { data: consultsData, error: consultsError } = await supabase
        .from('consults')
        .select(`
          *,
          users:patient_id (name, phone)
        `)
        .eq('doctor_id', user.id)
        .in('status', ['assigned', 'active'])
        .order('created_at', { ascending: false });

      if (consultsError) throw consultsError;
      setConsults(consultsData || []);

      // Load stats
      const { data: statsData, error: statsError } = await supabase
        .from('consults')
        .select('*')
        .eq('doctor_id', user.id);

      if (!statsError && statsData) {
        const totalConsults = statsData.length;
        const activeConsults = statsData.filter(c => c.status === 'active').length;
        const paidConsults = statsData.filter(c => c.paid);
        const totalEarnings = paidConsults.reduce((sum, c) => sum + (c.price_mxn * 0.7), 0);

        setStats({
          total_consults: totalConsults,
          active_consults: activeConsults,
          avg_response_time: doctor.avg_response_sec || 0,
          total_earnings: totalEarnings
        });
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (consultId) => {
    if (!replyText.trim()) return;

    try {
      const { error } = await supabase
        .from('consults')
        .update({
          notes: {
            ...selectedConsult.notes,
            messages: [
              ...(selectedConsult.notes?.messages || []),
              {
                from: 'doctor',
                text: replyText,
                timestamp: new Date().toISOString()
              }
            ]
          },
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', consultId);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_trail').insert({
        actor_user_id: doctorData.user_id,
        entity: 'consults',
        entity_id: consultId,
        action: 'message_sent',
        diff: { message: replyText }
      });

      toast.success('Mensaje enviado');
      setReplyText('');
      loadDashboardData();
      setSelectedConsult(null);

    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Error al enviar mensaje');
    }
  };

  const handleResolveConsult = async (consultId) => {
    try {
      const { error } = await supabase
        .from('consults')
        .update({
          status: 'resolved',
          ended_at: new Date().toISOString()
        })
        .eq('id', consultId);

      if (error) throw error;

      toast.success('Consulta marcada como resuelta');
      loadDashboardData();
      setSelectedConsult(null);

    } catch (error) {
      console.error('Error resolving consult:', error);
      toast.error('Error al resolver consulta');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/connect');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-medical-600">Doctor.mx</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold text-gray-900">{doctorData?.users?.name}</div>
                <div className="text-sm text-gray-500">{doctorData?.specialties?.join(', ')}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="text-sm text-gray-600 mb-1">Consultas totales</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_consults}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="text-sm text-gray-600 mb-1">Activas ahora</div>
            <div className="text-3xl font-bold text-medical-600">{stats.active_consults}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="text-sm text-gray-600 mb-1">Tiempo de respuesta</div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(stats.avg_response_time / 60)}m
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-medical-500 to-medical-600 rounded-xl p-6 shadow-sm"
          >
            <div className="text-sm text-white/80 mb-1">Ganancias totales</div>
            <div className="text-3xl font-bold text-white">
              ${stats.total_earnings.toLocaleString('es-MX')}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {['inbox', 'history', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-semibold transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-medical-500 text-medical-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'inbox' && 'Inbox'}
                  {tab === 'history' && 'Historial'}
                  {tab === 'settings' && 'Configuración'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Inbox Tab */}
            {activeTab === 'inbox' && (
              <div>
                {consults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No hay consultas pendientes
                    </h3>
                    <p className="text-gray-600">
                      Te notificaremos cuando llegue una nueva consulta
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consults.map((consult) => (
                      <div
                        key={consult.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-medical-300 transition-colors cursor-pointer"
                        onClick={() => setSelectedConsult(consult)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {consult.users?.name || 'Paciente'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {consult.specialty || 'Consulta general'}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            consult.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {consult.status === 'active' ? 'En progreso' : 'Asignada'}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="text-sm text-gray-700">
                            <strong>Síntomas:</strong> {consult.triage?.symptoms || 'Sin especificar'}
                          </div>
                          {consult.red_flags && consult.red_flags.length > 0 && (
                            <div className="text-sm text-red-600 mt-2 flex items-start gap-2">
                              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <div><strong>Banderas rojas:</strong> {consult.red_flags.join(', ')}</div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {consult.notes?.messages?.length || 0} mensajes
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(consult.created_at).toLocaleString('es-MX')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-medical-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Historial de consultas
                </h3>
                <p className="text-gray-600">
                  Próximamente: historial completo de consultas resueltas
                </p>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información personal</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nombre</label>
                      <div className="mt-1 text-gray-900">{doctorData?.users?.name}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 text-gray-900">{doctorData?.users?.email}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Teléfono</label>
                      <div className="mt-1 text-gray-900">{doctorData?.users?.phone}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cédula</label>
                      <div className="mt-1 text-gray-900">{doctorData?.cedula}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Especialidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctorData?.specialties?.map((spec, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-medical-100 text-medical-700 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de pago</h3>
                  <button className="px-4 py-2 bg-medical-500 text-white rounded-lg hover:bg-medical-600 transition-colors">
                    Configurar cuenta de pago
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consult Detail Modal */}
      {selectedConsult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedConsult.users?.name}
                </h2>
                <p className="text-sm text-gray-600">{selectedConsult.specialty}</p>
              </div>
              <button
                onClick={() => setSelectedConsult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Triage Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Información del triage</h3>
                <p className="text-sm text-gray-700">
                  {selectedConsult.triage?.symptoms || 'Sin información'}
                </p>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Conversación</h3>
                {selectedConsult.notes?.messages?.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      msg.from === 'doctor'
                        ? 'bg-medical-100 ml-8'
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="text-sm text-gray-700">{msg.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleString('es-MX')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe tu respuesta al paciente..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleReply(selectedConsult.id)}
                  disabled={!replyText.trim()}
                  className="flex-1 py-3 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar mensaje
                </button>
                <button
                  onClick={() => handleResolveConsult(selectedConsult.id)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Resolver
                </button>
                <button
                  onClick={() => setSelectedConsult(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
