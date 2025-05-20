import { useState } from 'react';
import { Book, Play, ExternalLink, Clock, Award } from 'lucide-react';
import { EducationalResource } from '../../../data/healthEducationData';

interface ResourcesListProps {
  resources: EducationalResource[];
}

const ResourcesList: React.FC<ResourcesListProps> = ({ resources }) => {
  const [resourceFilter, setResourceFilter] = useState<'all' | 'article' | 'video' | 'infographic'>('all');
  
  // Filter resources based on selected type
  const filteredResources = resourceFilter === 'all' 
    ? resources 
    : resources.filter(resource => resource.type === resourceFilter);

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de recurso</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setResourceFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              resourceFilter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setResourceFilter('article')}
            className={`px-3 py-1 rounded-full text-sm ${
              resourceFilter === 'article'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Artículos
          </button>
          <button
            onClick={() => setResourceFilter('video')}
            className={`px-3 py-1 rounded-full text-sm ${
              resourceFilter === 'video'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setResourceFilter('infographic')}
            className={`px-3 py-1 rounded-full text-sm ${
              resourceFilter === 'infographic'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Infografías
          </button>
        </div>
      </div>
      
      {filteredResources && filteredResources.length > 0 ? (
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Book size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-gray-500 text-lg font-medium mb-1">No hay recursos disponibles</h4>
          <p className="text-gray-400">
            {resourceFilter === 'all' 
              ? 'No encontramos recursos educativos para esta condición.' 
              : `No hay ${resourceFilter === 'article' ? 'artículos' : 
                 resourceFilter === 'video' ? 'videos' : 'infografías'} disponibles.`}
          </p>
        </div>
      )}
    </div>
  );
};

interface ResourceCardProps {
  resource: EducationalResource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          {resource.type === 'article' && (
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Book size={24} className="text-blue-600" />
            </div>
          )}
          {resource.type === 'video' && (
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Play size={24} className="text-red-600" />
            </div>
          )}
          {resource.type === 'infographic' && (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-base font-medium text-gray-900 mb-1">{resource.title}</h4>
            <ExternalLink size={16} className="text-gray-400 mt-1" />
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
          
          <div className="flex flex-wrap items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center">
              <Award size={12} className="mr-1" />
              {resource.source}
            </span>
            
            {resource.readingTime && (
              <span className="flex items-center">
                <Clock size={12} className="mr-1" />
                Lectura: {resource.readingTime}
              </span>
            )}
            
            {resource.duration && (
              <span className="flex items-center">
                <Clock size={12} className="mr-1" />
                Duración: {resource.duration}
              </span>
            )}
            
            {resource.difficulty && (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M2 20h.01"></path>
                  <path d="M7 20v-4"></path>
                  <path d="M12 20v-8"></path>
                  <path d="M17 20v-12"></path>
                  <path d="M22 4v16"></path>
                </svg>
                {resource.difficulty === 'basic' ? 'Básico' : 
                resource.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </span>
            )}
          </div>
          
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {resource.tags.map((tag, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
};

export default ResourcesList;