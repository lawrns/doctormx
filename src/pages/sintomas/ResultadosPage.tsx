import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Import icons individually to prevent 'Clock is not defined' error
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Video from 'lucide-react/dist/esm/icons/video';
import Download from 'lucide-react/dist/esm/icons/download';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import InfoIcon from 'lucide-react/dist/esm/icons/info';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import BreadcrumbNav from '../../components/sintomas/BreadcrumbNav';
import ResultsCard from '../../components/sintomas/ResultsCard';
import SpecialistRecommendations from '../../components/sintomas/SpecialistRecommendations';
import HealthEducation from '../../components/sintomas/HealthEducation';
import ResultsExport from '../../components/sintomas/ResultsExport';
import SymptomTracker from '../../components/sintomas/SymptomTracker';
import HealthProfile from '../../components/sintomas/HealthProfile';
import symptomAnalysisService from '../../services/SymptomAnalysisService';
import analyticsService from '../../services/AnalyticsService';

// Mock doctors for recommendation
const mockDoctors = [
  {
    id: '1',
    name: 'Dra. Ana García',
    specialty: 'Neurología',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    rating: 4.9,
    reviewCount: 124,
    availableToday: true,
    nextAvailable: 'Hoy, 15:30',
    matchScore: 95
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Neurología',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    rating: 4.8,
    reviewCount: 98,
    availableToday: false,
    nextAvailable: 'Mañana, 10:00',
    matchScore: 88
  },
  {
    id: '3',
    name: 'Dra. María Rodríguez',
    specialty: 'Medicina General',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    rating: 4.7,
    reviewCount: 156,
    availableToday: true,
    nextAvailable: 'Hoy, 17:00',
    matchScore: 82
  }
];

