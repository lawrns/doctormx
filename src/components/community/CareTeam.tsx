import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, MessageCircle, Calendar, 
  CheckCircle, Plus, Search, X, 
  Star, Heart, ArrowRight
} from 'lucide-react';

// Types
interface CareProvider {
  id: string;
  name: string;
  specialty: string;
  image: string;
  verified: boolean;
  lastInteraction?: string;
  lastAppointment?: string;
  nextAppointment?: string;
  hasSharedDocuments?: boolean;
  notes?: string[];
  isActive: boolean;
}

interface CareTeamProps {
  providers: CareProvider[];
  onAddProvider?: () => void;
  onMessageProvider?: (providerId: string) => void;
  onScheduleAppointment?: (providerId: string) => void;
  isCompact?: boolean;
}

// Sample data
export const sampleCareTeam: CareProvider[] = [
  {
    id: '1',
    name: 'Dra. Ana García',
    specialty: 'Medicina General',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    verified: true,
    lastInteraction: '2025-06-01T10:00:00',
    lastAppointment: '2025-05-15T11:30:00',
    nextAppointment: '2025-06-15T10:00:00',
    hasSharedDocuments: true,
    notes: [
      'Actualizar historial de medicamentos en la próxima cita',
      'Recordar traer resultados de laboratorio'
    ],
    isActive: true
  },
  {
    id: '3',
    name: 'Dra. Laura Sánchez',
    specialty: 'Ginecología',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    verified: true,
    lastInteraction: '2025-04-10T15:45:00',
    lastAppointment: '2025-04-10T15:45:00',
    hasSharedDocuments: false,
    isActive: true
  },
  {
    id: '4',
    name: 'Dr. Miguel Ángel Torres',
    specialty: 'Dermatología',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    verified: true,
    lastInteraction: '2025-02-20T09:15:00',
    lastAppointment: '2025-02-20T09:15:00',
    hasSharedDocuments: true,
    isActive: false
  }
];

const CareTeam: React.FC<CareTeamProps> = ({
  providers = sampleCareTeam,
  onAddProvider,
  onMessageProvider,
  onScheduleAppointment,
  isCompact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Filter providers
  const filteredProviders = providers.filter(provider => {
    // Filter by search term
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by active status
    const matchesStatus = showInactive ? true : provider.isActive;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Mañana, ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeSinceLastInteraction = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  };

  // Compact view
  if (isCompact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Mi equipo médico</h3>
          <button 
            onClick={onAddProvider}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
          >
            Ver todos
            <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProviders.slice(0, 3).map((provider) => (
            <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img 
                    src={provider.image} 
                    alt={provider.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/public/doctor-placeholder.png';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{provider.name}</span>
                    {provider.verified && (
                      <CheckCircle size={14} className="ml-1 text-blue-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{provider.specialty}</span>
                </div>
              </div>
              
              {provider.nextAppointment && (
                <div className="mt-3 text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar size={14} className="mr-1" />
                    <span>Próxima cita: {formatDate(provider.nextAppointment)}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={() => onMessageProvider && onMessageProvider(provider.id)}
                  className="flex-1 px-3 py-1 text-xs text-center font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Mensaje
                </button>
                <button
                  onClick={() => onScheduleAppointment && onScheduleAppointment(provider.id)}
                  className="flex-1 px-3 py-1 text-xs text-center font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Cita
                </button>
              </div>
            </div>
          ))}
          
          <button
            onClick={onAddProvider}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm p-4 flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
          >
            <Plus size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Añadir médico</span>
          </button>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Mi equipo médico</h2>
          
          <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar médicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="showInactive"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              />
              <label htmlFor="showInactive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Mostrar inactivos
              </label>
            </div>
            
            <button
              onClick={onAddProvider}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={16} className="mr-2" />
              Añadir médico
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden">
        {filteredProviders.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <User size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No se encontraron médicos</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm 
                ? `No hay médicos que coincidan con "${searchTerm}"`
                : showInactive
                  ? 'No tienes médicos en tu equipo'
                  : 'No tienes médicos activos en tu equipo'
              }
            </p>
            <button
              onClick={onAddProvider}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={16} className="mr-2" />
              Añadir médico
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProviders.map((provider) => (
              <li key={provider.id} className="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="flex-shrink-0">
                      <img 
                        src={provider.image} 
                        alt={provider.name} 
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/public/doctor-placeholder.png';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1 px-4">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {provider.name}
                        </h3>
                        {provider.verified && (
                          <CheckCircle size={14} className="ml-1 text-blue-500" />
                        )}
                        {!provider.isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {provider.specialty}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onMessageProvider && onMessageProvider(provider.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MessageCircle size={14} className="mr-1" />
                      Mensaje
                    </button>
                    
                    <button
                      onClick={() => onScheduleAppointment && onScheduleAppointment(provider.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Calendar size={14} className="mr-1" />
                      Cita
                    </button>
                    
                    <button
                      onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                      className="inline-flex items-center p-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {selectedProvider === provider.id ? (
                        <X size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                    </button>
                  </div>
                </div>
                
                {selectedProvider === provider.id && (
                  <div className="mt-4 pl-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Última interacción</h4>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {getTimeSinceLastInteraction(provider.lastInteraction)}
                      </p>
                      {provider.lastAppointment && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Última cita: {formatDate(provider.lastAppointment)}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Próxima cita</h4>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {provider.nextAppointment ? formatDate(provider.nextAppointment) : 'No programada'}
                      </p>
                      {provider.nextAppointment && (
                        <button className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:text-blue-800 dark:hover:text-blue-300">
                          Ver detalles
                        </button>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Documentos</h4>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {provider.hasSharedDocuments ? 'Compartidos' : 'No compartidos'}
                      </p>
                      {provider.hasSharedDocuments && (
                        <button className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:text-blue-800 dark:hover:text-blue-300">
                          Ver documentos
                        </button>
                      )}
                    </div>
                    
                    {provider.notes && provider.notes.length > 0 && (
                      <div className="md:col-span-2 lg:col-span-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Notas</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {provider.notes.map((note, index) => (
                            <li key={index} className="flex items-start">
                              <Heart size={14} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CareTeam;
