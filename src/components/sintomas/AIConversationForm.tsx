import { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Brain, Loader2, ChevronRight, AlertCircle, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestionnaireContext } from '../../contexts/QuestionnaireContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  clarifyingQuestions?: string[];
}

interface AIConversationFormProps {
  onComplete: (data: any) => void;
}

// Enhanced symptom patterns with medical terminology and additional details
const SYMPTOM_PATTERNS = [
  { 
    id: 'headache', 
    keywords: ['dolor de cabeza', 'migraña', 'cefalea', 'jaqueca', 'dolor craneal'],
    region: 'head',
    clinicalTerms: ['cefalalgia', 'cefalea tensional', 'migraña', 'cefalea en racimos'],
    followUpQuestions: [
      '¿El dolor es pulsátil o constante?',
      '¿Siente náuseas o vómitos junto con el dolor?',
      '¿Tiene sensibilidad a la luz o al sonido?',
      '¿Ha tenido cambios en la visión antes del dolor?'
    ]
  },
  { 
    id: 'abdominal_pain', 
    keywords: ['dolor de estómago', 'dolor abdominal', 'cólico', 'dolor en el vientre', 'malestar abdominal'],
    region: 'abdomen',
    clinicalTerms: ['dolor abdominal agudo', 'dispepsia', 'cólico biliar', 'gastritis'],
    followUpQuestions: [
      '¿El dolor es localizado o difuso?',
      '¿Ha tenido cambios en sus hábitos intestinales?',
      '¿El dolor empeora después de comer?',
      '¿Ha notado distensión abdominal o gases?'
    ]
  },
  { 
    id: 'chest_pain', 
    keywords: ['dolor de pecho', 'dolor torácico', 'angina', 'opresión en el pecho', 'dolor precordial'],
    region: 'chest',
    urgencyLevel: 'high',
    clinicalTerms: ['angina de pecho', 'dolor torácico', 'cardialgia'],
    followUpQuestions: [
      '¿Siente el dolor como una presión, opresión o quemazón?',
      '¿El dolor se irradia al brazo, cuello o mandíbula?',
      '¿Tiene dificultad para respirar junto con el dolor?',
      '¿El dolor apareció durante actividad física o en reposo?'
    ]
  },
  { 
    id: 'sore_throat', 
    keywords: ['dolor de garganta', 'irritación de garganta', 'faringitis', 'garganta inflamada', 'dificultad para tragar'],
    region: 'neck',
    clinicalTerms: ['faringitis', 'amigdalitis', 'laringitis', 'odinofagia'],
    followUpQuestions: [
      '¿Tiene fiebre asociada al dolor de garganta?',
      '¿Ha notado placas blancas en la garganta?',
      '¿Tiene tos o secreción nasal?',
      '¿Tiene dificultad para tragar?'
    ]
  },
  { 
    id: 'back_pain', 
    keywords: ['dolor de espalda', 'lumbalgia', 'dolor lumbar', 'dolor en la columna', 'dolor de cintura'],
    region: 'back',
    clinicalTerms: ['lumbalgia', 'dorsalgia', 'ciática', 'hernia discal'],
    followUpQuestions: [
      '¿El dolor se irradia hacia las piernas?',
      '¿Comenzó después de un esfuerzo o movimiento específico?',
      '¿Empeora en alguna posición particular?',
      '¿Ha notado debilidad o entumecimiento en las piernas?'
    ]
  },
  { 
    id: 'fever', 
    keywords: ['fiebre', 'temperatura alta', 'calentura', 'escalofríos', 'febrícula'],
    region: 'general',
    clinicalTerms: ['pirexia', 'hipertermia', 'febrícula'],
    followUpQuestions: [
      '¿Cuál es la temperatura máxima que ha registrado?',
      '¿Cuánto tiempo lleva con fiebre?',
      '¿Ha tomado algún medicamento para bajarla?',
      '¿Tiene otros síntomas como dolor de cabeza, tos o dolor muscular?'
    ]
  },
  { 
    id: 'cough', 
    keywords: ['tos', 'tos seca', 'tos con flema', 'tos persistente', 'expectoración'],
    region: 'chest',
    clinicalTerms: ['tos productiva', 'tos no productiva', 'tos crónica', 'bronquitis'],
    followUpQuestions: [
      '¿La tos es seca o produce flema?',
      '¿De qué color es la flema, si la hay?',
      '¿Cuánto tiempo lleva con la tos?',
      '¿Tiene dificultad para respirar o dolor al toser?'
    ]
  },
  { 
    id: 'rash', 
    keywords: ['erupción', 'sarpullido', 'manchas en la piel', 'urticaria', 'ronchas'],
    region: 'skin',
    clinicalTerms: ['exantema', 'urticaria', 'dermatitis', 'eritema'],
    followUpQuestions: [
      '¿La erupción causa picazón o dolor?',
      '¿Cuándo apareció la erupción?',
      '¿Ha usado algún producto nuevo en la piel o tomado algún medicamento nuevo?',
      '¿La erupción está localizada o es generalizada?'
    ]
  }
];