const ResultadosPage = () => {
  const navigate = useNavigate();
  const [symptomData, setSymptomData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<any[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<'results' | 'doctors' | 'education' | 'track'>('results');

  // Load saved health profile
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('health_profile');
      if (savedProfile) {
        setHealthProfile(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.error('Error loading health profile:', e);
    }
  }, []);

  // Load results from sessionStorage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const savedData = sessionStorage.getItem('symptomResults');
        
        if (!savedData) {
          setError('No se encontraron resultados. Por favor, realice la evaluación de síntomas primero.');
          setLoading(false);
          return;
        }
        
        const parsedData = JSON.parse(savedData);
        setSymptomData(parsedData);
        
        // Extract or generate analysis
        if (parsedData.analysis) {
          setAnalysis(parsedData.analysis);
        } else {
          // Generate analysis if not included
          const generatedAnalysis = await symptomAnalysisService.analyzeSymptoms(
            parsedData.symptomId || 'general_symptoms',
            parsedData.answers || {}
          );
          setAnalysis(generatedAnalysis);
        }
        
        // Filter doctors by specialty
        let filteredDoctors = [...mockDoctors];
        if (parsedData.analysis?.recommendedSpecialties?.length > 0) {
          const specialty = parsedData.analysis.recommendedSpecialties[0];
          filteredDoctors = mockDoctors.filter(doctor => 
            doctor.specialty === specialty || doctor.specialty === 'Medicina General'
          );
        }
        
        setRecommendedDoctors(filteredDoctors);
        
        // Track analytics
        analyticsService.trackAnalysisComplete(parsedData.analysis || parsedData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading results:', error);
        setError('Error al cargar los resultados. Por favor, intente de nuevo.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFindDoctors = (specialty: string) => {
    // Track analytics
    analyticsService.trackDoctorSearch(specialty);
    
    // Navigate to doctor search with the specialty filter applied
    navigate(`/buscar?especialidad=${encodeURIComponent(specialty)}`);
  };

  const handleBookTelemedicine = (doctorId: string) => {
    // Track analytics
    analyticsService.trackAppointmentBooking(doctorId, 'telemedicine');
    
    // Navigate to telemedicine booking with pre-filled symptom data
    navigate(`/telemedicina/reservar/${doctorId}?from=sintomas`);
  };

  // Prepare export data
  const prepareExportData = () => {
    if (!symptomData || !analysis) return null;
    
    return {
      title: `Evaluación de Síntomas: ${symptomData.symptom?.name || symptomData.primarySymptom?.name || 'Resultados'}`,
      subtitle: 'Doctor.mx - Verificación y evaluación de síntomas',
      date: new Date(),
      sections: [
        {
          title: 'Información del Síntoma',
          items: [
            {
              label: 'Síntoma Principal',
              value: symptomData.symptom?.name || symptomData.primarySymptom?.name || 'No especificado'
            },
            {
              label: 'Región del Cuerpo',
              value: symptomData.bodyRegion || symptomData.primarySymptom?.bodyRegion || 'No especificada'
            },
            {
              label: 'Fecha de Evaluación',
              value: new Date().toLocaleDateString(),
              formatType: 'date'
            }
          ]
        },
        {
          title: 'Análisis',
          items: [
            {
              label: 'Nivel de Severidad',
              value: analysis.severityAssessment === 'high' ? 'Alta' : 
                     analysis.severityAssessment === 'moderate' ? 'Moderada' : 'Baja'
            },
            {
              label: 'Nivel de Atención Recomendado',
              value: analysis.urgencyAssessment === 'emergency' ? 'Emergencia' :
                     analysis.urgencyAssessment === 'urgent' ? 'Urgente (1-2 días)' :
                     analysis.urgencyAssessment === 'soon' ? 'Pronto (1 semana)' : 'Rutina'
            },
            {
              label: 'Especialidades Recomendadas',
              value: analysis.recommendedSpecialties || ['Medicina General'],
              formatType: 'list'
            }
          ]
        },
        {
          title: 'Recomendaciones',
          items: [
            {
              label: 'Cuidados Personales',
              value: analysis.selfCareRecommendations || [],
              formatType: 'list'
            }
          ]
        }
      ],
      disclaimer: 'Esta evaluación es orientativa y no sustituye el diagnóstico de un profesional médico. Si sus síntomas empeoran o aparecen nuevos síntomas, busque atención médica inmediatamente.'
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900">Analizando tus respuestas</h2>
          <p className="text-gray-600 mt-2">Estamos procesando tu información para proporcionarte los mejores resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/sintomas')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Volver a la evaluación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/sintomas/evaluacion')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-1" />
            Volver a la evaluación
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              <Download size={16} className="mr-2" />
              Exportar
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              <Share2 size={16} className="mr-2" />
              Compartir
            </button>
          </div>
        </div>

        <BreadcrumbNav currentStep={2} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resultados de la Evaluación</h1>
          <p className="text-gray-600 mt-2">
            Basado en tus respuestas, hemos generado las siguientes recomendaciones.
          </p>
        </div>
        
        {/* Health Profile Summary */}
        {healthProfile && (
          <div className="mb-6">
            <HealthProfile 
              readOnly={true}
              compact={true}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 mb-6">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'results' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <InfoIcon size={16} className="inline-block mr-2" />
              Resultados del Análisis
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'doctors' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Stethoscope size={16} className="inline-block mr-2" />
              Especialistas Recomendados
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'education' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <InfoIcon size={16} className="inline-block mr-2" />
              Información Médica
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'track' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar size={16} className="inline-block mr-2" />
              Seguimiento
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="mb-12" ref={resultsRef}>
          {activeTab === 'results' && (
            <div>
              {/* Summary Banner */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumen de Síntomas</h3>
                    <div className="text-gray-700">
                      <p className="mb-1">
                        <strong>Síntoma principal:</strong> {symptomData?.symptom?.name || symptomData?.primarySymptom?.name || 'No especificado'}
                      </p>
                      <p className="mb-1">
                        <strong>Región del cuerpo:</strong> {symptomData?.bodyRegion || symptomData?.primarySymptom?.bodyRegion || 'No especificada'}
                      </p>
                      <p className="mb-1">
                        <strong>Duración:</strong> {symptomData?.answers?.duration || symptomData?.primarySymptom?.duration || 'No especificada'}
                      </p>
                      {symptomData?.answers?.intensity && (
                        <p className="mb-1">
                          <strong>Intensidad:</strong> {symptomData.answers.intensity}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        analysis?.urgencyAssessment === 'emergency' || analysis?.urgencyAssessment === 'urgent' 
                          ? 'bg-red-100' 
                          : analysis?.urgencyAssessment === 'soon'
                          ? 'bg-amber-100'
                          : 'bg-green-100'
                      }`}>
                        <svg className={`h-5 w-5 ${
                          analysis?.urgencyAssessment === 'emergency' || analysis?.urgencyAssessment === 'urgent'
                            ? 'text-red-600' 
                            : analysis?.urgencyAssessment === 'soon'
                            ? 'text-amber-600'
                            : 'text-green-600'
                        }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nivel de atención recomendado</p>
                        <p className={`font-medium ${
                          analysis?.urgencyAssessment === 'emergency' || analysis?.urgencyAssessment === 'urgent'
                            ? 'text-red-600' 
                            : analysis?.urgencyAssessment === 'soon'
                            ? 'text-amber-600'
                            : 'text-green-600'
                        }`}>
                          {analysis?.urgencyAssessment === 'emergency' 
                            ? 'Emergencia (Inmediata)' 
                            : analysis?.urgencyAssessment === 'urgent'
                            ? 'Urgente (1-2 días)'
                            : analysis?.urgencyAssessment === 'soon'
                            ? 'Pronto (1 semana)'
                            : 'Rutina (cuando sea conveniente)'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => analysis?.recommendedSpecialties?.length > 0 
                          ? handleFindDoctors(analysis.recommendedSpecialties[0])
                          : handleFindDoctors('Medicina General')}
                        className="w-full py-2 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                      >
                        <Calendar className="mr-2 h-5 w-5" />
                        Agendar Consulta
                      </button>
                      
                      {(analysis?.urgencyAssessment === 'urgent' || analysis?.urgencyAssessment === 'emergency') && (
                        <button
                          onClick={() => handleBookTelemedicine(recommendedDoctors[0]?.id)}
                          className="w-full py-2 px-4 bg-red-600 text-white text-center rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                        >
                          <Video className="mr-2 h-5 w-5" />
                          Telemedicina Urgente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Results */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <ResultsCard analysis={analysis} />
                </div>

                <div>
                  {/* Recommended tests */}
                  {analysis?.recommendedTests?.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Exámenes Sugeridos</h3>
                      <ul className="space-y-2">
                        {analysis.recommendedTests.map((test: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <svg className="text-green-500 mt-1 mr-2 flex-shrink-0 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">{test}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-500 mt-4">
                        Estos exámenes podrían ser solicitados por tu médico para ayudar en el diagnóstico.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Self-Care Recommendations */}
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <svg className="text-blue-600 h-6 w-6 mt-0.5 mr-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Recomendaciones para el Cuidado Personal</h3>
                    <p className="text-blue-700 mb-4">
                      Estas son algunas medidas que puedes tomar mientras esperas tu consulta médica:
                    </p>
                    <ul className="space-y-2">
                      {analysis?.selfCareRecommendations?.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          <span className="text-blue-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Important Disclaimer */}
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
                <div className="flex">
                  <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-amber-800">Importante</h3>
                    <div className="mt-2 text-amber-700">
                      <p>
                        Esta evaluación es orientativa y no sustituye el diagnóstico de un profesional médico. Si tus síntomas empeoran o aparecen nuevos síntomas, busca atención médica inmediatamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Especialistas Recomendados</h2>
              <SpecialistRecommendations 
                doctors={recommendedDoctors}
                onBookAppointment={(doctorId) => navigate(`/reservar/${doctorId}?from=sintomas`)}
                onViewProfile={(doctorId) => navigate(`/doctor/${doctorId}`)}
              />
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              <HealthEducation 
                conditionId={analysis?.possibleConditions?.length > 0 ? analysis.possibleConditions[0]?.id : undefined}
                conditionName={analysis?.possibleConditions?.length > 0 ? analysis.possibleConditions[0]?.name : undefined}
                symptomId={symptomData?.symptomId || symptomData?.symptom?.id}
                symptomName={symptomData?.symptom?.name || symptomData?.primarySymptom?.name}
              />
            </div>
          )}

          {activeTab === 'track' && (
            <div>
              <SymptomTracker 
                initialSymptom={{
                  id: symptomData?.symptomId || symptomData?.symptom?.id || 'general',
                  name: symptomData?.symptom?.name || symptomData?.primarySymptom?.name || 'Síntoma'
                }}
              />
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/sintomas')}
              className="py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Nueva Evaluación
            </button>
            <button
              onClick={() => analysis?.recommendedSpecialties?.length > 0 
                ? handleFindDoctors(analysis.recommendedSpecialties[0])
                : handleFindDoctors('Medicina General')}
              className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Buscar Médicos
            </button>
            {(analysis?.urgencyAssessment === 'urgent' || analysis?.urgencyAssessment === 'emergency') && (
              <button
                onClick={() => handleBookTelemedicine(recommendedDoctors[0]?.id)}
                className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Telemedicina Urgente
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-3xl w-full">
            <ResultsExport 
              data={prepareExportData() || {
                title: 'Resultados de Evaluación',
                date: new Date(),
                sections: []
              }}
              elementToExport={resultsRef}
              onClose={() => setShowExportModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultadosPage;