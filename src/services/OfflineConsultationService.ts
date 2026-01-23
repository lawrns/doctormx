/**
 * Offline Consultation Service for DoctorMX
 * 
 * Enables offline viewing of consultation history and caching
 * Optimized for Mexican mobile networks with limited connectivity
 */

interface ConsultationData {
  id: string;
  timestamp: number;
  messages: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }[];
  diagnosis?: string;
  recommendations?: string[];
  severity?: 'low' | 'medium' | 'high' | 'emergency';
  cached: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

class OfflineConsultationService {
  private dbName = 'DoctorMX_OfflineDB';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeDB();
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[DoctorMX] IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[DoctorMX] Offline database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create consultations store
        if (!db.objectStoreNames.contains('consultations')) {
          const consultationStore = db.createObjectStore('consultations', { keyPath: 'id' });
          consultationStore.createIndex('timestamp', 'timestamp', { unique: false });
          consultationStore.createIndex('severity', 'severity', { unique: false });
        }

        // Create user profile store
        if (!db.objectStoreNames.contains('userProfile')) {
          db.createObjectStore('userProfile', { keyPath: 'id' });
        }

        // Create medical knowledge cache
        if (!db.objectStoreNames.contains('medicalKnowledge')) {
          const knowledgeStore = db.createObjectStore('medicalKnowledge', { keyPath: 'id' });
          knowledgeStore.createIndex('category', 'category', { unique: false });
        }

        // Create emergency contacts store
        if (!db.objectStoreNames.contains('emergencyContacts')) {
          db.createObjectStore('emergencyContacts', { keyPath: 'id' });
        }

