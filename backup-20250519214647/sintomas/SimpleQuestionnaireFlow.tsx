import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'text' | 'boolean';
  options?: string[];
  minValue?: number;
  maxValue?: number;
  required?: boolean;
}

interface QuestionnaireFlowProps {
  symptomId: string;
  symptomName: string;
  questions: Question[];
  onComplete: (data: any) => void;
  onBack?: () => void;
}

const SimpleQuestionnaireFlow: React.FC<QuestionnaireFlowProps> = ({
  symptomId,
  symptomName,
  questions,
  onComplete,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate progress as percentage
    const newProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
    setProgress(newProgress);
  }, [currentQuestionIndex, questions.length]);

  const handleAnswer = (answer: any) => {
    setError(null);
    const currentQuestion = questions[currentQuestionIndex];
    
    // Save answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete questionnaire
      const result = {
        symptomId,
        symptomName,
        answers: {
          ...answers,
          [currentQuestion.id]: answer
        },
        timestamp: new Date().toISOString()
      };
      
      onComplete(result);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
            {currentQuestionIndex + 1} de {questions.length}
          </span>
          <span>{symptomName}</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.text}</h3>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        {/* Question content based on type */}
        {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        {currentQuestion.type === 'scale' && (
          <div className="space-y-6">
            <input
              type="range"
              min={currentQuestion.minValue || 1}
              max={currentQuestion.maxValue || 10}
              step="1"
              defaultValue={(currentQuestion.minValue || 1 + currentQuestion.maxValue || 10) / 2}
              onChange={(e) => handleAnswer(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {currentQuestion.minValue || 1}
                {currentQuestion.minValue === 1 && ' (Mínimo)'}
              </span>
              <span>
                {currentQuestion.maxValue || 10}
                {currentQuestion.maxValue === 10 && ' (Máximo)'}
              </span>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => {
                  // Get the current value from the range input
                  const value = parseInt((document.querySelector('input[type="range"]') as HTMLInputElement).value, 10);
                  handleAnswer(value);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
        
        {currentQuestion.type === 'text' && (
          <div className="space-y-4">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Escriba su respuesta aquí..."
              onChange={(e) => {
                // Just store the input, don't advance yet
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: e.target.value
                }));
              }}
            />
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const textValue = answers[currentQuestion.id];
                  if (!textValue && currentQuestion.required) {
                    setError('Por favor, complete este campo antes de continuar.');
                    return;
                  }
                  handleAnswer(textValue || '');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Continuar
              </button>
            </div>
          </div>
        )}
        
        {currentQuestion.type === 'boolean' && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              Sí
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              No
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Anterior
        </button>
        
        {currentQuestion.type !== 'multiple_choice' && currentQuestion.type !== 'boolean' && (
          <button
            onClick={() => {
              // Skip current question
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              }
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Omitir
          </button>
        )}
      </div>
    </div>
  );
};

export default SimpleQuestionnaireFlow;