// Enhanced follow-up questions with clear medical purpose
const CLINICAL_FOLLOW_UP_QUESTIONS = {
  duration: {
    question: '¿Cuánto tiempo lleva experimentando este síntoma?',
    options: ['Menos de 24 horas', 'Entre 1 y 7 días', 'Más de una semana', 'Más de un mes', 'Más de 6 meses'],
    clinicalPurpose: 'Determinar si es agudo, subagudo o crónico'
  },
  severity: {
    question: '¿En una escala del 1 al 10, donde 10 es el dolor más intenso, cómo calificaría su dolor?',
    options: ['1-3 (Leve)', '4-6 (Moderado)', '7-10 (Severo)'],
    clinicalPurpose: 'Evaluar la intensidad del síntoma'
  },
  pattern: {
    question: '¿Cómo describiría el patrón de este síntoma?',
    options: ['Constante (siempre presente)', 'Intermitente (va y viene)', 'Progresivo (empeora con el tiempo)', 'Cíclico (sigue un patrón regular)'],
    clinicalPurpose: 'Identificar patrones temporales para el diagnóstico diferencial'
  },
  aggravating: {
    question: '¿Hay algo que empeore el síntoma?',
    freeText: true,
    clinicalPurpose: 'Identificar factores exacerbantes'
  },
  relieving: {
    question: '¿Hay algo que mejore el síntoma?',
    freeText: true,
    clinicalPurpose: 'Identificar factores que alivian'
  },
  associated: {
    question: '¿Experimenta alguno de los siguientes síntomas asociados?',
    multiSelect: true,
    dynamicOptions: true,
    clinicalPurpose: 'Identificar constelación de síntomas para diagnóstico diferencial'
  },
  medical_history: {
    question: '¿Tiene alguna condición médica diagnosticada previamente?',
    freeText: true,
    clinicalPurpose: 'Establecer contexto de comorbilidades'
  }
};

