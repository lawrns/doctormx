// Broadcasts API - This would be replaced with actual API calls in production

import { v4 as uuidv4 } from 'uuid';

// Types
export interface Broadcast {
  id: string;
  title: string;
  content: string;
  broadcastType: 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
  isUrgent: boolean;
  targetAudience: any;
  category?: string;
  publishedAt: string | null;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  analytics: {
    total: number;
    read: number;
    readRate: number;
    likes: number;
  };
}

export interface BroadcastCreateParams {
  title: string;
  content: string;
  broadcastType: 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
  isUrgent: boolean;
  targetAudience: any;
  category?: string;
  scheduledFor?: string;
}

// Mock data for broadcasts
const mockBroadcasts: Broadcast[] = [
  {
    id: '1',
    title: 'Horario especial Semana Santa',
    content: 'Estimados pacientes, les informamos que durante Semana Santa (29 de marzo al 4 de abril) nuestro consultorio tendrá un horario especial. Estaremos atendiendo solo por las mañanas de 9:00 a 13:00 horas. Para emergencias, por favor utilice el servicio de telemedicina.',
    broadcastType: 'practice_update',
    isUrgent: false,
    targetAudience: { type: 'all', data: 'Todos los pacientes' },
    category: 'Horarios',
    publishedAt: '2025-03-15T14:30:00Z',
    scheduledFor: null,
    createdAt: '2025-03-15T14:30:00Z',
    updatedAt: '2025-03-15T14:30:00Z',
    analytics: {
      total: 154,
      read: 87,
      readRate: 56.5,
      likes: 12
    }
  },
  {
    id: '2',
    title: 'Recordatorio: Vacuna contra la Influenza',
    content: 'Con la llegada de la temporada de influenza, les recordamos la importancia de vacunarse, especialmente para pacientes de riesgo (mayores de 65 años, embarazadas, niños pequeños y personas con enfermedades crónicas). La vacuna está disponible en nuestro consultorio sin necesidad de cita previa.',
    broadcastType: 'health_tip',
    isUrgent: true,
    targetAudience: { type: 'conditions', data: 'Pacientes de riesgo' },
    category: 'Vacunación',
    publishedAt: '2025-03-10T09:15:00Z',
    scheduledFor: null,
    createdAt: '2025-03-10T09:15:00Z',
    updatedAt: '2025-03-10T09:15:00Z',
    analytics: {
      total: 68,
      read: 52,
      readRate: 76.5,
      likes: 23
    }
  },
  {
    id: '3',
    title: 'Nuevo servicio de nutrición',
    content: 'Nos complace informarles que hemos incorporado un nuevo servicio de nutrición a nuestra clínica. La Lic. María Fernández, especialista en nutrición clínica, atenderá los martes y jueves. Pueden solicitar cita a través de nuestra plataforma o por teléfono.',
    broadcastType: 'broadcast',
    isUrgent: false,
    targetAudience: { type: 'all', data: 'Todos los pacientes' },
    category: 'Servicios',
    publishedAt: '2025-03-05T11:00:00Z',
    scheduledFor: null,
    createdAt: '2025-03-05T11:00:00Z',
    updatedAt: '2025-03-05T11:00:00Z',
    analytics: {
      total: 154,
      read: 98,
      readRate: 63.6,
      likes: 34
    }
  }
];

// Get all broadcasts for the current doctor
export const getDoctorBroadcasts = async (): Promise<Broadcast[]> => {
  // This would be an API call in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBroadcasts);
    }, 800); // Simulate network delay
  });
};

// Create a new broadcast
export const createBroadcast = async (params: BroadcastCreateParams): Promise<Broadcast> => {
  // This would be an API call in production
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newBroadcast: Broadcast = {
        id: uuidv4(),
        ...params,
        publishedAt: params.scheduledFor ? null : now,
        scheduledFor: params.scheduledFor || null,
        createdAt: now,
        updatedAt: now,
        analytics: {
          total: Math.floor(Math.random() * 100) + 50, // Random number between 50-150
          read: 0,
          readRate: 0,
          likes: 0
        }
      };
      
      // In a real implementation, we would add this to the database
      // For this mock, we'll just pretend it was saved successfully
      
      resolve(newBroadcast);
    }, 1000); // Simulate network delay
  });
};

// Delete a broadcast
export const deleteBroadcast = async (id: string): Promise<void> => {
  // This would be an API call in production
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, we would delete from the database
      resolve();
    }, 500); // Simulate network delay
  });
};
