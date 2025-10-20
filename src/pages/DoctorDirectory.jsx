import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState, { NoResultsEmptyState } from '../components/ui/EmptyState';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Icon from '../components/ui/Icon';

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.specialty && filters.specialty !== 'Todas las especialidades') {
        params.append('specialty', filters.specialty);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.available) {
        params.append('available', 'true');
      }

      const response = await fetch(`/api/doctors?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar los doctores');
      }
      
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="relative bg-gradient-medical min-h-screen">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-100/40 to-accent-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-secondary-100/30 to-primary-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Encuentra tu{' '}
              <span className="gradient-text">
                Doctor Ideal
              </span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Doctores verificados y especializados disponibles para consulta inmediata
            </p>
          </div>

          {/* Filters */}
          <div className="glass-card mb-8 sm:mb-12 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  <Icon name="magnifying-glass" size="sm" className="inline mr-2" />
                  Buscar doctor
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nombre, especialidad o ubicación..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 py-3 pl-10 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                  <Icon name="magnifying-glass" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  <Icon name="academic-cap" size="sm" className="inline mr-2" />
                  Especialidad
                </label>
                <select
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
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
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={filters.available}
                    onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    <Icon name="clock" size="sm" className="inline mr-1" />
                    Solo disponibles ahora
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          {error ? (
            <div className="glass-card p-6 sm:p-8 text-center">
              <Icon name="exclamation-triangle" size="lg" className="text-error-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error al cargar doctores</h3>
              <p className="text-neutral-600 mb-4">{error}</p>
              <Button onClick={fetchDoctors} variant="primary">
                <Icon name="arrow-path" size="sm" className="mr-2" />
                Reintentar
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-neutral-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-5/6 mb-4"></div>
                  <div className="h-10 bg-neutral-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="glass-card p-8 sm:p-12 text-center">
              <Icon name="user-group" size="xl" className="text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No se encontraron doctores</h3>
              <p className="text-neutral-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
              <Button 
                onClick={() => setFilters({ specialty: '', search: '', available: false })}
                variant="secondary"
              >
                <Icon name="x-mark" size="sm" className="mr-2" />
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {doctors.map((doctor) => (
                <div
                  key={doctor.user_id}
                  className="glass-card group hover:shadow-card-hover hover:scale-105 transition-all duration-300 cursor-pointer p-6 sm:p-8"
                  onClick={() => navigate(`/doctors/${doctor.user_id}`)}
                >
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {doctor.full_name?.charAt(0) || 'D'}
                      </div>
                      {doctor.license_status === 'verified' && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 border-2 border-white rounded-full flex items-center justify-center">
                          <Icon name="check" size="xs" className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-neutral-900 truncate text-lg">
                          {doctor.full_name || 'Dr. Sin Nombre'}
                        </h3>
                        {doctor.license_status === 'verified' && (
                          <Icon name="shield-check" size="sm" className="text-success-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="academic-cap" size="sm" className="text-primary-600" />
                        <p className="text-sm text-primary-600 font-semibold">
                          {doctor.specialties?.join(', ') || 'Especialidad no especificada'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-neutral-600 line-clamp-3 mb-6 leading-relaxed">
                    {doctor.bio || 'Doctor verificado disponible para consulta inmediata.'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Icon name="identification" size="sm" />
                      <span>Cédula: {doctor.cedula || 'Verificada'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="star" size="sm" className="text-warning-500" />
                      <span>{doctor.rating_avg || '4.8'}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="clock" size="sm" />
                      <span>Resp. rápida</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-xs text-neutral-500">Consulta desde</span>
                      <p className="text-lg font-bold text-primary-600">
                        ${doctor.consultation_fees?.base_fee || '800'} MXN
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-500">Telemedicina</span>
                      <p className="text-sm font-semibold text-accent-600">
                        ${doctor.consultation_fees?.telemedicine_fee || '640'} MXN
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/doctors/${doctor.user_id}`);
                    }}
                    className="group-hover:shadow-lg transition-all duration-200"
                  >
                    <Icon name="eye" size="sm" className="mr-2" />
                    Ver perfil completo
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
