import { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, Clock, Star, CheckCircle, Stethoscope, Filter, Search } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviewCount: number;
  availableToday: boolean;
  nextAvailable: string;
  location?: string;
  distance?: string;
  languages?: string[];
  acceptsInsurance?: boolean;
  telemedicine?: boolean;
  matchScore?: number;
  education?: string;
  experience?: number;
}

interface DoctorRecommendationProps {
  symptomId?: string;
  symptomName?: string;
  recommendedSpecialties: string[];
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  onBookAppointment: (doctorId: string, appointmentType: 'in_person' | 'telemedicine') => void;
  onViewProfile: (doctorId: string) => void;
  onSeeMore: (specialty?: string) => void;
}

const DoctorRecommendation: React.FC<DoctorRecommendationProps> = ({
  symptomId,
  symptomName,
  recommendedSpecialties,
  urgency,
  onBookAppointment,
  onViewProfile,
  onSeeMore
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialty, setSpecialty] = useState<string>(recommendedSpecialties[0] || 'Medicina General');
  const [sortBy, setSortBy] = useState<'match' | 'availability' | 'rating'>('match');
  const [filterTelehealth, setFilterTelehealth] = useState<boolean>(urgency === 'urgent' || urgency === 'emergency');
  const [availableToday, setAvailableToday] = useState<boolean>(urgency === 'urgent' || urgency === 'emergency');
  
  // Mock API call to fetch doctors
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API delay
    const timerId = setTimeout(() => {
      // Generate mock doctors based on specialty and filters
      const mockDoctors = generateMockDoctors(specialty, recommendedSpecialties);
      
      // Apply filters
      let filteredDoctors = [...mockDoctors];
      
      if (filterTelehealth) {
        filteredDoctors = filteredDoctors.filter(doctor => doctor.telemedicine);
      }
      
      if (availableToday) {
        filteredDoctors = filteredDoctors.filter(doctor => doctor.availableToday);
      }
      
      // Apply sorting
      if (sortBy === 'match') {
        filteredDoctors.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      } else if (sortBy === 'availability') {
        filteredDoctors.sort((a, b) => {
          if (a.availableToday && !b.availableToday) return -1;
          if (!a.availableToday && b.availableToday) return 1;
          return 0;
        });
      } else if (sortBy === 'rating') {
        filteredDoctors.sort((a, b) => b.rating - a.rating);
      }
      
      setDoctors(filteredDoctors);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timerId);
  }, [specialty, sortBy, filterTelehealth, availableToday, recommendedSpecialties]);

  // Generate mock doctors based on specialty
  const generateMockDoctors = (primarySpecialty: string, allSpecialties: string[]): Doctor[] => {
    // Base doctors that match the primary specialty
    const primaryDoctors: Doctor[] = [
      {
        id: `${primarySpecialty.toLowerCase().replace(/\s+/g, '-')}-1`,
        name: `Dr. Ana García`,
        specialty: primarySpecialty,
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=256&q=80',
        rating: 4.9,
        reviewCount: 124,
        availableToday: true,
        nextAvailable: 'Hoy, 15:30',
        location: 'Clínica Médica Central',
        distance: '2.5 km',
        languages: ['Español', 'Inglés'],
        acceptsInsurance: true,
        telemedicine: true,
        matchScore: 95,
        education: 'Universidad Nacional Autónoma de México',
        experience: 12
      },
      {
        id: `${primarySpecialty.toLowerCase().replace(/\s+/g, '-')}-2`,
        name: `Dr. Carlos Mendoza`,
        specialty: primarySpecialty,
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&w=256&q=80',
        rating: 4.8,
        reviewCount: 98,
        availableToday: false,
        nextAvailable: 'Mañana, 10:00',
        location: 'Hospital San Rafael',
        distance: '4.1 km',
        languages: ['Español'],
        acceptsInsurance: true,
        telemedicine: true,
        matchScore: 88,
        education: 'Universidad Autónoma de Guadalajara',
        experience: 8
      }
    ];
    
    // Add a doctor from another recommended specialty if available
    const otherSpecialty = allSpecialties.find(s => s !== primarySpecialty);
    if (otherSpecialty) {
      primaryDoctors.push({
        id: `${otherSpecialty.toLowerCase().replace(/\s+/g, '-')}-1`,
        name: `Dra. María Rodríguez`,
        specialty: otherSpecialty,
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&w=256&q=80',
        rating: 4.7,
        reviewCount: 156,
        availableToday: true,
        nextAvailable: 'Hoy, 17:00',
        location: 'Centro Médico Nacional',
        distance: '1.8 km',
        languages: ['Español', 'Francés'],
        acceptsInsurance: true,
        telemedicine: true,
        matchScore: 82,
        education: 'Universidad Complutense de Madrid',
        experience: 15
      });
    }
    
    // Add a general practitioner as a backup
    if (!allSpecialties.includes('Medicina General')) {
      primaryDoctors.push({
        id: 'medicina-general-1',
        name: 'Dr. Javier López',
        specialty: 'Medicina General',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&w=256&q=80',
        rating: 4.6,
        reviewCount: 210,
        availableToday: true,
        nextAvailable: 'Hoy, 12:15',
        location: 'Consulta Privada',
        distance: '0.9 km',
        languages: ['Español', 'Inglés'],
        acceptsInsurance: true,
        telemedicine: true,
        matchScore: 75,
        education: 'Universidad de Barcelona',
        experience: 20
      });
    }
    
    return primaryDoctors;
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={14} className="text-yellow-400 fill-yellow-400" />
        ))}
        {halfStar && (
          <span className="relative">
            <Star size={14} className="text-gray-300" />
            <span className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
            </span>
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center">
          <Stethoscope size={20} className="mr-2" />
          Especialistas Recomendados
        </h3>
      </div>

      <div className="p-6">
        {/* Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Filter size={16} className="mr-1 text-gray-500" />
              Especialidad:
            </label>
            <div className="flex flex-wrap gap-2">
              {recommendedSpecialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSpecialty(spec)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    specialty === spec
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
              <button
                onClick={() => setSpecialty('Medicina General')}
                className={`px-3 py-1 text-sm rounded-full ${
                  specialty === 'Medicina General'
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Medicina General
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center whitespace-nowrap">
                <Clock size={16} className="mr-1 text-gray-500" />
                Ordenar por:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'match' | 'availability' | 'rating')}
                className="text-sm rounded-md border-gray-300 py-1 pl-2 pr-8"
              >
                <option value="match">Mejor coincidencia</option>
                <option value="availability">Disponibilidad</option>
                <option value="rating">Calificación</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="filter-telehealth"
                checked={filterTelehealth}
                onChange={(e) => setFilterTelehealth(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="filter-telehealth" className="ml-2 text-sm text-gray-700">
                Telemedicina
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="filter-today"
                checked={availableToday}
                onChange={(e) => setAvailableToday(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="filter-today" className="ml-2 text-sm text-gray-700">
                Disponible hoy
              </label>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Buscando especialistas disponibles...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && doctors.length === 0 && (
          <div className="py-8 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-3" />
            <h4 className="text-gray-500 text-lg font-medium mb-1">No se encontraron especialistas</h4>
            <p className="text-gray-400 mb-4">
              No hay especialistas que coincidan con los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setFilterTelehealth(false);
                setAvailableToday(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Restablecer filtros
            </button>
          </div>
        )}

        {/* Doctor Cards */}
        {!isLoading && doctors.length > 0 && (
          <div className="space-y-6">
            {doctors.map((doctor) => (
              <div 
                key={doctor.id}
                className="border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition"
              >
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row">
                  {/* Doctor Image and Quick Info */}
                  <div className="mb-4 sm:mb-0 sm:mr-6 flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      {doctor.availableToday && (
                        <div className="absolute -bottom-1 -right-1 bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full border border-white flex items-center">
                          <Clock size={10} className="mr-1" />
                          Hoy
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      {renderStars(doctor.rating)}
                      <div className="text-xs text-gray-500">{doctor.reviewCount} reseñas</div>
                    </div>
                  </div>
                  
                  {/* Doctor Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-gray-600">{doctor.specialty}</p>
                      </div>
                      {doctor.matchScore && (
                        <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium flex items-center">
                          <CheckCircle size={14} className="mr-1" />
                          {doctor.matchScore}% coincidencia
                        </div>
                      )}
                    </div>
                    
                    {/* Doctor Location and Languages */}
                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
                      {doctor.location && (
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          {doctor.location}
                          {doctor.distance && <span className="ml-1 text-gray-400">({doctor.distance})</span>}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-gray-400" />
                        Próxima cita: {doctor.nextAvailable}
                      </div>
                      
                      {doctor.languages && doctor.languages.length > 0 && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-gray-400">
                            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 104 0v-4"></path>
                            <path d="M9 14h10"></path>
                          </svg>
                          {doctor.languages.join(', ')}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onBookAppointment(doctor.id, 'in_person')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                      >
                        <Calendar size={16} className="mr-2" />
                        Agendar Cita
                      </button>
                      
                      {doctor.telemedicine && (
                        <button
                          onClick={() => onBookAppointment(doctor.id, 'telemedicine')}
                          className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center ${
                            urgency === 'urgent' || urgency === 'emergency'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          <Video size={16} className="mr-2" />
                          {urgency === 'urgent' || urgency === 'emergency'
                            ? 'Telemedicina Urgente'
                            : 'Telemedicina'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => onViewProfile(doctor.id)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                      >
                        Ver Perfil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-6">
              <button
                onClick={() => onSeeMore(specialty)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver más especialistas
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Las especialidades recomendadas se basan en los síntomas reportados. Consulte con su médico para obtener la referencia más adecuada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorRecommendation;