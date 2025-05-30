/**
 * ConstitutionalQuestionnaire - Interactive Ayurvedic constitution assessment
 * Provides personalized herb and lifestyle recommendations based on constitutional type
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Zap, Heart, Brain, Moon, Leaf, CheckCircle, AlertCircle } from 'lucide-react';
import { constitutionalAnalysisService } from '@svc/ConstitutionalAnalysisService';
import { loggingService } from '@svc/LoggingService';

interface ConstitutionalQuestion {
  id: string;
  category: 'physical' | 'mental' | 'digestive' | 'sleep' | 'energy' | 'stress';
  question: string;
  answers: {
    option: string;
    constitution: 'vata' | 'pitta' | 'kapha';
    weight: number;
  }[];
}

interface ConstitutionalResult {
  primaryConstitution: 'vata' | 'pitta' | 'kapha';
  secondaryConstitution?: 'vata' | 'pitta' | 'kapha';
  scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  percentages: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  personalizedRecommendations: {
    herbs: string[];
    lifestyle: string[];
    diet: string[];
    exercise: string[];
    dailyRoutine: string[];
  };
  seasonalAdjustments: {
    current: string[];
    upcoming: string[];
  };
  mexicanContextAdaptations: string[];
  confidence: number;
}

interface Props {
  onComplete?: (result: ConstitutionalResult) => void;
  patientInfo?: {
    age?: number;
    gender?: string;
    location?: string;
    currentConditions?: string[];
  };
}

export default function ConstitutionalQuestionnaire({ onComplete, patientInfo }: Props) {
  const [questions, setQuestions] = useState<ConstitutionalQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ [questionId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ConstitutionalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = () => {
    try {
      const questionnaireData = constitutionalAnalysisService.getQuestionnaire();
      setQuestions(questionnaireData);
      loggingService.info('ConstitutionalQuestionnaire', 'Questionnaire loaded', {
        questionCount: questionnaireData.length
      });
    } catch (err) {
      setError('Error al cargar el cuestionario constitucional');
      loggingService.error('ConstitutionalQuestionnaire', 'Failed to load questionnaire', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));

    // Auto-advance to next question after short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const analyzeConstitution = async () => {
    try {
      setAnalyzing(true);
      
      const formattedResponses = Object.entries(responses).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }));

      const analysisResult = await constitutionalAnalysisService.analyzeConstitution(
        formattedResponses,
        patientInfo
      );

      setResult(analysisResult);
      onComplete?.(analysisResult);

      loggingService.info('ConstitutionalQuestionnaire', 'Analysis completed', {
        primaryConstitution: analysisResult.primaryConstitution,
        confidence: analysisResult.confidence
      });

    } catch (err) {
      setError('Error al analizar la constitución');
      loggingService.error('ConstitutionalQuestionnaire', 'Analysis failed', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setAnalyzing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      physical: User,
      mental: Brain,
      digestive: Heart,
      sleep: Moon,
      energy: Zap,
      stress: AlertCircle
    };
    return icons[category as keyof typeof icons] || User;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      physical: 'text-blue-600',
      mental: 'text-purple-600',
      digestive: 'text-green-600',
      sleep: 'text-indigo-600',
      energy: 'text-yellow-600',
      stress: 'text-red-600'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600';
  };

  const getConstitutionColor = (constitution: 'vata' | 'pitta' | 'kapha') => {
    const colors = {
      vata: 'bg-blue-100 text-blue-800 border-blue-200',
      pitta: 'bg-red-100 text-red-800 border-red-200',
      kapha: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[constitution];
  };

  const getConstitutionDescription = (constitution: 'vata' | 'pitta' | 'kapha') => {
    const descriptions = {
      vata: { name: 'Vata (Aire)', emoji: '💨', description: 'Ligero, móvil, creativo' },
      pitta: { name: 'Pitta (Fuego)', emoji: '🔥', description: 'Caliente, intenso, enfocado' },
      kapha: { name: 'Kapha (Tierra)', emoji: '🌱', description: 'Estable, fuerte, tranquilo' }
    };
    return descriptions[constitution];
  };

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isComplete = Object.keys(responses).length === questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando cuestionario...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => { setError(null); loadQuestionnaire(); }}
              className="text-red-600 underline text-sm mt-2"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tu Constitución Ayurvédica</h2>
          </div>
          <p className="text-gray-600">Basado en tus respuestas, hemos identificado tu tipo constitucional único</p>
        </div>

        {/* Constitution Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(result.percentages)
            .sort(([,a], [,b]) => b - a)
            .map(([constitution, percentage], index) => {
              const constInfo = getConstitutionDescription(constitution as 'vata' | 'pitta' | 'kapha');
              const isPrimary = index === 0;
              
              return (
                <div 
                  key={constitution}
                  className={`p-6 rounded-lg border-2 ${
                    isPrimary 
                      ? getConstitutionColor(constitution as 'vata' | 'pitta' | 'kapha')
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  <div className="text-center space-y-3">
                    <div className="text-3xl">{constInfo.emoji}</div>
                    <h3 className="font-semibold">{constInfo.name}</h3>
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <p className="text-sm">{constInfo.description}</p>
                    {isPrimary && (
                      <div className="inline-flex items-center px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium">
                        Constitución Principal
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Confidence Score */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Leaf className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-800">Confianza del Análisis</h3>
              <p className="text-blue-700">
                {Math.round(result.confidence * 100)}% - 
                {result.confidence > 0.8 ? ' Resultado muy confiable' : 
                 result.confidence > 0.6 ? ' Resultado confiable' : 
                 ' Resultado moderadamente confiable, considera responder nuevamente'}
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Herbs */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Hierbas Recomendadas
            </h3>
            <ul className="space-y-2">
              {result.personalizedRecommendations.herbs.slice(0, 6).map((herb, index) => (
                <li key={index} className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {herb.charAt(0).toUpperCase() + herb.slice(1)}
                </li>
              ))}
            </ul>
          </div>

          {/* Lifestyle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Estilo de Vida
            </h3>
            <ul className="space-y-2">
              {result.personalizedRecommendations.lifestyle.slice(0, 4).map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-700 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Diet */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Alimentación
            </h3>
            <ul className="space-y-2">
              {result.personalizedRecommendations.diet.slice(0, 4).map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-orange-700 text-sm">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Exercise */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Ejercicio
            </h3>
            <ul className="space-y-2">
              {result.personalizedRecommendations.exercise.slice(0, 4).map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-purple-700 text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mexican Context Adaptations */}
        {result.mexicanContextAdaptations.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-800 mb-4">🇲🇽 Adaptaciones para el Contexto Mexicano</h3>
            <ul className="space-y-2">
              {result.mexicanContextAdaptations.slice(0, 5).map((adaptation, index) => (
                <li key={index} className="flex items-start gap-2 text-yellow-700 text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  {adaptation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Daily Routine Preview */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Rutina Diaria Recomendada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.personalizedRecommendations.dailyRoutine.slice(0, 6).map((routine, index) => (
              <div key={index} className="flex items-start gap-2 text-indigo-700 text-sm">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0"></div>
                {routine}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => setResult(null)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tomar el Cuestionario Nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Cuestionario Constitucional Ayurvédico</h2>
        <p className="text-gray-600">Descubre tu tipo constitucional único para recibir recomendaciones personalizadas</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </p>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Question Header */}
          <div className="flex items-center gap-3">
            {React.createElement(getCategoryIcon(currentQuestion.category), {
              className: `w-6 h-6 ${getCategoryColor(currentQuestion.category)}`
            })}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentQuestion.question}</h3>
              <p className="text-sm text-gray-500 capitalize">
                Categoría: {currentQuestion.category}
              </p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  responses[currentQuestion.id] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    responses[currentQuestion.id] === index
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {responses[currentQuestion.id] === index && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <span>{answer.option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <span className="text-sm text-gray-500">
          {Object.keys(responses).length} de {questions.length} respondidas
        </span>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={goToNextQuestion}
            disabled={responses[currentQuestion?.id] === undefined}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={analyzeConstitution}
            disabled={!isComplete || analyzing}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analizando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Analizar Constitución
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}