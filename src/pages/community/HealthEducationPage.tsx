import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  difficulty_level: 'Básico' | 'Intermedio' | 'Avanzado';
  estimated_read_time: number;
  author: string;
  created_at: string;
  views: number;
  likes: number;
  content_type: 'article' | 'video' | 'infographic' | 'quiz';
  mexican_context: boolean;
}

interface HealthCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  article_count: number;
  color: string;
}

export default function HealthEducationPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [categories, setCategories] = useState<HealthCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEducationalContent();
  }, []);

  const loadEducationalContent = async () => {
    try {
      // Mock categories with Mexican health focus
      const mockCategories: HealthCategory[] = [
        {
          id: 'diabetes',
          name: 'Diabetes',
          description: 'Información sobre diabetes y su manejo en México',
          icon: '🩺',
          article_count: 25,
          color: 'bg-red-100 text-red-800'
        },
        {
          id: 'nutrition',
          name: 'Nutrición',
          description: 'Alimentación saludable con ingredientes mexicanos',
          icon: '🥑',
          article_count: 32,
          color: 'bg-green-100 text-green-800'
        },
        {
          id: 'mental-health',
          name: 'Salud Mental',
          description: 'Bienestar emocional y salud mental',
          icon: '🧠',
          article_count: 18,
          color: 'bg-purple-100 text-purple-800'
        },
        {
          id: 'pregnancy',
          name: 'Embarazo',
          description: 'Cuidados durante el embarazo y maternidad',
          icon: '🤱',
          article_count: 22,
          color: 'bg-pink-100 text-pink-800'
        },
        {
          id: 'elderly-care',
          name: 'Adultos Mayores',
          description: 'Cuidados especiales para la tercera edad',
          icon: '👴',
          article_count: 15,
          color: 'bg-blue-100 text-blue-800'
        },
        {
          id: 'preventive',
          name: 'Medicina Preventiva',
          description: 'Prevención y detección temprana',
          icon: '🛡️',
          article_count: 28,
          color: 'bg-yellow-100 text-yellow-800'
        }
      ];

      // Mock educational content with Mexican context
      const mockContent: EducationalContent[] = [
        {
          id: '1',
          title: 'Diabetes en México: Estadísticas y Prevención',
          description: 'México ocupa el 6º lugar mundial en diabetes. Aprende cómo prevenir y manejar esta condición.',
          content: 'Contenido completo del artículo...',
          category: 'diabetes',
          tags: ['diabetes', 'prevención', 'estadísticas', 'México'],
          difficulty_level: 'Básico',
          estimated_read_time: 8,
          author: 'Dr. María González, Endocrinóloga',
          created_at: '2024-05-20',
          views: 1547,
          likes: 89,
          content_type: 'article',
          mexican_context: true
        },
        {
          id: '2',
          title: 'Recetas Mexicanas Saludables para Diabéticos',
          description: 'Deliciosas recetas tradicionales adaptadas para personas con diabetes.',
          content: 'Video tutorial con recetas...',
          category: 'nutrition',
          tags: ['diabetes', 'recetas', 'cocina mexicana', 'nutrición'],
          difficulty_level: 'Intermedio',
          estimated_read_time: 15,
          author: 'Nutrióloga Ana Herrera',
          created_at: '2024-05-18',
          views: 2341,
          likes: 156,
          content_type: 'video',
          mexican_context: true
        },
        {
          id: '3',
          title: 'Manejo del Estrés en la Cultura Mexicana',
          description: 'Estrategias culturalmente apropiadas para manejar el estrés y la ansiedad.',
          content: 'Artículo sobre técnicas de manejo...',
          category: 'mental-health',
          tags: ['estrés', 'ansiedad', 'cultura mexicana', 'bienestar'],
          difficulty_level: 'Básico',
          estimated_read_time: 6,
          author: 'Psic. Carlos Ramírez',
          created_at: '2024-05-15',
          views: 987,
          likes: 67,
          content_type: 'article',
          mexican_context: true
        },
        {
          id: '4',
          title: 'Cuidados Prenatales: Guía para Madres Mexicanas',
          description: 'Todo lo que necesitas saber sobre el embarazo y los servicios de salud en México.',
          content: 'Guía completa prenatal...',
          category: 'pregnancy',
          tags: ['embarazo', 'prenatal', 'IMSS', 'ISSSTE'],
          difficulty_level: 'Intermedio',
          estimated_read_time: 12,
          author: 'Dra. Lupita Morales, Ginecóloga',
          created_at: '2024-05-12',
          views: 1876,
          likes: 134,
          content_type: 'article',
          mexican_context: true
        },
        {
          id: '5',
          title: 'Ejercicios en Casa para Adultos Mayores',
          description: 'Rutina de ejercicios seguros y efectivos para personas de la tercera edad.',
          content: 'Video con rutina de ejercicios...',
          category: 'elderly-care',
          tags: ['ejercicio', 'adultos mayores', 'casa', 'seguridad'],
          difficulty_level: 'Básico',
          estimated_read_time: 20,
          author: 'Fisiatra José Mendoza',
          created_at: '2024-05-10',
          views: 1234,
          likes: 98,
          content_type: 'video',
          mexican_context: false
        },
        {
          id: '6',
          title: 'Vacunación en México: Esquema Nacional',
          description: 'Información actualizada sobre el esquema nacional de vacunación mexicano.',
          content: 'Infografía del esquema de vacunación...',
          category: 'preventive',
          tags: ['vacunas', 'prevención', 'esquema nacional', 'SSA'],
          difficulty_level: 'Básico',
          estimated_read_time: 5,
          author: 'Secretaría de Salud',
          created_at: '2024-05-08',
          views: 3421,
          likes: 245,
          content_type: 'infographic',
          mexican_context: true
        }
      ];

      setCategories(mockCategories);
      setContent(mockContent);
    } catch (error) {
      console.error('Error loading educational content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.content_type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'video': return '🎥';
      case 'infographic': return '📊';
      case 'quiz': return '❓';
      default: return '📄';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Básico': return 'bg-green-100 text-green-800';
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'Avanzado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando contenido educativo...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Educación en Salud</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Contenido educativo verificado por profesionales de la salud mexicanos
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Buscar contenido educativo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="article">Artículos</option>
                <option value="video">Videos</option>
                <option value="infographic">Infografías</option>
                <option value="quiz">Cuestionarios</option>
              </select>
            </div>
          </div>

          {/* Categories Grid */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Categorías de Salud</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{category.article_count} artículos</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Contenido Educativo ({filteredContent.length})
              </h3>
              <Button variant="outline" onClick={() => navigate('/community/contribute')}>
                Contribuir Contenido
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/education/${item.id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl">{getContentTypeIcon(item.content_type)}</span>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(item.difficulty_level)}>
                          {item.difficulty_level}
                        </Badge>
                        {item.mexican_context && (
                          <Badge className="bg-green-100 text-green-800">
                            🇲🇽 México
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{item.estimated_read_time} min lectura</span>
                        <span>{item.views} vistas</span>
                      </div>
                      <p className="text-sm text-gray-600">Por {item.author}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{item.likes} likes</span>
                        <Button variant="outline" size="sm">
                          Leer más
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-blue-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-2">¿Quieres contribuir?</h3>
            <p className="text-gray-600 mb-4">
              Si eres profesional de la salud, puedes ayudar creando contenido educativo
            </p>
            <Button onClick={() => navigate('/community/contribute')}>
              Crear Contenido
            </Button>
          </div>
        </div>
      </Section>
    </Container>
  );
}