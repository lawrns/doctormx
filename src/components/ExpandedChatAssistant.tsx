import { User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { SocialIcons } from './icons/IconProvider';
import { X, Send, User, Shield, Calendar, Video, Clock, AlertCircle } from './icons/IconProvider';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  severity?: number;
  isEmergency?: boolean;
};

type ExpandedChatAssistantProps = {
  onClose: () => void;
};

function ExpandedChatAssistant({ onClose }: ExpandedChatAssistantProps) {
  const [activeTab, setActiveTab] = useState('symptomChecker');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: '¡Hola! Soy tu asistente virtual de Doctor.mx. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [severityLevel, setSeverityLevel] = useState(10);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { 
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }];
    setMessages(newMessages);
    setInput('');
    
    // Check for emergency keywords
    if (input.toLowerCase().includes('dolor en el pecho') || 
        input.toLowerCase().includes('no puedo respirar')) {
      setSeverityLevel(90);
      
      setTimeout(() => {
        setMessages([...newMessages, { 
          id: (Date.now() + 1).toString(),
          text: '🚨 Detecto síntomas que podrían indicar una emergencia médica. Necesitas atención inmediata.',
          sender: 'bot',
          timestamp: new Date(),
          isEmergency: true
        }]);
      }, 1000);
      return;
    }
    
    // Update severity based on symptoms
    if (input.toLowerCase().includes('dolor de cabeza')) {
      setSeverityLevel(30);
    } else if (input.toLowerCase().includes('fiebre')) {
      setSeverityLevel(40);
    }
    
    // Automated response
    setTimeout(() => {
      let responseText = 'Gracias por compartir esa información. Para entender mejor tu situación, ¿podrías darme más detalles?';
      
      if (input.toLowerCase().includes('dolor de cabeza')) {
        responseText = 'Entiendo que tienes dolor de cabeza. ¿Podrías decirme desde cuándo lo tienes y si hay otros síntomas como náuseas o sensibilidad a la luz?';
      } else if (input.toLowerCase().includes('fiebre')) {
        responseText = 'La fiebre puede ser síntoma de varias condiciones. ¿Qué temperatura has registrado y desde cuándo la tienes?';
      }
      
      setMessages([...newMessages, { 
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }, 1000);
  };

  const getSeverityColor = () => {
    if (severityLevel < 30) return 'bg-green-500';
    if (severityLevel < 60) return 'bg-yellow-500';
    if (severityLevel < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 p-4 text-white shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Doctor.mx</h1>
          </div>
          <button 
            onClick={onClose}
            className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
          >
            Mi cuenta
          </button>
        </div>
      </header>
      
      {/* Alert banner */}
      <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-2">
        <div className="flex items-center text-yellow-800">
          <p className="text-sm font-medium">
            Hay un aumento de casos de influenza en CDMX. Considera vacunarte.
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
            <h2 className="font-bold text-lg text-gray-800">Mi Asistente de Salud</h2>
            <p className="text-sm text-gray-600">Análisis médico en tiempo real</p>
            
            {/* Severity meter */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Nivel de atención</span>
                <span className="font-medium">
                  {severityLevel < 30 ? 'Bajo riesgo' : 
                   severityLevel < 60 ? 'Atención recomendada' : 
                   severityLevel < 80 ? 'Urgente' : 'Emergencia'}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getSeverityColor()}`} 
                  style={{ width: `${severityLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'symptomChecker' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('symptomChecker')}
                >
                  Evaluación de Síntomas
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'teleHealth' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('teleHealth')}
                >
                  Telemedicina
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'healthData' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('healthData')}
                >
                  Mis Datos de Salud
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'appointments' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Mis Citas
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Plan Premium</h3>
              <p className="text-xs text-blue-600 mb-3">Accede a consultas ilimitadas</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg">
                Actualizar ahora
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col bg-white">
          <div className="px-6 py-4 border-b border-gray-200 bg-white z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'symptomChecker' && 'Evaluación de Síntomas'}
                {activeTab === 'teleHealth' && 'Consulta por Telemedicina'}
                {activeTab === 'healthData' && 'Mis Datos de Salud'}
                {activeTab === 'appointments' && 'Mis Citas Médicas'}
              </h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {activeTab === 'symptomChecker' && (
              <div className="flex flex-col h-full">
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-lg px-4 py-2 max-w-md ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : message.isEmergency
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className="flex items-center mb-1">
                          {message.sender === 'bot' ? (
                            <SocialIcons.Bot size={16} className="mr-1 text-blue-600" />
                          ) : (
                            <UserIcon size={16} className="mr-1 text-white" />
                          )}
                          <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {message.isEmergency ? (
                          <div>
                            <div className="flex items-center mb-2">
                              <AlertCircle size={16} className="text-red-600 mr-1" />
                              <span className="font-bold">Emergencia Médica</span>
                            </div>
                            <p>{message.text}</p>
                          </div>
                        ) : (
                          <p>{message.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Input area */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Describe tus síntomas o haz una pregunta..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={handleSend}
                      className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'healthData' && (
              <div className="p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-gray-800">Cuestionario de Salud</h3>
                    <div className="text-sm text-gray-500">
                      La información proporcionada ayudará a brindarte una mejor atención
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form>
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-blue-700 mb-4">Datos Personales</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha de nacimiento
                            </label>
                            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Género
                            </label>
                            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                              <option>Seleccionar</option>
                              <option>Masculino</option>
                              <option>Femenino</option>
                              <option>Otro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Altura (cm)
                            </label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="170" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Peso (kg)
                            </label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="70" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <button type="button" className="text-blue-600 hover:text-blue-800 font-medium">
                          Guardar como borrador
                        </button>
                        <div className="space-x-3">
                          <button type="button" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg">
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Trust badges footer */}
      <footer className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex justify-center space-x-8 mb-3">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Certificado por</div>
            <div className="font-bold text-gray-800">COFEPRIS</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Avalado por</div>
            <div className="font-bold text-gray-800">+1,200 Médicos</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Protegido con</div>
            <div className="font-bold text-gray-800">SSL 256-bit</div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500">
          © 2023 Doctor.mx - Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}

export default ExpandedChatAssistant;