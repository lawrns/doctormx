import { useState, useCallback, useEffect, useRef } from 'react';

interface VapiConfig {
  publicKey: string;
  baseUrl?: string;
  assistantId: string;
}

interface VapiState {
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseVapiReturn extends VapiState {
  startCall: () => Promise<void>;
  endCall: () => void;
}

// Dynamically import Vapi to avoid build errors when package is not installed
let VapiModule: typeof import('@vapi-ai/web').default | null = null;

export const useVapi = (config: VapiConfig): UseVapiReturn => {
  const vapiRef = useRef<import('@vapi-ai/web').default | null>(null);
  const [state, setState] = useState<VapiState>({
    isSessionActive: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Lazy load Vapi only on client side
    const initVapi = async () => {
      try {
        if (!VapiModule) {
          const mod = await import('@vapi-ai/web');
          VapiModule = mod.default;
        }
        
        const Vapi = VapiModule;
        if (!Vapi) {
          setState(prev => ({ ...prev, error: 'Vapi not available' }));
          return;
        }
        
        const vapiInstance = new Vapi(config.publicKey, config.baseUrl);
        vapiRef.current = vapiInstance;

        const handleCallStart = (): void => {
          setState(prev => ({ ...prev, isSessionActive: true, isLoading: false }));
        };

        const handleCallEnd = (): void => {
          setState(prev => ({ ...prev, isSessionActive: false, isLoading: false }));
        };

        const handleError = (error: unknown): void => {
          const message = error instanceof Error ? error.message : String(error);
          setState(prev => ({ ...prev, error: message, isLoading: false }));
        };

        vapiInstance.on('call-start', handleCallStart);
        vapiInstance.on('call-end', handleCallEnd);
        vapiInstance.on('error', handleError);

        return () => {
          vapiInstance.off('call-start', handleCallStart);
          vapiInstance.off('call-end', handleCallEnd);
          vapiInstance.off('error', handleError);
        };
      } catch (err) {
        setState(prev => ({ ...prev, error: 'Failed to load Vapi' }));
      }
    };

    initVapi();
  }, [config.publicKey, config.baseUrl]);

  const startCall = useCallback(async (): Promise<void> => {
    if (!vapiRef.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await vapiRef.current.start(config.assistantId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [config.assistantId]);

  const endCall = useCallback((): void => {
    if (!vapiRef.current) return;
    vapiRef.current.stop();
  }, []);

  return {
    startCall,
    endCall,
    ...state,
  };
};

export default useVapi;
