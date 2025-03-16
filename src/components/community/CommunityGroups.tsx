import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, MessageSquare } from 'lucide-react';

// Types
interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  imageUrl?: string;
  category: string;
  isJoined: boolean;
  unreadCount?: number;
}

interface CommunityGroupsProps {
  groups: CommunityGroup[];
  isLoading?: boolean;
}

// Mock data (will be populated via props in production)
const mockCommunityGroups: CommunityGroup[] = [
  {
    id: '1',
    name: 'Diabetes Tipo 2',
    description: 'Grupo de apoyo para personas con diabetes tipo 2. Compartimos consejos, recetas y experiencias.',
    memberCount: 124,
    category: 'Condiciones crónicas',
    isJoined: true,
    unreadCount: 3
  },
  {
    id: '2',
    name: 'Nutrición saludable',
    description: 'Discusiones sobre alimentación equilibrada, recetas y consejos para una vida saludable.',
    memberCount: 276,
    category: 'Estilo de vida',
    isJoined: true,
    unreadCount: 0
  },
  {
    id: '3',
    name: 'Salud mental',
    description: 'Espacio seguro para hablar sobre ansiedad, depresión y bienestar emocional.',
    memberCount: 198,
    category: 'Salud mental',
    isJoined: false
  }
];

const CommunityGroups: React.FC<CommunityGroupsProps> = ({ 
  groups = [], 
  isLoading = false 
}) => {
  // Use mock data if no groups are provided
  const displayGroups = groups.length > 0 ? groups : mockCommunityGroups;
  
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mis comunidades</h2>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mis comunidades</h2>
        <Link to="/comunidades" className="text-blue-600 text-sm font-medium hover:text-blue-800">
          Explorar
        </Link>
      </div>
      
      {displayGroups.length === 0 ? (
        <div className="text-center py-6">
          <Users size={40} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 mb-4">No te has unido a ninguna comunidad todavía.</p>
          <Link 
            to="/comunidades" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Explorar comunidades
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayGroups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-900">{group.name}</h3>
                {group.isJoined && group.unreadCount && group.unreadCount > 0 ? (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {group.unreadCount} nuevos
                  </span>
                ) : null}
              </div>
              
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {group.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {group.memberCount} miembros
                </span>
                
                {group.isJoined ? (
                  <Link
                    to={`/comunidades/${group.id}`}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <MessageSquare size={12} className="mr-1" />
                    Ver discusiones
                  </Link>
                ) : (
                  <button className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
                    <UserPlus size={12} className="mr-1" />
                    Unirse
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <Link
            to="/comunidades"
            className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
          >
            Ver todas las comunidades
          </Link>
        </div>
      )}
    </div>
  );
};

export default CommunityGroups;