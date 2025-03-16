import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Video, MessageCircle, Book, 
  ExternalLink, User, CheckCircle, BookOpen, 
  Play, Clock, Download, Bookmark 
} from 'lucide-react';

// Types for educational content
interface ContentAuthor {
  id: string;
  name: string;
  specialty?: string;
  image: string;
  verified?: boolean;
}

interface ContentItem {
  id: string;
  type: 'article' | 'video' | 'guide' | 'pdf' | 'link';
  title: string;
  description: string;
  author: ContentAuthor;
  createdAt: string;
  url: string;
  coverImage?: string;
  duration?: number; // in minutes for videos or reading time
  category?: string;
  tags?: string[];
  isSaved?: boolean;
  condition?: string;
}

interface EducationalContentProps {
  contentItems: ContentItem[];
  maxItems?: number;
  showCategories?: boolean;
  onSaveContent?: (id: string, saved: boolean) => void;
}

const EducationalContent: React.FC<EducationalContentProps> = ({
  contentItems,
  maxItems = 4,
  showCategories = true,
  onSaveContent
}) => {
  // Format duration in minutes
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    return `${hours}h ${mins}m`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get icon based on content type
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText size={18} className="text-blue-500" />;
      case 'video':
        return <Video size={18} className="text-red-500" />;
      case 'guide':
        return <Book size={18} className="text-green-500" />;
      case 'pdf':
        return <FileText size={18} className="text-amber-500" />;
      case 'link':
        return <ExternalLink size={18} className="text-purple-500" />;
      default:
        return <FileText size={18} className="text-gray-500" />;
    }
  };
  
  // Function to determine if we should show the item based on category filters
  const displayedItems = contentItems.slice(0, maxItems);
  
  // Group content by category if showCategories is true
  let groupedContent: { [key: string]: ContentItem[] } = {};
  
  if (showCategories) {
    groupedContent = displayedItems.reduce((acc, item) => {
      const category = item.category || 'Otros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as { [key: string]: ContentItem[] });
  }
  
  const handleSaveContent = (id: string, currentSaved: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSaveContent) {
      onSaveContent(id, !currentSaved);
    }
  };
  
  const renderContentCard = (item: ContentItem) => (
    <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link to={item.url} className="block">
        <div className="relative h-40 bg-gray-100">
          {item.coverImage ? (
            <img 
              src={item.coverImage} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50">
              {item.type === 'video' ? (
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Play size={32} className="text-red-500 ml-1" />
                </div>
              ) : (
                getContentTypeIcon(item.type)
              )}
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <button 
              onClick={(e) => handleSaveContent(item.id, item.isSaved || false, e)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.isSaved ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:text-blue-500'
              }`}
            >
              <Bookmark size={16} />
            </button>
          </div>
          
          {item.condition && (
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {item.condition}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              {getContentTypeIcon(item.type)}
              <span className="ml-1 capitalize">{item.type}</span>
            </div>
            
            {item.duration && (
              <div className="flex items-center ml-3">
                <Clock size={14} className="mr-1" />
                <span>{formatDuration(item.duration)}</span>
              </div>
            )}
          </div>
          
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
          
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
              <img 
                src={item.author.image} 
                alt={item.author.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/public/doctor-placeholder.png';
                }}
              />
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium">{item.author.name}</span>
              {item.author.verified && (
                <CheckCircle size={12} className="ml-1 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
  
  return (
    <div>
      {displayedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contenido educativo</h3>
          <p className="text-gray-500">
            Tu equipo médico te recomendará artículos y recursos relevantes para tu salud.
          </p>
        </div>
      ) : showCategories ? (
        <div className="space-y-8">
          {Object.entries(groupedContent).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                <Link 
                  to={`/contenido/categoria/${category.toLowerCase().replace(/ /g, '-')}`}
                  className="text-blue-600 text-sm font-medium hover:text-blue-800"
                >
                  Ver todo
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map(renderContentCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedItems.map(renderContentCard)}
        </div>
      )}
    </div>
  );
};

export default EducationalContent;
