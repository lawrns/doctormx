import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { useMachine } from '@xstate/react';
import { questionnaireMachine, type QuestionnaireContext as Context, type BodyRegion, type Symptom } from '../machines/questionnaireMachine';
import { getSymptomsByRegion, getSymptomQuestions } from '../lib/api/symptoms';

type QuestionnaireProviderProps = {
  children: ReactNode;
};

// Extended context with additional functionality
type QuestionnaireContextValue = {
  state: any;
  context: Context;
  isLoading: boolean;
  error: string | null;
  answers: Record<string, any>;
  progress: number;
  currentSymptom: Symptom | null;
  currentBodyRegion: BodyRegion | null;
  // Core functions
  selectBodyRegion: (region: BodyRegion) => void;
  selectSymptom: (symptom: Symptom) => void;
  answerQuestion: (questionId: string, answer: any) => void;
  previousQuestion: () => void;
  nextQuestion: () => void;
  reset: () => void;
  // Enhanced functions
  calculateProgress: () => number;
  getQuestionByIndex: (index: number) => any;
  getSeverityLevel: () => 'low' | 'moderate' | 'high';
  getUrgencyLevel: () => 'routine' | 'soon' | 'urgent';
  getAnalysisData: () => any;
  saveQuestionnaire: (userId?: string) => Promise<any>;
};

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

