import { useState, useEffect } from 'react';
import { useQuestionnaireContext } from '../../contexts/QuestionnaireContextLazy';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Symptom, SymptomQuestion } from '../../lib/api/symptoms';
import { VALID_BODY_REGIONS } from '../../machines/questionnaireMachineLazy';

const BODY_REGION_LABELS: Record<string, string> = {
  head: 'Cabeza',
  neck: 'Cuello',
  chest: 'Pecho / Tórax',
  abdomen: 'Abdomen',
  left_arm: 'Brazo izquierdo',
  right_arm: 'Brazo derecho',
  left_forearm: 'Antebrazo izquierdo',
  right_forearm: 'Antebrazo derecho',
  left_leg: 'Pierna izquierda',
  right_leg: 'Pierna derecha',
  left_lower_leg: 'Pantorrilla izquierda',
  right_lower_leg: 'Pantorrilla derecha'
};

// Mock symptoms for development - these would come from the API in production
const MOCK_SYMPTOMS: Partial<Symptom>[] = [
  { 
    id: 'headache', 
    name: 'Dolor de cabeza', 
    description: 'Dolor o molestia en la cabeza, cuero cabelludo o cuello',
    body_region: 'head',
    severity_level: 2
  },
  { 
    id: 'migraine', 
    name: 'Migraña', 
    description: 'Dolor de cabeza intenso, pulsátil, generalmente en un lado de la cabeza',
    body_region: 'head',
    severity_level: 3
  },
  { 
    id: 'sinusitis', 
    name: 'Sinusitis', 
    description: 'Inflamación e infección de los senos paranasales',
    body_region: 'head',
    severity_level: 2
  }
];

// Mock questions for development - these would come from the API in production
const MOCK_QUESTIONS: Partial<SymptomQuestion>[] = [
  {
    id: 'intensity',
    symptom_id: 'headache',
    question_text: '¿Cuál es la intensidad del dolor?',
    question_type: 'scale',
    order: 1,
    options: [
      { value: '1', label: 'Leve - apenas perceptible' },
      { value: '2', label: 'Leve - molestia ocasional' },
      { value: '3', label: 'Moderado - notable pero no limitante' },
      { value: '4', label: 'Moderado - interfiere con actividades' },
      { value: '5', label: 'Severo - difícil funcionar normalmente' }
    ]
  },
  {
    id: 'duration',
    symptom_id: 'headache',
    question_text: '¿Cuánto tiempo lleva experimentando este dolor?',
    question_type: 'duration',
    order: 2,
    options: [
      { value: 'hours', label: 'Horas' },
      { value: 'days', label: 'Días' },
      { value: 'weeks', label: 'Semanas' },
      { value: 'months', label: 'Meses' },
      { value: 'years', label: 'Años' }
    ]
  },
  {
    id: 'frequency',
    symptom_id: 'headache',
    question_text: '¿Con qué frecuencia ocurre el dolor?',
    question_type: 'multiple_choice',
    order: 3,
    options: [
      { value: 'first_time', label: 'Es la primera vez' },
      { value: 'occasional', label: 'Ocasionalmente (menos de una vez al mes)' },
      { value: 'frequent', label: 'Frecuentemente (varias veces al mes)' },
      { value: 'very_frequent', label: 'Muy frecuentemente (varias veces por semana)' },
      { value: 'constant', label: 'Constantemente (diario)' }
    ]
  },
  {
    id: 'associated_symptoms',
    symptom_id: 'headache',
    question_text: '¿Experimenta alguno de estos síntomas junto con el dolor de cabeza?',
    question_type: 'multiple_choice',
    order: 4,
    options: [
      { value: 'nausea', label: 'Náuseas o vómitos' },
      { value: 'light_sensitivity', label: 'Sensibilidad a la luz' },
      { value: 'sound_sensitivity', label: 'Sensibilidad al sonido' },
      { value: 'vision_changes', label: 'Cambios en la visión' },
      { value: 'dizziness', label: 'Mareos o vértigo' },
      { value: 'neck_pain', label: 'Dolor en el cuello' },
      { value: 'none', label: 'Ninguno de estos' }
    ]
  },
  {
    id: 'triggers',
    symptom_id: 'headache',
    question_text: '¿Ha notado algo que desencadene o empeore el dolor?',
    question_type: 'multiple_choice',
    order: 5,
    options: [
      { value: 'stress', label: 'Estrés o ansiedad' },
      { value: 'sleep', label: 'Cambios en patrones de sueño' },
      { value: 'food', label: 'Ciertos alimentos o bebidas' },
      { value: 'physical_activity', label: 'Actividad física' },
      { value: 'posture', label: 'Postura o estar sentado mucho tiempo' },
      { value: 'screens', label: 'Uso de pantallas (computadora, celular)' },
      { value: 'weather', label: 'Cambios climáticos' },
      { value: 'unknown', label: 'No he identificado desencadenantes' }
    ]
  }
];

interface QuestionnaireFlowProps {
  bodyRegion: string;
  onComplete: (data: any) => void;
}

const QuestionnaireFlow = ({ bodyRegion, onComplete }: QuestionnaireFlowProps) => {
  const [currentStage, setCurrentStage] = useState<'symptoms' | 'questions'>('symptoms');
  const [selectedSymptom, setSelectedSymptom] = useState<Partial<Symptom> | null>(null);
  const [questions, setQuestions] = useState<Partial<SymptomQuestion>[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<Partial<Symptom>[]>([]);
  const [progress, setProgress] = useState(0);

  // Get context with null safety
  const context = useQuestionnaireContext();
  const { initialized } = context;

  // If context isn't initialized yet, show a temporary loader
  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Inicializando cuestionario...</p>
      </div>
    );
  }

  useEffect(() => {
    // Load symptoms for the selected body region
    setIsLoading(true);
    setError(null);

    // Simulate API call with a delay
    setTimeout(() => {
      try {
        // Filter mock symptoms by body region
        const filteredSymptoms = MOCK_SYMPTOMS.filter(
          symptom => symptom.body_region === bodyRegion
        );
        setSymptoms(filteredSymptoms);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar los síntomas. Por favor, inténtelo de nuevo.');
        setIsLoading(false);
      }
    }, 1000);
  }, [bodyRegion]);

  const handleSymptomSelect = (symptom: Partial<Symptom>) => {
    setSelectedSymptom(symptom);
    setIsLoading(true);
    
    // Simulate API call to load questions
    setTimeout(() => {
      try {
        // Filter mock questions by symptom ID
        const symptomQuestions = MOCK_QUESTIONS.filter(
          question => question.symptom_id === symptom.id
        ).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setQuestions(symptomQuestions);
        setCurrentStage('questions');
        setCurrentQuestionIndex(0);
        setIsLoading(false);
        setProgress(20); // Start progress at 20%
      } catch (err) {
        setError('Error al cargar las preguntas. Por favor, inténtelo de nuevo.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleAnswer = (questionId: string, answer: any) => {
    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Calculate new progress
    const newProgress = 20 + (80 * (currentQuestionIndex + 1) / questions.length);
    setProgress(newProgress);

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // All questions answered, complete the questionnaire
      completeQuestionnaire();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      
      // Update progress
      const newProgress = 20 + (80 * (currentQuestionIndex - 1) / questions.length);
      setProgress(newProgress);
    } else {
      // Go back to symptom selection
      setCurrentStage('symptoms');
      setProgress(0);
    }
  };

  const completeQuestionnaire = () => {
    // Prepare the final data
    const resultData = {
      bodyRegion,
      symptom: selectedSymptom,
      answers,
      // Calculate severity based on answers
      severity: calculateSeverity(answers),
      // Determine urgency based on severity and symptoms
      urgency: determineUrgency(answers, selectedSymptom?.id || '')
    };

    // Complete the questionnaire
    onComplete(resultData);
  };

  // Helper function to calculate severity
  const calculateSeverity = (answers: Record<string, any>): 'low' | 'moderate' | 'high' => {
    // Simple severity calculation based on intensity and duration
    const intensity = answers.intensity ? parseInt(answers.intensity, 10) : 0;
    
    if (intensity >= 4) return 'high';
    if (intensity >= 2) return 'moderate';
    return 'low';
  };

  // Helper function to determine urgency
  const determineUrgency = (answers: Record<string, any>, symptomId: string): 'routine' | 'soon' | 'urgent' => {
    // Simple urgency calculation based on severity and symptom type
    const severity = calculateSeverity(answers);
    
    if (severity === 'high') {
      // Certain symptoms are more urgent than others
      if (symptomId === 'migraine') return 'urgent';
      return 'soon';
    }
    
    if (severity === 'moderate') return 'soon';
    return 'routine';
  };

  // Render the appropriate content based on the current stage
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-700">{error}</p>
              <button 
                className="text-red-600 font-medium hover:text-red-800 mt-2"
                onClick={() => setError(null)}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (currentStage === 'symptoms') {
      return (
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            Selecciona el síntoma principal en {BODY_REGION_LABELS[bodyRegion]}
          </h3>
          
          <div className="space-y-3">
            {symptoms.length > 0 ? (
              symptoms.map(symptom => (
                <button
                  key={symptom.id}
                  onClick={() => handleSymptomSelect(symptom)}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium text-gray-900">{symptom.name}</span>
                    {symptom.description && (
                      <p className="text-sm text-gray-600 mt-1">{symptom.description}</p>
                    )}
                  </div>
                  <ArrowRight size={18} className="text-gray-400" />
                </button>
              ))
            ) : (
              <p className="text-gray-600">No se encontraron síntomas para esta región. Por favor, selecciona otra área del cuerpo.</p>
            )}
          </div>
        </div>
      );
    }

    if (currentStage === 'questions') {
      const currentQuestion = questions[currentQuestionIndex];
      
      if (!currentQuestion) {
        return (
          <div className="text-center p-6">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-red-700">No se encontraron preguntas para este síntoma.</p>
          </div>
        );
      }

      return (
        <div className="p-6">
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-6">{currentQuestion.question_text}</h3>
              
              {currentQuestion.question_type === 'scale' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(currentQuestion.id || '', option.value)}
                      className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left flex justify-between items-center"
                    >
                      <span>{option.label}</span>
                      <div className="h-6 w-6 rounded-full border border-gray-300"></div>
                    </button>
                  ))}
                </div>
              )}
              
              {currentQuestion.question_type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(currentQuestion.id || '', option.value)}
                      className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left flex justify-between items-center"
                    >
                      <span>{option.label}</span>
                      <div className="h-6 w-6 rounded-full border border-gray-300"></div>
                    </button>
                  ))}
                </div>
              )}
              
              {currentQuestion.question_type === 'duration' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(currentQuestion.id || '', option.value)}
                      className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left flex justify-between items-center"
                    >
                      <span>{option.label}</span>
                      <div className="h-6 w-6 rounded-full border border-gray-300"></div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={18} className="mr-1" />
              Anterior
            </button>
            
            <div className="text-sm text-gray-500">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {renderContent()}
    </div>
  );
};

export default QuestionnaireFlow;