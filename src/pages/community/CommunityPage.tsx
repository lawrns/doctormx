import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { supabase } from '../../lib/supabase';

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  created_at: string;
  is_public: boolean;
  tags: string[];
}

interface HealthDiscussion {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  replies_count: number;
  likes_count: number;
  category: string;
  tags: string[];
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'groups' | 'discussions' | 'resources'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [discussions, setDiscussions] = useState<HealthDiscussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      // Load community groups
      const mockGroups: CommunityGroup[] = [
        {
          id: '1',
          name: 'Diabetes en México',
          description: 'Grupo de apoyo para personas con diabetes y sus familias',
          category: 'Condiciones Crónicas',
          member_count: 1247,
          created_at: '2024-01-15',
          is_public: true,
          tags: ['diabetes', 'nutrición', 'ejercicio', 'medicamentos']
        },
        {
          id: '2',
          name: 'Salud Mental y Bienestar',
          description: 'Espacio seguro para hablar sobre salud mental y apoyo emocional',
          category: 'Salud Mental',
          member_count: 856,
          created_at: '2024-01-20',
          is_public: true,
          tags: ['ansiedad', 'depresión', 'terapia', 'mindfulness']
        },
        {
          id: '3',
          name: 'Mamás Primerizas',
          description: 'Comunidad para madres primerizas con dudas y experiencias',
          category: 'Maternidad',
          member_count: 634,
          created_at: '2024-02-01',
          is_public: true,
          tags: ['embarazo', 'lactancia', 'cuidado infantil', 'desarrollo']
        },
        {
          id: '4',
          name: 'Cuidadores Familiares',
          description: 'Apoyo para quienes cuidan familiares con enfermedades crónicas',
          category: 'Cuidadores',
          member_count: 423,
          created_at: '2024-02-10',
          is_public: true,
          tags: ['cuidador', 'familia', 'estrés', 'recursos']
        }
      ];

      // Load health discussions
      const mockDiscussions: HealthDiscussion[] = [
        {
          id: '1',
          title: '¿Cómo manejar la ansiedad durante consultas médicas?',
          content: 'Muchas veces siento mucha ansiedad antes de ir al doctor...',
          author: 'María G.',
          created_at: '2024-05-25',
          replies_count: 12,
          likes_count: 8,
          category: 'Salud Mental',
          tags: ['ansiedad', 'consultas médicas']
        },
        {
          id: '2',
          title: 'Recetas saludables para diabéticos',
          content: 'Comparto algunas recetas que he probado y funcionan bien...',
          author: 'Carlos R.',
          created_at: '2024-05-24',
          replies_count: 18,
          likes_count: 25,
          category: 'Nutrición',
          tags: ['diabetes', 'recetas', 'nutrición']
        },
        {
          id: '3',
          title: 'Rutina de ejercicios en casa para personas mayores',
          content: 'Mi fisioterapeuta me recomendó estos ejercicios...',
          author: 'Ana L.',
          created_at: '2024-05-23',
          replies_count: 7,
          likes_count: 15,
          category: 'Ejercicio',
          tags: ['ejercicio', 'adultos mayores', 'casa']
        }
      ];

      setGroups(mockGroups);
      setDiscussions(mockDiscussions);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderGroups = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Grupos de Salud</h3>
        <Button variant="outline" onClick={() => navigate('/community/create-group')}>
          Crear Grupo
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => navigate(`/community/groups/${group.id}`)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                {group.is_public && <Badge variant="outline">Público</Badge>}
              </div>
              <p className="text-sm text-gray-600">{group.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{group.member_count} miembros</span>
                  <span>{group.category}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {group.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{group.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDiscussions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Discusiones de Salud</h3>
        <Button variant="outline" onClick={() => navigate('/community/new-discussion')}>
          Nueva Discusión
        </Button>
      </div>
      
      <div className="space-y-3">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/community/discussions/${discussion.id}`)}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-lg">{discussion.title}</h4>
                  <Badge variant="outline">{discussion.category}</Badge>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{discussion.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Por {discussion.author}</span>
                  <div className="flex space-x-4">
                    <span>{discussion.replies_count} respuestas</span>
                    <span>{discussion.likes_count} likes</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {discussion.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recursos de Salud</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-medium">Guías de Salud</h4>
              <p className="text-sm text-gray-600">Accede a guías médicas verificadas por profesionales</p>
              <Button variant="outline" className="w-full">Ver Guías</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-medium">Videos Educativos</h4>
              <p className="text-sm text-gray-600">Biblioteca de videos sobre salud y bienestar</p>
              <Button variant="outline" className="w-full">Ver Videos</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-medium">Directorio Médico</h4>
              <p className="text-sm text-gray-600">Encuentra especialistas verificados en tu área</p>
              <Button variant="outline" className="w-full">Buscar Doctores</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando comunidad...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Comunidad DoctorMX</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conecta con otras personas, comparte experiencias y encuentra apoyo en tu journey de salud
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Buscar grupos, discusiones o temas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'groups' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grupos
              </button>
              <button
                onClick={() => setActiveTab('discussions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'discussions' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Discusiones
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'resources' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recursos
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'groups' && renderGroups()}
            {activeTab === 'discussions' && renderDiscussions()}
            {activeTab === 'resources' && renderResources()}
          </div>
        </div>
      </Section>
    </Container>
  );
}