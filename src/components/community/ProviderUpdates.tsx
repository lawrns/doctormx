import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, Calendar, AlertCircle, ThumbsUp, MessageCircle } from 'lucide-react';

// Later these will come from an API
interface ProviderUpdate {
  id: string;
  title: string;
  content: string;
  type: 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
  isUrgent: boolean;
  providerName: string;
  providerSpecialty: string;
  publishedAt: string;
  liked: boolean;
  read: boolean;
}

// Mock data for provider updates
const mockUpdates: ProviderUpdate[] = [
  {
    id: '1',
    title: 'Horario especial Semana Santa',
    content: 'Estimados pacientes, les informamos que durante Semana Santa (29 de marzo al 4 de abril) nuestro consultorio tendrá un horario especial. Estaremos atendiendo solo por las mañanas de 9:00 a 13:00 horas. Para emergencias, por favor utilice el servicio de telemedicina.',
    type: 'practice_update',
    isUrgent: false,
    providerName: 'Dra. Ana García',
    providerSpecialty: 'Medicina General',
    publishedAt: '2025-03-15T14:30:00Z',
    liked: false,
    read: false
  },
  {
    id: '2',
    title: 'Recordatorio: Vacuna contra la Influenza',
    content: 'Con la llegada de la temporada de influenza, les recordamos la importancia de vacunarse, especialmente para pacientes de riesgo (mayores de 65 años, embarazadas, niños pequeños y personas con enfermedades crónicas). La vacuna está disponible en nuestro consultorio sin necesidad de cita previa.',
    type: 'health_tip',
    isUrgent: true,
    providerName: 'Dr. Carlos Mendoza',
    providerSpecialty: 'Medicina Familiar',
    publishedAt: '2025-03-10T09:15:00Z',
    liked: true,
    read: true
  },
  {
    id: '3',
    title: 'Nuevo servicio de nutrición',
    content: 'Nos complace informarles que hemos incorporado un nuevo servicio de nutrición a nuestra clínica. La Lic. María Fernández, especialista en nutrición clínica, atenderá los martes y jueves. Pueden solicitar cita a través de nuestra plataforma o por teléfono.',
    type: 'broadcast',
    isUrgent: false,
    providerName: 'Dra. Ana García',
    providerSpecialty: 'Medicina General',
    publishedAt: '2025-03-05T11:00:00Z',
    liked: false,
    read: true
  }
];

interface ProviderUpdatesProps {
  isLoading?: boolean;
  fetchData?: boolean;
  showLoadMore?: boolean;
}

const ProviderUpdates: React.FC<ProviderUpdatesProps> = ({
  isLoading = false,
  fetchData = false,
  showLoadMore = true
}) => {
  const [updates, setUpdates] = useState<ProviderUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  useEffect(() => {
    if (fetchData) {
      // Simulate API fetch
      setLoading(true);
      
      setTimeout(() => {
        setUpdates(mockUpdates);
        setLoading(false);
      }, 1000);
    } else {
      setUpdates(mockUpdates);
    }
  }, [fetchData]);
  
  const toggleLike = (id: string) => {
    setUpdates(prev => prev.map(update => 
      update.id === id ? { ...update, liked: !update.liked } : update
    ));
    
    // In a real app, this would be an API call to update the like status
  };
  
  const markAsRead = (id: string) => {
    setUpdates(prev => prev.map(update => 
      update.id === id ? { ...update, read: true } : update
    ));
    
    // In a real app, this would be an API call to mark as read
  };
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    markAsRead(id);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short'
      });
    }
  };
  
  const getIconForUpdateType = (type: string) => {
    switch (type) {
      case 'broadcast':
        return <MessageCircle size={18} className="text-blue-500" />;
      case 'health_tip':
        return <Heart size={18} className="text-red-500" />;
      case 'appointment_reminder':
        return <Calendar size={18} className="text-purple-500" />;
      case 'practice_update':
        return <Bell size={18} className="text-green-500" />;
      default:
        return <MessageCircle size={18} className="text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (updates.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No hay actualizaciones de tu equipo médico.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="space-y-4">
        {updates.map((update) => {
          const isExpanded = expandedId === update.id;
          
          return (
            <div 
              key={update.id} 
              className={`bg-white border rounded-lg overflow-hidden ${!update.read ? 'border-blue-300' : 'border-gray-200'}`}
            >
              <div 
                className={`p-4 cursor-pointer ${!update.read ? 'bg-blue-50' : ''}`}
                onClick={() => toggleExpand(update.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      {getIconForUpdateType(update.type)}
                      <h3 className="font-medium text-gray-900 ml-2">{update.title}</h3>
                      {update.isUrgent && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                          Urgente
                        </span>
                      )}
                      {!update.read && (
                        <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {update.providerName} • {update.providerSpecialty}
                    </p>
                    
                    {(isExpanded || update.content.length <= 120) ? (
                      <p className="text-gray-700 mt-2">{update.content}</p>
                    ) : (
                      <p className="text-gray-700 mt-2">
                        {update.content.substring(0, 120)}...
                        <span className="text-blue-600 ml-1">Leer más</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatDate(update.publishedAt)}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(update.id);
                    }}
                    className={`flex items-center text-sm ${
                      update.liked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp size={16} className="mr-1" />
                    {update.liked ? 'Te gustó' : 'Me gusta'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {showLoadMore && updates.length >= 3 && (
        <div className="mt-6 text-center">
          <button className="text-blue-600 font-medium hover:text-blue-800">
            Ver más actualizaciones
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderUpdates;