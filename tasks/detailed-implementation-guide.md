# DoctorMX Detailed Implementation Guide

This document provides exact code implementations, file modifications, and step-by-step instructions for each task in the upgrade plan.

---

## Phase 1: Remove Modal Wizard System (Priority P0)

### Step 1.1: Delete Wizard Files

**Files to Remove:**
```bash
rm src/pages/wizard/Step1Page.tsx
rm src/pages/wizard/Step2Page.tsx  
rm src/pages/wizard/Step3Page.tsx
rm src/pages/wizard/WizardLayout.tsx
rm src/contexts/WizardContext.tsx
rmdir src/pages/wizard
```

### Step 1.2: Update AILayout.tsx

**File: `src/core/components/AILayout.tsx`**

Remove these imports:
```tsx
// DELETE THESE LINES
import { WizardProvider } from '../../contexts/WizardContext';
import WizardLayout from '../../pages/wizard/WizardLayout';
import Step1Page from '../../pages/wizard/Step1Page';
import Step2Page from '../../pages/wizard/Step2Page';
import Step3Page from '../../pages/wizard/Step3Page';
```

Remove wizard routing logic:
```tsx
// DELETE THIS BLOCK
const isWizard = location.pathname.startsWith('/wizard');

// DELETE WIZARD PROVIDER WRAPPER
// Replace:
<WizardProvider>
  {/* content */}
</WizardProvider>

// With just:
{/* content */}

// DELETE WIZARD ROUTES
{/* Remove entire Routes block for wizard */}
<Routes>
  <Route path="wizard" element={<WizardLayout />}>
    <Route path="step-1" element={<Step1Page />} />
    <Route path="step-2" element={<Step2Page />} />
    <Route path="step-3" element={<Step3Page />} />
  </Route>
</Routes>
```

### Step 1.3: Update AIHomePage.tsx

**File: `src/pages/AIHomePage.tsx`**

Replace wizard links (Line 156 and Line 500):
```tsx
// FIND AND REPLACE
// From:
<Link to="/wizard/step-1" className="block w-full sm:w-auto">
  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200">
    Iniciar consulta gratuita
  </Button>
</Link>

// To:
<button 
  onClick={() => {
    // Will implement chat opening logic
    console.log('Opening chat for onboarding');
  }}
  className="w-full bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
>
  Iniciar consulta gratuita
</button>
```

### Step 1.4: Add Wizard CSS Override

**File: `src/index.css` or `src/styles/globals.css`**

Add at the end:
```css
/* Hide any remaining wizard elements */
.wizard-overlay,
.wizard-modal,
.wizard-step,
.wizard-container {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
```

---

## Phase 2: Implement Inline Chat Onboarding (Priority P0)

### Step 2.1: Create Enhanced Chat Context

**File: `src/contexts/ChatContext.tsx`**

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  metadata?: any;
}

export interface ChatMetadata {
  age?: string;
  sex?: string;
  symptoms?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  metadata: ChatMetadata;
  isOpen: boolean;
  sessionStarted: boolean;
  addMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
  openChat: () => void;
  closeChat: () => void;
  setMetadata: (metadata: ChatMetadata) => void;
  getLastMessage: () => ChatMessage | undefined;
  startSession: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [metadata, setMetadataState] = useState<ChatMetadata>({});
  const [isOpen, setIsOpen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const addMessage = (message: Omit<ChatMessage, 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const openChat = () => {
    setIsOpen(true);
    if (!sessionStarted) {
      addMessage({
        id: 'sys-onboard-1',
        sender: 'bot',
        text: '¡Hola! Soy Dr. Simeon 🤖. Para comenzar, ¿puedes decirme tu edad y sexo?',
      });
    }
  };

  const closeChat = () => setIsOpen(false);

  const setMetadata = (newMetadata: ChatMetadata) => {
    setMetadataState(prev => ({ ...prev, ...newMetadata }));
  };

  const getLastMessage = () => {
    return messages[messages.length - 1];
  };

  const startSession = () => setSessionStarted(true);

  const value: ChatContextType = {
    messages,
    metadata,
    isOpen,
    sessionStarted,
    addMessage,
    openChat,
    closeChat,
    setMetadata,
    getLastMessage,
    startSession,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
```

### Step 2.2: Create Chat Container Component

**File: `src/components/ChatContainer.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const ChatContainer: React.FC = () => {
  const { isOpen } = useChat();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerStyle: React.CSSProperties = {
    width: isMobile ? '100%' : '420px',
    height: '90vh',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)',
    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
    paddingBottom: 'env(safe-area-inset-bottom)', // iOS safe area
  };

  return (
    <div
      className="fixed bottom-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 flex flex-col"
      style={containerStyle}
    >
      {/* Chat Header */}
      <div className="bg-teal-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            🤖
          </div>
          <span className="font-semibold">Dr. Simeon</span>
        </div>
        <button
          onClick={() => useChat().closeChat()}
          className="text-white hover:text-teal-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages />
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-gray-200">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContainer;
```

### Step 2.3: Create Chat Messages Component

**File: `src/components/ChatMessages.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../contexts/ChatContext';

const ChatMessages: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'user'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs opacity-70 ml-2">Dr. Simeon está escribiendo...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
```

### Step 2.4: Create Chat Input with Onboarding Logic

**File: `src/components/ChatInput.tsx`**

```tsx
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
```

### Step 2.5: Update AIHomePage.tsx with Chat Integration

**File: `src/pages/AIHomePage.tsx`**

Add import at the top:
```tsx
import { useChat } from '../contexts/ChatContext';
```

Update the component to use the chat context:
```tsx
const AIHomePage: React.FC = () => {
  const { openChat } = useChat();
  
  // ... existing component code ...

  const handleStartConsultation = () => {
    openChat();
  };

  // ... in JSX, replace the CTA buttons:
  
  <button 
    onClick={handleStartConsultation}
    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
  >
    Iniciar consulta gratuita
  </button>
};
```

### Step 2.6: Add Chat Provider to App Root

**File: `src/App.tsx`**

Wrap the app with ChatProvider:
```tsx
import { ChatProvider } from './contexts/ChatContext';
import ChatContainer from './components/ChatContainer';

function App() {
  return (
    <ChatProvider>
      <div className="App">
        {/* Existing app content */}
        
        {/* Add chat container */}
        <ChatContainer />
      </div>
    </ChatProvider>
  );
}
```

---

## Phase 3: Animation & Timing Implementation

### Step 3.1: Add Chat Container CSS

**File: `src/index.css`**

Add these animations:
```css
/* Chat Container Animations */
.chat-container {
  position: fixed;
  bottom: 0;
  right: 0;
  transform: translateY(100%);
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
  background: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.chat-container.open {
  transform: translateY(0);
}

/* Hero CTA Bounce Animation */
@keyframes cta-bounce {
  0%, 20%, 50%, 80%, 100% { 
    transform: translateY(0); 
  }
  40% { 
    transform: translateY(-6px); 
  }
  60% { 
    transform: translateY(-4px); 
  }
}

.hero-cta-bounce {
  animation: cta-bounce 2s ease-in-out infinite;
}

/* Typing indicator animation */
@keyframes typing-dot {
  0%, 20% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-dot {
  animation: typing-dot 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* Mobile-specific improvements */
@media (max-width: 767px) {
  .chat-container {
    width: 100% !important;
    height: 90vh !important;
    border-radius: 16px 16px 0 0;
  }
}

/* Safe area handling for iOS */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .chat-input-container {
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  }
}
```

### Step 3.2: Add CTA Bounce Animation

**File: `src/pages/AIHomePage.tsx`**

Add bounce effect after page load:
```tsx
import { useEffect } from 'react';

const AIHomePage: React.FC = () => {
  useEffect(() => {
    // Add bounce animation after 5 seconds
    const timer = setTimeout(() => {
      const ctaButton = document.querySelector('.hero-cta-button');
      if (ctaButton) {
        ctaButton.classList.add('hero-cta-bounce');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // ... rest of component

  // In JSX, add the class to the CTA button:
  <button 
    onClick={handleStartConsultation}
    className="hero-cta-button w-full bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
  >
    Iniciar consulta gratuita
  </button>
};
```

---

## Phase 4: Testing Implementation

### Step 4.1: Create Test Files

**File: `src/__tests__/ChatContext.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatProvider, useChat } from '../contexts/ChatContext';

// Test component
const TestComponent = () => {
  const { openChat, addMessage, messages, isOpen } = useChat();
  
  return (
    <div>
      <button onClick={openChat}>Open Chat</button>
      <button onClick={() => addMessage({ id: 'test', sender: 'user', text: 'Test message' })}>
        Add Message
      </button>
      <div>{isOpen ? 'Chat Open' : 'Chat Closed'}</div>
      <div data-testid="message-count">{messages.length}</div>
    </div>
  );
};

describe('ChatContext', () => {
  test('opens chat and adds onboarding message', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    fireEvent.click(screen.getByText('Open Chat'));
    expect(screen.getByText('Chat Open')).toBeInTheDocument();
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
  });

  test('adds user messages correctly', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    fireEvent.click(screen.getByText('Add Message'));
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
  });
});
```

### Step 4.2: E2E Test Scenarios

**File: `cypress/e2e/onboarding-flow.cy.ts`**

```typescript
describe('Onboarding Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('completes full onboarding flow', () => {
    // Click CTA button
    cy.contains('Iniciar consulta gratuita').click();
    
    // Chat should open
    cy.get('[data-testid="chat-container"]').should('be.visible');
    
    // Should see onboarding message
    cy.contains('¿puedes decirme tu edad y sexo?').should('be.visible');
    
    // Enter age and sex
    cy.get('input[placeholder="Escribe tu mensaje..."]').type('25 años, mujer{enter}');
    
    // Should see symptom request
    cy.contains('descríbeme tus síntomas').should('be.visible');
    
    // Enter symptoms
    cy.get('input[placeholder="Escribe tu mensaje..."]').type('dolor de cabeza y fiebre{enter}');
    
    // Should see AI response
    cy.contains('Gracias por la información').should('be.visible');
  });

  it('handles invalid age/sex input gracefully', () => {
    cy.contains('Iniciar consulta gratuita').click();
    cy.get('input[placeholder="Escribe tu mensaje..."]').type('hola{enter}');
    cy.contains('dime tu edad y sexo').should('be.visible');
  });
});
```

### Step 4.3: Responsive Testing

**File: `cypress/e2e/responsive.cy.ts`**

```typescript
describe('Responsive Design', () => {
  const viewports = [
    { width: 360, height: 640, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1440, height: 900, name: 'Desktop' },
    { width: 2560, height: 1440, name: 'Ultra-wide' },
  ];

  viewports.forEach(({ width, height, name }) => {
    it(`works correctly on ${name} (${width}x${height})`, () => {
      cy.viewport(width, height);
      cy.visit('/');
      
      // Test CTA button visibility and functionality
      cy.contains('Iniciar consulta gratuita').should('be.visible').click();
      
      // Test chat container sizing
      cy.get('[data-testid="chat-container"]').then($el => {
        const expectedWidth = width < 768 ? '100%' : '420px';
        expect($el).to.have.css('width', expectedWidth === '100%' ? `${width}px` : '420px');
      });
      
      // Test chat functionality
      cy.get('input[placeholder="Escribe tu mensaje..."]').should('be.visible');
    });
  });
});
```

---

## Phase 5: Performance Optimization

### Step 5.1: Lazy Loading Implementation

**File: `src/components/LazyChat.tsx`**

```tsx
import { lazy, Suspense } from 'react';
import { useChat } from '../contexts/ChatContext';

const ChatContainer = lazy(() => import('./ChatContainer'));

const LazyChat: React.FC = () => {
  const { isOpen } = useChat();

  if (!isOpen) return null;

  return (
    <Suspense fallback={
      <div className="fixed bottom-0 right-0 bg-white shadow-lg w-96 h-96 rounded-t-2xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    }>
      <ChatContainer />
    </Suspense>
  );
};

export default LazyChat;
```

### Step 5.2: Bundle Optimization

**File: `vite.config.js`**

Add code splitting configuration:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'chat-components': [
            './src/components/ChatContainer.tsx',
            './src/components/ChatMessages.tsx',
            './src/components/ChatInput.tsx',
          ],
          'ai-services': [
            './src/services/AIService.ts',
            './src/services/EnhancedAIService.ts',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

---

## Deployment Checklist

### Pre-deployment Steps
- [ ] All wizard components removed
- [ ] No broken imports or references
- [ ] Chat context properly integrated
- [ ] Responsive design tested across viewports
- [ ] Performance metrics meet targets (>90 mobile, >95 desktop)
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed

### Deployment Commands
```bash
# Build and test
npm run build
npm run test
npm run cypress:run

# Deploy to staging
npm run deploy:staging

# After QA approval, deploy to production
npm run deploy:production
```

### Post-deployment Verification
- [ ] Chat opens smoothly on all devices
- [ ] Onboarding flow completes successfully
- [ ] No 404 errors for old wizard URLs
- [ ] Performance monitoring shows no regressions
- [ ] Error tracking shows no new errors

This completes the comprehensive implementation guide for removing the modal wizard and implementing inline chat onboarding in DoctorMX. 