export function QuestionnaireProvider({ children }: QuestionnaireProviderProps) {
  const [state, send] = useMachine(questionnaireMachine, {
    services: {
      loadSymptoms: async (context: Context) => {
        if (!context.bodyRegion) throw new Error('No body region selected');
        try {
          // Add local caching for performance
          const cacheKey = `symptoms_${context.bodyRegion}`;
          const cachedData = sessionStorage.getItem(cacheKey);
          
          if (cachedData) {
            return JSON.parse(cachedData);
          }
          
          const data = await getSymptomsByRegion(context.bodyRegion);
          
          // Cache the results
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
          return data;
        } catch (error) {
          console.error('Error loading symptoms:', error);
          throw error;
        }
      },
      loadQuestions: async (context: Context) => {
        if (!context.selectedSymptom) throw new Error('No symptom selected');
        try {
          // Add local caching for performance
          const cacheKey = `questions_${context.selectedSymptom.id}`;
          const cachedData = sessionStorage.getItem(cacheKey);
          
          if (cachedData) {
            return JSON.parse(cachedData);
          }
          
          const data = await getSymptomQuestions(context.selectedSymptom.id);
          
          // Cache the results
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
          return data;
        } catch (error) {
          console.error('Error loading questions:', error);
          throw error;
        }
      }
    }
  });

  // Extended state
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Update progress whenever the state changes
  useEffect(() => {
    setProgress(calculateProgress());
    
    // If questionnaire is complete, generate analysis
    if (state.matches('complete')) {
      generateAnalysis();
    }
  }, [state]);

  const selectBodyRegion = useCallback((region: BodyRegion) => {
    send({ type: 'SELECT_BODY_REGION', region });
  }, [send]);

  const selectSymptom = useCallback((symptom: Symptom) => {
    send({ type: 'SELECT_SYMPTOM', symptom });
  }, [send]);

  const answerQuestion = useCallback((questionId: string, answer: any) => {
    send({ type: 'ANSWER_QUESTION', questionId, answer });
  }, [send]);

  const nextQuestion = useCallback(() => {
    send('NEXT_QUESTION');
  }, [send]);

  const previousQuestion = useCallback(() => {
    send('PREVIOUS_QUESTION');
  }, [send]);

  const reset = useCallback(() => {
    send('RESET');
    setAnalysisData(null);
  }, [send]);

  // Enhanced functions
  const calculateProgress = useCallback(() => {
    const { currentQuestionIndex, questions } = state.context;
    
    if (state.matches('idle')) return 0;
    if (state.matches('loadingSymptoms')) return 10;
    if (state.matches('selectingSymptom')) return 20;
    if (state.matches('loadingQuestions')) return 30;
    if (state.matches('complete')) return 100;
    
    if (state.matches('answering') && questions.length > 0) {
      return 30 + (70 * (currentQuestionIndex / questions.length));
    }
    
    return 0;
  }, [state]);

  const getQuestionByIndex = useCallback((index: number) => {
    const { questions } = state.context;
    if (index >= 0 && index < questions.length) {
      return questions[index];
    }
    return null;
  }, [state.context]);

  const getSeverityLevel = useCallback((): 'low' | 'moderate' | 'high' => {
    const { answers, selectedSymptom } = state.context;
    
    // Basic severity calculation - in a real app, this would be more sophisticated
    // based on medical guidelines and symptom-specific logic
    
    // Check if there's a direct pain/severity score
    const painScoreKeys = ['pain_level', 'severity', 'intensity'];
    let painScore = 0;
    
    for (const key of painScoreKeys) {
      if (answers[key] !== undefined) {
        const value = parseFloat(answers[key]);
        if (!isNaN(value)) {
          painScore = value;
          break;
        }
      }
    }
    
    // Check duration
    const durationKeys = ['duration', 'symptom_duration'];
    let isChronic = false;
    
    for (const key of durationKeys) {
      if (answers[key] && 
          (answers[key].includes('mes') || 
           answers[key].includes('año') || 
           answers[key].includes('semana'))) {
        isChronic = true;
        break;
      }
    }
    
    // Calculate severity
    if (painScore >= 7 || 
        (painScore >= 5 && isChronic) || 
        (selectedSymptom?.severity_level && selectedSymptom.severity_level >= 8)) {
      return 'high';
    }
    
    if (painScore >= 4 || 
        isChronic || 
        (selectedSymptom?.severity_level && selectedSymptom.severity_level >= 5)) {
      return 'moderate';
    }
    
    return 'low';
  }, [state.context]);

  const getUrgencyLevel = useCallback((): 'routine' | 'soon' | 'urgent' => {
    const severity = getSeverityLevel();
    const { selectedSymptom } = state.context;
    
    // Check if the symptom has an inherent urgency level
    const highUrgencySymptoms = ['chest_pain', 'stroke_symptoms', 'severe_abdominal_pain'];
    const mediumUrgencySymptoms = ['fever', 'persistent_vomiting', 'moderate_asthma'];
    
    if (selectedSymptom && highUrgencySymptoms.includes(selectedSymptom.id)) {
      return 'urgent';
    }
    
    if (selectedSymptom && mediumUrgencySymptoms.includes(selectedSymptom.id)) {
      return 'soon';
    }
    
    // Base urgency on severity
    if (severity === 'high') return 'urgent';
    if (severity === 'moderate') return 'soon';
    return 'routine';
  }, [getSeverityLevel, state.context]);

  // Generate analysis data based on questionnaire responses
  const generateAnalysis = useCallback(() => {
    const { answers, selectedSymptom, bodyRegion } = state.context;
    
    if (!selectedSymptom) return;
    
    // In a real app, this would be a complex medical analysis
    // For now, we'll create a simple mock analysis
    const mockAnalysis = {
      severityLevel: getSeverityLevel(),
      urgency: getUrgencyLevel(),
      possibleConditions: [
        { 
          name: 'Condición Primaria', 
          probability: 'alta', 
          description: 'Descripción básica de la condición más probable basada en los síntomas.'
        },
        { 
          name: 'Condición Secundaria', 
          probability: 'media', 
          description: 'Otra posible explicación para sus síntomas.'
        }
      ],
      recommendedSpecialties: ['Medicina General'],
      recommendedTests: ['Examen físico general'],
      selfCareRecommendations: [
        'Descansar adecuadamente',
        'Mantener una hidratación adecuada',
        'Monitorear sus síntomas'
      ]
    };
    
    // Add specialty based on body region
    if (bodyRegion) {
      const specialtyMap: Record<string, string> = {
        head: 'Neurología',
        chest: 'Cardiología',
        abdomen: 'Gastroenterología',
        back: 'Traumatología',
        left_leg: 'Traumatología',
        right_leg: 'Traumatología',
        left_arm: 'Traumatología',
        right_arm: 'Traumatología'
      };
      
      if (specialtyMap[bodyRegion] && !mockAnalysis.recommendedSpecialties.includes(specialtyMap[bodyRegion])) {
        mockAnalysis.recommendedSpecialties.push(specialtyMap[bodyRegion]);
      }
    }
    
    setAnalysisData(mockAnalysis);
    
    // Save analysis to session storage for persistence
    sessionStorage.setItem('symptom_analysis', JSON.stringify({
      ...mockAnalysis,
      symptom: selectedSymptom,
      bodyRegion,
      answers
    }));
    
    return mockAnalysis;
  }, [state.context, getSeverityLevel, getUrgencyLevel]);

  const getAnalysisData = useCallback(() => {
    if (analysisData) return analysisData;
    
    // Try to get from session storage
    const savedAnalysis = sessionStorage.getItem('symptom_analysis');
    if (savedAnalysis) {
      const parsed = JSON.parse(savedAnalysis);
      setAnalysisData(parsed);
      return parsed;
    }
    
    // If in complete state but no analysis, generate it
    if (state.matches('complete')) {
      return generateAnalysis();
    }
    
    return null;
  }, [analysisData, generateAnalysis, state]);

  // Save questionnaire results to the backend
  const saveQuestionnaire = useCallback(async (userId?: string) => {
    const { answers, selectedSymptom } = state.context;
    const analysis = getAnalysisData();
    
    if (!selectedSymptom || !analysis) {
      throw new Error('No symptom selected or analysis not generated');
    }
    
    try {
      // In a real app, this would save to your backend
      console.log('Saving questionnaire:', {
        user_id: userId || 'anonymous',
        symptom_id: selectedSymptom.id,
        severity_level: analysis.severityLevel === 'high' ? 3 : 
                        analysis.severityLevel === 'moderate' ? 2 : 1,
        answers,
        analysis_results: analysis
      });
      
      // Mock successful save
      return {
        success: true,
        id: `questionnaire_${Date.now()}`
      };
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      throw error;
    }
  }, [state.context, getAnalysisData]);

  const value = {
    state,
    context: state.context,
    isLoading: state.matches('loadingSymptoms') || state.matches('loadingQuestions'),
    error: state.context.error,
    answers: state.context.answers,
    progress,
    currentSymptom: state.context.selectedSymptom,
    currentBodyRegion: state.context.bodyRegion,
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
    saveQuestionnaire
  };

  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaireContext() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
}