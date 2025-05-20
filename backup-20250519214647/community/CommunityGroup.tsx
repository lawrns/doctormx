import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Shield, MessageCircle, Calendar, 
  Heart, ChevronDown, User, UserPlus, Clock,
  FileText, Settings, HelpCircle, ExternalLink, BarChart2
} from 'lucide-react';

// Types for community groups
interface GroupMember {
  id: string;
  name: string;
  role: 'doctor' | 'patient' | 'admin' | 'moderator';
  specialty?: string;
  avatar: string;
  verified?: boolean;
  joinDate: string;
  postsCount?: number;
}

interface CommunityGroupProps {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  isJoined?: boolean;
  membersCount: number;
  postsCount: number;
  createdAt: string;
  moderators: GroupMember[];
  featuredMembers?: GroupMember[];
  banner?: string;
  icon?: string;
  upcomingEvents?: {
    id: string;
    title: string;
    date: string;
    type: 'webinar' | 'discussion' | 'qa_session';
    hostId: string;
    hostName: string;
  }[];
  pinnedResources?: {
    id: string;
    title: string;
    type: 'article' | 'video' | 'guide' | 'link';
    author: string;
    url: string;
  }[];
  onJoin?: () => void;
  onLeave?: () => void;
  isDetailed?: boolean;
  isPreview?: boolean;
}

// Sample community group data
export const sampleCommunityGroup: CommunityGroupProps = {
  id: 'heart-health',
  name: 'Grupo de Salud Cardiovascular',
  description: 'Comunidad de apoyo para personas con condiciones cardiovasculares. Comparta experiencias, haga preguntas y obtenga consejos de profesionales de la salud.',
  category: 'Cardiología',
  tags: ['hipertensión', 'colesterol', 'salud del corazón', 'ejercicio'],
  isJoined: false,
  membersCount: 245,
  postsCount: 128,
  createdAt: '2025-03-15T00:00:00',
  moderators: [
    {
      id: 'doc2',
      name: 'Dr. Carlos Mendoza',
      role: 'doctor',
      specialty: 'Cardiología',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true,
      joinDate: '2025-03-15T00:00:00',
      postsCount: 24
    },
    {
      id: 'doc5',
      name: 'Dra. María González',
      role: 'doctor',
      specialty: 'Medicina Interna',
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true,
      joinDate: '2025-03-20T00:00:00',
      postsCount: 18
    }
  ],
  featuredMembers: [
    {
      id: 'pat3',
      name: 'Roberto Sánchez',
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      joinDate: '2025-04-10T00:00:00',
      postsCount: 12
    },
    {
      id: 'pat4',
      name: 'Ana Martínez',
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      joinDate: '2025-03-25T00:00:00',
      postsCount: 9
    },
    {
      id: 'pat5',
      name: 'Luis Ramírez',
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      joinDate: '2025-04-02T00:00:00',
      postsCount: 7
    }
  ],
  upcomingEvents: [
    {
      id: 'event1',
      title: 'Webinar: Entendiendo la hipertensión',
      date: '2025-06-15T18:00:00',
      type: 'webinar',
      hostId: 'doc2',
      hostName: 'Dr. Carlos Mendoza'
    },
    {
      id: 'event2',
      title: 'Sesión de preguntas y respuestas: Medicamentos para el colesterol',
      date: '2025-06-20T19:00:00',
      type: 'qa_session',
      hostId: 'doc5',
      hostName: 'Dra. María González'
    }
  ],
  pinnedResources: [
    {
      id: 'res1',
      title: 'Guía para controlar la hipertensión naturalmente',
      type: 'article',
      author: 'Dr. Carlos Mendoza',
      url: '/articulos/control-hipertension-natural'
    },
    {
      id: 'res2',
      title: 'Video: Ejercicios seguros para pacientes cardíacos',
      type: 'video',
      author: 'Dra. María González',
      url: '/videos/ejercicios-cardiacos'
    },
    {
      id: 'res3',
      title: 'La dieta DASH para la salud del corazón',
      type: 'guide',
      author: 'Dr. Carlos Mendoza',
      url: '/guias/dieta-dash'
    }
  ],
  banner: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  icon: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
};

