import { X as XIcon } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SocialIcons, X, AlertCircle } from './icons/IconProvider';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatAssistant from './ChatAssistant';
import { ChatProvider } from './ChatContext';

function Layout() {
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (
        e.clientY <= 0 && 
        !localStorage.getItem('exitPopupShown') && 
        !isAuthenticated
      ) {
        setShowExitPopup(true);
        localStorage.setItem('exitPopupShown', 'true');
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isAuthenticated]);
  
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    
    // In a production app, this would send the email to backend
    console.log('Exit intent email captured:', email);
    
    // Store in localStorage for demo purposes
    localStorage.setItem('capturedEmail', email);
    
    // Close popup
    setShowExitPopup(false);
    
    // Show success message
    alert('¡Gracias por registrarte! Te enviaremos información sobre los mejores doctores.');
  };
  
  const submitFeedback = () => {
    // In a real implementation, this would send to backend
    const feedback = {
      type: feedbackType,
      text: feedbackText,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: 'anonymous'
    };
    
    // For now, just store locally
    const feedbacks = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('userFeedback', JSON.stringify(feedbacks));
    
    setShowFeedback(false);
    setFeedbackType('');
    setFeedbackText('');
    
    // Show thank you message
    alert('¡Gracias por tus comentarios! Los utilizaremos para mejorar Doctor.mx');
  };

  return (
    <ChatProvider>
      <div className="flex flex-col min-h-screen">
        <a href="#main-content" className="skip-to-content">
          Ir al contenido principal
        </a>
        
        <Navbar />
        
        {isLoading ? (
          <main className="flex-grow flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </main>
        ) : (
          <main id="main-content" className="flex-grow animate-fade-in">
            <Outlet />
          </main>
        )}
        
        <Footer />
        
        {/* WhatsApp Contact Button */}
        <a 
          href="https://wa.me/5215512345678?text=Hola,%20tengo%20una%20pregunta%20sobre%20Doctor.mx"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 bg-brand-jade-500 text-white p-3 rounded-full shadow-lg hover:bg-brand-jade-600"
          aria-label="Contactar por WhatsApp"
        >
          <SocialIcons.MessageSquare size={24} />
        </a>
        
        {/* Chat Assistant Button */}
        <button 
          onClick={() => setShowChatAssistant(!showChatAssistant)}
          className="fixed bottom-6 right-6 bg-brand-jade-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-jade-700 transition-colors z-50 flex items-center justify-center"
          aria-label="Abrir asistente de chat"
        >
          <SocialIcons.MessageCircle size={24} />
        </button>
        
        {/* Chat Assistant Modal */}
        {showChatAssistant && (
          <ChatAssistant onClose={() => setShowChatAssistant(false)} />
        )}
        
        {/* Feedback Button */}
        <button
          className="fixed bottom-6 left-24 z-40 bg-white shadow-md border border-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-50"
          onClick={() => setShowFeedback(true)}
          aria-label="Dar feedback"
        >
          <SocialIcons.ThumbsUp size={20} />
        </button>
        
        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ayúdanos a mejorar</h3>
              
              <div className="space-y-4 mb-4">
                <button
                  onClick={() => setFeedbackType('suggestion')}
                  className={`w-full p-3 border rounded-lg text-left flex items-center ${
                    feedbackType === 'suggestion' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <SocialIcons.ThumbsUp className="mr-3 text-blue-500" size={20} />
                  Tengo una sugerencia
                </button>
                <button
                  onClick={() => setFeedbackType('issue')}
                  className={`w-full p-3 border rounded-lg text-left flex items-center ${
                    feedbackType === 'issue' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <AlertCircle className="mr-3 text-amber-500" size={20} />
                  Encontré un problema
                </button>
                <button
                  onClick={() => setFeedbackType('compliment')}
                  className={`w-full p-3 border rounded-lg text-left flex items-center ${
                    feedbackType === 'compliment' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <SocialIcons.Smile className="mr-3 text-green-500" size={20} />
                  Me gusta algo específico
                </button>
              </div>
              
              {feedbackType && (
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Cuéntanos más..."
                  className="w-full p-3 border border-gray-300 rounded-lg h-32"
                />
              )}
              
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={!feedbackType || !feedbackText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  Enviar feedback
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Exit Intent Popup */}
        {showExitPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No te pierdas a los mejores médicos
              </h3>
              <p className="text-gray-600 mb-4">
                Déjanos tu correo y recíbelo en tu bandeja de entrada cuando se unan nuevos especialistas.
              </p>
              
              <form onSubmit={handleEmailSubmit}>
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Recibir notificaciones
                </button>
              </form>
              
              <button 
                onClick={() => setShowExitPopup(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
              >
                <XIcon size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </ChatProvider>
  );
}

export default Layout;