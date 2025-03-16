// Analytics service for tracking symptom checker usage
import { supabase } from '../lib/supabase';

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  user_id?: string;
  session_id: string;
  timestamp: string;
  source_page: string;
  device_info?: {
    browser: string;
    os: string;
    device_type: 'desktop' | 'mobile' | 'tablet';
    screen_size: string;
  };
}

export interface SymptomCheckerUsageData {
  total_checks: number;
  method_breakdown: {
    body_selection: number;
    ai_conversation: number;
  };
  top_symptoms: Array<{
    symptom_id: string;
    symptom_name: string;
    count: number;
  }>;
  severity_breakdown: {
    low: number;
    moderate: number;
    high: number;
  };
  conversion_rate: number;
  average_completion_time: number;
}

class AnalyticsService {
  private sessionId: string;
  private isEnabled: boolean;
  private buffer: AnalyticsEvent[] = [];
  private flushInterval: number = 10000; // 10 seconds
  private intervalId: number | null = null;
  private isBufferEnabled: boolean = true;

  constructor() {
    // Generate a unique session ID
    this.sessionId = this.generateSessionId();
    
    // Check if analytics is enabled (respect user preferences)
    this.isEnabled = this.getAnalyticsPreference();
    
    // Start buffer flushing if enabled
    if (this.isEnabled && this.isBufferEnabled) {
      this.startBufferFlushing();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAnalyticsPreference(): boolean {
    try {
      const preference = localStorage.getItem('analytics_enabled');
      return preference === null ? true : preference === 'true';
    } catch (e) {
      // If localStorage is not available, default to true
      return true;
    }
  }

  public setAnalyticsPreference(enabled: boolean): void {
    try {
      localStorage.setItem('analytics_enabled', enabled.toString());
      this.isEnabled = enabled;
      
      if (enabled && this.isBufferEnabled && !this.intervalId) {
        this.startBufferFlushing();
      } else if (!enabled && this.intervalId) {
        this.stopBufferFlushing();
      }
    } catch (e) {
      console.error('Error setting analytics preference:', e);
    }
  }

  private startBufferFlushing(): void {
    this.intervalId = window.setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  private stopBufferFlushing(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private flushBuffer(): void {
    if (this.buffer.length > 0) {
      const events = [...this.buffer];
      this.buffer = [];
      
      this.batchSendEvents(events).catch(error => {
        console.error('Error sending analytics events:', error);
        // Put events back in buffer if send fails
        this.buffer = [...this.buffer, ...events];
      });
    }
  }

  private async batchSendEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      // In a real implementation, this would send to a backend API
      // For now, we'll just log to console and simulate a backend call
      console.log('Sending analytics events:', events);
      
      // Simulate API call to supabase
      // const { error } = await supabase
      //   .from('analytics_events')
      //   .insert(events);
      
      // if (error) throw error;
    } catch (error) {
      console.error('Error sending analytics events:', error);
      throw error;
    }
  }

  private getDeviceInfo(): AnalyticsEvent['device_info'] {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    
    // Detect browser
    if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (userAgent.indexOf('SamsungBrowser') > -1) {
      browser = 'Samsung Browser';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      browser = 'Opera';
    } else if (userAgent.indexOf('Trident') > -1) {
      browser = 'Internet Explorer';
    } else if (userAgent.indexOf('Edge') > -1) {
      browser = 'Edge';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      browser = 'Safari';
    }
    
    // Detect OS
    if (userAgent.indexOf('Windows') > -1) {
      os = 'Windows';
    } else if (userAgent.indexOf('Mac') > -1) {
      os = 'MacOS';
    } else if (userAgent.indexOf('Linux') > -1) {
      os = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
      os = 'Android';
    } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
      os = 'iOS';
    }
    
    // Detect device type
    if (userAgent.indexOf('Mobile') > -1 || userAgent.indexOf('Android') > -1 && userAgent.indexOf('Mobi') > -1) {
      deviceType = 'mobile';
    } else if (userAgent.indexOf('iPad') > -1 || userAgent.indexOf('Tablet') > -1 || (userAgent.indexOf('Android') > -1 && userAgent.indexOf('Mobi') === -1)) {
      deviceType = 'tablet';
    }
    
    return {
      browser,
      os,
      device_type: deviceType,
      screen_size: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  public trackEvent(
    eventType: string,
    eventData?: Record<string, any>,
    sourcePage?: string,
    userId?: string
  ): void {
    if (!this.isEnabled) return;
    
    const event: AnalyticsEvent = {
      event_type: eventType,
      event_data: eventData,
      user_id: userId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      source_page: sourcePage || window.location.pathname,
      device_info: this.getDeviceInfo()
    };
    
    if (this.isBufferEnabled) {
      this.buffer.push(event);
    } else {
      this.sendEvent(event).catch(error => {
        console.error('Error sending analytics event:', error);
      });
    }
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // In a real implementation, this would send to a backend API
      console.log('Sending analytics event:', event);
      
      // Simulate API call to supabase
      // const { error } = await supabase
      //   .from('analytics_events')
      //   .insert([event]);
      
      // if (error) throw error;
    } catch (error) {
      console.error('Error sending analytics event:', error);
      throw error;
    }
  }

  // Specific tracking methods for the symptom checker
  public trackSymptomCheckerStart(method: 'body' | 'ai'): void {
    this.trackEvent('symptom_checker_start', { method });
  }

  public trackSymptomSelection(symptomId: string, symptomName: string, bodyRegion?: string): void {
    this.trackEvent('symptom_selection', {
      symptom_id: symptomId,
      symptom_name: symptomName,
      body_region: bodyRegion
    });
  }

  public trackQuestionAnswer(questionId: string, answer: any): void {
    this.trackEvent('question_answer', {
      question_id: questionId,
      answer: typeof answer === 'object' ? JSON.stringify(answer) : answer
    });
  }

  public trackAnalysisComplete(analysisData: any): void {
    this.trackEvent('analysis_complete', {
      symptom_id: analysisData.primarySymptom?.id || analysisData.symptomId,
      severity: analysisData.severityAssessment || analysisData.severity,
      urgency: analysisData.urgencyAssessment || analysisData.urgency,
      recommended_specialties: analysisData.recommendedSpecialties
    });
  }

  public trackDoctorSearch(specialty?: string): void {
    this.trackEvent('doctor_search', { specialty });
  }

  public trackAppointmentBooking(doctorId: string, appointmentType: 'in_person' | 'telemedicine'): void {
    this.trackEvent('appointment_booking', { 
      doctor_id: doctorId,
      appointment_type: appointmentType
    });
  }

  public trackSymptomCheckerCompletion(data: {
    start_time: string;
    end_time: string;
    method: 'body' | 'ai';
    symptom_id: string;
    symptom_name: string;
    completed: boolean;
  }): void {
    // Calculate completion time in seconds
    const startTime = new Date(data.start_time).getTime();
    const endTime = new Date(data.end_time).getTime();
    const completionTimeSeconds = Math.round((endTime - startTime) / 1000);
    
    this.trackEvent('symptom_checker_completion', {
      ...data,
      completion_time_seconds: completionTimeSeconds
    });
  }

  // Analytics reporting methods (would typically fetch from backend in real implementation)
  public async getSymptomCheckerUsageData(): Promise<SymptomCheckerUsageData> {
    // In a real implementation, this would fetch from a backend API
    // For now, return mock data
    return {
      total_checks: 8426,
      method_breakdown: {
        body_selection: 5872,
        ai_conversation: 2554
      },
      top_symptoms: [
        { symptom_id: 'headache', symptom_name: 'Dolor de cabeza', count: 1245 },
        { symptom_id: 'abdominal_pain', symptom_name: 'Dolor abdominal', count: 986 },
        { symptom_id: 'back_pain', symptom_name: 'Dolor de espalda', count: 754 },
        { symptom_id: 'cough', symptom_name: 'Tos', count: 612 },
        { symptom_id: 'fever', symptom_name: 'Fiebre', count: 583 }
      ],
      severity_breakdown: {
        low: 3986,
        moderate: 3642,
        high: 798
      },
      conversion_rate: 42.3, // percentage of users who booked an appointment after using the symptom checker
      average_completion_time: 184 // seconds
    };
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;