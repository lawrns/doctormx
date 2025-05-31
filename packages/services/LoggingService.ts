/**
 * LoggingService - Comprehensive error handling and logging for DoctorMX
 * Provides structured logging, error tracking, and monitoring capabilities
 */

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  service: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: {
    userAgent?: string;
    url?: string;
    referrer?: string;
  };
}

interface ErrorReport {
  id: string;
  timestamp: string;
  service: string;
  error: Error;
  context: any;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];
  private errorReports: ErrorReport[] = [];
  private maxLogEntries = 1000;
  private isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV || process.env.NODE_ENV === 'development' || false;

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Log debug information
   */
  debug(service: string, message: string, data?: any, context?: { userId?: string; sessionId?: string }): void {
    this.log('debug', service, message, data, context);
  }

  /**
   * Log general information
   */
  info(service: string, message: string, data?: any, context?: { userId?: string; sessionId?: string }): void {
    this.log('info', service, message, data, context);
  }

  /**
   * Log warnings
   */
  warn(service: string, message: string, data?: any, context?: { userId?: string; sessionId?: string }): void {
    this.log('warn', service, message, data, context);
  }

  /**
   * Log errors
   */
  error(service: string, message: string, error?: Error, context?: { userId?: string; sessionId?: string }): void {
    this.log('error', service, message, { error: this.serializeError(error) }, context);
    
    if (error) {
      this.reportError(service, error, context || {}, 'medium');
    }
  }

  /**
   * Log critical errors
   */
  critical(service: string, message: string, error?: Error, context?: { userId?: string; sessionId?: string }): void {
    this.log('critical', service, message, { error: this.serializeError(error) }, context);
    
    if (error) {
      this.reportError(service, error, context || {}, 'critical');
    }

    // In production, this might trigger alerts
    if (!this.isDevelopment) {
      this.triggerAlert(service, message, error);
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogEntry['level'], 
    service: string, 
    message: string, 
    data?: any, 
    context?: { userId?: string; sessionId?: string }
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      data: this.sanitizeData(data),
      userId: context?.userId,
      sessionId: context?.sessionId,
      context: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined
      }
    };

    this.logs.push(entry);

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'critical' || level === 'error' ? 'error' :
                           level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}] ${service}: ${message}`, data);
    }

    // Maintain log size
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Send to external logging service in production
    if (!this.isDevelopment && (level === 'error' || level === 'critical')) {
      this.sendToExternalLogging(entry);
    }
  }

  /**
   * Report structured errors
   */
  private reportError(
    service: string, 
    error: Error, 
    context: any, 
    severity: ErrorReport['severity']
  ): void {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      service,
      error,
      context: this.sanitizeData(context),
      userId: context.userId,
      sessionId: context.sessionId,
      severity,
      resolved: false
    };

    this.errorReports.push(report);

    // Keep only recent error reports
    if (this.errorReports.length > 100) {
      this.errorReports = this.errorReports.slice(-100);
    }
  }

  /**
   * Create error wrapper for better error handling
   */
  createErrorHandler<T extends any[], R>(
    service: string,
    functionName: string,
    fn: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        this.debug(service, `${functionName} started`, { args: this.sanitizeData(args) });
        const result = await fn(...args);
        this.debug(service, `${functionName} completed successfully`);
        return result;
      } catch (error) {
        this.error(
          service, 
          `${functionName} failed`, 
          error instanceof Error ? error : new Error(String(error)),
          { args: this.sanitizeData(args) }
        );
        throw error;
      }
    };
  }

  /**
   * Create sync error wrapper
   */
  createSyncErrorHandler<T extends any[], R>(
    service: string,
    functionName: string,
    fn: (...args: T) => R
  ): (...args: T) => R {
    return (...args: T): R => {
      try {
        this.debug(service, `${functionName} started`, { args: this.sanitizeData(args) });
        const result = fn(...args);
        this.debug(service, `${functionName} completed successfully`);
        return result;
      } catch (error) {
        this.error(
          service, 
          `${functionName} failed`, 
          error instanceof Error ? error : new Error(String(error)),
          { args: this.sanitizeData(args) }
        );
        throw error;
      }
    };
  }

  /**
   * Medical-specific logging for safety
   */
  logMedicalEvent(
    event: 'red_flag_detected' | 'herb_recommendation' | 'emergency_escalation' | 'diagnostic_confidence',
    data: any,
    context?: { userId?: string; sessionId?: string }
  ): void {
    this.info('MedicalSafety', `Medical event: ${event}`, {
      event,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString()
    }, context);

    // Critical medical events get special handling
    if (event === 'red_flag_detected' || event === 'emergency_escalation') {
      this.critical('MedicalSafety', `Critical medical event: ${event}`, undefined, context);
    }
  }

  /**
   * Performance logging
   */
  logPerformance(
    service: string,
    operation: string,
    duration: number,
    metadata?: any
  ): void {
    this.info(service, `Performance: ${operation}`, {
      operation,
      duration,
      metadata: this.sanitizeData(metadata)
    });

    // Warn on slow operations
    if (duration > 5000) { // 5 seconds
      this.warn(service, `Slow operation detected: ${operation}`, { duration, metadata });
    }
  }

  /**
   * User interaction logging
   */
  logUserInteraction(
    interaction: string,
    data?: any,
    context?: { userId?: string; sessionId?: string }
  ): void {
    this.info('UserInteraction', interaction, this.sanitizeData(data), context);
  }

  /**
   * Feature flag usage logging
   */
  logFeatureFlag(
    flagName: string,
    enabled: boolean,
    context?: { userId?: string; sessionId?: string }
  ): void {
    this.info('FeatureFlag', `Feature flag ${flagName}`, { flagName, enabled }, context);
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50, level?: LogEntry['level']): LogEntry[] {
    let logs = [...this.logs];
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(-count).reverse();
  }

  /**
   * Get error reports
   */
  getErrorReports(unresolved: boolean = false): ErrorReport[] {
    let reports = [...this.errorReports];
    
    if (unresolved) {
      reports = reports.filter(report => !report.resolved);
    }
    
    return reports.reverse();
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): boolean {
    const report = this.errorReports.find(r => r.id === errorId);
    if (report) {
      report.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Get system health summary
   */
  getHealthSummary(): {
    totalLogs: number;
    errorCount: number;
    criticalCount: number;
    unresolvedErrors: number;
    recentErrors: ErrorReport[];
  } {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    return {
      totalLogs: this.logs.length,
      errorCount: this.logs.filter(log => log.level === 'error').length,
      criticalCount: this.logs.filter(log => log.level === 'critical').length,
      unresolvedErrors: this.errorReports.filter(r => !r.resolved).length,
      recentErrors: this.errorReports.filter(r => r.timestamp > last24h)
    };
  }

  /**
   * Export logs for analysis
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'service', 'message', 'userId', 'sessionId'];
      const rows = this.logs.map(log => [
        log.timestamp,
        log.level,
        log.service,
        log.message,
        log.userId || '',
        log.sessionId || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Serialize error objects
   */
  private serializeError(error?: Error): any {
    if (!error) return null;
    
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  /**
   * Sanitize sensitive data
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'ssn', 'credit'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      for (const key in sanitized) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send logs to external service (placeholder)
   */
  private async sendToExternalLogging(entry: LogEntry): Promise<void> {
    // In production, this would send to services like:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - Custom analytics endpoint
    
    try {
      // Example: send to analytics endpoint
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  /**
   * Trigger alert for critical errors (placeholder)
   */
  private triggerAlert(service: string, message: string, error?: Error): void {
    // In production, this might:
    // - Send Slack notifications
    // - Trigger PagerDuty
    // - Send email to on-call team
    console.error(`🚨 CRITICAL ALERT: ${service} - ${message}`, error);
  }

  /**
   * Clear old logs (maintenance)
   */
  clearOldLogs(olderThanDays: number = 7): number {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
    const initialCount = this.logs.length;
    
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
    this.errorReports = this.errorReports.filter(report => report.timestamp > cutoff);
    
    return initialCount - this.logs.length;
  }
}

export const loggingService = LoggingService.getInstance();