// Medical knowledge base for symptom analysis
const SYMPTOM_KNOWLEDGE_BASE = {
  headache: {
    possibleConditions: [
      { 
        name: 'Migraña',
        probability: {
          default: 'media',
          conditionalModifiers: [
            { when: 'pattern == "Intermitente"', adjustTo: 'alta' },
            { when: 'associated includes "náuseas" OR associated includes "sensibilidad a la luz"', adjustTo: 'alta' }
          ]
        },
        description: 'Dolor de cabeza intenso, generalmente unilateral, pulsátil, que puede estar acompañado de náuseas, vómitos y sensibilidad a la luz y sonido.',
        moreInfo: 'https://example.com/info/migrana'
      },
      {
        name: 'Cefalea tensional',
        probability: {
          default: 'alta',
          conditionalModifiers: [
            { when: 'severity == "1-3 (Leve)" OR severity == "4-6 (Moderado)"', adjustTo: 'alta' },
            { when: 'aggravating includes "estrés"', adjustTo: 'alta' }
          ]
        },
        description: 'Dolor de cabeza bilateral, no pulsátil, descrito como una presión o tensión alrededor de la cabeza. Suele estar relacionado con el estrés y la tensión muscular.',
        moreInfo: 'https://example.com/info/cefalea-tensional'
      },
      {
        name: 'Sinusitis',
        probability: {
          default: 'baja',
          conditionalModifiers: [
            { when: 'associated includes "congestión nasal"', adjustTo: 'media' },
            { when: 'associated includes "secreción nasal" AND associated includes "dolor facial"', adjustTo: 'alta' }
          ]
        },
        description: 'Inflamación de los senos paranasales, frecuentemente debido a una infección. Causa dolor o presión en la cara, congestión nasal y secreción nasal.',
        moreInfo: 'https://example.com/info/sinusitis'
      }
    ],
    recommendedSpecialties: ['Neurología', 'Medicina General'],
    urgencyAssessment: {
      default: 'routine',
      redFlags: [
        { condition: 'Inicio súbito e intenso ("el peor dolor de cabeza de mi vida")', urgency: 'emergency' },
        { condition: 'Acompañado de fiebre alta, rigidez de cuello y confusión', urgency: 'emergency' },
        { condition: 'Después de un traumatismo craneal', urgency: 'emergency' },
        { condition: 'Con alteraciones visuales persistentes o debilidad en extremidades', urgency: 'urgent' },
        { condition: 'En paciente con cáncer o inmunosupresión', urgency: 'urgent' },
        { condition: 'Que despierta constantemente durante el sueño', urgency: 'soon' }
      ]
    }
  },
  abdominal_pain: {
    possibleConditions: [
      {
        name: 'Gastritis',
        probability: {
          default: 'alta',
          conditionalModifiers: [
            { when: 'aggravating includes "comidas" OR aggravating includes "alcohol"', adjustTo: 'alta' },
            { when: 'relieving includes "antiácidos"', adjustTo: 'alta' }
          ]
        },
        description: 'Inflamación del revestimiento del estómago que puede causar dolor abdominal, náuseas, vómitos o sensación de llenura.'
      },
      {
        name: 'Síndrome de intestino irritable',
        probability: {
          default: 'media',
          conditionalModifiers: [
            { when: 'duration == "Más de un mes" OR duration == "Más de 6 meses"', adjustTo: 'alta' },
            { when: 'associated includes "cambios en hábitos intestinales" OR associated includes "diarrea" OR associated includes "estreñimiento"', adjustTo: 'alta' }
          ]
        },
        description: 'Trastorno intestinal crónico que causa dolor abdominal, distensión y cambios en los hábitos intestinales.'
      }
    ],
    recommendedSpecialties: ['Gastroenterología', 'Medicina General'],
    urgencyAssessment: {
      default: 'soon',
      redFlags: [
        { condition: 'Dolor intenso y repentino', urgency: 'emergency' },
        { condition: 'Acompañado de vómitos con sangre', urgency: 'emergency' },
        { condition: 'Abdomen rígido y muy doloroso al tacto', urgency: 'emergency' },
        { condition: 'Fiebre alta y escalofríos', urgency: 'urgent' }
      ]
    }
  }
};

