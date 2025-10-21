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
    doctorsPerPage: 20
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [showFilters, setShowFilters] = useState(false);
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

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {filters.specialty && filters.specialty !== 'Todas las especialidades' 
                ? `${filters.specialty}s en ${filters.location || 'México'}`
                : 'Doctores en México'
              }
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{pagination.totalDoctors || 1000}+ doctores verificados</span>
              <span>•</span>
              <span>32 estados de México</span>
              <span>•</span>
              <span>Disponibles 24/7</span>
            </div>
          </div>

          {/* Compact Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="especialidad, enfermedad o nombre"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <Icon name="magnifying-glass" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Location */}
              <div className="min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="p. ej. Guadalajara"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <Icon name="map-pin" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Icon name="video-camera" size="sm" />
                  <span>Consulta en línea</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Icon name="calendar-days" size="sm" />
                  <span>Fechas disponibles</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Icon name="shield-check" size="sm" />
                  <span>Seguro</span>
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Icon name="adjustments-horizontal" size="sm" />
                  <span>Más filtros</span>
                  <Icon name="chevron-down" size="sm" className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Specialty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                    <select
                      value={filters.specialty}
                      onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {specialties.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Cualquier género</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                    <select
                      value={filters.language}
                      onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Cualquier idioma</option>
                      <option value="spanish">Español</option>
                      <option value="english">Inglés</option>
                      <option value="french">Francés</option>
                      <option value="german">Alemán</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Cualquier precio</option>
                      <option value="0-500">$0 - $500 MXN</option>
                      <option value="500-1000">$500 - $1,000 MXN</option>
                      <option value="1000-1500">$1,000 - $1,500 MXN</option>
                      <option value="1500-2000">$1,500 - $2,000 MXN</option>
                      <option value="2000+">$2,000+ MXN</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Layout */}
          <div className="flex gap-6">
            {/* Doctors List */}
            <div className="flex-1">
              {/* Results Summary */}
              {!loading && !error && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {pagination.totalDoctors > 0 ? (
                      <>
                        Los <span className="font-semibold text-gray-900">{pagination.totalDoctors}</span> doctores más recomendados
                        {filters.location && (
                          <span> en <span className="font-semibold text-blue-600">{filters.location}</span></span>
                        )}
                      </>
                    ) : (
                      'No se encontraron doctores'
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Ordenar por:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        fetchDoctors();
                      }}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="rating">Mejor calificados</option>
                      <option value="price">Precio más bajo</option>
                      <option value="availability">Más disponibles</option>
                      <option value="distance">Más cercanos</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Content Area */}
              {error ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <Icon name="exclamation-triangle" size="lg" className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar doctores</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={fetchDoctors} variant="primary">
                    <Icon name="arrow-path" size="sm" className="mr-2" />
                    Reintentar
                  </Button>
                </div>
              ) : loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <Icon name="user-group" size="xl" className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron doctores</h3>
                  <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
                  <Button 
                    onClick={() => setFilters({ specialty: '', search: '', available: false, location: '' })}
                    variant="secondary"
                  >
                    <Icon name="x-mark" size="sm" className="mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                /* Doctor List */
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.user_id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/doctors/${doctor.user_id}`)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Doctor Image */}
                               <div className="relative flex-shrink-0">
                                 <DoctorImage 
                                   doctorName={doctor.full_name || doctor.users?.name || 'Dr. Sin Nombre'}
                                   doctorLocation={doctor.location}
                                   size="md"
                                 />
                                 {doctor.license_status === 'verified' && (
                                   <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                     <Icon name="check" size="xs" className="text-white" />
                                   </div>
                                 )}
                               </div>

                        {/* Doctor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {doctor.full_name || doctor.users?.name || 'Dr. Sin Nombre'}
                                </h3>
                                {doctor.license_status === 'verified' && (
                                  <Icon name="shield-check" size="sm" className="text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-blue-600 font-medium">
                                {doctor.specialties?.join(', ') || 'Especialidad no especificada'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Icon name="star" size="sm" className="text-yellow-500" />
                                <span className="text-sm font-medium">{doctor.rating_avg || '4.8'}</span>
                                <span className="text-sm text-gray-500">({doctor.total_reviews || '0'} opiniones)</span>
                              </div>
                            </div>
                          </div>

                          {/* Doctor Details */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Icon name="map-pin" size="sm" />
                              <span>{doctor.location?.city || 'Ciudad de México'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="clock" size="sm" />
                              <span>Respuesta rápida</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="video-camera" size="sm" />
                              <span>Consulta en línea</span>
                            </div>
                          </div>

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-gray-500">Primera visita</span>
                              <p className="text-lg font-bold text-gray-900">
                                ${doctor.consultation_fees?.base_fee || '800'} MXN
                              </p>
                            </div>
                            <Button
                              variant="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/doctors/${doctor.user_id}`);
                              }}
                              className="px-6 py-2"
                            >
                              Ver perfil
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Google Maps Sidebar */}
            <div className="w-96 flex-shrink-0">
              <div className="sticky top-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Ubicaciones</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Ampliar mapa
                    </button>
                  </div>
                  <GoogleMaps
                    doctors={doctors}
                    center={{ lat: 19.4326, lng: -99.1332 }}
                    zoom={10}
                    height="400px"
                    showSearch={false}
                    onDoctorSelect={(doctorId) => navigate(`/doctors/${doctorId}`)}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {!loading && !error && doctors.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                    fetchDoctors();
                  }}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="chevron-left" size="sm" />
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(7, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.currentPage - 3) + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setPagination(prev => ({ ...prev, currentPage: pageNum }));
                          fetchDoctors();
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNum === pagination.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {pagination.totalPages > 7 && pagination.currentPage < pagination.totalPages - 3 && (
                    <>
                      <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      <button
                        onClick={() => {
                          setPagination(prev => ({ ...prev, currentPage: pagination.totalPages }));
                          fetchDoctors();
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                    fetchDoctors();
                  }}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="chevron-right" size="sm" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
