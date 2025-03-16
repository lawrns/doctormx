import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, Check } from 'lucide-react';

interface UserFeedbackProps {
  symptomId?: string;
  symptomName?: string;
  onSubmitFeedback?: (data: {
    rating: 'positive' | 'negative' | null;
    comments: string;
    helpfulAreas: string[];
    improvementAreas: string[];
  }) => void;
  compact?: boolean;
}

const UserFeedback: React.FC<UserFeedbackProps> = ({
  symptomId,
  symptomName,
  onSubmitFeedback,
  compact = false
}) => {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [comments, setComments] = useState('');
  const [helpfulAreas, setHelpfulAreas] = useState<string[]>([]);
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Options for what was helpful and what could be improved
  const helpfulOptions = [
    'Claridad de la información',
    'Facilidad de uso',
    'Precisión de los resultados',
    'Recomendaciones útiles',
    'Recursos educativos'
  ];

  const improvementOptions = [
    'Más detalle en los resultados',
    'Mejor interfaz visual',
    'Más opciones de síntomas',
    'Conexión más rápida con médicos',
    'Lenguaje más sencillo'
  ];

  const handleSubmit = () => {
    if (onSubmitFeedback) {
      onSubmitFeedback({
        rating,
        comments,
        helpfulAreas,
        improvementAreas
      });
    }
    
    // Show success message
    setSubmitted(true);
    
    // In a real app, this would send data to a backend API
    console.log('Feedback submitted:', {
      symptomId,
      symptomName,
      rating,
      comments,
      helpfulAreas,
      improvementAreas,
      timestamp: new Date().toISOString()
    });
  };

  const toggleHelpfulArea = (area: string) => {
    if (helpfulAreas.includes(area)) {
      setHelpfulAreas(helpfulAreas.filter(a => a !== area));
    } else {
      setHelpfulAreas([...helpfulAreas, area]);
    }
  };

  const toggleImprovementArea = (area: string) => {
    if (improvementAreas.includes(area)) {
      setImprovementAreas(improvementAreas.filter(a => a !== area));
    } else {
      setImprovementAreas([...improvementAreas, area]);
    }
  };

  // Compact version (just thumbs up/down)
  if (compact && !expanded && !submitted) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <p className="text-sm text-gray-700 mb-3">¿Te resultó útil esta evaluación?</p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setRating('positive');
              setExpanded(true);
            }}
            className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <ThumbsUp size={18} className="text-gray-600 mr-2" />
            <span className="text-sm">Sí, fue útil</span>
          </button>
          <button
            onClick={() => {
              setRating('negative');
              setExpanded(true);
            }}
            className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <ThumbsDown size={18} className="text-gray-600 mr-2" />
            <span className="text-sm">No muy útil</span>
          </button>
        </div>
      </div>
    );
  }

  // Success message after submission
  if (submitted) {
    return (
      <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">¡Gracias por tu feedback!</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Tus comentarios nos ayudan a mejorar nuestro evaluador de síntomas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full feedback form
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center">
          <MessageSquare size={20} className="mr-2" />
          Tu opinión es importante
        </h3>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Ayúdanos a mejorar compartiendo tu experiencia con nuestro evaluador de síntomas.
          </p>
          
          <div className="flex justify-center space-x-6 mb-6">
            <button
              onClick={() => setRating('positive')}
              className={`flex flex-col items-center p-3 rounded-lg transition ${
                rating === 'positive'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <ThumbsUp size={24} className={rating === 'positive' ? 'text-green-600' : 'text-gray-400'} />
              <span className="mt-2 text-sm font-medium">Útil</span>
            </button>
            
            <button
              onClick={() => setRating('negative')}
              className={`flex flex-col items-center p-3 rounded-lg transition ${
                rating === 'negative'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <ThumbsDown size={24} className={rating === 'negative' ? 'text-red-600' : 'text-gray-400'} />
              <span className="mt-2 text-sm font-medium">No muy útil</span>
            </button>
          </div>
        </div>
        
        {rating && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué aspectos te resultaron más útiles?
              </label>
              <div className="flex flex-wrap gap-2">
                {helpfulOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleHelpfulArea(option)}
                    className={`text-sm px-3 py-1 rounded-full ${
                      helpfulAreas.includes(option)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué podríamos mejorar?
              </label>
              <div className="flex flex-wrap gap-2">
                {improvementOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleImprovementArea(option)}
                    className={`text-sm px-3 py-1 rounded-full ${
                      improvementAreas.includes(option)
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                id="comments"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comparte cualquier otro comentario o sugerencia para mejorar nuestro evaluador de síntomas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <Send size={16} className="mr-2" />
                Enviar comentarios
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserFeedback;