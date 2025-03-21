import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Input,
  Textarea,
  Badge
} from '../../components/ui';
import { Activity, Award, Bell, Bookmark, Briefcase, Calendar, Check, ChevronRight, Clock, FileText, Filter, Globe, Heart, Link, Lock, Mail, MapPin, MessageSquare, MoreHorizontal, Phone, Plus, PlusCircle, Search, Send, Share2, Star, Tag, ThumbsUp, User, UserPlus, Users } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  profileImage?: string;
  location: string;
  bio: string;
  connectionStatus?: 'connected' | 'pending' | 'none';
  mutualConnections?: number;
}

interface ForumPost {
  id: string;
  author: {
    id: string;
    name: string;
    specialty: string;
    profileImage?: string;
  };
  date: Date;
  content: string;
  topic: string;
  tags: string[];
  likes: number;
  comments: number;
  liked?: boolean;
  bookmarked?: boolean;
  privacy: 'public' | 'community';
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  isVirtual: boolean;
  organizerName: string;
  attendees: number;
  isAttending?: boolean;
}

interface Article {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    specialty: string;
  };
  date: Date;
  summary: string;
  imageUrl?: string;
  tags: string[];
  readTime: number;
  source: string;
  isBookmarked?: boolean;
}

const CommunityPage: React.FC = () => {
  const { doctorId, doctorName, doctorSpecialty } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forum');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTopic, setNewPostTopic] = useState('');
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'community'>('community');
  
  // Fetch community data
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          // Mock doctors
          const mockDoctors: Doctor[] = [
            {
              id: 'dr_1',
              name: 'Dra. Ana Martínez',
              specialty: 'Cardiología',
              location: 'Ciudad de México',
              bio: 'Especialista en cardiología intervencionista con 15 años de experiencia.',
              connectionStatus: 'connected',
              mutualConnections: 12
            },
            {
              id: 'dr_2',
              name: 'Dr. Jorge Ramírez',
              specialty: 'Neurología',
              location: 'Guadalajara',
              bio: 'Neurólogo especializado en trastornos del sueño y epilepsia.',
              connectionStatus: 'none',
              mutualConnections: 5
            },
            {
              id: 'dr_3',
              name: 'Dra. Laura Sánchez',
              specialty: 'Pediatría',
              location: 'Monterrey',
              bio: 'Pediatra con enfoque en desarrollo infantil y vacunación.',
              connectionStatus: 'pending',
              mutualConnections: 3
            },
            {
              id: 'dr_4',
              name: 'Dr. Carlos Vega',
              specialty: 'Medicina Familiar',
              location: 'Ciudad de México',
              bio: 'Médico familiar comprometido con la atención preventiva.',
              connectionStatus: 'connected',
              mutualConnections: 8
            },
            {
              id: 'dr_5',
              name: 'Dra. Sofía Torres',
              specialty: 'Endocrinología',
              location: 'Puebla',
              bio: 'Especialista en diabetes y trastornos metabólicos.',
              connectionStatus: 'none',
              mutualConnections: 2
            }
          ];
          
          // Mock forum posts
          const mockForumPosts: ForumPost[] = [
            {
              id: 'post_1',
              author: {
                id: 'dr_1',
                name: 'Dra. Ana Martínez',
                specialty: 'Cardiología',
                profileImage: ''
              },
              date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              content: 'Colegas, ¿han tenido experiencia con el uso de los nuevos anticoagulantes orales en pacientes con fibrilación auricular y enfermedad renal crónica estadio III? Estoy buscando información sobre dosificación y seguimiento en estos casos.',
              topic: 'Consulta Clínica',
              tags: ['Cardiología', 'Anticoagulantes', 'Enfermedad Renal'],
              likes: 15,
              comments: 8,
              liked: true,
              bookmarked: false,
              privacy: 'community'
            },
            {
              id: 'post_2',
              author: {
                id: 'dr_4',
                name: 'Dr. Carlos Vega',
                specialty: 'Medicina Familiar',
                profileImage: ''
              },
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
              content: 'Comparto esta interesante guía actualizada sobre el manejo de la hipertensión arterial en atención primaria. Incluye nuevos algoritmos de tratamiento y recomendaciones para poblaciones especiales. ¡Espero les sea útil! https://ejemplo.com/guia-hipertension',
              topic: 'Recursos Médicos',
              tags: ['Hipertensión', 'Guías Clínicas', 'Atención Primaria'],
              likes: 32,
              comments: 5,
              liked: false,
              bookmarked: true,
              privacy: 'public'
            },
            {
              id: 'post_3',
              author: {
                id: 'dr_3',
                name: 'Dra. Laura Sánchez',
                specialty: 'Pediatría',
                profileImage: ''
              },
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              content: 'Estamos organizando un webinar gratuito sobre "Actualización en vacunación infantil" para el próximo jueves. Contaremos con expertos de la Asociación Mexicana de Pediatría. ¿Quién se apunta? Los temas incluirán el nuevo esquema nacional y mitos comunes que enfrentamos en la consulta.',
              topic: 'Eventos',
              tags: ['Pediatría', 'Vacunación', 'Webinar'],
              likes: 28,
              comments: 12,
              liked: false,
              bookmarked: false,
              privacy: 'community'
            }
          ];
          
          // Mock events
          const mockEvents: Event[] = [
            {
              id: 'event_1',
              title: 'Congreso Nacional de Medicina Interna',
              description: 'El congreso anual más importante de medicina interna en México, con ponentes nacionales e internacionales, talleres prácticos y presentación de investigaciones recientes.',
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // In 30 days
              location: 'Centro de Convenciones, Ciudad de México',
              isVirtual: false,
              organizerName: 'Colegio de Medicina Interna de México',
              attendees: 156,
              isAttending: true
            },
            {
              id: 'event_2',
              title: 'Webinar: Telemedicina Post-Pandemia',
              description: 'Discusión sobre los retos y oportunidades de la telemedicina después de la pandemia. Aspectos legales, herramientas recomendadas y mejores prácticas.',
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
              location: 'Zoom (Online)',
              isVirtual: true,
              organizerName: 'Asociación de Salud Digital de México',
              attendees: 89,
              isAttending: false
            },
            {
              id: 'event_3',
              title: 'Taller: Interpretación de Electrocardiogramas',
              description: 'Taller práctico para mejorar las habilidades en la interpretación de electrocardiogramas. Casos clínicos y ejercicios interactivos.',
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 14 days
              location: 'Hospital Ángeles, Puebla',
              isVirtual: false,
              organizerName: 'Sociedad Mexicana de Cardiología',
              attendees: 42,
              isAttending: false
            }
          ];
          
          // Mock articles
          const mockArticles: Article[] = [
            {
              id: 'article_1',
              title: 'Avances recientes en el tratamiento de la diabetes tipo 2',
              author: {
                id: 'dr_5',
                name: 'Dra. Sofía Torres',
                specialty: 'Endocrinología'
              },
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              summary: 'Revisión actualizada de las nuevas opciones terapéuticas para la diabetes tipo 2, incluyendo agonistas del receptor GLP-1, inhibidores SGLT2 y terapias combinadas.',
              tags: ['Diabetes', 'Endocrinología', 'Tratamiento'],
              readTime: 12,
              source: 'Revista Mexicana de Endocrinología',
              isBookmarked: true
            },
            {
              id: 'article_2',
              title: 'Burnout médico: Estrategias de prevención en tiempos de crisis',
              author: {
                id: 'dr_2',
                name: 'Dr. Jorge Ramírez',
                specialty: 'Neurología'
              },
              date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
              summary: 'Análisis del síndrome de burnout en profesionales de la salud y estrategias prácticas para su prevención y manejo, especialmente relevantes después de la pandemia.',
              tags: ['Burnout', 'Salud Mental', 'Bienestar Médico'],
              readTime: 8,
              source: 'Journal of Medical Wellbeing',
              isBookmarked: false
            },
            {
              id: 'article_3',
              title: 'Inteligencia artificial en el diagnóstico médico: Estado actual y perspectivas',
              author: {
                id: 'dr_4',
                name: 'Dr. Carlos Vega',
                specialty: 'Medicina Familiar'
              },
              date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
              summary: 'Exploración de las aplicaciones actuales de la inteligencia artificial en el diagnóstico médico, sus limitaciones y el futuro de esta tecnología en la práctica clínica.',
              tags: ['Inteligencia Artificial', 'Tecnología Médica', 'Diagnóstico'],
              readTime: 15,
              source: 'Digital Health Journal',
              isBookmarked: false
            }
          ];
          
          setDoctors(mockDoctors);
          setForumPosts(mockForumPosts);
          setEvents(mockEvents);
          setArticles(mockArticles);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching community data:', error);
        setLoading(false);
      }
    };
    
    fetchCommunityData();
  }, [doctorId]);
  
  // Toggle like post
  const toggleLikePost = (postId: string) => {
    setForumPosts(posts => 
      posts.map(post => {
        if (post.id === postId) {
          const liked = !post.liked;
          return {
            ...post,
            liked,
            likes: liked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  };
  
  // Toggle bookmark post
  const toggleBookmarkPost = (postId: string) => {
    setForumPosts(posts => 
      posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            bookmarked: !post.bookmarked
          };
        }
        return post;
      })
    );
  };
  
  // Toggle event attendance
  const toggleEventAttendance = (eventId: string) => {
    setEvents(events => 
      events.map(event => {
        if (event.id === eventId) {
          const isAttending = !event.isAttending;
          return {
            ...event,
            isAttending,
            attendees: isAttending ? event.attendees + 1 : event.attendees - 1
          };
        }
        return event;
      })
    );
  };
  
  // Toggle bookmark article
  const toggleBookmarkArticle = (articleId: string) => {
    setArticles(articles => 
      articles.map(article => {
        if (article.id === articleId) {
          return {
            ...article,
            isBookmarked: !article.isBookmarked
          };
        }
        return article;
      })
    );
  };
  
  // Connect with doctor
  const connectWithDoctor = (doctorId: string) => {
    setDoctors(doctors => 
      doctors.map(doctor => {
        if (doctor.id === doctorId) {
          return {
            ...doctor,
            connectionStatus: doctor.connectionStatus === 'none' ? 'pending' : doctor.connectionStatus
          };
        }
        return doctor;
      })
    );
  };
  
  // Add tag to new post
  const addTagToNewPost = (tag: string) => {
    if (tag && !newPostTags.includes(tag)) {
      setNewPostTags([...newPostTags, tag]);
    }
  };
  
  // Remove tag from new post
  const removeTagFromNewPost = (tag: string) => {
    setNewPostTags(newPostTags.filter(t => t !== tag));
  };
  
  // Create new post
  const createNewPost = () => {
    if (!newPostContent.trim() || !newPostTopic) return;
    
    const newPost: ForumPost = {
      id: `post_${Date.now()}`,
      author: {
        id: doctorId || '',
        name: doctorName || 'Dr. Usuario',
        specialty: doctorSpecialty || 'Medicina General',
        profileImage: ''
      },
      date: new Date(),
      content: newPostContent,
      topic: newPostTopic,
      tags: newPostTags,
      likes: 0,
      comments: 0,
      liked: false,
      bookmarked: false,
      privacy: postPrivacy
    };
    
    setForumPosts([newPost, ...forumPosts]);
    
    // Reset form
    setNewPostContent('');
    setNewPostTopic('');
    setNewPostTags([]);
    setPostPrivacy('community');
  };
  
  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `Hace ${diffMins} minutos`;
    } else if (diffMins < 24 * 60) {
      const hours = Math.floor(diffMins / 60);
      return `Hace ${hours} horas`;
    } else {
      const days = Math.floor(diffMins / (60 * 24));
      if (days === 1) return 'Ayer';
      if (days < 7) return `Hace ${days} días`;
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
    }
  };
  
  // Format future date
  const formatFutureDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <DashboardLayout title="Comunidad Médica" loading={loading}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunidad Médica</h1>
          <p className="text-gray-500">Conéctate con otros profesionales de la salud, comparte conocimientos y mantente actualizado</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="forum">
            <MessageSquare size={16} className="mr-2" />
            Foro
          </TabsTrigger>
          <TabsTrigger value="doctors">
            <Users size={16} className="mr-2" />
            Directorio médico
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar size={16} className="mr-2" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="articles">
            <FileText size={16} className="mr-2" />
            Artículos
          </TabsTrigger>
        </TabsList>
        
        {/* Forum Tab */}
        <TabsContent value="forum">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* New Post */}
              <Card className="mb-6 p-6">
                <h2 className="text-lg font-semibold mb-4">Crear nueva publicación</h2>
                
                <Textarea
                  placeholder="¿Qué quieres compartir con la comunidad médica?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                  className="mb-4"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tema
                    </label>
                    <select
                      value={newPostTopic}
                      onChange={(e) => setNewPostTopic(e.target.value)}
                      className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar tema</option>
                      <option value="Consulta Clínica">Consulta Clínica</option>
                      <option value="Recursos Médicos">Recursos Médicos</option>
                      <option value="Eventos">Eventos</option>
                      <option value="Investigación">Investigación</option>
                      <option value="Tecnología Médica">Tecnología Médica</option>
                      <option value="Formación Médica">Formación Médica</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Privacidad
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="privacy"
                          value="community"
                          checked={postPrivacy === 'community'}
                          onChange={() => setPostPrivacy('community')}
                        />
                        <span className="ml-2 flex items-center">
                          <Lock size={14} className="mr-1" />
                          Comunidad
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="privacy"
                          value="public"
                          checked={postPrivacy === 'public'}
                          onChange={() => setPostPrivacy('public')}
                        />
                        <span className="ml-2 flex items-center">
                          <Globe size={14} className="mr-1" />
                          Público
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newPostTags.map(tag => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          onClick={() => removeTagFromNewPost(tag)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      placeholder="Agregar etiqueta"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput) {
                          e.preventDefault();
                          addTagToNewPost(tagInput);
                          setTagInput('');
                        }
                      }}
                      className="rounded-r-none"
                    />
                    <Button
                      className="rounded-l-none"
                      onClick={() => {
                        if (tagInput) {
                          addTagToNewPost(tagInput);
                          setTagInput('');
                        }
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    icon={<Send size={16} />}
                    onClick={createNewPost}
                    disabled={!newPostContent.trim() || !newPostTopic}
                  >
                    Publicar
                  </Button>
                </div>
              </Card>
              
              {/* Search Posts */}
              <div className="mb-6">
                <Input
                  placeholder="Buscar publicaciones por tema, autor o contenido"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={16} />}
                />
              </div>
              
              {/* Posts List */}
              <div className="space-y-6">
                {forumPosts
                  .filter(post => 
                    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map(post => (
                    <Card key={post.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                            {post.author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                            <div className="text-sm text-gray-500">
                              {post.author.specialty} · {formatDate(post.date)}
                              <span className="ml-2">
                                {post.privacy === 'public' ? (
                                  <Globe size={14} className="inline ml-1" />
                                ) : (
                                  <Lock size={14} className="inline ml-1" />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<MoreHorizontal size={16} />}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <div className="bg-blue-50 text-blue-800 text-xs px-2.5 py-0.5 rounded inline-flex items-center mb-2">
                          <Tag size={12} className="mr-1" />
                          {post.topic}
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map(tag => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button
                            className={`flex items-center text-sm ${post.liked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => toggleLikePost(post.id)}
                          >
                            {post.liked ? (
                              <Heart size={16} className="mr-1 fill-blue-600" />
                            ) : (
                              <Heart size={16} className="mr-1" />
                            )}
                            {post.likes}
                          </button>
                          
                          <button
                            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                          >
                            <MessageSquare size={16} className="mr-1" />
                            {post.comments}
                          </button>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            className={`text-sm ${post.bookmarked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => toggleBookmarkPost(post.id)}
                          >
                            {post.bookmarked ? (
                              <Bookmark size={16} className="fill-blue-600" />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </button>
                          
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                
                {forumPosts.filter(post => 
                  post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  post.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length === 0 && (
                  <Card className="p-8 text-center">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron publicaciones</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Sé el primero en crear una publicación'}
                    </p>
                  </Card>
                )}
              </div>
            </div>
            
            <div>
              {/* Popular Topics */}
              <Card className="p-6 mb-6">
                <h2 className="font-semibold mb-4">Temas populares</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Consulta Clínica</span>
                    </div>
                    <span className="text-xs text-gray-500">28 publicaciones</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Recursos Médicos</span>
                    </div>
                    <span className="text-xs text-gray-500">24 publicaciones</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Tecnología Médica</span>
                    </div>
                    <span className="text-xs text-gray-500">19 publicaciones</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Formación Médica</span>
                    </div>
                    <span className="text-xs text-gray-500">15 publicaciones</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Investigación</span>
                    </div>
                    <span className="text-xs text-gray-500">12 publicaciones</span>
                  </div>
                </div>
              </Card>
              
              {/* Events Preview */}
              <Card className="p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">Próximos eventos</h2>
                  
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600"
                    onClick={() => setActiveTab('events')}
                  >
                    Ver todos
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {events.slice(0, 2).map(event => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar size={14} className="mr-1" />
                        {formatFutureDate(event.date)}
                        {event.isVirtual && (
                          <Badge variant="info" className="ml-2">Virtual</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {event.attendees} asistentes
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 px-2 h-7"
                        >
                          Más info
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Suggested Connections */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">Conexiones sugeridas</h2>
                  
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600"
                    onClick={() => setActiveTab('doctors')}
                  >
                    Ver todas
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {doctors
                    .filter(doctor => doctor.connectionStatus === 'none')
                    .slice(0, 3)
                    .map(doctor => (
                      <div key={doctor.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                            {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                            <p className="text-sm text-gray-500">{doctor.specialty}</p>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<UserPlus size={14} />}
                          onClick={() => connectWithDoctor(doctor.id)}
                        >
                          Conectar
                        </Button>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Doctors Tab */}
        <TabsContent value="doctors">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <Input
                    placeholder="Buscar médicos por nombre o especialidad"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={16} />}
                  />
                </div>
                
                <Button
                  variant="outline"
                  icon={<Filter size={16} />}
                >
                  Filtros
                </Button>
              </div>
              
              <div className="space-y-6">
                {doctors
                  .filter(doctor => 
                    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(doctor => (
                    <Card key={doctor.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex items-start">
                          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                            {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                            <p className="text-gray-600 mb-1">{doctor.specialty}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin size={14} className="mr-1" />
                              {doctor.location}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 sm:mt-0">
                          {doctor.connectionStatus === 'connected' ? (
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto"
                              icon={<MessageSquare size={16} />}
                            >
                              Mensaje
                            </Button>
                          ) : doctor.connectionStatus === 'pending' ? (
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto"
                              disabled
                            >
                              Solicitud enviada
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              className="w-full sm:w-auto"
                              icon={<UserPlus size={16} />}
                              onClick={() => connectWithDoctor(doctor.id)}
                            >
                              Conectar
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-700 mb-3">{doctor.bio}</p>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Users size={14} className="mr-1" />
                          {doctor.mutualConnections} conexiones en común
                        </div>
                      </div>
                    </Card>
                  ))}
                
                {doctors.filter(doctor => 
                  doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <Card className="p-8 text-center">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron médicos</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay médicos registrados'}
                    </p>
                  </Card>
                )}
              </div>
            </div>
            
            <div>
              <Card className="p-6 mb-6">
                <h2 className="font-semibold mb-4">Mi red</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-900">Conexiones</div>
                    <div className="text-sm text-gray-700">
                      {doctors.filter(d => d.connectionStatus === 'connected').length}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-900">Solicitudes pendientes</div>
                    <div className="text-sm text-gray-700">
                      {doctors.filter(d => d.connectionStatus === 'pending').length}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Especialidades en mi red</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">30% Medicina Familiar</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">25% Pediatría</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">20% Cardiología</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">15% Neurología</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">10% Otras</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Invitar colegas</h2>
                
                <p className="text-sm text-gray-700 mb-4">
                  Invita a tus colegas a unirse a la red médica para ampliar tu círculo profesional.
                </p>
                
                <Input
                  placeholder="Correo electrónico de tu colega"
                  className="mb-3"
                />
                
                <Button
                  variant="primary"
                  className="w-full"
                  icon={<Send size={16} />}
                >
                  Enviar invitación
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <Input
                    placeholder="Buscar eventos por título, tema o ubicación"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={16} />}
                  />
                </div>
                
                <Button
                  variant="outline"
                  icon={<Filter size={16} />}
                >
                  Filtros
                </Button>
              </div>
              
              <div className="space-y-6">
                {events
                  .filter(event => 
                    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.location.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(event => (
                    <Card key={event.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg mr-2">{event.title}</h3>
                            {event.isVirtual && (
                              <Badge variant="info">Virtual</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <Calendar size={14} className="mr-1" />
                            {formatFutureDate(event.date)}
                            
                            <span className="mx-2">•</span>
                            
                            <MapPin size={14} className="mr-1" />
                            {event.location}
                          </div>
                          
                          <p className="text-gray-700 mb-3">{event.description}</p>
                          
                          <p className="text-sm text-gray-600">
                            Organizado por: {event.organizerName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users size={14} className="mr-1" />
                          {event.attendees} asistentes
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Calendar size={16} />}
                          >
                            Agregar a calendario
                          </Button>
                          
                          <Button
                            variant={event.isAttending ? 'outline' : 'primary'}
                            size="sm"
                            icon={event.isAttending ? <Check size={16} /> : <PlusCircle size={16} />}
                            onClick={() => toggleEventAttendance(event.id)}
                          >
                            {event.isAttending ? 'Asistiré' : 'Asistir'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                
                {events.filter(event => 
                  event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.location.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <Card className="p-8 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron eventos</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay eventos próximos disponibles'}
                    </p>
                  </Card>
                )}
              </div>
            </div>
            
            <div>
              <Card className="p-6 mb-6">
                <h2 className="font-semibold mb-4">Mis eventos</h2>
                
                <div className="space-y-4">
                  {events.filter(event => event.isAttending).length > 0 ? (
                    events
                      .filter(event => event.isAttending)
                      .map(event => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar size={12} className="mr-1" />
                            {formatFutureDate(event.date)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin size={12} className="mr-1" />
                            {event.location}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4">
                      <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No tienes eventos próximos</p>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="p-6 mb-6">
                <h2 className="font-semibold mb-4">Filtrar por categoría</h2>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Congresos y conferencias</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Webinars</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Talleres prácticos</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Cursos de formación</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Eventos de networking</span>
                  </label>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Proponer un evento</h2>
                
                <p className="text-sm text-gray-700 mb-4">
                  ¿Tienes una idea para un evento? Compártela con la comunidad.
                </p>
                
                <Button
                  variant="primary"
                  className="w-full"
                  icon={<Calendar size={16} />}
                >
                  Proponer evento
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Articles Tab */}
        <TabsContent value="articles">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <Input
                    placeholder="Buscar artículos por título, autor o tema"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={16} />}
                  />
                </div>
                
                <Button
                  variant="outline"
                  icon={<Filter size={16} />}
                >
                  Filtros
                </Button>
              </div>
              
              <div className="space-y-6">
                {articles
                  .filter(article => 
                    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map(article => (
                    <Card key={article.id} className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{article.title}</h3>
                        
                        <button
                          className={`text-sm ${article.isBookmarked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                          onClick={() => toggleBookmarkArticle(article.id)}
                        >
                          {article.isBookmarked ? (
                            <Bookmark size={16} className="fill-blue-600" />
                          ) : (
                            <Bookmark size={16} />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <User size={14} className="mr-1" />
                        {article.author.name} - {article.author.specialty}
                        
                        <span className="mx-2">•</span>
                        
                        <Calendar size={14} className="mr-1" />
                        {formatDate(article.date)}
                        
                        <span className="mx-2">•</span>
                        
                        <Clock size={14} className="mr-1" />
                        {article.readTime} min de lectura
                      </div>
                      
                      <p className="text-gray-700 mb-3">{article.summary}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.tags.map(tag => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Fuente: {article.source}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          Leer artículo
                          <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                
                {articles.filter(article => 
                  article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  article.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length === 0 && (
                  <Card className="p-8 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron artículos</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay artículos disponibles'}
                    </p>
                  </Card>
                )}
              </div>
            </div>
            
            <div>
              <Card className="p-6 mb-6">
                <h2 className="font-semibold mb-4">Artículos guardados</h2>
                
                <div className="space-y-4">
                  {articles.filter(article => article.isBookmarked).length > 0 ? (
                    articles
                      .filter(article => article.isBookmarked)
                      .map(article => (
                        <div key={article.id} className="p-3 bg-gray-50 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                          <p className="text-xs text-gray-500 mb-2">Por {article.author.name}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <Clock size={12} className="inline mr-1" />
                              {article.readTime} min
                            </div>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-blue-600 p-0 h-auto"
                            >
                              Leer
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4">
                      <Bookmark size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No tienes artículos guardados</p>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="p-6 mb-6">
                <h2 className="font-semibold mb-4">Temas populares</h2>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    COVID-19
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Telemedicina
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Inteligencia Artificial
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Salud Mental
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Investigación Clínica
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Compartir un artículo</h2>
                
                <p className="text-sm text-gray-700 mb-4">
                  ¿Has leído algo interesante? Compártelo con la comunidad médica.
                </p>
                
                <div className="mb-4">
                  <Input
                    placeholder="URL del artículo"
                    icon={<Link size={16} />}
                  />
                </div>
                
                <Button
                  variant="primary"
                  className="w-full"
                  icon={<Share2 size={16} />}
                >
                  Compartir artículo
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CommunityPage;