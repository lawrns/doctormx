import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, BarChart2, BookOpen, Calendar, CheckCircle, ChevronDown, Clock, FileText, Heart, MessageCircle, Star, ThumbsUp, User, Users, X } from 'lucide-react';

// Types for community feed items
interface Author {
  id: string;
  name: string;
  role: 'doctor' | 'patient' | 'admin';
  specialty?: string;
  avatar: string;
  verified?: boolean;
}

interface FeedItem {
  id: string;
  type: 'broadcast' | 'article' | 'question' | 'answer' | 'group_update';
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  likes: number;
  comments: number;
  category?: string;
  tags?: string[];
  urgent?: boolean;
  liked?: boolean;
  articleUrl?: string;
  questionId?: string;
  groupId?: string;
}

// Sample data for feed items
const sampleFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'broadcast',
    title: 'Importante: Temporada de gripe',
    content: 'La temporada de gripe está comenzando. Recuerde programar su vacuna anual contra la gripe. Estamos ofreciendo vacunas gratuitas para nuestros pacientes durante todo el mes de octubre.',
    author: {
      id: 'doc1',
      name: 'Dra. Ana García',
      role: 'doctor',
      specialty: 'Medicina General',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-06-01T15:30:00',
    likes: 24,
    comments: 5,
    category: 'Salud preventiva',
    tags: ['gripe', 'vacunas', 'prevención'],
    liked: false
  },
  {
    id: '2',
    type: 'article',
    title: '5 hábitos para mantener una presión arterial saludable',
    content: 'La hipertensión arterial afecta a millones de personas en todo el mundo. En este artículo, compartimos cinco hábitos clave que pueden ayudarle a mantener su presión arterial bajo control.',
    author: {
      id: 'doc2',
      name: 'Dr. Carlos Mendoza',
      role: 'doctor',
      specialty: 'Cardiología',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-05-28T09:15:00',
    likes: 47,
    comments: 12,
    category: 'Cardiología',
    tags: ['hipertensión', 'salud cardiovascular', 'estilo de vida'],
    articleUrl: '/articulos/presion-arterial-saludable',
    liked: true
  },
  {
    id: '3',
    type: 'question',
    title: '¿Cuánto tiempo debo esperar para hacer ejercicio después de una comida grande?',
    content: 'Recientemente comencé a hacer ejercicio por las tardes, pero normalmente es después de comer. He notado algunas molestias y me pregunto cuánto tiempo debería esperar después de una comida grande para comenzar mi rutina de ejercicios.',
    author: {
      id: 'pat1',
      name: 'Juan Pérez',
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    },
    createdAt: '2025-05-25T18:45:00',
    likes: 8,
    comments: 3,
    category: 'Nutrición y ejercicio',
    questionId: 'q123',
    liked: false
  },
  {
    id: '4',
    type: 'group_update',
    title: 'Nuevo grupo: Salud cardiovascular',
    content: 'Hemos creado un nuevo grupo de apoyo para pacientes con condiciones cardiovasculares. Únase para compartir experiencias, hacer preguntas y recibir consejos de profesionales.',
    author: {
      id: 'admin1',
      name: 'Equipo Doctor.mx',
      role: 'admin',
      avatar: '/public/Doctorlogo.png'
    },
    createdAt: '2025-05-22T14:00:00',
    likes: 35,
    comments: 7,
    groupId: 'g456',
    liked: false
  },
  {
    id: '5',
    type: 'broadcast',
    title: 'Actualización de horarios de atención',
    content: 'A partir del 15 de junio, nuestro consultorio ampliará sus horarios de atención. Ahora también estaremos disponibles los sábados de 9:00 AM a 1:00 PM para brindar mayor flexibilidad a nuestros pacientes.',
    author: {
      id: 'doc1',
      name: 'Dra. Ana García',
      role: 'doctor',
      specialty: 'Medicina General',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-05-20T11:20:00',
    likes: 18,
    comments: 2,
    category: 'Anuncios',
    tags: ['horarios', 'consultas'],
    liked: false
  }
];

interface CommunityFeedProps {
  feedItems?: FeedItem[];
  selectedCategories?: string[];
  selectedTags?: string[];
  showFilters?: boolean;
  maxItems?: number;
  showLoadMore?: boolean;
  isLoading?: boolean;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onLoadMore?: () => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({
  feedItems = sampleFeedItems,
  selectedCategories = [],
  selectedTags = [],
  showFilters = true,
  maxItems = 10,
  showLoadMore = true,
  isLoading = false,
  onLike,
  onComment,
  onLoadMore
}) => {
  const [visibleItems, setVisibleItems] = useState<number>(3);
  const [filter, setFilter] = useState<string>('all');
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const [showHideDialog, setShowHideDialog] = useState<boolean>(false);
  const [hideItem, setHideItem] = useState<string | null>(null);

  // Filter items based on selected filter and categories/tags
  const filteredItems = feedItems
    .filter(item => {
      if (filter === 'all') return true;
      if (filter === 'broadcasts') return item.type === 'broadcast';
      if (filter === 'articles') return item.type === 'article';
      if (filter === 'questions') return item.type === 'question' || item.type === 'answer';
      if (filter === 'groups') return item.type === 'group_update';
      return true;
    })
    .filter(item => {
      if (selectedCategories.length === 0) return true;
      return item.category ? selectedCategories.includes(item.category) : true;
    })
    .filter(item => {
      if (selectedTags.length === 0) return true;
      return item.tags ? item.tags.some(tag => selectedTags.includes(tag)) : true;
    });

  const displayedItems = filteredItems.slice(0, visibleItems);

  const handleLoadMore = () => {
    setVisibleItems(prev => Math.min(prev + 3, filteredItems.length));
    if (onLoadMore) onLoadMore();
  };

  const toggleExpandPost = (id: string) => {
    if (expandedPosts.includes(id)) {
      setExpandedPosts(expandedPosts.filter(postId => postId !== id));
    } else {
      setExpandedPosts([...expandedPosts, id]);
    }
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) onLike(id);
  };

  const handleComment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComment) onComment(id);
  };

  const handleHideItem = (id: string) => {
    setHideItem(id);
    setShowHideDialog(true);
  };

  const confirmHideItem = () => {
    // In a real app, this would update the user's preferences in the database
    // For now, we'll just remove it from the visible items
    setVisibleItems(prev => Math.min(prev, filteredItems.length - 1));
    setShowHideDialog(false);
    setHideItem(null);
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

  const getIconForItemType = (type: string, urgent: boolean = false) => {
    switch (type) {
      case 'broadcast':
        return urgent 
          ? <AlertCircle size={18} className="text-amber-500" /> 
          : <MessageCircle size={18} className="text-blue-500" />;
      case 'article':
        return <BookOpen size={18} className="text-green-500" />;
      case 'question':
        return <MessageCircle size={18} className="text-purple-500" />;
      case 'answer':
        return <MessageCircle size={18} className="text-teal-500" />;
      case 'group_update':
        return <Users size={18} className="text-indigo-500" />;
      default:
        return <FileText size={18} className="text-gray-500" />;
    }
  };

  const renderItemContent = (item: FeedItem) => {
    const isExpanded = expandedPosts.includes(item.id);
    const shouldTruncate = item.content.length > 200 && !isExpanded;
    
    return (
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg mb-2">{item.title}</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {shouldTruncate ? item.content.substring(0, 200) + '...' : item.content}
        </p>
        {item.content.length > 200 && (
          <button 
            className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300"
            onClick={() => toggleExpandPost(item.id)}
          >
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>
    );
  };

  const renderHeaderForItemType = (item: FeedItem) => {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            <img 
              src={item.author.avatar} 
              alt={item.author.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/public/doctor-placeholder.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-900 dark:text-gray-100">{item.author.name}</span>
              {item.author.verified && (
                <CheckCircle size={14} className="ml-1 text-blue-500" />
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{item.author.role === 'doctor' ? item.author.specialty : (item.author.role === 'admin' ? 'Administrador' : 'Paciente')}</span>
              <span className="mx-1">•</span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {item.type === 'broadcast' && item.urgent && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 mr-2">
              <AlertCircle size={12} className="mr-1" />
              Importante
            </span>
          )}
          {item.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {item.category}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderFooterForItemType = (item: FeedItem) => {
    return (
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className={`flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 ${item.liked ? 'text-blue-600 dark:text-blue-400' : ''}`}
            onClick={(e) => handleLike(item.id, e)}
          >
            <ThumbsUp size={16} className="mr-1" />
            <span>{item.likes}</span>
          </button>
          
          <button 
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300"
            onClick={(e) => handleComment(item.id, e)}
          >
            <MessageCircle size={16} className="mr-1" />
            <span>{item.comments}</span>
          </button>
        </div>
        
        <div>
          {item.type === 'article' && item.articleUrl && (
            <Link 
              to={item.articleUrl}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300"
            >
              Leer artículo completo
            </Link>
          )}
          
          {item.type === 'question' && item.questionId && (
            <Link 
              to={`/comunidad/preguntas/${item.questionId}`}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300"
            >
              Ver respuestas
            </Link>
          )}
          
          {item.type === 'group_update' && item.groupId && (
            <Link 
              to={`/comunidad/grupos/${item.groupId}`}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300"
            >
              Unirse al grupo
            </Link>
          )}
          
          {item.type === 'broadcast' && (
            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => handleHideItem(item.id)}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-4">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'broadcasts' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setFilter('broadcasts')}
          >
            Anuncios
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'articles' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setFilter('articles')}
          >
            Artículos
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'questions' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setFilter('questions')}
          >
            Preguntas
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'groups' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setFilter('groups')}
          >
            Grupos
          </button>
        </div>
      )}
      
      {displayedItems.length === 0 && !isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay publicaciones</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron publicaciones que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <>
          {displayedItems.map(item => (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${
                item.type === 'broadcast' && item.urgent 
                  ? 'border-l-4 border-amber-500' 
                  : ''
              }`}
            >
              {renderHeaderForItemType(item)}
              {renderItemContent(item)}
              {renderFooterForItemType(item)}
            </div>
          ))}
          
          {isLoading && (
            <div className="space-y-6">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredItems.length > visibleItems && showLoadMore && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center justify-center mx-auto"
              >
                Ver más
                <ChevronDown size={16} className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Hide item confirmation dialog */}
      {showHideDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ocultar publicación</h3>
                <button 
                  onClick={() => setShowHideDialog(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ¿Está seguro de que desea ocultar esta publicación? No volverá a aparecer en su feed.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setShowHideDialog(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={confirmHideItem}
                >
                  Ocultar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
