import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Simple types for the questionnaire
export type BodyRegion = 'head' | 'chest' | 'abdomen' | 'back' | 'arms' | 'legs';

export type Symptom = {
  id: string;
  name: string;
  description?: string;
  severity_level?: number;
};

export type Question = {
  id: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'yes_no' | 'text';
  options?: string[];
};

type QuestionnaireProviderProps = {
  children: ReactNode;
};

type QuestionnaireState = 'idle' | 'loadingSymptoms' | 'selectingSymptom' | 'loadingQuestions' | 'answering' | 'complete';

type QuestionnaireContextValue = {
  // State
  currentState: QuestionnaireState;
  isLoading: boolean;
  error: string | null;
  answers: Record<string, any>;
  progress: number;
  currentSymptom: Symptom | null;
  currentBodyRegion: BodyRegion | null;
  currentQuestionIndex: number;
  questions: Question[];
  
  // Core functions
  selectBodyRegion: (region: BodyRegion) => void;
  selectSymptom: (symptom: Symptom) => void;
  answerQuestion: (questionId: string, answer: any) => void;
  previousQuestion: () => void;
  nextQuestion: () => void;
  reset: () => void;
  
  // Enhanced functions
  calculateProgress: () => number;
  getQuestionByIndex: (index: number) => Question | null;
  getSeverityLevel: () => 'low' | 'moderate' | 'high';
  getUrgencyLevel: () => 'routine' | 'soon' | 'urgent';
  getAnalysisData: () => any;
  saveQuestionnaire: (userId?: string) => Promise<any>;
};

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

export function QuestionnaireProvider({ children }: QuestionnaireProviderProps) {
  // Simple state management without XState
  const [currentState, setCurrentState] = useState<QuestionnaireState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState(0);
  const [currentSymptom, setCurrentSymptom] = useState<Symptom | null>(null);
  const [currentBodyRegion, setCurrentBodyRegion] = useState<BodyRegion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Mock data for development
  const mockSymptoms: Record<BodyRegion, Symptom[]> = {
    head: [
      { id: 'headache', name: 'Dolor de cabeza', severity_level: 5 },
      { id: 'migraine', name: 'Migraña', severity_level: 7 },
    ],
    chest: [
      { id: 'chest_pain', name: 'Dolor de pecho', severity_level: 8 },
      { id: 'shortness_breath', name: 'Dificultad para respirar', severity_level: 7 },
    ],
    abdomen: [
      { id: 'stomach_pain', name: 'Dolor de estómago', severity_level: 5 },
      { id: 'nausea', name: 'Náuseas', severity_level: 4 },
    ],
    back: [
      { id: 'back_pain', name: 'Dolor de espalda', severity_level: 6 },
    ],
    arms: [
      { id: 'arm_pain', name: 'Dolor de brazo', severity_level: 4 },
    ],
    legs: [
      { id: 'leg_pain', name: 'Dolor de pierna', severity_level: 4 },
    ],
  };

  const mockQuestions: Question[] = [
    {
      id: 'pain_level',
      text: '¿Qué tan intenso es el dolor del 1 al 10?',
      type: 'scale'
    },
    {
      id: 'duration',
      text: '¿Cuánto tiempo has tenido este síntoma?',
      type: 'multiple_choice',
      options: ['Menos de 1 hora', '1-6 horas', '1-3 días', 'Más de 3 días']
    },
    {
      id: 'triggers',
      text: '¿Hay algo que empeore el síntoma?',
      type: 'text'
    }
  ];

  const selectBodyRegion = useCallback((region: BodyRegion) => {
    setCurrentBodyRegion(region);
    setCurrentState('loadingSymptoms');
    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      setCurrentState('selectingSymptom');
    }, 500);
  }, []);

  const selectSymptom = useCallback((symptom: Symptom) => {
    setCurrentSymptom(symptom);
    setCurrentState('loadingQuestions');
    setIsLoading(true);
    
    // Simulate loading questions
    setTimeout(() => {
      setQuestions(mockQuestions);
      setCurrentQuestionIndex(0);
      setIsLoading(false);
      setCurrentState('answering');
    }, 500);
  }, []);

  const answerQuestion = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentState('complete');
    }
  }, [currentQuestionIndex, questions.length]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const reset = useCallback(() => {
    setCurrentState('idle');
    setCurrentBodyRegion(null);
    setCurrentSymptom(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setAnalysisData(null);
    setError(null);
  }, []);

  const calculateProgress = useCallback(() => {
    switch (currentState) {
      case 'idle': return 0;
      case 'loadingSymptoms': return 10;
      case 'selectingSymptom': return 20;
      case 'loadingQuestions': return 30;
      case 'complete': return 100;
      case 'answering':
        if (questions.length > 0) {
          return 30 + (70 * (currentQuestionIndex / questions.length));
        }
        return 30;
      default: return 0;
    }
  }, [currentState, currentQuestionIndex, questions.length]);

  const getQuestionByIndex = useCallback((index: number): Question | null => {
    if (index >= 0 && index < questions.length) {
      return questions[index];
    }
    return null;
  }, [questions]);

  const getSeverityLevel = useCallback((): 'low' | 'moderate' | 'high' => {
    const painScore = parseInt(answers.pain_level) || 0;
    const duration = answers.duration || '';
    
    if (painScore >= 7 || duration.includes('Más de 3 días')) {
      return 'high';
    }
    if (painScore >= 4 || duration.includes('1-3 días')) {
      return 'moderate';
    }
    return 'low';
  }, [answers]);

  const getUrgencyLevel = useCallback((): 'routine' | 'soon' | 'urgent' => {
    const severity = getSeverityLevel();
    if (severity === 'high') return 'urgent';
    if (severity === 'moderate') return 'soon';
    return 'routine';
  }, [getSeverityLevel]);

  const getAnalysisData = useCallback(() => {
    return {
      symptoms: currentSymptom,
      answers,
      severity: getSeverityLevel(),
      urgency: getUrgencyLevel(),
      recommendations: ['Consultar con un médico', 'Descansar', 'Hidratarse']
    };
  }, [currentSymptom, answers, getSeverityLevel, getUrgencyLevel]);

  const saveQuestionnaire = useCallback(async (userId?: string) => {
    // Mock save function
    const data = getAnalysisData();
    console.log('Saving questionnaire:', data);
    return Promise.resolve(data);
  }, [getAnalysisData]);

  // Update progress when state changes
  useEffect(() => {
    setProgress(calculateProgress());
  }, [calculateProgress]);

  const contextValue: QuestionnaireContextValue = {
    currentState,
    isLoading,
    error,
    answers,
    progress,
    currentSymptom,
    currentBodyRegion,
    currentQuestionIndex,
    questions,
    selectBodyRegion,
    selectSymptom,
    answerQuestion,
    previousQuestion,
    nextQuestion,
    reset,
    calculateProgress,
    getQuestionByIndex,
    getSeverityLevel,
    getUrgencyLevel,
    getAnalysisData,
    saveQuestionnaire,
  };

  return (
    <QuestionnaireContext.Provider value={contextValue}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaireContext() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaireContext must be used within a QuestionnaireProvider');
  }
  return context;
}