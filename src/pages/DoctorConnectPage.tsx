import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, TrendingUp, Clock, Shield, Award, Heart, 
  CheckCircle, Star, MessageSquare, Calendar, 
  MapPin, Phone, Mail, DollarSign, Target,
  UserPlus, ArrowRight, PlayCircle, Quote, Loader
} from 'lucide-react';
import { useDoctorAuth } from '../contexts/DoctorAuthContext';

const DoctorConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading, error, clearError } = useDoctorAuth();
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    especialidad: '',
    cedula_profesional: '',
    telefono: '',
    email: '',
    anos_experiencia: '',
    institucion: '',
    password: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackData, setCallbackData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    especialidad: '',
    mensaje: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    clearError();
  };

  const handleCallbackInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCallbackData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nombre_completo.trim()) {
      errors.nombre_completo = 'El nombre completo es requerido';
    }
    
    if (!formData.especialidad) {
      errors.especialidad = 'La especialidad es requerida';
    }
    
    if (!formData.cedula_profesional.trim()) {
      errors.cedula_profesional = 'La cédula profesional es requerida';
    } else if (!/^\d{6,8}$/.test(formData.cedula_profesional.trim())) {
      errors.cedula_profesional = 'La cédula debe tener entre 6 y 8 dígitos';
    }
    
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!/^(\+52)?[\s-]?(\(?\d{2,3}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}$/.test(formData.telefono.trim())) {
      errors.telefono = 'Formato de teléfono inválido';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Formato de email inválido';
    }
    
    if (!formData.anos_experiencia) {
      errors.anos_experiencia = 'Los años de experiencia son requeridos';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    clearError();
    
    try {
      const doctorData = {
        nombre_completo: formData.nombre_completo.trim(),
        especialidad: formData.especialidad,
        cedula_profesional: formData.cedula_profesional.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        anos_experiencia: formData.anos_experiencia,
        institucion: formData.institucion.trim()
      };
      
      const { user, error } = await signUp(
        formData.email.trim(),
        formData.password,
        doctorData
      );
      
      if (error) {
        console.error('Registration error:', error);
      } else if (user) {
        setRegistrationSuccess(true);
        // Reset form
        setFormData({
          nombre_completo: '',
          especialidad: '',
          cedula_profesional: '',
          telefono: '',
          email: '',
          anos_experiencia: '',
          institucion: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the callback request to your backend
    console.log('Callback request:', callbackData);
    alert('¡Solicitud de llamada enviada! Te contactaremos pronto.');
    setShowCallbackForm(false);
    setCallbackData({
      nombre: '',
      telefono: '',
      email: '',
      especialidad: '',
      mensaje: ''
    });
  };

  const metrics = [
    { 
      number: "50,000+", 
      label: "Consultas mensuales", 
      icon: MessageSquare,
      description: "Pacientes activos buscando atención médica"
    },
    { 
      number: "95%", 
      label: "Satisfacción del paciente", 
      icon: Heart,
      description: "Calificación promedio de nuestros doctores"
    },
    { 
      number: "$25,000+", 
      label: "Ingresos mensuales promedio", 
      icon: DollarSign,
      description: "Potencial de ganancias para doctores activos"
    },
    { 
      number: "98%", 
      label: "Resolución exitosa", 
      icon: Target,
      description: "Casos resueltos satisfactoriamente"
    }
  ];

  const testimonials = [
    {
      name: "Dra. María González",
      specialty: "Cardióloga",
      location: "Ciudad de México",
      image: "/api/placeholder/80/80",
      quote: "Dr. Simeon me ha permitido llegar a más pacientes y brindar atención de calidad desde cualquier lugar. Mis ingresos han aumentado 40% desde que me uní.",
      rating: 5
    },
    {
      name: "Dr. Carlos Mendoza",
      specialty: "Pediatra",
      location: "Guadalajara",
      image: "/api/placeholder/80/80",
      quote: "La plataforma es intuitiva y me facilita el seguimiento de mis pacientes. He podido expandir mi práctica sin límites geográficos.",
      rating: 5
    },
    {
      name: "Dra. Ana Rodríguez",
      specialty: "Dermatóloga",
      location: "Monterrey",
      image: "/api/placeholder/80/80",
      quote: "Excelente herramienta para consultas de seguimiento. Mis pacientes valoran la accesibilidad y yo valoro la eficiencia.",
      rating: 5
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Aumenta tus ingresos",
      description: "Genera ingresos adicionales atendiendo pacientes en línea, con tarifas competitivas del mercado."
    },
    {
      icon: Clock,
      title: "Flexibilidad total",
      description: "Define tu horario y atiende desde donde quieras. Concilia tu vida profesional y personal."
    },
    {
      icon: Users,
      title: "Acceso a más pacientes",
      description: "Conecta con pacientes de todo México que buscan atención médica especializada."
    },
    {
      icon: Shield,
      title: "Soporte legal completo",
      description: "Plataforma certificada con respaldo legal y seguro de responsabilidad civil."
    },
    {
      icon: Award,
      title: "Tecnología de vanguardia",
      description: "Herramientas de IA que te asisten en el diagnóstico y mejoran la precisión de tus consultas."
    },
    {
      icon: Heart,
      title: "Impacto social",
      description: "Democratiza el acceso a la salud en México y mejora la vida de miles de familias."
    }
  ];

  const especialidades = [
    "Medicina General", "Cardiología", "Dermatología", "Pediatría",
    "Ginecología", "Neurología", "Oftalmología", "Endocrinología",
    "Gastroenterología", "Psiquiatría", "Ortopedia", "Urología", "Otra"
  ];

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Registro Exitoso!
          </h2>
          <p className="text-gray-600 mb-6">
            Gracias por registrarte. Hemos enviado un correo de confirmación a tu email. 
            Nuestro equipo revisará tu solicitud y te contactaremos pronto.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/doctor-login')}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Ir a Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full text-emerald-600 py-3 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Simeon Image */}
      <section className="relative bg-gradient-to-br from-[#006D77] via-[#007B8A] to-[#006D77] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                  Únete a la Revolución de la
                  <span className="block text-[#D0F0EF]">Telemedicina en México</span>
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
                  Forma parte de la red de doctores más innovadora del país. 
                  Amplía tu práctica, aumenta tus ingresos y ayuda a democratizar la salud.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#D0F0EF] hover:bg-white text-[#006D77] font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group"
                  aria-label="Unirme como doctor a la plataforma"
                >
                  <span className="flex items-center justify-center">
                    Unirme Ahora
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button 
                  onClick={() => setShowCallbackForm(true)}
                  className="border-2 border-white hover:bg-white hover:text-[#006D77] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] group"
                  aria-label="Solicitar llamada informativa"
                >
                  <span className="flex items-center justify-center">
                    <Phone className="mr-2 w-5 h-5" />
                    Solicitar Llamada
                  </span>
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#D0F0EF] mr-2" />
                  <span className="text-xs uppercase tracking-wider">Registro gratuito</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#D0F0EF] mr-2" />
                  <span className="text-xs uppercase tracking-wider">Certificación incluida</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#D0F0EF] mr-2" />
                  <span className="text-xs uppercase tracking-wider">Soporte 24/7</span>
                </div>
              </div>
            </motion.div>
            
            {/* Dr. Simeon Image Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                {/* Circular frame for Simeon image */}
                <div className="w-80 h-80 rounded-full overflow-hidden border-8 border-white/20 shadow-2xl bg-white/10 backdrop-blur-sm">
                  <img 
                    src="/images/simeon.png" 
                    alt="Dr. Simeon - IA Médica Mexicana" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Enhanced floating achievement badges */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-[#006D77]/20"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#006D77]">50K+</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Consultas</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-[#006D77]/20"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#006D77]">95%</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Satisfacción</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="absolute top-1/2 -left-8 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-[#006D77]/20"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#006D77]">24/7</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Disponible</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Professional floating elements */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-[#D0F0EF]/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-[#006D77]/20 rounded-full blur-2xl"></div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Números que Hablan por Sí Solos
            </h2>
            <p className="text-lg leading-7 text-neutral-700 max-w-3xl mx-auto">
              Dr. Simeon está transformando la medicina en México con resultados comprobados
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border border-gray-100"
                >
                  <div className="text-center">
                    <div className="bg-[#D0F0EF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-[#006D77]" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{metric.number}</div>
                    <div className="text-lg font-semibold text-gray-700 mb-2">{metric.label}</div>
                    <div className="text-sm text-gray-500">{metric.description}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              ¿Por Qué Elegir Dr. Simeon?
            </h2>
            <p className="text-lg leading-7 text-neutral-700 max-w-3xl mx-auto">
              Una plataforma diseñada por doctores, para doctores mexicanos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="p-6 rounded-xl border border-gray-200 hover:border-[#006D77]/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="bg-[#D0F0EF] w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#006D77]/10 transition-colors">
                    <Icon className="w-6 h-6 text-[#006D77]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-neutral-700 leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-[#D0F0EF] to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Lo Que Dicen Nuestros Doctores
            </h2>
            <p className="text-lg leading-7 text-neutral-700">
              Testimonios reales de médicos que ya están transformando su práctica
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-[#D0F0EF] rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-[#006D77]">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.specialty}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-neutral-700 italic relative">
                  <Quote className="absolute -top-2 -left-2 w-6 h-6 text-[#006D77]/20" />
                  <p className="pl-4">{testimonial.quote}</p>
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Updated Registration Form Section */}
      <section id="registro" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Comienza Tu Transformación Digital
            </h2>
            <p className="text-lg leading-7 text-neutral-700">
              Completa el formulario y nuestro equipo se pondrá en contacto contigo
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-[#D0F0EF] to-slate-50 p-8 rounded-2xl border border-gray-200 shadow-lg">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre_completo"
                    required
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200 ${
                      formErrors.nombre_completo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Dr(a). [Nombre] [Apellidos]"
                    aria-describedby={formErrors.nombre_completo ? "nombre-error" : undefined}
                  />
                  {formErrors.nombre_completo && (
                    <p id="nombre-error" className="mt-1 text-sm text-red-600">{formErrors.nombre_completo}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad *
                  </label>
                  <select
                    name="especialidad"
                    required
                    value={formData.especialidad}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200 ${
                      formErrors.especialidad ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-describedby={formErrors.especialidad ? "especialidad-error" : undefined}
                  >
                    <option value="">Seleccionar especialidad</option>
                    {especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                  {formErrors.especialidad && (
                    <p id="especialidad-error" className="mt-1 text-sm text-red-600">{formErrors.especialidad}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula profesional *
                  </label>
                  <input
                    type="text"
                    name="cedula_profesional"
                    required
                    value={formData.cedula_profesional}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200 ${
                      formErrors.cedula_profesional ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1234567"
                    aria-describedby={formErrors.cedula_profesional ? "cedula-error" : undefined}
                  />
                  {formErrors.cedula_profesional && (
                    <p id="cedula-error" className="mt-1 text-sm text-red-600">{formErrors.cedula_profesional}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Años de experiencia *
                  </label>
                  <select
                    name="anos_experiencia"
                    required
                    value={formData.anos_experiencia}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200 ${
                      formErrors.anos_experiencia ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-describedby={formErrors.anos_experiencia ? "experiencia-error" : undefined}
                  >
                    <option value="">Seleccionar</option>
                    <option value="1-3">1-3 años</option>
                    <option value="4-10">4-10 años</option>
                    <option value="11-20">11-20 años</option>
                    <option value="20+">Más de 20 años</option>
                  </select>
                  {formErrors.anos_experiencia && (
                    <p id="experiencia-error" className="mt-1 text-sm text-red-600">{formErrors.anos_experiencia}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200 ${
                      formErrors.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="55 1234 5678"
                    aria-describedby={formErrors.telefono ? "telefono-error" : undefined}
                  />
                  {formErrors.telefono && (
                    <p id="telefono-error" className="mt-1 text-sm text-red-600">{formErrors.telefono}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200 ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="doctor@email.com"
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  {formErrors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200 ${
                      formErrors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                    aria-describedby={formErrors.password ? "password-error" : undefined}
                  />
                  {formErrors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200 ${
                      formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Repetir contraseña"
                    aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
                  />
                  {formErrors.confirmPassword && (
                    <p id="confirm-password-error" className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institución donde labora
                </label>
                <input
                  type="text"
                  name="institucion"
                  value={formData.institucion}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200"
                  placeholder="Hospital, clínica o consultorio privado"
                  aria-label="Institución donde labora"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-passwords"
                  className="w-4 h-4 text-[#006D77] border-gray-300 rounded focus:ring-[#006D77]"
                />
                <label htmlFor="show-passwords" className="ml-2 text-sm text-gray-600">
                  Mostrar contraseñas
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-[#006D77] hover:underline focus:outline-none focus:ring-2 focus:ring-[#006D77] rounded"
                    aria-label={showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms-acceptance"
                  required
                  className="w-4 h-4 text-[#006D77] border-gray-300 rounded focus:ring-[#006D77]"
                />
                <label htmlFor="terms-acceptance" className="ml-2 text-sm text-gray-600">
                  Acepto los <Link to="/terms" className="text-[#006D77] hover:underline focus:outline-none focus:ring-2 focus:ring-[#006D77] rounded">términos y condiciones</Link> y la <Link to="/privacy" className="text-[#006D77] hover:underline focus:outline-none focus:ring-2 focus:ring-[#006D77] rounded">política de privacidad</Link> *
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group focus:outline-none focus:ring-4 focus:ring-[#006D77]/20"
                aria-label={isSubmitting ? 'Enviando solicitud de registro' : 'Enviar solicitud de registro'}
              >
                <span className="flex items-center justify-center">
                  {isSubmitting ? (
                    <Loader className="animate-spin mr-2 w-5 h-5" />
                  ) : (
                    <UserPlus className="mr-2 w-5 h-5" />
                  )}
                  {isSubmitting ? 'Registrando...' : 'Enviar Solicitud de Registro'}
                  {!isSubmitting && (
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/doctor-login" className="text-[#006D77] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#006D77] rounded">
                  Iniciar sesión
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                ¿Tienes dudas? Contáctanos al{' '}
                <a href="tel:+526144792338" className="text-[#006D77] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#006D77] rounded">
                  +52 614 479 2338
                </a>{' '}
                o por email a{' '}
                <a href="mailto:doctores@doctormx.com" className="text-[#006D77] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#006D77] rounded">
                  doctores@doctormx.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Callback Form Modal */}
      {showCallbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Solicitar Llamada</h3>
            <form onSubmit={handleCallbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={callbackData.nombre}
                  onChange={handleCallbackInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  required
                  value={callbackData.telefono}
                  onChange={handleCallbackInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200"
                  placeholder="55 1234 5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={callbackData.email}
                  onChange={handleCallbackInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                <select
                  name="especialidad"
                  value={callbackData.especialidad}
                  onChange={handleCallbackInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200"
                >
                  <option value="">Seleccionar especialidad</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                <textarea
                  name="mensaje"
                  rows={3}
                  value={callbackData.mensaje}
                  onChange={handleCallbackInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-all duration-200"
                  placeholder="¿En qué te podemos ayudar?"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCallbackForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#006D77] text-white py-3 rounded-lg hover:bg-[#005B66] transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight">
            El Futuro de la Medicina Está Aquí
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            No te quedes atrás. Únete a la revolución digital de la salud en México.
          </p>
          <button
            onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#D0F0EF] hover:bg-white text-[#006D77] font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#006D77]/20"
            aria-label="Ir al formulario de registro"
          >
            Comenzar Mi Registro
          </button>
        </div>
      </section>
    </div>
  );
};

export default DoctorConnectPage; 