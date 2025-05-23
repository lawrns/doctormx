import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';

const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMessage, getLastMessage, setMetadata, metadata, startSession } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message
    addMessage({
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
    });

    try {
      const lastBot = getLastMessage();
      
      // Handle onboarding flow
      if (lastBot?.id === 'sys-onboard-1') {
        await handleAgeAndSexInput(userText);
      } else if (lastBot?.id === 'sys-onboard-2' && metadata.age && metadata.sex) {
        await handleSymptomsInput(userText);
      } else {
        // Regular chat flow
        await handleRegularChat(userText);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage({
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAgeAndSexInput = async (userText: string) => {
    // Parse age and sex with regex
    const match = userText.match(/(\d{1,3})\s*(años?|yo)?\s*(hombre|mujer|otro|masculino|femenino)/i);
    
    if (match) {
      const age = match[1];
      const sex = match[3].toLowerCase();
      
      // Normalize sex values
      const normalizedSex = sex === 'masculino' || sex === 'hombre' ? 'hombre' :
                           sex === 'femenino' || sex === 'mujer' ? 'mujer' : 'otro';
      
      setMetadata({ age, sex: normalizedSex });
      
      // Delay for natural conversation feel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      addMessage({
        id: 'sys-onboard-2',
        sender: 'bot',
        text: 'Entendido. Ahora descríbeme tus síntomas o puedes subir una foto si es algo visible.',
      });
    } else {
      // Ask for clarification
      await new Promise(resolve => setTimeout(resolve, 600));
      addMessage({
        id: `clarify-${Date.now()}`,
        sender: 'bot',
        text: 'Por favor, dime tu edad y sexo. Por ejemplo: "25 años, mujer" o "30 hombre".',
      });
    }
  };

  const handleSymptomsInput = async (userText: string) => {
    // Store symptoms
    setMetadata({ symptoms: userText });
    
    // Start AI session
    startSession();
    
    // Build comprehensive prompt for AI
    const systemPrompt = `Paciente de ${metadata.age} años, sexo ${metadata.sex}. Síntomas: ${userText}`;
    
    // Delay for typing indicator
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // For now, provide a structured response
    // TODO: Replace with actual AI integration
    addMessage({
      id: `ai-response-${Date.now()}`,
      sender: 'bot',
      text: `Gracias por la información. Como médico virtual, basándome en que eres ${metadata.sex} de ${metadata.age} años con estos síntomas: "${userText}", te voy a hacer algunas preguntas adicionales para poder ayudarte mejor. ¿Hace cuánto tiempo comenzaron estos síntomas?`,
    });
  };

  const handleRegularChat = async (userText: string) => {
    // Regular AI chat flow
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Integrate with actual AI service
    addMessage({
      id: `ai-${Date.now()}`,
      sender: 'bot',
      text: 'Entiendo. Déjame analizar esa información y te daré una respuesta más detallada.',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          {isProcessing ? '...' : 'Enviar'}
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 