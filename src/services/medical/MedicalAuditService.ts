/**
 * Medical Audit Service
 * Logs all medical interactions for compliance and liability protection
 */

import { supabase } from '../../lib/supabase';
import { AUDIT_EVENTS } from '../../config/security';

export interface MedicalAuditLog {
  id?: string;
  timestamp: string;
  eventType: string;
  userId?: string;
  sessionId: string;
  severity: 'info' | 'warning' | 'critical';
  data: {
    symptoms?: string[];
    aiResponse?: string;
    confidence?: number;
    medications?: string[];
    emergencyDetected?: boolean;
    disclaimersShown?: string[];
    validationErrors?: string[];
    userAction?: string;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

export class MedicalAuditService {
  private static instance: MedicalAuditService;
  private sessionId: string;
  private queue: MedicalAuditLog[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushInterval();
  }

  public static getInstance(): MedicalAuditService {
    if (!MedicalAuditService.instance) {
      MedicalAuditService.instance = new MedicalAuditService();
    }
    return MedicalAuditService.instance;
  }

  /**
   * Log AI consultation
   */
  public async logConsultation(
    userId: string | undefined,
    symptoms: string[],
    aiResponse: string,
    confidence: number,
    emergencyDetected: boolean = false
  ): Promise<void> {
    const log: MedicalAuditLog = {
      timestamp: new Date().toISOString(),
      eventType: AUDIT_EVENTS.AI_CONSULTATION,
      userId,
      sessionId: this.sessionId,
      severity: emergencyDetected ? 'critical' : 'info',
      data: {
        symptoms,
        aiResponse: this.sanitizeAIResponse(aiResponse),
        confidence,
        emergencyDetected
      },
      metadata: this.getMetadata()
    };

    await this.addToQueue(log);
  }

  /**
   * Log emergency escalation
   */
  public async logEmergencyEscalation(
    userId: string | undefined,
    symptoms: string[],
    escalationReason: string
  ): Promise<void> {
    const log: MedicalAuditLog = {
      timestamp: new Date().toISOString(),
      eventType: AUDIT_EVENTS.EMERGENCY_ESCALATION,
      userId,
      sessionId: this.sessionId,
      severity: 'critical',
      data: {
        symptoms,
        userAction: escalationReason,
        emergencyDetected: true
      },
      metadata: this.getMetadata()
    };

    // Emergency logs are flushed immediately
    await this.flush([log]);
  }

  /**
   * Log medication recommendation
   */
  public async logMedicationRecommendation(
    userId: string | undefined,
    medications: string[],
    validationErrors: string[] = []
  ): Promise<void> {
    const log: MedicalAuditLog = {
      timestamp: new Date().toISOString(),
      eventType: 'medication.recommendation',
      userId,
      sessionId: this.sessionId,
      severity: validationErrors.length > 0 ? 'warning' : 'info',
      data: {
        medications,
        validationErrors
      },
      metadata: this.getMetadata()
    };

    await this.addToQueue(log);
  }

  /**
   * Log user consent
   */
  public async logConsent(
    userId: string | undefined,
    consentType: string,
    accepted: boolean
  ): Promise<void> {
    const log: MedicalAuditLog = {
      timestamp: new Date().toISOString(),
      eventType: 'consent.recorded',
      userId,
      sessionId: this.sessionId,
      severity: 'info',
      data: {
        userAction: `${consentType}: ${accepted ? 'accepted' : 'declined'}`
      },
      metadata: this.getMetadata()
    };

    await this.addToQueue(log);
  }

  /**
   * Log disclaimers shown
   */
  public async logDisclaimersShown(
    userId: string | undefined,
    disclaimers: string[]
  ): Promise<void> {
    const log: MedicalAuditLog = {
      timestamp: new Date().toISOString(),
      eventType: 'disclaimers.shown',
      userId,
      sessionId: this.sessionId,
      severity: 'info',
      data: {
        disclaimersShown: disclaimers
      },
      metadata: this.getMetadata()
    };

    await this.addToQueue(log);
  }

  /**
   * Export audit logs for a user
   */
  public async exportUserLogs(userId: string): Promise<MedicalAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('medical_audit_logs')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error exporting audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      return [];
    }
  }

  /**
   * Get session summary
   */
  public async getSessionSummary(): Promise<{
    sessionId: string;
    duration: number;
    consultationCount: number;
    emergencyCount: number;
  }> {
    const logs = this.queue;
    const consultations = logs.filter(l => l.eventType === AUDIT_EVENTS.AI_CONSULTATION);
    const emergencies = logs.filter(l => l.severity === 'critical');

    const firstLog = logs[0];
    const lastLog = logs[logs.length - 1];
    const duration = firstLog && lastLog
      ? new Date(lastLog.timestamp).getTime() - new Date(firstLog.timestamp).getTime()
      : 0;

    return {
      sessionId: this.sessionId,
      duration: Math.round(duration / 1000), // seconds
      consultationCount: consultations.length,
      emergencyCount: emergencies.length
    };
  }

  /**
   * Add log to queue
   */
  private async addToQueue(log: MedicalAuditLog): Promise<void> {
    this.queue.push(log);

    // Flush if queue is getting large
    if (this.queue.length >= 10) {
      await this.flush();
    }
  }

  /**
   * Flush logs to database
   */
  private async flush(logs?: MedicalAuditLog[]): Promise<void> {
    const logsToFlush = logs || this.queue;
    if (logsToFlush.length === 0) return;

    try {
      const { error } = await supabase
        .from('medical_audit_logs')
        .insert(logsToFlush);

      if (error) {
        console.error('Error flushing audit logs:', error);
        // Keep logs in queue for retry
        if (!logs) return;
      }

      // Clear flushed logs from queue
      if (!logs) {
        this.queue = [];
      }
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
    }
  }

  /**
   * Start flush interval
   */
  private startFlushInterval(): void {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  /**
   * Stop flush interval and flush remaining logs
   */
  public async cleanup(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    await this.flush();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize AI response for logging
   */
  private sanitizeAIResponse(response: string): string {
    // Truncate very long responses
    const maxLength = 1000;
    if (response.length > maxLength) {
      return response.substring(0, maxLength) + '... [truncated]';
    }
    return response;
  }

  /**
   * Get metadata for logging
   */
  private getMetadata(): MedicalAuditLog['metadata'] {
    if (typeof window === 'undefined') {
      return {};
    }

    return {
      userAgent: navigator.userAgent,
      location: window.location.pathname,
      // Note: IP address should be captured server-side for privacy
    };
  }
}

// Export singleton instance
export const medicalAuditService = MedicalAuditService.getInstance();

// Ensure cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    medicalAuditService.cleanup();
  });
}