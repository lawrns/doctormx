import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, MessageCircle, Calendar, User, 
  ChevronRight, BarChart2, Shield
} from 'lucide-react';

// Types for community group previews
interface GroupModerator {
  id: string;
  name: string;
  specialty?: string;
  image: string;
  verified?: boolean;
}

interface GroupPreview {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  banner?: string;
  membersCount: number;
  postsCount: number;
  unreadCount?: number;
  latestActivity?: string;
  moderators: GroupModerator[];
  hasUpcomingEvents?: boolean;
  nextEventDate?: string;
}

interface CommunityGroupsProps {
  groups: GroupPreview[];
  maxGroups?: number;
  showAllLink?: boolean;
}

const CommunityGroups: React.FC<CommunityGroupsProps> = ({
  groups,
  maxGroups = 3,
  showAllLink = true
}) => {
  const displayedGroups = groups.slice(0, maxGroups);
  
  // Format date for latest activity
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
  
  const formatEventDate = (dateString?: string) => {
    if (!dateString) return '';
    
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
      day: 'numeric'
    });
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mis comunidades de salud</h2>
        {showAllLink && (
          <Link 
            to="/comunidad/grupos" 
            className="text-blue-600 text-sm font-medium hover:text-blue-800"
          >
            Ver todos
          </Link>
        )}
      </div>
      
      {displayedGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no tienes comunidades</h3>
          <p className="text-gray-500 mb-4">
            Únete a comunidades relacionadas con tus condiciones de salud para conectar con otros pacientes y especialistas.
          </p>
          <Link
            to="/comunidad/explorar"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Explorar comunidades
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedGroups.map(group => (
            <Link 
              key={group.id} 
              to={`/comunidad/grupos/${group.id}`}
              className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex">
                <div className="w-20 h-20 shrink-0 bg-blue-50 flex items-center justify-center">
                  {group.icon ? (
                    <img 
                      src={group.icon} 
                      alt={group.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users size={28} className="text-blue-500" />
                  )}
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{group.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-1">{group.description}</p>
                    </div>
                    
                    {group.unreadCount && group.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {group.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users size={14} className="mr-1" />
                      <span>{group.membersCount} miembros</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MessageCircle size={14} className="mr-1" />
                      <span>{group.postsCount} publicaciones</span>
                    </div>
                    
                    {group.latestActivity && (
                      <div className="flex items-center">
                        <BarChart2 size={14} className="mr-1" />
                        <span>Actividad: {formatDate(group.latestActivity)}</span>
                      </div>
                    )}
                    
                    {group.hasUpcomingEvents && group.nextEventDate && (
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>Evento: {formatEventDate(group.nextEventDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Moderado por:</span>
                    <div className="flex -space-x-2 mr-2">
                      {group.moderators.slice(0, 3).map((moderator, index) => (
                        <div key={index} className="w-6 h-6 rounded-full overflow-hidden border border-white">
                          <img 
                            src={moderator.image} 
                            alt={moderator.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/public/doctor-placeholder.png';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {group.moderators.length > 3 && (
                      <span className="text-xs text-gray-500">+{group.moderators.length - 3} más</span>
                    )}
                    
                    <ChevronRight size={16} className="ml-auto text-gray-400" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityGroups;
