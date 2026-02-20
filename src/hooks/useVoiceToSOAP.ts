/**
 * Voice-to-SOAP Dictation System
 * Converts doctor's speech into structured SOAP notes using Web Speech API + AI
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/lib/observability/logger';

// ============================================================================
// TYPES
// ============================================================================

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface VoiceDictationState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  soapNote: Partial<SOAPNote>;
  error: string | null;
  confidence: number;
}

interface VoiceCommand {
  command: string;
  action: 'section' | 'field' | 'action' | 'punctuation';
  target?: string;
  value?: string;
}

// ============================================================================
// VOICE COMMANDS FOR SOAP
// ============================================================================

const SOAP_COMMANDS: VoiceCommand[] = [
  { command: 'sección subjetiva', action: 'section', target: 'subjective' },
  { command: 'subjetivo', action: 'section', target: 'subjective' },
  { command: 'sección objetiva', action: 'section', target: 'objective' },
  { command: 'objetivo', action: 'section', target: 'objective' },
  { command: 'sección análisis', action: 'section', target: 'assessment' },
  { command: 'análisis', action: 'section', target: 'assessment' },
  { command: 'sección plan', action: 'section', target: 'plan' },
  { command: 'plan de tratamiento', action: 'section', target: 'plan' },
  { command: 'nueva línea', action: 'punctuation', value: '\n' },
  { command: 'punto y aparte', action: 'punctuation', value: '.\n' },
  { command: 'coma', action: 'punctuation', value: ',' },
  { command: 'punto', action: 'punctuation', value: '.' },
  { command: 'guardar nota', action: 'action', value: 'save' },
  { command: 'borrar todo', action: 'action', value: 'clear' },
  { command: 'deshacer', action: 'action', value: 'undo' },
];

// ============================================================================
// SPEECH RECOGNITION HOOK
// ============================================================================

export function useVoiceToSOAP() {
  const [state, setState] = useState<VoiceDictationState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    soapNote: {},
    error: null,
    confidence: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentSectionRef = useRef<keyof SOAPNote>('subjective');

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported in this browser' }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX'; // Mexican Spanish

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let lastConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        lastConfidence = event.results[i][0].confidence;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          processCommand(transcript.trim().toLowerCase());
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setState(prev => ({
          ...prev,
          transcript: prev.transcript + finalTranscript,
          confidence: lastConfidence,
        }));
      }

      setState(prev => ({
        ...prev,
        interimTranscript,
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setState(prev => ({
        ...prev,
        error: `Speech recognition error: ${event.error}`,
        isListening: false,
      }));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  // Process voice commands
  const processCommand = useCallback((text: string) => {
    // Check for section commands
    for (const cmd of SOAP_COMMANDS) {
      if (text.includes(cmd.command)) {
        if (cmd.action === 'section' && cmd.target) {
          currentSectionRef.current = cmd.target as keyof SOAPNote;
          // Finalize current section if exists
          finalizeCurrentSection();
        } else if (cmd.action === 'punctuation' && cmd.value) {
          appendToCurrentSection(cmd.value);
        } else if (cmd.action === 'action' && cmd.value === 'save') {
          finalizeCurrentSection();
        }
        return;
      }
    }

    // If no command, append to current section
    appendToCurrentSection(text + ' ');
  }, []);

  const appendToCurrentSection = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      soapNote: {
        ...prev.soapNote,
        [currentSectionRef.current]: (prev.soapNote[currentSectionRef.current] ?? '') + text,
      },
    }));
  }, []);

  const finalizeCurrentSection = useCallback(() => {
    // Could trigger AI processing here
    processWithAI();
  }, []);

  // AI processing to structure the note
  const processWithAI = useCallback(async () => {
    const { soapNote } = state;
    
    // Only process if we have substantial content
    const totalLength = Object.values(soapNote).join('').length;
    if (totalLength < 50) return;

    try {
      const response = await fetch('/api/ai/structure-soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: state.transcript, currentSOAP: soapNote }),
      });

      if (response.ok) {
        const structured = await response.json();
        setState(prev => ({
          ...prev,
          soapNote: { ...prev.soapNote, ...structured },
        }));
      }
    } catch (error) {
      logger.error('AI structuring failed', { error });
    }
  }, [state.transcript, state.soapNote]);

  // Control methods
  const startListening = useCallback(() => {
    recognitionRef.current?.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    finalizeCurrentSection();
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      soapNote: {},
    }));
  }, []);

  const updateSOAPNote = useCallback((section: keyof SOAPNote, value: string) => {
    setState(prev => ({
      ...prev,
      soapNote: { ...prev.soapNote, [section]: value },
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    updateSOAPNote,
    currentSection: currentSectionRef.current,
  };
}

// ============================================================================
// VOICE COMMANDS REFERENCE
// ============================================================================

export const VOICE_COMMANDS_HELP = {
  sections: [
    { command: 'Subjetivo / Sección subjetiva', description: 'Cambiar a sección subjetiva' },
    { command: 'Objetivo / Sección objetiva', description: 'Cambiar a sección objetiva' },
    { command: 'Análisis / Sección análisis', description: 'Cambiar a sección de análisis' },
    { command: 'Plan / Plan de tratamiento', description: 'Cambiar a sección de plan' },
  ],
  formatting: [
    { command: 'Nueva línea', description: 'Insertar salto de línea' },
    { command: 'Punto y aparte', description: 'Punto seguido de nueva línea' },
    { command: 'Coma', description: 'Insertar coma' },
    { command: 'Punto', description: 'Insertar punto' },
  ],
  actions: [
    { command: 'Guardar nota', description: 'Guardar y finalizar la nota' },
    { command: 'Borrar todo', description: 'Limpiar todo el contenido' },
    { command: 'Deshacer', description: 'Deshacer último cambio' },
  ],
};

// ============================================================================
// TYPESCRIPT DECLARATIONS
// ============================================================================

// ============================================================================
// TYPESCRIPT DECLARATIONS FOR SPEECH RECOGNITION
// ============================================================================

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList | null;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechGrammarList {
  length: number;
  addFromString: (string: string, weight?: number) => void;
  addFromURI: (src: string, weight?: number) => void;
  item(index: number): SpeechGrammar | null;
  [index: number]: SpeechGrammar;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
