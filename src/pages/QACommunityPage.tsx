import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Star, ThumbsUp, Filter, ChevronDown } from 'lucide-react';

// Mock data for questions
const questions = [
  {
    id: '1',
    title: '¿Es normal tener dolor de cabeza frecuente?',
    description: 'Últimamente he tenido dolores de cabeza casi todos los días...',
    category: 'Neurología',
    answers: 3,
    votes: 12,
    status: 'answered',
    date: '2025-03-01T10:00:00',
    author: {
      name: 'María G.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&q=80'
    },
    topAnswer: {
      doctor: {
        name: 'Dr. Juan Pérez',
        specialty: 'Neurólogo',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&q=80'
      },
      content: 'Los dolores de cabeza frecuentes pueden tener múltiples causas...',
      votes: 8
    }
  },
  // Add more mock questions...
];

function QACommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Comunidad Médica</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Resuelve tus dudas de salud con el apoyo de profesionales verificados
          </p>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar preguntas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                <option value="general">Medicina General</option>
                <option value="cardiology">Cardiología</option>
                <option value="neurology">Neurología</option>
                {/* Add more categories */}
              </select>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Más recientes</option>
                <option value="votes">Más votadas</option>
                <option value="answers">Más respondidas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6 mb-8">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={question.author.avatar}
                      alt={question.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                        <Link to={`/comunidad/preguntas/${question.id}`}>
                          {question.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mt-1">{question.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm">
                        <span className="text-gray-500">{question.author.name}</span>
                        <span className="text-gray-500">
                          {new Date(question.date).toLocaleDateString()}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {question.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{question.answers}</div>
                      <div className="text-sm text-gray-500">Respuestas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{question.votes}</div>
                      <div className="text-sm text-gray-500">Votos</div>
                    </div>
                  </div>
                </div>

                {question.topAnswer && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={question.topAnswer.doctor.avatar}
                        alt={question.topAnswer.doctor.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-gray-900 mr-2">
                            {question.topAnswer.doctor.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {question.topAnswer.doctor.specialty}
                          </span>
                        </div>
                        <p className="text-gray-700">{question.topAnswer.content}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <button className="flex items-center text-gray-500 hover:text-blue-600">
                            <ThumbsUp size={16} className="mr-1" />
                            <span>{question.topAnswer.votes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ask question CTA */}
        <div className="bg-blue-600 rounded-lg shadow-sm p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿Tienes una pregunta médica?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Obtén respuestas de profesionales de la salud verificados
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            Hacer una pregunta
            <MessageCircle size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default QACommunityPage;