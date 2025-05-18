import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, Clock, FileText, Calendar, MapPin, Shield, Award, CheckCircle } from 'lucide-react';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import FeatureCard from '../components/ui/FeatureCard';
import Card from '../components/ui/Card';
import CardContent from '../components/ui/CardContent';
import CardTitle from '../components/ui/CardTitle';
import CardDescription from '../components/ui/CardDescription';
import Button from '../components/ui/Button';

const steps = [
  {
    title: 'Elige tus pruebas',
    description: 'Selecciona entre nuestros paquetes y exámenes disponibles con precios transparentes.',
    icon: Beaker,
  },
  {
    title: 'Agenda la visita',
    description: 'Escoge fecha, hora y comparte tu dirección para programar la toma de muestra.',
    icon: Calendar,
  },
  {
    title: 'Recibe resultados',
    description: 'Revisa tus resultados en tu perfil y descarga los reportes en PDF.',
    icon: FileText,
  },
];

const benefits = [
  {
    title: 'Comodidad',
    description: 'Sin filas ni tiempos de espera. Realizamos la toma de muestra en la comodidad de tu hogar u oficina.',
    icon: MapPin,
  },
  {
    title: 'Rapidez',
    description: 'Resultados disponibles en línea en un promedio de 24-48 horas dependiendo del examen.',
    icon: Clock,
  },
  {
    title: 'Seguridad',
    description: 'Técnicos certificados y verificados con rigurosos protocolos de higiene y seguridad.',
    icon: Shield,
  },
  {
    title: 'Calidad',
    description: 'Laboratorios acreditados con tecnología de punta y control de calidad estricto.',
    icon: Award,
  },
];

const testimonials = [
  {
    quote: "El servicio fue excelente. El técnico llegó puntual, fue muy profesional y los resultados estuvieron listos antes de lo esperado.",
    name: "Ana García",
    role: "Paciente",
  },
  {
    quote: "Muy conveniente poder hacer los exámenes sin salir de casa, especialmente con mi agenda tan ocupada. ¡Lo recomiendo!",
    name: "Carlos Rodríguez",
    role: "Paciente",
  },
  {
    quote: "El proceso fue rápido y eficiente. La plataforma es muy intuitiva y los resultados fueron claros y fáciles de entender.",
    name: "María Hernández",
    role: "Paciente",
  },
];

const popularTests = [
  {
    name: "Perfil Básico",
    description: "Hemograma completo, glucosa y perfil lipídico",
    price: 400,
    popular: true,
  },
  {
    name: "Perfil Avanzado",
    description: "Perfil básico + pruebas de función hepática y renal",
    price: 650,
    popular: false,
  },
  {
    name: "Perfil COVID-19",
    description: "Prueba PCR y anticuerpos IgG e IgM",
    price: 900,
    popular: false,
  },
];

const LabTestingLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const handleStart = () => navigate('/lab-testing/app');

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-jade-600 to-brand-jade-700 text-white">
        <Container>
          <div className="py-12 md:py-14 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Exámenes de Laboratorio a Domicilio</h1>
              <p className="text-base md:text-lg mb-6 opacity-90">
                Cuidamos tu salud y tu tiempo. Realizamos la toma de muestras en tu domicilio y recibe los resultados en línea. Simple, conveniente y confiable.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={handleStart}
                  className="px-5 py-2 bg-white text-brand-jade-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Comenzar Ahora
                </button>
                <button 
                  onClick={() => navigate('/lab-testing/app?tab=catalog')}
                  className="px-5 py-2 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Ver Catálogo
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-brand-jade-700 to-transparent z-10"
                  style={{ marginBottom: '-20px' }}
                ></div>
                <img 
                  src="/images/simeontest.png" 
                  alt="Doctor sosteniendo un tubo de ensayo"
                  className="w-auto h-64 md:h-72 object-contain relative z-0"
                  style={{ marginBottom: '-20px' }}
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Trust Badges */}
      <div className="bg-white py-6 border-b">
        <Container>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-brand-jade-500" />
              <span className="text-sm font-medium">Técnicos certificados</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-brand-jade-500" />
              <span className="text-sm font-medium">Resultados en 24-48h</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-brand-jade-500" />
              <span className="text-sm font-medium">Laboratorios acreditados</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-brand-jade-500" />
              <span className="text-sm font-medium">Pago contra entrega</span>
            </div>
          </div>
        </Container>
      </div>

      {/* How It Works */}
      <Section
        title="Cómo funciona"
        subtitle="Tres pasos sencillos para obtener tus exámenes a domicilio"
        centered
        padding="lg"
        background="light"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => (
            <FeatureCard
              key={step.title}
              title={step.title}
              description={step.description}
              icon={step.icon}
              color="primary"
              delay={idx * 0.2}
            />
          ))}
        </div>
      </Section>

      {/* Popular Tests */}
      <Section
        title="Paquetes Populares"
        subtitle="Exámenes más solicitados por nuestros pacientes"
        centered
        padding="lg"
        background="white"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {popularTests.map((test) => (
            <Card 
              key={test.name}
              className={`border ${test.popular ? 'border-brand-jade-500 ring-2 ring-brand-jade-200' : 'border-gray-200'} rounded-xl overflow-hidden hover:shadow-lg transition-shadow`}
            >
              {test.popular && (
                <div className="bg-brand-jade-500 text-white text-xs font-bold py-1 text-center">
                  MÁS POPULAR
                </div>
              )}
              <CardContent className="p-6">
                <CardTitle className="text-xl font-bold mb-2">{test.name}</CardTitle>
                <CardDescription className="text-gray-600 mb-4">{test.description}</CardDescription>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${test.price}</span>
                    <span className="text-gray-500 ml-1">MXN</span>
                  </div>
                  <button
                    onClick={() => navigate(`/lab-testing/app?package=${test.name}`)}
                    className="bg-brand-jade-600 hover:bg-brand-jade-700 text-white rounded-lg px-4 py-2"
                  >
                    Elegir
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/lab-testing/app?tab=catalog')}
            className="bg-brand-jade-100 border border-brand-jade-600 text-brand-jade-600 hover:bg-brand-jade-200 rounded-lg px-6 py-3 font-medium"
          >
            Ver catálogo completo
          </button>
        </div>
      </Section>

      {/* Benefits */}
      <Section
        title="Beneficios"
        subtitle="¿Por qué elegir nuestro servicio?"
        centered
        padding="lg"
        background="light"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, idx) => (
            <div
              key={benefit.title}
              className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-brand-jade-100 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-brand-jade-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section
        title="Testimonios"
        subtitle="Lo que dicen nuestros pacientes"
        centered
        padding="lg"
        background="white"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <p className="italic text-gray-700 mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQs */}
      <Section
        title="Preguntas Frecuentes"
        subtitle="Resolvemos tus dudas"
        centered
        padding="lg"
        background="light"
      >
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            <div className="p-5 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">¿Cuándo recibo mis resultados?</h3>
              <p className="text-gray-700">La mayoría de los resultados están disponibles en un plazo de 24 a 48 horas, dependiendo del tipo de examen. Algunos análisis especializados pueden tardar hasta 72 horas.</p>
            </div>
            <div className="p-5 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">¿Cómo se realiza el pago?</h3>
              <p className="text-gray-700">El pago se realiza en efectivo al momento de la visita, después de que el técnico tome las muestras. Próximamente contaremos con pago con tarjeta y transferencia.</p>
            </div>
            <div className="p-5 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">¿Qué áreas geográficas cubren?</h3>
              <p className="text-gray-700">Actualmente damos servicio en la Ciudad de México y su área metropolitana. Estamos expandiendo nuestra cobertura constantemente.</p>
            </div>
            <div className="p-5 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">¿Necesito preparación especial?</h3>
              <p className="text-gray-700">Algunos exámenes requieren ayuno o preparación especial. Te proporcionaremos instrucciones específicas al momento de programar tu cita.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <div className="bg-brand-jade-800 text-white py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Tu salud, nuestra prioridad</h2>
            <p className="text-lg mb-8 opacity-90">
              Comienza hoy mismo a cuidar tu salud desde la comodidad de tu hogar.
            </p>
            <button
              onClick={handleStart}
              className="bg-white text-brand-jade-800 font-semibold rounded-lg px-8 py-3 text-lg hover:bg-gray-100 transition-colors"
            >
              Agendar Examen
            </button>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default LabTestingLandingPage;