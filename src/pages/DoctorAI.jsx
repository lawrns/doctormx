import { useEffect, useState, useRef } from 'react';
import { chatTurn, findSpecialists } from '../lib/api';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorAI() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [intake, setIntake] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [freeQuestionsRemaining, setFreeQuestionsRemaining] = useState(5);
  const [showFreeQuestionAlert, setShowFreeQuestionAlert] = useState(false);
  const [freeQuestionMessage, setFreeQuestionMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuth();

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Función para convertir **texto** en negritas HTML
  const formatTextWithBold = (text) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Función para extraer especialidad de la respuesta del bot
  const extractSpecialty = (message) => {
    if (!message || typeof message !== 'string') {
      return null;
    }
    const derivacionMatch = message.match(/Especialidad Sugerida:\s*([^\n\.]+)/i);
    return derivacionMatch ? derivacionMatch[1].trim() : null;
  };

  // Función para buscar especialistas y agregar al chat
  const searchSpecialistsAndAddToChat = async (specialty) => {
    try {
      // Intentar obtener ubicación del usuario
      let lat, lon, city;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        } catch (e) {
          console.log('No se pudo obtener ubicación:', e);
        }
      }
      
      // Si no hay coordenadas, usar ciudad por defecto
      if (!lat || !lon) {
        city = 'Ciudad de México';
      }
      
      const result = await findSpecialists({ specialty, city, lat, lon });
      
      // Crear mensaje especial con información de especialistas
      const specialistsMessage = {
        role: 'assistant',
        content: 'specialists_list',
        specialists: result,
        specialty: specialty
      };
      
      setHistory(h => [...h, specialistsMessage]);
    } catch (error) {
      console.error('Error buscando especialistas:', error);
      // Agregar mensaje de error al chat
      const errorMessage = {
        role: 'assistant',
        content: 'No pude encontrar especialistas en este momento. Por favor, intenta más tarde o contacta directamente con tu centro de salud.'
      };
      setHistory(h => [...h, errorMessage]);
    }
  };



  useEffect(() => {
    setIsLoaded(true);
    
    // Check free questions eligibility when component loads
    if (user) {
      checkFreeQuestionsEligibility();
    }
  }, [user]);

  // Function to check free questions eligibility
  const checkFreeQuestionsEligibility = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/.netlify/functions/free-questions/${user.id}/eligibility`);
      if (response.ok) {
        const data = await response.json();
        setFreeQuestionsRemaining(data.remaining);
      }
    } catch (error) {
      console.error('Error checking free questions eligibility:', error);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        // Convert file to base64 for now (in production, upload to cloud storage)
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            data: reader.result
          });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...uploadedFiles]);
      
      // Add images to chat
      const imageMessage = {
        role: 'user',
        content: `He subido ${files.length} imagen(es) para análisis`,
        images: uploadedFiles
      };
      setHistory(h => [...h, imageMessage]);
      
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove uploaded image
  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, loading]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  async function send() {
    if (!input.trim() && uploadedImages.length === 0) return;
    const msg = input.trim();
    setInput('');
    setLoading(true);
    
    // Create user message with text and images
    const userMessage = {
      role: 'user',
      content: msg || 'He subido imágenes para análisis',
      images: uploadedImages.length > 0 ? uploadedImages : undefined
    };
    
    const newHist = [...history, userMessage];
    setHistory(newHist);
    
    // Clear uploaded images after sending
    setUploadedImages([]);
    
    try {
      const data = await chatTurn({ 
        message: msg || 'Análisis de imágenes médicas', 
        history: newHist, 
        intake, 
        userId: user?.id,
        images: uploadedImages.length > 0 ? uploadedImages : undefined
      });
      
      setHistory(h => [...h, { role: 'assistant', content: data.reply }]);
      
      // Handle free question usage feedback
      if (data.freeQuestionUsed && data.freeQuestionMessage) {
        setFreeQuestionMessage(data.freeQuestionMessage);
        setShowFreeQuestionAlert(true);
        // Update remaining questions
        await checkFreeQuestionsEligibility();
      }
      
      // Detectar si hay derivación y buscar especialistas automáticamente
      const specialty = extractSpecialty(data.reply);
      if (specialty) {
        await searchSpecialistsAndAddToChat(specialty);
      }
    } catch (error) {
      if (error.status === 402) {
        // Free questions exhausted
        setHistory(h => [...h, { 
          role: 'assistant', 
          content: 'Has agotado tus preguntas gratuitas este mes. Las preguntas se renuevan automáticamente cada mes. Para continuar, puedes suscribirte a uno de nuestros planes.' 
        }]);
        setFreeQuestionsRemaining(0);
      } else {
        setHistory(h => [...h, { role: 'assistant', content: 'Error del servidor. Intenta de nuevo.' }]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="relative mx-auto max-w-container px-6 py-12 md:py-16 md:px-8">
        {/* Sophisticated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-brand-100/40 to-medical-50/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-medical-50/30 to-transparent rounded-full blur-3xl"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </div>

        <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-brand-200/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-500"></span>
                </span>
                Conectado · IA médica activa
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ink-primary mb-4 leading-[1.1]">
              Consulta con tu{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-brand-600 to-medical-600 bg-clip-text text-transparent">Dr. Simeon</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-gradient-to-r from-brand-200/50 to-medical-200/50 -rotate-1"></span>
              </span>
            </h1>
            <p className="text-lg text-ink-secondary max-w-2xl mx-auto leading-relaxed mb-8">
              Describe tus síntomas con detalle. Recibirás orientación médica inmediata y, si es necesario, referencias a especialistas cerca de ti.
            </p>

            {/* Free Questions Counter */}
            {user && (
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    {freeQuestionsRemaining > 0 
                      ? `${freeQuestionsRemaining} preguntas GRATIS restantes este mes`
                      : 'Preguntas gratuitas agotadas - se renuevan cada mes'
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-ink-border rounded-lg text-sm font-medium text-ink-secondary hover:border-brand-500 hover:bg-brand-50/50 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dolor de cabeza
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-ink-border rounded-lg text-sm font-medium text-ink-secondary hover:border-brand-500 hover:bg-brand-50/50 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fiebre
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-ink-border rounded-lg text-sm font-medium text-ink-secondary hover:border-brand-500 hover:bg-brand-50/50 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Dolor de pecho
              </button>
            </div>
          </div>

          {/* Chat Container */}
          <div className="mx-auto max-w-5xl">
            {/* Enhanced bento-box style container */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-medical-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>

              <div className="relative bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
                {/* Chat Messages */}
                <div ref={chatContainerRef} className="h-[65vh] p-6 md:p-8 overflow-y-auto bg-gradient-to-b from-white to-gray-50/30 scroll-smooth">
                {history.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-medical-200/50 rounded-2xl blur-xl"></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-medical-500 to-medical-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="currentColor">
                          <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <img
                        src="/images/simeon.webp"
                        alt="Dr. Simeon"
                        className="w-12 h-12 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <h3 className="text-2xl font-bold text-ink-primary">¡Hola! Soy Dr. Simeon</h3>
                    </div>
                    <p className="text-ink-secondary max-w-lg text-base leading-relaxed mb-6">
                      Describe tu situación médica con el mayor detalle posible. Esto me ayudará a brindarte la mejor orientación.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                      <div className="bg-white border border-ink-border rounded-xl p-4 text-left hover:border-brand-300 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-ink-primary text-sm mb-1">Sé específico</div>
                            <div className="text-xs text-ink-muted">Incluye síntomas, duración, intensidad</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white border border-ink-border rounded-xl p-4 text-left hover:border-brand-300 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-ink-primary text-sm mb-1">Menciona el tiempo</div>
                            <div className="text-xs text-ink-muted">¿Cuándo comenzó? ¿Ha empeorado?</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {history.map((m, i) => {
                    return (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${m.role === 'user' ? 'order-2' : 'order-1'}`}>
                          {/* Mensaje especial para lista de especialistas */}
                          {m.content === 'specialists_list' ? (
                            <div className="relative group">
                              {/* Subtle glow effect */}
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-medical-500 rounded-2xl blur opacity-5 group-hover:opacity-10 transition duration-300"></div>

                              <div className="relative bg-gradient-to-br from-white to-gray-50/50 border border-ink-border rounded-2xl shadow-lg p-6">
                                <div className="flex items-center gap-3 mb-5">
                                  <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-medical-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-ink-primary text-lg">Especialistas cerca de ti</h4>
                                    <p className="text-sm text-ink-secondary">{m.specialty}</p>
                                  </div>
                                </div>
                              
                              {m.specialists.specialists.length === 0 ? (
                                <div className="text-center py-6">
                                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-ink-muted text-sm">No se encontraron especialistas en tu área.</p>
                                  <p className="text-xs text-ink-muted mt-1">Intenta contactar directamente con tu centro de salud.</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {m.specialists.specialists.map((specialist, index) => (
                                    <div key={specialist.id} className="group relative bg-white border border-ink-border rounded-xl p-4 hover:shadow-md hover:border-brand-300 transition-all duration-200">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <h5 className="font-semibold text-ink-primary">{specialist.name}</h5>
                                            {specialist.source === 'local' && specialist.verified && (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ring-1 ring-green-200">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verificado
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-brand-600 font-medium mb-2">{specialist.specialty}</p>
                                          <p className="text-sm text-ink-secondary mb-2 flex items-start gap-1">
                                            <svg className="w-4 h-4 text-ink-muted mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{specialist.address}</span>
                                          </p>
                                          {specialist.phone && (
                                            <p className="text-sm text-ink-secondary mb-3 flex items-center gap-1">
                                              <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                              </svg>
                                              {specialist.phone}
                                            </p>
                                          )}
                                          
                                          <div className="flex items-center gap-4 text-sm mb-3">
                                            {specialist.rating && (
                                              <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                                                <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="font-semibold text-yellow-900">{specialist.rating.toFixed(1)}</span>
                                              </div>
                                            )}
                                            {specialist.distance && (
                                              <div className="flex items-center gap-1 text-ink-muted">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                                <span>{(specialist.distance / 1000).toFixed(1)} km</span>
                                              </div>
                                            )}
                                            {specialist.openNow !== undefined && (
                                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${specialist.openNow ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${specialist.openNow ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {specialist.openNow ? 'Abierto' : 'Cerrado'}
                                              </span>
                                            )}
                                          </div>

                                          {/* Información de contacto */}
                                          {(specialist.phone || specialist.website) && (
                                            <div className="flex gap-2 mt-3 pt-3 border-t border-ink-border">
                                              {specialist.phone && (
                                                <a
                                                  href={`tel:${specialist.phone}`}
                                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-lg hover:from-brand-700 hover:to-brand-600 transition-all shadow-sm hover:shadow-md"
                                                >
                                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                  </svg>
                                                  Llamar
                                                </a>
                                              )}
                                              {specialist.website && (
                                                <a
                                                  href={specialist.website}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-all"
                                                >
                                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                  </svg>
                                                  Sitio Web
                                                </a>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  

                                  

                                </div>
                              )}
                              </div>
                            </div>
                          ) : (
                            /* Mensaje normal */
                            <div className={`inline-block px-4 py-3 rounded-xl shadow-sm ${
                              m.role === 'user'
                                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white'
                                : 'bg-white border border-ink-border text-ink-primary'
                            }`}>
                              {/* Show uploaded images */}
                              {m.images && m.images.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex flex-wrap gap-2">
                                    {m.images.map((image) => (
                                      <img
                                        key={image.id}
                                        src={image.data}
                                        alt={image.name}
                                        className="w-16 h-16 object-cover rounded-lg border border-white/20"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div
                                className="text-sm leading-relaxed whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: formatTextWithBold(m.content) }}
                              />
                            </div>
                          )}

                          <div className={`text-xs text-ink-muted mt-1.5 ${
                            m.role === 'user' ? 'text-right' : 'text-left'
                          }`}>
                            {m.role === 'user' ? 'Tú' : (
                              <div className="flex items-center gap-2">
                                <img
                                  src="/images/simeon.webp"
                                  alt="Dr. Simeon"
                                  className="w-5 h-5 rounded-full object-cover border border-neutral-200"
                                />
                                <span>Dr. Simeon</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {loading && (
                  <div className="flex justify-start mt-4">
                    <div className="bg-white border border-ink-border rounded-xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                          <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs text-ink-muted">Dr. Simeon está escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-ink-border bg-gradient-to-b from-white to-gray-50/50 p-4 md:p-6">
                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.data}
                            alt={image.name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  {/* Image Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || isUploading}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Subir imágenes"
                  >
                    {isUploading ? (
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                  
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      adjustTextareaHeight();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Describe tus síntomas con detalle..."
                    className="flex-1 rounded-xl border border-ink-border px-4 py-3 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-200 text-ink-primary placeholder-ink-muted resize-none min-h-[56px] max-h-32 overflow-y-auto shadow-sm"
                    disabled={loading}
                    rows={1}
                  />
                  <button
                    onClick={send}
                    disabled={loading || (!input.trim() && uploadedImages.length === 0)}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <p className="text-xs text-ink-muted mt-3 text-center">
                  Presiona Enter para enviar • Shift + Enter para nueva línea • Sube imágenes para análisis
                </p>
              </div>
            </div>
            </div>

            {/* Security & Trust Indicators */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white border border-ink-border rounded-xl">
                <div className="w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-medical-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-ink-primary text-sm">NOM-004 Compliant</div>
                  <div className="text-xs text-ink-muted">Cumplimiento normativo</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white border border-ink-border rounded-xl">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-ink-primary text-sm">Datos Encriptados</div>
                  <div className="text-xs text-ink-muted">Privacidad garantizada</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white border border-ink-border rounded-xl">
                <div className="w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-medical-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-ink-primary text-sm">IA Supervisada</div>
                  <div className="text-xs text-ink-muted">Por médicos certificados</div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-5 bg-gradient-to-br from-alert-50 to-orange-50/50 border border-alert-200 rounded-2xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-alert-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-alert-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-alert-900 font-semibold mb-1">Aviso importante sobre el uso de IA médica</p>
                  <p className="text-sm text-alert-800 leading-relaxed">
                    Esta es una herramienta de orientación médica con IA supervisada por profesionales.
                    No sustituye diagnóstico ni tratamiento médico profesional. En emergencias, marca <strong>911</strong> o acude a urgencias inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Question Alert */}
      {showFreeQuestionAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 mb-1">¡Pregunta gratuita utilizada!</p>
                <p className="text-xs text-green-700">{freeQuestionMessage}</p>
              </div>
              <button
                onClick={() => setShowFreeQuestionAlert(false)}
                className="text-green-600 hover:text-green-800"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}