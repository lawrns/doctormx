import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui';
import DomainManagement from '../components/domain/DomainManagement';
import DoctoraliaIntegration from '../components/calendar/DoctoraliaIntegration';
import SubscriptionManagement from '../components/subscription/SubscriptionManagement';
import { Globe, Calendar, CreditCard, User, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Doctor settings page with tabs for different settings sections
 */
const DoctorSettingsPage = () => {
  const { doctorId: paramDoctorId } = useParams();
  const { doctorId: authDoctorId, isDoctor } = useAuth();
  const [activeTab, setActiveTab] = useState('domains');
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the authenticated doctor ID if available, otherwise use the URL parameter
  const effectiveDoctorId = isDoctor ? authDoctorId : paramDoctorId;

  // Fetch doctor on load
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        
        // Use dynamic import to avoid circular dependencies
        const { supabase } = await import('../contexts/SupabaseContext').then(m => {
          // Need to get the context hook result directly
          const contextHook = m.useSupabase;
          const result = contextHook();
          return { supabase: result.supabase };
        });
        
        if (effectiveDoctorId) {
          const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', effectiveDoctorId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setDoctor({
              id: data.id,
              name: data.name || 'Dr. Sin Nombre',
              specialty: data.specialty || 'Medicina General',
              feature_flags: data.feature_flags || {
                doctoraliaSync: {
                  enabled: true
                },
                customDomain: {
                  enabled: true
                }
              }
            });
          } else {
            // Fallback to mock data if no doctor is found
            setDoctor({
              id: effectiveDoctorId || '1',
              name: 'Dr. Juan García',
              specialty: 'Cardiología',
              feature_flags: {
                doctoraliaSync: {
                  enabled: true
                },
                customDomain: {
                  enabled: true
                }
              }
            });
          }
        } else {
          throw new Error('No doctor ID provided');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load doctor information. Please try again.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [effectiveDoctorId]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-lg mx-auto mt-12 border border-red-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-lg mx-auto mt-12 border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Médico no encontrado</h1>
          <p className="text-gray-600 mb-6">Lo sentimos, no pudimos encontrar el médico que estás buscando.</p>
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 inline-flex items-center"
          >
            <ChevronLeft size={16} className="mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-b from-blue-700 to-blue-600 text-white mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <Link to="/" className="text-white hover:text-blue-100 transition-colors duration-200 flex items-center">
              <ChevronLeft size={16} className="mr-1" />
              <span>Volver</span>
            </Link>
          </div>
          <div className="md:flex md:items-center md:justify-between md:space-x-5">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    className="h-20 w-20 rounded-full border-4 border-white shadow-md"
                    src={`https://ui-avatars.com/api/?name=${doctor.name}&background=0D8ABC&color=fff`}
                    alt=""
                  />
                  <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{doctor.name}</h1>
                <p className="text-blue-100 font-medium">
                  {doctor.specialty}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="domains">Dominios</option>
            <option value="calendar">Agenda</option>
            <option value="subscription">Suscripción</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200 bg-white">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="px-6 pt-4">
              <TabsList className="bg-blue-50 border border-blue-100">
                <TabsTrigger value="domains" className="flex items-center gap-2 data-[state=active]:text-blue-700 data-[state=active]:shadow-md">
                  <Globe size={16} />
                  <span>Dominios</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:text-blue-700 data-[state=active]:shadow-md">
                  <Calendar size={16} />
                  <span>Agenda</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2 data-[state=active]:text-blue-700 data-[state=active]:shadow-md">
                  <CreditCard size={16} />
                  <span>Suscripción</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="domains" className="pt-6 animate-in fade-in-50 duration-300">
                <DomainManagement doctorId={doctor.id} />
              </TabsContent>
              
              <TabsContent value="calendar" className="pt-6 animate-in fade-in-50 duration-300">
                <DoctoraliaIntegration doctorId={doctor.id} />
              </TabsContent>
              
              <TabsContent value="subscription" className="pt-6 animate-in fade-in-50 duration-300">
                <SubscriptionManagement doctorId={doctor.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DoctorSettingsPage;