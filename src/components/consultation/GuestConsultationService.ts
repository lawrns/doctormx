/**
 * Guest Consultation Service
 * Handles consultation flow without mandatory registration
 */

export interface GuestConsultationData {
  id: string;
  name: string;
  mainSymptom: string;
  phone?: string;
  whatsappDetected?: boolean;
  status: 'draft' | 'started' | 'in_progress' | 'completed' | 'abandoned';
  createdAt: number;
  updatedAt: number;
  messages?: ConsultationMessage[];
  doctorAssigned?: string;
  sessionId?: string;
}

export interface ConsultationMessage {
  id: string;
  content: string;
  sender: 'user' | 'doctor' | 'system';
  timestamp: number;
  type?: 'text' | 'image' | 'prescription' | 'referral';
}

export interface AbandonmentRecoveryData {
  consultationId: string;
  lastActivity: number;
  recoveryAttempts: number;
  reminderSent: boolean;
  whatsappReminderSent: boolean;
}

class GuestConsultationService {
  private static instance: GuestConsultationService;
  private consultations: Map<string, GuestConsultationData> = new Map();
  private abandonmentTracking: Map<string, AbandonmentRecoveryData> = new Map();
  
  // Storage keys
  private readonly STORAGE_KEYS = {
    CONSULTATIONS: 'guest_consultations',
    ABANDONMENT: 'abandonment_tracking',
    CURRENT_SESSION: 'current_consultation_session'
  };

  private constructor() {
    this.loadFromStorage();
    this.startAbandonmentMonitoring();
  }

  public static getInstance(): GuestConsultationService {
    if (!GuestConsultationService.instance) {
      GuestConsultationService.instance = new GuestConsultationService();
    }
    return GuestConsultationService.instance;
  }

  /**
   * Create a new guest consultation
   */
  public createConsultation(data: {
    name: string;
    mainSymptom: string;
    phone?: string;
    whatsappDetected?: boolean;
  }): GuestConsultationData {
    const consultation: GuestConsultationData = {
      id: this.generateId(),
      name: data.name,
      mainSymptom: data.mainSymptom,
      phone: data.phone,
      whatsappDetected: data.whatsappDetected,
      status: 'started',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };

    this.consultations.set(consultation.id, consultation);
    this.saveToStorage();
    
    // Set as current session
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, consultation.id);
    
    // Start abandonment tracking
    this.startAbandonmentTracking(consultation.id);
    
