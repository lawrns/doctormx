import { Specialist, SpecialistSearchParams } from '../types/specialist.js';

// Stub para futura base de datos de doctores registrados
// En el futuro, esto se conectará a una base de datos real
export async function findLocalSpecialists(params: SpecialistSearchParams): Promise<Specialist[]> {
  // TODO: Implementar búsqueda en base de datos real
  // Por ahora retornamos un array vacío como stub
  
  // Simulación de datos locales para testing (remover en producción)
  const mockLocalDoctors: Specialist[] = [
    {
      id: 'local-001',
      name: 'Dr. Juan Pérez',
      specialty: 'Cardiología',
      address: 'Av. Reforma 123, Ciudad de México',
      phone: '+52 55 1234 5678',
      rating: 4.8,
      distance: 1200,
      source: 'local',
      verified: true,
      openNow: true,
      website: 'https://drjuanperez.com'
    },
    {
      id: 'local-002', 
      name: 'Dra. María González',
      specialty: 'Medicina General',
      address: 'Calle Insurgentes 456, Ciudad de México',
      phone: '+52 55 9876 5432',
      rating: 4.9,
      distance: 800,
      source: 'local',
      verified: true,
      openNow: false
    }
  ];

  // Filtrar por especialidad si se especifica
  if (params.specialty) {
    const filtered = mockLocalDoctors.filter(doctor => 
      doctor.specialty.toLowerCase().includes(params.specialty.toLowerCase())
    );
    
    // En desarrollo, retornar datos mock filtrados
    // En producción, esto será: return [];
    return process.env.NODE_ENV === 'development' ? filtered : [];
  }

  // En desarrollo, retornar todos los datos mock
  // En producción, esto será: return [];
  return process.env.NODE_ENV === 'development' ? mockLocalDoctors : [];
}

// Función para agregar un doctor local (para futuro uso)
export async function addLocalSpecialist(specialist: Omit<Specialist, 'id' | 'source'>): Promise<Specialist> {
  // TODO: Implementar inserción en base de datos
  throw new Error('addLocalSpecialist no implementado aún');
}

// Función para verificar un doctor local (para futuro uso)
export async function verifyLocalSpecialist(id: string): Promise<boolean> {
  // TODO: Implementar verificación en base de datos
  throw new Error('verifyLocalSpecialist no implementado aún');
}