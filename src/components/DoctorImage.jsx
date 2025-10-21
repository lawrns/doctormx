import { useState } from 'react';

export default function DoctorImage({ doctorName, className = '', size = 'md' }) {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const imageName = doctorName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
  
  const possiblePaths = [
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