    return consultation;
  }

  /**
   * Get current active consultation
   */
  public getCurrentConsultation(): GuestConsultationData | null {
    const currentId = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
    if (!currentId) return null;
    
    return this.consultations.get(currentId) || null;
  }

  /**
   * Update consultation status
   */
  public updateConsultationStatus(
    consultationId: string, 
    status: GuestConsultationData['status']
  ): void {
    const consultation = this.consultations.get(consultationId);
    if (!consultation) return;

    consultation.status = status;
    consultation.updatedAt = Date.now();
    
    this.consultations.set(consultationId, consultation);
    this.saveToStorage();

    // Update abandonment tracking
    this.updateAbandonmentTracking(consultationId);
  }

  /**
   * Add message to consultation
   */
  public addMessage(consultationId: string, message: Omit<ConsultationMessage, 'id'>): void {
    const consultation = this.consultations.get(consultationId);
    if (!consultation) return;

    const fullMessage: ConsultationMessage = {
      ...message,
      id: this.generateId()
    };

    if (!consultation.messages) {
      consultation.messages = [];
    }
    
    consultation.messages.push(fullMessage);
    consultation.updatedAt = Date.now();
    
    this.consultations.set(consultationId, consultation);
    this.saveToStorage();

    // Update abandonment tracking
    this.updateAbandonmentTracking(consultationId);
  }

  /**
   * Assign doctor to consultation
   */
  public assignDoctor(consultationId: string, doctorId: string): void {
    const consultation = this.consultations.get(consultationId);
    if (!consultation) return;

    consultation.doctorAssigned = doctorId;
    consultation.status = 'in_progress';
    consultation.updatedAt = Date.now();
    
    this.consultations.set(consultationId, consultation);
    this.saveToStorage();
  }

  /**
   * Get consultation history for offering account creation
   */
  public getConsultationHistory(): GuestConsultationData[] {
    return Array.from(this.consultations.values())
      .filter(c => c.status === 'completed')
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Convert guest consultation to registered user account
   */
  public async convertToRegisteredUser(email: string, password: string): Promise<boolean> {
    try {
      const history = this.getConsultationHistory();
      
      // Here you would integrate with your auth system
      // For now, we'll simulate the conversion
      
      // Store conversion data
      localStorage.setItem('consultation_conversion', JSON.stringify({
        email,
        consultationHistory: history,
        convertedAt: Date.now()
      }));
      
      return true;
    } catch (error) {
      console.error('Error converting to registered user:', error);
      return false;
    }
  }

  /**
   * Start abandonment tracking for a consultation
   */
  private startAbandonmentTracking(consultationId: string): void {
    this.abandonmentTracking.set(consultationId, {
      consultationId,
      lastActivity: Date.now(),
      recoveryAttempts: 0,
      reminderSent: false,
      whatsappReminderSent: false
    });
  }

  /**
   * Update abandonment tracking with new activity
   */
  private updateAbandonmentTracking(consultationId: string): void {
    const tracking = this.abandonmentTracking.get(consultationId);
    if (tracking) {
      tracking.lastActivity = Date.now();
      this.abandonmentTracking.set(consultationId, tracking);
    }
  }

  /**
   * Start monitoring for consultation abandonment
   */
  private startAbandonmentMonitoring(): void {
    setInterval(() => {
      this.checkForAbandonment();
    }, 60000); // Check every minute
  }

  /**
   * Check for abandoned consultations and trigger recovery
   */
  private checkForAbandonment(): void {
    const now = Date.now();
    
    this.abandonmentTracking.forEach((tracking, consultationId) => {
      const consultation = this.consultations.get(consultationId);
      if (!consultation || consultation.status === 'completed') return;

      const inactiveTime = now - tracking.lastActivity;
      
      // Trigger help prompt after 3 minutes
      if (inactiveTime > 180000 && !tracking.reminderSent) {
        this.triggerHelpPrompt(consultationId);
        tracking.reminderSent = true;
      }
      
      // Trigger WhatsApp reminder after 5 minutes
      if (inactiveTime > 300000 && !tracking.whatsappReminderSent && consultation.phone) {
        this.triggerWhatsAppReminder(consultationId);
        tracking.whatsappReminderSent = true;
      }
      
      // Mark as abandoned after 30 minutes
      if (inactiveTime > 1800000 && consultation.status !== 'abandoned') {
        this.updateConsultationStatus(consultationId, 'abandoned');
      }
    });
  }

  /**
   * Trigger help prompt for inactive user
   */
  private triggerHelpPrompt(consultationId: string): void {
    const event = new CustomEvent('consultation:help-prompt', {
      detail: { consultationId }
    });
    window.dispatchEvent(event);
  }

  /**
   * Trigger WhatsApp reminder
   */
  private triggerWhatsAppReminder(consultationId: string): void {
    const consultation = this.consultations.get(consultationId);
    if (!consultation || !consultation.phone) return;

    // Here you would integrate with WhatsApp Business API
    console.log(`Sending WhatsApp reminder to ${consultation.phone} for consultation ${consultationId}`);
    
    const event = new CustomEvent('consultation:whatsapp-reminder', {
      detail: { consultationId, phone: consultation.phone }
    });
    window.dispatchEvent(event);
  }

  /**
   * Load data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const consultationsData = localStorage.getItem(this.STORAGE_KEYS.CONSULTATIONS);
      if (consultationsData) {
        const parsed = JSON.parse(consultationsData);
        this.consultations = new Map(Object.entries(parsed));
      }

      const abandonmentData = localStorage.getItem(this.STORAGE_KEYS.ABANDONMENT);
      if (abandonmentData) {
        const parsed = JSON.parse(abandonmentData);
        this.abandonmentTracking = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading consultation data from storage:', error);
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.CONSULTATIONS,
        JSON.stringify(Object.fromEntries(this.consultations))
      );
      
      localStorage.setItem(
        this.STORAGE_KEYS.ABANDONMENT,
        JSON.stringify(Object.fromEntries(this.abandonmentTracking))
      );
    } catch (error) {
      console.error('Error saving consultation data to storage:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (for testing/cleanup)
   */
  public clearAllData(): void {
    this.consultations.clear();
    this.abandonmentTracking.clear();
    localStorage.removeItem(this.STORAGE_KEYS.CONSULTATIONS);
    localStorage.removeItem(this.STORAGE_KEYS.ABANDONMENT);
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
  }

  /**
   * Get abandonment statistics
   */
  public getAbandonmentStats() {
    const total = this.consultations.size;
    const completed = Array.from(this.consultations.values()).filter(c => c.status === 'completed').length;
    const abandoned = Array.from(this.consultations.values()).filter(c => c.status === 'abandoned').length;
    
    return {
      total,
      completed,
      abandoned,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      abandonmentRate: total > 0 ? (abandoned / total) * 100 : 0
    };
  }
}

export default GuestConsultationService;