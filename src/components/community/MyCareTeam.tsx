import React from 'react';
import { Link } from 'react-router-dom';
import { User, MessageCircle, Calendar, Plus, Clock, CheckCircle } from 'lucide-react';

// Types for care team members
interface Provider {
  id: string;
  name: string;
  specialty: string;
  image: string;
  verified: boolean;
  lastInteraction?: string;
  lastAppointment?: string;
  upcomingAppointment?: string;
  hasNewUpdates?: boolean;
}

interface MyCareTeamProps {
  providers: Provider[];
  onAddProvider?: () => void;
  onMessageProvider?: (providerId: string) => void;
  maxProviders?: number;
  showAddButton?: boolean;
}

const MyCareTeam: React.FC<MyCareTeamProps> = ({
  providers,
  onAddProvider,
  onMessageProvider,
  maxProviders = 4,
  showAddButton = true
}) => {
  // Format date for last interaction
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mi equipo médico</h2>
        <Link 
          to="/buscar" 
          className="text-blue-600 text-sm font-medium hover:text-blue-800"
        >
          Ver todos
        </Link>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {providers.slice(0, maxProviders).map((provider) => (
          <div key={provider.id} className="flex-shrink-0 w-36 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="relative">
              <img 
                src={provider.image} 
                alt={provider.name} 
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/public/doctor-placeholder.png';
                }}
              />
              {provider.hasNewUpdates && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
            
            <div className="p-3">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900 text-sm truncate">{provider.name}</h3>
                {provider.verified && (
                  <CheckCircle size={12} className="ml-1 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-600 text-xs truncate">{provider.specialty}</p>
              
              {provider.lastInteraction && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Clock size={12} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{formatDate(provider.lastInteraction)}</span>
                </div>
              )}
              
              <div className="mt-3 flex space-x-2">
                <button 
                  onClick={() => onMessageProvider && onMessageProvider(provider.id)}
                  className="flex-1 py-1 px-2 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 flex items-center justify-center"
                >
                  <MessageCircle size={12} className="mr-1" />
                  Mensaje
                </button>
                <Link 
                  to={`/doctor/${provider.id}`}
                  className="flex-1 py-1 px-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center"
                >
                  <User size={12} className="mr-1" />
                  Perfil
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {showAddButton && (
          <div 
            className="flex-shrink-0 w-36 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-100"
            onClick={onAddProvider}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <Plus size={24} />
            </div>
            <span className="text-gray-600 text-sm font-medium text-center px-2">Agregar médico a mi equipo</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCareTeam;
