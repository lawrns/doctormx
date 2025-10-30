import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

export default function QABoard() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20
  });

  const [askForm, setAskForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    author_name: '',
    author_email: '',
    is_anonymous: true
  });

  const [answerForm, setAnswerForm] = useState({
    content: '',
    author_name: '',
    author_email: '',
    is_anonymous: true
  });

  useEffect(() => {
    loadQuestions();
    loadCategories();
    loadTags();
  }, [filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '20'
      });
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/qa/questions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setPagination({
          total: data.total,
          page: filters.page,
          limit: 20
        });
      } else {
        throw new Error('Error al cargar preguntas');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Error al cargar preguntas');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/qa/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await fetch('/api/qa/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadQuestionDetails = async (questionId) => {
    try {
      const response = await fetch(`/api/qa/questions/${questionId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedQuestion(data);
      } else {
        throw new Error('Error al cargar pregunta');
      }
    } catch (error) {
      console.error('Error loading question details:', error);
      toast.error('Error al cargar pregunta');
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/qa/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(askForm)
      });

      if (response.ok) {
        toast.success('Pregunta enviada exitosamente. Será moderada antes de publicarse.');
        setShowAskForm(false);
        setAskForm({
          title: '',
          content: '',
          category: 'general',
          tags: [],
          author_name: '',
          author_email: '',
          is_anonymous: true
        });
        loadQuestions();
      } else {
        throw new Error('Error al enviar pregunta');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Error al enviar pregunta');
    }
  };

  const handleAnswerQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/qa/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answerForm,
          question_id: selectedQuestion.id
        })
      });

      if (response.ok) {
        toast.success('Respuesta enviada exitosamente. Será moderada antes de publicarse.');
        setShowAnswerForm(false);
        setAnswerForm({
          content: '',
          author_name: '',
          author_email: '',
          is_anonymous: true
        });
        loadQuestionDetails(selectedQuestion.id);
      } else {
        throw new Error('Error al enviar respuesta');
      }
    } catch (error) {
      console.error('Error answering question:', error);
      toast.error('Error al enviar respuesta');
    }
  };

  const handleLike = async (questionId, answerId = null) => {
    try {
      const response = await fetch('/api/qa/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          answer_id: answerId,
          user_ip: '127.0.0.1', // In production, get real IP
          user_agent: navigator.userAgent
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Like agregado');
          if (selectedQuestion) {
            loadQuestionDetails(selectedQuestion.id);
          }
          loadQuestions();
        } else {
          toast.info(result.message);
        }
      }
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  const handleHelpful = async (answerId, helpful) => {
    try {
      const response = await fetch('/api/qa/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer_id: answerId,
          helpful,
          user_ip: '127.0.0.1', // In production, get real IP
          user_agent: navigator.userAgent
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        loadQuestionDetails(selectedQuestion.id);
      }
    } catch (error) {
      console.error('Error rating helpful:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedQuestion) {
    return (
      <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedQuestion(null)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a preguntas
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{selectedQuestion.title}</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLike(selectedQuestion.id)}
                className="flex items-center text-gray-500 hover:text-red-500"
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {selectedQuestion.likes_count}
              </button>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{selectedQuestion.views_count} vistas</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {selectedQuestion.category}
              </span>
              {selectedQuestion.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-gray-600 text-sm">
              Por {selectedQuestion.is_anonymous ? 'Usuario Anónimo' : selectedQuestion.author_name} • 
              {formatDate(selectedQuestion.created_at)}
            </p>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-800 leading-relaxed">{selectedQuestion.content}</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Respuestas ({selectedQuestion.answers.length})
            </h2>
            <button
              onClick={() => setShowAnswerForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Responder
            </button>
          </div>

          {selectedQuestion.answers.map((answer) => (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {answer.is_verified_doctor && (
                      <span className="text-green-600 mr-2">👨‍⚕️</span>
                    )}
                    <span className="font-medium text-gray-900">
                      {answer.is_anonymous ? 'Usuario Anónimo' : answer.author_name}
                    </span>
                    {answer.is_verified_doctor && (
                      <span className="text-green-600 text-sm">Médico Verificado</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLike(null, answer.id)}
                    className="flex items-center text-gray-500 hover:text-red-500"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {answer.likes_count}
                  </button>
                </div>
              </div>

              <div className="prose max-w-none mb-4">
                <p className="text-gray-800 leading-relaxed">{answer.content}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">
                  {formatDate(answer.created_at)}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {answer.helpful_count} útil{answer.helpful_count !== 1 ? 'es' : ''}
                  </span>
                  <button
                    onClick={() => handleHelpful(answer.id, true)}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Útil
                  </button>
                  <button
                    onClick={() => handleHelpful(answer.id, false)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    No útil
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {selectedQuestion.answers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No hay respuestas aún. ¡Sé el primero en responder!</p>
            </div>
          )}
        </div>

        {showAnswerForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4">Responder Pregunta</h3>
              <form onSubmit={handleAnswerQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu respuesta *
                  </label>
                  <textarea
                    value={answerForm.content}
                    onChange={(e) => setAnswerForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Escribe tu respuesta aquí..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre (opcional)
                    </label>
                    <input
                      type="text"
                      value={answerForm.author_name}
                      onChange={(e) => setAnswerForm(prev => ({ ...prev, author_name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={answerForm.author_email}
                      onChange={(e) => setAnswerForm(prev => ({ ...prev, author_email: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="answer-anonymous"
                    checked={answerForm.is_anonymous}
                    onChange={(e) => setAnswerForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="answer-anonymous" className="text-sm text-gray-600">
                    Responder de forma anónima
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAnswerForm(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enviar Respuesta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    
    </Layout>
  );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Preguntas y Respuestas
            </h1>
            <p className="text-gray-600">
              Comunidad de salud donde puedes hacer preguntas y recibir respuestas de médicos verificados
            </p>
          </div>
          <button
            onClick={() => setShowAskForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Hacer Pregunta
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar preguntas..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags.slice(0, 10).map(tag => (
            <button
              key={tag}
              onClick={() => setFilters(prev => ({ ...prev, search: tag, page: 1 }))}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => loadQuestionDetails(question.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {question.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{question.views_count} vistas</span>
                  <span>•</span>
                  <span>{question.likes_count} likes</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {question.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {question.category}
                  </span>
                  {question.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  Por {question.is_anonymous ? 'Usuario Anónimo' : question.author_name} • 
                  {formatDate(question.created_at)}
                </div>
              </div>
            </motion.div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No se encontraron preguntas.</p>
            </div>
          )}

          {pagination.total > pagination.limit && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setFilters(prev => ({ ...prev, page }))}
                    className={`px-3 py-2 rounded-lg ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAskForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-4">Hacer Pregunta</h3>
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la pregunta *
                </label>
                <input
                  type="text"
                  value={askForm.title}
                  onChange={(e) => setAskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="¿Cuál es tu pregunta?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción detallada *
                </label>
                <textarea
                  value={askForm.content}
                  onChange={(e) => setAskForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe tu pregunta con más detalle..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={askForm.category}
                    onChange={(e) => setAskForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (separados por comas)
                  </label>
                  <input
                    type="text"
                    value={askForm.tags.join(', ')}
                    onChange={(e) => setAskForm(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="salud, medicina, dolor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre (opcional)
                  </label>
                  <input
                    type="text"
                    value={askForm.author_name}
                    onChange={(e) => setAskForm(prev => ({ ...prev, author_name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={askForm.author_email}
                    onChange={(e) => setAskForm(prev => ({ ...prev, author_email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ask-anonymous"
                  checked={askForm.is_anonymous}
                  onChange={(e) => setAskForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="ask-anonymous" className="text-sm text-gray-600">
                  Hacer pregunta de forma anónima
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAskForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enviar Pregunta
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
