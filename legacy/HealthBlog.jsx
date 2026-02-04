import { useState, useEffect } from 'react';
import Icon from './ui/Icon';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Layout from './Layout';

export default function HealthBlog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: 'document-text' },
    { id: 'prevention', name: 'Prevención', icon: 'shield-check' },
    { id: 'nutrition', name: 'Nutrición', icon: 'heart' },
    { id: 'mental-health', name: 'Salud Mental', icon: 'brain' },
    { id: 'fitness', name: 'Ejercicio', icon: 'bolt' },
    { id: 'women-health', name: 'Salud Femenina', icon: 'user-group' },
    { id: 'children', name: 'Salud Infantil', icon: 'academic-cap' }
  ];

  useEffect(() => {
    // Simulate loading articles
    const mockArticles = [
      {
        id: 1,
        title: "10 Consejos para Mantener un Corazón Saludable",
        excerpt: "Descubre las mejores prácticas para cuidar tu salud cardiovascular y prevenir enfermedades del corazón.",
        category: "prevention",
        author: "Dr. María González",
        authorSpecialty: "Cardiología",
        readTime: "5 min",
        publishDate: "2024-01-15",
        image: "/images/blog/heart-health.jpg",
        featured: true
      },
      {
        id: 2,
        title: "Alimentación Balanceada: Guía Completa",
        excerpt: "Aprende sobre los nutrientes esenciales y cómo crear una dieta equilibrada para toda la familia.",
        category: "nutrition",
        author: "Dra. Ana Martínez",
        authorSpecialty: "Nutriología",
        readTime: "8 min",
        publishDate: "2024-01-12",
        image: "/images/blog/nutrition.jpg",
        featured: false
      },
      {
        id: 3,
        title: "Manejo del Estrés en la Vida Moderna",
        excerpt: "Técnicas efectivas para reducir el estrés y mejorar tu bienestar mental en el día a día.",
        category: "mental-health",
        author: "Dr. Carlos Rodríguez",
        authorSpecialty: "Psiquiatría",
        readTime: "6 min",
        publishDate: "2024-01-10",
        image: "/images/blog/mental-health.jpg",
        featured: false
      },
      {
        id: 4,
        title: "Ejercicio en Casa: Rutinas Efectivas",
        excerpt: "Mantente activo desde casa con estas rutinas de ejercicio diseñadas por especialistas en deporte.",
        category: "fitness",
        author: "Dr. Luis Fernández",
        authorSpecialty: "Medicina del Deporte",
        readTime: "7 min",
        publishDate: "2024-01-08",
        image: "/images/blog/fitness.jpg",
        featured: false
      },
      {
        id: 5,
        title: "Cuidados Prenatales: Guía para Embarazadas",
        excerpt: "Todo lo que necesitas saber sobre el cuidado durante el embarazo y la preparación para el parto.",
        category: "women-health",
        author: "Dra. Patricia López",
        authorSpecialty: "Ginecología",
        readTime: "10 min",
        publishDate: "2024-01-05",
        image: "/images/blog/prenatal.jpg",
        featured: true
      },
      {
        id: 6,
        title: "Vacunas Infantiles: Calendario Actualizado",
        excerpt: "Conoce el calendario de vacunación recomendado para proteger a tus hijos de enfermedades prevenibles.",
        category: "children",
        author: "Dr. Roberto Sánchez",
        authorSpecialty: "Pediatría",
        readTime: "4 min",
        publishDate: "2024-01-03",
        image: "/images/blog/vaccines.jpg",
        featured: false
      }
    ];

    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const featuredArticles = articles.filter(article => article.featured);

  if (loading) {
    return (
      <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="h-48 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    
    </Layout>
  );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Blog de Salud
        </h1>
        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
          Artículos escritos por profesionales médicos verificados para mantenerte informado sobre salud y bienestar
        </p>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Icon name="star" size="sm" className="text-warning-500" />
            Artículos Destacados
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <Icon name="document-text" size="xl" className="text-primary-600" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="primary" size="sm">
                      {categories.find(cat => cat.id === article.category)?.name}
                    </Badge>
                    <span className="text-sm text-neutral-500">{article.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-neutral-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {article.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{article.author}</div>
                        <div className="text-xs text-neutral-500">{article.authorSpecialty}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Leer más
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <Icon name={category.icon} size="sm" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
              <Icon name="document-text" size="lg" className="text-primary-600" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" size="sm">
                  {categories.find(cat => cat.id === article.category)?.name}
                </Badge>
                <span className="text-sm text-neutral-500">{article.readTime}</span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-neutral-600 mb-4 line-clamp-3">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{article.author}</div>
                    <div className="text-xs text-neutral-500">{article.authorSpecialty}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Leer
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="primary" size="lg">
          <Icon name="plus" size="sm" className="mr-2" />
          Cargar Más Artículos
        </Button>
      </div>
    </div>
  );
}
