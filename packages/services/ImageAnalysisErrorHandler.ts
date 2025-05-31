/**
 * ImageAnalysisErrorHandler - Robust error handling and retry logic for medical image analysis
 */

import { loggingService } from './LoggingService';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export interface ErrorContext {
  operation: string;
  analysisType?: string;
  errorCode?: string;
  userMessage?: string;
  technicalMessage?: string;
  recoverable: boolean;
  retryable: boolean;
  suggestedAction?: string;
}

export interface AnalysisError extends Error {
  context: ErrorContext;
  timestamp: number;
  retryCount?: number;
}

export class ImageAnalysisErrorHandler {
  private static instance: ImageAnalysisErrorHandler;
  private errorHistory: Map<string, AnalysisError[]> = new Map();
  private readonly MAX_HISTORY_SIZE = 100;

  static getInstance(): ImageAnalysisErrorHandler {
    if (!ImageAnalysisErrorHandler.instance) {
      ImageAnalysisErrorHandler.instance = new ImageAnalysisErrorHandler();
    }
    return ImageAnalysisErrorHandler.instance;
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true,
      ...config
    };

    let lastError: AnalysisError | null = null;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        // Log attempt
        if (attempt > 0) {
          loggingService.info('ImageAnalysisErrorHandler', `Retry attempt ${attempt}/${retryConfig.maxRetries}`, {
            operation: operationName
          });
        }

        // Execute operation
        const result = await operation();
        
        // Clear error history on success
        if (lastError) {
          this.clearErrorHistory(operationName);
        }
        
