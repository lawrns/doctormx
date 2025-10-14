import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: '',
    search: '',
    available: false
  });
  const navigate = useNavigate();

  const specialties = [
    'Medicina General',
    'Pediatría',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Psiquiatría',
    'Traumatología',
    'Oftalmología',
    'Endocrinología',
    'Neurología'
  ];

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  async function fetchDoctors() {
    try {
      setLoading(true);
      let query = supabase
        .from('doctors')
        .select('*')
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
      }

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
      }

      if (filters.available) {
        query = query.eq('available', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="relative bg-gradient-to-b from-white to-gray-50 py-16">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-brand-100/30 to-medical-50/20 rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-ink-primary mb-4">
              Encuentra tu{' '}
              <span className="bg-gradient-to-r from-brand-600 to-medical-600 bg-clip-text text-transparent">
                Doctor
              </span>
            </h1>
            <p className="text-lg text-ink-secondary max-w-2xl mx-auto">
              Doctores verificados disponibles para consulta inmediata por WhatsApp
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-ink-border p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-ink-primary mb-2">
                  Buscar doctor
                </label>
                <input
                  type="text"
                  placeholder="Nombre o especialidad..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2.5 border border-ink-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-ink-primary mb-2">
                  Especialidad
                </label>
                <select
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  className="w-full px-4 py-2.5 border border-ink-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">Todas las especialidades</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.available}
                    onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                    className="w-5 h-5 rounded border-ink-border text-brand-600 focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-ink-primary">Solo disponibles ahora</span>
                </label>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-ink-border p-6 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-ink-primary mb-2">No se encontraron doctores</h3>
              <p className="text-ink-secondary">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="group bg-white rounded-2xl border border-ink-border p-6 hover:shadow-lg hover:border-brand-300 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                >
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-medical-500 to-medical-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {doctor.full_name?.charAt(0) || 'D'}
                      </div>
                      {doctor.available && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-ink-primary truncate">
                          Dr. {doctor.full_name}
                        </h3>
                        {doctor.verified && (
                          <svg className="w-5 h-5 text-brand-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-brand-600 font-medium">{doctor.specialty}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-ink-secondary line-clamp-2 mb-4">
                    {doctor.bio || 'Doctor verificado disponible para consulta.'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-ink-muted mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      <span>{doctor.cedula || 'Ced. verificada'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Resp. inmediata</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-lg hover:from-brand-700 hover:to-brand-600 transition-all group-hover:shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/doctors/${doctor.id}`);
                    }}
                  >
                    Ver perfil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
