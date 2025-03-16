import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, AlertCircle, Calendar, 
  Clock, ChevronDown, BookOpen, User, 
  CheckCircle, Heart, ThumbsUp, ExternalLink, Bell, X 
} from 'lucide-react';

// Types for provider updates
interface Author {
  id: string;
  name: string;
  specialty?: string;
  image: string;
  verified?: boolean;
}

interface UpdateItem {
  id: string;
  type: 'broadcast' | 'article' | 'appointment_reminder' | 'health_tip';
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  urgent?: boolean;
  likes?: number;
  liked?: boolean;
  category?: string;
  articleUrl?: string;
  appointmentId?: string;
  appointmentDate?: string;
}

interface ProviderUpdatesProps {
  updates: UpdateItem[];
  maxItems?: number;
  showLoadMore?: boolean;
  isLoading?: boolean;
  onLike?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onLoadMore?: () => void;
}

const ProviderUpdates: React.FC<ProviderUpdatesProps> = ({
  updates,
  maxItems = 3,
  showLoadMore = true,
  isLoading = false,
  onLike,
  onDismiss,
  onLoadMore
}) => {
  const [visibleItems, setVisibleItems] = useState<number>(maxItems);
  const [expandedUpdates, setExpandedUpdates] = useState<string[]>([]);
  
  const displayedItems = updates.slice(0, visibleItems);
  
  const handleLoadMore = () => {
    setVisibleItems(prev => Math.min(prev + 3, updates.length));
    if (onLoadMore) onLoadMore();
  };
  
  const toggleExpandUpdate = (id: string) => {
    if (expandedUpdates.includes(id)) {
      setExpandedUpdates(expandedUpdates.filter(updateId => updateId !== id));
    } else {
      setExpandedUpdates([...expandedUpdates, id]);
    }
  };
  
  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) onLike(id);
  };
  
  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) onDismiss(id);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInMs / (1000 * 60));
        return `Hace ${minutes} minutos`;
      }
      return `Hace ${Math.floor(diffInHours)} horas`;
    }
    
    if (diffInHours < 48) {
      return 'Ayer';
    }
    
    if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `Hace ${days} días`;
    }
    
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const getIconForUpdateType = (update: UpdateItem) => {
    if (update.urgent) {
      return <AlertCircle size={18} className="text-amber-500" />;
    }
    
    switch (update.type) {
      case 'broadcast':
        return <MessageCircle size={18} className="text-blue-500" />;
      case 'article':
        return <BookOpen size={18} className="text-green-500" />;
      case 'appointment_reminder':
        return <Calendar size={18} className="text-purple-500" />;
      case 'health_tip':
        return <Heart size={18} className="text-red-500" />;
      default:
        return <MessageCircle size={18} className="text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-4">
      {displayedItems.length === 0 && !isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actualizaciones</h3>
          <p className="text-gray-500">
            Recibirás actualizaciones de tu equipo médico cuando haya novedades importantes.
          </p>
        </div>
      ) : (
        <>
          {displayedItems.map(update => {
            const isExpanded = expandedUpdates.includes(update.id);
            const shouldTruncate = update.content.length > 150 && !isExpanded;
            
            return (
              <div 
                key={update.id} 
                className={`bg-white rounded-lg shadow-sm p-5 ${
                  update.urgent ? 'border-l-4 border-amber-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img 
                        src={update.author.image} 
                        alt={update.author.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/public/doctor-placeholder.png';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{update.author.name}</span>
                        {update.author.verified && (
                          <CheckCircle size={14} className="ml-1 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{update.author.specialty}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(update.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDismiss(update.id, e)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{update.title}</h3>
                  <p className="text-gray-600">
                    {shouldTruncate ? update.content.substring(0, 150) + '...' : update.content}
                  </p>
                  {update.content.length > 150 && (
                    <button 
                      className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800"
                      onClick={() => toggleExpandUpdate(update.id)}
                    >
                      {isExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {update.likes !== undefined && (
                      <button 
                        className={`flex items-center text-gray-500 hover:text-blue-600 ${update.liked ? 'text-blue-600' : ''}`}
                        onClick={(e) => handleLike(update.id, e)}
                      >
                        <ThumbsUp size={16} className="mr-1" />
                        <span>{update.likes}</span>
                      </button>
                    )}
                    
                    {update.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {update.category}
                      </span>
                    )}
                    
                    {update.urgent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <AlertCircle size={12} className="mr-1" />
                        Importante
                      </span>
                    )}
                  </div>
                  
                  <div>
                    {update.type === 'article' && update.articleUrl && (
                      <Link 
                        to={update.articleUrl}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center"
                      >
                        Leer artículo
                        <ExternalLink size={14} className="ml-1" />
                      </Link>
                    )}
                    
                    {update.type === 'appointment_reminder' && update.appointmentId && (
                      <Link 
                        to={`/dashboard/appointments/${update.appointmentId}`}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center"
                      >
                        Ver cita
                        <ExternalLink size={14} className="ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-6"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {updates.length > visibleItems && showLoadMore && (
            <div className="text-center pt-2">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800 flex items-center justify-center mx-auto"
              >
                Ver más
                <ChevronDown size={16} className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderUpdates;
