import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Search, Filter, Star, Clock, Phone, 
  Calendar, Navigation, User, Stethoscope,
  Award, Languages, DollarSign, ChevronRight, Map
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  distance: number;
  available: boolean;
  nextSlot: string;
  languages: string[];
  experience: number;
  price: string;
  address: string;
  phone: string;
  image: string;
  coords: [number, number];
  certifications: string[];
}

interface Specialty {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const DoctorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchLocation, setSearchLocation] = useState('');

  const specialties: Specialty[] = [
    { id: 'all', name: 'Todas las especialidades', icon: '🏥', count: 147 },
    { id: 'cardiology', name: 'Cardiología', icon: '❤️', count: 23 },
    { id: 'dermatology', name: 'Dermatología', icon: '🩺', count: 18 },
    { id: 'neurology', name: 'Neurología', icon: '🧠', count: 15 },
    { id: 'pediatrics', name: 'Pediatría', icon: '👶', count: 31 },
    { id: 'orthopedics', name: 'Traumatología', icon: '🦴', count: 22 },
    { id: 'gynecology', name: 'Ginecología', icon: '👩‍⚕️', count: 19 },
    { id: 'psychiatry', name: 'Psiquiatría', icon: '🧘', count: 14 },
    { id: 'internal', name: 'Medicina Interna', icon: '⚕️', count: 26 }
  ];

  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dra. María González',
      specialty: 'Cardiología',
      rating: 4.8,
      reviews: 127,
      distance: 0.8,
      available: true,
      nextSlot: 'Hoy 2:30 PM',
      languages: ['Español', 'Inglés'],
      experience: 12,
      price: '$800 - $1,200',
      address: 'Av. Reforma 123, Colonia Centro',
      phone: '+52 55 1234 5678',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
      coords: [19.4326, -99.1332],
      certifications: ['Cardiología Intervencionista', 'Certificado por CMCC']
    },
    {
      id: '2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'Dermatología',
      rating: 4.9,
      reviews: 89,
      distance: 1.2,
      available: false,
      nextSlot: 'Mañana 9:00 AM',
      languages: ['Español', 'Francés'],
      experience: 8,
      price: '$600 - $900',
      address: 'Calle Insurgentes 456, Roma Norte',
      phone: '+52 55 2345 6789',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
      coords: [19.4284, -99.1407],
      certifications: ['Dermatología Cosmética', 'Especialista en Láser']
    },
    {
      id: '3',
      name: 'Dra. Ana Rodríguez',
      specialty: 'Pediatría',
      rating: 4.7,
      reviews: 156,
      distance: 2.1,
      available: true,
      nextSlot: 'Hoy 4:00 PM',
      languages: ['Español'],
      experience: 15,
      price: '$500 - $800',
      address: 'Av. Universidad 789, Del Valle',
      phone: '+52 55 3456 7890',
      image: 'https://images.unsplash.com/photo-1594824541406-27717d7e3b59?w=300&h=300&fit=crop&crop=face',
      coords: [19.3895, -99.1677],
      certifications: ['Pediatría General', 'Neonatología']
    }
  ]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          setLocationError('No se pudo obtener tu ubicación. Mostrando doctores en Ciudad de México.');
          // Fallback to Mexico City coordinates
          setUserLocation([19.4326, -99.1332]);
        }
      );
    } else {
      setLocationError('Tu navegador no soporta geolocalización.');
      setUserLocation([19.4326, -99.1332]);
    }
  }, []);

  const filteredDoctors = doctors
    .filter(doctor => 
      (selectedSpecialty === 'all' || doctor.specialty.toLowerCase().includes(selectedSpecialty)) &&
      (searchTerm === '' || 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return parseInt(a.price.match(/\d+/)?.[0] || '0') - parseInt(b.price.match(/\d+/)?.[0] || '0');
        default:
          return a.distance - b.distance;
      }
    });

  const DoctorCard: React.FC<{ doctor: Doctor; index: number }> = ({ doctor, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            doctor.available ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
              <p className="text-brand-jade-600 font-medium">{doctor.specialty}</p>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span>{doctor.rating}</span>
                  <span className="ml-1">({doctor.reviews} reseñas)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{doctor.distance} km</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  <span>{doctor.experience} años</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{doctor.price}</p>
              <p className="text-sm text-gray-600">por consulta</p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{doctor.nextSlot}</span>
            </div>
            <div className="flex items-center">
              <Languages className="w-4 h-4 mr-1" />
              <span>{doctor.languages.join(', ')}</span>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {doctor.certifications.slice(0, 2).map((cert, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-brand-jade-50 text-brand-jade-700 text-xs rounded-full"
              >
                {cert}
              </span>
            ))}
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button className="flex-1 bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors flex items-center justify-center">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Cita
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowMap(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page Header - more compact */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buscar Doctores</h1>
            <p className="text-gray-600 mt-1">Encuentra especialistas cercanos y agenda tu cita</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMapView}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showMap 
                  ? 'bg-brand-jade-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Map className="w-4 h-4" />
              {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters - improved layout */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Location Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Ciudad o código postal"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>

          {/* Specialty Filter */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
          >
            <option value="">Todas las especialidades</option>
            <option value="medicina-general">Medicina General</option>
            <option value="cardiologia">Cardiología</option>
            <option value="dermatologia">Dermatología</option>
            <option value="ginecologia">Ginecología</option>
            <option value="pediatria">Pediatría</option>
            <option value="neurologia">Neurología</option>
          </select>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
          >
            <option value="distance">Distancia</option>
            <option value="rating">Calificación</option>
            <option value="price">Precio</option>
            <option value="availability">Disponibilidad</option>
          </select>

          {/* Search Button */}
          <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Results Panel */}
          <div className={`${showMap ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200`}>
            {/* Results Header */}
            <div className="bg-white px-6 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredDoctors.length} doctores encontrados cerca de {searchLocation || 'tu ubicación'}
                </p>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Filtros aplicados: {getActiveFiltersCount()}</span>
                </div>
              </div>
            </div>

            {/* Doctor Cards - improved density */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Doctor Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={doctor.image} 
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                              }
                            }}
                          />
                        </div>

                        {/* Doctor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{doctor.name}</h3>
                              <p className="text-brand-jade-600 font-medium">{doctor.specialty}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="font-medium">{doctor.rating}</span>
                                  <span>({doctor.reviews} reseñas)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>{doctor.distance} km</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{doctor.nextSlot}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <div className="text-lg font-bold text-gray-900">${doctor.price}</div>
                              <div className="text-sm text-gray-600">consulta</div>
                            </div>
                          </div>

                          {/* Quick Info */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {doctor.certifications.slice(0, 2).map((cert, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {cert}
                              </span>
                            ))}
                            {doctor.languages.includes('Inglés') && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                Inglés
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex gap-3">
                            <button className="flex-1 bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors text-sm font-medium">
                              Agendar Cita
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                              Ver Perfil
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                              Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Panel */}
          {showMap && (
            <div className="w-1/2 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mapa Interactivo</h3>
                <p className="text-gray-600 mb-4">Visualiza la ubicación de doctores cercanos</p>
                <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-sm">
                  <p className="text-sm text-gray-600">
                    Integración de Google Maps estará disponible próximamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function getActiveFiltersCount(): number {
    let count = 0;
    if (selectedSpecialty) count++;
    if (searchLocation) count++;
    if (sortBy !== 'distance') count++;
    return count;
  }
};

export default DoctorsPage; 