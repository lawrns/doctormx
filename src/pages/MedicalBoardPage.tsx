import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Star, MessageCircle, ChevronRight, Shield, Users, Book, Globe, Heart } from 'lucide-react';

// Featured board members - most prominent positions
const featuredMembers = [
  {
    id: '1',
    name: 'Dr. Misael Uribe Esquivel',
    title: 'Presidente del Consejo Médico',
    specialty: 'Gastroenterología',
    institution: 'Hospital Médica Sur',
    role: 'CEO, Líder prominente en medicina mexicana',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    bio: 'Líder reconocido internacionalmente en gastroenterología con más de 30 años de experiencia.',
    achievements: ['Premio Nacional de Ciencias y Artes', 'Miembro de la Academia Nacional de Medicina'],
    publications: 150,
    certifications: ['Board Certified - Gastroenterología', 'Fellow del American College of Physicians']
  },
  {
    id: '2',
    name: 'Dr. Jorge Eduardo Cossío Aranda',
    title: 'Director de Cardiología',
    specialty: 'Cardiología',
    institution: 'Sociedad Mexicana de Cardiología',
    role: 'Ex-presidente, Líder influyente en cardiología',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    bio: 'Pionero en técnicas innovadoras de cardiología intervencionista.',
    achievements: ['Presidente de la Sociedad Mexicana de Cardiología', 'Premio al Mérito Médico'],
    publications: 85,
    certifications: ['Board Certified - Cardiología', 'Especialidad en Cardiología Intervencionista']
  },
  {
    id: '3',
    name: 'Dr. Alejandro Mohar Betancourt',
    title: 'Director de Investigación',
    specialty: 'Oncología',
    institution: 'Instituto Nacional de Cancerología',
    role: 'Ex-director, Líder en innovación y tecnología',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    bio: 'Referente en investigación oncológica y desarrollo de tratamientos innovadores.',
    achievements: ['Premio Nacional de Investigación', 'Líder en estudios clínicos fase III'],
    publications: 120,
    certifications: ['Board Certified - Oncología', 'PhD en Investigación Biomédica']
  }
];

// Board categories with their members
const boardCategories = [
  {
    id: 'academic',
    name: 'Liderazgo Académico',
    icon: Book,
    members: [
      {
        name: 'Dra. María Elena Medina-Mora',
        title: 'Decana de Investigación',
        institution: 'UNAM Facultad de Medicina',
        specialty: 'Psiquiatría'
      },
      {
        name: 'Dr. Germán Fajardo Dolci',
        title: 'Director',
        institution: 'UNAM Facultad de Medicina',
        specialty: 'Medicina Interna'
      }
    ]
  },
  {
    id: 'clinical',
    name: 'Excelencia Clínica',
    icon: Heart,
    members: [
      {
        name: 'Dr. Guillermo Domínguez Cherit',
        title: 'Jefe de Terapia Intensiva',
        institution: 'Instituto Nacional de Nutrición',
        specialty: 'Medicina Crítica'
      },
      {
        name: 'Dra. Patricia Volkow Fernández',
        title: 'Jefa de Infectología',
        institution: 'Instituto Nacional de Cancerología',
        specialty: 'Infectología'
      }
    ]
  },
  {
    id: 'research',
    name: 'Investigación e Innovación',
    icon: Globe,
    members: [
      {
        name: 'Dr. Carlos Cantú Brito',
        title: 'Director de Investigación Neurológica',
        institution: 'Instituto Nacional de Neurología',
        specialty: 'Neurología'
      },
      {
        name: 'Dra. Laura Alicia Palomares',
        title: 'Investigadora Principal',
        institution: 'Instituto de Biotecnología UNAM',
        specialty: 'Biotecnología'
      }
    ]
  }
];

function MedicalBoardPage() {
  const [selectedCategory, setSelectedCategory] = useState('academic');

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Junta Médica de Doctor.mx</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conoce a los líderes médicos que garantizan la excelencia y calidad de nuestros servicios
          </p>
        </div>

        {/* Featured members */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {featuredMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h2 className="text-white font-bold">{member.name}</h2>
                  <p className="text-white/90 text-sm">{member.title}</p>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-blue-600 font-medium mb-2">{member.specialty}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                
                <div className="space-y-3 mb-4">
                  {member.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Award size={16} className="text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-2xl font-bold text-blue-600">{member.publications}</div>
                    <div className="text-sm text-gray-600">Publicaciones</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {member.certifications.length}
                    </div>
                    <div className="text-sm text-gray-600">Certificaciones</div>
                  </div>
                </div>
                
                <Link
                  to={`/doctor/${member.id}`}
                  className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver perfil completo
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Board categories */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-16">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {boardCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <category.icon size={16} className="mr-2" />
                    {category.name}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {boardCategories
                .find(cat => cat.id === selectedCategory)
                ?.members.map((member, index) => (
                  <div 
                    key={index}
                    className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 text-sm mb-1">{member.specialty}</p>
                    <p className="text-gray-600 text-sm">{member.title}</p>
                    <p className="text-gray-500 text-sm">{member.institution}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Mission section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h2>
            <p className="text-gray-600 mb-8">
              La Junta Médica de Doctor.mx está comprometida con garantizar los más altos estándares 
              de calidad en la atención médica digital, supervisando y validando todos los aspectos 
              de nuestra plataforma.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Supervisión de Calidad</h3>
                <p className="text-sm text-gray-600">
                  Verificación rigurosa de credenciales médicas
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Excelencia Médica</h3>
                <p className="text-sm text-gray-600">
                  Establecimiento de protocolos y estándares
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Comunicación Efectiva</h3>
                <p className="text-sm text-gray-600">
                  Promoción del diálogo médico-paciente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-blue-600 rounded-lg shadow-sm p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">¿Quieres formar parte de nuestra Junta Médica?</h2>
          <p className="text-xl mb-6 max-w-3xl mx-auto text-blue-100">
            Buscamos profesionales destacados que quieran contribuir a mejorar la calidad de la 
            atención médica digital en México.
          </p>
          <Link 
            to="/contacto"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            Postularme como miembro
            <ChevronRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MedicalBoardPage;