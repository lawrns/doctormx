import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, Heart, Users, AlertCircle, Clock, BarChart, Plus, ArrowLeft, ExternalLink, Search } from 'lucide-react';
import { getDoctorBroadcasts } from '../../lib/api/broadcasts';

interface Broadcast {
  id: string;
  title: string;
  content: string;
  broadcastType: string;
  isUrgent: boolean;
  scheduledFor: string | null;
  publishedAt: string | null;
  createdAt: string;
  targetAudience: string;
  analytics: {
    total: number;
    read: number;
    readRate: number;
    likes: number;
  };
}

const BroadcastsListPage: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [filteredBroadcasts, setFilteredBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  
  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        setLoading(true);
        const data = await getDoctorBroadcasts();
        setBroadcasts(data);
        setFilteredBroadcasts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching broadcasts:', err);
        setError('No se pudieron cargar los mensajes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBroadcasts();
  }, []);
  
  useEffect(() => {
    filterBroadcasts();
  }, [searchQuery, filterType, broadcasts]);
  
  const filterBroadcasts = () => {
    let filtered = [...broadcasts];
    
    // Filter by type if not 'all'
    if (filterType !== 'all') {
      filtered = filtered.filter(broadcast => broadcast.broadcastType === filterType);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(broadcast => 
        broadcast.title.toLowerCase().includes(query) || 
        broadcast.content.toLowerCase().includes(query)
      );
    }
    
    setFilteredBroadcasts(filtered);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'broadcast':
        return <MessageCircle size={18} className="text-blue-500" />;
      case 'health_tip':
        return <Heart size={18} className="text-red-500" />;
      case 'appointment_reminder':
        return <Calendar size={18} className="text-purple-500" />;
      case 'practice_update':
        return <Users size={18} className="text-green-500" />;
      default:
        return <MessageCircle size={18} className="text-gray-500" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'broadcast':
        return 'Anuncio general';
      case 'health_tip':
        return 'Consejo de salud';
      case 'appointment_reminder':
        return 'Recordatorio de cita';
      case 'practice_update':
        return 'Actualización del consultorio';
      default:
        return 'Mensaje';
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Link to="/doctor-dashboard" className="mr-2 text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            Mensajes a pacientes
          </h2>
          <Link 
            to="/doctor/broadcasts/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} className="mr-1" />
            Nuevo mensaje
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        {/* Search and filters */}
        <div className="mb-6 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar mensajes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="broadcast">Anuncios generales</option>
            <option value="health_tip">Consejos de salud</option>
            <option value="appointment_reminder">Recordatorios de citas</option>
            <option value="practice_update">Actualizaciones del consultorio</option>
          </select>
        </div>
        
        {/* Broadcasts list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            <p className="mt-2 text-gray-500">Cargando mensajes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-700 underline"
            >
              Reintentar
            </button>
          </div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            {searchQuery || filterType !== 'all' ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron mensajes</h3>
                <p className="text-gray-500 mb-4">Intente con otros filtros de búsqueda</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="text-blue-600 font-medium"
                >
                  Mostrar todos los mensajes
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mensajes enviados</h3>
                <p className="text-gray-500 mb-4">Comience enviando su primer mensaje a sus pacientes</p>
                <Link 
                  to="/doctor/broadcasts/new"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-1" />
                  Crear mensaje
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="flex flex-col space-y-4">
              {filteredBroadcasts.map((broadcast) => (
                <div 
                  key={broadcast.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getTypeIcon(broadcast.broadcastType)}
                        <span className="text-sm font-medium text-gray-500 ml-2">
                          {getTypeLabel(broadcast.broadcastType)}
                        </span>
                        {broadcast.isUrgent && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <AlertCircle size={12} className="mr-1" />
                            Importante
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{broadcast.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{broadcast.content}</p>
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {broadcast.scheduledFor && !broadcast.publishedAt ? (
                            <span>Programado para: {formatDate(broadcast.scheduledFor)}</span>
                          ) : (
                            <span>Enviado: {formatDate(broadcast.publishedAt || broadcast.createdAt)}</span>
                          )}
                        </div>
                        <div>
                          <span>Audiencia: {broadcast.targetAudience}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-900 mb-2">Estadísticas</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{broadcast.analytics.total}</div>
                            <div className="text-xs text-gray-500">Receptores</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{broadcast.analytics.read}</div>
                            <div className="text-xs text-gray-500">Leídos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{broadcast.analytics.readRate.toFixed(0)}%</div>
                            <div className="text-xs text-gray-500">Tasa de lectura</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">{broadcast.analytics.likes}</div>
                            <div className="text-xs text-gray-500">Me gusta</div>
                          </div>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/doctor/broadcasts/${broadcast.id}`}
                        className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-800"
                      >
                        Ver detalles
                        <ExternalLink size={14} className="inline-block ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BroadcastsListPage;