import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import TrustBadges from '../components/TrustBadges';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState, { NoResultsEmptyState } from '../components/ui/EmptyState';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import MobileSpacing from '../components/ui/MobileOptimized';

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
      <div className="relative bg-gradient-to-b from-white to-gray-50 py-8 sm:py-12 lg:py-16">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-brand-100/30 to-medical-50/20 rounded-full blur-3xl"></div>
        </div>

        <MobileSpacing.Container className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <MobileSpacing.Text variant="h1" className="text-ink-primary mb-4">
              Encuentra tu{' '}
              <span className="bg-gradient-to-r from-brand-600 to-medical-600 bg-clip-text text-transparent">
                Doctor
              </span>
            </MobileSpacing.Text>
            <MobileSpacing.Text variant="body" className="text-ink-secondary max-w-2xl mx-auto">
              Doctores verificados disponibles para consulta inmediata por WhatsApp
            </MobileSpacing.Text>
          </div>

          {/* Filters */}
          <MobileSpacing.Card className="mb-6 sm:mb-8">
            <MobileSpacing.Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-ink-primary mb-2">
                  Buscar doctor
                </label>
                <MobileSpacing.Input
                  type="text"
                  placeholder="Nombre o especialidad..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full border border-ink-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
            </MobileSpacing.Grid>
          </MobileSpacing.Card>

          {/* Doctors Grid */}
          {error ? (
            <Alert variant="error" title="Error al cargar doctores">
              {error}
              <div className="mt-3">
                <Button size="sm" onClick={fetchDoctors}>
                  Reintentar
                </Button>
              </div>
            </Alert>
          ) : loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </Card>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <NoResultsEmptyState 
              onClearFilters={() => setFilters({ specialty: '', search: '', available: false })}
            />
          ) : (
            <MobileSpacing.Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
              {doctors.map((doctor) => (
                <Card
                  key={doctor.user_id}
                  className="group hover:shadow-lg hover:border-brand-300 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/doctors/${doctor.user_id}`)}
                >
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-medical-500 to-medical-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {doctor.users?.name?.charAt(0) || 'D'}
                      </div>
                      {doctor.license_status === 'verified' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-ink-primary truncate">
                          {doctor.users?.name || 'Dr. Sin Nombre'}
                        </h3>
                        {doctor.license_status === 'verified' && (
                          <svg className="w-5 h-5 text-brand-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-brand-600 font-medium">{doctor.specialties?.join(', ') || 'Especialidad no especificada'}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-ink-secondary line-clamp-2 mb-4">
                    {doctor.bio || 'Doctor verificado disponible para consulta.'}
                  </p>

                  {/* Trust Badges */}
                  <div className="mb-4">
                    <TrustBadges doctorId={doctor.user_id} showAll={false} />
                  </div>

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
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/doctors/${doctor.user_id}`);
                    }}
                  >
                    Ver perfil
                  </Button>
                </Card>
              ))}
            </MobileSpacing.Grid>
          )}
        </MobileSpacing.Container>
      </div>
    </Layout>
  );
}
