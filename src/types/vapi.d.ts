declare module '@vapi-ai/web' {
  interface VapiOptions {
    publicKey: string;
    baseUrl?: string;
  }

  type VapiEvent = 'call-start' | 'call-end' | 'error';
  type VapiEventHandler = (data?: unknown) => void;

  export default class Vapi {
    constructor(publicKey: string, baseUrl?: string);
    
    on(event: VapiEvent, handler: VapiEventHandler): void;
    off(event: VapiEvent, handler: VapiEventHandler): void;
    
    start(assistantId: string): Promise<void>;
    stop(): void;
  }
}
