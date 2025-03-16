import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionnaireProvider } from '../../contexts/QuestionnaireContext';
import BodySelector from '../../components/sintomas/BodySelector';
import Enhanced3DBodySelector from '../../components/sintomas/Enhanced3DBodySelector';
import AIConversationForm from '../../components/sintomas/AIConversationForm';
import QuestionnaireFlow from '../../components/sintomas/QuestionnaireFlow';
import HealthProfile from '../../components/sintomas/HealthProfile';
import SymptomCheckerLayout from '../../components/sintomas/SymptomCheckerLayout';
import symptomAnalysisService from '../../services/SymptomAnalysisService';
import analyticsService from '../../services/AnalyticsService';

// Get user preferences from local storage or browser detection
const useAdvancedUI = () => {
  const [isAdvanced, setIsAdvanced] = useState(false);

  useEffect(() => {
    // Check localStorage for user preference
    const savedPreference = localStorage.getItem('useAdvancedUI');
    if (savedPreference !== null) {
      setIsAdvanced(savedPreference === 'true');
      return;
    }

    // If no saved preference, check device capabilities
    const isHighEndDevice = () => {
      // Simple detection based on memory and screen size
      const hasHighMemory = navigator.deviceMemory ? navigator.deviceMemory >= 4 : true;
      const hasLargeScreen = window.innerWidth >= 1024;
      const isNotMobile = !/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      return hasHighMemory && hasLargeScreen && isNotMobile;
    };

    setIsAdvanced(isHighEndDevice());
  }, []);

  const toggleAdvancedUI = (value: boolean) => {
    setIsAdvanced(value);
    localStorage.setItem('useAdvancedUI', value.toString());
  };

  return { isAdvanced, toggleAdvancedUI };
};