        return result;

      } catch (error) {
        lastError = this.createAnalysisError(error, operationName, attempt);
        this.recordError(lastError);

        // Check if error is retryable
        if (!lastError.context.retryable || attempt === retryConfig.maxRetries) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, retryConfig);
        
        loggingService.warn('ImageAnalysisErrorHandler', `Operation failed, retrying in ${delay}ms`, {
          operation: operationName,
          attempt,
          error: lastError.message
        });

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Create structured error with context
   */
  createAnalysisError(error: unknown, operation: string, retryCount = 0): AnalysisError {
    const baseError = error instanceof Error ? error : new Error(String(error));
    const errorContext = this.analyzeError(baseError, operation);

    const analysisError = new Error(errorContext.userMessage || baseError.message) as AnalysisError;
    analysisError.context = errorContext;
    analysisError.timestamp = Date.now();
    analysisError.retryCount = retryCount;
    analysisError.stack = baseError.stack;

    return analysisError;
  }

  /**
   * Analyze error and determine context
   */
  private analyzeError(error: Error, operation: string): ErrorContext {
    const message = error.message.toLowerCase();
    
    // Camera access errors
    if (message.includes('camera') || message.includes('permission') || message.includes('getusermedia')) {
      return {
        operation,
        errorCode: 'CAMERA_ACCESS_ERROR',
        userMessage: 'No se pudo acceder a la cámara. Por favor, verifica los permisos.',
        technicalMessage: error.message,
        recoverable: true,
        retryable: false,
        suggestedAction: 'Habilita el acceso a la cámara en la configuración del navegador'
      };
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return {
        operation,
        errorCode: 'NETWORK_ERROR',
        userMessage: 'Error de conexión. Verificando tu conexión a internet...',
        technicalMessage: error.message,
        recoverable: true,
        retryable: true,
        suggestedAction: 'Verifica tu conexión a internet e intenta nuevamente'
      };
    }

    // API errors
    if (message.includes('api') || message.includes('401') || message.includes('403')) {
      return {
        operation,
        errorCode: 'API_ERROR',
        userMessage: 'Error al conectar con el servicio de análisis.',
        technicalMessage: error.message,
        recoverable: true,
        retryable: true,
        suggestedAction: 'El servicio se está reiniciando, intenta en unos segundos'
      };
    }

    // Image processing errors
    if (message.includes('canvas') || message.includes('imagedata') || message.includes('context')) {
      return {
        operation,
        errorCode: 'IMAGE_PROCESSING_ERROR',
        userMessage: 'Error al procesar la imagen. Intenta tomar otra foto.',
        technicalMessage: error.message,
        recoverable: true,
        retryable: true,
        suggestedAction: 'Toma una nueva foto con mejor iluminación'
      };
    }

    // Analysis errors
    if (message.includes('analysis') || message.includes('detection') || message.includes('confidence')) {
      return {
        operation,
        errorCode: 'ANALYSIS_ERROR',
        userMessage: 'No se pudo completar el análisis. La imagen podría no ser clara.',
        technicalMessage: error.message,
        recoverable: true,
        retryable: true,
        suggestedAction: 'Asegúrate de que la imagen esté bien enfocada y con buena luz'
      };
    }

    // Memory errors
    if (message.includes('memory') || message.includes('heap') || message.includes('oom')) {
      return {
        operation,
        errorCode: 'MEMORY_ERROR',
        userMessage: 'Error de memoria. Recargando la aplicación...',
        technicalMessage: error.message,
        recoverable: false,
        retryable: false,
        suggestedAction: 'La página se recargará automáticamente'
      };
    }

    // Default error
    return {
      operation,
      errorCode: 'UNKNOWN_ERROR',
      userMessage: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
      technicalMessage: error.message,
      recoverable: true,
      retryable: true,
      suggestedAction: 'Si el problema persiste, contacta soporte'
    };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
    
    // Apply max delay cap
    delay = Math.min(delay, config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (config.jitter) {
      const jitterRange = delay * 0.3;
      delay += (Math.random() - 0.5) * jitterRange;
    }
    
    return Math.round(delay);
  }

  /**
   * Record error for analysis
   */
  private recordError(error: AnalysisError): void {
    const operation = error.context.operation;
    
    if (!this.errorHistory.has(operation)) {
      this.errorHistory.set(operation, []);
    }
    
    const history = this.errorHistory.get(operation)!;
    history.push(error);
    
    // Limit history size
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.shift();
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStatistics(operation?: string): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: AnalysisError[];
    errorRate: number;
  } {
    const errors = operation 
      ? this.errorHistory.get(operation) || []
      : Array.from(this.errorHistory.values()).flat();

    const errorsByType: Record<string, number> = {};
    errors.forEach(error => {
      const code = error.context.errorCode || 'UNKNOWN';
      errorsByType[code] = (errorsByType[code] || 0) + 1;
    });

    const recentErrors = errors
      .filter(e => Date.now() - e.timestamp < 300000) // Last 5 minutes
      .slice(-10);

    const errorRate = recentErrors.length / 5; // Errors per minute

    return {
      totalErrors: errors.length,
      errorsByType,
      recentErrors,
      errorRate
    };
  }

  /**
   * Clear error history for an operation
   */
  clearErrorHistory(operation?: string): void {
    if (operation) {
      this.errorHistory.delete(operation);
    } else {
      this.errorHistory.clear();
    }
  }

  /**
   * Check if should circuit break
   */
  shouldCircuitBreak(operation: string, threshold = 5): boolean {
    const stats = this.getErrorStatistics(operation);
    return stats.errorRate > threshold;
  }

  /**
   * Handle memory errors with page reload
   */
  handleMemoryError(): void {
    loggingService.error('ImageAnalysisErrorHandler', 'Memory error detected, reloading page', new Error('OOM'));
    
    // Clear all data
    this.errorHistory.clear();
    
    // Reload page after short delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: unknown): string {
    if (error instanceof Error && 'context' in error) {
      const analysisError = error as AnalysisError;
      return analysisError.context.userMessage || analysisError.message;
    }
    
    if (error instanceof Error) {
      return this.analyzeError(error, 'unknown').userMessage || error.message;
    }
    
    return 'Ocurrió un error inesperado';
  }

  /**
   * Get recovery suggestions
   */
  getRecoverySuggestions(error: unknown): string[] {
    const suggestions: string[] = [];
    
    if (error instanceof Error && 'context' in error) {
      const analysisError = error as AnalysisError;
      if (analysisError.context.suggestedAction) {
        suggestions.push(analysisError.context.suggestedAction);
      }
    }
    
    // Add general suggestions based on error type
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    
    if (errorMessage.includes('camera')) {
      suggestions.push('Verifica que ninguna otra aplicación esté usando la cámara');
      suggestions.push('Intenta recargar la página');
    }
    
    if (errorMessage.includes('network')) {
      suggestions.push('Verifica tu conexión WiFi o datos móviles');
      suggestions.push('Intenta desactivar el modo avión si está activo');
    }
    
    if (errorMessage.includes('image') || errorMessage.includes('quality')) {
      suggestions.push('Asegúrate de tener buena iluminación');
      suggestions.push('Mantén la cámara estable al tomar la foto');
      suggestions.push('Limpia el lente de la cámara');
    }
    
    return suggestions;
  }
}

export const imageAnalysisErrorHandler = ImageAnalysisErrorHandler.getInstance();