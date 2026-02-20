import { useState, useCallback, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

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

export const useVapi = (config: VapiConfig): UseVapiReturn => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [state, setState] = useState<VapiState>({
    isSessionActive: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const vapiInstance = new Vapi(config.publicKey, config.baseUrl);
    setVapi(vapiInstance);

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
  }, [config.publicKey, config.baseUrl]);

  const startCall = useCallback(async (): Promise<void> => {
    if (!vapi) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await vapi.start(config.assistantId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [vapi, config.assistantId]);

  const endCall = useCallback((): void => {
    if (!vapi) return;
    vapi.stop();
  }, [vapi]);

  return {
    startCall,
    endCall,
    ...state,
  };
};

export default useVapi;
