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
import GoogleMaps from '../components/GoogleMaps';
import DoctorImage from '../components/DoctorImage';

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    specialty: '',
    search: '',
    available: false,
    location: '',
    gender: '',
    language: '',
    insurance: '',
    priceRange: '',
    experience: ''
  });
  const [sortBy, setSortBy] = useState('rating');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDoctors: 0,
    doctorsPerPage: 12
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const navigate = useNavigate();

  const specialties = [
    'Todas las especialidades',
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Pediatría',
    'Psiquiatría',
    'Neurología',
    'Oftalmología',
    'Otorrinolaringología',
    'Traumatología',
    'Urología',
    'Gastroenterología',
    'Endocrinología',
    'Neumología',
    'Oncología',
    'Anestesiología',
    'Cirugía General',
    'Medicina Interna',
    'Radiología',
    'Medicina Familiar',
    'Geriatría',
    'Infectología',
    'Nefrología',
    'Reumatología',
    'Hematología',
    'Alergología',
    'Inmunología',
    'Nutriología',
    'Psicología',
    'Dentista'
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
      if (filters.location) {
        params.append('location', filters.location);
      }
      
      // Add sorting parameter
      params.append('sort', sortBy);
      
      // Add pagination parameters
      const offset = (pagination.currentPage - 1) * pagination.doctorsPerPage;
      params.append('limit', pagination.doctorsPerPage.toString());
      params.append('offset', offset.toString());

      // Use local API for development, Netlify functions for production
      const isLocal = window.location.hostname === 'localhost';
      const endpoint = isLocal ? `/api/doctors?${params.toString()}` : `/.netlify/functions/doctors?${params.toString()}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Error al cargar los doctores');
      }
      
      const data = await response.json();
      setDoctors(data.doctors || []);
      
      // Update pagination info
      const totalPages = Math.ceil(data.totalCount / pagination.doctorsPerPage);
      setPagination(prev => ({
        ...prev,
        totalPages,
        totalDoctors: data.totalCount || 0
      }));
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
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-6">
              Doctores verificados y especializados disponibles para consulta inmediata
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Icon name="user-group" size="sm" />
                <span>{pagination.totalDoctors || 1000}+ doctores verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="map-pin" size="sm" />
                <span>32 estados de México</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="clock" size="sm" />
                <span>Disponibles 24/7</span>
              </div>
            </div>
          </div>

                   {/* Filters */}
                   <div className="glass-card mb-8 sm:mb-12 p-6 sm:p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  <Icon name="map-pin" size="sm" className="inline mr-2" />
                  Ubicación
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Todas las ubicaciones</option>
                  <option value="Ciudad de México">Ciudad de México</option>
                  <option value="Guadalajara">Guadalajara</option>
                  <option value="Monterrey">Monterrey</option>
                  <option value="Puebla">Puebla</option>
                  <option value="Tijuana">Tijuana</option>
                  <option value="León">León</option>
                  <option value="Juárez">Juárez</option>
                  <option value="Torreón">Torreón</option>
                  <option value="Querétaro">Querétaro</option>
                  <option value="San Luis Potosí">San Luis Potosí</option>
                  <option value="Hermosillo">Hermosillo</option>
                  <option value="Saltillo">Saltillo</option>
                  <option value="Tampico">Tampico</option>
                  <option value="Culiacán">Culiacán</option>
                  <option value="Morelia">Morelia</option>
                  <option value="Oaxaca">Oaxaca</option>
                  <option value="Tuxtla Gutiérrez">Tuxtla Gutiérrez</option>
                  <option value="Villahermosa">Villahermosa</option>
                  <option value="Campeche">Campeche</option>
                  <option value="Aguascalientes">Aguascalientes</option>
                  <option value="Colima">Colima</option>
                  <option value="Durango">Durango</option>
                  <option value="Acapulco">Acapulco</option>
                  <option value="Pachuca">Pachuca</option>
                  <option value="Toluca">Toluca</option>
                  <option value="Cuernavaca">Cuernavaca</option>
                  <option value="Tepic">Tepic</option>
                  <option value="Mérida">Mérida</option>
                  <option value="Cancún">Cancún</option>
                  <option value="Playa del Carmen">Playa del Carmen</option>
                  <option value="Mexicali">Mexicali</option>
                  <option value="Ensenada">Ensenada</option>
                  <option value="Chihuahua">Chihuahua</option>
                  <option value="Ciudad Obregón">Ciudad Obregón</option>
                  <option value="Reynosa">Reynosa</option>
                  <option value="Mazatlán">Mazatlán</option>
                  <option value="Uruapan">Uruapan</option>
                  <option value="Zacatecas">Zacatecas</option>
                  <option value="Fresnillo">Fresnillo</option>
                  <option value="Guadalupe">Guadalupe</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  <Icon name="user" size="sm" className="inline mr-2" />
                  Género
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Cualquier género</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  <Icon name="language" size="sm" className="inline mr-2" />
                  Idioma
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Cualquier idioma</option>
                  <option value="spanish">Español</option>
                  <option value="english">Inglés</option>
                  <option value="french">Francés</option>
                  <option value="german">Alemán</option>
                </select>
              </div>

              {/* Insurance */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  <Icon name="shield-check" size="sm" className="inline mr-2" />
                  Aseguradora
                </label>
                <select
                  value={filters.insurance}
                  onChange={(e) => setFilters({ ...filters, insurance: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Cualquier aseguradora</option>
                  <option value="particular">Particular</option>
                  <option value="imss">IMSS</option>
                  <option value="issste">ISSSTE</option>
                  <option value="seguro-popular">Seguro Popular</option>
                  <option value="gnp">GNP</option>
                  <option value="axa">AXA</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  <Icon name="currency-dollar" size="sm" className="inline mr-2" />
                  Rango de Precio
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Cualquier precio</option>
                  <option value="0-500">$0 - $500 MXN</option>
                  <option value="500-1000">$500 - $1,000 MXN</option>
                  <option value="1000-1500">$1,000 - $1,500 MXN</option>
                  <option value="1500-2000">$1,500 - $2,000 MXN</option>
                  <option value="2000+">$2,000+ MXN</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  <Icon name="academic-cap" size="sm" className="inline mr-2" />
                  Experiencia
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Cualquier experiencia</option>
                  <option value="0-5">0-5 años</option>
                  <option value="5-10">5-10 años</option>
                  <option value="10-20">10-20 años</option>
                  <option value="20+">20+ años</option>
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

          {/* Results Summary */}
          {!loading && !error && (
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                {pagination.totalDoctors > 0 ? (
                  <>
                    Mostrando <span className="font-semibold text-neutral-900">{doctors.length}</span> de{' '}
                    <span className="font-semibold text-neutral-900">{pagination.totalDoctors}</span> doctores
                    {filters.specialty && filters.specialty !== 'Todas las especialidades' && (
                      <span> en <span className="font-semibold text-primary-600">{filters.specialty}</span></span>
                    )}
                    {filters.location && (
                      <span> en <span className="font-semibold text-primary-600">{filters.location}</span></span>
                    )}
                  </>
                ) : (
                  'No se encontraron doctores'
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">Ordenar por:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      fetchDoctors();
                    }}
                    className="text-sm border border-neutral-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="rating">Mejor calificados</option>
                    <option value="price">Precio más bajo</option>
                    <option value="availability">Más disponibles</option>
                    <option value="distance">Más cercanos</option>
                  </select>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-neutral-600 hover:text-neutral-800'
                    }`}
                  >
                    <Icon name="squares-2x2" size="sm" className="mr-1" />
                    Lista
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'map' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-neutral-600 hover:text-neutral-800'
                    }`}
                  >
                    <Icon name="map" size="sm" className="mr-1" />
                    Mapa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
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
                onClick={() => setFilters({ specialty: '', search: '', available: false, location: '' })}
                variant="secondary"
              >
                <Icon name="x-mark" size="sm" className="mr-2" />
                Limpiar filtros
              </Button>
            </div>
          ) : viewMode === 'map' ? (
            /* Map View */
            <div className="glass-card p-6">
              <GoogleMaps
                doctors={doctors}
                center={{ lat: 19.4326, lng: -99.1332 }}
                zoom={10}
                height="600px"
                showSearch={true}
                onDoctorSelect={(doctorId) => navigate(`/doctors/${doctorId}`)}
                className="rounded-lg"
              />
            </div>
          ) : (
            /* Grid View */
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
                      <DoctorImage 
                        doctorName={doctor.full_name || doctor.users?.name || 'Dr. Sin Nombre'}
                        size="md"
                      />
                      {doctor.license_status === 'verified' && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 border-2 border-white rounded-full flex items-center justify-center">
                          <Icon name="check" size="xs" className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-neutral-900 truncate text-lg">
                          {doctor.full_name || doctor.users?.name || 'Dr. Sin Nombre'}
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
                    icon="eye"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/doctors/${doctor.user_id}`);
                    }}
                    className="group-hover:shadow-lg transition-all duration-200"
                  >
                    Ver perfil completo
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && doctors.length > 0 && pagination.totalPages > 1 && (
            <div className="glass-card mt-8 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Mostrando {((pagination.currentPage - 1) * pagination.doctorsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.doctorsPerPage, pagination.totalDoctors)} de {pagination.totalDoctors} doctores
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                      fetchDoctors();
                    }}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2"
                  >
                    <Icon name="chevron-left" size="sm" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                      if (pageNum > pagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.currentPage ? "primary" : "secondary"}
                          onClick={() => {
                            setPagination(prev => ({ ...prev, currentPage: pageNum }));
                            fetchDoctors();
                          }}
                          className="px-3 py-2 min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                      fetchDoctors();
                    }}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-2"
                  >
                    <Icon name="chevron-right" size="sm" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