        console.log('[DoctorMX] Database schema updated');
      };
    });
  }

  /**
   * Cache consultation data for offline access
   */
  async cacheConsultation(consultation: Omit<ConsultationData, 'cached'>): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    const consultationData: ConsultationData = {
      ...consultation,
      cached: true
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consultations'], 'readwrite');
      const store = transaction.objectStore('consultations');
      const request = store.put(consultationData);

      request.onsuccess = () => {
        console.log('[DoctorMX] Consultation cached for offline access:', consultation.id);
        resolve();
      };

      request.onerror = () => {
        console.error('[DoctorMX] Failed to cache consultation:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get cached consultations for offline viewing
   */
  async getCachedConsultations(limit: number = 10): Promise<ConsultationData[]> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consultations'], 'readonly');
      const store = transaction.objectStore('consultations');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Get newest first

      const consultations: ConsultationData[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < limit) {
          consultations.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(consultations);
        }
      };

      request.onerror = () => {
        console.error('[DoctorMX] Failed to get cached consultations:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get specific consultation by ID
   */
  async getConsultationById(id: string): Promise<ConsultationData | null> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consultations'], 'readonly');
      const store = transaction.objectStore('consultations');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('[DoctorMX] Failed to get consultation:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Cache user profile for offline access
   */
  async cacheUserProfile(profile: UserProfile): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userProfile'], 'readwrite');
      const store = transaction.objectStore('userProfile');
      const request = store.put(profile);

      request.onsuccess = () => {
        console.log('[DoctorMX] User profile cached for offline access');
        resolve();
      };

      request.onerror = () => {
        console.error('[DoctorMX] Failed to cache user profile:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get cached user profile
   */
  async getCachedUserProfile(userId: string): Promise<UserProfile | null> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userProfile'], 'readonly');
      const store = transaction.objectStore('userProfile');
      const request = store.get(userId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('[DoctorMX] Failed to get cached user profile:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Cache basic medical knowledge for offline reference
   */
  async cacheMedicalKnowledge(knowledge: {
    id: string;
    category: string;
    title: string;
    content: string;
    mexicanContext?: boolean;
  }[]): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['medicalKnowledge'], 'readwrite');
      const store = transaction.objectStore('medicalKnowledge');

      let completed = 0;
      const total = knowledge.length;

      knowledge.forEach(item => {
        const request = store.put(item);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log('[DoctorMX] Medical knowledge cached for offline access');
            resolve();
          }
        };
        request.onerror = () => {
          console.error('[DoctorMX] Failed to cache medical knowledge:', request.error);
          reject(request.error);
        };
      });
    });
  }

  /**
   * Get cached medical knowledge by category
   */
  async getCachedMedicalKnowledge(category?: string): Promise<any[]> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['medicalKnowledge'], 'readonly');
      const store = transaction.objectStore('medicalKnowledge');

      let request: IDBRequest;
      if (category) {
        const index = store.index('category');
        request = index.getAll(category);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[DoctorMX] Failed to get cached medical knowledge:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Cache emergency contacts for offline access
   */
  async cacheEmergencyContacts(contacts: {
    id: string;
    name: string;
    phone: string;
    description: string;
    type: 'hospital' | 'emergency' | 'pharmacy' | 'personal';
    location?: {
      state: string;
      city: string;
    };
  }[]): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emergencyContacts'], 'readwrite');
      const store = transaction.objectStore('emergencyContacts');

      let completed = 0;
      const total = contacts.length;

      contacts.forEach(contact => {
        const request = store.put(contact);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log('[DoctorMX] Emergency contacts cached for offline access');
            resolve();
          }
        };
        request.onerror = () => {
          console.error('[DoctorMX] Failed to cache emergency contact:', request.error);
          reject(request.error);
        };
      });
    });
  }

  /**
   * Get cached emergency contacts
   */
  async getCachedEmergencyContacts(): Promise<any[]> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emergencyContacts'], 'readonly');
      const store = transaction.objectStore('emergencyContacts');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[DoctorMX] Failed to get cached emergency contacts:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Check if offline data is available
   */
  async hasOfflineData(): Promise<boolean> {
    try {
      const consultations = await this.getCachedConsultations(1);
      return consultations.length > 0;
    } catch (error) {
      console.error('[DoctorMX] Error checking offline data:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    consultations: number;
    userProfiles: number;
    medicalKnowledge: number;
    emergencyContacts: number;
  }> {
    if (!this.db) {
      await this.initializeDB();
    }

    const counts = {
      consultations: 0,
      userProfiles: 0,
      medicalKnowledge: 0,
      emergencyContacts: 0
    };

    const stores = ['consultations', 'userProfile', 'medicalKnowledge', 'emergencyContacts'];
    const keys = ['consultations', 'userProfiles', 'medicalKnowledge', 'emergencyContacts'] as const;

    for (let i = 0; i < stores.length; i++) {
      try {
        const transaction = this.db!.transaction([stores[i]], 'readonly');
        const store = transaction.objectStore(stores[i]);
        const countRequest = store.count();
        
        counts[keys[i]] = await new Promise((resolve, reject) => {
          countRequest.onsuccess = () => resolve(countRequest.result);
          countRequest.onerror = () => reject(countRequest.error);
        });
      } catch (error) {
        console.error(`[DoctorMX] Error counting ${stores[i]}:`, error);
      }
    }

    return counts;
  }

  /**
   * Clear all offline data (for privacy/logout)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    const stores = ['consultations', 'userProfile', 'medicalKnowledge', 'emergencyContacts'];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite');
      
      let completed = 0;
      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === stores.length) {
            console.log('[DoctorMX] All offline data cleared');
            resolve();
          }
        };
        
        request.onerror = () => {
          console.error(`[DoctorMX] Failed to clear ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }
}

// Singleton instance
export const offlineConsultationService = new OfflineConsultationService();

// Default Mexican emergency contacts to cache
export const mexicanEmergencyContacts = [
  {
    id: 'mx-911',
    name: 'Emergencias Nacionales',
    phone: '911',
    description: 'Servicio nacional de emergencias médicas, policía y bomberos',
    type: 'emergency' as const
  },
  {
    id: 'mx-cruz-roja',
    name: 'Cruz Roja Mexicana',
    phone: '800-911-2000',
    description: 'Servicios de ambulancia y emergencias médicas',
    type: 'emergency' as const
  },
  {
    id: 'mx-abc-hospital',
    name: 'Centro Médico ABC',
    phone: '55-5604-1111',
    description: 'Hospital privado de alta especialidad en Ciudad de México',
    type: 'hospital' as const,
    location: {
      state: 'Ciudad de México',
      city: 'Santa Fe'
    }
  },
  {
    id: 'mx-hospital-angeles',
    name: 'Hospital Ángeles',
    phone: '55-5246-5000',
    description: 'Red de hospitales privados en México',
    type: 'hospital' as const
  },
  {
    id: 'mx-seguro-popular',
    name: 'INSABI (Instituto de Salud)',
    phone: '800-717-2426',
    description: 'Instituto de Salud para el Bienestar - Atención médica gratuita',
    type: 'hospital' as const
  }
];

// Basic medical knowledge for Mexican context
export const basicMedicalKnowledge = [
  {
    id: 'mx-fever-treatment',
    category: 'symptoms',
    title: 'Tratamiento de Fiebre',
    content: 'Para fiebre en adultos: Paracetamol 500-1000mg cada 6-8 horas. Mantenerse hidratado. Consultar médico si fiebre >39°C o persiste >3 días.',
    mexicanContext: true
  },
  {
    id: 'mx-common-medications',
    category: 'medications',
    title: 'Medicamentos Básicos Disponibles en México',
    content: 'Paracetamol (Tylenol), Ibuprofeno (Advil), Omeprazol (para gastritis), Metamizol (Novalgin) - común en México pero no disponible en otros países.',
    mexicanContext: true
  },
  {
    id: 'mx-altitude-sickness',
    category: 'conditions',
    title: 'Mal de Altura en México',
    content: 'Común en Ciudad de México (2,240m) y otras ciudades altas. Síntomas: dolor de cabeza, náuseas, fatiga. Hidratarse bien, evitar alcohol, descender si empeora.',
    mexicanContext: true
  },
  {
    id: 'mx-stomach-issues',
    category: 'conditions',
    title: 'Problemas Estomacales del Viajero',
    content: 'Común por cambio de dieta o agua. Tratamiento: hidratación oral, probióticos, evitar lácteos temporalmente. Loperamida para diarrea severa.',
    mexicanContext: true
  }
];

export default OfflineConsultationService;