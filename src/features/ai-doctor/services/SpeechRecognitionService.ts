/**
 * Speech Recognition Service for voice input with transcription
 * Uses the Web Speech API for real-time speech-to-text
 */

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

// TypeScript declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStatusChangeCallback: ((isListening: boolean) => void) | null = null;

  constructor() {
    this.initializeRecognition();
  }

  /**
   * Check if speech recognition is supported in the browser
   */
  static isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Initialize the speech recognition instance
   */
  private initializeRecognition(): void {
    if (!SpeechRecognitionService.isSupported()) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();

    // Configure recognition settings
    this.recognition.continuous = true; // Keep listening until manually stopped
    this.recognition.interimResults = true; // Get results while speaking
    this.recognition.lang = 'es-MX'; // Mexican Spanish
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set up all event handlers for the recognition instance
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isListening = true;
      this.onStatusChangeCallback?.(true);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
      this.onStatusChangeCallback?.(false);
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Send interim results for real-time feedback
      if (interimTranscript) {
        this.onResultCallback?.(interimTranscript, false);
      }

      // Send final results
      if (finalTranscript) {
        this.onResultCallback?.(finalTranscript.trim(), true);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Error al reconocer voz';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No se detectó voz. Por favor, habla más cerca del micrófono.';
          break;
        case 'audio-capture':
          errorMessage = 'No se pudo acceder al micrófono. Verifica los permisos.';
          break;
        case 'not-allowed':
          errorMessage = 'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.';
          break;
        case 'network':
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
          break;
        case 'aborted':
          // User aborted, don't show error
          return;
      }
      
      this.onErrorCallback?.(errorMessage);
      this.stop();
    };

    this.recognition.onnomatch = () => {
      console.log('No speech match found');
      this.onErrorCallback?.('No se pudo entender. Por favor, intenta de nuevo.');
    };

    this.recognition.onspeechend = () => {
      console.log('Speech has stopped being detected');
      // Auto-stop after speech ends
      setTimeout(() => {
        if (this.isListening) {
          this.stop();
        }
      }, 1000);
    };
  }

  /**
   * Start listening for speech
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        resolve();
        return;
      }

      try {
        this.recognition.start();
        resolve();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop listening for speech
   */
  stop(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  /**
   * Abort the current recognition session
   */
  abort(): void {
    if (!this.recognition) return;

    try {
      this.recognition.abort();
    } catch (error) {
      console.error('Error aborting speech recognition:', error);
    }
  }

  /**
   * Set callback for speech recognition results
   */
  onResult(callback: (transcript: string, isFinal: boolean) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for status changes
   */
  onStatusChange(callback: (isListening: boolean) => void): void {
    this.onStatusChangeCallback = callback;
  }

  /**
   * Get current listening status
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.recognition = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStatusChangeCallback = null;
  }
}

// Singleton instance
let speechRecognitionInstance: SpeechRecognitionService | null = null;

export const getSpeechRecognitionService = (): SpeechRecognitionService => {
  if (!speechRecognitionInstance) {
    speechRecognitionInstance = new SpeechRecognitionService();
  }
  return speechRecognitionInstance;
};