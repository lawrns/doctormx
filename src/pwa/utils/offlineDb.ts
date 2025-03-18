/**
 * Offline Database Utility for Doctor.mx PWA
 * Uses IndexedDB for offline data storage
 */

// Database configuration
const DB_NAME = 'doctormx-offline-db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  DOCTORS: 'doctors',
  APPOINTMENTS: 'appointments',
  SYMPTOMS: 'symptoms',
  USER_PROFILE: 'user-profile',
  FORM_DATA: 'form-data',
  CACHED_REQUESTS: 'cached-requests',
};

/**
 * Opens the IndexedDB database
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.DOCTORS)) {
        db.createObjectStore(STORES.DOCTORS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.APPOINTMENTS)) {
        db.createObjectStore(STORES.APPOINTMENTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.SYMPTOMS)) {
        const symptomsStore = db.createObjectStore(STORES.SYMPTOMS, { keyPath: 'id' });
        symptomsStore.createIndex('date', 'date', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_PROFILE)) {
        db.createObjectStore(STORES.USER_PROFILE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.FORM_DATA)) {
        const formDataStore = db.createObjectStore(STORES.FORM_DATA, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        formDataStore.createIndex('formId', 'formId', { unique: false });
        formDataStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.CACHED_REQUESTS)) {
        const cachedRequestsStore = db.createObjectStore(STORES.CACHED_REQUESTS, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        cachedRequestsStore.createIndex('url', 'url', { unique: false });
        cachedRequestsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Base class for database operations
 */
abstract class BaseDbOperations<T> {
  protected storeName: string;

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  /**
   * Get all items from a store
   */
  async getAll(): Promise<T[]> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as T[]);
        db.close();
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  /**
   * Get item by ID
   */
  async getById(id: string | number): Promise<T | null> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result as T || null);
        db.close();
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  /**
   * Add or update an item
   */
  async put(item: T): Promise<T> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
        db.close();
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  /**
   * Delete an item
   */
  async delete(id: string | number): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
        db.close();
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  /**
   * Clear all items
   */
  async clear(): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
        db.close();
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }
}

/**
 * Doctor profile type
 */
export interface DoctorProfile {
  id: string;
  name: string;
  specialties: string[];
  location?: string;
  phone?: string;
  email?: string;
  photo?: string;
  rating?: number;
  availability?: {
    [day: string]: {
      start: string;
      end: string;
    }[];
  };
  cachedAt: number;
}

/**
 * Appointment type
 */
export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  isTelehealth?: boolean;
  location?: string;
  lastSynced: number;
}

/**
 * Symptom entry type
 */
export interface SymptomEntry {
  id: string;
  date: string;
  symptoms: {
    name: string;
    severity: number;
    duration: string;
    bodyRegion?: string;
  }[];
  analysis?: {
    possibleConditions: string[];
    recommendedAction: string;
    urgency: 'low' | 'medium' | 'high';
  };
  notes?: string;
  synced: boolean;
}

/**
 * User profile type
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  lastUpdated: number;
  photoUrl?: string;
}

/**
 * Form data for offline submission
 */
export interface FormData {
  id?: number;
  formId: string;
  formType: string;
  data: any;
  url: string;
  method: string;
  headers: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

/**
 * Cached network request
 */
export interface CachedRequest {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  response: any;
  timestamp: number;
  expiresAt: number;
}

/**
 * Doctor profiles store operations
 */
export class DoctorDb extends BaseDbOperations<DoctorProfile> {
  constructor() {
    super(STORES.DOCTORS);
  }

  /**
   * Cache multiple doctors at once
   */
  async cacheDoctors(doctors: DoctorProfile[]): Promise<void> {
    const db = await openDatabase();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    // Add timestamp to each doctor profile
    const now = Date.now();
    const doctorsWithTimestamp = doctors.map(doctor => ({
      ...doctor,
      cachedAt: now
    }));

    return new Promise((resolve, reject) => {
      doctorsWithTimestamp.forEach(doctor => {
        store.put(doctor);
      });

      transaction.oncomplete = () => {
        resolve();
        db.close();
      };

      transaction.onerror = () => {
        reject(transaction.error);
        db.close();
      };
    });
  }

  /**
   * Search doctors by name or specialty
   */
  async searchDoctors(query: string): Promise<DoctorProfile[]> {
    const allDoctors = await this.getAll();
    const lowerQuery = query.toLowerCase();

    return allDoctors.filter(doctor => {
      return (
        doctor.name.toLowerCase().includes(lowerQuery) ||
        doctor.specialties.some(specialty => 
          specialty.toLowerCase().includes(lowerQuery)
        )
      );
    });
  }

