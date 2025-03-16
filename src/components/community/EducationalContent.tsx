import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, FileText, ExternalLink, BookmarkPlus, Bookmark } from 'lucide-react';

// Types
export interface EducationalContentItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  timeToRead: number; // minutes
  imageUrl?: string;
  recommendedBy?: string;
  saved: boolean;
  url: string;
}

interface EducationalContentProps {
  contentItems: EducationalContentItem[];
  onSaveContent: (id: string, saved: boolean) => void;
  showCategories?: boolean;
  isLoading?: boolean;
}

// Mock data
const mockContentItems: EducationalContentItem[] = [
  {
    id: '1',
    title: 'Cómo manejar la diabetes durante la temporada de fiestas',
    excerpt: 'Consejos prácticos para mantener niveles de glucosa estables durante celebraciones y comidas especiales.',
    category: 'Diabetes',
    timeToRead: 5,
    recommendedBy: 'Dra. Ana García',
    saved: false,
    url: '/contenido/diabetes-fiestas'
  },
  {
    id: '2',
    title: 'Ejercicios de respiración para reducir la ansiedad',
    excerpt: 'Aprende técnicas simples de respiración que puedes practicar en cualquier momento para calmar tu mente.',
    category: 'Salud Mental',
    timeToRead: 3,
    recommendedBy: 'Dr. Carlos Mendoza',
    saved: true,
    url: '/contenido/ejercicios-respiracion'
  },
  {
    id: '3',
    title: 'Nutrición básica: comprendiendo los grupos alimenticios',
    excerpt: 'Una guía simple para entender los diferentes grupos de alimentos y cómo incorporarlos en tu dieta diaria.',
    category: 'Nutrición',
    timeToRead: 8,
    recommendedBy: 'Dra. Laura Sánchez',
    saved: false,
    url: '/contenido/grupos-alimenticios'
  }
];

const EducationalContent: React.FC<EducationalContentProps> = ({
  contentItems = [],
  onSaveContent,
  showCategories = true,
  isLoading = false
}) => {
  // Use mock data if no content items are provided
  const displayItems = contentItems.length > 0 ? contentItems : mockContentItems;
  
  // Local state for saved content until parent updates
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>(
    displayItems.reduce((acc, item) => ({ ...acc, [item.id]: item.saved }), {})
  );
  
  // Categories for filter (if showCategories is true)
  const categories = [...new Set(displayItems.map(item => item.category))];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Filter items by category if a category is selected
  const filteredItems = selectedCategory
    ? displayItems.filter(item => item.category === selectedCategory)
    : displayItems;
  
  const handleSaveToggle = (id: string) => {
    const newSavedStatus = !savedItems[id];
    setSavedItems(prev => ({ ...prev, [id]: newSavedStatus }));
    onSaveContent(id, newSavedStatus);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {showCategories && (
          <div className="flex overflow-x-auto pb-2 mb-4 space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (displayItems.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen size={40} className="mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">No hay contenido educativo disponible.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Category filter */}
      {showCategories && categories.length > 0 && (
        <div className="flex overflow-x-auto pb-2 mb-4 space-x-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-1 rounded-full text-sm font-medium ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-4 py-1 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      
      {/* Content items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-900 mb-2">
                  <Link to={item.url} className="hover:text-blue-600">
                    {item.title}
                  </Link>
                </h3>
                <button
                  onClick={() => handleSaveToggle(item.id)}
                  className="text-gray-400 hover:text-blue-600 flex-shrink-0 ml-2"
                  title={savedItems[item.id] ? "Guardado" : "Guardar"}
                >
                  {savedItems[item.id] ? <Bookmark size={18} className="text-blue-600" /> : <BookmarkPlus size={18} />}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {item.excerpt}
              </p>
              
              <div className="flex items-center text-xs text-gray-500">
                <span className="inline-flex items-center mr-3">
                  <FileText size={14} className="mr-1" />
                  {item.timeToRead} min de lectura
                </span>
                
                {item.recommendedBy && (
                  <span className="mr-3">
                    Recomendado por: {item.recommendedBy}
                  </span>
                )}
                
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-auto">
                  {item.category}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link
                to={item.url}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Leer artículo completo
                <ExternalLink size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationalContent;