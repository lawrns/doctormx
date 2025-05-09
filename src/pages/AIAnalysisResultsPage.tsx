import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Share2, Download, Calendar, MapPin, AlertCircle } from 'lucide-react';
import AIService from '../services/ai/AIService';
import SEO from '../components/seo/SEO';

function AIAnalysisResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!sessionId) {
        setError('No se encontró el ID de sesión');
        setIsLoading(false);
        return;
      }
      
      try {
        setTimeout(() => {
          setAnalysisData({
            id: sessionId,
            date: new Date().toISOString(),
            symptoms: ['Dolor de cabeza', 'Fiebre', 'Fatiga'],
            possibleConditions: [
              { name: 'Gripe', probability: 0.75 },
              { name: 'Resfriado común', probability: 0.45 },
              { name: 'Sinusitis', probability: 0.30 }
            ],
            recommendedSpecialty: 'Medicina General',
            urgencyLevel: 'Moderada',
            recommendations: [
              'Descansar y mantenerse hidratado',
              'Tomar medicamentos para la fiebre según indicación médica',
              'Consultar con un médico si los síntomas persisten más de 3 días'
            ],
            nearbyProviders: [
              { id: 'doc1', name: 'Dra. María Rodríguez', specialty: 'Medicina General', distance: '1.2 km' },
              { id: 'doc2', name: 'Dr. Carlos Méndez', specialty: 'Medicina General', distance: '2.5 km' }
            ]
          });
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        setError('Hubo un error al cargar los resultados del análisis');
        setIsLoading(false);
      }
    };
    
    fetchAnalysisData();
  }, [sessionId]);
  
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando resultados del análisis...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !analysisData) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-flex items-center mb-4">
              <AlertCircle size={24} className="mr-2" />
              <span>{error || 'No se pudo cargar el análisis'}</span>
            </div>
            <div>
              <Link
                to="/ai-doctor"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Volver al Doctor IA
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <SEO 
        title="Resultados de Análisis | Doctor IA" 
        description="Revisa los resultados de tu análisis de síntomas con Doctor IA. Encuentra posibles condiciones, recomendaciones y especialistas cercanos."
        canonical={`/ai-doctor/analysis/${sessionId}`}
        keywords="resultados médicos, análisis de síntomas, diagnóstico preliminar, recomendaciones médicas"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Resultados del Análisis</h1>
              <div className="text-sm">
                ID: {analysisData.id.substring(0, 8)}
              </div>
            </div>
            <p className="text-blue-100 mt-1">
              {new Date(analysisData.date).toLocaleDateString()} - {new Date(analysisData.date).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="p-6">
            <div className="flex justify-end space-x-2 mb-6">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md text-sm flex items-center transition-colors">
                <Printer size={16} className="mr-1" />
                Imprimir
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md text-sm flex items-center transition-colors">
                <Share2 size={16} className="mr-1" />
                Compartir
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md text-sm flex items-center transition-colors">
                <Download size={16} className="mr-1" />
                Descargar PDF
              </button>
            </div>
            
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Síntomas reportados</h2>
              <div className="flex flex-wrap gap-2">
                {analysisData.symptoms.map((symptom: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Posibles condiciones</h2>
              <div className="space-y-4">
                {analysisData.possibleConditions.map((condition: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{condition.name}</h3>
                      <span className="text-sm text-gray-500">
                        Probabilidad: {Math.round(condition.probability * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${condition.probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Este análisis es preliminar y no constituye un diagnóstico médico. Consulta con un profesional de la salud para una evaluación completa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recomendaciones</h2>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Urgencia: {analysisData.urgencyLevel}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {analysisData.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium mb-1">Especialidad recomendada:</p>
                <p className="text-gray-700">{analysisData.recommendedSpecialty}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Especialistas cercanos</h2>
              <div className="space-y-4">
                {analysisData.nearbyProviders.map((provider: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{provider.name}</h3>
                        <p className="text-blue-700 text-sm">{provider.specialty}</p>
                        <p className="text-gray-500 text-sm flex items-center mt-1">
                          <MapPin size={14} className="mr-1" />
                          {provider.distance}
                        </p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md flex items-center transition-colors">
                        <Calendar size={14} className="mr-1" />
                        Agendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Link
                  to="/buscar"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  Ver más especialistas
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link
            to="/ai-doctor"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver al Doctor IA
          </Link>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AIAnalysisResultsPage;
