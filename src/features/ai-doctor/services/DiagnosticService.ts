/**
 * Diagnostic Service to verify AI integration and debug issues
 */

export interface DiagnosticResult {
  openAIKeyPresent: boolean;
  openAIKeyValid: boolean;
  apiEndpointReachable: boolean;
  responseTime: number;
  lastError: string | null;
  testResponse: string | null;
  recommendations: string[];
}

export class DiagnosticService {
  private static readonly OPENAI_KEY_STORAGE = 'openai_api_key';
  
  /**
   * Run full diagnostic check on AI integration
   */
  static async runDiagnostics(): Promise<DiagnosticResult> {
    const result: DiagnosticResult = {
      openAIKeyPresent: false,
      openAIKeyValid: false,
      apiEndpointReachable: false,
      responseTime: 0,
      lastError: null,
      testResponse: null,
      recommendations: []
    };
    
    try {
      // Check 1: API Key presence
      const apiKey = localStorage.getItem(this.OPENAI_KEY_STORAGE) || 
                    import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        result.recommendations.push('No API key found. Please configure OpenAI API key.');
        return result;
      }
      
      result.openAIKeyPresent = true;
      
      // Check 2: API Key format
      if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
        result.recommendations.push('API key format appears invalid.');
        return result;
      }
      
      // Check 3: Test API call
      const startTime = Date.now();
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a diagnostic test. Reply with exactly: "API working correctly"'
              },
              {
                role: 'user',
                content: 'Test'
              }
            ],
            max_tokens: 50,
            temperature: 0
          })
        });
        
        result.responseTime = Date.now() - startTime;
        
        if (!response.ok) {
          const error = await response.json();
          result.lastError = error.error?.message || `HTTP ${response.status}`;
          
          if (response.status === 401) {
            result.recommendations.push('API key is invalid or expired.');
          } else if (response.status === 429) {
            result.recommendations.push('Rate limit exceeded. Wait a moment.');
          } else {
            result.recommendations.push(`API error: ${result.lastError}`);
          }
          
          return result;
        }
        
        result.apiEndpointReachable = true;
        result.openAIKeyValid = true;
        
        const data = await response.json();
        result.testResponse = data.choices?.[0]?.message?.content || 'No response';
        
        if (result.testResponse === 'API working correctly') {
          result.recommendations.push('✅ OpenAI integration working perfectly!');
        } else {
          result.recommendations.push('API responding but with unexpected content.');
        }
        
      } catch (networkError) {
        result.lastError = networkError.message;
        result.recommendations.push('Network error - check internet connection.');
      }
      
    } catch (error) {
      result.lastError = error.message;
      result.recommendations.push('Unexpected error during diagnostics.');
    }
    
    // Additional recommendations based on response time
    if (result.responseTime > 3000) {
      result.recommendations.push('Response time is slow. Consider using streaming.');
    }
    
    return result;
  }
  
  /**
   * Log AI request/response for debugging
   */
  static logAPICall(
    request: any,
    response: any,
    duration: number,
    error?: any
  ): void {
    const log = {
      timestamp: new Date().toISOString(),
      duration,
      request: {
        messages: request.messages?.length || 0,
        model: request.model,
        temperature: request.temperature
      },
      response: error ? null : {
        content: response.choices?.[0]?.message?.content?.substring(0, 100) + '...',
        tokensUsed: response.usage?.total_tokens
      },
      error: error ? {
        message: error.message,
        code: error.code
      } : null
    };
    
    // Store in session storage for debugging
    const logs = JSON.parse(sessionStorage.getItem('ai_diagnostic_logs') || '[]');
    logs.push(log);
    
    // Keep only last 20 logs
    if (logs.length > 20) {
      logs.shift();
    }
    
    sessionStorage.setItem('ai_diagnostic_logs', JSON.stringify(logs));
    console.log('[AI Diagnostic]', log);
  }
  
  /**
   * Get recent API logs
   */
  static getRecentLogs(): any[] {
    return JSON.parse(sessionStorage.getItem('ai_diagnostic_logs') || '[]');
  }
  
  /**
   * Check if we're using mock mode
   */
  static isMockMode(): boolean {
    // Check various conditions that might indicate mock mode
    const isDev = import.meta.env.DEV;
    const isLocalhost = window.location.hostname === 'localhost';
    const hasAPIKey = !!localStorage.getItem(this.OPENAI_KEY_STORAGE) || 
                     !!import.meta.env.VITE_OPENAI_API_KEY;
    
    return (isDev || isLocalhost) && !hasAPIKey;
  }
  
  /**
   * Get diagnostic summary for UI display
   */
  static async getDiagnosticSummary(): Promise<string> {
    const result = await this.runDiagnostics();
    
    if (result.openAIKeyValid && result.apiEndpointReachable) {
      return `✅ AI Status: Online (${result.responseTime}ms)`;
    } else if (!result.openAIKeyPresent) {
      return '⚠️ AI Status: No API key configured';
    } else if (!result.openAIKeyValid) {
      return '❌ AI Status: Invalid API key';
    } else {
      return '🔌 AI Status: Connection issue';
    }
  }
}