import { useState } from 'react';

export default function DoctorImage({ doctorName, doctorLocation, className = '', size = 'md' }) {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const imageName = 'dr_' + doctorName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase();
  
  // Create location-based paths
  const getLocationPaths = (location) => {
    if (!location) return [];
    
    const state = location.state || location.city;
    const city = location.city;
    
    // Map common location names to directory paths
    const locationMap = {
      'CDMX': { state: 'Ciudad de México', city: 'ciudad-de-mexico' },
      'Ciudad de México': { state: 'Ciudad de México', city: 'ciudad-de-mexico' },
      'Guadalajara': { state: 'Jalisco', city: 'Guadalajara' },
      'Monterrey': { state: 'Nuevo León', city: 'Monterrey' },
      'Puebla': { state: 'Puebla', city: 'Puebla' },
      'León': { state: 'Guanajuato', city: 'leon' },
      'Cancún': { state: 'Quintana Roo', city: 'cancun' },
      'Mérida': { state: 'Yucatán', city: 'merida' },
      'Oaxaca': { state: 'Oaxaca', city: 'Oaxaca' },
      'Morelia': { state: 'Michoacán', city: 'Morelia' },
      'Hermosillo': { state: 'Sonora', city: 'Hermosillo' },
      'Culiacán': { state: 'Sinaloa', city: 'culiacan' },
      'Villahermosa': { state: 'Tabasco', city: 'Villahermosa' },
      'Tampico': { state: 'Tamaulipas', city: 'Tampico' },
      'Xalapa': { state: 'Veracruz', city: 'Xalapa' },
      'Chihuahua': { state: 'Chihuahua', city: 'Chihuahua' },
      'Saltillo': { state: 'Coahuila', city: 'Saltillo' },
      'Campeche': { state: 'Campeche', city: 'Campeche' },
      'Tuxtla Gutiérrez': { state: 'Chiapas', city: 'tuxtla-gutierrez' },
      'Aguascalientes': { state: 'Aguascalientes', city: 'Aguascalientes' },
      'Tijuana': { state: 'Baja California', city: 'Tijuana' }
    };
    
    const mappedLocation = locationMap[city] || locationMap[state];
    if (mappedLocation) {
      return [`/images/doctors/${mappedLocation.state}/${mappedLocation.city}/${imageName}.webp`];
    }
    
    return [];
  };
  
  // Start with location-specific paths, then fallback to all locations
  const locationPaths = getLocationPaths(doctorLocation);
  const fallbackPaths = [
    `/images/doctors/Nuevo León/Monterrey/${imageName}.webp`,
    `/images/doctors/Ciudad de México/ciudad-de-mexico/${imageName}.webp`,
    `/images/doctors/Jalisco/Guadalajara/${imageName}.webp`,
    `/images/doctors/Puebla/Puebla/${imageName}.webp`,
    `/images/doctors/Guanajuato/leon/${imageName}.webp`,
    `/images/doctors/Quintana Roo/cancun/${imageName}.webp`,
    `/images/doctors/Yucatán/merida/${imageName}.webp`,
    `/images/doctors/Oaxaca/Oaxaca/${imageName}.webp`,
    `/images/doctors/Michoacán/Morelia/${imageName}.webp`,
    `/images/doctors/Sonora/Hermosillo/${imageName}.webp`,
    `/images/doctors/Sinaloa/culiacan/${imageName}.webp`,
    `/images/doctors/Tabasco/Villahermosa/${imageName}.webp`,
    `/images/doctors/Tamaulipas/Tampico/${imageName}.webp`,
    `/images/doctors/Veracruz/Xalapa/${imageName}.webp`,
    `/images/doctors/Chihuahua/Chihuahua/${imageName}.webp`,
    `/images/doctors/Coahuila/Saltillo/${imageName}.webp`,
    `/images/doctors/Campeche/Campeche/${imageName}.webp`,
    `/images/doctors/Chiapas/tuxtla-gutierrez/${imageName}.webp`,
    `/images/doctors/Aguascalientes/Aguascalientes/${imageName}.webp`,
    `/images/doctors/Baja California/Tijuana/${imageName}.webp`
  ];
  
  const possiblePaths = [...locationPaths, ...fallbackPaths];
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };
  
  const handleImageError = () => {
    if (currentPathIndex < possiblePaths.length - 1) {
      setCurrentPathIndex(currentPathIndex + 1);
    } else {
      setImageError(true);
    }
  };
  
  if (imageError) {
    // Fallback to initials
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-lg ring-2 ring-white bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white font-bold ${className}`}>
        <span className={size === 'lg' || size === 'xl' ? 'text-2xl' : 'text-lg'}>
          {doctorName.charAt(0)}
        </span>
      </div>
    );
  }
  
  return (
    <img
      src={possiblePaths[currentPathIndex]}
      alt={doctorName}
      className={`${sizeClasses[size]} rounded-full object-cover shadow-lg ring-2 ring-white ${className}`}
      onError={handleImageError}
    />
  );
}
