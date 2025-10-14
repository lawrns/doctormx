import { Specialist, SpecialistSearchParams, SpecialistSearchResult } from '../types/specialist.js';
import { findLocalSpecialists } from './local.js';
import { findGoogleSpecialists } from './places.js';
import { config } from '../config.js';

// Función principal para orquestar la búsqueda de especialistas
export async function findSpecialists(params: SpecialistSearchParams): Promise<SpecialistSearchResult> {
  console.log('Iniciando búsqueda de especialistas:', params);
  
  let allSpecialists: Specialist[] = [];
  let searchSource: 'local' | 'google' | 'mixed' = 'local';

  try {
    // 1. Buscar primero en base de datos local
    console.log('Buscando especialistas locales...');
    const localSpecialists = await findLocalSpecialists(params);
    console.log(`Encontrados ${localSpecialists.length} especialistas locales`);
    
    allSpecialists = [...localSpecialists];

    // 2. Si no hay suficientes resultados locales y no está configurado SHOW_ONLY_LOCAL
    if (allSpecialists.length < config.minResults && !config.showOnlyLocal) {
      console.log('Insuficientes resultados locales, buscando en Google Places...');
      
      const googleSpecialists = await findGoogleSpecialists(params);
      console.log(`Encontrados ${googleSpecialists.length} especialistas en Google Places`);
      
      if (googleSpecialists.length > 0) {
        allSpecialists = [...allSpecialists, ...googleSpecialists];
        searchSource = localSpecialists.length > 0 ? 'mixed' : 'google';
      }
    }

    // 3. Eliminar duplicados (por nombre y dirección similar)
    const uniqueSpecialists = removeDuplicates(allSpecialists);
    
    // 4. Ordenar resultados: locales primero, luego por rating/distancia
    const sortedSpecialists = sortSpecialists(uniqueSpecialists);
    
    // 5. Limitar a maxResults
    const finalResults = sortedSpecialists.slice(0, config.maxResults);
    
    console.log(`Retornando ${finalResults.length} especialistas únicos`);
    
    return {
      specialists: finalResults,
      total: finalResults.length,
      source: searchSource,
      searchParams: params
    };

  } catch (error) {
    console.error('Error en orchestrator:', error);
    return {
      specialists: [],
      total: 0,
      source: 'local',
      searchParams: params
    };
  }
}

// Función para eliminar duplicados
function removeDuplicates(specialists: Specialist[]): Specialist[] {
  const seen = new Set<string>();
  const unique: Specialist[] = [];
  
  for (const specialist of specialists) {
    // Crear una clave única basada en nombre y dirección normalizada
    const normalizedName = specialist.name.toLowerCase().trim();
    const normalizedAddress = specialist.address.toLowerCase().trim();
    const key = `${normalizedName}|${normalizedAddress}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(specialist);
    }
  }
  
  return unique;
}

// Función para ordenar especialistas
function sortSpecialists(specialists: Specialist[]): Specialist[] {
  return specialists.sort((a, b) => {
    // 1. Prioridad: especialistas locales verificados primero
    if (a.source === 'local' && a.verified && b.source !== 'local') return -1;
    if (b.source === 'local' && b.verified && a.source !== 'local') return 1;
    
    // 2. Luego por fuente (local > google)
    if (a.source === 'local' && b.source === 'google') return -1;
    if (a.source === 'google' && b.source === 'local') return 1;
    
    // 3. Luego por distancia (si está disponible)
    if (a.distance !== undefined && b.distance !== undefined) {
      if (a.distance !== b.distance) return a.distance - b.distance;
    }
    
    // 4. Finalmente por rating (mayor a menor)
    if (a.rating !== undefined && b.rating !== undefined) {
      return b.rating - a.rating;
    }
    
    // 5. Si no hay otros criterios, ordenar alfabéticamente
    return a.name.localeCompare(b.name);
  });
}

// Función para validar parámetros de búsqueda
export function validateSearchParams(params: any): SpecialistSearchParams | null {
  if (!params.specialty || typeof params.specialty !== 'string') {
    return null;
  }
  
  const validated: SpecialistSearchParams = {
    specialty: params.specialty.trim()
  };
  
  if (params.city && typeof params.city === 'string') {
    validated.city = params.city.trim();
  }
  
  if (params.lat && typeof params.lat === 'number' && params.lat >= -90 && params.lat <= 90) {
    validated.lat = params.lat;
  }
  
  if (params.lon && typeof params.lon === 'number' && params.lon >= -180 && params.lon <= 180) {
    validated.lon = params.lon;
  }
  
  if (params.radius && typeof params.radius === 'number' && params.radius > 0) {
    validated.radius = Math.min(params.radius, 50000); // Máximo 50km
  }
  
  return validated;
}