const CommunityGroup: React.FC<CommunityGroupProps> = ({
  id,
  name,
  description,
  category,
  tags,
  isJoined = false,
  membersCount,
  postsCount,
  createdAt,
  moderators,
  featuredMembers,
  banner,
  icon,
  upcomingEvents,
  pinnedResources,
  onJoin,
  onLeave,
  isDetailed = false,
  isPreview = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [memberListExpanded, setMemberListExpanded] = useState<boolean>(false);
  const [resourcesExpanded, setResourcesExpanded] = useState<boolean>(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatEventDate = (dateString: string) => {
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
    
    return `${date.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric'
    })}, ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  const handleJoinLeave = () => {
    if (isJoined) {
      if (onLeave) onLeave();
    } else {
      if (onJoin) onJoin();
    }
  };
  
  // Render preview card (simplified)
  if (isPreview) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-400 to-blue-600 relative">
          {banner && (
            <img 
              src={banner} 
              alt={name} 
              className="w-full h-full object-cover absolute inset-0 mix-blend-overlay"
            />
          )}
        </div>
        
        <div className="p-6 pt-0 -mt-10">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            {icon ? (
              <img src={icon} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Users size={32} />
            )}
          </div>
          
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {category}
            </span>
            {tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                +{tags.length - 2} más
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              <span>{membersCount} miembros</span>
            </div>
            <div className="flex items-center">
              <MessageCircle size={16} className="mr-1" />
              <span>{postsCount} publicaciones</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {moderators.slice(0, 2).map((moderator, index) => (
                <div key={index} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                  <img 
                    src={moderator.avatar} 
                    alt={moderator.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            <Link 
              to={`/comunidad/grupos/${id}`}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300"
            >
              Ver grupo
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Render full group view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 relative">
        {banner && (
          <img 
            src={banner} 
            alt={name} 
            className="w-full h-full object-cover absolute inset-0 mix-blend-overlay"
          />
        )}
      </div>
      
      {/* Group Info */}
      <div className="p-6 sm:p-8 -mt-16 relative">
        <div className="flex flex-col sm:flex-row sm:items-end">
          <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4 sm:mb-0 sm:mr-6">
            {icon ? (
              <img src={icon} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Heart size={64} />
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{name}</h1>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {category}
              </span>
              {tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                <span>{membersCount} miembros</span>
              </div>
              <div className="flex items-center">
                <MessageCircle size={16} className="mr-1" />
                <span>{postsCount} publicaciones</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>Creado el {formatDate(createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <button
              onClick={handleJoinLeave}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium ${
                isJoined 
                  ? 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isJoined ? 'Abandonar grupo' : 'Unirse al grupo'}
            </button>
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-6">
          <p className={`text-gray-600 dark:text-gray-400 ${!isExpanded && !isDetailed ? 'line-clamp-3' : ''}`}>
            {description}
          </p>
          {!isDetailed && description.length > 150 && (
            <button 
              className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
        
        {/* Moderators */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Moderadores</h3>
          <div className="flex flex-wrap gap-4">
            {moderators.map((moderator, index) => (
              <div key={index} className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img 
                    src={moderator.avatar} 
                    alt={moderator.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{moderator.name}</span>
                    {moderator.verified && (
                      <Shield size={14} className="ml-1 text-blue-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{moderator.specialty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Members */}
        {featuredMembers && featuredMembers.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Miembros destacados</h3>
              <button 
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                onClick={() => setMemberListExpanded(!memberListExpanded)}
              >
                {memberListExpanded ? 'Ver menos' : 'Ver todos'}
                <ChevronDown size={16} className={`ml-1 transform ${memberListExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(memberListExpanded ? featuredMembers : featuredMembers.slice(0, 3)).map((member, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <MessageCircle size={14} className="mr-1" />
                      <span>{member.postsCount} publicaciones</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Upcoming Events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Próximos eventos</h3>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{event.title}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {event.type === 'webinar' ? 'Webinar' : 
                       event.type === 'discussion' ? 'Discusión' : 
                       'Preguntas y respuestas'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock size={14} className="mr-1" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <User size={14} className="mr-1" />
                      <span>Anfitrión: {event.hostName}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link 
                      to={`/comunidad/eventos/${event.id}`}
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pinned Resources */}
        {pinnedResources && pinnedResources.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recursos destacados</h3>
              <button 
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                onClick={() => setResourcesExpanded(!resourcesExpanded)}
              >
                {resourcesExpanded ? 'Ver menos' : 'Ver todos'}
                <ChevronDown size={16} className={`ml-1 transform ${resourcesExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(resourcesExpanded ? pinnedResources : pinnedResources.slice(0, 2)).map((resource, index) => (
                <Link 
                  key={index} 
                  to={resource.url}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <div className="flex items-center mb-2">
                    {resource.type === 'article' && <FileText size={16} className="text-blue-500 mr-2" />}
                    {resource.type === 'video' && <BarChart2 size={16} className="text-red-500 mr-2" />}
                    {resource.type === 'guide' && <BookOpen size={16} className="text-green-500 mr-2" />}
                    {resource.type === 'link' && <ExternalLink size={16} className="text-purple-500 mr-2" />}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {resource.type === 'article' ? 'Artículo' : 
                       resource.type === 'video' ? 'Video' : 
                       resource.type === 'guide' ? 'Guía' : 'Enlace externo'}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{resource.title}</h4>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <User size={14} className="mr-1" />
                    <span>Por: {resource.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {isDetailed && (
          <div className="mt-8 flex justify-between items-center">
            <Link
              to={`/comunidad/grupos/${id}/publicaciones`}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Ver publicaciones
            </Link>
            
            <div className="flex space-x-3">
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg">
                <Settings size={20} />
              </button>
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg">
                <HelpCircle size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityGroup;
