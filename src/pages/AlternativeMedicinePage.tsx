import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Search, Star, Shield, ChevronRight, Users, Check } from 'lucide-react';

const alternativeTherapies = [
  {
    id: 'acupuncture',
    name: 'Acupuntura',
    description: 'Técnica milenaria china que utiliza agujas finas para estimular puntos específicos del cuerpo.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    benefits: ['Alivio del dolor', 'Reducción del estrés', 'Mejora del bienestar general']
  },
  {
    id: 'homeopathy',
    name: 'Homeopatía',
    description: 'Sistema de medicina alternativa basado en el principio de similitud y diluciones.',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    benefits: ['Tratamiento personalizado', 'Sin efectos secundarios', 'Enfoque holístico']
  },
  {
    id: 'herbal-medicine',
    name: 'Medicina Herbal',
    description: 'Uso terapéutico de plantas y extractos naturales para el tratamiento de condiciones.',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    benefits: ['Remedios naturales', 'Tradición ancestral', 'Apoyo a la salud']
  },
  {
    id: 'naturopathy',
    name: 'Naturopatía',
    description: 'Sistema médico que se enfoca en la capacidad natural del cuerpo para curarse.',
    image: 'https://images.unsplash.com/photo-1589365278144-c9e705f843cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    benefits: ['Enfoque holístico', 'Prevención', 'Salud integral']
  }
];

function AlternativeMedicinePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTherapies = searchTerm
    ? alternativeTherapies.filter(therapy => 
        therapy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapy.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : alternativeTherapies;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Medicina Alternativa</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre un enfoque integral para tu salud con profesionales certificados en medicina alternativa y complementaria.
          </p>
        </div>

        {/* Search section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Buscar terapias o tratamientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Profesionales Verificados</h3>
            <p className="text-gray-600">Todos nuestros terapeutas están certificados y validados</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Comunidad Activa</h3>
            <p className="text-gray-600">+5,000 pacientes confían en nuestros terapeutas</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Calidad Garantizada</h3>
            <p className="text-gray-600">Evaluaciones y reviews verificadas</p>
          </div>
        </div>

        {/* Therapies grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {filteredTherapies.map((therapy) => (
            <div key={therapy.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-48">
                <img
                  src={therapy.image}
                  alt={therapy.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{therapy.name}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{therapy.description}</p>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Beneficios principales:</h4>
                  <ul className="space-y-2">
                    {therapy.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <Check size={16} className="text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={`/buscar?terapia=${therapy.id}`}
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
                >
                  Ver especialistas
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">¿Eres terapeuta o practicante?</h2>
          <p className="text-xl mb-6 max-w-3xl mx-auto text-blue-100">
            Únete a nuestra red de profesionales de medicina alternativa y conecta con pacientes que buscan tus servicios.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/medicos/registro"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Registrarme como terapeuta
            </Link>
            <Link 
              to="/medicos/planes"
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Conocer planes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlternativeMedicinePage;