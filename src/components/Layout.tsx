import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SocialIcons } from './icons/IconProvider';
import { useAuth } from '../contexts/AuthContext';
import EnhancedNavbar from './navigation/EnhancedNavbar';
import Footer from './navigation/Footer';
import ChatAssistant from './ChatAssistant';
import { ChatProvider } from './ChatContext';
import { Modal, SubscriptionModal } from './modal';
import { Button, Input } from './ui';

function EnhancedLayout() {
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitPopup, setShowExitPopup] = useState(false);
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
  
  const handleEmailSubmit = (email) => {
    // In a production app, this would send the email to backend
    console.log('Exit intent email captured:', email);
    
    // Store in localStorage for demo purposes
    localStorage.setItem('capturedEmail', email);
    
    // Close popup and show success message
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
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-white text-blue-600 p-4 z-50">
          Ir al contenido principal
        </a>
        
        <EnhancedNavbar />
        
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
          className="fixed bottom-6 left-6 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
          aria-label="Contactar por WhatsApp"
        >
          <span>💬</span>
        </a>
        
        {/* Chat Assistant Button */}
        <button 
          onClick={() => setShowChatAssistant(!showChatAssistant)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
          aria-label={showChatAssistant ? "Cerrar asistente de chat" : "Abrir asistente de chat"}
        >
          <span>💬</span>
        </button>
        
        {/* Chat Assistant Modal */}
        {showChatAssistant && (
          <ChatAssistant onClose={() => setShowChatAssistant(false)} />
        )}
        
        {/* Feedback Button */}
        <button
          className="fixed bottom-6 left-24 z-40 bg-white shadow-md border border-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-50 transition-colors"
          onClick={() => setShowFeedback(true)}
          aria-label="Dar feedback"
        >
          <span>👍</span>
        </button>
        
        {/* Feedback Modal */}
        <Modal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          title="Ayúdanos a mejorar"
          size="md"
        >
          <div className="space-y-4 mb-4">
            <button
              onClick={() => setFeedbackType('suggestion')}
              className={`w-full p-3 border rounded-lg text-left flex items-center ${
                feedbackType === 'suggestion' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <span className="mr-3 text-blue-500">👍</span>
              Tengo una sugerencia
            </button>
            <button
              onClick={() => setFeedbackType('issue')}
              className={`w-full p-3 border rounded-lg text-left flex items-center ${
                feedbackType === 'issue' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <span className="mr-3 text-amber-500">⚠️</span>
              Encontré un problema
            </button>
            <button
              onClick={() => setFeedbackType('compliment')}
              className={`w-full p-3 border rounded-lg text-left flex items-center ${
                feedbackType === 'compliment' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <span className="mr-3 text-green-500">😊</span>
              Me gusta algo específico
            </button>
          </div>
          
          {feedbackType && (
            <Input
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Cuéntanos más..."
              fullWidth
              as="textarea"
              className="h-32 resize-none"
            />
          )}
          
          <div className="flex justify-end mt-4 space-x-3">
            <Button
              onClick={() => setShowFeedback(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={submitFeedback}
              variant="primary"
              disabled={!feedbackType || !feedbackText.trim()}
            >
              Enviar feedback
            </Button>
          </div>
        </Modal>
        
        {/* Exit Intent Popup using SubscriptionModal */}
        <SubscriptionModal
          isOpen={showExitPopup}
          onClose={() => setShowExitPopup(false)}
          onSubscribe={handleEmailSubmit}
        />
      </div>
    </ChatProvider>
  );
}

export default EnhancedLayout;