  /**
   * Get doctors by specialty
   */
  async getDoctorsBySpecialty(specialty: string): Promise<DoctorProfile[]> {
    const allDoctors = await this.getAll();
    return allDoctors.filter(doctor => 
      doctor.specialties.some(s => 
        s.toLowerCase() === specialty.toLowerCase()
      )
    );
  }
}

/**
 * Appointments store operations
 */
export class AppointmentDb extends BaseDbOperations<Appointment> {
  constructor() {
    super(STORES.APPOINTMENTS);
  }

  /**
   * Get appointments for a specific doctor
   */
  async getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    const allAppointments = await this.getAll();
    return allAppointments.filter(appointment => 
      appointment.doctorId === doctorId
    );
  }

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(): Promise<Appointment[]> {
    const allAppointments = await this.getAll();
    const now = new Date();
    
    return allAppointments.filter(appointment => {
      const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
      return appointmentDate > now && appointment.status === 'scheduled';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }
}

/**
 * Symptoms store operations
 */
export class SymptomDb extends BaseDbOperations<SymptomEntry> {
  constructor() {
    super(STORES.SYMPTOMS);
  }

  /**
   * Get symptom entries by date range
   */
  async getEntriesByDateRange(startDate: string, endDate: string): Promise<SymptomEntry[]> {
    const allEntries = await this.getAll();
    
    return allEntries.filter(entry => {
      return entry.date >= startDate && entry.date <= endDate;
    })
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  /**
   * Get unsynced entries
   */
  async getUnsyncedEntries(): Promise<SymptomEntry[]> {
    const allEntries = await this.getAll();
    return allEntries.filter(entry => !entry.synced);
  }
}

/**
 * User profile store operations
 */
export class UserProfileDb extends BaseDbOperations<UserProfile> {
  constructor() {
    super(STORES.USER_PROFILE);
  }

  /**
   * Get current user profile (assuming a single user)
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    const profiles = await this.getAll();
    return profiles.length > 0 ? profiles[0] : null;
  }

  /**
   * Update user profile
   */
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const currentProfile = await this.getCurrentProfile();
    
    if (!currentProfile) {
      throw new Error('User profile not found');
    }
    
    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...profile,
      lastUpdated: Date.now()
    };
    
    return this.put(updatedProfile);
  }
}

/**
 * Form data for offline submission
 */
export class FormDataDb extends BaseDbOperations<FormData> {
  constructor() {
    super(STORES.FORM_DATA);
  }

  /**
   * Get pending form submissions
   */
  async getPendingSubmissions(): Promise<FormData[]> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result as FormData[]);
        db.close();
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  /**
   * Store form data for later submission
   */
  async storeFormSubmission(
    formId: string, 
    formType: string, 
    data: any, 
    url: string, 
    method: string = 'POST',
    headers: Record<string, string> = { 'Content-Type': 'application/json' }
  ): Promise<FormData> {
    const formData: FormData = {
      formId,
      formType,
      data,
      url,
      method,
      headers,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    return this.put(formData);
  }
}

/**
 * Cached network requests
 */
export class CachedRequestDb extends BaseDbOperations<CachedRequest> {
  constructor() {
    super(STORES.CACHED_REQUESTS);
  }

  /**
   * Get cached response by URL
   */
  async getCachedResponse(
    url: string, 
    method: string = 'GET'
  ): Promise<any | null> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('url');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = request.result as CachedRequest[];
        const now = Date.now();
        
        // Find matching request that hasn't expired
        const match = results.find(item => 
          item.url === url && 
          item.method === method &&
          item.expiresAt > now
        );
        
        resolve(match ? match.response : null);
        db.close();
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  /**
   * Cache a network response
   */
  async cacheResponse(
    url: string, 
    response: any, 
    expirationMs: number = 3600000, // 1 hour by default
    method: string = 'GET',
    headers: Record<string, string> = {}
  ): Promise<CachedRequest> {
    const now = Date.now();
    
    const cachedRequest: CachedRequest = {
      url,
      method,
      headers,
      response,
      timestamp: now,
      expiresAt: now + expirationMs
    };
    
    return this.put(cachedRequest);
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredEntries(): Promise<void> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = request.result as CachedRequest[];
        const now = Date.now();
        
        // Delete expired entries
        const expiredIds = results
          .filter(item => item.expiresAt < now)
          .map(item => item.id)
          .filter((id): id is number => id !== undefined);
        
        expiredIds.forEach(id => {
          store.delete(id);
        });
        
        transaction.oncomplete = () => {
          resolve();
          db.close();
        };
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }
}

// Export db instances
export const doctorDb = new DoctorDb();
export const appointmentDb = new AppointmentDb();
export const symptomDb = new SymptomDb();
export const userProfileDb = new UserProfileDb();
export const formDataDb = new FormDataDb();
export const cachedRequestDb = new CachedRequestDb();