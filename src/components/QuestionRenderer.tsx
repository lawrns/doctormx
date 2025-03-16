import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Question, Answer } from '../machines/questionnaireMachine';

interface QuestionRendererProps {
  question: Question;
  answer?: Answer;
  onAnswer: (answer: Answer) => void;
  isTransitioning: boolean;
}

export function QuestionRenderer({ question, answer, onAnswer, isTransitioning }: QuestionRendererProps) {
  const handleMultiSelectToggle = (optionValue: string) => {
    const currentSelection = (answer as string[]) || [];
    const updatedSelection = currentSelection.includes(optionValue)
      ? currentSelection.filter(val => val !== optionValue)
      : [...currentSelection, optionValue];
    onAnswer(updatedSelection);
  };

  switch (question.question_type) {
    case 'boolean':
      return (
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={() => onAnswer(true)}
            className={`py-3 px-4 rounded-lg transition-colors ${
              answer === true 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isTransitioning}
          >
            Sí
          </motion.button>
          <motion.button
            onClick={() => onAnswer(false)}
            className={`py-3 px-4 rounded-lg transition-colors ${
              answer === false 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isTransitioning}
          >
            No
          </motion.button>
        </div>
      );

    case 'scale':
    case 'range':
      const minVal = question.min_value || 1;
      const maxVal = question.max_value || 5;
      return (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Mínimo</span>
            <span>Máximo</span>
          </div>
          <input
            type="range"
            min={minVal}
            max={maxVal}
            value={answer as number || minVal}
            onChange={(e) => onAnswer(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={isTransitioning}
          />
          <div className="flex justify-between text-sm font-medium">
            <span>{minVal}</span>
            <span>{answer || minVal}</span>
            <span>{maxVal}</span>
          </div>
        </div>
      );

    case 'multiple_choice':
    case 'radio':
    case 'select':
      return (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => onAnswer(option.value)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                answer === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isTransitioning}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border ${
                  answer === option.value 
                    ? 'bg-white border-white' 
                    : 'border-gray-300'
                } mr-3 flex items-center justify-center`}>
                  {answer === option.value && (
                    <Check size={12} className="text-blue-600" />
                  )}
                </div>
                {option.label}
              </div>
            </motion.button>
          ))}
        </div>
      );

    case 'multi_select':
    case 'checkbox':
      const selectedValues = (answer as string[]) || [];
      return (
        <div className="space-y-2">
          {question.options?.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <motion.button
                key={option.value}
                onClick={() => handleMultiSelectToggle(option.value)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-800'
                    : 'bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isTransitioning}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded border ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300'
                  } mr-3 flex items-center justify-center`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  {option.label}
                </div>
              </motion.button>
            );
          })}
          {selectedValues.length > 0 && (
            <motion.button
              onClick={() => onAnswer(selectedValues)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isTransitioning}
            >
              Confirmar ({selectedValues.length} seleccionados)
            </motion.button>
          )}
        </div>
      );

    case 'text':
    case 'textarea':
      const Component = question.question_type === 'textarea' ? 'textarea' : 'input';
      return (
        <div className="space-y-2">
          <Component
            type={question.question_type === 'text' ? 'text' : undefined}
            rows={question.question_type === 'textarea' ? 4 : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe tu respuesta aquí..."
            value={answer as string || ''}
            onChange={(e) => onAnswer(e.target.value)}
            disabled={isTransitioning}
          />
          {question.help_text && (
            <p className="text-sm text-gray-500">{question.help_text}</p>
          )}
        </div>
      );

    case 'numeric':
      return (
        <div className="space-y-2">
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={answer as number || ''}
            onChange={(e) => onAnswer(parseInt(e.target.value))}
            min={question.min_value}
            max={question.max_value}
            disabled={isTransitioning}
          />
          {(question.min_value !== undefined || question.max_value !== undefined) && (
            <p className="text-sm text-gray-500">
              {question.min_value !== undefined && `Mínimo: ${question.min_value}`}
              {question.min_value !== undefined && question.max_value !== undefined && ' | '}
              {question.max_value !== undefined && `Máximo: ${question.max_value}`}
            </p>
          )}
        </div>
      );

    case 'date':
    case 'time':
      return (
        <div className="space-y-2">
          <input
            type={question.question_type}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={answer as string || ''}
            onChange={(e) => onAnswer(e.target.value)}
            disabled={isTransitioning}
          />
          {question.help_text && (
            <p className="text-sm text-gray-500">{question.help_text}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <p className="text-gray-500">Este tipo de pregunta no está soportado actualmente.</p>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe tu respuesta aquí..."
            value={answer as string || ''}
            onChange={(e) => onAnswer(e.target.value)}
            disabled={isTransitioning}
          />
        </div>
      );
  }
}

export default QuestionRenderer;