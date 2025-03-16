import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useQuestionnaireContext } from '../contexts/QuestionnaireContext';
import QuestionRenderer from './QuestionRenderer';
import type { BodyRegion } from '../machines/questionnaireMachine';

type SymptomQuestionnaireProps = {
  bodyRegion: BodyRegion;
  onComplete: (data: {
    symptomId: string;
    answers: Record<string, any>;
    severityLevel: number;
  }) => void;
};

export default function SymptomQuestionnaire({ bodyRegion, onComplete }: SymptomQuestionnaireProps) {
  const {
    state,
    context,
    selectBodyRegion,
    selectSymptom,
    answerQuestion,
    previousQuestion,
    reset
  } = useQuestionnaireContext();

  // Initialize questionnaire when body region changes
  useEffect(() => {
    selectBodyRegion(bodyRegion);
  }, [bodyRegion, selectBodyRegion]);

  // Handle completion
  useEffect(() => {
    if (state.matches('complete') && context.selectedSymptom) {
      onComplete({
        symptomId: context.selectedSymptom.id,
        answers: context.answers,
        severityLevel: context.selectedSymptom.severity_level
      });
    }
  }, [state, context, onComplete]);

  // Loading states
  if (state.matches('loadingSymptoms') || state.matches('loadingQuestions')) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (state.matches('error')) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">
          {context.error || 'Ocurrió un error. Por favor intenta de nuevo.'}
        </p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Symptom selection
  if (state.matches('selectingSymptom')) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Selecciona el síntoma principal:
        </h3>
        <div className="space-y-2">
          {context.symptoms.map((symptom) => (
            <motion.button
              key={symptom.id}
              onClick={() => selectSymptom(symptom)}
              className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                  {symptom.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {symptom.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Completion state
  if (state.matches('complete')) {
    return (
      <div className="p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            ¡Evaluación completada!
          </h3>
          <p className="text-green-700">
            Tus respuestas han sido registradas. Analizando resultados...
          </p>
          <p className="mt-4 text-sm text-gray-500">
            <strong>Descargo de responsabilidad:</strong> Esta información no
            sustituye la evaluación médica profesional. Si tus síntomas
            empeoran, busca atención médica inmediata.
          </p>
        </div>
      </div>
    );
  }

  // Question answering state
  if (state.matches('answering') && context.currentQuestion) {
    const currentQuestionId = context.currentQuestion.id;
    const currentAnswer = context.answers[currentQuestionId];
    const progress = ((context.currentQuestionIndex + 1) / context.questions.length) * 100;

    return (
      <div className="p-6">
        <button
          onClick={previousQuestion}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
          disabled={state.hasTag('transitioning')}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          {context.currentQuestionIndex === 0 ? 'Volver a síntomas' : 'Pregunta anterior'}
        </button>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {context.selectedSymptom?.name}
          </h3>

          <AnimatePresence mode="wait">
            <motion.div
              key={context.currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="text-gray-700 mb-4">{context.currentQuestion.question_text}</p>
              {context.currentQuestion.help_text && (
                <p className="text-sm text-gray-500 mb-4">{context.currentQuestion.help_text}</p>
              )}
              <QuestionRenderer
                question={context.currentQuestion}
                answer={currentAnswer}
                onAnswer={(answer) => answerQuestion(currentQuestionId, answer)}
                isTransitioning={state.hasTag('transitioning')}
              />
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Pregunta {context.currentQuestionIndex + 1} de {context.questions.length}
            </div>
            <div className="h-2 bg-gray-200 rounded-full flex-1 mx-4">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}