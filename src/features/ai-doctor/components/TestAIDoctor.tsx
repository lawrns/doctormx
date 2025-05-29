import React, { useState } from 'react';
import { useConversation } from '../../../contexts/ConversationContext';

/**
 * MINIMAL TEST COMPONENT
 * 
 * This is a simplified version to test if the conversation context is working
 * and to isolate the white screen issue.
 */
function TestAIDoctor() {
  const { state: conversationState, addMessage } = useConversation();
  const { messages } = conversationState;
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    addMessage({
      text: input,
      sender: 'user'
    });

    // Add simple bot response
    setTimeout(() => {
      addMessage({
        text: `Echo: ${input}`,
        sender: 'bot'
      });
    }, 1000);

    setInput('');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-teal-600 text-white p-4">
        <h1 className="text-xl font-bold">Test AI Doctor</h1>
        <p className="text-sm opacity-90">Minimal test to verify conversation context</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg max-w-xs ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            <p className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a test message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestAIDoctor;
