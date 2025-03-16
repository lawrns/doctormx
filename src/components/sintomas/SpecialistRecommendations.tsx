import { FC } from 'react';
import { 
  Star, 
  Calendar, 
  Video, 
  ChevronRight, 
  Clock, 
  CheckCircle,
  Award
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviewCount: number;
  availableToday: boolean;
  nextAvailable: string;
  matchScore: number;
}

interface SpecialistRecommendationsProps {
  doctors: Doctor[];
  onBookAppointment: (doctorId: string) => void;
  onViewProfile: (doctorId: string) => void;
}

const SpecialistRecommendations: FC<SpecialistRecommendationsProps> = ({
  doctors,
  onBookAppointment,
  onViewProfile
}) => {
  // Helper function to render rating stars
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={16} className="text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star size={16} className="text-gray-300 fill-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} className="text-gray-300 fill-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Helper function to get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {doctors.map((doctor) => (
        <div 
          key={doctor.id}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start">
            {/* Doctor Image */}
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <div className="relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200"
                />
                {doctor.availableToday && (
                  <div className="absolute -bottom-1 -right-1 bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full border border-white flex items-center">
                    <Clock size={12} className="mr-1" />
                    Hoy
                  </div>
                )}
              </div>
            </div>
            
            {/* Doctor Info */}
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-gray-600">{doctor.specialty}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(doctor.matchScore)} flex items-center`}>
                  <Award size={14} className="mr-1" />
                  {doctor.matchScore}% coincidencia
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {renderRatingStars(doctor.rating)}
                <span className="text-sm text-gray-500 ml-2">({doctor.reviewCount} reseñas)</span>
              </div>
              
              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
                <div className="flex items-center mr-4 mb-2 sm:mb-0">
                  <Clock size={16} className="mr-1 text-blue-500" />
                  Próxima cita: {doctor.nextAvailable}
                </div>
                {doctor.availableToday && (
                  <div className="flex items-center mb-2 sm:mb-0">
                    <CheckCircle size={16} className="mr-1 text-green-500" />
                    Disponible para telemedicina hoy
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => onBookAppointment(doctor.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <Calendar size={16} className="mr-2" />
                  Agendar Cita
                </button>
                
                {doctor.availableToday && (
                  <button
                    onClick={() => onBookAppointment(doctor.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                  >
                    <Video size={16} className="mr-2" />
                    Consulta Virtual
                  </button>
                )}
                
                <button
                  onClick={() => onViewProfile(doctor.id)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                >
                  Ver Perfil
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {doctors.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No se encontraron especialistas que coincidan con tus criterios.</p>
        </div>
      )}
    </div>
  );
};

export default SpecialistRecommendations;