import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Phone, MessageSquare, Share2 } from 'lucide-react';

function SimpleTeleconsultationPage() {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  const navigate = useNavigate();
  
  // State for call
  const [isJoining, setIsJoining] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callSettings, setCallSettings] = useState({
    video: true,
    audio: true
  });
  
  // Handle join call
  const handleJoinCall = async () => {
    setIsJoining(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setInCall(true);
      setIsJoining(false);
    }, 2000);
  };
  
  // Handle end call
  const handleEndCall = () => {
    setInCall(false);
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
  
  // If in a call, show video interface
  if (inCall) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        {/* Main video area */}
        <div className="flex-1 relative overflow-hidden p-4">
          {/* Remote video (full screen) */}
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
              alt="Remote video" 
              className="w-full h-full object-cover"
            />
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
  
  // Default waiting room
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sala de espera virtual</h1>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
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
        
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Antes de comenzar:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Asegúrate de estar en un lugar con buena conexión a internet</li>
            <li>• Verifica que tu cámara y micrófono funcionan correctamente</li>
            <li>• Prepara cualquier documento médico relevante para la consulta</li>
            <li>• Encuentra un espacio tranquilo y bien iluminado</li>
          </ul>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleJoinCall}
            disabled={isJoining}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isJoining ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Conectando...
              </>
            ) : (
              'Unirse a la consulta'
            )}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">¿Necesitas ayuda? <Link to="/ayuda" className="text-blue-600 hover:underline">Contacta a soporte</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SimpleTeleconsultationPage;