const AIConversationForm = ({ onComplete }: AIConversationFormProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'assistant', 
      content: '¡Hola! Soy tu asistente médico virtual. Describa sus síntomas en detalle para que pueda ayudarle mejor. Cuénteme qué le está sucediendo, dónde siente molestias y desde cuándo.', 
      timestamp: new Date() 
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [detectedSymptoms, setDetectedSymptoms] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [conversationStage, setConversationStage] = useState<'initial' | 'interview' | 'clarifying' | 'complete'>('initial');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedClarifyingQuestion, setSelectedClarifyingQuestion] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // In a real implementation, we would use the context
  // const questionnaireContext = useQuestionnaireContext();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string = input) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    if (conversationStage === 'initial') {
      // Enhanced symptom analysis with NLP techniques
      setTimeout(() => {
        analyzeInitialSymptoms(content);
      }, 1500);
    } else if (conversationStage === 'interview') {
      // Process answer to current question
      setTimeout(() => {
        processQuestionAnswer(content);
      }, 1000);
    } else if (conversationStage === 'clarifying') {
      // Process answer to clarifying question
      setTimeout(() => {
        processClarifyingAnswer(content);
      }, 1000);
    }
  };

  const analyzeInitialSymptoms = (symptomDescription: string) => {
    // Enhanced symptom detection with NLP-like techniques
    const lowerDescription = symptomDescription.toLowerCase();
    const detectedIds: string[] = [];
    
    // Detect symptoms by keywords
    for (const symptom of SYMPTOM_PATTERNS) {
      if (symptom.keywords.some(keyword => lowerDescription.includes(keyword))) {
        detectedIds.push(symptom.id);
      }
    }
    
    // Mock implementation of more advanced recognition
    // In a real app, this would use a proper NLP model or API call to a medical service
    const mockAdvancedRecognition = () => {
      // Detect combinations and context
      if (lowerDescription.includes('dolor') && lowerDescription.includes('cabeza') && 
          (lowerDescription.includes('náuseas') || lowerDescription.includes('vómitos'))) {
        if (!detectedIds.includes('headache')) detectedIds.push('headache');
      }
      
      // Add contextual understanding
      if ((lowerDescription.includes('fiebre') || lowerDescription.includes('temperatura')) && 
          lowerDescription.includes('dolor') && lowerDescription.includes('garganta')) {
        if (!detectedIds.includes('sore_throat')) detectedIds.push('sore_throat');
      }
    };
    
    mockAdvancedRecognition();
    setDetectedSymptoms(detectedIds);
    
    if (detectedIds.length > 0) {
      // Multiple symptoms detected - allow user to clarify
      if (detectedIds.length > 1) {
        prepareClarifyingQuestions(detectedIds);
        return;
      }
      
      // Single symptom detected - move to structured interview
      const primarySymptom = SYMPTOM_PATTERNS.find(s => s.id === detectedIds[0]);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Entiendo que está experimentando ${primarySymptom?.keywords[0] || 'este síntoma'}. Para ayudarle mejor, necesito hacerle algunas preguntas específicas sobre su situación.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsThinking(false);
      setConversationStage('interview');
      
      // Schedule the first question
      setTimeout(() => {
        startStructuredInterview(detectedIds[0]);
      }, 1000);
    } else {
      // No specific symptom detected - ask for clarification
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'Para poder ayudarle mejor, necesito más información específica sobre sus síntomas. ¿Podría indicarme dónde siente la principal molestia o dolor, y describir cómo se siente?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsThinking(false);
    }
  };

  const prepareClarifyingQuestions = (symptomIds: string[]) => {
    // Prepare clarifying questions when multiple symptoms are detected
    const symptomOptions = symptomIds.map(id => {
      const symptom = SYMPTOM_PATTERNS.find(s => s.id === id);
      return `${symptom?.keywords[0]} (${symptom?.region})`;
    });
    
    setClarifyingQuestions(symptomOptions);
    
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: 'He identificado varios posibles síntomas en su descripción. ¿Cuál de estos es su principal preocupación ahora?',
      timestamp: new Date(),
      clarifyingQuestions: symptomOptions
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsThinking(false);
    setConversationStage('clarifying');
  };

  const processClarifyingAnswer = (answer: string) => {
    // Find matching symptom from the answer
    let matchedSymptomId = null;
    
    // Check if the answer matches one of the options directly
    for (const symptomId of detectedSymptoms) {
      const symptom = SYMPTOM_PATTERNS.find(s => s.id === symptomId);
      if (symptom && symptom.keywords.some(keyword => answer.toLowerCase().includes(keyword))) {
        matchedSymptomId = symptomId;
        break;
      }
    }
    
    // If no match found but we have a selected option from UI
    if (!matchedSymptomId && selectedClarifyingQuestion) {
      const selectedOption = selectedClarifyingQuestion;
      for (const symptomId of detectedSymptoms) {
        const symptom = SYMPTOM_PATTERNS.find(s => s.id === symptomId);
        if (symptom && selectedOption.includes(symptom.keywords[0])) {
          matchedSymptomId = symptomId;
          break;
        }
      }
    }
    
    // If still no match, use the first symptom as fallback
    if (!matchedSymptomId && detectedSymptoms.length > 0) {
      matchedSymptomId = detectedSymptoms[0];
    }
    
    // Now proceed with the matched symptom
    if (matchedSymptomId) {
      const symptom = SYMPTOM_PATTERNS.find(s => s.id === matchedSymptomId);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Entiendo que su principal preocupación es el ${symptom?.keywords[0] || 'síntoma'}. Voy a hacerle algunas preguntas específicas para entender mejor su situación.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setConversationStage('interview');
      
      // Reset the selected clarifying question
      setSelectedClarifyingQuestion(null);
      
      // Start the structured interview
      setTimeout(() => {
        startStructuredInterview(matchedSymptomId);
      }, 1000);
    } else {
      // Could not determine symptom, ask again
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'No he podido identificar claramente su síntoma principal. Por favor, seleccione una de las opciones o describa su principal molestia de forma más específica.',
        timestamp: new Date(),
        clarifyingQuestions: clarifyingQuestions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsThinking(false);
    }
  };

  const startStructuredInterview = (symptomId: string) => {
    // Set up the clinical interview based on the symptom
    const symptom = SYMPTOM_PATTERNS.find(s => s.id === symptomId);
    
    // Prepare the question sequence
    const interviewQuestions = [
      CLINICAL_FOLLOW_UP_QUESTIONS.severity,
      CLINICAL_FOLLOW_UP_QUESTIONS.duration,
      CLINICAL_FOLLOW_UP_QUESTIONS.pattern
    ];
    
    // Add symptom-specific follow-up questions
    if (symptom && symptom.followUpQuestions) {
      // For simplicity, we'll just add the associated symptoms question
      const associatedOptions = {
        ...CLINICAL_FOLLOW_UP_QUESTIONS.associated,
        options: symptom.followUpQuestions.map(q => q.replace('¿', '').replace('?', ''))
      };
      
      interviewQuestions.push(associatedOptions);
    }
    
    // Add general questions
    interviewQuestions.push(CLINICAL_FOLLOW_UP_QUESTIONS.aggravating);
    interviewQuestions.push(CLINICAL_FOLLOW_UP_QUESTIONS.relieving);
    
    // Start with the first question
    setCurrentQuestion({
      id: 'severity',
      ...interviewQuestions[0]
    });
    
    askCurrentQuestion();
  };

  const askCurrentQuestion = () => {
    if (!currentQuestion) return;
    
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: currentQuestion.question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsThinking(false);
  };

  const processQuestionAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    // Store the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    // Move to the next question based on symptom and previous answers
    const nextQuestion = determineNextQuestion();
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      askCurrentQuestion();
    } else {
      // All questions answered, generate analysis
      generateAnalysis();
    }
  };

  const determineNextQuestion = () => {
    // This would be a complex function that determines the next appropriate question
    // based on the symptom and previous answers
    
    // For simplicity, we'll use a mock implementation
    const mockNextQuestions: Record<string, any> = {
      'severity': { id: 'duration', ...CLINICAL_FOLLOW_UP_QUESTIONS.duration },
      'duration': { id: 'pattern', ...CLINICAL_FOLLOW_UP_QUESTIONS.pattern },
      'pattern': { id: 'aggravating', ...CLINICAL_FOLLOW_UP_QUESTIONS.aggravating },
      'aggravating': { id: 'associated', ...CLINICAL_FOLLOW_UP_QUESTIONS.associated },
      'associated': { id: 'medical_history', ...CLINICAL_FOLLOW_UP_QUESTIONS.medical_history },
      'medical_history': null // End of questions
    };
    
    return mockNextQuestions[currentQuestion.id];
  };

  const generateAnalysis = () => {
    // Indicate that we're processing the information
    const processingMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: 'Gracias por responder a todas las preguntas. Estoy analizando sus respuestas para proporcionarle una evaluación detallada...',
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, processingMessage]);
    
    // Simulate processing time for analysis
    setTimeout(() => {
      // Update the message to remove loading state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === processingMessage.id 
            ? { ...msg, isLoading: false } 
            : msg
        )
      );
      
      // Generate the final analysis
      const primarySymptomId = detectedSymptoms[0];
      const symptomInfo = SYMPTOM_KNOWLEDGE_BASE[primarySymptomId as keyof typeof SYMPTOM_KNOWLEDGE_BASE];
      
      if (symptomInfo) {
        // Create a preliminary analysis
        const analysisResult = {
          symptomId: primarySymptomId,
          bodyRegion: SYMPTOM_PATTERNS.find(s => s.id === primarySymptomId)?.region || 'general',
          answers,
          severity: determineSymptomSeverity(),
          urgency: determineUrgency(symptomInfo),
          possibleConditions: symptomInfo.possibleConditions,
          recommendedSpecialties: symptomInfo.recommendedSpecialties,
          recommendedTests: determineRecommendedTests(primarySymptomId, answers),
          selfCareRecommendations: determineSelfCareRecommendations(primarySymptomId, answers),
          redFlags: checkForRedFlags(symptomInfo)
        };
        
        setAnalysisData(analysisResult);
        
        // Show analysis completion message
        const analysisCompleteMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'He completado el análisis de sus síntomas. A continuación le mostraré los resultados con algunas recomendaciones preliminares. Recuerde que esta evaluación no sustituye a una consulta médica profesional.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, analysisCompleteMessage]);
        
        // Complete the conversation and move to results
        setConversationStage('complete');
        
        // Schedule completion with a small delay
        setTimeout(() => {
          onComplete(analysisResult);
        }, 1500);
      } else {
        // No analysis available for this symptom
        const fallbackMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'He analizado sus síntomas, pero necesito más información para proporcionar una evaluación precisa. Le recomendaría consultar con un médico para una evaluación completa.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
        
        // Generate a basic result
        const basicResult = {
          symptomId: primarySymptomId,
          bodyRegion: SYMPTOM_PATTERNS.find(s => s.id === primarySymptomId)?.region || 'general',
          answers,
          severity: 'moderate',
          urgency: 'soon',
          possibleConditions: [],
          recommendedSpecialties: ['Medicina General'],
          selfCareRecommendations: []
        };
        
        // Complete the conversation
        setConversationStage('complete');
        
        // Schedule completion
        setTimeout(() => {
          onComplete(basicResult);
        }, 1500);
      }
    }, 2500);
  };

  // Helper function to determine symptom severity
  const determineSymptomSeverity = (): 'low' | 'moderate' | 'high' => {
    // Simple severity calculation based on intensity and duration
    const intensity = answers.severity || '';
    const duration = answers.duration || '';
    
    if (intensity.includes('Severo') || intensity.includes('7-10')) {
      return 'high';
    }
    
    if (intensity.includes('Moderado') || intensity.includes('4-6')) {
      if (duration.includes('Más de una semana') || duration.includes('Más de un mes')) {
        return 'high';
      }
      return 'moderate';
    }
    
    if (duration.includes('Más de un mes') || duration.includes('Más de 6 meses')) {
      return 'moderate';
    }
    
    return 'low';
  };

  // Helper function to determine urgency
  const determineUrgency = (symptomInfo: any): 'routine' | 'soon' | 'urgent' | 'emergency' => {
    // Check for red flags first
    const redFlags = checkForRedFlags(symptomInfo);
    if (redFlags.some(flag => flag.urgency === 'emergency')) {
      return 'emergency';
    }
    
    if (redFlags.some(flag => flag.urgency === 'urgent')) {
      return 'urgent';
    }
    
    // Otherwise use severity
    const severity = determineSymptomSeverity();
    
    if (severity === 'high') {
      return 'urgent';
    }
    
    if (severity === 'moderate') {
      return 'soon';
    }
    
    return 'routine';
  };

  // Helper function to check for red flags
  const checkForRedFlags = (symptomInfo: any) => {
    const redFlags = [];
    
    if (symptomInfo && symptomInfo.urgencyAssessment && symptomInfo.urgencyAssessment.redFlags) {
      // Basic implementation - in a real app, this would analyze answers more thoroughly
      for (const flag of symptomInfo.urgencyAssessment.redFlags) {
        // Mock red flag detection
        if (flag.condition.toLowerCase().includes('súbito') && 
            answers.pattern && answers.pattern.toLowerCase().includes('repentino')) {
          redFlags.push(flag);
        }
        
        if (flag.condition.toLowerCase().includes('fiebre') && 
            answers.associated && answers.associated.toLowerCase().includes('fiebre')) {
          redFlags.push(flag);
        }
      }
    }
    
    return redFlags;
  };

  // Helper function to determine recommended tests
  const determineRecommendedTests = (symptomId: string, answers: Record<string, any>) => {
    // Mock implementation for recommended tests
    const testsMap: Record<string, string[]> = {
      'headache': [
        'Examen físico general',
        'Evaluación neurológica',
        'Medición de presión arterial'
      ],
      'chest_pain': [
        'Electrocardiograma (ECG)',
        'Medición de presión arterial',
        'Análisis de sangre (enzimas cardíacas)',
        'Radiografía de tórax'
      ],
      'abdominal_pain': [
        'Examen físico abdominal',
        'Análisis de sangre',
        'Análisis de orina',
        'Ecografía abdominal'
      ]
    };
    
    return testsMap[symptomId] || ['Examen físico general'];
  };

  // Helper function to determine self-care recommendations
  const determineSelfCareRecommendations = (symptomId: string, answers: Record<string, any>) => {
    // Mock implementation for self-care recommendations
    const recommendationsMap: Record<string, string[]> = {
      'headache': [
        'Descansar en una habitación oscura y tranquila',
        'Aplicar compresas frías o calientes en la cabeza',
        'Mantener una hidratación adecuada',
        'Evitar alimentos desencadenantes como alcohol, cafeína y alimentos procesados',
        'Practicar técnicas de relajación para reducir el estrés'
      ],
      'chest_pain': [
        'Busque atención médica inmediata si el dolor es intenso o va acompañado de dificultad para respirar',
        'Evite esfuerzos físicos hasta ser evaluado por un médico',
        'Tome sus medicamentos según prescripción médica previa'
      ],
      'abdominal_pain': [
        'Mantenga una hidratación adecuada',
        'Coma comidas ligeras y en pequeñas cantidades',
        'Evite alimentos irritantes como alcohol, cafeína y comidas picantes',
        'Utilice una almohadilla térmica en el abdomen para aliviar el dolor',
        'Monitoree los alimentos que parecen empeorar los síntomas'
      ]
    };
    
    return recommendationsMap[symptomId] || ['Mantenga una hidratación adecuada', 'Descanse adecuadamente'];
  };

  const handleOptionSelect = (option: string) => {
    handleSendMessage(option);
  };

  const handleClarifyingOptionSelect = (option: string) => {
    setSelectedClarifyingQuestion(option);
    handleSendMessage(option);
  };

  return (
    <div className="flex flex-col h-[600px] p-2">
      <div className="bg-blue-50 rounded-lg p-4 flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <Sparkles size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-blue-800">Asistente Médico Inteligente</h3>
          <p className="text-sm text-blue-700">
            Describa sus síntomas en detalle para una evaluación más precisa. Esta herramienta no reemplaza la consulta médica profesional.
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 mb-4 bg-gray-50 rounded-lg">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 rounded-tl-none'
                }`}
              >
                {message.content.split('\n').map((line, i) => (
                  <div key={i} className={i > 0 ? 'mt-2' : ''}>
                    {line}
                  </div>
                ))}
                
                {message.isLoading && (
                  <div className="flex items-center mt-2">
                    <Loader2 size={14} className="animate-spin text-blue-500 mr-2" />
                    <span className="text-sm text-gray-500">Analizando...</span>
                  </div>
                )}
                
                {message.clarifyingQuestions && message.clarifyingQuestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.clarifyingQuestions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleClarifyingOptionSelect(option)}
                        className={`w-full py-2 px-3 text-left rounded-md flex justify-between items-center transition-colors ${
                          selectedClarifyingQuestion === option
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <span>{option}</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="text-right mt-1">
                  <span className={`text-xs ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none px-4 py-3">
              <div className="flex items-center">
                <Loader2 size={16} className="animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Analizando su consulta...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick response options for current question */}
      {conversationStage === 'interview' && 
       currentQuestion && 
       currentQuestion.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {currentQuestion.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className="py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex justify-between items-center"
              disabled={isThinking}
            >
              <span>{option}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}
      
      {/* Additional information box */}
      {conversationStage === 'initial' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
          <div className="flex items-start">
            <Info size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <p>
              Para un mejor análisis, incluya detalles como: localización del dolor/molestia, 
              intensidad, duración, factores que lo empeoran o alivian, y otros síntomas relacionados.
            </p>
          </div>
        </div>
      )}
      
      {/* Warning for detected urgent symptoms */}
      {detectedSymptoms.includes('chest_pain') && conversationStage === 'initial' && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4 text-sm text-red-700">
          <div className="flex items-start">
            <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p>
              <strong>Importante:</strong> El dolor en el pecho puede ser un síntoma de condiciones graves. 
              Si experimenta dolor intenso o sostenido, dificultad para respirar, o dolor que se irradia al brazo, 
              cuello o mandíbula, busque atención médica inmediata o llame a emergencias.
            </p>
          </div>
        </div>
      )}
      
      {/* Input form */}
      {conversationStage !== 'complete' && (
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              conversationStage === 'initial' 
                ? "Describa sus síntomas aquí..." 
                : conversationStage === 'clarifying'
                ? "Seleccione una opción o escriba su respuesta..."
                : "Escriba su respuesta..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isThinking || conversationStage === 'complete'}
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleSendMessage()}
            disabled={isThinking || !input.trim() || conversationStage === 'complete'}
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AIConversationForm;