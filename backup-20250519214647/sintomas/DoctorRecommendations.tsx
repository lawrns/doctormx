import React, { useState } from 'react';
import { Star, Calendar, Video, MapPin, ChevronRight, Filter } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  subspecialty?: string;
  image: string;
  rating: number;
  reviewCount: number;
  appointmentAvailability: {
    nextAvailable: string;
    availableToday: boolean;
    soonestTimes?: string[];
  };
  telemedicine: boolean;
  location: {
    address: string;
    city: string;
    distance?: string;
  };
  insuranceAccepted: string[];
  languages: string[];
  matchScore: number;
  matchReason?: string;
}

interface DoctorRecommendationsProps {
  symptomId?: string;
  condition?: string;
  specialty?: string;
  doctors?: Doctor[];
  onBookAppointment: (doctorId: string) => void;
  onViewProfile: (doctorId: string) => void;
  onSearchMore: () => void;
}

const DoctorRecommendations: React.FC<DoctorRecommendationsProps> = ({
  symptomId,
  condition,
  specialty,
  doctors: propDoctors,
  onBookAppointment,
  onViewProfile,
  onSearchMore
}) => {
  const [filters, setFilters] = useState({
    showTelemedicineOnly: false,
    availableToday: false,
    specialty: specialty || 'all'
  });

  // Mock doctors if none provided
  const defaultDoctors: Doctor[] = [
    {
      id: '1',
      name: 'Dra. Ana García',
      title: 'MD',
      specialty: 'Neurología',
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
      rating: 4.9,
      reviewCount: 124,
      appointmentAvailability: {
        nextAvailable: 'Hoy, 15:30',
        availableToday: true,
        soonestTimes: ['Hoy, 15:30', 'Hoy, 17:00', 'Mañana, 9:00']
      },
      telemedicine: true,
      location: {
        address: 'Calle Principal 123',
        city: 'Madrid',
        distance: '2.3 km'
      },
      insuranceAccepted: ['Adeslas', 'Sanitas', 'DKV'],
      languages: ['Español', 'Inglés'],
      matchScore: 95,
      matchReason: 'Especialista en migrañas y cefaleas'
    },
    {
      id: '2',
      name: 'Dr. Carlos Mendoza',
      title: 'MD, PhD',
      specialty: 'Neurología',
      subspecialty: 'Dolor de cabeza',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.8,
      reviewCount: 98,
      appointmentAvailability: {
        nextAvailable: 'Mañana, 10:00',
        availableToday: false,
        soonestTimes: ['Mañana, 10:00', 'Mañana, 16:30']
      },
      telemedicine: true,
      location: {
        address: 'Avenida Secundaria 45',
        city: 'Madrid',
        distance: '4.1 km'
      },
      insuranceAccepted: ['Mapfre', 'Sanitas'],
      languages: ['Español', 'Francés'],
      matchScore: 88
    },
    {
      id: '3',
      name: 'Dra. María Rodríguez',
      title: 'MD',
      specialty: 'Medicina General',
      image: 'https://randomuser.me/api/portraits/women/45.jpg',
      rating: 4.7,
      reviewCount: 156,
      appointmentAvailability: {
        nextAvailable: 'Hoy, 17:00',
        availableToday: true,
        soonestTimes: ['Hoy, 17:00', 'Mañana, 11:00', 'Mañana, 12:30']
      },
      telemedicine: true,
      location: {
        address: 'Plaza Central 78',
        city: 'Madrid',
        distance: '1.8 km'
      },
      insuranceAccepted: ['Adeslas', 'Asisa', 'DKV', 'Sanitas'],
      languages: ['Español', 'Inglés', 'Portugués'],
      matchScore: 82
    }
  ];

  const doctors = propDoctors || defaultDoctors;

  // Apply filters
  const filteredDoctors = doctors.filter(doctor => {
    if (filters.showTelemedicineOnly && !doctor.telemedicine) return false;
    if (filters.availableToday && !doctor.appointmentAvailability.availableToday) return false;
    if (filters.specialty !== 'all' && doctor.specialty !== filters.specialty) return false;
    return true;
  });

  // Sort by match score (highest first)
  const sortedDoctors = [...filteredDoctors].sort((a, b) => b.matchScore - a.matchScore);

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  // Determine specialty options from available doctors
  const specialtyOptions = Array.from(new Set(doctors.map(doctor => doctor.specialty)));

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-900">
          Médicos Recomendados {condition ? `para ${condition}` : ''}
        </h3>
        
        <div className="flex">
          <button 
            onClick={onSearchMore}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            Ver más opciones
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            <Filter size={16} className="mr-1" />
            Filtros:
          </span>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.telemedicine}
              onChange={e => handleFilterChange('showTelemedicineOnly', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm text-gray-700 ml-2">Solo telemedicina</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.availableToday}
              onChange={e => handleFilterChange('availableToday', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm text-gray-700 ml-2">Disponible hoy</span>
          </label>
          
          <div>
            <select
              value={filters.specialty}
              onChange={e => handleFilterChange('specialty', e.target.value)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las especialidades</option>
              {specialtyOptions.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedDoctors.length > 0 ? (
          sortedDoctors.map(doctor => (
            <div key={doctor.id} className="p-6">
              <div className="flex">
                {/* Doctor image */}
                <div className="flex-shrink-0 mr-4">
                  <div className="relative">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    {doctor.appointmentAvailability.availableToday && (
                      <span className="absolute -bottom-1 -right-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full border border-white">
                        Hoy
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Doctor info */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{doctor.name}</h4>
                      <p className="text-sm text-gray-600">
                        {doctor.title}{doctor.subspecialty ? `, ${doctor.subspecialty}` : ''}
                      </p>
                      <p className="text-gray-800">{doctor.specialty}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span className="text-gray-500 text-sm ml-1">({doctor.reviewCount})</span>
                      </div>
                      
                      <div className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full mt-1 inline-block">
                        {doctor.matchScore}% coincidencia
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-y-2">
                    <div className="w-full sm:w-1/2 flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      {doctor.location.city} • {doctor.location.distance}
                    </div>
                    
                    <div className="w-full sm:w-1/2 flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-1 text-gray-400" />
                      Próxima cita: {doctor.appointmentAvailability.nextAvailable}
                    </div>
                  </div>
                  
                  {doctor.matchReason && (
                    <div className="mt-2 text-sm text-green-600">
                      {doctor.matchReason}
                    </div>
                  )}
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => onBookAppointment(doctor.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
                    >
                      <Calendar size={14} className="mr-1" />
                      Agendar Cita
                    </button>
                    
                    {doctor.telemedicine && (
                      <button
                        onClick={() => onBookAppointment(doctor.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition flex items-center"
                      >
                        <Video size={14} className="mr-1" />
                        Telemedicina
                      </button>
                    )}
                    
                    <button
                      onClick={() => onViewProfile(doctor.id)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition"
                    >
                      Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No se encontraron médicos que coincidan con los filtros seleccionados.</p>
            <button
              onClick={() => setFilters({ showTelemedicineOnly: false, availableToday: false, specialty: 'all' })}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {sortedDoctors.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onSearchMore}
            className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Ver más especialistas
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorRecommendations;