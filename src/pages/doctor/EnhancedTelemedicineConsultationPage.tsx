import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Input,
  Textarea
} from '../../components/ui';
import { AlertTriangle, Calendar, Camera, Check, Clock, Download, FileText, Info, Layout, Mail, MessageSquare, Mic, MicOff, Paperclip, Phone, PlusCircle, Save, ScreenShare, Send, Settings, Share2, User, Users, Video, VideoOff, X } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  profileImage?: string;
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
}

interface Appointment {
  id: string;
  patientId: string;
  date: Date;
  time: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  reason: string;
}

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: Date;
  read: boolean;
  files?: { name: string; url: string; type: string }[];
}

interface MedicalNote {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  shared: boolean;
}

const EnhancedTelemedicineConsultationPage: React.FC = () => {
  const { doctorId, doctorName } = useAuth();
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromQuery = queryParams.get('patientId');
  
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // State
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState('consultation');
  
  // Video call state
  const [callStatus, setCallStatus] = useState<'waiting' | 'connecting' | 'connected' | 'ended'>('waiting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // Medical notes state
  const [medicalNotes, setMedicalNotes] = useState<MedicalNote[]>([]);
  const [currentNote, setCurrentNote] = useState<MedicalNote>({
    id: '',
    title: '',
    content: '',
    timestamp: new Date(),
    shared: false
  });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  
  // Fetch appointment and patient data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          const patientId = patientIdFromQuery || 'pat_1';
          
          // Mock patient data
          const mockPatient: Patient = {
            id: patientId,
            name: 'María López García',
            age: 36,
            gender: 'female',
            email: 'maria.lopez@example.com',
            phone: '+52 55 1234 5678',
            profileImage: '',
            medicalHistory: [
              'Hipertensión arterial desde 2018',
              'Diabetes tipo 2 diagnosticada en 2020',
              'Cirugía de apendicectomía en 2010'
            ],
            allergies: ['Penicilina', 'Sulfas'],
            medications: ['Metformina 850mg BID', 'Losartán 50mg QD']
          };
          
          // Mock appointment data
          const mockAppointment: Appointment = {
            id: appointmentId || 'app_1',
            patientId: patientId,
            date: new Date(),
            time: '10:00',
            duration: 30,
            status: 'scheduled',
            reason: 'Consulta de seguimiento para control de diabetes e hipertensión'
          };
          
          // Mock chat messages
          const mockChatMessages: ChatMessage[] = [
            {
              id: 'msg_1',
              sender: 'doctor',
              text: 'Hola María, bienvenida a la consulta. ¿Cómo se ha sentido desde nuestra última cita?',
              timestamp: new Date(Date.now() - 5 * 60000),
              read: true
            },
            {
              id: 'msg_2',
              sender: 'patient',
              text: 'Hola doctor. Me he sentido mejor con los medicamentos, pero he tenido un poco de dolor de cabeza en las mañanas.',
              timestamp: new Date(Date.now() - 4 * 60000),
              read: true
            },
            {
              id: 'msg_3',
              sender: 'doctor',
              text: '¿Con qué frecuencia tiene estos dolores de cabeza? ¿Ha notado si están relacionados con la toma de medicamentos?',
              timestamp: new Date(Date.now() - 3 * 60000),
              read: true
            },
            {
              id: 'msg_4',
              sender: 'patient',
              text: 'Generalmente son por la mañana, casi todos los días. No estoy segura si coincide con los medicamentos, pero podría ser. También adjunto las fotos de los medicamentos que estoy tomando.',
              timestamp: new Date(Date.now() - 2 * 60000),
              read: true,
              files: [
                {
                  name: 'medicamentos.jpg',
                  url: '/mock-images/medicamentos.jpg',
                  type: 'image/jpeg'
                }
              ]
            }
          ];
          
          // Mock medical notes
          const mockMedicalNotes: MedicalNote[] = [
            {
              id: 'note_1',
              title: 'Consulta previa - 15/02/2023',
              content: 'Paciente acude a control de diabetes e hipertensión. Presión arterial: 130/85 mmHg. Glucosa en ayunas: 135 mg/dL. Mantiene tratamiento con Metformina 850mg BID y Losartán 50mg QD. Buen control de patologías de base.',
              timestamp: new Date('2023-02-15T10:30:00'),
              shared: true
            }
          ];
          
          setPatient(mockPatient);
          setAppointment(mockAppointment);
          setChatMessages(mockChatMessages);
          setMedicalNotes(mockMedicalNotes);
          setCurrentNote({
            id: `note_${Date.now()}`,
            title: `Consulta de telemedicina - ${new Date().toLocaleDateString()}`,
            content: '',
            timestamp: new Date(),
            shared: false
          });
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId, patientIdFromQuery, doctorId]);
  
  // Initialize video call
  useEffect(() => {
    const initializeVideoCall = async () => {
      try {
        // Request camera and microphone permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        // Set local stream
        setLocalStream(stream);
        
        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // In a real implementation, establish a WebRTC connection
        // For now, just mock the connection
        setTimeout(() => {
          setCallStatus('connecting');
          
          // Simulate patient joining after 2 seconds
          setTimeout(() => {
            // Use the same stream for demo purposes
            // In a real app, this would be a different stream
            setRemoteStream(stream);
            
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
            
            setCallStatus('connected');
            
            // Start timer
            const timerId = setInterval(() => {
              setElapsedTime(prev => prev + 1);
            }, 1000);
            
            setTimer(timerId);
          }, 2000);
        }, 1000);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Error al acceder a la cámara o micrófono. Por favor verifica los permisos.');
      }
    };
    
    if (!loading && patient) {
      initializeVideoCall();
    }
    
    // Cleanup function
    return () => {
      if (timer) clearInterval(timer);
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [loading, patient]);
  
  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (screenShareEnabled) {
      // Restore camera video
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audioEnabled
        });
        
        // Replace tracks
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Stop old tracks
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        
        setLocalStream(stream);
        setScreenShareEnabled(false);
      } catch (error) {
        console.error('Error restoring video:', error);
      }
    } else {
      // Start screen sharing
      try {
        // @ts-ignore - TypeScript doesn't recognize getDisplayMedia yet
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Add audio track if enabled
        if (localStream && audioEnabled) {
          const audioTrack = localStream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
        }
        
        // Display screen share
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Listen for stream end
        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
        
        // Stop old video tracks
        if (localStream) {
          localStream.getVideoTracks().forEach(track => track.stop());
        }
        
        setLocalStream(stream);
        setScreenShareEnabled(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  };
  
  // End call
  const endCall = () => {
    // Stop timer
    if (timer) clearInterval(timer);
    
    // Stop media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    setCallStatus('ended');
    
    // In a real implementation, close the WebRTC connection
  };
  
  // Send chat message
  const sendMessage = () => {
    if (!messageText.trim() && attachedFiles.length === 0) return;
    
    // Create new message
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'doctor',
      text: messageText,
      timestamp: new Date(),
      read: false
    };
    
    // If there are attached files, add them to the message
    if (attachedFiles.length > 0) {
      newMessage.files = attachedFiles.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file), // In a real app, upload to storage and get URL
        type: file.type
      }));
    }
    
    // Add message to chat
    setChatMessages([...chatMessages, newMessage]);
    
    // Clear input
    setMessageText('');
    setAttachedFiles([]);
    
    // In a real implementation, send the message to the patient
  };
  
  // Handle file attachment
  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(Array.from(e.target.files));
    }
  };
  
  // Add symptom
  const addSymptom = () => {
    if (!symptomInput.trim()) return;
    setSymptoms([...symptoms, symptomInput]);
    setSymptomInput('');
  };
  
  // Remove symptom
  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };
  
  // Save medical note
  const saveMedicalNote = () => {
    // Compile note content
    const noteContent = `
      **Motivo de consulta:** ${appointment?.reason || ''}
      
      **Síntomas:**
      ${symptoms.map(s => `- ${s}`).join('\n')}
      
      **Diagnóstico:**
      ${diagnosis}
      
      **Tratamiento recomendado:**
      ${treatment}
      
      **Seguimiento:**
      ${followUpNeeded ? `Programado para ${followUpDate}` : 'No requerido'}
    `;
    
    // Update current note
    const updatedNote = {
      ...currentNote,
      content: noteContent.trim(),
      timestamp: new Date()
    };
    
    // Add to notes list
    setMedicalNotes([updatedNote, ...medicalNotes]);
    
    // In a real implementation, save to database
    
    alert('Nota médica guardada correctamente');
  };
  
  // Schedule follow-up
  const scheduleFollowUp = () => {
    // In a real implementation, create a new appointment
    // For now, just navigate to the appointments page
    navigate('/doctor-dashboard/appointments/new?patientId=' + patient?.id);
  };
  
  // Create prescription
  const createPrescription = () => {
    navigate(`/doctor-dashboard/prescriptions/new?patientId=${patient?.id}`);
  };
  
  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <DashboardLayout title="Consulta de Telemedicina" loading={loading}>
      {patient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Call Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6 p-4 relative">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  {callStatus === 'waiting' && (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Clock size={14} className="mr-1" />
                      Esperando al paciente...
                    </div>
                  )}
                  
                  {callStatus === 'connecting' && (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <div className="animate-pulse h-2 w-2 bg-blue-600 rounded-full mr-2"></div>
                      Conectando...
                    </div>
                  )}
                  
                  {callStatus === 'connected' && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
                      Conectado - {formatElapsedTime(elapsedTime)}
                    </div>
                  )}
                  
                  {callStatus === 'ended' && (
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <X size={14} className="mr-1" />
                      Llamada finalizada
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  {connectionQuality === 'excellent' && (
                    <div className="text-green-600 flex items-center mr-4">
                      <div className="flex space-x-1">
                        <div className="h-3 w-1 bg-green-600 rounded"></div>
                        <div className="h-4 w-1 bg-green-600 rounded"></div>
                        <div className="h-5 w-1 bg-green-600 rounded"></div>
                      </div>
                      <span className="ml-1 text-xs">Excelente</span>
                    </div>
                  )}
                  
                  {connectionQuality === 'good' && (
                    <div className="text-yellow-600 flex items-center mr-4">
                      <div className="flex space-x-1">
                        <div className="h-3 w-1 bg-yellow-600 rounded"></div>
                        <div className="h-4 w-1 bg-yellow-600 rounded"></div>
                        <div className="h-5 w-1 bg-gray-300 rounded"></div>
                      </div>
                      <span className="ml-1 text-xs">Buena</span>
                    </div>
                  )}
                  
                  {connectionQuality === 'poor' && (
                    <div className="text-red-600 flex items-center mr-4">
                      <div className="flex space-x-1">
                        <div className="h-3 w-1 bg-red-600 rounded"></div>
                        <div className="h-4 w-1 bg-gray-300 rounded"></div>
                        <div className="h-5 w-1 bg-gray-300 rounded"></div>
                      </div>
                      <span className="ml-1 text-xs">Débil</span>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Settings size={16} />}
                  >
                    Configuración
                  </Button>
                </div>
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden h-[400px] lg:h-[500px]">
                {/* Remote Video (Patient) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                ></video>
                
                {callStatus !== 'connected' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
                    <div className="text-center text-white">
                      <User size={64} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold mb-2">{patient.name}</h3>
                      {callStatus === 'waiting' && (
                        <p>Esperando a que el paciente se una a la consulta...</p>
                      )}
                      {callStatus === 'connecting' && (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          <p>Conectando con el paciente...</p>
                        </div>
                      )}
                      {callStatus === 'ended' && (
                        <div>
                          <p className="mb-4">La consulta ha finalizado</p>
                          <Button
                            variant="outline"
                            className="bg-white bg-opacity-20 text-white border-white"
                            onClick={() => navigate('/doctor-dashboard/appointments')}
                          >
                            Volver a Citas
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Local Video (Doctor) */}
                <div className="absolute bottom-4 right-4 w-[160px] h-[120px] rounded-lg overflow-hidden shadow-md border-2 border-white">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  ></video>
                  
                  {!videoEnabled && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <User size={32} className="text-white" />
                    </div>
                  )}
                </div>
                
                {/* Call Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
                  <button
                    className={`rounded-full p-3 ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}
                    onClick={toggleAudio}
                  >
                    {audioEnabled ? (
                      <Mic size={20} className="text-white" />
                    ) : (
                      <MicOff size={20} className="text-white" />
                    )}
                  </button>
                  
                  <button
                    className={`rounded-full p-3 ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}
                    onClick={toggleVideo}
                  >
                    {videoEnabled ? (
                      <Video size={20} className="text-white" />
                    ) : (
                      <VideoOff size={20} className="text-white" />
                    )}
                  </button>
                  
                  <button
                    className={`rounded-full p-3 ${screenShareEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                    onClick={toggleScreenShare}
                  >
                    <ScreenShare size={20} className="text-white" />
                  </button>
                  
                  <button
                    className="rounded-full p-3 bg-red-600 hover:bg-red-700"
                    onClick={endCall}
                  >
                    <Phone size={20} className="text-white transform rotate-135" />
                  </button>
                </div>
              </div>
            </Card>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="consultation">
                  Consulta
                </TabsTrigger>
                <TabsTrigger value="chat">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="notes">
                  Notas Médicas
                </TabsTrigger>
              </TabsList>
              
              {/* Consultation Tab */}
              <TabsContent value="consultation">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Información de la Consulta</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Motivo de la consulta</h3>
                      <p className="text-gray-600 mb-4">{appointment?.reason}</p>
                      
                      <h3 className="font-medium text-gray-700 mb-2">Síntomas</h3>
                      <div className="space-y-3 mb-4">
                        {symptoms.map((symptom, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span>{symptom}</span>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeSymptom(index)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        
                        <div className="flex items-center">
                          <Input 
                            placeholder="Agregar síntoma"
                            value={symptomInput}
                            onChange={(e) => setSymptomInput(e.target.value)}
                            className="mr-2"
                          />
                          <Button
                            variant="outline"
                            onClick={addSymptom}
                            icon={<PlusCircle size={16} />}
                          >
                            Agregar
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-gray-700 mb-2">Diagnóstico</h3>
                      <Textarea
                        placeholder="Escriba el diagnóstico..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        rows={3}
                        className="mb-4"
                      />
                      
                      <h3 className="font-medium text-gray-700 mb-2">Tratamiento recomendado</h3>
                      <Textarea
                        placeholder="Escriba el tratamiento recomendado..."
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        rows={3}
                        className="mb-4"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Seguimiento</h3>
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id="follow-up"
                          checked={followUpNeeded}
                          onChange={(e) => setFollowUpNeeded(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="follow-up">Requiere seguimiento</label>
                      </div>
                      
                      {followUpNeeded && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de seguimiento
                          </label>
                          <Input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="mb-2"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={scheduleFollowUp}
                            icon={<Calendar size={16} />}
                          >
                            Agendar cita de seguimiento
                          </Button>
                        </div>
                      )}
                      
                      <h3 className="font-medium text-gray-700 mb-2">Acciones</h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          icon={<FileText size={16} />}
                          onClick={createPrescription}
                        >
                          Crear receta médica
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          icon={<Layout size={16} />}
                          onClick={() => navigate(`/doctor-dashboard/lab-orders/new?patientId=${patient.id}`)}
                        >
                          Ordenar estudios
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          icon={<Download size={16} />}
                          onClick={() => navigate(`/doctor-dashboard/patients/${patient.id}`)}
                        >
                          Ver expediente completo
                        </Button>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <Button
                          variant="primary"
                          className="w-full"
                          icon={<Save size={16} />}
                          onClick={saveMedicalNote}
                        >
                          Guardar nota médica
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              {/* Chat Tab */}
              <TabsContent value="chat">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Chat con el Paciente</h2>
                  
                  <div className="h-96 overflow-y-auto mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-4 ${
                          message.sender === 'doctor' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'doctor'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          
                          {message.files && message.files.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.files.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center p-2 bg-white rounded border border-gray-200"
                                >
                                  <Paperclip size={16} className="text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-700 truncate flex-1">
                                    {file.name}
                                  </span>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-sm"
                                  >
                                    Ver
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-1 text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-end">
                    <div className="flex-1 mr-2">
                      <Textarea
                        placeholder="Escriba un mensaje..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={2}
                      />
                      
                      {attachedFiles.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium mb-1">Archivos adjuntos:</div>
                          {attachedFiles.map((file, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center">
                              <Paperclip size={14} className="text-gray-400 mr-1" />
                              <span className="truncate">{file.name}</span>
                              <button
                                className="ml-2 text-red-500 hover:text-red-700"
                                onClick={() => {
                                  setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex">
                      <label className="flex items-center justify-center h-10 w-10 bg-gray-200 hover:bg-gray-300 rounded-full cursor-pointer mr-2">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileAttachment}
                          multiple
                        />
                        <Paperclip size={20} className="text-gray-600" />
                      </label>
                      
                      <Button
                        variant="primary"
                        className="rounded-full h-10 w-10 p-0"
                        onClick={sendMessage}
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              {/* Notes Tab */}
              <TabsContent value="notes">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Notas Médicas</h2>
                  
                  <div className="space-y-4">
                    {medicalNotes.map((note) => (
                      <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{note.title}</h3>
                          <div className="flex items-center">
                            {note.shared && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mr-2">
                                Compartida
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {note.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="whitespace-pre-line text-sm text-gray-700 mb-3">
                          {note.content}
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Download size={16} />}
                          >
                            Descargar
                          </Button>
                          
                          {!note.shared && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Share2 size={16} />}
                              onClick={() => {
                                // Mark note as shared
                                const updatedNotes = medicalNotes.map(n => 
                                  n.id === note.id ? { ...n, shared: true } : n
                                );
                                setMedicalNotes(updatedNotes);
                              }}
                            >
                              Compartir con paciente
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {medicalNotes.length === 0 && (
                      <div className="text-center py-8">
                        <FileText size={48} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No hay notas médicas guardadas</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Patient Info Sidebar */}
          <div>
            <Card className="p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                  {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold">{patient.name}</h2>
                  <div className="text-gray-500">
                    {patient.age} años · {patient.gender === 'female' ? 'Femenino' : 'Masculino'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone size={16} className="text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail size={16} className="text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/doctor-dashboard/patients/${patient.id}`)}
                >
                  Ver expediente completo
                </Button>
              </div>
            </Card>
            
            <Card className="p-6 mb-6">
              <h2 className="font-semibold mb-4">Historial médico</h2>
              
              <div className="space-y-4">
                {patient.medicalHistory.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-6 mb-6">
              <h2 className="font-semibold mb-4">Alergias</h2>
              
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {allergy}
                  </span>
                ))}
                
                {patient.allergies.length === 0 && (
                  <p className="text-sm text-gray-500">No se reportan alergias</p>
                )}
              </div>
            </Card>
            
            <Card className="p-6 mb-6">
              <h2 className="font-semibold mb-4">Medicamentos actuales</h2>
              
              <div className="space-y-3">
                {patient.medications.map((medication, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{medication}</p>
                  </div>
                ))}
                
                {patient.medications.length === 0 && (
                  <p className="text-sm text-gray-500">No hay medicamentos registrados</p>
                )}
              </div>
            </Card>
            
            <Card className="p-6 bg-yellow-50">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Información importante</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Recuerde que esta consulta es confidencial y está sujeta a los mismos estándares éticos y legales que una consulta presencial.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 text-blue-600 p-0"
                  >
                    Consultar lineamientos
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnhancedTelemedicineConsultationPage;