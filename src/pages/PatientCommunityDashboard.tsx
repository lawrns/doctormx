import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MyCareTeam from '../components/community/MyCareTeam';
import ProviderUpdates from '../components/community/ProviderUpdates';
import EducationalContent from '../components/community/EducationalContent';
import CommunityGroups from '../components/community/CommunityGroups';

const PatientCommunityDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Set page title
    document.title = 'Mi Comunidad de Salud | Doctor.mx';
    
    // Simulate a loading delay to give APIs time to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // We will let the individual components fetch their own data
  
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
                isLoading={isLoading}
                fetchData={true}
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
                contentItems={[]} // Will be updated when we implement educational content API
                onSaveContent={() => {}} // Will be implemented in the next phase
                showCategories={false}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {/* Sidebar - right 1/3 */}
          <div className="space-y-8">
            {/* Care Team */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <MyCareTeam 
                loading={isLoading}
                fetchData={true}
              />
            </div>
            
            {/* Community Groups */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <CommunityGroups 
                groups={[]} // Will be updated when we implement community groups API
                isLoading={isLoading}
              />
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