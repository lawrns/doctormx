import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  BarChart4, 
  FileText, 
  User, 
  Settings, 
  HelpCircle,
  Book,
  Download
} from 'lucide-react';
import SymptomDashboard from '../../components/sintomas/SymptomDashboard';
import HealthProfile from '../../components/sintomas/HealthProfile';
import HealthEducation from '../../components/sintomas/HealthEducation';
import analyticsService from '../../services/AnalyticsService';
import AccessibilityPanel from '../../components/sintomas/AccessibilityPanel';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'education' | 'reports' | 'settings'>('dashboard');
  
  // Track page view
  React.useEffect(() => {
    analyticsService.trackEvent('page_view', { page: 'symptom_dashboard' });
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SymptomDashboard />;
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil de Salud</h2>
            <HealthProfile />
          </div>
        );
      case 'education':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recursos Educativos</h2>
            <p className="text-gray-600 mb-6">
              Información y recursos educativos para entender mejor tu salud y síntomas.
            </p>
            <HealthEducation customContent={{
              title: 'Bienestar General',
              description: 'Información y consejos para mantener una buena salud general y prevenir enfermedades comunes.',
              sections: [
                {
                  title: 'Hábitos Saludables',
                  content: (
                    <div className="space-y-2">
                      <p>Adoptar hábitos saludables es fundamental para mantener un buen estado de salud y prevenir enfermedades. Estos son algunos hábitos que puedes incorporar a tu rutina diaria:</p>
                      <ul className="space-y-2 ml-6 list-disc">
                        <li>Mantén una alimentación variada y equilibrada, rica en frutas, verduras, proteínas magras y granos enteros.</li>
                        <li>Realiza actividad física regularmente, al menos 150 minutos de ejercicio moderado a la semana.</li>
                        <li>Duerme entre 7-8 horas diarias para permitir que tu cuerpo se recupere adecuadamente.</li>
                        <li>Mantente bien hidratado bebiendo suficiente agua a lo largo del día.</li>
                        <li>Evita el consumo excesivo de alcohol y no fumes.</li>
                        <li>Gestiona el estrés mediante técnicas de relajación y actividades que disfrutes.</li>
                        <li>Realiza chequeos médicos preventivos según las recomendaciones para tu edad y género.</li>
                      </ul>
                    </div>
                  )
                },
                {
                  title: 'Cuándo Buscar Atención Médica',
                  content: (
                    <div className="space-y-2">
                      <p>Saber cuándo buscar atención médica es crucial para el cuidado de tu salud. Estos son signos que indican que deberías consultar a un profesional:</p>
                      <ul className="space-y-2 ml-6 list-disc">
                        <li>Síntomas persistentes que no mejoran con medidas habituales.</li>
                        <li>Dolor intenso o repentino, especialmente en el pecho, cabeza o abdomen.</li>
                        <li>Dificultad para respirar o falta de aire.</li>
                        <li>Mareos intensos, confusión o cambios en el estado mental.</li>
                        <li>Fiebre alta (más de 39°C) que persiste por más de dos días.</li>
                        <li>Cambios repentinos en la visión, habla o movilidad.</li>
                        <li>Síntomas que interfieren significativamente con tus actividades diarias.</li>
                      </ul>
                      <p className="mt-4 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <strong>Importante:</strong> En caso de emergencias médicas como dolor intenso en el pecho, dificultad severa para respirar, hemorragia abundante o lesiones graves, busca atención médica inmediata o llama a los servicios de emergencia.
                      </p>
                    </div>
                  )
                }
              ],
              resources: [
                {
                  id: 'gen-health-1',
                  title: 'Guía para la salud preventiva y chequeos recomendados',
                  type: 'article',
                  description: 'Aprende sobre las pruebas de detección y chequeos recomendados según tu edad, género y factores de riesgo.',
                  url: 'https://www.mayoclinic.org/es-es/healthy-lifestyle/adult-health/in-depth/health-screening/art-20044697',
                  source: 'Mayo Clinic',
                  readingTime: '8 min',
                  difficulty: 'basic',
                  tags: ['prevención', 'chequeos médicos', 'salud general']
                },
                {
                  id: 'gen-health-2',
                  title: 'Actividad física para la salud',
                  type: 'video',
                  description: 'Recomendaciones sobre actividad física para adultos y cómo incorporarla a tu rutina diaria.',
                  url: 'https://www.who.int/es/news-room/fact-sheets/detail/physical-activity',
                  source: 'Organización Mundial de la Salud',
                  duration: '5:30',
                  difficulty: 'basic',
                  tags: ['ejercicio', 'actividad física', 'salud general']
                },
                {
                  id: 'gen-health-3',
                  title: 'Nutrición equilibrada: Guía visual',
                  type: 'infographic',
                  description: 'Infografía que ilustra los componentes de una alimentación equilibrada y porciones recomendadas.',
                  url: 'https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/translations/spanish/',
                  source: 'Harvard T.H. Chan School of Public Health',
                  difficulty: 'basic',
                  tags: ['nutrición', 'alimentación', 'dieta saludable']
                }
              ]
            }} />
          </div>
        );
      case 'reports':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informes y Reportes</h2>
            <p className="text-gray-600 mb-6">
              Descarga informes y reportes de tu historial de síntomas para compartir con profesionales médicos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Historial Completo</h3>
                <p className="text-gray-600 mb-4">
                  Reporte completo de todas tus evaluaciones de síntomas ordenadas cronológicamente.
                </p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
                  <Download size={16} className="mr-2" />
                  Descargar PDF
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart4 size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reporte Estadístico</h3>
                <p className="text-gray-600 mb-4">
                  Análisis estadístico de tus síntomas, incluyendo frecuencia, severidad y patrones identificados.
                </p>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center">
                  <Download size={16} className="mr-2" />
                  Descargar Reporte
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informes Recientes</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <FileText size={16} className="text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-800">Evaluación de dolor de cabeza</p>
                      <p className="text-xs text-gray-500">Generado el 12/03/2025</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    Descargar
                  </button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <FileText size={16} className="text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-800">Reporte trimestral de síntomas</p>
                      <p className="text-xs text-gray-500">Generado el 01/03/2025</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    Descargar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start">
                <HelpCircle size={20} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-blue-700 text-sm">
                  Los informes generados pueden ser compartidos con tu médico durante las consultas para proporcionar un historial detallado de tus síntomas y su evolución en el tiempo.
                </p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencias de Notificaciones</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Recordatorios de seguimiento</p>
                    <p className="text-sm text-gray-600">Recibe recordatorios para hacer seguimiento a tus síntomas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Alertas de citas médicas</p>
                    <p className="text-sm text-gray-600">Notificaciones sobre citas agendadas con médicos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Consejos de salud</p>
                    <p className="text-sm text-gray-600">Recibe consejos personalizados basados en tus síntomas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacidad y Datos</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Compartir datos anónimos</p>
                    <p className="text-sm text-gray-600">Contribuir a la investigación médica con datos anónimos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Análisis avanzado de síntomas</p>
                    <p className="text-sm text-gray-600">Utilizar IA para analizar patrones en tus síntomas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Eliminar todos mis datos
                </button>
                
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Descargar mis datos en formato JSON
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Accesibilidad</h3>
              <p className="text-gray-600 mb-4">
                Ajusta la configuración de accesibilidad para adaptar la interfaz a tus necesidades.
              </p>
              
              <button
                onClick={() => {
                  // Open accessibility panel (already available in the corner)
                  // This is just a visual indication for the user
                  alert('El panel de accesibilidad está disponible en la esquina inferior derecha de la pantalla.');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Abrir panel de accesibilidad
              </button>
            </div>
          </div>
        );
      default:
        return <SymptomDashboard />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Add accessibility panel */}
        <AccessibilityPanel />
        
        <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
          {/* Sidebar navigation */}
          <div className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <h2 className="font-bold text-blue-900">Panel de Síntomas</h2>
              </div>
              
              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center ${
                        activeTab === 'dashboard' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Home size={18} className={`mr-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Inicio</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center ${
                        activeTab === 'profile' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User size={18} className={`mr-2 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Perfil de Salud</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('education')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center ${
                        activeTab === 'education' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Book size={18} className={`mr-2 ${activeTab === 'education' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Educación</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center ${
                        activeTab === 'reports' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart4 size={18} className={`mr-2 ${activeTab === 'reports' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Informes</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center ${
                        activeTab === 'settings' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Settings size={18} className={`mr-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Configuración</span>
                    </button>
                  </li>
                </ul>
              </nav>
              
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => navigate('/sintomas/evaluacion')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Nueva Evaluación
                </button>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-start">
                  <HelpCircle size={16} className="text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    ¿Necesitas ayuda? Contacta a nuestro equipo de soporte para asistencia con el panel de síntomas.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;