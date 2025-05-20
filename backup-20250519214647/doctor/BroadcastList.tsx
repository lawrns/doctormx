import React, { useState, useEffect } from 'react';
import { getDoctorBroadcasts } from '../../lib/api/broadcasts';
import { Calendar, Clock, AlertCircle, MessageCircle, Users, Heart, RefreshCw, ChevronDown, CheckCircle, ExternalLink } from 'lucide-react';

interface BroadcastListProps {
  onCreateNew?: () => void;
}

const BroadcastList: React.FC<BroadcastListProps> = ({ onCreateNew }) => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const data = await getDoctorBroadcasts();
      setBroadcasts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
      setError('No se pudieron cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBroadcasts();
  }, []);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getIconForBroadcastType = (type: string) => {
    switch (type) {
      case 'broadcast':
        return <MessageCircle size={18} className="text-blue-500" />;
      case 'health_tip':
        return <Heart size={18} className="text-red-500" />;
      case 'appointment_reminder':
        return <Calendar size={18} className="text-purple-500" />;
      case 'practice_update':
        return <CheckCircle size={18} className="text-green-500" />;
      default:
        return <MessageCircle size={18} className="text-gray-500" />;
    }
  };
  
  const getBroadcastTypeName = (type: string) => {
    switch (type) {
      case 'broadcast':
        return 'Anuncio';
      case 'health_tip':
        return 'Consejo de Salud';
      case 'appointment_reminder':
        return 'Recordatorio de Cita';
      case 'practice_update':
        return 'Actualización del Consultorio';
      default:
        return type;
    }
  };
  
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Mis mensajes enviados</h2>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Crear nuevo mensaje
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between mb-3">
                <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-full h-16 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="flex justify-between">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Mis mensajes enviados</h2>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Crear nuevo mensaje
            </button>
          )}
        </div>
        
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          {error}
          <button
            onClick={fetchBroadcasts}
            className="flex items-center ml-auto mt-2 text-red-700 hover:text-red-800"
          >
            <RefreshCw size={16} className="mr-1" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Mis mensajes enviados</h2>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Crear nuevo mensaje
          </button>
        )}
      </div>
      
      {broadcasts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No has enviado ningún mensaje todavía.</p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Crear tu primer mensaje
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((broadcast) => {
            const isExpanded = expandedId === broadcast.id;
            const isPending = broadcast.scheduledFor && new Date(broadcast.scheduledFor) > new Date();
            
            return (
              <div 
                key={broadcast.id} 
                className={`border rounded-lg overflow-hidden ${isExpanded ? 'border-blue-300' : 'border-gray-200'}`}
              >
                <div 
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}
                  onClick={() => toggleExpand(broadcast.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        {getIconForBroadcastType(broadcast.broadcastType)}
                        <h3 className="font-medium text-gray-900 ml-2">{broadcast.title}</h3>
                        {broadcast.isUrgent && (
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                            Urgente
                          </span>
                        )}
                        {isPending && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Programado
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        {broadcast.content.length > 120 && !isExpanded
                          ? `${broadcast.content.substring(0, 120)}...`
                          : broadcast.content
                        }
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-4 flex items-center">
                          <Clock size={14} className="mr-1" />
                          {isPending 
                            ? `Programado para: ${formatDate(broadcast.scheduledFor)}`
                            : `Enviado: ${formatDate(broadcast.publishedAt || broadcast.createdAt)}`
                          }
                        </span>
                        <span className="mr-4 flex items-center">
                          <Users size={14} className="mr-1" />
                          {broadcast.targetAudience}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronDown 
                      size={16} 
                      className={`text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
                    />
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Estadísticas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Destinatarios</div>
                        <div className="font-medium text-gray-900">{broadcast.analytics.total}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Leídos</div>
                        <div className="font-medium text-gray-900">
                          {broadcast.analytics.read} 
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            ({broadcast.analytics.readRate.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Me gusta</div>
                        <div className="font-medium text-gray-900">{broadcast.analytics.likes}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Detalles del mensaje</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Tipo</p>
                          <p className="text-gray-900">{getBroadcastTypeName(broadcast.broadcastType)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Creado</p>
                          <p className="text-gray-900">{formatDate(broadcast.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BroadcastList;