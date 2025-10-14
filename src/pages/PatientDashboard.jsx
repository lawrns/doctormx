import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('consultations');
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  async function fetchData() {
    try {
      setLoading(true);

      if (activeTab === 'consultations') {
        const { data, error } = await supabase
          .from('consults')
          .select(`
            *,
            doctors (full_name, specialty)
          `)
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setConsultations(data || []);
      } else if (activeTab === 'prescriptions') {
        const { data, error } = await supabase
          .from('erx')
          .select(`
            *,
            doctors (full_name, specialty),
            consults (created_at)
          `)
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPrescriptions(data || []);
      } else if (activeTab === 'referrals') {
        const { data, error } = await supabase
          .from('referrals')
          .select(`
            *,
            doctors!referrals_doctor_id_fkey (full_name, specialty)
          `)
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReferrals(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-ink-primary mb-2">
              Mi Dashboard
            </h1>
            <p className="text-ink-secondary">
              Gestiona tus consultas, recetas y referencias médicas
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-ink-border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink-primary">{consultations.length}</p>
                  <p className="text-sm text-ink-secondary">Consultas totales</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-ink-border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-medical-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink-primary">{prescriptions.length}</p>
                  <p className="text-sm text-ink-secondary">Recetas emitidas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-ink-border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink-primary">{referrals.length}</p>
                  <p className="text-sm text-ink-secondary">Referencias activas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-ink-border shadow-sm">
            <div className="border-b border-ink-border">
              <nav className="flex gap-8 px-6">
                {['consultations', 'prescriptions', 'referrals'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-brand-500 text-brand-600'
                        : 'border-transparent text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {tab === 'consultations' && 'Consultas'}
                    {tab === 'prescriptions' && 'Recetas'}
                    {tab === 'referrals' && 'Referencias'}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-ink-border rounded-xl p-4 animate-pulse">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Consultations Tab */}
                  {activeTab === 'consultations' && (
                    <div className="space-y-4">
                      {consultations.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-ink-primary mb-2">No tienes consultas</h3>
                          <p className="text-ink-secondary mb-4">Comienza tu primera consulta médica</p>
                          <button
                            onClick={() => navigate('/doctor')}
                            className="px-6 py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-lg hover:from-brand-700 hover:to-brand-600 transition-all"
                          >
                            Consultar ahora
                          </button>
                        </div>
                      ) : (
                        consultations.map((consult) => (
                          <div key={consult.id} className="border border-ink-border rounded-xl p-4 hover:border-brand-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-ink-primary">
                                    {consult.doctors?.full_name ? `Dr. ${consult.doctors.full_name}` : 'Doctor IA'}
                                  </h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[consult.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {consult.status}
                                  </span>
                                </div>
                                <p className="text-sm text-brand-600 mb-1">{consult.doctors?.specialty || 'Consulta IA'}</p>
                                <p className="text-sm text-ink-secondary">
                                  {new Date(consult.created_at).toLocaleDateString('es-MX', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={() => navigate(`/consultations/${consult.id}`)}
                                className="px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                              >
                                Ver detalles
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Prescriptions Tab */}
                  {activeTab === 'prescriptions' && (
                    <div className="space-y-4">
                      {prescriptions.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-ink-primary mb-2">No tienes recetas</h3>
                          <p className="text-ink-secondary">Las recetas de tus consultas aparecerán aquí</p>
                        </div>
                      ) : (
                        prescriptions.map((rx) => (
                          <div key={rx.id} className="border border-ink-border rounded-xl p-4 hover:border-medical-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-ink-primary">Receta médica</h3>
                                  <span className="px-2 py-0.5 bg-medical-100 text-medical-800 rounded-full text-xs font-medium">
                                    {rx.status || 'Activa'}
                                  </span>
                                </div>
                                <p className="text-sm text-medical-600 mb-1">
                                  Dr. {rx.doctors?.full_name}
                                </p>
                                <p className="text-sm text-ink-secondary">
                                  Emitida: {new Date(rx.created_at).toLocaleDateString('es-MX')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-ink-muted mb-2">Código QR</p>
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm-2 12h8v-8H3v8zm2-6h4v4H5v-4zm8-10v8h8V3h-8zm6 6h-4V5h4v4zm-6 4h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div className="border-t border-ink-border pt-3 mt-3">
                              <p className="text-sm font-medium text-ink-primary mb-2">Medicamentos:</p>
                              <ul className="text-sm text-ink-secondary space-y-1">
                                {rx.medications?.map((med, idx) => (
                                  <li key={idx}>- {med.name} - {med.dosage}</li>
                                )) || <li>No especificado</li>}
                              </ul>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Referrals Tab */}
                  {activeTab === 'referrals' && (
                    <div className="space-y-4">
                      {referrals.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-ink-primary mb-2">No tienes referencias</h3>
                          <p className="text-ink-secondary">Las referencias a especialistas aparecerán aquí</p>
                        </div>
                      ) : (
                        referrals.map((referral) => (
                          <div key={referral.id} className="border border-ink-border rounded-xl p-4 hover:border-green-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-ink-primary">
                                    Referencia a {referral.specialty}
                                  </h3>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    Activa
                                  </span>
                                </div>
                                <p className="text-sm text-green-600 mb-1">
                                  Emitida por: Dr. {referral.doctors?.full_name}
                                </p>
                                <p className="text-sm text-ink-secondary mb-2">
                                  {new Date(referral.created_at).toLocaleDateString('es-MX')}
                                </p>
                                <p className="text-sm text-ink-secondary">
                                  Razón: {referral.reason || 'Evaluación especializada'}
                                </p>
                              </div>
                              <button
                                onClick={() => navigate(`/doctors?specialty=${referral.specialty}`)}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              >
                                Buscar especialista
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
