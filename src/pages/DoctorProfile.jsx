import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TrustBadges from '../components/TrustBadges';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultType, setConsultType] = useState('chat');

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  async function fetchDoctor() {
    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching doctor');
      }
      
      setDoctor(data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startConsultation() {
    if (!user) {
      navigate('/login?redirect=/doctors/' + id);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('consults')
        .insert({
          patient_id: user.id,
          doctor_id: doctor.id,
          type: consultType,
          status: 'pending',
          triage: {}
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/pay/checkout?consult=${data.id}`);
    } catch (error) {
      console.error('Error creating consultation:', error);
      alert('Error al iniciar consulta. Intenta de nuevo.');
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="bg-white rounded-2xl border border-ink-border p-8 animate-pulse">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-2xl font-bold text-ink-primary mb-4">Doctor no encontrado</h2>
            <button
              onClick={() => navigate('/doctors')}
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Volver al directorio
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/doctors')}
            className="inline-flex items-center gap-2 text-ink-secondary hover:text-brand-600 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al directorio
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-ink-border shadow-sm p-8 mb-6">
                {/* Header */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-medical-500 to-medical-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {doctor.users?.name?.charAt(0) || 'D'}
                    </div>
                    {doctor.available && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-ink-primary">
                        {doctor.users?.name || 'Dr. Sin Nombre'}
                      </h1>
                      {doctor.license_status === 'verified' && (
                        <svg className="w-7 h-7 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-lg text-brand-600 font-semibold mb-2">{doctor.specialties?.join(', ') || 'Medicina General'}</p>
                    {doctor.available ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Disponible ahora
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                        No disponible
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-ink-primary mb-3">Sobre mí</h3>
                  <p className="text-ink-secondary leading-relaxed">
                    {doctor.bio || 'Doctor verificado con experiencia en atención médica de calidad.'}
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-ink-primary mb-3">Certificaciones y Verificaciones</h3>
                  <TrustBadges doctorId={doctor.user_id} showAll={true} />
                </div>

                {/* Credentials */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <svg className="w-6 h-6 text-brand-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-ink-primary text-sm">Cédula profesional</p>
                      <p className="text-ink-secondary text-sm">{doctor.cedula || 'Verificada'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <svg className="w-6 h-6 text-medical-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-ink-primary text-sm">Doctor verificado</p>
                      <p className="text-ink-secondary text-sm">Por Doctor.mx</p>
                    </div>
                  </div>
                </div>

                {/* Languages */}
                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-ink-primary mb-3">Idiomas</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang) => (
                        <span key={lang} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-ink-border shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-ink-primary mb-4">Iniciar consulta</h3>

                {/* Consult type selector */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-3 p-4 border-2 border-ink-border rounded-xl cursor-pointer hover:border-brand-500 transition-colors">
                    <input
                      type="radio"
                      name="consultType"
                      value="chat"
                      checked={consultType === 'chat'}
                      onChange={(e) => setConsultType(e.target.value)}
                      className="w-5 h-5 text-brand-600 focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-ink-primary">Consulta por chat</p>
                      <p className="text-sm text-ink-secondary">$79 MXN</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-ink-border rounded-xl cursor-pointer hover:border-brand-500 transition-colors">
                    <input
                      type="radio"
                      name="consultType"
                      value="video"
                      checked={consultType === 'video'}
                      onChange={(e) => setConsultType(e.target.value)}
                      className="w-5 h-5 text-brand-600 focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-ink-primary">Videollamada</p>
                      <p className="text-sm text-ink-secondary">$149 MXN</p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={startConsultation}
                  disabled={!doctor.available}
                  className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {doctor.available ? 'Consultar ahora' : 'No disponible'}
                </button>

                <div className="mt-4 p-4 bg-medical-50 border border-medical-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-medical-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-medical-800 leading-relaxed">
                      Recibirás una respuesta en minutos. Si necesitas una receta, el doctor puede emitirla digitalmente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
