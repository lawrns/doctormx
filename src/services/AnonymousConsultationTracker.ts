/**
 * Anonymous Consultation Tracker Service
 * 
 * Tracks consultation usage for non-authenticated users using localStorage
 * and device fingerprinting to prevent abuse while allowing legitimate usage.
 */

interface ConsultationData {
  count: number;
  firstConsultation: string;
  lastConsultation: string;
  deviceId: string;
  consultations: Array<{
    timestamp: string;
    conversationId: string;
  }>;
}

const STORAGE_KEY = 'dmx_anon_consultations';
const FREE_CONSULTATIONS_LIMIT = 5;
const RESET_PERIOD_DAYS = 30;

export class AnonymousConsultationTracker {
  private static instance: AnonymousConsultationTracker;

  private constructor() {}

  static getInstance(): AnonymousConsultationTracker {
    if (!AnonymousConsultationTracker.instance) {
      AnonymousConsultationTracker.instance = new AnonymousConsultationTracker();
    }
    return AnonymousConsultationTracker.instance;
  }

  /**
   * Generate a simple device fingerprint
   * Note: This is a basic implementation. In production, consider using
   * a library like FingerprintJS for more robust fingerprinting.
   */
  private generateDeviceId(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'default-device-id';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('DoctorMX', 2, 2);
    
    const dataURL = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < dataURL.length; i++) {
      const char = dataURL.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `device-${Math.abs(hash)}`;
  }

  /**
   * Get current consultation data from localStorage
   */
  private getData(): ConsultationData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data) as ConsultationData;
      
      // Check if data needs to be reset (30 days since first consultation)
      const firstDate = new Date(parsed.firstConsultation);
      const daysSinceFirst = Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceFirst >= RESET_PERIOD_DAYS) {
        this.resetData();
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error reading consultation data:', error);
      return null;
    }
  }

  /**
   * Save consultation data to localStorage
   */
  private saveData(data: ConsultationData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving consultation data:', error);
    }
  }

  /**
   * Reset consultation data
   */
  private resetData(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Check if user can start a new consultation
   */
  canStartConsultation(): boolean {
    const data = this.getData();
    if (!data) return true;
    return data.count < FREE_CONSULTATIONS_LIMIT;
  }

  /**
   * Get remaining consultations
   */
  getRemainingConsultations(): number {
    const data = this.getData();
    if (!data) return FREE_CONSULTATIONS_LIMIT;
    return Math.max(0, FREE_CONSULTATIONS_LIMIT - data.count);
  }

  /**
   * Get consultation usage data
   */
  getUsageData(): {
    used: number;
    remaining: number;
    total: number;
    resetDate: Date | null;
    isAtLimit: boolean;
  } {
    const data = this.getData();
    const used = data?.count || 0;
    const remaining = this.getRemainingConsultations();
    
    let resetDate: Date | null = null;
    if (data) {
      resetDate = new Date(data.firstConsultation);
      resetDate.setDate(resetDate.getDate() + RESET_PERIOD_DAYS);
    }
    
    return {
      used,
      remaining,
      total: FREE_CONSULTATIONS_LIMIT,
      resetDate,
      isAtLimit: remaining === 0
    };
  }

  /**
   * Track a new consultation
   */
  trackConsultation(conversationId: string): boolean {
    if (!this.canStartConsultation()) {
      return false;
    }

    const deviceId = this.generateDeviceId();
    const now = new Date().toISOString();
    
    let data = this.getData();
    
    if (!data) {
      data = {
        count: 0,
        firstConsultation: now,
        lastConsultation: now,
        deviceId,
        consultations: []
      };
    }

    // Check if device ID matches (basic anti-tampering)
    if (data.deviceId !== deviceId) {
      console.warn('Device ID mismatch detected');
      // In a production environment, you might want to handle this differently
    }

    data.count++;
    data.lastConsultation = now;
    data.consultations.push({
      timestamp: now,
      conversationId
    });

    this.saveData(data);
    return true;
  }

  /**
   * Get prompts for conversion based on consultation count
   */
  getConversionPrompt(): {
    show: boolean;
    type: 'soft' | 'medium' | 'hard';
    message: string;
    cta: string;
  } | null {
    const usage = this.getUsageData();
    
    if (usage.used === 2) {
      return {
        show: true,
        type: 'soft',
        message: 'Guarda tu historial de salud creando una cuenta gratuita',
        cta: 'Crear cuenta gratis'
      };
    }
    
    if (usage.used === 4) {
      return {
        show: true,
        type: 'medium',
        message: `¡Solo te queda ${usage.remaining} consulta gratis! Regístrate para obtener 5 consultas adicionales`,
        cta: 'Registrarme ahora'
      };
    }
    
    if (usage.isAtLimit) {
      return {
        show: true,
        type: 'hard',
        message: 'Has alcanzado el límite de consultas gratuitas. Crea una cuenta para continuar',
        cta: 'Crear cuenta para continuar'
      };
    }
    
    return null;
  }

  /**
   * Merge anonymous consultation history with authenticated user
   * Called after user signs up/logs in
   */
  async mergeWithAuthenticatedUser(userId: string): Promise<void> {
    const data = this.getData();
    if (!data || data.count === 0) return;

    try {
      // TODO: Send consultation history to backend to merge with user account
      // This would typically involve an API call to transfer the anonymous
      // consultation history to the authenticated user's account
      
      // For now, we'll just clear the anonymous data
      this.resetData();
    } catch (error) {
      console.error('Error merging consultation history:', error);
    }
  }
}

// Export singleton instance
export const anonymousConsultationTracker = AnonymousConsultationTracker.getInstance();