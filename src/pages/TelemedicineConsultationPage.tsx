import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Video, Mic, MicOff, VideoOff, Phone, MessageSquare, Share2, Users, Settings, X } from 'lucide-react';
import { Button } from '../components/ui';

function TelemedicineConsultationPage() {
  const { user, isAuthenticated, isDoctor } = useAuth();
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  const navigate = useNavigate();
  
  const [isJoining, setIsJoining] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callSettings, setCallSettings] = useState({
    video: true,
    audio: true
  });
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [error, setError] = useState<string | null>(null);
  
  // Handle call joining
  const handleJoinCall = async () => {
    try {
      setIsJoining(true);
      setError(null);
      
      // In a real implementation, this would connect to a video service
      // For now, we'll simulate it
      setConnectionStatus('connecting');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      setConnectionStatus('connected');
      setInCall(true);
      setIsJoining(false);
    } catch (err) {
      console.error('Error joining call:', err);
      setError('No se pudo iniciar la llamada. Por favor intenta de nuevo.');
      setIsJoining(false);
      setConnectionStatus('disconnected');
    }
  };
  
  // Handle call ending
  const handleEndCall = () => {
    // In a real implementation, this would disconnect from the video service
    setInCall(false);
    setConnectionStatus('disconnected');
    navigate('/dashboard');
  };
  
  // Toggle video
  const toggleVideo = () => {
    setCallSettings(prev => ({
      ...prev,
      video: !prev.video
    }));
  };
  
  // Toggle audio
  const toggleAudio = () => {
    setCallSettings(prev => ({
      ...prev,
      audio: !prev.audio
    }));
  };
  
  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/telemedicina/consulta/' + (meetingId || ''));
    }
  }, [isAuthenticated, navigate, meetingId]);
  
  // If in a call, show the video interface
  if (inCall) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        {/* Main video area */}
        <div className="flex-1 relative overflow-hidden p-4">
          {/* Remote video (full screen) */}
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            {connectionStatus === 'connected' ? (
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                alt="Remote video" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white text-lg">
                Conectando...
              </div>
            )}
          </div>
          
          {/* Self video (picture-in-picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
            {callSettings.video ? (
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Your video" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <VideoOff size={32} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>
        
        {/* Call controls */}
        <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
          <button 
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${callSettings.audio ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {callSettings.audio ? <Mic className="text-white" /> : <MicOff className="text-white" />}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${callSettings.video ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {callSettings.video ? <Video className="text-white" /> : <VideoOff className="text-white" />}
          </button>
          
          <button 
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
          >
            <Phone className="text-white transform rotate-135" />
          </button>
          
          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
            <MessageSquare className="text-white" />
          </button>
          
          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
            <Share2 className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Default teleconsultation waiting room
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sala de espera virtual</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Video className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-800">Consulta #{meetingId}</h3>
              <p className="mt-1 text-sm text-blue-600">
                Tu médico se unirá en breve. Por favor, mantente en esta página.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Antes de comenzar:</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-blue-600 text-xs font-bold">1</span>
              </span>
              Asegúrate de estar en un lugar con buena conexión a internet
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-blue-600 text-xs font-bold">2</span>
              </span>
              Verifica que tu cámara y micrófono funcionan correctamente
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-blue-600 text-xs font-bold">3</span>
              </span>
              Prepara cualquier documento médico relevante para la consulta
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-blue-600 text-xs font-bold">4</span>
              </span>
              Encuentra un espacio tranquilo y bien iluminado
            </li>
          </ul>
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="primary"
            size="lg"
            onClick={handleJoinCall}
            loading={isJoining}
          >
            {isJoining ? "Conectando..." : "Unirse a la consulta"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TelemedicineConsultationPage;