import { useState, useEffect } from 'react';
import Icon from './ui/Icon';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Alert from './ui/Alert';

export default function ExpertQA() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: '',
    anonymous: false
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { id: 'general', name: 'Medicina General', icon: 'heart' },
    { id: 'cardiology', name: 'Cardiología', icon: 'heart' },
    { id: 'dermatology', name: 'Dermatología', icon: 'eye' },
    { id: 'pediatrics', name: 'Pediatría', icon: 'academic-cap' },
    { id: 'gynecology', name: 'Ginecología', icon: 'user-group' },
    { id: 'psychiatry', name: 'Psiquiatría', icon: 'brain' },
    { id: 'nutrition', name: 'Nutriología', icon: 'heart' },
    { id: 'emergency', name: 'Urgencias', icon: 'exclamation-triangle' }
  ];

  useEffect(() => {
    // Simulate loading questions
    const mockQuestions = [
      {
        id: 1,
        title: "¿Es normal tener dolor de cabeza frecuente?",
        content: "He estado experimentando dolores de cabeza casi diarios durante las últimas dos semanas. ¿Debería preocuparme?",
        category: "general",
        author: "Usuario Anónimo",
        publishDate: "2024-01-15",
        answers: [
          {
            id: 1,
            content: "Los dolores de cabeza frecuentes pueden tener varias causas. Te recomiendo llevar un diario de síntomas y consultar con un neurólogo para descartar causas serias.",
            doctor: "Dr. María González",
            specialty: "Neurología",
            verified: true,
            helpful: 12,
            publishDate: "2024-01-15"
          }
        ],
        status: "answered",
        helpful: 8
      },
      {
        id: 2,
        title: "¿Qué alimentos debo evitar durante el embarazo?",
        content: "Soy primeriza y quiero asegurarme de seguir una dieta segura durante mi embarazo. ¿Hay alimentos específicos que deba evitar?",
        category: "gynecology",
        author: "Ana M.",
        publishDate: "2024-01-14",
        answers: [
          {
            id: 2,
            content: "Durante el embarazo es importante evitar carnes crudas, pescados con alto contenido de mercurio, quesos no pasteurizados y alcohol. Te recomiendo consultar con un nutriólogo especializado en embarazo.",
            doctor: "Dra. Patricia López",
            specialty: "Ginecología",
            verified: true,
            helpful: 15,
            publishDate: "2024-01-14"
          }
        ],
        status: "answered",
        helpful: 12
      },
      {
        id: 3,
        title: "Mi hijo de 3 años no quiere comer verduras",
        content: "Mi hijo de 3 años se niega a comer cualquier tipo de verdura. ¿Es normal a esta edad? ¿Cómo puedo ayudarle a desarrollar hábitos alimenticios saludables?",
        category: "pediatrics",
        author: "Carlos R.",
        publishDate: "2024-01-13",
        answers: [],
        status: "pending",
        helpful: 3
      },
      {
        id: 4,
        title: "Síntomas de ansiedad en adolescentes",
        content: "Mi hija de 16 años ha estado mostrando signos de ansiedad. ¿Cuáles son los síntomas a los que debo prestar atención y cuándo buscar ayuda profesional?",
        category: "psychiatry",
        author: "Usuario Anónimo",
        publishDate: "2024-01-12",
        answers: [
          {
            id: 3,
            content: "Los síntomas de ansiedad en adolescentes incluyen preocupación excesiva, irritabilidad, problemas de sueño, fatiga y dificultad para concentrarse. Si estos síntomas persisten por más de 2 semanas, te recomiendo consultar con un psiquiatra infantil.",
            doctor: "Dr. Carlos Rodríguez",
            specialty: "Psiquiatría",
            verified: true,
            helpful: 8,
            publishDate: "2024-01-12"
          }
        ],
        status: "answered",
        helpful: 6
      }
    ];

    setTimeout(() => {
      setQuestions(mockQuestions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.title || !newQuestion.content || !newQuestion.category) {
      return;
    }

    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add new question to the list
    const question = {
      id: questions.length + 1,
      ...newQuestion,
      author: newQuestion.anonymous ? "Usuario Anónimo" : "Usuario",
      publishDate: new Date().toISOString().split('T')[0],
      answers: [],
      status: "pending",
      helpful: 0
    };
    
    setQuestions([question, ...questions]);
    setNewQuestion({ title: '', content: '', category: '', anonymous: false });
    setShowAskForm(false);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Pregúntale al Experto
        </h1>
        <p className="text-lg text-neutral-600 mb-6">
          Haz preguntas médicas y recibe respuestas de profesionales verificados
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowAskForm(true)}
          icon="plus"
        >
          Hacer una Pregunta
        </Button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <div className="bg-white rounded-lg shadow-lg border border-neutral-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            Nueva Pregunta
          </h2>
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Título de la pregunta
              </label>
              <input
                type="text"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: ¿Es normal tener dolor de cabeza frecuente?"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Categoría
              </label>
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Descripción detallada
              </label>
              <textarea
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Proporciona más detalles sobre tu pregunta..."
                maxLength={500}
              />
              <div className="text-right text-xs text-neutral-500 mt-1">
                {newQuestion.content.length}/500 caracteres
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newQuestion.anonymous}
                  onChange={(e) => setNewQuestion({ ...newQuestion, anonymous: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">
                  Publicar de forma anónima
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAskForm(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="flex-1"
                loading={submitting}
                disabled={!newQuestion.title || !newQuestion.content || !newQuestion.category}
              >
                <Icon name="paper-airplane" size="sm" className="mr-2" />
                Enviar Pregunta
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" size="sm">
                    {categories.find(cat => cat.id === question.category)?.name}
                  </Badge>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    question.status === 'answered' 
                      ? 'bg-success-100 text-success-700' 
                      : 'bg-warning-100 text-warning-700'
                  }`}>
                    {question.status === 'answered' ? 'Respondida' : 'Pendiente'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {question.title}
                </h3>
                <p className="text-neutral-600 mb-3">
                  {question.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>Por {question.author}</span>
                  <span>{question.publishDate}</span>
                  <div className="flex items-center gap-1">
                    <Icon name="hand-thumb-up" size="xs" />
                    <span>{question.helpful}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers */}
            {question.answers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <h4 className="font-semibold text-neutral-900 mb-3">
                  Respuestas ({question.answers.length})
                </h4>
                <div className="space-y-4">
                  {question.answers.map((answer) => (
                    <div key={answer.id} className="bg-neutral-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {answer.doctor.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">{answer.doctor}</span>
                            {answer.verified && (
                              <Badge variant="success" size="xs">
                                <Icon name="check-circle" size="xs" className="mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-neutral-500">{answer.specialty}</div>
                        </div>
                      </div>
                      <p className="text-neutral-700 mb-3">
                        {answer.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          <Icon name="hand-thumb-up" size="xs" />
                          <span>{answer.helpful} útil</span>
                        </div>
                        <button className="text-sm text-primary-600 hover:text-primary-700">
                          Marcar como útil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No answers yet */}
            {question.answers.length === 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200 text-center">
                <p className="text-neutral-500 text-sm">
                  Esta pregunta aún no tiene respuestas. Los expertos responderán pronto.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline" size="lg">
          <Icon name="plus" size="sm" className="mr-2" />
          Ver Más Preguntas
        </Button>
      </div>
    </div>
  );
}
