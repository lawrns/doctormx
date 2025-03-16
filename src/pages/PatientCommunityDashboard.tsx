import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MyCareTeam from '../components/community/MyCareTeam';
import ProviderUpdates from '../components/community/ProviderUpdates';
import EducationalContent from '../components/community/EducationalContent';
import CommunityGroups from '../components/community/CommunityGroups';

// Mock data for provider updates
const mockProviderUpdates = [
  {
    id: '1',
    type: 'broadcast',
    title: 'Temporada de gripe: Vacúnate pronto',
    content: 'La temporada de gripe está por comenzar. Recomendamos a todos nuestros pacientes programar su vacuna anual contra la influenza lo antes posible. Tenemos disponibilidad en nuestro consultorio durante todo el mes de octubre. Protégete a ti y a tu familia.',
    author: {
      id: 'doc1',
      name: 'Dra. Ana García',
      specialty: 'Medicina General',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-06-01T15:30:00',
    urgent: true,
    likes: 24,
    liked: false,
    category: 'Prevención'
  },
  {
    id: '2',
    type: 'health_tip',
    title: 'Consejos para mantener una buena presión arterial',
    content: 'Basado en tus últimas lecturas, aquí hay algunos consejos para ayudarte a mantener tu presión arterial en niveles saludables:\n\n1. Reduce el consumo de sal a menos de 5g al día\n2. Mantén una actividad física regular (30 minutos, 5 veces por semana)\n3. Limita el consumo de alcohol\n4. Incorpora más frutas y verduras a tu dieta\n5. Mantén un peso saludable',
    author: {
      id: 'doc2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'Cardiología',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-05-25T09:15:00',
    likes: 12,
    liked: true,
    category: 'Hipertensión'
  },
  {
    id: '3',
    type: 'appointment_reminder',
    title: 'Recordatorio de cita próxima',
    content: 'Tienes una cita programada con la Dra. Laura Sánchez este viernes 20 de junio a las 16:30. Por favor, recuerda completar el cuestionario pre-cita que te enviamos por correo electrónico.',
    author: {
      id: 'doc3',
      name: 'Dra. Laura Sánchez',
      specialty: 'Ginecología',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-06-18T10:00:00',
    appointmentId: 'apt123',
    appointmentDate: '2025-06-20T16:30:00'
  }
];

// Mock data for care team
const mockCareTeam = [
  {
    id: 'doc1',
    name: 'Dra. Ana García',
    specialty: 'Medicina General',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    verified: true,
    lastInteraction: '2025-06-01T15:30:00',
    upcomingAppointment: null,
    hasNewUpdates: true
  },
  {
    id: 'doc2',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Cardiología',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    verified: true,
    lastInteraction: '2025-05-25T09:15:00',
    upcomingAppointment: null,
    hasNewUpdates: false
  },
  {
    id: 'doc3',
    name: 'Dra. Laura Sánchez',
    specialty: 'Ginecología',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    verified: true,
    lastInteraction: '2025-06-18T10:00:00',
    upcomingAppointment: '2025-06-20T16:30:00',
    hasNewUpdates: true
  },
  {
    id: 'doc4',
    name: 'Dr. Miguel Ángel Torres',
    specialty: 'Dermatología',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    verified: true,
    lastInteraction: '2025-05-10T11:00:00',
    upcomingAppointment: null,
    hasNewUpdates: false
  }
];

// Mock data for educational content
const mockEducationalContent = [
  {
    id: 'content1',
    type: 'article',
    title: 'Cómo controlar la hipertensión con cambios en el estilo de vida',
    description: 'Descubre estrategias efectivas para mantener tu presión arterial bajo control sin necesidad de medicamentos. Aprende sobre alimentación, ejercicio y técnicas de manejo del estrés.',
    author: {
      id: 'doc2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'Cardiología',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-05-15T10:00:00',
    url: '/articulos/control-hipertension-estilo-vida',
    coverImage: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    duration: 12,
    category: 'Hipertensión',
    tags: ['presión arterial', 'estilo de vida', 'nutrición'],
    isSaved: false,
    condition: 'Hipertensión'
  },
  {
    id: 'content2',
    type: 'video',
    title: 'Ejercicios seguros para personas con problemas cardíacos',
    description: 'Serie de ejercicios diseñados específicamente para personas con condiciones cardíacas, con explicaciones detalladas sobre cómo realizarlos de manera segura y efectiva.',
    author: {
      id: 'doc2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'Cardiología',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-05-20T14:30:00',
    url: '/videos/ejercicios-cardiacos',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    duration: 25,
    category: 'Salud Cardiovascular',
    tags: ['ejercicio', 'corazón', 'rehabilitación'],
    isSaved: true,
    condition: 'Hipertensión'
  },
  {
    id: 'content3',
    type: 'guide',
    title: 'Guía completa sobre la dieta DASH para hipertensión',
    description: 'Todo lo que necesitas saber sobre la dieta DASH (Dietary Approaches to Stop Hypertension), incluyendo menús semanales, recetas y consejos para implementarla en tu vida diaria.',
    author: {
      id: 'doc2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'Cardiología',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-05-10T09:45:00',
    url: '/guias/dieta-dash',
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    duration: 30,
    category: 'Nutrición',
    tags: ['dieta', 'hipertensión', 'alimentación'],
    isSaved: false,
    condition: 'Hipertensión'
  },
  {
    id: 'content4',
    type: 'article',
    title: 'Entendiendo los resultados de tus análisis de sangre',
    description: 'Aprende a interpretar los valores más comunes en tus resultados de laboratorio, qué significan y cuándo deberías consultar con tu médico sobre ellos.',
    author: {
      id: 'doc1',
      name: 'Dra. Ana García',
      specialty: 'Medicina General',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      verified: true
    },
    createdAt: '2025-06-05T11:20:00',
    url: '/articulos/entendiendo-analisis-sangre',
    coverImage: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    duration: 15,
    category: 'Laboratorio',
    tags: ['análisis', 'sangre', 'resultados'],
    isSaved: false
  }
];

// Mock data for community groups
const mockCommunityGroups = [
  {
    id: 'group1',
    name: 'Grupo de Salud Cardiovascular',
    description: 'Comunidad de apoyo para personas con condiciones cardiovasculares. Comparta experiencias, haga preguntas y obtenga consejos de profesionales.',
    category: 'Cardiología',
    icon: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    membersCount: 245,
    postsCount: 128,
    unreadCount: 3,
    latestActivity: '2025-06-10T14:30:00',
    moderators: [
      {
        id: 'doc2',
        name: 'Dr. Carlos Mendoza',
        specialty: 'Cardiología',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
        verified: true
      },
      {
        id: 'doc5',
        name: 'Dra. María González',
        specialty: 'Medicina Interna',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
        verified: true
      }
    ],
    hasUpcomingEvents: true,
    nextEventDate: '2025-06-15T18:00:00'
  },
  {
    id: 'group2',
    name: 'Bienestar y Salud Mental',
    description: 'Un espacio seguro para hablar sobre salud mental, compartir técnicas de bienestar y apoyarnos mutuamente con consejos para el manejo del estrés.',
    category: 'Salud Mental',
    icon: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    membersCount: 189,
    postsCount: 97,
    unreadCount: 0,
    latestActivity: '2025-06-08T09:15:00',
    moderators: [
      {
        id: 'doc6',
        name: 'Dr. Eduardo Ramírez',
        specialty: 'Psiquiatría',
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
        verified: true
      }
    ],
    hasUpcomingEvents: false
  }
];

const PatientCommunityDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updates, setUpdates] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API calls with timeouts
      setTimeout(() => {
        setUpdates(mockProviderUpdates);
        setProviders(mockCareTeam);
        setContent(mockEducationalContent);
        setGroups(mockCommunityGroups);
        setIsLoading(false);
      }, 1000);
    };
    
    loadData();
  }, []);
  
  const handleLikeUpdate = (id: string) => {
    // In a real app, this would be an API call
    setUpdates(updates.map(update => {
      if (update.id === id) {
        return {
          ...update,
          liked: !update.liked,
          likes: update.liked ? update.likes - 1 : update.likes + 1
        };
      }
      return update;
    }));
  };
  
  const handleDismissUpdate = (id: string) => {
    // In a real app, this would be an API call
    setUpdates(updates.filter(update => update.id !== id));
  };
  
  const handleSaveContent = (id: string, saved: boolean) => {
    // In a real app, this would be an API call
    setContent(content.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isSaved: saved
        };
      }
      return item;
    }));
  };
  
  const handleMessageProvider = (providerId: string) => {
    // In a real app, this would navigate to a messaging interface
    console.log(`Sending message to provider ${providerId}`);
  };
  
  const handleAddProvider = () => {
    // In a real app, this would navigate to a provider search page
    console.log('Adding new provider to care team');
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mi comunidad de salud</h1>
          <p className="text-gray-600">Conecta con tu equipo médico y comunidades de salud</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Provider Updates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actualizaciones de mi equipo médico</h2>
              <ProviderUpdates 
                updates={updates}
                isLoading={isLoading}
                onLike={handleLikeUpdate}
                onDismiss={handleDismissUpdate}
                showLoadMore={false}
              />
            </div>
            
            {/* Educational Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Contenido recomendado por tus médicos</h2>
                <Link 
                  to="/contenido" 
                  className="text-blue-600 text-sm font-medium hover:text-blue-800"
                >
                  Biblioteca completa
                </Link>
              </div>
              <EducationalContent 
                contentItems={content}
                onSaveContent={handleSaveContent}
                showCategories={false}
              />
            </div>
          </div>
          
          {/* Sidebar - right 1/3 */}
          <div className="space-y-8">
            {/* Care Team */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <MyCareTeam 
                providers={providers}
                onMessageProvider={handleMessageProvider}
                onAddProvider={handleAddProvider}
              />
            </div>
            
            {/* Community Groups */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <CommunityGroups groups={groups} />
            </div>
            
            {/* Upcoming Appointments Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
                <Link 
                  to="/dashboard" 
                  className="text-blue-600 text-sm font-medium hover:text-blue-800"
                >
                  Ver todas
                </Link>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ) : mockCareTeam.some(provider => provider.upcomingAppointment) ? (
                <div className="space-y-4">
                  {mockCareTeam
                    .filter(provider => provider.upcomingAppointment)
                    .map(provider => {
                      const appointmentDate = new Date(provider.upcomingAppointment || '');
                      
                      return (
                        <div key={provider.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                              <img 
                                src={provider.image} 
                                alt={provider.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{provider.name}</h3>
                              <p className="text-gray-600 text-sm">{provider.specialty}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              {appointmentDate.toLocaleDateString('es-MX', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}, {appointmentDate.toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            
                            <Link 
                              to={`/dashboard/appointments/upcoming`}
                              className="text-blue-600 text-sm font-medium hover:text-blue-800"
                            >
                              Detalles
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No tienes citas programadas próximamente.</p>
                  <Link 
                    to="/buscar" 
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Agendar una cita
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCommunityDashboard;
