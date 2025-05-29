import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function AIDoctorPageSimple() {
  const location = useLocation();
  const initialMessage = location.state?.initialMessage;
  const [input, setInput] = useState(initialMessage || '');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy Dr. Simeon, tu médico mexicano inteligente. ¿Para quién es la consulta de hoy? Estoy aquí para ayudarte con cualquier problema de salud de tu familia.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    // Simple AI response simulation
    setTimeout(() => {
      let botResponse = '';
      const lowerInput = userInput.toLowerCase();
      
      if (lowerInput.includes('dolor') && lowerInput.includes('cabeza')) {
        botResponse = 'Entiendo que tienes dolor de cabeza. ¿Desde cuándo lo tienes? ¿Es un dolor punzante, opresivo o pulsátil? ¿Has tomado algún medicamento?';
      } else if (lowerInput.includes('fiebre')) {
        botResponse = 'La fiebre es una señal importante. ¿Cuál es tu temperatura actual? ¿Tienes otros síntomas como escalofríos, dolor muscular o malestar general?';
      } else if (lowerInput.includes('estómago') || lowerInput.includes('dolor abdominal')) {
        botResponse = 'El dolor abdominal puede tener varias causas. ¿El dolor es constante o viene y va? ¿Has comido algo inusual recientemente? ¿Dónde sientes exactamente el dolor?';
      } else if (lowerInput.includes('emergencia') || lowerInput.includes('urgente')) {
        botResponse = '🚨 Si es una emergencia médica real, por favor llama al 911 o acude al hospital más cercano inmediatamente. No dudes en buscar atención médica urgente.';
      } else if (lowerInput.includes('tos')) {
        botResponse = 'La tos puede tener diferentes causas. ¿Es tos seca o con flemas? ¿Desde cuándo la tienes? ¿Tienes fiebre o dolor de garganta asociado?';
      } else if (lowerInput.includes('gripe') || lowerInput.includes('resfriado')) {
        botResponse = 'Los síntomas de gripe y resfriado pueden ser similares. ¿Tienes fiebre alta? ¿Dolor de cuerpo? ¿Cuánto tiempo llevas con estos síntomas?';
      } else if (lowerInput.includes('presión') || lowerInput.includes('hipertensión')) {
        botResponse = 'La presión arterial alta es importante monitorear. ¿Te has tomado la presión recientemente? ¿Tienes antecedentes familiares de hipertensión?';
      } else if (lowerInput.includes('diabetes') || lowerInput.includes('azúcar')) {
        botResponse = 'Es importante controlar los niveles de glucosa. ¿Te has hecho estudios recientes? ¿Tienes síntomas como sed excesiva o visión borrosa?';
      } else if (lowerInput.includes('corazón') || lowerInput.includes('pecho')) {
        botResponse = 'El dolor en el pecho requiere atención. ¿Es un dolor opresivo o punzante? ¿Se irradia al brazo o cuello? Si es intenso, busca atención médica inmediata.';
      } else if (lowerInput.includes('hola') || lowerInput.includes('buenos días') || lowerInput.includes('buenas tardes')) {
        botResponse = '¡Hola! Me da gusto saludarte. Soy Dr. Simeon y estoy aquí para ayudarte. ¿Qué síntomas o molestias tienes hoy?';
      } else {
        botResponse = `Gracias por compartir esa información sobre "${userInput}". Para ayudarte mejor, ¿puedes darme más detalles sobre tus síntomas? Por ejemplo, ¿cuándo comenzaron y qué los empeora o mejora?`;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Consultation limit indicator for anonymous users */}
      <div className="bg-gradient-to-r from-[#D0F0EF] to-[#E6F7F5] px-6 py-2 border-b border-[#B8E6E2]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-[#006D77]">
              Consultas gratuitas: 5 de 5
            </span>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-300"
                />
              ))}
            </div>
          </div>
          <a 
            href="/register" 
            className="text-sm font-medium text-[#006D77] hover:text-[#005B66] transition-colors"
          >
            Crear cuenta para más consultas →
          </a>
        </div>
      </div>

      {/* Chat header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 text-[#006D77]">💬</div>
          <h1 className="text-xl font-semibold text-gray-900">Doctor IA - Chat Médico</h1>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-[#006D77] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-500 text-sm">Dr. Simeon está escribiendo...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe tus síntomas..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006D77] focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ➤
          </button>
        </form>
        
        {/* Quick action buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Dolor de cabeza",
            "Fiebre",
            "Dolor de estómago",
            "Tos",
            "Resfriado"
          ].map((symptom) => (
            <button
              key={symptom}
              onClick={() => setInput(symptom)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIDoctorPageSimple;