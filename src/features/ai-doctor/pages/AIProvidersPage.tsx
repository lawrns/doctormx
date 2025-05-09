import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AIService from '../../../core/services/ai/AIService';
import { MapPin, Phone, Calendar, Star, ChevronLeft } from 'lucide-react';

function AIProvidersPage() {
  const [providers, setProviders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { specialty } = useParams<{ specialty: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        
        let userLocation = null;
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        }
        
        if (!userLocation) {
          setError('Necesitamos acceso a tu ubicación para encontrar proveedores cercanos.');
          setLoading(false);
          return;
        }
        
        const providerList = await AIService.findNearbyProviders(
          specialty || 'General', 
          userLocation
        );
        
        setProviders(providerList || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching providers:', error);
        setError('No se pudieron cargar los proveedores. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };
    
    fetchProviders();
  }, [specialty]);

  const handleScheduleAppointment = (providerId: string) => {
    navigate(`/reservar/${providerId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 mb-6"
      >
        <ChevronLeft size={20} />
        <span>Volver</span>
      </button>
      
      <h1 className="text-2xl font-bold mb-6">
        {specialty 
          ? `Especialistas en ${specialty} cercanos` 
          : 'Proveedores médicos cercanos'}
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {providers.length > 0 ? (
            providers.map((provider, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
                    {provider.profileImage ? (
                      <img 
                        src={provider.profileImage} 
                        alt={provider.name} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        {provider.title || 'Dr.'} {provider.name || `Médico ${index + 1}`}
                      </h2>
                      {provider.rating && (
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="ml-1 text-gray-700">{provider.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 font-medium">{provider.specialty || specialty || 'Médico General'}</p>
                    <p className="text-gray-600 mt-1">{provider.address || 'Dirección no disponible'}</p>
                    <p className="text-gray-600 mb-3">
                      {provider.distance ? `${(provider.distance / 1000).toFixed(1)} km de distancia` : 'Distancia no disponible'}
                    </p>
                    
                    {provider.availability && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Próxima disponibilidad:</h3>
                        <div className="flex flex-wrap gap-2">
                          {provider.availability.map((slot: string, idx: number) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button 
                        onClick={() => handleScheduleAppointment(provider.id)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Calendar size={16} className="mr-2" />
                        Agendar cita
                      </button>
                      
                      {provider.address && (
                        <a 
                          href={`https://maps.google.com/?q=${provider.address}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <MapPin size={16} className="mr-2" />
                          Cómo llegar
                        </a>
                      )}
                      
                      {provider.phone && (
                        <a 
                          href={`tel:${provider.phone}`}
                          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Phone size={16} className="mr-2" />
                          Llamar
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proveedores disponibles</h3>
              <p className="text-gray-600">
                No se encontraron especialistas cercanos en tu área.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIProvidersPage;
