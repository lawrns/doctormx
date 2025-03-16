import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Info, CheckCircle, AlertTriangle } from 'lucide-react';

// Types for the questions
type QuestionType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'date'
  | 'scale'
  | 'multi_select';

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  warning?: string;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  dependsOn?: {
    questionId: string;
    expectedValue: string | string[] | boolean | number;
  };
  validation?: {
    pattern?: string;
    message?: string;
    minLength?: number;
    maxLength?: number;
  };
}

interface QuestionGroupProps {
  title: string;
  description?: string;
  questions: Question[];
  onAnswersChange: (answers: Record<string, any>) => void;
  initialAnswers?: Record<string, any>;
  showValidation?: boolean;
}

const QuestionGroup: React.FC<QuestionGroupProps> = ({
  title,
  description,
  questions,
  onAnswersChange,
  initialAnswers = {},
  showValidation = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Validate the answer
    if (showValidation) {
      validateAnswer(questionId, value);
    }
    
    // Propagate changes to parent
    onAnswersChange(newAnswers);
  };
  
  // Validate a single answer
  const validateAnswer = (questionId: string, value: any) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    let errorMessage = '';
    
    // Required field validation
    if (question.required && (value === undefined || value === null || value === '')) {
      errorMessage = 'Este campo es obligatorio';
    }
    
    // Number range validation
    if (question.type === 'number' && value !== undefined && value !== null && value !== '') {
      const numValue = parseFloat(value);
      if (question.min !== undefined && numValue < question.min) {
        errorMessage = `El valor mínimo es ${question.min}`;
      } else if (question.max !== undefined && numValue > question.max) {
        errorMessage = `El valor máximo es ${question.max}`;
      }
    }
    
    // Text length validation
    if ((question.type === 'text' || question.type === 'textarea') && typeof value === 'string') {
      if (question.validation?.minLength && value.length < question.validation.minLength) {
        errorMessage = `La longitud mínima es ${question.validation.minLength} caracteres`;
      } else if (question.validation?.maxLength && value.length > question.validation.maxLength) {
        errorMessage = `La longitud máxima es ${question.validation.maxLength} caracteres`;
      }
    }
    
    // Pattern validation
    if (question.validation?.pattern && typeof value === 'string') {
      const pattern = new RegExp(question.validation.pattern);
      if (!pattern.test(value)) {
        errorMessage = question.validation.message || 'Formato inválido';
      }
    }
    
    // Update errors state
    setErrors(prevErrors => ({
      ...prevErrors,
      [questionId]: errorMessage
    }));
    
    return errorMessage === '';
  };
  
  // Validate all answers
  const validateAllAnswers = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    questions.forEach(question => {
      const value = answers[question.id];
      
      // Skip validation for hidden questions based on dependencies
      if (question.dependsOn) {
        const dependentValue = answers[question.dependsOn.questionId];
        const expectedValue = question.dependsOn.expectedValue;
        
        // Skip if the dependent question doesn't match the expected value
        if (Array.isArray(expectedValue) && !expectedValue.includes(dependentValue)) {
          return;
        } else if (!Array.isArray(expectedValue) && dependentValue !== expectedValue) {
          return;
        }
      }
      
      if (!validateAnswer(question.id, value)) {
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Check if a question should be shown based on its dependencies
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.dependsOn) return true;
    
    const dependentValue = answers[question.dependsOn.questionId];
    const expectedValue = question.dependsOn.expectedValue;
    
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(dependentValue);
    }
    
    return dependentValue === expectedValue;
  };
  
  // Render the appropriate input based on question type
  const renderQuestionInput = (question: Question) => {
    const value = answers[question.id] !== undefined ? answers[question.id] : '';
    const error = errors[question.id];
    
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            id={question.id}
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            id={question.id}
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
        );
        
      case 'number':
        return (
          <div className="flex items-center">
            <input
              type="number"
              id={question.id}
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              min={question.min}
              max={question.max}
              step={question.step || 1}
              placeholder={question.placeholder}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              aria-invalid={!!error}
              aria-describedby={error ? `${question.id}-error` : undefined}
            />
            {question.units && (
              <span className="ml-2 text-gray-500">{question.units}</span>
            )}
          </div>
        );
        
      case 'select':
        return (
          <select
            id={question.id}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? `${question.id}-error` : undefined}
          >
            <option value="">Seleccionar...</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${question.id}-${option.value}`}
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleAnswerChange(question.id, option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label 
                  htmlFor={`${question.id}-${option.value}`} 
                  className="ml-2 block text-sm text-gray-700"
                >
                  {option.label}
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  )}
                </label>
              </div>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const isChecked = Array.isArray(value) 
                ? value.includes(option.value) 
                : value === option.value;
              
              return (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${question.id}-${option.value}`}
                    name={question.id}
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => {
                      let newValue: string[];
                      
                      if (Array.isArray(value)) {
                        newValue = e.target.checked 
                          ? [...value, option.value] 
                          : value.filter(v => v !== option.value);
                      } else {
                        newValue = e.target.checked ? [option.value] : [];
                      }
                      
                      handleAnswerChange(question.id, newValue);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`${question.id}-${option.value}`} 
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {option.label}
                    {option.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        );
        
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id={`${question.id}-yes`}
                name={question.id}
                checked={value === true}
                onChange={() => handleAnswerChange(question.id, true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label 
                htmlFor={`${question.id}-yes`} 
                className="ml-2 block text-sm text-gray-700"
              >
                Sí
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id={`${question.id}-no`}
                name={question.id}
                checked={value === false}
                onChange={() => handleAnswerChange(question.id, false)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label 
                htmlFor={`${question.id}-no`} 
                className="ml-2 block text-sm text-gray-700"
              >
                No
              </label>
            </div>
          </div>
        );
        
      case 'date':
        return (
          <input
            type="date"
            id={question.id}
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
        );
        
      case 'scale':
        // Scale from min to max (default: 1-10)
        const min = question.min !== undefined ? question.min : 1;
        const max = question.max !== undefined ? question.max : 10;
        const currentValue = value !== undefined && value !== '' ? Number(value) : min;
        
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Mínimo</span>
              <span className="text-xs text-gray-500">Máximo</span>
            </div>
            <div className="flex items-center">
              <input
                type="range"
                id={question.id}
                min={min}
                max={max}
                step={question.step || 1}
                value={currentValue}
                onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 min-w-[2rem] text-center">
                {currentValue}
              </span>
            </div>
            <div className="flex justify-between px-1 mt-1">
              {[...Array(max - min + 1).keys()].map((i) => (
                <div 
                  key={i} 
                  className="h-1 w-1 bg-gray-300 rounded-full"
                  style={{ opacity: (i % 3 === 0 || i === 0 || i === max - min) ? 1 : 0 }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{min}</span>
              <span>{Math.floor((max + min) / 2)}</span>
              <span>{max}</span>
            </div>
          </div>
        );
        
      case 'multi_select':
        return (
          <div className="space-y-1">
            {question.options?.map((option) => {
              const isSelected = Array.isArray(value) 
                ? value.includes(option.value) 
                : value === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    let newValue: string[];
                    
                    if (Array.isArray(value)) {
                      newValue = isSelected
                        ? value.filter(v => v !== option.value)
                        : [...value, option.value];
                    } else {
                      newValue = isSelected ? [] : [option.value];
                    }
                    
                    handleAnswerChange(question.id, newValue);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md border ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 mr-3 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-blue-500' : 'border border-gray-300'
                    }`}>
                      {isSelected && (
                        <CheckCircle size={16} className="text-white" />
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {option.description && (
                    <p className="ml-8 text-xs text-gray-500 mt-1">{option.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        );
        
      default:
        return <div>Tipo de pregunta no soportado</div>;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden mb-6">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          className="flex w-full justify-between items-center text-left"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      
      {isExpanded && (
        <div className="px-4 py-5 sm:p-6 space-y-6">
          {questions.map((question) => {
            // Skip questions that don't meet their dependency conditions
            if (!shouldShowQuestion(question)) return null;
            
            const error = errors[question.id];
            
            return (
              <div key={question.id} className="space-y-2">
                <label 
                  htmlFor={question.id} 
                  className="block text-sm font-medium text-gray-700"
                >
                  {question.text} 
                  {question.required && <span className="ml-1 text-red-500">*</span>}
                </label>
                
                {renderQuestionInput(question)}
                
                {question.helpText && (
                  <div className="flex items-start mt-1">
                    <Info size={14} className="text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-xs text-gray-500">{question.helpText}</p>
                  </div>
                )}
                
                {question.warning && (
                  <div className="flex items-start mt-1">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-xs text-amber-600">{question.warning}</p>
                  </div>
                )}
                
                {error && (
                  <p 
                    className="mt-1 text-sm text-red-600" 
                    id={`${question.id}-error`}
                  >
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface DataCollectionFormProps {
  questionGroups: {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
  }[];
  onSubmit: (answers: Record<string, any>) => void;
  initialAnswers?: Record<string, any>;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
}

const DataCollectionForm: React.FC<DataCollectionFormProps> = ({
  questionGroups,
  onSubmit,
  initialAnswers = {},
  submitButtonText = 'Enviar',
  cancelButtonText = 'Cancelar',
  onCancel
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
  const [showValidation, setShowValidation] = useState(false);
  
  // Handle answers change from a question group
  const handleGroupAnswersChange = (groupId: string, groupAnswers: Record<string, any>) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      ...groupAnswers
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    // Validate all answers
    // This would typically involve checking required fields, etc.
    // For now, we'll just submit the answers
    onSubmit(answers);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {questionGroups.map((group) => (
        <QuestionGroup
          key={group.id}
          title={group.title}
          description={group.description}
          questions={group.questions}
          onAnswersChange={(groupAnswers) => handleGroupAnswersChange(group.id, groupAnswers)}
          initialAnswers={initialAnswers}
          showValidation={showValidation}
        />
      ))}
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {cancelButtonText}
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default DataCollectionForm;
export type { Question, QuestionOption, QuestionType };