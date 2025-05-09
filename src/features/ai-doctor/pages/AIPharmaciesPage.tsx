import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AIService from '../../../core/services/ai/AIService';
import { MapPin, Phone, ExternalLink, ChevronLeft } from 'lucide-react';

function AIPharmaciesPage() {
  const [pharmacies, setPharmacies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { medications } = useParams<{ medications: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchPharmacies = async () => {
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
        
        const medicationList = medications 
          ? medications.split(',') 
          : ['paracetamol', 'ibuprofeno'];
        
        const pharmacyList = await AIService.getPharmacyRecommendations(
          medicationList, 
          userLocation
        );
        
        setPharmacies(pharmacyList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
        setError('No se pudieron cargar las farmacias. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };
    
    fetchPharmacies();
  }, [medications]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 mb-6"
      >
        <ChevronLeft size={20} />
        <span>Volver</span>
      </button>
      
      <h1 className="text-2xl font-bold mb-6">Farmacias Cercanas</h1>
      
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
          {pharmacies.length > 0 ? (
            pharmacies.map((pharmacy, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-green-100 rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">{pharmacy.name || `Farmacia ${index + 1}`}</h2>
                      {pharmacy.isSponsored && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          Patrocinado
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{pharmacy.address || 'Dirección no disponible'}</p>
                    <p className="text-gray-600 mb-3">
                      {pharmacy.distance ? `${(pharmacy.distance / 1000).toFixed(1)} km de distancia` : 'Distancia no disponible'}
                    </p>
                    
                    {pharmacy.available_medications && pharmacy.available_medications.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Medicamentos disponibles:</h3>
                        <div className="flex flex-wrap gap-2">
                          {pharmacy.available_medications.map((med: string, idx: number) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      <a 
                        href={`https://maps.google.com/?q=${pharmacy.address}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <MapPin size={16} className="mr-2" />
                        Cómo llegar
                      </a>
                      
                      {pharmacy.phone && (
                        <a 
                          href={`tel:${pharmacy.phone}`}
                          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Phone size={16} className="mr-2" />
                          Llamar
                        </a>
                      )}
                      
                      {pharmacy.website && (
                        <a 
                          href={pharmacy.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Sitio web
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay farmacias disponibles</h3>
              <p className="text-gray-600">
                No se encontraron farmacias cercanas con los medicamentos solicitados.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIPharmaciesPage;