const EvaluacionPage = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'body' | 'ai' | null>(null);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<string | null>(null);
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [symptomData, setSymptomData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAdvanced, toggleAdvancedUI } = useAdvancedUI();
  const [showHealthProfile, setShowHealthProfile] = useState(false);
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [startTime] = useState(new Date());

  // On mount, check if method is in session storage
  useEffect(() => {
    const savedMethod = sessionStorage.getItem('symptomCheckerMethod') as 'body' | 'ai' | null;
    if (savedMethod) {
      setMethod(savedMethod);
      
      // Track selection
      analyticsService.trackSymptomCheckerStart(savedMethod);
    } else {
      // Default to body selection if no method is saved
      setMethod('body');
    }

    // Check if we're returning from a previous session
    const savedRegion = sessionStorage.getItem('selectedBodyRegion');
    if (savedRegion) {
      setSelectedBodyRegion(savedRegion);
    }

    // Load health profile if available
    const savedProfile = localStorage.getItem('health_profile');
    if (savedProfile) {
      try {
        setHealthProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error loading health profile:', e);
      }
    }

    // Return cleanup function
    return () => {
      // Track if user abandons the symptom checker
      if (!questionnaireComplete) {
        analyticsService.trackEvent('symptom_checker_abandon', {
          method,
          time_spent: Math.round((new Date().getTime() - startTime.getTime()) / 1000)
        });
      }
    };
  }, [method, questionnaireComplete, startTime]);

  const handleBodyRegionSelect = (region: string) => {
    setSelectedBodyRegion(region);
    sessionStorage.setItem('selectedBodyRegion', region);
    
    // Track region selection
    analyticsService.trackEvent('body_region_selected', { region });
  };

  const handleMethodChange = (newMethod: 'body' | 'ai') => {
    setMethod(newMethod);
    sessionStorage.setItem('symptomCheckerMethod', newMethod);
    
    // Reset any previous selection when changing methods
    setSelectedBodyRegion(null);
    sessionStorage.removeItem('selectedBodyRegion');
    
    // Track selection
    analyticsService.trackSymptomCheckerStart(newMethod);
  };

  const handleQuestionnaireComplete = async (data: any) => {
    setLoading(true);
    setQuestionnaireComplete(true);
    
    try {
      // Add health profile data if available
      if (healthProfile) {
        data.healthProfile = healthProfile;
      }
      
      // Enhanced analysis using our service
      const enhancedAnalysis = await symptomAnalysisService.analyzeSymptoms(
        data.symptomId || data.symptom?.id || 'general_symptoms',
        data.answers,
        healthProfile
      );
      
      // Combine the original data with enhanced analysis
      const enrichedData = {
        ...data,
        analysis: enhancedAnalysis,
        timestamp: new Date().toISOString(),
        healthProfile
      };
      
      setSymptomData(enrichedData);
      
      // Save to session storage for the results page
      sessionStorage.setItem('symptomResults', JSON.stringify(enrichedData));
      
      // Track completion
      analyticsService.trackSymptomCheckerCompletion({
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        method: method || 'body',
        symptom_id: data.symptomId || data.symptom?.id || 'general_symptoms',
        symptom_name: data.symptom?.name || enhancedAnalysis.primarySymptom?.name || 'Sin especificar',
        completed: true
      });
      
      analyticsService.trackAnalysisComplete(enhancedAnalysis);
      
      // Navigate to results page
      navigate('/sintomas/resultados');
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setError('Ocurrió un error al analizar los síntomas. Por favor, inténtelo de nuevo.');
      setLoading(false);
      
      // Track error
      analyticsService.trackEvent('symptom_checker_error', {
        error_type: 'analysis_error',
        data_sent: JSON.stringify(data)
      });
    }
  };

  const handleReset = () => {
    setSelectedBodyRegion(null);
    sessionStorage.removeItem('selectedBodyRegion');
  };

  const handleProfileUpdate = (profile: any) => {
    setHealthProfile(profile);
    setShowHealthProfile(false);
  };

  const getLayoutDescription = () => {
    if (method === 'body') {
      return selectedBodyRegion 
        ? `Responde algunas preguntas sobre tus síntomas en ${selectedBodyRegion} para ayudarnos a entender mejor tu situación.` 
        : 'Selecciona la parte del cuerpo donde sientes molestias y responde algunas preguntas para ayudarnos a entender tus síntomas.';
    }
    return 'Describe tus síntomas y nuestro asistente te guiará para comprender mejor tu situación médica.';
  };

  return (
    <SymptomCheckerLayout 
      title="Evaluación de Síntomas" 
      description={getLayoutDescription()}
      currentStep={1}
    >
      {/* Method selection tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => handleMethodChange('body')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                method === 'body'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={method === 'body'}
            >
              Selección por Cuerpo
            </button>
            <button
              onClick={() => handleMethodChange('ai')}
              className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
                method === 'ai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={method === 'ai'}
            >
              Asistente Inteligente
            </button>
          </nav>
        </div>
      </div>

      {/* UI Preference Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Interfaz avanzada</span>
          <button
            onClick={() => toggleAdvancedUI(!isAdvanced)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isAdvanced ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            aria-pressed={isAdvanced}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAdvanced ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Health Profile Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowHealthProfile(!showHealthProfile)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          {healthProfile ? (
            <>
              <Info size={16} className="mr-1" />
              <span>
                {showHealthProfile ? 'Ocultar perfil de salud' : 'Ver mi perfil de salud'}
              </span>
            </>
          ) : (
            <>
              <Info size={16} className="mr-1" />
              <span>
                {showHealthProfile ? 'Ocultar formulario' : 'Completar mi perfil de salud para resultados personalizados'}
              </span>
            </>
          )}
        </button>
        
        {showHealthProfile && (
          <div className="mt-4">
            <HealthProfile onProfileUpdate={handleProfileUpdate} />
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900">Analizando tus respuestas</h2>
          <p className="text-gray-600 mt-2">Estamos procesando tu información para proporcionarte los mejores resultados...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
              <button 
                className="mt-2 text-red-600 hover:text-red-800"
                onClick={() => setError(null)}
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <QuestionnaireProvider>
            <AnimatePresence mode="wait">
              {method === 'body' && !selectedBodyRegion && (
                <motion.div
                  key="body-selector"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {isAdvanced ? (
                    <Enhanced3DBodySelector onSelectRegion={handleBodyRegionSelect} />
                  ) : (
                    <BodySelector onSelectRegion={handleBodyRegionSelect} />
                  )}
                </motion.div>
              )}

              {method === 'body' && selectedBodyRegion && (
                <motion.div
                  key="questionnaire"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                    <div className="flex items-center">
                      <Info className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-800">
                        Área seleccionada: <strong>{selectedBodyRegion}</strong>
                      </span>
                    </div>
                    <button 
                      onClick={handleReset}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Cambiar selección
                    </button>
                  </div>
                  <QuestionnaireFlow 
                    bodyRegion={selectedBodyRegion}
                    onComplete={handleQuestionnaireComplete}
                  />
                </motion.div>
              )}

              {method === 'ai' && (
                <motion.div
                  key="ai-conversation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AIConversationForm onComplete={handleQuestionnaireComplete} />
                </motion.div>
              )}
            </AnimatePresence>
          </QuestionnaireProvider>
        </div>
      )}
    </SymptomCheckerLayout>
  );
};

export default EvaluacionPage;