import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Share, 
  MessageSquare, 
  FileText, 
  FilePlus,
  Clipboard,
  Layout,
  Users,
  Settings,
  AlertCircle,
  Camera,
  Monitor,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Card, Button, Tabs, TabsContent, TabsList, TabsTrigger, Input } from '../ui';

interface EnhancedTelemedicineConsoleProps {
  patientName: string;
  appointmentTime?: Date;
  appointmentDuration?: number; // in minutes
  onEndCall?: () => void;
  onStartRecord?: () => void;
  onStopRecord?: () => void;
  onShareScreen?: () => void;
  onSendMessage?: (message: string) => void;
  onSendPrescription?: (prescription: any) => void;
  onViewPatientRecord?: () => void;
}

interface Message {
  id: string;
  sender: 'doctor' | 'patient';
  content: string;
  timestamp: Date;
}

const EnhancedTelemedicineConsole: React.FC<EnhancedTelemedicineConsoleProps> = ({
  patientName,
  appointmentTime = new Date(),
  appointmentDuration = 30,
  onEndCall,
  onStartRecord,
  onStopRecord,
  onShareScreen,
  onSendMessage,
  onSendPrescription,
  onViewPatientRecord
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [waitingPatients, setWaitingPatients] = useState<string[]>(['Carlos González', 'Ana López']);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const patientVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Mock patient video (would be replaced with WebRTC implementation)
  useEffect(() => {
    if (patientVideoRef.current) {
      // In a real implementation, this would connect to the patient's video feed
      // For now, just display a placeholder color
    }
  }, []);
  
  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // In a real implementation, this would enable/disable the video track
  };
  
  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // In a real implementation, this would enable/disable the audio track
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      onStopRecord?.();
    } else {
      setIsRecording(true);
      onStartRecord?.();
    }
  };
  
  const toggleScreenShare = () => {
    setIsSharing(!isSharing);
    onShareScreen?.();
  };
  
  const handleEndCall = () => {
    onEndCall?.();
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'doctor',
      content: message,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    onSendMessage?.(message);
    setMessage('');
  };
  
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
      {/* Main video area */}
      <div className="lg:col-span-3 flex flex-col">
        <div className="relative bg-gray-900 rounded-lg aspect-video mb-4">
          {/* Patient video (main) */}
          <div className={`w-full h-full ${isVideoOn ? '' : 'bg-gray-800'}`}>
            <video 
              ref={patientVideoRef}
              autoPlay 
              muted 
              className={`w-full h-full rounded-lg ${!isVideoOn ? 'invisible' : ''}`}
            />
            
            {/* Patient name overlay */}
            <div className="absolute bottom-4 left-4 bg-gray-900/70 text-white px-3 py-1 rounded-md flex items-center">
              <div className="mr-2 w-3 h-3 rounded-full bg-green-500"></div>
              {patientName}
            </div>
            
            {/* Doctor video (pip) */}
            <div className="absolute top-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden border-2 border-white">
              <video 
                ref={videoRef}
                autoPlay 
                muted 
                className={`w-full h-full bg-gray-700 ${!isVideoOn ? 'invisible' : ''}`}
              />
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-white">
                  <VideoOff size={24} />
                </div>
              )}
            </div>
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-md">
                <div className="w-3 h-3 rounded-full bg-white mr-2 animate-pulse"></div>
                Grabando
              </div>
            )}
            
            {/* Call duration */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/70 text-white px-3 py-1 rounded-md flex items-center">
              <Clock size={16} className="mr-2" />
              {formatElapsedTime()}
            </div>
          </div>
        </div>
        
        {/* Call controls */}
        <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={isVideoOn ? 'outline' : 'default'}
              size="sm"
              icon={isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              onClick={toggleVideo}
              className={!isVideoOn ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            >
              {isVideoOn ? 'Video' : 'Sin video'}
            </Button>
            
            <Button
              variant={isAudioOn ? 'outline' : 'default'}
              size="sm"
              icon={isAudioOn ? <Mic size={18} /> : <MicOff size={18} />}
              onClick={toggleAudio}
              className={!isAudioOn ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            >
              {isAudioOn ? 'Audio' : 'Silencio'}
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={isRecording ? 'default' : 'outline'}
              size="sm"
              icon={<Camera size={18} />}
              onClick={toggleRecording}
              className={isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            >
              {isRecording ? 'Detener' : 'Grabar'}
            </Button>
            
            <Button
              variant={isSharing ? 'default' : 'outline'}
              size="sm"
              icon={<Monitor size={18} />}
              onClick={toggleScreenShare}
              className={isSharing ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
            >
              {isSharing ? 'Dejar de compartir' : 'Compartir pantalla'}
            </Button>
            
            <Button
              variant="default"
              size="sm"
              icon={<FilePlus size={18} />}
              onClick={onSendPrescription}
            >
              Recetar
            </Button>
            
            <Button
              variant="default"
              size="sm"
              icon={<FileText size={18} />}
              onClick={onViewPatientRecord}
            >
              Expediente
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            icon={<Phone size={18} />}
            onClick={handleEndCall}
          >
            Finalizar
          </Button>
        </div>
      </div>
      
      {/* Right sidebar - Chat & Notes */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
            <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="chat" className="rounded-md">
                Chat
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-md">
                Notas
              </TabsTrigger>
              <TabsTrigger value="waiting" className="rounded-md">
                Sala
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 px-2 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No hay mensajes aún</p>
                    <p className="text-sm text-gray-400">Los mensajes se mostrarán aquí</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`max-w-[85%] p-3 rounded-lg ${
                        msg.sender === 'doctor' 
                          ? 'bg-blue-100 text-blue-900 ml-auto rounded-br-none' 
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs ${msg.sender === 'doctor' ? 'text-blue-700' : 'text-gray-500'} mt-1 text-right`}>
                        {formatMessageTime(msg.timestamp)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-auto">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="flex-1 flex flex-col mt-4">
              <textarea
                className="flex-1 border border-gray-200 rounded-lg p-3 resize-none"
                placeholder="Toma notas durante la consulta..."
              ></textarea>
              
              <div className="mt-3 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Clipboard size={16} />}
                >
                  Plantillas
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                >
                  Guardar notas
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="waiting" className="flex-1 mt-4">
              <h3 className="text-lg font-medium mb-3">Sala de espera</h3>
              
              {waitingPatients.length > 0 ? (
                <div className="space-y-3">
                  {waitingPatients.map((name, index) => (
                    <Card key={index} className="p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{name}</p>
                            <p className="text-xs text-gray-500">
                              En espera desde hace {10 + index * 5} min
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<MessageSquare size={16} />}
                            title="Enviar mensaje"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<MoreVertical size={16} />}
                            title="Más opciones"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No hay pacientes en espera</p>
                </div>
              )}
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  icon={<Layout size={16} />}
                >
                  Gestionar sala de espera
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedTelemedicineConsole;